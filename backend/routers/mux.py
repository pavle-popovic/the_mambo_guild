"""
Mux video upload endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Header, Query
from pydantic import BaseModel
from typing import Optional
from dependencies import get_admin_user, get_current_user_optional
from models.user import User, UserRole
from models.course import Lesson
from models import get_db
from sqlalchemy.orm import Session
from services.mux_service import create_direct_upload
from services.auth_service import decode_access_token
from config import settings
import hmac
import hashlib
import base64
import json

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
    admin_user: User = Depends(get_admin_user_from_token_or_query)  # Supports both Bearer and query param token
):
    """
    Create a Mux direct upload URL for video upload.
    Admin only - generates a direct upload URL that can be used to upload videos directly to Mux.
    Supports both JSON body (our API client) and query params (for MuxUploader compatibility).
    
    MuxUploader calls this endpoint with POST and query params, expecting { url, uploadId } response.
    Our API client calls with JSON body, expecting { upload_id, upload_url } response.
    
    Note: This endpoint accepts token in query params as a fallback for MuxUploader compatibility,
    since MuxUploader may not send custom headers. The primary auth method is still Bearer token.
    """
    # Verify admin access - use admin_user from get_admin_user (which handles Bearer token)
    # If that fails, the endpoint will return 401/403, which is correct
    
    # Handle both request body (Pydantic model) and query params
    # Priority: query params (for MuxUploader) > request body (for our API client)
    lesson_id_val = lesson_id or (request_data.lesson_id if request_data else None)
    course_id_val = request_data.course_id if request_data else None
    filename_val = filename or (request_data.filename if request_data else None)
    
    print(f"[MUX] ===== Upload URL Request Received =====")
    print(f"[MUX] Lesson ID: {lesson_id_val}")
    print(f"[MUX] Course ID: {course_id_val}")
    print(f"[MUX] Filename: {filename_val}")
    print(f"[MUX] Admin User: {admin_user.email}")
    
    if not settings.MUX_TOKEN_ID or not settings.MUX_TOKEN_SECRET:
        print("[MUX] ERROR: Mux credentials not configured!")
        raise HTTPException(
            status_code=500,
            detail="Mux is not configured. Please set MUX_TOKEN_ID and MUX_TOKEN_SECRET in environment variables."
        )
    
    print("[MUX] Mux credentials found, proceeding...")
    
    # Create passthrough data if lesson_id or course_id is provided
    passthrough = None
    if lesson_id_val:
        passthrough = json.dumps({"lesson_id": lesson_id_val})
        print(f"[MUX] Passthrough data: {passthrough}")
    elif course_id_val:
        passthrough = json.dumps({"course_id": course_id_val})
        print(f"[MUX] Passthrough data (course preview): {passthrough}")
    
    print("[MUX] Calling Mux API to create direct upload...")
    result = create_direct_upload(filename=filename_val, test=False, passthrough=passthrough)
    
    if result.get("status") == "error":
        print(f"[MUX] ERROR creating upload: {result.get('message')}")
        raise HTTPException(
            status_code=500,
            detail=result.get("message", "Failed to create Mux upload URL")
        )
    
    upload_id = result.get("upload_id", "unknown")
    upload_url = result.get("upload_url", "unknown")
    print(f"[MUX] SUCCESS! Upload URL created")
    print(f"[MUX] Upload ID: {upload_id}")
    print(f"[MUX] Upload URL: {upload_url[:50]}...")
    print(f"[MUX] ========================================")
    
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
        print(f"[MUX] Error checking asset existence: {e}")
        raise HTTPException(status_code=500, detail=f"Error checking asset: {str(e)}")


@router.delete("/asset/{asset_id}")
async def delete_mux_asset(
    asset_id: str,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a video asset from Mux.
    If asset doesn't exist in Mux (404), just clear from database.
    Handles both lessons and course previews.
    Admin only.
    """
    try:
        from mux_python import AssetsApi, ApiException
        from services.mux_service import _get_mux_configuration
        from mux_python import ApiClient
        from models.course import World
        
        # Find lesson(s) using this asset
        lessons = db.query(Lesson).filter(Lesson.mux_asset_id == asset_id).all()
        
        # Find course(s) using this asset for preview
        courses = db.query(World).filter(World.mux_preview_asset_id == asset_id).all()
        
        if not lessons and not courses:
            # No lessons or courses using this asset, but still try to delete from Mux
            print(f"[MUX] Asset {asset_id} not found in any lessons or courses, but attempting Mux deletion...")
        
        configuration = _get_mux_configuration()
        api_client = ApiClient(configuration)
        assets_api = AssetsApi(api_client)
        
        print(f"[MUX] Attempting to delete asset {asset_id} from Mux...")
        
        # Try to delete asset from Mux
        try:
            assets_api.delete_asset(asset_id)
            print(f"[MUX] Successfully deleted asset {asset_id} from Mux")
            mux_deleted = True
        except ApiException as api_error:
            # Handle 404 (not found) - asset might already be deleted
            if api_error.status == 404:
                print(f"[MUX] Asset {asset_id} not found in Mux (already deleted or never existed), clearing from DB only")
                mux_deleted = False  # Asset already gone, just clear from DB
            else:
                # Other API errors - re-raise
                print(f"[MUX] Error deleting asset {asset_id} from Mux: {api_error}")
                raise HTTPException(
                    status_code=api_error.status or 500,
                    detail=f"Error deleting asset from Mux: {str(api_error)}"
                )
        
        # Clear Mux IDs from all lessons using this asset
        for lesson in lessons:
            print(f"[MUX] Clearing Mux IDs for lesson {lesson.id} (title: {lesson.title})")
            lesson.mux_asset_id = None
            lesson.mux_playback_id = None
            lesson.video_url = ""  # Also clear fallback video URL
        
        # Clear Mux IDs from all courses using this asset for preview
        for course in courses:
            print(f"[MUX] Clearing Mux preview IDs for course {course.id} (title: {course.title})")
            course.mux_preview_asset_id = None
            course.mux_preview_playback_id = None
        
        db.commit()
        
        entities_cleared = []
        if lessons:
            entities_cleared.append(f"{len(lessons)} lesson(s)")
        if courses:
            entities_cleared.append(f"{len(courses)} course preview(s)")
        
        message = f"Asset {asset_id} {'deleted from Mux and ' if mux_deleted else ''}cleared from {', '.join(entities_cleared) if entities_cleared else 'database'}"
        
        return {
            "status": "success",
            "message": message
        }
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        print(f"[MUX] Unexpected error deleting asset {asset_id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error deleting asset: {str(e)}")


