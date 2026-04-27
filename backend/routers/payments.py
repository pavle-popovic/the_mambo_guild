from typing import Annotated, Any, Dict, Optional
from urllib.parse import urlparse
import uuid
import logging
import stripe
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Response, status, Request
from sqlalchemy import text, or_, and_
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


# Time window after which an INCOMPLETE Subscription row is considered an
# abandoned checkout and stops counting toward the Guild Master seat cap /
# blocking new checkouts for the same user. 30 minutes covers the
# overwhelming majority of real Stripe Checkout completion times; the
# Stripe Checkout Session itself expires after 24h but we don't want to
# punish a user that long for an abandoned tab.
_PENDING_CHECKOUT_TTL = timedelta(minutes=30)


def _lock_user_for_checkout(db: Session, user_id) -> None:
    """
    Per-user transaction-scoped advisory lock. Serializes one user's
    create_checkout_session calls so two concurrent tabs/clicks can't both
    pass the trial-eligibility check before either has flipped
    has_used_trial=True (H2 in the audit). The key is derived from the
    UUID (deterministic across processes/instances) and uses bit 30 to
    avoid colliding with the small constant key used by
    _lock_guild_master_seats.
    """
    try:
        if isinstance(user_id, uuid.UUID):
            uid_int = user_id.int
        else:
            uid_int = uuid.UUID(str(user_id)).int
        # bits 0..29 carry the UUID hash, bit 30 namespaces this lock.
        key = (1 << 30) | (uid_int & 0x3FFFFFFF)
        db.execute(text("SELECT pg_advisory_xact_lock(:k)"), {"k": key})
    except Exception:
        logger.debug("Advisory lock unavailable — continuing without per-user serialization")


