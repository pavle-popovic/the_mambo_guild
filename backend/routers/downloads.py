"""
Secure Download Router - Handles video download requests with signed URLs.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
import httpx
import logging

from dependencies import get_db, get_current_user
from models.user import User
from models.course import Lesson
from services.download_service import (
    get_download_service,
    check_download_limit,
    record_download,
    get_download_status,
    DOWNLOAD_URL_EXPIRATION_SECONDS
)
from services.mux_service import get_mux_download_url

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/downloads", tags=["downloads"])


class DownloadStatusResponse(BaseModel):
    downloads_used: int
    downloads_remaining: int
    downloads_limit: int


class DownloadUrlRequest(BaseModel):
    lesson_id: str
    quality: Optional[str] = "high"  # "high", "medium", "low"


class DownloadUrlResponse(BaseModel):
    download_url: str
    expires_in_seconds: int
    downloads_remaining: int
    warning: str


@router.get("/status", response_model=DownloadStatusResponse)
async def get_user_download_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the current user's download status for today.
    """
    status = get_download_status(str(current_user.id), db)
    return DownloadStatusResponse(**status)


@router.post("/lesson/{lesson_id}", response_model=DownloadUrlResponse)
async def get_lesson_download_url(
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a secure, time-limited download URL for a lesson video.
    
    - Checks daily download limit (5/day)
    - Generates signed URL that expires in 1 hour
    - Prevents link sharing (expired links don't work)
    """
    user_id = str(current_user.id)
    
    # Check download limit
    allowed, remaining, message = check_download_limit(user_id, db)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=message
        )
    
    # Get the lesson
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    # Check if lesson has a video
    if not lesson.mux_asset_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This lesson does not have a downloadable video"
        )
    
    # Get Mux download URL
    download_url = get_mux_download_url(lesson.mux_asset_id)
    
    if not download_url:
        # Fallback: Try to get from R2 if we have a stored video
        download_service = get_download_service()
        if lesson.video_url and download_service.s3_client:
            # Extract object key from video_url
            object_key = lesson.video_url.split('/')[-1] if '/' in lesson.video_url else lesson.video_url
            download_url = download_service.generate_signed_download_url(
                object_key=f"lessons/{object_key}",
                filename=f"{lesson.title.replace(' ', '_')}.mp4"
            )
    
    if not download_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Download is temporarily unavailable. Please try again later."
        )
    
    # Record the download
    success, new_remaining = record_download(user_id, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Daily download limit reached"
        )
    
    db.commit()
    
    logger.info(f"User {user_id} requested download for lesson {lesson_id}")
    
    return DownloadUrlResponse(
        download_url=download_url,
        expires_in_seconds=DOWNLOAD_URL_EXPIRATION_SECONDS,
        downloads_remaining=new_remaining,
        warning="Links are generated for your account only and expire in 1 hour."
    )


@router.post("/community/{post_id}", response_model=DownloadUrlResponse)
async def get_community_video_download_url(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate a secure download URL for a community post video.
    Only the video owner can download their own videos.
    """
    from models.community import Post
    
    user_id = str(current_user.id)
    
    # Get the post
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Only allow owner to download their own video
    if str(post.user_id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only download your own videos"
        )
    
    if not post.mux_asset_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This post does not have a downloadable video"
        )
    
    # Check download limit (community downloads also count)
    allowed, remaining, message = check_download_limit(user_id, db)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=message
        )
    
    # Get Mux download URL
    download_url = get_mux_download_url(post.mux_asset_id)
    
    if not download_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Download is temporarily unavailable. Please try again later."
        )
    
    # Record the download
    success, new_remaining = record_download(user_id, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Daily download limit reached"
        )
    
    db.commit()
    
    return DownloadUrlResponse(
        download_url=download_url,
        expires_in_seconds=DOWNLOAD_URL_EXPIRATION_SECONDS,
        downloads_remaining=new_remaining,
        warning="Links are generated for your account only and expire in 1 hour."
    )


@router.get("/lesson/{lesson_id}/stream")
async def stream_lesson_download(
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Stream video download with Content-Disposition header to force download.
    This is the most reliable method - browser will always download, not stream.
    
    State-of-the-art approach: Proxy the video through our backend with proper headers.
    """
    user_id = str(current_user.id)
    
    # Check download limit
    allowed, remaining, message = check_download_limit(user_id, db)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=message
        )
    
    # Get the lesson
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    # Check if lesson has a video
    if not lesson.mux_asset_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This lesson does not have a downloadable video"
        )
    
    # Get Mux download URL
    download_url = get_mux_download_url(lesson.mux_asset_id)
    
    if not download_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Download is temporarily unavailable. Please try again later."
        )
    
    # Record the download BEFORE streaming (so user gets credit even if they cancel)
    success, new_remaining = record_download(user_id, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Daily download limit reached"
        )
    db.commit()
    
    logger.info(f"User {user_id} streaming download for lesson {lesson_id}")
    
    # Sanitize filename for Content-Disposition header
    filename = f"{lesson.title.replace(' ', '_').replace('/', '_')}.mp4"
    # Remove any characters that could break the header
    filename = "".join(c for c in filename if c.isalnum() or c in "._-")
    
    async def generate():
        """Stream video chunks from Mux to client"""
        async with httpx.AsyncClient(timeout=300.0) as client:
            async with client.stream("GET", download_url, follow_redirects=True) as response:
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="Failed to fetch video from source"
                    )
                
                # Stream chunks to client
                async for chunk in response.aiter_bytes(chunk_size=8192):
                    yield chunk
    
    # Return streaming response with Content-Disposition header
    return StreamingResponse(
        generate(),
        media_type="video/mp4",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Type": "video/mp4",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        }
    )


@router.get("/community/{post_id}/stream")
async def stream_community_video_download(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Stream community video download with Content-Disposition header to force download.
    Only the video owner can download their own videos.
    """
    from models.community import Post
    
    user_id = str(current_user.id)
    
    # Get the post
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Only allow owner to download their own video
    if str(post.user_id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only download your own videos"
        )
    
    if not post.mux_asset_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This post does not have a downloadable video"
        )
    
    # Check download limit
    allowed, remaining, message = check_download_limit(user_id, db)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=message
        )
    
    # Get Mux download URL
    download_url = get_mux_download_url(post.mux_asset_id)
    
    if not download_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Download is temporarily unavailable. Please try again later."
        )
    
    # Record the download BEFORE streaming
    success, new_remaining = record_download(user_id, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Daily download limit reached"
        )
    db.commit()
    
    logger.info(f"User {user_id} streaming download for community post {post_id}")
    
    # Sanitize filename
    filename = f"community_video_{post_id}.mp4"
    filename = "".join(c for c in filename if c.isalnum() or c in "._-")
    
    async def generate():
        """Stream video chunks from Mux to client"""
        async with httpx.AsyncClient(timeout=300.0) as client:
            async with client.stream("GET", download_url, follow_redirects=True) as response:
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail="Failed to fetch video from source"
                    )
                
                async for chunk in response.aiter_bytes(chunk_size=8192):
                    yield chunk
    
    return StreamingResponse(
        generate(),
        media_type="video/mp4",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Type": "video/mp4",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        }
    )
