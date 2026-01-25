from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel

from dependencies import get_current_user
from models import get_db
from models.user import User, UserProfile
from schemas.auth import UserProfileResponse, BadgeReorderRequest
from schemas.gamification import LeaderboardEntry

router = APIRouter(prefix="/users", tags=["users"])


class UserProfileUpdateRequest(BaseModel):
    avatar_url: Optional[str] = None


@router.get("/me", response_model=UserProfileResponse)
def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    if not current_user.profile:
        # This should ideally not happen if user and profile are created together
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
        )
    
    # Assuming Subscription model has a 'tier' attribute
    subscription_tier = current_user.subscription.tier.value if current_user.subscription else "rookie"

    # Fetch Badges & Stats
    from services import badge_service
    from models.community import UserStats
    
    badges_data = badge_service.get_all_badges_for_user(str(current_user.id), db)
    stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    stats_dict = {
        "reactions_given": stats.reactions_given_count if stats else 0,
        "reactions_received": stats.reactions_received_count if stats else 0,
        "solutions_accepted": stats.solutions_accepted_count if stats else 0
    }

    return UserProfileResponse(
        id=str(current_user.profile.id),
        first_name=current_user.profile.first_name,
        last_name=current_user.profile.last_name,
        xp=current_user.profile.xp,
        level=current_user.profile.level,
        streak_count=current_user.profile.streak_count,
        tier=subscription_tier,
        role=current_user.role,
        avatar_url=current_user.profile.avatar_url,
        current_level_tag=current_user.profile.current_level_tag.value,
        reputation=current_user.profile.reputation,
        current_claves=current_user.profile.current_claves,
        badges=badges_data,
        stats=stats_dict
    )


@router.patch("/me", response_model=UserProfileResponse)
def update_user_profile(
    profile_data: UserProfileUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Update user profile (currently only avatar_url)."""
    if not current_user.profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
        )
    
    # Update avatar_url if provided
    if profile_data.avatar_url is not None:
        current_user.profile.avatar_url = profile_data.avatar_url
    
    db.commit()
    db.refresh(current_user.profile)
    
    # Assuming Subscription model has a 'tier' attribute
    subscription_tier = current_user.subscription.tier.value if current_user.subscription else "rookie"
    
    # Fetch Badges & Stats
    from services import badge_service
    from models.community import UserStats
    
    badges_data = badge_service.get_all_badges_for_user(str(current_user.id), db)
    stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    stats_dict = {
        "reactions_given": stats.reactions_given_count if stats else 0,
        "reactions_received": stats.reactions_received_count if stats else 0,
        "solutions_accepted": stats.solutions_accepted_count if stats else 0
    }

    return UserProfileResponse(
        id=str(current_user.profile.id),
        first_name=current_user.profile.first_name,
        last_name=current_user.profile.last_name,
        xp=current_user.profile.xp,
        level=current_user.profile.level,
        streak_count=current_user.profile.streak_count,
        tier=subscription_tier,
        role=current_user.role,
        avatar_url=current_user.profile.avatar_url,
        current_level_tag=current_user.profile.current_level_tag.value,
        reputation=current_user.profile.reputation,
        current_claves=current_user.profile.current_claves,
        badges=badges_data,
        stats=stats_dict
    )


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(db: Annotated[Session, Depends(get_db)]):
    leaderboard_entries = (
        db.query(UserProfile)
        .join(User)
        .order_by(desc(UserProfile.xp))
        .limit(10)
        .all()
    )

    results = []
    for entry in leaderboard_entries:
        # Assuming User model has a 'subscription' relationship to get tier
        subscription_tier = entry.user.subscription.tier.value if entry.user.subscription else "rookie"
        results.append(
            LeaderboardEntry(
                user_id=entry.user_id,
                name=f"{entry.first_name} {entry.last_name}",
                avatar_url=entry.avatar_url,
                xp_total=entry.xp,
                tier=subscription_tier
            )
        )
    return results


@router.put("/me/badges/reorder")
def reorder_badges(
    reorder_data: BadgeReorderRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """
    Update the display order of user's badges.
    """
    from models.community import UserBadge
    
    # Get all user badges
    user_badges = db.query(UserBadge).filter(UserBadge.user_id == current_user.id).all()
    badge_map = {ub.badge_id: ub for ub in user_badges}
    
    # Update orders based on input list
    # Input list is expected to be the user's preferred order
    for index, badge_id in enumerate(reorder_data.badge_ids):
        if badge_id in badge_map:
            badge_map[badge_id].display_order = index + 1
            
    db.commit()
    return {"status": "success"}