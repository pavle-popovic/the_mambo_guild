"use client";

import { LocaleProvider } from "@/i18n/client";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale } from "@/i18n/config";

function getInitialLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp(`${LOCALE_COOKIE}=([^;]+)`));
  const val = match?.[1] as Locale | undefined;
  return val && (LOCALES as readonly string[]).includes(val) ? val : DEFAULT_LOCALE;
}

export default function LocaleProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider initialLocale={getInitialLocale()}>
      {children}
    </LocaleProvider>
  );
}
