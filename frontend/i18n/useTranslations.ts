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

const messages: Record<Locale, Record<string, any>> = {
  en, es, pt, fr, de, it, ja, ko, zh, ru, pl, nl, ar, el,
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
    const msgs = messages[locale] || messages.en;
    const scoped = namespace ? resolve(msgs, namespace) : msgs;

    return (key: string, params?: Record<string, string | number>): string => {
      const base = typeof scoped === 'object' ? resolve(scoped, key) : resolve(msgs, namespace ? `${namespace}.${key}` : key);
      if (!params) return base;
      // Simple parameter substitution: {name} or $1, $2
      return base.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`))
                 .replace(/\$(\d+)/g, (_, n) => String(params[`$${n}`] ?? params[Object.keys(params)[parseInt(n) - 1]] ?? `$${n}`));
    };
  }, [locale, namespace]);
}
