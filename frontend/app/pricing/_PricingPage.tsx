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
import {
  CONTACT_EMAIL,
  daysUntilProGrandfatherEnd,
  ADVANCED_PRICE_ID,
  PERFORMER_PRICE_ID,
} from "@/lib/site";
import { useTranslations } from "@/i18n/useTranslations";

function PricingPageContent() {
  const t = useTranslations("pricingPage");
  const tf = useTranslations("pricingPage.founderBadge");
  const tp = useTranslations("landing.pricing");
  const tr = useTranslations("roundtable");
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  // Founder Diamond seat counter — capped at 300, deadline 2026-05-06
  // 18:00 UTC. Status fetched once on mount; the 30s edge cache on the
  // backend keeps the number reasonably fresh on a quick page reload.
  const [founderStatus, setFounderStatus] = useState<{
    claimed: number;
    remaining: number;
    cap: number;
    deadline: string;
    expired: boolean;
  } | null>(null);
  // Trial-Advanced users upgrading to Performer trigger an immediate $59
  // charge AND end their free trial NOW (see backend update_subscription
  // path that sets trial_end="now"). Without a confirmation step, users
  // who click "Upgrade to Guild Master" expecting "this will start when my
  // trial ends" instead see a $59 charge same instant. The modal below
  // surfaces both consequences before firing the API call.
  const [showTrialUpgradeModal, setShowTrialUpgradeModal] = useState(false);
  const [guildMasterSeats, setGuildMasterSeats] = useState<{
    total: number;
    taken: number;
    remaining: number;
    is_full: boolean;
  } | null>(null);
  // Bumped after every refreshUser() so derived isRookie/isAdvanced/isPerformer
  // values in the JSX recompute even if React 18 batched the AuthContext update.
  const [, setRefreshKey] = useState(0);
  // Days until the Pro grandfather price expires. Computed client-side only
  // to avoid SSR hydration mismatches between build time and first paint.
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
    apiClient
      .getFounderBadgeStatus()
      .then((s) => {
        if (!cancelled) setFounderStatus(s);
      })
      .catch((err) => {
        console.error("Failed to fetch Founder badge status:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Handle success/cancel redirects from Stripe.
  // B2: After Stripe checkout, poll refreshUser() for up to ~9s waiting for the
  // webhook to land before navigating away. Without this the user would briefly
  // see the old "Current Plan" badge if the webhook hadn't updated their row.
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const expectedTier = (searchParams.get("tier") || "").toLowerCase();

    if (canceled === "true") {
      console.log("Payment canceled");
      return;
    }

    if (success !== "true" || !user) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 6;
    const toastId = toast.loading(t("toastUpdating"));

    const tick = async () => {
      if (cancelled) return;
      attempts += 1;
      try {
        await refreshUser();
      } catch (err) {
        console.error("refreshUser during success-poll failed", err);
      }
      const tierNow = (user?.tier || "").toLowerCase();
      const matched = expectedTier ? tierNow === expectedTier : tierNow !== "rookie";
      if (matched || attempts >= maxAttempts) {
        toast.dismiss(toastId);
        if (matched) {
          toast.success(t("toastSubscriptionUpdated"));
        }
        // Strip the success/tier params so a refresh doesn't re-trigger the poll
        try {
          router.replace("/pricing", { scroll: false });
        } catch {}
        return;
      }
      setTimeout(tick, 1500);
    };

    tick();

    return () => {
      cancelled = true;
      toast.dismiss(toastId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
        toast.error(t("toastSessionExpired"));
        router.push(`/login?redirect=/pricing`);
        setLoading(null);
        return;
      }

      const successUrl = `${window.location.origin}/pricing?success=true&tier=${tierName}`;
      const cancelUrl = `${window.location.origin}/pricing?canceled=true`;

      const { url, analytics_event_id } = await apiClient.createCheckoutSession(
        priceId,
        successUrl,
        cancelUrl,
      );

      try {
        const { echoServerEvent } = await import("@/lib/analytics");
        const tierValue = tierName === "performer" ? 59 : 39;
        echoServerEvent("InitiateCheckout", analytics_event_id ?? null, {
          value: tierValue,
          currency: "USD",
          content_name: tierName,
        });
      } catch {
        // tracking must never block checkout
      }

      window.location.href = url;
    } catch (error: any) {
      console.error("Failed to create checkout session:", error);

      if (error.message?.includes("Could not validate credentials") ||
        error.message?.includes("401") ||
        error.message?.includes("Unauthorized")) {
        toast.error(t("toastSessionExpired"));
        router.push(`/login?redirect=/pricing`);
      } else {
        toast.error(error.message || t("toastCheckoutFailed"));
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
      setRefreshKey((k) => k + 1);
      toast.success(t("toastWelcomeGm"), {
        description: t("toastWelcomeGmDesc"),
        duration: 4500,
      });
    } catch (error: any) {
      console.error("Failed to upgrade:", error);
      toast.error(t("toastUpgradeFailed"), {
        description: error.message || t("toastUpgradeFailedDesc"),
      });
    } finally {
      setLoading(null);
    }
  };

  // Click gate: trial-Advanced users see a confirmation step that names the
  // immediate-charge consequence; everyone else upgrades straight through
  // (paid Pro users are already used to monthly billing).
  const handleUpgradeClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const isTrialingAdvanced =
      (user.subscription_status || "").toLowerCase() === "trialing"
      && (user.tier || "").toLowerCase() === "advanced";
    if (isTrialingAdvanced) {
      setShowTrialUpgradeModal(true);
      return;
    }
    handleUpgrade();
  };

  const handleConfirmTrialUpgrade = async () => {
    setShowTrialUpgradeModal(false);
    await handleUpgrade();
  };

  // Get current user tier (default to "rookie" if not logged in or no tier)
  const currentTier = user?.tier?.toLowerCase() || "rookie";
  const isRookie = currentTier === "rookie";
  const isAdvanced = currentTier === "advanced";
  const isPerformer = currentTier === "performer";

  // Subscription billing state (active sub only). cancel_at_period_end flips
  // to true the moment the user clicks "cancel" — they keep access until
  // periodEnd and we show a warning banner during that window.
  const cancelAtPeriodEnd = !!user?.subscription_cancel_at_period_end;
  const scheduledTier = user?.subscription_scheduled_tier || null;
  const periodEnd = user?.subscription_period_end || null;
  const periodEndLabel = periodEnd
    ? new Date(periodEnd).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  // Reusable footer for an "active plan" card. The pricing page is now purely
  // an upgrade surface — full subscription management (Stripe portal, cancel,
  // resume, downgrade) lives on /profile so there is one canonical place to do
  // it. Here we only show the renewal/cancellation date and a deep-link to
  // /profile, mirroring how Spotify/Notion/Linear treat their pricing pages.
  const ActivePlanFooter = () => (
    <div className="mt-3 space-y-2 text-center">
      {cancelAtPeriodEnd && periodEndLabel ? (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Access ends on <span className="font-semibold">{periodEndLabel}</span>.
        </div>
      ) : scheduledTier && periodEndLabel ? (
        <div className="rounded-md border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-xs text-orange-200">
          Downgrading to Pro on <span className="font-semibold">{periodEndLabel}</span>.
        </div>
      ) : periodEndLabel ? (
        <div className="text-[11px] text-gray-500">Renews on {periodEndLabel}</div>
      ) : null}
      <Link
        href="/profile"
        className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-4 decoration-gray-700 hover:decoration-gray-500 transition"
      >
        Manage subscription
      </Link>
    </div>
  );

  // Logic mimics LandingPricingSection.tsx
  // Highlight "Most Popular" (Advanced) only if user is NOT logged in.
  // Highlight "Active Plan" if user IS logged in.

  return (
    <div className="min-h-screen bg-mambo-dark">
      <NavBar user={user || undefined} />

      <FadeIn>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10 pt-20 sm:pt-24 text-center">
          {/* Founder Diamond CTA — only rendered when the cap data has
              loaded AND the claim window is still open. Hidden post-deadline
              and post-cap so we don't dangle a dead promise. */}
          {founderStatus && !founderStatus.expired && (
            <div className="mx-auto mb-8 max-w-3xl rounded-xl border border-mambo-gold/40 bg-gradient-to-r from-mambo-gold/10 via-yellow-500/10 to-orange-500/10 px-5 py-4 sm:py-5 shadow-lg shadow-amber-900/20">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 text-center sm:text-left">
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mambo-gold opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-mambo-gold" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-mambo-gold">
                    {tf("eyebrow")}
                  </span>
                </div>
                <div className="text-sm leading-snug text-white/90">
                  {tf("cta")}
                </div>
                <div className="shrink-0">
                  {founderStatus.remaining > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-mambo-gold/20 px-3 py-1 text-xs font-bold text-mambo-gold whitespace-nowrap">
                      {tf("seatsRemaining", {
                        remaining: founderStatus.remaining,
                        cap: founderStatus.cap,
                      })}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300 whitespace-nowrap">
                      {tf("allClaimed")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          <StaggerContainer className="grid md:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto">
            {/* Rookie Tier */}
            <StaggerItem>
              <HoverCard>
                <div className={`relative rounded-2xl p-[2px] flex flex-col h-full transition-all duration-300 bg-gray-800`}>
                  <div className={`relative rounded-2xl p-8 flex flex-col h-full transition-all duration-300 bg-[#111111] ${!(isRookie && user) ? "border border-gray-800 hover:border-gray-700 hover:bg-[#161616]" : ""
                    }`}>



                    <div className="mb-4">
                      <span className={`text-xs font-bold uppercase tracking-widest ${(isRookie && user) ? "text-mambo-gold" : "text-gray-500"}`}>
                        {t("rookieName")}
                      </span>
                    </div>
                    <div className="text-4xl font-bold mb-2 text-mambo-text">{t("rookiePrice")}</div>
                    <div className="text-sm text-gray-500 mb-8">{t("rookieDescription")}</div>

                    <ul className="text-left space-y-4 mb-8 flex-1">
                      <li className={`flex gap-3 text-sm leading-relaxed text-gray-300`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${(isRookie && user) ? "text-mambo-gold" : "text-gray-500"}`} />
                        {t("rookieFeature")}
                      </li>
                    </ul>
                    <Clickable>
                      {!user ? (
                        <Link
                          href="/register"
                          className="block w-full py-3 border border-gray-600 hover:border-gray-500 rounded-lg font-bold hover:bg-gray-800/50 transition-all duration-300 text-mambo-text text-center shadow-md"
                        >
                          {t("rookieCreateAccount")}
                        </Link>
                      ) : isRookie ? (
                        <Link
                          href="/courses"
                          className="block w-full py-4 bg-gradient-to-r from-mambo-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 text-center"
                        >
                          {tp("currentPlan")}
                        </Link>
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
                        {t("proFullAccess")}
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-mambo-gold">
                        {tp("proName")}
                      </span>
                    </div>
                    <div className="text-4xl font-bold mb-2 text-mambo-text tracking-tight">
                      {tp("proPrice")}<span className="text-lg text-gray-400 font-normal">{tp("proPeriod")}</span>
                      <span className="ml-2 align-middle text-base text-gray-500 font-normal line-through decoration-gray-600">{tp("proNextPrice")}</span>
                    </div>
                    <div className="mb-6 rounded-lg border border-mambo-gold/30 bg-mambo-gold/[0.06] px-3 py-2 text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-mambo-gold">{tp("foundersPrice")}</span>
                        {proDaysLeft !== null && proDaysLeft > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-mambo-gold/15 px-2 py-0.5 text-[10px] font-bold text-mambo-gold">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mambo-gold opacity-60" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mambo-gold" />
                            </span>
                            {proDaysLeft} {proDaysLeft === 1 ? tp("daySingular") : tp("dayPlural")} {tp("daysLeftSuffix")}
                          </span>
                        )}
                      </div>
                      <div className="text-xs leading-snug text-white/75">
                        {tp("proGrandfatherReason")}
                      </div>
                    </div>

                    <ul className="text-left space-y-4 mb-8 flex-1">
                      <li className={`flex gap-3 text-sm leading-relaxed ${isAdvanced ? "text-mambo-text font-medium" : "text-gray-300"}`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${isAdvanced ? "text-mambo-gold" : "text-gray-500"}`} />
                        {tp("proFeature1")}
                      </li>
                      <li className={`flex gap-3 text-sm leading-relaxed ${isAdvanced ? "text-mambo-text font-medium" : "text-gray-300"}`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${isAdvanced ? "text-mambo-gold" : "text-gray-500"}`} />
                        {tp("proFeature2")}
                      </li>
                      <li className={`flex gap-3 text-sm leading-relaxed ${isAdvanced ? "text-mambo-text font-medium" : "text-gray-300"}`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${isAdvanced ? "text-mambo-gold" : "text-gray-500"}`} />
                        {tp("proFeature3")}
                      </li>
                    </ul>
                    <Clickable>
                      {!user ? (
                        <button
                          onClick={() => handleSubscribe(ADVANCED_PRICE_ID, "advanced")}
                          disabled={loading === ADVANCED_PRICE_ID}
                          className="block w-full py-4 bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-orange-400 text-black rounded-lg font-bold transition-all duration-300 shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading === ADVANCED_PRICE_ID ? tp("loading") : t("proStartTrial")}
                        </button>
                      ) : isRookie ? (
                        <button
                          onClick={() => handleSubscribe(ADVANCED_PRICE_ID, "advanced")}
                          disabled={loading === ADVANCED_PRICE_ID}
                          className="block w-full py-4 bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-orange-400 text-black rounded-lg font-bold transition-all duration-300 shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading === ADVANCED_PRICE_ID ? tp("loading") : t("proStartTrial")}
                        </button>
                      ) : isAdvanced ? (
                        <>
                          <button
                            disabled
                            className="block w-full py-4 bg-gradient-to-r from-mambo-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 cursor-default"
                          >
                            {tp("currentPlan")}
                          </button>
                          <ActivePlanFooter />
                        </>
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
                        {t("guildMasterName")}
                      </span>
                    </div>
                    <div className="text-4xl font-bold mb-2 text-mambo-text tracking-tight">
                      {tp("guildMasterPrice")}<span className="text-lg text-gray-400 font-normal">{tp("guildMasterPeriod")}</span>
                      <span className="ml-2 align-middle text-base text-gray-500 font-normal line-through decoration-gray-600">{tp("guildMasterNextPrice")}</span>
                    </div>
                    <div className="mb-6 rounded-lg border border-mambo-gold/30 bg-mambo-gold/[0.06] px-3 py-2 text-left">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-mambo-gold mb-0.5">{tp("foundingSeats")}</div>
                      <div className="text-xs leading-snug text-white/75">
                        {tp("guildMasterGrandfatherReason")}
                      </div>
                    </div>
                    {guildMasterSeats ? (
                      <div className="mb-8">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className={`text-sm font-bold ${guildMasterSeats.is_full ? "text-red-400" : "text-mambo-gold"}`}>
                            {guildMasterSeats.is_full
                              ? tp("fullyBooked")
                              : tp("seatsLeft", { remaining: guildMasterSeats.remaining, total: guildMasterSeats.total })}
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
                      <div className="text-sm text-gray-400 mb-8">{t("guildMasterCapped")}</div>
                    )}

                    <ul className="text-left space-y-4 mb-8 flex-1">
                      <li className={`flex gap-3 text-sm leading-relaxed ${isPerformer ? "text-mambo-text font-medium" : "text-gray-300"}`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${isPerformer ? "text-mambo-gold" : "text-gray-500"}`} />
                        {tp("guildMasterFeature1")}
                      </li>
                      <li className={`flex gap-3 text-sm leading-relaxed ${isPerformer ? "text-mambo-text font-medium" : "text-gray-300"}`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${isPerformer ? "text-mambo-gold" : "text-gray-500"}`} />
                        {tp("guildMasterFeature2")}
                      </li>
                      <li className={`flex gap-3 text-sm leading-relaxed ${isPerformer ? "text-mambo-text font-medium" : "text-gray-300"}`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${isPerformer ? "text-mambo-gold" : "text-gray-500"}`} />
                        {tp("guildMasterFeature3")}
                      </li>
                      <li className={`flex gap-3 text-sm leading-relaxed ${isPerformer ? "text-mambo-text font-medium" : "text-gray-300"}`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${isPerformer ? "text-mambo-gold" : "text-gray-500"}`} />
                        {tp("guildMasterFeature4")}
                      </li>
                      <li className={`flex gap-3 text-sm leading-relaxed ${isPerformer ? "text-mambo-text font-medium" : "text-gray-300"}`}>
                        <FaCheck className={`shrink-0 mt-0.5 ${isPerformer ? "text-mambo-gold" : "text-gray-500"}`} />
                        {tp("guildMasterFeature5")}
                      </li>
                    </ul>
                    <Clickable>
                      {(() => {
                        const gmFull = guildMasterSeats?.is_full === true;
                        // Already Guild Master — always show Current Plan.
                        if (isPerformer) {
                          return (
                            <>
                              <button
                                disabled
                                className="block w-full py-4 bg-gradient-to-r from-mambo-blue to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 cursor-default"
                              >
                                {tp("currentPlan")}
                              </button>
                              <ActivePlanFooter />
                            </>
                          );
                        }
                        // Seat cap hit — lock the button with a waitlist CTA.
                        if (gmFull) {
                          return (
                            <button
                              disabled
                              className="block w-full py-4 bg-gray-800/60 border border-gray-700 text-gray-500 rounded-lg font-bold cursor-not-allowed"
                            >
                              {tp("fullyBookedWaitlist")}
                            </button>
                          );
                        }
                        // Logged-in Pro user — upgrade path.
                        if (isAdvanced) {
                          return (
                            <button
                              onClick={handleUpgradeClick}
                              disabled={loading === "upgrade"}
                              className="block w-full py-4 bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-orange-400 text-black rounded-lg font-bold transition-all duration-300 shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading === "upgrade" ? tp("loading") : t("guildMasterUpgrade")}
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
                            {loading === PERFORMER_PRICE_ID ? tp("loading") : tp("guildMasterCta")}
                          </button>
                        );
                      })()}
                    </Clickable>
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>
          </StaggerContainer>

          <div className="mt-14 sm:mt-20">
            <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-center sm:text-left">
              <div className="flex items-center gap-2.5 text-sm text-white/80">
                <svg className="w-4 h-4 text-mambo-gold shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><span className="font-semibold text-white">{tp("trustCancelAnytime")}</span> — {tp("trustCancelAnytimeDesc")}</span>
              </div>
              <div className="hidden sm:block h-5 w-px bg-white/10" />
              <div className="flex items-center gap-2.5 text-sm text-white/80">
                <svg className="w-4 h-4 text-mambo-gold shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M5 9V7a5 5 0 0110 0v2h1a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6a2 2 0 012-2h1zm8 0V7a3 3 0 10-6 0v2h6z" />
                </svg>
                <span><span className="font-semibold text-white">{tp("trustLocked")}</span></span>
              </div>
              <div className="hidden sm:block h-5 w-px bg-white/10" />
              <div className="flex items-center gap-2.5 text-sm text-white/80">
                <svg className="w-4 h-4 text-mambo-gold shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{tp("trustSecurePre")} <span className="font-semibold text-white">{tp("trustSecureBrand")}</span> {tp("trustSecurePost")}</span>
              </div>
            </div>
            <p className="mt-6 text-center text-gray-500 text-sm">
              {t("contactPrompt")} <a href={`mailto:${CONTACT_EMAIL}`} className="text-mambo-gold/90 hover:text-mambo-gold">{CONTACT_EMAIL}</a>
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

      {/* Trial-to-Performer upgrade confirmation. Only fires for users in
          status=trialing on the Advanced tier. Stops the surprise-billing
          complaint vector — clicking "Upgrade" otherwise charges $59 and
          ends the trial in the same instant with no warning. */}
      {showTrialUpgradeModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowTrialUpgradeModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-mambo-panel border border-gray-800 p-6 sm:p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrialUpgradeModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-300 text-xl leading-none"
              aria-label={t("trialUpgradeCancel")}
            >
              ×
            </button>
            <h2 className="text-xl font-serif font-bold text-mambo-text mb-3">
              {t("trialUpgradeTitle")}
            </h2>
            <p className="text-sm text-gray-300 mb-6">
              {t("trialUpgradeBody")}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleConfirmTrialUpgrade}
                disabled={loading === "upgrade"}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-mambo-gold via-yellow-500 to-orange-500 hover:from-yellow-400 hover:via-yellow-500 hover:to-orange-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
              >
                {loading === "upgrade" ? tp("loading") : t("trialUpgradeConfirm")}
              </button>
              <button
                onClick={() => setShowTrialUpgradeModal(false)}
                disabled={loading === "upgrade"}
                className="flex-1 py-2.5 rounded-lg border border-gray-700 bg-gray-900/60 text-gray-200 font-semibold text-sm hover:bg-gray-800 hover:text-mambo-text transition disabled:opacity-50"
              >
                {t("trialUpgradeCancel")}
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
