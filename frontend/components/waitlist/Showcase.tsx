import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Award } from 'lucide-react';
import Image from 'next/image';

const Showcase: React.FC = () => {
    return (
        <section className="py-24 bg-black-void relative overflow-hidden flex flex-col items-center">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* Component A: The Skill Tree (Static Mambo 101 Demo) */}
                <div className="space-y-6">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-serif text-white mb-2">Visual Progression</h2>
                        <p className="text-gray-400 text-sm">Visualize your growth. Master nodes to unlock new levels.</p>
                    </div>

                    <div className="relative w-full aspect-square max-w-[500px] mx-auto bg-black/40 rounded-3xl border border-[#D4AF37]/20 backdrop-blur-sm p-8 shadow-2xl flex items-center justify-center">
                        {/* Static Constellation Graph Demo */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                            <defs>
                                <linearGradient id="gold-edge" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#B8860B" stopOpacity="0.5" />
                                    <stop offset="50%" stopColor="#D4AF37" stopOpacity="1" />
                                    <stop offset="100%" stopColor="#FCE205" stopOpacity="0.5" />
                                </linearGradient>
                            </defs>

                            {/* Connections */}
                            <motion.path d="M 250 400 L 150 300" stroke="url(#gold-edge)" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.5 }} />
                            <motion.path d="M 250 400 L 350 300" stroke="url(#gold-edge)" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.5 }} />

                            <motion.path d="M 150 300 L 150 180" stroke="url(#gold-edge)" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.5 }} />
                            <motion.path d="M 350 300 L 350 180" stroke="#333" strokeWidth="2" strokeDasharray="5,5" />

                            <motion.path d="M 150 180 L 250 80" stroke="url(#gold-edge)" strokeWidth="2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1 }} />
                            <motion.path d="M 350 180 L 250 80" stroke="#333" strokeWidth="2" strokeDasharray="5,5" />
                        </svg>

                        {/* Nodes */}
                        {/* Root */}
                        <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0 }} whileInView={{ scale: 1 }}
                                className="w-16 h-16 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37] flex items-center justify-center shadow-[0_0_30px_#D4AF37]"
                            >
                                <Star fill="#D4AF37" className="text-[#D4AF37]" size={24} />
                            </motion.div>
                            <span className="mt-2 text-xs font-mono text-[#D4AF37] uppercase tracking-wider">On2 Basics</span>
                        </div>

                        {/* Level 2 Left */}
                        <div className="absolute top-[55%] left-[25%] -translate-x-1/2 flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 0.3 }}
                                className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center"
                            >
                                <Star fill="#D4AF37" className="text-[#D4AF37]" size={16} />
                            </motion.div>
                            <span className="mt-2 text-[10px] font-mono text-gray-400 uppercase">Timing</span>
                        </div>

                        {/* Level 2 Right */}
                        <div className="absolute top-[55%] right-[25%] translate-x-1/2 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-black/50 border border-gray-700 flex items-center justify-center">
                                <Lock className="text-gray-600" size={16} />
                            </div>
                            <span className="mt-2 text-[10px] font-mono text-gray-600 uppercase">Partnerwork</span>
                        </div>

                        {/* Level 3 Left */}
                        <div className="absolute top-[30%] left-[25%] -translate-x-1/2 flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ delay: 0.8 }}
                                className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center animate-pulse"
                            >
                                <div className="w-3 h-3 bg-[#D4AF37] rounded-full" />
                            </motion.div>
                            <span className="mt-2 text-[10px] font-mono text-[#D4AF37] uppercase">Spinning</span>
                        </div>

                        {/* Level 3 Right */}
                        <div className="absolute top-[30%] right-[25%] translate-x-1/2 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-black/50 border border-gray-700 flex items-center justify-center">
                                <Lock className="text-gray-600" size={16} />
                            </div>
                            <span className="mt-2 text-[10px] font-mono text-gray-600 uppercase">Shines</span>
                        </div>

                        {/* Boss Node */}
                        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-black/50 border-2 border-dashed border-gray-700 flex items-center justify-center">
                                <Award className="text-gray-600" size={32} />
                            </div>
                            <span className="mt-2 text-[10px] font-mono text-gray-600 uppercase tracking-widest">BOSS LEVEL</span>
                        </div>
                    </div>
                </div>

                {/* Component B: The Trophy Case (Simplified) */}
                <div className="space-y-6">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-serif text-white mb-2">Trophy Case</h2>
                        <p className="text-gray-400 text-sm">Earn exclusive rewards for your achievements.</p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-12 rounded-3xl border border-[#D4AF37]/30 flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#D4AF37]/60 transition-colors"
                    >
                        {/* Spotlight BG */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-[#D4AF37]/10 to-transparent opacity-50" />

                        {/* Badge */}
                        <div className="relative w-64 h-64 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_20px_50px_rgba(212,175,55,0.3)]">
                            <Image
                                src="/badges/founder_diamond.png"
                                alt="Founder Diamond Badge"
                                fill
                                className="object-contain"
                            />
                        </div>

                        {/* Simple Tag */}
                        <div className="mt-8 px-6 py-2 rounded-full bg-black/40 border border-[#D4AF37]/30 backdrop-blur-md">
                            <span className="text-[#D4AF37] font-serif tracking-widest text-lg">FOUNDER DIAMOND</span>
                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
};

export default Showcase;
