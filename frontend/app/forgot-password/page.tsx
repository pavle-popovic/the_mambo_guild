"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { apiClient } from "@/lib/api";
import { useTranslations } from "@/i18n/useTranslations";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || t("failedToSend"));
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t("genericError"));
    } finally {
      setLoading(false);
    }
  };

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
                <p>
                  {t("successBody")}
                </p>
              </div>
              <Link
                href="/login"
                className="block w-full text-center bg-mambo-blue hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-600/20"
              >
                {t("backToLogin")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  {t("emailLabel")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-mambo-text-light focus:outline-none focus:border-mambo-blue transition"
                  placeholder={t("emailPlaceholder")}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
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

