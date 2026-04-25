/**
 * SEO routing — list of routes that have URL-based locale variants.
 *
 * The rest of the app stays cookie-based (the homegrown LocaleProvider).
 * Only public, indexable, marketing-style pages live here. Each route
 * declares which locales currently have a hand-translated body. Until a
 * locale is in `readyLocales`, hreflang and sitemap will NOT emit a URL
 * for that variant — so Google never sees a fallback-English page at a
 * Spanish URL (which would otherwise read as duplicate content).
 *
 * Adding a translation: write the localized content, then add the locale
 * code to that route's `readyLocales`.
 */
import type { Locale } from "./config";

export type SeoRoute = {
  /** Path WITHOUT locale prefix (e.g. "/blog/mambo-history"). */
  path: string;
  /** Locales for which a hand-translated body exists. en is always implicit. */
  readyLocales: readonly Exclude<Locale, "en">[];
};

const ALL_NON_EN: readonly Exclude<Locale, "en">[] = [
  "es", "pt", "fr", "de", "it",
  "ja", "ko", "zh", "ru", "pl",
  "nl", "ar", "el", "sr", "tr",
] as const;

/** Routes that opt into URL-based locale routing. */
export const SEO_ROUTES: readonly SeoRoute[] = [
  { path: "/blog",                     readyLocales: ALL_NON_EN },
  { path: "/blog/mambo-history",       readyLocales: ["es", "pt", "fr", "de", "it", "ja", "ko", "zh", "ru", "pl"] },
  { path: "/blog/the-85-percent-rule", readyLocales: [] },
  { path: "/what-is-salsa-on2",        readyLocales: ALL_NON_EN },
  { path: "/salsa-on1-vs-on2",         readyLocales: ALL_NON_EN },
] as const;

const SEO_PATHS = new Set(SEO_ROUTES.map((r) => r.path));

/** Does this unprefixed path opt into URL-locale routing? */
export function isSeoPath(path: string): boolean {
  // Match exact path AND child paths (so /blog/mambo-history matches /blog).
  for (const seo of SEO_PATHS) {
    if (path === seo) return true;
  }
  return false;
}

/** Does the route exist AND is the requested locale ready (or English)? */
export function isReadyVariant(path: string, locale: Locale): boolean {
  if (locale === "en") return SEO_PATHS.has(path);
  const route = SEO_ROUTES.find((r) => r.path === path);
  return !!route && (route.readyLocales as readonly string[]).includes(locale);
}

/** All ready (path × locale) pairs, for sitemap generation. */
export function readyVariants(): { path: string; locale: Locale }[] {
  const out: { path: string; locale: Locale }[] = [];
  for (const route of SEO_ROUTES) {
    out.push({ path: route.path, locale: "en" });
    for (const loc of route.readyLocales) out.push({ path: route.path, locale: loc });
  }
  return out;
}

/**
 * Build the `alternates.languages` map for Next.js metadata. Returns a
 * `{ "x-default": "...", en: "...", es: "...", ... }` keyed by locale code,
 * with values being absolute paths (no domain) — Next.js's `metadataBase`
 * is responsible for prepending the host. We intentionally only emit entries
 * for locales whose translation is in `readyLocales`. Until that happens,
 * Google never sees a hreflang advertising a non-existent locale variant.
 */
export function hreflangAlternates(path: string): Record<string, string> | undefined {
  const route = SEO_ROUTES.find((r) => r.path === path);
  if (!route) return undefined;
  const langs: Record<string, string> = {
    "x-default": path,
    en: path,
  };
  for (const loc of route.readyLocales) {
    langs[loc] = `/${loc}${path}`;
  }
  // Only emit alternates if at least one localised variant is live;
  // otherwise the entry is just (x-default, en) which is a no-op.
  return route.readyLocales.length > 0 ? langs : undefined;
}
