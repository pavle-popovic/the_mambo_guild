"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { Lock, Star, Crown } from "lucide-react";

// Data passed to the node
export type SkillNodeData = {
  id: string;
  title: string;
  icon?: string;
  status: 'locked' | 'available' | 'mastered' | 'boss' | 'boss_locked';
  progress: number; // 0-100 completion percentage
  onClick?: () => void;
  isAdminMode?: boolean; // Hide progress circle in admin mode
  lowPower?: boolean;    // Skip auras/god-rays/starbursts on mobile
  [key: string]: unknown;
};

function SkillNode({ data }: NodeProps) {
  const { id, title, icon, status, progress = 0, isAdminMode = false, lowPower = false } = data as SkillNodeData;

  const isLocked = status === 'locked';
  const isAvailable = status === 'available';
  const isMastered = status === 'mastered';
  const isBoss = status === 'boss';
  const isBossLocked = status === 'boss_locked';

  // Combined locked state for styling (includes both regular locked and boss_locked)
  const isNodeLocked = isLocked || isBossLocked;

  // Size configuration - boss_locked nodes keep boss size
  const isBossSize = isBoss || isBossLocked;
  const nodeSize = isBossSize ? 72 : 52;
  const outerRingSize = isBossSize ? 90 : 70;

  // Hover animation config (CourseCard-style)
  const hoverAnimation = {
    scale: isNodeLocked ? 1 : 1.08,
    y: isNodeLocked ? 0 : -6,
  };

  const hoverTransition = {
    type: "spring" as const,
    stiffness: 400,
    damping: 17,
  };

  return (
    <motion.div
      className={`relative select-none ${isNodeLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      style={{ width: outerRingSize, height: outerRingSize }}
      whileHover={hoverAnimation}
      whileTap={isNodeLocked ? {} : { scale: 0.95 }}
      transition={hoverTransition}
    >
      {/* Connection Handles (invisible, for React Flow edges)
          With BT (Bottom-to-Top) layout:
          - Edges flow UPWARD from source (lower) to target (higher)
          - Source handle at TOP (edges exit going up)
          - Target handle at BOTTOM (edges enter from below) */}
      <Handle
        type="source"
        position={Position.Top}
        className="!bg-transparent !border-0 !w-2 !h-2"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        className="!bg-transparent !border-0 !w-2 !h-2"
      />

      {/* ============================================
          GOD RAYS + ETHEREAL AURA (Mastered state ONLY - NOT boss)
          Skip entirely on low-power: 12 animated god-rays + blurred aura
          per mastered node destroy mobile framerate once several modules
          are complete. A static radial gradient carries the "golden" feel.
          ============================================ */}
      {isMastered && lowPower && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: nodeSize * 2,
            height: nodeSize * 2,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background:
              'radial-gradient(circle, rgba(255, 215, 0, 0.28) 0%, rgba(255, 200, 100, 0.1) 45%, transparent 70%)',
          }}
        />
      )}
      {isMastered && !lowPower && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Outermost ethereal aura. CSS keyframe replaces framer-motion — no
              per-node RAF loop; the compositor can run all mastered nodes on
              one timeline. */}
          <div
            className="absolute rounded-full"
            style={{
              width: nodeSize * 3,
              height: nodeSize * 3,
              background:
                "radial-gradient(circle, rgba(255, 200, 100, 0.15) 0%, rgba(255, 215, 0, 0.05) 40%, transparent 70%)",
              filter: "blur(8px)",
              animation: "st-breathe-soft 3s ease-in-out infinite",
            }}
          />
          {/* God rays. Rotation lives on a static wrapper so the inner div's
              scaleY/opacity keyframe can run without being overwritten. */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                transform: `rotate(${i * 30}deg)`,
                transformOrigin: "center center",
                width: 2,
                height: outerRingSize * 1.4,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(to top, transparent, rgba(255, 230, 150, 0.5), rgba(255, 215, 0, 0.3), transparent)",
                  filter: "blur(1px)",
                  animation: `st-ray-pulse 2.5s ease-in-out ${i * 0.1}s infinite`,
                }}
              />
            </div>
          ))}
          {/* Inner glow halo */}
          <div
            className="absolute rounded-full"
            style={{
              width: nodeSize * 1.8,
              height: nodeSize * 1.8,
              background:
                "radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 200, 100, 0.2) 50%, transparent 70%)",
              filter: "blur(4px)",
              animation: "st-breathe-strong 2s ease-in-out infinite",
            }}
          />
        </div>
      )}

      {/* ============================================
          AVAILABLE STATE: Multi-layer ethereal glow
          Low-power mode replaces the two animated blurred auras with a
          single static gradient; the main node still has a gold border
          and boxShadow so the "available" distinction is preserved.
          ============================================ */}
      {isAvailable && lowPower && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: nodeSize * 1.8,
            height: nodeSize * 1.8,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background:
              'radial-gradient(circle, rgba(255, 215, 0, 0.18) 0%, rgba(255, 200, 100, 0.06) 50%, transparent 70%)',
          }}
        />
      )}
      {isAvailable && !lowPower && (
        <>
          {/* Outer soft aura — positioned via left:50%/top:50% + translate,
              so we animate using the translate-preserving keyframe. */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: nodeSize * 2.5,
              height: nodeSize * 2.5,
              left: "50%",
              top: "50%",
              background:
                "radial-gradient(circle, rgba(255, 200, 100, 0.12) 0%, rgba(255, 215, 0, 0.05) 50%, transparent 70%)",
              filter: "blur(6px)",
              animation: "st-breathe-soft-t 3s ease-in-out infinite",
            }}
          />
          {/* Inner pulsing glow — inset-0, scales from its own bounds. */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 223, 128, 0.35) 0%, rgba(255, 215, 0, 0.15) 50%, transparent 70%)",
              filter: "blur(3px)",
              animation: "st-breathe-strong 2s ease-in-out infinite",
            }}
          />
        </>
      )}

      {/* ============================================
          OUTER ROTATING RING (The Astrolabe)
          Boss: Slower rotation, no animation for calm feel
          CSS @keyframes replaces framer-motion — one composited transform
          loop per node, no main-thread involvement.
          ============================================ */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={
          isNodeLocked
            ? undefined
            : {
                animation: `st-rotate ${
                  isBoss ? 30 : isMastered ? 8 : 20
                }s linear infinite`,
              }
        }
      >
        <svg
          width={outerRingSize}
          height={outerRingSize}
          viewBox={`0 0 ${outerRingSize} ${outerRingSize}`}
          className="absolute"
        >
          <defs>
            <linearGradient id={`ring-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isNodeLocked ? "#7a7a8a" : isBoss ? "#B8860B" : "#C9A227"} />
              <stop offset="50%" stopColor={isNodeLocked ? "#9a9aaa" : isBoss ? "#DAA520" : "#FFE066"} />
              <stop offset="100%" stopColor={isNodeLocked ? "#7a7a8a" : isBoss ? "#B8860B" : "#C9A227"} />
            </linearGradient>
          </defs>
          <circle
            cx={outerRingSize / 2}
            cy={outerRingSize / 2}
            r={(outerRingSize - 4) / 2}
            fill="none"
            stroke={`url(#ring-grad-${id})`}
            strokeWidth={isBossSize ? 2.5 : isMastered ? 2.5 : 1.5}
            strokeDasharray={isBossSize ? "10 5" : "6 4"}
            strokeLinecap="round"
            opacity={isNodeLocked ? 0.5 : isBoss ? 0.85 : isMastered ? 1 : 0.7}
          />
        </svg>
      </div>

      {/* ============================================
          PROGRESS RING (Shows completion percentage)
          Hide in admin mode
          ============================================ */}
      {!isAdminMode && !isNodeLocked && progress > 0 && progress < 100 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            width={outerRingSize + 8}
            height={outerRingSize + 8}
            viewBox={`0 0 ${outerRingSize + 8} ${outerRingSize + 8}`}
            className="absolute"
            style={{ transform: 'rotate(-90deg)' }}
          >
            {/* Background circle */}
            <circle
              cx={(outerRingSize + 8) / 2}
              cy={(outerRingSize + 8) / 2}
              r={(outerRingSize + 2) / 2}
              fill="none"
              stroke="rgba(255, 215, 0, 0.15)"
              strokeWidth={3}
            />
            {/* Progress circle */}
            <circle
              cx={(outerRingSize + 8) / 2}
              cy={(outerRingSize + 8) / 2}
              r={(outerRingSize + 2) / 2}
              fill="none"
              stroke="#FFD700"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={`${(progress / 100) * Math.PI * (outerRingSize + 2)} ${Math.PI * (outerRingSize + 2)}`}
              style={{
                filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))',
              }}
            />
          </svg>
          {/* Progress percentage badge */}
          <div
            className="absolute bg-black/80 text-yellow-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-yellow-600/50"
            style={{
              top: -4,
              right: isBossSize ? 2 : -2,
            }}
          >
            {Math.round(progress)}%
          </div>
        </div>
      )}

      {/* Secondary counter-rotating ring (mastered only, NOT boss).
          CSS keyframe replaces framer-motion. */}
      {isMastered && !lowPower && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ animation: "st-rotate-rev 12s linear infinite" }}
        >
          <svg
            width={outerRingSize - 16}
            height={outerRingSize - 16}
            viewBox={`0 0 ${outerRingSize - 16} ${outerRingSize - 16}`}
            className="absolute"
          >
            <circle
              cx={(outerRingSize - 16) / 2}
              cy={(outerRingSize - 16) / 2}
              r={(outerRingSize - 20) / 2}
              fill="none"
              stroke="#C9A227"
              strokeWidth={1}
              strokeDasharray="3 8"
              strokeLinecap="round"
              opacity={0.6}
            />
          </svg>
        </div>
      )}

      {/* Boss: Static decorative inner ring (show for both boss and boss_locked) */}
      {isBossSize && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            width={outerRingSize - 12}
            height={outerRingSize - 12}
            viewBox={`0 0 ${outerRingSize - 12} ${outerRingSize - 12}`}
            className="absolute"
          >
            <circle
              cx={(outerRingSize - 12) / 2}
              cy={(outerRingSize - 12) / 2}
              r={(outerRingSize - 16) / 2}
              fill="none"
              stroke={isBossLocked ? "#7a7a8a" : "#B8860B"}
              strokeWidth={1.5}
              strokeDasharray="2 6"
              strokeLinecap="round"
              opacity={isBossLocked ? 0.3 : 0.5}
            />
          </svg>
        </div>
      )}

      {/* ============================================
          MAIN NODE (Glassmorphism circle)
          ============================================ */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative rounded-full flex items-center justify-center"
          style={{
            width: nodeSize,
            height: nodeSize,
            background: isNodeLocked
              ? "radial-gradient(circle at 30% 30%, rgba(80, 80, 95, 0.95), rgba(45, 45, 55, 0.98))"
              : isBoss
                ? "radial-gradient(circle at 30% 30%, rgba(60, 50, 30, 0.95), rgba(35, 28, 15, 0.98))"
                : isMastered
                  ? "radial-gradient(circle at 30% 30%, rgba(50, 45, 30, 0.95), rgba(25, 22, 15, 0.98))"
                  : "radial-gradient(circle at 30% 30%, rgba(40, 40, 50, 0.9), rgba(20, 20, 30, 0.95))",
            border: isNodeLocked
              ? "2px solid rgba(150, 150, 170, 0.6)"
              : isBoss
                ? "3px solid #B8860B" // Darker gold for boss, no intense glow
                : isMastered
                  ? "2px solid #FFD700"
                  : "2px solid rgba(255, 215, 0, 0.5)",
            // Boss: Subtle shadow, no outer glow
            boxShadow: isNodeLocked
              ? "inset 0 2px 10px rgba(0, 0, 0, 0.4), 0 0 20px rgba(100, 100, 120, 0.2)"
              : isBoss
                ? "inset 0 2px 15px rgba(0, 0, 0, 0.5), 0 4px 20px rgba(0, 0, 0, 0.4)"
                : isMastered
                  ? `inset 0 2px 15px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 200, 0, 0.2)`
                  : `inset 0 2px 10px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 215, 0, 0.2)`,
            opacity: isNodeLocked ? 0.75 : 1,
            // Subtle floating for available/mastered, CSS-driven so we don't
            // spawn a framer-motion instance per node. Locked/boss/low-power
            // stay static. Combine grayscale filter with no animation for locked.
            filter: isNodeLocked ? "grayscale(0.5) brightness(0.9)" : "none",
            animation:
              isNodeLocked || isBoss || lowPower
                ? undefined
                : "st-node-float 3s ease-in-out infinite",
          }}
        >
          {/* Inner glow ring */}
          <div
            className="absolute inset-1 rounded-full pointer-events-none"
            style={{
              border: isNodeLocked
                ? "1px solid rgba(120, 120, 140, 0.4)"
                : isBoss
                  ? "1px solid rgba(184, 134, 11, 0.4)"
                  : isMastered
                    ? "1px solid rgba(255, 215, 0, 0.4)"
                    : "1px solid rgba(255, 215, 0, 0.2)",
            }}
          />

          {/* Icon */}
          <div className="relative z-10 flex items-center justify-center">
            {isNodeLocked ? (
              <Lock className="text-gray-400" size={isBossSize ? 24 : 18} strokeWidth={2} />
            ) : icon ? (
              <span
                style={{
                  fontSize: isBoss ? 28 : 22,
                  filter: isMastered
                    ? "drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))"
                    : isBoss
                      ? "drop-shadow(0 0 4px rgba(184, 134, 11, 0.5))"
                      : "drop-shadow(0 0 4px rgba(255, 215, 0, 0.4))",
                  display: "inline-block",
                  animation:
                    isMastered && !lowPower
                      ? "st-icon-pop 2s ease-in-out infinite"
                      : undefined,
                }}
              >
                {icon}
              </span>
            ) : isBoss ? (
              // Boss: Static crown icon (no animation)
              <Crown
                className="text-amber-600"
                size={30}
                strokeWidth={1.5}
                fill="rgba(184, 134, 11, 0.3)"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))" }}
              />
            ) : (
              <Star
                className={isMastered ? "text-yellow-400" : "text-yellow-500/70"}
                size={isBoss ? 24 : 18}
                fill={isMastered ? "currentColor" : "none"}
                strokeWidth={isMastered ? 1.5 : 2}
                style={{ filter: isMastered ? "drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))" : "none" }}
              />
            )}
          </div>

          {/* Shine highlight */}
          <div
            className="absolute top-2 left-3 w-2 h-2 rounded-full pointer-events-none"
            style={{
              background: isNodeLocked ? "rgba(150, 150, 160, 0.3)" : "rgba(255, 255, 255, 0.4)",
              filter: "blur(1px)",
            }}
          />
        </div>
      </div>

      {/* ============================================
          STARBURST POINTS (Mastered ONLY - not boss)
          CSS keyframe + wrapper rotation. Skip on low-power since even the
          compositor path adds paint cost per node.
          ============================================ */}
      {isMastered && !lowPower && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: 2,
                height: 9,
                transform: `rotate(${i * 45}deg)`,
                transformOrigin: `center ${nodeSize / 2 + 9}px`,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(to top, transparent, #C9A227)",
                  animation: `st-starburst 1.5s ease-in-out ${i * 0.1}s infinite`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Boss: Static corner accents (no animation) - show for both boss and boss_locked */}
      {isBossSize && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[0, 90, 180, 270].map((angle) => (
            <div
              key={angle}
              className="absolute"
              style={{
                width: 3,
                height: 8,
                background: isBossLocked
                  ? "linear-gradient(to top, transparent, #7a7a8a)"
                  : "linear-gradient(to top, transparent, #B8860B)",
                transformOrigin: `center ${nodeSize / 2 + 10}px`,
                transform: `rotate(${angle}deg)`,
                opacity: isBossLocked ? 0.3 : 0.6,
              }}
            />
          ))}
        </div>
      )}

      {/* ============================================
          TITLE LABEL
          ============================================ */}
      <div
        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center pointer-events-none"
        style={{ top: outerRingSize + 6 }}
      >
        <span
          className="text-sm font-bold tracking-wide px-3 py-1 rounded-md"
          style={{
            color: isNodeLocked
              ? "rgba(180, 180, 195, 0.8)"
              : isBoss
                ? "#FFD700" // Brighter gold for boss
                : isMastered
                  ? "#FFE566" // Bright shiny gold
                  : "#FFF5CC", // Bright warm white-gold
            textShadow: isNodeLocked
              ? "0 1px 2px rgba(0, 0, 0, 0.5)"
              : isBoss
                ? "0 0 12px rgba(255, 215, 0, 0.8), 0 0 25px rgba(255, 200, 0, 0.4)"
                : isMastered
                  ? "0 0 15px rgba(255, 215, 0, 0.7), 0 0 30px rgba(255, 200, 0, 0.3)"
                  : "0 0 10px rgba(255, 230, 150, 0.6), 0 0 20px rgba(255, 215, 0, 0.25)",
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            letterSpacing: "0.03em",
          }}
        >
          {title}
        </span>
      </div>

      {/* Hover glow effect (visible on hover via CSS) */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none opacity-0 transition-opacity duration-200"
        style={{
          background: isNodeLocked
            ? "transparent"
            : "radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)",
          boxShadow: isNodeLocked
            ? "none"
            : "0 8px 30px rgba(212, 175, 55, 0.3)",
        }}
      />
    </motion.div>
  );
}

export default memo(SkillNode);
