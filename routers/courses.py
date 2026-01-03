from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from models import get_db
from models.user import User, Subscription, SubscriptionStatus
from models.course import World, Lesson, Level
from models.progress import UserProgress
from schemas.course import WorldResponse, LessonResponse, LessonDetailResponse
from dependencies import get_current_user, get_current_user_optional
from typing import Optional
from datetime import datetime

router = APIRouter()


@router.get("/worlds", response_model=List[WorldResponse])
async def get_worlds(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get all worlds with lock status based on subscription. Accessible without authentication."""
    worlds = db.query(World).filter(World.is_published == True).order_by(World.order_index).all()
    
    # Check subscription if user is authenticated
    is_subscribed = False
    if current_user:
        subscription = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
        is_subscribed = subscription and subscription.status == SubscriptionStatus.ACTIVE
    
    result = []
    for world in worlds:
        # Check if world is locked (for unauthenticated users, only free worlds are unlocked)
        is_locked = not world.is_free and (not current_user or not is_subscribed)
        
        # Calculate progress (only if user is authenticated)
        progress_percentage = 0
        if current_user:
            world_lessons = []
            for level in world.levels:
                world_lessons.extend(level.lessons)
            
            completed_count = db.query(UserProgress).filter(
                UserProgress.user_id == current_user.id,
                UserProgress.is_completed == True,
                UserProgress.lesson_id.in_([l.id for l in world_lessons])
            ).count()
            
            progress_percentage = (completed_count / len(world_lessons) * 100 if world_lessons else 0)
        
        result.append(WorldResponse(
            id=str(world.id),
            title=world.title,
            description=world.description,
            image_url=world.image_url,
            difficulty=world.difficulty,
            progress_percentage=progress_percentage,
            is_locked=is_locked
        ))
    
    return result


@router.get("/lessons/{lesson_id}", response_model=LessonDetailResponse)
async def get_lesson(
    lesson_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get lesson details with lock status based on prerequisites."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Check if previous lesson is completed
    is_locked = False
    if lesson.order_index > 1:
        # Get previous lesson in same level
        prev_lesson = db.query(Lesson).filter(
            Lesson.level_id == lesson.level_id,
            Lesson.order_index == lesson.order_index - 1
        ).first()
        
        if prev_lesson:
            progress = db.query(UserProgress).filter(
                UserProgress.user_id == current_user.id,
                UserProgress.lesson_id == prev_lesson.id,
                UserProgress.is_completed == True
            ).first()
            is_locked = not progress
    
    # Check subscription for non-free worlds
    level = db.query(Level).filter(Level.id == lesson.level_id).first()
    world = db.query(World).filter(World.id == level.world_id).first() if level else None
    if world and not world.is_free:
        subscription = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
        if not subscription or subscription.status != SubscriptionStatus.ACTIVE:
            raise HTTPException(status_code=403, detail="Subscription required")
    
    if is_locked:
        raise HTTPException(status_code=403, detail="Previous lesson must be completed")
    
    # Get next and previous lesson IDs
    next_lesson = db.query(Lesson).filter(
        Lesson.level_id == lesson.level_id,
        Lesson.order_index == lesson.order_index + 1
    ).first()
    
    prev_lesson = db.query(Lesson).filter(
        Lesson.level_id == lesson.level_id,
        Lesson.order_index == lesson.order_index - 1
    ).first()
    
    return LessonDetailResponse(
        id=str(lesson.id),
        title=lesson.title,
        description=lesson.description,
        video_url=lesson.video_url,
        xp_value=lesson.xp_value,
        next_lesson_id=str(next_lesson.id) if next_lesson else None,
        prev_lesson_id=str(prev_lesson.id) if prev_lesson else None,
        comments=[]  # TODO: Implement comments
    )


@router.get("/worlds/{world_id}/lessons", response_model=List[LessonResponse])
async def get_world_lessons(
    world_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all lessons in a world with completion and lock status."""
    world = db.query(World).filter(World.id == world_id).first()
    if not world:
        raise HTTPException(status_code=404, detail="World not found")
    
    lessons = []
    for level in world.levels:
        for lesson in level.lessons:
            # Check completion
            progress = db.query(UserProgress).filter(
                UserProgress.user_id == current_user.id,
                UserProgress.lesson_id == lesson.id
            ).first()
            is_completed = progress.is_completed if progress else False
            
            # Check lock status
            is_locked = False
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
                    is_locked = not prev_progress
            
            lessons.append(LessonResponse(
                id=str(lesson.id),
                title=lesson.title,
                description=lesson.description,
                video_url=lesson.video_url,
                xp_value=lesson.xp_value,
                is_completed=is_completed,
                is_locked=is_locked,
                is_boss_battle=lesson.is_boss_battle,
                order_index=lesson.order_index
            ))
    
    return lessons

