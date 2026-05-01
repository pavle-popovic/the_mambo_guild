from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status, Request, Response, Query
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import timedelta, datetime, timezone
from models import get_db
from models.user import User, UserProfile, CurrentLevelTag, Subscription, SubscriptionTier, SubscriptionStatus, UserRole
from schemas.auth import (
    UserRegisterRequest, UserLoginRequest, TokenResponse, UserProfileResponse,
    ForgotPasswordRequest, ResetPasswordRequest,
    VerifyEmailRequest, ResendVerificationRequest,
)
from services.auth_service import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_access_token
from services.gamification_service import update_streak
from services.email_service import send_password_reset_email, send_waitlist_welcome_email, send_email_verification_email
from services.redis_service import set_oauth_state, verify_oauth_state, check_rate_limit
from services.clave_service import process_daily_login, award_new_user_bonus, award_referral_bonus
from services.analytics_service import track_event, capture_first_touch
from services.email_validation import is_disposable_email, normalize_email_for_dedup, has_deliverable_domain
from utils.request import client_ip as get_client_ip
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
import re

# ---------------------------------------------------------------------------
# Waitlist bot / abuse protection
# ---------------------------------------------------------------------------

# Known disposable/fake email domains to block.
# temporarymail.com is intentionally excluded (used for legit testing).
BLOCKED_EMAIL_DOMAINS = {
    "ebhtbt.com", "cimario.com", "codgal.com", "inboxorigin.com",
    "allfreemail.net", "mailinator.com", "guerrillamail.com", "guerrillamail.net",
    "guerrillamail.org", "guerrillamail.de", "guerrillamail.info", "guerrillamail.biz",
    "guerrillamailblock.com", "grr.la", "spam4.me", "trashmail.me", "trashmail.at",
    "trashmail.io", "trashmail.xyz", "dispostable.com", "fakeinbox.com",
    "throwam.com", "sharklasers.com", "yopmail.com", "getairmail.com",
    "tempmail.com", "temp-mail.org", "mohmal.com", "maildrop.cc",
}

def _test_accounts_allowed() -> bool:
    """
    Master gate for the username-pattern admin bypass. Defaults FALSE so
    production refuses to honour the bypass even if an attacker guesses
    the (publicly-visible-in-source-code) regex. Set ALLOW_TEST_ACCOUNTS=
    true in your local .env when you need to register test{N} accounts
    against disposable email services for QA — leave it unset on Railway.
    Reading the env on every call so a runtime flip (e.g. a temporary
    enable for a debugging session) takes effect without a restart.
    """
    return os.getenv("ALLOW_TEST_ACCOUNTS", "false").lower() == "true"


def _is_admin_test_account(username: str) -> bool:
    """Allow admin QA accounts with username pattern test{number} (e.g. test13).
    Only honoured when ALLOW_TEST_ACCOUNTS=true env var is set — otherwise
    returns False so the disposable-email check fires unconditionally,
    regardless of how clever the username is."""
    if not _test_accounts_allowed():
        return False
    return bool(re.match(r"^test\d+$", username.lower().strip()))

def _is_blocked_domain(email: str) -> bool:
    """
    True when the email's domain is unacceptable for new accounts. Two
    sources stack: (1) the comprehensive disposable-services list in
    services.email_validation (~200 well-known throwaway domains), and
    (2) the local BLOCKED_EMAIL_DOMAINS above for one-off bad actors
    we've observed locally that aren't in the public lists yet.
    """
    if is_disposable_email(email):
        return True
    domain = email.split("@")[-1].lower()
    return domain in BLOCKED_EMAIL_DOMAINS

# Allow HTTP for OAuth ONLY in development (localhost)
# This must be set before importing oauthlib
if settings._is_development:
    os.environ.setdefault("OAUTHLIB_INSECURE_TRANSPORT", "1")

logger = logging.getLogger(__name__)

router = APIRouter()

