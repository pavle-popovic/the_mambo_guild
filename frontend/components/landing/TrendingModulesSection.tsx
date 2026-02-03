"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaLock, FaFire, FaBookOpen, FaMusic, FaHistory, FaBrain, FaTheaterMasks } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import Link from "next/link";

// Mock trending modules data
const TRENDING_MODULES = [
    {
        id: "1",
        title: "Basic Step Foundations",
        thumbnail: "/assets/course_thumbnails/basics.jpg",
        previewGif: null,
        lessonCount: 12,
        duration: "45 min",
        xp: 150,
        trending: true,
    },
    {
        id: "2",
        title: "Musicality Mastery",
        thumbnail: "/assets/course_thumbnails/musicality.jpg",
        previewGif: null,
        lessonCount: 8,
        duration: "30 min",
        xp: 120,
        trending: true,
    },
    {
        id: "3",
        title: "Spin Technique",
        thumbnail: "/assets/course_thumbnails/spins.jpg",
        previewGif: null,
        lessonCount: 10,
        duration: "40 min",
        xp: 200,
        trending: true,
    },
    {
        id: "4",
        title: "Body Movement & Styling",
        thumbnail: "/assets/course_thumbnails/styling.jpg",
        previewGif: null,
        lessonCount: 15,
        duration: "55 min",
        xp: 180,
        trending: true,
    },
    {
        id: "5",
        title: "Partner Connection",
        thumbnail: "/assets/course_thumbnails/leadfollow.jpg",
        previewGif: null,
        lessonCount: 6,
        duration: "25 min",
        xp: 100,
        trending: true,
    },
    {
        id: "6",
        title: "Rhythm & Timing",
        thumbnail: "/assets/course_thumbnails/rhythm.jpg",
        previewGif: null,
        lessonCount: 8,
        duration: "35 min",
        xp: 140,
        trending: true,
    },
];

// Content stats
const CONTENT_STATS = [
    { icon: FaBookOpen, label: "500+ Lessons", color: "text-emerald-400" },
    { icon: FaTheaterMasks, label: "Beginner to Pro Salsa Course", color: "text-mambo-gold" },
    { icon: FaMusic, label: "Pachanga Course", color: "text-purple-400" },
    { icon: HiSparkles, label: "Body Movement Course", color: "text-pink-400" },
    { icon: FaHistory, label: "Full Salsa History", color: "text-cyan-400" },
    { icon: FaBrain, label: "How to Train Science", color: "text-orange-400" },
    { icon: FaPlay, label: "9 Full Choreographies", color: "text-red-400" },
];

interface ModuleCardProps {
    module: typeof TRENDING_MODULES[0];
    isHovered: boolean;
    onHover: (id: string | null) => void;
}

function ModuleCard({ module, isHovered, onHover }: ModuleCardProps) {
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (isHovered) {
            const timer = setTimeout(() => setShowPreview(true), 300);
            return () => clearTimeout(timer);
        } else {
            setShowPreview(false);
        }
    }, [isHovered]);

    // Animated GIF preview URL (using Mux pattern, but with static fallback)
    const displayUrl = showPreview && module.previewGif 
        ? module.previewGif 
        : module.thumbnail;

    return (
        <motion.div
            className="relative flex-shrink-0 w-64 sm:w-72 md:w-80 aspect-[16/10] rounded-xl overflow-hidden cursor-pointer group border border-white/10 bg-zinc-900/80"
            onMouseEnter={() => onHover(module.id)}
            onMouseLeave={() => onHover(null)}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            transition={{ duration: 0.2 }}
        >
            {/* Background Image/Preview */}
            <div className="absolute inset-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                    style={{ 
                        backgroundImage: `url(${displayUrl})`,
                        filter: isHovered ? 'brightness(0.7)' : 'brightness(0.5)',
                    }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            </div>

            {/* Trending Badge */}
            {module.trending && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-500/90 to-red-500/90 rounded-full text-[10px] font-bold text-white shadow-lg backdrop-blur-sm">
                    <FaFire className="text-yellow-300" />
                    Trending
                </div>
            )}

            {/* XP Badge */}
            <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-[10px] font-bold text-mambo-gold">
                +{module.xp} XP
            </div>

            {/* Play Button (appears on hover) */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="w-14 h-14 bg-mambo-gold/90 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.5)]">
                            <FaPlay className="text-black ml-1 text-lg" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="text-white font-bold text-sm md:text-base mb-2 line-clamp-1 drop-shadow-lg">
                    {module.title}
                </h4>
                <div className="flex items-center gap-3 text-[11px] text-gray-300">
                    <span className="flex items-center gap-1">
                        <FaBookOpen className="text-gray-400" />
                        {module.lessonCount} lessons
                    </span>
                    <span className="text-gray-500">•</span>
                    <span>{module.duration}</span>
                </div>
            </div>
        </motion.div>
    );
}

export default function TrendingModulesSection() {
    const [hoveredModule, setHoveredModule] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll carousel
    useEffect(() => {
        if (isPaused) return;

        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        let animationId: number;
        let scrollPosition = 0;

        const scroll = () => {
            if (!scrollContainer) return;
            
            scrollPosition += 0.5;
            
            // Reset position when reaching the duplicate content
            if (scrollPosition >= scrollContainer.scrollWidth / 2) {
                scrollPosition = 0;
            }
            
            scrollContainer.scrollLeft = scrollPosition;
            animationId = requestAnimationFrame(scroll);
        };

        animationId = requestAnimationFrame(scroll);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [isPaused]);

    return (
        <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-transparent via-black/50 to-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10 md:mb-14"
                >
                    <h2 
                        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-mambo-text font-serif"
                        style={{ fontFamily: '"Playfair Display", serif' }}
                    >
                        Trending <span className="text-mambo-gold italic">Modules</span>
                    </h2>
                    <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
                        Join thousands of dancers mastering these popular modules
                    </p>
                </motion.div>

                {/* Carousel */}
                <div 
                    className="relative mb-12 md:mb-16"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {/* Fade edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

                    {/* Scrolling container */}
                    <div
                        ref={scrollRef}
                        className="flex gap-4 md:gap-6 overflow-x-hidden py-4"
                        style={{ scrollBehavior: 'auto' }}
                    >
                        {/* Duplicate modules for infinite scroll effect */}
                        {[...TRENDING_MODULES, ...TRENDING_MODULES].map((module, index) => (
                            <ModuleCard
                                key={`${module.id}-${index}`}
                                module={module}
                                isHovered={hoveredModule === module.id}
                                onHover={setHoveredModule}
                            />
                        ))}
                    </div>
                </div>

                {/* Content Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto"
                >
                    {CONTENT_STATS.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-3 p-3 md:p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm hover:border-white/20 transition-colors"
                        >
                            <stat.icon className={`text-lg md:text-xl ${stat.color}`} />
                            <span className="text-xs md:text-sm text-gray-300 font-medium">
                                {stat.label}
                            </span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="text-center mt-10 md:mt-14"
                >
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-mambo-gold to-amber-500 hover:from-amber-500 hover:to-mambo-gold text-black font-bold rounded-full text-sm md:text-base transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
                    >
                        <FaBookOpen />
                        Explore All Courses
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
