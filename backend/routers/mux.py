"""
Mux video upload endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from dependencies import get_admin_user
from models.user import User
from models.course import Lesson
from models import get_db
from sqlalchemy.orm import Session
from services.mux_service import create_direct_upload
from config import settings

router = APIRouter()


class CreateUploadRequest(BaseModel):
    filename: Optional[str] = None
    lesson_id: Optional[str] = None  # Pass lesson_id to associate upload with lesson


class CreateUploadResponse(BaseModel):
    upload_id: str
    upload_url: str
    status: str


@router.post("/upload-url", response_model=CreateUploadResponse)
async def create_mux_upload_url(
    request: CreateUploadRequest,
    admin_user: User = Depends(get_admin_user)
):
    """
    Create a Mux direct upload URL for video upload.
    Admin only - generates a direct upload URL that can be used to upload videos directly to Mux.
    """
    if not settings.MUX_TOKEN_ID or not settings.MUX_TOKEN_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Mux is not configured. Please set MUX_TOKEN_ID and MUX_TOKEN_SECRET in environment variables."
        )
    
    # Create passthrough data if lesson_id is provided
    passthrough = None
    if request.lesson_id:
        import json
        passthrough = json.dumps({"lesson_id": request.lesson_id})
    
    result = create_direct_upload(filename=request.filename, test=False, passthrough=passthrough)
    
    if result.get("status") == "error":
        raise HTTPException(
            status_code=500,
            detail=result.get("message", "Failed to create Mux upload URL")
        )
    
    return CreateUploadResponse(
        upload_id=result["upload_id"],
        upload_url=result["upload_url"],
        status=result["status"]
    )


class WebhookEvent(BaseModel):
    type: str
    data: dict


@router.post("/webhook")
async def mux_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Mux webhook events (e.g., when an asset is ready after upload).
    This endpoint should be configured in Mux dashboard webhook settings.
    """
    try:
        body = await request.json()
        event_type = body.get("type")
        
        if event_type == "video.asset.ready":
            # Asset is ready - extract playback_id and asset_id
            asset_data = body.get("data", {})
            asset_id = asset_data.get("id")
            playback_ids = asset_data.get("playback_ids", [])
            
            if playback_ids and len(playback_ids) > 0:
                playback_id = playback_ids[0].get("id")
                
                # Find the upload ID from the asset
                # We'll need to track upload_id -> lesson_id mapping, but for now
                # we can use the asset's passthrough field if set
                passthrough = asset_data.get("passthrough")
                
                # If passthrough contains lesson_id, update that lesson
                if passthrough:
                    try:
                        import json
                        passthrough_data = json.loads(passthrough) if isinstance(passthrough, str) else passthrough
                        lesson_id = passthrough_data.get("lesson_id")
                        
                        if lesson_id:
                            lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
                            if lesson:
                                lesson.mux_asset_id = asset_id
                                lesson.mux_playback_id = playback_id
                                db.commit()
                    except Exception as e:
                        print(f"Error updating lesson from webhook: {e}")
        
        return {"status": "ok"}
    except Exception as e:
        print(f"Error processing Mux webhook: {e}")
        return {"status": "error", "message": str(e)}

