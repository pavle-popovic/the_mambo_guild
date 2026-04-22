"""
Migration 021: seed the Guild Shop catalog.

Imports `scripts.shop_catalog.CATALOG` and upserts every row into
shop_items. Safe to re-run: uses ON CONFLICT (sku) DO UPDATE so price /
description tweaks from a future catalog change land on the next run.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine
from scripts.shop_catalog import CATALOG


def run():
    engine = get_engine()
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            for item in CATALOG:
                conn.execute(
                    text("""
                        INSERT INTO shop_items
                            (sku, kind, name, description, price_claves, rarity,
                             tier_required, stock_total, stock_period, max_per_user,
                             grants, metadata, is_active, sort_order, created_at)
                        VALUES
                            (:sku, :kind, :name, :description, :price_claves, :rarity,
                             :tier_required, :stock_total, :stock_period, :max_per_user,
                             CAST(:grants AS JSONB), CAST(:metadata AS JSONB), TRUE, :sort_order, NOW())
                        ON CONFLICT (sku) DO UPDATE SET
                            kind          = EXCLUDED.kind,
                            name          = EXCLUDED.name,
                            description   = EXCLUDED.description,
                            price_claves  = EXCLUDED.price_claves,
                            rarity        = EXCLUDED.rarity,
                            tier_required = EXCLUDED.tier_required,
                            stock_total   = EXCLUDED.stock_total,
                            stock_period  = EXCLUDED.stock_period,
                            max_per_user  = EXCLUDED.max_per_user,
                            grants        = EXCLUDED.grants,
                            metadata      = EXCLUDED.metadata,
                            is_active     = TRUE,
                            sort_order    = EXCLUDED.sort_order
                    """),
                    {
                        "sku":           item["sku"],
                        "kind":          item["kind"],
                        "name":          item["name"],
                        "description":   item.get("description"),
                        "price_claves":  item["price_claves"],
                        "rarity":        item.get("rarity"),
                        "tier_required": item.get("tier_required"),
                        "stock_total":   item.get("stock_total"),
                        "stock_period":  item.get("stock_period"),
                        "max_per_user":  item.get("max_per_user"),
                        "grants":        json.dumps(item.get("grants") or {}),
                        "metadata":      json.dumps(item.get("metadata") or {}),
                        "sort_order":    item.get("sort_order", 0),
                    },
                )

            trans.commit()

            total = conn.execute(text("SELECT COUNT(*) FROM shop_items WHERE is_active = TRUE")).scalar()
            print(f"Migration 021: seeded {len(CATALOG)} items. {total} active SKUs in catalog.")
        except Exception:
            trans.rollback()
            raise


if __name__ == "__main__":
    run()
