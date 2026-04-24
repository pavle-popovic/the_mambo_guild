import type { Metadata } from "next";
import Link from "next/link";
import NavBarAuth from "@/components/NavBarAuth";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const PAGE_PATH = "/blog";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const TITLE = "Blog: Salsa On2 guides, history, and training science";
const DESCRIPTION =
    "Long-form articles on Salsa On2, the history of Mambo, and the learning-science principles behind the Mambo Guild curriculum. Written by a 2x European Champion.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: PAGE_PATH },
    openGraph: {
        type: "website",
        url: PAGE_URL,
        title: TITLE,
        description: DESCRIPTION,
        siteName: SITE_NAME,
        images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: TITLE }],
    },
    twitter: {
        card: "summary_large_image",
        title: TITLE,
        description: DESCRIPTION,
        images: ["/opengraph-image"],
    },
};

type Post = {
    href: string;
    badge: string;
    title: string;
    description: string;
    readTime: string;
    date: string;
};

const POSTS: Post[] = [
    {
        href: "/what-is-salsa-on2",
        badge: "The Guide",
        title: "What is Salsa On2? The Complete Guide to New York Style Mambo",
        description:
            "Definition, history, biomechanics, and a 5-step path for a complete beginner to start dancing Salsa On2.",
        readTime: "12 min read",
        date: "Apr 25, 2026",
    },
    {
        href: "/salsa-on1-vs-on2",
        badge: "Comparison",
        title: "Salsa On1 vs Salsa On2: Which Should You Learn First?",
        description:
            "Full side-by-side: feel, history, global scenes, and a practical framework for choosing your first style.",
        readTime: "9 min read",
        date: "Apr 25, 2026",
    },
    {
        href: "/blog/mambo-history",
        badge: "History",
        title: "The Birth of Mambo: From Havana to the Palladium",
        description:
            "How Mambo emerged from Cuban Danzon and Son, was forged by Arsenio Rodriguez, and was codified as modern Salsa On2 by Eddie Torres.",
        readTime: "14 min read",
        date: "Apr 25, 2026",
    },
    {
        href: "/blog/the-85-percent-rule",
        badge: "Training Science",
        title: "The 85% Rule: How Your Brain Actually Learns to Dance",
        description:
            "A 2019 Nature paper pinpointed the optimal error rate for learning at 15.87%. Here is what that means for your salsa drills.",
        readTime: "10 min read",
        date: "Apr 25, 2026",
    },
];

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: PAGE_URL },
    ],
};

const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${PAGE_URL}#blog`,
    name: `${SITE_NAME} Blog`,
    description: DESCRIPTION,
    url: PAGE_URL,
    inLanguage: "en",
    publisher: {
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL}#organization`,
        name: SITE_NAME,
    },
    blogPost: POSTS.map((p) => ({
        "@type": "BlogPosting",
        headline: p.title,
        url: `${SITE_URL}${p.href}`,
        description: p.description,
    })),
};

const esc = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c");

export default function BlogIndexPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: esc(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: esc(blogSchema) }} />

            <NavBarAuth />

            <main className="relative min-h-screen bg-mambo-dark text-white selection:bg-[#39FF14] selection:text-black overflow-x-hidden">
                <header className="relative px-5 pt-28 pb-10 sm:px-8 sm:pt-32 sm:pb-14 lg:px-12 lg:pt-40 lg:pb-16 landscape-phone:!pt-24 landscape-phone:!pb-6">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-60"
                        style={{
                            background:
                                "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0) 60%)",
                        }}
                    />
                    <div className="relative mx-auto max-w-3xl">
                        <nav aria-label="Breadcrumb" className="mb-5 text-xs uppercase tracking-[0.22em] text-white/50">
                            <Link href="/" className="hover:text-mambo-gold transition-colors">Home</Link>
                            <span className="mx-2 opacity-40">/</span>
                            <span className="text-white/80">Blog</span>
                        </nav>

                        <h1 className="font-serif text-[clamp(2rem,6.5vw,3.4rem)] font-bold leading-[1.1] text-white landscape-phone:!text-2xl landscape-phone:!leading-tight">
                            <span className="text-mambo-gold">The Blog.</span>
                        </h1>
                        <p className="mt-5 text-base text-white/70 sm:text-lg lg:text-xl landscape-phone:!text-sm landscape-phone:!mt-3">
                            Long-form guides on Salsa On2, the history of Mambo, and the
                            training-science principles behind the curriculum.
                        </p>
                    </div>
                </header>

                <section className="relative px-5 pb-20 sm:px-8 lg:px-12 landscape-phone:!pb-10">
                    <div className="mx-auto max-w-3xl">
                        <ul className="space-y-5 sm:space-y-6">
                            {POSTS.map((p) => (
                                <li key={p.href}>
                                    <Link
                                        href={p.href}
                                        className="group block rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:border-mambo-gold/40 hover:bg-mambo-gold/[0.04] sm:p-7 landscape-phone:!p-4"
                                    >
                                        <div className="mb-2 flex items-center gap-3">
                                            <span className="rounded-full border border-mambo-gold/40 bg-mambo-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-mambo-gold">
                                                {p.badge}
                                            </span>
                                            <span className="text-xs text-white/50">
                                                {p.date} · {p.readTime}
                                            </span>
                                        </div>
                                        <h2 className="font-serif text-xl font-bold leading-snug text-white group-hover:text-mambo-gold sm:text-2xl landscape-phone:!text-lg">
                                            {p.title}
                                        </h2>
                                        <p className="mt-3 text-sm text-white/70 sm:text-base">
                                            {p.description}
                                        </p>
                                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mambo-gold">
                                            Read article
                                            <span className="transition-transform group-hover:translate-x-0.5">→</span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <Footer />
            </main>
        </>
    );
}
