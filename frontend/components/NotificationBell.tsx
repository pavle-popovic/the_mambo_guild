"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { useTranslations } from "@/i18n/useTranslations";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  reference_type: string | null;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
  actor_id?: string | null;
  actor_username?: string | null;
  actor_avatar_url?: string | null;
}

const KNOWN_TYPES = new Set([
  "reaction_received",
  "reply_received",
  "answer_accepted",
  "coaching_feedback_ready",
  "weekly_meeting_scheduled",
  "badge_earned",
]);

// New (post-migration) backend stores action-only messages like
// `liked your post "X"`. Legacy rows still have the actor name baked in
// (`Founder liked your post "X"`). Both regexes are tried in order so the
// dropdown keeps rendering correctly across the rolling deploy.
const MESSAGE_PATTERNS: Record<string, RegExp[]> = {
  reaction_received: [
    /^liked your post "(.+)"$/,
    /^(?:.+?) liked your post "(.+)"$/,
  ],
  reply_received: [
    /^replied to your post "(.+)"$/,
    /^(?:.+?) replied to your post "(.+)"$/,
  ],
  badge_earned: [/^You earned the (.+) badge!$/],
};

function extractPostTitle(type: string, message: string): string | null {
  const patterns = MESSAGE_PATTERNS[type];
  if (!patterns) return null;
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) return match[1] ?? null;
  }
  return null;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const t = useTranslations("notifications");

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await apiClient.getUnreadNotificationCount();
      setUnreadCount(data.unread_count);
    } catch (e) {
      console.error("[NotificationBell] unread-count failed:", e);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await apiClient.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("[NotificationBell] list failed:", e);
      setLoadError(e?.message || "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Poll for unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    pollInterval.current = setInterval(fetchUnreadCount, 30000);
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [fetchUnreadCount]);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiClient.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await apiClient.markNotificationRead(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
      } catch {}
    }
    // Navigate to referenced content if applicable
    const ref = notification.reference_type;
    const refId = notification.reference_id;
    if (ref === "post" && refId) {
      setIsOpen(false);
      window.location.href = `/community?post=${encodeURIComponent(refId)}`;
    } else if (ref === "badge") {
      setIsOpen(false);
      window.location.href = "/profile";
    } else if (ref === "coaching_submission") {
      setIsOpen(false);
      window.location.href = "/studio/coaching";
    } else if (ref === "weekly_meeting") {
      setIsOpen(false);
      window.location.href = "/studio/roundtable";
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return t("time.justNow");
    if (diffMins < 60) return t("time.minutesAgo", { minutes: diffMins });
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return t("time.hoursAgo", { hours: diffHours });
    const diffDays = Math.floor(diffHours / 24);
    return t("time.daysAgo", { days: diffDays });
  };

  const translateTitle = (n: Notification): string => {
    if (KNOWN_TYPES.has(n.type)) {
      const translated = t(`types.${n.type}.title`);
      if (translated && !translated.startsWith("types.")) return translated;
    }
    return n.title;
  };

  const translateMessage = (n: Notification): string => {
    if (!KNOWN_TYPES.has(n.type)) return n.message;

    if (n.type === "reaction_received" || n.type === "reply_received") {
      const postTitle = extractPostTitle(n.type, n.message);
      if (postTitle === null) return n.message;
      // Action-only translation key — the actor avatar+username render
      // separately. Falls back to the legacy `{name} ...` template (with
      // name stripped) for any locale that hasn't shipped the new key.
      const action = t(`types.${n.type}.action`, { postTitle });
      if (action && !action.startsWith("types.")) return action;
      const legacy = t(`types.${n.type}.message`, { name: "", postTitle });
      if (legacy && !legacy.startsWith("types.")) return legacy.trim();
      return n.message;
    }

    if (n.type === "badge_earned") {
      const match = n.message.match(MESSAGE_PATTERNS.badge_earned[0]);
      if (match) {
        const translated = t(`types.${n.type}.message`, { badgeName: match[1] });
        if (translated && !translated.startsWith("types.")) return translated;
      }
      return n.message;
    }

    const translated = t(`types.${n.type}.message`);
    if (translated && !translated.startsWith("types.")) return translated;
    return n.message;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white/70" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed left-4 right-4 top-16 lg:absolute lg:left-auto lg:right-0 lg:top-full lg:mt-2 lg:w-80 max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-[#1a1a2e]/95 backdrop-blur-xl shadow-2xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">{t("header")}</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-[#D4AF37] hover:text-[#FCE205] transition-colors"
                >
                  {t("markAllRead")}
                </button>
              )}
            </div>

            {/* Notification list */}
            {isLoading ? (
              <div className="p-6 text-center text-white/40 text-sm">{t("loading")}</div>
            ) : loadError ? (
              <div className="p-6 text-center text-red-400/80 text-xs">
                {t("loadError")}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-white/40 text-sm">
                {t("empty")}
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => {
                  const actorUsername = notification.actor_username;
                  const actorAvatar = notification.actor_avatar_url;
                  const profileHref = actorUsername ? `/u/${encodeURIComponent(actorUsername)}` : null;
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 cursor-pointer hover:bg-white/5 transition-colors ${
                        !notification.is_read ? "bg-white/[0.03]" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!notification.is_read && (
                          <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                        )}
                        {/* Avatar — only when the notification has an actor.
                            Stops propagation so clicking the avatar opens the
                            profile instead of navigating to the referenced post. */}
                        {profileHref && (
                          <Link
                            href={profileHref}
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                            className="flex-shrink-0 mt-0.5"
                          >
                            {actorAvatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={actorAvatar}
                                alt={actorUsername || ""}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 hover:ring-[#D4AF37]/60 transition"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-white/10 ring-1 ring-white/10 hover:ring-[#D4AF37]/60 transition flex items-center justify-center text-[11px] font-semibold text-white/70">
                                {(actorUsername?.[0] || "U").toUpperCase()}
                              </div>
                            )}
                          </Link>
                        )}
                        <div className={`min-w-0 flex-1 ${!notification.is_read || profileHref ? "" : "ml-4"}`}>
                          <p className="text-sm font-medium text-white/90">{translateTitle(notification)}</p>
                          <p className="text-xs text-white/50 mt-0.5">
                            {profileHref && (
                              <Link
                                href={profileHref}
                                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                                className="font-semibold text-white/80 hover:text-[#D4AF37] transition-colors"
                              >
                                @{actorUsername}
                              </Link>
                            )}
                            {profileHref && " "}
                            {translateMessage(notification)}
                          </p>
                          <p className="text-[10px] text-white/30 mt-1">{formatTime(notification.created_at)}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
