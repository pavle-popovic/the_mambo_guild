import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { LOCALES, type Locale } from "@/i18n/config";
import { hreflangAlternates, isReadyVariant } from "@/i18n/seo-routing";
import { getBlogHubContent } from "../../blog/_content";
import BlogHubBody from "../../blog/_BlogHubBody";

const PAGE_PATH = "/blog";

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
    if (!isValidLocale(locale) || !isReadyVariant(PAGE_PATH, locale)) {
        return {};
    }
    const content = getBlogHubContent(locale);
    const url = `${SITE_URL}/${locale}${PAGE_PATH}`;
    return {
        title: content.metaTitle,
        description: content.metaDescription,
        alternates: {
            canonical: `/${locale}${PAGE_PATH}`,
            languages: hreflangAlternates(PAGE_PATH),
        },
        openGraph: {
            type: "website",
            url,
            title: content.metaTitle,
            description: content.metaDescription,
            siteName: SITE_NAME,
            images: [
                { url: "/opengraph-image", width: 1200, height: 630, alt: content.metaTitle },
            ],
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

export default async function LocalizedBlogIndexPage({
    params,
}: {
    params: Promise<Params>;
}) {
    const { locale } = await params;
    if (!isValidLocale(locale) || !isReadyVariant(PAGE_PATH, locale)) {
        notFound();
    }
    const content = getBlogHubContent(locale);
    return <BlogHubBody content={content} locale={locale} />;
}
