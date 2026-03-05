"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import {
  FaSearch,
  FaUser,
  FaTimes,
  FaFire,
  FaTrophy,
  FaStar,
  FaCoins,
  FaMedal,
  FaCheckCircle,
  FaExclamationCircle,
  FaChevronRight,
} from "react-icons/fa";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Student {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  xp: number;
  level: number;
  streak_count: number;
  created_at: string;
  role: string;
}

type StudentDetail = Awaited<ReturnType<typeof apiClient.getStudentDetail>>;

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

const STATUS_COLORS: Record<string, string> = {
  active: "#10b981",
  trialing: "#3b82f6",
  past_due: "#f59e0b",
  canceled: "#ef4444",
  incomplete: "#6b7280",
};

function TierBadge({ tier }: { tier: string | null }) {
  if (!tier) return <span className="text-xs text-gray-500">—</span>;
  const color = TIER_COLORS[tier] ?? "#6b7280";
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${color}22`, color }}
    >
      {TIER_LABELS[tier] ?? tier}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
function Toast({
  msg,
  type,
  onClose,
}: {
  msg: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-xl z-[9999] ${
        type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      {type === "success" ? (
        <FaCheckCircle className="w-4 h-4" />
      ) : (
        <FaExclamationCircle className="w-4 h-4" />
      )}
      {msg}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Student Detail Slide-over
// ---------------------------------------------------------------------------
function StudentSlideOver({
  userId,
  onClose,
  onXpGranted,
}: {
  userId: string;
  onClose: () => void;
  onXpGranted: (newXp: number, newLevel: number) => void;
}) {
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [xpAmount, setXpAmount] = useState("");
  const [granting, setGranting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient.getStudentDetail(userId);
        setDetail(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handleGrantXP = async () => {
    const amount = parseInt(xpAmount, 10);
    if (!amount || amount <= 0 || amount > 10000) {
      setToast({ msg: "Enter a valid amount (1–10000)", type: "error" });
      return;
    }
    setGranting(true);
    try {
      const res = await apiClient.grantXP(userId, amount);
      setToast({ msg: res.message, type: "success" });
      setXpAmount("");
      onXpGranted(res.new_xp, res.new_level);
      if (detail) {
        setDetail({ ...detail, xp: res.new_xp, level: res.new_level });
      }
    } catch (err: any) {
      setToast({ msg: err?.message ?? "Failed to grant XP", type: "error" });
    } finally {
      setGranting(false);
    }
  };

  const xpToNextLevel = detail ? 1000 - (detail.xp % 1000) : 0;
  const xpPct = detail ? ((detail.xp % 1000) / 1000) * 100 : 0;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-mambo-panel border-l border-white/10 z-50 overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-mambo-panel border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-mambo-text">Student Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-mambo-text hover:bg-white/10 transition"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-mambo-gold/30 border-t-mambo-gold rounded-full animate-spin" />
          </div>
        ) : !detail ? (
          <div className="p-6 text-center text-gray-500">Student not found</div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Identity */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                {detail.avatar_url ? (
                  <img src={detail.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <FaUser className="text-blue-400 w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-mambo-text text-lg">
                  {detail.first_name} {detail.last_name}
                </h3>
                {detail.username && (
                  <p className="text-gray-500 text-xs">@{detail.username}</p>
                )}
                <p className="text-gray-400 text-sm">{detail.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <TierBadge tier={detail.sub_tier} />
                  <span
                    className="text-xs font-medium capitalize"
                    style={{ color: STATUS_COLORS[detail.sub_status ?? ""] ?? "#6b7280" }}
                  >
                    {detail.sub_status ?? "No sub"}
                  </span>
                </div>
              </div>
            </div>

            {/* XP Bar */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-medium">
                  Level {detail.level}
                </span>
                <span className="text-xs text-gray-500">
                  {detail.xp.toLocaleString()} XP · {xpToNextLevel} to next
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: FaFire, label: "Streak", value: `${detail.streak_count}d`, color: "#f59e0b" },
                { icon: FaCoins, label: "Claves", value: detail.current_claves.toLocaleString(), color: "#D4AF37" },
                { icon: FaStar, label: "Reputation", value: detail.reputation.toLocaleString(), color: "#a855f7" },
                { icon: FaTrophy, label: "Completed", value: detail.lessons_completed, color: "#10b981" },
                {
                  icon: FaMedal,
                  label: "Boss Battles",
                  value: `${detail.boss_battles_passed}/${detail.boss_battles_attempted}`,
                  color: "#ef4444",
                },
                {
                  icon: FaStar,
                  label: "Referrals",
                  value: detail.referral_count,
                  color: "#3b82f6",
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white/5 rounded-xl p-3 text-center">
                    <Icon
                      className="w-4 h-4 mx-auto mb-1"
                      style={{ color: stat.color }}
                    />
                    <p
                      className="text-base font-bold"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Subscription Details */}
            {detail.sub_tier && (
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Subscription
                </h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plan</span>
                    <TierBadge tier={detail.sub_tier} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span
                      className="font-medium capitalize"
                      style={{ color: STATUS_COLORS[detail.sub_status ?? ""] ?? "#6b7280" }}
                    >
                      {detail.sub_status}
                    </span>
                  </div>
                  {detail.sub_period_end && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Period ends</span>
                      <span className="text-mambo-text text-xs">
                        {new Date(detail.sub_period_end).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {detail.referral_code && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Referral code</span>
                      <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-mambo-gold">
                        {detail.referral_code}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Lessons */}
            {detail.recent_lessons.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Recently Completed
                </h4>
                <div className="space-y-2">
                  {detail.recent_lessons.map((lesson) => (
                    <div key={lesson.lesson_id} className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          lesson.is_boss_battle ? "bg-mambo-gold" : "bg-green-500"
                        }`}
                      />
                      <span className="text-xs text-mambo-text truncate flex-1">
                        {lesson.title}
                      </span>
                      <span className="text-xs text-gray-600 flex-shrink-0">
                        +{lesson.xp_value} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grant XP */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Grant XP (Admin)
              </h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={xpAmount}
                  onChange={(e) => setXpAmount(e.target.value)}
                  placeholder="Amount (1–10000)"
                  min={1}
                  max={10000}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-mambo-text placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-mambo-gold/40 text-sm"
                />
                <button
                  onClick={handleGrantXP}
                  disabled={granting || !xpAmount}
                  className="px-4 py-2 bg-mambo-gold hover:bg-yellow-400 disabled:bg-white/10 disabled:text-white/30 text-black font-bold rounded-lg text-sm transition"
                >
                  {granting ? "…" : "Grant"}
                </button>
              </div>
            </div>

            {/* Meta */}
            <p className="text-xs text-gray-600 text-center">
              Joined{" "}
              {new Date(detail.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {" · "}Role: <span className="capitalize">{detail.role}</span>
            </p>
          </div>
        )}

        <AnimatePresence>
          {toast && (
            <Toast
              msg={toast.msg}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
const TIER_FILTERS = [
  { value: "all", label: "All" },
  { value: "rookie", label: "Rookie" },
  { value: "advanced", label: "Advanced" },
  { value: "performer", label: "Guild Master" },
  { value: "none", label: "No Sub" },
];

export default function AdminStudentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user) loadStudents();
  }, [user, authLoading]);

  useEffect(() => {
    if (user) loadStudents();
  }, [searchTerm]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getStudents(searchTerm || undefined, 0, 200);
      setStudents(data);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen bg-mambo-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-mambo-gold/30 border-t-mambo-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex h-screen overflow-hidden bg-mambo-dark">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-8 ml-64">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-mambo-text">Students</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {students.length} total registered users
          </p>
        </motion.header>

        {/* Search + Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-mambo-panel border border-white/10 rounded-lg text-mambo-text placeholder-gray-500 focus:outline-none focus:border-mambo-gold/50 text-sm"
            />
          </div>
          <div className="flex gap-1.5 bg-white/5 rounded-lg p-1">
            {TIER_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setTierFilter(f.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  tierFilter === f.value
                    ? "bg-mambo-panel text-mambo-text shadow"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-mambo-panel border border-white/10 rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/[0.03] border-b border-white/10">
                <tr>
                  {["Student", "Email", "XP", "Level", "Streak", "Joined", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                      No students found
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-white/[0.02] transition cursor-pointer"
                      onClick={() => setSelectedUserId(student.id)}
                    >
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                            <FaUser className="text-blue-400 text-xs" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-mambo-text">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{student.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-gray-400 text-sm">
                        {student.email}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-mambo-text font-medium text-sm">
                        {student.xp.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600/20 text-blue-400">
                          Lv {student.level}
                        </span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-gray-400 text-sm">
                        <span className="flex items-center gap-1">
                          <FaFire className="text-orange-400 w-3 h-3" />
                          {student.streak_count}d
                        </span>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-gray-500 text-xs">
                        {new Date(student.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <FaChevronRight className="text-gray-600 w-3 h-3" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>

      {/* Student Slide-over */}
      <AnimatePresence>
        {selectedUserId && (
          <StudentSlideOver
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
            onXpGranted={() => loadStudents()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
