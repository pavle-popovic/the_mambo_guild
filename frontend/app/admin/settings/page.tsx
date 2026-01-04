"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="h-screen bg-mambo-dark flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-mambo-dark">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-mambo-text mb-2">Settings</h1>
          <p className="text-gray-400 text-sm">Manage system settings and configurations</p>
        </header>

        <div className="bg-mambo-panel border border-gray-800 rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">⚙️</div>
            <h2 className="text-xl font-bold text-mambo-text mb-2">Settings Coming Soon</h2>
            <p className="text-gray-400">
              Configuration options and system settings will be available here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

