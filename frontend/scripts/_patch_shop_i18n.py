"""
Seed the shop.* translation tree across all 14 locales.

Following the plan's explicit scope call ("names kept English across all
locales"), we only localize UI chrome (tab labels, action buttons, error
copy, rarity labels). The border + title SKU display names stay English
via the frontend cosmetics registry.

Idempotent: re-runs only add keys that don't exist; it never overwrites
a value a translator has already supplied.
"""
from __future__ import annotations
import json
from pathlib import Path

MESSAGES_DIR = Path(__file__).resolve().parents[1] / "messages"

LOCALES = ["en", "es", "pt", "fr", "de", "it", "ja", "ko", "zh", "ru", "pl", "nl", "el", "ar"]


EN_SHOP: dict[str, str | dict] = {
    "pageTitle": "The Guild Shop",
    "pageSubtitle": "Spend your claves on coaching tickets, cosmetics, and slot upgrades. Every purchase is final.",
    "balanceLabel": "Balance",
    "viewInventory": "View inventory →",
    "inventoryTitle": "Inventory",
    "inventorySubtitle": "Equip what you own. Everything is permanent.",
    "backToShop": "← Back to shop",
    "empty": "Nothing here yet. Check back soon.",
    "emptyInventory": "You don't own anything yet.",
    "loading": "Loading catalog...",
    "loadError": "Failed to load shop",
    "tabs": {
        "ticket":  "Tickets",
        "border":  "Borders",
        "title":   "Titles",
        "utility": "Utility",
    },
    "rarity": {
        "common":    "Common",
        "rare":      "Rare",
        "epic":      "Epic",
        "legendary": "Legendary",
    },
    "actions": {
        "buy":           "Buy",
        "buyNow":        "Buy now",
        "cancel":        "Cancel",
        "equip":         "Equip",
        "unequip":       "Unequip",
        "owned":         "Owned",
        "soldOut":       "Sold out",
        "locked":        "Locked",
        "notEnough":     "Not enough",
        "purchasing":    "Purchasing...",
        "equipped":      "Equipped",
        "redeemTicket":  "Redeem ticket →",
    },
    "purchase": {
        "confirmTitle":   "Confirm purchase",
        "priceLabel":     "Price",
        "yourBalance":    "Your balance",
        "afterPurchase":  "After purchase",
        "stockRemaining": "{count} left",
        "success":        "Purchase complete 🎉",
        "genericError":   "Purchase failed. Please try again.",
    },
    "earn": {
        "stagePost":    "Earn +10 🥢 on post",
        "labQuestion":  "Earn +3 🥢 on post",
    },
}


def _merge(dst: dict, src: dict) -> tuple[int, int]:
    """Recursive merge: only insert keys that don't exist in dst."""
    added, kept = 0, 0
    for k, v in src.items():
        if isinstance(v, dict):
            if k not in dst or not isinstance(dst[k], dict):
                dst[k] = {}
            a, ke = _merge(dst[k], v)
            added += a
            kept += ke
        else:
            if k not in dst:
                dst[k] = v
                added += 1
            else:
                kept += 1
    return added, kept


def patch_locale(locale: str) -> None:
    path = MESSAGES_DIR / f"{locale}.json"
    if not path.exists():
        print(f"skip {locale}.json — missing")
        return
    data = json.loads(path.read_text(encoding="utf-8"))
    shop = data.get("shop")
    if not isinstance(shop, dict):
        shop = {}
    added, kept = _merge(shop, EN_SHOP)
    data["shop"] = shop
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"patched {locale}.json  (+{added} new, {kept} kept)")


def main() -> None:
    for locale in LOCALES:
        patch_locale(locale)


if __name__ == "__main__":
    main()
