"""Request helpers shared across routers."""
from fastapi import Request

from config import settings


def client_ip(request: Request) -> str:
    """
    Best-effort client IP extraction that resists X-Forwarded-For spoofing.

    Rule: the client's real IP is the value in X-Forwarded-For at position
    ``-TRUSTED_PROXY_HOPS`` (i.e. the entry written by the first trusted proxy
    that saw the client). If the header is shorter than expected — meaning the
    client did not append spoofed entries — the leftmost value is used. If
    TRUSTED_PROXY_HOPS is 0 (local dev with no proxy), X-Forwarded-For and
    X-Real-IP are ignored because neither header can be trusted on a direct
    connection.

    This keeps per-IP rate limits honest behind Railway / Cloudflare / Vercel.
    """
    trusted_hops = settings.TRUSTED_PROXY_HOPS

    if trusted_hops > 0:
        xff = request.headers.get("x-forwarded-for")
        if xff:
            parts = [p.strip() for p in xff.split(",") if p.strip()]
            if parts:
                # Strip up to (trusted_hops - 1) trailing entries written by
                # intermediate trusted proxies. The value just before those is
                # the real client as seen by the first trusted proxy. If the
                # header is shorter than expected, treat the leftmost as the
                # real client (no spoofed prefix to strip).
                idx = max(0, len(parts) - trusted_hops)
                return parts[idx]

        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()

    return request.client.host if request.client else "unknown"
