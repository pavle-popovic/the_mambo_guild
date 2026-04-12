from typing import Annotated
import uuid
import logging
import stripe
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from pydantic import BaseModel

logger = logging.getLogger(__name__)

from dependencies import get_db, get_current_user
from models.user import User, Subscription, SubscriptionStatus, SubscriptionTier
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
        
        # Allow creating checkout session even if user has active subscription
        # (for upgrades/downgrades, we'll use update-subscription endpoint instead)
        # But for new subscriptions, check if they already have one
        existing_subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id
        ).first()
        if existing_subscription and existing_subscription.status == SubscriptionStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has an active subscription. Use update-subscription to change plans."
            )

        # Create or retrieve Stripe Customer ID
        stripe_customer_id = current_user.subscription.stripe_customer_id if current_user.subscription else None
        if not stripe_customer_id:
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
            db.refresh(current_user)  # Refresh to ensure subscription relationship is updated

        # Create Stripe Checkout Session
        checkout_session = stripe_service.create_checkout_session(
            customer_id=stripe_customer_id,
            price_id=request_data.price_id,
            success_url=request_data.success_url,
            cancel_url=request_data.cancel_url,
            metadata={"user_id": str(current_user.id)}
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

    # Handle the event
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
                
                # Get the price lookup_key to determine tier
                price_lookup_key = stripe_subscription.items.data[0].price.lookup_key
                
                # Map Stripe lookup_key to our SubscriptionTier enum.
                # Stripe lookup_key should be "advanced", "performer", or "vip"
                # (lowercase). "vip" is a display-rename alias that still maps
                # to the internal PERFORMER tier — the DB enum stays PERFORMER
                # so no migration is needed.
                tier_mapping = {
                    "advanced": SubscriptionTier.ADVANCED,
                    "performer": SubscriptionTier.PERFORMER,
                    "vip": SubscriptionTier.PERFORMER,
                }
                
                tier = tier_mapping.get(price_lookup_key.lower() if price_lookup_key else "", SubscriptionTier.ROOKIE)

                # Stripe API 2025-08+ moved `current_period_end` off the
                # Subscription object and onto each item. Read both to stay
                # compatible with older and newer API versions.
                item0 = stripe_subscription["items"].data[0] if stripe_subscription["items"].data else None
                period_end_ts = (
                    getattr(stripe_subscription, "current_period_end", None)
                    or (getattr(item0, "current_period_end", None) if item0 else None)
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

                    # Award subscription bonus (Advanced/Performer)
                    award_subscription_bonus(str(db_subscription.user_id), tier, db, reference_id=invoice.id)

                    # Award subscription badge (Pro Member / Guild Master)
                    award_subscription_badge(str(db_subscription.user_id), tier.value, db)
                else:
                    # This case might happen if the subscription was created directly in Stripe
                    # or if the initial 'incomplete' record wasn't found.
                    # We should create a new subscription record here.
                    user_id_from_metadata = stripe_subscription.metadata.get("user_id")
                    if user_id_from_metadata:
                        new_subscription = Subscription(
                            id=uuid.uuid4(),
                            user_id=uuid.UUID(user_id_from_metadata),
                            stripe_customer_id=customer_id,
                            stripe_subscription_id=stripe_subscription.id,
                            status=SubscriptionStatus.ACTIVE,
                            tier=tier,
                            current_period_end=period_end_dt,
                        )
                        db.add(new_subscription)
                        db.commit()
                        db.refresh(new_subscription)
                        
                        # Award subscription bonus
                        award_subscription_bonus(str(new_subscription.user_id), tier, db, reference_id=invoice.id)
                        
                        # Award subscription badge
                        award_subscription_badge(str(new_subscription.user_id), tier.value, db)
                    else:
                        logger.warning(f"Could not find user_id in metadata for new subscription {subscription_id}")

            except stripe.error.StripeError as e:
                logger.error(f"Stripe API error retrieving subscription {subscription_id}: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Stripe API error"
                )
            except Exception as e:
                logger.error(f"Error processing invoice.payment_succeeded for subscription {subscription_id}: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Internal server error"
                )

    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        stripe_subscription_id = subscription.id
        db_subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == stripe_subscription_id
        ).first()
        if db_subscription:
            db_subscription.status = SubscriptionStatus.CANCELED
            db_subscription.tier = SubscriptionTier.ROOKIE
            db_subscription.cancel_at_period_end = False
            db.commit()
            db.refresh(db_subscription)
        else:
            logger.warning(f"Subscription {stripe_subscription_id} not found in DB for deletion event.")

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
        
        if subscription.status != SubscriptionStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Subscription is not active. Cannot update."
            )
        
        if not subscription.stripe_subscription_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No Stripe subscription ID found. Cannot update."
            )
        
        # Retrieve the Stripe subscription
        stripe_subscription = stripe.Subscription.retrieve(subscription.stripe_subscription_id)
        
        # Get the subscription item ID (there should be one item)
        subscription_item_id = stripe_subscription.items.data[0].id
        
        # Update the subscription with the new price
        updated_subscription = stripe.Subscription.modify(
            subscription.stripe_subscription_id,
            items=[{
                'id': subscription_item_id,
                'price': request_data.new_price_id,
            }],
            proration_behavior='always_invoice',  # Prorate the difference
        )
        
        # Determine the new tier based on price_id
        tier_mapping = {
            ADVANCED_PRICE_ID: SubscriptionTier.ADVANCED,
            PERFORMER_PRICE_ID: SubscriptionTier.PERFORMER,
        }
        new_tier = tier_mapping.get(request_data.new_price_id, SubscriptionTier.ROOKIE)
        
        # Update our database
        subscription.tier = new_tier
        subscription.current_period_end = datetime.fromtimestamp(
            updated_subscription.current_period_end, tz=timezone.utc
        )
        db.commit()
        db.refresh(subscription)
        
        return SubscriptionResponse(
            success=True,
            message="Subscription updated successfully.",
            tier=new_tier.value
        )
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error updating subscription for user {current_user.id}: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment processing error. Please try again.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error updating subscription for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again."
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

        if subscription.status != SubscriptionStatus.ACTIVE:
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