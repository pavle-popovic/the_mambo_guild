"use client";

import { memo, useMemo, type CSSProperties, type ReactElement } from "react";
import { BaseEdge, getStraightPath, type EdgeProps } from "@xyflow/react";

export type GoldEdgeData = {
  status: 'locked' | 'available' | 'mastered';
  progress?: number; // 0-100 percentage
  lowPower?: boolean;
  [key: string]: unknown;
};

function GoldEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps) {
  const edgeData = data as GoldEdgeData | undefined;
  const status = edgeData?.status || 'locked';
  const progress = edgeData?.progress ?? 0; // 0-100
  const lowPower = edgeData?.lowPower === true;
  const isLocked = status === 'locked';
  const isAvailable = status === 'available';
  const isMastered = status === 'mastered';
  const hasProgress = progress > 0 && progress < 100;

  // Get the straight path from React Flow
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  // Hoisted above the low-power early return so the Rules of Hooks stay
  // satisfied on every render, regardless of which branch we take below.
  const pathLength = useMemo(() => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    return Math.sqrt(dx * dx + dy * dy);
  }, [sourceX, sourceY, targetX, targetY]);

  // ============================================================
  // LOW-POWER BRANCH (mobile, reduced-motion)
  // The default render stacks per-edge feGaussianBlur filters and
  // 5–10 infinite framer-motion paths. Multiplied by every lit
  // edge in a course, that's what tanks mobile framerate once a
  // student has completed several modules. Render a static
  // equivalent instead — same three states, zero filters, zero
  // motion loops.
  // ============================================================
  if (lowPower) {
    // Shared straight-path strokes; pick style per status.
    let strokes: ReactElement[];
    if (isMastered) {
      strokes = [
        <path
          key="halo"
          d={edgePath}
          fill="none"
          stroke="rgba(255, 215, 0, 0.25)"
          strokeWidth={6}
          strokeLinecap="round"
        />,
        <path
          key="main"
          d={edgePath}
          fill="none"
          stroke="#F4D03F"
          strokeWidth={2.5}
          strokeLinecap="round"
        />,
      ];
    } else if (isAvailable) {
      strokes = [
        <path
          key="halo"
          d={edgePath}
          fill="none"
          stroke="rgba(255, 215, 0, 0.18)"
          strokeWidth={5}
          strokeLinecap="round"
        />,
        <path
          key="main"
          d={edgePath}
          fill="none"
          stroke="#E6C84A"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="10 6"
        />,
      ];
    } else {
      strokes = [
        <path
          key="main"
          d={edgePath}
          fill="none"
          stroke="rgba(160, 160, 180, 0.45)"
          strokeWidth={1.5}
          strokeDasharray="6 10"
          strokeLinecap="round"
        />,
      ];
    }

    if (!hasProgress) {
      return <g>{strokes}</g>;
    }

    // Static progress indicator (no animated badge ring, no glow dot).
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;
    return (
      <g>
        {strokes}
        <g transform={`translate(${midX}, ${midY})`}>
          <circle r={12} fill="rgba(15, 15, 20, 0.95)" stroke="rgba(100, 90, 60, 0.5)" strokeWidth={1} />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FFD700"
            fontSize={8}
            fontWeight="bold"
            fontFamily="system-ui, sans-serif"
          >
            {Math.round(progress)}%
          </text>
        </g>
      </g>
    );
  }

  // Calculate midpoint for progress badge
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  // Progress indicator calculations
  const progressLength = (progress / 100) * pathLength;
  const remainingLength = pathLength - progressLength;

  // Circular progress badge calculations
  const badgeRadius = 14;
  const badgeCircumference = 2 * Math.PI * 10; // Inner progress ring radius = 10
  const badgeStrokeDasharray = `${(progress / 100) * badgeCircumference} ${badgeCircumference}`;

  // Animations below run via CSS @keyframes defined in <SkillTreeDefs />.
  // We pass a per-edge travel distance through a CSS custom property so one
  // shared keyframe handles every edge regardless of length.
  const travelStyle = (duration: number, delay = 0, extra = 0): CSSProperties =>
    ({
      animation: `st-pulse-travel ${duration}s ease-in-out ${delay}s infinite`,
      ["--st-travel" as string]: `${-(pathLength + extra)}px`,
    } as CSSProperties);

  return (
    <g>
      {/* ============================================
          LAYER 1: BASE TRACK
          ============================================ */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: isLocked ? "rgba(140, 140, 160, 0.4)" : "rgba(200, 180, 120, 0.3)",
          strokeWidth: isMastered ? 4 : 2,
        }}
      />

      {/* ============================================
          LOCKED STATE: Dashed overlay
          ============================================ */}
      {isLocked && (
        <path
          d={edgePath}
          fill="none"
          stroke="rgba(180, 180, 200, 0.5)"
          strokeWidth={1.5}
          strokeDasharray="6 10"
          strokeLinecap="round"
        />
      )}

      {/* ============================================
          AVAILABLE STATE: Flickering between gold and gray
          ============================================
          Two flickering gold layers + one traveling spark. The old render
          stacked five animated paths and three blurred auras — this keeps
          the same flickering feel at a fraction of the paint cost. */}
      {isAvailable && (
        <>
          <path
            d={edgePath}
            fill="none"
            stroke="rgba(100, 100, 120, 0.4)"
            strokeWidth={2}
            strokeLinecap="round"
          />
          {/* Flickering gold halo (wide semi-transparent stroke — no CSS
              blur, so the browser doesn't have to re-rasterize a huge
              bounding box every frame). */}
          <path
            d={edgePath}
            fill="none"
            stroke="rgba(255, 215, 0, 0.35)"
            strokeWidth={8}
            strokeLinecap="round"
            style={{ animation: "st-available-flicker 2.5s ease-in-out infinite" }}
          />
          {/* Flickering main gold line (shared gradient + shared glow filter). */}
          <path
            d={edgePath}
            fill="none"
            stroke="url(#st-gold)"
            strokeWidth={2.5}
            strokeLinecap="round"
            filter="url(#st-glow)"
            style={{ animation: "st-available-flicker 2.5s ease-in-out infinite" }}
          />
          {/* Traveling spark. strokeDasharray is per-edge (uses pathLength),
              but the motion itself is a shared CSS keyframe driven by a CSS
              custom property. */}
          <path
            d={edgePath}
            fill="none"
            stroke="rgba(255, 255, 240, 0.95)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={`8 ${pathLength}`}
            filter="url(#st-pulse-glow)"
            style={travelStyle(2.5, 0, 8)}
          />
        </>
      )}

      {/* ============================================
          MASTERED STATE: Flowing gold
          ============================================
          Down from 8 animated paths to 5. The widest strokeWidth=28 +
          filter:blur(12px) aura was the biggest cost per edge — replaced
          with a wide semi-transparent stroke that gives a similar halo
          without forcing the compositor to box-blur a huge bounding box.
          All animations are CSS keyframes (see SkillTreeDefs). */}
      {isMastered && (
        <>
          {/* Wide halo — no CSS blur, no animation. */}
          <path
            d={edgePath}
            fill="none"
            stroke="rgba(255, 215, 0, 0.18)"
            strokeWidth={12}
            strokeLinecap="round"
          />
          {/* Breathing outer glow. Opacity-only CSS animation; single shared
              keyframe; no per-frame React work. */}
          <path
            d={edgePath}
            fill="none"
            stroke="rgba(255, 215, 0, 0.4)"
            strokeWidth={6}
            strokeLinecap="round"
            filter="url(#st-glow)"
            style={{ animation: "st-aura-breathe 2.5s ease-in-out infinite" }}
          />
          {/* Main gold line (shared gradient + shared glow filter). */}
          <path
            d={edgePath}
            fill="none"
            stroke="url(#st-gold)"
            strokeWidth={3}
            strokeLinecap="round"
            filter="url(#st-glow)"
          />
          {/* Bright core — solid, cheap. */}
          <path
            d={edgePath}
            fill="none"
            stroke="rgba(255, 255, 240, 0.7)"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          {/* Flowing gold particles (repeating dash; shared CSS keyframe). */}
          <path
            d={edgePath}
            fill="none"
            stroke="url(#st-gold)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="8 24"
            style={{
              opacity: 0.85,
              animation: "st-dash-flow 1.5s linear infinite",
            }}
          />
          {/* Traveling white-hot pulse. Per-edge travel distance via CSS var,
              shared keyframe. */}
          <path
            d={edgePath}
            fill="none"
            stroke="rgba(255, 255, 250, 1)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`15 ${pathLength}`}
            filter="url(#st-pulse-glow)"
            style={travelStyle(1.8, 0, 15)}
          />
        </>
      )}

      {/* ============================================
          PROGRESS INDICATOR (for in-progress levels)
          Shows gradient fill along edge + circular badge
          ============================================ */}
      {hasProgress && (
        <>
          {/* Progress fill along edge (gold portion) */}
          <path
            d={edgePath}
            fill="none"
            stroke="url(#st-gold)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${progressLength} ${remainingLength}`}
            filter="url(#st-glow)"
            opacity={0.9}
          />

          {/* Remaining track (gray portion) */}
          <path
            d={edgePath}
            fill="none"
            stroke="rgba(80, 80, 100, 0.5)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={`${remainingLength} ${progressLength}`}
            strokeDashoffset={-progressLength}
          />

          {/* Circular Progress Badge at midpoint */}
          <g transform={`translate(${midX}, ${midY})`}>
            {/* Badge background */}
            <circle
              r={badgeRadius}
              fill="rgba(15, 15, 20, 0.95)"
              stroke="rgba(100, 90, 60, 0.4)"
              strokeWidth={1}
            />

            {/* Progress ring background */}
            <circle
              r={10}
              fill="none"
              stroke="rgba(60, 60, 80, 0.5)"
              strokeWidth={2.5}
            />

            {/* Progress ring fill — static stroke-dasharray reflecting the
                current progress %. The old render used motion.circle to
                tween from 0 on mount; the intro animation isn't worth a
                per-edge framer-motion instance that runs forever in the
                background. */}
            <circle
              r={10}
              fill="none"
              stroke="#FFD700"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray={badgeStrokeDasharray}
              strokeDashoffset={badgeCircumference / 4}
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "center",
              }}
            />

            {/* Percentage text */}
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fill="#FFD700"
              fontSize={8}
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              {Math.round(progress)}%
            </text>
          </g>
        </>
      )}
    </g>
  );
}

export default memo(GoldEdge);
