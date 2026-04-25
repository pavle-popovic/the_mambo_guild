import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL, SITE_NAME, FOUNDER } from "@/lib/site";
import { LOCALES, type Locale } from "@/i18n/config";
import { hreflangAlternates, isReadyVariant } from "@/i18n/seo-routing";
import { getOn1VsOn2Content } from "../../salsa-on1-vs-on2/_content";
import On1VsOn2Body from "../../salsa-on1-vs-on2/_Body";

const PAGE_PATH = "/salsa-on1-vs-on2";
const PUBLISHED = "2026-04-25T00:00:00Z";
const MODIFIED = "2026-04-25T00:00:00Z";

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
    const content = getOn1VsOn2Content(locale);
    const url = `${SITE_URL}/${locale}${PAGE_PATH}`;
    return {
        title: content.metaTitle,
        description: content.metaDescription,
        alternates: {
            canonical: `/${locale}${PAGE_PATH}`,
            languages: hreflangAlternates(PAGE_PATH),
        },
        openGraph: {
            type: "article",
            url,
            title: content.metaTitle,
            description: content.metaDescription,
            siteName: SITE_NAME,
            publishedTime: PUBLISHED,
            modifiedTime: MODIFIED,
            authors: [FOUNDER.name],
            images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: content.metaTitle }],
            locale,
        },
        twitter: {
            card: "summary_large_image",
            title: content.metaTitle,
            description: content.metaDescription,
            images: ["/opengraph-image"],
        },
    };
}

export default async function LocalizedOn1VsOn2Page({
    params,
}: {
    params: Promise<Params>;
}) {
    const { locale } = await params;
    if (!isValidLocale(locale) || !isReadyVariant(PAGE_PATH, locale)) {
        notFound();
    }
    const content = getOn1VsOn2Content(locale);
    return <On1VsOn2Body content={content} locale={locale} />;
}
