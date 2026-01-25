"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import Link from "next/link";

export default function PreviewCTABar() {
    const [memberCount, setMemberCount] = useState(1200);

    // Fetch real member count from API
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/api/community/stats");
                if (response.ok) {
                    const data = await response.json();
                    setMemberCount(data.member_count || 1200);
                }
            } catch (err) {
                // Use fallback value on error
                console.log("Using fallback member count for CTA");
            }
        };
        fetchStats();
    }, []);

    return (
        <motion.div
            className="fixed bottom-0 left-0 right-0 z-50"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5, ease: "easeOut" }}
        >
            {/* Glassmorphism container */}
            <div className="mx-4 mb-4 md:mx-auto md:max-w-2xl">
                <div
                    className="relative overflow-hidden rounded-2xl border-2 border-amber-400/50 p-4 md:p-5"
                    style={{
                        background: "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,20,0.9) 100%)",
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 0 40px rgba(251, 191, 36, 0.15), 0 20px 40px rgba(0, 0, 0, 0.5)",
                    }}
                >
                    {/* Decorative corner elements */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-amber-400/60 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-amber-400/60 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-amber-400/60 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-amber-400/60 rounded-br-xl" />

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Text */}
                        <div className="text-center md:text-left">
                            <p className="text-white/90 text-lg font-serif">
                                The floor is full. Join{" "}
                                <span className="text-amber-400 font-bold">{memberCount.toLocaleString()}+</span>{" "}
                                dancers inside the Inn.
                            </p>
                        </div>

                        {/* CTA Button */}
                        <Link href="/pricing">
                            <motion.button
                                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-black font-bold rounded-lg shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-shadow"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Crown size={20} />
                                <span className="font-serif tracking-wide">Become a Member</span>
                            </motion.button>
                        </Link>
                    </div>

                    {/* Shimmer effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full"
                        animate={{ translateX: ["100%", "-100%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                    />
                </div>
            </div>
        </motion.div>
    );
}
