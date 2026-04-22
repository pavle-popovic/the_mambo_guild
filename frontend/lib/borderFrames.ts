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
const BRONZE_STOPS = ["#451a03", "#9a3412", "#f97316", "#fed7aa", "#fbbf24", "#9a3412", "#451a03"];
const SILVER_STOPS = ["#334155", "#94a3b8", "#ffffff", "#f8fafc", "#cbd5e1", "#475569", "#1e293b"];
const GOLD_STOPS   = ["#451a03", "#b45309", "#fbbf24", "#ffffff", "#fde68a", "#d97706", "#78350f"];
const DIAMOND_STOPS = ["#7c3aed", "#60a5fa", "#ffffff", "#ede9fe", "#93c5fd", "#7c3aed"];
const AMBER_STOPS = ["#78350f", "#d97706", "#ffffff", "#fde68a", "#b45309"];
const COPPER_STOPS = ["#431407", "#9a3412", "#fb923c", "#ffffff", "#fcd34d", "#9a3412", "#431407"];
const ROSE_STOPS = ["#881337", "#e11d48", "#ffffff", "#fecdd3", "#be185d", "#881337"];
const EMERALD_STOPS = ["#022c22", "#059669", "#34d399", "#ffffff", "#a7f3d0", "#047857", "#022c22"];
const ROYAL_STOPS = ["#172554", "#1e40af", "#60a5fa", "#ffffff", "#bfdbfe", "#1d4ed8", "#172554"];
const VELVET_STOPS = ["#2e1065", "#6d28d9", "#a78bfa", "#ffffff", "#c4b5fd", "#5b21b6", "#2e1065"];
const RUBY_STOPS = ["#4c0519", "#be123c", "#f43f5e", "#ffffff", "#fecdd3", "#9f1239", "#4c0519"];
const NEON_STOPS = ["#831843", "#ec4899", "#ffffff", "#fbcfe8", "#db2777", "#831843"];
const OBSIDIAN_STOPS = ["#020617", "#1e293b", "#475569", "#e2e8f0", "#334155", "#0f172a", "#020617"];

// ---------------------------------------------------------------------------
// Spec registry
// ---------------------------------------------------------------------------

