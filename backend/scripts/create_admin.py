"""
Script to create an admin user.
Run this after initializing the database.
"""
import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from config import settings
from services.auth_service import get_password_hash
from models.user import UserRole, CurrentLevelTag
import uuid
from datetime import datetime

# Fix Unicode encoding for Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

def create_admin_user():
    """Create an admin user with credentials from environment variables."""
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not admin_email or not admin_password:
        print("❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set.")
        print("   Example: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=securepass python scripts/create_admin.py")
        return

    engine = create_engine(settings.DATABASE_URL, echo=False)

    try:
        with engine.begin() as conn:
            # Check if admin already exists
            result = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": admin_email})
            if result.fetchone():
                print("✅ Admin user already exists!")
                return

            # Create admin user
            admin_id = uuid.uuid4()
            hashed_password = get_password_hash(admin_password)
            now = datetime.utcnow()
            
            # Insert user
            conn.execute(text("""
                INSERT INTO users (id, email, hashed_password, role, created_at, updated_at, auth_provider, is_verified)
                VALUES (:id, :email, :hashed_password, :role, :created_at, :updated_at, :auth_provider, :is_verified)
            """), {
                "id": str(admin_id),
                "email": admin_email,
                "hashed_password": hashed_password,
                "role": "ADMIN",  # Database enum uses UPPERCASE
                "created_at": now,
                "updated_at": now,
                "auth_provider": "email",
                "is_verified": True
            })
            
            # Create admin profile
            profile_id = uuid.uuid4()
            conn.execute(text("""
                INSERT INTO user_profiles (id, user_id, first_name, last_name, current_level_tag, xp, level, streak_count, badges, current_claves, reputation)
                VALUES (:id, :user_id, :first_name, :last_name, :current_level_tag, :xp, :level, :streak_count, :badges, :current_claves, :reputation)
            """), {
                "id": str(profile_id),
                "user_id": str(admin_id),
                "first_name": "Admin",
                "last_name": "User",
                "current_level_tag": "ADVANCED",  # Database enum uses UPPERCASE
                "xp": 0,
                "level": 1,
                "streak_count": 0,
                "badges": "[]",
                "current_claves": 0,
                "reputation": 0
            })
            
            # Create subscription (PRO tier for admin)
            subscription_id = uuid.uuid4()
            conn.execute(text("""
                INSERT INTO subscriptions (id, user_id, tier, status)
                VALUES (:id, :user_id, :tier, :status)
            """), {
                "id": str(subscription_id),
                "user_id": str(admin_id),
                "tier": "performer",  # Database enum uses lowercase
                "status": "active"    # Database enum uses lowercase
            })
            
            print("✅ Admin user created successfully!")
            print(f"Email: {admin_email}")
            print("Role: ADMIN")
                
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_admin_user()
