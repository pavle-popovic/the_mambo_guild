from typing import Annotated
import uuid
import stripe
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from dependencies import get_db, get_current_user
from models.user import User, Subscription, SubscriptionStatus, SubscriptionTier
from services import stripe_service
from config import settings

from schemas.course import CheckoutSessionRequest, CheckoutSessionResponse

router = APIRouter(prefix="/payments", tags=["payments"])

# Stripe Price IDs - Advanced and Performer tiers
ADVANCED_PRICE_ID = "price_1SmeXA1a6FlufVwfOLg5SMcc"
PERFORMER_PRICE_ID = "price_1SmeZa1a6FlufVwfrJCJrv94"


@router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
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
        
        # Check if user already has an active subscription
        existing_subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id
        ).first()
        if existing_subscription and existing_subscription.status == SubscriptionStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has an active subscription."
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
                    current_period_end=datetime.utcnow()  # Placeholder
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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {e}"
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
        # Invalid payload
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid payload: {e}")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid signature: {e}")

    # Handle the event
    if event["type"] == "invoice.payment_succeeded":
        invoice = event["data"]["object"]
        subscription_id = invoice.get("subscription")
        customer_id = invoice.get("customer")

        if subscription_id and customer_id:
            try:
                stripe_subscription = stripe.Subscription.retrieve(subscription_id)
                
                # Get the price lookup_key to determine tier
                price_lookup_key = stripe_subscription.items.data[0].price.lookup_key
                
                # Map Stripe lookup_key to our SubscriptionTier enum
                # Stripe lookup_key should be "advanced" or "performer" (lowercase)
                tier_mapping = {
                    "advanced": SubscriptionTier.ADVANCED,
                    "performer": SubscriptionTier.PERFORMER,
                }
                
                tier = tier_mapping.get(price_lookup_key.lower() if price_lookup_key else "", SubscriptionTier.ROOKIE)
                
                # Find the user's subscription in our DB
                db_subscription = db.query(Subscription).filter(
                    Subscription.stripe_customer_id == customer_id
                ).first()

                if db_subscription:
                    db_subscription.stripe_subscription_id = stripe_subscription.id
                    db_subscription.status = SubscriptionStatus.ACTIVE
                    db_subscription.tier = tier
                    db_subscription.current_period_end = datetime.fromtimestamp(
                        stripe_subscription.current_period_end
                    )
                    db.commit()
                    db.refresh(db_subscription)
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
                            current_period_end=datetime.fromtimestamp(
                                stripe_subscription.current_period_end
                            )
                        )
                        db.add(new_subscription)
                        db.commit()
                        db.refresh(new_subscription)
                    else:
                        print(f"Warning: Could not find user_id in metadata for new subscription {subscription_id}")

            except stripe.error.StripeError as e:
                print(f"Stripe API error retrieving subscription {subscription_id}: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Stripe API error"
                )
            except Exception as e:
                print(f"Error processing invoice.payment_succeeded for subscription {subscription_id}: {e}")
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
            db.commit()
            db.refresh(db_subscription)
        else:
            print(f"Warning: Subscription {stripe_subscription_id} not found in DB for deletion event.")

    # Other event types can be handled here as needed

    return {"status": "success"}