"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import Link from "next/link";
import { FaTimes } from "react-icons/fa";

interface LevelSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    levelTitle: string;
}

const levelContent = {
    "Stop Stepping on Toes": {
        roadmap: ["The Basic Step (On-1)", "Finding the Beat", "Leading your First Turn"],
        color: "from-blue-500 to-cyan-400",
        ct: "Start Your Foundation",
    },
    "Unlock Fluidity": {
        roadmap: ["Cross Body Lead Variations", "Spin Technique 101", "Musicality Drills"],
        color: "from-mambo-blue to-purple-500",
        ct: "Unlock Your Potential",
    },
    "Steal the Spotlight": {
        roadmap: ["Advanced Shines", "On-2 Timing Mastery", "Performance Styling"],
        color: "from-purple-500 to-pink-500",
        ct: "Become a Pro",
    },
};

export default function LevelSelectionModal({ isOpen, onClose, levelTitle }: LevelSelectionModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const content = levelContent[levelTitle as keyof typeof levelContent] || levelContent["Stop Stepping on Toes"];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-zinc-900 border border-mambo-gold/30 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
                            >
                                <FaTimes size={24} />
                            </button>

                            {/* Header */}
                            <div className="p-8 pb-4 text-center relative">
                                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${content.color}`} />
                                <h3 className="text-2xl font-serif font-bold text-mambo-gold italic mb-2">Excellent Choice.</h3>
                                <p className="text-white/80">Your <span className="text-mambo-gold">{levelTitle}</span> roadmap is ready.</p>
                            </div>

                            {/* Blurred Roadmap Preview */}
                            <div className="px-8 py-4 space-y-3">
                                <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">Lesson Preview</p>
                                {content.roadmap.map((lesson, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 relative overflow-hidden group">
                                        {/* Lock Icon */}
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
                                            🔒
                                        </div>
                                        <div className="w-6 h-6 rounded-full bg-mambo-gold/20 flex items-center justify-center text-mambo-gold text-xs font-bold">
                                            {idx + 1}
                                        </div>
                                        {/* Blurred Text Effect */}
                                        <span className="text-sm font-medium text-white/90 group-hover:text-mambo-gold transition-colors">
                                            {lesson}
                                        </span>
                                    </div>
                                ))}
                                {/* Fade out effect at bottom */}
                                <div className="h-4" />
                            </div>

                            {/* CTA Footer */}
                            <div className="p-8 pt-4 bg-black/20 text-center">
                                <Link
                                    href={`/register?level=${encodeURIComponent(levelTitle)}`}
                                    className="inline-block w-full py-4 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-bold text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:scale-[1.02]"
                                >
                                    Create Free Profile to Watch Lesson 1
                                </Link>
                                <p className="text-zinc-500 text-xs mt-3">No credit card required. Instant access.</p>
                            </div>

                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
