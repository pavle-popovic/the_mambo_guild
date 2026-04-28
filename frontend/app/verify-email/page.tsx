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
        await apiClient.verifyEmail(token);
        // Refresh the auth context so the rest of the app sees is_verified=true
        // immediately; otherwise the user would see the "verify your email"
        // banner until the next page navigation.
        try {
          await refreshUser();
        } catch {
          // Not logged in — still show success; they'll log in fresh.
        }
        setStatus("success");
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
              <p className="text-gray-300 text-sm mb-6">{t("successBody")}</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => router.push("/pricing")}
                  className="w-full bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] hover:brightness-110 text-black font-bold py-3 px-6 rounded-lg transition"
                >
                  {t("startTrialCta")}
                </button>
                <Link
                  href="/courses"
                  className="text-sm text-gray-400 hover:text-mambo-text transition"
                >
                  {t("browseFreeCta")}
                </Link>
              </div>
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
