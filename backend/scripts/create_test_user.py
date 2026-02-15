"""
Script to create a test user with Advanced subscription tier.
Run this from the backend directory: python scripts/create_test_user.py
"""
import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from sqlalchemy import text
from models.user import User, UserProfile, Subscription, UserRole, CurrentLevelTag, SubscriptionStatus, SubscriptionTier
from models import get_db, get_engine
from services.auth_service import get_password_hash
import uuid
from datetime import datetime

def create_test_user():
    """Create a test user with Advanced subscription."""
    engine = get_engine()
    db = Session(engine)
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == "test.advanced@example.com").first()
        if existing_user:
            print(f"User with email 'test.advanced@example.com' already exists!")
            print(f"User ID: {existing_user.id}")
            # Update subscription to Advanced if not already
            if existing_user.subscription:
                if existing_user.subscription.tier != SubscriptionTier.ADVANCED:
                    existing_user.subscription.tier = SubscriptionTier.ADVANCED
                    existing_user.subscription.status = SubscriptionStatus.ACTIVE
                    db.commit()
                    print("Updated subscription to Advanced tier.")
                else:
                    print("User already has Advanced subscription.")
            return existing_user
        
        # Create user
        user_id = uuid.uuid4()
        hashed_password = get_password_hash("testpassword123")
        
        user = User(
            id=user_id,
            email="test.advanced@example.com",
            hashed_password=hashed_password,
            auth_provider="email",
            is_verified=True,
            role=UserRole.STUDENT
        )
        db.add(user)
        db.flush()
        
        # Create user profile
        profile = UserProfile(
            id=uuid.uuid4(),
            user_id=user_id,
            first_name="Test",
            last_name="Advanced",
            current_level_tag=CurrentLevelTag.BEGINNER,
            xp=0,
            level=1,
            streak_count=0
        )
        db.add(profile)
        
        # Create Advanced subscription
        subscription = Subscription(
            id=uuid.uuid4(),
            user_id=user_id,
            tier=SubscriptionTier.ROOKIE,  # Set default first
            status=SubscriptionStatus.ACTIVE,
            current_period_end=datetime.utcnow()
        )
        db.add(subscription)
        db.flush()  # Flush to get the ID
        
        # Update tier using raw SQL - database enum uses uppercase
        db.execute(text("UPDATE subscriptions SET tier = 'ADVANCED' WHERE id = :sub_id"), {"sub_id": str(subscription.id)})
        db.add(subscription)
        
        db.commit()
        db.refresh(user)
        
        print("=" * 50)
        print("Test user created successfully!")
        print("=" * 50)
        print(f"Email: test.advanced@example.com")
        print(f"Password: testpassword123")
        print(f"Tier: Advanced")
        print(f"User ID: {user.id}")
        print("=" * 50)
        
        return user
        
    except Exception as e:
        db.rollback()
        print(f"Error creating test user: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
