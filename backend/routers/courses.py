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
    """
    Get all worlds with lock status based on subscription.
    Accessible without authentication (for preview viewing).
    
    Access Control:
    - Not logged in: ALL courses locked (can see previews)
    - Logged in (Rookie/Free): Only free courses unlocked
    - Logged in (Paid): All courses unlocked
    """
    worlds = db.query(World).filter(World.is_published == True).order_by(World.order_index).all()
    
    # Check subscription if user is authenticated
    is_subscribed = False
    if current_user:
        subscription = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
        is_subscribed = subscription and subscription.status == SubscriptionStatus.ACTIVE
    
    result = []
    for world in worlds:
        # REFINED ACCESS CONTROL:
        # - If user not logged in: ALL courses are locked (can see previews)
        # - If logged in but not subscribed: Only free courses unlocked
        # - If subscribed: All courses unlocked
        if not current_user:
            # Not logged in - all courses locked (but can see previews)
            is_locked = True
        elif world.is_free:
            # Free course - unlocked for logged in users
            is_locked = False
        else:
            # Paid course - requires active subscription
            is_locked = not is_subscribed
        
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
        
        # Convert enum to string value
        difficulty_str = world.difficulty.value if hasattr(world.difficulty, 'value') else str(world.difficulty)
        
        result.append(WorldResponse(
            id=str(world.id),
            title=world.title,
            description=world.description,
            image_url=world.image_url,
            thumbnail_url=world.thumbnail_url,
            mux_preview_playback_id=world.mux_preview_playback_id,  # Include preview playback ID
            difficulty=difficulty_str,
            progress_percentage=progress_percentage,
            is_locked=is_locked
        ))
    
    return result


@router.get("/lessons/{lesson_id}", response_model=LessonDetailResponse)
async def get_lesson(
    lesson_id: str,
    current_user: User = Depends(get_current_user),  # Requires authentication
    db: Session = Depends(get_db)
):
    """
    Get lesson details. Requires authentication.
    Access Control:
    - Free courses: Accessible to all logged in users
    - Paid courses: Requires active subscription
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Get the world this lesson belongs to
    level = db.query(Level).filter(Level.id == lesson.level_id).first()
    world = db.query(World).filter(World.id == level.world_id).first() if level else None
    
    if not world:
        raise HTTPException(status_code=404, detail="World not found")
    
    # REFINED ACCESS CONTROL:
    # - Free courses: Accessible to all logged in users
    # - Paid courses: Requires active subscription
    if world.is_free:
        # Free course - accessible to all logged in users
        pass  # Allow access
    else:
        # Paid course - requires active subscription
        subscription = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()
        if not subscription or subscription.status != SubscriptionStatus.ACTIVE:
            raise HTTPException(
                status_code=403, 
                detail="Subscription required. Please upgrade to access this course."
            )
    
    # Get the world this lesson belongs to
    level = db.query(Level).filter(Level.id == lesson.level_id).first()
    world = db.query(World).filter(World.id == level.world_id).first() if level else None
    
    # Get all lessons in the world, sorted by week_number, day_number, and order_index
    all_lessons = []
    if world:
        for w_level in world.levels:
            all_lessons.extend(w_level.lessons)
        
        # Sort lessons by week_number, day_number, and order_index
        all_lessons.sort(key=lambda l: (
            l.week_number if l.week_number is not None else 0,
            l.day_number if l.day_number is not None else 0,
            l.order_index
        ))
    
    # Find current lesson index and get next/prev
    current_index = None
    for i, l in enumerate(all_lessons):
        if l.id == lesson.id:
            current_index = i
            break
    
    next_lesson = None
    prev_lesson = None
    if current_index is not None:
        if current_index + 1 < len(all_lessons):
            next_lesson = all_lessons[current_index + 1]
        if current_index > 0:
            prev_lesson = all_lessons[current_index - 1]
    
    # lesson_type is now a string, use it directly
    lesson_type_str = lesson.lesson_type or "video"
    
    return LessonDetailResponse(
        id=str(lesson.id),
        title=lesson.title,
        description=lesson.description,
        video_url=lesson.video_url,
        xp_value=lesson.xp_value,
        next_lesson_id=str(next_lesson.id) if next_lesson else None,
        prev_lesson_id=str(prev_lesson.id) if prev_lesson else None,
        comments=[],  # TODO: Implement comments
        week_number=lesson.week_number,
        day_number=lesson.day_number,
        content_json=lesson.content_json,
        mux_playback_id=lesson.mux_playback_id,
        mux_asset_id=lesson.mux_asset_id,
        thumbnail_url=lesson.thumbnail_url,
        lesson_type=lesson_type_str
    )


@router.get("/worlds/{world_id}/lessons", response_model=List[LessonResponse])
async def get_world_lessons(
    world_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get all lessons in a world. No prerequisites - all lessons are accessible. Accessible without authentication."""
    world = db.query(World).filter(World.id == world_id).first()
    if not world:
        raise HTTPException(status_code=404, detail="World not found")
    
    # Collect all lessons from all levels
    all_lessons = []
    for level in world.levels:
        all_lessons.extend(level.lessons)
    
    # Sort lessons by week_number, day_number, and order_index
    # Handle None values by treating them as 0 for sorting
    all_lessons.sort(key=lambda l: (
        l.week_number if l.week_number is not None else 0,
        l.day_number if l.day_number is not None else 0,
        l.order_index
    ))
    
    lessons = []
    for lesson in all_lessons:
            # Check completion (only if user is authenticated)
            is_completed = False
            if current_user:
                progress = db.query(UserProgress).filter(
                    UserProgress.user_id == current_user.id,
                    UserProgress.lesson_id == lesson.id
                ).first()
                is_completed = progress.is_completed if progress else False
            
            # lesson_type is now a string, use it directly
            lesson_type_str = lesson.lesson_type or "video"
            
            # All lessons are unlocked (no prerequisites)
            lessons.append(LessonResponse(
                id=str(lesson.id),
                title=lesson.title,
                description=lesson.description,
                video_url=lesson.video_url,
                xp_value=lesson.xp_value,
                is_completed=is_completed,
                is_locked=False,  # Always false - no prerequisites
                is_boss_battle=lesson.is_boss_battle,
                order_index=lesson.order_index,
                week_number=lesson.week_number,
                day_number=lesson.day_number,
                content_json=lesson.content_json,
                mux_playback_id=lesson.mux_playback_id,
                mux_asset_id=lesson.mux_asset_id,
                duration_minutes=lesson.duration_minutes,
                thumbnail_url=lesson.thumbnail_url,
                lesson_type=lesson_type_str
            ))
    
    return lessons
