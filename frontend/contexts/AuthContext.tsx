"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  is_pro?: boolean;
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
    first_name: string;
    last_name: string;
    current_level_tag: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  waitlistRegister: (email: string, username: string, referrer_code?: string) => Promise<{ referral_code: string; position: number }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async (silent: boolean = false) => {
    try {
      const profile = await apiClient.getProfile();
      setUser(profile);
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

  const login = async (email: string, password: string) => {
    await apiClient.login(email, password);
    await refreshUser();
  };

  const register = async (data: {
    email: string;
    username: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
    current_level_tag: string;
  }) => {
    await apiClient.register(data);
    await refreshUser();
  };

  const waitlistRegister = async (email: string, username: string, referrer_code?: string) => {
    return await apiClient.waitlistRegister(email, username, referrer_code);
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

