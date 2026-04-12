"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, type ReleaseScheduleItemDTO, type ReleaseScheduleItemInput } from "@/lib/api";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaGlobe,
  FaDatabase,
  FaEnvelope,
  FaVideo,
  FaCloud,
  FaBolt,
  FaUsers,
  FaCrown,
  FaStar,
  FaLink,
  FaPlus,
  FaTrash,
  FaSave,
  FaCalendarAlt,
} from "react-icons/fa";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Tab = "platform" | "email" | "meeting" | "releases";

interface WeeklyMeeting {
  meeting_url: string | null;
  meeting_notes: string | null;
  updated_at: string | null;
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-xl z-50 ${
        type === "success"
          ? "bg-green-500 text-white"
          : "bg-red-500 text-white"
      }`}
    >
      {type === "success" ? (
        <FaCheckCircle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <FaExclamationCircle className="w-4 h-4 flex-shrink-0" />
      )}
      {msg}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Status Row
// ---------------------------------------------------------------------------
function StatusRow({
  icon: Icon,
  label,
  value,
  status,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  status: "ok" | "warn" | "off";
}) {
  const dot =
    status === "ok"
      ? "bg-green-500"
      : status === "warn"
      ? "bg-yellow-500"
      : "bg-gray-600";
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400">{label}</p>
        <p className="text-xs text-gray-600 truncate">{value}</p>
      </div>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Platform Tab
// ---------------------------------------------------------------------------
function PlatformTab() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const waitlistMode = process.env.NEXT_PUBLIC_WAITLIST_MODE ?? "false";

  return (
    <div className="space-y-6">
      {/* Deployment info */}
      <div className="bg-mambo-panel border border-white/10 rounded-xl p-6">
        <h3 className="font-bold text-mambo-text mb-4">Platform Status</h3>
        <StatusRow
          icon={FaGlobe}
          label="Frontend"
          value="Vercel — themamboguild.com"
          status="ok"
        />
        <StatusRow
          icon={FaBolt}
          label="Backend"
          value={`Railway — ${apiUrl}`}
          status="ok"
        />
        <StatusRow
          icon={FaDatabase}
          label="Database"
          value="Supabase PostgreSQL (aws-1-eu-west-2)"
          status="ok"
        />
        <StatusRow
          icon={FaEnvelope}
          label="Email"
          value="Resend — pavlepopovic@themamboguild.com"
          status="ok"
        />
        <StatusRow
          icon={FaVideo}
          label="Video Hosting"
          value="Mux (stream.mux.com)"
          status="ok"
        />
        <StatusRow
          icon={FaCloud}
          label="File Storage"
          value="Cloudflare R2 — the-mambo-inn"
          status="ok"
        />
      </div>

      {/* Subscription Tiers */}
      <div className="bg-mambo-panel border border-white/10 rounded-xl p-6">
        <h3 className="font-bold text-mambo-text mb-1">Subscription Tiers</h3>
        <p className="text-xs text-gray-500 mb-4">
          Prices are configured in the Stripe dashboard. These are the MRR estimates used in the
          dashboard.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { tier: "Rookie", price: "Free", color: "#3b82f6", icon: FaStar, desc: "ChaChaCha choreo" },
            { tier: "Pro", price: "$39/mo", color: "#a855f7", icon: FaCrown, desc: "Full Guild access" },
            {
              tier: "Guild Master",
              price: "$59/mo",
              color: "#D4AF37",
              icon: FaBolt,
              desc: "1-on-1 feedback + Roundtable",
            },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.tier}
                className="border border-white/10 rounded-xl p-4 text-center"
              >
                <Icon
                  className="w-5 h-5 mx-auto mb-2"
                  style={{ color: t.color }}
                />
                <p className="font-bold text-sm text-mambo-text">{t.tier}</p>
                <p
                  className="text-lg font-bold mt-1"
                  style={{ color: t.color }}
                >
                  {t.price}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform config flags */}
      <div className="bg-mambo-panel border border-white/10 rounded-xl p-6">
        <h3 className="font-bold text-mambo-text mb-4">Config Flags</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-mambo-text">Waitlist Mode</p>
              <p className="text-xs text-gray-500">
                Controls whether new registrations go through the waitlist flow
              </p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                waitlistMode === "true"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-green-500/20 text-green-400"
              }`}
            >
              {waitlistMode === "true" ? "ON" : "OFF"}
            </span>
          </div>
          <div className="border-t border-white/5 pt-3">
            <p className="text-xs text-gray-600">
              To toggle, set <code className="bg-white/5 px-1 rounded">NEXT_PUBLIC_WAITLIST_MODE</code> in your Vercel environment variables and
              redeploy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Email Broadcast Tab
