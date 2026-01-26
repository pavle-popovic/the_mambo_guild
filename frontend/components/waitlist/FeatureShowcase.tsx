'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';

interface PhoneFrameProps {
    imageSrc: string;
    title: string;
    description: string;
    scanAnimation?: boolean;
}

export function PhoneFrame({ imageSrc, title, description, scanAnimation = false }: PhoneFrameProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 py-12 lg:py-20 w-full max-w-6xl mx-auto px-4"
        >
            {/* Phone mockup */}
            <div className="relative flex-shrink-0">
                {/* Phone Frame */}
                <div className="relative w-[260px] sm:w-[280px] md:w-[300px] h-[500px] sm:h-[540px] md:h-[580px] rounded-[40px] bg-gradient-to-b from-gray-800 to-gray-900 p-2 shadow-2xl shadow-black/50">
                    {/* Screen bezel */}
                    <div className="relative w-full h-full rounded-[32px] bg-black overflow-hidden border border-gray-700">
                        {/* Notch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-2xl z-20" />

                        {/* Screen content */}
                        <div className="relative w-full h-full overflow-hidden">
                            <Image
                                src={imageSrc}
                                alt={title}
                                fill
                                className="object-contain"
                                sizes="(max-width: 640px) 260px, (max-width: 768px) 280px, 300px"
                                priority
                            />

                            {/* Scan line animation */}
                            {scanAnimation && (
                                <motion.div
                                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#39FF14] to-transparent z-10"
                                    initial={{ top: 0, opacity: 0 }}
                                    animate={isInView ? {
                                        top: ['0%', '100%', '0%'],
                                        opacity: [0, 1, 1, 0]
                                    } : {}}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: 'linear'
                                    }}
                                />
                            )}

                            {/* Gradient overlay at bottom */}
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
                        </div>

                        {/* Home indicator */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/30 rounded-full" />
                    </div>
                </div>

                {/* Glow effect behind phone */}
                <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-gradient-to-br from-[#D4AF37] via-[#39FF14]/50 to-transparent" />
            </div>

            {/* Text content */}
            <div className="text-center lg:text-left max-w-md">
                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white mb-4">{title}</h3>
                <p className="text-gray-400 text-base sm:text-lg leading-relaxed">{description}</p>
            </div>
        </motion.div>
    );
}

interface GlassCardProps {
    imageSrc: string;
    title: string;
    description: string;
    glowPosition?: 'top-right' | 'bottom-left';
}

export function GlassCard({ imageSrc, title, description, glowPosition = 'top-right' }: GlassCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col-reverse lg:flex-row items-center justify-center gap-8 lg:gap-16 py-12 lg:py-20 w-full max-w-6xl mx-auto px-4"
        >
            {/* Text content */}
            <div className="text-center lg:text-left max-w-md">
                <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white mb-4">{title}</h3>
                <p className="text-gray-400 text-base sm:text-lg leading-relaxed">{description}</p>

                {/* Feature badges */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-6">
                    <span className="px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-full text-[#D4AF37] text-sm">
                        🏆 Leaderboards
                    </span>
                    <span className="px-3 py-1 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-full text-[#39FF14] text-sm">
                        🎖️ Badges
                    </span>
                    <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm">
                        💬 Community
                    </span>
                </div>
            </div>

            {/* Floating Glass Card */}
            <motion.div
                className="relative flex-shrink-0"
                style={{ perspective: '1200px' }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
            >
                {/* Outer glow ring */}
                <div className="absolute -inset-[2px] rounded-[28px] bg-gradient-to-br from-[#D4AF37] via-[#39FF14]/50 to-[#D4AF37] opacity-60 blur-sm" />

                <motion.div
                    className="relative w-[300px] sm:w-[360px] md:w-[420px] h-[400px] sm:h-[460px] md:h-[520px] rounded-3xl overflow-hidden"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: 'rotateY(-4deg) rotateX(4deg)'
                    }}
                    animate={isInView ? {
                        rotateY: [-4, -2, -4],
                        rotateX: [4, 2, 4]
                    } : {}}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                >
                    {/* Glass effect border - gold gradient */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#D4AF37]/40 via-white/10 to-[#39FF14]/30 p-[2px]">
                        <div className="w-full h-full rounded-3xl bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-900/95 backdrop-blur-xl overflow-hidden">
                            <Image
                                src={imageSrc}
                                alt={title}
                                fill
                                className="object-contain object-center p-4"
                                sizes="(max-width: 640px) 300px, (max-width: 768px) 360px, 420px"
                                priority
                            />

                            {/* Ambient glow - top right */}
                            <motion.div
                                className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl bg-[#39FF14]"
                                animate={{
                                    opacity: [0.2, 0.4, 0.2],
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                            />

                            {/* Ambient glow - bottom left gold */}
                            <motion.div
                                className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl bg-[#D4AF37]"
                                animate={{
                                    opacity: [0.15, 0.35, 0.15],
                                    scale: [1, 1.15, 1]
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: 1
                                }}
                            />
                        </div>
                    </div>

                    {/* Reflection edge */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/15 via-transparent to-transparent pointer-events-none" />
                </motion.div>

                {/* Shadow - gold tinted */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-10 bg-gradient-to-r from-[#D4AF37]/20 via-[#39FF14]/15 to-[#D4AF37]/20 blur-2xl rounded-full" />
            </motion.div>
        </motion.div>
    );
}
