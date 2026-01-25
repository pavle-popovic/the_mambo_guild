"""
Community API Endpoints - The Stage & The Lab
/api/community - Posts, reactions, replies, solutions
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from models import get_db
from models.user import User
from dependencies import get_current_user
from services import post_service, badge_service
from schemas.community import (
    PostCreateRequest, PostUpdateRequest, PostResponse, PostDetailResponse,
    ReactionRequest, ReplyCreateRequest, ReplyResponse,
    UploadCheckResponse, TagResponse
)

router = APIRouter(tags=["Community"])


@router.get("/stats")
async def get_community_stats(
    db: Session = Depends(get_db)
):
    """
    Get public community stats (no auth required).
    Returns total member count, active users, and leaderboard.
    """
    from models.user import User, UserProfile
    from models.community import Post, PostReaction, PostReply
    from sqlalchemy import func
    
    # Count ALL registered accounts (not just paying)
    total_users = db.query(User).count()
    
    # Simulated active users (based on time of day and total users)
    import random
    base_active = max(5, int(total_users * 0.02))  # ~2% of users online
    active_now = base_active + random.randint(-3, 5)
    active_now = max(3, active_now)  # Minimum 3
    
    # Get real leaderboard - top 3 users by community activity
    # Calculate score: posts * 5 + reactions_received * 2 + replies * 3
    leaderboard_data = []
    
    # Get users with most posts and engagement
    top_users = db.query(
        User.id,
        UserProfile.first_name,
        UserProfile.avatar_url,
        func.count(Post.id).label('post_count')
    ).join(
        UserProfile, User.id == UserProfile.user_id, isouter=True
    ).join(
        Post, User.id == Post.user_id, isouter=True
    ).group_by(
        User.id, UserProfile.first_name, UserProfile.avatar_url
    ).having(
        func.count(Post.id) > 0
    ).order_by(
        func.count(Post.id).desc()
    ).limit(3).all()
    
    for idx, user in enumerate(top_users):
        # Calculate engagement score for this user
        post_count = user.post_count or 0
        
        # Get total reactions on this user's posts
        reaction_count = db.query(func.count(PostReaction.id)).join(
            Post, PostReaction.post_id == Post.id
        ).filter(Post.user_id == user.id).scalar() or 0
        
        # Get total replies made by this user
        reply_count = db.query(PostReply).filter(PostReply.user_id == user.id).count()
        
        score = (post_count * 5) + (reaction_count * 2) + (reply_count * 3)
        
        leaderboard_data.append({
            "id": str(user.id),
            "first_name": user.first_name or "User",
            "avatar_url": user.avatar_url,
            "score": score,
            "rank": idx + 1
        })
    
    return {
        "member_count": total_users,
        "active_now": active_now,
        "leaderboard": leaderboard_data
    }



@router.get("/feed", response_model=List[PostResponse])
async def get_feed(
    post_type: Optional[str] = Query(None, description="Filter by 'stage' or 'lab'"),
    tag: Optional[str] = Query(None, description="Filter by tag slug"),
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
    """
    posts = post_service.get_feed(
        post_type=post_type,
        tag=tag,
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
    print(f"[COMMUNITY] Creating post - User: {current_user.email}, Type: {request.post_type}, Tags: {request.tags}, Title: {request.title[:50] if request.title else 'None'}")
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
    
    # No badge trigger for post creation in v4
    
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
    
    # 2. Post owner received a reaction (The Star)
    from models.community import Post
    post = db.query(Post).filter(Post.id == post_id).first()
    if post:
        badge_service.increment_reaction_received(str(post.user_id), db)
        
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
    from models.community import PostReply
    reply = db.query(PostReply).filter(PostReply.id == reply_id).first()
    if reply:
        badge_service.increment_solution_accepted(str(reply.user_id), db)
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
    Update your own post.
    Only title, body, tags, is_wip, and feedback_type can be updated.
    """
    result = post_service.update_post(
        post_id=post_id,
        user_id=str(current_user.id),
        title=request.title,
        body=request.body,
        tags=request.tags,
        is_wip=request.is_wip,
        feedback_type=request.feedback_type,
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
    q: str = Query(..., min_length=2, description="Search query"),
    post_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search posts by title.
    """
    posts = post_service.search_posts(
        query=q,
        post_type=post_type,
        skip=skip,
        limit=limit,
        current_user_id=str(current_user.id),
        db=db
    )
    return posts
