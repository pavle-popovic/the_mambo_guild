
import sys
import os

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session

from models import get_session_local
from models.community import BadgeDefinition, BadgeTier, BadgeCategory

def get_db():
    SessionLocal = get_session_local()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def seed_badges():
    SessionLocal = get_session_local()
    db = SessionLocal()
    
    badges = [
        # --- The Metronome (Streak) ---
        {
            "id": "metronome_bronze", "name": "The Metronome I", "description": "Maintain a 3-day login streak.",
            "tier": "bronze", "category": "performance", "requirement_type": "streak", "threshold": 3, "icon_url": "/badges/metronome_style.png"
        },
        {
            "id": "metronome_silver", "name": "The Metronome II", "description": "Maintain a 7-day login streak.",
            "tier": "silver", "category": "performance", "requirement_type": "streak", "threshold": 7, "icon_url": "/badges/metronome_style.png"
        },
        {
            "id": "metronome_gold", "name": "The Metronome III", "description": "Maintain a 14-day login streak.",
            "tier": "gold", "category": "performance", "requirement_type": "streak", "threshold": 14, "icon_url": "/badges/metronome_style.png"
        },
        {
            "id": "metronome_platinum", "name": "The Metronome IV", "description": "Maintain a 30-day login streak.",
            "tier": "platinum", "category": "performance", "requirement_type": "streak", "threshold": 30, "icon_url": "/badges/metronome_style.png"
        },
        {
            "id": "metronome_diamond", "name": "The Metronome V", "description": "Maintain a 90-day login streak.",
            "tier": "diamond", "category": "performance", "requirement_type": "streak", "threshold": 90, "icon_url": "/badges/metronome_style.png"
        },

        # --- The Critic (Reactions Given) ---
        {
            "id": "critic_bronze", "name": "The Critic I", "description": "Give 10 reactions to community posts.",
            "tier": "bronze", "category": "community", "requirement_type": "reactions_given", "threshold": 10, "icon_url": "/badges/critic_style.png"
        },
        {
            "id": "critic_silver", "name": "The Critic II", "description": "Give 50 reactions to community posts.",
            "tier": "silver", "category": "community", "requirement_type": "reactions_given", "threshold": 50, "icon_url": "/badges/critic_style.png"
        },
        {
            "id": "critic_gold", "name": "The Critic III", "description": "Give 200 reactions to community posts.",
            "tier": "gold", "category": "community", "requirement_type": "reactions_given", "threshold": 200, "icon_url": "/badges/critic_style.png"
        },

        # --- The Star (Reactions Received) ---
        {
            "id": "star_bronze", "name": "Rising Star", "description": "Receive 10 reactions on your posts.",
            "tier": "bronze", "category": "community", "requirement_type": "reactions_received", "threshold": 10, "icon_url": "/badges/star_style.png"
        },
        {
            "id": "star_silver", "name": "Shining Star", "description": "Receive 50 reactions on your posts.",
            "tier": "silver", "category": "community", "requirement_type": "reactions_received", "threshold": 50, "icon_url": "/badges/star_style.png"
        },
        {
            "id": "star_gold", "name": "Supernova", "description": "Receive 200 reactions on your posts.",
            "tier": "gold", "category": "community", "requirement_type": "reactions_received", "threshold": 200, "icon_url": "/badges/star_style.png"
        },

        # --- El Maestro (Solutions Accepted) ---
        {
            "id": "maestro_bronze", "name": "Helpful Hand", "description": "Have 1 solution accepted.",
            "tier": "bronze", "category": "course", "requirement_type": "solutions_accepted", "threshold": 1, "icon_url": "/badges/maestro_style.png"
        },
        {
            "id": "maestro_silver", "name": "Problem Solver", "description": "Have 5 solutions accepted.",
            "tier": "silver", "category": "course", "requirement_type": "solutions_accepted", "threshold": 5, "icon_url": "/badges/maestro_style.png"
        },
        {
            "id": "maestro_gold", "name": "El Maestro", "description": "Have 20 solutions accepted.",
            "tier": "gold", "category": "course", "requirement_type": "solutions_accepted", "threshold": 20, "icon_url": "/badges/maestro_style.png"
        },
    ]

    print(f"Seeding {len(badges)} badges...")
    
    for b_data in badges:
        existing = db.query(BadgeDefinition).filter(BadgeDefinition.id == b_data["id"]).first()
        if not existing:
            badge = BadgeDefinition(
                id=b_data["id"],
                name=b_data["name"],
                description=b_data["description"],
                tier=b_data["tier"],
                category=b_data["category"],
                requirement_type=b_data["requirement_type"],
                threshold=b_data["threshold"],
                icon_url=b_data["icon_url"]
            )
            db.add(badge)
            print(f"Created: {b_data['name']}")
        else:
            # Update existing
            existing.name = b_data["name"]
            existing.description = b_data["description"]
            existing.threshold = b_data["threshold"]
            print(f"Updated: {b_data['name']}")
    
    db.commit()
    print("✅ Logic complete.")

if __name__ == "__main__":
    seed_badges()
