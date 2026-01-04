import os
from typing import Optional

class Settings:
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
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: list = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:8000"
    ).split(",")
    
    # Mux Configuration
    MUX_TOKEN_ID: Optional[str] = os.getenv("MUX_TOKEN_ID")
    MUX_TOKEN_SECRET: Optional[str] = os.getenv("MUX_TOKEN_SECRET")

settings = Settings()

