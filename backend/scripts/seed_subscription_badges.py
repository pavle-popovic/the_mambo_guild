"""
Seed Subscription Badges - Pro and Guild Master
These badges are automatically awarded when users subscribe to paid tiers.
"""

import os
import sys
from dotenv import load_dotenv

# Setup path to backend
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(project_root, '.env')
load_dotenv(env_path)

backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_path)

from sqlalchemy import text
from models import get_engine

# Badge definitions for subscription tiers
SUBSCRIPTION_BADGES = [
    {
        "id": "pro_member",
        "name": "Pro Member",
        "description": "A dedicated dancer investing in their craft. Welcome to the Pro family!",
        "tier": "Gold",
        "category": "community",
        "requirement_type": "subscription_tier",
        "requirement_value": 1,  # Advanced tier
        "icon_url": "/badges/pro_member.png"
    },
    {
        "id": "guild_master",
        "name": "Guild Master",
        "description": "The elite of the elite. A true patron of the Mambo Guild with exclusive access to all features.",
        "tier": "Diamond",
        "category": "community",
        "requirement_type": "subscription_tier",
        "requirement_value": 2,  # Performer tier
        "icon_url": "/badges/guild_master.png"
    },
]


def seed_subscription_badges():
    """Insert subscription badges into the database."""
    engine = get_engine()
    
    with engine.connect() as conn:
        for badge in SUBSCRIPTION_BADGES:
            # Check if badge already exists
            result = conn.execute(
                text("SELECT id FROM badge_definitions WHERE id = :id"),
                {"id": badge["id"]}
            )
            exists = result.fetchone()
            
            if exists:
                # Update existing badge
                conn.execute(
                    text("""
                        UPDATE badge_definitions 
                        SET name = :name, 
                            description = :description, 
                            tier = :tier, 
                            category = :category,
                            requirement_type = :requirement_type,
                            threshold = :requirement_value,
                            icon_url = :icon_url
                        WHERE id = :id
                    """),
                    badge
                )
                print(f"✅ Updated badge: {badge['name']}")
            else:
                # Insert new badge
                conn.execute(
                    text("""
                        INSERT INTO badge_definitions 
                        (id, name, description, tier, category, requirement_type, threshold, icon_url)
                        VALUES (:id, :name, :description, :tier, :category, :requirement_type, :requirement_value, :icon_url)
                    """),
                    badge
                )
                print(f"✅ Created badge: {badge['name']}")
        
        conn.commit()
    
    print("\n✅ Subscription badges seeded successfully!")


if __name__ == "__main__":
    seed_subscription_badges()
