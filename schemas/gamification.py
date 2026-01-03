from pydantic import BaseModel


class XPGainResponse(BaseModel):
    xp_gained: int
    new_total_xp: int
    leveled_up: bool
    new_level: int


class LeaderboardEntry(BaseModel):
    user_id: str
    name: str
    avatar_url: str | None
    xp_total: int
    rank: int

