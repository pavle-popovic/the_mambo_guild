import sys
import os
import traceback

try:
    # Add project root to path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(current_dir)) # salsa_lab_v2
    backend_dir = os.path.join(project_root, 'backend')
    sys.path.append(backend_dir)
    
    print(f"Added to path: {backend_dir}")
    
    from models import get_session_local
    from models.community import BadgeDefinition

    def audit():
        print("Starting audit...")
        Session = get_session_local()
        db = Session()
        try:
            badges = db.query(BadgeDefinition).all()
            print(f"Total Badges Found: {len(badges)}")
            
            with open("badges_dump.txt", "w", encoding="utf-8") as f:
                f.write(f"Total Badges Found: {len(badges)}\n")
                f.write("-" * 60 + "\n")
                for b in badges:
                    line = f"Name: {b.name:<30} | Tier: {b.tier:<10} | Icon: {b.icon_url}"
                    print(line)
                    f.write(line + "\n")
                f.write("-" * 60 + "\n")
            print("Audit dump written to badges_dump.txt")
        except Exception as e:
            print(f"Error querying DB: {e}")
            traceback.print_exc()
        finally:
            db.close()

    if __name__ == "__main__":
        audit()
except Exception as e:
    print(f"Import/Setup Error: {e}")
    traceback.print_exc()
