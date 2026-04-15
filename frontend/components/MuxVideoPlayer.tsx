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
    },
    ref
  ) {
    const muxPlayerRef = useRef<MuxPlayerElement>(null);
    const [captionText, setCaptionText] = useState<string>("");
    const [nativeCaptionsActive, setNativeCaptionsActive] = useState<boolean>(false);

    // --- A/B loop overlay state ---
    const [videoDuration, setVideoDuration] = useState<number>(0);
    const [abEnabled, setAbEnabled] = useState<boolean>(false);
    const [aTime, setATime] = useState<number>(0);
    const [bTime, setBTime] = useState<number>(0);
    const [abCurrent, setAbCurrent] = useState<number>(0);
    const [draggingHandle, setDraggingHandle] = useState<null | "A" | "B">(null);
    const abRailRef = useRef<HTMLDivElement>(null);
    const abEnabledRef = useRef<boolean>(false);
    const aTimeRef = useRef<number>(0);
    const bTimeRef = useRef<number>(0);
    useEffect(() => { abEnabledRef.current = abEnabled; }, [abEnabled]);
    useEffect(() => { aTimeRef.current = aTime; }, [aTime]);
    useEffect(() => { bTimeRef.current = bTime; }, [bTime]);

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
      const video = getVideoElement();
      if (video) {
        setVideoDuration(video.duration || 0);
        setBTime((prev) => (prev > 0 ? prev : video.duration || 0));
        if (onLoadedMetadata) onLoadedMetadata(video.duration);
      }
    }, [onLoadedMetadata, getVideoElement]);

    // A/B loop enforcement + current-time tracker for overlay
    useEffect(() => {
      const interval = setInterval(() => {
        const video = getVideoElement();
        if (!video) return;
        setAbCurrent(video.currentTime);
        if (
          abEnabledRef.current &&
          bTimeRef.current > aTimeRef.current &&
          video.currentTime >= bTimeRef.current
        ) {
          video.currentTime = aTimeRef.current;
        }
      }, 80);
      return () => clearInterval(interval);
    }, [getVideoElement]);

    const abPositionToTime = useCallback(
      (clientX: number): number => {
        if (!abRailRef.current || !videoDuration) return 0;
        const rect = abRailRef.current.getBoundingClientRect();
        const ratio = (clientX - rect.left) / rect.width;
        return Math.max(0, Math.min(videoDuration, ratio * videoDuration));
      },
      [videoDuration]
    );

    useEffect(() => {
      if (!draggingHandle) return;
      const MIN = 1.0;
      const move = (clientX: number) => {
        const t = abPositionToTime(clientX);
        if (draggingHandle === "A") {
          setATime(Math.min(t, bTimeRef.current - MIN));
        } else {
          setBTime(Math.max(t, aTimeRef.current + MIN));
        }
      };
      const onMouseMove = (e: MouseEvent) => move(e.clientX);
      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) move(e.touches[0].clientX);
      };
      const stop = () => setDraggingHandle(null);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", stop);
      document.addEventListener("touchmove", onTouchMove);
      document.addEventListener("touchend", stop);
      return () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", stop);
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", stop);
      };
    }, [draggingHandle, abPositionToTime]);

    const toggleAbLoop = useCallback(() => {
      const next = !abEnabledRef.current;
      abEnabledRef.current = next;
      setAbEnabled(next);
      const video = getVideoElement();
      if (next && video && bTimeRef.current > aTimeRef.current) {
        video.currentTime = aTimeRef.current;
        video.play().catch(() => {});
      } else if (!next && video) {
        video.play().catch(() => {});
      }
    }, [getVideoElement]);

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
      <div className={`w-full h-full bg-black relative ${className || ""}`}>
        <MuxPlayer
          ref={muxPlayerRef}
          playbackId={playbackId}
          streamType="on-demand"
          autoPlay={autoPlay}
          poster={posterUrl}
          primaryColor="#22c55e"
          secondaryColor="#4b5563"
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
            display: "block",
            height: "100%",
            width: "100%",
          } as any}
        />

        {/* A/B loop overlay — draggable markers above the Mux control bar */}
        {videoDuration > 0 && (
          <div
            className="absolute inset-x-0 px-4 pointer-events-none"
            style={{ bottom: 56, zIndex: 15 }}
          >
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={toggleAbLoop}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 ${
                  abEnabled
                    ? "bg-green-500 text-black shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                    : "bg-black/60 text-white/80 hover:bg-black/80 border border-white/20"
                }`}
                title={abEnabled ? "Disable A/B loop" : "Enable A/B loop"}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M17 2l4 4-4 4M3 11V9a4 4 0 014-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />
                </svg>
                AB
              </button>
              <div
                ref={abRailRef}
                className="relative flex-1 h-6 select-none"
              >
                {/* Rail track */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-white/25 rounded-full" />
                {/* Active region */}
                {bTime > aTime && (
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 h-1 rounded-full ${
                      abEnabled ? "bg-green-400" : "bg-white/50"
                    }`}
                    style={{
                      left: `${(aTime / videoDuration) * 100}%`,
                      width: `${((bTime - aTime) / videoDuration) * 100}%`,
                    }}
                  />
                )}
                {/* Current time indicator */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/80 pointer-events-none"
                  style={{ left: `${(abCurrent / videoDuration) * 100}%` }}
                />
                {/* Handle A */}
                <div
                  className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center border-2 border-white shadow-lg touch-none ${
                    draggingHandle === "A" ? "bg-green-300 scale-110" : "bg-green-500"
                  }`}
                  style={{ left: `${(aTime / videoDuration) * 100}%` }}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setDraggingHandle("A"); }}
                  onTouchStart={(e) => { e.stopPropagation(); setDraggingHandle("A"); }}
                  title={`A: ${Math.floor(aTime / 60)}:${String(Math.floor(aTime % 60)).padStart(2, "0")}`}
                >
                  <span className="text-[9px] font-black text-white leading-none">A</span>
                </div>
                {/* Handle B */}
                <div
                  className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center border-2 border-white shadow-lg touch-none ${
                    draggingHandle === "B" ? "bg-red-300 scale-110" : "bg-red-500"
                  }`}
                  style={{ left: `${(bTime / videoDuration) * 100}%` }}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setDraggingHandle("B"); }}
                  onTouchStart={(e) => { e.stopPropagation(); setDraggingHandle("B"); }}
                  title={`B: ${Math.floor(bTime / 60)}:${String(Math.floor(bTime % 60)).padStart(2, "0")}`}
                >
                  <span className="text-[9px] font-black text-white leading-none">B</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom caption overlay — hidden on mobile when parent handles captions externally.
            On desktop, always show here above controls. */}
        {captionText && !nativeCaptionsActive && (
          <div
            className={`absolute inset-x-0 pointer-events-none flex justify-center bottom-[120px] lg:bottom-[92px] ${onCaptionChange ? 'hidden lg:flex' : ''}`}
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
      </div>
    );
  }
);

export default MuxVideoPlayer;