# Password reset token serializer
reset_serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
# Email verification token serializer. Different salt from the password
# reset serializer so a leaked verification token can't be replayed
# against the reset endpoint and vice versa (defense-in-depth — the
# endpoints already validate independently, but distinct salts give us
# free isolation if a salt-handling bug is ever introduced).
verify_email_serializer = URLSafeTimedSerializer(settings.SECRET_KEY)

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
def register(
    response: Response,
    request: Request,
    background_tasks: BackgroundTasks,
    user_data: UserRegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new user account.
    Industry standard: Email validation, password strength, proper error handling.

    Rate-limited to 5 registrations per IP per hour and 20 per IP per day to
    block mass account creation / enumeration. Fails open if Redis is down
    (see services/redis_service.check_rate_limit).
    """
    client_ip = get_client_ip(request)
    if not check_rate_limit(client_ip, "register_ip", max_requests=5, window_seconds=3600):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many registration attempts. Please try again later.",
        )
    if not check_rate_limit(client_ip, "register_ip_daily", max_requests=20, window_seconds=86400):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Daily registration limit reached. Please try again tomorrow.",
        )

    try:
        # Validate email format (basic check - Pydantic EmailStr handles most validation)
        if "@" not in user_data.email or "." not in user_data.email.split("@")[1]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )

        # Trial-abuse defense layer 1: reject known disposable / throwaway
        # email services. These are the prime tool for trial-abuse loops
        # (sign up, use trial, throw away email, repeat). Admin test
        # accounts (username pattern test{N}) bypass for QA convenience.
        if not _is_admin_test_account(user_data.username) and _is_blocked_domain(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please use a permanent email address. Disposable or temporary email services are not accepted."
            )

        # Trial-abuse defense layer 1b: DNS deliverability. Catches made-up
        # domains ("asdfasdf@asdfasdf.com") that are too obscure to ever
        # land on a public blocklist because they don't exist. Fail-open
        # on resolver issues — this is a bonus filter, not the main one.
        if (
            not _is_admin_test_account(user_data.username)
            and not has_deliverable_domain(user_data.email)
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="That email domain doesn't appear to receive mail. Please use a real email address.",
            )

        # Password validation is handled by Pydantic schema (confirm_password and strength check)

        # Check if user already exists (exact-case match on the as-typed
        # email; the column is case-insensitively stored thanks to the
        # .lower().strip() at insert time).
        existing_user = db.query(User).filter(User.email == user_data.email.lower().strip()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Trial-abuse defense layer 2: reject if any existing user has an
        # email that normalizes to the same canonical form. Catches Gmail-
        # alias attacks (foo+a@, foo+b@, fo.o@ all map to foo@gmail.com)
        # and similar +alias schemes on other providers. The first user
        # with that canonical form keeps the account; later attempts get
        # the same "already registered" message so attackers can't
        # enumerate the existing user. We narrow the scan to candidates
        # on the same domain to keep the query cheap.
        target_normalized = normalize_email_for_dedup(user_data.email)
        if "@" in target_normalized:
            target_domain = target_normalized.rsplit("@", 1)[1]
            same_domain_emails = db.query(User.email).filter(
                func.lower(User.email).like(f"%@{target_domain}")
            ).all()
            for (candidate_email,) in same_domain_emails:
                if normalize_email_for_dedup(candidate_email) == target_normalized:
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

        # Create user profile. `current_level_tag` is no longer collected at
        # signup (removed from the form to reduce friction); users set it later
        # via profile settings. Column stays NOT NULL — default to BEGINNER.
        level_tag = CurrentLevelTag.BEGINNER

        # Generate Referral Code for new user
        new_referral_code = secrets.token_hex(4).upper()
        # Verify uniqueness collision
        while db.query(UserProfile).filter(UserProfile.referral_code == new_referral_code).first():
            new_referral_code = secrets.token_hex(4).upper()

        # first/last name are no longer collected at signup — username is
        # the canonical public identity. Default first_name to the username
        # (NOT NULL column) so admin/email personalisation still reads
        # naturally; users can set a real name later via profile settings.
        username_clean = user_data.username.strip()
        profile = UserProfile(
            id=uuid.uuid4(),
            user_id=user_id,
            first_name=username_clean,
            last_name="",
            username=username_clean,
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
        db.refresh(profile)

        # Persist Meta Ads first-touch attribution onto the profile so CAPI
        # conversions days later still credit the right ad click.
        try:
            capture_first_touch(
                db=db,
                profile=profile,
                request=request,
                fbclid=user_data.fbclid,
                utm=user_data.utm,
                landing_url=user_data.landing_url,
            )
        except Exception:
            logger.exception("register: first-touch capture failed (non-fatal)")

        # Fire CompleteRegistration to Meta CAPI + write to user_events.
        analytics_event_id = None
        try:
            analytics_event_id = track_event(
                db=db,
                event_name="CompleteRegistration",
                user_id=user_id,
                value=5.0,
                currency="USD",
                properties={"method": "email"},
                request=request,
                background_tasks=background_tasks,
            )
        except Exception:
            logger.exception("register: CompleteRegistration tracking failed (non-fatal)")

        # Onboarding welcome email. Non-blocking — a Resend outage must not
        # fail the registration request. Same template as the waitlist entry
        # point; the content is general project onboarding, not waitlist-specific.
        try:
            referral_link = f"{settings.FRONTEND_URL}/waitlist?ref={new_referral_code}"
            background_tasks.add_task(
                send_waitlist_welcome_email,
                user.email,
                profile.username,
                referral_link,
            )
        except Exception:
            logger.exception("register: welcome email enqueue failed (non-fatal)")

        # Email verification — send the one-and-only friction point an
        # attacker hits when farming trials with throwaway email domains.
        # is_verified stays False until the user clicks the link;
        # create_checkout_session refuses to start a free trial until
        # the flag is True (real-billed upgrades are still allowed for
        # logged-in users — only the gratis 7-day trial is gated).
        try:
            verify_token = verify_email_serializer.dumps(
                str(user_id), salt="email-verification"
            )
            background_tasks.add_task(
                send_email_verification_email,
                user.email,
                verify_token,
            )
        except Exception:
            logger.exception("register: verification email enqueue failed (non-fatal)")

        # Create tokens
        access_token = create_access_token(data={"sub": str(user_id)})
        refresh_token = create_refresh_token(data={"sub": str(user_id)})

        # Set httpOnly cookies
        _set_auth_cookies(response, access_token, refresh_token)

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            analytics_event_id=analytics_event_id,
        )
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Registration error: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    """Set httpOnly cookies for authentication tokens."""
    # Access token cookie - short lived
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        domain=settings.COOKIE_DOMAIN
    )
    # Refresh token cookie - long lived
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/auth/refresh",  # Only sent to refresh endpoint
        domain=settings.COOKIE_DOMAIN
    )


def _clear_auth_cookies(response: Response):
    """Clear authentication cookies."""
    response.delete_cookie(key="access_token", domain=settings.COOKIE_DOMAIN)
    response.delete_cookie(key="refresh_token", path="/api/auth/refresh", domain=settings.COOKIE_DOMAIN)


@router.post("/token", response_model=TokenResponse)
def login(
    request: Request,
    response: Response,
    credentials: UserLoginRequest,
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token endpoint for user login.
    Industry standard: Rate limiting, proper error messages, token expiration.
    Sets httpOnly cookies for web clients, also returns token in response for mobile/API clients.
    """
    try:
        # Rate limiting by email and IP
        email = credentials.email.lower().strip()
        client_ip = get_client_ip(request)
        
        # Check rate limit (5 attempts per 5 minutes per email)
        if not check_rate_limit(email, "login", max_requests=5, window_seconds=300):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts. Please try again in a few minutes.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Also rate limit by IP (20 attempts per 5 minutes)
        if not check_rate_limit(client_ip, "login_ip", max_requests=20, window_seconds=300):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts from this IP. Please try again later.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
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

        # Create tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        # Set httpOnly cookies
        _set_auth_cookies(response, access_token, refresh_token)
        
        # Also return token in response for mobile/API clients
        return TokenResponse(access_token=access_token, token_type="bearer")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again.",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/refresh", response_model=TokenResponse)
