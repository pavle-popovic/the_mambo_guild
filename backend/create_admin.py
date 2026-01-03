"""
Script to create an admin user.
Run this after initializing the database.
"""
import sys
from sqlalchemy import create_engine, text
from config import settings
from services.auth_service import get_password_hash
import uuid
from datetime import datetime

# Fix Unicode encoding for Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

def create_admin_user():
    """Create an admin user with email admin@themamboinn.com and password admin123."""
    engine = create_engine(settings.DATABASE_URL, echo=False)
    
    try:
        with engine.begin() as conn:
            # Check if admin already exists
            result = conn.execute(text("SELECT id FROM users WHERE email = 'admin@themamboinn.com'"))
            if result.fetchone():
                print("✅ Admin user already exists!")
                print("Email: admin@themamboinn.com")
                print("Password: admin123")
                return
            
            # Create admin user
            admin_id = uuid.uuid4()
            hashed_password = get_password_hash("admin123")
            now = datetime.utcnow()
            
            # Insert user
            conn.execute(text("""
                INSERT INTO users (id, email, hashed_password, role, created_at, updated_at)
                VALUES (:id, :email, :hashed_password, :role, :created_at, :updated_at)
            """), {
                "id": str(admin_id),
                "email": "admin@themamboinn.com",
                "hashed_password": hashed_password,
                "role": "admin",
                "created_at": now,
                "updated_at": now
            })
            
            # Create admin profile
            profile_id = uuid.uuid4()
            conn.execute(text("""
                INSERT INTO user_profiles (id, user_id, first_name, last_name, current_level_tag, xp, level, streak_count)
                VALUES (:id, :user_id, :first_name, :last_name, :current_level_tag, :xp, :level, :streak_count)
            """), {
                "id": str(profile_id),
                "user_id": str(admin_id),
                "first_name": "Admin",
                "last_name": "User",
                "current_level_tag": "Advanced",
                "xp": 0,
                "level": 1,
                "streak_count": 0
            })
            
            # Create subscription (PRO tier for admin)
            subscription_id = uuid.uuid4()
            conn.execute(text("""
                INSERT INTO subscriptions (id, user_id, tier, status)
                VALUES (:id, :user_id, :tier, :status)
            """), {
                "id": str(subscription_id),
                "user_id": str(admin_id),
                "tier": "pro",
                "status": "active"
            })
            
            print("✅ Admin user created successfully!")
            print("Email: admin@themamboinn.com")
            print("Password: admin123")
            print("Role: ADMIN")
                
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_admin_user()
