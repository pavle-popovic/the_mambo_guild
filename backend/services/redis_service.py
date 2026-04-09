"""
Redis service for caching and OAuth state management.
"""
import redis
import hashlib
from config import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Global Redis connection
_redis_client: Optional[redis.Redis] = None

def get_redis_client() -> redis.Redis:
    """Get or create Redis client.

    Uses `settings.REDIS_URL` which is populated from the REDIS_URL env var
    in production (Railway/Upstash provide a full ``redis://user:pw@host:port``
    URL including password).  Falls back to a host+port URL in local docker.
    """
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=5,
            )
            # Test connection
            _redis_client.ping()
            logger.info(f"Redis connection established to {settings.REDIS_URL.split('@')[-1]}")
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


# ============================================
# Clave Economy Caching (v4.0)
# ============================================

CLAVE_BALANCE_TTL = 300  # 5 minutes
FEED_CACHE_TTL = 60      # 1 minute (social data changes often)


def cache_clave_balance(user_id: str, balance: int) -> bool:
    """
    Cache user's clave balance for fast reads.
    
    Args:
        user_id: User's UUID
        balance: Current clave balance
    
    Returns:
        True if successful, False otherwise
    """
    try:
        client = get_redis_client()
        key = f"claves:balance:{user_id}"
        client.setex(key, CLAVE_BALANCE_TTL, str(balance))
        return True
    except Exception as e:
        logger.error(f"Failed to cache clave balance: {e}")
        return False


def get_cached_clave_balance(user_id: str) -> Optional[int]:
    """
    Get cached clave balance.
    
    Returns:
        Cached balance or None if cache miss
    """
    try:
        client = get_redis_client()
        key = f"claves:balance:{user_id}"
        cached = client.get(key)
        if cached is not None:
            return int(cached)
        return None
    except Exception as e:
        logger.error(f"Failed to get cached clave balance: {e}")
        return None


def invalidate_clave_balance(user_id: str) -> bool:
    """
    Invalidate cached clave balance after a transaction.
    
    Args:
        user_id: User's UUID
    
    Returns:
        True if successful, False otherwise
    """
    try:
        client = get_redis_client()
        key = f"claves:balance:{user_id}"
        client.delete(key)
        return True
    except Exception as e:
        logger.error(f"Failed to invalidate clave balance cache: {e}")
        return False


def cache_feed_page(feed_type: str, page: int, data: str) -> bool:
    """
    Cache a page of feed data.
    
    Args:
        feed_type: 'stage' or 'lab' or 'all'
        page: Page number
        data: JSON string of feed data
    
    Returns:
        True if successful, False otherwise
    """
    try:
        client = get_redis_client()
        key = f"feed:{feed_type}:page:{page}"
        client.setex(key, FEED_CACHE_TTL, data)
        return True
    except Exception as e:
        logger.error(f"Failed to cache feed page: {e}")
        return False


def get_cached_feed_page(feed_type: str, page: int) -> Optional[str]:
    """
    Get cached feed page.
    
    Returns:
        Cached JSON string or None if cache miss
    """
    try:
        client = get_redis_client()
        key = f"feed:{feed_type}:page:{page}"
        return client.get(key)
    except Exception as e:
        logger.error(f"Failed to get cached feed page: {e}")
        return None


# ============================================
# Token Blacklist (for logout / revocation)
# ============================================

_TOKEN_BLACKLIST_PREFIX = "blacklisted:token:"


def blacklist_token(token: str, ttl_seconds: int) -> bool:
    """
    Add an access token to the blacklist so it can no longer be used after logout.
    The entry expires automatically after `ttl_seconds` (the token's own remaining lifetime).

    Returns True on success, False if Redis is unavailable (non-fatal — token expires anyway).
    """
    if ttl_seconds <= 0:
        return True  # Token already expired; nothing to blacklist
    try:
        client = get_redis_client()
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        key = f"{_TOKEN_BLACKLIST_PREFIX}{token_hash}"
        client.setex(key, ttl_seconds, "1")
        return True
    except Exception as e:
        logger.error(f"Failed to blacklist token: {e}")
        return False


def is_token_blacklisted(token: str) -> bool:
    """
    Return True if the token has been explicitly revoked (e.g. after logout).
    Fails *open* on Redis error — if Redis is down we allow the request rather
    than lock everyone out.
    """
    try:
        client = get_redis_client()
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        key = f"{_TOKEN_BLACKLIST_PREFIX}{token_hash}"
        return bool(client.exists(key))
    except Exception as e:
        logger.error(f"Failed to check token blacklist: {e}")
        return False  # Fail open


def invalidate_feed_cache(feed_type: str = None) -> bool:
    """
    Invalidate feed cache. Called when posts are created/deleted.
    
    Args:
        feed_type: Specific feed type to invalidate, or None for all
    
    Returns:
        True if successful, False otherwise
    """
    try:
        client = get_redis_client()
        if feed_type:
            pattern = f"feed:{feed_type}:*"
        else:
            pattern = "feed:*"
        
        keys = client.keys(pattern)
        if keys:
            client.delete(*keys)
            logger.info(f"Invalidated {len(keys)} feed cache entries")
        return True
    except Exception as e:
        logger.error(f"Failed to invalidate feed cache: {e}")
        return False
