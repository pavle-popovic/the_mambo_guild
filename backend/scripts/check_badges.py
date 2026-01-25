
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import get_session_local
from models.community import BadgeDefinition, UserBadge

def check():
    SessionLocal = get_session_local()
    db = SessionLocal()
    try:
        count = db.query(BadgeDefinition).count()
        print(f"Total BadgeDefinitions: {count}")
        badges = db.query(BadgeDefinition).all()
        for b in badges:
            print(f"- {b.name} ({b.id})")
            
        print("-" * 20)
        user_badges_count = db.query(UserBadge).count()
        print(f"Total UserBadges assigned: {user_badges_count}")
        
    finally:
        db.close()

if __name__ == "__main__":
    check()
