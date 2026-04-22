/**
 * SVG ornament specs for each avatar border SKU.
 *
 * Rendered by `<BorderFrame>` as an absolutely-positioned SVG overlay around
 * the round avatar. Ornaments float OUTSIDE the avatar (radii > 45 in the
 * 0–100 viewBox) so the avatar itself stays unobscured.
 *
 * Rarity progression:
 *   common    → thin ring + 0–8 small accents
 *   rare      → ring + 4 corner ornaments
 *   epic      → thick ring + 8+ ornaments, two layers
 *   legendary → heavy frame + ornate motif (crown / flames / clave cross)
 */

export type OrnamentShape =
  | "dot"
  | "diamond"
  | "spark"
  | "star"
  | "leaf"
  | "flame"
  | "scroll"
  | "gem"
  | "fleur"
  | "wing"
  | "crown"
  | "clave"
  | "notch"
  | "petal";

/** A single ornament layer: N copies placed around a circle. */
export interface OrnamentLayer {
  shape: OrnamentShape;
  count: number;
  /** 0° = top, 90° = right, 180° = bottom, 270° = left. */
  startAngle?: number;
  /** Distance from the avatar centre (viewBox units, 0–50). */
  radius: number;
  /** Visual size of the ornament (scaled from the base 10-unit path). */
  size: number;
  color: string | string[];
  opacity?: number;
  /** Rotate each ornament to point radially outward. */
  rotateOut?: boolean;
}

export interface BorderFrameSpec {
  id: string;
  /** Base ring drawn around the avatar. */
  ring?: {
    color: string | string[];
    /** Stroke thickness. */
    thickness: number;
    /** Ring radius in viewBox units (default 43). */
    radius?: number;
    opacity?: number;
    /** SVG stroke-dasharray e.g. "1 3" for dotted. */
    dash?: string;
    /** Optional secondary inner ring. */
    inner?: {
      color: string | string[];
      thickness: number;
      opacity?: number;
      offset?: number;
      dash?: string;
    };
  };
  /** Ornament layers, drawn in order. */
  ornaments?: OrnamentLayer[];
  /** Outer drop-shadow glow (SVG filter). */
  glow?: { color: string; blur: number };
}

// ---------------------------------------------------------------------------
// Palette helpers
// ---------------------------------------------------------------------------
const AMBER = "#fbbf24";
const AMBER_SOFT = "rgba(251,191,36,0.55)";
const IVORY = "#f5f1e0";
const ORANGE = "#fb923c";
const PINK = "#f472b6";
const MINT = "#6ee7b7";
const LAVENDER = "#c4b5fd";
const CHARCOAL = "#4b5563";
const NEON_PINK = "#ec4899";
const COPPER = "#d97706";
const COPPER_HI = "#fcd34d";
const EMERALD = "#10b981";
const ROYAL = "#3b82f6";
const SILVER = "#e5e7eb";
const VELVET = "#7c3aed";
const ROSE = "#fda4af";
const ROSE_HI = "#fbcfe8";
const AURORA_1 = "#fbbf24";
const AURORA_2 = "#ec4899";
const AURORA_3 = "#60a5fa";
const AURORA_4 = "#34d399";
const OBSIDIAN = "#1f2937";
const FLAME = "#f97316";
const HOLO_1 = "#a78bfa";
const HOLO_2 = "#38bdf8";
const HOLO_3 = "#f472b6";
const HOLO_4 = "#facc15";
const PLATINUM = "#e5e4e2";
const RUBY = "#e11d48";
const RUBY_HI = "#fb7185";
const GOLD = "#f59e0b";
const GOLD_HI = "#fde68a";

// ---------------------------------------------------------------------------
// Spec registry
// ---------------------------------------------------------------------------

