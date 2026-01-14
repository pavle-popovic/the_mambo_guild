"""
Admin endpoints for course management.
Inspired by professional platforms like Steezy and Brenda Liew Online.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from models import get_db
from models.user import User
from models.course import World, Level, Lesson, Difficulty
from schemas.course import WorldResponse, LessonResponse
from dependencies import get_admin_user
import uuid

router = APIRouter()


class WorldCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    slug: str
    order_index: int
    is_free: bool = False
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    difficulty: str  # "BEGINNER", "INTERMEDIATE", "ADVANCED"
    course_type: str = "course"  # "course", "choreo", "topic"
    is_published: bool = False


class WorldUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    slug: Optional[str] = None
    order_index: Optional[int] = None
    is_free: Optional[bool] = None
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    mux_preview_playback_id: Optional[str] = None  # Mux playback ID for course preview
    mux_preview_asset_id: Optional[str] = None  # Mux asset ID for course preview (needed for deletion)
    difficulty: Optional[str] = None
    course_type: Optional[str] = None  # "course", "choreo", "topic"
    is_published: Optional[bool] = None


class LevelCreateRequest(BaseModel):
    world_id: str
    title: str
    order_index: int


class LessonCreateRequest(BaseModel):
    level_id: str
    title: str
    description: Optional[str] = None
    video_url: Optional[str] = ""
    xp_value: int = 50
    order_index: int
    is_boss_battle: bool = False
    duration_minutes: Optional[int] = None
    week_number: Optional[int] = None
    day_number: Optional[int] = None
    content_json: Optional[Dict[str, Any]] = None
    mux_playback_id: Optional[str] = None
    mux_asset_id: Optional[str] = None
    thumbnail_url: Optional[str] = None
    lesson_type: Optional[str] = "video"  # video, quiz, or history


class LessonUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    video_url: Optional[str] = None
    xp_value: Optional[int] = None
    order_index: Optional[int] = None
    is_boss_battle: Optional[bool] = None
    duration_minutes: Optional[int] = None
    week_number: Optional[int] = None
    day_number: Optional[int] = None
    content_json: Optional[Dict[str, Any]] = None
    mux_playback_id: Optional[str] = None
    mux_asset_id: Optional[str] = None
    delete_video: Optional[bool] = False  # Flag to explicitly delete video (clears Mux IDs)
    thumbnail_url: Optional[str] = None
    lesson_type: Optional[str] = None  # video, quiz, or history


@router.get("/courses", response_model=List[WorldResponse])
async def get_all_courses_admin(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all courses (including unpublished) for admin management."""
    worlds = db.query(World).order_by(World.order_index).all()
    
    result = []
    for world in worlds:
        difficulty_str = world.difficulty.value if hasattr(world.difficulty, 'value') else str(world.difficulty)
        result.append(WorldResponse(
            id=str(world.id),
            title=world.title,
            description=world.description,
            image_url=world.image_url,
            thumbnail_url=world.thumbnail_url,
            difficulty=difficulty_str,
            course_type=world.course_type or "course",
            progress_percentage=0.0,
            is_locked=False
        ))
    
    return result


