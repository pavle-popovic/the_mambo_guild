/**
 * Single source of truth for cosmetic SKUs (avatar borders + username titles).
 *
 * The backend catalog (`backend/scripts/shop_catalog.py`) owns pricing and
 * ownership rules; this file owns how a given SKU renders in the client.
 *
 * Changing an SKU here must be matched by an entry in the backend catalog;
 * orphaned SKUs in either direction are silently dropped (borders fall back
 * to no ring; titles fall back to plain text).
 */

export type CosmeticRarity = "common" | "rare" | "epic" | "legendary";

export type TitleTone =
  | "neutral"
  | "steel"
  | "ruby"
  | "gold"
  | "emerald"
  | "platinum"
  | "ember"
  | "aurora";

export interface BorderSpec {
  sku: string;
  name: string;
  rarity: CosmeticRarity;
  className: string;
  description: string;
}

export interface TitleSpec {
  sku: string;
  label: string;
  rarity: CosmeticRarity;
  tone: TitleTone;
  description: string;
}

// ---------------------------------------------------------------------------
// Borders
// ---------------------------------------------------------------------------

export const BORDER_REGISTRY: Record<string, BorderSpec> = {
  // Common
  border_amber_glow:    { sku: "border_amber_glow",    name: "Amber Glow",    rarity: "common", className: "cosmetic-border-amber-glow",    description: "Warm amber halo." },
  border_ivory_etch:    { sku: "border_ivory_etch",    name: "Ivory Etch",    rarity: "common", className: "cosmetic-border-ivory-etch",    description: "Clean ivory outline." },
  border_sunset:        { sku: "border_sunset",        name: "Sunset",        rarity: "common", className: "cosmetic-border-sunset",        description: "Orange-to-pink gradient." },
  border_mint_ice:      { sku: "border_mint_ice",      name: "Mint Ice",      rarity: "common", className: "cosmetic-border-mint-ice",      description: "Cool mint sheen." },
  border_lavender_haze: { sku: "border_lavender_haze", name: "Lavender Haze", rarity: "common", className: "cosmetic-border-lavender-haze", description: "Soft lavender wash." },
  border_charcoal:      { sku: "border_charcoal",      name: "Charcoal",      rarity: "common", className: "cosmetic-border-charcoal",      description: "Matte charcoal ring." },

  // Rare
  border_neon_salsa:      { sku: "border_neon_salsa",      name: "Neon Salsa",      rarity: "rare", className: "cosmetic-border-neon-salsa",      description: "Hot pink neon." },
  border_copper_flame:    { sku: "border_copper_flame",    name: "Copper Flame",    rarity: "rare", className: "cosmetic-border-copper-flame",    description: "Copper with a slow flicker." },
  border_emerald_vein:    { sku: "border_emerald_vein",    name: "Emerald Vein",    rarity: "rare", className: "cosmetic-border-emerald-vein",    description: "Deep emerald with gold veining." },
  border_royal_blue:      { sku: "border_royal_blue",      name: "Royal Blue",      rarity: "rare", className: "cosmetic-border-royal-blue",      description: "Classic royal blue with silver trim." },
  border_midnight_velvet: { sku: "border_midnight_velvet", name: "Midnight Velvet", rarity: "rare", className: "cosmetic-border-midnight-velvet", description: "Deep purple velvet finish." },
  border_rose_gold:       { sku: "border_rose_gold",       name: "Rose Gold",       rarity: "rare", className: "cosmetic-border-rose-gold",       description: "Brushed rose gold." },

  // Epic
  border_aurora:         { sku: "border_aurora",         name: "Aurora",         rarity: "epic", className: "cosmetic-border-aurora",         description: "Slow-shifting aurora conic gradient." },
  border_obsidian_flame: { sku: "border_obsidian_flame", name: "Obsidian Flame", rarity: "epic", className: "cosmetic-border-obsidian-flame", description: "Black core with an orange inner pulse." },
  border_holographic:    { sku: "border_holographic",    name: "Holographic",    rarity: "epic", className: "cosmetic-border-holographic",    description: "Full-spectrum holo shimmer." },
  border_platinum_spark: { sku: "border_platinum_spark", name: "Platinum Spark", rarity: "epic", className: "cosmetic-border-platinum-spark", description: "Platinum with rotating highlights." },
  border_ruby_pulse:     { sku: "border_ruby_pulse",     name: "Ruby Pulse",     rarity: "epic", className: "cosmetic-border-ruby-pulse",     description: "Ruby red with a heartbeat pulse." },

  // Legendary
  border_disco_inferno: { sku: "border_disco_inferno", name: "Disco Inferno", rarity: "legendary", className: "cosmetic-border-disco-inferno", description: "Full conic rainbow, slow spin, bright." },
  border_crown_jewel:   { sku: "border_crown_jewel",   name: "Crown Jewel",   rarity: "legendary", className: "cosmetic-border-crown-jewel",   description: "Platinum tiara, gold crown, diamond and gem trio." },
  border_eternal_clave: { sku: "border_eternal_clave", name: "Eternal Clave", rarity: "legendary", className: "cosmetic-border-eternal-clave", description: "Golden clave glyph in rotation." },
};

// ---------------------------------------------------------------------------
// Titles
// ---------------------------------------------------------------------------

