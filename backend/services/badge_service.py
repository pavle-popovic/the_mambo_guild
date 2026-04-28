"""
Badge Service - The Gamification Engine
Handles stat tracking, threshold checking, and badge awarding.
"""
import logging
from datetime import datetime, timezone
from typing import List, Optional, Union
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from models.community import UserStats, UserBadge, BadgeDefinition, BadgeTier
from models.community import Post, PostReply, PostReaction, ClaveTransaction, ModerationStatus, FounderClaim
from models.user import UserProfile

logger = logging.getLogger(__name__)


# Founder Diamond is gated: pre-launch we auto-awarded it to every
# waitlister, but the live rule requires the user to actually start a
# subscription (try_claim writes a founder_claims row). Until the
# revocation sweep runs at the post-deadline cutoff, plenty of orphan
# user_badges rows still exist. Filter at the read layer so /me and
# every other badge listing reflects the gated rule immediately, without
# touching the underlying user_badges data.
_GATED_BADGE_ID = "founder_diamond"


def _user_has_founder_claim(user_id: str, db: Session) -> bool:
    """True iff the user has a row in founder_claims (the new gated rule)."""
    return (
        db.query(FounderClaim)
        .filter(FounderClaim.user_id == user_id)
        .first()
        is not None
    )

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


def increment_reaction_received(user_id: str, db: Session, video_type: Optional[str] = None):
    """
    Called when user's post receives a like.
    Updates 'reactions_received_count' and checks the total-likes family
    (Crowd Favorite) plus the matching per-video-type family when
    `video_type` is provided (Move Magnet / Fan Favorite / Guild Applause).
    """
    stats = get_or_create_stats(user_id, db)
    stats.reactions_received_count += 1
    db.flush()

    # Both keys point at the same counter — keep 'reactions_received' for any
    # legacy badge defs that happen to still be active, and drive the new
    # Crowd Favorite family from 'likes_received'.
    check_and_award_badges(user_id, "reactions_received", stats.reactions_received_count, db)
    check_and_award_badges(user_id, "likes_received", stats.reactions_received_count, db)

    # Per-video-type like families live on live counts rather than a
    # persisted counter (we never counted them before). Query once, check.
    if video_type in ("motw", "original", "guild"):
        per_type_count = _count_likes_on_video_type(user_id, video_type, db)
        check_and_award_badges(user_id, f"{video_type}_likes", per_type_count, db)


def _count_likes_on_video_type(user_id: str, video_type: str, db: Session) -> int:
    """Live count of likes on this user's posts of the given video_type."""
    return db.query(func.count(PostReaction.id)).join(
        Post, Post.id == PostReaction.post_id
    ).filter(
        Post.user_id == user_id,
        Post.video_type == video_type,
        Post.is_deleted == False,
        Post.moderation_status == ModerationStatus.ACTIVE.value,
    ).scalar() or 0


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
    check_and_award_badges(user_id, "daily_streak", streak_count, db)


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


