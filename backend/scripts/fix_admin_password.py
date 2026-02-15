"""
Fix admin user password by creating a proper bcrypt hash.
"""
import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from config import settings
from services.auth_service import get_password_hash

# Fix Unicode encoding for Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

def fix_admin_password():
    """Update admin user password with proper bcrypt hash."""
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not admin_email or not admin_password:
        print("❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set.")
        print("   Example: ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=securepass python scripts/fix_admin_password.py")
        return

    engine = create_engine(settings.DATABASE_URL, echo=False)

    try:
        with engine.begin() as conn:
            # Check if admin exists
            result = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": admin_email})
            admin_row = result.fetchone()

            if not admin_row:
                print("Admin user not found. Creating...")
                admin_id = conn.execute(text("SELECT gen_random_uuid()")).scalar()
                hashed_password = get_password_hash(admin_password)

                conn.execute(text("""
                    INSERT INTO users (id, email, hashed_password, role, created_at, updated_at)
                    VALUES (:id, :email, :password, 'admin', NOW(), NOW())
                """), {"id": admin_id, "email": admin_email, "password": hashed_password})
                print("✅ Admin user created with proper password hash")
            else:
                print("Admin user found. Updating password...")
                hashed_password = get_password_hash(admin_password)

                conn.execute(text("""
                    UPDATE users
                    SET hashed_password = :password, updated_at = NOW()
                    WHERE email = :email
                """), {"password": hashed_password, "email": admin_email})
                print("✅ Admin password updated with proper bcrypt hash")

            print(f"\nAdmin email: {admin_email}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    fix_admin_password()
