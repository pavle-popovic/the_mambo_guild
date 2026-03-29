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
from dependencies import get_current_user
from services import post_service, badge_service, notification_service

logger = logging.getLogger(__name__)
from schemas.community import (
    PostCreateRequest, PostUpdateRequest, PostResponse, PostDetailResponse,
    ReactionRequest, ReplyCreateRequest, ReplyUpdateRequest, ReplyResponse,
    UploadCheckResponse, TagResponse
)

router = APIRouter(tags=["Community"])


@router.get("/stats")
async def get_community_stats(
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
async def get_my_rank(
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
async def get_feed(
    post_type: Optional[str] = Query(None, description="Filter by 'stage' or 'lab'"),
    tag: Optional[str] = Query(None, description="Filter by single tag slug"),
    tags: Optional[str] = Query(None, description="Comma-separated tag slugs for multi-tag filter"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
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
    posts = post_service.get_feed(
        post_type=post_type,
        tag=tag,
        tags=tags_list,
        skip=skip,
        limit=limit,
        current_user_id=str(current_user.id),
        db=db
    )
    return posts


@router.get("/posts/{post_id}")
async def get_post_detail(
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
async def create_post(
    request: PostCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new post.
    - Stage posts cost 15 claves
    - Lab posts cost 5 claves
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
        mux_asset_id=request.mux_asset_id,
        mux_playback_id=request.mux_playback_id,
        video_duration_seconds=request.video_duration_seconds,
        db=db
    )
    
    if not result["success"]:
        error_message = result.get("message", "Failed to create post")
        raise HTTPException(
            status_code=400 if "Insufficient" in error_message else 422,
            detail={"message": error_message, **result}
        )
    
    db.commit()
    
    # Badge triggers
    # Center Stage: Track video posts (Stage posts with video)
    if result["success"] and request.post_type == "stage" and request.mux_asset_id:
        from sqlalchemy import func
        from models.community import Post
        video_count = db.query(func.count(Post.id)).filter(
            Post.user_id == current_user.id,
            Post.post_type == "stage",
            Post.mux_asset_id.isnot(None)
        ).scalar() or 0
        badge_service.check_and_award_badges(str(current_user.id), "videos_posted", video_count, db)
        db.commit()
    
    # Curious Mind: Track questions posted (Lab posts)
    if result["success"] and request.post_type == "lab":
        from sqlalchemy import func
        from models.community import Post
        question_count = db.query(func.count(Post.id)).filter(
            Post.user_id == current_user.id,
            Post.post_type == "lab"
        ).scalar() or 0
        badge_service.check_and_award_badges(str(current_user.id), "questions_posted", question_count, db)
        db.commit()
    
    return result


@router.post("/posts/{post_id}/react")
async def add_reaction(
    post_id: str,
    request: ReactionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add or change a reaction on a post.
    Costs 1 clave (only charged for new reactions, not changes).
    """
    result = post_service.add_reaction(
        post_id=post_id,
        user_id=str(current_user.id),
        reaction_type=request.reaction_type,
        db=db
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result)
    
    db.commit()
    
    # Badge triggers
    # 1. User gave a reaction (The Critic)
    badge_service.increment_reaction_given(str(current_user.id), db)
    
    # 2. Post owner received a reaction (The Star + Specific types)
    from models.community import Post
    post = db.query(Post).filter(Post.id == post_id).first()
    if post:
        badge_service.increment_reaction_received(str(post.user_id), request.reaction_type, db)

        # Notify post owner about the reaction (don't notify self)
        if str(post.user_id) != str(current_user.id):
            emoji_map = {"fire": "🔥", "ruler": "📏", "clap": "👏"}
            emoji = emoji_map.get(request.reaction_type, "")
            from models.user import UserProfile
            profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
            reactor_name = profile.first_name if profile else "Someone"
            notification_service.create_notification(
                user_id=str(post.user_id),
                type="reaction_received",
                title=f"{emoji} New Reaction",
                message=f"{reactor_name} reacted {emoji} to your post \"{post.title[:50]}\"",
                reference_type="post",
                reference_id=str(post.id),
                db=db
            )

    db.commit()

    return result


@router.delete("/posts/{post_id}/react")
async def remove_reaction(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove your reaction from a post.
    Note: Claves are NOT refunded when removing a reaction.
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
async def add_reply(
    post_id: str,
    request: ReplyCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a reply/comment to a post.
    Costs 2 claves.
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
        raise HTTPException(status_code=400, detail=result)
    
    db.commit()
    
    # Badge triggers
    # The Socialite: Track comments posted
    if result["success"]:
        from sqlalchemy import func
        from models.community import PostReply, Post
        comment_count = db.query(func.count(PostReply.id)).filter(
            PostReply.user_id == current_user.id
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

    return result


@router.post("/posts/{post_id}/replies/{reply_id}/accept")
async def mark_solution(
    post_id: str,
    reply_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a reply as the accepted solution.
    Only the original poster can do this.
    Awards 10 claves to the helper.
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

    return result


@router.put("/posts/{post_id}/replies/{reply_id}")
async def update_reply(
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
async def delete_reply(
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
async def update_post(
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
async def delete_post(
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
    
    db.commit()
    return result


@router.get("/upload-check-lab", response_model=UploadCheckResponse)
async def check_question_eligibility(
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
async def check_upload_eligibility(
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
async def get_tags(
    db: Session = Depends(get_db)
):
    """
    Get all available community tags.
    """
    tags = post_service.get_tags(db)
    return tags


@router.get("/search")
async def search_posts(
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
