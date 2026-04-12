"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { FaCheck, FaTimes, FaCrown } from "react-icons/fa";
import { FadeIn, StaggerContainer, StaggerItem, HoverCard, Clickable } from "@/components/ui/motion";
import AuthPromptModal from "@/components/AuthPromptModal";
import { toast } from "sonner";

// Stripe Price IDs
const ADVANCED_PRICE_ID = "price_1TKKp51a6FlufVwfYgvr192X";
const PERFORMER_PRICE_ID = "price_1TKKwC1a6FlufVwfVmE6uHml";

function PricingPageContent() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Handle success/cancel redirects from Stripe
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      if (user) {
        window.location.href = "/courses";
      }
    } else if (canceled === "true") {
      console.log("Payment canceled");
    }
  }, [searchParams, user]);

  const handleSubscribe = async (priceId: string, tierName: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setLoading(priceId);

      try {
        await refreshUser();
      } catch (refreshError) {
        console.error("Failed to refresh user:", refreshError);
        toast.error("Your session has expired. Please log in again.");
        router.push(`/login?redirect=/pricing`);
        setLoading(null);
        return;
      }

      const successUrl = `${window.location.origin}/pricing?success=true&tier=${tierName}`;
      const cancelUrl = `${window.location.origin}/pricing?canceled=true`;

      const { url } = await apiClient.createCheckoutSession(priceId, successUrl, cancelUrl);

      window.location.href = url;
    } catch (error: any) {
      console.error("Failed to create checkout session:", error);

      if (error.message?.includes("Could not validate credentials") ||
        error.message?.includes("401") ||
        error.message?.includes("Unauthorized")) {
        toast.error("Your session has expired. Please log in again.");
        router.push(`/login?redirect=/pricing`);
      } else {
        toast.error(error.message || "Failed to start checkout. Please try again.");
      }
      setLoading(null);
    }
  };

  const handleUpgrade = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setLoading("upgrade");
      await refreshUser();
      await apiClient.updateSubscription(PERFORMER_PRICE_ID);
      await refreshUser();
      toast.success("Welcome to Guild Master", {
        description: "You now have access to every premium feature.",
        duration: 4500,
      });
      router.push("/courses");
    } catch (error: any) {
      console.error("Failed to upgrade:", error);
      toast.error("Upgrade failed", {
        description: error.message || "Please try again in a moment.",
      });
    } finally {
      setLoading(null);
    }
  };

  const performDowngrade = async () => {
    try {
      setLoading("downgrade");
      await refreshUser();
      await apiClient.updateSubscription(ADVANCED_PRICE_ID);
      await refreshUser();
      toast.success("Downgraded to Pro", {
        description: "Your plan change is effective immediately.",
        duration: 4500,
      });
      router.push("/courses");
    } catch (error: any) {
      console.error("Failed to downgrade:", error);
      toast.error("Downgrade failed", {
        description: error.message || "Please try again in a moment.",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDowngrade = () => {
    if (!user) return;

    toast.warning("Downgrade to Pro?", {
      description:
        "You'll lose Guild Master perks (1-on-1 feedback, roundtable Zooms, exclusive badge). The change takes effect immediately.",
      duration: 10000,
      action: {
        label: "Confirm",
        onClick: () => {
          void performDowngrade();
        },
      },
      cancel: {
        label: "Keep Guild Master",
        onClick: () => {},
      },
    });
  };

  // Get current user tier (default to "rookie" if not logged in or no tier)
  const currentTier = user?.tier?.toLowerCase() || "rookie";
  const isRookie = currentTier === "rookie";
  const isAdvanced = currentTier === "advanced";
  const isPerformer = currentTier === "performer";

  // Logic mimics LandingPricingSection.tsx
  // Highlight "Most Popular" (Advanced) only if user is NOT logged in.
  // Highlight "Active Plan" if user IS logged in.

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user || undefined} />

      <FadeIn>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-20 pt-20 sm:pt-28 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-6 sm:mb-16 text-mambo-text tracking-tight font-serif italic" style={{ fontFamily: '"Playfair Display", serif' }}>
            We Adapt to <span className="text-mambo-gold">Your Level</span>
          </h1>

          <StaggerContainer className="grid md:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto">
            {/* Rookie Tier */}
            <StaggerItem>
              <HoverCard>
                <div className={`relative rounded-2xl p-[2px] flex flex-col h-full transition-all duration-300 bg-gray-800`}>
                  <div className={`relative rounded-2xl p-8 flex flex-col h-full transition-all duration-300 bg-[#111111] ${!(isRookie && user) ? "border border-gray-800 hover:border-gray-700 hover:bg-[#161616]" : ""
                    }`}>



                    <div className="mb-4">
                      <span className={`text-xs font-bold uppercase tracking-widest ${(isRookie && user) ? "text-mambo-gold" : "text-gray-500"}`}>
                        Rookie
                      </span>
                    </div>
                    <div className="text-4xl font-bold mb-2 text-mambo-text">Free</div>
                    <div className="text-sm text-gray-500 mb-8">Forever. No credit card.</div>

                    <ul className="text-left space-y-4 mb-8 flex-1">
                      <li className={`flex gap-3 text-sm leading-relaxed text-gray-300`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${(isRookie && user) ? "text-mambo-gold" : "text-gray-500"}`} />
                        ChaChaCha Bruno Mars Choreography
                      </li>
                    </ul>
                    <Clickable>
                      {!user ? (
                        <Link
                          href="/register"
                          className="block w-full py-3 border border-gray-600 hover:border-gray-500 rounded-lg font-bold hover:bg-gray-800/50 transition-all duration-300 text-mambo-text text-center shadow-md"
                        >
                          Create Free Account
                        </Link>
                      ) : isRookie ? (
                        <Link
                          href="/courses"
                          className="block w-full py-4 bg-gradient-to-r from-mambo-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 text-center"
                        >
                          Current Plan
                        </Link>
                      ) : (isAdvanced || isPerformer) ? (
                        <p className="block w-full py-3 text-center text-gray-500 text-sm">
                          Cancel in Profile Page
                        </p>
                      ) : null}
                    </Clickable>
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>

            {/* Pro Tier */}
            <StaggerItem>
              <HoverCard>
                <div className={`relative rounded-2xl p-[2px] flex flex-col h-full transition-all duration-300 z-10 bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 shadow-2xl shadow-yellow-900/40`}>
                  <div className={`relative rounded-2xl p-8 flex flex-col h-full transition-all duration-300 bg-[#111111]`}>

                    {/* Full Access Badge - Always show */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-mambo-gold to-orange-500 rounded-full text-xs font-bold text-black shadow-lg">
                        <FaCrown className="w-3 h-3" />
                        Full Access
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-mambo-gold">
                        Pro
                      </span>
                    </div>
                    <div className="text-4xl font-bold mb-2 text-mambo-text tracking-tight">
                      $39<span className="text-lg text-gray-400 font-normal">/mo</span>
                    </div>
                    <div className="text-sm text-gray-400 mb-8">Billed monthly.</div>

                    <ul className="text-left space-y-4 mb-8 flex-1">
                      <li className={`flex gap-3 text-sm leading-relaxed ${isAdvanced ? "text-mambo-text font-medium" : "text-gray-300"}`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${isAdvanced ? "text-mambo-gold" : "text-gray-500"}`} />
                        Full access to Guild courses, choreos & topics
                      </li>
                      <li className={`flex gap-3 text-sm leading-relaxed ${isAdvanced ? "text-mambo-text font-medium" : "text-gray-300"}`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${isAdvanced ? "text-mambo-gold" : "text-gray-500"}`} />
                        New choreos bi-weekly
                      </li>
                      <li className={`flex gap-3 text-sm leading-relaxed ${isAdvanced ? "text-mambo-text font-medium" : "text-gray-300"}`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${isAdvanced ? "text-mambo-gold" : "text-gray-500"}`} />
                        Access to the Guild community
                      </li>
                    </ul>
                    <Clickable>
                      {!user ? (
                        <button
                          onClick={() => handleSubscribe(ADVANCED_PRICE_ID, "advanced")}
                          disabled={loading === ADVANCED_PRICE_ID}
                          className="block w-full py-4 bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-orange-400 text-black rounded-lg font-bold transition-all duration-300 shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading === ADVANCED_PRICE_ID ? "Loading..." : "Start 7-Day Free Trial"}
                        </button>
                      ) : isRookie ? (
                        <button
                          onClick={() => handleSubscribe(ADVANCED_PRICE_ID, "advanced")}
                          disabled={loading === ADVANCED_PRICE_ID}
                          className="block w-full py-4 bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-orange-400 text-black rounded-lg font-bold transition-all duration-300 shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading === ADVANCED_PRICE_ID ? "Loading..." : "Start 7-Day Free Trial"}
                        </button>
                      ) : isAdvanced ? (
                        <button
                          disabled
                          className="block w-full py-4 bg-gradient-to-r from-mambo-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 cursor-default"
                        >
                          Current Plan
                        </button>
                      ) : isPerformer ? (
                        <button
                          onClick={handleDowngrade}
                          disabled={loading === "downgrade"}
                          className="block w-full py-4 border border-gray-600 hover:border-gray-500 rounded-lg font-bold hover:bg-gray-800/50 transition-all duration-300 text-mambo-text shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading === "downgrade" ? "Loading..." : "Downgrade to Advanced Pass Plan"}
                        </button>
                      ) : null}
                    </Clickable>
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>

            {/* Guild Master Tier */}
            <StaggerItem>
              <HoverCard>
                <div className={`relative rounded-2xl p-[2px] flex flex-col h-full transition-all duration-300 bg-gray-800`}>
                  <div className={`relative rounded-2xl p-8 flex flex-col h-full transition-all duration-300 bg-[#111111] ${!isPerformer ? "border border-gray-800 hover:border-gray-700 hover:bg-[#161616]" : ""
                    }`}>



                    <div className="mb-4">
                      <span className={`text-xs font-bold uppercase tracking-widest ${isPerformer ? "text-mambo-gold" : "text-gray-500"}`}>
                        Guild Master
                      </span>
                    </div>
                    <div className="text-4xl font-bold mb-2 text-mambo-text tracking-tight">
                      $59<span className="text-lg text-gray-400 font-normal">/mo</span>
                    </div>
                    <div className="text-sm text-gray-400 mb-8">Capped at 30 members.</div>

                    <ul className="text-left space-y-4 mb-8 flex-1">
                      <li className={`flex gap-3 text-sm leading-relaxed ${isPerformer ? "text-mambo-text font-medium" : "text-gray-300"}`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${isPerformer ? "text-mambo-gold" : "text-gray-500"}`} />
                        Everything in Pro
                      </li>
                      <li className={`flex gap-3 text-sm leading-relaxed ${isPerformer ? "text-mambo-text font-medium" : "text-gray-300"}`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${isPerformer ? "text-mambo-gold" : "text-gray-500"}`} />
                        Monthly 1-on-1 video feedback from Instructors
                      </li>
                      <li className={`flex gap-3 text-sm leading-relaxed ${isPerformer ? "text-mambo-text font-medium" : "text-gray-300"}`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${isPerformer ? "text-mambo-gold" : "text-gray-500"}`} />
                        Roundtable exclusive Zoom calls
                      </li>
                      <li className={`flex gap-3 text-sm leading-relaxed ${isPerformer ? "text-mambo-text font-medium" : "text-gray-300"}`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${isPerformer ? "text-mambo-gold" : "text-gray-500"}`} />
                        Exclusive Badge
                      </li>
                      <li className={`flex gap-3 text-sm leading-relaxed ${isPerformer ? "text-mambo-text font-medium" : "text-gray-300"}`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${isPerformer ? "text-mambo-gold" : "text-gray-500"}`} />
                        Additional claves for the community
                      </li>
                    </ul>
                    <Clickable>
                      {!user ? (
                        <button
                          onClick={() => handleSubscribe(PERFORMER_PRICE_ID, "performer")}
                          disabled={loading === PERFORMER_PRICE_ID}
                          className="block w-full py-3 border border-gray-600 hover:border-gray-500 rounded-lg font-bold hover:bg-gray-800/50 transition-all duration-300 text-mambo-text shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading === PERFORMER_PRICE_ID ? "Loading..." : "Get Guild Master Access"}
                        </button>
                      ) : isRookie ? (
                        <button
                          onClick={() => handleSubscribe(PERFORMER_PRICE_ID, "performer")}
                          disabled={loading === PERFORMER_PRICE_ID}
                          className="block w-full py-3 border border-gray-600 hover:border-gray-500 rounded-lg font-bold hover:bg-gray-800/50 transition-all duration-300 text-mambo-text shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading === PERFORMER_PRICE_ID ? "Loading..." : "Get Guild Master Access"}
                        </button>
                      ) : isAdvanced ? (
                        <button
                          onClick={handleUpgrade}
                          disabled={loading === "upgrade"}
                          className="block w-full py-4 bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-orange-400 text-black rounded-lg font-bold transition-all duration-300 shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading === "upgrade" ? "Loading..." : "Upgrade"}
                        </button>
                      ) : isPerformer ? (
                        <button
                          disabled
                          className="block w-full py-4 bg-gradient-to-r from-mambo-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 cursor-default"
                        >
                          Current Plan
                        </button>
                      ) : null}
                    </Clickable>
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>
          </StaggerContainer>

          <div className="mt-20 text-gray-400 text-sm leading-relaxed">
            <p>
              Secure payment powered by Stripe. <br />
              Questions? Email support@themamboinn.com
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        type="login"
      />

      <Footer />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-mambo-dark flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-mambo-blue border-t-transparent rounded-full" /></div>}>
      <PricingPageContent />
    </Suspense>
  );
}
