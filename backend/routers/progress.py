from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel, Field
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


class VideoHeartbeatRequest(BaseModel):
    lesson_id: str
    position_seconds: float = Field(..., ge=0)
    duration_seconds: float = Field(..., gt=0)
    percent: int = Field(..., ge=0, le=100)


@router.post("/video-heartbeat", status_code=status.HTTP_204_NO_CONTENT)
def video_heartbeat(
    payload: VideoHeartbeatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record a lesson video watch checkpoint (25/50/75/100%).

    ML feature: max watch % in the first 7 days is a top churn predictor.
    Callers should only fire at the 25/50/75/100 thresholds to keep the
    event log tidy — the endpoint happily accepts any percent value.
    """
    try:
        from services.analytics_service import track_event
        track_event(
            db=db,
            event_name="VideoHeartbeat",
            user_id=current_user.id,
            properties={
                "lesson_id": payload.lesson_id,
                "position_seconds": payload.position_seconds,
                "duration_seconds": payload.duration_seconds,
                "percent": payload.percent,
            },
        )
    except Exception:
        import logging
        logging.getLogger(__name__).exception("video_heartbeat: track failed (non-fatal)")
    return None


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
        if not subscription or subscription.status not in (SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING):
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

    # ML feature: completion velocity is the core engagement signal.
    try:
        from services.analytics_service import track_event
        track_event(
            db=db,
            event_name="LessonCompleted",
            user_id=current_user.id,
            properties={
                "lesson_id": str(lesson.id),
                "lesson_title": lesson.title,
                "world_slug": getattr(world, "slug", None),
                "is_boss_battle": bool(getattr(lesson, "is_boss_battle", False)),
                "xp": lesson.xp_value,
                "leveled_up": xp_result.get("leveled_up", False),
            },
        )
    except Exception:
        import logging
        logging.getLogger(__name__).exception("complete_lesson: track failed (non-fatal)")

    return XPGainResponse(
        xp_gained=xp_result["xp_gained"],
        new_total_xp=xp_result["new_total_xp"],
        leveled_up=xp_result["leveled_up"],
        new_level=xp_result["new_level"]
    )

