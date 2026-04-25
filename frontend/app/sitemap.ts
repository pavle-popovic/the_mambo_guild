import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { SEO_ROUTES } from "@/i18n/seo-routing";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
        { path: "/", priority: 1.0, changeFrequency: "weekly" },
        { path: "/what-is-salsa-on2", priority: 0.9, changeFrequency: "monthly" },
        { path: "/salsa-on1-vs-on2", priority: 0.9, changeFrequency: "monthly" },
        { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
        { path: "/courses", priority: 0.9, changeFrequency: "weekly" },
        { path: "/guild-master", priority: 0.8, changeFrequency: "monthly" },
        { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
        { path: "/blog/mambo-history", priority: 0.8, changeFrequency: "monthly" },
        { path: "/blog/the-85-percent-rule", priority: 0.8, changeFrequency: "monthly" },
        { path: "/instructors", priority: 0.7, changeFrequency: "monthly" },
        { path: "/community", priority: 0.7, changeFrequency: "daily" },
        { path: "/pro", priority: 0.6, changeFrequency: "monthly" },
        { path: "/studio", priority: 0.6, changeFrequency: "monthly" },
        { path: "/register", priority: 0.5, changeFrequency: "yearly" },
        { path: "/login", priority: 0.4, changeFrequency: "yearly" },
        { path: "/waitlist", priority: 0.4, changeFrequency: "monthly" },
    ];

    // For SEO-localised routes, attach hreflang alternates only for locales
    // whose translated body is actually live — see i18n/seo-routing.ts.
    const seoByPath = new Map(SEO_ROUTES.map((r) => [r.path, r]));

    const baseEntries: MetadataRoute.Sitemap = routes.map((r) => {
        const seo = seoByPath.get(r.path);
        const entry: MetadataRoute.Sitemap[number] = {
            url: `${SITE_URL}${r.path}`,
            lastModified: now,
            changeFrequency: r.changeFrequency,
            priority: r.priority,
        };
        if (seo && seo.readyLocales.length > 0) {
            const languages: Record<string, string> = {
                "x-default": `${SITE_URL}${r.path}`,
                en: `${SITE_URL}${r.path}`,
            };
            for (const loc of seo.readyLocales) {
                languages[loc] = `${SITE_URL}/${loc}${r.path}`;
            }
            entry.alternates = { languages };
        }
        return entry;
    });

    // Add a separate URL entry for each (SEO route × ready locale) so the
    // localised page itself is also a sitemap entry pointing back to the
    // canonical English with full hreflang annotations.
    const localeEntries: MetadataRoute.Sitemap = SEO_ROUTES.flatMap((seo) => {
        return seo.readyLocales.map((loc) => {
            const languages: Record<string, string> = {
                "x-default": `${SITE_URL}${seo.path}`,
                en: `${SITE_URL}${seo.path}`,
            };
            for (const sib of seo.readyLocales) {
                languages[sib] = `${SITE_URL}/${sib}${seo.path}`;
            }
            const route = routes.find((r) => r.path === seo.path);
            return {
                url: `${SITE_URL}/${loc}${seo.path}`,
                lastModified: now,
                changeFrequency: route?.changeFrequency ?? "monthly",
                priority: (route?.priority ?? 0.5) - 0.05,
                alternates: { languages },
            };
        });
    });

    return [...baseEntries, ...localeEntries];
}
