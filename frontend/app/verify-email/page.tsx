"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/i18n/useTranslations";

type Status = "verifying" | "success" | "error";

function VerifyEmailPageContent() {
  const t = useTranslations("auth.verifyEmail");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<Status>("verifying");
  const [errorMsg, setErrorMsg] = useState<string>("");
  // React 18 strict mode mounts effects twice in dev — keep one network call.
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMsg(t("missingToken"));
      return;
    }

    (async () => {
      try {
        // Backend now also auto-logs-in here: returns access+refresh
        // tokens and sets httpOnly cookies. apiClient sends
        // credentials:"include" by default so the browser stores them.
        await apiClient.verifyEmail(token);
        // Refresh the auth context so the rest of the app sees the
        // freshly-verified, freshly-logged-in user immediately.
        try {
          await refreshUser();
        } catch {
          // Auth context refresh failed for a transient reason — fall
          // through to the success + auto-redirect anyway; AuthContext
          // will reconcile on the next page.
        }
        setStatus("success");
        // Auto-redirect to /pricing after a brief success display.
        // Verification + login are now both done — landing the user on
        // the trial CTA is the natural next step. 1.4s is long enough
        // for the success checkmark to register, short enough to feel
        // snappy.
        setTimeout(() => {
          router.push("/pricing");
        }, 1400);
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err?.message || t("genericError"));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-mambo-dark relative overflow-hidden">
      <NavBar />

      <div className="relative min-h-screen flex items-center justify-center pt-32 pb-16">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="/assets/Background_video.mp4" type="video/mp4" />
        </video>

        <div className="relative z-10 w-full max-w-md bg-black/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl mx-4 text-center">
          {status === "verifying" && (
            <>
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-mambo-blue border-t-transparent" />
              <h1 className="text-2xl font-bold text-mambo-text mb-2">{t("verifyingTitle")}</h1>
              <p className="text-gray-400 text-sm">{t("verifyingBody")}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/15 text-green-400 text-2xl">
                ✓
              </div>
              <h1 className="text-2xl font-bold text-mambo-text mb-2">{t("successTitle")}</h1>
              <p className="text-gray-300 text-sm">{t("successBody")}</p>
              {/* Manual buttons removed — page now auto-redirects to /pricing
                  after ~1.4s (see useEffect above). The link below is a
                  no-friction escape hatch for users on flaky connections
                  where the timer-driven router.push might feel slow. */}
              <Link
                href="/pricing"
                className="inline-block mt-6 text-sm text-mambo-gold/90 hover:text-mambo-gold underline-offset-4 hover:underline"
              >
                {t("startTrialCta")} →
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-red-400 text-2xl">
                !
              </div>
              <h1 className="text-2xl font-bold text-mambo-text mb-2">{t("errorTitle")}</h1>
              <p className="text-gray-300 text-sm mb-6">{errorMsg || t("errorBody")}</p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  className="w-full bg-mambo-blue hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  {t("loginCta")}
                </Link>
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-mambo-text transition"
                >
                  {t("homeCta")}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-mambo-blue border-t-transparent rounded-full" />
        </div>
      }
    >
      <VerifyEmailPageContent />
    </Suspense>
  );
}
