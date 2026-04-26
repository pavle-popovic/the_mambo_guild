from typing import Annotated, Any, Dict, Optional
from urllib.parse import urlparse
import uuid
import logging
import stripe
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Response, status, Request
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from pydantic import BaseModel

logger = logging.getLogger(__name__)

from dependencies import get_db, get_current_user
from models.user import User, UserProfile, Subscription, SubscriptionStatus, SubscriptionTier
from models.payment import StripeWebhookEvent
from models.premium import CoachingSubmission, CoachingSubmissionStatus
from services import stripe_service
from services.clave_service import award_subscription_bonus
from services.badge_service import award_subscription_badge, revoke_subscription_badges
from services.analytics_service import track_event
from services.email_service import (
    send_payment_failed_email,
    send_subscription_canceled_email,
)
from services.email_validation import is_disposable_email, normalize_email_for_dedup
from config import settings

from schemas.course import (
    CheckoutSessionRequest, 
    CheckoutSessionResponse,
    UpdateSubscriptionRequest,
    SubscriptionResponse
)

router = APIRouter(prefix="/payments", tags=["payments"])

# Stripe Price IDs - Advanced and Performer (a.k.a. "VIP") tiers.
# Sourced from settings so live IDs can be set via env without a code change.
# The display name on Stripe is "VIP" ($59/mo) but the internal enum stays
# SubscriptionTier.PERFORMER to avoid a DB migration.
ADVANCED_PRICE_ID = settings.ADVANCED_PRICE_ID
PERFORMER_PRICE_ID = settings.PERFORMER_PRICE_ID

def _fire_subscribe_and_purchase(
    *,
    db: Session,
    background_tasks: BackgroundTasks,
    request: Request,
    user_id,
    tier: "SubscriptionTier",
    invoice: dict,
    stripe_subscription_id: str,
) -> None:
    """Fire both Subscribe and Purchase for one paid invoice.

    Meta treats these as distinct optimisation goals — firing both lets
    advertisers choose either without re-instrumenting.
    """
    amount_paid_cents = invoice.get("amount_paid", 0) or 0
    amount = amount_paid_cents / 100.0
    currency = (invoice.get("currency") or "usd").upper()
    props = {
        "tier": tier.value,
        "stripe_subscription_id": stripe_subscription_id,
        "stripe_invoice_id": invoice.get("id"),
    }
    for event_name in ("Subscribe", "Purchase"):
        try:
            track_event(
                db=db,
                event_name=event_name,
                user_id=user_id,
                value=amount,
                currency=currency,
                properties=props,
                request=request,
                background_tasks=background_tasks,
            )
        except Exception:
            logger.exception("webhook: %s tracking failed (non-fatal)", event_name)


# Guild Master (PERFORMER) is an intentionally scarce tier capped at 30 seats.
# We surface live remaining-seats to the pricing page so prospects see urgency,
# and refuse new PERFORMER checkouts when the cap is hit.
GUILD_MASTER_SEAT_CAP = 30

# Arbitrary int key for the Postgres advisory lock used to serialize the
# seat-cap read/modify window. Any constant works; pick one unlikely to collide
# with other advisory locks in the codebase.
_GUILD_MASTER_LOCK_KEY = 734829_1


def _lock_guild_master_seats(db: Session) -> None:
    """
    Acquire a transaction-scoped advisory lock that serializes Guild Master
    seat allocation. Released automatically at commit/rollback. Prevents the
    read-then-act race between _guild_master_seats_taken() and the Stripe
    subscription create/modify that consumes a seat. Best-effort on non-PG.
    """
    try:
        db.execute(text("SELECT pg_advisory_xact_lock(:k)"), {"k": _GUILD_MASTER_LOCK_KEY})
    except Exception:
        logger.debug("Advisory lock unavailable — continuing without seat serialization")


def _guild_master_seats_taken(db: Session) -> int:
    return (
        db.query(Subscription)
        .filter(
            Subscription.tier == SubscriptionTier.PERFORMER,
            Subscription.status.in_((SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING)),
        )
        .count()
    )


def _validate_return_url(url: str, field_name: str) -> str:
    """
    Prevent Stripe Checkout from being abused as an open-redirect phishing
    vector. The user-controlled success_url/cancel_url must point back at our
    own frontend. Allow localhost during local dev.
    """
    if not url or not isinstance(url, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing {field_name}.",
        )
    try:
        parsed = urlparse(url)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name}.",
        )
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {field_name}.",
        )

    allowed_hosts = set()
    try:
        frontend_host = urlparse(settings.FRONTEND_URL).netloc
        if frontend_host:
            allowed_hosts.add(frontend_host)
    except Exception:
        pass
    try:
        for origin in settings.CORS_ORIGINS:
            host = urlparse(origin).netloc
            if host:
                allowed_hosts.add(host)
    except Exception:
        pass

    if parsed.netloc not in allowed_hosts:
        logger.warning(
            f"Rejected {field_name} with disallowed host {parsed.netloc!r} "
            f"(allowed: {sorted(allowed_hosts)})"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} must point to this site.",
        )
    return url


