"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaCheck, FaTimes, FaCrown } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { HoverCard, Clickable, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import AuthPromptModal from "@/components/AuthPromptModal";
import RegisteredUserCount from "@/components/RegisteredUserCount";
import EmailVerificationModal from "@/components/EmailVerificationModal";
import {
  daysUntilProGrandfatherEnd,
  ADVANCED_PRICE_ID,
  PERFORMER_PRICE_ID,
} from "@/lib/site";
import { useTranslations } from "@/i18n/useTranslations";

type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: { text: string; included: boolean }[];
  cta: string;
  highlighted: boolean;
  priceId: string | null;
  customStyle?: string;
  cardBg?: string;
  grandfather?: {
    nextPrice: string;
    reason: string;
  };
};

export default function LandingPricingSection() {
  const t = useTranslations("landing.pricing");
  const tAlerts = useTranslations("pricingAlerts");
  const plans: Plan[] = [
    {
      id: "guest-list",
      name: t("guestListName"),
      price: t("guestListPrice"),
      period: t("guestListPeriod"),
      description: t("guestListDescription"),
      features: [
        { text: t("guestListFeature1"), included: true },
      ],
      cta: t("guestListCta"),
      highlighted: false,
      priceId: null,
    },
    {
      id: "full-access",
      name: t("proName"),
      price: t("proPrice"),
      period: t("proPeriod"),
      description: t("proDescription"),
      features: [
        { text: t("proFeature1"), included: true },
        { text: t("proFeature2"), included: true },
        { text: t("proFeature3"), included: true },
        { text: t("proFeature4"), included: true },
      ],
      cta: t("proCta"),
      highlighted: true,
      priceId: ADVANCED_PRICE_ID,
      customStyle: "border border-mambo-gold/50 shadow-[0_0_30px_rgba(251,191,36,0.15)]",
      cardBg: "bg-gradient-to-b from-[#1a1a1a] to-black",
      grandfather: {
        nextPrice: t("proNextPrice"),
        reason: t("proGrandfatherReason"),
      },
    },
    {
      id: "performer",
      name: t("guildMasterName"),
      price: t("guildMasterPrice"),
      period: t("guildMasterPeriod"),
      description: t("guildMasterDescription"),
      features: [
        { text: t("guildMasterFeature1"), included: true },
        { text: t("guildMasterFeature2"), included: true },
        { text: t("guildMasterFeature3"), included: true },
        { text: t("guildMasterFeature4"), included: true },
        { text: t("guildMasterFeature5"), included: true },
        { text: t("guildMasterFeature6"), included: true },
      ],
      cta: t("guildMasterCta"),
      highlighted: false,
      priceId: PERFORMER_PRICE_ID,
      grandfather: {
        nextPrice: t("guildMasterNextPrice"),
        reason: t("guildMasterGrandfatherReason"),
      },
    },
  ];
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string>(""); // Initialize as empty string to avoid null === null match
  const [showAuthModal, setShowAuthModal] = useState(false);
  // Email-verification gate. See _PricingPage.tsx for the same pattern.
  const [showVerifyEmailModal, setShowVerifyEmailModal] = useState(false);
  const [pendingTrialPriceId, setPendingTrialPriceId] = useState<string | null>(null);
  const tPricing = useTranslations("pricingPage");
  // Trial is one-shot: once consumed, the Pro CTA must say "Subscribe" so the
  // user isn't surprised by an immediate charge.
  const proCtaLabel = user?.has_used_trial
    ? tPricing("proSubscribeNoTrial")
    : t("proCta");
  const [guildMasterSeats, setGuildMasterSeats] = useState<{
    total: number;
    taken: number;
    remaining: number;
    is_full: boolean;
  } | null>(null);
  const [proDaysLeft, setProDaysLeft] = useState<number | null>(null);
  useEffect(() => {
    setProDaysLeft(daysUntilProGrandfatherEnd());
  }, []);

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

  const handleSubscribe = async (priceId: string | null, planId: string) => {
    // Free plan - redirect to register
    if (!priceId) {
      router.push("/register");
      return;
    }

    // Not logged in - send to login with return URL
    if (!user) {
      router.push(`/login?redirect=/pricing`);
      return;
    }

    try {
      setLoading(priceId);

      // Refresh user data to ensure token is valid
      try {
        await refreshUser();
      } catch (refreshError) {
        console.error("Failed to refresh user:", refreshError);
        alert(tAlerts("sessionExpired"));
        router.push(`/login?redirect=/pricing`);
        setLoading("");
        return;
      }

      const successUrl = `${window.location.origin}/pricing?success=true&tier=${planId}`;
      const cancelUrl = `${window.location.origin}/pricing?canceled=true`;

      const { url, analytics_event_id } = await apiClient.createCheckoutSession(
        priceId,
        successUrl,
        cancelUrl
      );

      try {
        const { echoServerEvent } = await import("@/lib/analytics");
        const tierValue = planId === "performer" ? 59 : 39;
        echoServerEvent("InitiateCheckout", analytics_event_id ?? null, {
          value: tierValue,
          currency: "USD",
          content_name: planId,
        });
      } catch {
        // tracking must never block checkout
      }

      window.location.href = url;
    } catch (error: any) {
      console.error("Failed to create checkout session:", error);

      if (
        error.message?.includes("Could not validate credentials") ||
        error.message?.includes("Authentication required") ||
        error.message?.includes("401") ||
        error.message?.includes("Unauthorized")
      ) {
        alert(tAlerts("sessionExpired"));
        router.push(`/login?redirect=/pricing`);
      } else if (error.message?.includes("email_verification_required")) {
        // Backend gates the free trial on email verification — open the
        // modal instead of dumping the raw 400 message via alert().
        setPendingTrialPriceId(priceId);
        setShowVerifyEmailModal(true);
      } else {
        alert(error.message || tAlerts("checkoutFailed"));
      }
      setLoading("");
    }
  };

  const currentTier = user?.tier?.toLowerCase() || "rookie";

  return (
    <section className="relative py-12 sm:py-20 md:py-32 px-4 sm:px-6 bg-transparent z-10">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8 text-mambo-text tracking-tight">
            {t("headingPre")} <span className="text-mambo-gold drop-shadow-md">{t("headingAccent")}</span>
          </h2>
        </motion.div>

        {/* Trust bar — pinned ABOVE the pricing tiers so the cancel-anytime
            guarantee is the first thing visitors see in the pricing section. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 sm:mb-14"
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-center sm:text-left">
            <div className="flex items-center gap-2.5 text-sm text-white/80">
              <svg className="w-4 h-4 text-mambo-gold shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span><span className="font-semibold text-white">{t("trustCancelAnytime")}</span> — {t("trustCancelAnytimeDesc")}</span>
            </div>
            <div className="hidden sm:block h-5 w-px bg-white/10" />
            <div className="flex items-center gap-2.5 text-sm text-white/80">
              <svg className="w-4 h-4 text-mambo-gold shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M5 9V7a5 5 0 0110 0v2h1a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6a2 2 0 012-2h1zm8 0V7a3 3 0 10-6 0v2h6z" />
              </svg>
              <span><span className="font-semibold text-white">{t("trustLocked")}</span> — {t("trustLockedDesc")}</span>
            </div>
            <div className="hidden sm:block h-5 w-px bg-white/10" />
            <div className="flex items-center gap-2.5 text-sm text-white/80">
              <svg className="w-4 h-4 text-mambo-gold shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{t("trustSecurePre")} <span className="font-semibold text-white">{t("trustSecureBrand")}</span> {t("trustSecurePost")}</span>
            </div>
          </div>
        </motion.div>

        {/* Pricing grid */}
        <StaggerContainer className="grid md:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto">
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
                      className={`relative rounded-2xl p-5 sm:p-8 flex flex-col h-full transition-all duration-300 ${
                        // Use custom background if defined, otherwise dark
                        (plan as any).cardBg || "bg-[#111111]"
                        } ${!isHighlighted && !isCurrentPlan ? "border border-gray-800 hover:border-gray-700 hover:bg-[#161616]" : ""} ${(plan as any).customStyle || ""}`}
                    >
                      {/* Most Popular badge */}
                      {isHighlighted && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-mambo-gold to-orange-500 rounded-full text-xs font-bold text-black shadow-lg">
                            <FaCrown className="w-3 h-3" />
                            {t("mostPopular")}
                          </div>
                        </div>
                      )}

                      {/* Current Plan Badge (if active) */}
                      {isCurrentPlan && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <div className="px-4 py-1.5 bg-mambo-blue rounded-full text-xs font-bold text-white shadow-lg">
                            {t("activePlan")}
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
                        {plan.period !== t("guestListPeriod") && (
                          <span className="text-lg text-gray-400 font-normal">
                            {plan.period}
                          </span>
                        )}
                        {plan.grandfather && (
                          <span className="ml-2 align-middle text-base text-gray-500 font-normal line-through decoration-gray-600">
                            {plan.grandfather.nextPrice}
                          </span>
                        )}
                      </div>
                      {plan.grandfather && (
                        <div className="mb-3 rounded-lg border border-mambo-gold/30 bg-mambo-gold/[0.06] px-2.5 py-1.5">
                          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-mambo-gold whitespace-nowrap">
                              {plan.id === "performer" ? t("foundingSeats") : t("foundersPrice")}
                            </span>
                            {plan.id === "full-access" && proDaysLeft !== null && proDaysLeft > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-mambo-gold/15 px-1.5 py-0.5 text-[9px] font-bold text-mambo-gold">
                                <span className="relative flex h-1 w-1">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mambo-gold opacity-60" />
                                  <span className="relative inline-flex h-1 w-1 rounded-full bg-mambo-gold" />
                                </span>
                                {proDaysLeft} {proDaysLeft === 1 ? t("daySingular") : t("dayPlural")} {t("daysLeftSuffix")}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] leading-tight text-white/75">
                            {plan.grandfather.reason}
                          </div>
                        </div>
                      )}
                      {plan.id === "performer" && guildMasterSeats ? (
                        <div className="mb-8">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className={`text-sm font-bold ${guildMasterSeats.is_full ? "text-red-400" : "text-mambo-gold"}`}>
                              {guildMasterSeats.is_full
                                ? t("fullyBooked")
                                : t("seatsLeft", { remaining: guildMasterSeats.remaining, total: guildMasterSeats.total })}
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
                        <div className="mb-8">
                          <div className="text-sm text-gray-500">
                            {plan.description}
                          </div>
                          {/* Live social proof — only on the Pro tier card.
                              Shows real registered-account count from
                              /api/stats/registered-count (cached 5min). */}
                          {plan.id === "full-access" && (
                            <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-mambo-gold/10 border border-mambo-gold/40 text-sm font-semibold text-mambo-text shadow-[0_0_18px_rgba(212,175,55,0.18)]">
                              <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mambo-gold opacity-70"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-mambo-gold"></span>
                              </span>
                              <span>
                                Join <RegisteredUserCount /> Active Members
                              </span>
                            </div>
                          )}
                        </div>
                      )}

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
                            {t("currentPlan")}
                          </Link>
                        ) : plan.id === "performer" && guildMasterSeats?.is_full ? (
                          <button
                            disabled
                            className="block w-full py-4 bg-gray-800/60 border border-gray-700 text-gray-500 rounded-lg font-bold cursor-not-allowed"
                          >
                            {t("fullyBookedWaitlist")}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSubscribe(plan.priceId, plan.id)}
                            disabled={loading === plan.priceId}
                            className={`block w-full py-4 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isHighlighted
                              ? "bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-orange-400 text-black shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/30"
                              : "border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 text-mambo-text shadow-md"
                              }`}
                          >
                            {loading === plan.priceId
                            ? t("loading")
                            : plan.id === "full-access"
                              ? proCtaLabel
                              : plan.cta}
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

        <p className="mt-10 sm:mt-14 text-center text-gray-500 text-xs">
          <Link href="/pricing" className="text-mambo-gold/90 hover:text-mambo-gold underline-offset-4 hover:underline">
            {t("seeFullPricing")}
          </Link>
        </p>
      </div>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        type="login"
      />

      {/* Email verification gate — opened when checkout returns
          "email_verification_required" for an unverified user. */}
      <EmailVerificationModal
        isOpen={showVerifyEmailModal}
        onClose={() => {
          setShowVerifyEmailModal(false);
          setPendingTrialPriceId(null);
        }}
        onVerified={() => {
          const resumeId = pendingTrialPriceId;
          setPendingTrialPriceId(null);
          if (resumeId) {
            // Resume the original checkout. planId from the original click
            // isn't preserved here; "advanced" is the only trial-eligible
            // plan, so it's the only path that can hit this modal.
            handleSubscribe(resumeId, "full-access");
          }
        }}
      />
    </section>
  );
}
