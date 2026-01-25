"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { FaPlus, FaArrowUp } from "react-icons/fa";

interface AdminStats {
  total_users: number;
  total_submissions: number;
  pending_submissions: number;
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user) {
      loadStats();
    }
  }, [user, authLoading, router]);

  const loadStats = async () => {
    try {
      const data = await apiClient.getAdminStats();
      setStats(data);
    } catch (err: any) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
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
      <AdminSidebar pendingCount={stats?.pending_submissions || 0} />

      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-mambo-text">Dashboard Overview</h1>
            <p className="text-gray-400 text-sm">Welcome back, Instructor.</p>
          </div>
          <button className="bg-mambo-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2">
            <FaPlus />
            New Announcement
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-mambo-panel border border-white/10 p-6 rounded-xl transition-all duration-300 cursor-pointer hover:border-mambo-gold/50 hover:shadow-2xl hover:shadow-mambo-gold/10 hover:scale-[1.02] z-0 hover:z-10">
            <div className="text-gray-500 text-xs font-bold uppercase mb-2">
              Total Students
            </div>
            <div className="text-3xl font-bold text-mambo-text">
              {stats?.total_users || 0}
            </div>
            <div className="text-green-500 text-xs mt-1 flex items-center gap-1">
              <FaArrowUp />
              +12% this week
            </div>
          </div>
          <div className="bg-mambo-panel border border-white/10 p-6 rounded-xl transition-all duration-300 cursor-pointer hover:border-mambo-gold/50 hover:shadow-2xl hover:shadow-mambo-gold/10 hover:scale-[1.02] z-0 hover:z-10">
            <div className="text-gray-500 text-xs font-bold uppercase mb-2">
              Active Subscriptions
            </div>
            <div className="text-3xl font-bold text-mambo-text">
              {stats?.total_submissions || 0}
            </div>
            <div className="text-xs mt-1 text-gray-400">$24,500 MRR</div>
          </div>
          <div className="bg-mambo-panel border border-white/10 p-6 rounded-xl transition-all duration-300 cursor-pointer hover:border-mambo-gold/50 hover:shadow-2xl hover:shadow-mambo-gold/10 hover:scale-[1.02] z-0 hover:z-10">
            <div className="text-gray-500 text-xs font-bold uppercase mb-2">
              Pending Homework
            </div>
            <div className="text-3xl font-bold text-yellow-500">
              {stats?.pending_submissions || 0}
            </div>
            <div className="text-xs mt-1 text-gray-400">Needs Grading</div>
          </div>
          <div className="bg-mambo-panel border border-white/10 p-6 rounded-xl transition-all duration-300 cursor-pointer hover:border-mambo-gold/50 hover:shadow-2xl hover:shadow-mambo-gold/10 hover:scale-[1.02] z-0 hover:z-10">
            <div className="text-gray-500 text-xs font-bold uppercase mb-2">
              Completion Rate
            </div>
            <div className="text-3xl font-bold text-blue-500">68%</div>
            <div className="text-xs mt-1 text-gray-400">World 1 Basics</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-mambo-panel border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-mambo-text">Recent Signups</h3>
              <button className="text-xs text-mambo-blue hover:underline">View All</button>
            </div>
            <div className="p-6 text-gray-400 text-sm">
              Recent signups will appear here once the database is populated.
            </div>
          </div>

          <div className="bg-mambo-panel border border-white/10 rounded-xl p-6">
            <h3 className="font-bold mb-4 text-mambo-text">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/admin/builder"
                className="block p-4 border border-white/10 rounded-xl transition-all duration-300 text-center group hover:border-mambo-gold/50 hover:shadow-2xl hover:shadow-mambo-gold/10 hover:scale-[1.02] z-0 hover:z-10"
              >
                <svg
                  className="w-8 h-8 text-gray-500 mb-2 mx-auto group-hover:text-mambo-gold transition-colors"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <div className="text-sm font-bold text-mambo-text">Upload New Lesson</div>
              </a>
              <a
                href="/admin/grading"
                className="block p-4 border border-white/10 rounded-xl transition-all duration-300 text-center group hover:border-mambo-gold/50 hover:shadow-2xl hover:shadow-mambo-gold/10 hover:scale-[1.02] z-0 hover:z-10"
              >
                <svg
                  className="w-8 h-8 text-gray-500 mb-2 mx-auto group-hover:text-mambo-gold transition-colors"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm font-bold text-mambo-text">
                  Grade Submissions ({stats?.pending_submissions || 0})
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
