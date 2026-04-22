"use client";

import { memo } from "react";
import { BORDER_FRAME_SPECS, type BorderFrameSpec, type OrnamentShape } from "@/lib/borderFrames";

/**
 * BorderFrame — renders an elaborate SVG ornament frame around a round
 * avatar. Positioned absolutely with `inset: -8%` so the ring hugs the
 * avatar edge while ornaments extend just past it.
 *
 * The base avatar is a circle of radius ~40 centred at (50,50); ornaments
 * sit at radii 42–60 depending on how far they extend past the ring.
 *
 * Premium effects (opt-in via spec fields):
 *   spec.specular = true  → white-to-transparent arc at ~225° fakes a
 *                           top-left light reflection on the metal.
 *   spec.bevel    = true  → SVG inner-shadow filter on the ring gives
 *                           the stroke an embossed 3D depth.
 *
 * Metallic shading:
 *   Multi-stop colour arrays (4+ stops) on the ring auto-render as a
 *   brushed-metal gradient with a 35° angle, which makes bronze / silver /
 *   gold / diamond palettes read as real metal rather than flat fills.
 */
interface BorderFrameProps {
  sku?: string | null;
}

function BorderFrameInner({ sku }: BorderFrameProps) {
  if (!sku) return null;
  const spec = BORDER_FRAME_SPECS[sku];
  if (!spec) return null;

  const ringRadius = spec.ring?.radius ?? 43;
  const ringThickness = spec.ring?.thickness ?? 2;
  const bevelId = `bevel-${spec.id}`;

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className="pointer-events-none absolute"
      style={{
        inset: "-8%",
        width: "116%",
        height: "116%",
        overflow: "visible",
        filter: spec.glow
          ? `drop-shadow(0 0 ${spec.glow.blur}px ${spec.glow.color})`
          : undefined,
      }}
    >
      <defs>
        {renderGradients(spec)}
        {spec.bevel && renderBevelFilter(bevelId)}
      </defs>

      {/* Base ring */}
      {spec.ring && (
        <>
          <circle
            cx="50"
            cy="50"
            r={ringRadius}
            fill="none"
            stroke={gradientRef(`ring-${spec.id}`, spec.ring.color)}
            strokeWidth={ringThickness}
            strokeOpacity={spec.ring.opacity ?? 1}
            strokeDasharray={spec.ring.dash}
            strokeLinecap="round"
            filter={spec.bevel ? `url(#${bevelId})` : undefined}
          />
          {spec.ring.inner && (
            <circle
              cx="50"
              cy="50"
              r={ringRadius - (spec.ring.inner.offset ?? 3)}
              fill="none"
              stroke={gradientRef(`ring-inner-${spec.id}`, spec.ring.inner.color)}
              strokeWidth={spec.ring.inner.thickness}
              strokeOpacity={spec.ring.inner.opacity ?? 0.7}
              strokeDasharray={spec.ring.inner.dash}
            />
          )}
        </>
      )}

      {/* Specular highlight — bright white-to-transparent arc at top-left.
       * Drawn AFTER the ring so it sits on top and reads as reflected light.
       * Thick enough to be obvious at small preview sizes (thumbnails). */}
      {spec.specular && spec.ring && (
        <>
          <path
            d={buildArcPath(50, 50, ringRadius, 190, 270)}
            fill="none"
            stroke={`url(#specular-${spec.id})`}
            strokeWidth={ringThickness * 0.9}
            strokeLinecap="round"
            opacity={1}
          />
          {/* Secondary short gleam for extra dimension */}
          <path
            d={buildArcPath(50, 50, ringRadius, 210, 245)}
            fill="none"
            stroke="white"
            strokeWidth={ringThickness * 0.35}
            strokeLinecap="round"
            opacity={0.95}
          />
        </>
      )}

      {/* Ornaments */}
      {spec.ornaments?.flatMap((layer, li) => {
        const items = [];
        const { count, startAngle = 0, radius, size, shape, color, opacity, rotateOut } = layer;
        for (let i = 0; i < count; i++) {
          const angle = startAngle + (360 / count) * i;
          const rad = (angle - 90) * (Math.PI / 180);
          const x = 50 + Math.cos(rad) * radius;
          const y = 50 + Math.sin(rad) * radius;
          const rot = rotateOut ? angle : 0;
          items.push(
            <g
              key={`${li}-${i}`}
              transform={`translate(${x},${y}) rotate(${rot}) scale(${size / 10})`}
              opacity={opacity ?? 1}
            >
              {renderShape(shape, gradientRef(`orn-${spec.id}-${li}`, color), spec.id, li)}
            </g>
          );
        }
        return items;
      })}
    </svg>
  );
}

