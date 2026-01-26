"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaCheck, FaTimes, FaCrown } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { HoverCard, Clickable, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import AuthPromptModal from "@/components/AuthPromptModal";

const ADVANCED_PRICE_ID = "price_1SmeXA1a6FlufVwfOLg5SMcc";
const PERFORMER_PRICE_ID = "price_1SmeZa1a6FlufVwfrJCJrv94";

const plans = [
  {
    id: "guest-list",
    name: "Guest List",
    price: "Free",
    period: "Forever",
    description: "Get started with the basics",
    features: [
      { text: "1 Free Course Access", included: true },
      { text: "1 Free Workshop / Month", included: true },
      { text: "Advanced Styling", included: false },
      { text: "Instructor Feedback", included: false },
    ],
    cta: "Create Free Account",
    highlighted: false,
    priceId: null,
  },
  {
    id: "full-access",
    name: "Full Access",
    price: "€29",
    period: "/mo",
    description: "Unlock all courses",
    features: [
      { text: "Unlimited Course Access", included: true },
      { text: "New Workshops Weekly", included: true },
      { text: "Advanced Partnerwork", included: true },
      { text: "Community Challenges", included: true },
    ],
    cta: "Start 7-Day Free Trial",
    highlighted: true,
    priceId: ADVANCED_PRICE_ID,
    // Add custom styling for visual emphasis
    customStyle: "border border-mambo-gold/50 shadow-[0_0_30px_rgba(251,191,36,0.15)]",
    cardBg: "bg-gradient-to-b from-[#1a1a1a] to-black"
  },
  {
    id: "performer",
    name: "Performer",
    price: "€49",
    period: "/mo",
    description: "For serious students",
    features: [
      { text: "Everything in Advanced", included: true },
      { text: "1 Video Review / Month", included: true },
      { text: "Direct Chat with Instructors", included: true },
      { text: "Certified Badge on Profile", included: true },
      {
        text: "Pro Mastery Features Coming Soon: Practice Playlist Builder, DJ Booth, Smart Looper, Legends Vault, Precision Player",
        included: true,
        isComingSoon: true
      },
    ],
    cta: "Get Performer Access",
    highlighted: false,
    priceId: PERFORMER_PRICE_ID,
  },
];

