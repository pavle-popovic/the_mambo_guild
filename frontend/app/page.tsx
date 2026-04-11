"use client";

import { useState, useEffect } from "react";
import {
    NewHero,
    TrendingModulesSection,
    SkillTreeTeaser,
    TestimonialsSection,
    LandingPricingSection
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

                {/* Testimonials */}
                <section className="relative z-10">
                    <TestimonialsSection />
                </section>

                {/* Pricing */}
                <section className="relative z-10">
                    <LandingPricingSection />
                </section>

                {/* Footer — add bottom padding on mobile for sticky CTA */}
                <div className="pb-16">
                    <Footer />
                </div>
            </main>

            {/* Sticky bottom CTA — appears after scrolling past hero */}
            {!user && (
                <div
                    className={`mobile-sticky-cta fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
                        showStickyCta ? "translate-y-0" : "translate-y-full"
                    }`}
                >
                    <div className="bg-black/95 backdrop-blur-md border-t border-white/10 px-4 py-3 flex items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="bg-white hover:bg-gray-100 text-black font-extrabold py-2.5 sm:py-3 px-6 sm:px-8 rounded-full text-sm sm:text-base active:scale-95 transition-all text-center"
                        >
                            Get Your 7-Day Trial!
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
