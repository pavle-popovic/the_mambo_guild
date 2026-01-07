import stripe
from typing import Dict, Any

from config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_checkout_session(
    customer_id: str,
    price_id: str,
    success_url: str,
    cancel_url: str,
    metadata: Dict[str, str] = None
) -> stripe.checkout.Session:
    """
    Creates a Stripe Checkout Session for a new subscription.
    """
    try:
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,  # Use existing customer ID
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata or {},  # Store user_id and other metadata for webhook processing
        )
        return checkout_session
    except stripe.error.StripeError as e:
        # Handle Stripe API errors
        raise ValueError(f"Stripe error creating checkout session: {e}") from e
    except Exception as e:
        # Handle other potential errors
        raise RuntimeError(f"An unexpected error occurred: {e}") from e

def construct_event(payload: bytes, sig_header: str, secret: str) -> stripe.Event:
    """
    Constructs a Stripe event from a webhook payload.
    """
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, secret
        )
        return event
    except ValueError as e:
        # Invalid payload
        raise ValueError(f"Invalid payload: {e}") from e
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise ValueError(f"Invalid signature: {e}") from e
    except Exception as e:
        # Handle other potential errors
        raise RuntimeError(f"An unexpected error occurred: {e}") from e