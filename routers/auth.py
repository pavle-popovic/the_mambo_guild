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


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserRegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
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
        email=user_data.email,
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
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        current_level_tag=level_tag,
        xp=0,
        level=1,
        streak_count=0
    )
    db.add(profile)

    # Create default subscription (Rookie tier)
    subscription = Subscription(
        id=uuid.uuid4(),
        user_id=user_id,
        tier=SubscriptionTier.ROOKIE,
        status="incomplete"
    )
    db.add(subscription)

    db.commit()

    # Create access token
    access_token = create_access_token(data={"sub": str(user_id)})
    return TokenResponse(access_token=access_token)


@router.post("/token", response_model=TokenResponse)
async def login(credentials: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Update streak on login
    update_streak(str(user.id), db)

    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=access_token)


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

