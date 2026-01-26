"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { MuxVideoPlayerHandle } from "../MuxVideoPlayer";
import { FaRedo, FaCircle } from "react-icons/fa";

interface ABLooperProps {
  playerRef: React.RefObject<MuxVideoPlayerHandle | null>;
  duration: number;
}

const MIN_LOOP_DURATION = 1.0; // seconds

// Format time as mm:ss
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function ABLooper({ playerRef, duration }: ABLooperProps) {
  const [enabled, setEnabled] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(duration || 60);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDraggingA, setIsDraggingA] = useState(false);
  const [isDraggingB, setIsDraggingB] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Update end time when duration changes
  useEffect(() => {
    if (duration > 0) {
      setEndTime(duration);
    }
  }, [duration]);

  // Track current time for visual indicator
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 100);
    return () => clearInterval(interval);
  }, [playerRef]);

  // Loop logic
  useEffect(() => {
    if (!enabled || !playerRef.current) return;

    const checkLoop = () => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        if (time >= endTime) {
          playerRef.current.setCurrentTime(startTime);
        }
      }
    };

    const interval = setInterval(checkLoop, 50);
    return () => clearInterval(interval);
  }, [enabled, startTime, endTime, playerRef]);

  // Convert position to time
  const positionToTime = useCallback(
    (clientX: number): number => {
      if (!sliderRef.current || !duration) return 0;
      const rect = sliderRef.current.getBoundingClientRect();
      const position = (clientX - rect.left) / rect.width;
      return Math.max(0, Math.min(duration, position * duration));
    },
    [duration]
  );

  // Handle A handle drag
  const handleADrag = useCallback(
    (clientX: number) => {
      const time = positionToTime(clientX);
      const maxStart = endTime - MIN_LOOP_DURATION;
      setStartTime(Math.min(time, maxStart));
    },
    [positionToTime, endTime]
  );

  // Handle B handle drag
  const handleBDrag = useCallback(
    (clientX: number) => {
      const time = positionToTime(clientX);
      const minEnd = startTime + MIN_LOOP_DURATION;
      setEndTime(Math.max(time, minEnd));
    },
    [positionToTime, startTime]
  );

  // Mouse event handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingA) {
        handleADrag(e.clientX);
      } else if (isDraggingB) {
        handleBDrag(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingA(false);
      setIsDraggingB(false);
    };

    if (isDraggingA || isDraggingB) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDraggingA, isDraggingB, handleADrag, handleBDrag]);

  // Touch event handlers
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        if (isDraggingA) {
          handleADrag(e.touches[0].clientX);
        } else if (isDraggingB) {
          handleBDrag(e.touches[0].clientX);
        }
      }
    };

    const handleTouchEnd = () => {
      setIsDraggingA(false);
      setIsDraggingB(false);
    };

    if (isDraggingA || isDraggingB) {
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
      return () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDraggingA, isDraggingB, handleADrag, handleBDrag]);

  // Calculate positions as percentages
  const startPercent = duration > 0 ? (startTime / duration) * 100 : 0;
  const endPercent = duration > 0 ? (endTime / duration) * 100 : 100;
  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Jump to loop start when enabling
  const toggleLoop = () => {
    if (!enabled && playerRef.current) {
      playerRef.current.setCurrentTime(startTime);
    }
    setEnabled(!enabled);
  };

  // Set A point at current position
  const setAHere = () => {
    if (playerRef.current) {
      const time = playerRef.current.getCurrentTime();
      const maxStart = endTime - MIN_LOOP_DURATION;
      setStartTime(Math.min(time, maxStart));
    }
  };

  // Set B point at current position
  const setBHere = () => {
    if (playerRef.current) {
      const time = playerRef.current.getCurrentTime();
      const minEnd = startTime + MIN_LOOP_DURATION;
      setEndTime(Math.max(time, minEnd));
    }
  };

  if (!duration || duration <= 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          AB Loop
        </span>
        <button
          onClick={toggleLoop}
          className={`
            flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-bold transition-all duration-200
            ${enabled
              ? "bg-mambo-gold text-black shadow-[0_0_10px_rgba(212,175,55,0.3)]"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }
          `}
        >
          <FaRedo className={enabled ? "animate-spin" : ""} style={{ animationDuration: "2s" }} />
          {enabled ? "ON" : "OFF"}
        </button>
      </div>

      {/* Slider */}
      <div
        ref={sliderRef}
        className="relative h-10 bg-gray-800 rounded-lg cursor-pointer select-none"
      >
        {/* Active region highlight */}
        <div
          className={`
            absolute top-0 h-full rounded-lg transition-colors duration-200
            ${enabled ? "bg-blue-500/30" : "bg-gray-700/50"}
          `}
          style={{
            left: `${startPercent}%`,
            width: `${endPercent - startPercent}%`,
          }}
        />

        {/* Current time indicator */}
        <div
          className="absolute top-0 h-full w-0.5 bg-white/50 pointer-events-none"
          style={{ left: `${currentPercent}%` }}
        />

        {/* Handle A (Start) */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            w-5 h-8 rounded-md cursor-grab active:cursor-grabbing
            flex items-center justify-center
            transition-colors duration-200 touch-none
            ${isDraggingA ? "bg-green-400 scale-110" : enabled ? "bg-green-500" : "bg-gray-500"}
          `}
          style={{ left: `${startPercent}%` }}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDraggingA(true);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsDraggingA(true);
          }}
        >
          <span className="text-[10px] font-bold text-white">A</span>
        </div>

        {/* Handle B (End) */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            w-5 h-8 rounded-md cursor-grab active:cursor-grabbing
            flex items-center justify-center
            transition-colors duration-200 touch-none
            ${isDraggingB ? "bg-red-400 scale-110" : enabled ? "bg-red-500" : "bg-gray-500"}
          `}
          style={{ left: `${endPercent}%` }}
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDraggingB(true);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsDraggingB(true);
          }}
        >
          <span className="text-[10px] font-bold text-white">B</span>
        </div>
      </div>

      {/* Time display and quick set buttons */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono">A: {formatTime(startTime)}</span>
          <button
            onClick={setAHere}
            className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
          >
            Set here
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={setBHere}
            className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
          >
            Set here
          </button>
          <span className="text-red-400 font-mono">B: {formatTime(endTime)}</span>
        </div>
      </div>

      {/* Duration display */}
      <div className="text-center text-xs text-gray-500">
        Loop duration: {formatTime(endTime - startTime)}
      </div>
    </div>
  );
}
