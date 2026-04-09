"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaFire, FaBookOpen, FaMusic, FaHistory, FaBrain, FaTheaterMasks } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Level {
    id: string;
    title: string;
    lesson_count: number;
    duration_minutes?: number;
    total_xp?: number;
    mux_preview_playback_id?: string | null;
    world_id: string;
}

interface WorldWithLevels {
    id: string;
    title: string;
    slug: string;
    levels: Level[];
}

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
    module: Level;
    isHovered: boolean;
    onHover: (id: string | null) => void;
}

function ModuleCard({ module, isHovered, onHover }: ModuleCardProps) {
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (isHovered && module.mux_preview_playback_id) {
            const timer = setTimeout(() => setShowPreview(true), 300);
            return () => clearTimeout(timer);
        } else {
            setShowPreview(false);
        }
    }, [isHovered, module.mux_preview_playback_id]);

    const thumbnailUrl = module.mux_preview_playback_id
        ? `https://image.mux.com/${module.mux_preview_playback_id}/thumbnail.webp?width=640&height=400&fit_mode=smartcrop`
        : null;

    const gifUrl = module.mux_preview_playback_id
        ? `https://image.mux.com/${module.mux_preview_playback_id}/animated.gif?width=640&height=400&fps=12`
        : null;

    const displayUrl = showPreview && gifUrl ? gifUrl : thumbnailUrl;

    const xp = module.total_xp || module.lesson_count * 25;
    const duration = module.duration_minutes
        ? `${module.duration_minutes} min`
        : `${Math.max(5, module.lesson_count * 5)} min`;

    return (
        <Link href={`/courses/${module.world_id}`}>
            <motion.div
                className="relative flex-shrink-0 w-64 sm:w-72 md:w-80 aspect-[16/10] rounded-xl overflow-hidden cursor-pointer group border border-white/10 bg-zinc-900/80"
                onMouseEnter={() => onHover(module.id)}
                onMouseLeave={() => onHover(null)}
                whileHover={{ scale: 1.02, zIndex: 10 }}
                transition={{ duration: 0.2 }}
            >
                {/* Background Image/Preview */}
                <div className="absolute inset-0">
                    {displayUrl ? (
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                            style={{
                                backgroundImage: `url(${displayUrl})`,
                                filter: isHovered ? 'brightness(0.7)' : 'brightness(0.5)',
                            }}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                </div>

                {/* Trending Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-500/90 to-red-500/90 rounded-full text-[10px] font-bold text-white shadow-lg backdrop-blur-sm">
                    <FaFire className="text-yellow-300" />
                    Trending
                </div>

                {/* XP Badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-[10px] font-bold text-mambo-gold">
                    +{xp} XP
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
                            {module.lesson_count} lessons
                        </span>
                        <span className="text-gray-500">•</span>
                        <span>{duration}</span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

// Seeded shuffle for stable randomness per session
function shuffleArray<T>(array: T[], seed: number): T[] {
    const shuffled = [...array];
    let s = seed;
    for (let i = shuffled.length - 1; i > 0; i--) {
        s = (s * 16807 + 0) % 2147483647;
        const j = s % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function TrendingModulesSection() {
    const [hoveredModule, setHoveredModule] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [modules, setModules] = useState<Level[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch real modules from API
    useEffect(() => {
        async function fetchModules() {
            try {
                // Fetch all courses to get their IDs
                const res = await fetch(`${API_URL}/api/courses/worlds`, { credentials: "include" });
                if (!res.ok) return;
                const worlds: { id: string; course_type: string }[] = await res.json();

                // Fetch skill trees for each course (only "course" type, not choreos)
                const courseWorlds = worlds.filter(w => w.course_type === "course");
                const allLevels: Level[] = [];

                await Promise.all(courseWorlds.map(async (world) => {
                    try {
                        const treeRes = await fetch(`${API_URL}/api/courses/worlds/${world.id}/skill-tree`, { credentials: "include" });
                        if (!treeRes.ok) return;
                        const tree = await treeRes.json();
                        for (const level of tree.levels || []) {
                            allLevels.push({ ...level, world_id: world.id });
                        }
                    } catch {}
                }));

                // Pick random 15 using a session-stable seed
                const seed = Math.floor(Date.now() / (1000 * 60 * 60)); // changes hourly
                const shuffled = shuffleArray(allLevels.filter(l => l.lesson_count > 0), seed);
                setModules(shuffled.slice(0, 15));
            } catch (err) {
                console.error("Failed to fetch trending modules:", err);
            }
        }
        fetchModules();
    }, []);

    // Auto-scroll carousel
    useEffect(() => {
        if (isPaused || modules.length === 0) return;

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
    }, [isPaused, modules]);

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
                        {[...modules, ...modules].map((module, index) => (
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
