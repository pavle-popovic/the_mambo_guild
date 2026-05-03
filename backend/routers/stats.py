"""
Public read-only stats endpoints. Currently exposes a single live counter:
the number of real registered accounts (excluding unactivated waitlist
signups). Used as social proof on Hero / /pricing / /login / /register —
"Join 247 dancers already in the Guild."

Cached 5min at the edge so a viral pricing page can't hammer the DB.
"""
from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from models import get_db
from models.user import User

router = APIRouter()


class RegisteredCountResponse(BaseModel):
    count: int


@router.get(
    "/stats/registered-count",
    response_model=RegisteredCountResponse,
    tags=["stats"],
)
def registered_count(response: Response, db: Session = Depends(get_db)):
    """Public — count of real registered accounts.

    Filters:
      - auth_provider ∈ {email, google, apple}   (excludes unactivated waitlist)
      - is_verified = TRUE                       (no fake/spam unverified rows)

    OAuth users (google, apple) are auto-verified by the provider, so the
    `is_verified` filter doesn't exclude them. Only excludes email-auth
    users who never clicked the verification link — those aren't really
    "in the Guild" yet.

    Cached 5 minutes so a viral pricing page or signup blast can't
    hammer the DB. The number ticks up at 5min granularity, which is
    fine — this is social proof, not a real-time leaderboard.
    """
    count = (
        db.query(func.count(User.id))
        .filter(User.auth_provider.in_(("email", "google", "apple")))
        .filter(User.is_verified.is_(True))
        .scalar()
    )
    response.headers["Cache-Control"] = "public, max-age=300"
    return RegisteredCountResponse(count=int(count or 0))
