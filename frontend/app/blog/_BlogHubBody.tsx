/**
 * Shared blog hub body — used by both /blog (English) and /[locale]/blog
 * (non-English). All copy comes from the locale-keyed content blob in
 * _content.ts. Visual structure stays identical across locales.
 */
import Link from "next/link";
import NavBarAuth from "@/components/NavBarAuth";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import type { Locale } from "@/i18n/config";
import { isReadyVariant } from "@/i18n/seo-routing";
import type { BlogHubContent } from "./_content";

const esc = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c");

const PAGE_PATH = "/blog";

export default function BlogHubBody({
  content,
  locale,
}: {
  content: BlogHubContent;
  locale: Locale;
}) {
  const localeUrlPrefix = locale === "en" ? "" : `/${locale}`;
  const PAGE_URL = `${SITE_URL}${localeUrlPrefix}${PAGE_PATH}`;
  const HOME_URL = `${SITE_URL}${localeUrlPrefix}/`;

  // Per-card href: prefix with /<locale> only if that article has a
  // translated body for this locale. Otherwise link to the unprefixed
  // English URL — the middleware will keep the locale cookie pinned so
  // chrome stays in the user's language while the body renders English.
  const localizedHref = (href: string) =>
    locale === "en" || !isReadyVariant(href, locale) ? href : `/${locale}${href}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: content.heroBreadcrumbHome, item: HOME_URL },
      { "@type": "ListItem", position: 2, name: content.heroBreadcrumbCurrent, item: PAGE_URL },
    ],
  };

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${PAGE_URL}#blog`,
    name: `${SITE_NAME} Blog`,
    description: content.metaDescription,
    url: PAGE_URL,
    inLanguage: locale,
    publisher: {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}#organization`,
      name: SITE_NAME,
    },
    blogPost: content.posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}${localizedHref(p.href)}`,
      description: p.description,
    })),
  };

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
              <Link href={`${localeUrlPrefix}/`} className="hover:text-mambo-gold transition-colors">
                {content.heroBreadcrumbHome}
              </Link>
              <span className="mx-2 opacity-40">/</span>
              <span className="text-white/80">{content.heroBreadcrumbCurrent}</span>
            </nav>

            <h1 className="font-serif text-[clamp(2rem,6.5vw,3.4rem)] font-bold leading-[1.1] text-white landscape-phone:!text-2xl landscape-phone:!leading-tight">
              <span className="text-mambo-gold">{content.heroHeading}</span>
            </h1>
            <p className="mt-5 text-base text-white/70 sm:text-lg lg:text-xl landscape-phone:!text-sm landscape-phone:!mt-3">
              {content.heroSubhead}
            </p>
          </div>
        </header>

        <section className="relative px-5 pb-20 sm:px-8 lg:px-12 landscape-phone:!pb-10">
          <div className="mx-auto max-w-3xl">
            <ul className="space-y-5 sm:space-y-6">
              {content.posts.map((p) => (
                <li key={p.href}>
                  <Link
                    href={localizedHref(p.href)}
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
                      {content.readArticleCta}
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
