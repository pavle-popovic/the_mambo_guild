from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class WorldResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    image_url: Optional[str]
    difficulty: str
    progress_percentage: float
    is_locked: bool

    class Config:
        from_attributes = True


class LessonResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    video_url: str
    xp_value: int
    is_completed: bool
    is_locked: bool
    is_boss_battle: bool
    order_index: int

    class Config:
        from_attributes = True


class CommentResponse(BaseModel):
    id: str
    user_id: str
    content: str
    created_at: datetime
    parent_id: Optional[str] = None

    class Config:
        from_attributes = True


class LessonDetailResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    video_url: str
    xp_value: int
    next_lesson_id: Optional[str] = None
    prev_lesson_id: Optional[str] = None
    comments: List[CommentResponse] = []

    class Config:
        from_attributes = True

