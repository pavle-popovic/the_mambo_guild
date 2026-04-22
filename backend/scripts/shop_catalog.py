"""
Seed catalog for The Guild Shop.

Single source of truth for every SKU's price, rarity, stock rules, and
what the purchase grants. Consumed by migration_021_seed_shop.py and by
any admin scripts that want to inspect/restore the catalog.

Fields per item (all optional unless marked):
  sku           — unique string primary key (required)
  kind          — 'ticket' | 'border' | 'title' | 'utility' (required)
  name          — display name; locale-agnostic for cosmetics (required)
  description   — one-liner
  price_claves  — integer >= 0 (required)
  rarity        — 'common' | 'rare' | 'epic' | 'legendary' | None
  tier_required — 'advanced' | 'performer' | None (None = open to all)
  stock_total   — global stock cap (None = unlimited)
  stock_period  — 'monthly' | 'lifetime' | None
  max_per_user  — per-user purchase cap (None = unlimited; 1 for cosmetics)
  grants        — JSON-serialisable dict of what the purchase confers
  metadata      — JSON-serialisable dict of extra hints (e.g. css_class)
  sort_order    — integer; lower = shown first within its tab
"""
from __future__ import annotations

from typing import Any


# Price ladders by rarity.
BORDER_PRICES = {"common": 100, "rare": 300, "epic": 800, "legendary": 2000}
TITLE_PRICES = {"common": 50, "rare": 200, "epic": 500, "legendary": 1500}


def _border(sku: str, name: str, rarity: str, css_class: str, description: str, sort: int) -> dict[str, Any]:
    return {
        "sku": sku,
        "kind": "border",
        "name": name,
        "description": description,
        "price_claves": BORDER_PRICES[rarity],
        "rarity": rarity,
        "tier_required": None,
        "stock_total": None,
        "stock_period": None,
        "max_per_user": 1,
        "grants": {"equippable": "border"},
        "metadata": {"css_class": css_class},
        "sort_order": sort,
    }


def _title(sku: str, label: str, rarity: str, tone: str, description: str, sort: int) -> dict[str, Any]:
    return {
        "sku": sku,
        "kind": "title",
        "name": label,
        "description": description,
        "price_claves": TITLE_PRICES[rarity],
        "rarity": rarity,
        "tier_required": None,
        "stock_total": None,
        "stock_period": None,
        "max_per_user": 1,
        "grants": {"equippable": "title"},
        "metadata": {"label": label, "tone": tone},
        "sort_order": sort,
    }


