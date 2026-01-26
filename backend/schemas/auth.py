from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional, List
from datetime import datetime
import re


class UserRegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    confirm_password: str
    first_name: str
    last_name: str
    current_level_tag: str  # "Beginner", "Novice", "Intermediate", "Advanced"
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(v) > 30:
            raise ValueError("Username cannot exceed 30 characters")
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError("Username can only contain letters, numbers, and underscores")
        return v.lower()

    @model_validator(mode='after')
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class BadgeResponse(BaseModel):
    id: str
    name: str
    description: str
    tier: str
    icon_url: Optional[str] = None
    category: str
    requirement_type: str
    requirement_value: int
    is_earned: bool
    earned_at: Optional[datetime] = None
    display_order: int = 0

    class Config:
        from_attributes = True


class UserStatsResponse(BaseModel):
    reactions_given: int
    reactions_received: int
    solutions_accepted: int
    
    class Config:
        from_attributes = True


class UserProfileResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    username: Optional[str] = None
    xp: int
    level: int
    streak_count: int
    tier: str
    role: str
    avatar_url: Optional[str] = None
    current_level_tag: Optional[str] = None
    
    # Gamification v4
    reputation: int = 0
    current_claves: int = 0
    badges: List[BadgeResponse] = []
    stats: Optional[UserStatsResponse] = None

    class Config:
        from_attributes = True


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str
    
    @model_validator(mode='after')
    def passwords_match(self):
        if self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self
    
    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


class BadgeReorderRequest(BaseModel):
    badge_ids: List[str]
