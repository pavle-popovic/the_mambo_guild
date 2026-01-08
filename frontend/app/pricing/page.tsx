"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { FaCheck, FaTimes } from "react-icons/fa";
import { FadeIn, StaggerContainer, StaggerItem, HoverCard, Clickable } from "@/components/ui/motion";
import AuthPromptModal from "@/components/AuthPromptModal";

// Stripe Price IDs
const ADVANCED_PRICE_ID = "price_1SmeXA1a6FlufVwfOLg5SMcc";
const PERFORMER_PRICE_ID = "price_1SmeZa1a6FlufVwfrJCJrv94";

export default function PricingPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Handle success/cancel redirects from Stripe
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const tier = searchParams.get("tier");

    if (success === "true") {
      // Payment successful - refresh user data to get updated subscription
      if (user) {
        window.location.href = "/courses";
      }
    } else if (canceled === "true") {
      // User canceled - stay on pricing page
      console.log("Payment canceled");
    }
  }, [searchParams, user]);

  const handleSubscribe = async (priceId: string, tierName: string) => {
    if (!user) {
      // Show login modal instead of redirecting
      setShowAuthModal(true);
      return;
    }

    try {
      setLoading(priceId);
      
      // Refresh user data to ensure token is valid
      try {
        await refreshUser();
      } catch (refreshError) {
        // If refresh fails, token is invalid - redirect to login
        console.error("Failed to refresh user:", refreshError);
        alert("Your session has expired. Please log in again.");
        router.push(`/login?redirect=/pricing`);
        setLoading(null);
        return;
      }
      
      const successUrl = `${window.location.origin}/pricing?success=true&tier=${tierName}`;
      const cancelUrl = `${window.location.origin}/pricing?canceled=true`;
      
      const { url } = await apiClient.createCheckoutSession(priceId, successUrl, cancelUrl);
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      console.error("Failed to create checkout session:", error);
      
      // Check if it's an authentication error
      if (error.message?.includes("Could not validate credentials") || 
          error.message?.includes("401") ||
          error.message?.includes("Unauthorized")) {
        // Token expired or invalid - redirect to login
        alert("Your session has expired. Please log in again.");
        router.push(`/login?redirect=/pricing`);
      } else {
        alert(error.message || "Failed to start checkout. Please try again.");
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
      alert("Successfully upgraded to Performer plan!");
      router.push("/courses");
    } catch (error: any) {
      console.error("Failed to upgrade:", error);
      alert(error.message || "Failed to upgrade subscription. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleDowngrade = async () => {
    if (!user) {
      return;
    }

    if (!confirm("Are you sure you want to downgrade to Advanced plan? Your subscription will be updated immediately.")) {
      return;
    }

    try {
      setLoading("downgrade");
      await refreshUser();
      await apiClient.updateSubscription(ADVANCED_PRICE_ID);
      await refreshUser();
      alert("Successfully downgraded to Advanced plan!");
      router.push("/courses");
    } catch (error: any) {
      console.error("Failed to downgrade:", error);
      alert(error.message || "Failed to downgrade subscription. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) {
      return;
    }

    if (!confirm("Are you sure you want to cancel your subscription? You will lose access to premium features immediately and revert to the free Rookie plan.")) {
      return;
    }

    try {
      setLoading("cancel");
      await refreshUser();
      await apiClient.cancelSubscription();
      await refreshUser();
      alert("Subscription canceled successfully. You now have access to the free Rookie plan.");
      router.push("/courses");
    } catch (error: any) {
      console.error("Failed to cancel subscription:", error);
      alert(error.message || "Failed to cancel subscription. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  // Get current user tier (default to "rookie" if not logged in or no tier)
  const currentTier = user?.tier?.toLowerCase() || "rookie";
  const isRookie = currentTier === "rookie";
  const isAdvanced = currentTier === "advanced";
  const isPerformer = currentTier === "performer";

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user || undefined} />

      <FadeIn>
        <div className="max-w-7xl mx-auto px-8 py-20 pt-28 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-mambo-text tracking-tight">
            Choose Your Player Mode
          </h1>
          <p className="text-xl text-gray-300 mb-20 max-w-2xl mx-auto leading-relaxed">
            Start with the basics or unlock the full academy. Cancel anytime.
          </p>

          <StaggerContainer className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Rookie Tier */}
            <StaggerItem>
              <HoverCard>
                <div className="border border-gray-800 hover:border-gray-700 bg-mambo-panel rounded-2xl p-8 flex flex-col h-full shadow-lg shadow-black/20 transition-all duration-300">
                  <div className="mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                      Rookie
                    </span>
                  </div>
                  <div className="text-4xl font-bold mb-2 text-mambo-text">Free</div>
                  <div className="text-sm text-gray-500 mb-8">Forever. No credit card.</div>

                  <ul className="text-left space-y-4 mb-8 flex-1">
                    <li className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                      <FaCheck className="text-gray-500 shrink-0 mt-0.5" />
                      1 Free Course Access
                    </li>
                    <li className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                      <FaCheck className="text-gray-500 shrink-0 mt-0.5" />
                      1 Free Workshop / Month
                    </li>
                    <li className="flex gap-3 text-sm text-gray-500 line-through leading-relaxed">
                      <FaTimes className="shrink-0 mt-0.5" />
                      Advanced Styling
                    </li>
                    <li className="flex gap-3 text-sm text-gray-500 line-through leading-relaxed">
                      <FaTimes className="shrink-0 mt-0.5" />
                      Instructor Feedback
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
                        className="block w-full py-3 border border-gray-600 rounded-lg font-bold bg-gray-800/50 transition-all duration-300 text-mambo-text text-center shadow-md cursor-default"
                      >
                        Current Plan
                      </Link>
                    ) : isAdvanced ? (
                      <button
                        onClick={handleCancelSubscription}
                        disabled={loading === "cancel"}
                        className="block w-full py-3 border border-red-600 hover:border-red-500 rounded-lg font-bold hover:bg-red-900/20 transition-all duration-300 text-red-400 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading === "cancel" ? "Loading..." : "Remove Subscription"}
                      </button>
                    ) : isPerformer ? (
                      <button
                        onClick={handleCancelSubscription}
                        disabled={loading === "cancel"}
                        className="block w-full py-3 border border-red-600 hover:border-red-500 rounded-lg font-bold hover:bg-red-900/20 transition-all duration-300 text-red-400 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading === "cancel" ? "Loading..." : "Remove Subscription"}
                      </button>
                    ) : null}
                  </Clickable>
                </div>
              </HoverCard>
            </StaggerItem>

            {/* Advanced Tier */}
            <StaggerItem>
              <HoverCard>
                <div className={`relative rounded-2xl p-[2px] flex flex-col h-full transition-all duration-300 ${
                  (!user || isRookie) ? "z-10 bg-gradient-to-r from-mambo-blue via-blue-500 to-purple-600 shadow-2xl shadow-blue-900/30" : ""
                }`}>
                  <div className={`relative ${
                    (!user || isRookie) ? "" : "border border-gray-800 hover:border-gray-700 bg-mambo-panel rounded-2xl p-8 flex flex-col h-full shadow-lg shadow-black/20 transition-all duration-300"
                  } ${(!user || isRookie) ? "bg-mambo-panel rounded-2xl p-8 flex flex-col h-full shadow-lg shadow-black/20 transition-all duration-300" : ""}`}>
                  <div className="mb-4">
                    <span className={`text-xs font-bold uppercase tracking-widest ${
                      isAdvanced ? "text-blue-400" : "text-gray-500"
                    }`}>
                      Advanced
                    </span>
                  </div>
                  <div className="text-4xl font-bold mb-2 text-mambo-text tracking-tight">
                    €29<span className="text-lg text-gray-400 font-normal">/mo</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-8">Billed monthly.</div>

                  <ul className="text-left space-y-4 mb-8 flex-1">
                    <li className={`flex gap-3 text-sm leading-relaxed ${
                      isAdvanced ? "text-mambo-text font-medium" : "text-gray-300"
                    }`}>
                      <FaCheck className={`shrink-0 mt-0.5 ${
                        isAdvanced ? "text-mambo-blue" : "text-gray-500"
                      }`} />
                      Unlimited Course Access
                    </li>
                    <li className={`flex gap-3 text-sm leading-relaxed ${
                      isAdvanced ? "text-mambo-text font-medium" : "text-gray-300"
                    }`}>
                      <FaCheck className={`shrink-0 mt-0.5 ${
                        isAdvanced ? "text-mambo-blue" : "text-gray-500"
                      }`} />
                      New Workshops Weekly
                    </li>
                    <li className={`flex gap-3 text-sm leading-relaxed ${
                      isAdvanced ? "text-mambo-text font-medium" : "text-gray-300"
                    }`}>
                      <FaCheck className={`shrink-0 mt-0.5 ${
                        isAdvanced ? "text-mambo-blue" : "text-gray-500"
                      }`} />
                      Advanced Partnerwork
                    </li>
                    <li className={`flex gap-3 text-sm leading-relaxed ${
                      isAdvanced ? "text-mambo-text font-medium" : "text-gray-300"
                    }`}>
                      <FaCheck className={`shrink-0 mt-0.5 ${
                        isAdvanced ? "text-mambo-blue" : "text-gray-500"
                      }`} />
                      Community Challenges
                    </li>
                  </ul>
                  <Clickable>
                    {!user ? (
                      <button
                        onClick={() => handleSubscribe(ADVANCED_PRICE_ID, "advanced")}
                        disabled={loading === ADVANCED_PRICE_ID}
                        className="block w-full py-4 bg-gradient-to-r from-mambo-blue via-blue-500 to-purple-600 hover:from-blue-600 hover:via-blue-600 hover:to-purple-700 text-white rounded-lg font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading === ADVANCED_PRICE_ID ? "Loading..." : "Start 7-Day Free Trial"}
                      </button>
                    ) : isRookie ? (
                      <button
                        onClick={() => handleSubscribe(ADVANCED_PRICE_ID, "advanced")}
                        disabled={loading === ADVANCED_PRICE_ID}
                        className="block w-full py-4 bg-gradient-to-r from-mambo-blue via-blue-500 to-purple-600 hover:from-blue-600 hover:via-blue-600 hover:to-purple-700 text-white rounded-lg font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading === ADVANCED_PRICE_ID ? "Loading..." : "Start 7-Day Free Trial"}
                      </button>
                    ) : isAdvanced ? (
                      <button
                        disabled
                        className="block w-full py-4 bg-gray-800/50 border border-gray-600 rounded-lg font-bold text-mambo-text text-center shadow-md cursor-default"
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

            {/* Performer Tier */}
            <StaggerItem>
              <HoverCard>
                <div className={`relative rounded-2xl p-[2px] flex flex-col h-full transition-all duration-300 ${
                  (isAdvanced || isPerformer) ? "z-10 bg-gradient-to-r from-mambo-blue via-blue-500 to-purple-600 shadow-2xl shadow-blue-900/30" : ""
                }`}>
                  <div className="relative bg-mambo-panel rounded-2xl p-8 flex flex-col h-full shadow-lg shadow-black/20 transition-all duration-300">
                  <div className="mb-4">
                    <span className={`text-xs font-bold uppercase tracking-widest ${
                      isPerformer ? "text-blue-400" : "text-yellow-500"
                    }`}>
                      Performer
                    </span>
                  </div>
                  <div className="text-4xl font-bold mb-2 text-mambo-text tracking-tight">
                    €49<span className="text-lg text-gray-400 font-normal">/mo</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-8">For serious students.</div>

                  <ul className="text-left space-y-4 mb-8 flex-1">
                    <li className={`flex gap-3 text-sm leading-relaxed ${
                      isPerformer ? "text-mambo-text font-medium" : "text-gray-300"
                    }`}>
                      <FaCheck className={`shrink-0 mt-0.5 ${
                        isPerformer ? "text-mambo-blue" : "text-yellow-500"
                      }`} />
                      Everything in Advanced
                    </li>
                    <li className={`flex gap-3 text-sm leading-relaxed ${
                      isPerformer ? "text-mambo-text font-medium" : "text-gray-300"
                    }`}>
                      <FaCheck className={`shrink-0 mt-0.5 ${
                        isPerformer ? "text-mambo-blue" : "text-yellow-500"
                      }`} />
                      1 Video Review / Month
                    </li>
                    <li className={`flex gap-3 text-sm leading-relaxed ${
                      isPerformer ? "text-mambo-text font-medium" : "text-gray-300"
                    }`}>
                      <FaCheck className={`shrink-0 mt-0.5 ${
                        isPerformer ? "text-mambo-blue" : "text-yellow-500"
                      }`} />
                      Direct Chat with Instructors
                    </li>
                    <li className={`flex gap-3 text-sm leading-relaxed ${
                      isPerformer ? "text-mambo-text font-medium" : "text-gray-300"
                    }`}>
                      <FaCheck className={`shrink-0 mt-0.5 ${
                        isPerformer ? "text-mambo-blue" : "text-yellow-500"
                      }`} />
                      &quot;Certified&quot; Badge on Profile
                    </li>
                  </ul>
                  <Clickable>
                    {!user ? (
                      <button
                        onClick={() => handleSubscribe(PERFORMER_PRICE_ID, "performer")}
                        disabled={loading === PERFORMER_PRICE_ID}
                        className="block w-full py-3 border border-gray-600 hover:border-gray-500 rounded-lg font-bold hover:bg-gray-800/50 transition-all duration-300 text-mambo-text shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading === PERFORMER_PRICE_ID ? "Loading..." : "Get Performer Access"}
                      </button>
                    ) : isRookie ? (
                      <button
                        onClick={() => handleSubscribe(PERFORMER_PRICE_ID, "performer")}
                        disabled={loading === PERFORMER_PRICE_ID}
                        className="block w-full py-3 border border-gray-600 hover:border-gray-500 rounded-lg font-bold hover:bg-gray-800/50 transition-all duration-300 text-mambo-text shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading === PERFORMER_PRICE_ID ? "Loading..." : "Get Performer Access"}
                      </button>
                    ) : isAdvanced ? (
                      <button
                        onClick={handleUpgrade}
                        disabled={loading === "upgrade"}
                        className="block w-full py-4 bg-gradient-to-r from-mambo-blue via-blue-500 to-purple-600 hover:from-blue-600 hover:via-blue-600 hover:to-purple-700 text-white rounded-lg font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading === "upgrade" ? "Loading..." : "Upgrade"}
                      </button>
                    ) : isPerformer ? (
                      <button
                        disabled
                        className="block w-full py-4 bg-gradient-to-r from-mambo-blue via-blue-500 to-purple-600 hover:from-blue-600 hover:via-blue-600 hover:to-purple-700 text-white rounded-lg font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 cursor-default"
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