export const BORDER_FRAME_SPECS: Record<string, BorderFrameSpec> = {
  // -----------------------------------------------------------------------
  // COMMON — simple ring, tiny accents
  // -----------------------------------------------------------------------

  border_amber_glow: {
    id: "amber-glow",
    ring: { color: AMBER, thickness: 1.5, opacity: 0.85 },
    glow: { color: "rgba(251,191,36,0.35)", blur: 3 },
    ornaments: [
      { shape: "dot", count: 4, startAngle: 45, radius: 46, size: 2.2, color: AMBER },
    ],
  },

  border_ivory_etch: {
    id: "ivory-etch",
    ring: {
      color: IVORY,
      thickness: 1.2,
      opacity: 0.9,
      inner: { color: IVORY, thickness: 0.5, opacity: 0.5, offset: 3, dash: "1 2" },
    },
  },

  border_sunset: {
    id: "sunset",
    ring: { color: [ORANGE, PINK], thickness: 1.8, opacity: 0.9 },
    glow: { color: "rgba(251,146,60,0.3)", blur: 3 },
    ornaments: [
      { shape: "dot", count: 2, startAngle: 0, radius: 46, size: 2.5, color: PINK },
    ],
  },

  border_mint_ice: {
    id: "mint-ice",
    ring: { color: MINT, thickness: 1.5, opacity: 0.85 },
    glow: { color: "rgba(110,231,183,0.3)", blur: 3 },
    ornaments: [
      { shape: "diamond", count: 8, radius: 46, size: 1.8, color: MINT, opacity: 0.7 },
    ],
  },

  border_lavender_haze: {
    id: "lavender-haze",
    ring: { color: LAVENDER, thickness: 1.5, opacity: 0.8 },
    glow: { color: "rgba(196,181,253,0.35)", blur: 4 },
    ornaments: [
      { shape: "star", count: 5, radius: 47, size: 2.8, color: LAVENDER },
    ],
  },

  border_charcoal: {
    id: "charcoal",
    ring: {
      color: CHARCOAL,
      thickness: 2.2,
      opacity: 0.95,
      inner: { color: "#9ca3af", thickness: 0.4, opacity: 0.4, offset: 2 },
    },
    ornaments: [
      { shape: "notch", count: 4, startAngle: 45, radius: 46, size: 3.5, color: "#9ca3af", rotateOut: true },
    ],
  },

  // -----------------------------------------------------------------------
  // RARE — ring + 4 corner ornaments
  // -----------------------------------------------------------------------

  border_neon_salsa: {
    id: "neon-salsa",
    ring: { color: NEON_PINK, thickness: 2, opacity: 1 },
    glow: { color: "rgba(236,72,153,0.55)", blur: 5 },
    ornaments: [
      { shape: "diamond", count: 4, startAngle: 45, radius: 48, size: 4, color: NEON_PINK },
      { shape: "dot", count: 4, startAngle: 0, radius: 46, size: 1.8, color: NEON_PINK, opacity: 0.7 },
    ],
  },

  border_copper_flame: {
    id: "copper-flame",
    ring: { color: [COPPER, COPPER_HI], thickness: 2, opacity: 0.95 },
    glow: { color: "rgba(217,119,6,0.5)", blur: 5 },
    ornaments: [
      { shape: "flame", count: 4, startAngle: 45, radius: 50, size: 5, color: [COPPER, COPPER_HI], rotateOut: true },
    ],
  },

  border_emerald_vein: {
    id: "emerald-vein",
    ring: {
      color: EMERALD,
      thickness: 2,
      opacity: 1,
      inner: { color: GOLD_HI, thickness: 0.6, opacity: 0.6, offset: 3 },
    },
    glow: { color: "rgba(16,185,129,0.45)", blur: 5 },
    ornaments: [
      { shape: "leaf", count: 4, startAngle: 0, radius: 50, size: 5, color: EMERALD, rotateOut: true },
    ],
  },

  border_royal_blue: {
    id: "royal-blue",
    ring: {
      color: ROYAL,
      thickness: 2,
      opacity: 1,
      inner: { color: SILVER, thickness: 0.6, opacity: 0.75, offset: 3 },
    },
    glow: { color: "rgba(59,130,246,0.5)", blur: 5 },
    ornaments: [
      { shape: "fleur", count: 4, startAngle: 45, radius: 50, size: 5, color: SILVER, rotateOut: true },
    ],
  },

  border_midnight_velvet: {
    id: "midnight-velvet",
    ring: { color: VELVET, thickness: 2.2, opacity: 1 },
    glow: { color: "rgba(124,58,237,0.55)", blur: 5 },
    ornaments: [
      { shape: "diamond", count: 8, startAngle: 22.5, radius: 48, size: 3, color: VELVET },
      { shape: "dot", count: 8, startAngle: 0, radius: 46, size: 1.2, color: "#a78bfa" },
    ],
  },

  border_rose_gold: {
    id: "rose-gold",
    ring: { color: [ROSE, ROSE_HI], thickness: 2, opacity: 1 },
    glow: { color: "rgba(253,164,175,0.5)", blur: 5 },
    ornaments: [
      { shape: "scroll", count: 4, startAngle: 45, radius: 48, size: 6, color: ROSE, rotateOut: true },
      { shape: "dot", count: 2, startAngle: 0, radius: 48, size: 2, color: ROSE_HI },
    ],
  },

  // -----------------------------------------------------------------------
  // EPIC — thick ring + 8+ ornaments, two layers
  // -----------------------------------------------------------------------

  border_aurora: {
    id: "aurora",
    ring: {
      color: [AURORA_1, AURORA_2, AURORA_3, AURORA_4],
      thickness: 2.6,
      opacity: 1,
    },
    glow: { color: "rgba(236,72,153,0.5)", blur: 6 },
    ornaments: [
      { shape: "gem", count: 8, startAngle: 22.5, radius: 50, size: 5, color: [AURORA_2, AURORA_3] },
      { shape: "spark", count: 4, startAngle: 0, radius: 52, size: 3.5, color: AURORA_1 },
    ],
  },

  border_obsidian_flame: {
    id: "obsidian-flame",
    ring: {
      color: OBSIDIAN,
      thickness: 3,
      opacity: 1,
      inner: { color: FLAME, thickness: 1, opacity: 0.8, offset: 3.5 },
    },
    glow: { color: "rgba(249,115,22,0.6)", blur: 6 },
    ornaments: [
      { shape: "flame", count: 8, startAngle: 0, radius: 52, size: 5, color: [FLAME, "#facc15"], rotateOut: true },
      { shape: "diamond", count: 8, startAngle: 22.5, radius: 48, size: 2.2, color: OBSIDIAN },
    ],
  },

  border_holographic: {
    id: "holographic",
    ring: {
      color: [HOLO_1, HOLO_2, HOLO_3, HOLO_4, HOLO_1],
      thickness: 2.6,
      opacity: 1,
    },
    glow: { color: "rgba(167,139,250,0.55)", blur: 6 },
    ornaments: [
      { shape: "spark", count: 12, startAngle: 0, radius: 51, size: 4, color: [HOLO_2, HOLO_3] },
    ],
  },

  border_platinum_spark: {
    id: "platinum-spark",
    ring: {
      color: PLATINUM,
      thickness: 2.6,
      opacity: 1,
      inner: { color: "white", thickness: 0.6, opacity: 0.6, offset: 3 },
    },
    glow: { color: "rgba(229,228,226,0.6)", blur: 6 },
    ornaments: [
      { shape: "spark", count: 8, startAngle: 22.5, radius: 52, size: 5, color: "white" },
      { shape: "dot", count: 8, startAngle: 0, radius: 47, size: 1.5, color: "white", opacity: 0.75 },
    ],
  },

  border_ruby_pulse: {
    id: "ruby-pulse",
    ring: {
      color: RUBY,
      thickness: 2.6,
      opacity: 1,
      inner: { color: RUBY_HI, thickness: 0.8, opacity: 0.8, offset: 3 },
    },
    glow: { color: "rgba(225,29,72,0.6)", blur: 6 },
    ornaments: [
      { shape: "gem", count: 4, startAngle: 0, radius: 51, size: 6, color: [RUBY, RUBY_HI] },
      { shape: "gem", count: 4, startAngle: 45, radius: 49, size: 3.5, color: RUBY_HI },
    ],
  },

  // -----------------------------------------------------------------------
  // LEGENDARY — ornate static motifs (NO rotation)
  // -----------------------------------------------------------------------

  // Full ring of fire around the avatar. Varying flame sizes alternating with
  // embers for depth, all static.
  border_disco_inferno: {
    id: "disco-inferno",
    ring: {
      color: [FLAME, "#ef4444", "#facc15", FLAME],
      thickness: 3,
      opacity: 1,
      inner: { color: "#fef3c7", thickness: 0.6, opacity: 0.7, offset: 3.5 },
    },
    glow: { color: "rgba(249,115,22,0.7)", blur: 8 },
    ornaments: [
      { shape: "flame", count: 8, startAngle: 0, radius: 53, size: 7, color: [FLAME, "#fcd34d"], rotateOut: true },
      { shape: "flame", count: 8, startAngle: 22.5, radius: 51, size: 4.5, color: [RUBY, FLAME], rotateOut: true },
      { shape: "spark", count: 16, startAngle: 11.25, radius: 56, size: 2.2, color: "#fef3c7", opacity: 0.8 },
    ],
  },

  // Ornate golden crown on top, jewel cluster around, royal trim.
  border_crown_jewel: {
    id: "crown-jewel",
    ring: {
      color: [GOLD, GOLD_HI, GOLD],
      thickness: 3,
      opacity: 1,
      inner: { color: "#fef3c7", thickness: 0.8, opacity: 0.8, offset: 3.5 },
    },
    glow: { color: "rgba(245,158,11,0.75)", blur: 8 },
    ornaments: [
      // Big crown on top
      { shape: "crown", count: 1, startAngle: 0, radius: 55, size: 13, color: [GOLD_HI, GOLD], rotateOut: true },
      // Three big gems beneath (red / blue / green heraldic trio)
      { shape: "gem", count: 1, startAngle: 180, radius: 52, size: 7, color: [RUBY, RUBY_HI] },
      { shape: "gem", count: 1, startAngle: 150, radius: 52, size: 6, color: [ROYAL, "#93c5fd"] },
      { shape: "gem", count: 1, startAngle: 210, radius: 52, size: 6, color: [EMERALD, "#6ee7b7"] },
      // Gold fleurs at side quarters
      { shape: "fleur", count: 2, startAngle: 90, radius: 50, size: 5, color: [GOLD_HI, GOLD], rotateOut: true },
      // Small gold sparks filling the gaps
      { shape: "spark", count: 8, startAngle: 22.5, radius: 48, size: 2.8, color: GOLD_HI, opacity: 0.9 },
    ],
  },

  // Four crossed-clave glyphs at the cardinal points + starfield in between.
  // Static, ornate, evokes rhythm/ritual.
  border_eternal_clave: {
    id: "eternal-clave",
    ring: {
      color: [GOLD, GOLD_HI],
      thickness: 2.8,
      opacity: 1,
      inner: { color: GOLD_HI, thickness: 0.6, opacity: 0.7, offset: 3 },
    },
    glow: { color: "rgba(245,158,11,0.75)", blur: 8 },
    ornaments: [
      // Four crossed-clave glyphs at 0/90/180/270
      { shape: "clave", count: 4, startAngle: 0, radius: 53, size: 8, color: [GOLD_HI, GOLD] },
      // Star cluster at 45s between claves
      { shape: "star", count: 4, startAngle: 45, radius: 51, size: 4.5, color: GOLD_HI },
      // Inner ring of tiny sparks
      { shape: "dot", count: 16, startAngle: 0, radius: 46, size: 1.2, color: GOLD_HI, opacity: 0.6 },
    ],
  },
};
