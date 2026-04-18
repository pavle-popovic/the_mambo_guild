"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaCheck, FaCertificate } from "react-icons/fa";
import Mambobot from "./Mambobot";

const bulletPoints = [
    "No partner needed",
    "13 languages",
    "On-demand, anytime, anywhere",
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

    // Recover from Chrome's "autoplay fires before decoder is ready" hang on hard-refresh.
    // Watches currentTime; if playback isn't advancing we force a full load()+play() reset,
    // which is exactly what a tab-visibility cycle does under the hood.
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let lastTime = -1;
        let stuckTicks = 0;
        let resetCount = 0;

        const tryPlay = () => {
            if (v.paused && !v.ended) v.play().catch(() => {});
        };
        const hardReset = () => {
            if (resetCount >= 3) return; // give up after a few tries
            resetCount += 1;
            try { v.load(); } catch {}
            v.play().catch(() => {});
        };

        tryPlay();

        const id = window.setInterval(() => {
            if (v.readyState < 2) { tryPlay(); return; }
            if (v.paused) { tryPlay(); return; }
            if (v.currentTime === lastTime) {
                stuckTicks += 1;
                if (stuckTicks >= 3) { // ~1.5s of no progress despite "playing"
                    stuckTicks = 0;
                    hardReset();
                }
            } else {
                stuckTicks = 0;
                lastTime = v.currentTime;
            }
        }, 500);

        const onVisible = () => { if (document.visibilityState === "visible") tryPlay(); };
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
        <section className="relative min-h-[calc(100vh-56px)] sm:min-h-screen w-full flex items-start lg:items-center justify-center overflow-hidden bg-transparent pt-20 sm:pt-24 md:pt-24 landscape-phone:!pt-16">
            {/* Content Container */}
            <div className="hero-content-container relative z-10 container mx-auto px-4 sm:px-6 md:px-12 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-3 md:gap-12 lg:gap-12 landscape-phone:!flex-row landscape-phone:!items-center landscape-phone:!gap-4 landscape-phone:!px-4">

                {/* Video Side — SECOND on mobile (below text), SECOND on desktop (right) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex-[1.8] w-full max-w-2xl lg:max-w-5xl order-2 lg:order-2 landscape-phone:!order-2 landscape-phone:!flex-[1.1] landscape-phone:!max-w-[50%]"
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
                            <source src="https://pub-bad1fce3595144f2bac8492efa3aec64.r2.dev/hero/SilentHero.v3.webm" type="video/webm" />
                            <source src="https://pub-bad1fce3595144f2bac8492efa3aec64.r2.dev/hero/SilentHero.v3.mp4" type="video/mp4" />
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
                    className="flex-1 text-center lg:text-left space-y-4 md:space-y-6 max-w-2xl order-1 lg:order-1 landscape-phone:!order-1 landscape-phone:!text-left landscape-phone:!space-y-2 landscape-phone:!max-w-[50%]"
                >
                    {/* Credential Badge — aligned left on mobile */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2 bg-gradient-to-r from-amber-900/70 to-yellow-900/50 border border-mambo-gold/70 rounded-full backdrop-blur-sm shadow-[0_0_25px_rgba(212,175,55,0.2)] max-w-full landscape-phone:!py-0.5 landscape-phone:!px-2.5 landscape-phone:!gap-1.5"
                    >
                        <FaCertificate className="text-mambo-gold text-[10px] sm:text-xs flex-shrink-0 landscape-phone:!text-[10px]" />
                        <span className="text-[11px] sm:text-xs font-semibold text-mambo-gold tracking-wide leading-tight landscape-phone:!text-[10px]">
                            Built on Learning Experience Design
                        </span>
                    </motion.div>

                    {/* Main Title — structured salsa curriculum positioning */}
                    <div className="space-y-2 md:space-y-2.5 landscape-phone:!space-y-1">
                        <h1 className="leading-[1.05] tracking-tight text-mambo-text">
                            <span className="block font-extrabold text-[clamp(1.25rem,1.7vw,1.75rem)] landscape-phone:!text-xl">
                                Every move, every technique.
                            </span>
                            <span
                                className="block font-bold italic text-mambo-gold text-[clamp(1.5rem,2.25vw,2.5rem)] drop-shadow-[0_0_30px_rgba(212,175,55,0.35)] landscape-phone:!text-2xl"
                                style={{ fontFamily: '"Playfair Display", serif' }}
                            >
                                Level 0 to 100.
                            </span>
                        </h1>
                        <p className="text-sm sm:text-base text-gray-300 leading-snug max-w-md mx-auto lg:mx-0 text-balance landscape-phone:!text-xs">
                            A structured salsa curriculum. Every skill in the right order.
                        </p>
                    </div>

                    {/* Bullet Points — compact on mobile */}
                    <motion.ul
                        className="space-y-2 md:space-y-4 landscape-phone:!space-y-1"
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
                                className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-200 justify-center lg:justify-start landscape-phone:!text-[11px] landscape-phone:!gap-1.5 landscape-phone:!justify-start"
                            >
                                <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center landscape-phone:!w-3.5 landscape-phone:!h-3.5">
                                    <FaCheck className="text-emerald-400 text-[9px] sm:text-[10px] landscape-phone:!text-[8px]" />
                                </div>
                                <span>{point}</span>
                            </motion.li>
                        ))}
                    </motion.ul>

                    {/* CTA Button — desktop + landscape-phone (mobile-portrait version rendered below the video) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="hidden lg:flex flex-col gap-2.5 items-start pt-2 landscape-phone:!flex landscape-phone:!gap-1 landscape-phone:!pt-1"
                    >
                        <div className="flex items-center gap-2 text-sm text-gray-300 landscape-phone:!text-[11px] landscape-phone:!gap-1.5">
                            <span className="relative flex h-2 w-2 landscape-phone:!h-1.5 landscape-phone:!w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mambo-gold opacity-60"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-mambo-gold landscape-phone:!h-1.5 landscape-phone:!w-1.5"></span>
                            </span>
                            <span>
                                Join <span className="font-bold text-mambo-gold">1,000+ dancers</span> already on the list
                            </span>
                        </div>
                        <Link
                            href="/register"
                            className="relative bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] text-black font-extrabold py-2.5 px-6 xl:py-3 xl:px-7 rounded-full text-sm whitespace-nowrap transition-all transform hover:-translate-y-1 hover:brightness-110 text-center shadow-[0_0_25px_rgba(252,226,5,0.45),0_0_50px_rgba(212,175,55,0.2)] ring-2 ring-amber-400/50 landscape-phone:!py-2 landscape-phone:!px-4 landscape-phone:!text-[11px]"
                        >
                            Get Your 7-Day Free Trial!
                        </Link>
                    </motion.div>
                </motion.div>

                {/* CTA Button — mobile-portrait only, rendered BELOW the video */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="flex lg:hidden flex-col gap-2.5 items-center w-full max-w-md order-3 pt-1 landscape-phone:!hidden"
                >
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mambo-gold opacity-60"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-mambo-gold"></span>
                        </span>
                        <span>
                            Join <span className="font-bold text-mambo-gold">1,000+ dancers</span> already on the list
                        </span>
                    </div>
                    <Link
                        href="/register"
                        className="w-full relative bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] text-black font-extrabold py-3.5 px-6 rounded-full text-sm transition-all transform hover:-translate-y-1 hover:brightness-110 text-center shadow-[0_0_25px_rgba(252,226,5,0.45),0_0_50px_rgba(212,175,55,0.2)] ring-2 ring-amber-400/50"
                    >
                        Get Your 7-Day Free Trial!
                    </Link>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-20 landscape-phone:!hidden"
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