export const BORDER_FRAME_SPECS: Record<string, BorderFrameSpec> = {
  // -----------------------------------------------------------------------
  // COMMON — polished ring, subtle accents, no specular/bevel
  // -----------------------------------------------------------------------

  border_amber_glow: {
    id: "amber-glow",
    ring: { color: AMBER_STOPS, thickness: 2.4, opacity: 1 },
    specular: true,
    glow: { color: "rgba(251,191,36,0.55)", blur: 5 },
    ornaments: [
      { shape: "dot", count: 8, startAngle: 22.5, radius: 47, size: 2.4, color: AMBER },
    ],
  },

  border_ivory_etch: {
    id: "ivory-etch",
    ring: {
      color: ["#c0b89e", "#f5f1e0", "#ffffff", "#f5f1e0", "#a89e80"],
      thickness: 2.4,
      opacity: 1,
      inner: { color: IVORY, thickness: 0.6, opacity: 0.7, offset: 3.2, dash: "1 2" },
    },
    specular: true,
    glow: { color: "rgba(245,241,224,0.4)", blur: 4 },
    ornaments: [
      { shape: "dot", count: 16, startAngle: 0, radius: 47, size: 1, color: "#ffffff", opacity: 0.9 },
    ],
  },

  border_sunset: {
    id: "sunset",
    ring: { color: ["#9a3412", ORANGE, PINK, "#ffffff", PINK, ORANGE, "#9a3412"], thickness: 2.5, opacity: 1 },
    specular: true,
    glow: { color: "rgba(251,146,60,0.5)", blur: 5 },
    ornaments: [
      { shape: "petal", count: 4, startAngle: 45, radius: 49, size: 4.5, color: [ORANGE, PINK], rotateOut: true },
      { shape: "dot", count: 4, startAngle: 0, radius: 47, size: 1.8, color: PINK, opacity: 0.9 },
    ],
  },

  border_mint_ice: {
    id: "mint-ice",
    ring: { color: ["#047857", MINT, "#ffffff", MINT, "#047857"], thickness: 2.4, opacity: 1 },
    specular: true,
    glow: { color: "rgba(110,231,183,0.5)", blur: 5 },
    ornaments: [
      { shape: "diamond", count: 8, radius: 47, size: 2.3, color: MINT, opacity: 0.9 },
    ],
  },

  border_lavender_haze: {
    id: "lavender-haze",
    ring: { color: ["#6d28d9", LAVENDER, "#ffffff", LAVENDER, "#6d28d9"], thickness: 2.4, opacity: 1 },
    specular: true,
    glow: { color: "rgba(196,181,253,0.55)", blur: 5 },
    ornaments: [
      { shape: "star", count: 5, radius: 48, size: 3.2, color: LAVENDER },
      { shape: "dot", count: 10, startAngle: 18, radius: 46, size: 0.9, color: "#ddd6fe", opacity: 0.85 },
    ],
  },

  border_charcoal: {
    id: "charcoal",
    ring: {
      color: ["#0f172a", "#475569", "#cbd5e1", "#ffffff", "#64748b", "#1e293b"],
      thickness: 2.8,
      opacity: 1,
      inner: { color: "#9ca3af", thickness: 0.5, opacity: 0.55, offset: 2.2 },
    },
    specular: true,
    glow: { color: "rgba(148,163,184,0.4)", blur: 4 },
    ornaments: [
      { shape: "notch", count: 4, startAngle: 45, radius: 47, size: 3.8, color: "#cbd5e1", rotateOut: true },
    ],
  },

  // -----------------------------------------------------------------------
  // RARE — polished metallic ring + specular + 4–8 corner ornaments
  // -----------------------------------------------------------------------

  border_neon_salsa: {
    id: "neon-salsa",
    ring: { color: NEON_STOPS, thickness: 3, opacity: 1 },
    specular: true,
    bevel: true,
    glow: { color: "rgba(236,72,153,0.75)", blur: 6 },
    ornaments: [
      { shape: "diamond", count: 4, startAngle: 45, radius: 49, size: 4.5, color: [NEON_PINK, "#fbcfe8"] },
      { shape: "spark", count: 4, startAngle: 0, radius: 51, size: 3.8, color: "#ffffff" },
      { shape: "dot", count: 8, startAngle: 22.5, radius: 46, size: 1.5, color: NEON_PINK, opacity: 0.85 },
    ],
  },

  border_copper_flame: {
    id: "copper-flame",
    ring: { color: COPPER_STOPS, thickness: 3, opacity: 1 },
    specular: true,
    bevel: true,
    glow: { color: "rgba(217,119,6,0.7)", blur: 6 },
    ornaments: [
      { shape: "flame", count: 4, startAngle: 45, radius: 51, size: 5.5, color: [COPPER, COPPER_HI], rotateOut: true },
      { shape: "spark", count: 4, startAngle: 0, radius: 52, size: 3, color: "#ffffff" },
      { shape: "dot", count: 8, startAngle: 22.5, radius: 46, size: 1.4, color: COPPER_HI, opacity: 0.9 },
    ],
  },

  border_emerald_vein: {
    id: "emerald-vein",
    ring: {
      color: EMERALD_STOPS,
      thickness: 3,
      opacity: 1,
      inner: { color: GOLD_HI, thickness: 0.7, opacity: 0.85, offset: 3 },
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(16,185,129,0.65)", blur: 6 },
    ornaments: [
      { shape: "leaf", count: 4, startAngle: 0, radius: 51, size: 5.5, color: [EMERALD, "#6ee7b7"], rotateOut: true },
      { shape: "dot", count: 8, startAngle: 22.5, radius: 47, size: 1.5, color: GOLD_HI },
    ],
  },

  border_royal_blue: {
    id: "royal-blue",
    ring: {
      color: ROYAL_STOPS,
      thickness: 3,
      opacity: 1,
      inner: { color: "#ffffff", thickness: 0.7, opacity: 0.85, offset: 3 },
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(59,130,246,0.7)", blur: 6 },
    ornaments: [
      { shape: "fleur", count: 4, startAngle: 45, radius: 51, size: 5.5, color: [SILVER, "#ffffff"], rotateOut: true },
      { shape: "dot", count: 8, startAngle: 22.5, radius: 47, size: 1.6, color: "#ffffff" },
    ],
  },

  border_midnight_velvet: {
    id: "midnight-velvet",
    ring: { color: VELVET_STOPS, thickness: 3, opacity: 1 },
    specular: true,
    bevel: true,
    glow: { color: "rgba(124,58,237,0.75)", blur: 6 },
    ornaments: [
      { shape: "diamond", count: 8, startAngle: 22.5, radius: 49, size: 3.4, color: [VELVET, "#ffffff"] },
      { shape: "dot", count: 8, startAngle: 0, radius: 46.5, size: 1.3, color: "#c4b5fd" },
    ],
  },

  border_rose_gold: {
    id: "rose-gold",
    ring: { color: ROSE_STOPS, thickness: 3, opacity: 1 },
    specular: true,
    bevel: true,
    glow: { color: "rgba(253,164,175,0.7)", blur: 6 },
    ornaments: [
      { shape: "scroll", count: 4, startAngle: 45, radius: 49, size: 6.5, color: [ROSE, ROSE_HI], rotateOut: true },
      { shape: "dot", count: 8, startAngle: 22.5, radius: 47, size: 1.6, color: ROSE_HI },
    ],
  },

  // -----------------------------------------------------------------------
  // EPIC — thick metallic ring + specular + bevel + layered ornaments
  // -----------------------------------------------------------------------

  border_aurora: {
    id: "aurora",
    ring: {
      color: [AURORA_1, AURORA_2, "#ffffff", AURORA_3, AURORA_4, "#ffffff", AURORA_1],
      thickness: 3.8,
      opacity: 1,
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(236,72,153,0.75)", blur: 7 },
    ornaments: [
      { shape: "gem", count: 8, startAngle: 22.5, radius: 51, size: 5.5, color: [AURORA_2, AURORA_3] },
      { shape: "spark", count: 4, startAngle: 0, radius: 54, size: 5, color: AURORA_1 },
      { shape: "crystal", count: 4, startAngle: 45, radius: 54, size: 4, color: AURORA_2 },
      { shape: "dot", count: 8, startAngle: 22.5, radius: 46, size: 1.1, color: AURORA_4, opacity: 0.9 },
    ],
  },

  border_obsidian_flame: {
    id: "obsidian-flame",
    ring: {
      color: OBSIDIAN_STOPS,
      thickness: 4,
      opacity: 1,
      inner: { color: FLAME, thickness: 1.1, opacity: 1, offset: 3.8 },
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(249,115,22,0.85)", blur: 8 },
    ornaments: [
      { shape: "flame", count: 8, startAngle: 0, radius: 53, size: 5.5, color: [FLAME, "#facc15"], rotateOut: true },
      { shape: "diamond", count: 8, startAngle: 22.5, radius: 48, size: 2.6, color: [FLAME, "#fbbf24"] },
      { shape: "spark", count: 8, startAngle: 0, radius: 55, size: 2.5, color: "#fde68a", opacity: 0.95 },
    ],
  },

  border_holographic: {
    id: "holographic",
    ring: {
      color: [HOLO_1, HOLO_2, "#ffffff", HOLO_3, HOLO_4, "#ffffff", HOLO_1, HOLO_2],
      thickness: 3.8,
      opacity: 1,
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(167,139,250,0.8)", blur: 7 },
    ornaments: [
      { shape: "spark", count: 12, startAngle: 0, radius: 52, size: 4.5, color: [HOLO_2, HOLO_3] },
      { shape: "crystal", count: 4, startAngle: 22.5, radius: 54, size: 3.8, color: HOLO_1 },
      { shape: "dot", count: 12, startAngle: 15, radius: 47, size: 1.1, color: HOLO_1, opacity: 0.9 },
    ],
  },

  border_platinum_spark: {
    id: "platinum-spark",
    ring: {
      color: SILVER_STOPS,
      thickness: 3.8,
      opacity: 1,
      inner: { color: "#ffffff", thickness: 0.9, opacity: 0.9, offset: 3.2 },
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(229,228,226,0.8)", blur: 7 },
    ornaments: [
      { shape: "spark", count: 8, startAngle: 22.5, radius: 53, size: 5.5, color: "#ffffff" },
      { shape: "emblem", count: 4, startAngle: 0, radius: 51, size: 5.5, color: [PLATINUM, "#ffffff"] },
      { shape: "crystal", count: 4, startAngle: 45, radius: 55, size: 3.5, color: "#ffffff" },
      { shape: "dot", count: 8, startAngle: 22.5, radius: 47, size: 1.5, color: "#ffffff", opacity: 0.9 },
    ],
  },

  border_ruby_pulse: {
    id: "ruby-pulse",
    ring: {
      color: RUBY_STOPS,
      thickness: 3.8,
      opacity: 1,
      inner: { color: RUBY_HI, thickness: 0.9, opacity: 0.9, offset: 3.2 },
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(225,29,72,0.8)", blur: 7 },
    ornaments: [
      { shape: "crystal", count: 4, startAngle: 0, radius: 52, size: 6, color: RUBY },
      { shape: "gem", count: 4, startAngle: 45, radius: 50, size: 3.8, color: RUBY_HI },
      { shape: "spark", count: 8, startAngle: 22.5, radius: 54, size: 2.5, color: "#ffe4e6", opacity: 0.95 },
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
      thickness: 4.2,
      opacity: 1,
      inner: { color: "#fef3c7", thickness: 0.9, opacity: 0.9, offset: 3.8 },
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(249,115,22,0.9)", blur: 9 },
    ornaments: [
      { shape: "flame", count: 8, startAngle: 0, radius: 53, size: 7.5, color: [FLAME, "#fcd34d"], rotateOut: true },
      { shape: "flame", count: 8, startAngle: 22.5, radius: 51, size: 5, color: [RUBY, FLAME], rotateOut: true },
      { shape: "crystal", count: 4, startAngle: 45, radius: 55, size: 5, color: "#fcd34d" },
      { shape: "spark", count: 16, startAngle: 11.25, radius: 56, size: 2.6, color: "#fef3c7", opacity: 0.9 },
    ],
  },

  // Shiny platinum legendary. Bright SILVER_STOPS ring (same template as
  // Platinum Spark so it reads as polished metal), plus Eternal Clave's
  // ornament structure (4 big + 4 small crystals, full filigree ring, inner
  // dot ring) in diamond-white, topped by a prominent gold crown.
  border_crown_jewel: {
    id: "crown-jewel",
    ring: {
      color: SILVER_STOPS,
      thickness: 4.2,
      opacity: 1,
      inner: { color: "#ffffff", thickness: 1, opacity: 0.95, offset: 3.2 },
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(255,255,255,0.95)", blur: 10 },
    ornaments: [
      // Four big white crystals at cardinals (mirrors eternal_clave's claves)
      { shape: "crystal", count: 4, startAngle: 45, radius: 53, size: 7.5, color: "#ffffff" },
      // Four gold sparks between them for warmth + contrast against silver
      { shape: "spark", count: 4, startAngle: 90, radius: 54, size: 4.5, color: [GOLD_HI, GOLD] },
      // Full ring of filigree scrolls on the inner arc
      { shape: "filigree", count: 8, startAngle: 22.5, radius: 47.5, size: 3.8, color: "#ffffff", opacity: 0.95 },
      // Inner ring of tiny sparks
      { shape: "dot", count: 16, startAngle: 0, radius: 45.5, size: 1.3, color: "#ffffff", opacity: 0.9 },
      // Prominent gold crown on top — the royal centrepiece
      { shape: "crown", count: 1, startAngle: 0, radius: 59, size: 13, color: [GOLD_HI, GOLD], rotateOut: true },
    ],
  },

  // Four crossed-clave glyphs at cardinals + diamond crystals between + brushed
  // gold ring. Sacred rhythm / eternal ritual.
  border_eternal_clave: {
    id: "eternal-clave",
    ring: {
      color: GOLD_STOPS,
      thickness: 4,
      opacity: 1,
      inner: { color: GOLD_HI, thickness: 0.9, opacity: 0.9, offset: 3.2 },
    },
    specular: true,
    bevel: true,
    glow: { color: "rgba(245,158,11,0.9)", blur: 9 },
    ornaments: [
      // Four crossed-clave glyphs at cardinals
      { shape: "clave", count: 4, startAngle: 0, radius: 53, size: 8.5, color: [GOLD_HI, GOLD] },
      // Diamond crystals between claves (at 45s)
      { shape: "crystal", count: 4, startAngle: 45, radius: 53, size: 5.5, color: "#ffffff" },
      // Filigree scrolls on the inner arc
      { shape: "filigree", count: 8, startAngle: 22.5, radius: 47.5, size: 3.8, color: GOLD_HI, opacity: 0.95 },
      // Inner ring of tiny sparks
      { shape: "dot", count: 16, startAngle: 0, radius: 45.5, size: 1.3, color: GOLD_HI, opacity: 0.75 },
    ],
  },
};
