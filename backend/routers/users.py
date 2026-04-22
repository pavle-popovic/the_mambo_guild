from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from pydantic import BaseModel, field_validator
from urllib.parse import urlparse
import re

from dependencies import get_current_user
from models import get_db
from models.user import User, UserProfile
from schemas.auth import UserProfileResponse, BadgeReorderRequest
from schemas.gamification import LeaderboardEntry

router = APIRouter(prefix="/users", tags=["users"])

# Allowed hosts for avatar URLs.
#
# Each entry is a suffix match against the parsed hostname (after a
# leading-dot comparison). This prevents substring-match bypasses — the
# previous allowlist had `"cloudflare"` and `"pub-"` which an attacker could
# satisfy with e.g. `cloudflare.evil.com` or `pub-evil.com`. Suffix matching
# requires the hostname to literally *end with* `.r2.dev`, `.googleusercontent.com`,
# etc., which cannot be forged.
ALLOWED_AVATAR_HOST_SUFFIXES = (
    ".r2.dev",                    # Cloudflare R2 public buckets (pub-xxx.r2.dev)
    ".googleusercontent.com",     # Google / OAuth profile pictures
    ".gravatar.com",
    "gravatar.com",
)
ALLOWED_AVATAR_HOST_EXACT = {
    "localhost",
    "127.0.0.1",
}


def _is_allowed_avatar_host(hostname: str) -> bool:
    hostname = (hostname or "").lower()
    if hostname in ALLOWED_AVATAR_HOST_EXACT:
        return True
    return any(hostname.endswith(suffix) for suffix in ALLOWED_AVATAR_HOST_SUFFIXES)


class UserProfileUpdateRequest(BaseModel):
    avatar_url: Optional[str] = None
    username: Optional[str] = None
    instagram_url: Optional[str] = None

    @field_validator('avatar_url')
    @classmethod
    def validate_avatar_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return v
        
        # Parse the URL
        try:
            parsed = urlparse(v)
        except Exception:
            raise ValueError("Invalid URL format")
        
        # Must be HTTPS (or HTTP for localhost)
        if parsed.scheme not in ("https", "http"):
            raise ValueError("Avatar URL must use HTTPS")
        
        if parsed.scheme == "http" and parsed.hostname not in ("localhost", "127.0.0.1"):
            raise ValueError("Avatar URL must use HTTPS")
        
        # Check against allowed hosts using suffix matching (not substring)
        if not _is_allowed_avatar_host(parsed.hostname or ""):
            raise ValueError("Avatar URL domain not allowed")
        
        # Limit URL length
        if len(v) > 2048:
            raise ValueError("Avatar URL too long")
        
        return v

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(v) > 30:
            raise ValueError("Username cannot exceed 30 characters")
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError("Username can only contain letters, numbers, and underscores")
        return v.lower()

    @field_validator('instagram_url')
    @classmethod
    def validate_instagram_url(cls, v: Optional[str]) -> Optional[str]:
        # Empty string clears the field
        if v is None or v == "":
            return None

        # Accept either a bare handle ("@diego" / "diego") or a full URL
        v = v.strip()
        handle_match = re.match(r'^@?([a-zA-Z0-9_.]{1,30})$', v)
        if handle_match:
            return f"https://instagram.com/{handle_match.group(1)}"

        # Otherwise must be a https instagram.com URL
        try:
            parsed = urlparse(v)
        except Exception:
            raise ValueError("Invalid Instagram URL")
        if parsed.scheme != "https":
            raise ValueError("Instagram URL must use HTTPS")
        host = (parsed.hostname or "").lower()
        if host not in ("instagram.com", "www.instagram.com"):
            raise ValueError("URL must point to instagram.com")
        if len(v) > 255:
            raise ValueError("Instagram URL too long")
        # Must have a path (i.e. a handle)
        if not parsed.path or parsed.path == "/":
            raise ValueError("Instagram URL must include a handle")
        return v


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
        username=current_user.profile.username,
        xp=current_user.profile.xp,
        level=current_user.profile.level,
        streak_count=current_user.profile.streak_count,
        tier=subscription_tier,
        role=current_user.role,
        avatar_url=current_user.profile.avatar_url,
        instagram_url=current_user.profile.instagram_url,
        current_level_tag=current_user.profile.current_level_tag.value,
        reputation=current_user.profile.reputation,
        current_claves=current_user.profile.current_claves,
        badges=badges_data,
        stats=stats_dict,
        equipped_border_sku=current_user.profile.equipped_border_sku,
        equipped_title_sku=current_user.profile.equipped_title_sku,
    )