def _expire_pending_subscription_coaching(db: Session, user_id) -> int:
    """
    On a full refund or chargeback, mark this user's PENDING subscription-source
    coaching submissions as EXPIRED so a refunder can't keep their coach review.

    Scope:
      - status=PENDING only — IN_REVIEW or COMPLETED means the coach has
        already done the work; we don't retroactively undo that.
      - source='subscription' only — Golden Tickets are a separate paid
        product and are not affected by a subscription refund.
      - submitted_at within the last 60 days — bounds the operation to the
        recent billing window so an unrelated old PENDING row (shouldn't
        exist, but be defensive) isn't swept up.

    Returns the number of rows expired so the caller can log it.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=60)
    expired_count = (
        db.query(CoachingSubmission)
        .filter(
            CoachingSubmission.user_id == user_id,
            CoachingSubmission.status == CoachingSubmissionStatus.PENDING,
            CoachingSubmission.source == "subscription",
            CoachingSubmission.submitted_at >= cutoff,
        )
        .update(
            {CoachingSubmission.status: CoachingSubmissionStatus.EXPIRED},
            synchronize_session=False,
        )
    )
    return expired_count


def _email_has_prior_stripe_subscription(email: str) -> bool:
    """
    Trial-abuse guard. Even if this UserProfile has has_used_trial=False (new
    account), we should refuse to grant another 7-day trial if Stripe already
    knows this email from a previous subscription. Two queries stack:

    1. Exact email lookup via stripe.Customer.list — catches the simple
       'sign up again with same email' loophole.
    2. Normalized-email lookup via stripe.Customer.search on metadata —
       catches Gmail-alias siblings ('foo+a@gmail.com' / 'foo+b@gmail.com'
       both normalize to 'foo@gmail.com'). For this to work, NEW customers
       must be created with metadata['normalized_email'] populated; see the
       customer-create branch in create_checkout_session below.

    Does NOT catch same-card-different-email or burner-card patterns — that
    requires a card-fingerprint column + migration. Acceptable trade-off
    given the trial value ($39 of Pro access) and the friction those
    patterns require from the attacker.
    """
    normalized = normalize_email_for_dedup(email)
    try:
        # (1) Exact email lookup
        customers = stripe.Customer.list(email=email, limit=10)
        for cust in customers.auto_paging_iter():
            subs = stripe.Subscription.list(customer=cust.id, status="all", limit=1)
            if subs.data:
                return True
        # (2) Normalized-email lookup via metadata. Skip when normalized ==
        # the as-typed form (no Gmail-alias collapsing happened) so we don't
        # fire a redundant query.
        if normalized and normalized != email.strip().lower():
            search_results = stripe.Customer.search(
                query=f"metadata['normalized_email']:'{normalized}'",
                limit=10,
            )
            for cust in search_results.auto_paging_iter():
                subs = stripe.Subscription.list(customer=cust.id, status="all", limit=1)
                if subs.data:
                    return True
    except stripe.error.StripeError as e:
        logger.warning(f"Stripe lookup failed for trial eligibility on {email}: {e}")
        # Fail closed on trial eligibility — if we can't verify, deny the trial.
        return True
    return False


class GuildMasterSeatsResponse(BaseModel):
    total: int
    taken: int
    remaining: int
    is_full: bool


@router.get("/guild-master-seats", response_model=GuildMasterSeatsResponse)
def guild_master_seats(response: Response, db: Session = Depends(get_db)):
    """Public endpoint — live remaining seats on the Guild Master tier."""
    taken = _guild_master_seats_taken(db)
    remaining = max(0, GUILD_MASTER_SEAT_CAP - taken)
    # Short cache so scrapers can't hammer us, but the counter still feels live.
    response.headers["Cache-Control"] = "public, max-age=30"
    return GuildMasterSeatsResponse(
        total=GUILD_MASTER_SEAT_CAP,
        taken=taken,
        remaining=remaining,
        is_full=remaining == 0,
    )


@router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
def create_checkout_session(
    request_data: CheckoutSessionRequest,
    http_request: Request,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a Stripe Checkout Session for subscription.
    Validates price_id against allowed Price IDs (Advanced/Performer).
    """
    try:
        # Validate price_id
        if request_data.price_id not in [ADVANCED_PRICE_ID, PERFORMER_PRICE_ID]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid price ID. Only Advanced and Performer tiers are available."
            )

        # Open-redirect defense — only allow our own frontend as the return target.
        safe_success_url = _validate_return_url(request_data.success_url, "success_url")
        safe_cancel_url = _validate_return_url(request_data.cancel_url, "cancel_url")

        # Allow creating checkout session even if user has active subscription
        # (for upgrades/downgrades, we'll use update-subscription endpoint instead)
        # But for new subscriptions, check if they already have one
        existing_subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id
        ).first()
        if existing_subscription and existing_subscription.status in (
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.TRIALING,
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has an active subscription. Use update-subscription to change plans."
            )

        # Enforce the Guild Master seat cap on new checkouts. Serialize the
        # read/modify window with an advisory lock so concurrent checkouts
        # can't both pass at taken=29.
        if request_data.price_id == PERFORMER_PRICE_ID:
            _lock_guild_master_seats(db)
            if _guild_master_seats_taken(db) >= GUILD_MASTER_SEAT_CAP:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Guild Master is currently full. Join the waitlist to be notified when a seat opens up.",
                )

        # Create or retrieve Stripe Customer ID. Prefer reusing an existing
        # Stripe Customer for this email over minting a duplicate — prevents
        # orphaned customers accumulating on re-signups and keeps the
        # trial-abuse lookup reliable.
        stripe_customer_id = current_user.subscription.stripe_customer_id if current_user.subscription else None
        if not stripe_customer_id:
            # We populate two metadata fields on every Stripe customer:
            # - user_id: links Stripe → our DB so webhooks know who to update
            # - normalized_email: enables the alias-aware trial-abuse guard
            #   in _email_has_prior_stripe_subscription. Catches Gmail-alias
            #   siblings (foo+a@ / foo+b@ map to foo@) on later signups.
            customer_metadata = {
                "user_id": str(current_user.id),
                "normalized_email": normalize_email_for_dedup(current_user.email),
            }
            existing_customers = stripe.Customer.list(email=current_user.email, limit=1)
            if existing_customers.data:
                customer = existing_customers.data[0]
                # Ensure both metadata fields are attached. We compare each
                # key individually because Stripe.modify replaces metadata
                # wholesale only if we pass it; an existing customer could
                # have user_id set but be missing normalized_email (older
                # Stripe customer pre-dating this guard).
                existing_md = customer.metadata or {}
                if any(existing_md.get(k) != v for k, v in customer_metadata.items()):
                    stripe.Customer.modify(customer.id, metadata=customer_metadata)
            else:
                customer = stripe.Customer.create(
                    email=current_user.email,
                    metadata=customer_metadata,
                )
            stripe_customer_id = customer.id
            
            # Update or create subscription record with stripe_customer_id
            if not current_user.subscription:
                new_subscription = Subscription(
                    id=uuid.uuid4(),
                    user_id=current_user.id,
                    stripe_customer_id=stripe_customer_id,
                    status=SubscriptionStatus.INCOMPLETE,  # Will be updated by webhook
                    tier=SubscriptionTier.ROOKIE,  # Default, will be updated
                    current_period_end=datetime.now(timezone.utc)  # Placeholder
                )
                db.add(new_subscription)
            else:
                current_user.subscription.stripe_customer_id = stripe_customer_id
                current_user.subscription.status = SubscriptionStatus.INCOMPLETE
            db.commit()
            # Only refresh the subscription relationship — full graph refresh
            # is expensive and unnecessary here.
            db.refresh(current_user, attribute_names=["subscription"])

        # 7-day free trial is offered once per user, on their first paid
        # subscription attempt. After that (canceled-and-returning customers,
        # upgrades, etc.) they pay from day 0.
        profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
        # Free trial is ADVANCED-tier only. Guild Master (PERFORMER) is a
        # separate product with no trial. Defense-in-depth disposable-email
        # check (registration also blocks these — this is the second layer
        # in case a user changed their email post-registration to a
        # throwaway domain). And we refuse a trial if Stripe has ever seen
        # a subscription on this email or any of its alias siblings (the
        # latter via the normalized_email metadata search).
        trial_eligible = (
            bool(profile and not profile.has_used_trial)
            and request_data.price_id == ADVANCED_PRICE_ID
            and not is_disposable_email(current_user.email)
            and not _email_has_prior_stripe_subscription(current_user.email)
        )
        trial_period_days = 7 if trial_eligible else None

        # Create Stripe Checkout Session
        checkout_session = stripe_service.create_checkout_session(
            customer_id=stripe_customer_id,
            price_id=request_data.price_id,
            success_url=safe_success_url,
            cancel_url=safe_cancel_url,
            metadata={"user_id": str(current_user.id)},
            trial_period_days=trial_period_days,
        )

        # Fire InitiateCheckout to Meta CAPI. Value reflects the tier's list
        # price so Meta's bidder can prioritise high-value checkouts.
        tier_value = 59.0 if request_data.price_id == PERFORMER_PRICE_ID else 39.0
        tier_name = "performer" if request_data.price_id == PERFORMER_PRICE_ID else "advanced"
        analytics_event_id = None
        try:
            analytics_event_id = track_event(
                db=db,
                event_name="InitiateCheckout",
                user_id=current_user.id,
                value=tier_value,
                currency="USD",
                properties={
                    "tier": tier_name,
                    "content_name": tier_name,
                    "stripe_session_id": checkout_session.id,
                    "has_trial": bool(trial_period_days),
                },
                request=http_request,
                background_tasks=background_tasks,
            )
        except Exception:
            logger.exception("checkout: InitiateCheckout tracking failed (non-fatal)")

        return CheckoutSessionResponse(
            session_id=checkout_session.id,
            url=checkout_session.url,
            analytics_event_id=analytics_event_id,
        )
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating checkout session for user {current_user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment processing error. Please try again.")
    except Exception as e:
        logger.error(f"Unexpected error creating checkout session for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again."
        )


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)],
):
    """
    Stripe webhook endpoint to handle subscription events.
    
    To test webhooks locally using Stripe CLI:
    1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
    2. Login: stripe login
    3. Forward webhooks: stripe listen --forward-to http://localhost:8000/api/payments/webhook
    4. The CLI will display a webhook signing secret (e.g., whsec_...)
    5. Set STRIPE_WEBHOOK_SECRET in your .env file to this secret
    6. Trigger test events: stripe trigger invoice.payment_succeeded
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not sig_header:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No Stripe-Signature header")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        logger.warning(f"Invalid Stripe webhook payload: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.warning(f"Invalid Stripe webhook signature: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

    # Idempotency guard — Stripe retries webhooks on any 5xx, and replays are
    # legal. Without this, invoice.payment_succeeded would re-grant XP/bonuses
    # on every retry. Insert the event id first; if it already exists, we've
    # already processed this event and should no-op with 200.
    try:
        db.add(StripeWebhookEvent(event_id=event["id"], event_type=event["type"]))
        db.commit()
    except IntegrityError:
        db.rollback()
        logger.info(f"Stripe webhook {event['id']} ({event['type']}) already processed — skipping")
        return {"status": "already_processed"}

    # Resolve a Stripe subscription payload to our internal tier enum. We
    # match on price.id against the hard-coded constants first (most robust —
    # lookup_key is free-text in the Stripe dashboard and a rename would
    # silently drop users to ROOKIE). Fall back to lookup_key for legacy
    # prices. Shared by the subscription.* and invoice.payment_succeeded
    # handlers.
    _LOOKUP_KEY_FALLBACK = {
        "advanced": SubscriptionTier.ADVANCED,
        "performer": SubscriptionTier.PERFORMER,
        "vip": SubscriptionTier.PERFORMER,
    }

    def _resolve_tier_from_items(items_data: list) -> SubscriptionTier:
        if not items_data:
            return SubscriptionTier.ROOKIE
        first_price = items_data[0].get("price") if hasattr(items_data[0], "get") else items_data[0]["price"]
        price_id = first_price.get("id") if hasattr(first_price, "get") else first_price["id"]
        if price_id == ADVANCED_PRICE_ID:
            return SubscriptionTier.ADVANCED
        if price_id == PERFORMER_PRICE_ID:
            return SubscriptionTier.PERFORMER
        lookup_key = (first_price.get("lookup_key") if hasattr(first_price, "get") else first_price["lookup_key"]) or ""
        return _LOOKUP_KEY_FALLBACK.get(lookup_key.lower(), SubscriptionTier.ROOKIE)

    # Fires at trial start (status=trialing) and again when Stripe flips the
    # subscription to status=active after the first real charge. Handling it
    # here is what gives trial users immediate access — the $0 trial invoice
    # does not reliably fire invoice.payment_succeeded, so we can't rely on
    # that alone.
    if event["type"] in ("customer.subscription.created", "customer.subscription.updated"):
        sub_obj = event["data"]["object"]
        customer_id = sub_obj.get("customer")
        stripe_sub_id = sub_obj.get("id")
        stripe_status = sub_obj.get("status")  # "trialing", "active", "past_due", ...

        items = sub_obj.get("items", {}).get("data", [])
        tier = _resolve_tier_from_items(items)

        # current_period_end can be on the subscription or on each item
        period_end_ts = sub_obj.get("current_period_end") or (
            items[0].get("current_period_end") if items else None
        )
        period_end_dt = (
            datetime.fromtimestamp(period_end_ts, tz=timezone.utc) if period_end_ts else None
        )

        status_mapping = {
            "trialing": SubscriptionStatus.TRIALING,
            "active": SubscriptionStatus.ACTIVE,
            "past_due": SubscriptionStatus.PAST_DUE,
            "canceled": SubscriptionStatus.CANCELED,
            "incomplete": SubscriptionStatus.INCOMPLETE,
        }
        db_status = status_mapping.get(stripe_status, SubscriptionStatus.INCOMPLETE)

        db_subscription = db.query(Subscription).filter(
            Subscription.stripe_customer_id == customer_id
        ).first()

        if db_subscription:
            # Always mirror the Stripe status, including past_due / canceled /
            # incomplete. Skipping non-active states leaves us with stale
            # "ACTIVE" rows after a failed renewal.
            db_subscription.stripe_subscription_id = stripe_sub_id
            db_subscription.status = db_status
            # Promote tier on good-standing states. On past_due we revoke
            # premium access immediately by dropping to ROOKIE — Stripe Smart
            # Retries can run for ~14 days otherwise, during which a delinquent
            # member would keep Guild Master perks for free. If a retry
            # succeeds, invoice.payment_succeeded restores the tier from
            # price.id automatically.
            if db_status in (SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE):
                db_subscription.tier = tier
                db_subscription.current_period_end = period_end_dt
            elif db_status == SubscriptionStatus.PAST_DUE:
                db_subscription.tier = SubscriptionTier.ROOKIE
            db_subscription.cancel_at_period_end = bool(sub_obj.get("cancel_at_period_end"))
            if db_status == SubscriptionStatus.CANCELED:
                db_subscription.tier = SubscriptionTier.ROOKIE
                db_subscription.cancel_at_period_end = False
            db.commit()
            db.refresh(db_subscription)

            # Mirror trophy case to current tier: revokes guild_master on
            # Performer→Advanced downgrade, revokes both on canceled→rookie.
            # No-op when the tier is still Performer. Safe to run on every
            # subscription.updated event.
            try:
                revoke_subscription_badges(
                    str(db_subscription.user_id),
                    db_subscription.tier.value if db_subscription.tier else "rookie",
                    db,
                )
                db.commit()
            except Exception:
                logger.exception("webhook: revoke_subscription_badges failed (non-fatal)")
                db.rollback()

            # Burn the one-time trial flag the moment Stripe confirms a trial
            # started for this user. Prevents re-using the 7 free days on a
            # second checkout after cancelling.
            if db_status == SubscriptionStatus.TRIALING:
                user_profile = db.query(UserProfile).filter(
                    UserProfile.user_id == db_subscription.user_id
                ).first()
                if user_profile and not user_profile.has_used_trial:
                    user_profile.has_used_trial = True
                    db.commit()

                # Fire StartTrial to Meta CAPI. $0 value but predicted_ltv
                # tells the bidder to treat this as potential $39/mo revenue.
                try:
                    track_event(
                        db=db,
                        event_name="StartTrial",
                        user_id=db_subscription.user_id,
                        value=0.0,
                        currency="USD",
                        properties={
                            "tier": tier.value,
                            "predicted_ltv": 59.0 if tier == SubscriptionTier.PERFORMER else 39.0,
                            "stripe_subscription_id": stripe_sub_id,
                        },
                        request=request,
                        background_tasks=background_tasks,
                    )
                except Exception:
                    logger.exception("webhook: StartTrial tracking failed (non-fatal)")

    if event["type"] == "invoice.payment_succeeded":
        invoice = event["data"]["object"]
        # Stripe API 2025-08+ moved `subscription` from the top level of the
        # invoice to `parent.subscription_details.subscription`. Read both so
        # the handler works on old and new API versions.
        subscription_id = (
            invoice.get("subscription")
            or (invoice.get("parent") or {}).get("subscription_details", {}).get("subscription")
        )
        customer_id = invoice.get("customer")

        if subscription_id and customer_id:
            try:
                stripe_subscription = stripe.Subscription.retrieve(subscription_id)
                
                # Resolve tier from price.id (robust against lookup_key renames).
                items_data = stripe_subscription["items"]["data"]
                tier = _resolve_tier_from_items(items_data)

                # A $0 invoice at trial start or from a 100%-off coupon must
                # not trigger the one-time XP/badge bonus — those rewards are
                # reserved for the first real paid conversion.
                amount_paid = invoice.get("amount_paid", 0) or 0
                is_paid_invoice = amount_paid > 0

                # Stripe API 2025-08+ moved `current_period_end` off the
                # Subscription root onto each item. Bracket access avoids the
                # StripeObject.items ↔ dict.items method collision.
                item0 = items_data[0] if items_data else None
                period_end_ts = (
                    stripe_subscription.get("current_period_end")
                    or (item0.get("current_period_end") if item0 else None)
                )
                period_end_dt = (
                    datetime.fromtimestamp(period_end_ts, tz=timezone.utc)
                    if period_end_ts
                    else None
                )

                # Find the user's subscription in our DB
                db_subscription = db.query(Subscription).filter(
                    Subscription.stripe_customer_id == customer_id
                ).first()

                if db_subscription:
                    db_subscription.stripe_subscription_id = stripe_subscription.id
                    db_subscription.status = SubscriptionStatus.ACTIVE
                    db_subscription.tier = tier
                    db_subscription.current_period_end = period_end_dt
                    db.commit()
                    db.refresh(db_subscription)

                    if is_paid_invoice:
                        award_subscription_bonus(str(db_subscription.user_id), tier, db)
                        award_subscription_badge(str(db_subscription.user_id), tier.value, db)
                        _fire_subscribe_and_purchase(
                            db=db,
                            background_tasks=background_tasks,
                            request=request,
                            user_id=db_subscription.user_id,
                            tier=tier,
                            invoice=invoice,
                            stripe_subscription_id=stripe_subscription.id,
                        )
                else:
                    # This case might happen if the subscription was created directly in Stripe
                    # or if the initial 'incomplete' record wasn't found.
                    # We should create a new subscription record here.
                    user_id_from_metadata = stripe_subscription.metadata.get("user_id")
                    if not user_id_from_metadata:
                        logger.warning(f"Could not find user_id in metadata for new subscription {subscription_id}")
                    else:
                        # Validate the metadata-provided user_id against our DB
                        # before minting a subscription row. Metadata is
                        # mutable from the Stripe dashboard; do not trust it.
                        try:
                            user_uuid = uuid.UUID(user_id_from_metadata)
                        except (ValueError, TypeError):
                            logger.warning(f"Invalid user_id in metadata for subscription {subscription_id}: {user_id_from_metadata!r}")
                            user_uuid = None

                        target_user = (
                            db.query(User).filter(User.id == user_uuid).first()
                            if user_uuid else None
                        )
                        if not target_user:
                            logger.warning(f"Metadata user_id {user_id_from_metadata} not found in DB for sub {subscription_id}")
                        else:
                            existing = db.query(Subscription).filter(
                                Subscription.user_id == user_uuid
                            ).first()
                            if existing:
                                # Update the existing row rather than minting a duplicate.
                                existing.stripe_customer_id = customer_id
                                existing.stripe_subscription_id = stripe_subscription.id
                                existing.status = SubscriptionStatus.ACTIVE
                                existing.tier = tier
                                existing.current_period_end = period_end_dt
                                db.commit()
                                db.refresh(existing)
                                target_sub = existing
                            else:
                                target_sub = Subscription(
                                    id=uuid.uuid4(),
                                    user_id=user_uuid,
                                    stripe_customer_id=customer_id,
                                    stripe_subscription_id=stripe_subscription.id,
                                    status=SubscriptionStatus.ACTIVE,
                                    tier=tier,
                                    current_period_end=period_end_dt,
                                )
                                db.add(target_sub)
                                db.commit()
                                db.refresh(target_sub)

                            if is_paid_invoice:
                                award_subscription_bonus(str(target_sub.user_id), tier, db)
                                award_subscription_badge(str(target_sub.user_id), tier.value, db)
                                _fire_subscribe_and_purchase(
                                    db=db,
                                    background_tasks=background_tasks,
                                    request=request,
                                    user_id=target_sub.user_id,
                                    tier=tier,
                                    invoice=invoice,
                                    stripe_subscription_id=stripe_subscription.id,
                                )

            except stripe.error.StripeError as e:
                # Never raise 5xx from a webhook handler — Stripe will retry
                # and our idempotency row has already been committed, which
                # means the retry would be swallowed as "already_processed"
                # OR (worse) loop forever depending on timing. Log and ack.
                logger.error(f"Stripe API error retrieving subscription {subscription_id}: {e}")
                db.rollback()
            except Exception as e:
                logger.exception(f"Error processing invoice.payment_succeeded for subscription {subscription_id}: {e}")
                db.rollback()

    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        stripe_subscription_id = subscription.get("id")
        stripe_customer_id = subscription.get("customer")
        # Match on BOTH sub id and customer id so a stale event for a
        # replaced subscription id can't flip the wrong user to ROOKIE.
        db_subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == stripe_subscription_id,
            Subscription.stripe_customer_id == stripe_customer_id,
        ).first()
        if db_subscription:
            cancelled_user_id = db_subscription.user_id
            cancelled_tier = db_subscription.tier.value if db_subscription.tier else None
            db_subscription.status = SubscriptionStatus.CANCELED
            db_subscription.tier = SubscriptionTier.ROOKIE
            db_subscription.cancel_at_period_end = False
            db.commit()
            db.refresh(db_subscription)

            # Revoke pro_member + guild_master on final cancellation so the
            # trophy case reflects current (rookie) status, not lifetime.
            try:
                revoke_subscription_badges(str(cancelled_user_id), "rookie", db)
                db.commit()
            except Exception:
                logger.exception("webhook: revoke_subscription_badges failed on cancellation (non-fatal)")
                db.rollback()

            # Churn label for ML — not forwarded to Meta.
            try:
                track_event(
                    db=db,
                    event_name="SubscriptionCanceled",
                    user_id=cancelled_user_id,
                    properties={
                        "tier": cancelled_tier,
                        "stripe_subscription_id": stripe_subscription_id,
                    },
                    request=request,
                )
            except Exception:
                logger.exception("webhook: SubscriptionCanceled tracking failed (non-fatal)")

            # Confirmation email so the user knows access has ended and has a
            # one-click path back. Sent in background so a Resend hiccup never
            # blocks the webhook ack.
            try:
                cancelled_user = db.query(User).filter(User.id == cancelled_user_id).first()
                cancelled_profile = db.query(UserProfile).filter(
                    UserProfile.user_id == cancelled_user_id
                ).first()
                if cancelled_user and cancelled_user.email:
                    reactivate_url = f"{settings.FRONTEND_URL}/pricing"
                    background_tasks.add_task(
                        send_subscription_canceled_email,
                        cancelled_user.email,
                        cancelled_profile.first_name if cancelled_profile else "",
                        (cancelled_tier or "premium").capitalize(),
                        reactivate_url,
                    )
            except Exception:
                logger.exception("webhook: queue cancellation email failed (non-fatal)")
        else:
            logger.warning(
                f"Subscription {stripe_subscription_id} (customer {stripe_customer_id}) "
                f"not found in DB for deletion event — ignoring."
            )

    elif event["type"] == "invoice.payment_failed":
        # A renewal charge (or the final trial-end charge) failed. The
        # `customer.subscription.updated` handler above has already flipped
        # the subscription to past_due and dropped tier to ROOKIE — here we
        # just notify the user so they can fix their card. Sending only on
        # the FIRST attempt prevents inbox spam during Stripe Smart Retries.
        invoice = event["data"]["object"]
        attempt_count = invoice.get("attempt_count", 0) or 0
        customer_id = invoice.get("customer")
        if not customer_id:
            return {"status": "success"}

        db_subscription = db.query(Subscription).filter(
            Subscription.stripe_customer_id == customer_id
        ).first()
        if not db_subscription:
            logger.info(
                f"invoice.payment_failed for unknown customer {customer_id} — ignoring."
            )
            return {"status": "success"}

        # Notify on first failure only. Subsequent retries by Stripe Smart
        # Retries should not re-spam the user.
        if attempt_count <= 1:
            try:
                failed_user = db.query(User).filter(
                    User.id == db_subscription.user_id
                ).first()
                failed_profile = db.query(UserProfile).filter(
                    UserProfile.user_id == db_subscription.user_id
                ).first()
                if failed_user and failed_user.email:
                    portal_url = f"{settings.FRONTEND_URL}/pricing"
                    tier_label = (
                        "Guild Master"
                        if db_subscription.tier == SubscriptionTier.PERFORMER
                        else "Pro"
                    )
                    background_tasks.add_task(
                        send_payment_failed_email,
                        failed_user.email,
                        failed_profile.first_name if failed_profile else "",
                        portal_url,
                        tier_label,
                    )
            except Exception:
                logger.exception("webhook: queue payment_failed email failed (non-fatal)")

        try:
            track_event(
                db=db,
                event_name="SubscriptionPaymentFailed",
                user_id=db_subscription.user_id,
                properties={
                    "attempt_count": attempt_count,
                    "stripe_invoice_id": invoice.get("id"),
                    "amount_due": (invoice.get("amount_due", 0) or 0) / 100.0,
                },
                request=request,
            )
        except Exception:
            logger.exception("webhook: SubscriptionPaymentFailed tracking failed (non-fatal)")

    elif event["type"] == "charge.refunded":
        # Stripe fires this on every refund (full or partial). Only treat a
        # FULL refund of a subscription charge as a cancellation — partial
        # refunds (e.g., goodwill credits) should not revoke access. For full
        # refunds we proactively cancel the active sub in Stripe; that emits
        # customer.subscription.deleted, which is where the tier downgrade
        # and confirmation email actually happen.
        charge = event["data"]["object"]
        amount = charge.get("amount", 0) or 0
        amount_refunded = charge.get("amount_refunded", 0) or 0
        is_full_refund = bool(charge.get("refunded")) or (
            amount > 0 and amount_refunded >= amount
        )
        customer_id = charge.get("customer")

        if not is_full_refund:
            logger.info(
                f"charge.refunded partial refund on charge {charge.get('id')} — no tier change."
            )
        elif customer_id:
            db_subscription = db.query(Subscription).filter(
                Subscription.stripe_customer_id == customer_id
            ).first()
            if db_subscription and db_subscription.stripe_subscription_id and db_subscription.status in (
                SubscriptionStatus.ACTIVE,
                SubscriptionStatus.TRIALING,
                SubscriptionStatus.PAST_DUE,
            ):
                try:
                    stripe.Subscription.delete(db_subscription.stripe_subscription_id)
                    logger.info(
                        f"charge.refunded: cancelled Stripe sub {db_subscription.stripe_subscription_id} "
                        f"after full refund of charge {charge.get('id')}"
                    )
                except stripe.error.InvalidRequestError as e:
                    # Already cancelled — fine, the deleted webhook will land.
                    logger.info(
                        f"charge.refunded: Stripe sub already cancelled or missing: {e}"
                    )
                except stripe.error.StripeError:
                    # Belt-and-braces — if we can't reach Stripe, still revoke
                    # access locally so the refund actually takes effect.
                    logger.exception(
                        f"charge.refunded: could not cancel Stripe sub, downgrading locally"
                    )
                    db_subscription.status = SubscriptionStatus.CANCELED
                    db_subscription.tier = SubscriptionTier.ROOKIE
                    db_subscription.cancel_at_period_end = False
                    db.commit()

                # Revoke any pending coaching submission from this billing
                # period — refunders shouldn't get a free coach review on top
                # of their refund. Run regardless of which Stripe path above
                # ran; idempotent if there are no PENDING rows.
                try:
                    expired = _expire_pending_subscription_coaching(
                        db, db_subscription.user_id
                    )
                    if expired:
                        db.commit()
                        logger.info(
                            f"charge.refunded: expired {expired} pending coaching "
                            f"submission(s) for user {db_subscription.user_id}"
                        )
                except Exception:
                    logger.exception(
                        "webhook: expire pending coaching on refund failed (non-fatal)"
                    )
                    db.rollback()

    elif event["type"] == "charge.dispute.created":
        # Chargeback opened. Industry standard: cancel immediately, don't
        # wait for the dispute outcome (which can take 30-90 days). Cancelling
        # in Stripe also unblocks the dispute response on Stripe's side.
        dispute = event["data"]["object"]
        charge_id = dispute.get("charge")
        if not charge_id:
            return {"status": "success"}

        try:
            charge = stripe.Charge.retrieve(charge_id)
        except stripe.error.StripeError:
            logger.exception(f"charge.dispute.created: failed to retrieve charge {charge_id}")
            return {"status": "success"}

        customer_id = charge.get("customer")
        if not customer_id:
            return {"status": "success"}

        db_subscription = db.query(Subscription).filter(
            Subscription.stripe_customer_id == customer_id
        ).first()
        if not db_subscription:
            logger.warning(
                f"charge.dispute.created for unknown customer {customer_id} — ignoring."
            )
            return {"status": "success"}

        # Cancel in Stripe (idempotent: already-cancelled raises InvalidRequest)
        if db_subscription.stripe_subscription_id:
            try:
                stripe.Subscription.delete(db_subscription.stripe_subscription_id)
            except stripe.error.InvalidRequestError:
                pass
            except stripe.error.StripeError:
                logger.exception("charge.dispute.created: Stripe cancel failed; downgrading locally")

        # Always revoke locally as well, so a Stripe-side failure doesn't leave
        # a fraudster on premium.
        db_subscription.status = SubscriptionStatus.CANCELED
        db_subscription.tier = SubscriptionTier.ROOKIE
        db_subscription.cancel_at_period_end = False
        db.commit()
        db.refresh(db_subscription)

        try:
            revoke_subscription_badges(str(db_subscription.user_id), "rookie", db)
            db.commit()
        except Exception:
            logger.exception("webhook: revoke_subscription_badges failed on dispute (non-fatal)")
            db.rollback()

        # Same revocation as on a full refund — a chargeback is effectively
        # a forced refund, the user shouldn't retain a pending coach review.
        try:
            expired = _expire_pending_subscription_coaching(
                db, db_subscription.user_id
            )
            if expired:
                db.commit()
                logger.info(
                    f"charge.dispute.created: expired {expired} pending coaching "
                    f"submission(s) for user {db_subscription.user_id}"
                )
        except Exception:
            logger.exception(
                "webhook: expire pending coaching on dispute failed (non-fatal)"
            )
            db.rollback()

        try:
            track_event(
                db=db,
                event_name="SubscriptionDisputed",
                user_id=db_subscription.user_id,
                properties={
                    "stripe_charge_id": charge_id,
                    "stripe_dispute_id": dispute.get("id"),
                    "reason": dispute.get("reason"),
                },
                request=request,
            )
        except Exception:
            logger.exception("webhook: SubscriptionDisputed tracking failed (non-fatal)")

    return {"status": "success"}


@router.post("/update-subscription", response_model=SubscriptionResponse)
def update_subscription(
    request_data: UpdateSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update an existing subscription (upgrade or downgrade).
    Changes the subscription to a new price tier.
    """
    try:
        # Validate price_id
        if request_data.new_price_id not in [ADVANCED_PRICE_ID, PERFORMER_PRICE_ID]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid price ID. Only Advanced and Performer tiers are available."
            )
        
        # Get user's subscription
        subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id
        ).first()
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No subscription found for this user."
            )
        
        if subscription.status not in (SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Subscription is not active. Cannot update."
            )
        
        if not subscription.stripe_subscription_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No Stripe subscription ID found. Cannot update."
            )

        # If this user is upgrading *into* Guild Master, enforce the seat cap.
        # Their current tier being PERFORMER already means they occupy a seat,
        # so only count the cap when they're NOT already PERFORMER.
        if (
            request_data.new_price_id == PERFORMER_PRICE_ID
            and subscription.tier != SubscriptionTier.PERFORMER
        ):
            _lock_guild_master_seats(db)
            if _guild_master_seats_taken(db) >= GUILD_MASTER_SEAT_CAP:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Guild Master is currently full. Join the waitlist to be notified when a seat opens up.",
                )

        # Retrieve the Stripe subscription
        stripe_subscription = stripe.Subscription.retrieve(subscription.stripe_subscription_id)

        # Defense-in-depth — confirm the Stripe sub actually belongs to the
        # customer we have on file. Guards against a tampered DB row pointing
        # at someone else's subscription.
        if stripe_subscription.get("customer") != subscription.stripe_customer_id:
            logger.error(
                f"Customer mismatch on update_subscription: user {current_user.id} "
                f"local customer {subscription.stripe_customer_id} vs stripe "
                f"{stripe_subscription.get('customer')}"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Subscription record is inconsistent. Please contact support.",
            )

        # Get the subscription item ID (there should be one item).
        # Use bracket access: `sub.items` collides with dict.items method.
        subscription_item_id = stripe_subscription["items"]["data"][0]["id"]

        # NOTE (security): `always_invoice` on downgrade issues a prorated
        # credit immediately. A user could theoretically churn
        # upgrade→downgrade→upgrade to harvest Guild Master perks without
        # paying full price. Proper fix is to defer downgrades to period end
        # via stripe.SubscriptionSchedule — tracked as a followup. For now the
        # one-time `subscription_bonus:<tier>` guard in clave_service prevents
        # XP farming, and Guild Master seat cap enforcement (#4) keeps repeat
        # upgrades gated by seat availability.
        modify_kwargs: Dict[str, Any] = {
            "items": [{
                "id": subscription_item_id,
                "price": request_data.new_price_id,
            }],
            "proration_behavior": "always_invoice",
            "cancel_at_period_end": False,
        }

        # If the user is currently trialing and is upgrading to Guild Master
        # (PERFORMER), end the trial immediately. Guild Master is a separate
        # product with no free trial — upgrading ends the trial and charges
        # the full Guild Master rate right now.
        is_upgrade_to_performer = (
            request_data.new_price_id == PERFORMER_PRICE_ID
            and subscription.status == SubscriptionStatus.TRIALING
        )
        if is_upgrade_to_performer:
            modify_kwargs["trial_end"] = "now"

        # Update the subscription with the new price
        updated_subscription = stripe.Subscription.modify(
            subscription.stripe_subscription_id,
            **modify_kwargs,
        )

        # Determine the new tier based on price_id
        price_id_to_tier = {
            ADVANCED_PRICE_ID: SubscriptionTier.ADVANCED,
            PERFORMER_PRICE_ID: SubscriptionTier.PERFORMER,
        }
        new_tier = price_id_to_tier.get(request_data.new_price_id, SubscriptionTier.ROOKIE)

        # Read current_period_end defensively. Stripe API 2025+ moved this
        # field off the Subscription root onto the first subscription item,
        # and stripe-python's modify() response hydrates `items` inconsistently
        # (dict-method collision). We try the root, then a `.get()` path that
        # is safe regardless of shape. If neither works, we leave period_end
        # alone and let the `customer.subscription.updated` webhook correct it.
        period_end_ts = getattr(updated_subscription, "current_period_end", None)
        if not period_end_ts:
            try:
                items_field = updated_subscription.get("items") or {}
                items_data = items_field.get("data") if hasattr(items_field, "get") else None
                if items_data:
                    first = items_data[0]
                    period_end_ts = (
                        first.get("current_period_end")
                        if hasattr(first, "get")
                        else getattr(first, "current_period_end", None)
                    )
            except Exception:
                period_end_ts = None

        period_end_dt = (
            datetime.fromtimestamp(period_end_ts, tz=timezone.utc)
            if period_end_ts
            else subscription.current_period_end
        )

        # Update our database
        subscription.tier = new_tier
        subscription.current_period_end = period_end_dt
        subscription.cancel_at_period_end = False
        if is_upgrade_to_performer:
            subscription.status = SubscriptionStatus.ACTIVE
        db.commit()
        db.refresh(subscription)
        
        return SubscriptionResponse(
            success=True,
            message="Subscription updated successfully.",
            tier=new_tier.value
        )
        
    except stripe.error.StripeError:
        logger.exception(f"Stripe error updating subscription for user {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="We couldn't reach the payment processor. Please try again.",
        )
    except HTTPException:
        raise
    except Exception:
        logger.exception(f"Unexpected error updating subscription for user {current_user.id}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong while updating your subscription. Please try again.",
        )


