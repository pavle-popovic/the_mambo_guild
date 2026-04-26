'use client';

/**
 * useTranslations — lightweight i18n hook.
 *
 * Reads the current locale from LocaleProvider and returns a `t()` function
 * that resolves dot-separated keys (e.g. "nav.home") from the messages JSON.
 *
 * Usage:
 *   const t = useTranslations();
 *   <span>{t('nav.home')}</span>
 *
 * Or scoped to a namespace:
 *   const t = useTranslations('nav');
 *   <span>{t('home')}</span>
 */

import { useMemo } from 'react';
import { useLocale } from './client';
import type { Locale } from './config';

// Static imports of all message files (small JSON, ~15KB each)
import en from '@/messages/en.json';
import es from '@/messages/es.json';
import pt from '@/messages/pt.json';
import fr from '@/messages/fr.json';
import de from '@/messages/de.json';
import it from '@/messages/it.json';
import ja from '@/messages/ja.json';
import ko from '@/messages/ko.json';
import zh from '@/messages/zh.json';
import ru from '@/messages/ru.json';
import pl from '@/messages/pl.json';
import nl from '@/messages/nl.json';
import ar from '@/messages/ar.json';
import el from '@/messages/el.json';
import sr from '@/messages/sr.json';
import tr from '@/messages/tr.json';

const messages: Record<Locale, Record<string, any>> = {
  en, es, pt, fr, de, it, ja, ko, zh, ru, pl, nl, ar, el, sr, tr,
};

function resolve(obj: any, path: string): string {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return path;
    current = current[part];
  }
  return typeof current === 'string' ? current : path;
}

/**
 * @param namespace Optional namespace prefix (e.g. 'nav', 'auth.login')
 * @returns A `t(key)` function that resolves translation strings
 */
export function useTranslations(namespace?: string) {
  const locale = useLocale();

  return useMemo(() => {
    return (key: string, params?: Record<string, string | number>): string => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      const localeMsgs = messages[locale] || messages.en;

      // Resolve in the current locale first. `resolve()` returns the
      // unmodified path when no value matches, which we use as the
      // "missing" signal to fall back to English. Without this fallback,
      // a half-translated locale would surface raw keys like
      // "profile.subscription.cancelTitle" to the user.
      let base = resolve(localeMsgs, fullKey);
      if (base === fullKey && locale !== 'en') {
        base = resolve(messages.en, fullKey);
      }

      if (!params) return base;
      // Simple parameter substitution: {name} or $1, $2
      return base
        .replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`))
        .replace(/\$(\d+)/g, (_, n) =>
          String(params[`$${n}`] ?? params[Object.keys(params)[parseInt(n) - 1]] ?? `$${n}`)
        );
    };
  }, [locale, namespace]);
}
