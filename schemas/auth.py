from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    current_level_tag: str  # "Beginner", "Novice", "Intermediate", "Advanced"


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfileResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    xp: int
    level: int
    streak_count: int
    tier: str
    role: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