def refresh_access_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token from httpOnly cookie.
    """
    from services.auth_service import decode_refresh_token
    
    from services.redis_service import mark_refresh_rotated, is_refresh_token_rejected

    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Rotation: reject any refresh token that has already been exchanged,
    # but only once the grace window has elapsed. The grace window absorbs
    # cross-tab / in-flight races where Tab B sent /refresh with the old
    # cookie a fraction of a second before Tab A's response rotated it —
    # previously that would log both tabs out. A stolen token can still
    # only be used inside the grace window (default 60s).
    if is_refresh_token_rejected(refresh_token):
        _clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token already used",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_refresh_token(refresh_token)
    if not payload:
        _clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = payload.get("sub")
    if not user_id_str:
        _clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify user still exists
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        _clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        _clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Mark the OLD refresh token as rotated (with a grace window) so any
    # fresh /refresh attempt using it beyond the grace window 401s. TTL
    # is derived from the `exp` claim; if the claim is missing we fall
    # back to the configured max window so we never under-cover a
    # still-valid token.
    try:
        old_exp = payload.get("exp")
        if old_exp:
            remaining_ttl = int(old_exp - datetime.now(timezone.utc).timestamp())
        else:
            remaining_ttl = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
        if remaining_ttl > 0:
            mark_refresh_rotated(refresh_token, remaining_ttl)
    except Exception:
        logger.exception("refresh: failed to mark old refresh token as rotated (non-fatal)")

    # Create new tokens
    new_access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

    # Set new cookies
    _set_auth_cookies(response, new_access_token, new_refresh_token)

    return TokenResponse(access_token=new_access_token, token_type="bearer")


@router.post("/logout")
def logout(request: Request, response: Response):
    """
    Logout user by clearing authentication cookies and blacklisting the access token.
    The blacklisted token cannot be reused even if a client cached the value.
    """
    token = request.cookies.get("access_token")
    if token:
        try:
            from services.redis_service import blacklist_token
            payload = decode_access_token(token)
            if payload:
                exp = payload.get("exp")
                if exp:
                    remaining_ttl = int(exp - datetime.now(timezone.utc).timestamp())
                    blacklist_token(token, remaining_ttl)
        except Exception:
            pass  # Don't fail logout if blacklisting fails
    _clear_auth_cookies(response)
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(
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
    # Only surface a paid tier when the subscription is in a billable state.
    # INCOMPLETE means checkout was created but Stripe hasn't confirmed payment
    # yet — treat it the same as ROOKIE so the frontend doesn't show "Current
    # Plan" on a tier the user hasn't actually paid for.
    _PAID_STATUSES = {SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING, SubscriptionStatus.PAST_DUE}
    tier = (
        subscription.tier
        if subscription and subscription.status in _PAID_STATUSES
        else SubscriptionTier.ROOKIE
    )
    cancel_at_period_end = bool(subscription.cancel_at_period_end) if subscription else False
    period_end = subscription.current_period_end if subscription else None
    sub_status = subscription.status.value if subscription and subscription.status else None
    scheduled_tier = subscription.scheduled_tier if subscription else None
    has_used_trial = bool(profile.has_used_trial) if hasattr(profile, "has_used_trial") else False
    is_verified = bool(getattr(current_user, "is_verified", False))

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
        instagram_url=profile.instagram_url,
        subscription_cancel_at_period_end=cancel_at_period_end,
        subscription_period_end=period_end,
        subscription_status=sub_status,
        subscription_scheduled_tier=scheduled_tier,
        has_used_trial=has_used_trial,
        is_verified=is_verified,
        current_level_tag=profile.current_level_tag.value if hasattr(profile, 'current_level_tag') else "Beginner",
        reputation=profile.reputation if hasattr(profile, 'reputation') else 0,
        current_claves=profile.current_claves if hasattr(profile, 'current_claves') else 0,
        badges=badges_data,
        stats=stats_dict,
        equipped_border_sku=profile.equipped_border_sku if hasattr(profile, 'equipped_border_sku') else None,
        equipped_title_sku=profile.equipped_title_sku if hasattr(profile, 'equipped_title_sku') else None,
    )


# Helper function to create user with profile and subscription (reused for OAuth)
def create_user_from_oauth(
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
    background_tasks: BackgroundTasks,
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

        # Tracks whether this callback created a new account (vs. logging
        # in an existing one or linking OAuth to an existing email account).
        # Drives the welcome-email + CompleteRegistration CAPI fire below
        # so they only fire on genuine first-time signups.
        is_new_signup = user is None

        if user:
            # User exists - check if we need to link OAuth account
            if user.auth_provider == "email" and not user.social_id:
                # Link OAuth to existing email account. Google has verified
                # ownership of this address, so whoever registered the
                # password account without verification cannot be trusted —
                # wipe hashed_password so password login can no longer be
                # used to sign in as this account. This closes an account-
                # takeover vector where an attacker registers with a victim's
                # email (verification is not yet enforced at signup), then
                # the real owner signs in via Google and unknowingly shares
                # the session with the attacker's stored password.
                user.auth_provider = "google"
                user.social_id = social_id
                user.is_verified = True
                user.hashed_password = None
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
                user = create_user_from_oauth(
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

        # First-time OAuth signup side-effects: welcome email +
        # CompleteRegistration CAPI fire. Mirrors the manual /register
        # path so OAuth users land in the same downstream funnels (Resend
        # template, Meta Ads attribution). Skipped for existing-user
        # logins and for the OAuth-linking branch above so we never
        # re-welcome a user who already received the email on /register.
        # All wrapped non-fatal so a Resend / CAPI outage cannot fail
        # the OAuth callback and lock the user out.
        if is_new_signup:
            try:
                profile = (
                    db.query(UserProfile)
                    .filter(UserProfile.user_id == user.id)
                    .first()
                )
                # OAuth users have no username at signup (set later via
                # profile settings) — fall back to first_name then email
                # local-part so the welcome email's salutation is never
                # blank/None.
                friendly_name = (
                    (profile.username if profile and profile.username else None)
                    or (first_name or "").strip()
                    or email.split("@")[0]
                )
                referral_code = profile.referral_code if profile else ""
                referral_link = f"{settings.FRONTEND_URL}/waitlist?ref={referral_code}"
                background_tasks.add_task(
                    send_waitlist_welcome_email,
                    user.email,
                    friendly_name,
                    referral_link,
                )
            except Exception:
                logger.exception("oauth: welcome email enqueue failed (non-fatal)")

            try:
                track_event(
                    db=db,
                    event_name="CompleteRegistration",
                    user_id=user.id,
                    value=5.0,
                    currency="USD",
                    properties={"method": "google"},
                    request=request,
                    background_tasks=background_tasks,
                )
            except Exception:
                logger.exception("oauth: CompleteRegistration tracking failed (non-fatal)")

        # Create tokens
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        
        # Create response with redirect
        redirect_url = f"{settings.FRONTEND_URL}/auth/callback?success=true"
        response = RedirectResponse(url=redirect_url, status_code=status.HTTP_302_FOUND)
        
        # Set httpOnly cookies on the response
        _set_auth_cookies(response, access_token, refresh_token)
        
        logger.info(f"OAuth login successful, redirecting to frontend")
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google OAuth callback error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OAuth authentication failed"
        )


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(
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
    client_ip = get_client_ip(request)
    
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
        # User exists but is OAuth-authenticated (google/apple). Surface the
        # provider name so the frontend can render a "use Google/Apple to sign
        # in" hint — the generic message leaves OAuth users waiting for an
        # email that never arrives (they have no password to reset). Small
        # enumeration risk accepted: leaks "this email is OAuth-registered"
        # but not "this email is registered as email auth" vs "doesn't exist."
        if user.auth_provider in ("google", "apple"):
            return {
                "message": "If the email exists, a password reset link has been sent.",
                "oauth_provider": user.auth_provider,
            }
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


@router.post("/reset-password", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def reset_password(
    response: Response,
    request_data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Reset password using token from email — and auto-log-in.

    Industry-standard consumer-SaaS pattern: a successful reset proves
    inbox ownership (the user clicked the link from their email), so we
    mint access + refresh tokens and set the auth cookies in the same
    response. The frontend can then deep-link straight into the app
    without an extra "now log in with your new password" step.

    Particularly important on the waitlist-claim path, where this IS
    the activation moment: requiring a second login round-trip just
    after the user finally set a password is the kind of friction
    that drops conversion measurably.
    """
    from services.redis_service import blacklist_token, is_token_blacklisted

    try:
        # Single-use enforcement: reject any reset token that has already
        # been exchanged for a password change. Without this, a token
        # intercepted or replayed within the TTL window could be used
        # repeatedly.
        if is_token_blacklisted(request_data.token):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This reset link has already been used. Please request a new one.",
            )

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
            # Award starter claves (same as regular registration)
            try:
                award_new_user_bonus(str(user.id), db)
            except Exception as e:
                logger.warning(f"Failed to award claim bonus for {user.id}: {e}")

            # Deferred referral payout. We stored `referred_by_code` on the
            # profile at waitlist signup but held the 50🥢 + count increment
            # until now so burner-email farms can't collect unverified bounties.
            # Self-referral is blocked by checking the referrer is a different
            # user. Idempotent: we clear `referred_by_code` after paying so
            # re-running the claim flow (rare) doesn't double-pay.
            try:
                claim_profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
                if claim_profile and claim_profile.referred_by_code:
                    referrer_profile_paid = db.query(UserProfile).filter(
                        UserProfile.referral_code == claim_profile.referred_by_code
                    ).first()
                    if referrer_profile_paid and referrer_profile_paid.user_id != user.id:
                        referrer_profile_paid.referral_count += 1
                        award_referral_bonus(
                            str(referrer_profile_paid.user_id),
                            db,
                            referred_user_id=str(user.id),
                        )
                        # Invite 3 verified friends -> Promoter badge.
                        if referrer_profile_paid.referral_count >= 3:
                            from services import badge_service
                            try:
                                badge_service.award_badge(str(referrer_profile_paid.user_id), "promoter", db)
                            except Exception:
                                logger.exception("Promoter badge grant failed (non-fatal)")
                        # Consume the code so a second claim can't replay the payout.
                        claim_profile.referred_by_code = None
            except Exception:
                logger.exception("Deferred referral payout failed (non-fatal)")

        db.commit()

        # Burn the token so it cannot be used again. We blacklist for the
        # token's full configured lifetime — the itsdangerous serializer
        # doesn't expose the embedded timestamp here without re-parsing,
        # and over-covering is harmless (the entry is keyed by the token's
        # SHA-256 and Redis evicts it automatically).
        try:
            blacklist_token(
                request_data.token,
                settings.PASSWORD_RESET_EXPIRE_MINUTES * 60,
            )
        except Exception:
            logger.exception("reset_password: failed to blacklist used token (non-fatal)")

        # Auto-login: mint tokens + set auth cookies so the frontend can
        # deep-link into the app without a second password entry. Same
        # cookie helper used by /login and /register, so cookie attrs
        # (httpOnly, secure, samesite, domain, max_age) stay consistent.
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        _set_auth_cookies(response, access_token, refresh_token)

        return TokenResponse(access_token=access_token, token_type="bearer")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset error: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )


