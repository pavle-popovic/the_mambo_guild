"""Payment / webhook / audit models.

- StripeWebhookEvent: idempotency guard so Stripe webhook retries don't
  double-apply XP/clave bonuses (P1.2).
- MuxWebhookEvent: idempotency guard so Mux webhook retries don't
  double-update lesson/course/post playback IDs.
- XPAuditLog: audit trail for every XP grant, especially manual admin
  grants, so disputes can be investigated (P1.3).
- PaymentCardFingerprint: trial-abuse defense. Records the Stripe card
  fingerprint of every payment method that has activated a free trial,
  so the same card can't farm trials across different email accounts.
"""
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID

from models import Base


class StripeWebhookEvent(Base):
    __tablename__ = "stripe_webhook_events"

    # Stripe event IDs are globally unique (evt_xxx) — use as PK directly.
    event_id = Column(String, primary_key=True)
    event_type = Column(String, nullable=False, index=True)
    processed_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


class MuxWebhookEvent(Base):
    __tablename__ = "mux_webhook_events"

    # Mux delivers a unique `id` per webhook event; retries re-use the same id.
    event_id = Column(String, primary_key=True)
    event_type = Column(String, nullable=False, index=True)
    processed_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


class XPAuditLog(Base):
    __tablename__ = "xp_audit_log"

    id = Column(UUID(as_uuid=True), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    delta = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)  # e.g. "lesson_complete", "admin_grant", "subscription_bonus"
    actor_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)  # None for system grants
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )


class PaymentCardFingerprint(Base):
    """
    One row per (Stripe card fingerprint, user) pair that has been used
    to activate a free trial. The card_fingerprint_service consults this
    table on every customer.subscription.created webhook with a trialing
    status: if the same fingerprint already exists for a *different*
    user, the new trial is collapsed (trial_end='now') so the abuser
    pays full price immediately or their card is declined — either way
    no extra trial value is extracted.

    Why we record per-user (not just per-fingerprint): a single user
    legitimately re-subscribing on the same card after a cancellation
    must not be blocked. The dedup is keyed on cross-user reuse only.
    """
    __tablename__ = "payment_card_fingerprints"

    id = Column(UUID(as_uuid=True), primary_key=True)
    # Stripe-issued card fingerprint (sha-1-style, 40 chars in practice).
    # Same physical card → same fingerprint across accounts/customers.
    fingerprint = Column(String(64), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    # The pm_xxx ID we extracted the fingerprint from. Useful for audit
    # ("which card on which account first triggered this fingerprint?").
    stripe_payment_method_id = Column(String(64), nullable=True)
    first_used_for_trial_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        # Per-(fingerprint, user) uniqueness — re-running the webhook
        # for the same trial is a no-op insert.
        UniqueConstraint("fingerprint", "user_id", name="uq_pcf_fingerprint_user"),
        # Hot path is "lookup by fingerprint to see if anyone else used it".
        Index("idx_pcf_fingerprint", "fingerprint"),
    )
