"use client";

import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  ConnectionMode,
  useReactFlow,
  Position,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Dagre from "@dagrejs/dagre";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import SkillNode from "./SkillNode";
import GoldEdge from "./GoldEdge";
import StarryBackground from "../ui/StarryBackground";
import NodeTooltip from "./NodeTooltip";
import { useAuth } from "@/contexts/AuthContext";
import AuthPromptModal from "@/components/AuthPromptModal";

// Your backend data types
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
  // Module metadata
  outcome?: string | null;
  duration_minutes?: number;
  total_xp?: number;
  status?: string;  // active, coming_soon, locked
}

interface EdgeData {
  id: string;
  from_level_id: string;
  to_level_id: string;
}

interface HoveredNode {
  levelId: string;
  title: string;
  description?: string;
  lessonCount: number;
  completionPercentage: number;
  isLocked: boolean;
  thumbnailUrl?: string;
  muxPreviewPlaybackId?: string | null;
  position: { x: number; y: number };
  // Module metadata
  outcome?: string | null;
  durationMinutes?: number;
  totalXp?: number;
  status?: string;
}

interface ConstellationGraphProps {
  levels: Level[];
  edges: EdgeData[];
  onNodeClick?: (levelId: string) => void;
  courseId: string;
  courseTitle?: string;
  isCourseLocked?: boolean;
  isAdminMode?: boolean; // Disable scroll capture in admin mode
}

// Register custom node and edge types
const nodeTypes = {
  skill: SkillNode,
};

const edgeTypes = {
  gold: GoldEdge,
};

