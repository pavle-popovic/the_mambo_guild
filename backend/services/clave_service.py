"""
Clave Service - The Central Bank of Mambo Inn v4.0
Handles all clave transactions, daily bonuses, and balance checks.
"""
import random
import logging
from datetime import datetime, date
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from models.user import UserProfile, Subscription, SubscriptionTier, SubscriptionStatus
from models.community import ClaveTransaction, Post, PostReply

logger = logging.getLogger(__name__)


# ============================================
# Cost Constants (from PRD)
# ============================================
COST_REACTION = 1
COST_COMMENT = 2
COST_POST_QUESTION = 5
COST_POST_VIDEO = 15

# ============================================
# Earning Constants (from PRD)
# ============================================
EARN_DAILY_BASE = (1, 3)      # RNG range for base users
EARN_DAILY_PRO = (4, 8)       # RNG range for pro users
EARN_STREAK_BONUS_BASE = 10
EARN_STREAK_BONUS_PRO = 20
EARN_STREAK_INTERVAL = 5      # Every 5 consecutive days
EARN_ACCEPTED_ANSWER = 15
EARN_REACTION_REFUND = 1          # Refund when post gets ANY reaction (capped)
EARN_REACTION_REFUND_CAP = 5      # Max refunds per video
EARN_CHOREO_COMPLETE = 0
EARN_WEEK_COMPLETE = 0
EARN_COURSE_COMPLETE = 0
EARN_LEVEL_UP = 0
EARN_REFERRAL_BONUS = 50
EARN_NEW_USER_STARTER = 15
EARN_SUB_ADVANCED = 10
EARN_SUB_PERFORMER = 20

# ============================================
# Slot Limits
# ============================================
BASE_VIDEO_SLOTS = 5
PRO_VIDEO_SLOTS = 20


def is_user_pro(user_id: str, db: Session) -> bool:
    """Check if user has a pro subscription."""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == user_id,
        Subscription.status == SubscriptionStatus.ACTIVE,
        Subscription.tier.in_([SubscriptionTier.ADVANCED, SubscriptionTier.PERFORMER])
    ).first()
    return subscription is not None


def get_user_profile(user_id: str, db: Session) -> Optional[UserProfile]:
    """Get user profile by user_id."""
    return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()


def get_balance(user_id: str, db: Session) -> int:
    """Get user's current clave balance."""
    profile = get_user_profile(user_id, db)
    return profile.current_claves if profile else 0


def can_afford(user_id: str, amount: int, db: Session) -> Tuple[bool, int]:
    """
    Check if user can afford an action.
    Returns: (can_afford: bool, current_balance: int)
    """
    balance = get_balance(user_id, db)
    return (balance >= amount, balance)


def earn_claves(
    user_id: str,
    amount: int,
    reason: str,
    db: Session,
    reference_id: str = None
) -> int:
    """
    Award claves to a user.
    Returns: new balance
    """
    if amount <= 0:
        logger.warning(f"Attempted to earn {amount} claves (must be positive)")
        return get_balance(user_id, db)
    
    profile = get_user_profile(user_id, db)
    if not profile:
        logger.error(f"Profile not found for user {user_id}")
        return 0
    
    # Create transaction
    transaction = ClaveTransaction(
        user_id=user_id,
        amount=amount,
        reason=reason,
        reference_id=reference_id
    )
    db.add(transaction)
    
    # Update balance
    profile.current_claves += amount
    db.flush()
    
    logger.info(f"User {user_id} earned {amount} claves ({reason}). New balance: {profile.current_claves}")
    return profile.current_claves


