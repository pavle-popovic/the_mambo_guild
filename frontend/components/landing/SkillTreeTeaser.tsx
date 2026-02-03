"use client";

import { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  useReactFlow,
  Position,
  Handle,
  BaseEdge,
  getStraightPath,
  type EdgeProps,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Dagre from "@dagrejs/dagre";
import { FaStar, FaTrophy, FaChartLine, FaLock, FaPlay, FaCheck, FaSpinner } from "react-icons/fa";
import { HiSparkles, HiLightningBolt } from "react-icons/hi";
import { Lock, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AuthPromptModal from "@/components/AuthPromptModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types
interface Level {
  id: string;
  title: string;
  description?: string;
  x_position: number;
  y_position: number;
  is_unlocked: boolean;
  completion_percentage: number;
  lesson_count: number;
  thumbnail_url?: string;
  mux_preview_playback_id?: string | null;
  outcome?: string | null;
  duration_minutes?: number;
  total_xp?: number;
  status?: string;
}

interface Edge {
  id: string;
  from_level_id: string;
  to_level_id: string;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  difficulty: string;
  progress_percentage: number;
  is_locked: boolean;
  course_type?: string;
}

interface SkillTreeData {
  id: string;
  title: string;
  description?: string;
  difficulty: string;
  levels: Level[];
  edges: Edge[];
}

// ============================================
// GOLD EDGE COMPONENT
// ============================================
type GoldEdgeData = {
  status: 'locked' | 'available' | 'mastered';
  progress?: number;
  isLoggedOut?: boolean;
  [key: string]: unknown;
};

function GoldEdgeTeaserComponent({ id, sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
  const edgeData = data as GoldEdgeData | undefined;
  const status = edgeData?.status || 'locked';
  const isLoggedOut = edgeData?.isLoggedOut || false;
  const isLocked = status === 'locked' || isLoggedOut;
  const isAvailable = status === 'available' && !isLoggedOut;
  const isMastered = status === 'mastered' && !isLoggedOut;

  const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  const pathLength = useMemo(() => Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2)), [sourceX, sourceY, targetX, targetY]);

  const gradientId = `gold-gradient-${id}`;
  const glowFilterId = `glow-filter-${id}`;
  const pulseFilterId = `pulse-filter-${id}`;

  return (
    <g style={{ filter: isLoggedOut ? "grayscale(1) opacity(0.5)" : "none" }}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C9A227" /><stop offset="50%" stopColor="#FFE066" /><stop offset="100%" stopColor="#C9A227" />
        </linearGradient>
        <filter id={glowFilterId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="blur1" /><feGaussianBlur stdDeviation="8" result="blur2" />
          <feMerge><feMergeNode in="blur2" /><feMergeNode in="blur1" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={pulseFilterId} x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="6" result="blur1" /><feGaussianBlur stdDeviation="12" result="blur2" />
          <feMerge><feMergeNode in="blur2" /><feMergeNode in="blur1" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <BaseEdge id={id} path={edgePath} style={{ stroke: isLocked ? "rgba(140, 140, 160, 0.4)" : "rgba(200, 180, 120, 0.3)", strokeWidth: isMastered ? 4 : 2 }} />

      {isLocked && <path d={edgePath} fill="none" stroke="rgba(180, 180, 200, 0.5)" strokeWidth={1.5} strokeDasharray="6 10" strokeLinecap="round" />}

      {isAvailable && (
        <>
          <path d={edgePath} fill="none" stroke="rgba(100, 100, 120, 0.4)" strokeWidth={2} strokeLinecap="round" />
          <motion.path d={edgePath} fill="none" stroke="rgba(255, 200, 100, 0.2)" strokeWidth={16} strokeLinecap="round" style={{ filter: "blur(6px)" }} animate={{ opacity: [0, 0.3, 0.5, 0.3, 0], strokeWidth: [12, 16, 20, 16, 12] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.5, 0.7, 1] }} />
          <motion.path d={edgePath} fill="none" stroke="rgba(255, 215, 0, 0.4)" strokeWidth={8} strokeLinecap="round" style={{ filter: "blur(3px)" }} animate={{ opacity: [0.1, 0.6, 0.8, 0.6, 0.1] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.5, 0.7, 1] }} />
          <motion.path d={edgePath} fill="none" stroke={`url(#${gradientId})`} strokeWidth={2.5} strokeLinecap="round" filter={`url(#${glowFilterId})`} animate={{ opacity: [0.2, 0.9, 1, 0.9, 0.2] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.5, 0.7, 1] }} />
          <motion.path d={edgePath} fill="none" stroke="rgba(255, 255, 240, 1)" strokeWidth={2} strokeLinecap="round" strokeDasharray={`8 ${pathLength}`} filter={`url(#${pulseFilterId})`} animate={{ strokeDashoffset: [0, -(pathLength + 8)], opacity: [0, 0.8, 1, 0.8, 0] }} transition={{ strokeDashoffset: { duration: 1.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }, opacity: { duration: 2.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.5, 0.7, 1] } }} />
        </>
      )}

      {isMastered && (
        <>
          <motion.path d={edgePath} fill="none" stroke="rgba(255, 200, 100, 0.12)" strokeWidth={28} strokeLinecap="round" style={{ filter: "blur(12px)" }} animate={{ opacity: [0.08, 0.18, 0.08] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
          <motion.path d={edgePath} fill="none" stroke="rgba(255, 215, 0, 0.25)" strokeWidth={16} strokeLinecap="round" style={{ filter: "blur(6px)" }} animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
          <path d={edgePath} fill="none" stroke="rgba(255, 230, 150, 0.5)" strokeWidth={8} strokeLinecap="round" style={{ filter: "blur(3px)" }} />
          <path d={edgePath} fill="none" stroke={`url(#${gradientId})`} strokeWidth={3} strokeLinecap="round" filter={`url(#${glowFilterId})`} />
          <path d={edgePath} fill="none" stroke="rgba(255, 255, 240, 0.7)" strokeWidth={1.5} strokeLinecap="round" />
          <motion.path d={edgePath} fill="none" stroke={`url(#${gradientId})`} strokeWidth={2} strokeLinecap="round" strokeDasharray="8 24" animate={{ strokeDashoffset: -64 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} style={{ opacity: 0.8 }} />
          <motion.path d={edgePath} fill="none" stroke="rgba(255, 255, 250, 1)" strokeWidth={3} strokeLinecap="round" strokeDasharray={`15 ${pathLength}`} filter={`url(#${pulseFilterId})`} animate={{ strokeDashoffset: -(pathLength + 15) }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.3 }} />
        </>
      )}
    </g>
  );
}
const GoldEdgeTeaser = memo(GoldEdgeTeaserComponent);

