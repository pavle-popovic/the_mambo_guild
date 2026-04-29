import stripe
import time
from typing import Dict, Any

from config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

# Stripe Checkout sessions default to 24h before they expire. For our
# Guild Master seat-cap design (30 seats, abandoned tabs hold a seat
# until our local 30-min TTL expires), 24h is way too long. Cap the
# session lifetime at Stripe's MINIMUM allowed (30 min) so abandoned
# checkouts release their seat as quickly as possible. The
# `checkout.session.expired` webhook fires the instant Stripe expires
# the session, letting our handler immediately drop the local
# INCOMPLETE row out of the cap counter — see the matching handler
# in routers/payments.py.
_CHECKOUT_SESSION_EXPIRY_SECONDS = 30 * 60  # 30 min — Stripe's minimum


def create_checkout_session(
    customer_id: str,
    price_id: str,
    success_url: str,
    cancel_url: str,
    metadata: Dict[str, str] = None,
    trial_period_days: int = None,
    idempotency_key: str = None,
) -> stripe.checkout.Session:
    """
    Creates a Stripe Checkout Session for a new subscription.

    If `trial_period_days` is set, Stripe collects the payment method upfront
    but charges $0 on day 0 and rolls into a regular paid billing cycle at the
    end of the trial window. Cancelling during the trial stops conversion.

    If `idempotency_key` is set, Stripe will return the cached response for
    a duplicate call with the same key (within Stripe's 24h dedup window).
    Lets the caller make the create call retry-safe under transient errors
    without minting two Checkout Sessions for one user click.

    `expires_at` is set to ~30 minutes from creation so abandoned tabs
    free their seat as fast as Stripe allows (30min is the API minimum).
    """
    subscription_data: Dict[str, Any] = {
        "metadata": metadata or {},
    }
    if trial_period_days:
        subscription_data["trial_period_days"] = trial_period_days
        # If the saved card fails at trial end, cancel the subscription cleanly
        # instead of carrying a delinquent state.
        subscription_data["trial_settings"] = {
            "end_behavior": {"missing_payment_method": "cancel"},
        }

    create_kwargs: Dict[str, Any] = {
        "customer": customer_id,
        "line_items": [{"price": price_id, "quantity": 1}],
        "mode": "subscription",
        "success_url": success_url,
        "cancel_url": cancel_url,
        "metadata": metadata or {},
        "subscription_data": subscription_data,
        "payment_method_collection": "always" if trial_period_days else "if_required",
        # Tight expiry so checkout.session.expired fires quickly on
        # abandoned tabs (matched by the webhook handler that releases
        # the local seat reservation).
        "expires_at": int(time.time()) + _CHECKOUT_SESSION_EXPIRY_SECONDS,
    }
    if idempotency_key:
        create_kwargs["idempotency_key"] = idempotency_key

    try:
        checkout_session = stripe.checkout.Session.create(**create_kwargs)
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