@router.post("/courses", response_model=WorldResponse)
async def create_course(
    course_data: WorldCreateRequest,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new course."""
    # Check if slug already exists
    existing = db.query(World).filter(World.slug == course_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Course with this slug already exists")
    
    # Convert difficulty string to enum
    try:
        difficulty_enum = Difficulty[course_data.difficulty.upper()]
    except KeyError:
        raise HTTPException(status_code=400, detail=f"Invalid difficulty: {course_data.difficulty}")
    
    # Normalize course_type
    course_type = (course_data.course_type or "course").lower()
    if course_type not in ["course", "choreo", "topic"]:
        course_type = "course"
    
    world = World(
        id=uuid.uuid4(),
        title=course_data.title,
        description=course_data.description,
        slug=course_data.slug,
        order_index=course_data.order_index,
        is_free=course_data.is_free,
        image_url=course_data.image_url,
        thumbnail_url=course_data.thumbnail_url,
        difficulty=difficulty_enum,
        course_type=course_type,
        is_published=course_data.is_published
    )
    
    db.add(world)
    db.commit()
    db.refresh(world)
    
    difficulty_str = world.difficulty.value if hasattr(world.difficulty, 'value') else str(world.difficulty)
    return WorldResponse(
        id=str(world.id),
        title=world.title,
        description=world.description,
        image_url=world.image_url,
        thumbnail_url=world.thumbnail_url,
        difficulty=difficulty_str,
        course_type=world.course_type or "course",
        progress_percentage=0.0,
        is_locked=False
    )


@router.put("/courses/{course_id}", response_model=WorldResponse)
async def update_course(
    course_id: str,
    course_data: WorldUpdateRequest,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update an existing course."""
    world = db.query(World).filter(World.id == course_id).first()
    if not world:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Update fields
    if course_data.title is not None:
        world.title = course_data.title
    if course_data.description is not None:
        world.description = course_data.description
    if course_data.slug is not None:
        # Check if slug is already taken by another course
        existing = db.query(World).filter(World.slug == course_data.slug, World.id != course_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug already taken")
        world.slug = course_data.slug
    if course_data.order_index is not None:
        world.order_index = course_data.order_index
    if course_data.is_free is not None:
        world.is_free = course_data.is_free
    if course_data.image_url is not None:
        world.image_url = course_data.image_url
    if course_data.thumbnail_url is not None:
        world.thumbnail_url = course_data.thumbnail_url
    if course_data.mux_preview_playback_id is not None:
        world.mux_preview_playback_id = course_data.mux_preview_playback_id
    if course_data.mux_preview_asset_id is not None:
        world.mux_preview_asset_id = course_data.mux_preview_asset_id
    if course_data.difficulty is not None:
        try:
            world.difficulty = Difficulty[course_data.difficulty.upper()]
        except KeyError:
            raise HTTPException(status_code=400, detail=f"Invalid difficulty: {course_data.difficulty}")
    if course_data.is_published is not None:
        world.is_published = course_data.is_published
    if course_data.course_type is not None:
        course_type = course_data.course_type.lower()
        if course_type in ["course", "choreo", "topic"]:
            world.course_type = course_type
    
    db.commit()
    db.refresh(world)
    
    difficulty_str = world.difficulty.value if hasattr(world.difficulty, 'value') else str(world.difficulty)
    return WorldResponse(
        id=str(world.id),
        title=world.title,
        description=world.description,
        image_url=world.image_url,
        thumbnail_url=world.thumbnail_url,
        difficulty=difficulty_str,
        course_type=world.course_type or "course",
        progress_percentage=0.0,
        is_locked=False
    )


@router.delete("/courses/{course_id}")
async def delete_course(
    course_id: str,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a course and all its levels and lessons."""
    world = db.query(World).filter(World.id == course_id).first()
    if not world:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Delete all lessons first
    for level in world.levels:
        for lesson in level.lessons:
            db.delete(lesson)
        db.delete(level)
    
    db.delete(world)
    db.commit()
    
    return {"message": "Course deleted successfully"}


@router.post("/courses/{course_id}/levels", response_model=dict)
async def create_level(
    course_id: str,
    level_data: LevelCreateRequest,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new level in a course."""
    world = db.query(World).filter(World.id == course_id).first()
    if not world:
        raise HTTPException(status_code=404, detail="Course not found")
    
    level = Level(
        id=uuid.uuid4(),
        world_id=world.id,
        title=level_data.title,
        order_index=level_data.order_index
    )
    
    db.add(level)
    db.commit()
    db.refresh(level)
    
    return {
        "id": str(level.id),
        "title": level.title,
        "order_index": level.order_index
    }


@router.post("/levels/{level_id}/lessons", response_model=dict)
async def create_lesson(
    level_id: str,
    lesson_data: LessonCreateRequest,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new lesson in a level."""
    level = db.query(Level).filter(Level.id == level_id).first()
    if not level:
        raise HTTPException(status_code=404, detail="Level not found")
    
    # Validate and normalize lesson_type string
    lesson_type_str = "video"  # default
    if lesson_data.lesson_type:
        lesson_type_lower = lesson_data.lesson_type.lower()
        if lesson_type_lower in ["video", "quiz", "history"]:
            lesson_type_str = lesson_type_lower
        else:
            lesson_type_str = "video"  # fallback to default
    
    lesson = Lesson(
        id=uuid.uuid4(),
        level_id=level.id,
        title=lesson_data.title,
        description=lesson_data.description,
        video_url=lesson_data.video_url or "https://example.com/video/placeholder",
        xp_value=lesson_data.xp_value,
        order_index=lesson_data.order_index,
        is_boss_battle=lesson_data.is_boss_battle,
        duration_minutes=lesson_data.duration_minutes,
        week_number=lesson_data.week_number,
        day_number=lesson_data.day_number,
        content_json=lesson_data.content_json,
        mux_playback_id=lesson_data.mux_playback_id,
        mux_asset_id=lesson_data.mux_asset_id,
        thumbnail_url=lesson_data.thumbnail_url,
        lesson_type=lesson_type_str
    )
    
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    
    return {
        "id": str(lesson.id),
        "title": lesson.title,
        "order_index": lesson.order_index,
        "xp_value": lesson.xp_value,
        "is_boss_battle": lesson.is_boss_battle
    }


@router.put("/lessons/{lesson_id}", response_model=dict)
async def update_lesson(
    lesson_id: str,
    lesson_data: LessonUpdateRequest,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update an existing lesson."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    if lesson_data.title is not None:
        lesson.title = lesson_data.title
    if lesson_data.description is not None:
        lesson.description = lesson_data.description
    if lesson_data.video_url is not None:
        lesson.video_url = lesson_data.video_url
    if lesson_data.xp_value is not None:
        lesson.xp_value = lesson_data.xp_value
    if lesson_data.order_index is not None:
        lesson.order_index = lesson_data.order_index
    if lesson_data.is_boss_battle is not None:
        lesson.is_boss_battle = lesson_data.is_boss_battle
    if lesson_data.duration_minutes is not None:
        lesson.duration_minutes = lesson_data.duration_minutes
    if lesson_data.week_number is not None:
        lesson.week_number = lesson_data.week_number
    if lesson_data.day_number is not None:
        lesson.day_number = lesson_data.day_number
    if lesson_data.content_json is not None:
        lesson.content_json = lesson_data.content_json
    if lesson_data.thumbnail_url is not None:
        lesson.thumbnail_url = lesson_data.thumbnail_url
    if lesson_data.lesson_type is not None:
        lesson_type_lower = lesson_data.lesson_type.lower()
        if lesson_type_lower in ["video", "quiz", "history"]:
            lesson.lesson_type = lesson_type_lower
        # If invalid, keep existing value (no change)
    
    # Mux fields are managed by the Webhook (source of truth)
    # Only allow clearing them if explicitly requested via delete_video flag
    if lesson_data.delete_video:
        # User explicitly requested to delete video - clear Mux IDs
        lesson.mux_playback_id = None
        lesson.mux_asset_id = None
        lesson.video_url = ""  # Also clear fallback video URL
    # Otherwise, ignore mux_playback_id and mux_asset_id from request
    # The webhook will update these fields when video is ready
    
    db.commit()
    db.refresh(lesson)
    
    return {
        "id": str(lesson.id),
        "title": lesson.title,
        "order_index": lesson.order_index
    }


@router.delete("/lessons/{lesson_id}")
async def delete_lesson(
    lesson_id: str,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a lesson."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    db.delete(lesson)
    db.commit()
    
    return {"message": "Lesson deleted successfully"}


@router.get("/courses/{course_id}/full", response_model=dict)
async def get_course_full_details(
    course_id: str,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get full course details with all levels and lessons for admin editing."""
    world = db.query(World).filter(World.id == course_id).first()
    if not world:
        raise HTTPException(status_code=404, detail="Course not found")
    
    difficulty_str = world.difficulty.value if hasattr(world.difficulty, 'value') else str(world.difficulty)
    
    levels_data = []
    for level in world.levels:
        lessons_data = []
        # Sort lessons by week_number, day_number, and order_index
        sorted_lessons = sorted(level.lessons, key=lambda l: (
            l.week_number if l.week_number is not None else 0,
            l.day_number if l.day_number is not None else 0,
            l.order_index
        ))
        for lesson in sorted_lessons:
            # lesson_type is now a string, use it directly
            lesson_type_str = lesson.lesson_type or "video"
            
            lessons_data.append({
                "id": str(lesson.id),
                "title": lesson.title,
                "description": lesson.description,
                "video_url": lesson.video_url,
                "xp_value": lesson.xp_value,
                "order_index": lesson.order_index,
                "is_boss_battle": lesson.is_boss_battle,
                "duration_minutes": lesson.duration_minutes,
                "week_number": lesson.week_number,
                "day_number": lesson.day_number,
                "content_json": lesson.content_json,
                "thumbnail_url": lesson.thumbnail_url,
                "mux_playback_id": lesson.mux_playback_id,
                "mux_asset_id": lesson.mux_asset_id,
                "lesson_type": lesson_type_str
            })
        
        levels_data.append({
            "id": str(level.id),
            "title": level.title,
            "order_index": level.order_index,
            "lessons": lessons_data
        })
    
    return {
        "id": str(world.id),
        "title": world.title,
        "description": world.description,
        "slug": world.slug,
        "order_index": world.order_index,
        "is_free": world.is_free,
        "image_url": world.image_url,
        "thumbnail_url": world.thumbnail_url,
        "mux_preview_playback_id": world.mux_preview_playback_id,  # Include preview playback ID
        "mux_preview_asset_id": world.mux_preview_asset_id,  # Include preview asset ID
        "difficulty": difficulty_str,
        "course_type": world.course_type or "course",
        "is_published": world.is_published,
        "levels": levels_data
    }

