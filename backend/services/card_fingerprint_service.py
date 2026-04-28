"""
Card-fingerprint trial-abuse defense.

Closes the same-card-different-email loophole called out in
routers.payments._email_has_prior_stripe_subscription. The existing
guards block:

  - Disposable / throwaway email domains  (services/email_validation)
  - Email + alias-normalized email already known to Stripe   (Stripe lookup)
  - Sub-second concurrent checkouts on one user              (advisory lock)

But none of them detect "fresh email, fresh Stripe customer, SAME
physical credit card." That's what this module catches.

Flow on every customer.subscription.created webhook in TRIALING state:

  1. Pull the subscription's payment method (default_payment_method,
     falling back to the latest invoice's payment_intent).
  2. Read its card.fingerprint — Stripe issues the SAME fingerprint to
     the same physical card across customers and accounts.
  3. If the table already has this fingerprint under a DIFFERENT
     user_id → abusive reuse. Collapse the trial to trial_end="now",
     proration_behavior="none". Stripe immediately invoices the user
     at the regular rate; if the card declines, the sub goes
     past_due and the existing webhook chain drops them to ROOKIE.
     Either way, no extra free month is extracted.
  4. Insert (fingerprint, user_id) so future webhooks see this card
     has been used. Idempotent via the table's unique constraint.

Fail-open semantics: any Stripe / DB exception is logged and we let
the trial continue. A bug in this module must NEVER block a real
trial — fraud loss on this path is a couple of dollars; UX loss for
real users would be unbounded.

We also do NOT touch the subscription if the SAME user is re-trialing
on the same card. The has_used_trial flag on UserProfile already
prevents that at checkout creation; the per-(fingerprint, user)
uniqueness here just means the row stays as-is.
"""
import logging
import uuid
from typing import Optional

import stripe
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.payment import PaymentCardFingerprint

logger = logging.getLogger(__name__)


def _extract_card_fingerprint(stripe_sub_id: str) -> tuple[Optional[str], Optional[str]]:
    """
    Returns (fingerprint, payment_method_id) for the subscription, or
    (None, None) if no card-backed payment method is attached.

    Robust to Stripe API shape changes:
      - default_payment_method may be set directly on the subscription
      - latest_invoice.payment_intent.payment_method may be the path
        used by Checkout-created subs before any default is set
      - Either field can be a string ID or an expanded dict
    """
    try:
        sub = stripe.Subscription.retrieve(
            stripe_sub_id,
            expand=[
                "default_payment_method",
                "latest_invoice.payment_intent.payment_method",
            ],
        )
    except stripe.error.StripeError:
        logger.exception(
            "card_fingerprint: Stripe.retrieve failed for sub %s", stripe_sub_id
        )
        return None, None

    pm = sub.get("default_payment_method")
    if not pm or isinstance(pm, str):
        invoice = sub.get("latest_invoice") or {}
        pi = invoice.get("payment_intent") if isinstance(invoice, dict) else None
        if isinstance(pi, dict):
            pm = pi.get("payment_method")

    if not isinstance(pm, dict):
        # No expanded payment method available — give up gracefully.
        return None, None

    card = pm.get("card")
    if not isinstance(card, dict):
        return None, None

    fingerprint = card.get("fingerprint")
    pm_id = pm.get("id")
    if not fingerprint:
        return None, pm_id
    return str(fingerprint), pm_id


def check_and_record_trial_card(
    stripe_sub_id: str, user_id, db: Session
) -> bool:
    """
    Returns True iff the trial was collapsed (cross-user fingerprint
    reuse detected and trial_end set to now). Returns False on the
    happy path (no prior reuse, fingerprint recorded) or on any
    fail-open path (no fingerprint extractable, Stripe error, etc.).

    The caller MUST tolerate a True return — the surrounding webhook
    handler should continue processing. We don't raise on Stripe-side
    failures; abuse defense is best-effort and non-blocking.
    """
    fingerprint, pm_id = _extract_card_fingerprint(stripe_sub_id)
    if not fingerprint:
        # No card / no fingerprint available — nothing to dedup on.
        # Common for promo / 100%-off coupons where Stripe doesn't
        # require a card to start the trial.
        return False

    # Cross-user reuse check. We allow re-use under the same user_id
    # (legitimate re-subscribe after cancel) — only a *different*
    # user_id holding the same fingerprint is abuse.
    other_user_row = (
        db.query(PaymentCardFingerprint)
        .filter(
            PaymentCardFingerprint.fingerprint == fingerprint,
            PaymentCardFingerprint.user_id != user_id,
        )
        .first()
    )

    if other_user_row is not None:
        logger.warning(
            "card_fingerprint: reuse detected — fingerprint %s previously "
            "used by user %s, now attempted by user %s on sub %s. "
            "Collapsing trial.",
            fingerprint,
            other_user_row.user_id,
            user_id,
            stripe_sub_id,
        )
        try:
            stripe.Subscription.modify(
                stripe_sub_id,
                trial_end="now",
                proration_behavior="none",
            )
        except stripe.error.StripeError:
            # Trial collapse failed — log and move on. The fingerprint
            # row is still recorded below so we have audit trail.
            logger.exception(
                "card_fingerprint: trial-collapse Stripe.modify failed for sub %s",
                stripe_sub_id,
            )
        # Still record this attempt — distinguishes "blocked at first
        # reuse" from "blocked again on retries" if we ever audit.
        _insert_fingerprint_row(fingerprint, user_id, pm_id, db)
        return True

    # Happy path: first time we see this card for this user. Record it
    # so the NEXT trial attempt with the same card under any other
    # account triggers the block.
    _insert_fingerprint_row(fingerprint, user_id, pm_id, db)
    return False


def _insert_fingerprint_row(
    fingerprint: str, user_id, pm_id: Optional[str], db: Session
) -> None:
    """Idempotent insert keyed on (fingerprint, user_id)."""
    try:
        existing = (
            db.query(PaymentCardFingerprint)
            .filter(
                PaymentCardFingerprint.fingerprint == fingerprint,
                PaymentCardFingerprint.user_id == user_id,
            )
            .first()
        )
        if existing is not None:
            return
        row = PaymentCardFingerprint(
            id=uuid.uuid4(),
            fingerprint=fingerprint,
            user_id=user_id,
            stripe_payment_method_id=pm_id,
        )
        db.add(row)
        db.flush()
    except IntegrityError:
        # Concurrent webhook delivery raced us to insert the same row.
        # Treat as success — uniqueness constraint did its job.
        db.rollback()
    except Exception:
        logger.exception(
            "card_fingerprint: failed to record fingerprint %s for user %s "
            "(non-fatal)",
            fingerprint,
            user_id,
        )
        db.rollback()