def award_badge(user_id: str, badge: Union[BadgeDefinition, str], db: Session):
    """
    Grant badge and log it.
    Can pass BadgeDefinition object or badge_id string.
    """
    badge_def = badge
    if isinstance(badge, str):
        badge_def = db.query(BadgeDefinition).get(badge)
        if not badge_def:
            # Loud, actionable log. If this fires on the signup path,
            # the protected specials are missing from badge_definitions.
            # Run migration 025 to seed + backfill.
            logger.error(
                "BADGE_DEF_MISSING: cannot award '%s'. "
                "Definition row not in badge_definitions. "
                "Run migration_025_seed_protected_badges.",
                badge,
            )
            return

    logger.info(f"🏆 Awarding Badge {badge_def.id} to user {user_id}")
    
    # Determine order (simple append logic for now, or based on tier rank?)
    # DB default is 0. We can just insert.
    new_badge = UserBadge(
        user_id=user_id,
        badge_id=badge_def.id,
        earned_at=datetime.now(timezone.utc)
    )
    db.add(new_badge)
    db.flush()
    
    # Create notification for badge earned
    from services.notification_service import create_notification
    create_notification(
        user_id=user_id,
        type="badge_earned",
        title="Badge Earned!",
        message=f"You earned the {badge_def.name} badge!",
        reference_type="badge",
        reference_id=badge_def.id,
        db=db
    )

    # ML feature: badges earned in first 7 days is the #1 retention predictor.
    try:
        import uuid as _uuid
        from services.analytics_service import track_event
        track_event(
            db=db,
            event_name="BadgeEarned",
            user_id=_uuid.UUID(str(user_id)),
            properties={
                "badge_id": badge_def.id,
                "badge_name": badge_def.name,
                "badge_tier": getattr(badge_def, "tier", None),
                "badge_category": getattr(badge_def, "category", None),
            },
        )
    except Exception:
        logger.exception("award_badge: analytics track failed (non-fatal)")


def get_user_stats(user_id: str, db: Session) -> dict:
    """
    Calculate and return all badge-related stats for a user.
    Consolidated using conditional aggregation.
    """
    from models.user import UserProfile

    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    stats = get_or_create_stats(user_id, db)

    # Legacy per-type reaction counts — only preserved so old trophy tiles
    # keep displaying accurate numbers. With migration 017 collapsing all
    # reactions to 'like' these will be zero for new data.
    reaction_row = db.query(
        func.count(case((PostReaction.reaction_type == "fire", 1))).label("fires"),
        func.count(case((PostReaction.reaction_type == "clap", 1))).label("claps"),
        func.count(case((PostReaction.reaction_type == "ruler", 1))).label("metronomes"),
    ).join(Post, Post.id == PostReaction.post_id).filter(
        Post.user_id == user_id,
        Post.is_deleted == False,
        Post.moderation_status == ModerationStatus.ACTIVE.value,
    ).first()

    # Post counts, including per video_type for the new badge families.
    post_row = db.query(
        func.count(case((
            (Post.post_type == "stage") & Post.mux_asset_id.isnot(None), 1
        ))).label("videos"),
        func.count(case((Post.post_type == "lab", 1))).label("questions"),
        func.count(case(((Post.video_type == "motw") & Post.mux_asset_id.isnot(None), 1))).label("motw"),
        func.count(case(((Post.video_type == "original") & Post.mux_asset_id.isnot(None), 1))).label("original"),
        func.count(case(((Post.video_type == "guild") & Post.mux_asset_id.isnot(None), 1))).label("guild"),
    ).filter(
        Post.user_id == user_id,
        Post.is_deleted == False,
        Post.moderation_status == ModerationStatus.ACTIVE.value,
    ).first()

    # Likes broken down by the post's video_type (Move Magnet / Fan Favorite /
    # Guild Applause families).
    likes_row = db.query(
        func.count(case(((Post.video_type == "motw", 1)))).label("motw"),
        func.count(case(((Post.video_type == "original", 1)))).label("original"),
        func.count(case(((Post.video_type == "guild", 1)))).label("guild"),
    ).select_from(PostReaction).join(
        Post, Post.id == PostReaction.post_id
    ).filter(
        Post.user_id == user_id,
        Post.is_deleted == False,
        Post.moderation_status == ModerationStatus.ACTIVE.value,
    ).first()

    comments_posted = db.query(func.count(PostReply.id)).filter(
        PostReply.user_id == user_id,
        PostReply.is_deleted == False,
    ).scalar() or 0

    return {
        "reactions_given": stats.reactions_given_count,
        "reactions_received": stats.reactions_received_count,
        "likes_received": stats.reactions_received_count,
        "motw_likes": likes_row.motw if likes_row else 0,
        "original_likes": likes_row.original if likes_row else 0,
        "guild_likes": likes_row.guild if likes_row else 0,
        "fires_received": reaction_row.fires if reaction_row else 0,
        "claps_received": reaction_row.claps if reaction_row else 0,
        "metronomes_received": reaction_row.metronomes if reaction_row else 0,
        "solutions_accepted": stats.solutions_accepted_count,
        "questions_posted": post_row.questions if post_row else 0,
        "videos_posted": post_row.videos if post_row else 0,
        "motw_videos": post_row.motw if post_row else 0,
        "original_videos": post_row.original if post_row else 0,
        "guild_videos": post_row.guild if post_row else 0,
        "comments_posted": comments_posted,
        "current_streak": profile.streak_count if profile else 0,
        "referrals_converted": profile.referral_count if profile and hasattr(profile, "referral_count") else 0,
    }


