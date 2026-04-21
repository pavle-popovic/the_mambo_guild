"""
Award the Beta Tester badge to the 21 specific users who tested the platform
before launch. The badge is no longer auto-awarded for referral milestones
(see migration_019 + auth.py — that path now awards `promoter`).

Idempotent: uses the existing award_badge service which no-ops if the user
already has the badge. Emails not matching a registered account are reported
but don't abort the run.
"""
import os
import sys
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
from services import badge_service


BETA_TESTER_EMAILS = [
    "louietao833@gmail.com",
    "richardpaulpalmer@gmail.com",
    "itsiuliaeana@gmail.com",
    "debbiegottlieb@yahoo.com",
    "info@columbuslatindance.com",
    "conor.matthews15@gmail.com",
    "eliasouliehuse@gmail.com",
    "rcfthree@gmail.com",
    "bennett.brendan@yahoo.co.uk",
    "jorgescm86@gmail.com",
    "largern@yahoo.com",
    "wbogdan15@gmail.com",
    "emirsmagic@gmail.com",
    "jmartinez42390@gmail.com",
    "apneal12@gmail.com",
    "lunguecaterina90@gmail.com",
    "mcan.celebi@gmail.com",
    "nathalybaronviajes@gmail.com",
    "milano.marco@outlook.com",
    "emanuelerusso888@outlook.com",
    "dina.manthos@gmail.com",
]


def run():
    engine = get_engine()
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        badge_def = db.query(BadgeDefinition).filter(BadgeDefinition.id == "beta_tester").first()
        if not badge_def:
            print("ERROR: beta_tester badge definition not found. Run migration_019 first.")
            return

        awarded = 0
        skipped_already = 0
        missing_users = []

        for email in BETA_TESTER_EMAILS:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                missing_users.append(email)
                continue

            existing = db.query(UserBadge).filter(
                UserBadge.user_id == user.id,
                UserBadge.badge_id == "beta_tester",
            ).first()
            if existing:
                skipped_already += 1
                continue

            badge_service.award_badge(str(user.id), badge_def, db)
            awarded += 1

        db.commit()

        print(f"Beta Tester grant complete.")
        print(f"  Awarded:        {awarded}")
        print(f"  Already had it: {skipped_already}")
        print(f"  Missing users:  {len(missing_users)}")
        if missing_users:
            print("  Emails without a matching account:")
            for email in missing_users:
                print(f"    - {email}")
    finally:
        db.close()


if __name__ == "__main__":
    run()