// ---------------------------------------------------------------------------
function EmailTab() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const TIERS = [
    { value: "all", label: "All Students", icon: FaUsers, color: "#6b7280" },
    { value: "rookie", label: "Rookie Only", icon: FaStar, color: "#3b82f6" },
    { value: "advanced", label: "Advanced Only", icon: FaCrown, color: "#a855f7" },
    { value: "performer", label: "Guild Masters Only", icon: FaBolt, color: "#D4AF37" },
  ];

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      setToast({ msg: "Subject and message are required.", type: "error" });
      return;
    }
    setConfirmOpen(true);
  };

  const confirmSend = async () => {
    setConfirmOpen(false);
    setSending(true);
    try {
      const res = await apiClient.sendAnnouncement(subject, message, tierFilter);
      setResult({ sent: res.sent_count, failed: res.failed_count });
      setToast({ msg: `Sent to ${res.sent_count} students!`, type: "success" });
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setToast({ msg: err?.message ?? "Failed to send.", type: "error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-mambo-panel border border-white/10 rounded-xl p-6">
        <h3 className="font-bold text-mambo-text mb-1">Send Announcement</h3>
        <p className="text-xs text-gray-500 mb-5">
          Compose and send a branded email to your students. Uses Resend.
        </p>

        {/* Audience */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Audience
          </label>
          <div className="flex flex-wrap gap-2">
            {TIERS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  onClick={() => setTierFilter(t.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                    tierFilter === t.value
                      ? "border-current"
                      : "border-white/10 text-gray-500 hover:text-gray-300"
                  }`}
                  style={
                    tierFilter === t.value
                      ? { color: t.color, background: `${t.color}15`, borderColor: t.color }
                      : {}
                  }
                >
                  <Icon className="w-3 h-3" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. New lesson this week — check it out!"
            maxLength={100}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-mambo-text placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-mambo-gold/40 text-sm"
          />
        </div>

        {/* Message */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here. New lines are preserved."
            rows={6}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-mambo-text placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-mambo-gold/40 text-sm resize-none"
          />
          <p className="text-xs text-gray-600 mt-1">
            The message will be wrapped in The Mambo Guild branded email template
            automatically.
          </p>
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !subject.trim() || !message.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-mambo-gold hover:bg-yellow-400 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-black font-bold rounded-lg transition text-sm"
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <FaEnvelope className="w-4 h-4" />
              Send Announcement
            </>
          )}
        </button>

        {result && (
          <p className="text-xs text-gray-500 mt-3">
            Last send: {result.sent} delivered
            {result.failed > 0 && (
              <span className="text-red-400"> · {result.failed} failed</span>
            )}
          </p>
        )}
      </div>

      {/* Preview */}
      {(subject || message) && (
        <div className="bg-mambo-panel border border-white/10 rounded-xl p-6">
          <h3 className="font-bold text-mambo-text mb-4">Email Preview</h3>
          <div className="bg-[#F9F7F1] rounded-xl p-6 text-[#333] font-serif max-w-md">
            <div className="inline-block bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-widest px-3 py-1 rounded mb-4">
              The Mambo Guild
            </div>
            <p className="text-base mb-3">Hi [Student Name],</p>
            <p className="text-sm whitespace-pre-wrap leading-relaxed text-[#444]">
              {message || "Your message will appear here…"}
            </p>
            <hr className="border-[#ddd] my-4" />
            <p className="text-xs text-[#999] italic">
              You're receiving this because you're a member of The Mambo Guild.
              <br />— Pavle &amp; The Mambo Guild Team
            </p>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-mambo-panel border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-mambo-text mb-2">
                Confirm Broadcast
              </h3>
              <p className="text-sm text-gray-400 mb-1">
                Subject: <span className="text-mambo-text font-medium">{subject}</span>
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Audience:{" "}
                <span className="text-mambo-text font-medium capitalize">
                  {tierFilter === "all" ? "All Students" : tierFilter}
                </span>
              </p>
              <p className="text-xs text-yellow-400 mb-5">
                This will send real emails immediately via Resend. This action cannot be
                undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 py-2.5 border border-white/10 rounded-lg text-gray-400 hover:text-mambo-text text-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSend}
                  className="flex-1 py-2.5 bg-mambo-gold text-black font-bold rounded-lg text-sm hover:bg-yellow-400 transition"
                >
                  Send Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <Toast
            msg={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Weekly Meeting Tab
// ---------------------------------------------------------------------------
function MeetingTab() {
  const [meeting, setMeeting] = useState<WeeklyMeeting | null>(null);
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient.getWeeklyMeetingAdmin();
        setMeeting(data);
        setUrl(data.meeting_url ?? "");
        setNotes(data.meeting_notes ?? "");
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const data = await apiClient.updateWeeklyMeeting(url, notes);
      setMeeting(data);
      setToast({ msg: "Meeting config saved!", type: "success" });
    } catch (err: any) {
      setToast({ msg: err?.message ?? "Failed to save.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-mambo-gold/30 border-t-mambo-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-mambo-panel border border-white/10 rounded-xl p-6">
        <h3 className="font-bold text-mambo-text mb-1">Weekly Roundtable Link</h3>
        <p className="text-xs text-gray-500 mb-5">
          This link is shown to all active Guild Master (Performer) subscribers. Update it
          before each weekly call.
        </p>

        {meeting?.updated_at && (
          <p className="text-xs text-gray-600 mb-4">
            Last updated:{" "}
            {new Date(meeting.updated_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}

        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Zoom / Meet URL
          </label>
          <div className="relative">
            <FaLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-3.5 h-3.5" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://zoom.us/j/..."
              className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-mambo-text placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-mambo-gold/40 text-sm"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Notes for Students (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. This week we'll focus on timing and musicality. Bring questions!"
            rows={3}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-mambo-text placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-mambo-gold/40 text-sm resize-none"
          />
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-mambo-gold hover:bg-yellow-400 disabled:bg-white/10 disabled:text-white/30 text-black font-bold rounded-lg transition text-sm"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            "Save Meeting Link"
          )}
        </button>
      </div>

      {/* Current state preview */}
      {url && (
        <div className="bg-mambo-panel border border-white/10 rounded-xl p-6">
          <h4 className="text-sm font-bold text-mambo-text mb-3">What Guild Masters Will See</h4>
          <div className="border border-mambo-gold/20 bg-mambo-gold/5 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-mambo-gold/20 flex items-center justify-center flex-shrink-0">
              <FaVideo className="text-mambo-gold w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-mambo-text text-sm">Weekly Roundtable</p>
              {notes && <p className="text-xs text-gray-400 truncate mt-0.5">{notes}</p>}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-mambo-gold hover:underline truncate block mt-0.5"
              >
                {url}
              </a>
            </div>
          </div>
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Release Schedule Tab
// ---------------------------------------------------------------------------
type DraftItem = {
  id: string; // client key (server UUID or `new-${n}`)
  serverId: string | null; // null = unsaved
  release_date: string;
  title: string;
  artist: string;
  release_type: "choreo" | "course";
  level: "beginner" | "intermediate" | "advanced" | "mastery";
  featured: boolean;
  dirty: boolean;
};

const LEVEL_LABELS: Record<DraftItem["level"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  mastery: "Mastery",
};

const LEVEL_DOT: Record<DraftItem["level"], string> = {
  beginner: "bg-emerald-400",
  intermediate: "bg-cyan-400",
  advanced: "bg-rose-400",
  mastery: "bg-amber-300",
};

function dtoToDraft(dto: ReleaseScheduleItemDTO): DraftItem {
  return {
    id: dto.id,
    serverId: dto.id,
    release_date: dto.release_date,
    title: dto.title,
    artist: dto.artist ?? "",
    release_type: dto.release_type,
    level: dto.level,
    featured: dto.featured,
    dirty: false,
  };
}

function ReleaseScheduleTab() {
  const [items, setItems] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [newCounter, setNewCounter] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getReleaseScheduleAdmin();
      setItems(data.map(dtoToDraft));
    } catch (err: any) {
      setToast({ msg: err?.message ?? "Failed to load releases.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = <K extends keyof DraftItem>(id: string, field: K, value: DraftItem[K]) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value, dirty: true } : it))
    );
  };

  const addNew = () => {
    const tempId = `new-${newCounter}`;
    setNewCounter((c) => c + 1);
    const today = new Date().toISOString().slice(0, 10);
    setItems((prev) => [
      ...prev,
      {
        id: tempId,
        serverId: null,
        release_date: today,
        title: "",
        artist: "",
        release_type: "choreo",
        level: "beginner",
        featured: false,
        dirty: true,
      },
    ]);
  };

  const save = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (!item.title.trim() || !item.release_date) {
      setToast({ msg: "Title and date are required.", type: "error" });
      return;
    }
    setSaving(id);
    try {
      const payload: ReleaseScheduleItemInput = {
        release_date: item.release_date,
        title: item.title.trim(),
        artist: item.artist.trim() || null,
        release_type: item.release_type,
        level: item.level,
        featured: item.featured,
      };
      let saved: ReleaseScheduleItemDTO;
      if (item.serverId) {
        saved = await apiClient.updateReleaseScheduleItem(item.serverId, payload);
      } else {
        saved = await apiClient.createReleaseScheduleItem(payload);
      }
      setItems((prev) => prev.map((i) => (i.id === id ? dtoToDraft(saved) : i)));
      setToast({ msg: "Release saved.", type: "success" });
    } catch (err: any) {
      setToast({ msg: err?.message ?? "Save failed.", type: "error" });
    } finally {
      setSaving(null);
    }
  };

  const remove = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (!item.serverId) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    if (!confirm(`Delete "${item.title || "this release"}"?`)) return;
    try {
      await apiClient.deleteReleaseScheduleItem(item.serverId);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setToast({ msg: "Release deleted.", type: "success" });
    } catch (err: any) {
      setToast({ msg: err?.message ?? "Delete failed.", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-mambo-gold/30 border-t-mambo-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-mambo-panel border border-white/10 rounded-xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <h3 className="font-bold text-mambo-text flex items-center gap-2">
              <FaCalendarAlt className="text-mambo-gold w-4 h-4" />
              Release Schedule
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              These drops appear on the landing page "Road Ahead" section and in the courses page release calendar popover.
            </p>
          </div>
          <button
            onClick={addNew}
            className="flex items-center gap-1.5 px-3 py-2 bg-mambo-gold hover:bg-yellow-400 text-black text-xs font-bold rounded-lg transition flex-shrink-0"
          >
            <FaPlus className="w-3 h-3" /> Add Release
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <div className="bg-mambo-panel border border-white/10 rounded-xl p-10 text-center text-sm text-gray-500">
          No releases yet. Click "Add Release" to create the first one.
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`bg-mambo-panel border rounded-xl p-4 transition ${
              item.dirty ? "border-mambo-gold/50" : "border-white/10"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Date */}
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Release Date
                </label>
                <input
                  type="date"
                  value={item.release_date}
                  onChange={(e) => updateField(item.id, "release_date", e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-mambo-text text-sm focus:outline-none focus:ring-2 focus:ring-mambo-gold/40"
                />
              </div>

              {/* Title */}
              <div className="sm:col-span-5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateField(item.id, "title", e.target.value)}
                  placeholder="e.g. Soneros de Bailadores"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-mambo-text text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-mambo-gold/40"
                />
              </div>

              {/* Artist */}
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Artist / Subtitle
                </label>
                <input
                  type="text"
                  value={item.artist}
                  onChange={(e) => updateField(item.id, "artist", e.target.value)}
                  placeholder="e.g. Cheo Feliciano"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-mambo-text text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-mambo-gold/40"
                />
              </div>

              {/* Type */}
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Type
                </label>
                <select
                  value={item.release_type}
                  onChange={(e) => updateField(item.id, "release_type", e.target.value as DraftItem["release_type"])}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-mambo-text text-sm focus:outline-none focus:ring-2 focus:ring-mambo-gold/40"
                >
                  <option value="choreo">Choreography</option>
                  <option value="course">Course</option>
                </select>
              </div>

              {/* Level */}
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Level
                </label>
                <div className="relative">
                  <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${LEVEL_DOT[item.level]}`} />
                  <select
                    value={item.level}
                    onChange={(e) => updateField(item.id, "level", e.target.value as DraftItem["level"])}
                    className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-mambo-text text-sm focus:outline-none focus:ring-2 focus:ring-mambo-gold/40"
                  >
                    {Object.entries(LEVEL_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Featured */}
              <div className="sm:col-span-2 flex items-end">
                <label className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={item.featured}
                    onChange={(e) => updateField(item.id, "featured", e.target.checked)}
                    className="accent-mambo-gold"
                  />
                  <span className="text-xs text-gray-300">Featured</span>
                </label>
              </div>

              {/* Actions */}
              <div className="sm:col-span-3 flex items-end gap-2">
                <button
                  onClick={() => save(item.id)}
                  disabled={!item.dirty || saving === item.id}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-mambo-gold hover:bg-yellow-400 disabled:bg-white/10 disabled:text-white/30 text-black text-xs font-bold rounded-lg transition"
                >
                  {saving === item.id ? (
                    <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <FaSave className="w-3 h-3" />
                  )}
                  {item.serverId ? "Save" : "Create"}
                </button>
                <button
                  onClick={() => remove(item.id)}
                  className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-gray-500 rounded-lg transition"
                  title="Delete"
                >
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("platform");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="h-screen bg-mambo-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-mambo-gold/30 border-t-mambo-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "platform", label: "Platform" },
    { id: "email", label: "Email Broadcast" },
    { id: "meeting", label: "Weekly Meeting" },
    { id: "releases", label: "Release Schedule" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-mambo-dark">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-4 pt-16 lg:pt-8 lg:p-8 ml-0 lg:ml-64">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-mambo-text">Settings</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Platform controls and configurations
          </p>
        </motion.header>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-mambo-panel text-mambo-text shadow"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "platform" && <PlatformTab />}
            {activeTab === "email" && <EmailTab />}
            {activeTab === "meeting" && <MeetingTab />}
            {activeTab === "releases" && <ReleaseScheduleTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
