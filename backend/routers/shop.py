"""
Shop API endpoints.

/api/shop/items       GET   — list catalog items (optional ?kind=)
/api/shop/inventory   GET   — list items the current user owns
/api/shop/purchase    POST  — buy a SKU (cosmetic / utility / ticket)
/api/shop/equip       POST  — equip/unequip a cosmetic into a slot
"""
from __future__ import annotations

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models import get_db
from models.user import User
from dependencies import get_current_user
from services import shop_service
from schemas.shop import (
    ShopItemOut,
    InventoryItemOut,
    PurchaseRequest,
    PurchaseResponse,
    EquipRequest,
    EquipResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/shop", tags=["Shop"])


def _shop_error_to_http(exc: shop_service.ShopError) -> HTTPException:
    return HTTPException(
        status_code=exc.http_status,
        detail={"code": exc.code, "message": exc.message},
    )


@router.get("/items", response_model=list[ShopItemOut])
def list_items(
    kind: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Browse the active catalog. Kind filter: 'ticket'|'border'|'title'|'utility'."""
    return shop_service.list_items(db, kind=kind)


@router.get("/inventory", response_model=list[InventoryItemOut])
def list_inventory(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return shop_service.list_inventory(db, str(current_user.id))


@router.post("/purchase", response_model=PurchaseResponse)
def purchase_item(
    body: PurchaseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        result = shop_service.purchase(str(current_user.id), body.sku, db)
    except shop_service.ShopError as exc:
        db.rollback()
        raise _shop_error_to_http(exc)

    db.commit()
    return result


@router.post("/equip", response_model=EquipResponse)
def equip_item(
    body: EquipRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        result = shop_service.equip(
            user_id=str(current_user.id),
            sku=body.sku,
            db=db,
            slot=body.slot,
        )
    except shop_service.ShopError as exc:
        db.rollback()
        raise _shop_error_to_http(exc)

    db.commit()
    return result
