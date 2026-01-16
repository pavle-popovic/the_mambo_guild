import sys
import os
import logging

# Kill all logging
logging.disable(logging.CRITICAL)

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import get_session_local
from models.user import User

def main():
    SessionLocal = get_session_local()
    db = SessionLocal()
    
    ids = [
        "c201598d-088b-43dd-a4c9-0055ebcc95c8",
        # "7128646c-4d5f-46af-b0eb-536f2581ec84" # I'll query all users with the email instead
    ]
    
    try:
        # First get the user we know about
        known_user = db.query(User).filter(User.id == ids[0]).first()
        if known_user:
            print(f"\nKNOWN USER ({known_user.id}):")
            print(f"Email: {known_user.email}")
            print(f"Auth: {known_user.auth_provider}")
            print(f"Social ID: {known_user.social_id}")
            
            # Now find any other users with this email (if uniqueness is broken) or similar
            print(f"\nSEARCHING BY EMAIL: {known_user.email}")
            others = db.query(User).filter(User.email == known_user.email).all()
            for u in others:
                print(f"FOUND: {u.id} | {u.email} | {u.auth_provider}")
                
        else:
            print("Known user not found.")

        # Also check the specific ID from the log
        target_id = "7128646c-4d5f-46af-b0eb-536f2581ec84"
        print(f"\nCHECKING LOG ID ({target_id}):")
        other_user = db.query(User).filter(User.id == target_id).first()
        if other_user:
             print(f"FOUND: {other_user.email} | {other_user.auth_provider}")
        else:
             print("User not found.")

    finally:
        db.close()

if __name__ == "__main__":
    main()
