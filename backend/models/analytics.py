"""Append-only product analytics event log.

Single table `user_events` powers two workloads:

1. **Meta Conversions API (CAPI)** — conversion events (Lead, Purchase, …)
   are forwarded server-side to Meta for value-based ad bidding. The stored
   `event_id` is shared with the browser Pixel so Meta can dedupe.
2. **Churn / conversion ML** — every meaningful behavioural signal lands
   here so a data scientist can build a "first 7 days" feature vector per
   user once we have enough history.

Never mutate rows. This log is append-only by contract.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB

from models import Base


class UserEvent(Base):
    __tablename__ = "user_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Dedup key — the SAME string is sent to Meta from the browser Pixel and
    # from CAPI, so Meta can dedupe to a single counted conversion.
    event_id = Column(String, unique=True, index=True, nullable=False)

    # Nullable: pre-auth events (landing-page PageView, waitlist Lead) may not
    # have a user_id. Use `anonymous_id` to stitch them once the user signs up.
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True, nullable=True)
    anonymous_id = Column(String, index=True, nullable=True)

    event_name = Column(String, index=True, nullable=False)

    # Monetary value + currency (ISO 4217). Null for non-commercial events.
    value = Column(Numeric(10, 2), nullable=True)
    currency = Column(String(3), nullable=True)

    # Free-form event payload. Keep commonly-queried fields at the top level
    # of the dict (e.g. lesson_id, world_slug, tier) so JSONB indexing works.
    properties = Column(JSONB, nullable=False, default=dict)

    # Request context for Meta Advanced Matching + ML feature engineering.
    client_ip = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    fbp = Column(String, nullable=True)
    fbc = Column(String, nullable=True)
    page_url = Column(String, nullable=True)
    referrer = Column(String, nullable=True)

    # CAPI dispatch status. Null = not a conversion event / not yet forwarded.
    capi_sent_at = Column(DateTime(timezone=True), nullable=True)
    capi_status = Column(String, nullable=True)  # "ok" | "error" | "skipped"

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
        nullable=False,
    )

    __table_args__ = (
        # "Fetch all events for user X within first 7 days of signup" — the
        # core ML feature query.
        Index("ix_user_events_user_time", "user_id", "created_at"),
        # Cohort rollups: "how many Purchase events last week?"
        Index("ix_user_events_name_time", "event_name", "created_at"),
    )
