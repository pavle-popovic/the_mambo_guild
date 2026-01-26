from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Query
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import timedelta, datetime
from models import get_db
from models.user import User, UserProfile, CurrentLevelTag, Subscription, SubscriptionTier, SubscriptionStatus, UserRole
from schemas.auth import (
    UserRegisterRequest, UserLoginRequest, TokenResponse, UserProfileResponse,
    ForgotPasswordRequest, ResetPasswordRequest
)
from services.auth_service import verify_password, get_password_hash, create_access_token
from services.gamification_service import update_streak
from services.email_service import send_password_reset_email
from services.redis_service import set_oauth_state, verify_oauth_state, check_rate_limit
from services.clave_service import process_daily_login, award_new_user_bonus
from dependencies import get_current_user
from config import settings
import uuid
import secrets
import os
from itsdangerous import URLSafeTimedSerializer
from authlib.integrations.httpx_client import AsyncOAuth2Client
from typing import Optional
import logging
from pydantic import BaseModel, EmailStr

# Allow HTTP for OAuth in development (localhost)
# This must be set before importing oauthlib
os.environ.setdefault("OAUTHLIB_INSECURE_TRANSPORT", "1")

logger = logging.getLogger(__name__)

router = APIRouter()

# Password reset token serializer
reset_serializer = URLSafeTimedSerializer(settings.SECRET_KEY)

# OAuth clients (initialized conditionally)
google_oauth = None

def get_google_oauth():
    """Get or create Google OAuth client."""
    global google_oauth
    if not google_oauth and settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
        google_oauth = AsyncOAuth2Client(
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
        )
    return google_oauth


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.
    Industry standard: Email validation, password strength, proper error handling.
    """
    try:
        # Validate email format (basic check)
        if "@" not in user_data.email or "." not in user_data.email.split("@")[1]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Password validation is handled by Pydantic schema (confirm_password and strength check)
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email.lower().strip()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Check if username is taken (case-insensitive)
        existing_username = db.query(UserProfile).filter(
            func.lower(UserProfile.username) == user_data.username.strip().lower()
        ).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

        # Create user
        user_id = uuid.uuid4()
        hashed_password = get_password_hash(user_data.password)
        
        from models.user import UserRole
        user = User(
            id=user_id,
            email=user_data.email.lower().strip(),
            hashed_password=hashed_password,
            auth_provider="email",
            is_verified=False,  # Email verification can be added later
            role=UserRole.STUDENT
        )
        db.add(user)
        db.flush()

        # Create user profile
        try:
            level_tag = CurrentLevelTag[user_data.current_level_tag.upper()]
        except KeyError:
            level_tag = CurrentLevelTag.BEGINNER
        
        # Generate Referral Code for new user
        new_referral_code = secrets.token_hex(4).upper()
        # Verify uniqueness collision
        while db.query(UserProfile).filter(UserProfile.referral_code == new_referral_code).first():
            new_referral_code = secrets.token_hex(4).upper()

        profile = UserProfile(
            id=uuid.uuid4(),
            user_id=user_id,
            first_name=user_data.first_name.strip(),
            last_name=user_data.last_name.strip(),
            username=user_data.username.strip(),
            current_level_tag=level_tag,
            xp=0,
            level=1,
            streak_count=0,
            referral_code=new_referral_code
        )
        db.add(profile)

        # Create default subscription (Rookie tier)
        from models.user import SubscriptionStatus
        subscription = Subscription(
            id=uuid.uuid4(),
            user_id=user_id,
            tier=SubscriptionTier.ROOKIE,
            status=SubscriptionStatus.INCOMPLETE
        )
        db.add(subscription)
        
        # Award new user starter pack (Claves)
        award_new_user_bonus(str(user_id), db)

        db.commit()
        db.refresh(user)

        # Create access token
        access_token = create_access_token(data={"sub": str(user_id)})
        return TokenResponse(access_token=access_token, token_type="bearer")
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        # Log error but don't expose internal details
        import logging
        logging.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )


@router.post("/token", response_model=TokenResponse)
async def login(
    credentials: UserLoginRequest,
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token endpoint for user login.
    Industry standard: Rate limiting, proper error messages, token expiration.
    """
    try:
        # Normalize email (lowercase, strip whitespace)
        email = credentials.email.lower().strip()
        
        # Find user
        user = db.query(User).filter(User.email == email).first()
        
        # Always check password even if user doesn't exist (prevent timing attacks)
        if not user:
            # Use a dummy hash to prevent timing attacks
            get_password_hash("dummy")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        if not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Update streak on login
        try:
            update_streak(str(user.id), db)
        except Exception:
            # Don't fail login if streak update fails
            pass
        
        # Process daily clave claim (v4.0)
        try:
            process_daily_login(str(user.id), db)
            db.commit()
        except Exception:
            # Don't fail login if clave claim fails
            pass

        # Create access token
        access_token = create_access_token(data={"sub": str(user.id)})
        return TokenResponse(access_token=access_token, token_type="bearer")
    
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logging.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again.",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    subscription = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
    tier = subscription.tier if subscription else "rookie"

    today = datetime.now()
    # Award daily login entries/claves logic if needed here, but it's handled in login

    # Get stats
    from models.community import UserStats
    stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    stats_dict = {
        "reactions_given": stats.reactions_given_count if stats else 0,
        "reactions_received": stats.reactions_received_count if stats else 0,
        "solutions_accepted": stats.solutions_accepted_count if stats else 0
    }

    # Get badges
    from services import badge_service
    badges_data = badge_service.get_all_badges_for_user(str(current_user.id), db)

    return UserProfileResponse(
        id=str(current_user.id),
        first_name=profile.first_name,
        last_name=profile.last_name,
        username=profile.username,
        xp=profile.xp,
        level=profile.level,
        streak_count=profile.streak_count,
        tier=tier,
        role=current_user.role.value,
        avatar_url=profile.avatar_url,
        current_level_tag=profile.current_level_tag.value if hasattr(profile, 'current_level_tag') else "Beginner",
        reputation=profile.reputation if hasattr(profile, 'reputation') else 0,
        current_claves=profile.current_claves if hasattr(profile, 'current_claves') else 0,
        badges=badges_data,
        stats=stats_dict
    )


