"""
Founder Diamond — public read-only status endpoint.

Powers the "X / 300 Founder seats remaining" CTA on /pricing. The
write path (claiming a seat) lives in services/founder_badge_service.py
and is invoked from the Stripe subscription webhook only.

Cached 30s at the edge so a viral pricing page can't hammer the DB.
"""
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel

from models import get_db
from services import founder_badge_service


router = APIRouter()


class FounderBadgeStatusResponse(BaseModel):
    claimed: int
    remaining: int
    cap: int
    deadline: str
    expired: bool


@router.get(
    "/founder-badge/status",
    response_model=FounderBadgeStatusResponse,
    tags=["founder"],
)
def founder_badge_status(response: Response, db: Session = Depends(get_db)):
    """Public — live progress against the Founder Diamond cap."""
    status = founder_badge_service.get_status(db)
    response.headers["Cache-Control"] = "public, max-age=30"
    return FounderBadgeStatusResponse(**status)
