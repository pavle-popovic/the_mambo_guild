"use client";

import { motion, useTransform, MotionValue } from "framer-motion";

interface HeroOverlayEffectsProps {
    scrollProgress: MotionValue<number>;
}

export default function HeroOverlayEffects({ scrollProgress }: HeroOverlayEffectsProps) {
    // --- START FRAME EFFECTS (0 - 10% scroll) ---
    const startOpacity = useTransform(scrollProgress, [0, 0.1], [1, 0]);

    // Neon Sign Pulse
    const neonPulse = {
        opacity: [0.8, 1, 0.85, 1],
        transition: { duration: 0.2, repeat: Infinity, repeatType: "mirror" as const }
    };

    // --- END FRAME EFFECTS (90 - 100% scroll) ---
    const endOpacity = useTransform(scrollProgress, [0.85, 1], [0, 1]);

    return (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">

            {/* ================= START FRAME OVERLAYS ================= */}
            <motion.div style={{ opacity: startOpacity }} className="absolute inset-0">

                {/* Neon Sign Glow (Center Top) */}
                <motion.div
                    animate={neonPulse}
                    className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[35%] h-[15%] bg-purple-500/40 blur-[50px] rounded-full mix-blend-screen"
                />

                {/* Side Lights Glow (Left & Right Sconces) - Inner Pair Only */}
                <motion.div animate={neonPulse} className="absolute top-[25%] left-[18%] w-[5%] h-[35%] bg-amber-500/30 blur-[30px] mix-blend-screen" />
                <motion.div animate={neonPulse} className="absolute top-[25%] right-[18%] w-[5%] h-[35%] bg-amber-500/30 blur-[30px] mix-blend-screen" />

            </motion.div>

            {/* ================= END FRAME OVERLAYS ================= */}
            <motion.div style={{ opacity: endOpacity }} className="absolute inset-0">

                {/* SMOKE LAYERS (Subtle Atmosphere) */}
                {/* Back Layer - Faster, wider range for movement visibility */}
                <motion.div
                    animate={{ x: ["-10%", "10%"] }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
                    className="absolute inset-0 bg-[url('/assets/smoke_texture.png')] bg-cover opacity-[0.04] mix-blend-plus-lighter blur-md scale-110"
                />

                {/* Front Layer - Even faster parallax, specific user opacity request */}
                <motion.div
                    animate={{ x: ["10%", "-10%"] }}
                    transition={{ duration: 15, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
                    className="absolute inset-0 bg-[url('/assets/smoke_texture.png')] bg-cover opacity-[0.04] mix-blend-screen scale-125"
                />

                {/* CHANDELIER GLOWS (Pulsating) */}
                <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[5%] left-[20%] w-[25%] h-[30%] bg-amber-100/20 blur-[60px] rounded-full mix-blend-screen"
                />
                <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[5%] right-[20%] w-[25%] h-[30%] bg-amber-100/20 blur-[60px] rounded-full mix-blend-screen"
                />

                {/* CENTER PENDANT GLOW */}
                <motion.div
                    animate={{ opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[30%] h-[30%] bg-amber-200/20 blur-[80px] rounded-full mix-blend-screen"
                />

                {/* PROJECTOR BEAMS (Volumetric Light Shafts) - Pulsating */}
                <motion.div
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-full bg-gradient-to-b from-purple-500/10 via-amber-500/5 to-transparent blur-[40px] mix-blend-screen pointer-events-none"
                />

                {/* FLOOR REFLECTIONS (Subtle Shimmer) */}
                <motion.div
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-0 w-full h-[20%] bg-gradient-to-t from-amber-900/20 to-transparent blur-xl mix-blend-overlay"
                />

            </motion.div>
        </div>
    );
}