export const TITLE_REGISTRY: Record<string, TitleSpec> = {
  // Common
  title_beat_keeper:     { sku: "title_beat_keeper",     label: "Beat Keeper",     rarity: "common", tone: "neutral", description: "Pure timekeeper energy." },
  title_floor_regular:   { sku: "title_floor_regular",   label: "Floor Regular",   rarity: "common", tone: "neutral", description: "You show up." },
  title_on_count:        { sku: "title_on_count",        label: "On Count",        rarity: "common", tone: "neutral", description: "Never misses the 1." },
  title_the_learner:     { sku: "title_the_learner",     label: "The Learner",     rarity: "common", tone: "neutral", description: "Always in the Lab." },
  title_rhythm_cat:      { sku: "title_rhythm_cat",      label: "Rhythm Cat",      rarity: "common", tone: "neutral", description: "Quiet groove, steady feet." },
  title_smooth_operator: { sku: "title_smooth_operator", label: "Smooth Operator", rarity: "common", tone: "neutral", description: "Effortless transitions." },

  // Rare
  title_iron_feet:              { sku: "title_iron_feet",              label: "Iron Feet",              rarity: "rare", tone: "steel", description: "Footwork that won't quit." },
  title_heart_of_timing:        { sku: "title_heart_of_timing",        label: "Heart of Timing",        rarity: "rare", tone: "ruby",  description: "Beats live in your chest." },
  title_the_lyrical:            { sku: "title_the_lyrical",            label: "The Lyrical",            rarity: "rare", tone: "ruby",  description: "Dance as sentence structure." },
  title_the_metronome:          { sku: "title_the_metronome",          label: "The Metronome",          rarity: "rare", tone: "steel", description: "Human click track." },
  title_shine_king:             { sku: "title_shine_king",             label: "Shine King",             rarity: "rare", tone: "gold",  description: "Every shine, dialed." },
  title_showstopper_apprentice: { sku: "title_showstopper_apprentice", label: "Showstopper Apprentice", rarity: "rare", tone: "gold",  description: "The opener everyone remembers." },

  // Epic
  title_salsa_phenom:    { sku: "title_salsa_phenom",    label: "Salsa Phenom",    rarity: "epic", tone: "emerald",  description: "Born with it and keeps earning it." },
  title_guild_luminary:  { sku: "title_guild_luminary",  label: "Guild Luminary",  rarity: "epic", tone: "platinum", description: "Lights the path for the Guild." },
  title_the_showstopper: { sku: "title_the_showstopper", label: "The Showstopper", rarity: "epic", tone: "gold",     description: "Closes every set." },
  title_flame_dancer:    { sku: "title_flame_dancer",    label: "Flame Dancer",    rarity: "epic", tone: "ember",    description: "Pure heat on the floor." },
  title_the_ambassador:  { sku: "title_the_ambassador",  label: "The Ambassador",  rarity: "epic", tone: "platinum", description: "Represents the Guild everywhere." },

  // Legendary
  title_dance_immortal: { sku: "title_dance_immortal", label: "Dance Immortal", rarity: "legendary", tone: "aurora", description: "Your name survives this scene." },
  title_the_maestro:    { sku: "title_the_maestro",    label: "The Maestro",    rarity: "legendary", tone: "aurora", description: "Conducts every body on the floor." },
  title_living_clave:   { sku: "title_living_clave",   label: "Living Clave",   rarity: "legendary", tone: "aurora", description: "The clave breathes through you." },
};

// ---------------------------------------------------------------------------
// Rarity styling
// ---------------------------------------------------------------------------

export const RARITY_LABELS: Record<CosmeticRarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export const RARITY_TEXT_CLASS: Record<CosmeticRarity, string> = {
  common: "text-white/70",
  rare: "text-sky-300",
  epic: "text-purple-300",
  legendary: "text-amber-300",
};

export const RARITY_BORDER_CLASS: Record<CosmeticRarity, string> = {
  common: "border-white/15",
  rare: "border-sky-400/40",
  epic: "border-purple-400/50",
  legendary: "border-amber-400/60",
};

// Lookup helpers — always safe to call with an unknown / null SKU.
export function getBorderSpec(sku?: string | null): BorderSpec | null {
  if (!sku) return null;
  return BORDER_REGISTRY[sku] ?? null;
}

export function getTitleSpec(sku?: string | null): TitleSpec | null {
  if (!sku) return null;
  return TITLE_REGISTRY[sku] ?? null;
}

// Title tone → inline-chip gradient classes.
export const TITLE_TONE_CLASS: Record<TitleTone, string> = {
  neutral:  "bg-white/10 text-white/80 border-white/10",
  steel:    "bg-gradient-to-r from-slate-500/30 to-slate-300/30 text-slate-100 border-slate-300/30",
  ruby:     "bg-gradient-to-r from-red-500/30 to-rose-400/30 text-rose-100 border-rose-400/40",
  gold:     "bg-gradient-to-r from-amber-500/30 to-yellow-400/30 text-amber-100 border-amber-400/40",
  emerald:  "bg-gradient-to-r from-emerald-600/30 to-teal-400/30 text-emerald-100 border-emerald-400/40",
  platinum: "bg-gradient-to-r from-zinc-300/30 to-white/20 text-white border-white/30",
  ember:    "bg-gradient-to-r from-orange-500/30 to-red-400/30 text-orange-100 border-orange-400/40",
  aurora:   "bg-[conic-gradient(from_180deg,rgba(251,191,36,0.45),rgba(236,72,153,0.45),rgba(59,130,246,0.45),rgba(251,191,36,0.45))] text-white border-amber-300/50",
};
