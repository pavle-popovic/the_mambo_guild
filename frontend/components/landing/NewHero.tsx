"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaPlay, FaCheck, FaCertificate } from "react-icons/fa";
import Mambobot from "./Mambobot";

const bulletPoints = [
    "From total beginners to pro dancers",
    "Anytime, anywhere",
    "No partner needed",
];

export default function NewHero() {
    const [scrollOpacity, setScrollOpacity] = useState(1);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const newOpacity = Math.max(0, 1 - scrollY / 200);
            setScrollOpacity(newOpacity);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-transparent pt-16 md:pt-20">
            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 lg:gap-20">

                {/* Text Side (Left) */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex-1 text-center lg:text-left space-y-6 md:space-y-8 max-w-2xl"
                >
                    {/* Certified Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-900/30 to-yellow-900/20 border border-mambo-gold/40 rounded-full backdrop-blur-sm"
                    >
                        <FaCertificate className="text-mambo-gold text-sm" />
                        <span className="text-sm font-medium text-mambo-gold tracking-wide">
                            Certified LXD Syllabus
                        </span>
                    </motion.div>

                    {/* Main Title */}
                    <div className="space-y-2">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif leading-tight text-mambo-text">
                            Join{" "}
                            <span className="text-mambo-gold drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                                The Guild
                            </span>
                        </h1>
                    </div>

                    {/* Bullet Points */}
                    <motion.ul
                        className="space-y-3 md:space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        {bulletPoints.map((point, index) => (
                            <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                                className="flex items-center gap-3 text-lg md:text-xl text-gray-200 justify-center lg:justify-start"
                            >
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                                    <FaCheck className="text-emerald-400 text-xs" />
                                </div>
                                <span>{point}</span>
                            </motion.li>
                        ))}
                    </motion.ul>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
                    >
                        <Link
                            href="/register"
                            className="bg-white hover:bg-gray-100 text-black font-extrabold py-4 px-8 rounded-full text-lg shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.3)] transition-all transform hover:-translate-y-1 text-center"
                        >
                            Start My Free Trial
                        </Link>
                        <Link
                            href="/courses"
                            className="bg-zinc-800/80 border-2 border-zinc-600 text-white hover:bg-zinc-700 hover:border-zinc-500 font-bold py-4 px-8 rounded-full text-lg transition-all text-center backdrop-blur-sm"
                        >
                            View Curriculum
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Video Side (Right) */}
                <motion.div
                    initial={{ opacity: 0, x: 50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="flex-[1.2] w-full max-w-2xl lg:max-w-3xl"
                >
                    <div className="relative aspect-[9/16] sm:aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group cursor-pointer transition-all duration-300 hover:border-mambo-gold/50 hover:shadow-[0_0_50px_rgba(212,175,55,0.15)]">
                        {/* Thumbnail / Video */}
                        <div className="absolute inset-0">
                            <Image
                                src="/assets/Personal_Pic.jpg"
                                alt="Mambo Guild - Learn Salsa Dancing"
                                fill
                                className="object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-500 group-hover:scale-105 transition-transform"
                                priority
                            />
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                        {/* Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:bg-mambo-gold/20 group-hover:border-mambo-gold transition-all duration-300 shadow-2xl"
                            >
                                <FaPlay className="text-white ml-1 text-2xl sm:text-3xl group-hover:text-mambo-gold transition-colors" />
                            </motion.div>
                        </div>

                        {/* Label */}
                        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex items-end justify-between">
                            <div className="text-[10px] sm:text-xs text-gray-300 tracking-[0.15em] uppercase font-bold bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                Cinematic Trailer
                            </div>
                            <div className="text-[10px] sm:text-xs text-mambo-gold tracking-wider font-semibold bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                                Coming Soon
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: scrollOpacity }}
                style={{ opacity: scrollOpacity, pointerEvents: scrollOpacity <= 0 ? 'none' : 'auto' }}
                transition={{ delay: 1, duration: 1 }}
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            >
                <div className="animate-bounce text-mambo-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 13L12 18L17 13M7 6L12 11L17 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </motion.div>

            {/* Chatbot - Fixed position at bottom right */}
            <Mambobot />
        </section>
    );
}
