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
    # In Docker, use service name 'redis', otherwise use 'localhost'
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_URL: str = f"redis://{REDIS_HOST}:{REDIS_PORT}"

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
    # Refresh token expires in 7 days
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

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

    # Mux Configuration
    MUX_TOKEN_ID: Optional[str] = os.getenv("MUX_TOKEN_ID")
    MUX_TOKEN_SECRET: Optional[str] = os.getenv("MUX_TOKEN_SECRET")
    MUX_WEBHOOK_SECRET: Optional[str] = os.getenv("MUX_WEBHOOK_SECRET")

    # Cloudflare R2 Configuration (S3-compatible)
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_ENDPOINT_URL: Optional[str] = os.getenv("AWS_ENDPOINT_URL")
    AWS_BUCKET_NAME: Optional[str] = os.getenv("AWS_BUCKET_NAME")
    R2_PUBLIC_DOMAIN: Optional[str] = os.getenv("R2_PUBLIC_DOMAIN")

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

    # Stripe Configuration
    STRIPE_SECRET_KEY: Optional[str] = os.getenv("STRIPE_SECRET_KEY")
    STRIPE_WEBHOOK_SECRET: Optional[str] = os.getenv("STRIPE_WEBHOOK_SECRET")

    # Stripe Price IDs
    ADVANCED_PRICE_ID: str = "price_1SmeXA1a6FlufVwfOLg5SMcc"
    PERFORMER_PRICE_ID: str = "price_1SmeZa1a6FlufVwfrJCJrv94"

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

settings = Settings()
