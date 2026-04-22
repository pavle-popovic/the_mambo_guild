"""
Grant every active badge to a given admin user (by email).

Idempotent: re-runs skip badges the user already has. Uses direct INSERT
on user_badges rather than the full award_badge() service so we bypass
XP bonuses / claves rewards — this is a seed-for-display action, not an
earn event.

Usage (inside backend container):
    python -m scripts.grant_all_badges pavlepopovic@themamboguild.com
"""
import os
import sys
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(project_root, ".env")
load_dotenv(env_path)

backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_path)

from sqlalchemy.orm import sessionmaker
from models import get_engine
from models.user import User
from models.community import BadgeDefinition, UserBadge


def run(email: str) -> None:
    engine = get_engine()
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"ERROR: no user found for email {email!r}")
            return

        all_badges = db.query(BadgeDefinition).filter(
            BadgeDefinition.is_active == True  # noqa: E712
        ).all()
        if not all_badges:
            print("ERROR: no active badge definitions found")
            return

        owned_ids = {
            row.badge_id
            for row in db.query(UserBadge.badge_id).filter(
                UserBadge.user_id == user.id
            ).all()
        }

        to_grant = [b for b in all_badges if b.id not in owned_ids]

        now = datetime.now(timezone.utc)
        for idx, badge in enumerate(to_grant):
            db.add(UserBadge(
                id=uuid.uuid4(),
                user_id=user.id,
                badge_id=badge.id,
                earned_at=now,
                display_order=idx,
            ))

        db.commit()

        print(f"User: {user.email}  ({user.id})")
        print(f"  total badges in catalog: {len(all_badges)}")
        print(f"  already owned:           {len(owned_ids)}")
        print(f"  newly granted:           {len(to_grant)}")
        if to_grant:
            for b in to_grant:
                print(f"    + {b.id}  ({b.name})")
    finally:
        db.close()


if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else "pavlepopovic@themamboguild.com"
    run(email)
