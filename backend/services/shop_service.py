"""
Guild Shop service.

Handles the full purchase lifecycle:
  * `list_items(...)`  — catalog view (tiered / active SKUs).
  * `list_inventory(...)` — what the user already owns.
  * `purchase(user_id, sku, db)` — atomic: stock lock, balance lock, grant.
  * `equip(user_id, sku, db)` — set equipped_border_sku / equipped_title_sku.

Stock race prevention: we `SELECT ... FOR UPDATE` the `shop_items` row
for any SKU that has a stock_total. Under Postgres's default isolation
this serialises concurrent purchases of the same scarce SKU without
needing advisory locks. We count live purchases under the same lock so
the count is guaranteed consistent with the decision.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional
import uuid

from sqlalchemy.orm import Session
from sqlalchemy import func

from models.shop import ShopItem, ShopPurchase
from models.community import ClaveTransaction
from models.user import UserProfile
from services import clave_service, tier_service

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Errors
# ---------------------------------------------------------------------------


class ShopError(Exception):
    code = "shop_error"
    http_status = 400

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class ItemNotFound(ShopError):
    code = "item_not_found"
    http_status = 404


class TierGated(ShopError):
    code = "tier_gated"
    http_status = 403


class InsufficientClaves(ShopError):
    code = "insufficient_claves"
    http_status = 402


class AlreadyOwned(ShopError):
    code = "already_owned"
    http_status = 409


class MaxPerUserReached(ShopError):
    code = "max_per_user_reached"
    http_status = 409


class OutOfStock(ShopError):
    code = "out_of_stock"
    http_status = 409


class NotOwned(ShopError):
    code = "not_owned"
    http_status = 403


# ---------------------------------------------------------------------------
# Stock period keys
# ---------------------------------------------------------------------------


def _stock_period_key(item: ShopItem, when: Optional[datetime] = None) -> Optional[str]:
    """Map a stock_period enum to a string bucket (e.g. '2026-04')."""
    if not item.stock_period:
        return None
    now = when or datetime.now(timezone.utc)
    if item.stock_period == "monthly":
        return now.strftime("%Y-%m")
    if item.stock_period == "lifetime":
        return "lifetime"
    return None


# ---------------------------------------------------------------------------
# Catalog listings
# ---------------------------------------------------------------------------


def list_items(db: Session, kind: Optional[str] = None) -> list[dict]:
    q = db.query(ShopItem).filter(ShopItem.is_active == True)  # noqa: E712
    if kind:
        q = q.filter(ShopItem.kind == kind)
    items = q.order_by(ShopItem.sort_order.asc(), ShopItem.sku.asc()).all()

    # Compute remaining stock per item (if any has stock_total).
    result: list[dict] = []
    for item in items:
        period_key = _stock_period_key(item)
        remaining: Optional[int] = None
        if item.stock_total is not None:
            used = _count_purchases_for_stock(db, item, period_key)
            remaining = max(0, item.stock_total - used)
        result.append(_serialize_item(item, remaining=remaining))
    return result


def _serialize_item(item: ShopItem, remaining: Optional[int] = None) -> dict:
    return {
        "sku": item.sku,
        "kind": item.kind,
        "name": item.name,
        "description": item.description,
        "price_claves": item.price_claves,
        "rarity": item.rarity,
        "tier_required": item.tier_required,
        "stock_total": item.stock_total,
        "stock_period": item.stock_period,
        "max_per_user": item.max_per_user,
        "remaining_stock": remaining,
        "grants": item.grants or {},
        "metadata": item.metadata_json or {},
        "sort_order": item.sort_order,
    }


def _count_purchases_for_stock(db: Session, item: ShopItem, period_key: Optional[str]) -> int:
    q = db.query(func.count(ShopPurchase.id)).filter(
        ShopPurchase.sku == item.sku,
        ShopPurchase.status == "fulfilled",
    )
    if period_key:
        q = q.filter(ShopPurchase.stock_period_key == period_key)
    return int(q.scalar() or 0)


def _count_user_owned(db: Session, user_id: str, sku: str) -> int:
    return int(
        db.query(func.count(ShopPurchase.id))
        .filter(
            ShopPurchase.user_id == user_id,
            ShopPurchase.sku == sku,
            ShopPurchase.status == "fulfilled",
        )
        .scalar()
        or 0
    )


def list_inventory(db: Session, user_id: str) -> list[dict]:
    """Every fulfilled purchase for this user, grouped by SKU."""
    purchases = (
        db.query(ShopPurchase, ShopItem)
        .join(ShopItem, ShopItem.sku == ShopPurchase.sku)
        .filter(
            ShopPurchase.user_id == user_id,
            ShopPurchase.status == "fulfilled",
        )
        .order_by(ShopPurchase.created_at.desc())
        .all()
    )

    by_sku: dict[str, dict] = {}
    for purchase, item in purchases:
        entry = by_sku.setdefault(item.sku, {
            **_serialize_item(item),
            "owned_count": 0,
            "first_purchased_at": purchase.created_at,
        })
        entry["owned_count"] += 1
        # keep the earliest purchase
        if purchase.created_at < entry["first_purchased_at"]:
            entry["first_purchased_at"] = purchase.created_at

    # Annotate equipped state
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    equipped_border = profile.equipped_border_sku if profile else None
    equipped_title = profile.equipped_title_sku if profile else None
    for entry in by_sku.values():
        entry["is_equipped"] = entry["sku"] in (equipped_border, equipped_title)

    return list(by_sku.values())


# ---------------------------------------------------------------------------
# Purchase
# ---------------------------------------------------------------------------


def purchase(user_id: str, sku: str, db: Session) -> dict:
    """Atomically buy one unit of `sku` for `user_id`.

    Raises a ShopError subclass for any gate failure. On success, returns
    a dict with the new balance + the ShopPurchase row.
    """
    # Load and lock the catalog row if the SKU has stock. For unlimited
    # SKUs we still lock (very cheap) so the serialization semantics are
    # uniform and max_per_user cannot race either.
    item = (
        db.query(ShopItem)
        .filter(ShopItem.sku == sku, ShopItem.is_active == True)  # noqa: E712
        .with_for_update()
        .first()
    )
    if not item:
        raise ItemNotFound("Item not available")

    # Tier gate (unlocked: None means "open to all").
    if not tier_service.require_tier_at_least(user_id, item.tier_required, db):
        raise TierGated(
            f"This item is for {item.tier_required.title() if item.tier_required else ''} members and above."
        )

    # Cosmetics / singletons: block re-purchasing once owned.
    # (For true cosmetics we want owning = 1; if max_per_user==1 and they own it, bail.)
    owned_count = _count_user_owned(db, user_id, sku)
    if item.max_per_user is not None and owned_count >= item.max_per_user:
        if item.max_per_user == 1:
            raise AlreadyOwned("You already own this item.")
        raise MaxPerUserReached(f"You've reached the max of {item.max_per_user} for this item.")

    # Stock check (in the lock).
    period_key = _stock_period_key(item)
    if item.stock_total is not None:
        used = _count_purchases_for_stock(db, item, period_key)
        if used >= item.stock_total:
            raise OutOfStock("This item is sold out right now. Try again later.")

    # Pay. spend_claves() locks user_profiles too, so we hold both rows briefly.
    success, new_balance = clave_service.spend_claves(
        user_id=user_id,
        amount=item.price_claves,
        reason=f"shop_purchase:{sku}",
        db=db,
        reference_id=None,
    )
    if not success:
        raise InsufficientClaves(
            f"Not enough claves. You need {item.price_claves} 🥢 (have {new_balance})."
        )

    # Find the txn we just wrote so we can link it to the purchase row.
    txn = (
        db.query(ClaveTransaction)
        .filter(
            ClaveTransaction.user_id == user_id,
            ClaveTransaction.reason == f"shop_purchase:{sku}",
        )
        .order_by(ClaveTransaction.created_at.desc())
        .first()
    )

    purchase_row = ShopPurchase(
        id=uuid.uuid4(),
        user_id=user_id,
        sku=sku,
        price_paid=item.price_claves,
        clave_txn_id=txn.id if txn else None,
        status="fulfilled",
        fulfillment_id=None,  # set by callers that fulfil (e.g. golden ticket)
        stock_period_key=period_key,
    )
    db.add(purchase_row)

    # Apply immediate grants.
    _apply_grants(db, user_id, item)

    db.flush()

    logger.info(
        "shop.purchase user=%s sku=%s price=%s new_balance=%s period_key=%s",
        user_id, sku, item.price_claves, new_balance, period_key,
    )

    return {
        "purchase_id": str(purchase_row.id),
        "sku": sku,
        "price_paid": item.price_claves,
        "new_balance": new_balance,
        "grants": item.grants or {},
        "fulfillment_id": None,
        "item": _serialize_item(item),
    }


def _apply_grants(db: Session, user_id: str, item: ShopItem) -> None:
    """For utility SKUs, bump the user's bonus-slots counters on UserProfile."""
    grants = item.grants or {}
    if item.kind != "utility":
        return
    bonus_videos = int(grants.get("bonus_video_slots", 0) or 0)
    bonus_questions = int(grants.get("bonus_question_slots", 0) or 0)
    if bonus_videos == 0 and bonus_questions == 0:
        return

    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == user_id)
        .with_for_update()
        .first()
    )
    if not profile:
        return
    if bonus_videos:
        profile.bonus_video_slots = (profile.bonus_video_slots or 0) + bonus_videos
    if bonus_questions:
        profile.bonus_question_slots = (profile.bonus_question_slots or 0) + bonus_questions