@router.post("/cancel-subscription", response_model=SubscriptionResponse)
def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Schedule a subscription to cancel at the end of the current billing period.
    User retains full tier access until `current_period_end`, then the
    `customer.subscription.deleted` webhook drops them to Rookie.
    """
    try:
        subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id
        ).first()

        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No subscription found for this user."
            )

        if subscription.status not in (SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Subscription is not active. Nothing to cancel."
            )

        if not subscription.stripe_subscription_id:
            # No Stripe record — drop to Rookie immediately.
            subscription.status = SubscriptionStatus.CANCELED
            subscription.tier = SubscriptionTier.ROOKIE
            subscription.cancel_at_period_end = False
            db.commit()
            db.refresh(subscription)
            return SubscriptionResponse(
                success=True,
                message="Subscription canceled.",
                tier="rookie"
            )

        # Schedule cancellation at period end in Stripe. User keeps access
        # until then. Stripe will fire customer.subscription.deleted at the
        # boundary, which the webhook handler translates into tier=ROOKIE.
        stripe.Subscription.modify(
            subscription.stripe_subscription_id,
            cancel_at_period_end=True,
        )

        subscription.cancel_at_period_end = True
        db.commit()
        db.refresh(subscription)

        return SubscriptionResponse(
            success=True,
            message="Your subscription will end at the close of this billing period.",
            tier=subscription.tier.value,
        )
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error canceling subscription for user {current_user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment processing error. Please try again.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error canceling subscription for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again."
        )


@router.post("/resume-subscription", response_model=SubscriptionResponse)
def resume_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Undo a scheduled cancellation. Only valid while the subscription is still
    active but flagged `cancel_at_period_end=True`.
    """
    try:
        subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id
        ).first()
        if not subscription or not subscription.stripe_subscription_id:
            raise HTTPException(status_code=404, detail="No subscription found.")
        if not subscription.cancel_at_period_end:
            raise HTTPException(status_code=400, detail="Subscription is not scheduled to cancel.")

        stripe.Subscription.modify(
            subscription.stripe_subscription_id,
            cancel_at_period_end=False,
        )
        subscription.cancel_at_period_end = False
        db.commit()
        db.refresh(subscription)

        return SubscriptionResponse(
            success=True,
            message="Subscription resumed. Welcome back!",
            tier=subscription.tier.value,
        )
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error resuming subscription for user {current_user.id}: {e}")
        raise HTTPException(status_code=400, detail="Payment processing error. Please try again.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error resuming subscription for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")


class PortalSessionRequest(BaseModel):
    return_url: str


class PortalSessionResponse(BaseModel):
    url: str


@router.post("/create-portal-session", response_model=PortalSessionResponse)
def create_portal_session(
    request_data: PortalSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Stripe Customer Portal session. The user lands on a Stripe-hosted page
    where they can update card details, view invoices, change billing address,
    and (depending on portal config) cancel the subscription. We do not need
    to mirror any of that UI ourselves — Stripe handles it, and the resulting
    state changes flow back through the existing webhook handlers.

    Auth-only. The portal session is scoped to this user's Stripe customer,
    so an authenticated request can never reach a different user's billing.
    """
    try:
        safe_return_url = _validate_return_url(request_data.return_url, "return_url")

        subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id
        ).first()
        if not subscription or not subscription.stripe_customer_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No billing account found. Subscribe first to manage billing.",
            )

        portal_session = stripe.billing_portal.Session.create(
            customer=subscription.stripe_customer_id,
            return_url=safe_return_url,
        )
        return PortalSessionResponse(url=portal_session.url)
    except HTTPException:
        raise
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating portal session for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not open the billing portal. Please try again.",
        )
    except Exception as e:
        logger.error(f"Unexpected error creating portal session for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again.",
        )