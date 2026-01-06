"""
Migration script to make hashed_password nullable in the users table.
This is required for OAuth users who don't have passwords.
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
    """Make hashed_password nullable in users table."""
    engine = get_engine()
    
    with engine.connect() as conn:
        # Start a transaction
        trans = conn.begin()
        
        try:
            # Check if column is already nullable
            result = conn.execute(text("""
                SELECT is_nullable 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='hashed_password'
            """))
            row = result.fetchone()
            
            if row is None:
                print("⚠️  hashed_password column not found - this is unexpected")
            elif row[0] == 'YES':
                print("✓ hashed_password column is already nullable")
            else:
                print("Making hashed_password column nullable...")
                # First, set any NULL values to an empty string (shouldn't happen, but safety first)
                # Then alter the column to allow NULL
                conn.execute(text("""
                    ALTER TABLE users 
                    ALTER COLUMN hashed_password DROP NOT NULL
                """))
                print("✓ hashed_password column is now nullable")
            
            # Commit the transaction
            trans.commit()
            print("\n✅ Migration completed successfully!")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Migration failed: {e}")
            raise

if __name__ == "__main__":
    print("Running hashed_password nullable migration...")
    print(f"Database: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else 'N/A'}\n")
    run_migration()

