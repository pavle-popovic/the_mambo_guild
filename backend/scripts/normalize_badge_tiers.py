"""
Normalize badge tier values to lowercase to match BadgeTier enum.
The seed script uses Capitalized values (Bronze, Silver, Gold, Diamond)
but the SQLAlchemy enum uses lowercase. This script normalizes them.
"""
import os
import sys
from dotenv import load_dotenv

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(project_root, '.env'))
sys.path.insert(0, project_root)

from sqlalchemy import text
from models import get_engine


def normalize():
    engine = get_engine()
    with engine.connect() as conn:
        # Normalize tier values to lowercase
        result = conn.execute(text("""
            UPDATE badge_definitions
            SET tier = LOWER(tier)
            WHERE tier != LOWER(tier)
        """))
        count = result.rowcount
        conn.commit()

        if count > 0:
            print(f"✅ Normalized {count} badge tier values to lowercase.")
        else:
            print("✅ All badge tiers already normalized.")


if __name__ == "__main__":
    normalize()
