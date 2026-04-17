"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type PillarImageData = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

type Pillar = {
  eyebrow: string;
  title: ReactNode;
  body: string;
  bullets: string[];
  images: PillarImageData[]; // 1 image, or 2 stacked (diptych)
};

const gold = "text-mambo-gold";

const pillars: Pillar[] = [
  {
    // 1 — Courses & all the content
    eyebrow: "COURSES & CONTENT",
    title: (
      <>
        A full <span className={gold}>dance school</span>, unlocked on day one
      </>
    ),
    body:
      "Courses, choreographies, the complete history of salsa, the science of training — every piece built to move you forward. No drip-feed, no upsell: everything explained, from your first basic step to pro-level choreos.",
    bullets: [
      "300+ classes, beginner → pro",
      "Full choreographies broken down step by step",
      "History of Salsa — 20 modules of origins & culture",
      "Science of Effective Training — 18 modules",
      "Technique deep-dives, styling, musicality, partnering",
    ],
    images: [
      {
        src: "/assets/howitworks/Image1Courses.png",
        alt: "Course catalog showing lessons, choreographies and topic deep-dives",
        width: 1572,
        height: 767,
      },
    ],
  },
  {
    // 2 — Video player: mirrored + back view + all the features
    eyebrow: "THE VIDEO PLAYER",
    title: (
      <>
        The <span className={gold}>practice room</span> pros have been waiting for
      </>
    ),
    body:
      "Every frame, every speed, every angle. Mirrored for zero guessing. Back view for that live-class vibe. 13 languages. Built for obsessive repetition — the way motor learning actually works.",
    bullets: [
      "Mirrored view — zero guessing which side is which",
      "Back view for that live-class “follow me” feel",
      "13 languages of captions + narration",
      "Speed controls (0.25× → 2×) + frame-by-frame",
      "A/B loop — drill one 2-second bar forever",
      "Summary notes + quizzes after every lesson",
      "Course navigation inside the player",
    ],
    images: [
      {
        src: "/assets/howitworks/Image2VideoPlayerMirrored.png",
        alt: "Lesson player in mirrored view with speed, captions and A/B loop controls",
        width: 1897,
        height: 851,
        caption: "MIRRORED VIEW",
      },
      {
        src: "/assets/howitworks/Image3VideoPlayerBackview.png",
        alt: "Lesson player in back view for live-class follow-along practice",
        width: 1150,
        height: 535,
        caption: "BACK VIEW",
      },
    ],
  },
  {
    // 3 — Skill tree, everything structured from basic to pro
    eyebrow: "THE SKILL TREE",
    title: (
      <>
        Everything structured from <span className={gold}>basic</span> to{" "}
        <span className={gold}>pro</span>
      </>
    ),
    body:
      "A video-game tech tree for your dancing. Every technique isolated. Every skill in the right order. You always know exactly what to drill next — and you see yourself leveling up.",
    bullets: [
      "Constellation-style roadmap from first step to pro choreo",
      "Built technique-by-technique, prerequisites enforced",
      "Unlocks as you complete lessons and earn XP",
      "Never guess what to drill next",
    ],
    images: [
      {
        src: "/assets/howitworks/Image4SkillTree.png",
        alt: "Constellation skill tree showing connected unlockable modules",
        width: 846,
        height: 762,
      },
    ],
  },
  {
    // 4 — Community, post videos, don't dance alone
    eyebrow: "THE COMMUNITY",
    title: (
      <>
        Post your videos. <span className={gold}>Don&apos;t dance alone.</span>
      </>
    ),
    body:
      "Share your progress, get real feedback, ask questions, help others. A community of dancers who actually train — not another comment section full of ghosts.",
    bullets: [
      "The Stage — post progress videos, get reactions & comments",
      "The Lab — ask & answer technique questions",
      "Hype or Coach feedback modes",
      "Earn 38 badges (Bronze → Silver → Gold → Diamond)",
      "Weekly, monthly and all-time leaderboards",
    ],
    images: [
      {
        src: "/assets/howitworks/Image5Community.png",
        alt: "Community feed with dancer posts, reactions and comments",
        width: 1653,
        height: 851,
      },
    ],
  },
  {
    // 5 — VIP 1-to-1 coaching + private group
    eyebrow: "VIP — 1-TO-1 COACHING & PRIVATE GROUP",
    title: (
      <>
        Train <span className={gold}>directly</span> with the Maestro
      </>
    ),
    body:
      "When you&apos;re serious, Guild Master unlocks the inner circle — personal 1-on-1 video coaching and weekly live Roundtable calls with the Maestro and fellow obsessives. The kind of access that used to cost $200/hour in person.",
    bullets: [
      "Monthly 1-on-1 video coaching with personal feedback",
      "Weekly live Roundtable calls on Zoom — private group",
      "DJ Booth — isolated stems from classic tracks",
      "The Vault — every past Roundtable recording",
    ],
    images: [
      {
        src: "/assets/howitworks/Image6Vip1to1Coaching.png",
        alt: "Guild Master VIP hub — 1-on-1 coaching, Roundtable calls and private group",
        width: 1147,
        height: 717,
      },
    ],
  },
];

