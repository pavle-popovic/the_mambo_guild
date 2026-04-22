"""
Community API Endpoints - The Stage & The Lab
/api/community - Posts, reactions, replies, solutions
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from models import get_db
from models.user import User
from dependencies import get_current_user, get_current_user_optional
from services import post_service, badge_service, notification_service, posting_reward_service
from services.analytics_service import track_event

logger = logging.getLogger(__name__)
from schemas.community import (
    PostCreateRequest, PostUpdateRequest, PostResponse, PostDetailResponse,
    ReplyCreateRequest, ReplyUpdateRequest, ReplyResponse,
    UploadCheckResponse, TagResponse
)

router = APIRouter(tags=["Community"])


@router.get("/stats")
def get_community_stats(
    period: Optional[str] = Query("all_time", description="weekly, monthly, all_time"),
    category: Optional[str] = Query("overall", description="overall, helpful, creative, active"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Get public community stats (no auth required).
    Returns total member count, active users, leaderboard, and hall of fame.
    """
    from models.user import User as UserModel, UserProfile
    from services import leaderboard_service
    from datetime import datetime, timedelta, timezone

    total_users = db.query(UserModel).count()

    # Count users who have logged in within the last 24 hours (real presence)
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    active_now = db.query(UserProfile).filter(
        UserProfile.last_login_date >= cutoff
    ).count()

    leaderboard_data = leaderboard_service.get_leaderboard(
        period=period or "all_time",
        category=category or "overall",
        limit=limit,
        db=db
    )

    hall_of_fame = leaderboard_service.get_hall_of_fame(limit=5, db=db)

    return {
        "member_count": total_users,
        "active_now": active_now,
        "leaderboard": leaderboard_data,
        "hall_of_fame": hall_of_fame,
        "period": period or "all_time",
        "category": category or "overall"
    }


