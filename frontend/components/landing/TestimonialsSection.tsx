"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { FaQuoteLeft, FaStar, FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import { Clickable } from "@/components/ui/motion";

// Placeholder testimonials for beta launch
const testimonials = [
  {
    id: 1,
    quote:
      "The structured approach finally helped me understand musicality. I went from struggling with basic steps to confidently freestyling in just 3 months.",
    name: "Maria G.",
    role: "Advanced Student",
    avatar: null,
    rating: 5,
  },
  {
    id: 2,
    quote:
      "Having real instructors review my videos changed everything. The personalized feedback accelerated my progress like nothing else.",
    name: "Carlos R.",
    role: "Guild Master Tier",
    avatar: null,
    rating: 5,
  },
  {
    id: 3,
    quote:
      "The gamification keeps me coming back. Earning XP and maintaining my streak has made practice feel like a game instead of a chore.",
    name: "Sofia L.",
    role: "6-Month Member",
    avatar: null,
    rating: 5,
  },
  {
    id: "cta",
    type: "cta",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-32 px-6 bg-mambo-dark z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl md:text-5xl font-bold mb-12 text-mambo-text tracking-tight font-serif italic"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            What Dancers <span className="text-mambo-gold drop-shadow-md">Say</span>
          </h2>

        </motion.div>

        {/* Horizontal scrolling carousel */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-mambo-dark to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-mambo-dark to-transparent z-10 pointer-events-none" />

          {/* Carousel container */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {testimonials.map((item, index) => {
              // CTA card
              if ("type" in item && item.type === "cta") {
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex-shrink-0 w-80 snap-center"
                  >
                    <GlassCard className="p-8 h-full flex flex-col items-center justify-center text-center min-h-[280px]">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-mambo-blue to-purple-500 flex items-center justify-center mb-6">
                        <FaUserCircle className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-mambo-text mb-3">
                        Be the First
                      </h3>
                      <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                        Join our beta program and share your transformation
                        story.
                      </p>
                      <Clickable>
                        <Link
                          href="/register"
                          className="px-6 py-2.5 bg-gradient-to-r from-mambo-blue to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-full text-sm transition-all shadow-lg shadow-blue-500/25"
                        >
                          Join Beta
                        </Link>
                      </Clickable>
                    </GlassCard>
                  </motion.div>
                );
              }

              // Testimonial card
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-80 snap-center"
                >
                  <GlassCard className="p-8 h-full min-h-[280px]">
                    {/* Quote icon */}
                    <FaQuoteLeft className="w-6 h-6 text-mambo-blue/50 mb-4" />

                    {/* Quote */}
                    <p className="text-gray-300 leading-relaxed mb-6 text-sm">
                      &ldquo;{item.quote}&rdquo;
                    </p>

                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(item.rating)].map((_, i) => (
                        <FaStar
                          key={i}
                          className="w-4 h-4 text-mambo-gold"
                        />
                      ))}
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mambo-blue to-purple-500 flex items-center justify-center text-white font-bold">
                        {item.name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-mambo-text text-sm">
                          {item.name}
                        </p>
                        <p className="text-gray-500 text-xs">{item.role}</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
