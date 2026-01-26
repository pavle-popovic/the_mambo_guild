"use client";

import { memo, useMemo } from "react";
import { BaseEdge, getStraightPath, type EdgeProps } from "@xyflow/react";
import { motion } from "framer-motion";

export type GoldEdgeData = {
  status: 'locked' | 'available' | 'mastered';
  progress?: number; // 0-100 percentage
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

  // Calculate path length for animations
  const pathLength = useMemo(() => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    return Math.sqrt(dx * dx + dy * dy);
  }, [sourceX, sourceY, targetX, targetY]);

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

  // Unique IDs for SVG defs
  const gradientId = `gold-gradient-${id}`;
  const progressGradientId = `progress-gradient-${id}`;
  const glowFilterId = `glow-filter-${id}`;
  const pulseFilterId = `pulse-filter-${id}`;
  const badgeGlowId = `badge-glow-${id}`;

  return (
    <g>
      {/* SVG Definitions */}
      <defs>
        {/* Gold gradient */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C9A227" />
          <stop offset="25%" stopColor="#F4D03F" />
          <stop offset="50%" stopColor="#FFE066" />
          <stop offset="75%" stopColor="#F4D03F" />
          <stop offset="100%" stopColor="#C9A227" />
        </linearGradient>

        {/* Progress gradient (gold to gray transition) */}
        <linearGradient id={progressGradientId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#C9A227" />
          <stop offset={`${progress}%`} stopColor="#FFD700" />
          <stop offset={`${progress}%`} stopColor="#4a4a5a" />
          <stop offset="100%" stopColor="#3a3a4a" />
        </linearGradient>

        {/* Glow filter - more intense */}
        <filter id={glowFilterId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="blur1" />
          <feGaussianBlur stdDeviation="8" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Intense glow for pulse - ethereal effect */}
        <filter id={pulseFilterId} x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="6" result="blur1" />
          <feGaussianBlur stdDeviation="12" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Badge glow */}
        <filter id={badgeGlowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

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
          Creates a "transitional" feel between completed and locked
          ============================================ */}
      {isAvailable && (
        <>
          {/* Base gray track (always visible as fallback) */}
          <path
            d={edgePath}
            fill="none"
            stroke="rgba(100, 100, 120, 0.4)"
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Flickering gold glow - outer */}
          <motion.path
            d={edgePath}
            fill="none"
            stroke="rgba(255, 200, 100, 0.2)"
            strokeWidth={16}
            strokeLinecap="round"
            style={{ filter: "blur(6px)" }}
            animate={{
              opacity: [0, 0.3, 0.5, 0.3, 0],
              strokeWidth: [12, 16, 20, 16, 12],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.3, 0.5, 0.7, 1],
            }}
          />

          {/* Flickering gold glow - middle */}
          <motion.path
            d={edgePath}
            fill="none"
            stroke="rgba(255, 215, 0, 0.4)"
            strokeWidth={8}
            strokeLinecap="round"
            style={{ filter: "blur(3px)" }}
            animate={{
              opacity: [0.1, 0.6, 0.8, 0.6, 0.1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.3, 0.5, 0.7, 1],
            }}
          />

          {/* Flickering core gold line */}
          <motion.path
            d={edgePath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={2.5}
            strokeLinecap="round"
            filter={`url(#${glowFilterId})`}
            animate={{
              opacity: [0.2, 0.9, 1, 0.9, 0.2],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.3, 0.5, 0.7, 1],
            }}
          />

          {/* Flickering bright center highlight */}
          <motion.path
            d={edgePath}
            fill="none"
            stroke="rgba(255, 250, 220, 0.8)"
            strokeWidth={1}
            strokeLinecap="round"
            animate={{
              opacity: [0, 0.5, 0.8, 0.5, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.3, 0.5, 0.7, 1],
            }}
          />

          {/* Traveling spark during flicker "on" phase */}
          <motion.path
            d={edgePath}
            fill="none"
            stroke="rgba(255, 255, 240, 1)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={`8 ${pathLength}`}
            filter={`url(#${pulseFilterId})`}
            initial={{ strokeDashoffset: 0, opacity: 0 }}
            animate={{
              strokeDashoffset: [0, -(pathLength + 8)],
              opacity: [0, 0.8, 1, 0.8, 0],
            }}
            transition={{
              strokeDashoffset: {
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 1,
              },
              opacity: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.3, 0.5, 0.7, 1],
              },
            }}
          />
        </>
      )}

      {/* ============================================
          MASTERED STATE: Full ethereal flowing gold
          ============================================ */}
      {isMastered && (
        <>
          {/* Outermost ethereal aura - very wide */}
          <motion.path
            d={edgePath}
            fill="none"
            stroke="rgba(255, 200, 100, 0.12)"
            strokeWidth={28}
            strokeLinecap="round"
            style={{ filter: "blur(12px)" }}
            animate={{ opacity: [0.08, 0.18, 0.08] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Outer glow spread */}
          <motion.path
            d={edgePath}
            fill="none"
            stroke="rgba(255, 215, 0, 0.25)"
            strokeWidth={16}
            strokeLinecap="round"
            style={{ filter: "blur(6px)" }}
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Inner glow */}
          <path
            d={edgePath}
            fill="none"
            stroke="rgba(255, 230, 150, 0.5)"
            strokeWidth={8}
            strokeLinecap="round"
            style={{ filter: "blur(3px)" }}
          />
          {/* Main gold line with glow */}
          <path
            d={edgePath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={3}
            strokeLinecap="round"
            filter={`url(#${glowFilterId})`}
          />
          {/* Bright core */}
          <path
            d={edgePath}
            fill="none"
            stroke="rgba(255, 255, 240, 0.7)"
            strokeWidth={1.5}
            strokeLinecap="round"
          />

          {/* Flowing energy particles */}
          <motion.path
            d={edgePath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="8 24"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: -64 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            style={{ opacity: 0.8 }}
          />

          {/* White hot pulse traveling */}
          <motion.path
            d={edgePath}
            fill="none"
            stroke="rgba(255, 255, 250, 1)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`15 ${pathLength}`}
            filter={`url(#${pulseFilterId})`}
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: -(pathLength + 15) }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.3,
            }}
          />

          {/* Secondary trailing pulse */}
          <motion.path
            d={edgePath}
            fill="none"
            stroke="rgba(255, 248, 220, 0.6)"
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={`8 ${pathLength}`}
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: -(pathLength + 8) }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 0.3,
              delay: 0.8,
            }}
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
            stroke={`url(#${gradientId})`}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${progressLength} ${remainingLength}`}
            filter={`url(#${glowFilterId})`}
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

          {/* Animated glow at progress point */}
          <motion.circle
            cx={sourceX + ((targetX - sourceX) * progress) / 100}
            cy={sourceY + ((targetY - sourceY) * progress) / 100}
            r={4}
            fill="#FFD700"
            filter={`url(#${glowFilterId})`}
            animate={{
              r: [4, 6, 4],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Circular Progress Badge at midpoint */}
          <g transform={`translate(${midX}, ${midY})`}>
            {/* Badge background */}
            <circle
              r={badgeRadius}
              fill="rgba(15, 15, 20, 0.95)"
              stroke="rgba(100, 90, 60, 0.4)"
              strokeWidth={1}
              filter={`url(#${badgeGlowId})`}
            />

            {/* Progress ring background */}
            <circle
              r={10}
              fill="none"
              stroke="rgba(60, 60, 80, 0.5)"
              strokeWidth={2.5}
            />

            {/* Progress ring fill */}
            <motion.circle
              r={10}
              fill="none"
              stroke="#FFD700"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray={badgeStrokeDasharray}
              strokeDashoffset={badgeCircumference / 4} // Start from top
              initial={{ strokeDasharray: `0 ${badgeCircumference}` }}
              animate={{ strokeDasharray: badgeStrokeDasharray }}
              transition={{ duration: 0.8, ease: "easeOut" }}
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
