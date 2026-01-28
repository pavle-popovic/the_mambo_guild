import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig, Img, Audio } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { MamboGuildPromo } from "./MamboGuildPromo";

// Video timings at 1.3x speed
// Original videos are 8 seconds each
// At 1.3x speed: 8 / 1.3 ≈ 6.15 seconds ≈ 185 frames @ 30fps
const ENTRANCE_DURATION = 185;
const MAIN_CONTENT_DURATION = 510; // 17 seconds
const EXIT_DURATION = 185;
const TRANSITION_DURATION = 20; // Smooth 0.67s fade transition

// CTA timing: starts during success scene and continues through exit animation
// Starts at ~620 frames (when success scene appears) and ends at 760 (24:40)
const CTA_START = 620; // During success scene
const CTA_END = 760;   // 24:40
const CTA_DURATION = CTA_END - CTA_START; // 140 frames

// CTA Overlay Component for the exit animation
const CTAOverlay: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Entrance animation - scale up with spring
    const entranceScale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100, mass: 0.8 },
    });

    // Zoom out animation - only starts when exit video begins (around frame 70)
    const exitScale = interpolate(
        frame,
        [70, CTA_DURATION],
        [1, 0.75],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    // Combined scale
    const scale = entranceScale * exitScale;

    // Fade in quickly, fade out near the end
    const opacity = interpolate(
        frame,
        [0, 8, CTA_DURATION - 15, CTA_DURATION],
        [0, 1, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    // Pulsing glow effect
    const glowIntensity = interpolate(
        Math.sin(frame * 0.2),
        [-1, 1],
        [0.5, 1]
    );

    // Subtle floating animation
    const floatY = Math.sin(frame * 0.1) * 5;

    return (
        <AbsoluteFill
            style={{
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div
                style={{
                    position: "relative",
                    transform: `scale(${scale}) translateY(${floatY}px)`,
                    opacity,
                }}
            >
                {/* Outer pulsing glow */}
                <div
                    style={{
                        position: "absolute",
                        inset: -40,
                        background: "radial-gradient(ellipse, rgba(180, 130, 70, 0.4), transparent 60%)",
                        filter: `blur(30px)`,
                        opacity: glowIntensity,
                    }}
                />

                {/* The CTA image */}
                <Img
                    src={staticFile("cta-image.png")}
                    style={{
                        width: 900,
                        height: "auto",
                        filter: `drop-shadow(0 0 ${30 + glowIntensity * 20}px rgba(180, 130, 70, ${0.4 + glowIntensity * 0.3}))`,
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};

export const FullPromo: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: "#000" }}>
            <TransitionSeries>
                {/* Entrance video at 1.3x speed */}
                <TransitionSeries.Sequence durationInFrames={ENTRANCE_DURATION + TRANSITION_DURATION}>
                    <AbsoluteFill>
                        <OffthreadVideo
                            src={staticFile("Entrance.mp4")}
                            playbackRate={1.3}
                            volume={0}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                        <Audio
                            src={staticFile("sounds/door-sound.mp3")}
                            startFrom={0}
                        />
                    </AbsoluteFill>
                </TransitionSeries.Sequence>

                {/* Smooth fade into main content */}
                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Main promo content at regular speed */}
                <TransitionSeries.Sequence durationInFrames={MAIN_CONTENT_DURATION + TRANSITION_DURATION}>
                    <MamboGuildPromo />
                </TransitionSeries.Sequence>

                {/* Smooth fade into exit */}
                <TransitionSeries.Transition
                    presentation={fade()}
                    timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
                />

                {/* Exit video at 1.3x speed */}
                <TransitionSeries.Sequence durationInFrames={EXIT_DURATION}>
                    <AbsoluteFill>
                        <OffthreadVideo
                            src={staticFile("Exit.mp4")}
                            playbackRate={1.3}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </AbsoluteFill>
                </TransitionSeries.Sequence>
            </TransitionSeries>

            {/* CTA Overlay during exit - appears at 23:00, disappears at 24:40 */}
            <Sequence from={CTA_START} durationInFrames={CTA_DURATION}>
                <CTAOverlay />
            </Sequence>
        </AbsoluteFill>
    );
};
