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
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [guildMasterSeats, setGuildMasterSeats] = useState<{
    total: number;
    taken: number;
    remaining: number;
    is_full: boolean;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .getGuildMasterSeats()
      .then((s) => {
        if (!cancelled) setGuildMasterSeats(s);
      })
      .catch((err) => {
        console.error("Failed to fetch Guild Master seats:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  // Refresh the Guild Master seat counter after any tier change so the
  // in-place cards reflect reality without a manual page reload.
  const refreshSeats = async () => {
    try {
      const s = await apiClient.getGuildMasterSeats();
      setGuildMasterSeats(s);
    } catch (err) {
      console.error("Failed to refresh Guild Master seats:", err);
    }
  };

  const handleUpgrade = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      setLoading("upgrade");
      await apiClient.updateSubscription(PERFORMER_PRICE_ID);
      await Promise.all([refreshUser(), refreshSeats()]);
      toast.success("Welcome to Guild Master", {
        description: "You now have access to every premium feature.",
        duration: 4500,
      });
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
      setShowDowngradeModal(false);
      await apiClient.updateSubscription(ADVANCED_PRICE_ID);
      await Promise.all([refreshUser(), refreshSeats()]);
      toast.success("Downgraded to Pro", {
        description: "Your plan change is effective immediately.",
        duration: 4500,
      });
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
    setShowDowngradeModal(true);
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
                    {guildMasterSeats ? (
                      <div className="mb-8">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className={`text-sm font-bold ${guildMasterSeats.is_full ? "text-red-400" : "text-mambo-gold"}`}>
                            {guildMasterSeats.is_full
                              ? "Fully booked"
                              : `${guildMasterSeats.remaining} of ${guildMasterSeats.total} seats left`}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${guildMasterSeats.is_full ? "bg-red-500" : "bg-gradient-to-r from-mambo-gold to-orange-500"}`}
                            style={{
                              width: `${Math.min(100, (guildMasterSeats.taken / guildMasterSeats.total) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 mb-8">Capped at 30 members.</div>
                    )}

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
                      {(() => {
                        const gmFull = guildMasterSeats?.is_full === true;
                        // Already Guild Master — always show Current Plan.
                        if (isPerformer) {
                          return (
                            <button
                              disabled
                              className="block w-full py-4 bg-gradient-to-r from-mambo-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 cursor-default"
                            >
                              Current Plan
                            </button>
                          );
                        }
                        // Seat cap hit — lock the button with a waitlist CTA.
                        if (gmFull) {
                          return (
                            <button
                              disabled
                              className="block w-full py-4 bg-gray-800/60 border border-gray-700 text-gray-500 rounded-lg font-bold cursor-not-allowed"
                            >
                              Fully Booked — Join Waitlist
                            </button>
                          );
                        }
                        // Logged-in Pro user — upgrade path.
                        if (isAdvanced) {
                          return (
                            <button
                              onClick={handleUpgrade}
                              disabled={loading === "upgrade"}
                              className="block w-full py-4 bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-orange-400 text-black rounded-lg font-bold transition-all duration-300 shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading === "upgrade" ? "Loading..." : "Upgrade"}
                            </button>
                          );
                        }
                        // Rookie or logged-out — start checkout.
                        return (
                          <button
                            onClick={() => handleSubscribe(PERFORMER_PRICE_ID, "performer")}
                            disabled={loading === PERFORMER_PRICE_ID}
                            className="block w-full py-3 border border-gray-600 hover:border-gray-500 rounded-lg font-bold hover:bg-gray-800/50 transition-all duration-300 text-mambo-text shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading === PERFORMER_PRICE_ID ? "Loading..." : "Get Guild Master Access"}
                          </button>
                        );
                      })()}
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

      {/* Downgrade Confirmation Modal */}
      {showDowngradeModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowDowngradeModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-mambo-panel border border-gray-800 p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDowngradeModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-300 text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-serif font-bold text-mambo-text mb-2">
              Downgrade to <span className="text-amber-300">Pro</span>?
            </h2>
            <p className="text-gray-400 mb-5">
              You&apos;ll lose Guild Master perks immediately:
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>Monthly 1-on-1 video feedback from instructors</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>Roundtable exclusive Zoom calls</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>Exclusive Guild Master badge</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <span className="text-red-400 mt-0.5">✕</span>
                <span>Additional claves for the community</span>
              </li>
            </ul>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-6">
              <p className="text-sm text-amber-100/80 leading-relaxed">
                Your plan will change to Pro right now. Stripe will credit the unused portion of
                your Guild Master month against your next Pro bill — no refund to your card.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowDowngradeModal(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition"
              >
                Keep Guild Master
              </button>
              <button
                onClick={performDowngrade}
                disabled={loading === "downgrade"}
                className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 underline underline-offset-4 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading === "downgrade" ? "Downgrading..." : "I understand, downgrade to Pro"}
              </button>
            </div>
          </div>
        </div>
      )}

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
