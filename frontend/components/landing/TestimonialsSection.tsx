"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { FaQuoteLeft, FaStar, FaUserCircle } from "react-icons/fa";
import { Clickable } from "@/components/ui/motion";
import { useTranslations } from "@/i18n/useTranslations";
import ReviewSubmitModal from "@/components/ReviewSubmitModal";

type Testimonial = {
  id: number;
  type: "testimonial";
  quote: string;
  name: string;
  role: string;
  rating: number;
};

type CtaItem = { id: "cta"; type: "cta" };

const REAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    type: "testimonial",
    quote:
      "I've been to countless festivals and classes, some of them online. This platform blows all of them out of the water. Teaching is clear and concise, no fillers. The progression system is constantly pulling you back in. I'll be a lifetime member for sure!",
    name: "Emir S.",
    role: "Dance Instructor, 10 years teaching",
    rating: 5,
  },
  {
    id: 2,
    type: "testimonial",
    quote:
      "The Salsa On2 Skill Tree is super structured but still fun, and the gamified system actually keeps you motivated. It didn't feel like just a course, it felt like being part of a community.",
    name: "Adella N.",
    role: "Vanguard Member",
    rating: 5,
  },
  {
    id: 3,
    type: "testimonial",
    quote:
      "The clearest instruction I have come across so far. Pavle's demonstrations and step-by-step instruction are excellent, and his teaching method is optimized for online learning.",
    name: "Rick P.",
    role: "Beginner Dancer",
    rating: 5,
  },
  {
    id: 4,
    type: "testimonial",
    quote:
      "What I love about The Mambo Guild is that it doesn't just throw videos at you, it actually feels like it's invested in your growth. A refreshing change from the usual 'watch and repeat' platforms.",
    name: "Dina M.",
    role: "Vanguard Member",
    rating: 5,
  },
  {
    id: 5,
    type: "testimonial",
    quote:
      "I have tried three online schools in the past 4 years prior to checking the Mambo Guild. Pavle does a great job breaking down the moves, and the mirrored view is an innovative approach. Highly recommend.",
    name: "Mustafa C.",
    role: "Vanguard Member",
    rating: 5,
  },
  {
    id: 6,
    type: "testimonial",
    quote:
      "I have been dancing casino and son cubano more than 10 years but a total newbie about On2. I accomplished Mambo 101 almost in 3 days. Thank you Pavle for building such a game for us.",
    name: "Louie T.",
    role: "Casino & Son Cubano, 10+ years",
    rating: 5,
  },
  {
    id: 7,
    type: "testimonial",
    quote:
      "The videos are high quality and so is the teaching. The modules build on each other and the skill tree is a very novel approach. One of the best sites for learning Mambo I've come across.",
    name: "Lars S.",
    role: "Mambo & Lindy Hop Dancer",
    rating: 5,
  },
  {
    id: 8,
    type: "testimonial",
    quote:
      "Well structured, helps dancers of any level. After each module you feel that you've learnt something and can put it in practice. Log in for 15 minutes and learn, practice shines, or interact with the community.",
    name: "Cati L.",
    role: "12+ Years Salsa Dancer",
    rating: 5,
  },
  {
    id: 9,
    type: "testimonial",
    quote:
      "The Mambo Guild is very high quality and Pavle's energy makes it impossible not to love the dance. It brings an international community of dancers of all levels to one place, and that's hard to find anywhere else.",
    name: "Brendan B.",
    role: "Vanguard Member",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const t = useTranslations("landing.testimonials");
  const [isPaused, setIsPaused] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const items: ReadonlyArray<Testimonial | CtaItem> = [
    ...REAL_TESTIMONIALS,
    { id: "cta", type: "cta" },
  ];

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
  const loopedItems = [...items, ...items];

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
            {loopedItems.map((item, index) => {
              // CTA card
              if (item.type === "cta") {
                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex-shrink-0 w-56 sm:w-72 md:w-80"
                  >
                    <GlassCard className="p-4 sm:p-6 h-full flex flex-col items-center justify-center text-center min-h-[160px] sm:min-h-[260px]">
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
                        <button
                          type="button"
                          onClick={() => setReviewOpen(true)}
                          className="px-4 sm:px-6 py-2 bg-[linear-gradient(135deg,rgba(59,130,246,0.25)_0%,rgba(168,85,247,0.25)_100%)] backdrop-blur-md border border-blue-400/40 hover:bg-[linear-gradient(135deg,rgba(59,130,246,0.4)_0%,rgba(168,85,247,0.4)_100%)] hover:border-purple-400/60 text-blue-100 font-bold rounded-full text-xs sm:text-sm transition-all shadow-[0_0_16px_rgba(168,85,247,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-blue-400/30"
                        >
                          {t("ctaButton")}
                        </button>
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
                  <GlassCard className="p-4 sm:p-6 h-full min-h-[160px] sm:min-h-[260px] flex flex-col">
                    {/* Quote icon */}
                    <FaQuoteLeft className="w-4 h-4 sm:w-5 sm:h-5 text-mambo-blue/50 mb-2 sm:mb-3" />

                    {/* Quote */}
                    <p className="text-gray-300 leading-relaxed mb-3 sm:mb-5 text-xs sm:text-sm line-clamp-5 sm:line-clamp-6 flex-1">
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

      <ReviewSubmitModal open={reviewOpen} onClose={() => setReviewOpen(false)} />
    </section>
  );
}
