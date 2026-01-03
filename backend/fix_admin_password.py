"""
Fix admin user password by creating a proper bcrypt hash.
"""
import sys
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
    engine = create_engine(settings.DATABASE_URL, echo=False)
    
    try:
        with engine.begin() as conn:
            # Check if admin exists
            result = conn.execute(text("SELECT id FROM users WHERE email = 'admin@themamboinn.com'"))
            admin_row = result.fetchone()
            
            if not admin_row:
                print("Admin user not found. Creating...")
                admin_id = conn.execute(text("SELECT gen_random_uuid()")).scalar()
                hashed_password = get_password_hash("admin123")
                
                conn.execute(text("""
                    INSERT INTO users (id, email, hashed_password, role, created_at, updated_at)
                    VALUES (:id, 'admin@themamboinn.com', :password, 'admin', NOW(), NOW())
                """), {"id": admin_id, "password": hashed_password})
                print("✅ Admin user created with proper password hash")
            else:
                print("Admin user found. Updating password...")
                hashed_password = get_password_hash("admin123")
                
                conn.execute(text("""
                    UPDATE users 
                    SET hashed_password = :password, updated_at = NOW()
                    WHERE email = 'admin@themamboinn.com'
                """), {"password": hashed_password})
                print("✅ Admin password updated with proper bcrypt hash")
            
            print("\nAdmin credentials:")
            print("  Email: admin@themamboinn.com")
            print("  Password: admin123")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    fix_admin_password()

