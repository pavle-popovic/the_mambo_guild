import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, FOUNDER } from "@/lib/site";
import { hreflangAlternates } from "@/i18n/seo-routing";
import { getWhatIsOn2Content } from "./_content";
import WhatIsOn2Body from "./_Body";

const PAGE_PATH = "/what-is-salsa-on2";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PUBLISHED = "2026-04-25T00:00:00Z";
const MODIFIED = "2026-04-25T00:00:00Z";

const content = getWhatIsOn2Content("en");
const TITLE = content.metaTitle;
const DESCRIPTION = content.metaDescription;

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: PAGE_PATH, languages: hreflangAlternates(PAGE_PATH) },
    openGraph: {
        type: "article",
        url: PAGE_URL,
        title: TITLE,
        description: DESCRIPTION,
        siteName: SITE_NAME,
        publishedTime: PUBLISHED,
        modifiedTime: MODIFIED,
        authors: [FOUNDER.name],
        images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: TITLE }],
    },
    twitter: {
        card: "summary_large_image",
        title: TITLE,
        description: DESCRIPTION,
        images: ["/opengraph-image"],
    },
};

export default function WhatIsSalsaOn2Page() {
    return <WhatIsOn2Body content={content} locale="en" />;
}
