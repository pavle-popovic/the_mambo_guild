"use client";

import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import {
  NewHero,
  ValuePropsSection,
  HowItWorksSection,
  TestimonialsSection,
  LandingPricingSection,
  MaestroSection,
  CourseExplorerSection,
  ConstellationSection,
} from "@/components/landing";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-transparent">
      {/* Fixed Navigation */}
      <NavBar user={user || undefined} />

      {/* New Hero Section */}
      <NewHero />

      {/* Constellation Roadmap - Feature Highlight (Second Section) */}
      <ConstellationSection />

      {/* Value Props - Rule of Three */}
      <ValuePropsSection />

      {/* Course Explorer - Netflix Style */}
      <CourseExplorerSection />

      {/* How It Works - Zig-Zag Layout */}
      <HowItWorksSection />

      {/* Testimonials Carousel */}
      <TestimonialsSection />

      {/* Pricing Section */}
      <LandingPricingSection />

      {/* Footer */}
      <Footer className="relative z-10" />
    </div>
  );
}
