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

export const VaultScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Title animation
    const titleScale = spring({
        frame,
        fps,
        config: { damping: 200 },
        durationInFrames: 25,
    });

    // Image slide up animation
    const imageY = interpolate(
        spring({
            frame: frame - 15,
            fps,
            config: { damping: 20, stiffness: 80 },
        }),
        [0, 1],
        [200, 0]
    );

    const imageOpacity = interpolate(frame, [15, 35], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Glow pulse
    const glowIntensity = interpolate(
        Math.sin((frame / 30) * Math.PI * 2),
        [-1, 1],
        [0.3, 0.6]
    );

    return (
        <AbsoluteFill
            style={{
                justifyContent: "flex-start",
                alignItems: "center",
                paddingTop: 120,
            }}
        >
            {/* Title */}
            <div
                style={{
                    fontSize: 72,
                    fontWeight: 700,
                    color: "#ffffff",
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: "italic",
                    transform: `scale(${titleScale})`,
                    opacity: titleScale,
                    marginBottom: 20,
                }}
            >
                The Vault
            </div>

            {/* Subtitle */}
            <div
                style={{
                    fontSize: 28,
                    color: "rgba(255, 255, 255, 0.7)",
                    fontFamily: "'Inter', sans-serif",
                    opacity: interpolate(frame, [10, 25], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    }),
                    marginBottom: 50,
                }}
            >
                Your arsenal of dance mastery.
            </div>

            {/* Features Grid Image */}
            <div
                style={{
                    transform: `translateY(${imageY}px)`,
                    opacity: imageOpacity,
                    filter: `drop-shadow(0 0 ${30 * glowIntensity}px rgba(212, 175, 55, ${glowIntensity}))`,
                }}
            >
                <Img
                    src={staticFile("screenshots/vault-new.png")}
                    style={{
                        width: 950,
                        borderRadius: 20,
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};