# Helper function to create user with profile and subscription (reused for OAuth)
async def create_user_from_oauth(
    email: str,
    first_name: str,
    last_name: str,
    auth_provider: str,
    social_id: str,
    db: Session,
    avatar_url: Optional[str] = None
) -> User:
    """Create a new user, profile, and subscription from OAuth provider data."""
    user_id = uuid.uuid4()
    
    user = User(
        id=user_id,
        email=email.lower().strip(),
        hashed_password=None,  # OAuth users don't have passwords
        auth_provider=auth_provider,
        social_id=social_id,
        is_verified=True,  # OAuth providers verify emails
        role=UserRole.STUDENT
    )
    db.add(user)
    db.flush()
    
    # Create user profile
    # Generate a temporary username or leave None. Let's leave None and prompt user later.
    
    new_referral_code = secrets.token_hex(4).upper()
    while db.query(UserProfile).filter(UserProfile.referral_code == new_referral_code).first():
        new_referral_code = secrets.token_hex(4).upper()

    profile = UserProfile(
        id=uuid.uuid4(),
        user_id=user_id,
        first_name=first_name.strip(),
        last_name=last_name.strip(),
        username=None, # OAuth users verify this later
        current_level_tag=CurrentLevelTag.BEGINNER,
        xp=0,
        level=1,
        streak_count=0,
        avatar_url=avatar_url,
        referral_code=new_referral_code
    )
    db.add(profile)
    
    # Create default subscription
    subscription = Subscription(
        id=uuid.uuid4(),
        user_id=user_id,
        tier=SubscriptionTier.ROOKIE,
        status=SubscriptionStatus.INCOMPLETE
    )
    db.add(subscription)
    
    db.commit()
    db.refresh(user)
    return user