def get_all_badges_for_user(user_id: str, db: Session):
    """
    Get all badges (earned and unearned) for user profile with status.
    """
    all_defs = db.query(BadgeDefinition).all()
    user_badges = db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
    earned_map = {ub.badge_id: ub for ub in user_badges}

    # Gated-badge enforcement (see _user_has_founder_claim above).
    has_founder_claim = _user_has_founder_claim(user_id, db)

    results = []
    for bd in all_defs:
        ub = earned_map.get(bd.id)
        is_earned = ub is not None
        # Founder Diamond shows as earned ONLY when a claim row exists.
        # Pre-launch orphan user_badges rows render as unearned (locked).
        if bd.id == _GATED_BADGE_ID and is_earned and not has_founder_claim:
            is_earned = False
            ub = None
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


def get_user_badges(user_id: str, db: Session) -> list:
    """
    Get only earned badges for a specific user (public profile view).
    Uses a JOIN to avoid N+1 queries.
    """
    from sqlalchemy.orm import joinedload
    user_badges = (
        db.query(UserBadge)
        .filter(UserBadge.user_id == user_id)
        .options(joinedload(UserBadge.badge))
        .all()
    )
    # Gated-badge enforcement: hide founder_diamond unless the user has a
    # founder_claims row (live rule), even if user_badges still has it from
    # the pre-launch auto-award.
    has_founder_claim = _user_has_founder_claim(user_id, db)
    results = []
    for ub in user_badges:
        bd = ub.badge
        if bd:
            if bd.id == _GATED_BADGE_ID and not has_founder_claim:
                continue
            results.append({
                "id": bd.id,
                "name": bd.name,
                "description": bd.description,
                "tier": bd.tier,
                "icon_url": bd.icon_url,
                "category": bd.category,
                "requirement_type": bd.requirement_type,
                "requirement_value": bd.threshold if bd.threshold is not None else 0,
                "is_earned": True,
                "earned_at": ub.earned_at,
                "display_order": ub.display_order or 0,
            })
    results.sort(key=lambda x: x["display_order"] if x["display_order"] > 0 else 9999)
    return results


def check_all_badges_for_user(user_id: str, db: Session) -> list:
    """
    Check every badge requirement for a user and award any newly earned badges.
    Returns list of newly awarded badge dicts.
    Used by the manual /badges/check endpoint.
    """
    # Snapshot of badges before check
    before_ids = {ub.badge_id for ub in db.query(UserBadge).filter(UserBadge.user_id == user_id).all()}

    user_stats = get_user_stats(user_id, db)

    checks = [
        ("reactions_given", user_stats["reactions_given"]),
        ("reactions_received", user_stats["reactions_received"]),
        ("likes_received", user_stats["likes_received"]),
        ("motw_likes", user_stats["motw_likes"]),
        ("original_likes", user_stats["original_likes"]),
        ("guild_likes", user_stats["guild_likes"]),
        ("solutions_accepted", user_stats["solutions_accepted"]),
        ("videos_posted", user_stats["videos_posted"]),
        ("motw_videos", user_stats["motw_videos"]),
        ("original_videos", user_stats["original_videos"]),
        ("guild_videos", user_stats["guild_videos"]),
        ("questions_posted", user_stats["questions_posted"]),
        ("comments_posted", user_stats["comments_posted"]),
        ("daily_streak", user_stats["current_streak"]),
        ("referrals_converted", user_stats["referrals_converted"]),
    ]

    for req_type, value in checks:
        check_and_award_badges(user_id, req_type, value, db)

    # Return newly awarded badges
    after_badges = db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
    new_badges = [ub for ub in after_badges if ub.badge_id not in before_ids]
    return [{"badge_id": ub.badge_id, "earned_at": ub.earned_at} for ub in new_badges]


