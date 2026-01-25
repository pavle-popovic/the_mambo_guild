"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlay, FaChevronLeft, FaChevronRight, FaLock } from "react-icons/fa";
import Image from "next/image";

// Mock Data for Courses
const TRENDING_COURSES = [
    { id: 1, title: "Salsa On-1 Fundamentals", level: "Beginner", duration: "4 Weeks", image: "/assets/course_thumbnails/salsa_fund.jpg", locked: false },
    { id: 2, title: "Musicality Masterclass", level: "All Levels", duration: "2 Hours", image: "/assets/course_thumbnails/musicality.jpg", locked: true },
    { id: 3, title: "Partnerwork Patterns Vol. 1", level: "Intermediate", duration: "6 Weeks", image: "/assets/course_thumbnails/partnerwork1.jpg", locked: true },
    { id: 4, title: "Body Isolation Drills", level: "All Levels", duration: "30 Mins", image: "/assets/course_thumbnails/isolation.jpg", locked: false },
    { id: 5, title: "Spin Technique 101", level: "Beginner", duration: "1 Hour", image: "/assets/course_thumbnails/spins.jpg", locked: true },
];

const BEGINNER_COURSES = [
    { id: 6, title: "Intro to Rhythm", level: "Beginner", duration: "45 Mins", image: "/assets/course_thumbnails/rhythm.jpg", locked: false },
    { id: 7, title: "Basic Steps Breakdown", level: "Beginner", duration: "1 Hour", image: "/assets/course_thumbnails/basics.jpg", locked: false },
    { id: 8, title: "Leading & Following 101", level: "Beginner", duration: "2 Hours", image: "/assets/course_thumbnails/leadfollow.jpg", locked: true },
    { id: 9, title: "Salsa History", level: "Theory", duration: "20 Mins", image: "/assets/course_thumbnails/history.jpg", locked: false },
    { id: 10, title: "First Social Dance Survival", level: "Beginner", duration: "30 Mins", image: "/assets/course_thumbnails/social.jpg", locked: true },
];

const CourseCard = ({ course }: { course: any }) => (
    <motion.div
        className="relative flex-none w-[280px] aspect-[16/9] rounded-md overflow-hidden cursor-pointer group border border-white/10 bg-zinc-900"
        whileHover={{ scale: 1.05, zIndex: 10 }}
        transition={{ duration: 0.2 }}
    >
        {/* Placeholder Image Gradient if no real image */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950 group-hover:from-zinc-700 transition-colors duration-300">
            <div className="absolute inset-0 flex items-center justify-center text-zinc-700 opacity-20">
                <FaPlay size={40} />
            </div>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        <div className="absolute bottom-0 left-0 p-3 w-full">
            <h4 className="text-white font-bold text-sm truncate">{course.title}</h4>
            <div className="flex items-center gap-2 text-[10px] text-gray-300 mt-1 uppercase tracking-wider">
                <span>{course.level}</span>
                <span>•</span>
                <span>{course.duration}</span>
            </div>
        </div>

        {/* Lock Overlay */}
        {course.locked && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full text-mambo-gold">
                <FaLock size={10} />
            </div>
        )}
    </motion.div>
);

const CarouselRow = ({ title, courses }: { title: string, courses: any[] }) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    const checkScroll = () => {
        if (rowRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
            setShowLeft(scrollLeft > 0);
            setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (rowRef.current) {
            const scrollAmount = rowRef.current.clientWidth * 0.75;
            rowRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
            setTimeout(checkScroll, 300);
        }
    };

    return (
        <div className="mb-12 relative group/row">
            <h3 className="text-xl text-white font-bold mb-4 px-6 md:px-12 flex items-center gap-2">
                {title} <span className="text-mambo-gold text-sm font-normal uppercase tracking-widest opacity-0 group-hover/row:opacity-100 transition-opacity transform translate-x-[-10px] group-hover/row:translate-x-0 cursor-pointer">Explore All &rarr;</span>
            </h3>

            <div className="relative group">
                {/* Left Arrow */}
                {showLeft && (
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-0 bottom-0 w-12 bg-black/50 hover:bg-black/80 z-20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <FaChevronLeft size={24} />
                    </button>
                )}

                {/* Right Arrow */}
                {showRight && (
                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-0 top-0 bottom-0 w-12 bg-black/50 hover:bg-black/80 z-20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                        <FaChevronRight size={24} />
                    </button>
                )}

                {/* Scroll Container */}
                <div
                    ref={rowRef}
                    onScroll={checkScroll}
                    className="flex gap-4 overflow-x-auto px-6 md:px-12 pb-8 scrollbar-hide scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {courses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default function CourseExplorerSection() {
    return (
        <section className="bg-[#141414] py-20 border-t border-white/5 relative z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />

            <div className="max-w-[1800px] mx-auto">
                <div className="px-6 md:px-12 mb-8">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Everything you need to <span className="text-mambo-gold">level up</span>.</h2>
                    <p className="text-gray-400 mt-2">Unlimited access to our entire library of workshops and drills.</p>
                </div>

                <CarouselRow title="Trending Now" courses={TRENDING_COURSES} />
                <CarouselRow title="Start from Scratch" courses={BEGINNER_COURSES} />
            </div>
        </section>
    );
}
