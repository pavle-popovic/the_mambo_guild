"""
Clave Economy API Endpoints
/api/claves - Wallet, daily claims, balance checks, streak freezes
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from models import get_db
from models.user import User
from dependencies import get_current_user
from services import clave_service
from services import streak_service
from schemas.community import WalletResponse, DailyClaimResponse, ClaveBalanceCheck

router = APIRouter(tags=["Claves"])


# ============================================
# Pydantic Models for Streak Freezes
# ============================================

class FreezeStatusResponse(BaseModel):
    weekly_freebie_available: bool
    inventory_freezes: int
    claves_balance: int
    can_afford_freeze: bool
    freeze_cost: int
    next_weekly_reset: Optional[str]
    streak_count: int


class FreezeActionResponse(BaseModel):
    success: bool
    message: str
    inventory_freezes: int
    claves_balance: Optional[int] = None


class RepairStreakResponse(BaseModel):
    saved: bool
    method: Optional[str]
    message: str
    streak_count: int


@router.get("/wallet", response_model=WalletResponse)
async def get_wallet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's wallet state including balance and recent transactions.
    """
    wallet = clave_service.get_wallet(str(current_user.id), db)
    return WalletResponse(**wallet)


@router.post("/daily-claim", response_model=DailyClaimResponse)
async def claim_daily_claves(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Claim daily login claves. Can only be called once per day.
    Pro users earn more claves and get higher streak bonuses.
    """
    result = clave_service.process_daily_login(str(current_user.id), db)
    db.commit()
    
    return DailyClaimResponse(
        success=result.get("success", False),
        amount=result.get("amount", 0),
        new_balance=result.get("new_balance", 0),
        streak_bonus=result.get("streak_bonus"),
        message=result.get("message", "")
    )


@router.get("/balance-check/{amount}", response_model=ClaveBalanceCheck)
async def check_balance(
    amount: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if user can afford a specific amount.
    Useful for UI to show/hide action buttons.
    """
    can_afford, balance = clave_service.can_afford(str(current_user.id), amount, db)
    
    return ClaveBalanceCheck(
        can_afford=can_afford,
        current_balance=balance,
        required_amount=amount,
        shortfall=max(0, amount - balance)
    )


@router.get("/slot-status")
async def get_slot_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get video slot status (how many slots used vs limit).
    """
    return clave_service.get_video_slot_status(str(current_user.id), db)


# ============================================
# Streak Freeze Endpoints
# ============================================

@router.get("/freeze-status", response_model=FreezeStatusResponse)
async def get_freeze_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's streak freeze status.
    Includes weekly freebie availability, inventory freezes, and ability to afford more.
    """
    status = streak_service.get_freeze_status(str(current_user.id), db)
    return FreezeStatusResponse(**status)


@router.post("/buy-freeze", response_model=FreezeActionResponse)
async def buy_streak_freeze(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Buy a streak freeze for 10 claves.
    Adds to inventory for future use.
    """
    success, message, inventory_count = streak_service.buy_freeze(
        str(current_user.id), db
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    db.commit()
    
    # Get updated balance
    balance = clave_service.get_balance(str(current_user.id), db)
    
    return FreezeActionResponse(
        success=success,
        message=message,
        inventory_freezes=inventory_count,
        claves_balance=balance
    )


@router.post("/repair-streak", response_model=RepairStreakResponse)
async def repair_streak_with_claves(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Repair a broken streak by spending 10 claves.
    Use this when prompted after a missed day.
    """
    result = streak_service.repair_streak_with_claves(str(current_user.id), db)
    
    if not result.saved:
        raise HTTPException(status_code=400, detail=result.message)
    
    db.commit()
    
    return RepairStreakResponse(
        saved=result.saved,
        method=result.method,
        message=result.message,
        streak_count=result.streak_count
    )
