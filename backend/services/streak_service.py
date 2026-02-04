"""
Streak Freeze Service - Handles streak protection with weekly freebies and claves economy.
"""
import logging
from datetime import datetime, date, timedelta, timezone
from typing import Optional, Tuple, Dict
from sqlalchemy.orm import Session

from models.user import UserProfile
from services.clave_service import spend_claves, earn_claves, get_balance

logger = logging.getLogger(__name__)

# Constants
FREEZE_COST_CLAVES = 10
WEEKLY_RESET_DAY = 0  # Monday = 0, Sunday = 6


class StreakFreezeResult:
    """Result of a streak freeze attempt."""
    def __init__(
        self,
        saved: bool,
        method: Optional[str] = None,
        message: str = "",
        streak_count: int = 0
    ):
        self.saved = saved
        self.method = method  # "weekly_freebie", "inventory_freeze", "claves_purchase", None
        self.message = message
        self.streak_count = streak_count


def _get_monday_of_week(d: date) -> date:
    """Get the Monday of the week containing the given date."""
    return d - timedelta(days=d.weekday())


def check_and_reset_weekly_freeze(user_id: str, db: Session) -> bool:
    """
    Check if weekly freeze should be reset (every Monday).
    Returns True if reset was performed.
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return False
    
    today = date.today()
    this_monday = _get_monday_of_week(today)
    
    # If we haven't reset this week yet (or never reset before)
    if profile.last_freeze_reset_date is None or profile.last_freeze_reset_date < this_monday:
        profile.weekly_free_freeze_used = False
        profile.last_freeze_reset_date = this_monday
        db.flush()
        logger.info(f"Weekly freeze reset for user {user_id}")
        return True
    
    return False


def get_freeze_status(user_id: str, db: Session) -> Dict:
    """
    Get the user's current streak freeze status.
    
    Returns:
        Dict with freeze status info
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return {
            "weekly_freebie_available": False,
            "inventory_freezes": 0,
            "claves_balance": 0,
            "can_afford_freeze": False,
            "freeze_cost": FREEZE_COST_CLAVES,
            "next_weekly_reset": None
        }
    
    # Check and reset weekly freeze if needed
    check_and_reset_weekly_freeze(user_id, db)
    
    today = date.today()
    next_monday = _get_monday_of_week(today) + timedelta(days=7)
    
    claves_balance = profile.current_claves
    
    return {
        "weekly_freebie_available": not profile.weekly_free_freeze_used,
        "inventory_freezes": profile.inventory_freezes,
        "claves_balance": claves_balance,
        "can_afford_freeze": claves_balance >= FREEZE_COST_CLAVES,
        "freeze_cost": FREEZE_COST_CLAVES,
        "next_weekly_reset": next_monday.isoformat(),
        "streak_count": profile.streak_count
    }


def attempt_streak_save(user_id: str, db: Session) -> StreakFreezeResult:
    """
    Attempt to save a broken streak using available freeze methods.
    Priority: 1) Weekly Freebie, 2) Inventory Freeze, 3) Auto-buy with Claves
    
    Returns:
        StreakFreezeResult with outcome details
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return StreakFreezeResult(
            saved=False,
            message="Profile not found"
        )
    
    # Check and reset weekly freeze if needed
    check_and_reset_weekly_freeze(user_id, db)
    
    # Method 1: Weekly Freebie
    if not profile.weekly_free_freeze_used:
        profile.weekly_free_freeze_used = True
        db.flush()
        logger.info(f"User {user_id} streak saved by weekly freebie")
        return StreakFreezeResult(
            saved=True,
            method="weekly_freebie",
            message="🎉 Saved by your Weekly Freebie! Your streak lives on.",
            streak_count=profile.streak_count
        )
    
    # Method 2: Inventory Freeze
    if profile.inventory_freezes > 0:
        profile.inventory_freezes -= 1
        db.flush()
        logger.info(f"User {user_id} streak saved by inventory freeze. {profile.inventory_freezes} remaining.")
        return StreakFreezeResult(
            saved=True,
            method="inventory_freeze",
            message=f"❄️ Saved by a Premium Freeze! You have {profile.inventory_freezes} freezes left.",
            streak_count=profile.streak_count
        )
    
    # Method 3: Auto-buy not performed automatically (user must confirm)
    # Return status so frontend can prompt user
    can_afford = profile.current_claves >= FREEZE_COST_CLAVES
    
    if can_afford:
        return StreakFreezeResult(
            saved=False,
            method=None,
            message=f"⚠️ Streak at risk! Repair it for {FREEZE_COST_CLAVES} 🥢?",
            streak_count=profile.streak_count
        )
    else:
        return StreakFreezeResult(
            saved=False,
            method=None,
            message=f"💔 Streak broken! You need {FREEZE_COST_CLAVES} 🥢 to repair it but only have {profile.current_claves}.",
            streak_count=0  # Streak will be reset
        )


def repair_streak_with_claves(user_id: str, db: Session) -> StreakFreezeResult:
    """
    User-initiated repair of streak using claves.
    Called when user confirms they want to spend claves.
    
    Returns:
        StreakFreezeResult with outcome details
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return StreakFreezeResult(
            saved=False,
            message="Profile not found"
        )
    
    # Check balance and spend
    success, new_balance = spend_claves(
        user_id,
        FREEZE_COST_CLAVES,
        "streak_repair",
        db
    )
    
    if success:
        logger.info(f"User {user_id} repaired streak with {FREEZE_COST_CLAVES} claves")
        return StreakFreezeResult(
            saved=True,
            method="claves_purchase",
            message=f"✅ Streak repaired! (-{FREEZE_COST_CLAVES} 🥢)",
            streak_count=profile.streak_count
        )
    else:
        return StreakFreezeResult(
            saved=False,
            method=None,
            message=f"❌ Not enough claves. You have {new_balance} 🥢 but need {FREEZE_COST_CLAVES}.",
            streak_count=0
        )


def buy_freeze(user_id: str, db: Session) -> Tuple[bool, str, int]:
    """
    Buy a streak freeze to add to inventory.
    
    Returns:
        Tuple of (success, message, new_inventory_count)
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return (False, "Profile not found", 0)
    
    # Check balance and spend
    success, new_balance = spend_claves(
        user_id,
        FREEZE_COST_CLAVES,
        "freeze_purchase",
        db
    )
    
    if success:
        profile.inventory_freezes += 1
        db.flush()
        logger.info(f"User {user_id} bought a freeze. Inventory: {profile.inventory_freezes}")
        return (
            True,
            f"❄️ Freeze purchased! You now have {profile.inventory_freezes} in inventory.",
            profile.inventory_freezes
        )
    else:
        return (
            False,
            f"❌ Not enough claves. You have {new_balance} 🥢 but need {FREEZE_COST_CLAVES}.",
            profile.inventory_freezes
        )


def reset_streak(user_id: str, db: Session) -> int:
    """
    Reset user's streak to 0 (called when streak is lost).
    
    Returns:
        New streak count (0)
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return 0
    
    old_streak = profile.streak_count
    profile.streak_count = 0
    db.flush()
    
    logger.info(f"User {user_id} streak reset from {old_streak} to 0")
    return 0
