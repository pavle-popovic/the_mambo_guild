from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models import get_db
from models.user import User
from models.progress import UserProgress
from models.course import Lesson
from schemas.gamification import XPGainResponse
from services.gamification_service import award_xp, update_streak
from dependencies import get_current_user
from datetime import datetime
import uuid

router = APIRouter()


@router.post("/lessons/{lesson_id}/complete", response_model=XPGainResponse)
async def complete_lesson(
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark lesson as complete and award XP."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Check if already completed
    existing_progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.lesson_id == lesson.id
    ).first()
    
    if existing_progress and existing_progress.is_completed:
        raise HTTPException(status_code=400, detail="Lesson already completed")
    
    # Check prerequisites
    if lesson.order_index > 1:
        prev_lesson = db.query(Lesson).filter(
            Lesson.level_id == lesson.level_id,
            Lesson.order_index == lesson.order_index - 1
        ).first()
        if prev_lesson:
            prev_progress = db.query(UserProgress).filter(
                UserProgress.user_id == current_user.id,
                UserProgress.lesson_id == prev_lesson.id,
                UserProgress.is_completed == True
            ).first()
            if not prev_progress:
                raise HTTPException(
                    status_code=403,
                    detail="Previous lesson must be completed first"
                )
    
    # Create or update progress
    if existing_progress:
        existing_progress.is_completed = True
        existing_progress.completed_at = datetime.utcnow()
    else:
        progress = UserProgress(
            id=uuid.uuid4(),
            user_id=current_user.id,
            lesson_id=lesson.id,
            is_completed=True,
            completed_at=datetime.utcnow()
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

