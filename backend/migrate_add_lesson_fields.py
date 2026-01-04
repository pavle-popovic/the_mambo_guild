"""
Migration script to add week_number, day_number, and content_json fields to lessons table.
Run this after updating the model to add the new columns to the database.
"""
from sqlalchemy import create_engine, text
from config import settings

def migrate():
    """Add new columns to lessons table."""
    engine = create_engine(settings.DATABASE_URL, echo=True)
    
    try:
        with engine.begin() as conn:
            # Check if columns already exist
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'lessons' AND column_name IN ('week_number', 'day_number', 'content_json')
            """))
            existing_columns = {row[0] for row in result}
            
            # Add week_number if it doesn't exist
            if 'week_number' not in existing_columns:
                print("Adding week_number column...")
                conn.execute(text("""
                    ALTER TABLE lessons 
                    ADD COLUMN week_number INTEGER
                """))
                # Create index for sorting
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_lessons_week_number ON lessons(week_number)
                """))
                print("✓ Added week_number column")
            
            # Add day_number if it doesn't exist
            if 'day_number' not in existing_columns:
                print("Adding day_number column...")
                conn.execute(text("""
                    ALTER TABLE lessons 
                    ADD COLUMN day_number INTEGER
                """))
                # Create index for sorting
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_lessons_day_number ON lessons(day_number)
                """))
                print("✓ Added day_number column")
            
            # Add content_json if it doesn't exist
            if 'content_json' not in existing_columns:
                print("Adding content_json column...")
                conn.execute(text("""
                    ALTER TABLE lessons 
                    ADD COLUMN content_json JSONB
                """))
                print("✓ Added content_json column")
            
            print("\n✅ Migration completed successfully!")
            
    except Exception as e:
        print(f"❌ Migration error: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    migrate()

