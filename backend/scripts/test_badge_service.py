
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import get_session_local
from services import badge_service
from schemas.auth import BadgeResponse

def test_logic():
    SessionLocal = get_session_local()
    db = SessionLocal()
    try:
        import uuid
        uid = str(uuid.uuid4())
        print(f"Calling service with UUID: {uid}...")
        results = badge_service.get_all_badges_for_user(uid, db)
        print(f"Got {len(results)} results")
        if results:
            print("First Result:", results[0])
            try:
                # Try to validate against Schema
                valid = BadgeResponse(**results[0])
                print("✅ Validation Successful")
            except Exception as e:
                print(f"❌ Validation Failed: {e}")
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_logic()
