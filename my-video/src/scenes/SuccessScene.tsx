import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
} from "remotion";

export const SuccessScene: React.FC = () => {
    const frame = useCurrentFrame();

    // Confetti particles
    const particles = Array.from({ length: 20 }, (_, i) => ({

        x: Math.sin(i * 0.7) * 300 + 540,
        y: -50 - i * 20,
        rotation: i * 45,
        color: i % 3 === 0 ? "#D4AF37" : i % 3 === 1 ? "#9B59B6" : "#ffffff",
        delay: i * 2,
        speed: 8 + (i % 5),
    }));

    return (
        <AbsoluteFill
            style={{
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Confetti */}
            {particles.map((p, i) => {
                const particleY = ((frame - p.delay) * p.speed) % 2000;
                const particleOpacity = particleY > 0 && particleY < 1800 ? 1 : 0;

                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: p.x + Math.sin((frame + i) * 0.1) * 50,
                            top: particleY,
                            width: 12,
                            height: 12,
                            backgroundColor: p.color,
                            borderRadius: i % 2 === 0 ? "50%" : 0,
                            opacity: particleOpacity * 0.8,
                            transform: `rotate(${p.rotation + frame * 3}deg)`,
                        }}
                    />
                );
            })}
        </AbsoluteFill>
    );
};
