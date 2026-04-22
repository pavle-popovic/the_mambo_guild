"""
Migration 024: rename title_the_ambassador → title_the_phoenix.

The word "Ambassador" is now reserved for a real Guild program, so the
cosmetic title was renamed to avoid confusion. This migration:

  1. Moves any shop_purchases rows from the old SKU to the new one.
  2. Moves any equipped_title_sku on user_profiles from old → new.
  3. Deactivates the old shop_items row (keeps the historical record
     but hides it from the catalog). Migration 021 re-seeds the new SKU.

Safe to re-run: all statements are idempotent.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


OLD_SKU = "title_the_ambassador"
NEW_SKU = "title_the_phoenix"


def run():
    engine = get_engine()
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # 1. Repoint existing purchases. The new SKU row is created by
            #    migration 021 seeding, so the FK will resolve after that runs.
            purchases = conn.execute(
                text(
                    "UPDATE shop_purchases SET sku = :new WHERE sku = :old"
                ),
                {"old": OLD_SKU, "new": NEW_SKU},
            ).rowcount

            # 2. Repoint equipped title on user profiles.
            equipped = conn.execute(
                text(
                    "UPDATE user_profiles SET equipped_title_sku = :new "
                    "WHERE equipped_title_sku = :old"
                ),
                {"old": OLD_SKU, "new": NEW_SKU},
            ).rowcount

            # 3. Deactivate the old catalog row if it still exists.
            deactivated = conn.execute(
                text(
                    "UPDATE shop_items SET is_active = FALSE WHERE sku = :old"
                ),
                {"old": OLD_SKU},
            ).rowcount

            trans.commit()
            print(
                f"Migration 024: repointed {purchases} purchase(s), "
                f"{equipped} equipped profile(s), deactivated {deactivated} "
                f"old catalog row(s)."
            )
        except Exception:
            trans.rollback()
            raise


if __name__ == "__main__":
    run()
