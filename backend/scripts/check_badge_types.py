import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import get_session_local
from models.community import BadgeDefinition

def check_missing_badges():
    SessionLocal = get_session_local()
    db = SessionLocal()
    
    try:
        print("=== BADGE REQUIREMENT TYPES ===\n")
        
        # Get all badges and group by requirement_type
        badges = db.query(BadgeDefinition).order_by(BadgeDefinition.requirement_type, BadgeDefinition.threshold).all()
        
        req_types = {}
        for badge in badges:
            req_type = badge.requirement_type
            if req_type not in req_types:
                req_types[req_type] = []
            req_types[req_type].append(f"{badge.name} ({badge.id}) - Threshold: {badge.threshold}")
        
        for req_type, badge_list in sorted(req_types.items()):
            print(f"\n{req_type}:")
            for b in badge_list:
                print(f"  - {b}")
        
        print("\n" + "="*50)
        print("Missing requirement types that need tracking:")
        print("="*50)
        
        needed_types = {
            "videos_posted": "Posts with post_type='stage' and mux_asset_id is not null",
            "questions_posted": "Posts with post_type='lab'",
            "comments_posted": "PostReply count"
        }
        
        for req_type, implementation_note in needed_types.items():
            exists = req_type in req_types
            status = "EXISTS" if exists else "MISSING"
            print(f"\n{status}: {req_type}")
            print(f"  Implementation: {implementation_note}")
            if exists:
                print(f"  Badges: {len(req_types[req_type])}")
        
    finally:
        db.close()

if __name__ == "__main__":
    check_missing_badges()
