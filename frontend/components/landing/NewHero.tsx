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
        <section className="relative min-h-[calc(100vh-56px)] sm:min-h-screen w-full flex items-center justify-center overflow-hidden bg-transparent pt-14 md:pt-20">
            {/* Content Container */}
            <div className="hero-content-container relative z-10 container mx-auto px-4 sm:px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-5 md:gap-12 lg:gap-20">

                {/* Video Side — FIRST on mobile, second on desktop */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex-[1.2] w-full max-w-2xl lg:max-w-3xl order-1 lg:order-2"
                >
                    <div className="relative aspect-[4/5] sm:aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group cursor-pointer transition-all duration-300 hover:border-mambo-gold/50 hover:shadow-[0_0_50px_rgba(212,175,55,0.15)]">
                        {/* Thumbnail / Video */}
                        <div className="absolute inset-0">
                            <Image
                                src="/assets/Personal_Pic.jpg"
                                alt="The Mambo Guild - Learn Salsa Dancing"
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
                                className="w-16 h-16 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:bg-mambo-gold/20 group-hover:border-mambo-gold transition-all duration-300 shadow-2xl"
                            >
                                <FaPlay className="text-white ml-1 text-xl sm:text-3xl group-hover:text-mambo-gold transition-colors" />
                            </motion.div>
                        </div>

                        {/* Label */}
                        <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 flex items-end justify-between">
                            <div className="text-[9px] sm:text-xs text-gray-300 tracking-[0.15em] uppercase font-bold bg-black/40 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
                                Cinematic Trailer
                            </div>
                            <div className="text-[9px] sm:text-xs text-mambo-gold tracking-wider font-semibold bg-black/40 backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
                                Coming Soon
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Text Side — SECOND on mobile, first on desktop */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="flex-1 text-center lg:text-left space-y-4 md:space-y-8 max-w-2xl order-2 lg:order-1"
                >
                    {/* Certified Badge — aligned left on mobile */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-900/30 to-yellow-900/20 border border-mambo-gold/40 rounded-full backdrop-blur-sm"
                    >
                        <FaCertificate className="text-mambo-gold text-xs sm:text-sm" />
                        <span className="text-xs sm:text-sm font-medium text-mambo-gold tracking-wide">
                            Certified LXD Syllabus
                        </span>
                    </motion.div>

                    {/* Main Title — full brand name */}
                    <div className="space-y-1">
                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold font-serif leading-tight text-mambo-text">
                            The{" "}
                            <span className="text-mambo-gold drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                                Mambo Guild
                            </span>
                        </h1>
                    </div>

                    {/* Bullet Points — compact on mobile */}
                    <motion.ul
                        className="space-y-2 md:space-y-4"
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
                                className="flex items-center gap-2 sm:gap-3 text-sm sm:text-lg md:text-xl text-gray-200 justify-center lg:justify-start"
                            >
                                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                                    <FaCheck className="text-emerald-400 text-[10px] sm:text-xs" />
                                </div>
                                <span>{point}</span>
                            </motion.li>
                        ))}
                    </motion.ul>

                    {/* CTA Buttons — compact on mobile */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2 sm:pt-4"
                    >
                        <Link
                            href="/courses"
                            className="bg-white hover:bg-gray-100 text-black font-extrabold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm sm:text-lg shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.3)] transition-all transform hover:-translate-y-1 text-center"
                        >
                            Start Dancing Now
                        </Link>
                        <Link
                            href="/register"
                            className="relative bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm sm:text-lg transition-all transform hover:-translate-y-1 text-center shadow-[0_0_25px_rgba(245,158,11,0.5),0_0_50px_rgba(245,158,11,0.2)] hover:shadow-[0_0_35px_rgba(245,158,11,0.7),0_0_70px_rgba(245,158,11,0.3)] ring-2 ring-amber-400/50"
                        >
                            Get Your 7-Day Trial!
                        </Link>
                    </motion.div>
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

            {/* Chatbot - Disabled for now, will be available in a future update */}
            {/* <Mambobot /> */}
        </section>
    );
}
