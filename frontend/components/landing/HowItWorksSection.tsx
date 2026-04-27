"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslations } from "@/i18n/useTranslations";
import { useAuth } from "@/contexts/AuthContext";

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
  const t = useTranslations("landing.howItWorks");
  const tSubscribed = useTranslations("landing.subscribed");
  const { user } = useAuth();
  const isSubscribed = user?.tier === "advanced" || user?.tier === "performer";

  const pillars: Pillar[] = [
    {
      eyebrow: t("pillarCoursesEyebrow"),
      title: (
        <>
          {t("pillarCoursesTitlePre")} <span className={gold}>{t("pillarCoursesTitleAccent")}</span>{t("pillarCoursesTitlePost")}
        </>
      ),
      body: t("pillarCoursesBody"),
      bullets: [
        t("pillarCoursesBullet1"),
        t("pillarCoursesBullet2"),
        t("pillarCoursesBullet3"),
        t("pillarCoursesBullet4"),
        t("pillarCoursesBullet5"),
      ],
      images: [
        {
          src: "/assets/howitworks/Image1Courses.png",
          alt: t("pillarImageAltCourses"),
          width: 1572,
          height: 767,
        },
      ],
    },
    {
      eyebrow: t("pillarPlayerEyebrow"),
      title: (
        <>
          {t("pillarPlayerTitlePre")} <span className={gold}>{t("pillarPlayerTitleAccent")}</span> {t("pillarPlayerTitlePost")}
        </>
      ),
      body: t("pillarPlayerBody"),
      bullets: [
        t("pillarPlayerBullet1"),
        t("pillarPlayerBullet2"),
        t("pillarPlayerBullet3"),
        t("pillarPlayerBullet4"),
        t("pillarPlayerBullet5"),
        t("pillarPlayerBullet6"),
        t("pillarPlayerBullet7"),
      ],
      images: [
        {
          src: "/assets/howitworks/Image2VideoPlayerMirrored.png",
          alt: t("pillarImageAltPlayerMirrored"),
          width: 1897,
          height: 851,
          caption: t("pillarPlayerMirroredCaption"),
        },
        {
          src: "/assets/howitworks/Image3VideoPlayerBackview.png",
          alt: t("pillarImageAltPlayerBack"),
          width: 1150,
          height: 535,
          caption: t("pillarPlayerBackCaption"),
        },
      ],
    },
    {
      eyebrow: t("pillarSkillTreeEyebrow"),
      title: (
        <>
          {t("pillarSkillTreeTitlePre")} <span className={gold}>{t("pillarSkillTreeTitleAccent1")}</span> {t("pillarSkillTreeTitleMid")}{" "}
          <span className={gold}>{t("pillarSkillTreeTitleAccent2")}</span>
        </>
      ),
      body: t("pillarSkillTreeBody"),
      bullets: [
        t("pillarSkillTreeBullet1"),
        t("pillarSkillTreeBullet2"),
        t("pillarSkillTreeBullet3"),
        t("pillarSkillTreeBullet4"),
      ],
      images: [
        {
          src: "/assets/howitworks/Image4SkillTree.png",
          alt: t("pillarImageAltSkillTree"),
          width: 846,
          height: 762,
        },
      ],
    },
    {
      eyebrow: t("pillarCommunityEyebrow"),
      title: (
        <>
          {t("pillarCommunityTitlePre")} <span className={gold}>{t("pillarCommunityTitleAccent")}</span>
        </>
      ),
      body: t("pillarCommunityBody"),
      bullets: [
        t("pillarCommunityBullet1"),
        t("pillarCommunityBullet2"),
        t("pillarCommunityBullet3"),
        t("pillarCommunityBullet4"),
        t("pillarCommunityBullet5"),
      ],
      images: [
        {
          src: "/assets/howitworks/Image5Community.png",
          alt: t("pillarImageAltCommunity"),
          width: 1653,
          height: 851,
          caption: t("pillarCommunityFeedCaption"),
        },
        {
          src: "/assets/howitworks/Image7ProfileShowcase.png",
          alt: t("pillarImageAltCommunityProfile"),
          width: 1448,
          height: 745,
          caption: t("pillarCommunityProfileCaption"),
        },
      ],
    },
    {
      eyebrow: t("pillarVipEyebrow"),
      title: (
        <>
          {t("pillarVipTitlePre")} <span className={gold}>{t("pillarVipTitleAccent")}</span> {t("pillarVipTitlePost")}
        </>
      ),
      body: t("pillarVipBody"),
      bullets: [
        t("pillarVipBullet1"),
        t("pillarVipBullet2"),
        t("pillarVipBullet3"),
        t("pillarVipBullet4"),
      ],
      images: [
        {
          src: "/assets/howitworks/Image6Vip1to1Coaching.png",
          alt: t("pillarImageAltVip"),
          width: 1147,
          height: 717,
        },
      ],
    },
  ];

  return (
    <section
      id="how-it-works"
      className="relative py-14 px-5 sm:py-28 sm:px-6 lg:py-32 bg-mambo-dark z-10 landscape-phone:py-10 landscape-phone:px-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-10 sm:mb-20 lg:mb-24 landscape-phone:mb-8"
        >
          <div className="inline-block mb-4 px-3 py-1 text-[11px] tracking-[0.22em] font-bold text-mambo-gold border border-mambo-gold/30 rounded-full bg-mambo-gold/5">
            {t("eyebrow")}
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-mambo-text tracking-tight landscape-phone:text-3xl">
            {t("headingPre")}{" "}
            <span className="text-mambo-gold drop-shadow-md">{t("headingAccent")}</span>
          </h2>
          <p className="max-w-2xl mx-auto mt-5 text-base sm:text-lg text-mambo-text/70 leading-relaxed landscape-phone:text-sm landscape-phone:mt-3">
            {t("subheading")}
          </p>
        </motion.div>

        {/* Pillars */}
        <div className="space-y-14 sm:space-y-28 lg:space-y-32 landscape-phone:space-y-10">
          {pillars.map((pillar, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={pillar.eyebrow}
                className={[
                  "flex flex-col-reverse items-center gap-7 sm:gap-12 lg:gap-20",
                  isEven
                    ? "lg:flex-row landscape-phone:!flex-row"
                    : "lg:flex-row-reverse landscape-phone:!flex-row-reverse",
                  "landscape-phone:!gap-6 landscape-phone:!items-center",
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
                  <div className="inline-block mb-2 sm:mb-3 text-[10px] sm:text-xs tracking-[0.22em] font-bold text-mambo-gold landscape-phone:text-[9px] landscape-phone:mb-2">
                    {pillar.eyebrow}
                  </div>
                  <h3 className="text-[1.7rem] sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 sm:mb-5 leading-[1.15] sm:leading-tight tracking-tight landscape-phone:text-xl landscape-phone:mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-[14px] sm:text-lg text-mambo-text/75 leading-snug sm:leading-relaxed mb-4 sm:mb-6 landscape-phone:text-xs landscape-phone:mb-3 landscape-phone:leading-snug">
                    {pillar.body}
                  </p>
                  <motion.ul
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="space-y-1.5 sm:space-y-2.5 text-left inline-block landscape-phone:space-y-1"
                  >
                    {pillar.bullets.map((b) => (
                      <motion.li
                        key={b}
                        variants={bulletItem}
                        className="flex gap-2 sm:gap-2.5 items-start text-[13px] sm:text-base text-mambo-text/90 landscape-phone:text-[11px] landscape-phone:gap-2"
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
              <h3 className="text-3xl sm:text-5xl font-extrabold text-mambo-text tracking-tight landscape-phone:text-2xl">
                {t("closingTitlePre")} <span className="text-mambo-gold drop-shadow-md">{t("closingTitleAccent")}</span>
              </h3>
              <p className="mt-4 max-w-xl mx-auto text-base sm:text-lg text-mambo-text/75 landscape-phone:text-sm landscape-phone:mt-2">
                {t("closingBody")}
              </p>
              <div className="mt-8 flex items-center justify-center landscape-phone:mt-5">
                {isSubscribed ? (
                  <div className="flex flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                    <Link
                      href="/courses"
                      className="flex-1 sm:flex-initial bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] text-black font-extrabold py-3.5 px-4 sm:px-7 rounded-full text-sm sm:text-base tracking-wide shadow-[0_0_20px_rgba(252,226,5,0.35)] ring-2 ring-amber-400/50 active:scale-[0.97] transition-all hover:brightness-110 landscape-phone:py-2.5 landscape-phone:text-sm text-center whitespace-nowrap"
                    >
                      {tSubscribed("continueLearning")}
                    </Link>
                    <Link
                      href="/community"
                      className="flex-1 sm:flex-initial bg-[linear-gradient(135deg,rgba(99,102,241,0.15)_0%,rgba(139,92,246,0.15)_100%)] backdrop-blur-md border border-indigo-400/30 hover:bg-[linear-gradient(135deg,rgba(99,102,241,0.25)_0%,rgba(139,92,246,0.25)_100%)] hover:border-indigo-400/60 text-indigo-200 font-extrabold py-3.5 px-4 sm:px-7 rounded-full text-sm sm:text-base tracking-wide shadow-[0_0_20px_rgba(99,102,241,0.25),inset_0_1px_0_rgba(255,255,255,0.1)] ring-1 ring-indigo-400/20 active:scale-[0.97] transition-all landscape-phone:py-2.5 landscape-phone:text-sm text-center whitespace-nowrap"
                    >
                      {tSubscribed("shareProgress")}
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/register"
                    className="w-full sm:w-auto bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] text-black font-extrabold py-3.5 px-8 rounded-full text-base sm:text-lg tracking-wide shadow-[0_0_25px_rgba(252,226,5,0.4),0_0_50px_rgba(212,175,55,0.2)] ring-2 ring-amber-400/50 active:scale-[0.97] transition-all hover:brightness-110 landscape-phone:py-2.5 landscape-phone:text-sm text-center"
                  >
                    {t("closingCta")}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
