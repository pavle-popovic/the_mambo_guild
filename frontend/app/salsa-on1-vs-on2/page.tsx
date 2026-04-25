import type { Metadata } from "next";
import Link from "next/link";
import NavBarAuth from "@/components/NavBarAuth";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME, FOUNDER } from "@/lib/site";
import { hreflangAlternates } from "@/i18n/seo-routing";

const PAGE_PATH = "/salsa-on1-vs-on2";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PUBLISHED = "2026-04-25T00:00:00Z";
const MODIFIED = "2026-04-25T00:00:00Z";

const TITLE = "Salsa On1 vs Salsa On2: Which Should You Learn First?";
const DESCRIPTION =
    "On1 breaks on beat 1, On2 breaks on beat 2. Full comparison of feel, history, scenes, and music, plus a practical framework for deciding which style to learn first.";

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

const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${PAGE_URL}#article`,
    headline: TITLE,
    description: DESCRIPTION,
    inLanguage: "en",
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
    about: [
        { "@type": "Thing", name: "Salsa On1" },
        { "@type": "Thing", name: "Salsa On2" },
        { "@type": "Thing", name: "Salsa timing" },
    ],
};

const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${PAGE_URL}#howto`,
    name: "How to transition from Salsa On1 to Salsa On2",
    description:
        "A 4-step practice framework for an existing On1 dancer learning to dance On2.",
    totalTime: "P28D",
    step: [
        {
            "@type": "HowToStep",
            position: 1,
            name: "Re-train your ear before your feet",
            text: "Spend a week listening to salsa exclusively to track the conga slap on the 2 and the 6. Clap along with the slap. You cannot move your break step to a beat you cannot hear.",
        },
        {
            "@type": "HowToStep",
            position: 2,
            name: "Drill the basic step silently and slowly",
            text: "Practice the 6-step basic at half speed, counting aloud '1-2-3, 5-6-7' with pauses on 4 and 8. Break back on the 2, not the 1. Repeat until the new pattern feels automatic, typically 3-7 days of 10-minute sessions.",
        },
        {
            "@type": "HowToStep",
            position: 3,
            name: "Dance alone to slow music before dancing with a partner",
            text: "Adding a partner while re-wiring timing is a recipe for reverting to On1. Give yourself 2-3 weeks of solo practice on slow Mambo tracks before dancing with anyone.",
        },
        {
            "@type": "HowToStep",
            position: 4,
            name: "Socially dance only to On2 DJs at first",
            text: "For your first month dancing On2 socially, seek out dedicated On2 nights. Dancing to an On1 room while trying to hold On2 timing is cognitive chaos. Ease the transition by removing that conflict.",
        },
    ],
};

const faqs = [
    {
        q: "Which is easier for a complete beginner, On1 or On2?",
        a: "Salsa On1 is slightly easier to pick up in the first two weeks because Western music trains us to step on the 1. After the first month, the gap closes. Absolute beginners who start with On2 reach social-level competence at the same rate as those who start with On1.",
    },
    {
        q: "If my local scene dances On1, should I still learn On2?",
        a: "Pragmatically, learn what your local scene dances first. You need somewhere to practice socially, and every salsa social has people who will partner with a beginner. Once you are a confident social dancer in your local style, adding the other timing is a 1-2 month project.",
    },
    {
        q: "Do professional dancers prefer On1 or On2?",
        a: "Competitive salsa at the World Salsa Championships and the Salsa Open categories is dominated by On2, especially the New York Style and the Cabaret categories. LA Style competitions are On1. Socially, most pros can dance both, but their home style tends to be On2.",
    },
    {
        q: "Can I dance On1 and On2 at the same party?",
        a: "You can switch between songs, but inside one song you commit to one timing. Switching timing mid-dance is jarring for your partner and the music. Most experienced dancers adapt their timing to match their partner.",
    },
    {
        q: "How do I know if a song is 'On1' or 'On2'?",
        a: "Songs are not written in a specific timing. Any salsa song can be danced either way. That said, slower, smoother arrangements with prominent conga and timbales (classic New York Mambo, Eddie Palmieri, Tito Puente) feel more natural for On2. Fast, melodic, polished productions (classic LA style) feel more natural for On1.",
    },
];

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${PAGE_URL}#faq`,
    mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
};

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Salsa On1 vs Salsa On2", item: PAGE_URL },
    ],
};

