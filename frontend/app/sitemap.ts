import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
        { path: "/", priority: 1.0, changeFrequency: "weekly" },
        { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
        { path: "/courses", priority: 0.9, changeFrequency: "weekly" },
        { path: "/guild-master", priority: 0.8, changeFrequency: "monthly" },
        { path: "/instructors", priority: 0.7, changeFrequency: "monthly" },
        { path: "/community", priority: 0.7, changeFrequency: "daily" },
        { path: "/pro", priority: 0.6, changeFrequency: "monthly" },
        { path: "/studio", priority: 0.6, changeFrequency: "monthly" },
        { path: "/register", priority: 0.5, changeFrequency: "yearly" },
        { path: "/login", priority: 0.4, changeFrequency: "yearly" },
        { path: "/waitlist", priority: 0.4, changeFrequency: "monthly" },
    ];

    return routes.map((r) => ({
        url: `${SITE_URL}${r.path}`,
        lastModified: now,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
    }));
}
