/**
 * Shared body for /blog/mambo-history. Locale-agnostic: receives content blob
 * + locale and renders the article. JSON-LD (Article + Breadcrumb + FAQ) is
 * built here with locale-aware URLs.
 *
 * Rich-text markers:
 *   **bold**             -> gold inline emphasis
 *   *italic*             -> em (used for book titles in sources, foreign words)
 *   [link]TEXT[/link]    -> Next.js Link to /what-is-salsa-on2
 *                          (locale-prefixed when that variant is ready)
 */
import Link from "next/link";
import NavBarAuth from "@/components/NavBarAuth";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME, FOUNDER } from "@/lib/site";
import type { Locale } from "@/i18n/config";
import { isReadyVariant } from "@/i18n/seo-routing";
import { getSharedStrings, readTimeLabel } from "@/app/_seo/shared";
import { getBlogHubContent } from "@/app/blog/_content";
import type { MamboHistoryContent } from "./_content";

const PUBLISHED = "2026-04-25T00:00:00Z";
const MODIFIED = "2026-04-25T00:00:00Z";
const PAGE_PATH = "/blog/mambo-history";
const READ_TIME_MINUTES = 14;
const ON2_HREF = "/what-is-salsa-on2";

const esc = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c");

function localizedHref(href: string, locale: Locale): string {
    return locale === "en" || !isReadyVariant(href, locale) ? href : `/${locale}${href}`;
}

function Rich({ text, locale }: { text: string; locale: Locale }) {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[link\][\s\S]+?\[\/link\])/g);
    const linkHref = localizedHref(ON2_HREF, locale);
    return (
        <>
            {parts.map((p, i) => {
                if (p.startsWith("**") && p.endsWith("**")) {
                    return (
                        <strong key={i} className="text-mambo-gold">
                            {p.slice(2, -2)}
                        </strong>
                    );
                }
                if (p.startsWith("[link]") && p.endsWith("[/link]")) {
                    return (
                        <Link key={i} href={linkHref} className="text-mambo-gold underline underline-offset-2 hover:text-brass-light">
                            {p.slice(6, -7)}
                        </Link>
                    );
                }
                if (p.startsWith("*") && p.endsWith("*") && p.length > 2) {
                    return <em key={i}>{p.slice(1, -1)}</em>;
                }
                return <span key={i}>{p}</span>;
            })}
        </>
    );
}

function BulletWithBold({ text, locale }: { text: string; locale: Locale }) {
    const m = text.match(/^\*\*([^*]+)\*\*\s*([\s\S]*)$/);
    if (!m) return <Rich text={text} locale={locale} />;
    return (
        <>
            <strong className="text-white">{m[1]}</strong>{" "}
            <Rich text={m[2]} locale={locale} />
        </>
    );
}

