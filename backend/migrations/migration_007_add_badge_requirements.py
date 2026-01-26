
from sqlalchemy import text
from models import get_engine

def run_migration():
    """
    Migration: Add requirements (JSONB) to badge_definitions
    """
    engine = get_engine()
    
    with engine.connect() as conn:
        print("Running Migration 007: Add Badge Requirements...")
        
        try:
            # Add requirements column
            conn.execute(text("ALTER TABLE badge_definitions ADD COLUMN requirements JSONB DEFAULT '{}'"))
            print("✓ Added requirements column")
        except Exception as e:
            if "duplicate column" in str(e) or "already exists" in str(e):
                print("✓ requirements column already exists")
            else:
                raise e

        try:
            # Add tier column
            conn.execute(text("ALTER TABLE badge_definitions ADD COLUMN tier VARCHAR(20)"))
            print("✓ Added tier column")
        except Exception as e:
            if "duplicate column" in str(e) or "already exists" in str(e):
                print("✓ tier column already exists")
            else:
                raise e

        conn.commit()
        print("✅ Migration 007 completed successfully!")

if __name__ == "__main__":
    run_migration()
