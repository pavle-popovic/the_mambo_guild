"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { FaQuoteLeft, FaStar, FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import { Clickable } from "@/components/ui/motion";
import { useTranslations } from "@/i18n/useTranslations";
import { useAuth } from "@/contexts/AuthContext";

export default function TestimonialsSection() {
  const t = useTranslations("landing.testimonials");
  const tSubscribed = useTranslations("landing.subscribed");
  const { user } = useAuth();
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const testimonials = [
    { id: 1, type: "testimonial", quote: t("t1Quote"), name: t("t1Name"), role: t("t1Role"), avatar: null, rating: 5 },
    { id: 2, type: "testimonial", quote: t("t2Quote"), name: t("t2Name"), role: t("t2Role"), avatar: null, rating: 5 },
    { id: 3, type: "testimonial", quote: t("t3Quote"), name: t("t3Name"), role: t("t3Role"), avatar: null, rating: 5 },
    { id: "cta", type: "cta" },
  ] as const;

  // Auto-scroll carousel (same pattern as TrendingModulesSection)
  useEffect(() => {
    if (isPaused) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = scrollContainer.scrollLeft;

    const scroll = () => {
      if (!scrollContainer) return;
      scrollPosition += 0.4;
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  // Duplicate items for infinite scroll
  const items = [...testimonials, ...testimonials];

  return (
    <section className="relative py-6 sm:py-16 md:py-24 overflow-hidden bg-mambo-dark z-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-4 sm:mb-10 md:mb-14"
        >
          <h2 className="text-xl sm:text-3xl md:text-5xl font-extrabold mb-2 sm:mb-4 text-mambo-text tracking-tight">
            {t("headingPre")} <span className="text-mambo-gold drop-shadow-md">{t("headingAccent")}</span>
          </h2>
        </motion.div>

        {/* Auto-scrolling carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
        >
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-mambo-dark to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-mambo-dark to-transparent z-10 pointer-events-none" />

          {/* Scrolling container */}
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-5 overflow-x-hidden py-2"
            style={{ scrollBehavior: "auto" }}
          >
            {items.map((item, index) => {
              // CTA card
              if ("type" in item && item.type === "cta") {
                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex-shrink-0 w-56 sm:w-72 md:w-80"
                  >
                    <GlassCard className="p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center min-h-[160px] sm:min-h-[220px]">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-mambo-blue to-purple-500 flex items-center justify-center mb-3 sm:mb-5">
                        <FaUserCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <h3 className="text-sm sm:text-lg font-bold text-mambo-text mb-1.5 sm:mb-3">
                        {t("ctaTitle")}
                      </h3>
                      <p className="text-gray-400 mb-3 sm:mb-5 text-xs sm:text-sm leading-relaxed">
                        {t("ctaBody")}
                      </p>
                      <Clickable>
                        <Link
                          href={user ? "/community" : "/register"}
                          className="px-4 sm:px-6 py-2 bg-gradient-to-r from-mambo-blue to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-full text-xs sm:text-sm transition-all shadow-lg shadow-blue-500/25"
                        >
                          {user ? tSubscribed("visitCommunity") : t("ctaButton")}
                        </Link>
                      </Clickable>
                    </GlassCard>
                  </div>
                );
              }

              // Testimonial card
              return (
                <div
                  key={`${item.id}-${index}`}
                  className="flex-shrink-0 w-56 sm:w-72 md:w-80"
                >
                  <GlassCard className="p-4 sm:p-6 h-full min-h-[160px] sm:min-h-[220px]">
                    {/* Quote icon */}
                    <FaQuoteLeft className="w-4 h-4 sm:w-5 sm:h-5 text-mambo-blue/50 mb-2 sm:mb-3" />

                    {/* Quote */}
                    <p className="text-gray-300 leading-relaxed mb-3 sm:mb-5 text-xs sm:text-sm line-clamp-4 sm:line-clamp-none">
                      &ldquo;{item.quote}&rdquo;
                    </p>

                    {/* Rating */}
                    <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                      {[...Array(item.rating)].map((_, i) => (
                        <FaStar
                          key={i}
                          className="w-3 h-3 sm:w-4 sm:h-4 text-mambo-gold"
                        />
                      ))}
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-mambo-blue to-purple-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                        {item.name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-mambo-text text-xs sm:text-sm">
                          {item.name}
                        </p>
                        <p className="text-gray-500 text-[10px] sm:text-xs">{item.role}</p>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
