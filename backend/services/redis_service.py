"""
Redis service for caching and OAuth state management.
"""
import redis
from config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Global Redis connection
_redis_client: Optional[redis.Redis] = None

def get_redis_client() -> redis.Redis:
    """Get or create Redis client."""
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                decode_responses=True,
                socket_connect_timeout=5
            )
            # Test connection
            _redis_client.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise
    return _redis_client

def set_oauth_state(state: str, provider: str, expires_in: int = 600) -> bool:
    """
    Store OAuth state in Redis.
    
    Args:
        state: OAuth state token
        provider: OAuth provider name (e.g., 'google')
        expires_in: Expiration time in seconds (default: 10 minutes)
    
    Returns:
        True if successful, False otherwise
    """
    try:
        client = get_redis_client()
        key = f"oauth_state:{provider}:{state}"
        client.setex(key, expires_in, "1")
        return True
    except Exception as e:
        logger.error(f"Failed to set OAuth state in Redis: {e}")
        return False

def verify_oauth_state(state: str, provider: str) -> bool:
    """
    Verify and consume OAuth state from Redis.
    
    Args:
        state: OAuth state token to verify
        provider: OAuth provider name (e.g., 'google')
    
    Returns:
        True if state is valid, False otherwise
    """
    try:
        client = get_redis_client()
        key = f"oauth_state:{provider}:{state}"
        exists = client.exists(key)
        if exists:
            # Delete the state after verification (one-time use)
            client.delete(key)
            logger.info(f"OAuth state verified successfully for {provider}")
        else:
            logger.warning(f"OAuth state not found in Redis: {key}")
            # For debugging: list all oauth states
            try:
                all_keys = client.keys(f"oauth_state:{provider}:*")
                logger.warning(f"Available states for {provider}: {len(all_keys)} states found")
            except Exception:
                pass
        return bool(exists)
    except Exception as e:
        logger.error(f"Failed to verify OAuth state from Redis: {e}", exc_info=True)
        return False

