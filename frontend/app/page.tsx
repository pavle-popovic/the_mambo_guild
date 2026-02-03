"use client";

import { 
    NewHero, 
    TrendingModulesSection, 
    SkillTreeTeaser, 
    TestimonialsSection, 
    LandingPricingSection 
} from "@/components/landing";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
    const { user } = useAuth();

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

                {/* Footer */}
                <Footer />
            </main>
        </>
    );
}
