
import sys
import os
import uuid

# Add parent directory to path to import models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from models import get_session_local
from models.user import User, UserProfile
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def backfill_usernames():
    SessionLocal = get_session_local()
    db: Session = SessionLocal()
    try:
        profiles = db.query(UserProfile).filter(UserProfile.username == None).all()
        logger.info(f"Found {len(profiles)} profiles to backfill.")

        updated_count = 0
        for profile in profiles:
            user = db.query(User).filter(User.id == profile.user_id).first()
            if not user:
                continue
            
            # Base username from email
            if user.email:
                base_username = user.email.split('@')[0]
                # Sanitize
                base_username = "".join(c for c in base_username if c.isalnum() or c in ['_', '-'])
            else:
                base_username = f"User_{str(profile.id)[:8]}"

            # Ensure uniqueness
            username = base_username
            counter = 1
            while True:
                existing = db.query(UserProfile).filter(UserProfile.username == username).first()
                if not existing:
                    break
                username = f"{base_username}_{counter}"
                counter += 1
            
            profile.username = username
            updated_count += 1
            if updated_count % 10 == 0:
                logger.info(f"Updated {updated_count} profiles...")

        db.commit()
        logger.info(f"Successfully backfilled {updated_count} usernames.")
    
    except Exception as e:
        logger.error(f"Error backfilling usernames: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting Username Backfill...")
    backfill_usernames()
    print("Done.")