// ============================================
// SKILL NODE COMPONENT (exact match to actual app)
// ============================================
type SkillNodeData = {
  id: string;
  title: string;
  status: 'locked' | 'available' | 'mastered';
  progress: number;
  isSelected?: boolean;
  isLoggedOut?: boolean;
};

function SkillNodeComponent({ data }: NodeProps) {
  const { title, status, progress = 0, isSelected, isLoggedOut = false } = data as SkillNodeData;

  const effectiveStatus = isLoggedOut ? 'locked' : status;
  const isLocked = effectiveStatus === 'locked';
  const isAvailable = effectiveStatus === 'available';
  const isMastered = effectiveStatus === 'mastered';
  const hasProgress = !isLoggedOut && progress > 0 && progress < 100;

  const nodeSize = 52;
  const outerRingSize = 70;

  return (
    <motion.div
      className={`relative select-none ${isLocked && !isLoggedOut ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      style={{ width: outerRingSize, height: outerRingSize, filter: isLoggedOut ? "grayscale(1) opacity(0.6)" : "none" }}
      whileHover={isLocked && !isLoggedOut ? {} : { scale: 1.08, y: -6 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Handle type="source" position={Position.Top} className="!bg-transparent !border-0 !w-2 !h-2" />
      <Handle type="target" position={Position.Bottom} className="!bg-transparent !border-0 !w-2 !h-2" />

      {/* Mastered glow effects */}
      {isMastered && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div className="absolute rounded-full" style={{ width: nodeSize * 3, height: nodeSize * 3, background: "radial-gradient(circle, rgba(255, 200, 100, 0.15) 0%, transparent 70%)", filter: "blur(8px)" }} animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
          {[...Array(12)].map((_, i) => (
            <motion.div key={i} className="absolute" style={{ width: 2, height: outerRingSize * 1.4, background: `linear-gradient(to top, transparent, rgba(255, 230, 150, 0.5), transparent)`, transformOrigin: "center center", rotate: `${i * 30}deg`, filter: "blur(1px)" }} animate={{ opacity: [0.2, 0.5, 0.2], scaleY: [0.7, 1.2, 0.7] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }} />
          ))}
        </div>
      )}

      {/* Available glow */}
      {isAvailable && (
        <>
          <motion.div className="absolute rounded-full pointer-events-none" style={{ width: nodeSize * 2.5, height: nodeSize * 2.5, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: "radial-gradient(circle, rgba(255, 200, 100, 0.12) 0%, transparent 70%)", filter: "blur(6px)" }} animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255, 223, 128, 0.35) 0%, transparent 70%)", filter: "blur(3px)" }} animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
        </>
      )}

      {/* Progress ring */}
      {hasProgress && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg width={outerRingSize + 8} height={outerRingSize + 8} viewBox={`0 0 ${outerRingSize + 8} ${outerRingSize + 8}`} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={(outerRingSize + 8) / 2} cy={(outerRingSize + 8) / 2} r={(outerRingSize + 2) / 2} fill="none" stroke="rgba(255, 215, 0, 0.15)" strokeWidth={3} />
            <circle cx={(outerRingSize + 8) / 2} cy={(outerRingSize + 8) / 2} r={(outerRingSize + 2) / 2} fill="none" stroke="#FFD700" strokeWidth={3} strokeLinecap="round" strokeDasharray={`${(progress / 100) * Math.PI * (outerRingSize + 2)} ${Math.PI * (outerRingSize + 2)}`} style={{ filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))' }} />
          </svg>
          <div className="absolute bg-black/80 text-yellow-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-yellow-600/50" style={{ top: -4, right: -2 }}>{Math.round(progress)}%</div>
        </div>
      )}

      {/* Outer rotating ring */}
      <motion.div className="absolute inset-0 flex items-center justify-center" animate={isLocked ? {} : { rotate: 360 }} transition={{ duration: isMastered ? 8 : 20, repeat: Infinity, ease: "linear" }}>
        <svg width={outerRingSize} height={outerRingSize} viewBox={`0 0 ${outerRingSize} ${outerRingSize}`}>
          <defs><linearGradient id={`ring-grad-${data.id}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={isLocked ? "#7a7a8a" : "#C9A227"} /><stop offset="50%" stopColor={isLocked ? "#9a9aaa" : "#FFE066"} /><stop offset="100%" stopColor={isLocked ? "#7a7a8a" : "#C9A227"} /></linearGradient></defs>
          <circle cx={outerRingSize / 2} cy={outerRingSize / 2} r={(outerRingSize - 4) / 2} fill="none" stroke={`url(#ring-grad-${data.id})`} strokeWidth={isMastered ? 2.5 : 1.5} strokeDasharray="6 4" strokeLinecap="round" opacity={isLocked ? 0.5 : isMastered ? 1 : 0.7} />
        </svg>
      </motion.div>

      {/* Secondary counter-rotating ring (mastered) */}
      {isMastered && (
        <motion.div className="absolute inset-0 flex items-center justify-center" animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}>
          <svg width={outerRingSize - 16} height={outerRingSize - 16} viewBox={`0 0 ${outerRingSize - 16} ${outerRingSize - 16}`}>
            <circle cx={(outerRingSize - 16) / 2} cy={(outerRingSize - 16) / 2} r={(outerRingSize - 20) / 2} fill="none" stroke="#C9A227" strokeWidth={1} strokeDasharray="3 8" strokeLinecap="round" opacity={0.6} />
          </svg>
        </motion.div>
      )}

      {/* Main node */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative rounded-full flex items-center justify-center"
          style={{
            width: nodeSize, height: nodeSize,
            background: isLocked ? "radial-gradient(circle at 30% 30%, rgba(80, 80, 95, 0.95), rgba(45, 45, 55, 0.98))" : isMastered ? "radial-gradient(circle at 30% 30%, rgba(50, 45, 30, 0.95), rgba(25, 22, 15, 0.98))" : "radial-gradient(circle at 30% 30%, rgba(40, 40, 50, 0.9), rgba(20, 20, 30, 0.95))",
            border: isLocked ? "2px solid rgba(150, 150, 170, 0.6)" : isMastered ? "2px solid #FFD700" : "2px solid rgba(255, 215, 0, 0.5)",
            boxShadow: isLocked ? "inset 0 2px 10px rgba(0, 0, 0, 0.4), 0 0 20px rgba(100, 100, 120, 0.2)" : isMastered ? "inset 0 2px 15px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 200, 0, 0.2)" : "inset 0 2px 10px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 215, 0, 0.2)",
          }}
          animate={isLocked ? {} : { y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-1 rounded-full pointer-events-none" style={{ border: isLocked ? "1px solid rgba(120, 120, 140, 0.4)" : isMastered ? "1px solid rgba(255, 215, 0, 0.4)" : "1px solid rgba(255, 215, 0, 0.2)" }} />
          <div className="relative z-10 flex items-center justify-center">
            {isLocked ? <Lock className="text-gray-400" size={18} strokeWidth={2} /> : <Star className={isMastered ? "text-yellow-400" : "text-yellow-500/70"} size={18} fill={isMastered ? "currentColor" : "none"} strokeWidth={isMastered ? 1.5 : 2} style={{ filter: isMastered ? "drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))" : "none" }} />}
          </div>
          <div className="absolute top-2 left-3 w-2 h-2 rounded-full pointer-events-none" style={{ background: isLocked ? "rgba(150, 150, 160, 0.3)" : "rgba(255, 255, 255, 0.4)", filter: "blur(1px)" }} />
        </motion.div>
      </div>

      {/* Starburst (mastered) */}
      {isMastered && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="absolute" style={{ width: 2, height: 9, background: `linear-gradient(to top, transparent, #C9A227)`, transformOrigin: `center ${nodeSize / 2 + 9}px`, rotate: `${i * 45}deg` }} animate={{ opacity: [0.6, 1, 0.6], scaleY: [0.8, 1, 0.8] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }} />
          ))}
        </div>
      )}

      {/* Title */}
      <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center pointer-events-none" style={{ top: outerRingSize + 6 }}>
        <span className="text-[11px] font-bold tracking-wide px-2 py-0.5 rounded-md" style={{ color: isLocked ? "rgba(180, 180, 195, 0.8)" : isMastered ? "#FFE566" : "#FFF5CC", textShadow: isLocked ? "0 1px 2px rgba(0, 0, 0, 0.5)" : isMastered ? "0 0 15px rgba(255, 215, 0, 0.7)" : "0 0 10px rgba(255, 230, 150, 0.6)", background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}>
          {title}
        </span>
      </div>
    </motion.div>
  );
}
const SkillNodeTeaser = memo(SkillNodeComponent);

