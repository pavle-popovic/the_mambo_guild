import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    spring,
    interpolate,
} from "remotion";


export const LoginScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Form appears
    const formScale = spring({
        frame,
        fps,
        config: { damping: 200 },
        durationInFrames: 25,
    });

    // Typing animation - simulated with cursor
    const emailProgress = interpolate(frame, [20, 45], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const passwordProgress = interpolate(frame, [45, 60], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    // Button hover/click effect
    const buttonGlow = frame > 55 ? interpolate(frame, [55, 65], [0, 1], {
        extrapolateRight: "clamp",
    }) : 0;

    const buttonPress = frame > 65 ? spring({
        frame: frame - 65,
        fps,
        config: { damping: 15, stiffness: 300 },
    }) : 0;

    const cursorBlink = Math.floor(frame / 15) % 2 === 0;

    return (
        <AbsoluteFill
            style={{
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Form Container */}
            <div
                style={{
                    transform: `scale(${formScale})`,
                    opacity: formScale,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 25,
                    padding: 60,
                    borderRadius: 30,
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
            >
                {/* FOUNDER ACCESS Badge */}
                <div
                    style={{
                        padding: "12px 32px",
                        border: "1px solid #D4AF37",
                        borderRadius: 25,
                        fontSize: 16,
                        fontWeight: 600,
                        letterSpacing: 3,
                        color: "#D4AF37",
                        fontFamily: "'Inter', sans-serif",
                        marginBottom: 20,
                    }}
                >
                    FOUNDER ACCESS
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: 56,
                        fontWeight: 400,
                        color: "#ffffff",
                        fontFamily: "'Playfair Display', serif",
                        fontStyle: "italic",
                    }}
                >
                    Join The
                </div>
                <div
                    style={{
                        fontSize: 64,
                        fontWeight: 700,
                        color: "#D4AF37",
                        fontFamily: "'Playfair Display', serif",
                        marginBottom: 30,
                    }}
                >
                    Mambo Guild
                </div>

                {/* Email Input */}
                <div
                    style={{
                        width: 500,
                        padding: "22px 28px",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        borderRadius: 12,
                        fontSize: 24,
                        color: "#ffffff",
                        fontFamily: "'Inter', sans-serif",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {"dancer@mambo.guild".slice(0, Math.floor(emailProgress * 18))}
                    {emailProgress < 1 && emailProgress > 0 && cursorBlink && (
                        <span style={{ marginLeft: 2, color: "#D4AF37" }}>|</span>
                    )}
                </div>

                {/* Password Input */}
                <div
                    style={{
                        width: 500,
                        padding: "22px 28px",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        borderRadius: 12,
                        fontSize: 24,
                        color: "#ffffff",
                        fontFamily: "'Inter', sans-serif",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {"••••••••••".slice(0, Math.floor(passwordProgress * 10))}
                    {passwordProgress < 1 && passwordProgress > 0 && cursorBlink && (
                        <span style={{ marginLeft: 2, color: "#D4AF37" }}>|</span>
                    )}
                </div>

                {/* Submit Button */}
                <div
                    style={{
                        width: 500,
                        padding: "24px 28px",
                        backgroundColor: "#D4AF37",
                        borderRadius: 12,
                        fontSize: 26,
                        fontWeight: 700,
                        color: "#000000",
                        fontFamily: "'Inter', sans-serif",
                        textAlign: "center",
                        marginTop: 15,
                        transform: `scale(${1 - buttonPress * 0.05})`,
                        boxShadow: `0 0 ${30 * buttonGlow}px rgba(212, 175, 55, ${buttonGlow * 0.7})`,
                    }}
                >
                    Claim Founder Status
                </div>
            </div>
        </AbsoluteFill>
    );
};
