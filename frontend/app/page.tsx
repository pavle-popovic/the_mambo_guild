"use client";

import { useState, useEffect } from "react";
import {
    NewHero,
    TrendingModulesSection,
    SkillTreeTeaser,
    ReleaseScheduleSection,
    TestimonialsSection,
} from "@/components/landing";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
    const { user } = useAuth();
    const [showStickyCta, setShowStickyCta] = useState(false);

    // Show sticky CTA after scrolling past the hero
    useEffect(() => {
        const handleScroll = () => {
            setShowStickyCta(window.scrollY > window.innerHeight * 0.5);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            {/* Navigation Bar */}
            <NavBar user={user || undefined} />

            <main className="min-h-screen text-white selection:bg-[#39FF14] selection:text-black overflow-x-hidden relative">
                {/* Hero Section - with chatbot included */}
                <section className="relative min-h-screen z-10">
                    <NewHero />
                </section>

                {/* Trending Modules Carousel */}
                <section className="relative z-10">
                    <TrendingModulesSection />
                </section>

                {/* Skill Tree / Gamification Teaser */}
                <section className="relative z-10">
                    <SkillTreeTeaser />
                </section>

                {/* Release Calendar / Upcoming Drops */}
                <section className="relative z-10">
                    <ReleaseScheduleSection />
                </section>

                {/* Testimonials */}
                <section className="relative z-10">
                    <TestimonialsSection />
                </section>

                {/* Footer — add bottom padding on mobile for sticky CTA */}
                <div className="pb-16">
                    <Footer />
                </div>
            </main>

            {/* Sticky bottom CTA — appears after scrolling past hero */}
            {!user && (
                <div
                    className={`mobile-sticky-cta fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ${
                        showStickyCta ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                    }`}
                >
                    <div className="bg-black/60 backdrop-blur-xl border-t border-white/15 px-4 py-3 sm:py-4 flex items-center justify-center shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
                        <Link
                            href="/register"
                            className="w-full max-w-md bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] hover:bg-[linear-gradient(135deg,#FCE205_20%,#D4AF37_100%)] text-black font-extrabold py-3.5 sm:py-4 px-8 rounded-full text-base sm:text-lg active:scale-[0.97] transition-all text-center shadow-[0_0_25px_rgba(252,226,5,0.4),0_0_50px_rgba(212,175,55,0.2)] ring-2 ring-amber-400/50 tracking-wide"
                        >
                            Get Your 7-Day Free Trial!
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
