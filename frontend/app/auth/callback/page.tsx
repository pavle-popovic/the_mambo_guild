"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import NavBar from "@/components/NavBar";

function AuthCallbackContent() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (processedRef.current) {
      return;
    }

    const handleCallback = async () => {
      // Mark as processed immediately to prevent re-runs
      processedRef.current = true;

      try {
        // Get token from URL - use window.location as primary source for reliability
        let token: string | null = null;
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          token = urlParams.get("token");
        }
        
        // Fallback to searchParams if window.location didn't work
        if (!token) {
          token = searchParams.get("token");
        }

        if (!token) {
          setError("No authentication token received");
          setLoading(false);
          return;
        }

        // Store token
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token);
        }

        // Set token in API client
        const { apiClient } = await import("@/lib/api");
        apiClient.setToken(token);
        
        // Refresh user profile
        await refreshUser();

        // Redirect to courses immediately
        router.replace("/courses");
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message || "Authentication failed. Please try again.");
        setLoading(false);
        processedRef.current = false; // Allow retry on error
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
      <NavBar />
      <div className="text-center">
        {loading ? (
          <div className="space-y-4">
            <div className="animate-spin text-mambo-blue text-4xl">⏳</div>
            <p className="text-gray-400">Completing authentication...</p>
          </div>
        ) : error ? (
          <div className="space-y-4 max-w-md mx-auto">
            <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200">
              <p className="font-semibold mb-2">Authentication Failed</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => router.replace("/login")}
              className="px-6 py-2 bg-mambo-blue hover:bg-blue-600 text-white font-bold rounded-lg transition"
            >
              Back to Login
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-mambo-dark flex items-center justify-center">
        <NavBar />
        <div className="text-center">
          <div className="space-y-4">
            <div className="animate-spin text-mambo-blue text-4xl">⏳</div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

