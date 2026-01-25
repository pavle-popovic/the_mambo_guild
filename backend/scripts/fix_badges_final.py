import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import get_session_local
from models.community import BadgeDefinition

def fix_badges():
    Session = get_session_local()
    db = Session()
    try:
        badges = db.query(BadgeDefinition).all()
        print(f"Checking {len(badges)} badges for icon updates...")
        
        updates = 0
        for b in badges:
            original_icon = b.icon_url
            new_icon = original_icon
            
            if "Metronome" in b.name:
                new_icon = "/badges/metronome_style.png"
            elif "Critic" in b.name:
                new_icon = "/badges/critic_style.png"
            elif "Star" in b.name or "Supernova" in b.name:
                new_icon = "/badges/star_style.png"
            elif "Maestro" in b.name or "Helpful" in b.name or "Problem" in b.name:
                new_icon = "/badges/maestro_style.png"
            elif "Responder" in b.name:
                new_icon = "/badges/responder_style.png"
            elif "Lion" in b.name:
                new_icon = "/badges/lion_style.png"
            elif "Cinematographer" in b.name:
                new_icon = "/badges/camera_style.png"
            elif "Eye" in b.name:
                new_icon = "/badges/eye_style.png"
            elif "Fire" in b.name:
                new_icon = "/badges/fire_style.png"
            
            # Apply update if changed
            if new_icon != original_icon:
                print(f"Updating '{b.name}': {original_icon} -> {new_icon}")
                b.icon_url = new_icon
                updates += 1
        
        if updates > 0:
            db.commit()
            print(f"Successfully updated {updates} badges.")
        else:
            print("No updates needed.")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_badges()
