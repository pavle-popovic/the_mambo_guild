"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ABLoopState } from "@/hooks/useABLoop";

interface Props {
  state: ABLoopState;
  duration: number;
  className?: string;
}

function fmt(t: number): string {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ABLoopBar({ state, duration, className }: Props) {
  const { enabled, aTime, bTime, currentTime, setATime, setBTime, seek } = state;
  const railRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<null | "A" | "B">(null);

  const toTime = useCallback(
    (clientX: number) => {
      if (!railRef.current || !duration) return 0;
      const rect = railRef.current.getBoundingClientRect();
      return Math.max(
        0,
        Math.min(duration, ((clientX - rect.left) / rect.width) * duration)
      );
    },
    [duration]
  );

  // Tap/click the rail (not the A or B handles) = seek the video. The bar
  // reads visually as a play bar, so users expect this — especially on
  // mobile, where the only way to reach the A marker previously was to
  // disable the loop, scrub the Mux controls, and re-enable.
  const handleRailPointer = useCallback(
    (clientX: number) => {
      seek(toTime(clientX));
    },
    [seek, toTime]
  );

  useEffect(() => {
    if (!drag) return;
    const move = (x: number) => {
      const t = toTime(x);
      if (drag === "A") setATime(t);
      else setBTime(t);
    };
    const onMM = (e: MouseEvent) => move(e.clientX);
    const onTM = (e: TouchEvent) => {
      if (e.touches[0]) move(e.touches[0].clientX);
    };
    const stop = () => setDrag(null);
    document.addEventListener("mousemove", onMM);
    document.addEventListener("mouseup", stop);
    document.addEventListener("touchmove", onTM);
    document.addEventListener("touchend", stop);
    return () => {
      document.removeEventListener("mousemove", onMM);
      document.removeEventListener("mouseup", stop);
      document.removeEventListener("touchmove", onTM);
      document.removeEventListener("touchend", stop);
    };
  }, [drag, toTime, setATime, setBTime]);

  if (!enabled || !duration) return null;

  const pct = (t: number) => (t / duration) * 100;

  return (
    <div className={`flex flex-col gap-0.5 ${className || ""}`}>
      {/* Time labels stacked above the rail so the rail can span edge-to-edge
          and line up with Mux's scrubber. Hidden on very small screens to
          save vertical space over a tall portrait video. */}
      <div className="hidden sm:flex justify-between px-0.5 text-[10px] font-bold tabular-nums">
        <span className="text-green-400">A {fmt(aTime)}</span>
        <span className="text-red-400">B {fmt(bTime)}</span>
      </div>
      <div
        ref={railRef}
        className="relative w-full h-6 select-none cursor-pointer touch-none"
        onClick={(e) => {
          // Don't scrub if the click originated on a handle (handles stop
          // propagation on mousedown, but onClick can still bubble in some
          // browsers after a tap).
          const target = e.target as HTMLElement;
          if (target.closest("[data-ab-handle]")) return;
          handleRailPointer(e.clientX);
        }}
        onTouchStart={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-ab-handle]")) return;
          if (e.touches[0]) handleRailPointer(e.touches[0].clientX);
        }}
      >
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-white/20 rounded-full" />
        {bTime > aTime && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-yellow-400/80 rounded-full"
            style={{ left: `${pct(aTime)}%`, width: `${pct(bTime - aTime)}%` }}
          />
        )}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white pointer-events-none"
          style={{ left: `${pct(currentTime)}%` }}
        />
        <div
          data-ab-handle="A"
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing touch-none ${
            drag === "A" ? "bg-green-300 scale-110" : "bg-green-500"
          }`}
          style={{ left: `${pct(aTime)}%` }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDrag("A");
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setDrag("A");
          }}
        >
          <span className="text-[10px] font-black text-white leading-none pointer-events-none">A</span>
        </div>
        <div
          data-ab-handle="B"
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing touch-none ${
            drag === "B" ? "bg-red-300 scale-110" : "bg-red-500"
          }`}
          style={{ left: `${pct(bTime)}%` }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDrag("B");
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setDrag("B");
          }}
        >
          <span className="text-[10px] font-black text-white leading-none pointer-events-none">B</span>
        </div>
      </div>
    </div>
  );
}
