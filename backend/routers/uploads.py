import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from dependencies import get_current_user
from models.user import User
from services.storage_service import get_storage_service

logger = logging.getLogger(__name__)


def _require_admin(user: User):
    if user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")

router = APIRouter()


class PresignedUrlRequest(BaseModel):
    file_type: str  # MIME type, e.g., "image/png"
    folder: str  # "avatars" or "thumbnails"


class PresignedUrlResponse(BaseModel):
    upload_url: str
    public_url: str


@router.post("/presigned-url", response_model=PresignedUrlResponse)
async def generate_presigned_url(
    request: PresignedUrlRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a presigned URL for direct file upload to R2.
    
    Requires authentication. The user can upload files to:
    - "avatars" folder (for profile pictures)
    - "thumbnails" folder (for course/lesson thumbnails)
    """
    # Validate folder
    if request.folder not in ["avatars", "thumbnails"]:
        raise HTTPException(status_code=400, detail="Folder must be 'avatars' or 'thumbnails'")
    
    # Validate file type (must be an image)
    if not request.file_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File type must be an image (e.g., image/png, image/jpeg)")
    
    try:
        storage_service = get_storage_service()
        result = storage_service.generate_presigned_url(
            file_type=request.file_type,
            folder=request.folder
        )
        return PresignedUrlResponse(**result)
    except ValueError as e:
        logger.error(f"Storage configuration error generating presigned URL: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate upload URL. Please try again.")
    except Exception as e:
        logger.error(f"Unexpected error generating presigned URL: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate upload URL. Please try again.")


class CoachingFeedbackUrlRequest(BaseModel):
    submission_id: str


@router.post("/coaching-feedback-url", response_model=PresignedUrlResponse)
async def generate_coaching_feedback_url(
    request: CoachingFeedbackUrlRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a presigned PUT URL for uploading a coaching feedback video to R2.
    Admin only. File is stored at coaching-feedback/{submission_id}.webm.
    """
    _require_admin(current_user)

    object_key = f"coaching-feedback/{request.submission_id}.webm"
    try:
        storage_service = get_storage_service()
        result = storage_service.generate_presigned_url_for_key(
            object_key=object_key,
            content_type="video/webm"
        )
        return PresignedUrlResponse(**result)
    except ValueError as e:
        logger.error(f"Storage configuration error generating presigned URL: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate upload URL. Please try again.")
    except Exception as e:
        logger.error(f"Unexpected error generating presigned URL: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate upload URL. Please try again.")

