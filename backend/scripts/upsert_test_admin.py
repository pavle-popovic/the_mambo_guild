"""
upsert_test_admin.py
─────────────────────────────────────────────────────────────────────────────
Safely creates OR converts an existing account to full admin / Guild Master
access. Handles all three states the target email can be in:

  1. Exists as waitlist user  (auth_provider="waitlist", no password)
     → Converts to email auth, sets password, elevates to admin + performer

  2. Exists as a regular / partial user
     → Updates role, subscription, and password in-place

  3. Does not exist at all
     → Creates the full user stack (User + UserProfile + Subscription + UserStats)

Safe to run multiple times (fully idempotent).
Does NOT touch any other rows in the database.

Usage:
  cd backend
  ADMIN_EMAIL=pavlepopovic@themamboguild.com ADMIN_PASSWORD=YourChosenPassword \
    python scripts/upsert_test_admin.py
"""

import os
import sys
import uuid
import secrets
import logging
from datetime import datetime

# ── suppress noisy SQLAlchemy logs ──────────────────────────────────────────
logging.disable(logging.CRITICAL)

# ── path setup ───────────────────────────────────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
root_dir = os.path.dirname(backend_dir)   # salsa_lab_v2/
sys.path.insert(0, backend_dir)

from dotenv import load_dotenv
# .env lives at the project root (salsa_lab_v2/.env), not inside backend/
load_dotenv(os.path.join(root_dir, ".env"))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config import settings
from services.auth_service import get_password_hash
from models.user import User, UserProfile, Subscription, CurrentLevelTag, UserRole
from models.community import UserStats

# ── Windows UTF-8 fix ─────────────────────────────────────────────────────
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

SEPARATOR = "─" * 60


def run():
    # ── 1. Read credentials from env ────────────────────────────────────────
    target_email = os.getenv("ADMIN_EMAIL", "").strip()
    target_password = os.getenv("ADMIN_PASSWORD", "").strip()

    if not target_email or not target_password:
        print("ERROR: Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.")
        print()
        print("  Windows PowerShell:")
        print("    $env:ADMIN_EMAIL='pavlepopovic@themamboguild.com'")
        print("    $env:ADMIN_PASSWORD='YourChosenPassword'")
        print("    python scripts/upsert_test_admin.py")
        print()
        print("  Bash / Git Bash:")
        print("    ADMIN_EMAIL=pavlepopovic@themamboguild.com \\")
        print("    ADMIN_PASSWORD=YourChosenPassword \\")
        print("    python scripts/upsert_test_admin.py")
        sys.exit(1)

    if len(target_password) < 8:
        print("ERROR: Password must be at least 8 characters.")
        sys.exit(1)

    print(SEPARATOR)
    print("  Mambo Guild — Admin Account Setup")
    print(SEPARATOR)
    print(f"  Target email : {target_email}")
    print(f"  Database     : {settings.DATABASE_URL[:40]}...")
    print(SEPARATOR)

    # ── 2. Connect ───────────────────────────────────────────────────────────
    engine = create_engine(settings.DATABASE_URL, echo=False)
    Session = sessionmaker(bind=engine)
    db = Session()

    try:
        hashed_pw = get_password_hash(target_password)
        now = datetime.utcnow()
        action_taken = []

        # ── 3. Check user ────────────────────────────────────────────────────
        user = db.query(User).filter(User.email == target_email).first()

        if user:
            prior_provider = user.auth_provider
            prior_role = user.role

            # Update the user record regardless of current state
            user.hashed_password = hashed_pw
            user.auth_provider = "email"
            user.is_verified = True
            user.role = UserRole.ADMIN
            user.updated_at = now
            db.flush()

            action_taken.append(
                f"UPDATED existing user (was auth_provider='{prior_provider}', role='{prior_role}')"
            )
            action_taken.append(
                "SET  auth_provider='email', role='admin', is_verified=True, password=<hashed>"
            )
            user_id = str(user.id)
        else:
            # Create fresh user
            user_id = str(uuid.uuid4())
            user = User(
                id=user_id,
                email=target_email,
                hashed_password=hashed_pw,
                auth_provider="email",
                is_verified=True,
                role=UserRole.ADMIN,
                created_at=now,
                updated_at=now,
            )
            db.add(user)
            db.flush()
            action_taken.append("CREATED new user record")

        # ── 4. Ensure UserProfile ────────────────────────────────────────────
        profile = db.query(UserProfile).filter(
            UserProfile.user_id == user_id
        ).first()

        if profile:
            # Make sure the performer subscription badge fields are solid
            action_taken.append("FOUND  existing UserProfile — no changes needed")
        else:
            referral_code = secrets.token_hex(4)  # 8-char hex
            # Guard against (unlikely) collision
            while db.query(UserProfile).filter(
                UserProfile.referral_code == referral_code
            ).first():
                referral_code = secrets.token_hex(4)

            profile = UserProfile(
                id=str(uuid.uuid4()),
                user_id=user_id,
                first_name="Pavle",
                last_name="Popovic",
                username="pavle_admin",
                current_level_tag=CurrentLevelTag.ADVANCED,
                xp=0,
                level=1,
                streak_count=0,
                badges="[]",
                current_claves=999,
                referral_code=referral_code,
                weekly_free_freeze_used=False,
                inventory_freezes=10,
            )
            db.add(profile)
            db.flush()
            action_taken.append("CREATED UserProfile (username=pavle_admin, claves=999)")

        # ── 5. Ensure Subscription (performer / active) ──────────────────────
        sub = db.query(Subscription).filter(
            Subscription.user_id == user_id
        ).first()

        if sub:
            prior_tier = sub.tier
            sub.tier = "performer"
            sub.status = "active"
            db.flush()
            action_taken.append(
                f"UPDATED Subscription (was tier='{prior_tier}') → tier='performer', status='active'"
            )
        else:
            sub = Subscription(
                id=str(uuid.uuid4()),
                user_id=user_id,
                tier="performer",
                status="active",
            )
            db.add(sub)
            db.flush()
            action_taken.append("CREATED Subscription (performer / active)")

        # ── 6. Ensure UserStats ──────────────────────────────────────────────
        stats = db.query(UserStats).filter(
            UserStats.user_id == user_id
        ).first()

        if not stats:
            stats = UserStats(user_id=user_id)
            db.add(stats)
            db.flush()
            action_taken.append("CREATED UserStats row")
        else:
            action_taken.append("FOUND  existing UserStats — no changes needed")

        # ── 7. Commit ────────────────────────────────────────────────────────
        db.commit()

        # ── 8. Print summary ─────────────────────────────────────────────────
        print()
        print("  RESULT: SUCCESS")
        print()
        for step in action_taken:
            print(f"  • {step}")
        print()
        print(SEPARATOR)
        print("  Login credentials")
        print(SEPARATOR)
        print(f"  Email    : {target_email}")
        print(f"  Password : {target_password}")
        print(f"  Role     : admin")
        print(f"  Tier     : Guild Master (performer)")
        print()
        print("  You can now log in at http://localhost:3000/login")
        print(SEPARATOR)

    except Exception as e:
        db.rollback()
        print()
        print(f"  ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    run()
