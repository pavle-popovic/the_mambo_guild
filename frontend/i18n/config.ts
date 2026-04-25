/**
 * i18n configuration — source of truth for all locale metadata.
 * Import this anywhere you need the locale list, direction map, or display names.
 */

export const LOCALES = [
  'en', 'es', 'pt', 'fr', 'de', 'it',
  'ja', 'ko', 'zh', 'ru', 'pl', 'nl', 'ar', 'el',
  'sr', 'tr'
] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_COOKIE = 'NEXT_LOCALE';

/** Human-readable metadata for UI (language switcher, <html lang>, etc.) */
export const LOCALE_META: Record<Locale, {
  nativeName: string;
  englishName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}> = {
  en: { nativeName: 'English',           englishName: 'English',    flag: '🇺🇸', dir: 'ltr' },
  es: { nativeName: 'Español',           englishName: 'Spanish',    flag: '🇪🇸', dir: 'ltr' },
  pt: { nativeName: 'Português (Brasil)',englishName: 'Portuguese', flag: '🇧🇷', dir: 'ltr' },
  fr: { nativeName: 'Français',          englishName: 'French',     flag: '🇫🇷', dir: 'ltr' },
  de: { nativeName: 'Deutsch',           englishName: 'German',     flag: '🇩🇪', dir: 'ltr' },
  it: { nativeName: 'Italiano',          englishName: 'Italian',    flag: '🇮🇹', dir: 'ltr' },
  ja: { nativeName: '日本語',             englishName: 'Japanese',   flag: '🇯🇵', dir: 'ltr' },
  ko: { nativeName: '한국어',             englishName: 'Korean',     flag: '🇰🇷', dir: 'ltr' },
  zh: { nativeName: '中文（简体）',       englishName: 'Chinese',    flag: '🇨🇳', dir: 'ltr' },
  ru: { nativeName: 'Русский',           englishName: 'Russian',    flag: '🇷🇺', dir: 'ltr' },
  pl: { nativeName: 'Polski',            englishName: 'Polish',     flag: '🇵🇱', dir: 'ltr' },
  nl: { nativeName: 'Nederlands',        englishName: 'Dutch',      flag: '🇳🇱', dir: 'ltr' },
  ar: { nativeName: 'العربية',           englishName: 'Arabic',     flag: '🇸🇦', dir: 'rtl' },
  el: { nativeName: 'Ελληνικά',          englishName: 'Greek',      flag: '🇬🇷', dir: 'ltr' },
  sr: { nativeName: 'Српски',            englishName: 'Serbian',    flag: '🇷🇸', dir: 'ltr' },
  tr: { nativeName: 'Türkçe',            englishName: 'Turkish',    flag: '🇹🇷', dir: 'ltr' },
};

/**
 * Maps locale code → Mux text-track language_code (must match exactly what
 * upload_captions_to_mux.py creates). Mux tracks are uploaded with plain
 * BCP-47 primary tags (no region subtag), so this mapping is currently
 * 1:1 with the locale code.
 */
export const LOCALE_TO_MUX_LANG: Record<Locale, string> = {
  en: 'en',
  es: 'es',
  pt: 'pt',
  fr: 'fr',
  de: 'de',
  it: 'it',
  ja: 'ja',
  ko: 'ko',
  zh: 'zh',
  ru: 'ru',
  pl: 'pl',
  nl: 'nl',
  ar: 'ar',
  el: 'el',
  sr: 'sr',
  tr: 'tr',
};
