"""Request helpers shared across routers."""
from fastapi import Request


def client_ip(request: Request) -> str:
    """
    Best-effort client IP extraction. Respects X-Forwarded-For so that when
    the app is behind Railway / Cloudflare / Vercel proxies, rate limits key
    off the real caller instead of the proxy's rotating internal IP (which
    would silently disable every IP-based rate limit).
    """
    xff = request.headers.get("x-forwarded-for")
    if xff:
        # First entry is the original client; rest are intermediate proxies.
        return xff.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
    return request.client.host if request.client else "unknown"
