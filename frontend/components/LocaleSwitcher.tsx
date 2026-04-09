"use client";

/**
 * LocaleSwitcher — language selector dropdown.
 *
 * Uses the useSetLocale hook from i18n/client.tsx.
 * Writes the NEXT_LOCALE cookie and triggers router.refresh().
 * No page reload, no route change — next-intl re-hydrates via RSC.
 *
 * USAGE (in NavBar or a settings page):
 *   import LocaleSwitcher from '@/components/LocaleSwitcher';
 *   <LocaleSwitcher />
 *
 * COMPACT VERSION (icon + flag only, no text):
 *   <LocaleSwitcher compact />
 */

import { useState, useRef, useEffect } from "react";
import { useLocale, useSetLocale } from "@/i18n/client";
import { LOCALES, LOCALE_META } from "@/i18n/config";
import { Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LocaleSwitcherProps {
  /** Show flag + native name (default) vs flag only */
  compact?: boolean;
  /** Extra classes on the trigger button */
  className?: string;
}

export default function LocaleSwitcher({ compact = false, className }: LocaleSwitcherProps) {
  const locale = useLocale();
  const { setLocale, isPending } = useSetLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const current = LOCALE_META[locale];

  return (
    <div ref={ref} className="relative">
      {/* ── Trigger ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        aria-label="Switch language"
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5",
          "text-sm font-medium text-white/70 hover:text-white",
          "bg-white/5 hover:bg-white/10 border border-white/10",
          "transition-all duration-150 cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        {isPending ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="inline-block"
          >
            <Globe size={14} />
          </motion.span>
        ) : (
          <Globe size={14} />
        )}
        <span>{current.flag}</span>
        {!compact && (
          <span className="hidden sm:inline max-w-[80px] truncate">
            {current.nativeName}
          </span>
        )}
        <svg
          className={cn("w-3 h-3 transition-transform duration-200", open && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Select language"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute right-0 mt-1 z-50",
              "w-52 max-h-80 overflow-y-auto",
              "rounded-xl border border-white/10",
              "bg-[#0d0d0d]/95 backdrop-blur-xl shadow-2xl",
              "py-1"
            )}
          >
            {LOCALES.map((code) => {
              const meta = LOCALE_META[code];
              const isActive = code === locale;
              return (
                <li key={code} role="option" aria-selected={isActive}>
                  <button
                    onClick={() => {
                      setLocale(code);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2",
                      "text-sm text-left transition-colors duration-100",
                      isActive
                        ? "text-white bg-white/10 font-medium"
                        : "text-white/60 hover:text-white hover:bg-white/5",
                      // RTL languages: push the tick to the left
                      meta.dir === "rtl" && "flex-row-reverse"
                    )}
                  >
                    <span className="text-base leading-none">{meta.flag}</span>
                    <span className="flex-1 truncate">{meta.nativeName}</span>
                    {isActive && (
                      <svg
                        className="w-3.5 h-3.5 text-blue-400 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
