"""
Founder Diamond — public read-only status endpoint.

Returns ONLY the public-knowledge fields: the cap (300, marketing fact),
the deadline (May 6 18:00 UTC, marketing fact), and a binary `expired`
flag. The live `claimed` / `remaining` counts are deliberately NOT
returned — leaking the running tally undercuts the scarcity messaging
("only 300!" lands harder when the prospect doesn't know that ~270 of
those seats are still wide open). The internal counts are still tracked
in `founder_claims`; this endpoint just declines to publish them.

The write path (claiming a seat) lives in services/founder_badge_service.py
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
    """Public response — count fields intentionally omitted (see module docstring)."""
    cap: int
    deadline: str
    expired: bool


@router.get(
    "/founder-badge/status",
    response_model=FounderBadgeStatusResponse,
    tags=["founder"],
)
def founder_badge_status(response: Response, db: Session = Depends(get_db)):
    """Public — binary "still claimable?" + the public-knowledge cap and deadline.

    Pydantic+FastAPI will silently drop the extra `claimed`/`remaining`
    keys returned by `get_status()` because they are not declared on the
    response model. Do not add them back without explicit founder approval.
    """
    status = founder_badge_service.get_status(db)
    response.headers["Cache-Control"] = "public, max-age=30"
    return FounderBadgeStatusResponse(**status)
