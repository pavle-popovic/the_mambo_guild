import React from "react";
import {
    AbsoluteFill,
    useCurrentFrame,
    interpolate,
    random,
} from "remotion";


interface Star {
    x: number;
    y: number;
    size: number;
    twinkleSpeed: number;
    delay: number;
    brightness: number;
}

const generateStars = (count: number, seed: string): Star[] => {
    const stars: Star[] = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: random(`${seed}-x-${i}`) * 100,
            y: random(`${seed}-y-${i}`) * 100,
            size: random(`${seed}-size-${i}`) * 2 + 1,
            twinkleSpeed: random(`${seed}-speed-${i}`) * 60 + 30,
            delay: random(`${seed}-delay-${i}`) * 60,
            brightness: random(`${seed}-bright-${i}`) * 0.5 + 0.5,
        });
    }
    return stars;
};

export const NightSkyBackground: React.FC = () => {
    const frame = useCurrentFrame();

    const stars = React.useMemo(() => generateStars(100, "mambo-stars"), []);

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(180deg, #0a0a12 0%, #0d1117 40%, #1a1a2e 100%)",
            }}
        >
            {/* Subtle gradient overlay */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                        "radial-gradient(ellipse at 50% 30%, rgba(30, 60, 40, 0.15) 0%, transparent 60%)",
                }}
            />

            {/* Stars */}
            {stars.map((star, i) => {
                const twinkle = interpolate(
                    Math.sin(((frame + star.delay) / star.twinkleSpeed) * Math.PI * 2),
                    [-1, 1],
                    [0.3, 1]
                );

                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: star.size,
                            height: star.size,
                            borderRadius: "50%",
                            backgroundColor: "#ffffff",
                            opacity: star.brightness * twinkle,
                            boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${twinkle * 0.5})`,
                        }}
                    />
                );
            })}

            {/* Shooting star effect */}
            {frame > 60 && frame < 90 && (
                <div
                    style={{
                        position: "absolute",
                        left: `${interpolate(frame, [60, 90], [80, 20])}%`,
                        top: `${interpolate(frame, [60, 90], [10, 30])}%`,
                        width: 3,
                        height: 3,
                        borderRadius: "50%",
                        backgroundColor: "#ffffff",
                        opacity: interpolate(frame, [60, 75, 90], [0, 1, 0]),
                        boxShadow: "0 0 10px #fff, -20px 0 20px rgba(255,255,255,0.5)",
                    }}
                />
            )}
        </AbsoluteFill>
    );
};
