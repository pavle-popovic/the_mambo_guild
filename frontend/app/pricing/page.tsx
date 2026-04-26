import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { hreflangAlternates } from "@/i18n/seo-routing";
import { getLandingMeta } from "../_seo/landing-meta";
import PricingPage from "./_PricingPage";

const PAGE_PATH = "/pricing";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const { title, description } = getLandingMeta(PAGE_PATH, "en");

export const metadata: Metadata = {
    title,
    description,
    alternates: {
        canonical: PAGE_PATH,
        languages: hreflangAlternates(PAGE_PATH),
    },
    openGraph: {
        type: "website",
        url: PAGE_URL,
        title,
        description,
        siteName: SITE_NAME,
        images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ["/opengraph-image"],
    },
};

export default function Pricing() {
    return <PricingPage />;
}
