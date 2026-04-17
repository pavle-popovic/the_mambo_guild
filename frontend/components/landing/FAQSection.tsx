"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

const easeOut = [0.25, 0.1, 0.25, 1] as const;

type FAQ = { q: string; a: string };

const faqs: FAQ[] = [
    {
        q: "What is The Mambo Guild?",
        a: "The Mambo Guild is the number 1 gamified, world-class learning management system (LMS) dedicated to Salsa On2 (New York Style Mambo). Unlike static video libraries, the Guild uses Learning Experience Design (LXD) to provide a structured, interactive roadmap. Students navigate a visual Skill Tree, get feedback from instructors and peers, and learn from over 500 classes as they master everything from foundational footwork to advanced social dancing mechanics.",
    },
    {
        q: "How is The Mambo Guild different from other online classes?",
        a: "Most online dance platforms are \"content graveyards\": hundreds of videos with no clear path. The Guild is built on Autonomy. We replace \"watch and copy\" with objective biomechanics and a structured curriculum. Features like A/B Looping, Frame-by-Frame slow motion, and a community-driven Lab for technical Q&A ensure you aren't just watching dance, you're intrinsically motivated to become a dancer.",
    },
    {
        q: "Who teaches The Mambo Guild courses?",
        a: "Courses are led by Pavle Popovic, a professional Mambo instructor and competitor. The curriculum isn't just based on personal style; it integrates the history of Mambo (based on Juliet McMains' research) and modern motor-learning science. In our teaching philosophy we value logic and clear communication methods.",
    },
    {
        q: "Can I learn salsa without a partner?",
        a: "Absolutely. In fact, the Guild's philosophy is that autonomy in solo practice is the fastest way to partner-dancing mastery. Our curriculum focuses heavily on shines (solo footwork), body mechanics, timing, and weight transfer. By building a \"solo\" foundation of balance and coordination, you become a more reliable, fluid, and confident partner when you hit the social dance floor.",
    },
    {
        q: "Does The Mambo Guild work for beginners?",
        a: "Yes. The Skill Tree was designed specifically for the \"I don't know where to start\" phase. Beginners aren't left to guess; they follow a visual constellation of lessons that unlock in a logical order. With our 7-Day Free Trial, beginners can test the waters, earn their first XP, and see the roadmap to mastery before committing.",
    },
];

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
        },
    })),
};

// Escape `<` to prevent `</script>` in content from breaking out of the tag.
// We control the source here, but the pattern is defensive and standard.
const faqSchemaJson = JSON.stringify(faqSchema).replace(/</g, "\\u003c");

function Chevron({ open }: { open: boolean }) {
    return (
        <svg
            className={`h-5 w-5 shrink-0 text-mambo-gold transition-transform duration-300 ${
                open ? "rotate-90" : ""
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
        >
            <path d="M7.05 4.55a1 1 0 011.414 0l4.243 4.243a1 1 0 010 1.414l-4.243 4.243a1 1 0 01-1.414-1.414L10.586 10 7.05 6.464a1 1 0 010-1.414z" />
        </svg>
    );
}

export default function FAQSection() {
    const [openIdx, setOpenIdx] = useState<number | null>(0);

    return (
        <section
            id="faq"
            className="relative bg-mambo-dark py-16 px-5 sm:py-24 sm:px-6 lg:py-28 overflow-hidden"
        >
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: faqSchemaJson }}
            />

            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    background:
                        "radial-gradient(ellipse 60% 70% at 50% 20%, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0) 60%)",
                }}
            />

            <div className="relative mx-auto max-w-3xl">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={fadeUp}
                    className="mb-10 text-center sm:mb-14"
                >
                    <div className="mb-4 inline-block rounded-full border border-mambo-gold/30 bg-mambo-gold/5 px-3 py-1 text-[11px] font-bold tracking-[0.22em] text-mambo-gold">
                        FAQ
                    </div>
                    <h2 className="font-serif text-3xl font-bold italic leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                        Questions dancers ask us.
                    </h2>
                </motion.div>

                <ul className="space-y-3 sm:space-y-4">
                    {faqs.map((f, idx) => {
                        const isOpen = openIdx === idx;
                        return (
                            <motion.li
                                key={f.q}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-60px" }}
                                className={`overflow-hidden rounded-2xl border transition-colors ${
                                    isOpen
                                        ? "border-mambo-gold/40 bg-white/[0.04] shadow-[0_0_40px_rgba(212,175,55,0.08)]"
                                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-answer-${idx}`}
                                    className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
                                >
                                    <span className="font-serif text-lg italic leading-snug text-white sm:text-xl">
                                        {f.q}
                                    </span>
                                    <Chevron open={isOpen} />
                                </button>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key="content"
                                            id={`faq-answer-${idx}`}
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: easeOut }}
                                            style={{ overflow: "hidden" }}
                                        >
                                            <div className="px-5 pb-5 text-[15px] leading-relaxed text-white/75 sm:px-6 sm:pb-6 sm:text-base">
                                                {f.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