def spend_claves(
    user_id: str,
    amount: int,
    reason: str,
    db: Session,
    reference_id: str = None
) -> Tuple[bool, int]:
    """
    Spend claves for an action.
    Returns: (success: bool, new_balance: int)
    """
    if amount <= 0:
        logger.warning(f"Attempted to spend {amount} claves (must be positive)")
        return (True, get_balance(user_id, db))
    
    profile = get_user_profile(user_id, db)
    if not profile:
        logger.error(f"Profile not found for user {user_id}")
        return (False, 0)
    
    # Check balance
    if profile.current_claves < amount:
        logger.warning(f"User {user_id} cannot afford {amount} claves (balance: {profile.current_claves})")
        return (False, profile.current_claves)
    
    # Create transaction (negative amount)
    transaction = ClaveTransaction(
        user_id=user_id,
        amount=-amount,
        reason=reason,
        reference_id=reference_id
    )
    db.add(transaction)
    
    # Update balance
    profile.current_claves -= amount
    db.flush()
    
    logger.info(f"User {user_id} spent {amount} claves ({reason}). New balance: {profile.current_claves}")
    return (True, profile.current_claves)


def process_daily_login(user_id: str, db: Session) -> dict:
    """
    Process daily login bonus.
    Returns dict with amount earned, streak info, etc.
    """
    profile = get_user_profile(user_id, db)
    if not profile:
        return {"success": False, "message": "Profile not found"}
    
    today = date.today()
    
    # Check if already claimed today
    if profile.last_daily_claim == today:
        return {
            "success": False,
            "amount": 0,
            "new_balance": profile.current_claves,
            "message": "Already claimed today. Come back tomorrow!"
        }
    
    # Determine earning range based on tier
    is_pro = is_user_pro(user_id, db)
    earn_range = EARN_DAILY_PRO if is_pro else EARN_DAILY_BASE
    daily_amount = random.randint(earn_range[0], earn_range[1])
    
    # Award daily bonus
    earn_claves(user_id, daily_amount, "daily_login", db)
    
    # Update last claim date
    profile.last_daily_claim = today
    
    # Check for streak bonus
    streak_bonus = None
    if profile.streak_count > 0 and profile.streak_count % EARN_STREAK_INTERVAL == 0:
        bonus_amount = EARN_STREAK_BONUS_PRO if is_pro else EARN_STREAK_BONUS_BASE
        earn_claves(user_id, bonus_amount, "streak_bonus", db)
        streak_bonus = bonus_amount
        logger.info(f"User {user_id} hit streak milestone {profile.streak_count}, bonus: {bonus_amount}")
    
    # Check for Metronome Badge (Streak)
    from services import badge_service
    badge_service.check_streak_badges(user_id, profile.streak_count, db)
    
    db.flush()
    
    message = f"You earned {daily_amount} 🥢"
    if streak_bonus:
        message += f" + {streak_bonus} 🥢 streak bonus!"
    
    return {
        "success": True,
        "amount": daily_amount,
        "new_balance": profile.current_claves,
        "streak_bonus": streak_bonus,
        "streak_count": profile.streak_count,
        "message": message
    }


def get_wallet(user_id: str, db: Session, limit: int = 20) -> dict:
    """
    Get user's wallet state including balance and recent transactions.
    """
    profile = get_user_profile(user_id, db)
    if not profile:
        return {
            "current_claves": 0,
            "is_pro": False,
            "recent_transactions": [],
            "video_slots_used": 0,
            "video_slots_limit": BASE_VIDEO_SLOTS
        }
    
    is_pro = is_user_pro(user_id, db)
    
    # Get recent transactions
    transactions = db.query(ClaveTransaction).filter(
        ClaveTransaction.user_id == user_id
    ).order_by(
        ClaveTransaction.created_at.desc()
    ).limit(limit).all()
    
    # Get video slot usage
    video_count = db.query(func.count(Post.id)).filter(
        Post.user_id == user_id,
        Post.post_type == 'stage',
        Post.mux_asset_id.isnot(None)
    ).scalar() or 0
    
    slot_limit = PRO_VIDEO_SLOTS if is_pro else BASE_VIDEO_SLOTS
    
    return {
        "current_claves": profile.current_claves,
        "is_pro": is_pro,
        "recent_transactions": [
            {
                "id": str(t.id),
                "amount": t.amount,
                "reason": t.reason,
                "reference_id": str(t.reference_id) if t.reference_id else None,
                "created_at": t.created_at
            }
            for t in transactions
        ],
        "video_slots_used": video_count,
        "video_slots_limit": slot_limit
    }