def award_subscription_badge(user_id: str, tier: str, db: Session):
    """
    Award the appropriate subscription badge when user subscribes.
    Called from payment webhook or subscription creation.
    
    Args:
        user_id: User's UUID
        tier: 'advanced' or 'performer'
        db: Database session
    """
    badge_id_map = {
        "advanced": "pro_member",
        "performer": "guild_master"
    }
    
    badge_id = badge_id_map.get(tier.lower())
    if not badge_id:
        logger.warning(f"No badge defined for subscription tier: {tier}")
        return
    
    # Check if badge definition exists
    badge_def = db.query(BadgeDefinition).filter(BadgeDefinition.id == badge_id).first()
    if not badge_def:
        logger.warning(f"Badge definition not found: {badge_id}")
        return
    
    # Check if user already has this badge
    existing = db.query(UserBadge).filter(
        UserBadge.user_id == user_id,
        UserBadge.badge_id == badge_id
    ).first()
    
    if existing:
        logger.info(f"User {user_id} already has badge {badge_id}")
        return
    
    # Award the badge
    award_badge(user_id, badge_def, db)
    logger.info(f"🏆 Awarded subscription badge {badge_id} to user {user_id}")
    
    # If user is performer tier, also ensure they have the pro_member badge
    if tier.lower() == "performer":
        pro_badge = db.query(BadgeDefinition).filter(BadgeDefinition.id == "pro_member").first()
        if pro_badge:
            existing_pro = db.query(UserBadge).filter(
                UserBadge.user_id == user_id,
                UserBadge.badge_id == "pro_member"
            ).first()
            if not existing_pro:
                award_badge(user_id, pro_badge, db)
                logger.info(f"🏆 Also awarded pro_member badge to Guild Master {user_id}")


def revoke_subscription_badges(user_id: str, current_tier: str, db: Session) -> int:
    """
    Revoke subscription badges so the trophy case mirrors the current
    subscription tier (not lifetime achievement).

    Called from Stripe webhooks when tier drops:
      - current_tier='rookie'    (cancellation)   -> remove pro_member + guild_master
      - current_tier='advanced'  (Performer->Pro) -> remove guild_master only; pro_member is still earned
      - current_tier='performer' (upgrade/steady) -> no-op (user is fully subscribed)

    Idempotent. Returns the number of UserBadge rows deleted.
    """
    tier_lower = (current_tier or "").lower()

    if tier_lower == "performer":
        return 0

    if tier_lower == "rookie":
        badges_to_remove = ["pro_member", "guild_master"]
    elif tier_lower == "advanced":
        badges_to_remove = ["guild_master"]
    else:
        # Unknown tier — don't touch anything rather than silently deleting.
        logger.warning(
            "revoke_subscription_badges: unknown tier '%s' for user %s; skipping",
            current_tier, user_id,
        )
        return 0

    removed = db.query(UserBadge).filter(
        UserBadge.user_id == user_id,
        UserBadge.badge_id.in_(badges_to_remove),
    ).delete(synchronize_session=False)

    if removed:
        logger.info(
            "Revoked %d subscription badge(s) from user %s on tier change to %s",
            removed, user_id, tier_lower,
        )
    return removed