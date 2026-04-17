"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaCheck, FaCertificate } from "react-icons/fa";
import Mambobot from "./Mambobot";

const bulletPoints = [
    "From total beginners to pro dancers",
    "Anytime, anywhere",
    "No partner needed",
];

export default function NewHero() {
    const [scrollOpacity, setScrollOpacity] = useState(1);
    const [videoReady, setVideoReady] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const newOpacity = Math.max(0, 1 - scrollY / 200);
            setScrollOpacity(newOpacity);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Respect reduced-motion preference — pause the autoplay video
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const apply = () => {
            const v = videoRef.current;
            if (!v) return;
            if (mq.matches) v.pause();
            else v.play().catch(() => {});
        };
        apply();
        mq.addEventListener("change", apply);
        return () => mq.removeEventListener("change", apply);
    }, []);

    // Nudge playback if the browser's native autoplay silently bails out
    // (happens on hard-refresh when decode isn't ready at autoplay-attempt time).
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const tryPlay = () => {
            if (v.paused && !v.ended) v.play().catch(() => {});
        };
        tryPlay();
        const onVisible = () => { if (document.visibilityState === "visible") tryPlay(); };
        const id = window.setInterval(() => {
            if (!v.paused) { window.clearInterval(id); return; }
            tryPlay();
        }, 800);
        document.addEventListener("visibilitychange", onVisible);
        v.addEventListener("loadeddata", tryPlay);
        v.addEventListener("canplay", tryPlay);
        return () => {
            window.clearInterval(id);
            document.removeEventListener("visibilitychange", onVisible);
            v.removeEventListener("loadeddata", tryPlay);
            v.removeEventListener("canplay", tryPlay);
        };
    }, []);

    return (
        <section className="relative min-h-[calc(100vh-56px)] sm:min-h-screen w-full flex items-start lg:items-center justify-center overflow-hidden bg-transparent pt-4 md:pt-20">
            {/* Content Container */}
            <div className="hero-content-container relative z-10 container mx-auto px-4 sm:px-6 md:px-12 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-3 md:gap-12 lg:gap-12">

                {/* Video Side — SECOND on mobile (below text), SECOND on desktop (right) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex-[1.8] w-full max-w-2xl lg:max-w-5xl order-2 lg:order-2"
                >
                    <div className="relative aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-300 hover:border-mambo-gold/50 hover:shadow-[0_0_50px_rgba(212,175,55,0.15)]">
                        {/* Poster image — always visible so users never see a black box while the video loads */}
                        <img
                            src="/assets/SilentHero-poster.jpg"
                            alt=""
                            aria-hidden="true"
                            loading="eager"
                            decoding="async"
                            fetchPriority="high"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <video
                            ref={videoRef}
                            poster="/assets/SilentHero-poster.jpg"
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                            disablePictureInPicture
                            controlsList="nodownload noplaybackrate nofullscreen"
                            aria-label="The Mambo Guild cinematic demo"
                            onPlaying={() => setVideoReady(true)}
                            onWaiting={() => setVideoReady(false)}
                            onStalled={() => setVideoReady(false)}
                            onEmptied={() => setVideoReady(false)}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${videoReady ? "opacity-100" : "opacity-0"}`}
                        >
                            <source src="https://pub-bad1fce3595144f2bac8492efa3aec64.r2.dev/hero/SilentHero.v2.webm" type="video/webm" />
                            <source src="https://pub-bad1fce3595144f2bac8492efa3aec64.r2.dev/hero/SilentHero.v2.mp4" type="video/mp4" />
                        </video>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />
                    </div>
                </motion.div>

                {/* Text Side — FIRST on mobile (above video), FIRST on desktop (left) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="flex-1 text-center lg:text-left space-y-4 md:space-y-6 max-w-2xl order-1 lg:order-1"
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
                        <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold font-serif leading-tight text-mambo-text whitespace-nowrap">
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

                    {/* CTA Buttons — desktop only (mobile version rendered below the video) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="hidden lg:flex flex-row gap-3 justify-center lg:justify-start pt-2"
                    >
                        <Link
                            href="/courses"
                            className="bg-white hover:bg-gray-100 text-black font-extrabold py-2.5 px-5 xl:py-3 xl:px-6 rounded-full text-xs xl:text-sm whitespace-nowrap shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.3)] transition-all transform hover:-translate-y-1 text-center"
                        >
                            Start Dancing Now
                        </Link>
                        <Link
                            href="/register"
                            className="relative bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 px-5 xl:py-3 xl:px-6 rounded-full text-xs xl:text-sm whitespace-nowrap transition-all transform hover:-translate-y-1 text-center shadow-[0_0_25px_rgba(245,158,11,0.5),0_0_50px_rgba(245,158,11,0.2)] hover:shadow-[0_0_35px_rgba(245,158,11,0.7),0_0_70px_rgba(245,158,11,0.3)] ring-2 ring-amber-400/50"
                        >
                            Get Your 7-Day Trial!
                        </Link>
                    </motion.div>
                </motion.div>

                {/* CTA Buttons — mobile only, rendered BELOW the video */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="flex lg:hidden flex-col gap-3 w-full max-w-md order-3 pt-1"
                >
                    <Link
                        href="/courses"
                        className="bg-white hover:bg-gray-100 text-black font-extrabold py-3 px-6 rounded-full text-sm shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.3)] transition-all transform hover:-translate-y-1 text-center"
                    >
                        Start Dancing Now
                    </Link>
                    <Link
                        href="/register"
                        className="relative bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 px-6 rounded-full text-sm transition-all transform hover:-translate-y-1 text-center shadow-[0_0_25px_rgba(245,158,11,0.5),0_0_50px_rgba(245,158,11,0.2)] hover:shadow-[0_0_35px_rgba(245,158,11,0.7),0_0_70px_rgba(245,158,11,0.3)] ring-2 ring-amber-400/50"
                    >
                        Get Your 7-Day Trial!
                    </Link>
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
