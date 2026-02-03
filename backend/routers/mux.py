"""
Mux video upload endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Header, Query
from pydantic import BaseModel
from typing import Optional
from dependencies import get_admin_user, get_current_user_optional, get_current_user
from models.user import User, UserRole
from models.course import Lesson, World, Level
from models import get_db
from sqlalchemy.orm import Session
from services.mux_service import create_direct_upload
from services.auth_service import decode_access_token
from config import settings
import hmac
import hashlib
import base64
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


def get_admin_user_from_token_or_query(
    token_query: Optional[str] = Query(None, alias="token"),
    current_user_opt: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> User:
    """
    Get admin user from Bearer token (preferred) or query param token (fallback for MuxUploader).
    """
    # Try Bearer token first (standard auth)
    if current_user_opt and current_user_opt.role == UserRole.ADMIN:
        return current_user_opt
    
    # Fallback: try token from query params (for MuxUploader compatibility)
    if token_query:
        try:
            payload = decode_access_token(token_query)
            if payload:
                user_id_str = payload.get("sub")
                if user_id_str:
                    import uuid
                    try:
                        user_id = uuid.UUID(user_id_str)
                        user = db.query(User).filter(User.id == user_id).first()
                        if user and user.role == UserRole.ADMIN:
                            return user
                    except ValueError:
                        pass
        except Exception:
            pass
    
    # No valid admin token found
    raise HTTPException(
        status_code=401,
        detail="Could not validate admin credentials"
    )


class CreateUploadRequest(BaseModel):
    filename: Optional[str] = None
    lesson_id: Optional[str] = None  # Pass lesson_id to associate upload with lesson
    course_id: Optional[str] = None  # Pass course_id for course preview uploads
    level_id: Optional[str] = None  # Pass level_id for skill tree node preview uploads
    post_id: Optional[str] = None  # Pass post_id for community post uploads


class CreateUploadResponse(BaseModel):
    upload_id: str
    upload_url: str
    status: str


@router.post("/upload-url")
async def create_mux_upload_url(
    request: Request,
    request_data: Optional[CreateUploadRequest] = None,  # Accept JSON body (Pydantic model)
    lesson_id: Optional[str] = Query(None),  # Accept from query params for MuxUploader compatibility
    filename: Optional[str] = Query(None),   # Accept from query params
    post_id: Optional[str] = Query(None),  # For community posts
    current_user_opt: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Create a Mux direct upload URL for video upload.
    - Admin only for lesson/course videos
    - Authenticated users for community posts
    Supports both JSON body (our API client) and query params (for MuxUploader compatibility).
    
    MuxUploader calls this endpoint with POST and query params, expecting { url, uploadId } response.
    Our API client calls with JSON body, expecting { upload_id, upload_url } response.
    """
    # Handle both request body (Pydantic model) and query params
    # Priority: query params (for MuxUploader) > request body (for our API client)
    lesson_id_val = lesson_id or (request_data.lesson_id if request_data else None)
    course_id_val = request_data.course_id if request_data else None
    level_id_val = request_data.level_id if request_data else None
    post_id_val = post_id or (request_data.post_id if request_data else None)
    filename_val = filename or (request_data.filename if request_data else None)

    logger.debug(f"Upload URL request - lesson: {lesson_id_val}, course: {course_id_val}, level: {level_id_val}, post: {post_id_val}")

    # Auth check: Admin for lessons/courses/levels, authenticated user for community posts
    if lesson_id_val or course_id_val or level_id_val:
        # Lesson/course uploads require admin
        if not current_user_opt or current_user_opt.role != UserRole.ADMIN:
            # Try query param token as fallback
            token_query = request.query_params.get("token")
            if token_query:
                try:
                    payload = decode_access_token(token_query)
                    if payload:
                        user_id_str = payload.get("sub")
                        if user_id_str:
                            import uuid
                            try:
                                user_id = uuid.UUID(user_id_str)
                                user = db.query(User).filter(User.id == user_id).first()
                                if user and user.role == UserRole.ADMIN:
                                    current_user_opt = user
                            except ValueError:
                                pass
                except Exception:
                    pass
            if not current_user_opt or current_user_opt.role != UserRole.ADMIN:
                raise HTTPException(status_code=403, detail="Admin access required for lesson/course video uploads")
    elif post_id_val:
        # Community post uploads require authenticated user
        if not current_user_opt:
            raise HTTPException(status_code=401, detail="Authentication required for community post uploads")
    else:
        # No entity specified - require admin
        if not current_user_opt or current_user_opt.role != UserRole.ADMIN:
            raise HTTPException(status_code=401, detail="Admin access required")
    
    if not settings.MUX_TOKEN_ID or not settings.MUX_TOKEN_SECRET:
        logger.error("Mux credentials not configured")
        raise HTTPException(
            status_code=500,
            detail="Video service not configured"
        )
    
    # Generate metadata for Mux asset organization
    external_id = None
    title = None
    creator_id = None
    passthrough = None
    passthrough_data = {}
    
    try:
        if lesson_id_val:
            # Fetch lesson data for metadata
            lesson = db.query(Lesson).filter(Lesson.id == lesson_id_val).first()
            if lesson:
                # Get course/level info for better organization
                level = db.query(Level).filter(Level.id == lesson.level_id).first()
                world = None
                if level:
                    world = db.query(World).filter(World.id == level.world_id).first()
                
                # Generate external_id: "lesson-{course_slug}-w{week}-d{day}-l{order}"
                if world:
                    course_slug = world.slug or world.title.lower().replace(" ", "-")
                    week_str = f"w{lesson.week_number}" if lesson.week_number else ""
                    day_str = f"d{lesson.day_number}" if lesson.day_number else ""
                    order_str = f"l{lesson.order_index}" if lesson.order_index else ""
                    parts = [p for p in [course_slug, week_str, day_str, order_str] if p]
                    external_id = f"lesson-{'-'.join(parts)}"
                else:
                    external_id = f"lesson-{lesson_id_val[:8]}"
                
                # Generate title: "{course_title} - {lesson_title}"
                if world:
                    title = f"{world.title} - {lesson.title}"
                else:
                    title = lesson.title
                
                creator_id = "lesson"
                
                # Enhanced passthrough
                passthrough_data = {
                    "lesson_id": lesson_id_val,
                    "type": "lesson"
                }
                if world:
                    passthrough_data["course_slug"] = world.slug or world.title.lower().replace(" ", "-")
                if lesson.week_number:
                    passthrough_data["week"] = lesson.week_number
                if lesson.day_number:
                    passthrough_data["day"] = lesson.day_number
                if lesson.order_index:
                    passthrough_data["lesson_order"] = lesson.order_index
                
        elif course_id_val:
            # Fetch course data for metadata
            world = db.query(World).filter(World.id == course_id_val).first()
            if world:
                # Generate external_id: "course-preview-{course_slug}"
                course_slug = world.slug or world.title.lower().replace(" ", "-")
                external_id = f"course-preview-{course_slug}"
                
                # Generate title: "{course_title} - Preview"
                title = f"{world.title} - Preview"
                
                creator_id = "course-preview"
                
                # Enhanced passthrough
                passthrough_data = {
                    "course_id": course_id_val,
                    "type": "course-preview",
                    "course_slug": course_slug
                }
        elif level_id_val:
            # Level preview video - fetch level data for metadata
            level = db.query(Level).filter(Level.id == level_id_val).first()
            if level:
                # Get world info for better organization
                world = db.query(World).filter(World.id == level.world_id).first()

                # Generate external_id: "level-preview-{course_slug}-{level_title}"
                level_slug = level.title.lower().replace(" ", "-")[:30]
                if world:
                    course_slug = world.slug or world.title.lower().replace(" ", "-")
                    external_id = f"level-preview-{course_slug}-{level_slug}"
                else:
                    external_id = f"level-preview-{level_id_val[:8]}"

                # Generate title: "{course_title} - {level_title} Preview"
                if world:
                    title = f"{world.title} - {level.title} Preview"
                else:
                    title = f"{level.title} Preview"

                creator_id = "level-preview"

                # Enhanced passthrough
                passthrough_data = {
                    "level_id": level_id_val,
                    "type": "level-preview"
                }
                if world:
                    passthrough_data["course_slug"] = world.slug or world.title.lower().replace(" ", "-")
                    passthrough_data["course_id"] = str(world.id)
        elif post_id_val:
            # Community post - fetch post data for metadata
            from models.community import Post
            post = db.query(Post).filter(Post.id == post_id_val).first()
            if post:
                # Generate external_id: "community-post-{post_id}"
                external_id = f"community-post-{post_id_val[:8]}"
                
                # Generate title: "{post_title}"
                title = post.title[:512] if post.title else "Community Post"
                
                # Set creator_id based on post type
                creator_id = "community-stage" if post.post_type == "stage" else "community-lab"
                
                # Enhanced passthrough
                passthrough_data = {
                    "post_id": post_id_val,
                    "type": "community-post",
                    "post_type": post.post_type
                }
            else:
                # Post doesn't exist yet (during creation) - use basic metadata
                external_id = f"community-post-{post_id_val[:8]}"
                title = "Community Post"
                creator_id = "community-stage"  # Default, will be updated when post is created
                passthrough_data = {
                    "post_id": post_id_val,
                    "type": "community-post"
                }
    except Exception as e:
        logger.debug(f"Error fetching metadata: {type(e).__name__}")
        # Continue without metadata if fetch fails
    
    # Create passthrough JSON string
    if passthrough_data:
        passthrough = json.dumps(passthrough_data)
    # Community posts get resolution cap (1080p), lesson/course videos get MP4 support
    is_community_upload = post_id_val is not None
    result = create_direct_upload(
        filename=filename_val,
        test=False,
        passthrough=passthrough,
        external_id=external_id,
        title=title,
        creator_id=creator_id,
        is_community=is_community_upload
    )
    
    if result.get("status") == "error":
        logger.error(f"Failed to create upload URL")
        raise HTTPException(
            status_code=500,
            detail="Failed to create video upload URL"
        )
    
    upload_id = result.get("upload_id", "unknown")
    upload_url = result.get("upload_url", "unknown")
    logger.info(f"Upload URL created: {upload_id}")
    
    # If called via query params (MuxUploader), return format it expects
    # MuxUploader expects { url, uploadId }
    # Check if this was called with query params (MuxUploader pattern)
    if lesson_id or filename:
        # Return MuxUploader-compatible format
        from fastapi.responses import JSONResponse
        return JSONResponse({"url": upload_url, "uploadId": upload_id})
    
    # Otherwise return standard format (for our API client)
    return CreateUploadResponse(
        upload_id=upload_id,
        upload_url=upload_url,
        status=result["status"]
    )


