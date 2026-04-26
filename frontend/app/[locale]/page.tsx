/**
 * Locale-prefixed homepage. Server component that re-renders the existing
 * client HomePage from app/page.tsx, but inside the [locale] layout's
 * LocaleProvider so SSR HTML is in the URL locale (Googlebot sees French
 * at /fr, not English-with-cookie-fallback).
 *
 * Metadata is per-locale via app/_seo/landing-meta.ts; hreflang alternates
 * are emitted for every locale that has /<locale>/ ready in seo-routing.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { LOCALES, type Locale } from "@/i18n/config";
import { hreflangAlternates, isReadyVariant } from "@/i18n/seo-routing";
import { getLandingMeta } from "@/app/_seo/landing-meta";
import HomePage from "../_HomePage";

const PAGE_PATH = "/";

const NON_EN_LOCALES = new Set(LOCALES.filter((l) => l !== "en"));

type Params = { locale: string };

function isValidLocale(locale: string): locale is Exclude<Locale, "en"> {
    return NON_EN_LOCALES.has(locale as any);
}

export async function generateMetadata({
    params,
}: {
    params: Promise<Params>;
}): Promise<Metadata> {
    const { locale } = await params;
    if (!isValidLocale(locale) || !isReadyVariant(PAGE_PATH, locale)) return {};
    const { title, description } = getLandingMeta(PAGE_PATH, locale);
    const url = `${SITE_URL}/${locale}`;
    return {
        title,
        description,
        alternates: {
            canonical: `/${locale}`,
            languages: hreflangAlternates(PAGE_PATH),
        },
        openGraph: {
            type: "website",
            url,
            title,
            description,
            siteName: SITE_NAME,
            images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
            locale,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: ["/opengraph-image"],
        },
    };
}

export default async function LocalizedHome({
    params,
}: {
    params: Promise<Params>;
}) {
    const { locale } = await params;
    if (!isValidLocale(locale) || !isReadyVariant(PAGE_PATH, locale)) {
        notFound();
    }
    return <HomePage />;
}