def _guild_master_seats_taken(db: Session) -> int:
    """
    Live count of Performer seats consumed.

    Includes both promoted subs (TRIALING/ACTIVE) AND recently-created
    INCOMPLETE checkouts that intend to be Performer (so that several
    concurrent buyers all chasing the last seat at taken=29 can't each
    pass the cap check before any of their webhooks have fired — H3 in
    the audit). The INCOMPLETE row's tier is set to PERFORMER at
    create_checkout_session time, and current_period_end carries the
    creation timestamp until a webhook overwrites it, so the staleness
    cutoff just compares against that.
    """
    pending_cutoff = datetime.now(timezone.utc) - _PENDING_CHECKOUT_TTL
    return (
        db.query(Subscription)
        .filter(
            Subscription.tier == SubscriptionTier.PERFORMER,
            or_(
                Subscription.status.in_((
                    SubscriptionStatus.ACTIVE,
                    SubscriptionStatus.TRIALING,
                )),
                and_(
                    Subscription.status == SubscriptionStatus.INCOMPLETE,
                    Subscription.current_period_end >= pending_cutoff,
                ),
            ),
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
            # Escape backslashes and single quotes so an email with an
            # apostrophe (e.g., o'brien@…) doesn't break the Stripe search
            # query syntax (which would fail the query, fall through to
            # fail-closed, and permanently deny that user a trial).
            escaped_normalized = normalized.replace("\\", "\\\\").replace("'", "\\'")
            search_results = stripe.Customer.search(
                query=f"metadata['normalized_email']:'{escaped_normalized}'",
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
    # L1: one operation_id per request, used to derive idempotency keys for
    # every Stripe write below. If the SDK retries on a connection error,
    # Stripe returns the cached response keyed off this id instead of
    # double-creating customers / checkout sessions.
    operation_id = str(uuid.uuid4())
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

        # H2: serialize this user's checkout flow so two concurrent
        # tabs/clicks can't both pass the trial-eligibility check before
        # either has flipped has_used_trial=True via the webhook. Held for
        # the rest of this transaction; released on the final commit/
        # rollback.
        _lock_user_for_checkout(db, current_user.id)

        # The local Subscription row's tier is stamped to match the price
        # the user is buying (H3). This is what _guild_master_seats_taken
        # reads to count pending Performer checkouts toward the seat cap.
        intended_tier = (
            SubscriptionTier.PERFORMER
            if request_data.price_id == PERFORMER_PRICE_ID
            else SubscriptionTier.ADVANCED
        )
        # Used both as the placeholder current_period_end and as the
        # "last-touched" timestamp the recent-INCOMPLETE check below reads.
        intended_period_end = datetime.now(timezone.utc)

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

        # H2: refuse to start a parallel checkout if the user has a
        # recently-touched INCOMPLETE row. The user-lock above prevents
        # two requests from racing in a single instance, but a recent
        # INCOMPLETE also blocks a second attempt across instances /
        # browser sessions. Once a webhook flips the status off
        # INCOMPLETE, this check stops applying.
        if (
            existing_subscription
            and existing_subscription.status == SubscriptionStatus.INCOMPLETE
            and existing_subscription.current_period_end is not None
        ):
            last_touched = existing_subscription.current_period_end
            if last_touched.tzinfo is None:
                last_touched = last_touched.replace(tzinfo=timezone.utc)
            if last_touched >= datetime.now(timezone.utc) - _PENDING_CHECKOUT_TTL:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A checkout is already in progress. Please complete or cancel it before starting a new one.",
                )

        # Enforce the Guild Master seat cap on new checkouts. Serialize the
        # read/modify window with an advisory lock so concurrent checkouts
        # can't both pass at taken=29. _guild_master_seats_taken now also
        # counts recent INCOMPLETE Performer rows, so the cap holds even
        # before a webhook arrives — see H3 in the audit.
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
            # M3: list up to 10 customers, not 1. Stripe sometimes ends up
            # with multiple customers under the same email (manual dashboard
            # creation, retry races, support-tooling spawns). Picking just
            # data[0] arbitrarily means later attempts may pick a different
            # one — and the metadata backfill (which feeds the trial-abuse
            # alias-lookup at _email_has_prior_stripe_subscription) only
            # touches the chosen one, leaving siblings unenriched.
            existing_customers = stripe.Customer.list(email=current_user.email, limit=10)
            candidates = list(existing_customers.data)
            customer = None
            if candidates:
                # Prefer the customer whose metadata.user_id matches the
                # current logged-in user — that's a definitive match and
                # avoids consolidating onto a stranger's customer if the
                # email got reused after a prior account was deleted.
                target_uid = str(current_user.id)
                for c in candidates:
                    if (c.metadata or {}).get("user_id") == target_uid:
                        customer = c
                        break
                # Fall back to data[0] (Stripe orders by created desc, so
                # this is the newest — same default behavior as before).
                if customer is None:
                    customer = candidates[0]

                # Ensure both metadata fields are attached. We compare each
                # key individually because Stripe.modify replaces metadata
                # wholesale only if we pass it; an existing customer could
                # have user_id set but be missing normalized_email (older
                # Stripe customer pre-dating this guard).
                existing_md = customer.metadata or {}
                if any(existing_md.get(k) != v for k, v in customer_metadata.items()):
                    stripe.Customer.modify(
                        customer.id,
                        metadata=customer_metadata,
                        idempotency_key=f"cust_modify:{customer.id}:{operation_id}",
                    )
            else:
                customer = stripe.Customer.create(
                    email=current_user.email,
                    metadata=customer_metadata,
                    idempotency_key=f"cust_create:{current_user.id}:{operation_id}",
                )
            stripe_customer_id = customer.id

            # Update or create subscription record with stripe_customer_id.
            # Stamp tier=intended_tier (H3 seat counting) and a fresh
            # current_period_end timestamp (H2 recent-INCOMPLETE marker).
            if not current_user.subscription:
                new_subscription = Subscription(
                    id=uuid.uuid4(),
                    user_id=current_user.id,
                    stripe_customer_id=stripe_customer_id,
                    status=SubscriptionStatus.INCOMPLETE,
                    tier=intended_tier,
                    current_period_end=intended_period_end,
                )
                db.add(new_subscription)
            else:
                current_user.subscription.stripe_customer_id = stripe_customer_id
                current_user.subscription.status = SubscriptionStatus.INCOMPLETE
                current_user.subscription.tier = intended_tier
                current_user.subscription.current_period_end = intended_period_end
            # H2: flush, don't commit. Committing would release the
            # per-user advisory lock before we've created the Stripe
            # Checkout Session, reopening the trial-eligibility race.
            # The transaction is committed at the end of the handler.
            db.flush()
            # Only refresh the subscription relationship — full graph refresh
            # is expensive and unnecessary here.
            db.refresh(current_user, attribute_names=["subscription"])
        else:
            # Existing customer reused. Still stamp the row's tier and
            # touch timestamp so seat counting and recent-INCOMPLETE see
            # this attempt instead of an old one.
            current_user.subscription.status = SubscriptionStatus.INCOMPLETE
            current_user.subscription.tier = intended_tier
            current_user.subscription.current_period_end = intended_period_end
            db.flush()

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
            idempotency_key=f"checkout:{current_user.id}:{operation_id}",
        )

        # H2: commit now — *before* analytics — so the per-user advisory
        # lock and the seat-cap lock are held through the trial-eligibility
        # check and the Stripe Checkout creation. If the Stripe call had
        # raised above, the except blocks below would db.rollback() and
        # release the locks without persisting an orphaned INCOMPLETE row.
        # From this commit onward, any concurrent create_checkout_session
        # for this user will see the recent-INCOMPLETE row (committed
        # here) and 409 via the recent-INCOMPLETE guard.
        db.commit()

        # Fire InitiateCheckout to Meta CAPI. Value reflects the tier's list
        # price so Meta's bidder can prioritise high-value checkouts.
        # track_event commits its own row internally — failures inside it
        # cannot roll back the checkout state we just persisted.
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
    except HTTPException:
        # Make sure validation/business-rule rejections release locks and
        # discard any pending row writes (e.g. a flushed INCOMPLETE row
        # that we never want to keep on a 4xx).
        db.rollback()
        raise
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating checkout session for user {current_user.id}: {e}")
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment processing error. Please try again.")
    except Exception as e:
        logger.error(f"Unexpected error creating checkout session for user {current_user.id}: {e}")
        db.rollback()
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

    # Idempotency guard — Stripe retries webhooks on any 5xx, and replays
    # are legal. Without this, invoice.payment_succeeded would re-grant
    # XP/bonuses on every retry.
    #
    # Pattern: SELECT-then-INSERT-at-end. Previously the row was inserted
    # *before* processing — that meant any transient handler failure
    # (Stripe API blip, DB hiccup) committed the idempotency row first
    # and silently dropped Stripe's retry, permanently losing the event.
    # Now we only mark as processed once the handler has run cleanly. On
    # failure we return 5xx so Stripe retries. The trade-off: two
    # near-simultaneous retries from Stripe could both pass the SELECT;
    # the unique-PK INSERT at the end catches the race (work has already
    # been done by both, but each operation in the handlers below is
    # designed to be idempotent — set tier=X, set status=Y, the
    # subscription_bonus reason key, etc.).
    already_processed = db.query(StripeWebhookEvent).filter(
        StripeWebhookEvent.event_id == event["id"]
    ).first()
    if already_processed:
        logger.info(
            f"Stripe webhook {event['id']} ({event['type']}) already "
            f"processed — skipping"
        )
        return {"status": "already_processed"}

    # Set to True only by handlers whose core work raised. We refuse to
    # mark the event processed in that case, so Stripe will retry.
    webhook_handler_failed = False

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

        # Metadata fallback. The customer_id lookup misses in two real
        # scenarios: (a) the subscription was created externally (Stripe
        # dashboard, support tooling, promo) so no INCOMPLETE row exists
        # yet, and (b) the local row is stamped with an older
        # stripe_customer_id (e.g. user wiped + re-created with the same
        # email, where create_checkout_session reuses the old customer).
        # Without a fallback, this entire handler silently no-ops:
        # has_used_trial never flips, tier never promotes, badges never
        # revoke. Mirror the metadata-fallback pattern from
        # invoice.payment_succeeded.
        if not db_subscription:
            user_id_from_metadata = (sub_obj.get("metadata") or {}).get("user_id")
            if user_id_from_metadata:
                try:
                    user_uuid = uuid.UUID(user_id_from_metadata)
                except (ValueError, TypeError):
                    logger.warning(
                        f"webhook {event['type']}: invalid user_id metadata "
                        f"{user_id_from_metadata!r} on sub {stripe_sub_id}"
                    )
                    user_uuid = None
                if user_uuid and db.query(User).filter(User.id == user_uuid).first():
                    db_subscription = db.query(Subscription).filter(
                        Subscription.user_id == user_uuid
                    ).first()
                    if db_subscription:
                        # Local row exists for this user but under a different
                        # stripe_customer_id. Re-stamp it so future webhooks
                        # for this customer find it directly.
                        db_subscription.stripe_customer_id = customer_id
                    else:
                        # No local row at all (externally-created sub) —
                        # create one in INCOMPLETE state. The block below
                        # will immediately promote it based on stripe_status.
                        db_subscription = Subscription(
                            id=uuid.uuid4(),
                            user_id=user_uuid,
                            stripe_customer_id=customer_id,
                            status=SubscriptionStatus.INCOMPLETE,
                            tier=SubscriptionTier.ROOKIE,
                            current_period_end=datetime.now(timezone.utc),
                        )
                        db.add(db_subscription)
                        db.flush()

        if db_subscription:
            # Always mirror the Stripe status, including past_due / canceled /
            # incomplete. Skipping non-active states leaves us with stale
            # "ACTIVE" rows after a failed renewal.
            db_subscription.stripe_subscription_id = stripe_sub_id
            db_subscription.status = db_status
            # Snapshot the OLD tier before we overwrite it. Used below to
            # detect a Performer→Advanced transition (the deferred-downgrade
            # phase change Stripe fires at the period boundary) and clear the
            # scheduled_tier markers we set in update_subscription.
            previous_tier = db_subscription.tier
            # Promote tier on good-standing states. On past_due we revoke
            # premium access immediately by dropping to ROOKIE — Stripe Smart
            # Retries can run for ~14 days otherwise, during which a delinquent
            # member would keep Guild Master perks for free. If a retry
            # succeeds, invoice.payment_succeeded restores the tier from
            # price.id automatically.
            if db_status in (SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE):
                db_subscription.tier = tier
                db_subscription.current_period_end = period_end_dt
                # Mirror current_period_start so the per-period coaching gate
                # (premium.py) can window submissions to the user's actual
                # paid window. Stripe API 2025+ moved this off the root onto
                # each item, same as current_period_end.
                period_start_ts = sub_obj.get("current_period_start") or (
                    items[0].get("current_period_start") if items else None
                )
                if period_start_ts:
                    db_subscription.current_period_start = datetime.fromtimestamp(
                        period_start_ts, tz=timezone.utc
                    )
            elif db_status == SubscriptionStatus.PAST_DUE:
                db_subscription.tier = SubscriptionTier.ROOKIE
            db_subscription.cancel_at_period_end = bool(sub_obj.get("cancel_at_period_end"))
            if db_status == SubscriptionStatus.CANCELED:
                db_subscription.tier = SubscriptionTier.ROOKIE
                db_subscription.cancel_at_period_end = False
            # If this event reflects the deferred downgrade firing — Stripe
            # transitioned the schedule's phase 1 → phase 2 at the period
            # boundary — clear the schedule markers. The new phase price is
            # already mirrored above (price.id resolved → tier=ADVANCED).
            if (
                previous_tier == SubscriptionTier.PERFORMER
                and db_subscription.tier == SubscriptionTier.ADVANCED
                and db_status in (SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE)
            ):
                db_subscription.scheduled_tier = None
                db_subscription.stripe_schedule_id = None
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
        else:
            # Both lookups missed. Most likely the subscription was created
            # in Stripe with no resolvable user_id metadata (e.g. legacy
            # promo flow). Log loud — without state to mirror, this user's
            # tier and trial flag will not get updated.
            logger.warning(
                f"webhook {event['type']}: no DB row for customer "
                f"{customer_id} and no resolvable user_id metadata on "
                f"sub {stripe_sub_id} — state not mirrored"
            )

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
                # Core processing failed (Stripe API blip on retrieve, etc.).
                # Don't mark the event as processed — let Stripe retry. The
                # 503 returned at the bottom of the handler is what triggers
                # the retry; here we just rollback our partial DB writes
                # and signal the failure via webhook_handler_failed.
                logger.error(f"Stripe API error retrieving subscription {subscription_id}: {e}")
                db.rollback()
                webhook_handler_failed = True
            except Exception as e:
                logger.exception(f"Error processing invoice.payment_succeeded for subscription {subscription_id}: {e}")
                db.rollback()
                webhook_handler_failed = True

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
            # Clear all scheduled-change markers on a final cancellation.
            # `last_performer_downgrade_at` is the legacy 30-day cooldown
            # anchor (no longer read; cleared for forward compatibility);
            # `scheduled_tier` / `stripe_schedule_id` are the deferred-
            # downgrade markers — Stripe aborts the schedule when the
            # underlying sub is canceled, but mirror that here too so the
            # DB never holds a dangling schedule reference.
            db_subscription.last_performer_downgrade_at = None
            db_subscription.scheduled_tier = None
            db_subscription.stripe_schedule_id = None
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
                    # L1: key off the webhook event id so a Stripe retry of
                    # this same charge.refunded event doesn't double-cancel.
                    stripe.Subscription.delete(
                        db_subscription.stripe_subscription_id,
                        idempotency_key=f"sub_delete_refund:{event['id']}",
                    )
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
                # L1: key off the webhook event id so a Stripe retry of this
                # same dispute event doesn't double-cancel.
                stripe.Subscription.delete(
                    db_subscription.stripe_subscription_id,
                    idempotency_key=f"sub_delete_dispute:{event['id']}",
                )
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

    elif event["type"] in (
        "subscription_schedule.released",
        "subscription_schedule.canceled",
        "subscription_schedule.aborted",
    ):
        # Lifecycle events for the deferred-downgrade schedule. We treat all
        # three the same: the schedule is no longer driving billing, so clear
        # the DB markers we set when scheduling. The actual price/tier of
        # the subscription is owned by `customer.subscription.updated`,
        # which will arrive (or already has arrived) for any phase change
        # — we don't touch tier here.
        #
        # Why three event types: `released` is the happy path (user undid
        # the downgrade, or phase 2 began and Stripe auto-released as
        # configured). `canceled` fires if the schedule itself was canceled
        # via API. `aborted` fires when the underlying sub was canceled
        # while a schedule was active. All three should leave the DB in
        # the same "no schedule pending" shape.
        sched_obj = event["data"]["object"]
        schedule_id = sched_obj.get("id")
        if schedule_id:
            db_sub = db.query(Subscription).filter(
                Subscription.stripe_schedule_id == schedule_id
            ).first()
            if db_sub:
                db_sub.stripe_schedule_id = None
                db_sub.scheduled_tier = None
                db.commit()
                logger.info(
                    f"webhook {event['type']}: cleared schedule markers for "
                    f"user {db_sub.user_id} (sched={schedule_id})"
                )
            else:
                logger.info(
                    f"webhook {event['type']}: no DB row carries schedule "
                    f"{schedule_id} — already cleared or never tracked."
                )

    # Refuse to mark a failed event as processed — return 5xx so Stripe
    # retries with the same event id, and a future call will re-enter
    # the handler from the top.
    if webhook_handler_failed:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Webhook processing failed; will retry",
        )

    # Mark as processed. IntegrityError here means a near-simultaneous
    # retry inserted first — the work has been done by both, but our
    # handlers are designed to be idempotent so this is safe.
    try:
        db.add(StripeWebhookEvent(event_id=event["id"], event_type=event["type"]))
        db.commit()
    except IntegrityError:
        db.rollback()
        logger.info(
            f"Stripe webhook {event['id']} ({event['type']}) marked "
            f"already_processed concurrently — both runs completed"
        )

    return {"status": "success"}