// ============================================
// DAGRE LAYOUT
// ============================================
const getLayoutedElements = (nodes: any[], edges: any[]) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "BT", nodesep: 45, ranksep: 55, marginx: 20, marginy: 20, ranker: "tight-tree" });
  nodes.forEach((node) => g.setNode(node.id, { width: 90, height: 100 }));
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  Dagre.layout(g);

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  nodes.forEach((node) => { const pos = g.node(node.id); if (pos) { minX = Math.min(minX, pos.x); maxX = Math.max(maxX, pos.x); minY = Math.min(minY, pos.y); maxY = Math.max(maxY, pos.y); } });
  const centerX = (minX + maxX) / 2, centerY = (minY + maxY) / 2;

  return { nodes: nodes.map((node) => { const p = g.node(node.id); return { ...node, position: { x: p.x - centerX, y: p.y - centerY } }; }), edges };
};

const nodeTypes = { skill: SkillNodeTeaser };
const edgeTypes = { gold: GoldEdgeTeaser };

// ============================================
// HOVER TOOLTIP COMPONENT
// ============================================
interface HoveredNodeData {
  level: Level;
  position: { x: number; y: number };
}

function NodeHoverTooltip({ level, position, isLoggedOut }: { level: Level; position: { x: number; y: number }; isLoggedOut: boolean }) {
  const previewGif = level.mux_preview_playback_id 
    ? `https://image.mux.com/${level.mux_preview_playback_id}/animated.gif?start=0&end=3&width=400&fps=15`
    : null;
  const staticThumb = level.thumbnail_url || (level.mux_preview_playback_id 
    ? `https://image.mux.com/${level.mux_preview_playback_id}/thumbnail.jpg?width=400&time=1`
    : null);
  const displayImage = previewGif || staticThumb;
  
  const isCompleted = level.completion_percentage >= 100;
  const inProgress = level.completion_percentage > 0 && level.completion_percentage < 100;
  const isLocked = !level.is_unlocked;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="fixed z-[100] pointer-events-none"
      style={{ left: position.x, top: position.y }}
    >
      <div className={`w-72 rounded-xl overflow-hidden backdrop-blur-xl border shadow-2xl ${
        isLocked || isLoggedOut ? "bg-gray-900/95 border-gray-700/50" 
        : isCompleted ? "bg-gradient-to-b from-green-900/90 to-gray-900/95 border-green-700/50"
        : "bg-gradient-to-b from-yellow-900/30 to-gray-900/95 border-yellow-900/50"
      }`}>
        {/* Thumbnail / Preview */}
        <div className="relative aspect-video overflow-hidden">
          {displayImage ? (
            <img src={displayImage} alt={level.title} className={`w-full h-full object-cover ${isLocked || isLoggedOut ? "grayscale opacity-50" : ""}`} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <Star className="w-10 h-10 text-gray-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
          
          {/* Status Badge */}
          {isCompleted && <div className="absolute top-2 left-2 bg-green-500/20 border border-green-500/50 rounded-full px-2 py-0.5 text-[10px] text-green-400 font-medium">Completed</div>}
          {inProgress && !isLoggedOut && <div className="absolute top-2 left-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full px-2 py-0.5 text-[10px] text-yellow-400 font-medium">In Progress</div>}
          {(isLocked || isLoggedOut) && <div className="absolute top-2 left-2 bg-gray-500/20 border border-gray-500/50 rounded-full px-2 py-0.5 text-[10px] text-gray-400 font-medium">Locked</div>}
          
          {/* Preview indicator */}
          {previewGif && !isLocked && !isLoggedOut && (
            <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-0.5 text-[10px] text-white/90 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />Preview
            </div>
          )}
          
          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            <h3 className={`font-bold text-base ${isLocked || isLoggedOut ? "text-gray-400" : isCompleted ? "text-green-400" : "text-yellow-200"}`}>
              {level.title}
            </h3>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-2.5">
          {/* Outcome */}
          {level.outcome && (
            <div className="flex items-center gap-2 mb-2 bg-black/30 rounded-lg px-2 py-1">
              <FaTrophy className={`w-3 h-3 ${isCompleted ? "text-green-500" : "text-yellow-500"}`} />
              <span className={`text-xs font-medium ${isCompleted ? "text-green-400" : "text-yellow-400"}`}>{level.outcome}</span>
            </div>
          )}
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-3 py-1.5 border-y border-gray-700/50 text-[10px] text-gray-400">
            <div className="flex items-center gap-1"><Star className="w-3 h-3" />{level.lesson_count} lessons</div>
            {level.total_xp && <div className="flex items-center gap-1 border-l border-gray-700/50 pl-3"><HiLightningBolt className="w-3 h-3 text-yellow-500" />{level.total_xp} XP</div>}
          </div>
          
          {/* Progress */}
          {!isLocked && !isLoggedOut && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
                <div className={`h-full transition-all ${isCompleted ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-yellow-500 to-amber-400"}`} style={{ width: `${level.completion_percentage}%` }} />
              </div>
              <span className={`text-xs font-bold ${isCompleted ? "text-green-400" : "text-yellow-400"}`}>{Math.round(level.completion_percentage)}%</span>
            </div>
          )}
          
          {/* Locked message */}
          {(isLocked || isLoggedOut) && (
            <div className="bg-gray-800/50 rounded-lg p-2 mt-2 border border-gray-700/50">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-400">{isLoggedOut ? "Login to access" : "Complete prerequisites"}</span>
              </div>
            </div>
          )}
          
          {/* Click hint */}
          {!isLocked && !isLoggedOut && (
            <div className="text-center mt-2">
              <span className="text-[9px] text-gray-500 uppercase tracking-wider">Click to start lessons</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// INNER GRAPH COMPONENT
// ============================================
function SkillTreeGraphInner({ levels, edges: edgeData, onNodeSelect, selectedNodeId, isLoggedOut }: { levels: Level[]; edges: Edge[]; onNodeSelect: (level: Level | null) => void; selectedNodeId: string | null; isLoggedOut: boolean; }) {
  const { setCenter } = useReactFlow();
  const [isPositioned, setIsPositioned] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<HoveredNodeData | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getNodeStatus = useCallback((level: Level): 'locked' | 'available' | 'mastered' => {
    if (level.completion_percentage >= 100) return 'mastered';
    if (level.is_unlocked) return 'available';
    return 'locked';
  }, []);

  const getEdgeStatus = useCallback((fromId: string, toId: string): 'locked' | 'available' | 'mastered' => {
    const fromLevel = levels.find(l => l.id === fromId);
    const toLevel = levels.find(l => l.id === toId);
    if (!fromLevel || !toLevel) return 'locked';
    if (fromLevel.completion_percentage >= 100 && toLevel.completion_percentage >= 100) return 'mastered';
    if (fromLevel.completion_percentage >= 100 || (fromLevel.is_unlocked && toLevel.is_unlocked)) return 'available';
    return 'locked';
  }, [levels]);

  // Handle node hover
  const handleNodeMouseEnter = useCallback((event: React.MouseEvent, node: any) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const level = levels.find(l => l.id === node.id);
    if (!level) return;
    
    // Position tooltip to the right of cursor
    const x = Math.min(event.clientX + 20, window.innerWidth - 300);
    const y = Math.min(event.clientY - 100, window.innerHeight - 400);
    
    setHoveredNode({ level, position: { x, y: Math.max(20, y) } });
  }, [levels]);

  const handleNodeMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => setHoveredNode(null), 150);
  }, []);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    const level = levels.find(l => l.id === node.id);
    if (level) onNodeSelect(level);
  }, [levels, onNodeSelect]);

  const { nodes, edges } = useMemo(() => {
    const flowNodes = levels.map((level) => ({
      id: level.id, type: 'skill', position: { x: 0, y: 0 }, sourcePosition: Position.Top, targetPosition: Position.Bottom,
      data: { id: level.id, title: level.title, status: getNodeStatus(level), progress: level.completion_percentage, isSelected: selectedNodeId === level.id, isLoggedOut },
    }));
    const flowEdges = edgeData.map((edge) => ({ id: edge.id, source: edge.from_level_id, target: edge.to_level_id, type: 'gold', data: { status: getEdgeStatus(edge.from_level_id, edge.to_level_id), isLoggedOut } }));
    return getLayoutedElements(flowNodes, flowEdges);
  }, [levels, edgeData, selectedNodeId, getNodeStatus, getEdgeStatus, isLoggedOut]);

  useEffect(() => {
    if (levels.length > 0 && nodes.length > 0 && !isPositioned) {
      const timer = setTimeout(() => {
        const targetLevel = levels.find(l => l.is_unlocked && l.completion_percentage < 100) || levels.filter(l => l.is_unlocked).pop() || levels[0];
        const targetNode = nodes.find(n => n.id === targetLevel?.id);
        if (targetNode && setCenter) { setCenter(targetNode.position.x, targetNode.position.y, { zoom: 0.75, duration: 800 }); setTimeout(() => setIsPositioned(true), 100); }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [levels, nodes, setCenter, isPositioned]);

  return (
    <div className={`w-full h-full transition-opacity duration-500 ${isPositioned ? 'opacity-100' : 'opacity-0'}`}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        nodeTypes={nodeTypes} 
        edgeTypes={edgeTypes} 
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onNodeClick={handleNodeClick}
        minZoom={0.25} 
        maxZoom={1.5} 
        defaultViewport={{ x: 0, y: 0, zoom: 0.75 }} 
        panOnDrag={true} 
        zoomOnScroll={true} 
        zoomOnPinch={true} 
        panOnScroll={false} 
        preventScrolling={false} 
        nodesDraggable={false} 
        nodesConnectable={false} 
        elementsSelectable={false} 
        proOptions={{ hideAttribution: true }} 
        className="bg-transparent"
      >
        <Controls showInteractive={false} position="bottom-left" className="!bg-zinc-800/90 !border-zinc-700/50 !rounded-xl !shadow-xl [&>button]:!bg-zinc-800 [&>button]:!border-zinc-700/50 [&>button]:!text-gray-400 [&>button:hover]:!bg-zinc-700 [&>button:hover]:!text-white [&>button]:!w-7 [&>button]:!h-7" />
      </ReactFlow>
      
      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredNode && (
          <NodeHoverTooltip level={hoveredNode.level} position={hoveredNode.position} isLoggedOut={isLoggedOut} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// FEATURES DATA
// ============================================
const FEATURES = [
  { icon: FaChartLine, title: "Track Progress", description: "Visual skill tree shows your journey", color: "from-blue-500 to-cyan-500" },
  { icon: HiLightningBolt, title: "Earn XP", description: "Level up as you learn", color: "from-yellow-500 to-orange-500" },
  { icon: FaTrophy, title: "Unlock Badges", description: "Collect achievements", color: "from-purple-500 to-indigo-500" },
];

// ============================================
// MAIN COMPONENT
// ============================================
export default function SkillTreeTeaser() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [skillTree, setSkillTree] = useState<SkillTreeData | null>(null);
  const [selectedNode, setSelectedNode] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isLoggedOut = !user;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`${API_URL}/api/courses/worlds`, { 
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include' 
        });
        if (response.ok) { 
          const data = await response.json(); 
          const published = data.filter((c: Course) => c.course_type === 'course'); 
          setCourses(published); 
          if (published.length > 0) setSelectedCourseId(published[0].id); 
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchCourses();
  }, []);

  // Wait for auth to complete before fetching skill tree with user progress
  useEffect(() => {
    if (!selectedCourseId) return;
    if (authLoading) return; // Wait for auth to complete
    
    const fetchSkillTree = async () => {
      setTreeLoading(true); 
      setSelectedNode(null);
      try {
        const token = localStorage.getItem("auth_token");
        console.log("[SkillTreeTeaser] Fetching skill tree, token exists:", !!token, "user:", user?.username);
        
        const response = await fetch(
          `${API_URL}/api/courses/worlds/${selectedCourseId}/skill-tree`, 
          { 
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        
        if (response.ok) { 
          const data = await response.json(); 
          console.log("[SkillTreeTeaser] Skill tree data:", {
            levels: data.levels?.length,
            sampleLevel: data.levels?.[0] ? {
              title: data.levels[0].title,
              completion: data.levels[0].completion_percentage,
              is_unlocked: data.levels[0].is_unlocked,
              mux_preview: data.levels[0].mux_preview_playback_id,
              thumbnail: data.levels[0].thumbnail_url
            } : null
          });
          setSkillTree(data); 
        }
      } catch (e) { console.error("[SkillTreeTeaser] Error:", e); } finally { setTreeLoading(false); }
    };
    fetchSkillTree();
  }, [selectedCourseId, user, authLoading]);

  const handleNodeSelect = useCallback((level: Level | null) => setSelectedNode(level), []);

  const handleStartModule = () => {
    if (!selectedNode) return;
    if (!user) { setShowAuthModal(true); return; }
    const course = courses.find(c => c.id === selectedCourseId);
    if (course?.is_locked) { router.push('/pricing'); return; }
    router.push(`/courses/${selectedCourseId}`);
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <section className="relative py-12 md:py-20 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-transparent via-black/60 to-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6 md:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full mb-4">
            <FaStar className="text-purple-400 text-xs" />
            <span className="text-xs font-medium text-purple-400">Gamified Learning</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-mambo-text font-serif" style={{ fontFamily: '"Playfair Display", serif' }}>
            Your <span className="text-mambo-gold italic">Constellation</span> Path
          </h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">Explore our interactive skill trees</p>
        </motion.div>

        <div className="grid lg:grid-cols-6 gap-4 lg:gap-6 items-start">
          {/* Skill Tree - Takes most space (5/6) */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-5 order-2 lg:order-1">
            {/* Course Tabs - Enhanced */}
            <div className="flex gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {loading ? (
                <div className="flex items-center gap-2 px-4 py-2 text-gray-500"><FaSpinner className="animate-spin" /><span className="text-sm">Loading courses...</span></div>
              ) : (
                courses.map((course, index) => {
                  const isSelected = selectedCourseId === course.id;
                  
                  return (
                    <motion.button 
                      key={course.id} 
                      onClick={() => setSelectedCourseId(course.id)}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`group relative flex-shrink-0 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
                        isSelected 
                          ? "text-black shadow-lg shadow-mambo-gold/30" 
                          : "bg-zinc-800/60 text-gray-300 hover:bg-zinc-700/80 hover:text-white border border-zinc-700/50 hover:border-mambo-gold/50"
                      }`}
                      whileHover={{ scale: isSelected ? 1.02 : 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Selected gold gradient background */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-gradient-to-r from-mambo-gold via-amber-400 to-mambo-gold" />
                      )}
                      
                      {/* Shimmer effect for selected */}
                      {isSelected && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        />
                      )}
                      
                      {/* Content */}
                      <span className="relative flex items-center gap-2.5">
                        {/* Star icon for selected, dot for unselected */}
                        {isSelected ? (
                          <Star className="w-4 h-4 fill-black/30" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-mambo-gold/50 group-hover:bg-mambo-gold transition-colors" />
                        )}
                        <span className="text-sm">{course.title}</span>
                        {/* Module count badge */}
                        {isSelected && skillTree && (
                          <span className="bg-black/20 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            {skillTree.levels.length}
                          </span>
                        )}
                      </span>
                      
                      {/* Underline indicator for selected */}
                      {isSelected && (
                        <motion.div 
                          layoutId="courseTabIndicator"
                          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-black/30"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>

            {/* Tree Container */}
            <div className="relative h-[500px] md:h-[580px] bg-gradient-to-b from-zinc-900/95 via-black/95 to-zinc-900/95 rounded-2xl border border-zinc-700/50 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-20 px-3 py-2 bg-gradient-to-b from-black/90 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-[9px] font-bold text-emerald-400 uppercase">Live</span>
                    </div>
                    <span className="text-[10px] text-gray-400">{selectedCourse?.title}</span>
                  </div>
                  {skillTree && <span className="text-[9px] text-gray-500">{skillTree.levels.length} modules</span>}
                </div>
              </div>

              {/* Logged out overlay hint */}
              {isLoggedOut && (
                <div className="absolute top-12 left-0 right-0 z-30 flex justify-center">
                  <div className="px-3 py-1.5 bg-black/80 border border-zinc-700/50 rounded-full text-[10px] text-gray-400 flex items-center gap-2">
                    <FaLock className="text-gray-500" />
                    <span>Login to see your progress</span>
                  </div>
                </div>
              )}

              {/* ReactFlow Tree */}
              {treeLoading ? (
                <div className="absolute inset-0 flex items-center justify-center"><FaSpinner className="text-mambo-gold text-xl animate-spin" /></div>
              ) : skillTree && skillTree.levels.length > 0 ? (
                <ReactFlowProvider>
                  <SkillTreeGraphInner levels={skillTree.levels} edges={skillTree.edges} onNodeSelect={handleNodeSelect} selectedNodeId={selectedNode?.id || null} isLoggedOut={isLoggedOut} />
                </ReactFlowProvider>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-gray-500 text-sm">No skill tree available</span></div>
              )}
            </div>

            {/* Selected Node Info - With Thumbnail Preview */}
            <AnimatePresence>
              {selectedNode && (() => {
                // Get the best available preview image
                const previewGif = selectedNode.mux_preview_playback_id 
                  ? `https://image.mux.com/${selectedNode.mux_preview_playback_id}/animated.gif?start=0&end=3&width=300&fps=12`
                  : null;
                const staticThumb = selectedNode.thumbnail_url || (selectedNode.mux_preview_playback_id 
                  ? `https://image.mux.com/${selectedNode.mux_preview_playback_id}/thumbnail.jpg?width=300&time=1`
                  : null);
                const displayImage = previewGif || staticThumb;
                const hasProgress = user && selectedNode.completion_percentage > 0;
                
                return (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mt-2 bg-zinc-900/95 border border-zinc-700/50 rounded-xl overflow-hidden">
                    <div className="flex">
                      {/* Thumbnail / GIF Preview */}
                      <div className="relative w-36 h-28 flex-shrink-0 overflow-hidden bg-zinc-800">
                        {displayImage ? (
                          <img
                            src={displayImage}
                            alt={selectedNode.title}
                            className={`w-full h-full object-cover transition-all ${!user || !selectedNode.is_unlocked ? "grayscale brightness-50" : ""}`}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                            <Star className="w-8 h-8 text-zinc-700" />
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/50" />
                        {/* Preview indicator */}
                        {previewGif && selectedNode.is_unlocked && user && (
                          <div className="absolute top-1.5 left-1.5 bg-black/70 rounded-full px-1.5 py-0.5 text-[8px] text-white/80 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />Preview
                          </div>
                        )}
                        {/* Lock overlay */}
                        {(!user || !selectedNode.is_unlocked) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-bold text-white text-sm truncate">{selectedNode.title}</h4>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase flex-shrink-0 ${selectedNode.completion_percentage >= 100 ? "bg-green-500/20 text-green-400" : selectedNode.is_unlocked ? "bg-mambo-gold/20 text-mambo-gold" : "bg-zinc-700/50 text-zinc-400"}`}>
                              {selectedNode.completion_percentage >= 100 ? "✓ Done" : selectedNode.is_unlocked ? "Available" : "Locked"}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400">
                            {selectedNode.lesson_count} lessons
                            {selectedNode.duration_minutes ? ` • ${selectedNode.duration_minutes}m` : ""}
                            {selectedNode.total_xp ? <span className="text-mambo-gold ml-1">+{selectedNode.total_xp} XP</span> : ""}
                          </p>
                          {/* Progress bar */}
                          {hasProgress && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div className={`h-full transition-all ${selectedNode.completion_percentage >= 100 ? "bg-green-500" : "bg-mambo-gold"}`} style={{ width: `${selectedNode.completion_percentage}%` }} />
                              </div>
                              <span className="text-[9px] text-gray-400 font-medium">{Math.round(selectedNode.completion_percentage)}%</span>
                            </div>
                          )}
                        </div>
                        <button onClick={handleStartModule} className="self-start mt-2 px-4 py-1.5 rounded-lg text-[11px] font-bold bg-gradient-to-r from-mambo-gold to-amber-500 hover:from-amber-500 hover:to-mambo-gold text-black flex items-center gap-1.5 transition-all">
                          {!user ? <><FaLock size={9} />Login to Access</> : selectedNode.completion_percentage >= 100 ? <><FaCheck size={9} />Review</> : <><FaPlay size={9} />Start Module</>}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </motion.div>

          {/* Features - Stacked vertically (1/6) */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="lg:col-span-1 order-1 lg:order-2 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex-shrink-0 lg:flex-shrink p-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 min-w-[140px] lg:min-w-0">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg mb-2`}>
                  <feature.icon className="text-white text-sm" />
                </div>
                <h4 className="font-bold text-white text-xs mb-0.5">{feature.title}</h4>
                <p className="text-gray-500 text-[10px] leading-tight">{feature.description}</p>
              </div>
            ))}
            <Link href="/register" className="flex-shrink-0 lg:flex-shrink flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-gray-100 text-black font-bold rounded-xl text-xs transition-all min-w-[140px] lg:min-w-0">
              <HiSparkles className="text-mambo-gold" />Start
            </Link>
          </motion.div>
        </div>
      </div>

      <AuthPromptModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} type="login" />
    </section>
  );
}
