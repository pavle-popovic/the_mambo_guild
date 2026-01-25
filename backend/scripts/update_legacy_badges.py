import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import get_session_local
from models.community import BadgeDefinition

def update_legacy():
    Session = get_session_local()
    db = Session()
    try:
        # Map Name -> Icon
        updates = {
            "The Lion": "/badges/lion_style.png",
            "The Cinematographer": "/badges/camera_style.png",
            "First Responder": "/badges/maestro_style.png",
            "Problem Solver": "/badges/maestro_style.png",
            "El Maestro": "/badges/maestro_style.png", # Covers both versions
            "Helpful Hand": "/badges/maestro_style.png"
        }
        
        print("Starting legacy badge update...")
        for name, icon in updates.items():
            badges = db.query(BadgeDefinition).filter(BadgeDefinition.name == name).all()
            for b in badges:
                b.icon_url = icon
                print(f"Updated {b.name} (ID: {b.id}) to {icon}")
        
        db.commit()
        print("✅ Database update complete.")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_legacy()
