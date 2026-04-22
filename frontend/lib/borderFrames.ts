/**
 * SVG ornament specs for each avatar border SKU.
 *
 * Rendered by `<BorderFrame>` as an absolutely-positioned SVG overlay around
 * the round avatar. Ornaments float OUTSIDE the avatar (radii > 45 in the
 * 0–100 viewBox) so the avatar itself stays unobscured.
 *
 * Rarity progression:
 *   common    → thin polished ring + subtle accents
 *   rare      → ring + specular highlight + 4–8 corner ornaments
 *   epic      → thick metallic ring + specular + bevel + layered ornaments
 *   legendary → heavy brushed-metal frame + crystal jewels + ornate motif
 *
 * Premium effects (opt-in):
 *   specular = true  → white arc at ~225° fakes a top-left light reflection
 *   bevel    = true  → inner-shadow filter gives the ring embossed 3D depth
 *
 * Multi-stop ring colour arrays automatically render as a brushed-metal
 * gradient at a 35° angle (see BorderFrame.tsx).
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
  | "petal"
  | "crystal"
  | "filigree"
  | "emblem";

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
  /** White arc reflection on the ring (top-left). */
  specular?: boolean;
  /** Embossed inner-shadow filter on the ring stroke. */
  bevel?: boolean;
}

// ---------------------------------------------------------------------------
// Palette helpers
// ---------------------------------------------------------------------------
const AMBER = "#fbbf24";
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

/**
 * Multi-stop metallic palettes. Rendered at 35° on rings for a brushed-metal
 * dispersion rather than a flat top-to-bottom fade.
 */
const BRONZE_STOPS = ["#7c2d12", "#b45309", "#f59e0b", "#fcd34d", "#d97706", "#92400e"];
const SILVER_STOPS = ["#64748b", "#cbd5e1", "#ffffff", "#e2e8f0", "#94a3b8"];
const GOLD_STOPS   = ["#78350f", "#d97706", "#fbbf24", "#fef3c7", "#f59e0b", "#92400e"];
const DIAMOND_STOPS = ["#c4b5fd", "#e0f2fe", "#ffffff", "#93c5fd", "#c4b5fd"];
const AMBER_STOPS = ["#b45309", "#fbbf24", "#fef3c7", "#f59e0b"];
const COPPER_STOPS = ["#7c2d12", "#c2410c", "#fb923c", "#fcd34d", "#c2410c"];
const ROSE_STOPS = ["#be185d", "#fb7185", "#fecdd3", "#fda4af", "#be185d"];
const EMERALD_STOPS = ["#064e3b", "#10b981", "#a7f3d0", "#34d399", "#065f46"];
const ROYAL_STOPS = ["#1e3a8a", "#3b82f6", "#bfdbfe", "#60a5fa", "#1e40af"];
const VELVET_STOPS = ["#4c1d95", "#7c3aed", "#c4b5fd", "#8b5cf6", "#4c1d95"];
const RUBY_STOPS = ["#7f1d1d", "#e11d48", "#fecdd3", "#fb7185", "#881337"];

// ---------------------------------------------------------------------------
// Spec registry
// ---------------------------------------------------------------------------