// Dagre layout configuration - Strict centered layout
const getLayoutedElements = (
  nodes: { id: string; data: any }[],
  edges: { id: string; source: string; target: string; data: any }[]
) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  // Configure strict layout for centered, aesthetic tree with tighter spacing
  // BT = Bottom to Top (root at bottom, tree grows upward)
  g.setGraph({
    rankdir: "BT",      // Bottom to Top (root at bottom, flows upward)
    nodesep: 45,        // Horizontal spacing between nodes in same rank (very tight)
    ranksep: 55,        // Vertical spacing between ranks/tiers (compact edges)
    marginx: 20,
    marginy: 20,
    align: undefined,   // Don't force alignment - let dagre center naturally
    acyclicer: "greedy",
    ranker: "tight-tree", // Better for centered, balanced trees
  });

  // Add nodes to the graph with consistent dimensions
  nodes.forEach((node) => {
    g.setNode(node.id, { width: 90, height: 100 });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // Run the layout algorithm
  Dagre.layout(g);

  // Calculate graph bounds for centering
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  nodes.forEach((node) => {
    const pos = g.node(node.id);
    if (pos) {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y);
    }
  });

  // Calculate center offset to ensure graph is centered at origin
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  // Get the positioned nodes, centered around origin
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - centerX,  // Center horizontally
        y: nodeWithPosition.y - centerY,  // Center vertically
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Inner component that has access to ReactFlow instance
function ConstellationGraphInner({
  levels,
  edges,
  onNodeClick,
  courseId,
  courseTitle,
  isCourseLocked = false,
  isAdminMode = false,
}: ConstellationGraphProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<HoveredNode | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { fitView, setCenter } = useReactFlow();
  const [isVisible, setIsVisible] = useState(false);

  // Determine node status
  const getNodeStatus = useCallback(
    (level: Level): "locked" | "available" | "mastered" | "boss" | "boss_locked" => {
      // In admin mode, show all nodes as available (no locks)
      if (isAdminMode) {
        const isBoss =
          level.title.toUpperCase().includes("BOSS") ||
          level.title.toUpperCase().includes("COMBO");
        return isBoss ? "boss" : "available";
      }

      const isBoss =
        level.title.toUpperCase().includes("BOSS") ||
        level.title.toUpperCase().includes("COMBO");

      // Handle locked boss/combo nodes - they should appear grayed out
      if (isBoss && !level.is_unlocked) return "boss_locked";
      if (isBoss) return "boss";
      if (level.completion_percentage >= 100) return "mastered";
      if (level.is_unlocked) return "available";
      return "locked";
    },
    [isAdminMode]
  );

  // Determine edge status based on BOTH source AND target nodes
  // - mastered: source completed AND target completed (gold shiny)
  // - available: source completed AND target available (flickering animation)
  // - locked: otherwise (grey, not highlighted)
  const getEdgeData = useCallback(
    (fromLevelId: string, toLevelId: string): { status: "locked" | "available" | "mastered"; progress: number } => {
      // In admin mode, show all edges as mastered (full gold)
      if (isAdminMode) {
        return { status: "mastered", progress: 100 };
      }

      const fromLevel = levels.find((l) => l.id === fromLevelId);
      const toLevel = levels.find((l) => l.id === toLevelId);

      if (!fromLevel || !toLevel) return { status: "locked", progress: 0 };

      const sourceCompleted = fromLevel.completion_percentage >= 100;
      const targetCompleted = toLevel.completion_percentage >= 100;
      const targetAvailable = toLevel.is_unlocked;

      // Both nodes completed = mastered edge (full gold glow)
      if (sourceCompleted && targetCompleted) {
        return { status: "mastered", progress: 100 };
      }

      // Source completed and target is available = available edge (flickering)
      if (sourceCompleted && targetAvailable) {
        return { status: "available", progress: fromLevel.completion_percentage };
      }

      // Otherwise = locked (grey)
      return { status: "locked", progress: 0 };
    },
    [levels, isAdminMode]
  );

  // Handle node hover - show tooltip
  const handleNodeMouseEnter: NodeMouseHandler = useCallback(
    (event, node) => {
      // Clear any pending timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      const level = levels.find((l) => l.id === node.id);
      if (!level) return;

      // Get node position in viewport coordinates
      const nodeElement = event.currentTarget as HTMLElement;
      const rect = nodeElement.getBoundingClientRect();

      // Position tooltip to the right of the node
      const tooltipX = rect.right + 16;
      const tooltipY = rect.top - 20;

      setHoveredNode({
        levelId: level.id,
        title: level.title,
        description: level.description,
        lessonCount: level.lesson_count,
        completionPercentage: level.completion_percentage,
        isLocked: !level.is_unlocked,
        thumbnailUrl: level.thumbnail_url,
        muxPreviewPlaybackId: level.mux_preview_playback_id,
        position: { x: tooltipX, y: tooltipY },
        // Module metadata
        outcome: level.outcome,
        durationMinutes: level.duration_minutes,
        totalXp: level.total_xp,
        status: level.status,
      });
    },
    [levels]
  );

  // Handle node hover leave - hide tooltip with delay
  const handleNodeMouseLeave: NodeMouseHandler = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredNode(null);
    }, 150);
  }, []);

  // Handle node click - navigate directly to first lesson of the module
  const handleNodeClick: NodeMouseHandler = useCallback(
    async (event, node) => {
      const level = levels.find((l) => l.id === node.id);
      if (!level) return;

      // Clear tooltip
      setHoveredNode(null);

      // In admin mode, just call the callback (opens lesson editor sidebar)
      if (isAdminMode) {
        onNodeClick?.(node.id);
        return;
      }

      // Require login to access lessons
      if (!user) {
        setShowAuthModal(true);
        return;
      }

      // Require subscription for paid courses
      if (isCourseLocked) {
        setShowSubscribeModal(true);
        return;
      }

      // If unlocked, fetch lessons and navigate to first lesson
      if (level.is_unlocked) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/courses/levels/${node.id}/lessons`,
            {
              credentials: "include" as RequestCredentials,
            }
          );

          if (response.status === 403) {
            // Subscription required
            setShowSubscribeModal(true);
            return;
          }

          if (response.ok) {
            const lessons = await response.json();

            if (lessons && lessons.length > 0) {
              // Sort by order_index and find first incomplete lesson, or first lesson
              const sortedLessons = lessons.sort((a: any, b: any) => a.order_index - b.order_index);
              const nextLesson = sortedLessons.find((l: any) => !l.is_completed) || sortedLessons[0];
              router.push(`/lesson/${nextLesson.id}`);
              onNodeClick?.(node.id);
              return;
            }
          }
        } catch (err) {
          console.error('Failed to fetch lessons:', err);
        }
      }
      // If locked, tooltip already shows the message
    },
    [levels, courseId, router, onNodeClick, isAdminMode, isCourseLocked, user]
  );

  // Create nodes and edges — use stored positions when available, dagre as fallback
  // Also return graph bounds for computing the initial viewport.
  const { nodes: flowNodes, edges: flowEdges, graphBounds } = useMemo(() => {
    // Scale factor: DB stores 0-100 positions, convert to pixel coords for ReactFlow
    // Needs to be large enough that nodes (90x100px) don't overlap at 10-unit y spacing
    const POS_SCALE = 20;

    // Check if levels have meaningful stored positions (not all zero/default)
    const hasStoredPositions = levels.some(
      (l) => l.x_position > 0 || l.y_position > 0
    );

    // With BT (Bottom-to-Top) layout:
    // - Edges exit from TOP of source nodes (lower in tree, going up)
    // - Edges enter at BOTTOM of target nodes (higher in tree)
    const initialNodes = levels.map((level) => ({
      id: level.id,
      type: "skill",
      position: hasStoredPositions
        ? {
            x: (level.x_position - 50) * POS_SCALE,
            y: level.y_position * POS_SCALE,
          }
        : { x: 0, y: 0 },
      sourcePosition: Position.Top,    // Edges exit from top
      targetPosition: Position.Bottom, // Edges enter from bottom
      data: {
        id: level.id,
        title: level.title,
        icon: undefined,
        status: getNodeStatus(level),
        progress: level.completion_percentage, // Pass progress to node
        isAdminMode: isAdminMode, // Pass admin mode flag to hide progress circles
      },
    }));

    // Create edges with status based on both source AND target nodes
    const initialEdges = edges.map((edge) => {
      const edgeData = getEdgeData(edge.from_level_id, edge.to_level_id);
      return {
        id: edge.id,
        source: edge.from_level_id,
        target: edge.to_level_id,
        type: "gold",
        data: {
          status: edgeData.status,
          progress: edgeData.progress,
        },
      };
    });

    // Use stored positions if available, otherwise fall back to dagre auto-layout
    const result = hasStoredPositions
      ? { nodes: initialNodes, edges: initialEdges }
      : getLayoutedElements(initialNodes, initialEdges);

    // Compute graph bounding box from final positions
    const NODE_W = 90, NODE_H = 100;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const n of result.nodes) {
      minX = Math.min(minX, n.position.x);
      maxX = Math.max(maxX, n.position.x + NODE_W);
      minY = Math.min(minY, n.position.y);
      maxY = Math.max(maxY, n.position.y + NODE_H);
    }

    return {
      ...result,
      graphBounds: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY },
    };
  }, [levels, edges, getNodeStatus, getEdgeData, isAdminMode]);

  // Compute defaultViewport from graph bounds so all nodes are visible on the
  // very first frame — no DOM measurement, no timing dependency.
  const initialViewport = useMemo(() => {
    if (!graphBounds || graphBounds.width === 0) return { x: 0, y: 0, zoom: 0.5 };

    const vw = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1080;
    const pad = 0.15; // 15% padding on each side

    const scaleX = (vw * (1 - pad * 2)) / graphBounds.width;
    const scaleY = (vh * (1 - pad * 2)) / graphBounds.height;
    const zoom = Math.min(scaleX, scaleY, 1.0);

    const cx = (graphBounds.minX + graphBounds.maxX) / 2;
    const cy = (graphBounds.minY + graphBounds.maxY) / 2;

    return { x: vw / 2 - cx * zoom, y: vh / 2 - cy * zoom, zoom };
  }, [graphBounds]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full transition-opacity duration-500 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        overflow: 'hidden',
        isolation: 'isolate'
      }}
    >
      {/* Night Sky Background Layer */}
      {!isAdminMode && (
        <div className="absolute inset-0 z-0">
          <StarryBackground />
          {/* Floating ethereal particles overlay */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating orbs of light - using deterministic positions */}
            {[
              { size: 6, left: 15, top: 20, dur: 6, yMove: 35 },
              { size: 8, left: 75, top: 30, dur: 7, yMove: 45 },
              { size: 5, left: 25, top: 60, dur: 8, yMove: 40 },
              { size: 7, left: 60, top: 70, dur: 5, yMove: 50 },
              { size: 6, left: 40, top: 40, dur: 9, yMove: 35 },
              { size: 9, left: 85, top: 55, dur: 6, yMove: 55 },
              { size: 5, left: 50, top: 15, dur: 7, yMove: 45 },
              { size: 7, left: 30, top: 80, dur: 8, yMove: 40 },
            ].map((orb, i) => (
              <motion.div
                key={`orb-${i}`}
                className="absolute rounded-full"
                style={{
                  width: orb.size,
                  height: orb.size,
                  left: `${orb.left}%`,
                  top: `${orb.top}%`,
                  background: i % 2 === 0
                    ? "radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(255, 200, 100, 0.4) 50%, transparent 70%)"
                    : "radial-gradient(circle, rgba(255, 230, 180, 0.7) 0%, rgba(255, 215, 0, 0.3) 50%, transparent 70%)",
                  filter: "blur(1px)",
                  boxShadow: "0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 200, 100, 0.3)",
                }}
                animate={{
                  y: [0, -orb.yMove, 0],
                  x: [0, i % 2 === 0 ? 15 : -15, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: orb.dur,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.8,
                }}
              />
            ))}
            {/* Larger ambient glow spots */}
            {[
              { size: 150, left: 20, top: 30, dur: 10 },
              { size: 200, left: 70, top: 60, dur: 12 },
              { size: 180, left: 50, top: 20, dur: 9 },
              { size: 160, left: 30, top: 70, dur: 11 },
            ].map((glow, i) => (
              <motion.div
                key={`glow-${i}`}
                className="absolute rounded-full"
                style={{
                  width: glow.size,
                  height: glow.size,
                  left: `${glow.left}%`,
                  top: `${glow.top}%`,
                  background: "radial-gradient(circle, rgba(255, 200, 100, 0.08) 0%, rgba(255, 215, 0, 0.03) 50%, transparent 70%)",
                  filter: "blur(30px)",
                }}
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: glow.dur,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 2,
                }}
              />
            ))}
            {/* Tiny sparkles */}
            {[
              { left: 12, top: 25, dur: 2.5, delay: 0 },
              { left: 88, top: 15, dur: 3, delay: 1 },
              { left: 35, top: 45, dur: 2.2, delay: 2 },
              { left: 65, top: 35, dur: 2.8, delay: 0.5 },
              { left: 22, top: 75, dur: 3.2, delay: 1.5 },
              { left: 78, top: 85, dur: 2.4, delay: 3 },
              { left: 45, top: 55, dur: 2.6, delay: 0.8 },
              { left: 55, top: 22, dur: 3.5, delay: 2.5 },
              { left: 8, top: 50, dur: 2.3, delay: 1.2 },
              { left: 92, top: 40, dur: 2.9, delay: 3.5 },
              { left: 28, top: 18, dur: 2.7, delay: 0.3 },
              { left: 72, top: 68, dur: 3.1, delay: 2.2 },
              { left: 42, top: 88, dur: 2.1, delay: 4 },
              { left: 18, top: 62, dur: 3.3, delay: 1.8 },
              { left: 82, top: 28, dur: 2.5, delay: 0.7 },
            ].map((sparkle, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute"
                style={{
                  width: 2,
                  height: 2,
                  left: `${sparkle.left}%`,
                  top: `${sparkle.top}%`,
                  background: "white",
                  borderRadius: "50%",
                  boxShadow: "0 0 4px rgba(255, 255, 255, 0.8), 0 0 8px rgba(255, 215, 0, 0.5)",
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: sparkle.dur,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: sparkle.delay,
                }}
              />
            ))}
          </div>
        </div>
      )}
      {isAdminMode && (
        <div className="absolute inset-0 z-0 bg-black">
          {/* Simple starfield for admin mode - no fixed positioning */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(2px 2px at 60% 70%, white, transparent), radial-gradient(1px 1px at 50% 50%, white, transparent), radial-gradient(1px 1px at 80% 10%, white, transparent), radial-gradient(2px 2px at 90% 60%, white, transparent), radial-gradient(1px 1px at 33% 80%, white, transparent), radial-gradient(1px 1px at 15% 90%, white, transparent)',
            backgroundSize: '200% 200%',
            backgroundPosition: '0% 0%'
          }} />
        </div>
      )}

      {/* ReactFlow Graph Layer */}
      <div className="absolute inset-0 z-10" style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          onNodeClick={handleNodeClick}
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
          defaultViewport={initialViewport}
          onInit={() => setIsVisible(true)}
          minZoom={0.2}
          maxZoom={1.5}
          defaultEdgeOptions={{
            type: "gold",
          }}
          // Disable dragging/connecting but keep clicking
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          selectNodesOnDrag={false}
          // Pan and zoom settings - in admin mode, allow drag/pinch but not scroll
          panOnScroll={!isAdminMode}
          panOnDrag={true}  // Always allow drag to pan
          zoomOnScroll={!isAdminMode}  // Disable wheel zoom in admin mode
          zoomOnPinch={true}  // Always allow pinch to zoom
          preventScrolling={isAdminMode ? false : true}  // Allow page scroll in admin mode
          // Custom styling - transparent to show starry background
          proOptions={{ hideAttribution: true }}
          style={{ background: "transparent" }}
        >
          {/* Controls */}
          <Controls
            showInteractive={false}
            className="!bg-black/60 !border-yellow-900/30 !rounded-lg !shadow-xl [&>button]:!bg-black/60 [&>button]:!border-yellow-900/30 [&>button]:!text-yellow-500 [&>button:hover]:!bg-yellow-900/20"
          />
        </ReactFlow>
      </div>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {hoveredNode && (
          <NodeTooltip
            levelId={hoveredNode.levelId}
            title={hoveredNode.title}
            description={hoveredNode.description}
            lessonCount={hoveredNode.lessonCount}
            completionPercentage={hoveredNode.completionPercentage}
            isLocked={hoveredNode.isLocked}
            thumbnailUrl={hoveredNode.thumbnailUrl}
            muxPreviewPlaybackId={hoveredNode.muxPreviewPlaybackId}
            position={hoveredNode.position}
            courseId={courseId}
            onClose={() => setHoveredNode(null)}
            // Module metadata
            outcome={hoveredNode.outcome}
            durationMinutes={hoveredNode.durationMinutes}
            totalXp={hoveredNode.totalXp}
            status={hoveredNode.status}
            isAdminMode={isAdminMode}
          />
        )}
      </AnimatePresence>

      {/* Legend overlay - compact (hide in admin mode) */}
      {!isAdminMode && (
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm border border-yellow-900/20 rounded-lg px-3 py-2 shadow-lg z-20 pointer-events-none">
          <div className="flex items-center gap-4 text-[10px]">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full border border-gray-600/50 bg-gray-900/80 opacity-60 flex items-center justify-center">
                <span className="text-[6px]">🔒</span>
              </div>
              <span className="text-gray-500">Locked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full border border-yellow-500/50 bg-yellow-900/20 shadow-[0_0_6px_rgba(255,215,0,0.2)]"></div>
              <span className="text-yellow-200/80">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full border border-yellow-400 bg-yellow-900/30 shadow-[0_0_8px_rgba(255,215,0,0.3)] flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
              </div>
              <span className="text-yellow-300">Mastered</span>
            </div>
          </div>
        </div>
      )}

      {/* Auth prompt for logged-out users clicking on nodes */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        type="login"
      />

      {/* Subscribe prompt for users without subscription */}
      <AuthPromptModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        type="subscribe"
        courseTitle={courseTitle}
      />
    </div>
  );
}

// Wrapper component with ReactFlowProvider for proper hook access
// key={courseId} forces a full remount on client-side navigation between courses,
// ensuring ReactFlow starts with a fresh instance (no stale viewport state).
export default function ConstellationGraph(props: ConstellationGraphProps) {
  return (
    <ReactFlowProvider key={props.courseId}>
      <ConstellationGraphInner {...props} />
    </ReactFlowProvider>
  );
}
