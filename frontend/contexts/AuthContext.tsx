"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  username?: string | null;
  xp: number;
  level: number;
  streak_count: number;
  tier: string;
  role: string;
  avatar_url: string | null;
  instagram_url?: string | null;
  is_pro?: boolean;
  subscription_cancel_at_period_end?: boolean;
  subscription_period_end?: string | null;
  subscription_status?: string | null;
  reputation: number;
  current_claves: number;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    tier: string;
    icon_url: string | null;
    category: string;
    requirement_type: string;
    requirement_value: number;
    is_earned: boolean;
    earned_at: string | null;
  }>;
  stats: {
    reactions_given: number;
    reactions_received: number;
    solutions_accepted: number;
  } | null;
  equipped_border_sku?: string | null;
  equipped_title_sku?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    username: string;
    password: string;
    confirm_password: string;
  }) => Promise<{ analytics_event_id?: string | null }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  waitlistRegister: (
    email: string,
    username: string,
    referrer_code?: string,
    hp?: string
  ) => Promise<{
    referral_code: string;
    position: number;
    analytics_event_id?: string | null;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const lastRefreshAtRef = useRef<number>(0);

  const refreshUser = async (silent: boolean = false) => {
    try {
      const profile = await apiClient.getProfile();
      lastRefreshAtRef.current = Date.now();
      // Preserve object reference if the payload is unchanged so downstream
      // effects don't re-run on every tab focus (bugs 13, 14).
      setUser((prev) => {
        if (prev && JSON.stringify(prev) === JSON.stringify(profile)) {
          return prev;
        }
        return profile;
      });
    } catch (error) {
      // Only log errors if we're not in silent mode (i.e., user-initiated refresh)
      if (!silent) {
        console.error("Failed to refresh user:", error);
      }
      setUser(null);
      apiClient.setToken(null);
    }
  };

  useEffect(() => {
    // Check if user is logged in on mount
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      // Auth is handled via httpOnly cookies (set automatically by backend)
      // Try to fetch user profile using the cookie
      try {
        await refreshUser(true); // silent = true for initial check
      } catch (error) {
        // Auth failed - this is expected when no user is logged in
        apiClient.setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Silent token refresh every 25 min (access token expires at 30 min).
  // Also refresh on tab re-focus so returning users don't hit a stale token.
  useEffect(() => {
    if (!user) return;

    const REFRESH_INTERVAL = 25 * 60 * 1000; // 25 minutes

    const silentRefresh = async () => {
      try {
        await apiClient.refreshToken();
        await refreshUser(true);
      } catch {
        // Refresh token expired (30 days) — user must re-login
        setUser(null);
        apiClient.setToken(null);
      }
    };

    const interval = setInterval(silentRefresh, REFRESH_INTERVAL);

    const VISIBILITY_DEBOUNCE_MS = 5 * 60 * 1000; // 5 minutes
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      // Skip refresh unless the last one was more than 5 minutes ago —
      // prevents tab switches from remounting lesson players (bugs 13, 14).
      if (Date.now() - lastRefreshAtRef.current < VISIBILITY_DEBOUNCE_MS) return;
      silentRefresh();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const login = async (email: string, password: string) => {
    await apiClient.login(email, password);
    await refreshUser();
  };

  const register = async (data: {
    email: string;
    username: string;
    password: string;
    confirm_password: string;
  }) => {
    // Attach Meta Ads attribution so the server can persist first-touch.
    const { readFbc, readUtm } = await import("@/lib/fbclid");
    const attribution = {
      fbclid: (() => {
        const fbc = readFbc();
        return fbc ? fbc.split(".").pop() ?? null : null;
      })(),
      utm: readUtm(),
      landing_url: typeof window !== "undefined" ? window.location.href : null,
    };
    const response = await apiClient.register({ ...data, ...attribution });
    await refreshUser();
    // Echo the server-generated event id through the browser Pixel so Meta
    // dedupes the pair. fbq is safe to call even if the Pixel hasn't loaded.
    try {
      const { echoServerEvent } = await import("@/lib/analytics");
      echoServerEvent("CompleteRegistration", response.analytics_event_id ?? null, {
        value: 5,
        currency: "USD",
      });
    } catch {
      // tracking must never block registration
    }
    return { analytics_event_id: response.analytics_event_id ?? null };
  };

  const waitlistRegister = async (email: string, username: string, referrer_code?: string, hp?: string) => {
    const { readFbc, readUtm } = await import("@/lib/fbclid");
    const fbc = readFbc();
    const response = await apiClient.waitlistRegister(email, username, referrer_code, hp, {
      fbclid: fbc ? fbc.split(".").pop() ?? null : null,
      utm: readUtm(),
      landing_url: typeof window !== "undefined" ? window.location.href : null,
    });
    try {
      const { echoServerEvent } = await import("@/lib/analytics");
      echoServerEvent("Lead", response.analytics_event_id ?? null, {
        value: 2,
        currency: "USD",
      });
    } catch {
      // ignored
    }
    return response;
  };

  const logout = async () => {
    try {
      // Call backend to clear httpOnly cookies
      await apiClient.logout();
    } catch (error) {
      // Continue with local cleanup even if server request fails
      console.debug("Logout request failed, clearing local state");
    }
    // Clear token from API client
    apiClient.setToken(null);
    // Clear user state
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, waitlistRegister }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

