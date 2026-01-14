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
    PostCreateRequest, PostResponse, PostDetailResponse,
    ReactionRequest, ReplyCreateRequest, ReplyResponse,
    UploadCheckResponse, TagResponse
)

router = APIRouter(tags=["Community"])


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
        raise HTTPException(
            status_code=400 if "Insufficient" in result.get("message", "") else 422,
            detail=result
        )
    
    db.commit()
    
    # Check for badge eligibility after creating post
    badge_service.check_and_award_badges(str(current_user.id), db)
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
    
    # Check for badge eligibility
    badge_service.check_and_award_badges(str(current_user.id), db)
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
    
    # Check for badge eligibility for the helper
    from models.community import PostReply
    reply = db.query(PostReply).filter(PostReply.id == reply_id).first()
    if reply:
        badge_service.check_and_award_badges(str(reply.user_id), db)
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