def get_video_slot_status(user_id: str, db: Session) -> dict:
    """
    Check if user can upload a new video (slot limit check).
    Returns: {allowed, current, limit, message}
    """
    is_pro = is_user_pro(user_id, db)
    limit = PRO_VIDEO_SLOTS if is_pro else BASE_VIDEO_SLOTS
    
    # Count Post videos (Stage/Lab posts with video)
    post_count = db.query(func.count(Post.id)).filter(
        Post.user_id == user_id,
        Post.mux_asset_id.isnot(None)
    ).scalar() or 0

    # Count Reply videos (that are NOT accepted solutions)
    reply_count = db.query(func.count(PostReply.id)).filter(
        PostReply.user_id == user_id,
        PostReply.mux_asset_id.isnot(None),
        PostReply.is_accepted_answer == False
    ).scalar() or 0
    
    current = post_count + reply_count
    
    allowed = current < limit
    
    if allowed:
        message = f"You have {current}/{limit} video slots used."
    else:
        message = f"You've reached your {limit} video limit. Delete an old video to post a new one."
    
    return {
        "allowed": allowed,
        "current_slots": current,
        "max_slots": limit,
        "message": message
    }


def award_new_user_bonus(user_id: str, db: Session) -> int:
    """
    Award starter pack to a new user (e.g., from referral).
    """
    return earn_claves(user_id, EARN_NEW_USER_STARTER, "new_user_bonus", db)


def award_referral_bonus(referrer_user_id: str, db: Session) -> int:
    """
    Award referral bonus when someone signs up with a referral link.
    """
    return earn_claves(referrer_user_id, EARN_REFERRAL_BONUS, "referral_bonus", db)


def award_accepted_answer(user_id: str, post_id: str, db: Session) -> int:
    """
    Award claves when user's answer is marked as Solution.
    """
    return earn_claves(user_id, EARN_ACCEPTED_ANSWER, "accepted_answer", db, reference_id=post_id)


def award_level_up(user_id: str, new_level: int, db: Session) -> int:
    """
    Award claves for leveling up.
    """
    return earn_claves(user_id, EARN_LEVEL_UP, f"level_up_{new_level}", db)


def award_course_milestone(
    user_id: str,
    milestone_type: str,
    reference_id: str,
    db: Session
) -> int:
    """
    Award claves for course milestones.
    milestone_type: 'choreo_complete', 'week_complete', 'course_complete'
    """
    amounts = {
        "choreo_complete": EARN_CHOREO_COMPLETE,
        "week_complete": EARN_WEEK_COMPLETE,
        "course_complete": EARN_COURSE_COMPLETE
    }
    amount = amounts.get(milestone_type, 0)
    if amount > 0:
        return earn_claves(user_id, amount, milestone_type, db, reference_id=reference_id)
    return get_balance(user_id, db)


def process_reaction_refund(post_id: str, post_owner_id: str, db: Session) -> bool:
    """
    Process reaction refund (max 5 per video).
    Triggered by ANY reaction type.
    """
    # Count existing refunds for this post (reason='reaction_refund')
    existing_refunds = db.query(func.count(ClaveTransaction.id)).filter(
        ClaveTransaction.user_id == post_owner_id,
        ClaveTransaction.reference_id == post_id,
        ClaveTransaction.reason == "reaction_refund"
    ).scalar() or 0
    
    if existing_refunds < EARN_REACTION_REFUND_CAP:
        earn_claves(post_owner_id, EARN_REACTION_REFUND, "reaction_refund", db, reference_id=post_id)
        return True
    
    return False


def award_subscription_bonus(user_id: str, tier: SubscriptionTier, db: Session, reference_id: str = None) -> int:
    """
    Award monthly subscription bonus.
    """
    amount = 0
    if tier == SubscriptionTier.ADVANCED:
        amount = EARN_SUB_ADVANCED
    elif tier == SubscriptionTier.PERFORMER:
        amount = EARN_SUB_PERFORMER
        
    if amount > 0:
        return earn_claves(user_id, amount, "subscription_bonus", db, reference_id=reference_id)
    return get_balance(user_id, db)
