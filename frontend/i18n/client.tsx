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
  useTransition,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { LOCALE_COOKIE, LOCALES, LOCALE_META, type Locale } from './config';

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

      // Set <html lang> and dir immediately for instant visual feedback
      // (server will confirm on next request)
      document.documentElement.lang = next;
      document.documentElement.dir = LOCALE_META[next].dir;

      // Trigger a soft navigation so next-intl's server config re-runs
      // and re-hydrates with the new messages
      startTransition(() => {
        router.refresh();
      });
    },
    [router]
  );

  return (
    <LocaleContext.Provider value={{ locale: initialLocale, setLocale, isPending }}>
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
