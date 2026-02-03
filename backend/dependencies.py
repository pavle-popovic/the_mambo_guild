from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from sqlalchemy.orm import Session
from models import get_db
from models.user import User, UserRole
from services.auth_service import decode_access_token
import uuid

# OAuth2 scheme - token URL must match the actual endpoint
# auto_error=False allows us to check cookies as fallback
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)


def _extract_token(request: Request, bearer_token: Optional[str]) -> Optional[str]:
    """
    Extract token from Bearer header or httpOnly cookie.
    Priority: Bearer header > Cookie (for API client compatibility)
    """
    # Try Bearer token first (for mobile/API clients)
    if bearer_token:
        return bearer_token
    
    # Try httpOnly cookie (for web clients)
    cookie_token = request.cookies.get("access_token")
    if cookie_token:
        return cookie_token
    
    return None


def get_current_user(
    request: Request,
    bearer_token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from Bearer token or httpOnly cookie.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = _extract_token(request, bearer_token)
    if not token:
        raise credentials_exception
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception
    
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    return user


def get_current_user_optional(
    request: Request,
    bearer_token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Optional authentication - returns user if token is valid, None otherwise."""
    token = _extract_token(request, bearer_token)
    if not token:
        return None
    
    try:
        payload = decode_access_token(token)
        if payload is None:
            return None
        
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            return None
        
        try:
            user_id = uuid.UUID(user_id_str)
        except ValueError:
            return None
        
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except Exception:
        return None


def get_admin_user(
    request: Request,
    bearer_token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current user and verify they have admin role."""
    current_user = get_current_user(request, bearer_token, db)
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

