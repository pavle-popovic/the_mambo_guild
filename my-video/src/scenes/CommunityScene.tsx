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

export const CommunityScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Title animation
    const titleScale = spring({
        frame,
        fps,
        config: { damping: 200 },
        durationInFrames: 25,
    });

    // Description fade in
    const descOpacity = interpolate(frame, [15, 30], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Badge pills animation - staggered
    const badges = ["Leaderboards", "Badges", "Community"];
    const badgeColors = ["#e74c3c", "#2ecc71", "#9b59b6"];

    // Main image animation
    const imageScale = spring({
        frame: frame - 20,
        fps,
        config: { damping: 18, stiffness: 90 },
    });

    const imageOpacity = interpolate(frame, [20, 40], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    return (
        <AbsoluteFill
            style={{
                justifyContent: "flex-start",
                alignItems: "center",
                paddingTop: 150,
            }}
        >
            {/* Title */}
            <div
                style={{
                    fontSize: 72,
                    fontWeight: 700,
                    color: "#ffffff",
                    fontFamily: "'Playfair Display', serif",
                    transform: `scale(${titleScale})`,
                    opacity: titleScale,
                    marginBottom: 25,
                }}
            >
                The Stage
            </div>

            {/* Description */}
            <div
                style={{
                    fontSize: 26,
                    color: "rgba(255, 255, 255, 0.8)",
                    fontFamily: "'Inter', sans-serif",
                    textAlign: "center",
                    maxWidth: 700,
                    lineHeight: 1.6,
                    opacity: descOpacity,
                    marginBottom: 35,
                    padding: "0 40px",
                }}
            >
                Compete, collaborate, and get feedback from real pros.
                <br />
                Climb the High Rollers leaderboard and earn legendary badges.
            </div>

            {/* Badge Pills */}
            <div
                style={{
                    display: "flex",
                    gap: 20,
                    marginBottom: 50,
                }}
            >
                {badges.map((badge, i) => {
                    const badgeScale = spring({
                        frame: frame - 25 - i * 8,
                        fps,
                        config: { damping: 12, stiffness: 150 },
                    });

                    return (
                        <div
                            key={badge}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "14px 28px",
                                backgroundColor: "rgba(0, 0, 0, 0.4)",
                                borderRadius: 30,
                                border: `1px solid ${badgeColors[i]}40`,
                                transform: `scale(${badgeScale})`,
                                opacity: badgeScale,
                            }}
                        >
                            <div
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    backgroundColor: badgeColors[i],
                                }}
                            />
                            <span
                                style={{
                                    fontSize: 22,
                                    fontWeight: 500,
                                    color: badgeColors[i],
                                    fontFamily: "'Inter', sans-serif",
                                }}
                            >
                                {badge}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Community Image - Full Width for Visibility */}
            <div
                style={{
                    transform: `scale(${imageScale})`,
                    opacity: imageOpacity,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Img
                    src={staticFile("screenshots/community-new.png")}
                    style={{
                        width: 1000,
                        borderRadius: 20,
                        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};