# -------------------------------------------------------------------------
# EMAIL VERIFICATION
# -------------------------------------------------------------------------
# Two endpoints:
#   POST /verify-email          — exchange a signed token for is_verified=True
#   POST /send-verification     — re-send the link to the logged-in user
#
# A verification email is also sent automatically at the end of the
# /register handler (see above). Waitlisters who claim via /reset-password
# are auto-verified at claim time (proof-of-inbox is implicit in clicking
# the password-reset link they got by email).
#
# Token: itsdangerous URLSafeTimedSerializer, salt="email-verification",
# max_age = settings.EMAIL_VERIFICATION_EXPIRE_HOURS * 3600. Single-use
# enforcement via Redis blacklist after consumption (mirrors the password-
# reset path).

@router.post("/verify-email", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def verify_email(
    response: Response,
    request_data: VerifyEmailRequest,
    db: Session = Depends(get_db),
):
    """
    Exchange a signed verification token for users.is_verified=True
    AND auto-log the user in.

    Why auto-login: the only thing that produces a valid token is
    receiving the verification email, and the only thing that produces
    that email is owning the inbox we registered. By the time the
    user reaches this endpoint, they've already proven email control
    twice (once at signup with the address, once by clicking the link).
    Asking them to enter their password on top of that is gratuitous
    friction — same logic as the password-reset auto-login.

    Idempotent: if the user is already verified, return success +
    fresh tokens rather than 4xx — a user clicking the link a second
    time should see "all set" with their session refreshed, not a
    stale error.
    """
    from services.redis_service import blacklist_token, is_token_blacklisted

    try:
        # Single-use enforcement.
        if is_token_blacklisted(request_data.token):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This verification link has already been used. Please request a new one if needed.",
            )

        user_id_str = verify_email_serializer.loads(
            request_data.token,
            salt="email-verification",
            max_age=settings.EMAIL_VERIFICATION_EXPIRE_HOURS * 3600,
        )
        try:
            user_id = uuid.UUID(user_id_str)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification token",
            )

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification token",
            )

        if not user.is_verified:
            user.is_verified = True
            db.commit()
            logger.info(f"User {user.id} verified email via /verify-email")

        # Burn the token so it cannot be replayed within its TTL.
        try:
            blacklist_token(
                request_data.token,
                settings.EMAIL_VERIFICATION_EXPIRE_HOURS * 3600,
            )
        except Exception:
            logger.exception("verify_email: failed to blacklist used token (non-fatal)")

        # Auto-login: mint tokens + set auth cookies so the frontend can
        # deep-link straight into /pricing without an extra password
        # entry. Same _set_auth_cookies helper used by /login, /register,
        # /reset-password — cookie attrs (httpOnly, secure, samesite,
        # max_age, domain) stay consistent across all four entry points.
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        _set_auth_cookies(response, access_token, refresh_token)

        return TokenResponse(access_token=access_token, token_type="bearer")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email verification error: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )


