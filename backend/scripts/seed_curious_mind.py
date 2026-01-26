import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import get_session_local
from models.community import BadgeDefinition

def seed_curious_mind():
    SessionLocal = get_session_local()
    db = SessionLocal()
    
    try:
        # Check if curious_mind badges already exist
        existing = db.query(BadgeDefinition).filter(
            BadgeDefinition.id.like("curious_mind%")
        ).count()
        
        if existing > 0:
            print(f"Curious Mind badges already exist ({existing} found). Skipping.")
            return
        
        print("Adding Curious Mind badges...")
        
        badges = [
            {
                "id": "curious_mind_bronze",
                "name": "Curious Mind",
                "description": "Asking for help and learning from others. First question.",
                "tier": "Bronze",
                "category": "community",
                "requirement_type": "questions_posted",
                "threshold": 1
            },
            {
                "id": "curious_mind_silver",
                "name": "Curious Mind",
                "description": "Asking for help and learning from others. Regular learner.",
                "tier": "Silver",
                "category": "community",
                "requirement_type": "questions_posted",
                "threshold": 10
            },
            {
                "id": "curious_mind_gold",
                "name": "Curious Mind",
                "description": "Asking for help and learning from others. Deep diver.",
                "tier": "Gold",
                "category": "community",
                "requirement_type": "questions_posted",
                "threshold": 25
            },
            {
                "id": "curious_mind_diamond",
                "name": "Curious Mind",
                "description": "Asking for help and learning from others. Master inquirer.",
                "tier": "Diamond",
                "category": "community",
                "requirement_type": "questions_posted",
                "threshold": 50
            }
        ]
        
        for badge_data in badges:
            badge = BadgeDefinition(**badge_data)
            db.add(badge)
            print(f"  + {badge.name} ({badge.id})")
        
        db.commit()
        print("\nCurious Mind badges added successfully!")
        
    finally:
        db.close()

if __name__ == "__main__":
    seed_curious_mind()
