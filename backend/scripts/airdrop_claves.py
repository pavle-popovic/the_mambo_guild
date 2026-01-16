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
    logger.info("Starting Clave Airdrop...")
    SessionLocal = get_session_local()
    db = SessionLocal()
    
    try:
        users = db.query(User).all()
        logger.info(f"Found {len(users)} users.")
        
        count = 0
        for user in users:
            try:
                # Add 100 claves
                new_balance = clave_service.earn_claves(
                    user_id=str(user.id),
                    amount=100,
                    reason="admin_test_airdrop",
                    db=db
                )
                logger.info(f"Credited 100 claves to {user.email}. New balance: {new_balance}")
                count += 1
            except Exception as e:
                logger.error(f"Failed to credit user {user.email}: {e}")
                
        db.commit()
        logger.info(f"Successfully airdropped 100 claves to {count} users.")
        
    finally:
        db.close()

if __name__ == "__main__":
    main()