export const BORDER_FRAME_SPECS: Record<string, BorderFrameSpec> = {
  // -----------------------------------------------------------------------
  // COMMON — polished ring, subtle accents, no specular/bevel
  // -----------------------------------------------------------------------

  border_amber_glow: {
    id: "amber-glow",
    ring: { color: AMBER_STOPS, thickness: 1.6, opacity: 0.9 },
    glow: { color: "rgba(251,191,36,0.35)", blur: 3 },
    ornaments: [
      { shape: "dot", count: 6, startAngle: 30, radius: 46, size: 2.2, color: AMBER },
    ],
  },

  border_ivory_etch: {
    id: "ivory-etch",
    ring: {
      color: [IVORY, "#ffffff", IVORY],
      thickness: 1.3,
      opacity: 0.95,
      inner: { color: IVORY, thickness: 0.5, opacity: 0.55, offset: 3, dash: "1 2" },
    },
    ornaments: [
      { shape: "dot", count: 12, startAngle: 0, radius: 46.5, size: 0.9, color: IVORY, opacity: 0.8 },
    ],
  },

  border_sunset: {
    id: "sunset",
    ring: { color: [ORANGE, PINK, ORANGE], thickness: 1.9, opacity: 0.92 },
    glow: { color: "rgba(251,146,60,0.35)", blur: 3 },
    ornaments: [
      { shape: "petal", count: 4, startAngle: 45, radius: 48, size: 4, color: [ORANGE, PINK], rotateOut: true },
      { shape: "dot", count: 4, startAngle: 0, radius: 46, size: 1.8, color: PINK, opacity: 0.85 },
    ],
  },

  border_mint_ice: {
    id: "mint-ice",
    ring: { color: [MINT, "#ffffff", MINT], thickness: 1.6, opacity: 0.9 },
    glow: { color: "rgba(110,231,183,0.35)", blur: 3 },
    ornaments: [
      { shape: "diamond", count: 8, radius: 46, size: 2, color: MINT, opacity: 0.75 },
    ],
  },

  border_lavender_haze: {
    id: "lavender-haze",
    ring: { color: [LAVENDER, "#ede9fe", LAVENDER], thickness: 1.6, opacity: 0.9 },
    glow: { color: "rgba(196,181,253,0.4)", blur: 4 },
    ornaments: [
      { shape: "star", count: 5, radius: 47, size: 2.9, color: LAVENDER },
      { shape: "dot", count: 10, startAngle: 18, radius: 45.5, size: 0.8, color: "#ddd6fe", opacity: 0.7 },
    ],
  },

  border_charcoal: {
    id: "charcoal",
    ring: {
      color: ["#374151", CHARCOAL, "#9ca3af", CHARCOAL],
      thickness: 2.2,
      opacity: 0.95,
      inner: { color: "#9ca3af", thickness: 0.4, opacity: 0.4, offset: 2 },
    },
    ornaments: [
      { shape: "notch", count: 4, startAngle: 45, radius: 46, size: 3.5, color: "#9ca3af", rotateOut: true },
    ],
  },

  // -----------------------------------------------------------------------
  // RARE — polished metallic ring + specular + 4–8 corner ornaments
  // -----------------------------------------------------------------------

  border_neon_salsa: {
    id: "neon-salsa",
    ring: { color: [NEON_PINK, "#fb7185", NEON_PINK], thickness: 2, opacity: 1 },
    specular: true,
    glow: { color: "rgba(236,72,153,0.6)", blur: 5 },
    ornaments: [
      { shape: "diamond", count: 4, startAngle: 45, radius: 48, size: 4, color: NEON_PINK },
      { shape: "spark", count: 4, startAngle: 0, radius: 50, size: 3.2, color: "#fbcfe8" },
      { shape: "dot", count: 8, startAngle: 22.5, radius: 46, size: 1.4, color: NEON_PINK, opacity: 0.7 },
    ],
  },

  border_copper_flame: {
    id: "copper-flame",
    ring: { color: COPPER_STOPS, thickness: 2.1, opacity: 1 },
    specular: true,
    glow: { color: "rgba(217,119,6,0.55)", blur: 5 },
    ornaments: [
      { shape: "flame", count: 4, startAngle: 45, radius: 50, size: 5, color: [COPPER, COPPER_HI], rotateOut: true },
      { shape: "dot", count: 4, startAngle: 0, radius: 46.5, size: 1.5, color: COPPER_HI },
    ],
  },

  border_emerald_vein: {
    id: "emerald-vein",
    ring: {
      color: EMERALD_STOPS,
      thickness: 2.1,
      opacity: 1,
      inner: { color: GOLD_HI, thickness: 0.6, opacity: 0.7, offset: 3 },
    },
    specular: true,
    glow: { color: "rgba(16,185,129,0.5)", blur: 5 },
    ornaments: [
      { shape: "leaf", count: 4, startAngle: 0, radius: 50, size: 5, color: [EMERALD, "#6ee7b7"], rotateOut: true },
      { shape: "dot", count: 4, startAngle: 45, radius: 47, size: 1.4, color: GOLD_HI },
    ],
  },

  border_royal_blue: {
    id: "royal-blue",
    ring: {
      color: ROYAL_STOPS,
      thickness: 2.1,
      opacity: 1,
      inner: { color: SILVER, thickness: 0.6, opacity: 0.8, offset: 3 },
    },
    specular: true,
    glow: { color: "rgba(59,130,246,0.55)", blur: 5 },
    ornaments: [
      { shape: "fleur", count: 4, startAngle: 45, radius: 50, size: 5, color: [SILVER, "#ffffff"], rotateOut: true },
      { shape: "dot", count: 4, startAngle: 0, radius: 47, size: 1.6, color: "#ffffff" },
    ],
  },

  border_midnight_velvet: {
    id: "midnight-velvet",
    ring: { color: VELVET_STOPS, thickness: 2.3, opacity: 1 },
    specular: true,
    glow: { color: "rgba(124,58,237,0.6)", blur: 5 },
    ornaments: [
      { shape: "diamond", count: 8, startAngle: 22.5, radius: 48, size: 3, color: [VELVET, "#a78bfa"] },
      { shape: "dot", count: 8, startAngle: 0, radius: 46, size: 1.2, color: "#c4b5fd" },
    ],
  },

  border_rose_gold: {
    id: "rose-gold",
    ring: { color: ROSE_STOPS, thickness: 2.1, opacity: 1 },
    specular: true,
    glow: { color: "rgba(253,164,175,0.55)", blur: 5 },
    ornaments: [
      { shape: "scroll", count: 4, startAngle: 45, radius: 48, size: 6, color: [ROSE, ROSE_HI], rotateOut: true },
      { shape: "dot", count: 4, startAngle: 0, radius: 48, size: 2, color: ROSE_HI },
    ],
  },

  // -----------------------------------------------------------------------
  // EPIC — thick metallic ring + specular + bevel + layered ornaments
  // -----------------------------------------------------------------------

  border_aurora: {
    id: "aurora",
    ring: {
      color: [AURORA_1, AURORA_2, AURORA_3, AURORA_4, AURORA_1],
      thickness: 2.8,
      opacity: 1,
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(236,72,153,0.55)", blur: 6 },
    ornaments: [
      { shape: "gem", count: 8, startAngle: 22.5, radius: 50, size: 5, color: [AURORA_2, AURORA_3] },
      { shape: "spark", count: 4, startAngle: 0, radius: 53, size: 4, color: AURORA_1 },
      { shape: "dot", count: 8, startAngle: 22.5, radius: 46, size: 1, color: AURORA_4, opacity: 0.85 },
    ],
  },

  border_obsidian_flame: {
    id: "obsidian-flame",
    ring: {
      color: ["#111827", OBSIDIAN, "#374151", OBSIDIAN, "#111827"],
      thickness: 3.1,
      opacity: 1,
      inner: { color: FLAME, thickness: 1, opacity: 0.85, offset: 3.5 },
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(249,115,22,0.65)", blur: 6 },
    ornaments: [
      { shape: "flame", count: 8, startAngle: 0, radius: 52, size: 5, color: [FLAME, "#facc15"], rotateOut: true },
      { shape: "diamond", count: 8, startAngle: 22.5, radius: 48, size: 2.4, color: [FLAME, "#fbbf24"] },
    ],
  },

  border_holographic: {
    id: "holographic",
    ring: {
      color: [HOLO_1, HOLO_2, HOLO_3, HOLO_4, HOLO_1, HOLO_2],
      thickness: 2.8,
      opacity: 1,
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(167,139,250,0.6)", blur: 6 },
    ornaments: [
      { shape: "spark", count: 12, startAngle: 0, radius: 51, size: 4, color: [HOLO_2, HOLO_3] },
      { shape: "dot", count: 12, startAngle: 15, radius: 47, size: 1, color: HOLO_1, opacity: 0.85 },
    ],
  },

  border_platinum_spark: {
    id: "platinum-spark",
    ring: {
      color: SILVER_STOPS,
      thickness: 2.8,
      opacity: 1,
      inner: { color: "#ffffff", thickness: 0.7, opacity: 0.75, offset: 3 },
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(229,228,226,0.65)", blur: 6 },
    ornaments: [
      { shape: "spark", count: 8, startAngle: 22.5, radius: 52, size: 5, color: "#ffffff" },
      { shape: "emblem", count: 4, startAngle: 0, radius: 50, size: 5, color: [PLATINUM, "#ffffff"] },
      { shape: "dot", count: 8, startAngle: 22.5, radius: 47, size: 1.4, color: "#ffffff", opacity: 0.85 },
    ],
  },

  border_ruby_pulse: {
    id: "ruby-pulse",
    ring: {
      color: RUBY_STOPS,
      thickness: 2.8,
      opacity: 1,
      inner: { color: RUBY_HI, thickness: 0.8, opacity: 0.85, offset: 3 },
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(225,29,72,0.65)", blur: 6 },
    ornaments: [
      { shape: "gem", count: 4, startAngle: 0, radius: 51, size: 6, color: [RUBY, RUBY_HI] },
      { shape: "gem", count: 4, startAngle: 45, radius: 49, size: 3.6, color: RUBY_HI },
      { shape: "spark", count: 8, startAngle: 22.5, radius: 53, size: 2.2, color: "#ffe4e6", opacity: 0.85 },
    ],
  },

  // -----------------------------------------------------------------------
  // LEGENDARY — brushed-metal ring + crystal jewels + ornate motif
  // -----------------------------------------------------------------------

  // Full ring of fire around the avatar. Crystal sparks for diamond-tier
  // accents, bronze brushed-metal base ring.
  border_disco_inferno: {
    id: "disco-inferno",
    ring: {
      color: BRONZE_STOPS,
      thickness: 3.2,
      opacity: 1,
      inner: { color: "#fef3c7", thickness: 0.7, opacity: 0.75, offset: 3.5 },
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(249,115,22,0.75)", blur: 8 },
    ornaments: [
      { shape: "flame", count: 8, startAngle: 0, radius: 53, size: 7, color: [FLAME, "#fcd34d"], rotateOut: true },
      { shape: "flame", count: 8, startAngle: 22.5, radius: 51, size: 4.5, color: [RUBY, FLAME], rotateOut: true },
      { shape: "crystal", count: 4, startAngle: 45, radius: 54, size: 4, color: "#fcd34d" },
      { shape: "spark", count: 16, startAngle: 11.25, radius: 56, size: 2.2, color: "#fef3c7", opacity: 0.85 },
    ],
  },

  // Brushed gold ring, crown on top, crystal jewel trio beneath, filigree scrolls
  // at sides. The crown-jewel legendary.
  border_crown_jewel: {
    id: "crown-jewel",
    ring: {
      color: GOLD_STOPS,
      thickness: 3.2,
      opacity: 1,
      inner: { color: "#fef3c7", thickness: 0.9, opacity: 0.85, offset: 3.5 },
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(245,158,11,0.8)", blur: 8 },
    ornaments: [
      // Big crown on top
      { shape: "crown", count: 1, startAngle: 0, radius: 55, size: 13, color: [GOLD_HI, GOLD], rotateOut: true },
      // Crystal jewel trio beneath (ruby / royal / emerald heraldic set)
      { shape: "crystal", count: 1, startAngle: 180, radius: 53, size: 7, color: RUBY },
      { shape: "crystal", count: 1, startAngle: 150, radius: 52, size: 5.5, color: ROYAL },
      { shape: "crystal", count: 1, startAngle: 210, radius: 52, size: 5.5, color: EMERALD },
      // Filigree scrolls at side quarters
      { shape: "filigree", count: 2, startAngle: 90, radius: 51, size: 6, color: [GOLD_HI, GOLD], rotateOut: true },
      // Small gold sparks filling the gaps
      { shape: "spark", count: 8, startAngle: 22.5, radius: 48, size: 2.8, color: GOLD_HI, opacity: 0.9 },
    ],
  },

  // Four crossed-clave glyphs at cardinals + diamond crystals between + brushed
  // gold ring. Sacred rhythm / eternal ritual.
  border_eternal_clave: {
    id: "eternal-clave",
    ring: {
      color: GOLD_STOPS,
      thickness: 3,
      opacity: 1,
      inner: { color: GOLD_HI, thickness: 0.7, opacity: 0.8, offset: 3 },
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(245,158,11,0.8)", blur: 8 },
    ornaments: [
      // Four crossed-clave glyphs at cardinals
      { shape: "clave", count: 4, startAngle: 0, radius: 53, size: 8, color: [GOLD_HI, GOLD] },
      // Diamond crystals between claves (at 45s)
      { shape: "crystal", count: 4, startAngle: 45, radius: 52, size: 5, color: DIAMOND_STOPS[2] },
      // Filigree scrolls on the inner arc
      { shape: "filigree", count: 8, startAngle: 22.5, radius: 47.5, size: 3.5, color: GOLD_HI, opacity: 0.9 },
      // Inner ring of tiny sparks
      { shape: "dot", count: 16, startAngle: 0, radius: 45.5, size: 1.2, color: GOLD_HI, opacity: 0.65 },
    ],
  },
};
