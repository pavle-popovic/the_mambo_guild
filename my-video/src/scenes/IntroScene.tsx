import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from "remotion";

export const IntroScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Title animations
    const joinTheScale = spring({
        frame,
        fps,
        config: { damping: 200 },
        durationInFrames: 30,
    });

    const mamboGuildScale = spring({
        frame: frame - 10,
        fps,
        config: { damping: 15, stiffness: 100 },
        durationInFrames: 35,
    });

    const subtitleOpacity = interpolate(frame, [35, 50], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const badgeScale = spring({
        frame: frame - 5,
        fps,
        config: { damping: 12, stiffness: 150 },
    });

    return (
        <AbsoluteFill
            style={{
                justifyContent: "center",
                alignItems: "center",
                fontFamily: "'Playfair Display', serif",
            }}
        >
            {/* FOUNDER ACCESS Badge */}
            <div
                style={{
                    position: "absolute",
                    top: 280,
                    transform: `scale(${badgeScale})`,
                    opacity: badgeScale,
                }}
            >
                <div
                    style={{
                        padding: "12px 32px",
                        border: "1px solid #D4AF37",
                        borderRadius: 25,
                        fontSize: 18,
                        fontWeight: 600,
                        letterSpacing: 3,
                        color: "#D4AF37",
                        fontFamily: "'Inter', sans-serif",
                    }}
                >
                    FOUNDER ACCESS
                </div>
            </div>

            {/* Main Title */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <div
                    style={{
                        fontSize: 90,
                        fontWeight: 400,
                        color: "#ffffff",
                        fontStyle: "italic",
                        transform: `scale(${joinTheScale})`,
                        opacity: joinTheScale,
                    }}
                >
                    Join The
                </div>
                <div
                    style={{
                        fontSize: 100,
                        fontWeight: 700,
                        color: "#D4AF37",
                        transform: `scale(${mamboGuildScale})`,
                        opacity: mamboGuildScale,
                        textShadow: "0 0 40px rgba(212, 175, 55, 0.4)",
                    }}
                >
                    Mambo Guild
                </div>
            </div>

            {/* Subtitle */}
            <div
                style={{
                    position: "absolute",
                    bottom: 650,
                    fontSize: 32,
                    color: "rgba(255, 255, 255, 0.8)",
                    opacity: subtitleOpacity,
                    fontFamily: "'Inter', sans-serif",
                    textAlign: "center",
                }}
            >
                The World's First Gamified Salsa Academy.
            </div>
        </AbsoluteFill>
    );
};
