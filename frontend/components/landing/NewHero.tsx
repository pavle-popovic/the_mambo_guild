"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaPlay } from "react-icons/fa";

export default function NewHero() {
    const [scrollOpacity, setScrollOpacity] = useState(1);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            // Fade out quickly as user scrolls
            const newOpacity = Math.max(0, 1 - scrollY / 200);
            setScrollOpacity(newOpacity);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-transparent pt-20">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent pointer-events-none z-0" />

            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-12 md:gap-20">

                {/* Text Side (Left) */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex-1 text-left space-y-8"
                >
                    <div className="space-y-4">
                        <div className="max-w-xl text-center md:text-left z-10">
                            <h1 className="text-5xl md:text-6xl font-bold font-serif mb-6 leading-tight drop-shadow-lg text-mambo-text">
                                Master Mambo On2 Shines.<br />
                                <span className="text-mambo-gold">No Partner Required.</span>
                            </h1>

                            <p className="text-lg md:text-xl text-gray-200 mb-8 font-light italic drop-shadow-md">
                                The world's first gamified Salsa curriculum. Go from 'Two Left Feet' to 'Stage Ready' with our structured Constellation Path.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <button className="bg-[#D4AF37] hover:bg-[#b8962e] text-black font-extrabold py-4 px-8 rounded-full text-lg shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all transform hover:-translate-y-1">
                                    Start My Free Trial
                                </button>
                                <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black font-bold py-4 px-8 rounded-full text-lg transition">
                                    View the Curriculum
                                </button>
                            </div>
                        </div>            </div>

                    <div className="pt-4">
                        {/* Optional CTA could go here */}
                    </div>
                </motion.div>

                {/* Video Side (Right) */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="flex-[1.5] w-full max-w-4xl"
                >
                    <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-white/10 group cursor-pointer transition-all duration-300 hover:border-mambo-gold/50 hover:shadow-2xl hover:shadow-mambo-gold/10 hover:scale-[1.02] z-0 hover:z-10">
                        {/* Thumbnail */}
                        <div className="absolute inset-0">
                            <Image
                                src="/assets/Personal_Pic.jpg"
                                alt="Pavle Popovic"
                                fill
                                className="object-cover opacity-70 group-hover:opacity-50 transition-opacity duration-500 scale-100 group-hover:scale-105 transition-transform"
                            />
                        </div>

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-mambo-gold/20 group-hover:border-mambo-gold transition-all duration-300 shadow-lg">
                                <FaPlay className="text-white ml-1 text-2xl group-hover:text-mambo-gold transition-colors" />
                            </div>
                        </div>

                        {/* Label */}
                        <div className="absolute bottom-6 right-8 text-xs text-gray-300 tracking-[0.2em] uppercase font-bold text-shadow-sm">
                            Cinematic Trailer [Coming Soon]
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: scrollOpacity }}
                style={{ opacity: scrollOpacity, pointerEvents: scrollOpacity <= 0 ? 'none' : 'auto' }}
                transition={{ delay: 1, duration: 1 }}
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            >
                <div className="animate-bounce text-mambo-blue drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 13L12 18L17 13M7 6L12 11L17 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </motion.div>
        </section>
    );
}
