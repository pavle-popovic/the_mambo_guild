import boto3
import uuid
from typing import Dict, Optional
from config import settings


class StorageService:
    """Service for managing file uploads to Cloudflare R2 (S3-compatible storage)."""
    
    def __init__(self):
        """Initialize boto3 S3 client for R2."""
        if not all([
            settings.AWS_ACCESS_KEY_ID,
            settings.AWS_SECRET_ACCESS_KEY,
            settings.AWS_ENDPOINT_URL,
            settings.AWS_BUCKET_NAME
        ]):
            raise ValueError("R2 configuration is incomplete. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ENDPOINT_URL, and AWS_BUCKET_NAME in environment variables.")
        
        self.s3_client = boto3.client(
            's3',
            endpoint_url=settings.AWS_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name='auto'  # R2 uses 'auto' as the region
        )
        self.bucket_name = settings.AWS_BUCKET_NAME
        self.public_domain = settings.R2_PUBLIC_DOMAIN or ""
    
    def generate_presigned_url(self, file_type: str, folder: str) -> Dict[str, str]:
        """
        Generate a presigned URL for direct upload to R2.
        
        Args:
            file_type: MIME type of the file (e.g., "image/png")
            folder: Folder path in R2 (e.g., "avatars" or "thumbnails")
        
        Returns:
            Dictionary with:
                - upload_url: Presigned URL for PUT request
                - public_url: Public URL to access the file after upload
        """
        # Generate unique filename using UUID
        file_extension = self._get_file_extension(file_type)
        filename = f"{uuid.uuid4()}{file_extension}"
        object_key = f"{folder}/{filename}"
        
        # Generate presigned URL for PUT operation (expires in 1 hour)
        upload_url = self.s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': self.bucket_name,
                'Key': object_key,
                'ContentType': file_type
            },
            ExpiresIn=3600
        )
        
        # Construct public URL
        public_url = f"{self.public_domain}/{object_key}" if self.public_domain else f"{settings.AWS_ENDPOINT_URL}/{self.bucket_name}/{object_key}"
        
        return {
            "upload_url": upload_url,
            "public_url": public_url
        }
    
    def _get_file_extension(self, file_type: str) -> str:
        """Get file extension from MIME type."""
        mime_to_ext = {
            "image/jpeg": ".jpg",
            "image/jpg": ".jpg",
            "image/png": ".png",
            "image/gif": ".gif",
            "image/webp": ".webp",
            "image/svg+xml": ".svg"
        }
        return mime_to_ext.get(file_type.lower(), ".jpg")


# Singleton instance
_storage_service: Optional[StorageService] = None


def get_storage_service() -> StorageService:
    """Get or create the storage service instance."""
    global _storage_service
    if _storage_service is None:
        _storage_service = StorageService()
    return _storage_service