@router.get("/login/{provider}")
async def oauth_login(provider: str, request: Request):
    """
    Initiate OAuth login flow.
    Redirects user to provider's consent screen.
    """
    if provider != "google":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid provider. Only Google OAuth is supported.")
    
    # Generate state token for CSRF protection
    state = secrets.token_urlsafe(32)
    # Store state in Redis (expires in 10 minutes)
    if not set_oauth_state(state, provider, expires_in=600):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize OAuth flow"
        )
    
    if provider == "google":
        oauth_client = get_google_oauth()
        if not oauth_client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Google OAuth not configured"
            )
        
        # OAuth redirect URI must point to backend, not frontend
        backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
        redirect_uri = f"{backend_url}/api/auth/callback/google"
        
        # Build authorization URL manually (authlib AsyncOAuth2Client doesn't have authorize_url method)
        from urllib.parse import urlencode
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": redirect_uri,
            "scope": "openid email profile",
            "response_type": "code",
            "state": state,
            "access_type": "offline",
            "prompt": "consent"
        }
        authorization_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
        return RedirectResponse(url=authorization_url)
    
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid provider. Only Google OAuth is supported.")


@router.get("/callback/google")
async def google_callback(
    code: str = Query(...),
    state: str = Query(...),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    Handle Google OAuth callback.
    Exchanges code for token, gets user info, and creates/logs in user.
    """
    try:
        # Verify state (CSRF protection)
        state_valid = verify_oauth_state(state, "google")
        if not state_valid:
            logger.warning(f"OAuth state verification failed for state: {state[:20]}...")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OAuth state. Please try again."
            )
        
        oauth_client = get_google_oauth()
        if not oauth_client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Google OAuth not configured"
            )
        
        # OAuth redirect URI must point to backend, not frontend
        backend_url = os.getenv("BACKEND_URL", "http://localhost:8000")
        redirect_uri = f"{backend_url}/api/auth/callback/google"
        
        # Create a new client instance for this request
        callback_client = AsyncOAuth2Client(
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
        )
        
        # Exchange code for token
        try:
            token = await callback_client.fetch_token(
                "https://oauth2.googleapis.com/token",
                code=code,
                redirect_uri=redirect_uri
            )
        except Exception as token_error:
            logger.error(f"Token exchange failed: {str(token_error)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange authorization code. Please try again."
            )
        
        # Get user info using httpx directly (avoid client reuse issues)
        import httpx
        access_token = token.get("access_token")
        if not access_token:
            logger.error("No access token in response from Google")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No access token received from Google"
            )
        
        try:
            async with httpx.AsyncClient() as http_client:
                resp = await http_client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                resp.raise_for_status()  # Raise exception for bad status codes
                user_info = resp.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"Failed to fetch user info: {e.response.status_code} - {e.response.text}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch user information from Google"
            )
        except Exception as user_info_error:
            logger.error(f"Error fetching user info: {str(user_info_error)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve user information"
            )
        
        # Close the OAuth client
        try:
            await callback_client.aclose()
        except Exception:
            pass  # Ignore errors when closing
        
        email = user_info.get("email")
        social_id = user_info.get("id")
        first_name = user_info.get("given_name", "User")
        last_name = user_info.get("family_name", "")
        avatar_url = user_info.get("picture")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google"
            )
        
        # Check if user exists
        user = db.query(User).filter(User.email == email.lower().strip()).first()
        
        if user:
            # User exists - check if we need to link OAuth account
            if user.auth_provider == "email" and not user.social_id:
                # Link OAuth to existing email account
                user.auth_provider = "google"
                user.social_id = social_id
                user.is_verified = True
                if avatar_url and not user.profile.avatar_url:
                    user.profile.avatar_url = avatar_url
                db.commit()
                db.refresh(user)
            elif user.auth_provider != "google":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered with different provider"
                )
        else:
            # Create new user
            try:
                user = await create_user_from_oauth(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    auth_provider="google",
                    social_id=social_id,
                    db=db,
                    avatar_url=avatar_url
                )
            except Exception as create_error:
                logger.error(f"Failed to create user from OAuth: {str(create_error)}", exc_info=True)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user account"
                )
        
        # Update streak on login
        try:
            update_streak(str(user.id), db)
        except Exception:
            pass  # Non-critical, continue even if streak update fails
        
        # Create access token
        access_token = create_access_token(data={"sub": str(user.id)})
        
        # Redirect to frontend with token
        redirect_url = f"{settings.FRONTEND_URL}/auth/callback?token={access_token}&type=bearer"
        logger.info(f"Redirecting to frontend: {redirect_url[:100]}...")  # Log first 100 chars for debugging
        return RedirectResponse(
            url=redirect_url
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google OAuth callback error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OAuth authentication failed"
        )


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    request_data: ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Send password reset email.
    Always returns success to prevent email enumeration.
    Rate limited to 5 requests per 5 minutes per email/IP.
    """
    # Rate limit by email and IP to prevent abuse
    email_normalized = request_data.email.lower().strip()
    client_ip = request.client.host if request.client else "unknown"
    
    if not check_rate_limit(email_normalized, "forgot_password", max_requests=5, window_seconds=300):
        return {"message": "If the email exists, a password reset link has been sent."}
    
    if not check_rate_limit(client_ip, "forgot_password_ip", max_requests=10, window_seconds=300):
        return {"message": "If the email exists, a password reset link has been sent."}
    
    user = db.query(User).filter(User.email == email_normalized).first()
    
    # Always return success to prevent email enumeration
    if not user:
        return {"message": "If the email exists, a password reset link has been sent."}
    
    # Only allow password reset for email-based accounts
    # UNLESS "Account Claiming" mode is active for Waitlist users
    allow_claim = os.getenv("ALLOW_ACCOUNT_CLAIM", "false").lower() == "true"
    
    if user.auth_provider == "waitlist":
        if not allow_claim:
             return {"message": "If the email exists, a password reset link has been sent."}
        # If allow_claim is True, we proceed for waitlist users
    elif user.auth_provider != "email" or not user.hashed_password:
        return {"message": "If the email exists, a password reset link has been sent."}
    
    try:
        # Generate secure reset token
        reset_token = reset_serializer.dumps(
            str(user.id),
            salt="password-reset"
        )
        
        # Send email
        email_sent = send_password_reset_email(user.email, reset_token)
        
        if not email_sent:
            logger.error(f"Failed to send password reset email to {user.email}")
        
        return {"message": "If the email exists, a password reset link has been sent."}
    
    except Exception as e:
        logger.error(f"Password reset error for {request_data.email}: {str(e)}")
        return {"message": "If the email exists, a password reset link has been sent."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    request_data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Reset password using token from email.
    """
    try:
        # Verify and decode token
        user_id_str = reset_serializer.loads(
            request_data.token,
            salt="password-reset",
            max_age=settings.PASSWORD_RESET_EXPIRE_MINUTES * 60  # Convert to seconds
        )
        
        user_id = uuid.UUID(user_id_str)
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Only allow reset for email-based accounts
        # UNLESS "Account Claiming" mode is active for Waitlist users
        allow_claim = os.getenv("ALLOW_ACCOUNT_CLAIM", "false").lower() == "true"
        
        if user.auth_provider == "waitlist":
            if not allow_claim:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail="Account claiming is not currently active."
                )
            # If allow_claim is True, we proceed (and will convert user below)
        elif user.auth_provider != "email":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset not available for OAuth accounts"
            )
        
        # Hash new password
        user.hashed_password = get_password_hash(request_data.new_password)
        
        # If this was a waitlist user claiming their account, convert them!
        if user.auth_provider == "waitlist":
            user.auth_provider = "email"
            user.is_verified = True
            logger.info(f"User {user.id} claimed account and converted from waitlist to email.")
            
        db.commit()
        
        return {"message": "Password reset successfully"}
    
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        logger.error(f"Password reset error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

# -------------------------------------------------------------------------
# WAITLIST & VELVET ROPE AUTH
# -------------------------------------------------------------------------

class WaitlistRegisterRequest(BaseModel):
    email: EmailStr
    username: str
    referrer_code: Optional[str] = None

@router.post("/waitlist", status_code=status.HTTP_201_CREATED)
async def join_waitlist(
    request: WaitlistRegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Join The Velvet Rope (Waitlist).
    - Create User (no password)
    - Reserve Username
    - Assign 'Founder' Badge
    - Track Referrals
    """
    try:
        # Validate Email
        email = request.email.lower().strip()
        if db.query(User).filter(User.email == email).first():
            raise HTTPException(status_code=400, detail="This email is already on the list.")

        # Validate Username
        username = request.username.strip()
        if db.query(UserProfile).filter(func.lower(UserProfile.username) == username.lower()).first():
            raise HTTPException(status_code=400, detail="This username is reserved. Choose another.")

        # Create User
        user_id = uuid.uuid4()
        user = User(
            id=user_id,
            email=email,
            auth_provider="waitlist",  # Special provider
            is_verified=False,
            role=UserRole.STUDENT,
            hashed_password=None
        )
        db.add(user)
        db.flush()

        # Handle Referral
        referrer_id = None
        referrer_profile = None
        if request.referrer_code:
            referrer_profile = db.query(UserProfile).filter(UserProfile.referral_code == request.referrer_code).first()
            if referrer_profile:
                # Increment referrer count
                referrer_profile.referral_count += 1
                # Track who referred (store code for simple tracking)
                # Ideally we'd store user_id but for v1 waitlist using code is fine
                pass

        # Generate Referral Code for new user
        # Simple 8 char uppercase alphanumeric
        new_referral_code = secrets.token_hex(4).upper()
        # Verify uniqueness collision (rare but possible)
        while db.query(UserProfile).filter(UserProfile.referral_code == new_referral_code).first():
            new_referral_code = secrets.token_hex(4).upper()

        # Create Profile
        profile = UserProfile(
            id=uuid.uuid4(),
            user_id=user_id,
            first_name="Founder", # Placeholder
            last_name="Member",   # Placeholder
            username=username,
            current_level_tag=CurrentLevelTag.BEGINNER,
            referral_code=new_referral_code,
            referred_by_code=request.referrer_code,
            badges="[]"
        )
        db.add(profile)

        # Create Subscription (Rookie)
        subscription = Subscription(
            id=uuid.uuid4(),
            user_id=user_id,
            tier=SubscriptionTier.ROOKIE,
            status=SubscriptionStatus.INCOMPLETE
        )
        db.add(subscription)
        
        db.commit() # Commit to generate IDs

        # Award Founder Badge
        from services import badge_service
        try:
            badge_service.award_badge(str(user_id), "founder_diamond", db)
        except Exception as e:
            logger.error(f"Failed to award founder badge: {e}")

        # Check Referrer Milestones
        if request.referrer_code and referrer_profile:
            referrer_user_id = str(referrer_profile.user_id)
            # Example: Invite 3 friends -> Get Beta Tester
            if referrer_profile.referral_count >= 3:
                try:
                    badge_service.award_badge(referrer_user_id, "beta_tester", db)
                except:
                    pass
        
        db.commit()

        return {
            "message": "Welcome to the Inner Circle.",
            "user_id": str(user_id),
            "referral_code": new_referral_code,
            "position": 1234 # Mock position or calc from COUNT(id)
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Waitlist error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to join waitlist.")
