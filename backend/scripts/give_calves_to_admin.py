import sys
import os

# Add parent directory to path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import get_session_local
from models.user import User
from services import clave_service
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    logger.info("Starting Admin Grant...")
    SessionLocal = get_session_local()
    db = SessionLocal()
    
    try:
        user = db.query(User).filter(User.email == 'admin@themamboinn.com').first()
        if user:
            new_balance = clave_service.earn_claves(
                user_id=str(user.id),
                amount=100,
                reason="admin_grant",
                db=db
            )
            logger.info(f"Credited 100 claves to {user.email}. New balance: {new_balance}")
            db.commit()
        else:
            logger.error("User admin@themamboinn.com not found!")
    except Exception as e:
        logger.error(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
