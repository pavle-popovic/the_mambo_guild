"""
Badge Service - The Gamification Engine
Handles stat tracking, threshold checking, and badge awarding.
"""
import logging
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from models.community import UserStats, UserBadge, BadgeDefinition, BadgeTier
from models.community import Post, PostReaction, ClaveTransaction
from models.user import UserProfile

logger = logging.getLogger(__name__)

# Trigger Categories matching PRD
TRIGGER_OP_CRITIC = "reactions_given"      # Category A
TRIGGER_OP_STAR = "reactions_received"     # Category B
TRIGGER_OP_MAESTRO = "solutions_accepted"  # Category C
TRIGGER_OP_METRONOME = "streak"            # Category D


def get_or_create_stats(user_id: str, db: Session) -> UserStats:
    stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if not stats:
        stats = UserStats(user_id=user_id)
        db.add(stats)
        db.flush()
    return stats


def increment_reaction_given(user_id: str, db: Session):
    """
    Called when user reacts to a post.
    Updates 'reactions_given_count' and checks 'The Critic' badges.
    """
    stats = get_or_create_stats(user_id, db)
    stats.reactions_given_count += 1
    db.flush()
    check_and_award_badges(user_id, TRIGGER_OP_CRITIC, stats.reactions_given_count, db)


def increment_reaction_received(user_id: str, db: Session):
    """
    Called when user's post receives a reaction.
    Updates 'reactions_received_count' and checks 'The Star' badges.
    """
    stats = get_or_create_stats(user_id, db)
    stats.reactions_received_count += 1
    db.flush()
    check_and_award_badges(user_id, TRIGGER_OP_STAR, stats.reactions_received_count, db)


def increment_solution_accepted(user_id: str, db: Session):
    """
    Called when user's answer is marked as solution.
    Updates 'solutions_accepted_count' and checks 'El Maestro' badges.
    Also updates Reputation score.
    """
    # detailed tracking
    stats = get_or_create_stats(user_id, db)
    stats.solutions_accepted_count += 1
    
    # Update profile reputation too
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if profile:
        profile.reputation += 1
    
    db.flush()
    check_and_award_badges(user_id, TRIGGER_OP_MAESTRO, stats.solutions_accepted_count, db)


def check_streak_badges(user_id: str, streak_count: int, db: Session):
    """
    Called after daily login processed.
    Checks 'The Metronome' badges.
    """
    check_and_award_badges(user_id, TRIGGER_OP_METRONOME, streak_count, db)


def check_and_award_badges(user_id: str, requirement_type: str, current_value: int, db: Session):
    """
    Generic logic to check if user qualifies for new badges in a category.
    """
    # 1. Fetch potential badges in this category/type that user doesn't have
    # Map our trigger strings to DB requirement_type strings if needed
    # (Assuming we seeded DB with types: 'reactions_given', 'reactions_received', 'solutions_accepted', 'streak')
    
    # Find all badges of this type where threshold <= current_value
    eligible_badges = db.query(BadgeDefinition).filter(
        BadgeDefinition.requirement_type == requirement_type,
        BadgeDefinition.threshold <= current_value
    ).all()
    
    for badge in eligible_badges:
        # Check if already owned
        has_badge = db.query(UserBadge).filter(
            UserBadge.user_id == user_id,
            UserBadge.badge_id == badge.id
        ).first()
        
        if not has_badge:
            award_badge(user_id, badge, db)


def award_badge(user_id: str, badge: BadgeDefinition, db: Session):
    """
    Grant badge and log it.
    """
    logger.info(f"🏆 Awarding Badge {badge.id} to user {user_id}")
    
    # Determine order (simple append logic for now, or based on tier rank?)
    # DB default is 0. We can just insert.
    new_badge = UserBadge(
        user_id=user_id,
        badge_id=badge.id,
        earned_at=datetime.utcnow()
    )
    db.add(new_badge)
    db.flush()
    
    # TODO: Create Notification (Toast/Monitor)
    # create_notification(user_id, "badge_earned", badge.name) - if notification system exists


def get_all_badges_for_user(user_id: str, db: Session):
    """
    Get all badges (earned and unearned) for user profile with status.
    """
    all_defs = db.query(BadgeDefinition).all()
    user_badges = db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
    earned_map = {ub.badge_id: ub for ub in user_badges}
    
    results = []
    for bd in all_defs:
        ub = earned_map.get(bd.id)
        is_earned = ub is not None
        results.append({
            "id": bd.id,
            "name": bd.name,
            "description": bd.description,
            "tier": bd.tier,
            "icon_url": bd.icon_url,
            "category": bd.category,
            "requirement_type": bd.requirement_type,
            "requirement_value": bd.threshold if bd.threshold is not None else 0,
            "is_earned": is_earned,
            "earned_at": ub.earned_at if ub else None,
            "display_order": ub.display_order if ub and ub.display_order is not None else 0
        })
    
    # Sort: Earned first, then by display_order (if > 0), then by threshold desc
    results.sort(key=lambda x: (
        not x['is_earned'], 
        x['display_order'] if x['display_order'] > 0 else 9999,
        -(x['requirement_value'] or 0)
    ))
    return results
