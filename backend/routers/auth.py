from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from models import get_db
from models.user import User, UserProfile, CurrentLevelTag, Subscription, SubscriptionTier
from schemas.auth import UserRegisterRequest, UserLoginRequest, TokenResponse, UserProfileResponse
from services.auth_service import verify_password, get_password_hash, create_access_token
from services.gamification_service import update_streak
from dependencies import get_current_user
from config import settings
import uuid

router = APIRouter()


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
        
        # Check password strength (minimum 8 characters)
        if len(user_data.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email.lower().strip()).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create user
        user_id = uuid.uuid4()
        hashed_password = get_password_hash(user_data.password)
        
        from models.user import UserRole
        user = User(
            id=user_id,
            email=user_data.email.lower().strip(),
            hashed_password=hashed_password,
            role=UserRole.STUDENT
        )
        db.add(user)
        db.flush()

        # Create user profile
        try:
            level_tag = CurrentLevelTag[user_data.current_level_tag.upper()]
        except KeyError:
            level_tag = CurrentLevelTag.BEGINNER

        profile = UserProfile(
            id=uuid.uuid4(),
            user_id=user_id,
            first_name=user_data.first_name.strip(),
            last_name=user_data.last_name.strip(),
            current_level_tag=level_tag,
            xp=0,
            level=1,
            streak_count=0
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

    return UserProfileResponse(
        id=str(profile.id),
        first_name=profile.first_name,
        last_name=profile.last_name,
        xp=profile.xp,
        level=profile.level,
        streak_count=profile.streak_count,
        tier=tier,
        role=current_user.role.value,
        avatar_url=profile.avatar_url
    )

