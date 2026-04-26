'use client';

/**
 * Client-side locale management.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW IT WORKS
 * ─────────────────────────────────────────────────────────────────────────────
 * • next-intl reads the locale from a cookie (`NEXT_LOCALE`) via middleware.
 * • This module provides:
 *     - `useLocale()`     → current locale string
 *     - `useSetLocale()`  → function to switch locale (writes cookie + refreshes)
 *     - `LocaleProvider`  → wraps the app so useLocale is available everywhere
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * INTEGRATION (app/layout.tsx)
 * ─────────────────────────────────────────────────────────────────────────────
 * import { NextIntlClientProvider } from 'next-intl';
 * import { LocaleProvider } from '@/i18n/client';
 *
 * export default async function RootLayout({ children }) {
 *   // locale + messages come from i18n/request.ts (server)
 *   return (
 *     <html lang={locale} dir={LOCALE_META[locale].dir}>
 *       <body>
 *         <NextIntlClientProvider locale={locale} messages={messages}>
 *           <LocaleProvider initialLocale={locale}>
 *             {children}
 *           </LocaleProvider>
 *         </NextIntlClientProvider>
 *       </body>
 *     </html>
 *   );
 * }
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, LOCALE_META, type Locale } from './config';
import { isReadyVariant } from './seo-routing';

const NON_DEFAULT_LOCALES: ReadonlySet<string> = new Set(
  LOCALES.filter((l) => l !== 'en')
);

/**
 * Strip a leading /<locale>/ segment if present, returning the unprefixed path.
 * E.g. "/fr/blog/mambo-history" -> "/blog/mambo-history", "/blog" -> "/blog".
 */
function stripLocalePrefix(path: string): { unprefixed: string; hadPrefix: boolean } {
  const segs = path.split('/').filter(Boolean);
  if (segs.length >= 1 && NON_DEFAULT_LOCALES.has(segs[0])) {
    return { unprefixed: '/' + segs.slice(1).join('/'), hadPrefix: true };
  }
  return { unprefixed: path || '/', hadPrefix: false };
}

/**
 * Decide which URL the user should land on after switching to `next`.
 * Three cases:
 *  1. Current path is a SEO route AND `next` has a ready variant → /<next>/<path>
 *  2. Current path is /<oldLocale>/<seo-path> AND `next` won't render localized
 *     (either next === "en", or no ready variant) → strip prefix to /<seo-path>
 *  3. Otherwise → stay on the same URL (cookie + refresh handles the chrome).
 */
function targetPathForLocale(currentPath: string, next: Locale): string {
  const { unprefixed } = stripLocalePrefix(currentPath);
  const hasReady = next !== 'en' && isReadyVariant(unprefixed, next);
  if (hasReady) return `/${next}${unprefixed}`;
  return unprefixed;
}

/** Detect the locale that the URL or cookie wants us to be in. */
function detectClientLocale(pathname: string): Locale | null {
  if (typeof document === 'undefined') return null;

  // 1) URL prefix wins — when the user is on /<locale>/<path>, the rendered
  //    body is in <locale>, so the chrome MUST match. The middleware sets the
  //    cookie too, but on a first visit the cookie isn't yet visible to the
  //    SSR pass.
  const segs = pathname.split('/').filter(Boolean);
  if (segs.length >= 1 && NON_DEFAULT_LOCALES.has(segs[0])) {
    return segs[0] as Locale;
  }

  // 2) Cookie set by middleware or a previous selector click.
  const cookieMatch = document.cookie.match(new RegExp(`${LOCALE_COOKIE}=([^;]+)`));
  const cookieVal = cookieMatch?.[1];
  if (cookieVal && (LOCALES as readonly string[]).includes(cookieVal)) {
    return cookieVal as Locale;
  }

  // 3) localStorage fallback (Safari iOS purges cookies aggressively).
  try {
    const lsVal = window.localStorage.getItem(LOCALE_COOKIE);
    if (lsVal && (LOCALES as readonly string[]).includes(lsVal)) {
      return lsVal as Locale;
    }
  } catch {}

  return null;
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isPending: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // After mount, sync state with the actual current locale source. Two
  // critical cases this handles:
  //   1. SSR rendered with DEFAULT_LOCALE because document is undefined
  //      server-side, but the client cookie says something else.
  //   2. User landed on /<locale>/<seo-path>: the URL is the source of truth
  //      for the rendered body; the chrome must match it, even if the
  //      previous-session cookie disagreed.
  // We re-run when pathname changes so locale-prefix navigations stay synced.
  useEffect(() => {
    const detected = detectClientLocale(pathname || '/') ?? DEFAULT_LOCALE;
    if (detected !== locale) {
      setLocaleState(detected);
      document.documentElement.lang = detected;
      document.documentElement.dir = LOCALE_META[detected].dir;
      // If the URL forced a locale change, re-pin the cookie so subsequent
      // requests (and future SSRs) agree with the URL.
      const cookieMatch = document.cookie.match(new RegExp(`${LOCALE_COOKIE}=([^;]+)`));
      if (cookieMatch?.[1] !== detected) {
        document.cookie = [
          `${LOCALE_COOKIE}=${detected}`,
          'path=/',
          'max-age=31536000',
          'SameSite=Lax',
        ].join('; ');
        try {
          window.localStorage.setItem(LOCALE_COOKIE, detected);
        } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const setLocale = useCallback(
    (next: Locale) => {
      if (!(LOCALES as readonly string[]).includes(next)) return;

      // Persist choice in a cookie (1 year, SameSite=Lax, works on all paths)
      document.cookie = [
        `${LOCALE_COOKIE}=${next}`,
        'path=/',
        'max-age=31536000',
        'SameSite=Lax',
      ].join('; ');

      // Also persist in localStorage as a fallback for Safari private mode
      // and other environments where cookies can be purged aggressively
      // (bug 18 — Spanish stuck on iOS Safari).
      try {
        window.localStorage.setItem(LOCALE_COOKIE, next);
      } catch {
        // Private mode throws on setItem; cookie alone is the fallback.
      }

      // Set <html lang> and dir immediately for instant visual feedback
      document.documentElement.lang = next;
      document.documentElement.dir = LOCALE_META[next].dir;

      // Update the React state so all consumers (chrome, selector itself)
      // re-render with the new locale immediately, without waiting for a
      // navigation round-trip.
      setLocaleState(next);

      // SEO-aware navigation: if the new locale's URL variant is ready for
      // this path, push to /<locale>/<path>. If we're on /<oldLocale>/<seo-path>
      // and switching to a locale that doesn't have it (or to en), strip the
      // prefix back to the canonical English URL. Otherwise stay put and let
      // router.refresh() re-render server components from the cookie.
      const current = pathname || '/';
      const target = targetPathForLocale(current, next);

      startTransition(() => {
        if (target !== current) {
          router.push(target);
        } else {
          router.refresh();
        }
      });
    },
    [router, pathname]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, isPending }}>
      {children}
    </LocaleContext.Provider>
  );
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/** Returns the currently active locale code (e.g. 'en', 'es'). */
export function useLocale(): Locale {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within <LocaleProvider>');
  return ctx.locale;
}

/**
 * Returns a setter function.
 * Also returns isPending so you can show a spinner during the page refresh.
 *
 * @example
 * const { setLocale, isPending } = useSetLocale();
 * <button onClick={() => setLocale('fr')} disabled={isPending}>FR</button>
 */
export function useSetLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useSetLocale must be used within <LocaleProvider>');
  return { setLocale: ctx.setLocale, isPending: ctx.isPending };
}
