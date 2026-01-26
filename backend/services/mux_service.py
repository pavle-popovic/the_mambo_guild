"""
Mux service for video upload and playback URL generation.
"""
import logging
import time
from typing import Dict, Optional
import mux_python
from mux_python import Configuration, ApiClient, ApiException, DirectUploadsApi
from mux_python.models import CreateUploadRequest, CreateAssetRequest, Asset, AssetMetadata
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


def create_direct_upload(
    filename: Optional[str] = None,
    test: bool = False,
    passthrough: Optional[str] = None,
    external_id: Optional[str] = None,
    title: Optional[str] = None,
    creator_id: Optional[str] = None,
    is_community: bool = False
) -> Dict:
    """
    Create a Mux direct upload URL for video upload.

    Args:
        filename: Optional filename for the upload
        test: Whether this is a test upload (uses Mux test mode)
        passthrough: Optional JSON string to pass through to webhook (e.g., lesson_id)
        external_id: Optional external ID for asset organization (e.g., "lesson-mambo-212-w1-d1-l1")
        title: Optional human-readable title (e.g., "Mambo 212 - Week 1 Day 1: Basic Steps")
        creator_id: Optional creator ID for folder-like organization (e.g., "lesson", "course-preview", "community-stage")
        is_community: If True, cap resolution at 720p for community posts. If False, enable MP4 downloads for lessons.

    Returns:
        Dictionary with upload_url and upload_id
    """
    try:
        # Verify Mux credentials are configured
        if not settings.MUX_TOKEN_ID or not settings.MUX_TOKEN_SECRET:
            logger.error("Mux credentials not configured")
            return {
                "status": "error",
                "message": "Mux credentials not configured. Please set MUX_TOKEN_ID and MUX_TOKEN_SECRET."
            }
        
        # Build metadata object if any metadata fields provided
        meta = None
        if external_id or title or creator_id:
            meta = AssetMetadata(
                external_id=external_id[:128] if external_id else None,  # Max 128 code points
                title=title[:512] if title else None,  # Max 512 code points
                creator_id=creator_id[:128] if creator_id else None  # Max 128 code points
            )
        
        # Build asset settings using CreateAssetRequest
        print(f"[MUX] Building asset request, is_community={is_community}", flush=True)

        if is_community:
            print(f"[MUX] Community upload - capping at 1080p (min supported tier), was 720p but invalid", flush=True)
            asset_request = CreateAssetRequest(
                playback_policies=["public"],
                test=test,
                max_resolution_tier="1080p",
                passthrough=passthrough if passthrough else None,
                meta=meta
            )
        else:
            # Lesson upload - Enable MP4 downloads for offline practice
            print(f"[MUX] LESSON UPLOAD - ENABLING MP4 SUPPORT (capped-1080p)!", flush=True)
            asset_request = CreateAssetRequest(
                playback_policies=["public"],
                test=test,
                mp4_support="capped-1080p",  # Non-deprecated value for MP4 renditions
                passthrough=passthrough if passthrough else None,
                meta=meta
            )

        print(f"[MUX] CreateAssetRequest created with mp4_support={asset_request.mp4_support}", flush=True)

        create_upload_request = CreateUploadRequest(
            new_asset_settings=asset_request,
            cors_origin="*"  # Allow uploads from any origin (can be restricted in production)
        )
        
        # Create API instance for this request with retry logic
        direct_uploads_api = _get_direct_uploads_api()
        
        # Retry logic for network issues
        max_retries = 3
        retry_delay = 1  # seconds
        
        for attempt in range(max_retries):
            try:
                upload_response = direct_uploads_api.create_direct_upload(create_upload_request)
                
                return {
                    "upload_id": upload_response.data.id,
                    "upload_url": upload_response.data.url,
                    "status": "success"
                }
            except (ApiException, Exception) as e:
                error_msg = str(e)
                is_network_error = (
                    "NameResolutionError" in error_msg or 
                    "Failed to resolve" in error_msg or
                    "Connection" in error_msg or
                    "timeout" in error_msg.lower()
                )
                
                if is_network_error and attempt < max_retries - 1:
                    logger.warning(f"Mux API network error (attempt {attempt + 1}/{max_retries}): {e}. Retrying...")
                    time.sleep(retry_delay * (attempt + 1))  # Exponential backoff
                    continue
                else:
                    # Last attempt failed or non-network error
                    if is_network_error:
                        error_msg = "Network error: Cannot reach Mux API. Please check your internet connection and try again."
                    raise
        
    except ApiException as e:
        logger.error(f"Mux API error: {e}")
        error_msg = str(e)
        # Provide more helpful error messages
        if "NameResolutionError" in error_msg or "Failed to resolve" in error_msg:
            error_msg = "Network error: Cannot reach Mux API. Please check your internet connection and try again."
        return {
            "status": "error",
            "message": error_msg
        }
    except Exception as e:
        logger.error(f"Error creating Mux upload: {e}", exc_info=True)
        error_msg = str(e)
        # Provide more helpful error messages
        if "NameResolutionError" in error_msg or "Failed to resolve" in error_msg:
            error_msg = "Network error: Cannot reach Mux API. Please check your internet connection and try again."
        return {
            "status": "error",
            "message": error_msg
        }


def delete_asset(asset_id: str) -> bool:
    """
    Delete an asset from Mux.
    
    Args:
        asset_id: Mux asset ID
        
    Returns:
        True if successful, False otherwise
    """
    if not asset_id:
        return False
        
    try:
        configuration = _get_mux_configuration()
        api_client = ApiClient(configuration)
        assets_api = mux_python.AssetsApi(api_client)
        
        assets_api.delete_asset(asset_id)
        logger.info(f"Deleted Mux asset: {asset_id}")
        return True
        
    except ApiException as e:
        logger.error(f"Failed to delete Mux asset {asset_id}: {e}")
        return False
    except Exception as e:
        logger.error(f"Error deleting Mux asset {asset_id}: {e}")
        return False


