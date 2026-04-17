"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";

const easeOut = [0.25, 0.1, 0.25, 1] as const;

const fadeIn: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
};

const fadeLeft: Variants = {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: easeOut } },
};

const stagger: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const bullet: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easeOut } },
};

function CheckIcon() {
    return (
        <svg
            className="h-4 w-4 shrink-0 text-mambo-gold landscape-phone:!h-3 landscape-phone:!w-3"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
        >
            <path
                fillRule="evenodd"
                d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.41 0l-3.5-3.5a1 1 0 111.41-1.42L8.5 12.09l6.795-6.8a1 1 0 011.41 0z"
                clipRule="evenodd"
            />
        </svg>
    );
}

type Credential = { key: string; text: ReactNode };

const credentials: Credential[] = [
    {
        key: "champion",
        text: (
            <>
                <span className="text-mambo-gold">2x European Champion</span>
            </>
        ),
    },
    {
        key: "years",
        text: (
            <>
                <span className="text-mambo-gold">10 years</span> dancing
                <span className="opacity-40"> · </span>
                <span className="text-mambo-gold">7 years</span> teaching
            </>
        ),
    },
    {
        key: "cert",
        text: (
            <>
                Certified in <span className="text-mambo-gold">Learning Experience Design</span>
                {" & "}
                <span className="text-mambo-gold">Gamification</span>
            </>
        ),
    },
    {
        key: "cities",
        text: (
            <>
                Teaching in <span className="text-mambo-gold">London</span>
                <span className="opacity-40"> · </span>
                <span className="text-mambo-gold">Brussels</span>
                <span className="opacity-40"> · </span>
                <span className="text-mambo-gold">Rome</span>
            </>
        ),
    },
    {
        key: "list",
        text: (
            <>
                <span className="text-mambo-gold">1,000+</span> dancers on the early-access list
            </>
        ),
    },
];

export default function FounderAuthorityStrip() {
    return (
        <section className="relative bg-mambo-dark py-14 px-5 sm:py-20 sm:px-8 lg:py-24 landscape-phone:!py-10 landscape-phone:!px-5 overflow-hidden">
            {/* Brass radial glow background */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                    background:
                        "radial-gradient(ellipse 60% 80% at center, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0) 60%)",
                }}
            />
            {/* Top + bottom hairlines */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent"
            />

            <motion.div
                className="relative mx-auto max-w-6xl"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={stagger}
            >
                <div
                    className="
                        flex flex-col items-center gap-7
                        rounded-3xl border border-white/10
                        bg-gradient-to-b from-white/[0.04] to-white/[0.01]
                        p-4 shadow-[0_0_60px_rgba(212,175,55,0.08)] backdrop-blur-sm
                        sm:p-10
                        lg:flex-row lg:items-center lg:gap-12 lg:p-12
                        landscape-phone:!flex-row landscape-phone:!items-center landscape-phone:!gap-5 landscape-phone:!p-5
                    "
                >
                    {/* Portrait */}
                    <motion.div variants={fadeLeft} className="relative shrink-0">
                        {/* Brass glow halo */}
                        <div
                            aria-hidden
                            className="absolute -inset-1.5 rounded-full bg-[conic-gradient(from_180deg,#FCE205,#D4AF37,#B8860B,#D4AF37,#FCE205)] opacity-70 blur-md"
                        />
                        <div
                            className="
                                relative overflow-hidden rounded-full ring-2 ring-[#D4AF37]/80
                                h-36 w-36
                                sm:h-44 sm:w-44
                                lg:h-52 lg:w-52
                                landscape-phone:!h-24 landscape-phone:!w-24
                            "
                        >
                            <Image
                                src="/assets/Personal_Pic.jpg"
                                alt="Pavle Popovic — Founder of The Mambo Guild"
                                fill
                                sizes="(min-width: 1024px) 208px, (min-width: 640px) 176px, 144px"
                                className="object-cover"
                                style={{ objectPosition: "center 25%" }}
                            />
                            {/* subtle inner vignette */}
                            <div
                                aria-hidden
                                className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
                            />
                        </div>
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 text-center lg:text-left landscape-phone:!text-left">
                        <motion.p
                            variants={fadeIn}
                            className="
                                mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-mambo-gold/90
                                landscape-phone:!text-[9px] landscape-phone:!mb-1 landscape-phone:!tracking-[0.22em]
                            "
                        >
                            The Founder
                        </motion.p>

                        <motion.h2
                            variants={fadeIn}
                            className="
                                font-serif italic font-bold text-white leading-[1.1] whitespace-nowrap
                                text-[clamp(1.3rem,5.8vw,3.25rem)]
                                sm:text-[2.75rem] lg:text-[3.25rem]
                                landscape-phone:!text-2xl landscape-phone:!leading-tight
                            "
                        >
                            Built by a <span className="text-mambo-gold">dancer</span>, not a studio.
                        </motion.h2>

                        <motion.p
                            variants={fadeIn}
                            className="
                                mt-2 text-sm text-white/60
                                landscape-phone:!text-xs landscape-phone:!mt-1
                            "
                        >
                            — Pavle Popovic, Founder
                        </motion.p>

                        {/* Credentials */}
                        <motion.ul
                            variants={stagger}
                            className="
                                mt-6 grid gap-3 text-left
                                grid-cols-1 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3
                                lg:mt-7
                                landscape-phone:!mt-3 landscape-phone:!grid-cols-2
                                landscape-phone:!gap-x-4 landscape-phone:!gap-y-1.5
                            "
                        >
                            {credentials.map((c) => (
                                <motion.li
                                    key={c.key}
                                    variants={bullet}
                                    className="
                                        flex items-start gap-2.5 text-white/85
                                        text-sm sm:text-[0.95rem]
                                        landscape-phone:!text-[11px] landscape-phone:!gap-2
                                    "
                                >
                                    <span className="mt-[3px] landscape-phone:!mt-[1px]">
                                        <CheckIcon />
                                    </span>
                                    <span>{c.text}</span>
                                </motion.li>
                            ))}
                        </motion.ul>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
