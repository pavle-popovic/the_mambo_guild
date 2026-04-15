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
  onCaptionChange?: (text: string) => void;
  metadata?: {
    video_title?: string;
    video_id?: string;
  };
  /** Overlay nodes rendered inside the player wrapper (e.g. AB loop bar,
   * Prev/Next buttons). Kept inside the wrapper so they remain visible in
   * desktop fullscreen (which promotes the wrapper, not the video). */
  overlay?: React.ReactNode;
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
      onCaptionChange,
      metadata,
      overlay,
    },
    ref
  ) {
    const muxPlayerRef = useRef<MuxPlayerElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [captionText, setCaptionText] = useState<string>("");
    const [nativeCaptionsActive, setNativeCaptionsActive] = useState<boolean>(false);

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
        if (video) onLoadedMetadata(video.duration);
      }
    }, [onLoadedMetadata, getVideoElement]);

// Inject player color override into shadow DOM — CSS vars on <mux-player>
    // don't cascade through media-chrome's internals, so we target the shadow
    // root directly with !important to turn the dark-red buffered/loading bar
    // grey. Also re-asserts the played/rail colors for safety.
    useEffect(() => {
      let injectedStyle: HTMLStyleElement | null = null;
      let shadowRoot: ShadowRoot | null = null;

      const COLOR_STYLE = `
        :host, * {
          --media-range-buffered-color: #6b7280 !important;
          --media-time-range-buffered-color: #6b7280 !important;
          --media-range-track-buffered-color: #6b7280 !important;
          --media-primary-color: #ff0000 !important;
          --media-secondary-color: #6b7280 !important;
        }
        media-time-range, mxp-time-range, [part~="time-range"] {
          --media-range-buffered-color: #6b7280 !important;
          --media-time-range-buffered-color: #6b7280 !important;
          --media-range-track-buffered-color: #6b7280 !important;
        }
      `;

      const inject = (): boolean => {
        const video = getVideoElement();
        if (!video) return false;
        const root = video.getRootNode();
        if (!(root instanceof ShadowRoot)) return false;
        shadowRoot = root;
        injectedStyle = document.createElement("style");
        injectedStyle.textContent = COLOR_STYLE;
        shadowRoot.appendChild(injectedStyle);
        return true;
      };

      let retryTimer: ReturnType<typeof setTimeout> | null = null;
      if (!inject()) {
        retryTimer = setTimeout(() => {
          if (!inject()) retryTimer = setTimeout(inject, 1500);
        }, 500);
      }

      return () => {
        if (retryTimer) clearTimeout(retryTimer);
        if (injectedStyle && shadowRoot) {
          try { shadowRoot.removeChild(injectedStyle); } catch {}
        }
      };
    }, [getVideoElement, playbackId]);

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

    // Hide native browser ::cue captions in normal mode (we render our own
    // overlay DIV). In fullscreen or picture-in-picture, the overlay DIV is
    // not promoted with the <video>, so we must let native ::cue captions
    // render. This effect injects a style into the shadow root and toggles
    // its content based on fullscreen/PiP state (bugs 01, 06).
    useEffect(() => {
      let injectedStyle: HTMLStyleElement | null = null;
      let shadowRoot: ShadowRoot | null = null;

      const SUPPRESS_STYLE = `
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

      const NATIVE_STYLE = `
        video::cue {
          color: white !important;
          background: rgba(0, 0, 0, 0.6) !important;
          text-shadow: -1px -1px 0 rgba(0,0,0,0.95), 1px -1px 0 rgba(0,0,0,0.95), -1px 1px 0 rgba(0,0,0,0.95), 1px 1px 0 rgba(0,0,0,0.95) !important;
          font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;
          font-weight: 500 !important;
        }
      `;

      const isNativeNeeded = (): boolean => {
        if (typeof document !== "undefined" && document.fullscreenElement) return true;
        const video = getVideoElement();
        if (video && (document as any).pictureInPictureElement === video) return true;
        return false;
      };

      const apply = () => {
        if (!injectedStyle) return;
        const nativeOn = isNativeNeeded();
        injectedStyle.textContent = nativeOn ? NATIVE_STYLE : SUPPRESS_STYLE;
        setNativeCaptionsActive(nativeOn);
      };

      const inject = (): boolean => {
        const video = getVideoElement();
        if (!video) return false;
        const root = video.getRootNode();
        if (!(root instanceof ShadowRoot)) return false;
        shadowRoot = root;
        injectedStyle = document.createElement("style");
        injectedStyle.textContent = SUPPRESS_STYLE;
        shadowRoot.appendChild(injectedStyle);
        return true;
      };

      const onFsChange = () => apply();
      const onPipEnter = () => apply();
      const onPipLeave = () => apply();

      const attachListeners = () => {
        document.addEventListener("fullscreenchange", onFsChange);
        document.addEventListener("webkitfullscreenchange", onFsChange);
        const video = getVideoElement();
        if (video) {
          video.addEventListener("enterpictureinpicture", onPipEnter);
          video.addEventListener("leavepictureinpicture", onPipLeave);
        }
      };

      let retryTimer: ReturnType<typeof setTimeout> | null = null;
      if (!inject()) {
        retryTimer = setTimeout(() => {
          if (!inject()) {
            retryTimer = setTimeout(() => {
              if (inject()) attachListeners();
            }, 1500);
          } else {
            attachListeners();
          }
        }, 500);
      } else {
        attachListeners();
      }

      return () => {
        if (retryTimer) clearTimeout(retryTimer);
        document.removeEventListener("fullscreenchange", onFsChange);
        document.removeEventListener("webkitfullscreenchange", onFsChange);
        const video = getVideoElement();
        if (video) {
          video.removeEventListener("enterpictureinpicture", onPipEnter);
          video.removeEventListener("leavepictureinpicture", onPipLeave);
        }
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

    // Forward caption text to parent when callback is provided
    useEffect(() => {
      if (onCaptionChange) onCaptionChange(captionText);
    }, [captionText, onCaptionChange]);

    const posterUrl =
      poster || (playbackId ? `https://image.mux.com/${playbackId}/thumbnail.png` : undefined);

    return (
      <div ref={wrapperRef} className={`w-full h-full bg-black relative ${className || ""}`}>
        <MuxPlayer
          ref={muxPlayerRef}
          playbackId={playbackId}
          streamType="on-demand"
          autoPlay={autoPlay}
          poster={posterUrl}
          primaryColor="#ff0000"
          secondaryColor="#8c8c8c"
          playbackRates={[] as any}
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
            "--media-range-buffered-color": "#6b7280",
            "--media-range-track-buffered-color": "#6b7280",
            display: "block",
            height: "100%",
            width: "100%",
          } as any}
        />

        {/* Custom caption overlay — hidden on mobile when parent handles captions externally.
            On desktop, always show here above controls. */}
        {captionText && !nativeCaptionsActive && (
          <div
            className={`absolute inset-x-0 pointer-events-none flex justify-center bottom-[70px] lg:bottom-[60px] ${onCaptionChange ? 'hidden lg:flex' : ''}`}
            style={{ zIndex: 10, padding: "0 10%" }}
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

        {overlay}
      </div>
    );
  }
);

export default MuxVideoPlayer;
