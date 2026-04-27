"use client";

/**
 * SimpleMuxPlayer — minimal Mux Player wrapper for short user-uploaded
 * community clips. NONE of the caption / locale-track / shadow-DOM
 * mutation-observer machinery from `MuxVideoPlayer` runs here, because
 * community videos have no captions and don't need it.
 *
 * Why a separate component:
 *   The full `MuxVideoPlayer` injects styles into nested shadow roots
 *   on a 1-second interval for the first 10 seconds, walks the entire
 *   shadow DOM tree to override buffered-range colors, hooks
 *   fullscreenchange / pictureinpicture / cuechange events, and runs
 *   a MutationObserver-style polling loop. On phones / weaker laptops
 *   that compounds with the video decode loop and shows up as
 *   stutter / dropped frames during playback. For a 30s practice clip
 *   none of that work is worth the cost.
 *
 * Caption-color CSS variables are set via the `style` prop directly —
 * Mux Player propagates them to its top shadow root. Nested children
 * (where the recursive walker matters) are non-essential for a clip
 * with no caption tracks.
 */

import MuxPlayer from "@mux/mux-player-react";

interface SimpleMuxPlayerProps {
  playbackId: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
  containFit?: boolean;
  maxResolution?: "720p" | "1080p" | "1440p" | "2160p";
  preload?: "none" | "metadata" | "auto";
  metadata?: {
    video_title?: string;
    video_id?: string;
  };
}

export default function SimpleMuxPlayer({
  playbackId,
  poster,
  autoPlay = false,
  className,
  containFit,
  maxResolution = "720p",
  preload,
  metadata,
}: SimpleMuxPlayerProps) {
  const posterUrl =
    poster || (playbackId ? `https://image.mux.com/${playbackId}/thumbnail.png` : undefined);

  return (
    <div
      className={`w-full h-full bg-black relative ${className || ""}`}
      style={containFit ? { ["--media-object-fit" as any]: "contain" } : undefined}
    >
      <MuxPlayer
        playbackId={playbackId}
        streamType="on-demand"
        autoPlay={autoPlay}
        maxResolution={maxResolution}
        preload={preload ?? (autoPlay ? "auto" : "metadata")}
        poster={posterUrl}
        primaryColor="#D4AF37"
        secondaryColor="#8c8c8c"
        playbackRates={[0.5, 0.75, 1, 1.25, 1.5] as any}
        metadata={{
          video_title: metadata?.video_title || undefined,
          video_id: metadata?.video_id || playbackId,
          ...metadata,
        }}
        style={{
          "--controls-background-color": "rgba(0, 0, 0, 0.8)",
          "--media-range-buffered-color": "#6b7280",
          "--media-range-track-buffered-color": "#6b7280",
          "--media-range-bar-color": "#D4AF37",
          "--media-primary-color": "#D4AF37",
          "--media-secondary-color": "#6b7280",
          "--media-object-fit": containFit ? "contain" : "cover",
          display: "block",
          height: "100%",
          width: "100%",
        } as any}
      />
    </div>
  );
}