export default function LandingPricingSection() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string>(""); // Initialize as empty string to avoid null === null match
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSubscribe = async (priceId: string | null, planId: string) => {
    // Free plan - redirect to register
    if (!priceId) {
      router.push("/register");
      return;
    }

    // Not logged in - show auth modal
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setLoading(priceId);

      // Refresh user data to ensure token is valid
      try {
        await refreshUser();
      } catch (refreshError) {
        console.error("Failed to refresh user:", refreshError);
        alert("Your session has expired. Please log in again.");
        router.push(`/login?redirect=/pricing`);
        setLoading("");
        return;
      }

      const successUrl = `${window.location.origin}/pricing?success=true&tier=${planId}`;
      const cancelUrl = `${window.location.origin}/pricing?canceled=true`;

      const { url } = await apiClient.createCheckoutSession(
        priceId,
        successUrl,
        cancelUrl
      );

      window.location.href = url;
    } catch (error: any) {
      console.error("Failed to create checkout session:", error);

      if (
        error.message?.includes("Could not validate credentials") ||
        error.message?.includes("401") ||
        error.message?.includes("Unauthorized")
      ) {
        alert("Your session has expired. Please log in again.");
        router.push(`/login?redirect=/pricing`);
      } else {
        alert(error.message || "Failed to start checkout. Please try again.");
      }
      setLoading("");
    }
  };

  const currentTier = user?.tier?.toLowerCase() || "rookie";

  return (
    <section className="relative py-32 px-6 bg-transparent z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className="text-4xl md:text-5xl font-bold mb-8 text-mambo-text tracking-tight font-serif italic"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Join The <span className="text-mambo-gold drop-shadow-md">Mambo Guild Now</span>
          </h2>
        </motion.div>

        {/* Pricing grid */}
        <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = currentTier === plan.id;
            const isHighlighted = plan.highlighted && !user;

            return (
              <StaggerItem key={plan.id}>
                <HoverCard>
                  <div
                    className={`relative rounded-2xl p-[2px] flex flex-col h-full transition-all duration-300 ${(isHighlighted || isCurrentPlan)
                      ? "bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 shadow-2xl shadow-yellow-900/40 md:scale-110 z-10"
                      : "bg-gray-800 scale-100"
                      }`}
                  >
                    <div
                      className={`relative rounded-2xl p-8 flex flex-col h-full transition-all duration-300 ${
                        // Use custom background if defined, otherwise dark
                        (plan as any).cardBg || "bg-[#111111]"
                        } ${!isHighlighted && !isCurrentPlan ? "border border-gray-800 hover:border-gray-700 hover:bg-[#161616]" : ""} ${(plan as any).customStyle || ""}`}
                    >
                      {/* Most Popular badge */}
                      {isHighlighted && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-mambo-gold to-orange-500 rounded-full text-xs font-bold text-black shadow-lg">
                            <FaCrown className="w-3 h-3" />
                            Most Popular
                          </div>
                        </div>
                      )}

                      {/* Current Plan Badge (if active) */}
                      {isCurrentPlan && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <div className="px-4 py-1.5 bg-mambo-blue rounded-full text-xs font-bold text-white shadow-lg">
                            Active Plan
                          </div>
                        </div>
                      )}


                      {/* Plan name */}
                      <div className="mb-4">
                        <span
                          className={`text-xs font-bold uppercase tracking-widest ${isCurrentPlan ? "text-mambo-gold" : "text-gray-500"
                            }`}
                        >
                          {plan.name}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="text-4xl font-bold mb-2 text-mambo-text tracking-tight">
                        {plan.price}
                        {plan.period !== "Forever" && (
                          <span className="text-lg text-gray-400 font-normal">
                            {plan.period}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mb-8">
                        {plan.description}
                      </div>

                      {/* Features */}
                      <ul className="text-left space-y-4 mb-8 flex-1">
                        {plan.features.map((feature, idx) => {
                          // Handle "Coming Soon" features with special styling
                          if ((feature as any).isComingSoon) {
                            return (
                              <li key={idx} className="flex gap-3 text-sm leading-relaxed text-gray-500 italic">
                                <span className="shrink-0 mt-0.5">🚧</span>
                                <span>{feature.text}</span>
                              </li>
                            );
                          }

                          return (
                            <li
                              key={idx}
                              className={`flex gap-3 text-sm leading-relaxed ${feature.included
                                ? isCurrentPlan
                                  ? "text-mambo-text font-medium"
                                  : "text-gray-300"
                                : "text-gray-500 line-through"
                                }`}
                            >
                              {feature.included ? (
                                <FaCheck
                                  className={`shrink-0 mt-0.5 ${isCurrentPlan ? "text-mambo-gold" : "text-gray-500"
                                    }`}
                                />
                              ) : (
                                <FaTimes className="shrink-0 mt-0.5" />
                              )}
                              {feature.text}
                            </li>
                          )
                        })}
                      </ul>

                      {/* CTA Button */}
                      <Clickable>
                        {isCurrentPlan && user ? (
                          <Link
                            href="/courses"
                            className="block w-full py-4 bg-gradient-to-r from-mambo-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 text-center"
                          >
                            Current Plan
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleSubscribe(plan.priceId, plan.id)}
                            disabled={loading === plan.priceId}
                            className={`block w-full py-4 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isHighlighted
                              ? "bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-orange-400 text-black shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/30"
                              : "border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 text-mambo-text shadow-md"
                              }`}
                          >
                            {loading === plan.priceId ? "Loading..." : plan.cta}
                          </button>
                        )}
                      </Clickable>
                    </div>
                  </div>
                </HoverCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center text-gray-500 text-sm"
        >
          <p>
            Secure payment powered by Stripe.{" "}
            <Link href="/pricing" className="text-mambo-blue hover:underline">
              View full pricing details
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        type="login"
      />
    </section>
  );
}
