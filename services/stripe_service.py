import stripe
from typing import Dict, Any

from output.backend.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

def create_checkout_session(
    user_id: str,
    price_id: str,
    success_url: str,
    cancel_url: str
) -> stripe.checkout.Session:
    """
    Creates a Stripe Checkout Session for a new subscription.
    """
    try:
        checkout_session = stripe.checkout.Session.create(
            customer_email=None, # Can be pre-filled if user email is known
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'user_id': str(user_id), # Store user_id for webhook processing
            },
            # Allow Stripe to create a customer if one doesn't exist
            # or attach to an existing one if customer_email is provided and matches.
            # If we already have stripe_customer_id, we can pass it here:
            # customer=stripe_customer_id,
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