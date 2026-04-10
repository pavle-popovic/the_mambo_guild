"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Save,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Link,
  Youtube,
  Calendar,
  Clock,
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface MeetingConfig {
  meeting_url: string | null;
  meeting_notes: string | null;
  updated_at: string | null;
}

interface ArchiveEntry {
  id: string;
  title: string;
  description: string | null;
  recorded_at: string;
  duration_minutes: number | null;
  youtube_url: string | null;
  thumbnail_url: string | null;
  topics: string[];
  is_published: boolean | null;
  r2_file_key: string | null;
}

interface ArchiveFormData {
  title: string;
  description: string;
  recorded_at: string;
  youtube_url: string;
  duration_minutes: string;
  topics: string;
  thumbnail_url: string;
  is_published: boolean;
}

const emptyForm: ArchiveFormData = {
  title: "",
  description: "",
  recorded_at: new Date().toISOString().split("T")[0],
  youtube_url: "",
  duration_minutes: "",
  topics: "",
  thumbnail_url: "",
  is_published: true,
};

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function AdminLivePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Meeting config state
  const [config, setConfig] = useState<MeetingConfig>({
    meeting_url: null,
    meeting_notes: null,
    updated_at: null,
  });
  const [configForm, setConfigForm] = useState({
    meeting_url: "",
    meeting_notes: "",
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  // Archives state
  const [archives, setArchives] = useState<ArchiveEntry[]>([]);
  const [loadingArchives, setLoadingArchives] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArchiveFormData>(emptyForm);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user) {
      loadConfig();
      loadArchives();
    }
  }, [user, authLoading, router]);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const loadConfig = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/premium/admin/weekly-meeting`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setConfigForm({
          meeting_url: data.meeting_url || "",
          meeting_notes: data.meeting_notes || "",
        });
      }
    } catch (e) {
      console.error("Failed to load config:", e);
    }
  };

  const saveConfig = async () => {
    setSavingConfig(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/premium/admin/weekly-meeting`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meeting_url: configForm.meeting_url || null,
            meeting_notes: configForm.meeting_notes || null,
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setConfigSaved(true);
        setTimeout(() => setConfigSaved(false), 2500);
        showToast("success", "Meeting link saved!");
      } else {
        showToast("error", "Failed to save meeting link.");
      }
    } catch (e) {
      showToast("error", "Failed to save meeting link.");
    } finally {
      setSavingConfig(false);
    }
  };

  const loadArchives = async () => {
    setLoadingArchives(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/premium/admin/archives`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setArchives(data);
      }
    } catch (e) {
      console.error("Failed to load archives:", e);
    } finally {
      setLoadingArchives(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (a: ArchiveEntry) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      description: a.description || "",
      recorded_at: a.recorded_at.split("T")[0],
      youtube_url: a.youtube_url || "",
      duration_minutes: a.duration_minutes?.toString() || "",
      topics: a.topics.join(", "),
      thumbnail_url: a.thumbnail_url || "",
      is_published: a.is_published ?? true,
    });
    setShowForm(true);
  };

  const submitForm = async () => {
    if (!form.title || !form.recorded_at) {
      showToast("error", "Title and date are required.");
      return;
    }
    setSubmittingForm(true);

    const payload = {
      title: form.title,
      description: form.description || null,
      recorded_at: new Date(form.recorded_at).toISOString(),
      youtube_url: form.youtube_url || null,
      duration_minutes: form.duration_minutes
        ? parseInt(form.duration_minutes)
        : null,
      topics: form.topics
        ? form.topics
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      thumbnail_url: form.thumbnail_url || null,
      is_published: form.is_published,
    };

    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/premium/admin/archives/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/premium/admin/archives`;

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("success", editingId ? "Recording updated!" : "Recording added!");
        setShowForm(false);
        setEditingId(null);
        loadArchives();
      } else {
        const err = await res.json();
        showToast("error", err.detail || "Failed to save recording.");
      }
    } catch (e) {
      showToast("error", "Failed to save recording.");
    } finally {
      setSubmittingForm(false);
    }
  };

  const togglePublished = async (a: ArchiveEntry) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/premium/admin/archives/${a.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_published: !a.is_published }),
        }
      );
      if (res.ok) {
        loadArchives();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteArchive = async (id: string) => {
    if (!confirm("Delete this recording? This cannot be undone.")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/premium/admin/archives/${id}`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) {
        showToast("success", "Recording deleted.");
        loadArchives();
      }
    } catch (e) {
      showToast("error", "Failed to delete.");
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen bg-mambo-dark flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="flex h-screen overflow-hidden bg-mambo-dark">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto p-4 pt-16 lg:pt-8 lg:p-8 ml-0 lg:ml-64">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-white">Live Meetings</h1>
          <p className="text-white/60">
            Manage the weekly VIP meeting link and recording vault
          </p>
        </header>

        {/* Section A: Meeting Link */}
        <div className="bg-mambo-panel border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Link className="w-5 h-5 text-amber-400" />
            Weekly Meeting Link
          </h2>
          <p className="text-sm text-white/50 mb-5">
            Every Wednesday at 7 PM GMT. This link is shown to all Guild Master
            members.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Meeting URL (Zoom / Google Meet)
              </label>
              <input
                type="url"
                value={configForm.meeting_url}
                onChange={(e) =>
                  setConfigForm((f) => ({ ...f, meeting_url: e.target.value }))
                }
                placeholder="https://zoom.us/j/..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Notes (optional — shown to members)
              </label>
              <textarea
                value={configForm.meeting_notes}
                onChange={(e) =>
                  setConfigForm((f) => ({
                    ...f,
                    meeting_notes: e.target.value,
                  }))
                }
                placeholder="e.g., 'Bring questions! Topic: Footwork & Timing'"
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-5">
            {config.updated_at && (
              <p className="text-xs text-white/40">
                Last updated:{" "}
                {new Date(config.updated_at).toLocaleString()}
              </p>
            )}
            <button
              onClick={saveConfig}
              disabled={savingConfig}
              className={cn(
                "ml-auto flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition",
                configSaved
                  ? "bg-green-500 text-white"
                  : "bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-60"
              )}
            >
              {savingConfig ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : configSaved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {configSaved ? "Saved!" : "Save Link"}
            </button>
          </div>
        </div>

        {/* Section B: Vault Recordings */}
        <div className="bg-mambo-panel border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-400" />
                Recording Vault
              </h2>
              <p className="text-sm text-white/50">
                Past session recordings linked via YouTube
              </p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Recording
            </button>
          </div>

          {/* Inline Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/30 border border-white/10 rounded-xl p-5 mb-5"
            >
              <h3 className="font-semibold text-white mb-4">
                {editingId ? "Edit Recording" : "Add New Recording"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Title *
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={form.recorded_at}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, recorded_at: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    YouTube URL
                  </label>
                  <input
                    value={form.youtube_url}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, youtube_url: e.target.value }))
                    }
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={form.duration_minutes}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        duration_minutes: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Topics (comma-separated)
                  </label>
                  <input
                    value={form.topics}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, topics: e.target.value }))
                    }
                    placeholder="timing, footwork, Q&A"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Thumbnail URL (optional)
                  </label>
                  <input
                    value={form.thumbnail_url}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, thumbnail_url: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={form.is_published}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_published: e.target.checked }))
                    }
                    className="w-4 h-4 rounded bg-white/10 border-white/20 text-amber-500 focus:ring-amber-500/50"
                  />
                  <label
                    htmlFor="is_published"
                    className="text-sm text-white/70"
                  >
                    Published (visible to members)
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={submitForm}
                  disabled={submittingForm}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-medium rounded-lg transition text-sm"
                >
                  {submittingForm ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingId ? "Update" : "Add Recording"}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-white/60 hover:text-white transition text-sm"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Archives list */}
          {loadingArchives ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : archives.length === 0 ? (
            <div className="text-center py-12">
              <Youtube className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">
                No recordings yet. Add your first recording above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {archives.map((a) => {
                const ytId = a.youtube_url
                  ? getYouTubeId(a.youtube_url)
                  : null;
                const thumbSrc = ytId
                  ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                  : a.thumbnail_url || null;

                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-4 p-3 bg-black/20 border border-white/5 rounded-xl"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 aspect-video rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
                      {thumbSrc ? (
                        <img
                          src={thumbSrc}
                          alt={a.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Youtube className="w-6 h-6 text-white/20" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {a.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-white/40 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(a.recorded_at).toLocaleDateString()}
                        </span>
                        {a.duration_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {a.duration_minutes} min
                          </span>
                        )}
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded",
                            a.youtube_url
                              ? "bg-green-500/20 text-green-400"
                              : "bg-white/10 text-white/40"
                          )}
                        >
                          {a.youtube_url ? "YouTube ✓" : "No Video"}
                        </span>
                        {a.topics.length > 0 && (
                          <span className="text-white/30">
                            {a.topics.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Published toggle */}
                    <button
                      onClick={() => togglePublished(a)}
                      className={cn(
                        "px-3 py-1 rounded text-xs font-medium transition whitespace-nowrap",
                        a.is_published
                          ? "bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400"
                          : "bg-white/10 text-white/40 hover:bg-green-500/20 hover:text-green-400"
                      )}
                    >
                      {a.is_published ? "Published" : "Draft"}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEdit(a)}
                      className="p-2 text-white/40 hover:text-amber-400 hover:bg-white/5 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteArchive(a.id)}
                      className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "fixed bottom-6 right-6 px-5 py-3 rounded-xl font-medium shadow-lg text-sm flex items-center gap-2 z-50",
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          )}
        >
          {toast.msg}
        </motion.div>
      )}
    </div>
  );
}