@router.get("/stats/my-rank")
def get_my_rank(
    period: Optional[str] = Query("all_time"),
    category: Optional[str] = Query("overall"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current user's rank on the leaderboard."""
    from services import leaderboard_service
    rank_data = leaderboard_service.get_user_rank(
        user_id=str(current_user.id),
        period=period or "all_time",
        category=category or "overall",
        db=db
    )
    return rank_data



@router.get("/feed", response_model=List[PostResponse])
def get_feed(
    post_type: Optional[str] = Query(None, description="Filter by 'stage' or 'lab'"),
    tag: Optional[str] = Query(None, description="Filter by single tag slug"),
    tags: Optional[str] = Query(None, description="Comma-separated tag slugs for multi-tag filter"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get the community feed.
    - No filter: All posts
    - post_type=stage: Video posts (The Stage)
    - post_type=lab: Q&A posts (The Lab)
    - tags: Comma-separated tag slugs for multi-tag filter
    """
    tags_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else None
    # Unauthenticated visitors get a 3-post preview for the community landing
    effective_limit = 3 if current_user is None else limit
    posts = post_service.get_feed(
        post_type=post_type,
        tag=tag,
        tags=tags_list,
        skip=skip,
        limit=effective_limit,
        current_user_id=str(current_user.id) if current_user else None,
        db=db
    )
    return posts


@router.get("/posts/{post_id}")
def get_post_detail(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get full post detail with all replies.
    """
    post = post_service.get_post_detail(post_id, str(current_user.id), db)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("/posts")
def create_post(
    request: PostCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new post.
    Posting is free; rate limits prevent abuse.
    """
    logger.info(f"[COMMUNITY] Creating post - Type: {request.post_type}, Tags: {request.tags}")
    result = post_service.create_post(
        user_id=str(current_user.id),
        post_type=request.post_type,
        title=request.title,
        body=request.body,
        tags=request.tags,
        is_wip=request.is_wip,
        feedback_type=request.feedback_type,
        video_type=request.video_type,
        mux_asset_id=request.mux_asset_id,
        mux_playback_id=request.mux_playback_id,
        video_duration_seconds=request.video_duration_seconds,
        db=db
    )
    
    if not result["success"]:
        error_message = result.get("message", "Failed to create post")
        if result.get("rate_limited"):
            status_code = 429
        elif "Insufficient" in error_message:
            status_code = 400
        else:
            status_code = 422
        raise HTTPException(
            status_code=status_code,
            detail={"message": error_message, **result}
        )

    db.commit()

    # Posting rewards: credit claves for stage videos / lab questions.
    # Enforces daily cap + cooldown internally, so calling unconditionally
    # is safe — ineligible posts just no-op.
    reward_outcome = {"awarded": False}
    post_id_for_reward = (result.get("post") or {}).get("id")
    if post_id_for_reward:
        try:
            reward_outcome = posting_reward_service.award_post_reward(post_id_for_reward, db)
            if reward_outcome.get("awarded"):
                db.commit()
        except Exception:
            logger.exception("create_post: posting reward failed (non-fatal)")
            db.rollback()

    # Surface the reward on the response so the client can flash "+10 🥢".
    if reward_outcome.get("awarded"):
        result["reward"] = {
            "amount": reward_outcome["amount"],
            "reason": reward_outcome["reason"],
            "new_balance": reward_outcome["new_balance"],
        }

    # Badge triggers — only count posts that passed moderation.
    from sqlalchemy import func
    from models.community import Post, ModerationStatus
    _ACTIVE = ModerationStatus.ACTIVE.value

    # Stage posts: video total + per-type (motw / original / guild).
    if result["success"] and request.post_type == "stage" and request.mux_asset_id:
        video_count = db.query(func.count(Post.id)).filter(
            Post.user_id == current_user.id,
            Post.post_type == "stage",
            Post.mux_asset_id.isnot(None),
            Post.is_deleted == False,
            Post.moderation_status == _ACTIVE,
        ).scalar() or 0
        badge_service.check_and_award_badges(str(current_user.id), "videos_posted", video_count, db)

        if request.video_type in ("motw", "original", "guild"):
            vtype_count = db.query(func.count(Post.id)).filter(
                Post.user_id == current_user.id,
                Post.post_type == "stage",
                Post.video_type == request.video_type,
                Post.mux_asset_id.isnot(None),
                Post.is_deleted == False,
                Post.moderation_status == _ACTIVE,
            ).scalar() or 0
            badge_service.check_and_award_badges(
                str(current_user.id),
                f"{request.video_type}_videos",
                vtype_count,
                db,
            )
        db.commit()

    # Curious Mind: Track questions posted (Lab posts)
    if result["success"] and request.post_type == "lab":
        question_count = db.query(func.count(Post.id)).filter(
            Post.user_id == current_user.id,
            Post.post_type == "lab",
            Post.is_deleted == False,
            Post.moderation_status == _ACTIVE,
        ).scalar() or 0
        badge_service.check_and_award_badges(str(current_user.id), "questions_posted", question_count, db)
        db.commit()

    # ML feature: social engagement is the #1 retention predictor.
    try:
        track_event(
            db=db,
            event_name="PostCreated",
            user_id=current_user.id,
            properties={
                "post_id": result.get("post_id"),
                "post_type": request.post_type,
                "video_type": request.video_type,
                "has_video": bool(request.mux_asset_id),
                "tags": request.tags or [],
                "is_wip": bool(request.is_wip),
                "feedback_type": request.feedback_type,
            },
        )
    except Exception:
        logger.exception("create_post: track failed (non-fatal)")

    return result


@router.post("/posts/{post_id}/react")
def add_reaction(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Like a post. Idempotent.
    """
    result = post_service.add_reaction(
        post_id=post_id,
        user_id=str(current_user.id),
        db=db
    )

    if not result["success"]:
        status_code = 429 if result.get("rate_limited") else 400
        raise HTTPException(status_code=status_code, detail=result)

    db.commit()

    # Skip badge + notify logic on repeat calls (idempotent no-op)
    if result.get("already_reacted"):
        return result

    # Badge triggers
    # 1. User gave a like (The Critic)
    badge_service.increment_reaction_given(str(current_user.id), db)

    # 2. Post owner received a like (Crowd Favorite + per-type Move Magnet / Fan Favorite / Guild Applause)
    from models.community import Post
    post = db.query(Post).filter(Post.id == post_id).first()
    if post:
        badge_service.increment_reaction_received(str(post.user_id), db, video_type=post.video_type)

        if str(post.user_id) != str(current_user.id):
            from models.user import UserProfile
            profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
            reactor_name = profile.first_name if profile else "Someone"
            notification_service.create_notification(
                user_id=str(post.user_id),
                type="reaction_received",
                title="❤️ New Like",
                message=f"{reactor_name} liked your post \"{post.title[:50]}\"",
                reference_type="post",
                reference_id=str(post.id),
                db=db
            )

    db.commit()

    try:
        track_event(
            db=db,
            event_name="ReactionGiven",
            user_id=current_user.id,
            properties={
                "post_id": post_id,
                "reaction_type": "like",
            },
        )
    except Exception:
        logger.exception("add_reaction: track failed (non-fatal)")

    return result


@router.delete("/posts/{post_id}/react")
def remove_reaction(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove your reaction from a post.
    """
    result = post_service.remove_reaction(
        post_id=post_id,
        user_id=str(current_user.id),
        db=db
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result)
    
    db.commit()
    return result


@router.post("/posts/{post_id}/replies")
def add_reply(
    post_id: str,
    request: ReplyCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a reply/comment to a post.
    Commenting is free.
    Note: Will fail if post has feedback_type='hype' (comments disabled).
    """
    result = post_service.add_reply(
        post_id=post_id,
        user_id=str(current_user.id),
        content=request.content,
        mux_asset_id=request.mux_asset_id,
        mux_playback_id=request.mux_playback_id,
        db=db
    )

    if not result["success"]:
        status_code = 429 if result.get("rate_limited") else 400
        raise HTTPException(status_code=status_code, detail=result)

    db.commit()

    # Badge triggers
    # The Socialite: Track comments posted. Filters soft-deleted replies so
    # the badge count reflects real state (deleting a comment un-counts it).
    if result["success"]:
        from sqlalchemy import func
        from models.community import PostReply, Post
        comment_count = db.query(func.count(PostReply.id)).filter(
            PostReply.user_id == current_user.id,
            PostReply.is_deleted == False,
        ).scalar() or 0
        badge_service.check_and_award_badges(str(current_user.id), "comments_posted", comment_count, db)

        # Notify post owner about the reply (don't notify self)
        post = db.query(Post).filter(Post.id == post_id).first()
        if post and str(post.user_id) != str(current_user.id):
            from models.user import UserProfile
            profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
            replier_name = profile.first_name if profile else "Someone"
            notification_service.create_notification(
                user_id=str(post.user_id),
                type="reply_received",
                title="💬 New Reply",
                message=f"{replier_name} replied to your post \"{post.title[:50]}\"",
                reference_type="post",
                reference_id=str(post.id),
                db=db
            )

        db.commit()

    try:
        track_event(
            db=db,
            event_name="ReplyPosted",
            user_id=current_user.id,
            properties={
                "post_id": post_id,
                "has_video": bool(request.mux_asset_id),
            },
        )
    except Exception:
        logger.exception("add_reply: track failed (non-fatal)")

    return result


@router.post("/posts/{post_id}/replies/{reply_id}/accept")
def mark_solution(
    post_id: str,
    reply_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a reply as the accepted solution.
    Only the original poster can do this.
    Awards 15 claves to the helper.
    """
    result = post_service.mark_solution(
        post_id=post_id,
        reply_id=reply_id,
        user_id=str(current_user.id),
        db=db
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result)
    
    db.commit()
    
    # Badge triggers: Helper (El Maestro)
    from models.community import PostReply, Post
    reply = db.query(PostReply).filter(PostReply.id == reply_id).first()
    if reply:
        badge_service.increment_solution_accepted(str(reply.user_id), db)

        # Notify the helper that their answer was accepted
        if str(reply.user_id) != str(current_user.id):
            post = db.query(Post).filter(Post.id == post_id).first()
            notification_service.create_notification(
                user_id=str(reply.user_id),
                type="answer_accepted",
                title="✅ Answer Accepted!",
                message=f"Your answer was marked as the solution! (+15 🥢)",
                reference_type="post",
                reference_id=str(post_id),
                db=db
            )

        db.commit()

    try:
        track_event(
            db=db,
            event_name="AnswerAccepted",
            user_id=current_user.id,
            properties={
                "post_id": post_id,
                "reply_id": reply_id,
                "helper_user_id": str(reply.user_id) if reply else None,
            },
        )
    except Exception:
        logger.exception("mark_solution: track failed (non-fatal)")

    return result


@router.put("/posts/{post_id}/replies/{reply_id}")
def update_reply(
    post_id: str,
    reply_id: str,
    request: ReplyUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a reply (owner or admin).
    """
    from models.user import UserRole
    is_admin = current_user.role == UserRole.ADMIN
    result = post_service.update_reply(
        post_id=post_id,
        reply_id=reply_id,
        user_id=str(current_user.id),
        content=request.content,
        is_admin=is_admin,
        db=db
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result)

    db.commit()
    return result


@router.delete("/posts/{post_id}/replies/{reply_id}")
def delete_reply(
    post_id: str,
    reply_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a reply (owner or admin).
    """
    from models.user import UserRole
    is_admin = current_user.role == UserRole.ADMIN
    result = post_service.delete_reply(
        post_id=post_id,
        reply_id=reply_id,
        user_id=str(current_user.id),
        is_admin=is_admin,
        db=db
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result)

    db.commit()
    return result


@router.put("/posts/{post_id}")
def update_post(
    post_id: str,
    request: PostUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a post (own posts or admin).
    Only title, body, tags, is_wip, and feedback_type can be updated.
    """
    from models.user import UserRole
    is_admin = current_user.role == UserRole.ADMIN
    result = post_service.update_post(
        post_id=post_id,
        user_id=str(current_user.id),
        title=request.title,
        body=request.body,
        tags=request.tags,
        is_wip=request.is_wip,
        feedback_type=request.feedback_type,
        is_admin=is_admin,
        db=db
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result)
    
    db.commit()
    return result


@router.delete("/posts/{post_id}")
def delete_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete your own post.
    Frees up a video slot if it was a Stage post.
    """
    result = post_service.delete_post(
        post_id=post_id,
        user_id=str(current_user.id),
        db=db
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result)

    # Reverse any post-reward claves so deleting a rewarded post within the
    # 72h window can't be used to farm.
    try:
        posting_reward_service.clawback_post_reward(post_id, db)
    except Exception:
        logger.exception("delete_post: clawback failed (non-fatal)")

    db.commit()
    return result


@router.post("/posts/{post_id}/save")
def save_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Bookmark a post. Idempotent — saving twice is a no-op."""
    from models.community import Post, SavedPost

    post = db.query(Post).filter(Post.id == post_id, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = db.query(SavedPost).filter(
        SavedPost.user_id == current_user.id,
        SavedPost.post_id == post_id
    ).first()
    if existing:
        return {"success": True, "message": "Already saved"}

    db.add(SavedPost(user_id=current_user.id, post_id=post_id))
    db.commit()
    return {"success": True, "message": "Post saved"}


@router.delete("/posts/{post_id}/save")
def unsave_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a bookmark from a post."""
    from models.community import SavedPost

    saved = db.query(SavedPost).filter(
        SavedPost.user_id == current_user.id,
        SavedPost.post_id == post_id
    ).first()
    if not saved:
        return {"success": True, "message": "Not saved"}

    db.delete(saved)
    db.commit()
    return {"success": True, "message": "Post unsaved"}


@router.get("/saved")
def get_saved_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current user's saved/bookmarked posts."""
    from models.community import Post, SavedPost

    saved_post_ids = (
        db.query(SavedPost.post_id)
        .filter(SavedPost.user_id == current_user.id)
        .order_by(SavedPost.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    post_ids = [row[0] for row in saved_post_ids]
    if not post_ids:
        return []

    from sqlalchemy import or_ as _or
    from models.community import ModerationStatus as _ModStatus

    posts = db.query(Post).filter(
        Post.id.in_(post_ids),
        Post.is_deleted == False,
        _or(
            Post.moderation_status == _ModStatus.ACTIVE.value,
            Post.user_id == current_user.id,
        ),
    ).all()

    # Preserve saved order
    post_map = {p.id: p for p in posts}
    ordered = [post_map[pid] for pid in post_ids if pid in post_map]

    return post_service.format_posts_bulk_public(ordered, str(current_user.id), db)


@router.get("/upload-check-lab", response_model=UploadCheckResponse)
def check_question_eligibility(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Pre-check to see if user can post a new question.
    Checks slot limit based on subscription tier.
    """
    from services.clave_service import get_question_slot_status
    status = get_question_slot_status(str(current_user.id), db)
    return UploadCheckResponse(**status)


@router.get("/upload-check", response_model=UploadCheckResponse)
def check_upload_eligibility(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Pre-upload check to see if user can upload a new video.
    Checks slot limit based on subscription tier.
    """
    from services.clave_service import get_video_slot_status
    status = get_video_slot_status(str(current_user.id), db)
    return UploadCheckResponse(**status)


@router.get("/tags", response_model=List[TagResponse])
def get_tags(
    db: Session = Depends(get_db)
):
    """
    Get all available community tags.
    """
    tags = post_service.get_tags(db)
    return tags


@router.get("/search")
def search_posts(
    q: str = Query(..., min_length=2, max_length=200, description="Search query"),
    post_type: Optional[str] = Query(None),
    tag: Optional[str] = Query(None, description="Filter by single tag slug"),
    tags: Optional[str] = Query(None, description="Comma-separated tag slugs"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search posts by title and/or tags.
    """
    tags_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else None
    posts = post_service.search_posts(
        query=q,
        post_type=post_type,
        tag=tag,
        tags=tags_list,
        skip=skip,
        limit=limit,
        current_user_id=str(current_user.id),
        db=db
    )
    return posts
