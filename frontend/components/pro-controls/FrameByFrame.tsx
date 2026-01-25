"use client";

import { useState, useEffect } from "react";
import type { MuxVideoPlayerHandle } from "../MuxVideoPlayer";
import { FaStepBackward, FaStepForward } from "react-icons/fa";

interface FrameByFrameProps {
  playerRef: React.RefObject<MuxVideoPlayerHandle | null>;
}

// 1 frame at approximately 25fps
const FRAME_DURATION = 0.04;

export default function FrameByFrame({ playerRef }: FrameByFrameProps) {
  const [isPaused, setIsPaused] = useState(true);

  // Track pause state
  useEffect(() => {
    const checkPaused = () => {
      if (playerRef.current) {
        setIsPaused(playerRef.current.isPaused());
      }
    };

    // Check periodically
    const interval = setInterval(checkPaused, 200);
    return () => clearInterval(interval);
  }, [playerRef]);

  const stepBackward = () => {
    if (playerRef.current && playerRef.current.isPaused()) {
      const currentTime = playerRef.current.getCurrentTime();
      const newTime = Math.max(currentTime - FRAME_DURATION, 0);
      playerRef.current.setCurrentTime(newTime);
    }
  };

  const stepForward = () => {
    if (playerRef.current && playerRef.current.isPaused()) {
      const currentTime = playerRef.current.getCurrentTime();
      const duration = playerRef.current.getDuration();
      const newTime = Math.min(currentTime + FRAME_DURATION, duration);
      playerRef.current.setCurrentTime(newTime);
    }
  };

  const handlePause = () => {
    if (playerRef.current) {
      playerRef.current.pause();
      setIsPaused(true);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
        Frame-by-Frame
      </span>
      <div className="flex items-center gap-3">
        {/* Step Backward Button */}
        <button
          onClick={stepBackward}
          disabled={!isPaused}
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
            ${
              isPaused
                ? "bg-gray-800 text-white hover:bg-gray-700 hover:scale-105 active:scale-95"
                : "bg-gray-800/50 text-gray-600 cursor-not-allowed"
            }
          `}
          title={isPaused ? "Step backward (,)" : "Pause video first"}
        >
          <FaStepBackward className="text-lg" />
        </button>

        {/* Step Forward Button */}
        <button
          onClick={stepForward}
          disabled={!isPaused}
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
            ${
              isPaused
                ? "bg-gray-800 text-white hover:bg-gray-700 hover:scale-105 active:scale-95"
                : "bg-gray-800/50 text-gray-600 cursor-not-allowed"
            }
          `}
          title={isPaused ? "Step forward (.)" : "Pause video first"}
        >
          <FaStepForward className="text-lg" />
        </button>

        {/* Pause hint */}
        {!isPaused && (
          <button
            onClick={handlePause}
            className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 bg-gray-800/50 rounded-lg"
          >
            Pause to step
          </button>
        )}
      </div>

      {/* Keyboard shortcut hint */}
      <div className="text-xs text-gray-500 flex items-center gap-3">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 font-mono">,</kbd>
          <span>back</span>
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 font-mono">.</kbd>
          <span>forward</span>
        </span>
      </div>
    </div>
  );
}
