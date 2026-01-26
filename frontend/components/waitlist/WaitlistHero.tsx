import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import WaitlistForm from './WaitlistForm';
import { Sparkles, Trophy, Music, Zap } from 'lucide-react';
import Link from 'next/link';

interface WaitlistHeroProps {
    onSuccess: (data: any) => void;
}

const WaitlistHero: React.FC<WaitlistHeroProps> = ({ onSuccess }) => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 lg:py-0">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-black-void z-0">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#D4AF37]/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#39FF14]/5 blur-[120px] animate-pulse delay-700" />
            </div>

            <div className="container mx-auto px-4 z-10 relative flex flex-col lg:flex-row items-center gap-12 lg:gap-20 lg:-mt-12">

                {/* Left Content (Text) */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex-1 text-center lg:text-left space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 backdrop-blur-md">
                        <Sparkles size={16} className="text-[#D4AF37]" />
                        <span className="text-sm font-semibold tracking-widest text-[#D4AF37] uppercase">The Velvet Rope is Open</span>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold font-serif leading-tight">
                        <span className="text-white block">Join The</span>
                        <span className="text-gradient-gold block mt-2">Mambo Guild</span>
                    </h1>


                    <div className="text-left max-w-2xl mx-auto lg:mx-0 space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-gray-400 font-sans text-sm">
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full shadow-[0_0_8px_#39FF14]" />
                                    <span>3 Mambo Courses: "Zero to Mastery"</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full shadow-[0_0_8px_#39FF14]" />
                                    <span>Pachanga Course</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full shadow-[0_0_8px_#39FF14]" />
                                    <span>Bodymovement Course</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full shadow-[0_0_8px_#39FF14]" />
                                    <span>9 Brand New Choreographies</span>
                                </li>
                            </ul>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full shadow-[0_0_8px_#39FF14]" />
                                    <span>History & Science of Learning</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full shadow-[0_0_8px_#39FF14]" />
                                    <span>Weekly New Content!</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full shadow-[0_0_8px_#39FF14]" />
                                    <span>500+ Lessons, 100+ Modules</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </motion.div>

                {/* Right Content (Golden Ticket Form) */}
                <motion.div
                    initial={{ opacity: 0, x: 50, rotateY: 15 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    transition={{ duration: 1, delay: 0.2, type: "spring" }}
                    className="flex-1 w-full max-w-md perspective-1000"
                >
                    <div className="relative group holographic-card p-1 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#B8860B] to-black">
                        <div className="absolute inset-0 bg-[#D4AF37] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

                        <div className="relative bg-black/90 backdrop-blur-xl p-8 rounded-xl border border-[#D4AF37]/20 shadow-2xl">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-[#D4AF37] rounded-b-full shadow-[0_0_15px_#D4AF37]" />

                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-serif text-white mb-2">Reserve Your Gamertag</h3>
                                <p className="text-gray-400 text-sm">Become a Founding Member</p>
                            </div>

                            <WaitlistForm onSuccess={onSuccess} />

                            <div className="mt-6 flex justify-center items-center text-[10px] text-gray-600 font-mono uppercase tracking-widest border-t border-white/5 pt-4">
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse" />
                                    Priority Access + Founder Badge
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Scroll Indicator */}
            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-10 left-0 w-full z-50 flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
            >
                <button
                    onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                    className="flex flex-col items-center gap-3 group cursor-pointer hover:scale-105 transition-transform p-4 opacity-80 hover:opacity-100"
                >
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] group-hover:text-[#39FF14] transition-colors font-bold">Explore The Guild</span>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-[#D4AF37]/0 via-[#D4AF37] to-[#D4AF37]/0 group-hover:via-[#39FF14] transition-colors relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-white/50 animate-dropdown" />
                    </div>
                </button>
            </motion.div>

            <style jsx>{`
                @keyframes dropdown {
                  0% { transform: translateY(-100%); }
                  100% { transform: translateY(100%); }
                }
                .animate-dropdown {
                  animation: dropdown 1.5s cubic-bezier(0.77, 0, 0.175, 1) infinite;
                }
            `}</style>
        </section>
    );
};

export default WaitlistHero;
