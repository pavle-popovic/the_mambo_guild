"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, Lock, Play, Star } from "lucide-react";
import Image from "next/image";

// Mock Data for Courses
const ALL_COURSES = [
    { id: 1, title: "Salsa Colure Mural", level: "Beginner", duration: "4 Weeks", image: "/assets/course_thumbnails/salsa_fund.jpg", locked: false, progress: 60 },
    { id: 2, title: "Salsa Dancers", level: "Intermediate", duration: "2 Hours", image: "/assets/course_thumbnails/musicality.jpg", locked: false, progress: 85 },
    { id: 3, title: "Salsa Dance Library", level: "Advanced", duration: "6 Weeks", image: "/assets/course_thumbnails/partnerwork1.jpg", locked: false, progress: 45 },
    { id: 4, title: "Salsa Campirer", level: "Beginner", duration: "30 Mins", image: "/assets/course_thumbnails/isolation.jpg", locked: false, progress: 10 },
    { id: 5, title: "Salsa Dancer", level: "Advanced", duration: "1 Hour", image: "/assets/course_thumbnails/spins.jpg", locked: true, progress: 0 },
    { id: 6, title: "Salsa Enimation", level: "Intermediate", duration: "45 Mins", image: "/assets/course_thumbnails/rhythm.jpg", locked: false, progress: 70 },
    { id: 7, title: "Salsa Rhythm", level: "Beginner", duration: "1 Hour", image: "/assets/course_thumbnails/basics.jpg", locked: false, progress: 30 },
    { id: 8, title: "Partner Connection", level: "All Levels", duration: "2 Hours", image: "/assets/course_thumbnails/leadfollow.jpg", locked: true, progress: 0 },
    { id: 9, title: "Salsa History", level: "Theory", duration: "20 Mins", image: "/assets/course_thumbnails/history.jpg", locked: false, progress: 100 },
    { id: 10, title: "Social Survival", level: "Beginner", duration: "30 Mins", image: "/assets/course_thumbnails/social.jpg", locked: true, progress: 0 },
    // Duplicates for grid density
    { id: 11, title: "Salsa Styling", level: "Intermediate", duration: "1.5 Hours", image: "/assets/course_thumbnails/styling.jpg", locked: false, progress: 20 },
    { id: 12, title: "Spin Drills", level: "Advanced", duration: "1 Hour", image: "/assets/course_thumbnails/spins2.jpg", locked: true, progress: 0 },
];

const FilterPill = ({ label }: { label: string }) => (
    <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-mambo-gold/50 hover:bg-white/10 hover:shadow-lg hover:shadow-mambo-gold/10 transition-all duration-300 text-sm text-gray-300 hover:text-mambo-gold">
        {label}
        <ChevronDown size={14} className="text-gray-500 group-hover:text-mambo-gold transition-colors" />
    </button>
);

const CourseCard = ({ course }: { course: any }) => (
    <motion.div
        className="relative aspect-[16/9] rounded-xl overflow-hidden cursor-pointer group border border-white/10 bg-zinc-900 transition-all duration-300 hover:border-mambo-gold/50 hover:shadow-2xl hover:shadow-mambo-gold/10 hover:scale-[1.02] z-0 hover:z-10"
    >
        {/* Placeholder Image Gradient if no real image - simulating the warm photography */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/40 via-zinc-900 to-black group-hover:scale-105 transition-transform duration-500">
            {/* This would be the Image component with src={course.image} */}
            {/* Using a subtle pattern/gradient to mimic the 'warm lighting' descriptions if image fails load or for placeholder */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent opacity-60" />
        </div>

        {/* Lock Overlay */}
        {course.locked && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md p-1.5 rounded-full text-mambo-gold z-20">
                <Lock size={12} />
            </div>
        )}

        {/* Hover: Start Journey Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            {course.locked ? (
                <button className="px-5 py-2 bg-mambo-gold/20 border border-mambo-gold/60 text-mambo-gold rounded-full font-serif font-bold text-sm backdrop-blur-md flex items-center gap-2">
                    <Lock size={14} /> Unlock
                </button>
            ) : (
                <button className="px-5 py-2 bg-mambo-gold text-black rounded-full font-serif font-bold text-sm shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all">
                    <Play size={14} fill="currentColor" /> Start Journey
                </button>
            )}
        </div>

        {/* Active Constellation Effect on Hover (Optional, subtle) */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-30 pointer-events-none transition-opacity duration-500">
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            {/* SVG Lines connecting stars could be added here for 'constellation' effect */}
        </div>

        {/* Bottom Glass Content Area */}
        <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-white/5 backdrop-blur-md border-t border-white/10 flex flex-col justify-center px-4 z-10">
            <h4 className="text-white font-medium text-sm tracking-wide mb-1 drop-shadow-md">{course.title}</h4>

            {/* Progress Bar - Neon Cyan */}
            <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div
                    className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]"
                    style={{ width: `${course.progress}%` }}
                />
            </div>
        </div>
    </motion.div>
);

export default function CourseExplorerSection() {
    return (
        <section className="relative min-h-screen bg-transparent pb-32">
            {/* Sticky Control Bar */}
            <div className="sticky top-20 z-40 w-full py-4 px-6 md:px-12 backdrop-blur-xl bg-black/20 border-b border-white/5 transition-all duration-300">
                <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Left: Title */}
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-serif font-bold text-mambo-gold tracking-wide">Explore Courses</h2>
                    </div>

                    {/* Center: Search Bar */}
                    <div className="flex-1 max-w-lg w-full relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-400 group-focus-within:text-mambo-gold transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search library..."
                            className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-mambo-gold/50 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 backdrop-blur-md"
                        />
                    </div>

                    {/* Right: Filters */}
                    <div className="flex items-center gap-3">
                        <FilterPill label="Level" />
                        <FilterPill label="Style" />
                    </div>
                </div>
            </div>

            {/* Course Grid */}
            <div className="max-w-[1800px] mx-auto px-6 md:px-12 mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {ALL_COURSES.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            </div>

            {/* Background enhancement for this section */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none z-0" />
        </section>
    );
}
