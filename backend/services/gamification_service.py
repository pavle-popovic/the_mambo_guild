import math
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional
from sqlalchemy.orm import Session
from models.user import UserProfile


def calculate_level(xp: int) -> int:
    """Calculate user level based on XP: Level = floor(sqrt(XP / 100))"""
    if xp <= 0:
        return 1
    return int(math.floor(math.sqrt(xp / 100)))


def update_streak(user_id: str, db: Session) -> Dict:
    """
    Update user streak based on last login date.
    Now includes streak freeze protection.
    
    Returns dict with:
        - streak_count: Current streak count
        - streak_saved: Whether a freeze was used to save the streak
        - save_method: Method used to save streak (if any)
        - message: User-friendly message
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return {
            "streak_count": 0,
            "streak_saved": False,
            "save_method": None,
            "message": "Profile not found"
        }

    today = datetime.now(timezone.utc).date()
    last_login = profile.last_login_date.date() if profile.last_login_date else None
    yesterday = (today - timedelta(days=1))

    streak_saved = False
    save_method = None
    message = ""

    if last_login is None:
        # First login
        profile.streak_count = 1
        message = "Welcome! Your streak has started."
    elif last_login == yesterday:
        # Consecutive day
        profile.streak_count += 1
        message = f"🔥 {profile.streak_count} day streak!"
    elif last_login == today:
        # Already logged in today
        message = f"🔥 {profile.streak_count} day streak!"
    elif last_login < yesterday:
        # Streak would be broken - try to save it with freezes
        from services.streak_service import (
            attempt_streak_save,
            check_and_reset_weekly_freeze
        )
        
        # First check/reset weekly freeze
        check_and_reset_weekly_freeze(user_id, db)
        
        # Attempt automatic save (weekly freebie or inventory freeze)
        result = attempt_streak_save(user_id, db)
        
        if result.saved:
            streak_saved = True
            save_method = result.method
            message = result.message
            # Keep streak intact (don't reset)
        else:
            # Streak is at risk - frontend should prompt for claves repair
            # For now, mark as needing repair
            message = result.message
            # Don't reset yet - let the frontend handle the repair prompt
            # If user doesn't repair, streak resets on next action

    profile.last_login_date = datetime.now(timezone.utc)
    db.flush()
    
    return {
        "streak_count": profile.streak_count,
        "streak_saved": streak_saved,
        "save_method": save_method,
        "message": message
    }


def update_streak_simple(user_id: str, db: Session) -> int:
    """
    Simple version that returns just the streak count.
    Used for backwards compatibility.
    """
    result = update_streak(user_id, db)
    return result["streak_count"]


def award_xp(user_id: str, xp_amount: int, db: Session) -> dict:
    """Award XP to user and return level up status."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return {"error": "Profile not found"}

    old_level = profile.level
    profile.xp += xp_amount
    new_level = calculate_level(profile.xp)
    profile.level = new_level

    leveled_up = new_level > old_level
    db.commit()

    return {
        "xp_gained": xp_amount,
        "new_total_xp": profile.xp,
        "leveled_up": leveled_up,
        "new_level": new_level
    }

