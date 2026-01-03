import math
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models.user import UserProfile


def calculate_level(xp: int) -> int:
    """Calculate user level based on XP: Level = floor(sqrt(XP / 100))"""
    if xp <= 0:
        return 1
    return int(math.floor(math.sqrt(xp / 100)))


def update_streak(user_id: str, db: Session) -> int:
    """Update user streak based on last login date. Returns new streak count."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return 0

    today = datetime.utcnow().date()
    last_login = profile.last_login_date.date() if profile.last_login_date else None
    yesterday = (today - timedelta(days=1))

    if last_login is None:
        # First login
        profile.streak_count = 1
    elif last_login == yesterday:
        # Consecutive day
        profile.streak_count += 1
    elif last_login < yesterday:
        # Streak broken
        profile.streak_count = 1
    # If last_login == today, streak stays the same

    profile.last_login_date = datetime.utcnow()
    db.commit()
    return profile.streak_count


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

