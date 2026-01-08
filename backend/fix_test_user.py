from models import get_engine
from sqlalchemy import text
from sqlalchemy.orm import Session

engine = get_engine()
db = Session(engine)
db.execute(text("UPDATE subscriptions SET tier = 'ADVANCED' WHERE user_id = (SELECT id FROM users WHERE email = 'test.advanced@example.com')"))
db.commit()
print("Updated subscription to ADVANCED")
db.close()

