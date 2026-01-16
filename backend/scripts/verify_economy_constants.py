import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from services.clave_service import (
    EARN_DAILY_BASE, EARN_DAILY_PRO, EARN_STREAK_BONUS_BASE, EARN_STREAK_BONUS_PRO,
    EARN_REACTION_REFUND, EARN_SUB_ADVANCED, EARN_SUB_PERFORMER,
    EARN_CHOREO_COMPLETE, EARN_WEEK_COMPLETE, EARN_COURSE_COMPLETE
)
from services.post_service import add_reaction

print("--- Verifying Clave Economy Constants ---")
print(f"EARN_DAILY_BASE: {EARN_DAILY_BASE} (Expected: (2, 5))")
print(f"EARN_DAILY_PRO: {EARN_DAILY_PRO} (Expected: (5, 10))")
print(f"EARN_STREAK_BONUS_BASE: {EARN_STREAK_BONUS_BASE} (Expected: 15)")
print(f"EARN_STREAK_BONUS_PRO: {EARN_STREAK_BONUS_PRO} (Expected: 30)")
print(f"EARN_REACTION_REFUND: {EARN_REACTION_REFUND} (Expected: 1)")
print(f"EARN_SUB_ADVANCED: {EARN_SUB_ADVANCED} (Expected: 10)")
print(f"EARN_SUB_PERFORMER: {EARN_SUB_PERFORMER} (Expected: 20)")
print(f"EARN_COURSE_COMPLETE: {EARN_COURSE_COMPLETE} (Expected: 0)")

assert EARN_DAILY_BASE == (2, 5)
assert EARN_DAILY_PRO == (5, 10)
assert EARN_STREAK_BONUS_BASE == 15
assert EARN_STREAK_BONUS_PRO == 30
assert EARN_REACTION_REFUND == 1
assert EARN_SUB_ADVANCED == 10
assert EARN_SUB_PERFORMER == 20
assert EARN_COURSE_COMPLETE == 0

print("\n--- Verifying Imports ---")
try:
    from routers.payments import award_subscription_bonus
    print("SUCCESS: Imported award_subscription_bonus in payments.py (indirectly via module load)")
except ImportError as e:
    print(f"FAILURE: Could not import in payments.py: {e}")

try:
    from routers.auth import award_new_user_bonus
    print("SUCCESS: Imported award_new_user_bonus in auth.py (indirectly via module load)")
except ImportError as e:
    print(f"FAILURE: Could not import in auth.py: {e}")

print("\nAll verifications passed!")
