"""
Badge Service - Gamification Badges for Mambo Inn v4.0
Handles badge definitions, eligibility checks, and awards.
"""
import logging
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, case, text
import uuid

from models.user import UserProfile
from models.community import BadgeDefinition, UserBadge, Post, PostReply, PostReaction

logger = logging.getLogger(__name__)


def get_all_badges(user_id: str, db: Session) -> List[dict]:
    """
    Get all badge definitions with user's earned status.
    """
    # Get all badge definitions
    badges = db.query(BadgeDefinition).all()
    
    # Get user's earned badges
    earned = db.query(UserBadge).filter(
        UserBadge.user_id == user_id
    ).all()
    earned_map = {ub.badge_id: ub.earned_at for ub in earned}
    
    result = []
    for badge in badges:
        is_earned = badge.id in earned_map
        result.append({
            "id": badge.id,
            "name": badge.name,
            "description": badge.description,
            "icon_url": badge.icon_url,
            "category": badge.category,
            "requirement_type": badge.requirement_type,
            "requirement_value": badge.requirement_value,
            "is_earned": is_earned,
            "earned_at": earned_map.get(badge.id)
        })
    
    return result


def get_user_badges(user_id: str, db: Session) -> List[dict]:
    """
    Get only the badges a user has earned (for public profile).
    """
    earned = db.query(UserBadge).join(BadgeDefinition).filter(
        UserBadge.user_id == user_id
    ).all()
    
    result = []
    for ub in earned:
        badge = ub.badge
        result.append({
            "id": badge.id,
            "name": badge.name,
            "description": badge.description,
            "icon_url": badge.icon_url,
            "category": badge.category,
            "earned_at": ub.earned_at
        })
    
    return result


def award_badge(user_id: str, badge_id: str, db: Session) -> dict:
    """
    Award a badge to a user (idempotent).
    Returns: {success, message, badge_name}
    """
    # Check if badge exists
    badge = db.query(BadgeDefinition).filter(BadgeDefinition.id == badge_id).first()
    if not badge:
        return {"success": False, "message": f"Badge '{badge_id}' not found"}
    
    # Check if already earned
    existing = db.query(UserBadge).filter(
        UserBadge.user_id == user_id,
        UserBadge.badge_id == badge_id
    ).first()
    
    if existing:
        return {"success": True, "message": "Badge already earned", "badge_name": badge.name}
    
    # Award badge
    user_badge = UserBadge(
        id=uuid.uuid4(),
        user_id=user_id,
        badge_id=badge_id
    )
    db.add(user_badge)
    db.flush()
    
    logger.info(f"User {user_id} earned badge '{badge_id}'")
    return {
        "success": True,
        "message": f"🏆 New badge earned: {badge.name}!",
        "badge_name": badge.name,
        "badge_id": badge_id
    }


def check_and_award_badges(user_id: str, db: Session) -> List[dict]:
    """
    Check all badge conditions and award any newly eligible badges.
    Returns list of newly awarded badges.
    """
    awarded = []
    
    # Check each badge type
    checkers = [
        check_el_maestro,
        check_the_eye,
        check_firestarter,
        check_first_responder,
        check_cinematographer,
        # Note: metronome and the_lion require course completion tracking
    ]
    
    for checker in checkers:
        try:
            result = checker(user_id, db)
            if result:
                awarded.append(result)
        except Exception as e:
            # Log error but don't crash - badge checking shouldn't break post creation
            logger.error(f"Error checking badge {checker.__name__}: {e}", exc_info=True)
            continue
    
    return awarded


# ============================================
# Individual Badge Checks
# ============================================

def check_el_maestro(user_id: str, db: Session) -> Optional[dict]:
    """
    El Maestro: 10 answers marked as Solution.
    """
    badge_id = "el_maestro"
    
    # Already earned?
    if _has_badge(user_id, badge_id, db):
        return None
    
    # Count accepted answers
    count = db.query(func.count(PostReply.id)).filter(
        PostReply.user_id == user_id,
        PostReply.is_accepted_answer == True
    ).scalar() or 0
    
    if count >= 10:
        return award_badge(user_id, badge_id, db)
    
    return None


