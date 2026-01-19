"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { FaPlay } from "react-icons/fa";

export default function MaestroSection() {
    return (
        <section className="relative py-24 bg-black overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-mambo-gold/5 via-black to-black opacity-40"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Text Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-left"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Meet the <span className="text-mambo-gold">Maestro</span>
                        </h2>
                        <p className="text-xl text-gray-300 italic mb-6">
                            "Dance isn't just steps. It's a conversation without words."
                        </p>
                        <p className="text-gray-400 leading-relaxed mb-8">
                            Join Pavle Popovic, international Salsa champion, on a journey to master the art of Latin dance.
                            With over 15 years of teaching experience, he breaks down complex movements into natural, feeling-based techniques.
                        </p>
                        <button className="px-8 py-3 bg-mambo-gold text-black font-bold uppercase tracking-wider hover:bg-white transition-colors">
                            Watch Trailer
                        </button>
                    </motion.div>

                    {/* Video Placeholder Side */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden border border-white/10 shadow-2xl group cursor-pointer relative">
                            {/* Poster/Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-black via-gray-900 to-mambo-gold/20"></div>

                            {/* Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                                    <FaPlay className="text-white ml-2 text-2xl" />
                                </div>
                            </div>

                            {/* Hint text */}
                            <div className="absolute bottom-4 right-4 text-xs text-white/50 uppercase tracking-widest">
                                Cinematic Trailer [Coming Soon]
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -z-10 -bottom-10 -right-10 w-40 h-40 bg-mambo-gold/10 rounded-full blur-3xl"></div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
