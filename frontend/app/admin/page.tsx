"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import {
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaUser,
  FaCrown,
  FaStar,
  FaFire,
  FaTrophy,
  FaVideo,
  FaDumbbell,
} from "react-icons/fa";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type DashboardStats = Awaited<ReturnType<typeof apiClient.getDashboardStats>>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TIER_COLORS: Record<string, string> = {
  rookie: "#3b82f6",
  advanced: "#a855f7",
  performer: "#D4AF37",
};

const TIER_LABELS: Record<string, string> = {
  rookie: "Rookie",
  advanced: "Advanced",
  performer: "Guild Master",
};

function TierBadge({ tier }: { tier: string | null }) {
  if (!tier) return <span className="text-xs text-gray-500">—</span>;
  const color = TIER_COLORS[tier] ?? "#6b7280";
  const label = TIER_LABELS[tier] ?? tier;
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${color}22`, color }}
    >
      {label}
    </span>
  );
}

function GrowthChip({ pct }: { pct: number }) {
  if (pct > 0)
    return (
      <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
        <FaArrowUp className="w-2.5 h-2.5" /> +{pct}% vs last week
      </span>
    );
  if (pct < 0)
    return (
      <span className="flex items-center gap-1 text-red-400 text-xs font-medium">
        <FaArrowDown className="w-2.5 h-2.5" /> {pct}% vs last week
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-gray-500 text-xs font-medium">
      <FaMinus className="w-2.5 h-2.5" /> No change
    </span>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  sub,
  accent,
  delay,
}: {
  label: string;
  value: string | number;
  sub?: React.ReactNode;
  accent?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay ?? 0, duration: 0.35 }}
      className="bg-mambo-panel border border-white/10 p-5 rounded-xl hover:border-mambo-gold/40 hover:shadow-xl hover:shadow-mambo-gold/5 hover:scale-[1.02] transition-all duration-300 cursor-default"
    >
      <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
        {label}
      </div>
      <div
        className="text-3xl font-bold mb-1"
        style={{ color: accent ?? "var(--mambo-text, #f1f5f9)" }}
      >
        {value}
      </div>
      <div className="text-xs text-gray-400">{sub}</div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Custom recharts tooltip
// ---------------------------------------------------------------------------
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1f2e] border border-white/10 rounded-lg px-3 py-2 text-xs text-white shadow-xl">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user) loadStats();
  }, [user, authLoading]);

  const loadStats = async () => {
    try {
      const data = await apiClient.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen bg-mambo-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-mambo-gold/30 border-t-mambo-gold rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const tierChartData = stats
    ? [
        { name: "Rookie", count: stats.rookie_count, fill: TIER_COLORS.rookie },
        { name: "Advanced", count: stats.advanced_count, fill: TIER_COLORS.advanced },
        { name: "Guild Master", count: stats.performer_count, fill: TIER_COLORS.performer },
      ]
    : [];

  return (
    <div className="flex h-screen overflow-hidden bg-mambo-dark">
      <AdminSidebar coachingPendingCount={stats?.coaching_pending ?? 0} />

      <main className="flex-1 overflow-y-auto p-8 ml-64">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold text-mambo-text">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={loadStats}
            className="text-xs text-gray-500 hover:text-mambo-gold border border-white/10 hover:border-mambo-gold/40 px-3 py-1.5 rounded-lg transition"
          >
            Refresh
          </button>
        </motion.header>

        {/* ── Row 1: 6 Stat Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <StatCard
            label="Total Students"
            value={(stats?.total_users ?? 0).toLocaleString()}
            sub={<GrowthChip pct={stats?.user_growth_pct ?? 0} />}
            delay={0}
          />
          <StatCard
            label="Active Subs"
            value={(stats?.active_subscriptions ?? 0).toLocaleString()}
            sub={`${stats?.canceled_count ?? 0} canceled`}
            accent="#a855f7"
            delay={0.05}
          />
          <StatCard
            label="Est. MRR"
            value={`$${(stats?.estimated_mrr ?? 0).toLocaleString()}`}
            sub={
              <span className="text-gray-500 text-xs">
                Rookie ${stats?.tier_prices?.rookie} · Adv ${stats?.tier_prices?.advanced} · GM ${stats?.tier_prices?.performer}
              </span>
            }
            accent="#10b981"
            delay={0.1}
          />
          <StatCard
            label="Pending Homework"
            value={stats?.pending_submissions ?? 0}
            sub={`${stats?.approved_this_week ?? 0} approved this week`}
            accent="#f59e0b"
            delay={0.15}
          />
          <StatCard
            label="Pending Coaching"
            value={stats?.coaching_pending ?? 0}
            sub={`${stats?.coaching_completed_month ?? 0} done this month`}
            accent="#D4AF37"
            delay={0.2}
          />
          <StatCard
            label="Boss Pass Rate"
            value={`${stats?.boss_pass_rate ?? 0}%`}
            sub={`${stats?.total_submissions ?? 0} total attempts`}
            accent={
              (stats?.boss_pass_rate ?? 0) >= 60
                ? "#10b981"
                : "#ef4444"
            }
            delay={0.25}
          />
        </div>

        {/* ── Row 2: Chart + Recent Signups ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          {/* Subscription Tier Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-mambo-panel border border-white/10 rounded-xl p-6"
          >
            <h3 className="font-bold text-mambo-text mb-1">Subscription Tiers</h3>
            <p className="text-xs text-gray-500 mb-4">Active subscribers by plan</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={tierChartData} barCategoryGap="30%">
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
                  {tierChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Tier legend */}
            <div className="mt-3 flex flex-col gap-1.5">
              {tierChartData.map((t) => (
                <div key={t.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ background: t.fill }}
                    />
                    <span className="text-gray-400">{t.name}</span>
                  </span>
                  <span className="font-bold text-mambo-text">{t.count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Signups */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-3 bg-mambo-panel border border-white/10 rounded-xl overflow-hidden"
          >
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-bold text-mambo-text">Recent Signups</h3>
              <a
                href="/admin/students"
                className="text-xs text-blue-400 hover:underline"
              >
                View All →
              </a>
            </div>
            <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
              {(stats?.recent_signups ?? []).length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No signups yet
                </div>
              ) : (
                (stats?.recent_signups ?? []).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {s.avatar_url ? (
                        <img
                          src={s.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser className="text-blue-400 text-xs" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-mambo-text truncate">
                        {s.first_name} {s.last_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{s.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <TierBadge tier={s.tier} />
                      <span className="text-xs text-gray-600">
                        {new Date(s.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Row 3: Top Lessons + World Stats + Quick Actions ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Lessons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-mambo-panel border border-white/10 rounded-xl overflow-hidden"
          >
            <div className="p-5 border-b border-white/10">
              <h3 className="font-bold text-mambo-text">Most Completed Lessons</h3>
              <p className="text-xs text-gray-500 mt-0.5">All-time completions</p>
            </div>
            <div className="divide-y divide-white/5">
              {(stats?.top_lessons ?? []).length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No data yet
                </div>
              ) : (
                (stats?.top_lessons ?? []).map((lesson, i) => (
                  <div key={lesson.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="text-xs font-bold text-gray-600 w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-mambo-text truncate flex items-center gap-1.5">
                        {lesson.is_boss_battle && (
                          <FaTrophy className="text-mambo-gold w-2.5 h-2.5 flex-shrink-0" />
                        )}
                        {lesson.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {lesson.world_title} › {lesson.level_title}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-blue-400 flex-shrink-0">
                      {lesson.completions}×
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* World Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-mambo-panel border border-white/10 rounded-xl overflow-hidden"
          >
            <div className="p-5 border-b border-white/10">
              <h3 className="font-bold text-mambo-text">Course Engagement</h3>
              <p className="text-xs text-gray-500 mt-0.5">Progress per world</p>
            </div>
            <div className="divide-y divide-white/5">
              {(stats?.world_stats ?? []).length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No published courses yet
                </div>
              ) : (
                (stats?.world_stats ?? []).map((world) => (
                  <div key={world.id} className="px-5 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-medium text-mambo-text truncate max-w-[60%]">
                        {world.title}
                      </p>
                      <span className="text-xs font-bold text-mambo-text">
                        {world.completion_rate}%
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 mb-1">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                        style={{ width: `${world.completion_rate}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {world.students_started} students · {world.total_completions} completions · {world.total_lessons} lessons
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-mambo-panel border border-white/10 rounded-xl p-5"
          >
            <h3 className="font-bold text-mambo-text mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  href: "/admin/grading",
                  icon: FaDumbbell,
                  label: "Grade Homework",
                  badge: stats?.pending_submissions,
                  color: "#f59e0b",
                },
                {
                  href: "/admin/coaching",
                  icon: FaVideo,
                  label: "Review Coaching",
                  badge: stats?.coaching_pending,
                  color: "#D4AF37",
                },
                {
                  href: "/admin/builder",
                  icon: FaStar,
                  label: "Course Builder",
                  badge: null,
                  color: "#3b82f6",
                },
                {
                  href: "/admin/live",
                  icon: FaFire,
                  label: "Live Meetings",
                  badge: null,
                  color: "#ef4444",
                },
                {
                  href: "/admin/students",
                  icon: FaUser,
                  label: "Students",
                  badge: null,
                  color: "#10b981",
                },
                {
                  href: "/admin/settings",
                  icon: FaCrown,
                  label: "Settings",
                  badge: null,
                  color: "#a855f7",
                },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <a
                    key={action.href}
                    href={action.href}
                    className="relative flex flex-col items-center justify-center gap-2 p-3 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.03] transition-all duration-200 group text-center"
                  >
                    <Icon
                      className="w-5 h-5 transition-colors"
                      style={{ color: action.color }}
                    />
                    <span className="text-xs font-medium text-gray-400 group-hover:text-mambo-text transition-colors leading-tight">
                      {action.label}
                    </span>
                    {action.badge != null && action.badge > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                        {action.badge > 9 ? "9+" : action.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
