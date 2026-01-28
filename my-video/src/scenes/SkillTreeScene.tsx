import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
    Img,
    staticFile,
} from "remotion";

export const SkillTreeScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Title animation
    const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const titleY = interpolate(
        spring({
            frame,
            fps,
            config: { damping: 200 },
        }),
        [0, 1],
        [-30, 0]
    );

    // Description text animation (staggers after title)
    const descOpacity = interpolate(frame, [15, 35], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const descY = interpolate(
        spring({
            frame: frame - 10,
            fps,
            config: { damping: 200 },
        }),
        [0, 1],
        [20, 0]
    );

    // Phone mockup animation
    const phoneScale = spring({
        frame: frame - 25,
        fps,
        config: { damping: 15, stiffness: 80 },
        durationInFrames: 40,
    });

    const phoneY = interpolate(phoneScale, [0, 1], [100, 0]);

    // Glow animation for skill connections
    const glowPulse = interpolate(
        Math.sin((frame / 40) * Math.PI * 2),
        [-1, 1],
        [0.4, 0.8]
    );

    return (
        <AbsoluteFill
            style={{
                justifyContent: "flex-start",
                alignItems: "center",
                paddingTop: 80,
            }}
        >
            {/* Title */}
            <div
                style={{
                    opacity: titleOpacity,
                    transform: `translateY(${titleY}px)`,
                    textAlign: "center",
                    marginBottom: 20,
                }}
            >
                <div
                    style={{
                        fontSize: 64,
                        fontWeight: 700,
                        color: "#ffffff",
                        fontFamily: "'Playfair Display', serif",
                        marginBottom: 20,
                    }}
                >
                    The RPG of Dance
                </div>
            </div>

            {/* Full Description Text */}
            <div
                style={{
                    opacity: descOpacity,
                    transform: `translateY(${descY}px)`,
                    textAlign: "center",
                    maxWidth: 900,
                    padding: "0 50px",
                    marginBottom: 30,
                }}
            >
                <div
                    style={{
                        fontSize: 28,
                        color: "rgba(255, 255, 255, 0.85)",
                        fontFamily: "'Inter', sans-serif",
                        lineHeight: 1.6,
                        fontWeight: 400,
                    }}
                >
                    Visualize your growth from 'Basic Steps' to 'Boss Level'.
                    Every lesson unlocks new nodes on your skill tree.
                    Track your progress like a true gamer.
                </div>
            </div>

            {/* Skill Tree Image - New RPG Image */}
            <div
                style={{
                    transform: `scale(${phoneScale}) translateY(${phoneY}px)`,
                    opacity: phoneScale,
                    filter: `drop-shadow(0 0 ${40 * glowPulse}px rgba(212, 175, 55, ${glowPulse * 0.5}))`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Img
                    src={staticFile("screenshots/skill-tree-rpg.png")}
                    style={{
                        width: 480,
                        height: "auto",
                        borderRadius: 30,
                        objectFit: "contain",
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};

