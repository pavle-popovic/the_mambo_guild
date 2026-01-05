from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from dependencies import get_current_user
from models.user import User
from services.storage_service import get_storage_service

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
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate presigned URL: {str(e)}")

