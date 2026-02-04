"""Seed Guild Master and Pro Member badges and award to subscribers."""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_db

def seed_badges():
    db = next(get_db())
    
    try:
        # Create/Update subscription badges
        db.execute(text("""
            INSERT INTO badge_definitions (id, name, description, tier, category, requirement_type, threshold, icon_url, created_at)
            VALUES 
                ('pro_member', 'Pro Member', 'A dedicated dancer investing in their craft. Welcome to the Pro family!', 'Gold', 'community', 'subscription_tier', 1, '/badges/pro_member.png', NOW()),
                ('guild_master', 'Guild Master', 'The elite of the elite. A true patron of the Mambo Guild with exclusive access to all features.', 'Diamond', 'community', 'subscription_tier', 2, '/badges/guild_master.png', NOW())
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                tier = EXCLUDED.tier
        """))
        db.commit()
        print('✅ Subscription badges created/updated!')
        
        # Verify
        result = db.execute(text("SELECT id, name, tier FROM badge_definitions WHERE id IN ('pro_member', 'guild_master')"))
        for b in result.fetchall():
            print(f'  ✓ {b}')
            
    except Exception as e:
        db.rollback()
        print(f'Error: {e}')
    finally:
        db.close()


def award_badges_to_subscribers():
    """Award badges to existing subscribers."""
    db = next(get_db())
    
    try:
        # Find all performer tier users
        result = db.execute(text("""
            SELECT u.id, u.email, s.tier 
            FROM users u 
            JOIN subscriptions s ON u.id = s.user_id 
            WHERE s.tier = 'performer' AND s.status = 'active'
        """))
        performers = result.fetchall()
        print(f'Found {len(performers)} Guild Master (performer) tier users')
        
        for user in performers:
            user_id = str(user[0])
            email = user[1]
            
            # Check if already has badge
            existing = db.execute(text(
                "SELECT id FROM user_badges WHERE user_id = :uid AND badge_id = 'guild_master'"
            ), {'uid': user_id}).fetchone()
            
            if not existing:
                db.execute(text("""
                    INSERT INTO user_badges (id, user_id, badge_id, earned_at, display_order)
                    VALUES (gen_random_uuid(), :uid, 'guild_master', NOW(), 0)
                """), {'uid': user_id})
                print(f'  ✓ Awarded Guild Master badge to {email}')
            else:
                print(f'  - {email} already has Guild Master badge')
        
        # Find all advanced tier users
        result = db.execute(text("""
            SELECT u.id, u.email, s.tier 
            FROM users u 
            JOIN subscriptions s ON u.id = s.user_id 
            WHERE s.tier = 'advanced' AND s.status = 'active'
        """))
        advanced_users = result.fetchall()
        print(f'Found {len(advanced_users)} Pro (advanced) tier users')
        
        for user in advanced_users:
            user_id = str(user[0])
            email = user[1]
            
            existing = db.execute(text(
                "SELECT id FROM user_badges WHERE user_id = :uid AND badge_id = 'pro_member'"
            ), {'uid': user_id}).fetchone()
            
            if not existing:
                db.execute(text("""
                    INSERT INTO user_badges (id, user_id, badge_id, earned_at, display_order)
                    VALUES (gen_random_uuid(), :uid, 'pro_member', NOW(), 0)
                """), {'uid': user_id})
                print(f'  ✓ Awarded Pro Member badge to {email}')
            else:
                print(f'  - {email} already has Pro Member badge')
        
        db.commit()
        print('✅ Done awarding badges!')
            
    except Exception as e:
        db.rollback()
        print(f'Error: {e}')
    finally:
        db.close()


if __name__ == "__main__":
    seed_badges()
    award_badges_to_subscribers()
