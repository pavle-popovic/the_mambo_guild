"use client";

import MuxPlayer from "@mux/mux-player-react";

interface MuxVideoPlayerProps {
  playbackId: string;
  poster?: string;
  onEnded?: () => void;
  autoPlay?: boolean;
  durationMinutes?: number | null;
  metadata?: {
    video_title?: string;
    video_id?: string;
  };
}

export default function MuxVideoPlayer({
  playbackId,
  poster,
  onEnded,
  autoPlay = false,
  durationMinutes,
  metadata,
}: MuxVideoPlayerProps) {

  // Use Mux thumbnail as poster if not provided
  const posterUrl =
    poster || (playbackId ? `https://image.mux.com/${playbackId}/thumbnail.png` : undefined);

  return (
    <div className="w-full bg-gray-900 relative aspect-video max-h-[70vh]">
      <MuxPlayer
        playbackId={playbackId}
        streamType="on-demand"
        autoPlay={autoPlay}
        poster={posterUrl}
        primaryColor="#3b82f6"
        metadata={{
          video_title: metadata?.video_title || undefined,
          video_id: metadata?.video_id || playbackId,
          ...metadata,
        }}
        onEnded={onEnded}
        style={{
          "--controls-background-color": "rgba(0, 0, 0, 0.8)",
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
}