const esc = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c");

export default function SalsaOn1VsOn2Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: esc(articleSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: esc(howToSchema) }} />
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
                            <Link href="/" className="hover:text-mambo-gold transition-colors">Home</Link>
                            <span className="mx-2 opacity-40">/</span>
                            <span className="text-white/80">On1 vs On2</span>
                        </nav>

                        <span className="inline-block rounded-full border border-mambo-gold/40 bg-mambo-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-mambo-gold">
                            Comparison
                        </span>

                        <h1 className="mt-4 font-serif text-[clamp(1.8rem,6.5vw,3.4rem)] font-bold leading-[1.1] text-white sm:mt-5 lg:mt-6 landscape-phone:!text-2xl landscape-phone:!leading-tight">
                            Salsa On1 vs Salsa On2:{" "}
                            <span className="text-mambo-gold">Which Should You Learn First?</span>
                        </h1>

                        <p className="mt-5 text-base text-white/70 sm:text-lg lg:text-xl landscape-phone:!text-sm landscape-phone:!mt-3">
                            By {FOUNDER.name} · 2x European Salsa Champion · 9 min read
                        </p>
                    </div>
                </header>

                <section className="relative px-5 pb-10 sm:px-8 lg:px-12 landscape-phone:!pb-6">
                    <div className="mx-auto max-w-3xl">
                        <div className="rounded-2xl border border-mambo-gold/30 bg-gradient-to-b from-mambo-gold/[0.07] to-transparent p-5 sm:p-7 landscape-phone:!p-4">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-mambo-gold">
                                The Short Answer
                            </p>
                            <p className="text-base leading-relaxed text-white/90 sm:text-lg landscape-phone:!text-sm landscape-phone:!leading-relaxed">
                                <strong className="text-mambo-gold">On1</strong> breaks on the 1st beat.
                                LA Style, easier onboarding. <strong className="text-mambo-gold">On2</strong>{" "}
                                breaks on the 2nd beat. New York Style, truer to the conga, dominant in
                                competition. <strong className="text-white">Best first choice:</strong> learn
                                whichever style dominates your local scene so you have people to dance with.
                                Serious long-term dancers typically end up learning both, with one as their
                                home base.
                            </p>
                        </div>
                    </div>
                </section>

                <article className="relative px-5 pb-16 sm:px-8 lg:px-12 landscape-phone:!pb-10">
                    <div className="mx-auto max-w-3xl text-white/85">

                        <Section title="The one difference that matters">
                            <p>
                                Both On1 and On2 use the same 8-count structure. Both take six steps per
                                8-count with a pause on the 4 and the 8. Both use the same partner work
                                vocabulary, the same shines, the same turn patterns.
                            </p>
                            <p>
                                The single distinction is <strong>which beat you break on</strong>: which
                                beat you change direction on. On1 dancers break forward on the 1 and back on
                                the 5. On2 dancers break back on the 2 and forward on the 6.
                            </p>
                            <p>
                                That one-beat shift changes everything else: the feel, the phrasing, the
                                music you gravitate toward, and which clubs feel like home.
                            </p>
                        </Section>

                        <Section title="Side-by-side">
                            <div className="my-5 overflow-x-auto rounded-xl border border-white/10">
                                <table className="w-full min-w-[520px] text-left text-sm sm:text-base landscape-phone:!min-w-[420px]">
                                    <thead className="border-b border-white/10 bg-white/[0.03] text-white/60 uppercase tracking-wider text-xs">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Attribute</th>
                                            <th className="px-4 py-3 font-semibold">Salsa On1</th>
                                            <th className="px-4 py-3 font-semibold text-mambo-gold">Salsa On2</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        <Row a="Break step" b="Forward on 1, back on 5" c="Back on 2, forward on 6" />
                                        <Row a="Musical sync" b="Melody / downbeat" c="Conga tumbao slap" />
                                        <Row a="Feel" b="Punchy, bright, staccato" c="Smoother, deeper in the pocket" />
                                        <Row a="Learning curve (weeks 1-2)" b="Faster" c="Slightly slower" />
                                        <Row a="Learning curve (months 3+)" b="Equal" c="Equal" />
                                        <Row a="Originated" b="LA, 1990s (Vazquez brothers)" c="NYC Palladium 1950s; codified by Eddie Torres 1970s" />
                                        <Row a="Dominant scenes" b="LA, most Latin America, many European cities" c="NYC, competition circuits, dedicated On2 nights worldwide" />
                                        <Row a="Typical music preference" b="Fast, melodic, polished arrangements" c="Slower, percussive, rhythm-forward arrangements" />
                                    </tbody>
                                </table>
                            </div>
                        </Section>

                        <Section title="How each one feels">
                            <p>
                                The clearest way to describe the difference: On1 feels like dancing to the{" "}
                                <em>singer</em>. On2 feels like dancing to the <em>band</em>.
                            </p>
                            <p>
                                On1 lands your weight change on the same beat the melody tends to emphasize.
                                The dance is punchy and synchronized to the vocal line. Styling hits happen on
                                the 1, the 3, the 5, the 7: predictable, satisfying, and easy to spot.
                            </p>
                            <p>
                                On2 lands your weight change on the conga slap: the 2 and the 6. That
                                alignment with the percussion section is the source of the &ldquo;smoother&rdquo;
                                quality people associate with On2. The break step coincides with the rhythm,
                                not the melody, which gives the dance a deeper, more patient feel.
                            </p>
                        </Section>

                        <Section title="Which style is danced where?">
                            <p>
                                A rough map of the global salsa geography:
                            </p>
                            <ul className="list-disc space-y-2 pl-5 marker:text-mambo-gold">
                                <li>
                                    <strong className="text-white">New York City:</strong> overwhelmingly On2.
                                </li>
                                <li>
                                    <strong className="text-white">Los Angeles:</strong> overwhelmingly On1.
                                </li>
                                <li>
                                    <strong className="text-white">Latin America:</strong> mostly On1, though
                                    several cities (notably Puerto Rico) have strong On2 scenes.
                                </li>
                                <li>
                                    <strong className="text-white">Europe:</strong> mixed. London, Rome, Berlin,
                                    and the competitive circuits tend On2. Most local scenes outside those hubs
                                    are primarily On1.
                                </li>
                                <li>
                                    <strong className="text-white">Competition salsa:</strong> On2 dominates the
                                    New York Style and Cabaret categories of the major championships.
                                </li>
                            </ul>
                            <p>
                                If you are serious about salsa long-term, you will end up exposed to both. Most
                                professional dancers can switch fluently, though they usually have a home style.
                            </p>
                        </Section>

                        <Section title="A decision framework">
                            <ul className="list-disc space-y-2 pl-5 marker:text-mambo-gold">
                                <li>
                                    <strong className="text-white">Your local scene is clearly one style.</strong>{" "}
                                    Learn what your scene dances. You need practice partners.
                                </li>
                                <li>
                                    <strong className="text-white">Your local scene is mixed.</strong>{" "}
                                    Start with On2 if you want to lean serious and competitive; start with On1
                                    if you want the fastest social onboarding.
                                </li>
                                <li>
                                    <strong className="text-white">You are learning online with no local scene.</strong>{" "}
                                    On2 for the long game. Better teachers, richer pedagogy, and it scales into
                                    the most prestigious scenes worldwide.
                                </li>
                                <li>
                                    <strong className="text-white">You grew up with Latin music.</strong>{" "}
                                    Either works, but On2 tends to feel musically natural to trained ears
                                    because it matches the percussion you already internalized.
                                </li>
                            </ul>
                        </Section>

                        <Section title="Transitioning from On1 to On2 (or vice versa)">
                            <p>
                                The good news: 80% of what you learned in one timing (the partner work,
                                the turn patterns, the lead-follow technique) transfers directly. The
                                work is mostly ear training and re-wiring the break-step habit.
                            </p>
                            <ol className="list-decimal space-y-4 pl-5 marker:text-mambo-gold marker:font-semibold">
                                <li>
                                    <strong className="text-white">Re-train your ear before your feet.</strong>{" "}
                                    A week of listening to salsa while clapping the conga slap on the 2 and 6.
                                </li>
                                <li>
                                    <strong className="text-white">Drill the basic silently, slowly.</strong>{" "}
                                    Half-speed, counting aloud, no music. 10 minutes a day until the new break
                                    step stops feeling like a foreign language.
                                </li>
                                <li>
                                    <strong className="text-white">Dance alone before dancing with a partner.</strong>{" "}
                                    Partner work with unstable new timing reverts you to the old habit instantly.
                                </li>
                                <li>
                                    <strong className="text-white">Socially dance only in the new style at first.</strong>{" "}
                                    Mixed-timing rooms are cognitive chaos during a transition. Find a
                                    dedicated night and stay there for the first month.
                                </li>
                            </ol>
                            <p>
                                Most On1 dancers dance socially on On2 after 4-8 weeks of serious practice.
                                Professionals do it in half the time because the habit is clearer and the
                                drilling is deliberate.
                            </p>
                        </Section>

                        <Section title="Frequently asked questions">
                            <div className="space-y-5">
                                {faqs.map((f) => (
                                    <div key={f.q} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                                        <h3 className="mb-2 font-serif text-lg text-white sm:text-xl">{f.q}</h3>
                                        <p className="text-white/75">{f.a}</p>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        <div className="mt-12 rounded-2xl border border-mambo-gold/30 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 text-center sm:p-8 landscape-phone:!p-5">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-mambo-gold">
                                Start your On2 path
                            </p>
                            <h2 className="font-serif text-2xl font-bold leading-tight text-white sm:text-3xl">
                                A structured curriculum from beat to boss-level.
                            </h2>
                            <p className="mx-auto mt-3 max-w-xl text-white/70">
                                500+ lessons, visual Skill Tree, bi-weekly new drops. Taught by a
                                2x European Champion. 7-day free trial, cancel in two clicks.
                            </p>
                            <Link
                                href="/register"
                                className="mt-6 inline-block rounded-full bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] px-7 py-3 text-sm font-extrabold uppercase tracking-wider text-black transition-transform hover:scale-[1.02] sm:text-base"
                            >
                                Start 7-day free trial
                            </Link>
                        </div>

                        <aside className="mt-10 border-t border-white/10 pt-8">
                            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-mambo-gold">
                                Keep reading
                            </p>
                            <ul className="space-y-3">
                                <RelatedLink href="/what-is-salsa-on2" title="What is Salsa On2? The complete guide to New York Style Mambo" />
                                <RelatedLink href="/blog/mambo-history" title="The Birth of Mambo: from Havana to the Palladium" />
                                <RelatedLink href="/blog/the-85-percent-rule" title="The 85% Rule: how your brain actually learns to dance" />
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

function Row({ a, b, c }: { a: string; b: string; c: string }) {
    return (
        <tr>
            <td className="px-4 py-3 font-semibold text-white/80">{a}</td>
            <td className="px-4 py-3 text-white/70">{b}</td>
            <td className="px-4 py-3 text-mambo-gold/90">{c}</td>
        </tr>
    );
}

function RelatedLink({ href, title }: { href: string; title: string }) {
    return (
        <li>
            <Link
                href={href}
                className="group flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-mambo-gold/40 hover:bg-mambo-gold/[0.05]"
            >
                <span className="mt-0.5 text-mambo-gold transition-transform group-hover:translate-x-0.5">→</span>
                <span className="text-white/90 group-hover:text-white">{title}</span>
            </Link>
        </li>
    );
}