# ---------------------------------------------------------------------------
# Equip / unequip cosmetics
# ---------------------------------------------------------------------------


def equip(user_id: str, sku: Optional[str], db: Session, slot: str) -> dict:
    """Equip (or, if sku is None, unequip) a cosmetic into the given slot.

    `slot` must be 'border' or 'title'. Enforces ownership if sku is set.
    """
    if slot not in ("border", "title"):
        raise ShopError("Unknown slot")

    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == user_id)
        .with_for_update()
        .first()
    )
    if not profile:
        raise ShopError("Profile not found")

    if sku:
        item = db.query(ShopItem).filter(ShopItem.sku == sku).first()
        if not item:
            raise ItemNotFound("Item not found")
        if item.kind != slot:
            raise ShopError(f"This item cannot be equipped in the {slot} slot.")
        if _count_user_owned(db, user_id, sku) <= 0:
            raise NotOwned("You don't own this item yet.")

    if slot == "border":
        profile.equipped_border_sku = sku
    else:
        profile.equipped_title_sku = sku

    db.flush()
    return {
        "slot": slot,
        "equipped_sku": sku,
        "equipped_border_sku": profile.equipped_border_sku,
        "equipped_title_sku": profile.equipped_title_sku,
    }


# ---------------------------------------------------------------------------
# Fulfilment helpers
# ---------------------------------------------------------------------------


def mark_fulfilled(purchase_id: str, fulfillment_id: str, db: Session) -> None:
    """Link a ShopPurchase to its downstream fulfilment row id (e.g. a
    coaching_submissions.id). Called by the premium router after the
    CoachingSubmission is inserted."""
    purchase = db.query(ShopPurchase).filter(ShopPurchase.id == purchase_id).first()
    if not purchase:
        return
    purchase.fulfillment_id = uuid.UUID(fulfillment_id) if isinstance(fulfillment_id, str) else fulfillment_id
    db.flush()
