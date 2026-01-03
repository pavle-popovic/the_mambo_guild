from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SubmissionCreateRequest(BaseModel):
    lesson_id: str
    video_url: str


class SubmissionResponse(BaseModel):
    id: str
    status: str
    feedback: Optional[str] = None
    submitted_at: datetime

    class Config:
        from_attributes = True


class GradeSubmissionRequest(BaseModel):
    status: str  # "approved" or "rejected"
    feedback_text: Optional[str] = None
    feedback_video_url: Optional[str] = None

