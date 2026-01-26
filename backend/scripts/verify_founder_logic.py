
import os
import sys
import requests
import uuid
import time
from dotenv import load_dotenv

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(project_root, '.env')
load_dotenv(env_path)

# backend path
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_path)

from sqlalchemy import text
from models import get_engine

def verify_logic():
    engine = get_engine()
    
    from services import badge_service
    from models.user import User
    from models.community import UserBadge, BadgeDefinition
    from sqlalchemy.orm import sessionmaker
    
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    print("🧪 Verifying Founder Badge Logic...")
    
    test_email = f"founder_test_{int(time.time())}@example.com"
    user_id = str(uuid.uuid4())
    
    try:
        print(f"1. Creating test user {test_email}...")
        # Create user first to satisfy foreign key
        new_user = User(
            id=user_id,
            email=test_email,
            is_verified=True, 
            role="student",
            auth_provider="email"
        )
        db.add(new_user)
        db.flush() 
        
        # Test: Can we award 'founder_diamond'?
        print("2. Attempting to award 'founder_diamond'...")
        
        founder_badge = db.query(BadgeDefinition).filter(BadgeDefinition.id == "founder_diamond").first()
        
        if not founder_badge:
            print("❌ 'founder_diamond' definition NOT FOUND in DB.")
            return

        print(f"   Found definition: {founder_badge.name}")
        
        # Execute Award
        badge_service.award_badge(user_id, founder_badge, db)
        db.commit()
        
        # Verify
        print("3. Verifying database entry...")
        user_badge = db.query(UserBadge).filter(UserBadge.user_id == user_id, UserBadge.badge_id == "founder_diamond").first()
        
        if user_badge:
            print(f"✅ SUCCESS! User {user_id} has badge 'founder_diamond'.")
            print(f"   Earned at: {user_badge.earned_at}")
        else:
            print("❌ FAILURE! Badge not found in UserBadge table.")
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        db.rollback()
    finally:
        # Cleanup
        print("4. Cleaning up test data...")
        try:
            db.execute(text("DELETE FROM user_badges WHERE user_id = :uid"), {"uid": user_id})
            db.execute(text("DELETE FROM users WHERE id = :uid"), {"uid": user_id})
            db.commit()
            print("🧹 Cleanup complete.")
        except Exception as e:
             print(f"⚠️ Cleanup failed: {e}")
        db.close()

if __name__ == "__main__":
    verify_logic()
