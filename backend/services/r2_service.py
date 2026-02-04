"""
Cloudflare R2 Service
Generates signed URLs for secure video streaming with zero egress fees.
Used for weekly archives (not Mux) to reduce costs.
"""
import logging
import hashlib
import hmac
from datetime import datetime, timezone
from urllib.parse import quote, urlencode
from typing import Optional

from config import settings

logger = logging.getLogger(__name__)


def generate_r2_signed_url(
    file_key: str,
    expires_in_seconds: int = 7200  # 2 hours default
) -> str:
    """
    Generate a signed URL for Cloudflare R2 object.
    Uses AWS Signature Version 4 (S3-compatible).
    
    Args:
        file_key: The object key in R2 (e.g., "archives/week-42.mp4")
        expires_in_seconds: URL expiration time (default 2 hours)
    
    Returns:
        Signed URL for the object
    """
    if not settings.R2_ACCESS_KEY_ID or not settings.R2_SECRET_ACCESS_KEY:
        raise ValueError("R2 credentials not configured")
    
    if not settings.R2_BUCKET_NAME or not settings.R2_ACCOUNT_ID:
        raise ValueError("R2 bucket or account ID not configured")
    
    # R2 endpoint format
    host = f"{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
    endpoint = f"https://{host}"
    
    # AWS4 signing
    region = "auto"  # R2 uses "auto" for region
    service = "s3"
    
    # Current time
    now = datetime.now(timezone.utc)
    amz_date = now.strftime("%Y%m%dT%H%M%SZ")
    date_stamp = now.strftime("%Y%m%d")
    
    # Credential scope
    credential_scope = f"{date_stamp}/{region}/{service}/aws4_request"
    
    # Canonical request components
    method = "GET"
    canonical_uri = f"/{settings.R2_BUCKET_NAME}/{quote(file_key, safe='/')}"
    
    # Query string parameters for presigned URL
    query_params = {
        "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
        "X-Amz-Credential": f"{settings.R2_ACCESS_KEY_ID}/{credential_scope}",
        "X-Amz-Date": amz_date,
        "X-Amz-Expires": str(expires_in_seconds),
        "X-Amz-SignedHeaders": "host",
    }
    
    # Sort and encode query string
    canonical_querystring = "&".join(
        f"{quote(k, safe='')}={quote(str(v), safe='')}"
        for k, v in sorted(query_params.items())
    )
    
    # Canonical headers
    canonical_headers = f"host:{host}\n"
    signed_headers = "host"
    
    # Payload hash (UNSIGNED-PAYLOAD for presigned URLs)
    payload_hash = "UNSIGNED-PAYLOAD"
    
    # Create canonical request
    canonical_request = "\n".join([
        method,
        canonical_uri,
        canonical_querystring,
        canonical_headers,
        signed_headers,
        payload_hash
    ])
    
    # Create string to sign
    string_to_sign = "\n".join([
        "AWS4-HMAC-SHA256",
        amz_date,
        credential_scope,
        hashlib.sha256(canonical_request.encode("utf-8")).hexdigest()
    ])
    
    # Calculate signature
    def sign(key: bytes, msg: str) -> bytes:
        return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()
    
    k_date = sign(f"AWS4{settings.R2_SECRET_ACCESS_KEY}".encode("utf-8"), date_stamp)
    k_region = sign(k_date, region)
    k_service = sign(k_region, service)
    k_signing = sign(k_service, "aws4_request")
    signature = hmac.new(k_signing, string_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()
    
    # Construct final URL
    signed_url = f"{endpoint}{canonical_uri}?{canonical_querystring}&X-Amz-Signature={signature}"
    
    logger.info(f"Generated R2 signed URL for key: {file_key}")
    
    return signed_url


def get_public_r2_url(file_key: str) -> str:
    """
    Get a public URL for R2 object (if bucket has public access).
    Use this only for non-sensitive content like thumbnails.
    """
    if settings.R2_PUBLIC_URL:
        return f"{settings.R2_PUBLIC_URL}/{file_key}"
    
    # Fallback to direct R2 URL (requires public access)
    return f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/{settings.R2_BUCKET_NAME}/{file_key}"
