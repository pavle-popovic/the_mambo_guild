"use client";

import { memo } from "react";

/**
 * Shared SVG defs + CSS keyframes for the skill tree.
 *
 * Why: GoldEdge and SkillNode used to each define their own linearGradient
 * and feGaussianBlur filter chains. With ~30 edges and ~20 mastered nodes
 * that's ~60 GPU filter graphs on screen, all doing the same work.
 * Every framer-motion infinite loop also ran its own RAF instance on the
 * main thread. Hoisting the gradient/filter into one <defs> and animating
 * via CSS @keyframes lets the browser cache the filter once and run the
 * loops on the compositor.
 *
 * Mount this component exactly once per skill-tree page. The zero-size
 * SVG wrapper lets any other SVG on the page resolve url(#st-*) against
 * the document.
 */
function SkillTreeDefs() {
  return (
    <>
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
        style={{ position: "absolute", pointerEvents: "none" }}
      >
        <defs>
          <linearGradient id="st-gold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C9A227" />
            <stop offset="25%" stopColor="#F4D03F" />
            <stop offset="50%" stopColor="#FFE066" />
            <stop offset="75%" stopColor="#F4D03F" />
            <stop offset="100%" stopColor="#C9A227" />
          </linearGradient>

          {/* Single-pass glow. Cheaper than the old stacked
              stdDeviation=4 + stdDeviation=8 + feMerge we had per edge. */}
          <filter
            id="st-glow"
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="3" />
          </filter>

          {/* Slightly wider glow for the traveling pulse. */}
          <filter
            id="st-pulse-glow"
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
      </svg>

      <style>{`
        /* -------------------- edge animations -------------------- */
        @keyframes st-dash-flow {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -32; }
        }
        @keyframes st-pulse-travel {
          0%   { stroke-dashoffset: 0; opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { stroke-dashoffset: var(--st-travel, -200px); opacity: 0; }
        }
        @keyframes st-available-flicker {
          0%, 100% { opacity: 0.15; }
          30%      { opacity: 0.75; }
          50%      { opacity: 1; }
          70%      { opacity: 0.75; }
        }
        @keyframes st-aura-breathe {
          0%, 100% { opacity: 0.25; }
          50%      { opacity: 0.6; }
        }

        /* -------------------- node animations --------------------
           Two flavors of "breathe" (scale + opacity) — one for elements
           centered by a flex parent (no translate), one for elements
           positioned via left:50% top:50% translate(-50%, -50%). Merging
           them into a single keyframe would fight the layout. */
        @keyframes st-rotate      { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
        @keyframes st-rotate-rev  { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }
        @keyframes st-node-float  {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-3px); }
        }
        /* Ray/starburst animate scaleY only; rotation lives on a static
           parent wrapper so we don't have to thread it through transform. */
        @keyframes st-ray-pulse {
          0%, 100% { opacity: 0.2; transform: scaleY(0.7); }
          50%      { opacity: 0.5; transform: scaleY(1.2); }
        }
        @keyframes st-starburst {
          0%, 100% { opacity: 0.6; transform: scaleY(0.8); }
          50%      { opacity: 1;   transform: scaleY(1); }
        }
        /* Flex-centered breathe (no translate). */
        @keyframes st-breathe-soft {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 0.7; transform: scale(1.15); }
        }
        @keyframes st-breathe-strong {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.2); }
        }
        /* Translate-preserving breathe (for left:50% top:50% elements). */
        @keyframes st-breathe-soft-t {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 0.6; transform: translate(-50%, -50%) scale(1.2); }
        }
        @keyframes st-breathe-strong-t {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 0.9; transform: translate(-50%, -50%) scale(1.4); }
        }
        @keyframes st-icon-pop {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.1); }
        }
      `}</style>
    </>
  );
}

export default memo(SkillTreeDefs);
