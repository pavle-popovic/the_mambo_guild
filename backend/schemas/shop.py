"""
Pydantic schemas for The Guild Shop.
"""
from __future__ import annotations

from typing import Optional, Literal, Any
from datetime import datetime

from pydantic import BaseModel, Field


class ShopItemOut(BaseModel):
    sku: str
    kind: str
    name: str
    description: Optional[str] = None
    price_claves: int
    rarity: Optional[str] = None
    tier_required: Optional[str] = None
    stock_total: Optional[int] = None
    stock_period: Optional[str] = None
    max_per_user: Optional[int] = None
    remaining_stock: Optional[int] = None
    grants: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)
    sort_order: int = 0


class InventoryItemOut(ShopItemOut):
    owned_count: int = 1
    is_equipped: bool = False
    first_purchased_at: Optional[datetime] = None


class PurchaseRequest(BaseModel):
    sku: str


class PurchaseResponse(BaseModel):
    purchase_id: str
    sku: str
    price_paid: int
    new_balance: int
    grants: dict[str, Any] = Field(default_factory=dict)
    fulfillment_id: Optional[str] = None
    item: ShopItemOut


class EquipRequest(BaseModel):
    slot: Literal["border", "title"]
    sku: Optional[str] = None  # null = unequip


class EquipResponse(BaseModel):
    slot: str
    equipped_sku: Optional[str]
    equipped_border_sku: Optional[str]
    equipped_title_sku: Optional[str]


class ShopError(BaseModel):
    code: str
    message: str
