/**
 * Layout for every URL-locale-prefixed route under /<locale>/...
 *
 * Server component. Reads the locale from URL params and overrides the
 * cookie-based LocaleProviderWrapper from the root layout with one whose
 * initialLocale comes straight from the URL. That way:
 *   • SSR HTML is rendered in the URL locale (Googlebot sees French
 *     content at /fr, not English-with-cookie-fallback).
 *   • Client hydration starts from the same locale, eliminating the
 *     flash-of-english chrome on first paint.
 *
 * The root layout's LocaleProviderWrapper still wraps everything outside
 * this segment (e.g. /admin, /community) and keeps reading the cookie
 * for those non-localized URLs.
 */
import { notFound } from "next/navigation";
import { LocaleProvider } from "@/i18n/client";
import { LOCALES, LOCALE_META, type Locale } from "@/i18n/config";

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!(LOCALES as readonly string[]).includes(locale)) {
        notFound();
    }
    const typed = locale as Locale;

    // We intentionally do NOT render <html lang/dir> here — that lives in
    // the root layout which is shared. The LocaleProvider's mount-time
    // useEffect updates document.documentElement.lang/dir on the client.
    // Markup div is just a passthrough so the segment has a single root.
    void LOCALE_META[typed]; // tree-shake guard for the import

    return <LocaleProvider initialLocale={typed}>{children}</LocaleProvider>;
}
