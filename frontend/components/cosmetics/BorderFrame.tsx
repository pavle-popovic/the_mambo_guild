"use client";

import { memo } from "react";
import { BORDER_FRAME_SPECS, type BorderFrameSpec, type OrnamentShape } from "@/lib/borderFrames";

/**
 * BorderFrame — renders an elaborate SVG ornament frame around a round
 * avatar. Positioned absolutely with `inset: -20%` so ornaments can float
 * outside the avatar bounds. Rendered as one inline SVG (viewBox 0 0 100 100)
 * with each ornament placed at a specified angle/radius around the circle.
 *
 * The base avatar is a circle of radius ~40 centred at (50,50); ornaments
 * sit at radii 42–60 depending on how far they extend past the ring.
 */
interface BorderFrameProps {
  sku?: string | null;
}

function BorderFrameInner({ sku }: BorderFrameProps) {
  if (!sku) return null;
  const spec = BORDER_FRAME_SPECS[sku];
  if (!spec) return null;

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className="pointer-events-none absolute"
      style={{
        inset: "-22%",
        width: "144%",
        height: "144%",
        overflow: "visible",
        filter: spec.glow
          ? `drop-shadow(0 0 ${spec.glow.blur}px ${spec.glow.color})`
          : undefined,
      }}
    >
      <defs>
        {renderGradients(spec)}
      </defs>

      {/* Base ring — drawn as a circle stroke, optionally with a dashed
          inner accent */}
      {spec.ring && (
        <>
          <circle
            cx="50"
            cy="50"
            r={spec.ring.radius ?? 43}
            fill="none"
            stroke={gradientRef(`ring-${spec.id}`, spec.ring.color)}
            strokeWidth={spec.ring.thickness}
            strokeOpacity={spec.ring.opacity ?? 1}
            strokeDasharray={spec.ring.dash}
            strokeLinecap="round"
          />
          {spec.ring.inner && (
            <circle
              cx="50"
              cy="50"
              r={(spec.ring.radius ?? 43) - (spec.ring.inner.offset ?? 3)}
              fill="none"
              stroke={gradientRef(`ring-inner-${spec.id}`, spec.ring.inner.color)}
              strokeWidth={spec.ring.inner.thickness}
              strokeOpacity={spec.ring.inner.opacity ?? 0.7}
              strokeDasharray={spec.ring.inner.dash}
            />
          )}
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
              {renderShape(shape, gradientRef(`orn-${spec.id}-${li}`, color))}
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

function renderShape(shape: OrnamentShape, fill: string): JSX.Element {
  switch (shape) {
    case "dot":
      return <circle cx="0" cy="0" r="5" fill={fill} />;
    case "diamond":
      return <path d="M 0 -5 L 5 0 L 0 5 L -5 0 Z" fill={fill} />;
    case "spark":
      // Elongated 4-point sparkle
      return (
        <path
          d="M 0 -6 L 1.2 -1.2 L 6 0 L 1.2 1.2 L 0 6 L -1.2 1.2 L -6 0 L -1.2 -1.2 Z"
          fill={fill}
        />
      );
    case "star":
      // 5-point star
      return (
        <path
          d="M 0 -5 L 1.47 -1.55 L 4.76 -1.55 L 2.14 0.59 L 3.09 4.05 L 0 2 L -3.09 4.05 L -2.14 0.59 L -4.76 -1.55 L -1.47 -1.55 Z"
          fill={fill}
        />
      );
    case "leaf":
      // Tapered leaf pointing outward (use rotateOut to align)
      return (
        <path
          d="M 0 -7 Q 3 -3 2.5 0 Q 2 3 0 6 Q -2 3 -2.5 0 Q -3 -3 0 -7 Z"
          fill={fill}
        />
      );
    case "flame":
      // Flame tongue, base at bottom pointing up (rotateOut flips outward)
      return (
        <path
          d="M 0 -8 Q 2.5 -4 2 -1 Q 3.5 1 2.5 3 Q 1 5 0 5 Q -1 5 -2.5 3 Q -3.5 1 -2 -1 Q -2.5 -4 0 -8 Z"
          fill={fill}
        />
      );
    case "scroll":
      // C-scroll filigree (use rotateOut for corner placement)
      return (
        <path
          d="M -4 -3 Q -4 -5 -1.5 -5 Q 2 -5 2 -2 Q 2 1 -1 1 Q -2.5 1 -2.5 -0.5 Q -2.5 -2 -1 -2 Q 0 -2 0 -1"
          fill="none"
          stroke={fill}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      );
    case "gem":
      // Hex gem with top-half highlight
      return (
        <>
          <path
            d="M 0 -5 L 4.3 -2.5 L 4.3 2.5 L 0 5 L -4.3 2.5 L -4.3 -2.5 Z"
            fill={fill}
          />
          <path
            d="M 0 -5 L 4.3 -2.5 L 2 -1 L -2 -1 L -4.3 -2.5 Z"
            fill="white"
            fillOpacity="0.35"
          />
        </>
      );
    case "fleur":
      // Fleur-de-lis (stylised)
      return (
        <path
          d="M 0 -6 L 1.5 -2 Q 3 -3 3 -1 Q 3 1 0 1.5 Q -3 1 -3 -1 Q -3 -3 -1.5 -2 Z M -2.5 2 Q 0 4 2.5 2 L 1.5 4 Q 0 5 -1.5 4 Z"
          fill={fill}
        />
      );
    case "wing":
      // Feathered wing (use rotateOut and mirror via negative size for pairs)
      return (
        <path
          d="M 0 0 Q -4 -2 -8 -1 Q -6 0 -8 2 Q -4 1 0 2 Z"
          fill={fill}
          opacity="0.9"
        />
      );
    case "crown":
      // 3-point crown silhouette (rotateOut recommended so it points outward)
      return (
        <path
          d="M -5 2 L -3.5 -3 L -2 0 L 0 -4 L 2 0 L 3.5 -3 L 5 2 Z M -5 2 L 5 2 L 5 3.5 L -5 3.5 Z"
          fill={fill}
        />
      );
    case "clave":
      // Two crossed sticks (X pattern)
      return (
        <g>
          <rect x="-6" y="-0.8" width="12" height="1.6" rx="0.8" fill={fill} transform="rotate(30)" />
          <rect x="-6" y="-0.8" width="12" height="1.6" rx="0.8" fill={fill} transform="rotate(-30)" />
          <circle cx="0" cy="0" r="1.2" fill={fill} />
        </g>
      );
    case "notch":
      // Small corner notch L-bracket (rotateOut for corner placement)
      return (
        <path
          d="M -4 -4 L 4 -4 L 4 -2.5 L -2.5 -2.5 L -2.5 4 L -4 4 Z"
          fill={fill}
        />
      );
    case "petal":
      // Teardrop pointing outward
      return (
        <path
          d="M 0 -7 Q 2.5 -4 2 0 Q 0 3 0 3 Q 0 3 -2 0 Q -2.5 -4 0 -7 Z"
          fill={fill}
        />
      );
    default:
      return <circle cx="0" cy="0" r="3" fill={fill} />;
  }
}

// ---------------------------------------------------------------------------
// Gradient helpers
// ---------------------------------------------------------------------------

function renderGradients(spec: BorderFrameSpec): JSX.Element[] {
  const defs: JSX.Element[] = [];
  if (spec.ring && Array.isArray(spec.ring.color)) {
    defs.push(linearGrad(`ring-${spec.id}`, spec.ring.color));
  }
  if (spec.ring?.inner && Array.isArray(spec.ring.inner.color)) {
    defs.push(linearGrad(`ring-inner-${spec.id}`, spec.ring.inner.color));
  }
  spec.ornaments?.forEach((layer, li) => {
    if (Array.isArray(layer.color)) {
      defs.push(linearGrad(`orn-${spec.id}-${li}`, layer.color));
    }
  });
  return defs;
}

function linearGrad(id: string, stops: string[]): JSX.Element {
  return (
    <linearGradient key={id} id={id} x1="0%" y1="0%" x2="100%" y2="100%">
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
