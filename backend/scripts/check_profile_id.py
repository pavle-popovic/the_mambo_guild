import sys
import os
import logging

logging.disable(logging.CRITICAL)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import get_session_local
from models.user import UserProfile

def main():
    SessionLocal = get_session_local()
    db = SessionLocal()
    
    user_id = "7128646c-4d5f-46af-b0eb-536f2581ec84"
    
    try:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if profile:
            print(f"User ID: {user_id}")
            print(f"Profile ID: {profile.id}")
        else:
            print("Profile not found")
    finally:
        db.close()

if __name__ == "__main__":
    main()
