"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useTranslations } from "@/i18n/useTranslations";

const easeOut = [0.25, 0.1, 0.25, 1] as const;

type FAQ = { q: string; a: string };

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

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
    const t = useTranslations("landing.faq");
    const [openIdx, setOpenIdx] = useState<number | null>(0);

    const faqs: FAQ[] = [
        { q: t("q1"), a: t("a1") },
        { q: t("q2"), a: t("a2") },
        { q: t("q3"), a: t("a3") },
        { q: t("q4"), a: t("a4") },
        { q: t("q5"), a: t("a5") },
    ];

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
    };
    const faqSchemaJson = JSON.stringify(faqSchema).replace(/</g, "\\u003c");

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
                        {t("eyebrow")}
                    </div>
                    <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                        {t("heading")}
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
                                    <span className="text-lg font-semibold leading-snug text-white sm:text-xl">
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
