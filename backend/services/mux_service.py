"""
Mux service for video upload and playback URL generation.
"""
import logging
from typing import Dict, Optional
from mux_python import Configuration, ApiClient, ApiException, DirectUploadsApi
from mux_python.models import CreateUploadRequest
from config import settings

logger = logging.getLogger(__name__)


def _get_mux_configuration() -> Configuration:
    """
    Create and return a properly configured Mux Configuration object.
    """
    configuration = Configuration(
        username=settings.MUX_TOKEN_ID,
        password=settings.MUX_TOKEN_SECRET
    )
    return configuration


def _get_direct_uploads_api() -> DirectUploadsApi:
    """
    Create and return a DirectUploadsApi instance with proper configuration.
    """
    configuration = _get_mux_configuration()
    api_client = ApiClient(configuration)
    return DirectUploadsApi(api_client)


def create_direct_upload(filename: Optional[str] = None, test: bool = False, passthrough: Optional[str] = None) -> Dict:
    """
    Create a Mux direct upload URL for video upload.
    
    Args:
        filename: Optional filename for the upload
        test: Whether this is a test upload (uses Mux test mode)
        passthrough: Optional JSON string to pass through to webhook (e.g., lesson_id)
    
    Returns:
        Dictionary with upload_url and upload_id
    """
    try:
        asset_settings = {
            "playback_policy": ["public"],  # Make videos publicly playable
            "test": test
        }
        
        if passthrough:
            asset_settings["passthrough"] = passthrough
        
        create_upload_request = CreateUploadRequest(
            new_asset_settings=asset_settings,
            cors_origin="*"  # Allow uploads from any origin (can be restricted in production)
        )
        
        # Create API instance for this request
        direct_uploads_api = _get_direct_uploads_api()
        upload_response = direct_uploads_api.create_direct_upload(create_upload_request)
        
        return {
            "upload_id": upload_response.data.id,
            "upload_url": upload_response.data.url,
            "status": "success"
        }
    except ApiException as e:
        logger.error(f"Mux API error: {e}")
        return {
            "status": "error",
            "message": str(e)
        }
    except Exception as e:
        logger.error(f"Error creating Mux upload: {e}")
        return {
            "status": "error",
            "message": str(e)
        }


def get_playback_url(playback_id: str) -> str:
    """
    Generate Mux playback URL from playback ID.
    
    Args:
        playback_id: Mux playback ID
    
    Returns:
        Mux playback URL
    """
    if not playback_id:
        return ""
    
    # Mux playback URL format
    return f"https://stream.mux.com/{playback_id}.m3u8"


def get_thumbnail_url(playback_id: str, time: float = 0) -> str:
    """
    Generate Mux thumbnail URL from playback ID.
    
    Args:
        playback_id: Mux playback ID
        time: Time in seconds for thumbnail (default: 0)
    
    Returns:
        Mux thumbnail URL
    """
    if not playback_id:
        return ""
    
    return f"https://image.mux.com/{playback_id}/thumbnail.png?time={time}"