class UploadStatusResponse(BaseModel):
    status: str  # "waiting", "asset_created", "ready", "errored"
    asset_id: Optional[str] = None
    playback_id: Optional[str] = None


@router.get("/upload-status/{upload_id}")
async def get_upload_status(
    upload_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Check the status of a direct upload by its upload_id.
    Returns asset_id and playback_id when the upload is complete.
    """
    try:
        from mux_python import DirectUploadsApi, AssetsApi
        from services.mux_service import _get_mux_configuration
        from mux_python import ApiClient

        configuration = _get_mux_configuration()
        api_client = ApiClient(configuration)
        uploads_api = DirectUploadsApi(api_client)

        # Get the upload status from Mux
        upload = uploads_api.get_direct_upload(upload_id)
        upload_data = upload.data

        status = upload_data.status  # "waiting", "asset_created", "ready", "errored"
        asset_id = upload_data.asset_id if hasattr(upload_data, 'asset_id') else None

        # If asset exists, get the playback_id
        playback_id = None
        if asset_id:
            assets_api = AssetsApi(api_client)
            asset = assets_api.get_asset(asset_id)
            if asset.data.playback_ids and len(asset.data.playback_ids) > 0:
                playback_id = asset.data.playback_ids[0].id

        return UploadStatusResponse(
            status=status,
            asset_id=asset_id,
            playback_id=playback_id
        )
    except Exception as e:
        logger.error(f"Error checking upload status: {type(e).__name__}")
        raise HTTPException(status_code=500, detail="Error checking upload status")


class DownloadUrlResponse(BaseModel):
    download_url: str
    resolution: str


class DownloadAvailabilityResponse(BaseModel):
    available: bool
    download_url: str | None = None
    resolution: str | None = None
    message: str | None = None


@router.get("/download-url/{playback_id}")
async def get_download_url(
    playback_id: str,
    resolution: str = Query("high", description="Resolution: 'high' for 1080p, 'medium' for 720p"),
    current_user: User = Depends(get_current_user)
):
    """
    Get a direct MP4 download URL for offline practice.
    Requires mp4_support to be enabled on the asset (set during upload for lesson videos).
    """
    # Validate resolution parameter
    if resolution not in ["high", "medium"]:
        raise HTTPException(status_code=400, detail="Resolution must be 'high' or 'medium'")

    # Mux public playback URLs are static and predictable
    download_url = f"https://stream.mux.com/{playback_id}/{resolution}.mp4"

    return DownloadUrlResponse(
        download_url=download_url,
        resolution=resolution
    )


@router.get("/download-available/{playback_id}")
async def check_download_available(
    playback_id: str,
    resolution: str = Query("high", description="Resolution: 'high' for 1080p, 'medium' for 720p"),
):
    """
    Check if MP4 download is available for a video.
    Makes a GET request with Range header to verify the MP4 exists.
    Note: Public endpoint since Mux playback URLs are already public.
    """
    import httpx

    if resolution not in ["high", "medium", "low"]:
        raise HTTPException(status_code=400, detail="Resolution must be 'high', 'medium', or 'low'")

    download_url = f"https://stream.mux.com/{playback_id}/{resolution}.mp4"

    try:
        async with httpx.AsyncClient() as client:
            # Use GET with Range header instead of HEAD (more reliable for Mux)
            response = await client.get(
                download_url,
                headers={"Range": "bytes=0-0"},  # Request just 1 byte
                timeout=10.0,
                follow_redirects=True
            )

            content_type = response.headers.get("content-type", "")

            # 200 = full content, 206 = partial content (both mean file exists)
            # Check content-type contains video OR octet-stream (binary)
            is_video = "video" in content_type or "octet-stream" in content_type
            is_success = response.status_code in [200, 206]

            if is_success and is_video:
                return DownloadAvailabilityResponse(
                    available=True,
                    download_url=download_url,
                    resolution=resolution
                )
            elif response.status_code == 404 or "application/json" in content_type:
                return DownloadAvailabilityResponse(
                    available=False,
                    message="MP4 download not available for this video."
                )
            else:
                return DownloadAvailabilityResponse(
                    available=False,
                    message="Could not verify MP4 availability."
                )
    except Exception as e:
        logger.debug(f"Error checking MP4 availability: {type(e).__name__}")
        return DownloadAvailabilityResponse(
            available=False,
            message="Unable to verify download availability."
        )


class WebhookEvent(BaseModel):
    type: str
    data: dict


@router.get("/asset/{asset_id}/exists")
async def check_asset_exists(
    asset_id: str,
    admin_user: User = Depends(get_admin_user),
):
    """
    Check if an asset exists in Mux.
    Returns True if asset exists, False if not found.
    Admin only.
    """
    try:
        from mux_python import AssetsApi, ApiException
        from services.mux_service import _get_mux_configuration
        from mux_python import ApiClient
        
        configuration = _get_mux_configuration()
        api_client = ApiClient(configuration)
        assets_api = AssetsApi(api_client)
        
        try:
            # Just try to get the asset - if it succeeds, it exists
            assets_api.get_asset(asset_id)
            # If we get here, asset exists
            return {"exists": True, "asset_id": asset_id}
        except ApiException as api_error:
            if api_error.status == 404:
                return {"exists": False, "asset_id": asset_id}
            else:
                raise HTTPException(
                    status_code=api_error.status or 500,
                    detail=f"Error checking asset: {str(api_error)}"
                )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking asset existence: {type(e).__name__}")
        raise HTTPException(status_code=500, detail=f"Error checking asset: {str(e)}")


@router.delete("/asset/{asset_id}")
async def delete_mux_asset(
    asset_id: str,
    current_user_opt: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Delete a video asset from Mux.
    If asset doesn't exist in Mux (404), just clear from database.
    Handles lessons, course previews, and community posts.
    - Admin can delete any asset
    - Users can delete assets from their own posts
    """
    # Check if user owns any posts using this asset (for non-admin users)
    from models.community import Post
    user_posts = []
    if current_user_opt and current_user_opt.role != UserRole.ADMIN:
        user_posts = db.query(Post).filter(
            Post.mux_asset_id == asset_id,
            Post.user_id == current_user_opt.id
        ).all()
        if not user_posts:
            # Check if asset is used by lessons or courses (admin only)
            lessons_check = db.query(Lesson).filter(Lesson.mux_asset_id == asset_id).all()
            courses_check = db.query(World).filter(World.mux_preview_asset_id == asset_id).all()
            if lessons_check or courses_check:
                raise HTTPException(status_code=403, detail="Admin access required to delete lesson/course videos")
            # No posts owned by user - deny access
            raise HTTPException(status_code=403, detail="You can only delete videos from your own posts")
    
    # Admin or user with owned posts - proceed
    try:
        from mux_python import AssetsApi, ApiException
        from services.mux_service import _get_mux_configuration
        from mux_python import ApiClient
        
        # Find lesson(s) using this asset
        lessons = db.query(Lesson).filter(Lesson.mux_asset_id == asset_id).all()
        
        # Find course(s) using this asset for preview
        courses = db.query(World).filter(World.mux_preview_asset_id == asset_id).all()
        
        # Find post(s) using this asset (use user_posts if already queried, otherwise query all)
        if user_posts:
            posts = user_posts
        else:
            posts = db.query(Post).filter(Post.mux_asset_id == asset_id).all()
        
        if not lessons and not courses and not posts:
            # No lessons, courses, or posts using this asset, but still try to delete from Mux
            logger.debug(f"Asset {asset_id} not found in any entities")
        
        configuration = _get_mux_configuration()
        api_client = ApiClient(configuration)
        assets_api = AssetsApi(api_client)
        
        # Try to delete asset from Mux
        try:
            assets_api.delete_asset(asset_id)
            logger.info(f"Deleted asset {asset_id} from Mux")
            mux_deleted = True
        except ApiException as api_error:
            # Handle 404 (not found) - asset might already be deleted
            if api_error.status == 404:
                logger.debug(f"Asset {asset_id} not found in Mux")
                mux_deleted = False  # Asset already gone, just clear from DB
            else:
                logger.error(f"Error deleting asset: {api_error.status}")
                raise HTTPException(
                    status_code=api_error.status or 500,
                    detail="Error deleting video asset"
                )
        
        # Clear Mux IDs from all lessons using this asset
        for lesson in lessons:
            lesson.mux_asset_id = None
            lesson.mux_playback_id = None
            lesson.video_url = ""  # Also clear fallback video URL
        
        # Clear Mux IDs from all courses using this asset for preview
        for course in courses:
            course.mux_preview_asset_id = None
            course.mux_preview_playback_id = None
        
        # Clear Mux IDs from all posts using this asset
        for post in posts:
            post.mux_asset_id = None
            post.mux_playback_id = None
        
        db.commit()
        
        entities_cleared = []
        if lessons:
            entities_cleared.append(f"{len(lessons)} lesson(s)")
        if courses:
            entities_cleared.append(f"{len(courses)} course preview(s)")
        if posts:
            entities_cleared.append(f"{len(posts)} post(s)")
        
        message = f"Asset {asset_id} {'deleted from Mux and ' if mux_deleted else ''}cleared from {', '.join(entities_cleared) if entities_cleared else 'database'}"
        
        return {
            "status": "success",
            "message": message
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting asset: {type(e).__name__}")
        raise HTTPException(status_code=500, detail="Error deleting asset")


@router.post("/check-upload-status")
async def check_upload_status(
    lesson_id: Optional[str] = Query(None),
    course_id: Optional[str] = Query(None),
    level_id: Optional[str] = Query(None),
    post_id: Optional[str] = Query(None),
    current_user_opt: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Manually check if a lesson's, course preview's, level preview's, or community post's video upload has completed and update it.
    This is useful if the webhook didn't fire.
    - Admin only for lessons/courses/levels
    - Authenticated users for their own posts
    """
    try:
        from mux_python import AssetsApi, DirectUploadsApi
        from services.mux_service import _get_mux_configuration
        from mux_python import ApiClient
        from models.course import World

        # Auth check
        if lesson_id or course_id or level_id:
            # Lesson/course/level checks require admin
            if not current_user_opt or current_user_opt.role != UserRole.ADMIN:
                raise HTTPException(status_code=403, detail="Admin access required")
        elif post_id:
            # Post checks require authenticated user (and must own the post)
            if not current_user_opt:
                raise HTTPException(status_code=401, detail="Authentication required")
            from models.community import Post
            post = db.query(Post).filter(Post.id == post_id).first()
            if post and str(post.user_id) != str(current_user_opt.id):
                raise HTTPException(status_code=403, detail="You can only check your own posts")
        
        # Handle course preview check
        if course_id:
            world = db.query(World).filter(World.id == course_id).first()
            if not world:
                raise HTTPException(status_code=404, detail="Course not found")
            
            # If course already has preview playback_id, it's already ready
            if world.mux_preview_playback_id:
                return {
                    "status": "ready",
                    "playback_id": world.mux_preview_playback_id,
                    "asset_id": None,  # We don't store asset_id for course previews
                    "message": "Preview video is already ready"
                }
            
            # Try to find the asset by querying Mux API using passthrough
            configuration = _get_mux_configuration()
            api_client = ApiClient(configuration)
            assets_api = AssetsApi(api_client)
            
            passthrough_filter = json.dumps({"course_id": course_id})
            
            try:
                assets_response = assets_api.list_assets(limit=50)  # Get recent assets
                
                found_asset = None
                for asset in assets_response.data:
                    asset_passthrough = asset.passthrough
                    if asset_passthrough:
                        try:
                            passthrough_data = json.loads(asset_passthrough) if isinstance(asset_passthrough, str) else asset_passthrough
                            if passthrough_data.get("course_id") == course_id:
                                found_asset = asset
                                break
                        except:
                            continue
                
                if found_asset and found_asset.playback_ids and len(found_asset.playback_ids) > 0:
                    # Asset found and ready!
                    playback_id = found_asset.playback_ids[0].id
                    
                    # Update course preview
                    world.mux_preview_playback_id = playback_id
                    world.mux_preview_asset_id = found_asset.id  # Store asset_id for deletion
                    db.commit()
                    
                    return {
                        "status": "ready",
                        "playback_id": playback_id,
                        "asset_id": found_asset.id,
                        "message": "Preview video found and course updated"
                    }
                else:
                    return {
                        "status": "processing",
                        "message": "Preview video is still processing or not found"
                    }
            except Exception as e:
                logger.error(f"Error checking course preview status: {type(e).__name__}")
                return {
                    "status": "error",
                    "message": f"Error checking status: {str(e)}"
                }

        # Handle level preview check (skill tree node)
        if level_id:
            level = db.query(Level).filter(Level.id == level_id).first()
            if not level:
                raise HTTPException(status_code=404, detail="Level not found")

            # If level already has preview playback_id, it's already ready
            if level.mux_preview_playback_id:
                return {
                    "status": "ready",
                    "playback_id": level.mux_preview_playback_id,
                    "asset_id": level.mux_preview_asset_id,
                    "message": "Preview video is already ready"
                }

            # Try to find the asset by querying Mux API using passthrough
            configuration = _get_mux_configuration()
            api_client = ApiClient(configuration)
            assets_api = AssetsApi(api_client)

            try:
                assets_response = assets_api.list_assets(limit=50)  # Get recent assets

                found_asset = None
                for asset in assets_response.data:
                    asset_passthrough = asset.passthrough
                    if asset_passthrough:
                        try:
                            passthrough_data = json.loads(asset_passthrough) if isinstance(asset_passthrough, str) else asset_passthrough
                            if passthrough_data.get("level_id") == level_id:
                                found_asset = asset
                                break
                        except:
                            continue

                if found_asset and found_asset.playback_ids and len(found_asset.playback_ids) > 0:
                    # Asset found and ready!
                    playback_id = found_asset.playback_ids[0].id

                    # Update level preview
                    level.mux_preview_playback_id = playback_id
                    level.mux_preview_asset_id = found_asset.id
                    db.commit()

                    return {
                        "status": "ready",
                        "playback_id": playback_id,
                        "asset_id": found_asset.id,
                        "message": "Preview video found and level updated"
                    }
                else:
                    return {
                        "status": "processing",
                        "message": "Preview video is still processing or not found"
                    }
            except Exception as e:
                logger.error(f"Error checking level preview status: {type(e).__name__}")
                return {
                    "status": "error",
                    "message": f"Error checking status: {str(e)}"
                }

        # Handle community post check
        if post_id:
            from models.community import Post
            post = db.query(Post).filter(Post.id == post_id).first()
            if not post:
                raise HTTPException(status_code=404, detail="Post not found")
            
            # If post already has playback_id, it's already ready
            if post.mux_playback_id and post.mux_asset_id:
                return {
                    "status": "ready",
                    "playback_id": post.mux_playback_id,
                    "asset_id": post.mux_asset_id,
                    "message": "Video is already ready"
                }
            
            # Try to find the asset by querying Mux API using passthrough
            configuration = _get_mux_configuration()
            api_client = ApiClient(configuration)
            assets_api = AssetsApi(api_client)
            
            passthrough_filter = json.dumps({"post_id": post_id})
            
            try:
                assets_response = assets_api.list_assets(limit=50)  # Get recent assets
                
                found_asset = None
                for asset in assets_response.data:
                    asset_passthrough = asset.passthrough
                    if asset_passthrough:
                        try:
                            passthrough_data = json.loads(asset_passthrough) if isinstance(asset_passthrough, str) else asset_passthrough
                            if passthrough_data.get("post_id") == post_id:
                                found_asset = asset
                                break
                        except:
                            continue
                
                if found_asset and found_asset.playback_ids and len(found_asset.playback_ids) > 0:
                    # Asset found and ready!
                    playback_id = found_asset.playback_ids[0].id
                    
                    # Update post
                    post.mux_playback_id = playback_id
                    post.mux_asset_id = found_asset.id
                    db.commit()
                    
                    return {
                        "status": "ready",
                        "playback_id": playback_id,
                        "asset_id": found_asset.id,
                        "message": "Video found and post updated"
                    }
                else:
                    return {
                        "status": "processing",
                        "message": "Video is still processing or not found"
                    }
            except Exception as e:
                logger.error(f"Error checking post upload status: {type(e).__name__}")
                return {
                    "status": "error",
                    "message": f"Error checking status: {str(e)}"
                }
        
        # Handle lesson check (existing logic)
        if not lesson_id:
            raise HTTPException(status_code=400, detail="Either lesson_id, course_id, level_id, or post_id must be provided")
        
        lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if not lesson:
            raise HTTPException(status_code=404, detail="Lesson not found")
        
        # If lesson already has playback_id, it's already ready
        if lesson.mux_playback_id and lesson.mux_asset_id:
            return {
                "status": "ready",
                "playback_id": lesson.mux_playback_id,
                "asset_id": lesson.mux_asset_id,
                "message": "Video is already ready"
            }
        
        # Try to find the asset by querying Mux API
        configuration = _get_mux_configuration()
        api_client = ApiClient(configuration)
        assets_api = AssetsApi(api_client)
        
        # Search for assets with passthrough matching our lesson_id
        passthrough_filter = json.dumps({"lesson_id": lesson_id})
        
        try:
            # List assets and filter by passthrough
            assets_response = assets_api.list_assets(limit=50)  # Get recent assets
            
            found_asset = None
            for asset in assets_response.data:
                asset_passthrough = asset.passthrough
                if asset_passthrough:
                    try:
                        passthrough_data = json.loads(asset_passthrough) if isinstance(asset_passthrough, str) else asset_passthrough
                        if passthrough_data.get("lesson_id") == lesson_id:
                            found_asset = asset
                            break
                    except:
                        continue
            
            if found_asset and found_asset.playback_ids and len(found_asset.playback_ids) > 0:
                # Asset found and ready!
                asset_id = found_asset.id
                playback_id = found_asset.playback_ids[0].id
                
                # Update lesson
                lesson.mux_asset_id = asset_id
                lesson.mux_playback_id = playback_id
                db.commit()
                
                return {
                    "status": "ready",
                    "playback_id": playback_id,
                    "asset_id": asset_id,
                    "message": "Video found and lesson updated"
                }
            else:
                return {
                    "status": "processing",
                    "message": "Video is still processing or not found"
                }
                
        except Exception as e:
            logger.error(f"Error checking upload status: {type(e).__name__}")
            return {
                "status": "error",
                "message": f"Error checking status: {str(e)}"
            }
            
    except Exception as e:
        logger.error(f"Error in check_upload_status: {type(e).__name__}")
        raise HTTPException(status_code=500, detail="Error checking upload status")


@router.post("/webhook")
async def mux_webhook_handler(
    request: Request, 
    db: Session = Depends(get_db),
    mux_signature: Optional[str] = Header(None, alias="Mux-Signature")
):
    """
    Handle Mux webhook events (e.g., when an asset is ready after upload).
    This endpoint should be configured in Mux dashboard webhook settings.
    NOTE: This endpoint is PUBLIC (no auth required) as it's called by Mux servers.
    Webhook signature verification is REQUIRED in production.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("Mux webhook received")
        
        # Read body once
        body_bytes = await request.body()
        
        # Verify webhook signature - REQUIRED in production
        if settings.MUX_WEBHOOK_SECRET:
            if not mux_signature:
                logger.warning("Mux webhook received without signature")
                if not settings._is_development:
                    raise HTTPException(status_code=401, detail="Missing webhook signature")
            else:
                # Parse signature header (format: "t=timestamp,v1=signature")
                try:
                    signature_parts = {}
                    for part in mux_signature.split(","):
                        key, value = part.split("=", 1)
                        signature_parts[key] = value
                    
                    timestamp = signature_parts.get("t")
                    signature = signature_parts.get("v1")
                    
                    if not timestamp or not signature:
                        logger.warning("Invalid Mux signature format")
                        if not settings._is_development:
                            raise HTTPException(status_code=401, detail="Invalid webhook signature format")
                    else:
                        # Verify signature
                        payload_string = f"{timestamp}.{body_bytes.decode('utf-8')}"
                        computed_signature = hmac.new(
                            settings.MUX_WEBHOOK_SECRET.encode('utf-8'),
                            payload_string.encode('utf-8'),
                            hashlib.sha256
                        ).digest()
                        computed_signature_b64 = base64.b64encode(computed_signature).decode('utf-8')
                        
                        if not hmac.compare_digest(signature, computed_signature_b64):
                            logger.error("Invalid Mux webhook signature")
                            raise HTTPException(status_code=401, detail="Invalid webhook signature")
                        
                        logger.info("Mux webhook signature verified")
                except HTTPException:
                    raise
                except Exception as sig_error:
                    logger.error(f"Signature verification error: {type(sig_error).__name__}")
                    if not settings._is_development:
                        raise HTTPException(status_code=401, detail="Signature verification failed")
        elif not settings._is_development:
            # No webhook secret configured in production - this is a configuration error
            logger.error("MUX_WEBHOOK_SECRET not configured in production!")
            raise HTTPException(status_code=500, detail="Webhook not properly configured")
        
        # Parse request body from bytes
        body = json.loads(body_bytes.decode('utf-8'))
        event_type = body.get("type")
        logger.info(f"Mux webhook event: {event_type}")
        
        if event_type == "video.asset.ready":
            # Asset is ready - extract playback_id and asset_id
            asset_data = body.get("data", {})
            asset_id = asset_data.get("id")
            playback_ids = asset_data.get("playback_ids", [])
            
            if playback_ids and len(playback_ids) > 0:
                playback_id = playback_ids[0].get("id")
                
                # Extract entity ID from passthrough data
                passthrough = asset_data.get("passthrough")
                
                if passthrough:
                    try:
                        passthrough_data = json.loads(passthrough) if isinstance(passthrough, str) else passthrough
                        lesson_id = passthrough_data.get("lesson_id")
                        course_id = passthrough_data.get("course_id")
                        level_id = passthrough_data.get("level_id")
                        post_id = passthrough_data.get("post_id")

                        if lesson_id:
                            from models.course import Lesson
                            lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
                            if lesson:
                                lesson.mux_asset_id = asset_id
                                lesson.mux_playback_id = playback_id
                                db.commit()
                                logger.info(f"Updated lesson {lesson_id} with video")
                            else:
                                logger.warning(f"Lesson {lesson_id} not found")
                        elif course_id:
                            from models.course import World
                            world = db.query(World).filter(World.id == course_id).first()
                            if world:
                                world.mux_preview_playback_id = playback_id
                                world.mux_preview_asset_id = asset_id
                                db.commit()
                                logger.info(f"Updated course {course_id} preview")
                            else:
                                logger.warning(f"Course {course_id} not found")
                        elif level_id:
                            from models.course import Level
                            level = db.query(Level).filter(Level.id == level_id).first()
                            if level:
                                level.mux_preview_playback_id = playback_id
                                level.mux_preview_asset_id = asset_id
                                db.commit()
                                logger.info(f"Updated level {level_id} preview")
                            else:
                                logger.warning(f"Level {level_id} not found")
                        elif post_id:
                            from models.community import Post
                            post = db.query(Post).filter(Post.id == post_id).first()
                            if post:
                                post.mux_asset_id = asset_id
                                post.mux_playback_id = playback_id
                                db.commit()
                                logger.info(f"Updated post {post_id} with video")
                            else:
                                logger.warning(f"Post {post_id} not found")
                        else:
                            logger.warning("No entity ID in passthrough data")
                    except Exception as e:
                        logger.error(f"Error processing webhook: {type(e).__name__}")
                else:
                    logger.warning("No passthrough data in asset")
            else:
                logger.warning("No playback IDs in asset data")
        else:
            logger.debug(f"Unhandled webhook event type: {event_type}")
        
        return {"status": "ok"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook processing error: {type(e).__name__}")
        return {"status": "error", "message": "Internal error"}

