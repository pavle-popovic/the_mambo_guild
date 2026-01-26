import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import get_session_local
from models.community import BadgeDefinition, UserBadge, UserStats
from models.user import UserProfile

def diagnose():
    SessionLocal = get_session_local()
    db = SessionLocal()
    try:
        print("=== BADGE DIAGNOSTIC ===\n")
        
        # 1. Check Unstoppable badge definitions
        print("1. Unstoppable Badge Definitions:")
        unstoppable_badges = db.query(BadgeDefinition).filter(
            BadgeDefinition.name == "Unstoppable"
        ).order_by(BadgeDefinition.threshold).all()
        
        for badge in unstoppable_badges:
            print(f"  - {badge.id}")
            print(f"    Requirement Type: {badge.requirement_type}")
            print(f"    Threshold: {badge.threshold}")
            print(f"    Tier: {badge.tier}")
            print()
        
        # 2. Check user stats (assuming first user for now, adjust if needed)
        print("2. User Stats:")
        users = db.query(UserProfile).all()
        for user in users[:3]:  # Check first 3 users
            stats = db.query(UserStats).filter(UserStats.user_id == user.user_id).first()
            print(f"  User: {user.first_name} {user.last_name} ({user.user_id})")
            print(f"    Streak (profile): {user.streak_count}")
            if stats:
                print(f"    Reactions Given: {stats.reactions_given_count}")
                print(f"    Reactions Received: {stats.reactions_received_count}")
                print(f"    Solutions Accepted: {stats.solutions_accepted_count}")
            
            # Check awarded badges
            user_badges = db.query(UserBadge).filter(UserBadge.user_id == user.user_id).all()
            print(f"    Badges Earned: {len(user_badges)}")
            for ub in user_badges:
                badge = db.query(BadgeDefinition).filter(BadgeDefinition.id == ub.badge_id).first()
                if badge:
                    print(f"      - {badge.name} ({badge.id})")
            print()
        
        # 3. Check what should be awarded
        print("3. Checking Badge Eligibility:")
        for user in users[:3]:
            print(f"  User: {user.first_name} ({user.user_id})")
            streak = user.streak_count
            
            # Check unstoppable badges
            eligible = db.query(BadgeDefinition).filter(
                BadgeDefinition.name == "Unstoppable",
                BadgeDefinition.threshold <= streak
            ).all()
            
            for badge in eligible:
                has_it = db.query(UserBadge).filter(
                    UserBadge.user_id == user.user_id,
                    UserBadge.badge_id == badge.id
                ).first()
                
                status = "✓ HAS" if has_it else "✗ MISSING"
                print(f"    {status} {badge.id} (threshold: {badge.threshold}, user streak: {streak})")
            print()
            
    finally:
        db.close()

if __name__ == "__main__":
    diagnose()
