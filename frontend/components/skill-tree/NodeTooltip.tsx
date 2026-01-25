"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Zap, BookOpen, Lock, Trophy } from "lucide-react";

interface NodeTooltipProps {
  levelId: string;
  title: string;
  description?: string;
  lessonCount: number;
  completionPercentage: number;
  isLocked: boolean;
  thumbnailUrl?: string;
  muxPreviewPlaybackId?: string | null;  // For animated GIF preview
  position: { x: number; y: number };
  courseId: string;
  onClose: () => void;
  // New metadata fields
  outcome?: string | null;  // e.g., "Unlock Stable Turns"
  durationMinutes?: number;
  totalXp?: number;
  status?: string;  // active, coming_soon, locked
  isAdminMode?: boolean;  // In admin mode, don't show locked state
}

// Tooltip dimensions (approximate)
const TOOLTIP_WIDTH = 320;  // w-80 = 20rem = 320px
const TOOLTIP_HEIGHT = 380; // Approximate height with video preview
const PADDING = 16;         // Minimum distance from viewport edge

export default function NodeTooltip({
  levelId,
  title,
  description,
  lessonCount,
  completionPercentage,
  isLocked,
  thumbnailUrl,
  muxPreviewPlaybackId,
  position,
  courseId,
  onClose,
  // New metadata
  outcome,
  durationMinutes = 0,
  totalXp = 0,
  status = "active",
  isAdminMode = false,
}: NodeTooltipProps) {
  // Auto-play preview when tooltip appears
  const [showPreview, setShowPreview] = useState(true);
  const isCompleted = completionPercentage >= 100;
  const inProgress = completionPercentage > 0 && completionPercentage < 100;

  // Calculate adjusted position to keep tooltip within viewport
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    const calculatePosition = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = position.x;
      let y = position.y;

      // Check right edge - if tooltip would overflow, position to the left of the node
      if (x + TOOLTIP_WIDTH + PADDING > viewportWidth) {
        // Position to the left of the original position (node)
        x = Math.max(PADDING, position.x - TOOLTIP_WIDTH - 100);
      }

      // Check left edge
      if (x < PADDING) {
        x = PADDING;
      }

      // Check bottom edge - if tooltip would overflow, position above
      if (y + TOOLTIP_HEIGHT + PADDING > viewportHeight) {
        y = viewportHeight - TOOLTIP_HEIGHT - PADDING;
      }

      // Check top edge
      if (y < PADDING) {
        y = PADDING;
      }

      setAdjustedPosition({ x, y });
    };

    calculatePosition();
  }, [position]);

  // Animated GIF preview URL (3 seconds, 15fps) - uses Mux Image API (cost efficient!)
  const previewGifUrl = muxPreviewPlaybackId
    ? `https://image.mux.com/${muxPreviewPlaybackId}/animated.gif?start=0&end=3&width=400&fps=15`
    : null;

  // Static thumbnail from Mux or custom URL
  const staticThumbnail = thumbnailUrl || (muxPreviewPlaybackId
    ? `https://image.mux.com/${muxPreviewPlaybackId}/thumbnail.jpg?width=400&time=1`
    : null);

  // Auto-play GIF on hover - show GIF if available, otherwise static thumbnail
  const displayUrl = showPreview && previewGifUrl ? previewGifUrl : staticThumbnail;

  // Format duration (e.g., "15 min" or "1h 30m")
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // In admin mode, we don't show locked state (admin is for building, not learning)
  const displayLocked = isAdminMode ? false : isLocked;

  // Status badge color
  const getStatusBadge = () => {
    if (status === "coming_soon") {
      return { text: "Coming Soon", bg: "bg-purple-500/20", border: "border-purple-500/50", color: "text-purple-400" };
    }
    // Don't show locked badge in admin mode
    if (!isAdminMode && (status === "locked" || isLocked)) {
      return { text: "Locked", bg: "bg-gray-500/20", border: "border-gray-500/50", color: "text-gray-400" };
    }
    if (isCompleted) {
      return { text: "Completed", bg: "bg-green-500/20", border: "border-green-500/50", color: "text-green-400" };
    }
    if (inProgress) {
      return { text: "In Progress", bg: "bg-yellow-500/20", border: "border-yellow-500/50", color: "text-yellow-400" };
    }
    return null; // Don't show badge for not started
  };

  const statusBadge = getStatusBadge();

  return (
    <motion.div
      className="fixed z-50 pointer-events-auto"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      onMouseLeave={onClose}
    >
      <div
        className={`w-80 rounded-xl overflow-hidden backdrop-blur-xl border shadow-2xl ${
          displayLocked
            ? "bg-gray-900/95 border-gray-700/50"
            : isCompleted
            ? "bg-gradient-to-b from-green-900/90 to-gray-900/95 border-green-700/50"
            : "bg-gradient-to-b from-yellow-900/30 to-gray-900/95 border-yellow-900/50"
        }`}
        style={{
          boxShadow: displayLocked
            ? "0 10px 40px rgba(0, 0, 0, 0.5)"
            : isCompleted
            ? "0 10px 40px rgba(34, 197, 94, 0.15), 0 0 20px rgba(34, 197, 94, 0.1)"
            : "0 10px 40px rgba(212, 175, 55, 0.15), 0 0 20px rgba(255, 215, 0, 0.1)",
        }}
      >
        {/* Thumbnail / Preview - LARGE auto-playing animated GIF */}
        <div className="relative aspect-video overflow-hidden">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={title}
              className={`w-full h-full object-cover ${
                displayLocked ? "grayscale opacity-50" : ""
              }`}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center ${displayLocked ? "opacity-50" : ""}`}>
              <BookOpen className="w-12 h-12 text-gray-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

          {/* Status Badge */}
          {statusBadge && (
            <div className={`absolute top-3 left-3 ${statusBadge.bg} ${statusBadge.border} border rounded-full px-2.5 py-1 text-[10px] ${statusBadge.color} font-medium`}>
              {statusBadge.text}
            </div>
          )}

          {/* Preview indicator */}
          {previewGifUrl && !displayLocked && (
            <div className="absolute top-3 right-3 bg-black/70 rounded-full px-2.5 py-1 text-[10px] text-white/90 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Preview
            </div>
          )}

          {/* Title overlay at bottom of video */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3
              className={`font-bold text-lg ${
                displayLocked
                  ? "text-gray-400"
                  : isCompleted
                  ? "text-green-400"
                  : "text-yellow-200"
              }`}
            >
              {title}
            </h3>
          </div>
        </div>

        {/* Content - Compact */}
        <div className="p-3">
          {/* Outcome (if present) */}
          {outcome && (
            <div className="flex items-center gap-2 mb-2 bg-black/30 rounded-lg px-2.5 py-1.5">
              <Trophy className={`w-4 h-4 ${isCompleted ? "text-green-500" : "text-yellow-500"}`} />
              <span className={`text-sm font-medium ${isCompleted ? "text-green-400" : "text-yellow-400"}`}>
                {outcome}
              </span>
            </div>
          )}

          {/* Stats Row - Centered */}
          <div className="flex items-center justify-center gap-4 py-2 border-y border-gray-700/50 text-xs text-gray-400">
            <div className="flex items-center gap-1.5 px-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{lessonCount} lessons</span>
            </div>
            {durationMinutes > 0 && (
              <div className="flex items-center gap-1.5 px-2 border-l border-gray-700/50">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDuration(durationMinutes)}</span>
              </div>
            )}
            {totalXp > 0 && (
              <div className="flex items-center gap-1.5 px-2 border-l border-gray-700/50">
                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                <span>{totalXp} XP</span>
              </div>
            )}
          </div>

          {/* Progress Section */}
          {!displayLocked && (
            <div className="flex items-center gap-3 mt-3">
              {/* Progress Bar */}
              <div className="flex-1">
                <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isCompleted
                        ? "bg-gradient-to-r from-green-500 to-emerald-400"
                        : "bg-gradient-to-r from-yellow-500 to-amber-400"
                    }`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Percentage */}
              <span
                className={`text-sm font-bold min-w-[3ch] ${
                  isCompleted ? "text-green-400" : "text-yellow-400"
                }`}
              >
                {Math.round(completionPercentage)}%
              </span>
            </div>
          )}

          {/* Locked Message - Only show in learner mode, not admin mode */}
          {displayLocked ? (
            <div className="bg-gray-800/50 rounded-lg p-3 mt-3 border border-gray-700/50">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-400">
                  Content Locked
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Complete the prerequisite modules to unlock this content.
              </p>
            </div>
          ) : (
            /* Click hint for unlocked nodes */
            <div className="text-center mt-3">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                {isAdminMode ? "Click to edit lessons" : "Click to start lessons"}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
