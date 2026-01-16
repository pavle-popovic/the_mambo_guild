import sys
import os
import logging

logging.disable(logging.CRITICAL)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import get_session_local
from models.user import User

def main():
    SessionLocal = get_session_local()
    db = SessionLocal()
    
    try:
        users = db.query(User).all()
        with open("users_dump.txt", "w") as f:
            f.write(f"Total Users: {len(users)}\n")
            for u in users:
                f.write(f"ID: {u.id} | Email: {u.email} | Auth: {u.auth_provider}\n")
    finally:
        db.close()

if __name__ == "__main__":
    main()
