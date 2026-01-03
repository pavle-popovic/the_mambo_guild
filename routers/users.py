from typing import Annotated, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from output.backend.dependencies import get_db, get_current_user
from output.backend.schemas import gamification as gamification_schemas
from output.backend.models import user as user_models

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=gamification_schemas.UserProfileResponse)
def read_users_me(
    current_user: Annotated[user_models.User, Depends(get_current_user)],
):
    if not current_user.profile:
        # This should ideally not happen if user and profile are created together
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
        )
    
    # Assuming Subscription model has a 'tier' attribute
    subscription_tier = current_user.subscription.tier.value if current_user.subscription else "rookie"

    return gamification_schemas.UserProfileResponse(
        id=current_user.profile.id,
        first_name=current_user.profile.first_name,
        last_name=current_user.profile.last_name,
        xp=current_user.profile.xp,
        level=current_user.profile.level,
        streak_count=current_user.profile.streak_count,
        tier=subscription_tier,
        avatar_url=current_user.profile.avatar_url,
        current_level_tag=current_user.profile.current_level_tag.value
    )


@router.get("/leaderboard", response_model=List[gamification_schemas.LeaderboardEntry])
def get_leaderboard(db: Annotated[Session, Depends(get_db)]):
    leaderboard_entries = (
        db.query(user_models.UserProfile)
        .join(user_models.User)
        .order_by(desc(user_models.UserProfile.xp))
        .limit(10)
        .all()
    )

    results = []
    for entry in leaderboard_entries:
        # Assuming User model has a 'subscription' relationship to get tier
        subscription_tier = entry.user.subscription.tier.value if entry.user.subscription else "rookie"
        results.append(
            gamification_schemas.LeaderboardEntry(
                user_id=entry.user_id,
                name=f"{entry.first_name} {entry.last_name}",
                avatar_url=entry.avatar_url,
                xp_total=entry.xp,
                tier=subscription_tier
            )
        )
    return results