import sys
import os

# Add parent directory to path so we can import models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import get_session_local, CommunityTag

def update_tags():
    SessionLocal = get_session_local()
    db = SessionLocal()
    try:
        tags_data = [
            # Styles
            {"slug": "salsa-on2", "name": "Salsa On2", "category": "Style"},
            {"slug": "mambo", "name": "Mambo", "category": "Style"},
            {"slug": "cha-cha-cha", "name": "Cha Cha Cha", "category": "Style"},
            {"slug": "boogaloo", "name": "Boogaloo", "category": "Style"},
            {"slug": "pachanga", "name": "Pachanga", "category": "Style"},
            {"slug": "salsa-fusion", "name": "Salsa Fusion", "category": "Style"},
            
            # Focus
            {"slug": "timing", "name": "Timing", "category": "Focus"},
            {"slug": "body-movement", "name": "Body Movement", "category": "Focus"},
            {"slug": "styling", "name": "Styling", "category": "Focus"},
            {"slug": "musicality", "name": "Musicality", "category": "Focus"},
            {"slug": "choreo", "name": "Choreo", "category": "Focus"},
            {"slug": "turn", "name": "Turn", "category": "Focus"},
            {"slug": "drills", "name": "Drills", "category": "Focus"},
            
            # Level
            {"slug": "beginner", "name": "Beginner", "category": "Level"},
            {"slug": "intermediate", "name": "Intermediate", "category": "Level"},
            {"slug": "advanced", "name": "Advanced", "category": "Level"},
        ]

        print(f"Updating {len(tags_data)} tags...")
        
        for tag in tags_data:
            existing = db.query(CommunityTag).filter(CommunityTag.slug == tag["slug"]).first()
            if not existing:
                print(f"Creating {tag['name']}...")
                new_tag = CommunityTag(
                    slug=tag["slug"],
                    name=tag["name"],
                    category=tag["category"],
                    usage_count=0
                )
                db.add(new_tag)
            else:
                print(f"Updating {tag['name']}...")
                existing.name = tag["name"]
                existing.category = tag["category"]
        
        db.commit()
        print("Tags updated successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_tags()