export default function MamboHistoryBody({
    content,
    locale,
}: {
    content: MamboHistoryContent;
    locale: Locale;
}) {
    const shared = getSharedStrings(locale);
    const localeUrlPrefix = locale === "en" ? "" : `/${locale}`;
    const PAGE_URL = `${SITE_URL}${localeUrlPrefix}${PAGE_PATH}`;

    const hubContent = getBlogHubContent(locale);

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${PAGE_URL}#article`,
        headline: `${content.h1Pre}${content.h1Accent}`,
        description: content.metaDescription,
        inLanguage: locale,
        datePublished: PUBLISHED,
        dateModified: MODIFIED,
        mainEntityOfPage: { "@type": "WebPage", "@id": PAGE_URL },
        author: {
            "@type": "Person",
            "@id": `${SITE_URL}#founder`,
            name: FOUNDER.name,
            jobTitle: FOUNDER.role,
            url: SITE_URL,
        },
        publisher: {
            "@type": "EducationalOrganization",
            "@id": `${SITE_URL}#organization`,
            name: SITE_NAME,
            url: SITE_URL,
            logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/Logo.png` },
        },
        image: `${SITE_URL}/opengraph-image`,
        citation: [
            "McMains, Juliet. Spinning Mambo into Salsa: Caribbean Dance in Global Commerce. Oxford University Press, 2015.",
            "Roberts, John Storm. The Latin Tinge: The Impact of Latin American Music on the United States. Oxford University Press, 1999.",
            "Fernandez, Raul A. From Afro-Cuban Rhythms to Latin Jazz. University of California Press, 2006.",
            "Manuel, Peter. Caribbean Currents: Caribbean Music from Rumba to Reggae. Temple University Press, 2009.",
        ],
        about: [
            { "@type": "Thing", name: "Mambo" },
            { "@type": "Thing", name: "Salsa history" },
            { "@type": "Thing", name: "Palladium Ballroom" },
            { "@type": "Thing", name: "Eddie Torres" },
        ],
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        mainEntity: content.faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: content.breadcrumbHome, item: `${SITE_URL}${localeUrlPrefix}/` },
            { "@type": "ListItem", position: 2, name: content.breadcrumbBlog, item: `${SITE_URL}${localeUrlPrefix}/blog` },
            { "@type": "ListItem", position: 3, name: content.breadcrumbCurrent, item: PAGE_URL },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: esc(articleSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: esc(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: esc(breadcrumbSchema) }} />

            <NavBarAuth />

            <main className="relative min-h-screen bg-mambo-dark text-white selection:bg-[#39FF14] selection:text-black overflow-x-hidden">
                <header className="relative px-5 pt-28 pb-10 sm:px-8 sm:pt-32 sm:pb-14 lg:px-12 lg:pt-40 lg:pb-20 landscape-phone:!pt-24 landscape-phone:!pb-6">
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
                            <Link href={`${localeUrlPrefix}/`} className="hover:text-mambo-gold transition-colors">
                                {content.breadcrumbHome}
                            </Link>
                            <span className="mx-2 opacity-40">/</span>
                            <Link href={`${localeUrlPrefix}/blog`} className="hover:text-mambo-gold transition-colors">
                                {content.breadcrumbBlog}
                            </Link>
                            <span className="mx-2 opacity-40">/</span>
                            <span className="text-white/80">{content.breadcrumbCurrent}</span>
                        </nav>

                        <span className="inline-block rounded-full border border-mambo-gold/40 bg-mambo-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-mambo-gold">
                            {content.badge}
                        </span>

                        <h1 className="mt-4 font-serif text-[clamp(1.8rem,6.5vw,3.4rem)] font-bold leading-[1.1] text-white sm:mt-5 lg:mt-6 landscape-phone:!text-2xl landscape-phone:!leading-tight">
                            {content.h1Pre}
                            <span className="text-mambo-gold">{content.h1Accent}</span>
                        </h1>

                        <p className="mt-5 text-base text-white/70 sm:text-lg lg:text-xl landscape-phone:!text-sm landscape-phone:!mt-3">
                            {`By ${FOUNDER.name} · ${shared.bylineCredential} · ${readTimeLabel(locale, READ_TIME_MINUTES)}`}
                        </p>
                    </div>
                </header>

                <section className="relative px-5 pb-10 sm:px-8 lg:px-12 landscape-phone:!pb-6">
                    <div className="mx-auto max-w-3xl">
                        <div className="rounded-2xl border border-mambo-gold/30 bg-gradient-to-b from-mambo-gold/[0.07] to-transparent p-5 sm:p-7 landscape-phone:!p-4">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-mambo-gold">
                                {shared.shortAnswerEyebrow}
                            </p>
                            <p className="text-base leading-relaxed text-white/90 sm:text-lg landscape-phone:!text-sm landscape-phone:!leading-relaxed">
                                <Rich text={content.shortAnswerRich} locale={locale} />
                            </p>
                        </div>
                    </div>
                </section>

                <article className="relative px-5 pb-16 sm:px-8 lg:px-12 landscape-phone:!pb-10">
                    <div className="mx-auto max-w-3xl text-white/85">

                        <Section title={content.sec1Title}>
                            {content.sec1Paragraphs.map((p, i) => (
                                <p key={i}><Rich text={p} locale={locale} /></p>
                            ))}
                        </Section>

                        <Section title={content.sec2Title}>
                            {content.sec2Paragraphs.map((p, i) => (
                                <p key={i}><Rich text={p} locale={locale} /></p>
                            ))}
                        </Section>

                        <Section title={content.sec3Title}>
                            {content.sec3IntroParagraphs.map((p, i) => (
                                <p key={i}><Rich text={p} locale={locale} /></p>
                            ))}
                            <p>{content.sec3LegendsLeadIn}</p>
                            <ul className="list-disc space-y-3 pl-5 marker:text-mambo-gold">
                                {content.sec3LegendsBullets.map((b, i) => (
                                    <li key={i}><BulletWithBold text={b} locale={locale} /></li>
                                ))}
                            </ul>
                            {content.sec3OutroParagraphs.map((p, i) => (
                                <p key={i}><Rich text={p} locale={locale} /></p>
                            ))}
                        </Section>

                        <Section title={content.sec4Title}>
                            {content.sec4Paragraphs.map((p, i) => (
                                <p key={i}><Rich text={p} locale={locale} /></p>
                            ))}
                        </Section>

                        <Section title={content.sec5Title}>
                            <p>{content.sec5Intro}</p>
                            <ol className="list-decimal space-y-3 pl-5 marker:text-mambo-gold marker:font-semibold">
                                {content.sec5Steps.map((s, i) => (
                                    <li key={i}><BulletWithBold text={s} locale={locale} /></li>
                                ))}
                            </ol>
                            <p><Rich text={content.sec5OutroRich} locale={locale} /></p>
                        </Section>

                        <Section title={content.sec6Title}>
                            <ul className="list-disc space-y-2 pl-5 text-sm text-white/70 marker:text-mambo-gold">
                                {content.sec6Sources.map((s, i) => (
                                    <li key={i}><Rich text={s} locale={locale} /></li>
                                ))}
                            </ul>
                        </Section>

                        <Section title={shared.faqHeading}>
                            <div className="space-y-5">
                                {content.faqs.map((f) => (
                                    <div key={f.q} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                                        <h3 className="mb-2 font-serif text-lg text-white sm:text-xl">{f.q}</h3>
                                        <p className="text-white/75">{f.a}</p>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <div className="mt-12 rounded-2xl border border-mambo-gold/30 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 text-center sm:p-8 landscape-phone:!p-5">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-mambo-gold">
                                {content.ctaEyebrow}
                            </p>
                            <h2 className="font-serif text-2xl font-bold leading-tight text-white sm:text-3xl">
                                {content.ctaHeading}
                            </h2>
                            <p className="mx-auto mt-3 max-w-xl text-white/70">
                                {content.ctaBody}
                            </p>
                            <Link
                                href={`${localeUrlPrefix}/register`}
                                className="mt-6 inline-block rounded-full bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] px-7 py-3 text-sm font-extrabold uppercase tracking-wider text-black transition-transform hover:scale-[1.02] sm:text-base"
                            >
                                {shared.startFreeTrialCta}
                            </Link>
                        </div>

                        <aside className="mt-10 border-t border-white/10 pt-8">
                            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-mambo-gold">
                                {shared.keepReadingEyebrow}
                            </p>
                            <ul className="space-y-3">
                                {hubContent.posts
                                    .filter((p) => p.href !== PAGE_PATH)
                                    .slice(0, 3)
                                    .map((p) => (
                                        <li key={p.href}>
                                            <Link
                                                href={localizedHref(p.href, locale)}
                                                className="group flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-mambo-gold/40 hover:bg-mambo-gold/[0.05]"
                                            >
                                                <span className="mt-0.5 text-mambo-gold transition-transform group-hover:translate-x-0.5">→</span>
                                                <span className="text-white/90 group-hover:text-white">{p.title}</span>
                                            </Link>
                                        </li>
                                    ))}
                            </ul>
                        </aside>
                    </div>
                </article>

                <Footer />
            </main>
        </>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-10 sm:mb-12">
            <h2 className="mb-4 font-serif text-2xl font-bold leading-tight text-white sm:text-3xl sm:mb-5 landscape-phone:!text-xl">
                {title}
            </h2>
            <div className="space-y-4 text-base leading-relaxed sm:text-[17px] sm:leading-[1.75] landscape-phone:!text-sm landscape-phone:!leading-relaxed">
                {children}
            </div>
        </section>
    );
}
