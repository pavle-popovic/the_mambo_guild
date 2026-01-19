"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import NavBar from "@/components/NavBar";

function ResetPasswordPageContent() {
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
      setError("Invalid or missing reset token. Please request a new password reset link.");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/reset-password`, {
        method: "POST",
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
        throw new Error(errorData.detail || "Failed to reset password");
      }

      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <div className="text-center text-gray-400">Loading...</div>
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
            <h1 className="text-2xl font-bold mb-1 text-mambo-text">Reset Password</h1>
            <p className="text-gray-400 text-sm">
              Enter your new password below.
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
                <p className="font-semibold mb-2">Password reset successful!</p>
                <p>Redirecting to login page...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-mambo-text-light focus:outline-none focus:border-mambo-blue transition"
                  placeholder="At least 8 characters"
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Confirm Password
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
                  placeholder="Confirm your password"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-mambo-blue hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            <Link href="/login" className="hover:text-mambo-text transition">
              Back to Login
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

