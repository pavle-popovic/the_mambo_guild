import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from config import settings
from typing import Optional


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a bcrypt hash.
    Industry standard: Use bcrypt for password hashing.
    """
    if not hashed_password:
        return False
    try:
        # Bcrypt has a 72-byte limit, truncate if necessary
        password_bytes = plain_password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
        
        # Ensure hash is bytes
        if isinstance(hashed_password, str):
            hash_bytes = hashed_password.encode('utf-8')
        else:
            hash_bytes = hashed_password
        
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except Exception:
        # If hash is invalid or verification fails, return False
        return False


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt.
    Industry standard: Use bcrypt with appropriate cost factor.
    Note: Bcrypt has a 72-byte limit - passwords are validated at input to not exceed this.
    """
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # This should be caught by validation, but truncate as safety measure
        password_bytes = password_bytes[:72]
    
    # Generate salt and hash (cost factor 12 is a good balance)
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a short-lived access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({
        "exp": expire,
        "type": "access"
    })
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a long-lived refresh token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({
        "exp": expire,
        "type": "refresh"
    })
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate an access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        # Verify it's an access token (or legacy token without type)
        token_type = payload.get("type")
        if token_type and token_type != "access":
            return None
        return payload
    except JWTError:
        return None


def decode_refresh_token(token: str) -> Optional[dict]:
    """Decode and validate a refresh token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        # Must be a refresh token
        if payload.get("type") != "refresh":
            return None
        return payload
    except JWTError:
        return None

