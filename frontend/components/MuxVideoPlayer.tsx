"use client";

import { useEffect, useRef } from "react";

interface MuxVideoPlayerProps {
  playbackId: string;
  poster?: string;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export default function MuxVideoPlayer({
  playbackId,
  poster,
  onEnded,
  autoPlay = false,
}: MuxVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Load HLS.js for Mux video playback
    const loadHLS = async () => {
      if (typeof window !== "undefined" && !(window as any).Hls) {
        const hlsScript = document.createElement("script");
        hlsScript.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
        document.body.appendChild(hlsScript);
      }
    };

    loadHLS();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playbackId) return;

    const hlsUrl = `https://stream.mux.com/${playbackId}.m3u8`;

    // Use native HLS support if available (Safari)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
    } else if ((window as any).Hls && (window as any).Hls.isSupported()) {
      // Use HLS.js for other browsers
      const hls = new (window as any).Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      if (autoPlay) {
        video.play().catch((e) => console.error("Autoplay failed:", e));
      }

      return () => {
        hls.destroy();
      };
    } else {
      // Fallback: try direct URL (may not work in all browsers)
      video.src = hlsUrl;
    }

    if (onEnded) {
      video.addEventListener("ended", onEnded);
      return () => {
        video.removeEventListener("ended", onEnded);
      };
    }
  }, [playbackId, autoPlay, onEnded]);

  // Use Mux thumbnail as poster if not provided
  const posterUrl =
    poster || (playbackId ? `https://image.mux.com/${playbackId}/thumbnail.png` : undefined);

  return (
    <div className="w-full aspect-video bg-gray-900 relative group">
      <video
        ref={videoRef}
        poster={posterUrl}
        controls
        className="w-full h-full object-cover"
        playsInline
        autoPlay={autoPlay}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