@router.patch("/me", response_model=UserProfileResponse)
def update_user_profile(
    profile_data: UserProfileUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Update user profile (avatar_url and username)."""
    if not current_user.profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
        )

    # Update avatar_url if provided
    if profile_data.avatar_url is not None:
        current_user.profile.avatar_url = profile_data.avatar_url

    # Update instagram_url if provided (validator normalizes/returns None to clear)
    if "instagram_url" in profile_data.model_fields_set:
        current_user.profile.instagram_url = profile_data.instagram_url

    # Update username if provided
    if profile_data.username is not None:
        # Check if username is already taken (case-insensitive)
        existing = db.query(UserProfile).filter(
            func.lower(UserProfile.username) == profile_data.username.lower(),
            UserProfile.user_id != current_user.id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        current_user.profile.username = profile_data.username
    
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
        username=current_user.profile.username,
        xp=current_user.profile.xp,
        level=current_user.profile.level,
        streak_count=current_user.profile.streak_count,
        tier=subscription_tier,
        role=current_user.role,
        avatar_url=current_user.profile.avatar_url,
        instagram_url=current_user.profile.instagram_url,
        current_level_tag=current_user.profile.current_level_tag.value,
        reputation=current_user.profile.reputation,
        current_claves=current_user.profile.current_claves,
        badges=badges_data,
        stats=stats_dict,
        equipped_border_sku=current_user.profile.equipped_border_sku,
        equipped_title_sku=current_user.profile.equipped_title_sku,
    )


@router.get("/public/{username}", response_model=UserProfileResponse)
def get_public_profile(
    username: str,
    db: Session = Depends(get_db),
):
    """Get public profile by username."""
    profile = db.query(UserProfile).filter(UserProfile.username == username).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    
    user = db.query(User).filter(User.id == profile.user_id).first()
    if not user:
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Assuming Subscription model has a 'tier' attribute
    subscription_tier = user.subscription.tier.value if user.subscription else "rookie"
    
    # Fetch Badges & Stats
    from services import badge_service
    from models.community import UserStats
    
    badges_data = badge_service.get_all_badges_for_user(str(user.id), db)
    stats = db.query(UserStats).filter(UserStats.user_id == user.id).first()
    stats_dict = {
        "reactions_given": stats.reactions_given_count if stats else 0,
        "reactions_received": stats.reactions_received_count if stats else 0,
        "solutions_accepted": stats.solutions_accepted_count if stats else 0
    }

    return UserProfileResponse(
        id=str(profile.id),
        first_name=profile.first_name,
        last_name=profile.last_name,
        username=profile.username,
        xp=profile.xp,
        level=profile.level,
        streak_count=profile.streak_count,
        tier=subscription_tier,
        # Role logic: if we want to hide role or not. Let's expose it.
        role=user.role, 
        avatar_url=profile.avatar_url,
        instagram_url=profile.instagram_url,
        current_level_tag=profile.current_level_tag.value,
        reputation=profile.reputation,
        current_claves=profile.current_claves,
        badges=badges_data,
        stats=stats_dict,
        equipped_border_sku=profile.equipped_border_sku,
        equipped_title_sku=profile.equipped_title_sku,
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
        display_name = f"@{entry.username}" if entry.username else f"{entry.first_name} {entry.last_name}"
        
        results.append(
            LeaderboardEntry(
                user_id=entry.user_id,
                name=display_name,
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