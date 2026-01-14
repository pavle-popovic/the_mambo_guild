"""
Clave Economy API Endpoints
/api/claves - Wallet, daily claims, balance checks
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models import get_db
from models.user import User
from dependencies import get_current_user
from services import clave_service
from schemas.community import WalletResponse, DailyClaimResponse, ClaveBalanceCheck

router = APIRouter(tags=["Claves"])


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
