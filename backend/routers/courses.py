from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from models import get_db
from models.user import User, Subscription, SubscriptionStatus
from models.course import World, Lesson, Level
from models.progress import UserProgress
from schemas.course import WorldResponse, LessonResponse, LessonDetailResponse, WorldDetailResponse, LevelResponse, LevelEdgeResponse
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
    
    # PERFORMANCE FIX: Pre-fetch all user progress in a single query
    # Build a map of world_id -> (completed_count, total_lessons)
    world_progress_map: Dict[str, tuple] = {}
    if current_user:
        # First, build a mapping of lesson_id -> world_id for all lessons
        lesson_to_world: Dict[str, str] = {}
        world_lesson_counts: Dict[str, int] = {}
        
        for world in worlds:
            world_lesson_counts[str(world.id)] = 0
            for level in world.levels:
                for lesson in level.lessons:
                    lesson_to_world[str(lesson.id)] = str(world.id)
                    world_lesson_counts[str(world.id)] += 1
        
        # Get all completed lesson IDs for this user in a single query
        all_lesson_ids = list(lesson_to_world.keys())
        if all_lesson_ids:
            completed_progress = db.query(UserProgress.lesson_id).filter(
                UserProgress.user_id == current_user.id,
                UserProgress.is_completed == True,
                UserProgress.lesson_id.in_(all_lesson_ids)
            ).all()
            
            # Count completions per world
            world_completed_counts: Dict[str, int] = {str(w.id): 0 for w in worlds}
            for (lesson_id,) in completed_progress:
                world_id = lesson_to_world.get(str(lesson_id))
                if world_id:
                    world_completed_counts[world_id] += 1
            
            # Build the progress map
            for world_id, completed in world_completed_counts.items():
                total = world_lesson_counts.get(world_id, 0)
                world_progress_map[world_id] = (completed, total)
    
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
        
        # Calculate progress from pre-fetched data
        progress_percentage = 0
        if current_user:
            completed, total = world_progress_map.get(str(world.id), (0, 0))
            progress_percentage = (completed / total * 100) if total > 0 else 0
        
        # Convert enum to string value
        difficulty_str = world.difficulty.value if hasattr(world.difficulty, 'value') else str(world.difficulty)
        
        # Calculate module and lesson counts
        module_count = len(world.levels)
        lesson_count = sum(len(level.lessons) for level in world.levels)

        # Calculate total duration if not set
        calculated_duration = sum(
            sum((lesson.duration_minutes or 0) for lesson in level.lessons)
            for level in world.levels
        )
        total_duration = world.total_duration_minutes if world.total_duration_minutes else calculated_duration

        # Get objectives (ensure it's a list)
        objectives = world.objectives if world.objectives else []

        result.append(WorldResponse(
            id=str(world.id),
            title=world.title,
            description=world.description,
            image_url=world.image_url,
            thumbnail_url=world.thumbnail_url,
            mux_preview_playback_id=world.mux_preview_playback_id,  # Include preview playback ID
            difficulty=difficulty_str,
            course_type=world.course_type or "course",
            progress_percentage=progress_percentage,
            is_locked=is_locked,
            # Course metadata
            total_duration_minutes=total_duration,
            objectives=objectives,
            module_count=module_count,
            lesson_count=lesson_count
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
        lesson_type=lesson_type_str,
        level_id=str(lesson.level_id) if lesson.level_id else None,
        level_title=level.title if level else None
    )


@router.get("/levels/{level_id}/lessons", response_model=List[LessonResponse])
async def get_level_lessons(
    level_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get all lessons in a specific level/module. Used for the quest bar sidebar."""
    level = db.query(Level).filter(Level.id == level_id).first()
    if not level:
        raise HTTPException(status_code=404, detail="Level not found")

    # Get the world to check access
    world = db.query(World).filter(World.id == level.world_id).first()
    if not world:
        raise HTTPException(status_code=404, detail="World not found")

    # Get all lessons in this level, sorted by order_index
    lessons = sorted(level.lessons, key=lambda l: (
        l.week_number if l.week_number is not None else 0,
        l.day_number if l.day_number is not None else 0,
        l.order_index
    ))

    # Pre-fetch user progress for this level's lessons
    completed_lesson_ids: set = set()
    if current_user and lessons:
        lesson_ids = [str(l.id) for l in lessons]
        completed = db.query(UserProgress.lesson_id).filter(
            UserProgress.user_id == current_user.id,
            UserProgress.is_completed == True,
            UserProgress.lesson_id.in_(lesson_ids)
        ).all()
        completed_lesson_ids = {str(lid) for (lid,) in completed}

    result = []
    for lesson in lessons:
        lesson_id_str = str(lesson.id)
        is_completed = lesson_id_str in completed_lesson_ids

        # Lessons are unlocked for logged-in users
        # Access control is handled at the course level, not lesson level
        is_locked = not current_user

        lesson_type_str = lesson.lesson_type or "video"

        result.append(LessonResponse(
            id=lesson_id_str,
            title=lesson.title,
            description=lesson.description,
            video_url=lesson.video_url,
            xp_value=lesson.xp_value,
            is_completed=is_completed,
            is_locked=is_locked,
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

    return result


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
    
    # PERFORMANCE FIX: Pre-fetch all user progress for this world's lessons in a single query
    completed_lesson_ids: set = set()
    if current_user and all_lessons:
        lesson_ids = [str(l.id) for l in all_lessons]
        completed_progress = db.query(UserProgress.lesson_id).filter(
            UserProgress.user_id == current_user.id,
            UserProgress.is_completed == True,
            UserProgress.lesson_id.in_(lesson_ids)
        ).all()
        completed_lesson_ids = {str(lesson_id) for (lesson_id,) in completed_progress} if completed_progress else set()
    
    lessons = []
    for lesson in all_lessons:
        # Check completion from pre-fetched data
        is_completed = str(lesson.id) in completed_lesson_ids if current_user else False
        
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


@router.get("/worlds/{world_id}/skill-tree", response_model=WorldDetailResponse)
async def get_world_skill_tree(
    world_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get skill tree graph structure for a course with nodes (levels), edges, and unlock logic.
    Each node shows completion percentage and unlock status based on prerequisites.
    """
    from models.course import LevelEdge
    
    world = db.query(World).filter(World.id == world_id).first()
    if not world:
        raise HTTPException(status_code=404, detail="World not found")
    
    # Get all edges for this world
    edges = db.query(LevelEdge).filter(LevelEdge.world_id == world_id).all()
    
    # Build prerequisite map (level_id -> list of prerequisite level_ids)
    prerequisites_map: Dict[str, List[str]] = {}
    for edge in edges:
        to_level_id = str(edge.to_level_id)
        from_level_id = str(edge.from_level_id)
        if to_level_id not in prerequisites_map:
            prerequisites_map[to_level_id] = []
        prerequisites_map[to_level_id].append(from_level_id)
    
    # Pre-fetch user progress for all lessons in this course
    completed_lesson_ids: set = set()
    if current_user:
        all_lesson_ids = []
        for level in world.levels:
            all_lesson_ids.extend([str(l.id) for l in level.lessons])
        
        if all_lesson_ids:
            completed_progress = db.query(UserProgress.lesson_id).filter(
                UserProgress.user_id == current_user.id,
                UserProgress.is_completed == True,
                UserProgress.lesson_id.in_(all_lesson_ids)
            ).all()
            completed_lesson_ids = {str(lesson_id) for (lesson_id,) in completed_progress}
    
    # Calculate completion percentage for each level
    level_completion_map: Dict[str, float] = {}
    for level in world.levels:
        total_lessons = len(level.lessons)
        if total_lessons == 0:
            level_completion_map[str(level.id)] = 0.0
        else:
            completed_count = sum(1 for lesson in level.lessons if str(lesson.id) in completed_lesson_ids)
            level_completion_map[str(level.id)] = (completed_count / total_lessons) * 100
    
    # Determine which levels are unlocked
    # A level is unlocked if ALL its prerequisites are 100% completed
    level_unlocked_map: Dict[str, bool] = {}
    
    def is_level_unlocked(level_id: str) -> bool:
        if level_id in level_unlocked_map:
            return level_unlocked_map[level_id]
        
        # No prerequisites? It's unlocked
        prereqs = prerequisites_map.get(level_id, [])
        if not prereqs:
            level_unlocked_map[level_id] = True
            return True
        
        # Check if all prerequisites are completed (100%)
        all_prereqs_complete = all(
            level_completion_map.get(prereq_id, 0.0) >= 100.0
            for prereq_id in prereqs
        )
        
        level_unlocked_map[level_id] = all_prereqs_complete
        return all_prereqs_complete
    
    # Build level responses
    level_responses = []
    for level in world.levels:
        level_id = str(level.id)
        is_unlocked = is_level_unlocked(level_id)
        completion_pct = level_completion_map.get(level_id, 0.0)
        
        # Calculate total XP from lessons if not set on level
        calculated_xp = sum(lesson.xp_value for lesson in level.lessons)
        total_xp = level.total_xp if level.total_xp else calculated_xp

        # Calculate duration from lessons if not set on level
        calculated_duration = sum((lesson.duration_minutes or 0) for lesson in level.lessons)
        duration = level.duration_minutes if level.duration_minutes else calculated_duration

        level_responses.append(LevelResponse(
            id=level_id,
            title=level.title,
            description=level.description,
            order_index=level.order_index,
            x_position=level.x_position,
            y_position=level.y_position,
            thumbnail_url=level.thumbnail_url,
            mux_preview_playback_id=level.mux_preview_playback_id,
            is_unlocked=is_unlocked,
            completion_percentage=completion_pct,
            lesson_count=len(level.lessons),
            # Module metadata
            outcome=level.outcome,
            duration_minutes=duration,
            total_xp=total_xp,
            status=level.status or "active"
        ))
    
    # Build edge responses
    edge_responses = [
        LevelEdgeResponse(
            id=str(edge.id),
            from_level_id=str(edge.from_level_id),
            to_level_id=str(edge.to_level_id),
            world_id=str(edge.world_id)
        )
        for edge in edges
    ]
    
    # Convert difficulty enum to string
    difficulty_str = world.difficulty.value if hasattr(world.difficulty, 'value') else str(world.difficulty)
    
    return WorldDetailResponse(
        id=str(world.id),
        title=world.title,
        description=world.description,
        difficulty=difficulty_str,
        course_type=world.course_type or "course",
        is_free=world.is_free,
        is_published=world.is_published,
        thumbnail_url=world.thumbnail_url,
        levels=level_responses,
        edges=edge_responses
    )
