"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import LevelSelectionModal from "./LevelSelectionModal";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

export default function ValuePropsSection() {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  return (
    <section
      id="value-props"
      className="relative px-6 z-20 pt-[66vh] pb-24 bg-transparent pointer-events-none"
    >
      <div className="max-w-7xl mx-auto pointer-events-auto">
        <LevelSelectionModal
          isOpen={!!selectedLevel}
          onClose={() => setSelectedLevel(null)}
          levelTitle={selectedLevel || ""}
        />

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 pointer-events-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif italic tracking-tight">
            Choose Your <span className="text-mambo-gold">Stage</span> or Find Your <span className="text-mambo-gold">Rhythm</span>
          </h2>
          <p className="text-xl text-gray-300">
            From your first step to the spotlight.
          </p>
        </motion.div>

        {/* 3-column grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto"
        >
          {valueProps.map((prop, index) => (
            <motion.div key={prop.title} variants={itemVariants} className="h-full">
              <GlassCard
                className="p-0 h-full backdrop-blur-md bg-black/80 border-white/10 overflow-hidden group hover:border-mambo-gold/50 transition-colors duration-300 cursor-pointer flex flex-col"
                glowIntensity="subtle"
                onClick={() => {
                  setSelectedLevel(prop.title);
                }}
              >
                {/* Video Placeholder (Top Half) */}
                <div className="relative h-48 w-full bg-gray-900 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${prop.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Temporary "Play" icon or label until video is added */}
                    <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[12px] border-l-white border-b-8 border-b-transparent ml-1"></div>
                    </div>
                  </div>
                  {/* This is where the video loop will go */}
                </div>

                {/* Text Content */}
                <div className="p-6 flex flex-col flex-grow text-left">
                  <h3 className="text-xl font-bold text-mambo-gold leading-tight tracking-tight mb-2">
                    {prop.title}
                  </h3>
                  <p className="text-sm font-bold text-white/90 mb-3 uppercase tracking-wider">
                    {prop.subtitle}
                  </p>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {prop.description}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div >
    </section >
  );
}

const valueProps = [
  {
    title: "Stop Stepping on Toes",
    subtitle: "Go from 'two left feet' to confidence in 30 days.",
    description: "Build Your Foundation. Master the basics with our structured beginner courses. Learn proper technique, timing, and musicality from day one.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    title: "Unlock Fluidity",
    subtitle: "Stop thinking about the steps and start feeling the music.",
    description: "Level Up Your Skills. Progress through challenges, earn XP, and unlock advanced styling. Every combo is a boss battle waiting to be conquered.",
    gradient: "from-mambo-blue to-purple-500",
  },
  {
    title: "Steal the Spotlight",
    subtitle: "Master musicality and complex partner work.",
    description: "Go Professional. Submit your videos for instructor review. Get personalized feedback and join our community of serious dancers.",
    gradient: "from-purple-500 to-pink-500",
  },
];
