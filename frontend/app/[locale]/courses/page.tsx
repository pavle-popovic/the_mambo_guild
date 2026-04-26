import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { LOCALES, type Locale } from "@/i18n/config";
import { hreflangAlternates, isReadyVariant } from "@/i18n/seo-routing";
import { getLandingMeta } from "@/app/_seo/landing-meta";
import CoursesPage from "../../courses/_CoursesPage";

const PAGE_PATH = "/courses";

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
    const url = `${SITE_URL}/${locale}${PAGE_PATH}`;
    return {
        title,
        description,
        alternates: {
            canonical: `/${locale}${PAGE_PATH}`,
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

export default async function LocalizedCourses({
    params,
}: {
    params: Promise<Params>;
}) {
    const { locale } = await params;
    if (!isValidLocale(locale) || !isReadyVariant(PAGE_PATH, locale)) {
        notFound();
    }
    return <CoursesPage />;
}