@router.post("/check-upload-status")
async def check_upload_status(
    lesson_id: Optional[str] = Query(None),
    course_id: Optional[str] = Query(None),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Manually check if a lesson's or course preview's video upload has completed and update it.
    This is useful if the webhook didn't fire.
    Admin only.
    """
    try:
        from mux_python import AssetsApi, DirectUploadsApi
        from services.mux_service import _get_mux_configuration
        from mux_python import ApiClient
        from models.course import World
        
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
                print(f"[MUX] Error checking course preview upload status: {e}")
                return {
                    "status": "error",
                    "message": f"Error checking status: {str(e)}"
                }
        
        # Handle lesson check (existing logic)
        if not lesson_id:
            raise HTTPException(status_code=400, detail="Either lesson_id or course_id must be provided")
        
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
            print(f"[MUX] Error checking upload status: {e}")
            return {
                "status": "error",
                "message": f"Error checking status: {str(e)}"
            }
            
    except Exception as e:
        print(f"[MUX] Error in check_upload_status: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error checking upload status: {str(e)}")


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
    Webhook signature verification is optional but recommended for security.
    """
    try:
        print(f"[MUX WEBHOOK] ===== Webhook received =====")
        
        # Read body once
        body_bytes = await request.body()
        
        # Verify webhook signature if webhook secret is configured
        if settings.MUX_WEBHOOK_SECRET and mux_signature:
            # Parse signature header (format: "t=timestamp,v1=signature")
            try:
                signature_parts = {}
                for part in mux_signature.split(","):
                    key, value = part.split("=", 1)
                    signature_parts[key] = value
                
                timestamp = signature_parts.get("t")
                signature = signature_parts.get("v1")
                
                if timestamp and signature:
                    # Verify signature
                    payload_string = f"{timestamp}.{body_bytes.decode('utf-8')}"
                    computed_signature = hmac.new(
                        settings.MUX_WEBHOOK_SECRET.encode('utf-8'),
                        payload_string.encode('utf-8'),
                        hashlib.sha256
                    ).digest()
                    computed_signature_b64 = base64.b64encode(computed_signature).decode('utf-8')
                    
                    if not hmac.compare_digest(signature, computed_signature_b64):
                        print(f"[MUX WEBHOOK] ERROR: Invalid webhook signature!")
                        raise HTTPException(status_code=401, detail="Invalid webhook signature")
                    
                    print(f"[MUX WEBHOOK] Signature verified successfully")
            except HTTPException:
                raise  # Re-raise HTTP exceptions
            except Exception as sig_error:
                print(f"[MUX WEBHOOK] WARNING: Signature verification failed: {sig_error}")
                # In development, we can be lenient - in production, should reject
                # For now, continue even if signature verification fails (for testing)
        
        # Parse request body from bytes
        # json is imported at the top of the file
        body = json.loads(body_bytes.decode('utf-8'))
        event_type = body.get("type")
        print(f"[MUX WEBHOOK] Event type: {event_type}")
        
        if event_type == "video.asset.ready":
            # Asset is ready - extract playback_id and asset_id
            asset_data = body.get("data", {})
            asset_id = asset_data.get("id")
            playback_ids = asset_data.get("playback_ids", [])
            
            print(f"[MUX WEBHOOK] Asset ID: {asset_id}")
            print(f"[MUX WEBHOOK] Playback IDs: {playback_ids}")
            
            if playback_ids and len(playback_ids) > 0:
                playback_id = playback_ids[0].get("id")
                print(f"[MUX WEBHOOK] Using playback ID: {playback_id}")
                
                # Extract lesson_id from passthrough data
                passthrough = asset_data.get("passthrough")
                print(f"[MUX WEBHOOK] Passthrough data: {passthrough}")
                
                # If passthrough contains lesson_id or course_id, update accordingly
                if passthrough:
                    try:
                        passthrough_data = json.loads(passthrough) if isinstance(passthrough, str) else passthrough
                        lesson_id = passthrough_data.get("lesson_id")
                        course_id = passthrough_data.get("course_id")
                        print(f"[MUX WEBHOOK] Lesson ID from passthrough: {lesson_id}")
                        print(f"[MUX WEBHOOK] Course ID from passthrough: {course_id}")
                        
                        if lesson_id:
                            # Update lesson
                            from models.course import Lesson
                            lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
                            if lesson:
                                print(f"[MUX WEBHOOK] Found lesson: {lesson.title}")
                                lesson.mux_asset_id = asset_id
                                lesson.mux_playback_id = playback_id
                                db.commit()
                                print(f"[MUX WEBHOOK] SUCCESS! Updated lesson with playback_id: {playback_id}")
                            else:
                                print(f"[MUX WEBHOOK] WARNING: Lesson {lesson_id} not found in database")
                        elif course_id:
                            # Update course preview
                            from models.course import World
                            world = db.query(World).filter(World.id == course_id).first()
                            if world:
                                print(f"[MUX WEBHOOK] Found course: {world.title}")
                                world.mux_preview_playback_id = playback_id
                                world.mux_preview_asset_id = asset_id  # Store asset_id for deletion
                                db.commit()
                                print(f"[MUX WEBHOOK] SUCCESS! Updated course preview with playback_id: {playback_id}, asset_id: {asset_id}")
                            else:
                                print(f"[MUX WEBHOOK] WARNING: Course {course_id} not found in database")
                        else:
                            print(f"[MUX WEBHOOK] WARNING: No lesson_id or course_id in passthrough data")
                    except Exception as e:
                        print(f"[MUX WEBHOOK] ERROR updating from webhook: {e}")
                        import traceback
                        traceback.print_exc()
                else:
                    print(f"[MUX WEBHOOK] WARNING: No passthrough data in asset")
            else:
                print(f"[MUX WEBHOOK] WARNING: No playback IDs in asset data")
        else:
            print(f"[MUX WEBHOOK] Unhandled event type: {event_type}")
        
        print(f"[MUX WEBHOOK] ===========================")
        return {"status": "ok"}
    except Exception as e:
        print(f"[MUX WEBHOOK] ERROR processing webhook: {e}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

