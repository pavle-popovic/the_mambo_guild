from fastapi import FastAPI, Request, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import logging
import re
from routers import api_router
from routers.mux import mux_webhook_handler
from config import settings
from models import get_db
from sqlalchemy.orm import Session
from typing import Optional


# ---------------------------------------------------------------------------
# Access-log scrubber
# ---------------------------------------------------------------------------
# MuxUploader must pass auth via ?token=<jwt> (it cannot set headers).  Even
# though the JWT is narrow-scope and short-lived, we don't want it landing in
# Railway's retained access logs where it could leak sideways.  This logging
# Filter rewrites any record that mentions ``token=<…>`` to ``token=REDACTED``
# before emission.  Attached to uvicorn's access logger at startup below.
_TOKEN_QS_RE = re.compile(r"(token=)[^\s&'\"]+", re.IGNORECASE)


class _RedactTokenFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        try:
            if isinstance(record.msg, str) and "token=" in record.msg.lower():
                record.msg = _TOKEN_QS_RE.sub(r"\1REDACTED", record.msg)
            if record.args:
                new_args = []
                for arg in record.args if isinstance(record.args, tuple) else (record.args,):
                    if isinstance(arg, str) and "token=" in arg.lower():
                        arg = _TOKEN_QS_RE.sub(r"\1REDACTED", arg)
                    new_args.append(arg)
                record.args = tuple(new_args)
        except Exception:
            # Never break logging on a scrub failure
            pass
        return True


def _install_token_log_scrubber() -> None:
    redactor = _RedactTokenFilter()
    for name in ("uvicorn.access", "uvicorn.error", "uvicorn", ""):
        logging.getLogger(name).addFilter(redactor)


_install_token_log_scrubber()


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""
    
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # XSS protection (legacy but still useful for older browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Referrer policy - don't leak URLs
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions policy - restrict browser features
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # HSTS - force HTTPS (only in production)
        if settings._is_production:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response


app = FastAPI(
    title="Salsa Lab API",
    description="Backend API for Salsa Lab",
    version="1.0.0",
    # Hide docs in production
    docs_url="/docs" if not settings._is_production else None,
    redoc_url="/redoc" if not settings._is_production else None,
)

# Security headers middleware (innermost - runs last)
app.add_middleware(SecurityHeadersMiddleware)

# Session middleware - Required for OAuth state management and session support
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    max_age=3600,  # 1 hour session timeout
    same_site="lax",
    https_only=settings.SECURE_COOKIES,  # Only send over HTTPS in production
)

# CORS middleware MUST be added LAST (Starlette uses LIFO order)
# This ensures it's the outermost layer and CORS headers are added to ALL responses including errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix="/api")

# Mux webhook alias — canonical path is /api/mux/webhook (registered in mux router).
# This alias keeps backward compatibility if an older Mux dashboard config pointed here.
# Configure the Mux dashboard to use /api/mux/webhook going forward.
@app.post("/api/webhook")
async def mux_webhook_alias(
    request: Request,
    db: Session = Depends(get_db),
    mux_signature: Optional[str] = Header(None, alias="Mux-Signature")
):
    return await mux_webhook_handler(request, db, mux_signature)


@app.get("/")
async def root():
    return {"message": "Salsa Lab API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

