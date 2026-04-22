"""
Shop models — The Guild Shop.

`ShopItem` is the catalog row (price, rarity, stock rules, grants payload).
`ShopPurchase` is the audit log of what a user bought, the price they paid,
and the fulfilment pointer (e.g. coaching_submissions.id for Golden Tickets).
"""
from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from models import Base


class ShopItem(Base):
    __tablename__ = "shop_items"

    sku = Column(String(64), primary_key=True)
    kind = Column(String(20), nullable=False)  # 'ticket' | 'border' | 'title' | 'utility'
    name = Column(String(120), nullable=False)
    description = Column(String, nullable=True)
    price_claves = Column(Integer, nullable=False)
    rarity = Column(String(20), nullable=True)          # 'common' | 'rare' | 'epic' | 'legendary'
    tier_required = Column(String(20), nullable=True)   # None | 'advanced' | 'performer'
    stock_total = Column(Integer, nullable=True)
    stock_period = Column(String(20), nullable=True)    # None | 'monthly' | 'lifetime'
    max_per_user = Column(Integer, nullable=True)
    grants = Column(JSONB, nullable=False, default=dict)
    metadata_json = Column("metadata", JSONB, nullable=False, default=dict)
    is_active = Column(Boolean, nullable=False, default=True)
    sort_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint("price_claves >= 0", name="ck_shop_items_price_nonneg"),
        Index("idx_shop_items_kind_active", "kind", "is_active", "sort_order"),
    )


class ShopPurchase(Base):
    __tablename__ = "shop_purchases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    sku = Column(String(64), ForeignKey("shop_items.sku"), nullable=False)
    price_paid = Column(Integer, nullable=False)
    clave_txn_id = Column(UUID(as_uuid=True), ForeignKey("clave_transactions.id"), nullable=True)
    status = Column(String(20), nullable=False, default="fulfilled")  # 'fulfilled' | 'refunded' | 'pending'
    fulfillment_id = Column(UUID(as_uuid=True), nullable=True)
    stock_period_key = Column(String(20), nullable=True)  # '2026-04' for monthly-scoped stock
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    refunded_at = Column(DateTime(timezone=True), nullable=True)

    item = relationship("ShopItem")
    user = relationship("User", backref="shop_purchases")

    __table_args__ = (
        Index("idx_shop_purchases_user", "user_id", "created_at"),
        # Partial index on (sku, stock_period_key) WHERE status='fulfilled' is
        # created in migration 020. Not re-declared here because SQLAlchemy's
        # declarative `Index(postgresql_where=...)` needs a Column ref, and
        # we don't use create_all() for this project anyway.
    )
