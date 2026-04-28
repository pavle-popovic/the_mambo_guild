"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import {
  Layers,
  PenSquare,
  Heart,
  Coins,
  Award,
  ShoppingBag,
  Shield,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import type { ReactNode } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useTranslations } from "@/i18n/useTranslations";

const easeOut = [0.25, 0.1, 0.25, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
};

const bulletItem: Variants = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: easeOut } },
};

type Section = {
  key: string;
  icon: ReactNode;
  bulletKeys: string[];
  iconTint: string;
};

function GoldDot() {
  return (
    <span
      aria-hidden
      className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-mambo-gold landscape-phone:mt-[5px] landscape-phone:h-1 landscape-phone:w-1"
    />
  );
}

export default function CommunityGuidePage() {
  const t = useTranslations("communityGuide");

  const sections: Section[] = [
    {
      key: "rooms",
      icon: <Layers className="h-6 w-6 sm:h-7 sm:w-7 landscape-phone:h-5 landscape-phone:w-5" strokeWidth={1.6} />,
      bulletKeys: ["bullet1", "bullet2", "bullet3"],
      iconTint: "from-blue-400/25 to-purple-500/25 text-blue-200 ring-blue-300/30",
    },
    {
      key: "posting",
      icon: <PenSquare className="h-6 w-6 sm:h-7 sm:w-7 landscape-phone:h-5 landscape-phone:w-5" strokeWidth={1.6} />,
      bulletKeys: ["bullet1", "bullet2", "bullet3", "bullet4"],
      iconTint: "from-amber-300/25 to-orange-500/25 text-amber-200 ring-amber-300/30",
    },
    {
      key: "reactions",
      icon: <Heart className="h-6 w-6 sm:h-7 sm:w-7 landscape-phone:h-5 landscape-phone:w-5" strokeWidth={1.6} />,
      bulletKeys: ["bullet1", "bullet2", "bullet3"],
      iconTint: "from-rose-400/25 to-pink-500/25 text-rose-200 ring-rose-300/30",
    },
    {
      key: "claves",
      icon: <Coins className="h-6 w-6 sm:h-7 sm:w-7 landscape-phone:h-5 landscape-phone:w-5" strokeWidth={1.6} />,
      bulletKeys: ["bullet1", "bullet2", "bullet3", "bullet4"],
      iconTint: "from-yellow-300/25 to-amber-500/25 text-yellow-200 ring-yellow-300/30",
    },
    {
      key: "badges",
      icon: <Award className="h-6 w-6 sm:h-7 sm:w-7 landscape-phone:h-5 landscape-phone:w-5" strokeWidth={1.6} />,
      bulletKeys: ["bullet1", "bullet2", "bullet3", "bullet4"],
      iconTint: "from-emerald-400/25 to-teal-500/25 text-emerald-200 ring-emerald-300/30",
    },
    {
      key: "shop",
      icon: <ShoppingBag className="h-6 w-6 sm:h-7 sm:w-7 landscape-phone:h-5 landscape-phone:w-5" strokeWidth={1.6} />,
      bulletKeys: ["bullet1", "bullet2", "bullet3", "bullet4"],
      iconTint: "from-fuchsia-400/25 to-purple-500/25 text-fuchsia-200 ring-fuchsia-300/30",
    },
    {
      key: "rules",
      icon: <Shield className="h-6 w-6 sm:h-7 sm:w-7 landscape-phone:h-5 landscape-phone:w-5" strokeWidth={1.6} />,
      bulletKeys: ["bullet1", "bullet2", "bullet3", "bullet4"],
      iconTint: "from-sky-400/25 to-cyan-500/25 text-sky-200 ring-sky-300/30",
    },
  ];

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-mambo-dark text-mambo-text">
        {/* ─── Hero ─────────────────────────────────────────────────────── */}
        <section
          className="
            relative overflow-hidden
            px-5 sm:px-6 lg:px-8
            pt-24 pb-10 sm:pt-32 sm:pb-16 lg:pt-36 lg:pb-20
            portrait-phone:pt-20 portrait-phone:pb-8
            landscape-phone:pt-14 landscape-phone:pb-6 landscape-phone:px-6
          "
        >
          {/* Soft glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(252,226,5,0.10),transparent_60%)]"
          />

          <div className="relative mx-auto max-w-5xl text-center">
            <Link
              href="/community"
              className="
                inline-flex items-center gap-1.5
                text-[11px] sm:text-xs landscape-phone:text-[10px]
                tracking-[0.18em] font-semibold uppercase
                text-mambo-text/60 hover:text-mambo-gold
                transition-colors mb-4 sm:mb-6 landscape-phone:mb-3
              "
            >
              <ArrowLeft className="h-3.5 w-3.5 landscape-phone:h-3 landscape-phone:w-3" />
              {t("backToCommunity")}
            </Link>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="inline-block mb-3 sm:mb-4 landscape-phone:mb-2 px-3 py-1 text-[10px] sm:text-[11px] landscape-phone:text-[9px] tracking-[0.22em] font-bold text-mambo-gold border border-mambo-gold/30 rounded-full bg-mambo-gold/5"
            >
              {t("eyebrow")}
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
              className="
                font-extrabold tracking-tight text-mambo-text
                text-3xl sm:text-5xl lg:text-6xl
                portrait-phone:text-[2rem]
                landscape-phone:text-[1.6rem]
                leading-[1.1]
              "
            >
              {(() => {
                const tpl = t("heading");
                const accent = t("headingAccent");
                const parts = tpl.split("{accent}");
                return (
                  <>
                    {parts[0]}
                    <span className="text-mambo-gold drop-shadow-md">{accent}</span>
                    {parts[1] ?? ""}
                  </>
                );
              })()}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="
                mx-auto mt-4 sm:mt-5 max-w-xl
                text-sm sm:text-base lg:text-lg
                landscape-phone:text-xs landscape-phone:mt-2
                text-mambo-text/70 leading-relaxed
              "
            >
              {t("subheading")}
            </motion.p>
          </div>
        </section>

        {/* ─── Sections grid ────────────────────────────────────────────── */}
        <section
          className="
            relative
            px-5 sm:px-6 lg:px-8
            pb-12 sm:pb-20
            landscape-phone:pb-8 landscape-phone:px-6
          "
        >
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="
              mx-auto max-w-6xl
              grid gap-4 sm:gap-5
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-2
              portrait-phone:grid-cols-1
              landscape-phone:grid-cols-2 landscape-phone:gap-3
            "
          >
            {sections.map((s) => (
              <motion.article
                key={s.key}
                variants={cardItem}
                className="
                  group relative rounded-2xl border border-white/10
                  bg-gradient-to-b from-white/[0.03] to-white/[0.01]
                  hover:border-mambo-gold/30 hover:from-white/[0.05]
                  transition-colors
                  p-5 sm:p-6 lg:p-7
                  landscape-phone:p-4 landscape-phone:rounded-xl
                "
              >
                <div className="flex items-start gap-4 landscape-phone:gap-3">
                  <div
                    className={`
                      flex-shrink-0
                      h-11 w-11 sm:h-12 sm:w-12
                      landscape-phone:h-9 landscape-phone:w-9
                      rounded-xl ring-1
                      bg-gradient-to-br ${s.iconTint}
                      flex items-center justify-center
                    `}
                  >
                    {s.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] sm:text-[11px] landscape-phone:text-[9px] tracking-[0.22em] font-bold text-mambo-gold/90">
                      {t(`${s.key}.eyebrow`)}
                    </div>
                    <h2
                      className="
                        mt-1 font-extrabold tracking-tight text-white
                        text-lg sm:text-xl lg:text-2xl
                        landscape-phone:text-base
                        leading-snug
                      "
                    >
                      {t(`${s.key}.title`)}
                    </h2>
                  </div>
                </div>

                <p
                  className="
                    mt-3 sm:mt-4 landscape-phone:mt-2
                    text-[13px] sm:text-sm lg:text-[15px]
                    landscape-phone:text-[11px]
                    text-mambo-text/75 leading-relaxed
                  "
                >
                  {t(`${s.key}.body`)}
                </p>

                <motion.ul
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  className="
                    mt-3 sm:mt-4 landscape-phone:mt-2
                    space-y-1.5 sm:space-y-2
                    landscape-phone:space-y-1
                  "
                >
                  {s.bulletKeys.map((b) => (
                    <motion.li
                      key={b}
                      variants={bulletItem}
                      className="
                        flex items-start gap-2.5
                        text-[13px] sm:text-sm
                        landscape-phone:text-[11px] landscape-phone:gap-2
                        text-mambo-text/85 leading-snug
                      "
                    >
                      <GoldDot />
                      <span>{t(`${s.key}.${b}`)}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.article>
            ))}
          </motion.div>
        </section>

        {/* ─── Closing CTA ──────────────────────────────────────────────── */}
        <section
          className="
            px-5 sm:px-6 lg:px-8
            pb-20 sm:pb-28
            landscape-phone:pb-10 landscape-phone:px-6
          "
        >
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="
              relative mx-auto max-w-4xl overflow-hidden
              rounded-3xl border border-mambo-gold/25
              bg-gradient-to-b from-black/60 to-mambo-dark
              px-6 py-10 sm:py-14 lg:py-16
              text-center
              landscape-phone:py-8 landscape-phone:rounded-2xl
            "
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(252,226,5,0.18),transparent_60%)]"
            />
            <div className="relative">
              <h3
                className="
                  font-extrabold tracking-tight text-mambo-text
                  text-2xl sm:text-4xl lg:text-5xl
                  landscape-phone:text-xl
                "
              >
                {t("ctaTitle")}
              </h3>
              <p
                className="
                  mt-3 sm:mt-4 landscape-phone:mt-2
                  mx-auto max-w-xl
                  text-sm sm:text-base lg:text-lg landscape-phone:text-xs
                  text-mambo-text/75
                "
              >
                {t("ctaBody")}
              </p>

              <div
                className="
                  mt-6 sm:mt-8 landscape-phone:mt-5
                  flex flex-col sm:flex-row items-center justify-center
                  gap-3 sm:gap-3
                  landscape-phone:flex-row
                "
              >
                <Link
                  href="/community"
                  className="
                    w-full sm:w-auto
                    inline-flex items-center justify-center gap-2
                    bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)]
                    text-black font-extrabold
                    py-3 px-6 sm:py-3.5 sm:px-7
                    landscape-phone:py-2 landscape-phone:px-4 landscape-phone:text-sm
                    rounded-full text-sm sm:text-base tracking-wide
                    shadow-[0_0_22px_rgba(252,226,5,0.35)]
                    ring-2 ring-amber-400/50
                    active:scale-[0.97] transition-all hover:brightness-110
                  "
                >
                  {t("ctaPrimary")}
                  <ArrowRight className="h-4 w-4 landscape-phone:h-3.5 landscape-phone:w-3.5" />
                </Link>
                <Link
                  href="/shop"
                  className="
                    w-full sm:w-auto
                    inline-flex items-center justify-center gap-2
                    bg-white/5 border border-white/15
                    hover:bg-white/10 hover:border-mambo-gold/40
                    text-mambo-text font-bold
                    py-3 px-6 sm:py-3.5 sm:px-7
                    landscape-phone:py-2 landscape-phone:px-4 landscape-phone:text-sm
                    rounded-full text-sm sm:text-base tracking-wide
                    active:scale-[0.97] transition-all
                  "
                >
                  {t("ctaSecondary")}
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
