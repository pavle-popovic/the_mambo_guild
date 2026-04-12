from typing import Annotated, Any, Dict, Optional
from urllib.parse import urlparse
import uuid
import logging
import stripe
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status, Request
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from pydantic import BaseModel

logger = logging.getLogger(__name__)

from dependencies import get_db, get_current_user
from models.user import User, UserProfile, Subscription, SubscriptionStatus, SubscriptionTier
from models.payment import StripeWebhookEvent
from services import stripe_service
from services.clave_service import award_subscription_bonus
from services.badge_service import award_subscription_badge
from config import settings

from schemas.course import (
    CheckoutSessionRequest, 
    CheckoutSessionResponse,
    UpdateSubscriptionRequest,
    SubscriptionResponse
)

router = APIRouter(prefix="/payments", tags=["payments"])

# Stripe Price IDs - Advanced and Performer (a.k.a. "VIP") tiers.
# These are TEST-mode Price IDs. Swap to live IDs when activating payments.
# The display name on Stripe is "VIP" ($59/mo) but the internal enum stays
# SubscriptionTier.PERFORMER to avoid a DB migration.
ADVANCED_PRICE_ID = "price_1TKKp51a6FlufVwfYgvr192X"
PERFORMER_PRICE_ID = "price_1TKKwC1a6FlufVwfVmE6uHml"

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


def _email_has_prior_stripe_subscription(email: str) -> bool:
    """
    Trial-abuse guard. Even if this UserProfile has has_used_trial=False (new
    account), we should refuse to grant another 7-day trial if Stripe already
    knows this email from a previous subscription. Catches the 'sign up again
    with the same email' loophole. Does NOT catch different-email-same-card —
    that requires a fingerprint column + migration.
    """
    try:
        customers = stripe.Customer.list(email=email, limit=10)
        for cust in customers.auto_paging_iter():
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
            existing_customers = stripe.Customer.list(email=current_user.email, limit=1)
            if existing_customers.data:
                customer = existing_customers.data[0]
                # Ensure our user_id metadata is attached for webhook routing.
                if (customer.metadata or {}).get("user_id") != str(current_user.id):
                    stripe.Customer.modify(
                        customer.id,
                        metadata={"user_id": str(current_user.id)},
                    )
            else:
                customer = stripe.Customer.create(
                    email=current_user.email,
                    metadata={"user_id": str(current_user.id)}
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
        # separate product with no trial. Also refuse a trial if Stripe has
        # ever seen a subscription on this email (same-email re-signup loop).
        trial_eligible = (
            bool(profile and not profile.has_used_trial)
            and request_data.price_id == ADVANCED_PRICE_ID
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
        
        return CheckoutSessionResponse(
            session_id=checkout_session.id,
            url=checkout_session.url
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
async def stripe_webhook(request: Request, db: Annotated[Session, Depends(get_db)]):
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
            # Only promote tier when the sub is good-standing; on past_due /
            # canceled the user is effectively losing access, but keep the tier
            # so we can show "your Pro access is expiring" UX until the final
            # customer.subscription.deleted lands.
            if db_status in (SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE):
                db_subscription.tier = tier
                db_subscription.current_period_end = period_end_dt
            db_subscription.cancel_at_period_end = bool(sub_obj.get("cancel_at_period_end"))
            if db_status == SubscriptionStatus.CANCELED:
                db_subscription.tier = SubscriptionTier.ROOKIE
                db_subscription.cancel_at_period_end = False
            db.commit()
            db.refresh(db_subscription)

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
            db_subscription.status = SubscriptionStatus.CANCELED
            db_subscription.tier = SubscriptionTier.ROOKIE
            db_subscription.cancel_at_period_end = False
            db.commit()
            db.refresh(db_subscription)
        else:
            logger.warning(
                f"Subscription {stripe_subscription_id} (customer {stripe_customer_id}) "
                f"not found in DB for deletion event — ignoring."
            )

    # Other event types can be handled here as needed

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