def check_the_eye(user_id: str, db: Session) -> Optional[dict]:
    """
    The Eye: Reacted 100 times.
    """
    badge_id = "the_eye"
    
    if _has_badge(user_id, badge_id, db):
        return None
    
    # Count reactions given
    count = db.query(func.count(PostReaction.id)).filter(
        PostReaction.user_id == user_id
    ).scalar() or 0
    
    if count >= 100:
        return award_badge(user_id, badge_id, db)
    
    return None


def check_firestarter(user_id: str, db: Session) -> Optional[dict]:
    """
    Firestarter: Received 100 Fire reactions on posts.
    """
    badge_id = "firestarter"
    
    if _has_badge(user_id, badge_id, db):
        return None
    
    # Count fire reactions received on user's posts
    count = db.query(func.count(PostReaction.id)).join(Post).filter(
        Post.user_id == user_id,
        PostReaction.reaction_type == "fire"
    ).scalar() or 0
    
    if count >= 100:
        return award_badge(user_id, badge_id, db)
    
    return None


def check_first_responder(user_id: str, db: Session) -> Optional[dict]:
    """
    First Responder: Answered 5 questions within 1 hour of posting.
    """
    badge_id = "first_responder"
    
    if _has_badge(user_id, badge_id, db):
        return None
    
    # This is complex - need to count replies that were within 1 hour of post creation
    # Use raw SQL for time difference calculation (PostgreSQL)
    fast_answers = db.execute(
        text("""
            SELECT COUNT(*) 
            FROM post_replies pr
            JOIN posts p ON pr.post_id = p.id
            WHERE pr.user_id = :user_id
            AND p.post_type = 'lab'
            AND pr.user_id != p.user_id
            AND EXTRACT(EPOCH FROM (pr.created_at - p.created_at)) <= 3600
        """),
        {"user_id": user_id}
    ).scalar() or 0
    
    if fast_answers >= 5:
        return award_badge(user_id, badge_id, db)
    
    return None


def check_cinematographer(user_id: str, db: Session) -> Optional[dict]:
    """
    The Cinematographer: Posted 10 videos to The Stage.
    """
    badge_id = "cinematographer"
    
    if _has_badge(user_id, badge_id, db):
        return None
    
    # Count video posts
    count = db.query(func.count(Post.id)).filter(
        Post.user_id == user_id,
        Post.post_type == "stage",
        Post.mux_asset_id.isnot(None)
    ).scalar() or 0
    
    if count >= 10:
        return award_badge(user_id, badge_id, db)
    
    return None


def check_metronome(user_id: str, db: Session) -> Optional[dict]:
    """
    The Metronome: Completed 7 drills in 7 consecutive days.
    This requires integration with the lesson completion system.
    """
    badge_id = "metronome"
    
    if _has_badge(user_id, badge_id, db):
        return None
    
    # TODO: Implement once lesson completion tracking includes drill type
    # Need to track daily lesson completions and check for 7-day streak
    
    return None


def check_the_lion(user_id: str, course_id: str, db: Session) -> Optional[dict]:
    """
    The Lion: Completed Advanced Mastery Course.
    This is triggered by course completion.
    """
    badge_id = "the_lion"
    
    if _has_badge(user_id, badge_id, db):
        return None
    
    # TODO: Check if course_id is the "Advanced Mastery" course
    # and if user has completed all lessons
    
    return None


# ============================================
# Helper Functions
# ============================================

def _has_badge(user_id: str, badge_id: str, db: Session) -> bool:
    """Check if user already has a badge."""
    return db.query(UserBadge).filter(
        UserBadge.user_id == user_id,
        UserBadge.badge_id == badge_id
    ).first() is not None


def get_user_stats(user_id: str, db: Session) -> dict:
    """
    Get stats for public profile display.
    """
    # Questions solved (accepted answers)
    questions_solved = db.query(func.count(PostReply.id)).filter(
        PostReply.user_id == user_id,
        PostReply.is_accepted_answer == True
    ).scalar() or 0
    
    # Fires received
    fires_received = db.query(func.count(PostReaction.id)).join(Post).filter(
        Post.user_id == user_id,
        PostReaction.reaction_type == "fire"
    ).scalar() or 0
    
    # Current streak
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    current_streak = profile.streak_count if profile else 0
    
    return {
        "questions_solved": questions_solved,
        "fires_received": fires_received,
        "current_streak": current_streak
    }
