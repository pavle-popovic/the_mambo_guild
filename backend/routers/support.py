"""
Support router — bug report submissions from the global in-app widget.
Endpoint is unauthenticated so logged-out users can also report bugs.
Screenshots are sent as base64 data URIs and uploaded to R2.
"""
import base64
import logging
import re
import uuid
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from services.email_service import send_bug_report_email
from services.redis_service import check_rate_limit
from services.storage_service import get_storage_service

logger = logging.getLogger(__name__)

router = APIRouter()


class DeviceInfo(BaseModel):
    platform: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    screen: Optional[str] = None
    viewport: Optional[str] = None
    pixel_ratio: Optional[float] = None


class BugReportRequest(BaseModel):
    message: str = Field(..., min_length=3, max_length=5000)
    page_url: str = Field(..., max_length=2000)
    user_agent: str = Field(..., max_length=1000)
    device: DeviceInfo
    reporter_email: Optional[str] = Field(None, max_length=320)
    reporter_name: Optional[str] = Field(None, max_length=200)
    # Each entry is a data URI: "data:image/png;base64,...."
    screenshots: List[str] = Field(default_factory=list, max_length=5)


_DATA_URI_RE = re.compile(r"^data:image/(png|jpeg|jpg|webp);base64,(.+)$", re.IGNORECASE)

# Hard cap per image after base64 decode (2 MB)
_MAX_IMAGE_BYTES = 2 * 1024 * 1024


def _upload_screenshot(data_uri: str) -> Optional[str]:
    """Decode a data URI and upload it to R2 under bug-reports/. Returns public URL or None."""
    match = _DATA_URI_RE.match(data_uri.strip())
    if not match:
        logger.warning("Bug report screenshot rejected: invalid data URI format")
        return None

    ext = match.group(1).lower()
    if ext == "jpg":
        ext = "jpeg"
    try:
        raw = base64.b64decode(match.group(2), validate=True)
    except Exception:
        logger.warning("Bug report screenshot rejected: invalid base64")
        return None

    if len(raw) > _MAX_IMAGE_BYTES:
        logger.warning(f"Bug report screenshot rejected: too large ({len(raw)} bytes)")
        return None
    if len(raw) < 100:
        return None

    storage = get_storage_service()
    object_key = f"bug-reports/{uuid.uuid4()}.{ext if ext != 'jpeg' else 'jpg'}"
    try:
        storage.s3_client.put_object(
            Bucket=storage.bucket_name,
            Key=object_key,
            Body=raw,
            ContentType=f"image/{ext}",
        )
    except Exception as e:
        logger.error(f"Failed to upload bug report screenshot to R2: {e}")
        return None

    if storage.public_domain:
        return f"{storage.public_domain}/{object_key}"
    return f"{storage.bucket_name}/{object_key}"


def _client_ip(request: Request) -> str:
    """
    Best-effort client IP extraction. Respects X-Forwarded-For when the app
    is behind Railway / Cloudflare so one abuser behind a proxy doesn't share
    a rate-limit bucket with the rest of the platform.
    """
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/bug-report")
def submit_bug_report(payload: BugReportRequest, request: Request):
    """
    Receive a bug report from the in-app widget and forward it to support@themamboguild.com.

    Rate-limited to 5 reports per IP per hour to prevent abuse / email-quota exhaustion.
    """
    client_ip = _client_ip(request)

    # 5 reports per IP per hour. Fails open if Redis is down.
    if not check_rate_limit(
        identifier=client_ip,
        action="bug_report",
        max_requests=5,
        window_seconds=3600,
    ):
        logger.warning(f"Bug report rate limit exceeded for IP {client_ip}")
        raise HTTPException(
            status_code=429,
            detail="You've sent several bug reports recently. Please wait a bit before sending another, or email support@themamboguild.com directly.",
        )

    # Upload screenshots (best-effort; report still sends even if upload fails)
    screenshot_urls: List[str] = []
    for data_uri in payload.screenshots[:5]:
        url = _upload_screenshot(data_uri)
        if url:
            screenshot_urls.append(url)

    device_info = {
        "platform": payload.device.platform or "—",
        "language": payload.device.language or "—",
        "timezone": payload.device.timezone or "—",
        "screen": payload.device.screen or "—",
        "viewport": payload.device.viewport or "—",
        "pixel_ratio": payload.device.pixel_ratio or "—",
        "client_ip": client_ip,
    }

    sent = send_bug_report_email(
        message=payload.message,
        reporter_email=payload.reporter_email,
        reporter_name=payload.reporter_name,
        page_url=payload.page_url,
        user_agent=payload.user_agent,
        device_info=device_info,
        screenshot_urls=screenshot_urls,
    )

    if not sent:
        raise HTTPException(status_code=500, detail="Failed to send bug report. Please try again or email support@themamboguild.com directly.")

    return {"status": "ok", "screenshots_uploaded": len(screenshot_urls)}