@router.post("/send-verification", status_code=status.HTTP_200_OK)
def send_verification(
    background_tasks: BackgroundTasks,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Re-send the email-verification link to the currently-logged-in user.

    Rate limited to 3 sends per email per 10 minutes and 10 per IP per
    hour — a verification email is the loudest dark-pattern surface in
    the auth stack and we never want to be a spam vector. Returns 200
    even when the user is already verified, to avoid leaking state.
    """
    if current_user.is_verified:
        # No-op for already-verified users. Silent success — don't burn
        # rate-limit budget or email quota on a duplicate.
        return {"message": "Email already verified", "is_verified": True}

    email = current_user.email.lower().strip()
    client_ip = get_client_ip(request)

    if not check_rate_limit(email, "send_verification", max_requests=3, window_seconds=600):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many verification email requests. Please wait a few minutes before trying again.",
        )
    if not check_rate_limit(client_ip, "send_verification_ip", max_requests=10, window_seconds=3600):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many verification email requests from this network. Please try again later.",
        )

    try:
        token = verify_email_serializer.dumps(
            str(current_user.id), salt="email-verification"
        )
        background_tasks.add_task(
            send_email_verification_email,
            current_user.email,
            token,
        )
    except Exception:
        logger.exception("send_verification: enqueue failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email. Please try again.",
        )

    return {"message": "Verification email sent", "is_verified": False}


# -------------------------------------------------------------------------
# WAITLIST & VELVET ROPE AUTH
# -------------------------------------------------------------------------

class WaitlistRegisterRequest(BaseModel):
    email: EmailStr
    username: str
    referrer_code: Optional[str] = None
    hp: Optional[str] = None  # Honeypot — must be empty for real humans
    # Optional Meta Ads attribution captured on the landing page.
    fbclid: Optional[str] = None
    utm: Optional[dict] = None
    landing_url: Optional[str] = None

@router.post("/waitlist", status_code=status.HTTP_201_CREATED)
def join_waitlist(
    request: WaitlistRegisterRequest,
    http_request: Request,
    background_tasks: BackgroundTasks,
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

        # --- Bot / abuse checks ---
        # 1. IP rate limit: max 5 sign-ups per IP per hour
        client_ip = get_client_ip(http_request)
        if not check_rate_limit(client_ip, "waitlist_ip", max_requests=5, window_seconds=3600):
            raise HTTPException(status_code=429, detail="Too many sign-ups from this location. Please try again later.")

        # 2. Block known disposable domains.
        # Admin test accounts (username = test{number}, e.g. test13) always bypass —
        # temporarymail.com hands out @allfreemail.net addresses which we use for QA.
        if not _is_admin_test_account(request.username) and _is_blocked_domain(email):
            raise HTTPException(status_code=400, detail="This email domain is not accepted. Please use a real email address.")

        # 2b. DNS deliverability check — catches "asdfasdf@asdfasdf.com" patterns
        # that aren't on any blocklist because the domain doesn't exist at all.
        # Fail-open on DNS errors; admin test accounts bypass.
        if not _is_admin_test_account(request.username) and not has_deliverable_domain(email):
            raise HTTPException(status_code=400, detail="That email domain doesn't appear to receive mail. Please use a real email address.")

        # 3. Honeypot: frontend sends hp="" for humans, bots fill it in
        if getattr(request, "hp", None):
            # Silently fake success — don't reveal we detected a bot
            return {"message": "Welcome to the Inner Circle.", "user_id": str(uuid.uuid4()), "referral_code": secrets.token_hex(4).upper(), "position": 1234}
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

        # Referral link is STORED at waitlist time but NOT paid out yet.
        # The 50🥢 bonus + referral_count increment + promoter-milestone check
        # all fire when the referred user verifies (claims their account via
        # /reset-password). This kills burner-email farming: an attacker now
        # needs a working inbox per fake account, not just a fresh address.
        referrer_profile = None
        if request.referrer_code:
            referrer_profile = db.query(UserProfile).filter(UserProfile.referral_code == request.referrer_code).first()

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
            badges="[]",
            # Durable origin marker. Survives the auth_provider flip on
            # /reset-password claim so the Founder Diamond gate in the
            # Stripe webhook can still recognise this user as eligible.
            was_waitlister=True,
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

        # NOTE: Founder Diamond is no longer auto-awarded at waitlist
        # signup. The gated rule (capped 300 seats, deadline 2026-05-06
        # 18:00 UTC) is enforced in the Stripe webhook when this user
        # starts a subscription. See services/founder_badge_service.py.

        # NOTE: referrer promoter-milestone check also deferred to claim time.
        # See /reset-password handler for the payout + milestone logic.

        db.commit()

        # Send Welcome Email
        try:
            # Construct referral link
            referral_link = f"{settings.FRONTEND_URL}/waitlist?ref={new_referral_code}"
            send_waitlist_welcome_email(email, username, referral_link)
        except Exception as e:
            logger.error(f"Failed to send welcome email: {e}")

        # Persist first-touch attribution + fire Lead event to Meta CAPI.
        analytics_event_id = None
        try:
            db.refresh(profile)
            capture_first_touch(
                db=db,
                profile=profile,
                request=http_request,
                fbclid=request.fbclid,
                utm=request.utm,
                landing_url=request.landing_url,
            )
            analytics_event_id = track_event(
                db=db,
                event_name="Lead",
                user_id=user_id,
                value=2.0,
                currency="USD",
                properties={"source": "waitlist"},
                request=http_request,
                background_tasks=background_tasks,
            )
        except Exception:
            logger.exception("waitlist: Lead tracking failed (non-fatal)")

        return {
            "message": "Welcome to the Inner Circle.",
            "user_id": str(user_id),
            "referral_code": new_referral_code,
            "position": 1234, # Mock position or calc from COUNT(id)
            "analytics_event_id": analytics_event_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Waitlist error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to join waitlist.")
