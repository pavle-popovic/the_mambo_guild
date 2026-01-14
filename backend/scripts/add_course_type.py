"""
Add course_type column to worlds table.
This migration adds support for differentiating between Courses, Choreos, and Topics.
"""
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text, create_engine

def get_db_url():
    """Get database URL from environment."""
    return os.environ.get(
        "DATABASE_URL",
        "postgresql://admin:admin@localhost:5432/themamboinn"
    )

def add_course_type_column():
    """Add course_type column to worlds table if it doesn't exist."""
    engine = create_engine(get_db_url())
    
    with engine.connect() as conn:
        # Check if column already exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'worlds' AND column_name = 'course_type'
        """))
        
        if result.fetchone():
            print("✅ course_type column already exists!")
            return
        
        # Add the column
        print("Adding course_type column to worlds table...")
        conn.execute(text("""
            ALTER TABLE worlds 
            ADD COLUMN course_type VARCHAR(20) NOT NULL DEFAULT 'course'
        """))
        conn.commit()
        
        print("✅ course_type column added successfully!")
        print("\nAll existing courses have been set to type 'course' by default.")
        print("You can now tag courses as 'course', 'choreo', or 'topic' in the admin builder.")


if __name__ == "__main__":
    add_course_type_column()