const easeOut = [0.25, 0.1, 0.25, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};
const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easeOut } },
};
const fadeRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easeOut } },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};
const bulletItem: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: easeOut } },
};

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="h-4 w-4 flex-shrink-0 text-mambo-gold mt-[3px] landscape-phone:h-3 landscape-phone:w-3 landscape-phone:mt-[2px]"
    >
      <path
        fill="currentColor"
        d="M6.173 11.414 2.759 8l1.06-1.06 2.354 2.353 5.768-5.768 1.06 1.061z"
      />
    </svg>
  );
}

function PillarImage({
  src,
  alt,
  width,
  height,
  caption,
  priority = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  priority?: boolean;
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 group">
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/25 via-yellow-500/15 to-amber-600/25 rounded-2xl blur-xl opacity-50 transition-opacity duration-500 group-hover:opacity-95 pointer-events-none" />
      <div className="relative">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-mambo-dark/40 to-transparent pointer-events-none" />
        {caption && (
          <div className="absolute top-3 left-3 landscape-phone:top-1.5 landscape-phone:left-1.5 text-[10px] sm:text-xs landscape-phone:text-[8px] tracking-[0.22em] font-bold text-black bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] px-2.5 py-1 landscape-phone:px-1.5 landscape-phone:py-0.5 rounded-full shadow-lg shadow-black/40">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}

function PillarMedia({
  images,
  priority,
}: {
  images: PillarImageData[];
  priority: boolean;
}) {
  if (images.length === 1) {
    const img = images[0];
    return (
      <PillarImage
        src={img.src}
        alt={img.alt}
        width={img.width}
        height={img.height}
        caption={img.caption}
        priority={priority}
      />
    );
  }
  // Diptych — stack the images vertically with a gap; each keeps its caption.
  return (
    <div className="flex flex-col gap-4 sm:gap-5 landscape-phone:gap-2">
      {images.map((img, i) => (
        <PillarImage
          key={img.src}
          src={img.src}
          alt={img.alt}
          width={img.width}
          height={img.height}
          caption={img.caption}
          priority={priority && i === 0}
        />
      ))}
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative py-20 px-5 sm:py-28 sm:px-6 lg:py-32 bg-mambo-dark z-10 landscape-phone:py-10 landscape-phone:px-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-14 sm:mb-20 lg:mb-24 landscape-phone:mb-8"
        >
          <div className="inline-block mb-4 px-3 py-1 text-[11px] tracking-[0.22em] font-bold text-mambo-gold border border-mambo-gold/30 rounded-full bg-mambo-gold/5">
            HOW IT WORKS
          </div>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-mambo-text tracking-tight italic landscape-phone:text-3xl"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Everything you need to{" "}
            <span className="text-mambo-gold drop-shadow-md">actually get good.</span>
          </h2>
          <p className="max-w-2xl mx-auto mt-5 text-base sm:text-lg text-mambo-text/70 leading-relaxed landscape-phone:text-sm landscape-phone:mt-3">
            Not another video dump. A complete learning environment — structured, gamified, and built around how dancers actually improve.
          </p>
        </motion.div>

        {/* Pillars */}
        <div className="space-y-20 sm:space-y-28 lg:space-y-32 landscape-phone:space-y-10">
          {pillars.map((pillar, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={pillar.eyebrow}
                className={[
                  "flex flex-col items-center gap-10 sm:gap-12 lg:gap-20",
                  isEven ? "lg:flex-row" : "lg:flex-row-reverse",
                  "landscape-phone:!flex-row landscape-phone:!gap-6 landscape-phone:!items-center",
                ].join(" ")}
              >
                {/* Text column */}
                <motion.div
                  variants={isEven ? fadeLeft : fadeRight}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="flex-1 w-full max-w-xl text-center lg:text-left landscape-phone:!text-left landscape-phone:max-w-none"
                >
                  <div className="inline-block mb-3 text-[10px] sm:text-xs tracking-[0.22em] font-bold text-mambo-gold landscape-phone:text-[9px] landscape-phone:mb-2">
                    {pillar.eyebrow}
                  </div>
                  <h3
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight tracking-tight italic landscape-phone:text-xl landscape-phone:mb-2"
                    style={{ fontFamily: '"Playfair Display", serif' }}
                  >
                    {pillar.title}
                  </h3>
                  <p className="text-base sm:text-lg text-mambo-text/80 leading-relaxed mb-6 landscape-phone:text-xs landscape-phone:mb-3 landscape-phone:leading-snug">
                    {pillar.body}
                  </p>
                  <motion.ul
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="space-y-2.5 text-left inline-block landscape-phone:space-y-1"
                  >
                    {pillar.bullets.map((b) => (
                      <motion.li
                        key={b}
                        variants={bulletItem}
                        className="flex gap-2.5 items-start text-sm sm:text-base text-mambo-text/90 landscape-phone:text-[11px] landscape-phone:gap-2"
                      >
                        <CheckIcon />
                        <span>{b}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>

                {/* Image column */}
                <motion.div
                  variants={isEven ? fadeRight : fadeLeft}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="flex-1 w-full max-w-2xl landscape-phone:!max-w-[52%]"
                >
                  <PillarMedia images={pillar.images} priority={index === 0} />
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Closing CTA strip */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-24 sm:mt-32 lg:mt-40 landscape-phone:mt-14"
        >
          <div className="relative overflow-hidden rounded-3xl border border-mambo-gold/25 bg-gradient-to-b from-black/60 to-mambo-dark px-6 py-14 sm:py-20 text-center landscape-phone:py-10 landscape-phone:rounded-2xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(252,226,5,0.18),transparent_60%)]" />
            <div className="relative">
              <h3
                className="text-3xl sm:text-5xl font-bold text-mambo-text tracking-tight italic landscape-phone:text-2xl"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                If this isn&apos;t worth{" "}
                <span className="text-mambo-gold drop-shadow-md">$1</span>, we&apos;ll buy you lunch.
              </h3>
              <p className="mt-4 max-w-xl mx-auto text-base sm:text-lg text-mambo-text/75 landscape-phone:text-sm landscape-phone:mt-2">
                Try everything above for 7 days. $1. Cancel in two clicks.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 landscape-phone:mt-5">
                <Link
                  href="/register"
                  className="w-full sm:w-auto bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] text-black font-extrabold py-3.5 px-8 rounded-full text-base sm:text-lg tracking-wide shadow-[0_0_25px_rgba(252,226,5,0.4),0_0_50px_rgba(212,175,55,0.2)] ring-2 ring-amber-400/50 active:scale-[0.97] transition-all hover:brightness-110 landscape-phone:py-2.5 landscape-phone:text-sm"
                >
                  Start 7-day $1 trial
                </Link>
                <Link
                  href="/beta?key=a7f3e2b1c9d04e6f8a2b3c4d5e1ol86j"
                  className="w-full sm:w-auto border border-mambo-gold/40 text-mambo-gold font-semibold py-3.5 px-8 rounded-full text-base sm:text-lg hover:bg-mambo-gold/10 transition-all landscape-phone:py-2.5 landscape-phone:text-sm"
                >
                  See inside first
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
