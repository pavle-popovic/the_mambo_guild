"use client";

import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import { forwardRef, useImperativeHandle, useRef, useCallback, useState, useEffect } from "react";

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
  className?: string;
  containFit?: boolean;
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
      className,
      containFit,
      metadata,
    },
    ref
  ) {
    const muxPlayerRef = useRef<MuxPlayerElement>(null);
    const [captionText, setCaptionText] = useState<string>("");

    // Get the underlying video element from Mux Player
    const getVideoElement = useCallback((): HTMLVideoElement | null => {
      const player = muxPlayerRef.current;
      if (!player) return null;
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

    // Force object-fit: contain on the video element inside Shadow DOM
    // when containFit is enabled (for community post modals with mixed aspect ratios).
    // Uses the same proven shadow DOM style injection as the caption hiding below.
    useEffect(() => {
      if (!containFit) return;
      let injectedStyle: HTMLStyleElement | null = null;
      let shadowRoot: ShadowRoot | null = null;

      const inject = (): boolean => {
        const video = getVideoElement();
        if (!video) return false;
        // Also set directly on the element for good measure
        video.style.objectFit = "contain";
        const root = video.getRootNode();
        if (!(root instanceof ShadowRoot)) return false;
        shadowRoot = root;
        injectedStyle = document.createElement("style");
        injectedStyle.textContent = `
          video {
            object-fit: contain !important;
          }
        `;
        shadowRoot.appendChild(injectedStyle);
        return true;
      };

      if (!inject()) {
        const t1 = setTimeout(() => {
          if (!inject()) {
            const t2 = setTimeout(inject, 1500);
            // store for cleanup
            (inject as any)._t2 = t2;
          }
        }, 500);
        return () => {
          clearTimeout(t1);
          if ((inject as any)._t2) clearTimeout((inject as any)._t2);
          if (injectedStyle && shadowRoot) {
            try { shadowRoot.removeChild(injectedStyle); } catch {}
          }
        };
      }

      return () => {
        if (injectedStyle && shadowRoot) {
          try { shadowRoot.removeChild(injectedStyle); } catch {}
        }
      };
    }, [containFit, getVideoElement, playbackId]);

    // Hide native browser ::cue captions by injecting a <style> into the
    // shadow root that contains the <video> element. This is the only
    // reliable way to override native caption rendering inside Mux's
    // nested shadow DOM (external CSS and CSS custom properties cannot
    // reach it because the gerwig theme re-sets them internally).
    useEffect(() => {
      let injectedStyle: HTMLStyleElement | null = null;
      let shadowRoot: ShadowRoot | null = null;

      const inject = (): boolean => {
        const video = getVideoElement();
        if (!video) return false;
        const root = video.getRootNode();
        if (!(root instanceof ShadowRoot)) return false;
        shadowRoot = root;
        injectedStyle = document.createElement("style");
        injectedStyle.textContent = `
          video::cue {
            color: transparent !important;
            background: transparent !important;
            text-shadow: none !important;
            outline: none !important;
            opacity: 0 !important;
          }
          video::-webkit-media-text-track-container {
            visibility: hidden !important;
          }
          video::-webkit-media-text-track-display {
            visibility: hidden !important;
          }
        `;
        shadowRoot.appendChild(injectedStyle);
        return true;
      };

      if (!inject()) {
        // Retry — Mux player may not be ready yet
        const t1 = setTimeout(() => { if (!inject()) setTimeout(inject, 1500); }, 500);
        return () => clearTimeout(t1);
      }

      return () => {
        if (injectedStyle && shadowRoot) {
          try { shadowRoot.removeChild(injectedStyle); } catch {}
        }
      };
    }, [getVideoElement, playbackId]);

    // Custom caption overlay: read cues from TextTrack API.
    // Tracks stay in "showing" mode so Mux's CC language menu works.
    // Native rendering is hidden by the style injection above.
    useEffect(() => {
      const cleanupFns: Array<() => void> = [];

      const getActiveCueText = (tracks: TextTrackList): string => {
        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i];
          if (
            (track.kind === "subtitles" || track.kind === "captions") &&
            track.mode === "showing" &&
            track.activeCues &&
            track.activeCues.length > 0
          ) {
            const cue = track.activeCues[0] as VTTCue;
            return cue.text.replace(/<[^>]+>/g, "").trim();
          }
        }
        return "";
      };

      const addTrackListener = (track: TextTrack, tracks: TextTrackList) => {
        const onCueChange = () => setCaptionText(getActiveCueText(tracks));
        track.addEventListener("cuechange", onCueChange);
        cleanupFns.push(() => track.removeEventListener("cuechange", onCueChange));
      };

      const init = (): boolean => {
        const video = getVideoElement();
        if (!video) return false;
        const tracks = video.textTracks;

        for (let i = 0; i < tracks.length; i++) {
          addTrackListener(tracks[i], tracks);
        }

        const onAddTrack = (e: TrackEvent) => {
          if (e.track) addTrackListener(e.track, tracks);
        };
        tracks.addEventListener("addtrack", onAddTrack as EventListener);
        cleanupFns.push(() => tracks.removeEventListener("addtrack", onAddTrack as EventListener));

        const onTracksChange = () => setCaptionText(getActiveCueText(tracks));
        tracks.addEventListener("change", onTracksChange);
        cleanupFns.push(() => tracks.removeEventListener("change", onTracksChange));

        return true;
      };

      if (!init()) {
        const timer = setTimeout(init, 800);
        cleanupFns.push(() => clearTimeout(timer));
      }

      return () => cleanupFns.forEach((fn) => fn());
    }, [getVideoElement]);

    const posterUrl =
      poster || (playbackId ? `https://image.mux.com/${playbackId}/thumbnail.png` : undefined);

    return (
      <div className={`w-full h-full bg-black relative ${className || ""}`}>
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
            display: "block",
            height: "100%",
            width: "100%",
          } as any}
        />

        {/* Custom caption overlay — centered at bottom, above controls */}
        {captionText && (
          <div
            className="absolute inset-x-0 pointer-events-none flex justify-center"
            style={{ bottom: "48px", zIndex: 10, padding: "0 10%" }}
          >
            <span
              style={{
                color: "white",
                fontSize: "clamp(13px, 2vw, 20px)",
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontWeight: 500,
                lineHeight: 1.4,
                textAlign: "center",
                whiteSpace: "pre-wrap",
                backgroundColor: "transparent",
                textShadow:
                  "-1px -1px 0 rgba(0,0,0,0.95), 1px -1px 0 rgba(0,0,0,0.95), -1px 1px 0 rgba(0,0,0,0.95), 1px 1px 0 rgba(0,0,0,0.95)",
              }}
            >
              {captionText}
            </span>
          </div>
        )}
      </div>
    );
  }
);

export default MuxVideoPlayer;
