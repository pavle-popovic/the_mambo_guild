
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine

def migrate():
    engine = get_engine()
    with engine.connect() as conn:
        print("Checking user_badges...")
        try:
            conn.execute(text("ALTER TABLE user_badges ADD COLUMN display_order INTEGER DEFAULT 0"))
            print("✅ Added display_order column to user_badges.")
        except Exception as e:
            print(f"⚠️  user_badges note: {e}")

        print("Checking badge_definitions...")
        try:
            conn.execute(text("ALTER TABLE badge_definitions ADD COLUMN threshold INTEGER DEFAULT 0"))
            print("✅ Added threshold column to badge_definitions.")
        except Exception as e:
            print(f"⚠️  badge_definitions note: {e}")
            
        conn.commit()

if __name__ == "__main__":
    migrate()
