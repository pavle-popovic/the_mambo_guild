"""
Seed V4 Badges
Updates the badge_definitions table with the specific badges required for Pro Retention features.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_db

def seed_badges():
    db = next(get_db())
    print("Seeding V4 Badges...")
    
    badges = [
        # A. The Critic (Reactions Given)
        {"id": "critic_silver", "name": "The Critic", "desc": "Given 10 reactions", "tier": "silver", "type": "reactions_given", "val": 10, "cat": "community"},
        {"id": "critic_gold",   "name": "The Critic", "desc": "Given 50 reactions", "tier": "gold",   "type": "reactions_given", "val": 50, "cat": "community"},
        {"id": "critic_diamond","name": "The Critic", "desc": "Given 100 reactions","tier": "diamond","type": "reactions_given", "val": 100,"cat": "community"},
        
        # B. The Star (Reactions Received)
        {"id": "star_silver", "name": "The Star", "desc": "Received 10 reactions", "tier": "silver", "type": "reactions_received", "val": 10,  "cat": "community"},
        {"id": "star_gold",   "name": "The Star", "desc": "Received 100 reactions","tier": "gold",   "type": "reactions_received", "val": 100, "cat": "community"},
        {"id": "star_diamond","name": "The Star", "desc": "Received 500 reactions","tier": "diamond","type": "reactions_received", "val": 500, "cat": "community"},
        
        # C. El Maestro (Solutions Accepted)
        {"id": "maestro_silver", "name": "El Maestro", "desc": "1 Accepted Solution",  "tier": "silver", "type": "solutions_accepted", "val": 1,  "cat": "community"},
        {"id": "maestro_gold",   "name": "El Maestro", "desc": "10 Accepted Solutions","tier": "gold",   "type": "solutions_accepted", "val": 10, "cat": "community"},
        {"id": "maestro_diamond","name": "El Maestro", "desc": "50 Accepted Solutions","tier": "diamond","type": "solutions_accepted", "val": 50, "cat": "community"},
        
        # D. The Metronome (Streak)
        {"id": "metronome_silver", "name": "The Metronome", "desc": "7 Day Streak",  "tier": "silver", "type": "streak", "val": 7,  "cat": "performance"},
        {"id": "metronome_gold",   "name": "The Metronome", "desc": "30 Day Streak", "tier": "gold",   "type": "streak", "val": 30, "cat": "performance"},
        {"id": "metronome_diamond","name": "The Metronome", "desc": "90 Day Streak", "tier": "diamond","type": "streak", "val": 90, "cat": "performance"},
    ]
    
    try:
        for b in badges:
            # Check if exists
            exists = db.execute(text("SELECT 1 FROM badge_definitions WHERE id = :id"), {"id": b["id"]}).scalar()
            
            if exists:
                print(f"Updating {b['id']}...")
                db.execute(text("""
                    UPDATE badge_definitions 
                    SET name=:name, description=:desc, tier=:tier, requirement_type=:type, threshold=:val, category=:cat
                    WHERE id=:id
                """), {"name": b["name"], "desc": b["desc"], "tier": b["tier"], "type": b["type"], 
                       "val": b["val"], "cat": b["cat"], "id": b["id"]})
            else:
                print(f"Inserting {b['id']}...")
                db.execute(text("""
                    INSERT INTO badge_definitions (id, name, description, tier, requirement_type, threshold, category, icon_url)
                    VALUES (:id, :name, :desc, :tier, :type, :val, :cat, '/badges/placeholder.png')
                """), {"id": b["id"], "name": b["name"], "desc": b["desc"], "tier": b["tier"], 
                       "type": b["type"], "val": b["val"], "cat": b["cat"]})
        
        db.commit()
        print("✅ V4 Badges Seeded Successfully")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding badges: {e}")

if __name__ == "__main__":
    seed_badges()
