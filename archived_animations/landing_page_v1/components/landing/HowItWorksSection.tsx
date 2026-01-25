"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const steps = [
  {
    step: "01", // Kept for key/id but not displayed
    title: "Learn at Your Pace",
    description:
      "Access structured courses anytime, anywhere. Each lesson builds on the last, so you never feel lost. Track your progress and earn XP as you go.",
    image: "/assets/Course_page.png",
    alt: "Course page showing structured lessons",
  },
  {
    step: "02",
    title: "Connect with the Community",
    description:
      "Share your progress, get inspired by others, and participate in challenges. Our community keeps you motivated and accountable.",
    image: "/assets/Com_page.png",
    alt: "Community page with dancer posts",
  },
  {
    step: "03",
    title: "Track Your Growth",
    description:
      "See your journey visualized. From XP and streaks to badges and achievements, every practice session counts toward your dancer profile.",
    image: "/assets/Profile_page.png",
    alt: "Profile page showing progress stats",
  },
];

const fadeInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

export default function HowItWorksSection() {
  return (
    <section className="relative py-32 px-6 bg-mambo-dark z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2
            className="text-4xl md:text-5xl font-bold mb-6 text-mambo-text tracking-tight font-serif italic"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            How It{" "}
            <span className="text-mambo-gold drop-shadow-md">
              Works
            </span>
          </h2>
        </motion.div>

        {/* Zig-zag steps */}
        <div className="space-y-24 lg:space-y-32">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={step.step}
                className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  } gap-12 lg:gap-20 items-center`}
              >
                {/* Text content */}
                <motion.div
                  variants={isEven ? fadeInLeft : fadeInRight}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="flex-1 max-w-xl text-center lg:text-left"
                >
                  {/* Step number REMOVED as requested */}

                  {/* Title with Gold Highlights */}
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                    {step.title === "Learn at Your Pace" ? (
                      <>Learn at <span className="text-mambo-gold">Your Pace</span></>
                    ) : step.title === "Connect with the Community" ? (
                      <>Connect with the <span className="text-mambo-gold">Community</span></>
                    ) : step.title === "Track Your Growth" ? (
                      <><span className="text-mambo-gold">Track</span> Your Growth</>
                    ) : (
                      step.title
                    )}
                  </h3>

                  {/* Description */}
                  <p className="text-mambo-gold/90 text-lg leading-relaxed font-medium tracking-wide">
                    {step.description}
                  </p>
                </motion.div>

                {/* Image */}
                <motion.div
                  variants={isEven ? fadeInRight : fadeInLeft}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="flex-1 w-full max-w-2xl"
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-mambo-blue/20 to-purple-500/20 rounded-2xl blur-xl opacity-50 transition-opacity duration-500 group-hover:opacity-75" />

                    <div className="relative">
                      <Image
                        src={step.image}
                        alt={step.alt}
                        width={800}
                        height={500}
                        className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-mambo-dark/50 to-transparent pointer-events-none" />
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
