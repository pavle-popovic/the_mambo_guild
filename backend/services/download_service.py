"""
Secure Download Service - Generates signed URLs for video downloads
with expiration to prevent link sharing.
"""
import boto3
import logging
from datetime import datetime, date, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from config import settings
from models.user import UserProfile, Subscription, SubscriptionTier, SubscriptionStatus

logger = logging.getLogger(__name__)

# Constants
DOWNLOAD_URL_EXPIRATION_SECONDS = 3600  # 1 hour
DAILY_DOWNLOAD_LIMIT = 5


class DownloadService:
    """Service for generating secure, time-limited download URLs."""
    
    def __init__(self):
        """Initialize boto3 S3 client for R2."""
        if not all([
            settings.AWS_ACCESS_KEY_ID,
            settings.AWS_SECRET_ACCESS_KEY,
            settings.AWS_ENDPOINT_URL,
            settings.AWS_BUCKET_NAME
        ]):
            logger.warning("R2 configuration is incomplete. Download service will be unavailable.")
            self.s3_client = None
            return
        
        self.s3_client = boto3.client(
            's3',
            endpoint_url=settings.AWS_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name='auto'
        )
        self.bucket_name = settings.AWS_BUCKET_NAME
    
    def generate_signed_download_url(
        self,
        object_key: str,
        filename: Optional[str] = None,
        expires_in: int = DOWNLOAD_URL_EXPIRATION_SECONDS
    ) -> Optional[str]:
        """
        Generate a signed URL for downloading a file from R2.
        
        Args:
            object_key: The key/path of the file in the bucket
            filename: Optional custom filename for the download
            expires_in: Expiration time in seconds (default: 1 hour)
        
        Returns:
            Signed URL string or None if error
        """
        if not self.s3_client:
            logger.error("S3 client not initialized")
            return None
        
        try:
            params = {
                'Bucket': self.bucket_name,
                'Key': object_key,
            }
            
            # Add Content-Disposition header for custom filename
            if filename:
                params['ResponseContentDisposition'] = f'attachment; filename="{filename}"'
            
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params=params,
                ExpiresIn=expires_in
            )
            
            logger.info(f"Generated signed download URL for {object_key}, expires in {expires_in}s")
            return url
            
        except Exception as e:
            logger.error(f"Failed to generate signed download URL: {e}")
            return None


def check_download_limit(user_id: str, db: Session) -> Tuple[bool, int, str]:
    """
    Check if user has reached their daily download limit.
    
    Returns:
        Tuple of (allowed: bool, remaining: int, message: str)
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return (False, 0, "Profile not found")
    
    today = date.today()
    
    # Reset counter if it's a new day
    if profile.last_download_date != today:
        profile.downloads_today = 0
        profile.last_download_date = today
        db.flush()
    
    remaining = DAILY_DOWNLOAD_LIMIT - profile.downloads_today
    
    if remaining <= 0:
        return (False, 0, f"Daily download limit reached ({DAILY_DOWNLOAD_LIMIT}/day). Resets at midnight.")
    
    return (True, remaining, f"You have {remaining} downloads remaining today.")


def record_download(user_id: str, db: Session) -> Tuple[bool, int]:
    """
    Record a download for the user.
    
    Returns:
        Tuple of (success: bool, remaining: int)
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return (False, 0)
    
    today = date.today()
    
    # Reset counter if it's a new day
    if profile.last_download_date != today:
        profile.downloads_today = 0
        profile.last_download_date = today
    
    # Check limit
    if profile.downloads_today >= DAILY_DOWNLOAD_LIMIT:
        return (False, 0)
    
    # Increment counter
    profile.downloads_today += 1
    db.flush()
    
    remaining = DAILY_DOWNLOAD_LIMIT - profile.downloads_today
    logger.info(f"User {user_id} downloaded a video. {remaining} downloads remaining today.")
    
    return (True, remaining)


def get_download_status(user_id: str, db: Session) -> dict:
    """
    Get user's download status for today.
    
    Returns:
        Dict with downloads_used, downloads_remaining, downloads_limit
    """
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        return {
            "downloads_used": 0,
            "downloads_remaining": DAILY_DOWNLOAD_LIMIT,
            "downloads_limit": DAILY_DOWNLOAD_LIMIT
        }
    
    today = date.today()
    
    # Reset counter if it's a new day
    if profile.last_download_date != today:
        downloads_used = 0
    else:
        downloads_used = profile.downloads_today
    
    return {
        "downloads_used": downloads_used,
        "downloads_remaining": DAILY_DOWNLOAD_LIMIT - downloads_used,
        "downloads_limit": DAILY_DOWNLOAD_LIMIT
    }


# Singleton instance
_download_service: Optional[DownloadService] = None


def get_download_service() -> DownloadService:
    """Get or create the download service instance."""
    global _download_service
    if _download_service is None:
        _download_service = DownloadService()
    return _download_service
