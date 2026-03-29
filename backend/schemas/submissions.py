from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SubmissionCreateRequest(BaseModel):
    lesson_id: str
    video_url: Optional[str] = None
    mux_playback_id: Optional[str] = None
    mux_asset_id: Optional[str] = None

    def get_video_url(self) -> str:
        """Resolve effective video URL from either a direct URL or Mux playback ID."""
        if self.video_url:
            return self.video_url
        if self.mux_playback_id:
            return f"https://stream.mux.com/{self.mux_playback_id}"
        raise ValueError("Either video_url or mux_playback_id must be provided")


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

