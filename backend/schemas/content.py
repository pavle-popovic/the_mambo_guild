"""
Schemas for rich content blocks in lessons.
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Literal


class VideoBlock(BaseModel):
    type: Literal["video"]
    url: Optional[str] = None
    embed_code: Optional[str] = None
    provider: Optional[str] = None  # youtube, vimeo, etc.


class TextBlock(BaseModel):
    type: Literal["text"]
    content: str
    format: Literal["markdown", "html", "plain"] = "markdown"


class ImageBlock(BaseModel):
    type: Literal["image"]
    url: str
    caption: Optional[str] = None
    alt: Optional[str] = None


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int  # Index of correct option
    explanation: Optional[str] = None


class QuizBlock(BaseModel):
    type: Literal["quiz"]
    title: Optional[str] = None
    questions: List[QuizQuestion]


# Union type for content blocks
ContentBlock = VideoBlock | TextBlock | ImageBlock | QuizBlock


class LessonContent(BaseModel):
    """Structure for lesson rich content."""
    blocks: List[Dict[str, Any]]  # Flexible structure for different block types

