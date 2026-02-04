"""
Migration 009: Add Secure Downloads Tracking and Streak Freezes

New columns on user_profiles:
- downloads_today: Integer tracking daily download count
- last_download_date: Date of last download (for daily reset)
- weekly_free_freeze_used: Boolean for weekly freebie tracking
- inventory_freezes: Integer count of purchased freezes
- last_freeze_reset_date: Date of last weekly freeze reset
"""

from sqlalchemy import text
from models import get_db


def upgrade():
    """Add new columns to user_profiles for downloads and streak freezes."""
    db = next(get_db())
    
    try:
        # Add download tracking columns
        db.execute(text("""
            ALTER TABLE user_profiles 
            ADD COLUMN IF NOT EXISTS downloads_today INTEGER NOT NULL DEFAULT 0;
        """))
        
        db.execute(text("""
            ALTER TABLE user_profiles 
            ADD COLUMN IF NOT EXISTS last_download_date DATE;
        """))
        
        # Add streak freeze columns
        db.execute(text("""
            ALTER TABLE user_profiles 
            ADD COLUMN IF NOT EXISTS weekly_free_freeze_used BOOLEAN NOT NULL DEFAULT FALSE;
        """))
        
        db.execute(text("""
            ALTER TABLE user_profiles 
            ADD COLUMN IF NOT EXISTS inventory_freezes INTEGER NOT NULL DEFAULT 0;
        """))
        
        db.execute(text("""
            ALTER TABLE user_profiles 
            ADD COLUMN IF NOT EXISTS last_freeze_reset_date DATE;
        """))
        
        db.commit()
        print("✅ Migration 009: Added downloads_today, last_download_date, weekly_free_freeze_used, inventory_freezes, last_freeze_reset_date to user_profiles")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Migration 009 failed: {e}")
        raise
    finally:
        db.close()


def downgrade():
    """Remove the added columns."""
    db = next(get_db())
    
    try:
        db.execute(text("ALTER TABLE user_profiles DROP COLUMN IF EXISTS downloads_today;"))
        db.execute(text("ALTER TABLE user_profiles DROP COLUMN IF EXISTS last_download_date;"))
        db.execute(text("ALTER TABLE user_profiles DROP COLUMN IF EXISTS weekly_free_freeze_used;"))
        db.execute(text("ALTER TABLE user_profiles DROP COLUMN IF EXISTS inventory_freezes;"))
        db.execute(text("ALTER TABLE user_profiles DROP COLUMN IF EXISTS last_freeze_reset_date;"))
        
        db.commit()
        print("✅ Migration 009 downgrade: Removed download and freeze columns from user_profiles")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Migration 009 downgrade failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "downgrade":
        downgrade()
    else:
        upgrade()
