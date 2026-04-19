"""Payment / webhook / audit models.

- StripeWebhookEvent: idempotency guard so Stripe webhook retries don't
  double-apply XP/clave bonuses (P1.2).
- MuxWebhookEvent: idempotency guard so Mux webhook retries don't
  double-update lesson/course/post playback IDs.
- XPAuditLog: audit trail for every XP grant, especially manual admin
  grants, so disputes can be investigated (P1.3).
"""
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
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
