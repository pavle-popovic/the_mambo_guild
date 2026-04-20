import math
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional
from sqlalchemy.orm import Session
from models.user import UserProfile
from models.payment import XPAuditLog
from utils.time import user_local_today, user_local_now


def calculate_level(xp: int) -> int:
    """Calculate user level based on XP: Level = max(1, floor(sqrt(XP / 100)))"""
    if xp <= 0:
        return 1
    return max(1, int(math.floor(math.sqrt(xp / 100))))


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

    # Compute 'today' in the user's local timezone so a user in UTC-8 doesn't
    # lose their streak at 4pm local time when the server rolls to UTC midnight.
    today = user_local_today(profile)
    # Convert stored UTC last_login to the user's local date for a like-for-like compare.
    last_login = None
    if profile.last_login_date:
        last_login_utc = profile.last_login_date
        if last_login_utc.tzinfo is None:
            last_login_utc = last_login_utc.replace(tzinfo=timezone.utc)
        local_now = user_local_now(profile)
        last_login = last_login_utc.astimezone(local_now.tzinfo).date()
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
            message = result.message
            if result.streak_count == 0:
                # User can't afford repair - reset streak immediately
                profile.streak_count = 0

    profile.last_login_date = datetime.now(timezone.utc)
    db.flush()

    # Check streak badges after updating streak
    from services.badge_service import check_streak_badges
    check_streak_badges(user_id, profile.streak_count, db)

    # ML feature: streak milestone crossings are a strong retention signal.
    if profile.streak_count in {7, 30, 100, 365}:
        try:
            from services.analytics_service import track_event
            track_event(
                db=db,
                event_name="StreakMilestone",
                user_id=profile.user_id,
                properties={"days": profile.streak_count},
            )
        except Exception:
            import logging
            logging.getLogger(__name__).exception("update_streak: milestone track failed")

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


MAX_XP_PER_AWARD = 500  # Maximum XP that can be awarded in a single action
ADMIN_MAX_XP_PER_AWARD = 100_000  # Admin manual grants have a higher ceiling


def award_xp(
    user_id: str,
    xp_amount: int,
    db: Session,
    *,
    reason: str = "lesson_complete",
    actor_user_id: Optional[str] = None,
    allow_admin_ceiling: bool = False,
) -> dict:
    """Award XP atomically and return level up status.

    Race-safe: locks the user's profile row with SELECT ... FOR UPDATE so
    concurrent XP grants (lesson complete + admin grant + subscription bonus
    landing in the same tick) cannot lose writes via read-modify-write.

    Also writes an XPAuditLog entry for every grant so disputes can be
    traced. `reason` is free-form (`"lesson_complete"`, `"admin_grant"`,
    `"subscription_bonus"`, etc.); `actor_user_id` is only set for manual
    admin grants.
    """
    ceiling = ADMIN_MAX_XP_PER_AWARD if allow_admin_ceiling else MAX_XP_PER_AWARD
    if xp_amount <= 0 or xp_amount > ceiling:
        return {"error": f"Invalid XP amount: must be between 1 and {ceiling}"}

    # Row-level lock — blocks concurrent award_xp for the same user until commit.
    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == user_id)
        .with_for_update()
        .first()
    )
    if not profile:
        return {"error": "Profile not found"}

    old_level = profile.level
    profile.xp = (profile.xp or 0) + xp_amount
    new_level = calculate_level(profile.xp)
    profile.level = new_level

    db.add(
        XPAuditLog(
            id=uuid.uuid4(),
            user_id=profile.user_id,
            delta=xp_amount,
            reason=reason,
            actor_user_id=actor_user_id,
        )
    )
    db.flush()

    leveled_up = new_level > old_level

    if leveled_up:
        try:
            from services.analytics_service import track_event
            track_event(
                db=db,
                event_name="LevelUp",
                user_id=profile.user_id,
                properties={
                    "old_level": old_level,
                    "new_level": new_level,
                    "xp_total": profile.xp,
                    "reason": reason,
                },
            )
        except Exception:
            import logging
            logging.getLogger(__name__).exception("award_xp: LevelUp track failed")

    return {
        "xp_gained": xp_amount,
        "new_total_xp": profile.xp,
        "leveled_up": leveled_up,
        "new_level": new_level,
    }

