"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  xp: number;
  level: number;
  streak_count: number;
  tier: string;
  role: string;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    current_level_tag: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const profile = await apiClient.getProfile();
      setUser(profile);
    } catch (error) {
      console.error("Failed to refresh user:", error);
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
    
    const token = localStorage.getItem("auth_token");
    if (token) {
      apiClient.setToken(token);
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    await apiClient.login(email, password);
    await refreshUser();
  };

  const register = async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    current_level_tag: string;
  }) => {
    await apiClient.register(data);
    await refreshUser();
  };

  const logout = () => {
    // Clear token from API client
    apiClient.setToken(null);
    // Clear token from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
    // Clear user state
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
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