CATALOG: list[dict[str, Any]] = [
    # ------------------------------------------------------------------
    # Golden Ticket
    # ------------------------------------------------------------------
    {
        "sku": "ticket_golden",
        "kind": "ticket",
        "name": "Golden Ticket",
        "description": "Unlocks a 1-on-1 coaching review this month. Limited to 10 per month, Guild-wide.",
        "price_claves": 3000,
        "rarity": "legendary",
        "tier_required": "advanced",
        "stock_total": 10,
        "stock_period": "monthly",
        "max_per_user": None,
        "grants": {"coaching_ticket": True},
        "metadata": {},
        "sort_order": 0,
    },

    # ------------------------------------------------------------------
    # Borders — Common (6)
    # ------------------------------------------------------------------
    _border("border_amber_glow",     "Amber Glow",     "common", "cosmetic-border-amber-glow",     "Warm amber halo.",                              100),
    _border("border_ivory_etch",     "Ivory Etch",     "common", "cosmetic-border-ivory-etch",     "Clean ivory outline.",                          101),
    _border("border_sunset",         "Sunset",         "common", "cosmetic-border-sunset",         "Orange-to-pink gradient.",                      102),
    _border("border_mint_ice",       "Mint Ice",       "common", "cosmetic-border-mint-ice",       "Cool mint sheen.",                              103),
    _border("border_lavender_haze",  "Lavender Haze",  "common", "cosmetic-border-lavender-haze",  "Soft lavender wash.",                           104),
    _border("border_charcoal",       "Charcoal",       "common", "cosmetic-border-charcoal",       "Matte charcoal ring.",                          105),

    # ------------------------------------------------------------------
    # Borders — Rare (6)
    # ------------------------------------------------------------------
    _border("border_neon_salsa",        "Neon Salsa",        "rare", "cosmetic-border-neon-salsa",        "Hot pink neon.",                         200),
    _border("border_copper_flame",      "Copper Flame",      "rare", "cosmetic-border-copper-flame",      "Copper with a slow flicker.",            201),
    _border("border_emerald_vein",      "Emerald Vein",      "rare", "cosmetic-border-emerald-vein",      "Deep emerald with gold veining.",        202),
    _border("border_royal_blue",        "Royal Blue",        "rare", "cosmetic-border-royal-blue",        "Classic royal blue with silver trim.",   203),
    _border("border_midnight_velvet",   "Midnight Velvet",   "rare", "cosmetic-border-midnight-velvet",   "Deep purple velvet finish.",             204),
    _border("border_rose_gold",         "Rose Gold",         "rare", "cosmetic-border-rose-gold",         "Brushed rose gold.",                     205),

    # ------------------------------------------------------------------
    # Borders — Epic (5)
    # ------------------------------------------------------------------
    _border("border_aurora",            "Aurora",            "epic", "cosmetic-border-aurora",            "Slow-shifting aurora conic gradient.",   300),
    _border("border_obsidian_flame",    "Obsidian Flame",    "epic", "cosmetic-border-obsidian-flame",    "Black core with an orange inner pulse.", 301),
    _border("border_holographic",       "Holographic",       "epic", "cosmetic-border-holographic",       "Full-spectrum holo shimmer.",            302),
    _border("border_platinum_spark",    "Platinum Spark",    "epic", "cosmetic-border-platinum-spark",    "Platinum with rotating highlights.",     303),
    _border("border_ruby_pulse",        "Ruby Pulse",        "epic", "cosmetic-border-ruby-pulse",        "Ruby red with a heartbeat pulse.",       304),

    # ------------------------------------------------------------------
    # Borders — Legendary (3)
    # ------------------------------------------------------------------
    _border("border_disco_inferno",     "Disco Inferno",     "legendary", "cosmetic-border-disco-inferno",     "Full conic rainbow, slow spin, bright.", 400),
    _border("border_crown_jewel",       "Crown Jewel",       "legendary", "cosmetic-border-crown-jewel",       "Polished platinum ring, diamond crystals, gold crown topper.", 401),
    _border("border_eternal_clave",     "Eternal Clave",     "legendary", "cosmetic-border-eternal-clave",     "Golden clave glyph in rotation.",        402),

    # ------------------------------------------------------------------
    # Titles — Common (6)
    # ------------------------------------------------------------------
    _title("title_beat_keeper",       "Beat Keeper",       "common", "neutral",  "Pure timekeeper energy.",                  500),
    _title("title_floor_regular",     "Floor Regular",     "common", "neutral",  "You show up.",                             501),
    _title("title_on_count",          "On Count",          "common", "neutral",  "Never misses the 1.",                      502),
    _title("title_the_learner",       "The Learner",       "common", "neutral",  "Always in the Lab.",                       503),
    _title("title_rhythm_cat",        "Rhythm Cat",        "common", "neutral",  "Quiet groove, steady feet.",               504),
    _title("title_smooth_operator",   "Smooth Operator",   "common", "neutral",  "Effortless transitions.",                  505),

    # ------------------------------------------------------------------
    # Titles — Rare (6)
    # ------------------------------------------------------------------
    _title("title_iron_feet",             "Iron Feet",              "rare", "steel",    "Footwork that won't quit.",              600),
    _title("title_heart_of_timing",       "Heart of Timing",        "rare", "ruby",     "Beats live in your chest.",              601),
    _title("title_the_lyrical",           "The Lyrical",            "rare", "ruby",     "Dance as sentence structure.",           602),
    _title("title_the_metronome",         "The Metronome",          "rare", "steel",    "Human click track.",                     603),
    _title("title_shine_king",            "Shine King",             "rare", "gold",     "Every shine, dialed.",                   604),
    _title("title_showstopper_apprentice","Showstopper Apprentice", "rare", "gold",     "The opener everyone remembers.",         605),

    # ------------------------------------------------------------------
    # Titles — Epic (5)
    # ------------------------------------------------------------------
    _title("title_salsa_phenom",      "Salsa Phenom",       "epic", "emerald",  "Born with it and keeps earning it.",         700),
    _title("title_guild_luminary",    "Guild Luminary",     "epic", "platinum", "Lights the path for the Guild.",             701),
    _title("title_the_showstopper",   "The Showstopper",    "epic", "gold",     "Closes every set.",                          702),
    _title("title_flame_dancer",      "Flame Dancer",       "epic", "ember",    "Pure heat on the floor.",                    703),
    _title("title_the_phoenix",       "The Phoenix",        "epic", "ember",    "Falls, rises, keeps dancing.",               704),

    # ------------------------------------------------------------------
    # Titles — Legendary (3)
    # ------------------------------------------------------------------
    _title("title_dance_immortal",    "Dance Immortal",     "legendary", "aurora", "Your name survives this scene.",          800),
    _title("title_the_maestro",       "The Maestro",        "legendary", "aurora", "Conducts every body on the floor.",       801),
    _title("title_living_clave",      "Living Clave",       "legendary", "aurora", "The clave breathes through you.",         802),

    # ------------------------------------------------------------------
    # Utility
    # ------------------------------------------------------------------
    {
        "sku": "utility_video_slots_5",
        "kind": "utility",
        "name": "+5 Video Slots",
        "description": "Permanently adds 5 stage video slots. Stackable up to 5 times (+25 total).",
        "price_claves": 1000,
        "rarity": None,
        "tier_required": None,
        "stock_total": None,
        "stock_period": None,
        "max_per_user": 5,
        "grants": {"bonus_video_slots": 5},
        "metadata": {},
        "sort_order": 900,
    },
    {
        "sku": "utility_question_slots_10",
        "kind": "utility",
        "name": "+10 Lab Slots",
        "description": "Permanently adds 10 Lab question slots. Stackable up to 3 times (+30 total).",
        "price_claves": 500,
        "rarity": None,
        "tier_required": None,
        "stock_total": None,
        "stock_period": None,
        "max_per_user": 3,
        "grants": {"bonus_question_slots": 10},
        "metadata": {},
        "sort_order": 901,
    },
]
