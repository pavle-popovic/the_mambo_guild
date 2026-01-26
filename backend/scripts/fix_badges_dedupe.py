import sys
import os

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import get_session_local
from models.community import BadgeDefinition, UserBadge

def fix_badges():
    SessionLocal = get_session_local()
    db = SessionLocal()
    try:
        print("Starting Badge Deduplication...")
        
        # We want to KEEP underscore versions (e.g. 'firestarter_bronze')
        # We want to REMOVE hyphen versions (e.g. 'firestarter-bronze')
        
        # 1. Find all hyphenated badges
        bad_badges = db.query(BadgeDefinition).filter(BadgeDefinition.id.like("%-%")).all()
        
        print(f"Found {len(bad_badges)} badges with hyphens (candidates for removal).")
        
        for bad_badge in bad_badges:
            # Construct the expected "good" ID
            good_id = bad_badge.id.replace("-", "_")
            
            # Check if good badge exists
            good_badge = db.query(BadgeDefinition).filter(BadgeDefinition.id == good_id).first()
            
            if good_badge:
                print(f"Processing duplicate: {bad_badge.id} -> {good_id}")
                
                # 2. Migrate UserBadges
                user_badges_to_migrate = db.query(UserBadge).filter(UserBadge.badge_id == bad_badge.id).all()
                for ub in user_badges_to_migrate:
                    # Check if user already has the good badge
                    existing_good_ub = db.query(UserBadge).filter(
                        UserBadge.user_id == ub.user_id,
                        UserBadge.badge_id == good_id
                    ).first()
                    
                    if not existing_good_ub:
                        print(f"  Migrating user {ub.user_id} badge award to {good_id}")
                        ub.badge_id = good_id
                    else:
                        print(f"  User {ub.user_id} already has {good_id}, deleting duplicate award.")
                        db.delete(ub)
                
                # 3. Delete the bad definition
                print(f"  Deleting BadgeDefinition: {bad_badge.id}")
                db.delete(bad_badge)
            else:
                print(f"Warning: Found hyphenated badge {bad_badge.id} but NO matching underscore version {good_id}. Skipping delete.")
        
        db.commit()
        print("Deduplication complete!")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_badges()
