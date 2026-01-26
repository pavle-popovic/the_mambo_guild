"use client";

import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import { forwardRef, useImperativeHandle, useRef, useCallback } from "react";

interface MuxVideoPlayerProps {
  playbackId: string;
  poster?: string;
  onEnded?: () => void;
  onPlay?: () => void;
  onPlaying?: () => void; // Fires when playback actually starts (after buffering)
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  autoPlay?: boolean;
  durationMinutes?: number | null;
  metadata?: {
    video_title?: string;
    video_id?: string;
  };
}

export interface MuxVideoPlayerHandle {
  getVideoElement: () => HTMLVideoElement | null;
  getCurrentTime: () => number;
  getDuration: () => number;
  setCurrentTime: (time: number) => void;
  getPlaybackRate: () => number;
  setPlaybackRate: (rate: number) => void;
  isPaused: () => boolean;
  play: () => void;
  pause: () => void;
}

const MuxVideoPlayer = forwardRef<MuxVideoPlayerHandle, MuxVideoPlayerProps>(
  function MuxVideoPlayer(
    {
      playbackId,
      poster,
      onEnded,
      onPlay,
      onPlaying,
      onPause,
      onTimeUpdate,
      onLoadedMetadata,
      autoPlay = false,
      durationMinutes,
      metadata,
    },
    ref
  ) {
    const muxPlayerRef = useRef<MuxPlayerElement>(null);

    // Get the underlying video element from Mux Player
    const getVideoElement = useCallback((): HTMLVideoElement | null => {
      const player = muxPlayerRef.current;
      if (!player) return null;
      // Access the native video element through Mux Player's media property
      return (player as any).media?.nativeEl || null;
    }, []);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        getVideoElement,
        getCurrentTime: () => {
          const video = getVideoElement();
          return video?.currentTime || 0;
        },
        getDuration: () => {
          const video = getVideoElement();
          return video?.duration || 0;
        },
        setCurrentTime: (time: number) => {
          const video = getVideoElement();
          if (video) {
            video.currentTime = time;
          }
        },
        getPlaybackRate: () => {
          const video = getVideoElement();
          return video?.playbackRate || 1;
        },
        setPlaybackRate: (rate: number) => {
          const video = getVideoElement();
          if (video) {
            video.playbackRate = rate;
            // Ensure pitch preservation
            if ("preservesPitch" in video) {
              (video as any).preservesPitch = true;
            } else if ("webkitPreservesPitch" in video) {
              (video as any).webkitPreservesPitch = true;
            }
          }
        },
        isPaused: () => {
          const video = getVideoElement();
          return video?.paused ?? true;
        },
        play: () => {
          const video = getVideoElement();
          video?.play();
        },
        pause: () => {
          const video = getVideoElement();
          video?.pause();
        },
      }),
      [getVideoElement]
    );

    // Handle time update events
    const handleTimeUpdate = useCallback(() => {
      if (onTimeUpdate) {
        const video = getVideoElement();
        if (video) {
          onTimeUpdate(video.currentTime);
        }
      }
    }, [onTimeUpdate, getVideoElement]);

    // Handle loaded metadata events
    const handleLoadedMetadata = useCallback(() => {
      if (onLoadedMetadata) {
        const video = getVideoElement();
        if (video) {
          onLoadedMetadata(video.duration);
        }
      }
    }, [onLoadedMetadata, getVideoElement]);

    // Use Mux thumbnail as poster if not provided
    const posterUrl =
      poster || (playbackId ? `https://image.mux.com/${playbackId}/thumbnail.png` : undefined);

    return (
      <div className="w-full bg-gray-900 relative aspect-video max-h-[70vh]">
        <MuxPlayer
          ref={muxPlayerRef}
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
          onPlay={onPlay}
          onPlaying={onPlaying}
          onPause={onPause}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          style={{
            "--controls-background-color": "rgba(0, 0, 0, 0.8)",
            height: "100%",
            width: "100%",
          }}
        />
      </div>
    );
  }
);

export default MuxVideoPlayer;

