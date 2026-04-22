"""
Migration 020: The Guild Shop foundation.

Creates the two tables that back the shop (shop_items, shop_purchases) and
extends user_profiles with the four cosmetic / utility columns we need to
render equipped items and honor bonus slot caps.

Idempotent: every statement uses IF NOT EXISTS. Safe to re-run.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


def run():
    engine = get_engine()
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # --- shop_items ------------------------------------------------
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS shop_items (
                    sku              VARCHAR(64) PRIMARY KEY,
                    kind             VARCHAR(20) NOT NULL,
                    name             VARCHAR(120) NOT NULL,
                    description      TEXT,
                    price_claves     INTEGER NOT NULL CHECK (price_claves >= 0),
                    rarity           VARCHAR(20),
                    tier_required    VARCHAR(20),
                    stock_total      INTEGER,
                    stock_period     VARCHAR(20),
                    max_per_user     INTEGER,
                    grants           JSONB NOT NULL DEFAULT '{}'::jsonb,
                    metadata         JSONB NOT NULL DEFAULT '{}'::jsonb,
                    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
                    sort_order       INTEGER NOT NULL DEFAULT 0,
                    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
            """))

            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_shop_items_kind_active
                    ON shop_items(kind, is_active, sort_order);
            """))

            # --- shop_purchases --------------------------------------------
            # Uses gen_random_uuid(); ensure pgcrypto is available (most
            # modern Postgres builds ship it, but be explicit).
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto;"))

            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS shop_purchases (
                    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    sku               VARCHAR(64) NOT NULL REFERENCES shop_items(sku),
                    price_paid        INTEGER NOT NULL,
                    clave_txn_id      UUID REFERENCES clave_transactions(id),
                    status            VARCHAR(20) NOT NULL DEFAULT 'fulfilled',
                    fulfillment_id    UUID,
                    stock_period_key  VARCHAR(20),
                    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    refunded_at       TIMESTAMPTZ
                );
            """))

            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_shop_purchases_user
                    ON shop_purchases(user_id, created_at DESC);
            """))

            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_shop_purchases_sku_period
                    ON shop_purchases(sku, stock_period_key)
                    WHERE status = 'fulfilled';
            """))

            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_shop_purchases_user_sku
                    ON shop_purchases(user_id, sku)
                    WHERE status = 'fulfilled';
            """))

            # --- user_profiles extensions ---------------------------------
            conn.execute(text("""
                ALTER TABLE user_profiles
                ADD COLUMN IF NOT EXISTS equipped_border_sku VARCHAR(64);
            """))
            conn.execute(text("""
                ALTER TABLE user_profiles
                ADD COLUMN IF NOT EXISTS equipped_title_sku VARCHAR(64);
            """))
            conn.execute(text("""
                ALTER TABLE user_profiles
                ADD COLUMN IF NOT EXISTS bonus_video_slots INTEGER NOT NULL DEFAULT 0;
            """))
            conn.execute(text("""
                ALTER TABLE user_profiles
                ADD COLUMN IF NOT EXISTS bonus_question_slots INTEGER NOT NULL DEFAULT 0;
            """))

            # --- clave_transactions index for daily-cap query -------------
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_clave_txn_user_reason_day
                    ON clave_transactions(user_id, reason, created_at DESC);
            """))

            trans.commit()
            print("Migration 020: shop_items + shop_purchases created, user_profiles extended.")
        except Exception:
            trans.rollback()
            raise


if __name__ == "__main__":
    run()
