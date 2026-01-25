"use client";

import { motion } from "framer-motion";
import { FaPlay, FaCheck, FaLock, FaStar } from "react-icons/fa";

const nodes = [
    { id: 1, title: "Rhythm & Timing", x: 20, y: 80, status: "completed" },
    { id: 2, title: "Basic Step", x: 35, y: 60, status: "active" },
    { id: 3, title: "Right Turn", x: 50, y: 70, status: "locked" },
    { id: 4, title: "Cross Body Lead", x: 65, y: 40, status: "locked" },
    { id: 5, title: "Musicality", x: 80, y: 50, status: "locked" },
];

export default function ConstellationSection() {
    return (
        <section className="relative py-24 px-6 overflow-hidden bg-transparent">
            {/* Subtle Overlay to ensure text readability if needed */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-transparent pointer-events-none" />

            <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
                {/* Left: Text Content */}
                <div className="flex-1 text-center md:text-left z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold font-serif mb-6 text-white leading-tight">
                            Stop guessing what to learn next. <br />
                            <span className="text-mambo-gold">Follow the roadmap.</span>
                        </h2>
                        <p className="text-xl text-gray-300 mb-8 font-light leading-relaxed">
                            Our unique <strong className="text-white">Constellation System</strong> guides you step-by-step.
                            Master one skill to unlock the next. Only on The Mambo Inn.
                        </p>
                        <button className="bg-white text-black font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-200 transition shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            View Interactive Map
                        </button>
                    </motion.div>
                </div>

                {/* Right: Visual Map Demo */}
                <div className="flex-1 w-full relative h-[400px] bg-black/40 rounded-2xl border border-white/10 backdrop-blur-sm shadow-2xl p-6">
                    <div className="absolute top-4 left-4 text-xs text-gray-500 uppercase tracking-widest font-bold">
                        Live Demo
                    </div>

                    {/* SVG Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                        <motion.path
                            d="M 20% 80% L 35% 60% L 50% 70% L 65% 40% L 80% 50%"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="2"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                        <motion.path
                            d="M 20% 80% L 35% 60%"
                            fill="none"
                            stroke="#D4AF37"
                            strokeWidth="2"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                        />
                    </svg>

                    {/* Nodes */}
                    {nodes.map((node) => (
                        <div
                            key={node.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group cursor-pointer"
                            style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        >
                            {/* Node Circle */}
                            <div className="relative">
                                {/* Active Pulse */}
                                {node.status === "active" && (
                                    <>
                                        <div className="absolute inset-0 bg-mambo-gold rounded-full animate-ping opacity-75" />
                                        <div className="absolute -inset-4 border border-mambo-gold/50 rounded-full animate-pulse" />
                                    </>
                                )}

                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-xl z-10 relative transition-all duration-300
                    ${node.status === "completed" ? "bg-mambo-gold border-mambo-gold text-black" :
                                            node.status === "active" ? "bg-black border-mambo-gold text-mambo-gold" :
                                                "bg-zinc-900 border-zinc-700 text-zinc-600"}`}
                                >
                                    {node.status === "completed" && <FaCheck size={16} />}
                                    {node.status === "active" && <FaPlay size={16} className="ml-1" />}
                                    {node.status === "locked" && <FaLock size={14} />}
                                </div>
                            </div>

                            {/* Label */}
                            <div className={`text-xs font-bold whitespace-nowrap bg-black/80 px-2 py-1 rounded backdrop-blur-md transition-colors
                  ${node.status === "active" ? "text-white" : "text-gray-500"}`}>
                                {node.title}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
