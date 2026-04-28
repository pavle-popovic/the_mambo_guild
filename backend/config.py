import os
from typing import Optional
import secrets

class Settings:
    # Environment detection
    _environment: str = os.getenv("ENVIRONMENT", "development").lower()
    _is_production: bool = _environment == "production"
    _is_development: bool = _environment == "development"
    
    # Database
    # In Docker, use service name 'postgres', otherwise use 'localhost' or '127.0.0.1'
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://admin:admin@localhost:5432/themamboinn"
    )

    # Redis
    # Production (Railway/Upstash): set REDIS_URL to the full connection string
    # including password, e.g. redis://default:pw@host.railway.internal:6379
    # Local/Docker: set REDIS_HOST (service name 'redis' or 'localhost') and we
    # build the URL from host+port.  REDIS_URL always wins when set.
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_URL: str = os.getenv("REDIS_URL") or f"redis://{REDIS_HOST}:{REDIS_PORT}"

    # JWT - SECURITY: SECRET_KEY MUST be set via environment variable in all deployed environments
    # Only local development (ENVIRONMENT=development) allows auto-generated keys
    _secret_key_env: Optional[str] = os.getenv("SECRET_KEY")
    
    # Generate a random key for local dev only (changes on restart - intentional for security)
    _dev_secret_key: str = secrets.token_urlsafe(32)

    @property
    def SECRET_KEY(self) -> str:
        if self._secret_key_env:
            return self._secret_key_env
        if self._is_development:
            # Only allow auto-generated key in local development
            print("⚠️  WARNING: Using auto-generated SECRET_KEY for development. Set SECRET_KEY env var for production!")
            return self._dev_secret_key
        # Non-development without SECRET_KEY = fail
        raise ValueError(
            "SECRET_KEY environment variable is required! "
            "Set a secure random string (min 32 chars) in your Railway/Vercel environment variables."
        )

    ALGORITHM: str = "HS256"
    # Access token expires in 30 minutes (short-lived for security)
    # Refresh tokens should be used for longer sessions
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    # Refresh token expires in 30 days. Bumped from 7 to reduce "logged out
    # again" reports from weekly-active users on mobile (iOS Safari suspends
    # background tabs and aggressively drops third-party cookies under ITP —
    # a 7-day window clips users who dip in less than once a week). Sliding
    # renewal happens on every /auth/refresh, so active users functionally
    # never expire.
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))

    # CORS - validate and parse origins
    @property
    def CORS_ORIGINS(self) -> list:
        origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000")
        origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]
        # Validate origins in production
        if self._is_production:
            for origin in origins:
                if not origin.startswith("https://") and not origin.startswith("http://localhost"):
                    print(f"⚠️  WARNING: Non-HTTPS origin in production CORS: {origin}")
        return origins
    
    # Security settings
    SECURE_COOKIES: bool = os.getenv("SECURE_COOKIES", "true" if _is_production else "false").lower() == "true"
    COOKIE_DOMAIN: Optional[str] = os.getenv("COOKIE_DOMAIN")  # e.g., ".yourdomain.com" for cross-subdomain

    # Number of trusted reverse proxies sitting between the client and this app.
    # Used by utils.request.client_ip to pick the real client IP from X-Forwarded-For
    # without letting clients spoof the header. Railway-only deploy = 1. Cloudflare
    # + Railway = 2. Local dev with no proxy = 0 (falls back to request.client.host).
    TRUSTED_PROXY_HOPS: int = int(os.getenv("TRUSTED_PROXY_HOPS", "1" if _is_production else "0"))

    # Mux Configuration
    MUX_TOKEN_ID: Optional[str] = os.getenv("MUX_TOKEN_ID")
    MUX_TOKEN_SECRET: Optional[str] = os.getenv("MUX_TOKEN_SECRET")
    MUX_WEBHOOK_SECRET: Optional[str] = os.getenv("MUX_WEBHOOK_SECRET")

    # Cloudflare R2 Configuration (S3-compatible)
    # Legacy AWS naming (for backwards compatibility)
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_ENDPOINT_URL: Optional[str] = os.getenv("AWS_ENDPOINT_URL")
    AWS_BUCKET_NAME: Optional[str] = os.getenv("AWS_BUCKET_NAME")
    R2_PUBLIC_DOMAIN: Optional[str] = os.getenv("R2_PUBLIC_DOMAIN")
    
    # R2-specific settings for archives (signed URLs)
    R2_ACCESS_KEY_ID: Optional[str] = os.getenv("R2_ACCESS_KEY_ID") or os.getenv("AWS_ACCESS_KEY_ID")
    R2_SECRET_ACCESS_KEY: Optional[str] = os.getenv("R2_SECRET_ACCESS_KEY") or os.getenv("AWS_SECRET_ACCESS_KEY")
    R2_ACCOUNT_ID: Optional[str] = os.getenv("R2_ACCOUNT_ID")  # Cloudflare account ID
    R2_BUCKET_NAME: Optional[str] = os.getenv("R2_BUCKET_NAME") or os.getenv("AWS_BUCKET_NAME")
    R2_PUBLIC_URL: Optional[str] = os.getenv("R2_PUBLIC_URL")  # Optional public URL for thumbnails

    # OAuth Configuration
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET")
    APPLE_CLIENT_ID: Optional[str] = os.getenv("APPLE_CLIENT_ID")
    APPLE_PRIVATE_KEY: Optional[str] = os.getenv("APPLE_PRIVATE_KEY")
    APPLE_TEAM_ID: Optional[str] = os.getenv("APPLE_TEAM_ID")
    APPLE_KEY_ID: Optional[str] = os.getenv("APPLE_KEY_ID")

    # Email Service Configuration
    RESEND_API_KEY: Optional[str] = os.getenv("RESEND_API_KEY")
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "onboarding@resend.dev")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Password Reset Configuration
    PASSWORD_RESET_EXPIRE_MINUTES: int = int(os.getenv("PASSWORD_RESET_EXPIRE_MINUTES", "60"))  # 1 hour default

    # Email verification token lifetime. 24h is the industry-standard middle
    # ground (1h is too tight for users who skim inbox once a day; 7d gives
    # an unnecessarily wide replay window). Token is single-use anyway —
    # blacklisted in Redis after consumption — so even within the window a
    # link can't be reused.
    EMAIL_VERIFICATION_EXPIRE_HOURS: int = int(os.getenv("EMAIL_VERIFICATION_EXPIRE_HOURS", "24"))

    # Stripe Configuration
    STRIPE_SECRET_KEY: Optional[str] = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_WEBHOOK_SECRET: Optional[str] = os.getenv("STRIPE_WEBHOOK_SECRET")

    # Stripe Price IDs. The defaults are TEST-mode; set
    # STRIPE_ADVANCED_PRICE_ID / STRIPE_PERFORMER_PRICE_ID in the live env to
    # switch to the production prices without a code change.
    ADVANCED_PRICE_ID: str = os.getenv(
        "STRIPE_ADVANCED_PRICE_ID", "price_1TKKp51a6FlufVwfYgvr192X"
    )
    PERFORMER_PRICE_ID: str = os.getenv(
        "STRIPE_PERFORMER_PRICE_ID", "price_1TKKwC1a6FlufVwfVmE6uHml"
    )

    # Anthropic (Claude) API - used by moderation_service and ai_chat
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY")

    # Community: when True, trialing users can NOT post or comment (only
    # status=ACTIVE on Advanced/Performer can). Default False = trial users
    # can author content. Flip to True later to require a fully-paid period
    # before posting (extra friction against drive-by abuse).
    BLOCK_TRIAL_FROM_COMMUNITY_POSTING: bool = (
        os.getenv("BLOCK_TRIAL_FROM_COMMUNITY_POSTING", "false").lower() == "true"
    )

    # AI/Gemini Configuration - SECURITY: API key must be set via environment variable
    _gemini_api_key: Optional[str] = os.getenv("GEMINI_API_KEY")

    @property
    def GEMINI_API_KEY(self) -> Optional[str]:
        """Get Gemini API key. Returns None if not configured (AI features disabled)."""
        return self._gemini_api_key

    def require_gemini_api_key(self) -> str:
        """Get Gemini API key, raising error if not configured."""
        if not self._gemini_api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required for AI features")
        return self._gemini_api_key

    # AI Rate Limiting Configuration
    AI_RATE_LIMIT_REQUESTS: int = int(os.getenv("AI_RATE_LIMIT_REQUESTS", "20"))  # requests per window
    AI_RATE_LIMIT_WINDOW_SECONDS: int = int(os.getenv("AI_RATE_LIMIT_WINDOW_SECONDS", "60"))  # window in seconds

    # Meta Conversions API (server-side ad event tracking)
    # Pixel ID is also safe to expose client-side via NEXT_PUBLIC_META_PIXEL_ID.
    # CAPI access token is a server-only secret. TEST_EVENT_CODE is set only in
    # staging/dev to route events to Events Manager's Test Events tab.
    META_PIXEL_ID: Optional[str] = os.getenv("META_PIXEL_ID")
    META_CAPI_ACCESS_TOKEN: Optional[str] = os.getenv("META_CAPI_ACCESS_TOKEN")
    META_TEST_EVENT_CODE: Optional[str] = os.getenv("META_TEST_EVENT_CODE")
    META_API_VERSION: str = os.getenv("META_API_VERSION", "v20.0")

settings = Settings()
