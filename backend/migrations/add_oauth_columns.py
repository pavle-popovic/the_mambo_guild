"""
Migration script to add OAuth-related columns to the users table.
Run this script to update the database schema.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine
from config import settings

def run_migration():
    """Add OAuth columns to users table if they don't exist."""
    engine = get_engine()
    
    with engine.connect() as conn:
        # Start a transaction
        trans = conn.begin()
        
        try:
            # Check if columns exist and add them if they don't
            # Check auth_provider
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='auth_provider'
            """))
            if result.fetchone() is None:
                print("Adding auth_provider column...")
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN auth_provider VARCHAR DEFAULT 'email' NOT NULL
                """))
                print("✓ auth_provider column added")
            else:
                print("✓ auth_provider column already exists")
            
            # Check social_id
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='social_id'
            """))
            if result.fetchone() is None:
                print("Adding social_id column...")
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN social_id VARCHAR
                """))
                # Add index
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_users_social_id ON users(social_id)
                """))
                print("✓ social_id column added with index")
            else:
                print("✓ social_id column already exists")
            
            # Check is_verified
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='is_verified'
            """))
            if result.fetchone() is None:
                print("Adding is_verified column...")
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN is_verified BOOLEAN DEFAULT FALSE NOT NULL
                """))
                print("✓ is_verified column added")
            else:
                print("✓ is_verified column already exists")
            
            # Commit the transaction
            trans.commit()
            print("\n✅ Migration completed successfully!")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Migration failed: {e}")
            raise

if __name__ == "__main__":
    print("Running OAuth columns migration...")
    print(f"Database: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else 'N/A'}\n")
    run_migration()