@router.post("/update-subscription", response_model=SubscriptionResponse)
def update_subscription(
    request_data: UpdateSubscriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Change the user's tier on their existing Stripe subscription.

    Three legal transitions:

      • Pro→Performer (and trial→Performer): immediate prorated charge.
        The user gets Performer access right now; the unused remainder of
        the Pro period is credited via Stripe proration. Trial users have
        their trial ended (`trial_end="now"`) and are charged the full
        Performer rate immediately — Guild Master has no free trial.

      • Performer→Pro: SCHEDULED for the next period boundary via
        `stripe.SubscriptionSchedule`. The user keeps Performer access
        through `current_period_end`, then auto-drops to Pro on Stripe's
        next billing tick. No proration credit, no refund — they don't
        get back what they've already paid for. This closes the proration-
        cycle exploit class entirely (see migration 027).

      • Performer→Performer while a downgrade is pending: releases the
        schedule (the user changed their mind about the downgrade). No
        Stripe billing change. Idempotent.

    Rejected:
      • cancel_at_period_end=True: the user must resume before changing plans.
      • Trialing user attempting Performer→Pro: trial is on Pro to begin with;
        the only way out of a trial is cancel.
      • Repeated downgrade requests: 409 with the existing landing date.
    """
    operation_id = str(uuid.uuid4())  # L1: idempotency-key basis
    try:
        if request_data.new_price_id not in [ADVANCED_PRICE_ID, PERFORMER_PRICE_ID]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid price ID. Only Advanced and Performer tiers are available."
            )

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

        # Pre-compute the transition shape once so each subsequent check reads
        # the same intent. `is_release_pending_downgrade` covers the "I changed
        # my mind, keep me on Performer" path — same target tier, but a
        # schedule exists that we need to release.
        is_upgrade_request_to_performer = (
            request_data.new_price_id == PERFORMER_PRICE_ID
            and subscription.tier != SubscriptionTier.PERFORMER
        )
        is_downgrade_performer_to_advanced = (
            request_data.new_price_id == ADVANCED_PRICE_ID
            and subscription.tier == SubscriptionTier.PERFORMER
        )
        is_release_pending_downgrade = (
            request_data.new_price_id == PERFORMER_PRICE_ID
            and subscription.tier == SubscriptionTier.PERFORMER
            and subscription.stripe_schedule_id is not None
        )

        # A scheduled cancel and a tier change are mutually exclusive — the
        # user must resume their subscription before changing plans, otherwise
        # the cancel_at_period_end flag and any downgrade schedule would race
        # at the period boundary.
        if subscription.cancel_at_period_end:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Resume your subscription before changing plans.",
            )

        # ------------------------------------------------------------------
        # Path A — release a pending downgrade (user changed their mind).
        # No Stripe billing change required: they're already on Performer.
        # We just release the schedule and clear the DB markers. The Stripe
        # `subscription_schedule.released` webhook will arrive shortly and
        # confirm the same state.
        # ------------------------------------------------------------------
        if is_release_pending_downgrade:
            try:
                stripe.SubscriptionSchedule.release(
                    subscription.stripe_schedule_id,
                    idempotency_key=f"sched_release:{subscription.stripe_schedule_id}:{operation_id}",
                )
            except stripe.error.InvalidRequestError as e:
                # Schedule already released or in a terminal state. The goal
                # (no pending downgrade) is met either way.
                logger.info(
                    f"update_subscription: schedule {subscription.stripe_schedule_id} "
                    f"already released or terminal: {e}"
                )
            subscription.stripe_schedule_id = None
            subscription.scheduled_tier = None
            db.commit()
            db.refresh(subscription)
            return SubscriptionResponse(
                success=True,
                message="Downgrade canceled. You're still Guild Master.",
                tier=subscription.tier.value,
                scheduled_tier=None,
                cancel_at_period_end=subscription.cancel_at_period_end,
                current_period_end=subscription.current_period_end,
            )

        # ------------------------------------------------------------------
        # Path B — schedule a Performer→Pro downgrade for the next boundary.
        # ------------------------------------------------------------------
        if is_downgrade_performer_to_advanced:
            # Idempotency: don't stack schedules. Surface the existing landing
            # date instead of duplicating work or charging double.
            if subscription.stripe_schedule_id is not None:
                landing = (
                    subscription.current_period_end.strftime("%B %d, %Y")
                    if subscription.current_period_end else None
                )
                msg = (
                    f"Downgrade is already scheduled for {landing}."
                    if landing else "Downgrade is already scheduled."
                )
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT, detail=msg
                )

            # A trialing Performer is not a real state in our model (trial is
            # only on Pro); reject defensively so we never schedule a
            # downgrade against a $0 trial period.
            if subscription.status == SubscriptionStatus.TRIALING:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot schedule a downgrade during a trial.",
                )

            stripe_subscription = stripe.Subscription.retrieve(subscription.stripe_subscription_id)
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

            # Create a SubscriptionSchedule from the existing sub. This seeds
            # phase 0 from the current state (Performer until current_period_end).
            # We then append phase 1 with the Pro price and `end_behavior=
            # "release"`, so when phase 1 begins at the boundary the schedule
            # auto-detaches and the sub continues as a regular Pro subscription
            # billing $39/mo forever after. Stripe rejects `iterations` on
            # phases inside `phases=[...]`, so phase 1 is open-ended; Stripe
            # auto-derives its end_date from the price's billing interval.
            schedule = stripe.SubscriptionSchedule.create(
                from_subscription=subscription.stripe_subscription_id,
                idempotency_key=f"sched_create:{subscription.stripe_subscription_id}:{operation_id}",
            )
            phase1 = schedule.phases[0]
            phase1_items = [
                {
                    "price": it["price"]["id"] if hasattr(it["price"], "id") else it["price"],
                    "quantity": it["quantity"],
                }
                for it in phase1["items"]
            ]
            try:
                stripe.SubscriptionSchedule.modify(
                    schedule.id,
                    end_behavior="release",
                    phases=[
                        {
                            "items": phase1_items,
                            "start_date": phase1["start_date"],
                            "end_date": phase1["end_date"],
                        },
                        {
                            "items": [{"price": ADVANCED_PRICE_ID, "quantity": 1}],
                            "proration_behavior": "none",
                        },
                    ],
                    idempotency_key=f"sched_modify:{schedule.id}:{operation_id}",
                )
            except stripe.error.StripeError:
                # modify() failed — clean up the orphaned schedule so the
                # subscription doesn't get stuck (create() would reject a
                # second from_subscription= call on a sub that already has
                # an active schedule). Canceling the schedule is safe: it
                # was phase-0-only (Performer until period_end, no change
                # from current), so canceling it leaves billing unchanged.
                try:
                    stripe.SubscriptionSchedule.cancel(schedule.id)
                except Exception:
                    logger.exception(
                        f"update_subscription: failed to cancel orphaned schedule "
                        f"{schedule.id} after modify failure — manual cleanup may be required"
                    )
                raise  # re-raise the original StripeError to the outer handler

            subscription.stripe_schedule_id = schedule.id
            subscription.scheduled_tier = SubscriptionTier.ADVANCED.value
            db.commit()
            db.refresh(subscription)

            landing = (
                subscription.current_period_end.strftime("%B %d, %Y")
                if subscription.current_period_end else "the next billing date"
            )
            return SubscriptionResponse(
                success=True,
                message=f"Downgrade scheduled. You'll keep Guild Master through {landing}.",
                tier=subscription.tier.value,
                scheduled_tier=SubscriptionTier.ADVANCED.value,
                cancel_at_period_end=subscription.cancel_at_period_end,
                current_period_end=subscription.current_period_end,
            )

        # ------------------------------------------------------------------
        # Path C — immediate prorated upgrade (Pro→Performer or trial→Performer).
        # ------------------------------------------------------------------
        if is_upgrade_request_to_performer:
            _lock_guild_master_seats(db)
            if _guild_master_seats_taken(db) >= GUILD_MASTER_SEAT_CAP:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Guild Master is currently full. Join the waitlist to be notified when a seat opens up.",
                )

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

        updated_subscription = stripe.Subscription.modify(
            subscription.stripe_subscription_id,
            **modify_kwargs,
            idempotency_key=f"sub_modify:{subscription.stripe_subscription_id}:{operation_id}",
        )

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
            tier=new_tier.value,
            scheduled_tier=subscription.scheduled_tier,
            cancel_at_period_end=subscription.cancel_at_period_end,
            current_period_end=subscription.current_period_end,
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
    operation_id = str(uuid.uuid4())  # L1: idempotency-key basis
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
            subscription.scheduled_tier = None
            subscription.stripe_schedule_id = None
            db.commit()
            db.refresh(subscription)
            return SubscriptionResponse(
                success=True,
                message="Subscription canceled.",
                tier="rookie",
                scheduled_tier=None,
                cancel_at_period_end=False,
                current_period_end=subscription.current_period_end,
            )

        # Release any pending downgrade schedule first. Cancel and
        # scheduled-downgrade are mutually exclusive at the period boundary
        # — the user is asking to end the subscription entirely, so the
        # phase-2 (Pro) future is moot. We release the schedule so Stripe
        # doesn't try to transition the sub to Pro on the very tick we want
        # it to end. Stripe also auto-aborts schedules when the underlying
        # sub is canceled, but doing it explicitly avoids the race window
        # and keeps our DB row clean immediately.
        if subscription.stripe_schedule_id:
            try:
                stripe.SubscriptionSchedule.release(
                    subscription.stripe_schedule_id,
                    idempotency_key=f"sched_release_on_cancel:{subscription.stripe_schedule_id}:{operation_id}",
                )
            except stripe.error.InvalidRequestError as e:
                logger.info(
                    f"cancel_subscription: schedule {subscription.stripe_schedule_id} "
                    f"already released or terminal: {e}"
                )
            subscription.stripe_schedule_id = None
            subscription.scheduled_tier = None
            db.commit()

        # Schedule cancellation at period end in Stripe. User keeps access
        # until then. Stripe will fire customer.subscription.deleted at the
        # boundary, which the webhook handler translates into tier=ROOKIE.
        stripe.Subscription.modify(
            subscription.stripe_subscription_id,
            cancel_at_period_end=True,
            idempotency_key=f"sub_cancel:{subscription.stripe_subscription_id}:{operation_id}",
        )

        subscription.cancel_at_period_end = True
        db.commit()
        db.refresh(subscription)

        return SubscriptionResponse(
            success=True,
            message="Your subscription will end at the close of this billing period.",
            tier=subscription.tier.value,
            scheduled_tier=subscription.scheduled_tier,
            cancel_at_period_end=subscription.cancel_at_period_end,
            current_period_end=subscription.current_period_end,
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
    operation_id = str(uuid.uuid4())  # L1: idempotency-key basis
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
            idempotency_key=f"sub_resume:{subscription.stripe_subscription_id}:{operation_id}",
        )
        subscription.cancel_at_period_end = False
        db.commit()
        db.refresh(subscription)

        return SubscriptionResponse(
            success=True,
            message="Subscription resumed. Welcome back!",
            tier=subscription.tier.value,
            scheduled_tier=subscription.scheduled_tier,
            cancel_at_period_end=subscription.cancel_at_period_end,
            current_period_end=subscription.current_period_end,
        )
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error resuming subscription for user {current_user.id}: {e}")
        raise HTTPException(status_code=400, detail="Payment processing error. Please try again.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error resuming subscription for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")


@router.post("/cancel-scheduled-downgrade", response_model=SubscriptionResponse)
def cancel_scheduled_downgrade(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Undo a pending Performer→Pro downgrade that hasn't fired yet.

    Releases the Stripe SubscriptionSchedule and clears the DB markers.
    The subscription stays on Performer at the same period boundary; no
    proration, no charge. Only valid while `scheduled_tier` is set and the
    schedule hasn't transitioned to phase 2 yet.

    Note: this is the "Keep Guild Master" affordance. Calling
    /update-subscription with new_price_id=PERFORMER while pending also
    releases the schedule (same end state) — both paths exist so the UI
    and any external scripts can use whichever feels natural.
    """
    operation_id = str(uuid.uuid4())  # L1: idempotency-key basis
    try:
        subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id
        ).first()
        if not subscription:
            raise HTTPException(status_code=404, detail="No subscription found.")
        if not subscription.stripe_schedule_id:
            raise HTTPException(
                status_code=400, detail="No scheduled downgrade to cancel."
            )

        try:
            stripe.SubscriptionSchedule.release(
                subscription.stripe_schedule_id,
                idempotency_key=f"sched_release:{subscription.stripe_schedule_id}:{operation_id}",
            )
        except stripe.error.InvalidRequestError as e:
            # Schedule already released or in a terminal state. Treat as
            # success — the goal (no pending downgrade) is met.
            logger.info(
                f"cancel_scheduled_downgrade: schedule {subscription.stripe_schedule_id} "
                f"already released or terminal: {e}"
            )

        subscription.stripe_schedule_id = None
        subscription.scheduled_tier = None
        db.commit()
        db.refresh(subscription)

        return SubscriptionResponse(
            success=True,
            message="Downgrade canceled. You're still Guild Master.",
            tier=subscription.tier.value,
            scheduled_tier=None,
            cancel_at_period_end=subscription.cancel_at_period_end,
            current_period_end=subscription.current_period_end,
        )
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error releasing schedule for user {current_user.id}: {e}")
        raise HTTPException(status_code=400, detail="Payment processing error. Please try again.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error releasing schedule for user {current_user.id}: {e}")
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
    operation_id = str(uuid.uuid4())  # L1: idempotency-key basis
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
            idempotency_key=f"portal:{subscription.stripe_customer_id}:{operation_id}",
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