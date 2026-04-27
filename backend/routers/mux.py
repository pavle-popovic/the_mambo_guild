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
from services.auth_service import (
    decode_access_token,
    decode_mux_upload_token,
    create_mux_upload_token,
    MUX_UPLOAD_TOKEN_TTL_MINUTES,
)
from config import settings
import hmac
import hashlib
import base64
import json
import logging
import time

from sqlalchemy.exc import IntegrityError

from models.payment import MuxWebhookEvent

logger = logging.getLogger(__name__)

router = APIRouter()


def _admin_from_mux_upload_token(token_query: str, db: Session) -> Optional[User]:
    """Validate a narrow-scope Mux upload token and resolve the admin user.

    The token MUST be of type ``mux_upload`` with audience ``mux-upload`` —
    a general-purpose access token is intentionally *not* accepted here.
    """
    payload = decode_mux_upload_token(token_query)
    if not payload:
        return None
    user_id_str = payload.get("sub")
    if not user_id_str:
        return None
    import uuid
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        return None
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.role == UserRole.ADMIN:
        return user
    return None


def get_admin_user_from_token_or_query(
    token_query: Optional[str] = Query(None, alias="token"),
    current_user_opt: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> User:
    """
    Get admin user from Bearer cookie (preferred) or query-param token (fallback for MuxUploader).

    **Security trade-off — JWT in query param:**
    MuxUploader (the third-party component) cannot set custom request headers; it can only
    append query parameters to the upload-URL endpoint.  Passing auth via ``?token=`` is
    therefore unavoidable on that path.

    Mitigations in place:
      - The query-param token is a *separate*, narrow-scope JWT minted by
        ``POST /mux/upload-token``: type="mux_upload", audience="mux-upload",
        TTL 5 minutes.  A leaked token cannot be used against any other endpoint,
        and regular access tokens are **not** accepted via ``?token=``.
      - Only admin users can mint one; only admins are accepted on decode.
      - HTTPS is enforced in production (SECURE_COOKIES / HSTS), so the token
        is not transmitted in plaintext.
      - A logging middleware scrubs ``?token=<…>`` from access logs so tokens
        cannot leak via Railway log retention.
      - Full signature + audience + expiry validation before any DB query.

    If MuxUploader ever gains header-injection support, drop the query-param path
    entirely and use Bearer-only auth.
    """
    # Try cookie/Bearer token first (standard auth)
    if current_user_opt and current_user_opt.role == UserRole.ADMIN:
        return current_user_opt

    # Fallback: narrow-scope Mux upload token via ?token=
    if token_query:
        user = _admin_from_mux_upload_token(token_query, db)
        if user:
            return user

    raise HTTPException(
        status_code=401,
        detail="Could not validate admin credentials"
    )


class MuxUploadTokenResponse(BaseModel):
    token: str
    expires_in: int


@router.post("/upload-token", response_model=MuxUploadTokenResponse)
def mint_mux_upload_token(
    current_user: User = Depends(get_admin_user),
):
    """Mint a short-lived (5 min), single-audience token for MuxUploader.

    The frontend should call this immediately before opening ``<MuxUploader>``
    and pass the returned token as ``?token=…`` on the upload-URL endpoint.
    Do NOT reuse the general-purpose access token — it has broader scope
    and a longer TTL.
    """
    token = create_mux_upload_token(str(current_user.id))
    return MuxUploadTokenResponse(
        token=token,
        expires_in=MUX_UPLOAD_TOKEN_TTL_MINUTES * 60,
    )


class CreateUploadRequest(BaseModel):
    filename: Optional[str] = None
    lesson_id: Optional[str] = None  # Pass lesson_id to associate upload with lesson
    course_id: Optional[str] = None  # Pass course_id for course preview uploads
    level_id: Optional[str] = None  # Pass level_id for skill tree node preview uploads
    post_id: Optional[str] = None  # Pass post_id for community post uploads
    coaching_submission: Optional[bool] = None  # Guild Master 1-on-1 coaching video


class CreateUploadResponse(BaseModel):
    upload_id: str
    upload_url: str
    status: str


@router.post("/upload-url")
def create_mux_upload_url(
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
    coaching_val = bool(request_data.coaching_submission) if request_data else False
    filename_val = filename or (request_data.filename if request_data else None)

    logger.debug(f"Upload URL request - lesson: {lesson_id_val}, course: {course_id_val}, level: {level_id_val}, post: {post_id_val}, coaching: {coaching_val}")

    # Auth check: Admin for lessons/courses/levels, authenticated user for community posts
    if lesson_id_val or course_id_val or level_id_val:
        # Lesson/course uploads require admin
        if not current_user_opt or current_user_opt.role != UserRole.ADMIN:
            # Fallback: narrow-scope Mux upload token via ?token= (MuxUploader path)
            token_query = request.query_params.get("token")
            if token_query:
                scoped_user = _admin_from_mux_upload_token(token_query, db)
                if scoped_user:
                    current_user_opt = scoped_user
            if not current_user_opt or current_user_opt.role != UserRole.ADMIN:
                raise HTTPException(status_code=403, detail="Admin access required for lesson/course video uploads")
    elif post_id_val:
        # Community post uploads require authenticated user
        if not current_user_opt:
            raise HTTPException(status_code=401, detail="Authentication required for community post uploads")
        # Tier gate: defense in depth — post_service also checks, but we
        # block the Mux upload URL itself so blocked users can't even
        # consume Mux storage by pre-uploading.
        from services.tier_service import community_participation_status, community_gate_message
        gate = community_participation_status(str(current_user_opt.id), db)
        if not gate["allowed"]:
            raise HTTPException(
                status_code=403,
                detail=community_gate_message(gate["state"], surface="post"),
            )
    elif coaching_val:
        # Guild Master coaching submission uploads require authenticated Guild Master
        if not current_user_opt:
            raise HTTPException(status_code=401, detail="Authentication required for coaching submission uploads")
        from routers.premium import require_guild_master
        require_guild_master(current_user_opt)
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
        elif coaching_val and current_user_opt:
            external_id = f"coaching-{str(current_user_opt.id)[:8]}"
            title = f"Coaching Submission - {current_user_opt.email or current_user_opt.id}"
            creator_id = "coaching-submission"
            passthrough_data = {
                "user_id": str(current_user_opt.id),
                "type": "coaching-submission",
            }
    except Exception as e:
        logger.debug(f"Error fetching metadata: {type(e).__name__}")
        # Continue without metadata if fetch fails

    # Create passthrough JSON string
    if passthrough_data:
        passthrough = json.dumps(passthrough_data)
    # Community posts and coaching submissions get resolution cap (1080p), lesson/course videos get MP4 support
    is_community_upload = post_id_val is not None or coaching_val
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

    # Record upload ownership so only the uploader (or an admin) can later
    # poll /mux/upload-status/{upload_id} and read the resulting playback_id.
    # Without this, any authenticated user could scrape private coaching
    # submissions by iterating upload ids.
    if current_user_opt and upload_id and upload_id != "unknown":
        try:
            from services.redis_service import set_mux_upload_owner
            set_mux_upload_owner(upload_id, str(current_user_opt.id))
        except Exception as e:
            logger.error(f"Failed to persist upload owner: {type(e).__name__}")

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
def get_upload_status(
    upload_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Check the status of a direct upload by its upload_id.
    Returns asset_id and playback_id when the upload is complete.

    Ownership: only the user who minted the upload (or an admin) can poll it.
    This prevents an authenticated user from iterating upload ids to lift
    private coaching submissions' playback ids before they're attached to a
    coaching_submissions row.
    """
    if current_user.role != UserRole.ADMIN:
        from services.redis_service import get_mux_upload_owner
        owner_id = get_mux_upload_owner(upload_id)
        # If we have an owner recorded and it doesn't match → deny.
        # If the record has expired or Redis is down (owner_id is None), we
        # fall through: the endpoint becomes no worse than before for cache
        # misses, and the TTL is long enough to cover legitimate upload flows.
        if owner_id is not None and owner_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not your upload")
    try:
        from mux_python import DirectUploadsApi, AssetsApi
        from services.mux_service import _get_mux_configuration
        from mux_python import ApiClient

        configuration = _get_mux_configuration()
        api_client = ApiClient(configuration)
        uploads_api = DirectUploadsApi(api_client)

        # Get the upload status from Mux
        # Mux direct-upload status: "waiting" | "asset_created" | "errored" | "cancelled" | "timed_out"
        upload = uploads_api.get_direct_upload(upload_id)
        upload_data = upload.data

        upload_status = upload_data.status
        asset_id = upload_data.asset_id if hasattr(upload_data, 'asset_id') else None

        # Once an asset exists, switch to the asset's lifecycle ("preparing" -> "ready" | "errored")
        # and treat that as the authoritative status for callers polling readiness.
        status = upload_status
        playback_id = None
        if asset_id:
            assets_api = AssetsApi(api_client)
            asset = assets_api.get_asset(asset_id)
            asset_status = getattr(asset.data, "status", None)
            if asset_status:
                status = asset_status  # "preparing" | "ready" | "errored"
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


class WebhookEvent(BaseModel):
    type: str
    data: dict


@router.get("/asset/{asset_id}/exists")
def check_asset_exists(
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
                logger.error(f"Mux API error checking asset {asset_id}: {api_error.status}")
                raise HTTPException(
                    status_code=api_error.status or 500,
                    detail="Error checking video asset"
                )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error checking asset existence: {type(e).__name__}")
        raise HTTPException(status_code=500, detail="Error checking video asset")


@router.delete("/asset/{asset_id}")
def delete_mux_asset(
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
def check_upload_status(
    lesson_id: Optional[str] = Query(None),
    course_id: Optional[str] = Query(None),
    level_id: Optional[str] = Query(None),
    post_id: Optional[str] = Query(None),
    upload_id: Optional[str] = Query(None, description="Mux direct upload ID for fast direct lookup"),
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

        # Fast path: if upload_id provided, resolve asset directly without scanning 50 assets
        resolved_asset_id = None
        if upload_id:
            try:
                configuration = _get_mux_configuration()
                api_client = ApiClient(configuration)
                uploads_api = DirectUploadsApi(api_client)
                upload_obj = uploads_api.get_direct_upload(upload_id)
                if upload_obj and upload_obj.data and upload_obj.data.asset_id:
                    resolved_asset_id = upload_obj.data.asset_id
                    logger.debug(f"Resolved upload_id {upload_id} → asset_id {resolved_asset_id}")
            except Exception:
                logger.debug(f"Could not resolve upload_id {upload_id} directly, falling back to scan")

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
            
            try:
                # Fast path: use resolved asset_id directly; fallback to 50-asset scan
                found_asset = None
                if resolved_asset_id:
                    found_asset = assets_api.get_asset(resolved_asset_id).data
                else:
                    assets_response = assets_api.list_assets(limit=50)
                    for asset in assets_response.data:
                        try:
                            passthrough_data = json.loads(asset.passthrough) if isinstance(asset.passthrough, str) else (asset.passthrough or {})
                            if passthrough_data.get("course_id") == course_id:
                                found_asset = asset
                                break
                        except (json.JSONDecodeError, AttributeError, TypeError):
                            continue

                if found_asset and found_asset.playback_ids and len(found_asset.playback_ids) > 0:
                    playback_id = found_asset.playback_ids[0].id
                    world.mux_preview_playback_id = playback_id
                    world.mux_preview_asset_id = found_asset.id
                    db.commit()
                    return {
                        "status": "ready",
                        "playback_id": playback_id,
                        "asset_id": found_asset.id,
                        "message": "Preview video found and course updated",
                    }
                else:
                    return {"status": "processing", "message": "Preview video is still processing or not found"}
            except Exception as e:
                logger.error(f"Error checking course preview status: {type(e).__name__}")
                return {"status": "error", "message": "Error checking upload status"}

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

            # Try to find the asset by querying Mux API
            configuration = _get_mux_configuration()
            api_client = ApiClient(configuration)
            assets_api = AssetsApi(api_client)

            try:
                found_asset = None
                if resolved_asset_id:
                    found_asset = assets_api.get_asset(resolved_asset_id).data
                else:
                    assets_response = assets_api.list_assets(limit=50)
                    for asset in assets_response.data:
                        try:
                            passthrough_data = json.loads(asset.passthrough) if isinstance(asset.passthrough, str) else (asset.passthrough or {})
                            if passthrough_data.get("level_id") == level_id:
                                found_asset = asset
                                break
                        except (json.JSONDecodeError, AttributeError, TypeError):
                            continue

                if found_asset and found_asset.playback_ids and len(found_asset.playback_ids) > 0:
                    playback_id = found_asset.playback_ids[0].id
                    level.mux_preview_playback_id = playback_id
                    level.mux_preview_asset_id = found_asset.id
                    db.commit()
                    return {
                        "status": "ready",
                        "playback_id": playback_id,
                        "asset_id": found_asset.id,
                        "message": "Preview video found and level updated",
                    }
                else:
                    return {"status": "processing", "message": "Preview video is still processing or not found"}
            except Exception as e:
                logger.error(f"Error checking level preview status: {type(e).__name__}")
                return {"status": "error", "message": "Error checking upload status"}

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
                found_asset = None
                if resolved_asset_id:
                    found_asset = assets_api.get_asset(resolved_asset_id).data
                else:
                    assets_response = assets_api.list_assets(limit=50)
                    for asset in assets_response.data:
                        try:
                            passthrough_data = json.loads(asset.passthrough) if isinstance(asset.passthrough, str) else (asset.passthrough or {})
                            if passthrough_data.get("post_id") == post_id:
                                found_asset = asset
                                break
                        except (json.JSONDecodeError, AttributeError, TypeError):
                            continue

                if found_asset and found_asset.playback_ids and len(found_asset.playback_ids) > 0:
                    playback_id = found_asset.playback_ids[0].id
                    post.mux_playback_id = playback_id
                    post.mux_asset_id = found_asset.id
                    db.commit()

                    # Stage posts are created BEFORE the Mux upload completes,
                    # so award_post_reward() at create-time sees mux_asset_id=None
                    # and skips ("ineligible"). Re-run the reward here, now that
                    # the asset is attached. Idempotent — _already_rewarded()
                    # guards against double-credit if this path fires twice.
                    reward_payload = None
                    try:
                        from services import posting_reward_service
                        outcome = posting_reward_service.award_post_reward(str(post.id), db)
                        if outcome.get("awarded"):
                            db.commit()
                            reward_payload = {
                                "amount": outcome["amount"],
                                "reason": outcome["reason"],
                                "new_balance": outcome["new_balance"],
                            }
                    except Exception:
                        logger.exception("check_upload_status: posting reward failed (non-fatal)")
                        db.rollback()

                    response = {
                        "status": "ready",
                        "playback_id": playback_id,
                        "asset_id": found_asset.id,
                        "message": "Video found and post updated",
                    }
                    if reward_payload is not None:
                        response["reward"] = reward_payload
                    return response
                else:
                    return {"status": "processing", "message": "Video is still processing or not found"}
            except Exception as e:
                logger.error(f"Error checking post upload status: {type(e).__name__}")
                return {"status": "error", "message": "Error checking upload status"}
        
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
            found_asset = None
            if resolved_asset_id:
                found_asset = assets_api.get_asset(resolved_asset_id).data
            else:
                assets_response = assets_api.list_assets(limit=50)
                for asset in assets_response.data:
                    try:
                        passthrough_data = json.loads(asset.passthrough) if isinstance(asset.passthrough, str) else (asset.passthrough or {})
                        if passthrough_data.get("lesson_id") == lesson_id:
                            found_asset = asset
                            break
                    except (json.JSONDecodeError, AttributeError, TypeError):
                        continue

            if found_asset and found_asset.playback_ids and len(found_asset.playback_ids) > 0:
                asset_id = found_asset.id
                playback_id = found_asset.playback_ids[0].id
                lesson.mux_asset_id = asset_id
                lesson.mux_playback_id = playback_id
                db.commit()
                return {
                    "status": "ready",
                    "playback_id": playback_id,
                    "asset_id": asset_id,
                    "message": "Video found and lesson updated",
                }
            else:
                return {"status": "processing", "message": "Video is still processing or not found"}

        except Exception as e:
            logger.error(f"Error checking lesson upload status: {type(e).__name__}")
            return {"status": "error", "message": "Error checking upload status"}
            
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
                        # Verify signature.
                        # Mux sends `v1=<hex>` — lowercase hex-encoded HMAC-SHA256 over
                        # the literal string "<timestamp>.<raw_body>" using the webhook
                        # signing secret.  Comparing against base64 (as this did
                        # previously) would fail for every legitimate request.
                        # Docs: https://docs.mux.com/core/listen-for-webhooks#securing-webhooks
                        payload_string = f"{timestamp}.{body_bytes.decode('utf-8')}"
                        computed_signature_hex = hmac.new(
                            settings.MUX_WEBHOOK_SECRET.encode('utf-8'),
                            payload_string.encode('utf-8'),
                            hashlib.sha256
                        ).hexdigest()

                        if not hmac.compare_digest(signature, computed_signature_hex):
                            logger.error("Invalid Mux webhook signature")
                            raise HTTPException(status_code=401, detail="Invalid webhook signature")

                        # Reject replays outside a 5-minute tolerance window.
                        # Signature-only checks let an attacker replay a captured
                        # legitimate event forever; binding the signature to a
                        # bounded timestamp closes that window.
                        try:
                            ts_int = int(timestamp)
                            if abs(int(time.time()) - ts_int) > 300:
                                logger.warning("Mux webhook timestamp outside tolerance window")
                                if not settings._is_development:
                                    raise HTTPException(status_code=401, detail="Webhook timestamp outside tolerance window")
                        except ValueError:
                            logger.warning("Mux webhook timestamp not an integer")
                            if not settings._is_development:
                                raise HTTPException(status_code=401, detail="Invalid webhook timestamp")

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
        event_id = body.get("id")
        logger.info(f"Mux webhook event: {event_type}")

        # Idempotency guard: Mux retries the same webhook on failure using the
        # same event id. Inserting into a UNIQUE(event_id) table and catching
        # IntegrityError gives us at-most-once processing without a race.
        if event_id:
            try:
                db.add(MuxWebhookEvent(event_id=event_id, event_type=event_type or "unknown"))
                db.commit()
            except IntegrityError:
                db.rollback()
                logger.info(f"Mux webhook {event_id} ({event_type}) already processed — skipping")
                return {"status": "already_processed"}

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

                                # Award the stage-post claves now that the asset is
                                # attached (the create-time call skipped because
                                # mux_asset_id was None). Idempotent via
                                # _already_rewarded(); the polling endpoint may
                                # have beaten the webhook to it and that's fine.
                                try:
                                    from services import posting_reward_service
                                    outcome = posting_reward_service.award_post_reward(post_id, db)
                                    if outcome.get("awarded"):
                                        db.commit()
                                except Exception:
                                    logger.exception("mux_webhook: posting reward failed (non-fatal)")
                                    db.rollback()

                                # ML feature: community video creation signals high-intent engagement.
                                try:
                                    from services.analytics_service import track_event
                                    track_event(
                                        db=db,
                                        event_name="CommunityVideoReady",
                                        user_id=post.user_id,
                                        properties={
                                            "post_id": post_id,
                                            "post_type": post.post_type,
                                            "asset_id": asset_id,
                                        },
                                    )
                                except Exception:
                                    logger.exception("mux_webhook: CommunityVideoReady track failed (non-fatal)")
                            else:
                                logger.warning(f"Post {post_id} not found")
                        elif passthrough_data.get("type") == "coaching-submission":
                            coaching_user_id = passthrough_data.get("user_id")
                            if coaching_user_id:
                                import uuid as _uuid
                                try:
                                    user_uuid = _uuid.UUID(coaching_user_id)
                                except (ValueError, TypeError):
                                    user_uuid = None

                                # ML feature: coaching upload = premium-tier engagement (Guild Master).
                                try:
                                    from services.analytics_service import track_event
                                    track_event(
                                        db=db,
                                        event_name="CoachingSubmissionUploaded",
                                        user_id=user_uuid,
                                        properties={
                                            "asset_id": asset_id,
                                            "playback_id": playback_id,
                                        },
                                    )
                                except Exception:
                                    logger.exception("mux_webhook: CoachingSubmissionUploaded track failed (non-fatal)")
                            else:
                                logger.warning("Coaching submission webhook missing user_id in passthrough")
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

