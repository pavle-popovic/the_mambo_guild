import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { hreflangAlternates } from "@/i18n/seo-routing";
import { getBlogHubContent } from "./_content";
import BlogHubBody from "./_BlogHubBody";

const PAGE_PATH = "/blog";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const content = getBlogHubContent("en");

export const metadata: Metadata = {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: { canonical: PAGE_PATH, languages: hreflangAlternates(PAGE_PATH) },
    openGraph: {
        type: "website",
        url: PAGE_URL,
        title: content.metaTitle,
        description: content.metaDescription,
        siteName: SITE_NAME,
        images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: content.metaTitle }],
    },
    twitter: {
        card: "summary_large_image",
        title: content.metaTitle,
        description: content.metaDescription,
        images: ["/opengraph-image"],
    },
};

export default function BlogIndexPage() {
    return <BlogHubBody content={content} locale="en" />;
}
