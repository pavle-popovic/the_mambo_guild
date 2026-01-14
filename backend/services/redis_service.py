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


def check_rate_limit(identifier: str, action: str, max_requests: int = 5, window_seconds: int = 300) -> bool:
    """
    Check if an action is rate limited for a given identifier.
    
    Args:
        identifier: Unique identifier (e.g., email or IP address)
        action: The action being rate limited (e.g., 'forgot_password')
        max_requests: Maximum requests allowed in the window
        window_seconds: Time window in seconds (default: 5 minutes)
    
    Returns:
        True if allowed (not rate limited), False if blocked
    """
    try:
        client = get_redis_client()
        key = f"rate_limit:{action}:{identifier}"
        current = client.get(key)
        
        if current is None:
            # First request - set counter with expiration
            client.setex(key, window_seconds, 1)
            return True
        
        if int(current) >= max_requests:
            logger.warning(f"Rate limit exceeded for {action}: {identifier}")
            return False
        
        # Increment counter (keep existing TTL)
        client.incr(key)
        return True
    except Exception as e:
        logger.error(f"Rate limit check failed: {e}")
        # Fail open - allow request if Redis is unavailable
        return True
