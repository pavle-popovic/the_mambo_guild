"""
Badge System API Endpoints
/api/badges - Badge definitions and user awards
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from models import get_db
from models.user import User
from dependencies import get_current_user
from services import badge_service
from schemas.community import BadgeResponse, PublicProfileStats

router = APIRouter(tags=["Badges"])


@router.get("/", response_model=List[BadgeResponse])
async def get_all_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all badge definitions with current user's earned status.
    Perfect for displaying the Trophy Case on profile.
    """
    badges = badge_service.get_all_badges(str(current_user.id), db)
    return badges


@router.get("/user/{user_id}", response_model=List[BadgeResponse])
async def get_user_badges(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get badges earned by a specific user.
    Public endpoint for viewing other users' profiles.
    """
    badges = badge_service.get_user_badges(user_id, db)
    return badges


@router.get("/stats/{user_id}", response_model=PublicProfileStats)
async def get_user_stats(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get public stats for a user's profile.
    - Questions solved
    - Fires received
    - Current streak
    """
    stats = badge_service.get_user_stats(user_id, db)
    return PublicProfileStats(**stats)


@router.post("/check")
async def check_my_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually trigger badge eligibility check.
    Returns any newly awarded badges.
    """
    awarded = badge_service.check_and_award_badges(str(current_user.id), db)
    db.commit()
    
    if awarded:
        return {
            "success": True,
            "message": f"🏆 {len(awarded)} new badge(s) earned!",
            "badges": awarded
        }
    else:
        return {
            "success": True,
            "message": "No new badges earned yet. Keep going!",
            "badges": []
        }
