from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class WorldResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    image_url: Optional[str]
    thumbnail_url: Optional[str] = None
    mux_preview_playback_id: Optional[str] = None  # Mux playback ID for course preview
    difficulty: str
    course_type: str = "course"  # course, choreo, topic
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
    week_number: Optional[int] = None
    day_number: Optional[int] = None
    content_json: Optional[Dict[str, Any]] = None
    mux_playback_id: Optional[str] = None
    mux_asset_id: Optional[str] = None
    duration_minutes: Optional[int] = None
    thumbnail_url: Optional[str] = None
    lesson_type: str = "video"  # video, quiz, or history

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
    week_number: Optional[int] = None
    day_number: Optional[int] = None
    content_json: Optional[Dict[str, Any]] = None
    mux_playback_id: Optional[str] = None
    mux_asset_id: Optional[str] = None
    thumbnail_url: Optional[str] = None
    lesson_type: str = "video"  # video, quiz, or history

    class Config:
        from_attributes = True


class CheckoutSessionRequest(BaseModel):
    price_id: str
    success_url: str
    cancel_url: str


class CheckoutSessionResponse(BaseModel):
    session_id: str
    url: str


class UpdateSubscriptionRequest(BaseModel):
    new_price_id: str


class SubscriptionResponse(BaseModel):
    success: bool
    message: str
    tier: Optional[str] = None

