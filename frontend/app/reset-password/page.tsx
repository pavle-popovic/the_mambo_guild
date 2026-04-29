"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/i18n/useTranslations";

function ResetPasswordPageContent() {
  const t = useTranslations("auth.resetPassword");
  const { refreshUser } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError(t("invalidOrMissingToken"));
    } else {
      setToken(tokenParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation — must mirror backend ResetPasswordRequest
    // (length 8-72, at least one letter and one digit). Without these,
    // the API returns a 422 with a structured error array that previously
    // surfaced as "[object Object]" — users couldn't see what was wrong
    // and assumed the new password was set successfully.
    if (password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }
    if (password.length > 72) {
      setError(t("passwordTooLong"));
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      setError(t("passwordTooWeak"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    if (!token) {
      setError(t("invalidToken"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/auth/reset-password`, {
        method: "POST",
        // credentials:"include" is REQUIRED so the browser stores the
        // httpOnly auth cookies the backend sets on this response.
        // Without it, cross-origin Set-Cookie headers are silently
        // dropped and the auto-login below produces a logged-OUT user.
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          new_password: password,
          confirm_password: confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Pydantic 422 errors return detail as an array of {loc,msg,type}
        // objects. Surface the first message rather than coercing the array.
        let msg: string = t("failedToReset");
        if (Array.isArray(errorData.detail)) {
          msg = errorData.detail[0]?.msg || msg;
        } else if (typeof errorData.detail === "string") {
          msg = errorData.detail;
        }
        throw new Error(msg);
      }

      // Backend now mints tokens + sets cookies in the response —
      // populate AuthContext from /me so every component re-renders
      // with the logged-in user, then deep-link straight into the app.
      // Sending to /pricing rather than /courses because for waitlist
      // claimers this is the activation moment and starting a Founder
      // trial is the highest-leverage next action; regular forgot-
      // password users are also fine landing here (one click to
      // /courses if they don't want to upgrade).
      try {
        await refreshUser();
      } catch {
        // Cookie set but /me failed for a transient reason — fall
        // through to /pricing anyway; AuthContext will recover on
        // the next navigation.
      }
      setSuccess(true);
      setTimeout(() => {
        router.push("/pricing");
      }, 1200);
    } catch (err: any) {
      setError(err.message || t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <div className="text-center text-gray-400">{t("loading")}</div>
      </div>
    );
  }

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

        <div className="relative z-10 w-full max-w-md bg-black/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl mx-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-1 text-mambo-text">{t("title")}</h1>
            <p className="text-gray-400 text-sm">
              {t("subtitle")}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-900/50 border border-green-500/50 rounded-lg text-green-200 text-sm">
                <p className="font-semibold mb-2">{t("successTitle")}</p>
                <p>{t("successBody")}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  {t("newPasswordLabel")}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-mambo-text-light focus:outline-none focus:border-mambo-blue transition"
                  placeholder={t("newPasswordPlaceholder")}
                />
                <p className="text-xs text-gray-500 mt-1">{t("newPasswordHelper")}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  {t("confirmPasswordLabel")}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className={`w-full bg-white/5 border rounded-lg p-3 text-mambo-text-light focus:outline-none transition ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-500"
                      : "border-white/10 focus:border-mambo-blue"
                  }`}
                  placeholder={t("confirmPasswordPlaceholder")}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">{t("passwordMismatch")}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-mambo-blue hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t("submitting") : t("submit")}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <Link href="/login" className="hover:text-mambo-text transition">
              {t("backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-mambo-dark flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-mambo-blue border-t-transparent rounded-full" /></div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}

