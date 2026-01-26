"use client";

import { NewHero, ConstellationSection, ValuePropsSection, HowItWorksSection, TestimonialsSection, LandingPricingSection, MaestroSection, CourseExplorerSection } from "@/components/landing";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function HomePage() {
    return (
        <>
            {/* Navigation Bar */}
            <NavBar />

            <main className="min-h-screen text-white selection:bg-[#39FF14] selection:text-black overflow-x-hidden relative">
                {/* Hero Section */}
                <section className="relative min-h-screen z-10">
                    <NewHero />
                </section>

                {/* Value Props */}
                <section className="relative z-10">
                    <ValuePropsSection />
                </section>

                {/* Course Explorer */}
                <section className="relative z-10">
                    <CourseExplorerSection />
                </section>

                {/* Skill Tree / Constellation */}
                <section className="relative z-10">
                    <ConstellationSection />
                </section>

                {/* How It Works */}
                <section className="relative z-10">
                    <HowItWorksSection />
                </section>

                {/* Maestro Section */}
                <section className="relative z-10">
                    <MaestroSection />
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
