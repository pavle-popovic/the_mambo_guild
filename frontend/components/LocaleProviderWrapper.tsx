"use client";

import { LocaleProvider } from "@/i18n/client";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale } from "@/i18n/config";

function isValidLocale(v: string | null | undefined): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

function getInitialLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  // 1) Cookie (used by server middleware)
  const match = document.cookie.match(new RegExp(`${LOCALE_COOKIE}=([^;]+)`));
  const cookieVal = match?.[1];
  if (isValidLocale(cookieVal)) return cookieVal;
  // 2) localStorage fallback (bug 18 — Safari iOS purges cookies).
  //    If found, re-write the cookie so server reads match.
  try {
    const lsVal = window.localStorage.getItem(LOCALE_COOKIE);
    if (isValidLocale(lsVal)) {
      document.cookie = `${LOCALE_COOKIE}=${lsVal}; path=/; max-age=31536000; SameSite=Lax`;
      return lsVal;
    }
  } catch {}
  return DEFAULT_LOCALE;
}

export default function LocaleProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider initialLocale={getInitialLocale()}>
      {children}
    </LocaleProvider>
  );
}
