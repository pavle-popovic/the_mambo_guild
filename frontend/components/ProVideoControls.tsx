"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { MuxVideoPlayerHandle } from "./MuxVideoPlayer";
import SpeedControl from "./pro-controls/SpeedControl";
import FrameByFrame from "./pro-controls/FrameByFrame";
import ABLooper from "./pro-controls/ABLooper";
import UpgradePrompt from "./pro-controls/UpgradePrompt";
import { FaCrown } from "react-icons/fa";

interface ProVideoControlsProps {
  playerRef: React.RefObject<MuxVideoPlayerHandle | null>;
  isPerformer: boolean;
  duration: number;
  onUpgradeClick?: () => void;
}

// 1 frame at approximately 25fps
const FRAME_DURATION = 0.04;

export default function ProVideoControls({
  playerRef,
  isPerformer,
  duration,
  onUpgradeClick,
}: ProVideoControlsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Keyboard shortcuts for frame-by-frame
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isPerformer || !playerRef.current) return;

      // Only handle if not typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Frame stepping only when paused
      if (playerRef.current.isPaused()) {
        if (e.key === ",") {
          e.preventDefault();
          const currentTime = playerRef.current.getCurrentTime();
          const newTime = Math.max(currentTime - FRAME_DURATION, 0);
          playerRef.current.setCurrentTime(newTime);
        } else if (e.key === ".") {
          e.preventDefault();
          const currentTime = playerRef.current.getCurrentTime();
          const videoDuration = playerRef.current.getDuration();
          const newTime = Math.min(currentTime + FRAME_DURATION, videoDuration);
          playerRef.current.setCurrentTime(newTime);
        }
      }
    },
    [isPerformer, playerRef]
  );

  // Register keyboard shortcuts
  useEffect(() => {
    if (isPerformer) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isPerformer, handleKeyDown]);

  // If not a Performer, show upgrade prompt
  if (!isPerformer) {
    return (
      <div ref={containerRef} className="mt-4">
        <UpgradePrompt onUpgrade={onUpgradeClick} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mt-4">
      {/* Collapsible header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-3 bg-gray-900/90 backdrop-blur-sm border border-mambo-gold/30 rounded-t-xl hover:bg-gray-800/90 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FaCrown className="text-mambo-gold" />
          <span className="text-sm font-bold text-white">Pro Mastery Controls</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isCollapsed ? "" : "rotate-180"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Controls panel */}
      <div
        className={`
          bg-gray-900/90 backdrop-blur-sm border border-t-0 border-mambo-gold/30 rounded-b-xl
          transition-all duration-300 overflow-hidden
          ${isCollapsed ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100 p-4"}
        `}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Frame by Frame */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
            <FrameByFrame playerRef={playerRef} />
          </div>

          {/* Speed Control */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
            <SpeedControl playerRef={playerRef} />
          </div>

          {/* AB Looper */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 md:col-span-1">
            <ABLooper playerRef={playerRef} duration={duration} />
          </div>
        </div>
      </div>
    </div>
  );
}
