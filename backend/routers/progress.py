from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from models import get_db
from models.user import User, UserRole, Subscription, SubscriptionStatus
from models.progress import UserProgress
from models.course import Lesson, Level, World
from schemas.gamification import XPGainResponse
from services.gamification_service import award_xp, update_streak
from dependencies import get_current_user
from datetime import datetime, timezone
import uuid

router = APIRouter()


@router.post("/lessons/{lesson_id}/complete", response_model=XPGainResponse)
def complete_lesson(
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark lesson as complete and award XP.

    Access control mirrors `GET /courses/lessons/{lesson_id}`:
    - Admins: unrestricted
    - Lessons in a free world: any authenticated user
    - Lessons in a paid world: active subscription required
    Without this check a free user could POST any lesson_id and harvest
    premium XP even though they can't view the lesson.
    """
    lesson = (
        db.query(Lesson)
        .options(joinedload(Lesson.level).joinedload(Level.world))
        .filter(Lesson.id == lesson_id)
        .first()
    )
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    world = lesson.level.world if lesson.level else None
    if not world:
        raise HTTPException(status_code=404, detail="Course not found for lesson")

    if current_user.role != UserRole.ADMIN and not world.is_free:
        subscription = (
            db.query(Subscription)
            .filter(Subscription.user_id == current_user.id)
            .first()
        )
        if not subscription or subscription.status != SubscriptionStatus.ACTIVE:
            raise HTTPException(
                status_code=403,
                detail="Subscription required to complete this lesson.",
            )

    # Check if already completed
    existing_progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.lesson_id == lesson.id
    ).first()
    
    if existing_progress and existing_progress.is_completed:
        raise HTTPException(status_code=400, detail="Lesson already completed")
    
    # No prerequisite checks - users can complete any lesson immediately
    
    # Create or update progress
    if existing_progress:
        existing_progress.is_completed = True
        existing_progress.completed_at = datetime.now(timezone.utc)
    else:
        progress = UserProgress(
            id=uuid.uuid4(),
            user_id=current_user.id,
            lesson_id=lesson.id,
            is_completed=True,
            completed_at=datetime.now(timezone.utc)
        )
        db.add(progress)
    
    # Award XP
    xp_result = award_xp(str(current_user.id), lesson.xp_value, db)
    
    # Update streak (daily login bonus)
    update_streak(str(current_user.id), db)
    
    db.commit()
    
    return XPGainResponse(
        xp_gained=xp_result["xp_gained"],
        new_total_xp=xp_result["new_total_xp"],
        leveled_up=xp_result["leveled_up"],
        new_level=xp_result["new_level"]
    )

