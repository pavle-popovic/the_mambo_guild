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
  [key: string]: unknown;
};

function SkillNode({ data }: NodeProps) {
  const { id, title, icon, status, progress = 0, isAdminMode = false } = data as SkillNodeData;

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
          ============================================ */}
      {isMastered && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Outermost ethereal aura - very soft */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: nodeSize * 3,
              height: nodeSize * 3,
              background: "radial-gradient(circle, rgba(255, 200, 100, 0.15) 0%, rgba(255, 215, 0, 0.05) 40%, transparent 70%)",
              filter: "blur(8px)",
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* God rays */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: 2,
                height: outerRingSize * 1.4,
                background: `linear-gradient(to top, transparent, rgba(255, 230, 150, 0.5), rgba(255, 215, 0, 0.3), transparent)`,
                transformOrigin: "center center",
                rotate: `${i * 30}deg`,
                filter: "blur(1px)",
              }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scaleY: [0.7, 1.2, 0.7],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          ))}
          {/* Inner glow halo */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: nodeSize * 1.8,
              height: nodeSize * 1.8,
              background: "radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 200, 100, 0.2) 50%, transparent 70%)",
              filter: "blur(4px)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      )}

      {/* ============================================
          AVAILABLE STATE: Multi-layer ethereal glow
          ============================================ */}
      {isAvailable && (
        <>
          {/* Outer soft aura */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: nodeSize * 2.5,
              height: nodeSize * 2.5,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              background: "radial-gradient(circle, rgba(255, 200, 100, 0.12) 0%, rgba(255, 215, 0, 0.05) 50%, transparent 70%)",
              filter: "blur(6px)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* Inner pulsing glow */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(255, 223, 128, 0.35) 0%, rgba(255, 215, 0, 0.15) 50%, transparent 70%)",
              filter: "blur(3px)",
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.5, 0.9, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}

      {/* ============================================
          OUTER ROTATING RING (The Astrolabe)
          Boss: Slower rotation, no animation for calm feel
          ============================================ */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={isNodeLocked ? {} : { rotate: 360 }}
        transition={{
          duration: isBoss ? 30 : isMastered ? 8 : 20, // Boss rotates very slowly
          repeat: Infinity,
          ease: "linear",
        }}
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
      </motion.div>

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

      {/* Secondary counter-rotating ring (mastered only, NOT boss) */}
      {isMastered && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
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
        </motion.div>
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
        <motion.div
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
            filter: isNodeLocked ? "grayscale(0.5) brightness(0.9)" : "none",
          }}
          // Subtle floating for available/mastered, static for boss and locked
          animate={isNodeLocked || isBoss ? {} : { y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
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
              <motion.span
                style={{
                  fontSize: isBoss ? 28 : 22,
                  filter: isMastered
                    ? "drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))"
                    : isBoss
                      ? "drop-shadow(0 0 4px rgba(184, 134, 11, 0.5))"
                      : "drop-shadow(0 0 4px rgba(255, 215, 0, 0.4))",
                }}
                // Only animate icon for mastered, not boss
                animate={isMastered ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {icon}
              </motion.span>
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
        </motion.div>
      </div>

      {/* ============================================
          STARBURST POINTS (Mastered ONLY - not boss)
          ============================================ */}
      {isMastered && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: 2,
                height: 9,
                background: `linear-gradient(to top, transparent, #C9A227)`,
                transformOrigin: `center ${nodeSize / 2 + 9}px`,
                rotate: `${i * 45}deg`,
              }}
              animate={{ opacity: [0.6, 1, 0.6], scaleY: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
            />
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