export const BorderFrame = memo(BorderFrameInner);

// ---------------------------------------------------------------------------
// Shape paths. Each shape is drawn at origin (0,0), designed at size 10
// (meaning ornament spec.size is the visual diameter in SVG units).
// ---------------------------------------------------------------------------

function renderShape(
  shape: OrnamentShape,
  fill: string,
  specId: string,
  layerIndex: number
): JSX.Element {
  switch (shape) {
    case "dot":
      return <circle cx="0" cy="0" r="5" fill={fill} />;
    case "diamond":
      return <path d="M 0 -5 L 5 0 L 0 5 L -5 0 Z" fill={fill} />;
    case "spark":
      return (
        <path
          d="M 0 -6 L 1.2 -1.2 L 6 0 L 1.2 1.2 L 0 6 L -1.2 1.2 L -6 0 L -1.2 -1.2 Z"
          fill={fill}
        />
      );
    case "star":
      return (
        <path
          d="M 0 -5 L 1.47 -1.55 L 4.76 -1.55 L 2.14 0.59 L 3.09 4.05 L 0 2 L -3.09 4.05 L -2.14 0.59 L -4.76 -1.55 L -1.47 -1.55 Z"
          fill={fill}
        />
      );
    case "leaf":
      return (
        <path
          d="M 0 -7 Q 3 -3 2.5 0 Q 2 3 0 6 Q -2 3 -2.5 0 Q -3 -3 0 -7 Z"
          fill={fill}
        />
      );
    case "flame":
      return (
        <path
          d="M 0 -8 Q 2.5 -4 2 -1 Q 3.5 1 2.5 3 Q 1 5 0 5 Q -1 5 -2.5 3 Q -3.5 1 -2 -1 Q -2.5 -4 0 -8 Z"
          fill={fill}
        />
      );
    case "scroll":
      return (
        <path
          d="M -4 -3 Q -4 -5 -1.5 -5 Q 2 -5 2 -2 Q 2 1 -1 1 Q -2.5 1 -2.5 -0.5 Q -2.5 -2 -1 -2 Q 0 -2 0 -1"
          fill="none"
          stroke={fill}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      );
    case "gem": {
      // Faceted hex gem with top-face highlight and inner shine line.
      const shineId = `gem-shine-${specId}-${layerIndex}`;
      return (
        <>
          <path
            d="M 0 -5 L 4.3 -2.5 L 4.3 2.5 L 0 5 L -4.3 2.5 L -4.3 -2.5 Z"
            fill={fill}
          />
          <path
            d="M 0 -5 L 4.3 -2.5 L 2 -1 L -2 -1 L -4.3 -2.5 Z"
            fill={`url(#${shineId})`}
          />
          <defs>
            <linearGradient id={shineId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.6" />
              <stop offset="100%" stopColor="white" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </>
      );
    }
    case "fleur":
      return (
        <path
          d="M 0 -6 L 1.5 -2 Q 3 -3 3 -1 Q 3 1 0 1.5 Q -3 1 -3 -1 Q -3 -3 -1.5 -2 Z M -2.5 2 Q 0 4 2.5 2 L 1.5 4 Q 0 5 -1.5 4 Z"
          fill={fill}
        />
      );
    case "wing":
      return (
        <path
          d="M 0 0 Q -4 -2 -8 -1 Q -6 0 -8 2 Q -4 1 0 2 Z"
          fill={fill}
          opacity="0.9"
        />
      );
    case "crown":
      return (
        <path
          d="M -5 2 L -3.5 -3 L -2 0 L 0 -4 L 2 0 L 3.5 -3 L 5 2 Z M -5 2 L 5 2 L 5 3.5 L -5 3.5 Z"
          fill={fill}
        />
      );
    case "clave":
      return (
        <g>
          <rect x="-6" y="-0.8" width="12" height="1.6" rx="0.8" fill={fill} transform="rotate(30)" />
          <rect x="-6" y="-0.8" width="12" height="1.6" rx="0.8" fill={fill} transform="rotate(-30)" />
          <circle cx="0" cy="0" r="1.2" fill={fill} />
        </g>
      );
    case "notch":
      return (
        <path
          d="M -4 -4 L 4 -4 L 4 -2.5 L -2.5 -2.5 L -2.5 4 L -4 4 Z"
          fill={fill}
        />
      );
    case "petal":
      return (
        <path
          d="M 0 -7 Q 2.5 -4 2 0 Q 0 3 0 3 Q 0 3 -2 0 Q -2.5 -4 0 -7 Z"
          fill={fill}
        />
      );
    case "crystal": {
      // Faceted crystalline gem: diamond silhouette split into 5 facets
      // with a prism gradient (white → cool blue → violet) for dispersion.
      // Reads as a multi-cut jewel rather than a flat polygon.
      const prismId = `crystal-prism-${specId}-${layerIndex}`;
      const rimId = `crystal-rim-${specId}-${layerIndex}`;
      return (
        <>
          <defs>
            <linearGradient id={prismId} x1="0" y1="-1" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#e0f2fe" />
              <stop offset="55%" stopColor="#93c5fd" />
              <stop offset="80%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <linearGradient id={rimId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* Body */}
          <path
            d="M 0 -6 L 4.5 -1.5 L 0 6 L -4.5 -1.5 Z"
            fill={`url(#${prismId})`}
          />
          {/* Top-left facet highlight */}
          <path
            d="M 0 -6 L -4.5 -1.5 L 0 -1.5 Z"
            fill="white"
            fillOpacity="0.75"
          />
          {/* Right facet mid-tone */}
          <path
            d="M 0 -6 L 4.5 -1.5 L 0 -1.5 Z"
            fill="white"
            fillOpacity="0.35"
          />
          {/* Inner cut lines */}
          <path
            d="M -4.5 -1.5 L 4.5 -1.5 M 0 -6 L 0 6"
            stroke="white"
            strokeWidth="0.35"
            strokeOpacity="0.7"
            fill="none"
          />
          {/* Sparkle */}
          <circle cx="-1.5" cy="-3" r="0.7" fill="white" fillOpacity="0.95" />
          {/* Rim outline */}
          <path
            d="M 0 -6 L 4.5 -1.5 L 0 6 L -4.5 -1.5 Z"
            fill="none"
            stroke={`url(#${rimId})`}
            strokeWidth="0.3"
          />
          {/* Edge tint from fill colour so tinted crystals (ruby/emerald) register */}
          <path
            d="M 0 -6 L 4.5 -1.5 L 0 6 L -4.5 -1.5 Z"
            fill={fill}
            fillOpacity="0.3"
          />
        </>
      );
    }
    case "filigree":
      // Elaborate S-curl filigree: two mirrored scrolls around a centre stem.
      return (
        <g>
          <path
            d="M 0 -5 C 2 -4 3.5 -2 3 0 C 2.5 2 0.5 2 0 1 M 0 -5 C -2 -4 -3.5 -2 -3 0 C -2.5 2 -0.5 2 0 1"
            fill="none"
            stroke={fill}
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          <path
            d="M 0 1 L 0 5 M -1.5 3.5 L 1.5 3.5"
            fill="none"
            stroke={fill}
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          <circle cx="0" cy="-5" r="0.9" fill={fill} />
        </g>
      );
    case "emblem":
      // Oval cartouche with inner line — acts as a framed accent plaque.
      return (
        <g>
          <ellipse cx="0" cy="0" rx="4.5" ry="3" fill={fill} />
          <ellipse cx="0" cy="0" rx="3.2" ry="1.8" fill="none" stroke="white" strokeOpacity="0.45" strokeWidth="0.5" />
          <circle cx="0" cy="0" r="0.9" fill="white" fillOpacity="0.7" />
        </g>
      );
    default:
      return <circle cx="0" cy="0" r="3" fill={fill} />;
  }
}

// ---------------------------------------------------------------------------
// SVG helpers
// ---------------------------------------------------------------------------

/**
 * Build an SVG arc path from (cx, cy) with given radius, sweeping from
 * startAngle to endAngle (degrees, SVG convention: 0° = east, 90° = south).
 */
function buildArcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function renderBevelFilter(id: string): JSX.Element {
  // Composite drop-shadow + highlight to make rings read as embossed metal
  // at small sizes. Stronger offset + dedicated highlight give obvious 3D.
  return (
    <filter key={id} id={id} x="-40%" y="-40%" width="180%" height="180%">
      {/* Dark underside shadow */}
      <feGaussianBlur in="SourceAlpha" stdDeviation="0.9" result="shadowBlur" />
      <feOffset in="shadowBlur" dx="0.6" dy="1" result="offsetShadow" />
      <feComponentTransfer in="offsetShadow" result="fadedShadow">
        <feFuncA type="linear" slope="0.9" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode in="fadedShadow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

// ---------------------------------------------------------------------------
// Gradient helpers
// ---------------------------------------------------------------------------

function renderGradients(spec: BorderFrameSpec): JSX.Element[] {
  const defs: JSX.Element[] = [];

  // Ring gradient — use 35° angle so multi-stop metallic palettes read
  // as brushed metal rather than a flat top-to-bottom fade.
  if (spec.ring && Array.isArray(spec.ring.color)) {
    defs.push(linearGrad(`ring-${spec.id}`, spec.ring.color, 35));
  }
  if (spec.ring?.inner && Array.isArray(spec.ring.inner.color)) {
    defs.push(linearGrad(`ring-inner-${spec.id}`, spec.ring.inner.color, 35));
  }
  spec.ornaments?.forEach((layer, li) => {
    if (Array.isArray(layer.color)) {
      defs.push(linearGrad(`orn-${spec.id}-${li}`, layer.color));
    }
  });

  // Specular gradient — white highlight that fades at both arc ends.
  if (spec.specular) {
    defs.push(
      <linearGradient key={`spec-${spec.id}`} id={`specular-${spec.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="white" stopOpacity="0" />
        <stop offset="50%" stopColor="white" stopOpacity="0.95" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </linearGradient>
    );
  }

  return defs;
}

function linearGrad(id: string, stops: string[], angleDeg = 45): JSX.Element {
  // Convert angle to x1/y1/x2/y2 on a unit box.
  const rad = (angleDeg * Math.PI) / 180;
  const x2 = 50 + 50 * Math.cos(rad);
  const y2 = 50 + 50 * Math.sin(rad);
  const x1 = 100 - x2;
  const y1 = 100 - y2;
  return (
    <linearGradient
      key={id}
      id={id}
      x1={`${x1}%`}
      y1={`${y1}%`}
      x2={`${x2}%`}
      y2={`${y2}%`}
    >
      {stops.map((c, i) => (
        <stop key={i} offset={`${(i / (stops.length - 1)) * 100}%`} stopColor={c} />
      ))}
    </linearGradient>
  );
}

function gradientRef(id: string, color: string | string[]): string {
  if (Array.isArray(color)) return `url(#${id})`;
  return color;
}

export default BorderFrame;
