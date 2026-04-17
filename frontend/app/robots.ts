import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin",
                    "/admin/",
                    "/api/",
                    "/auth/callback",
                    "/reset-password",
                    "/forgot-password",
                    "/profile",
                    "/u/",
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
