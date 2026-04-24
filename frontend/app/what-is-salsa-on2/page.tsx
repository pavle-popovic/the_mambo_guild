import type { Metadata } from "next";
import Link from "next/link";
import NavBarAuth from "@/components/NavBarAuth";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME, FOUNDER } from "@/lib/site";

const PAGE_PATH = "/what-is-salsa-on2";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PUBLISHED = "2026-04-25T00:00:00Z";
const MODIFIED = "2026-04-25T00:00:00Z";

const TITLE = "What is Salsa On2? The Complete Guide to New York Style Mambo";
const DESCRIPTION =
    "Salsa On2 is a timing style where dancers break on the 2nd beat of the music. Also called New York Style or Mambo. Full definition, history, biomechanics, and a 5-step starter path.";

export const metadata: Metadata = {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: PAGE_PATH },
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
    headline: "What is Salsa On2? The Complete Guide to New York Style Mambo",
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
        { "@type": "Thing", name: "Salsa On2" },
        { "@type": "Thing", name: "New York Style Mambo" },
        { "@type": "Thing", name: "Salsa timing" },
    ],
};

const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${PAGE_URL}#howto`,
    name: "How to Start Learning Salsa On2",
    description:
        "A 5-step path for a complete beginner to start dancing Salsa On2 (New York Style Mambo).",
    totalTime: "P30D",
    step: [
        {
            "@type": "HowToStep",
            position: 1,
            name: "Train your ear for the conga tumbao",
            text: "Listen to Salsa On2 tracks and isolate the conga drum. The recurring 'slap' falls on the 2 and the 6 of the 8-count measure. Hearing this slap is the prerequisite for dancing On2 in time.",
        },
        {
            "@type": "HowToStep",
            position: 2,
            name: "Master the basic step solo",
            text: "Practice the 6-step basic (forward break / back break) without music first. Count aloud 1-2-3, 5-6-7 with a pause on 4 and 8. Break (change direction) on the 2 going back, and on the 6 going forward.",
        },
        {
            "@type": "HowToStep",
            position: 3,
            name: "Add music at a slow tempo (~90 BPM)",
            text: "Once the step is automatic, dance it to a slow Mambo track. Keep counting aloud. Most teachers recommend Tito Puente's mid-tempo recordings or Eddie Torres Big Band for practice music.",
        },
        {
            "@type": "HowToStep",
            position: 4,
            name: "Drill the weight transfer",
            text: "On2 requires a delayed weight transfer: you place the ball of the foot first, then let the heel drop. Practice slow-motion basic steps focusing only on how weight travels through the foot.",
        },
        {
            "@type": "HowToStep",
            position: 5,
            name: "Take a structured course",
            text: "Self-study has a ceiling. A curriculum that isolates footwork, musicality, body mechanics, and partner work in the right order will accelerate you past the plateau self-taught dancers hit at ~6 months.",
        },
    ],
};

const faqs = [
    {
        q: "Is Salsa On2 harder than Salsa On1?",
        a: "On2 is not objectively harder. It is less intuitive for people raised on Western downbeat music, because the first break step falls on the 2, not the 1. Dancers who already internalized On1 often report a 2-4 week adjustment period. Beginners who learn On2 first usually reach the same level of comfort at the same rate.",
    },
    {
        q: "Do I need to learn Salsa On1 before learning On2?",
        a: "No. You can learn On2 first. Eddie Torres' original students were mostly absolute beginners. Starting with On2 avoids rewiring timing habits later. That said, if you live in a city where the social scene dances On1, learning On1 first is pragmatic because you need somewhere to practice.",
    },
    {
        q: "Is Salsa On2 the same thing as Mambo?",
        a: "In the contemporary online salsa world the two terms are used interchangeably. Historically, Mambo was the 1950s Palladium Ballroom dance style formalized by dancers like Cuban Pete, Millie Donay, and later Eddie Torres. Modern Salsa On2, sometimes called New York Style, is a direct descendant of that tradition.",
    },
    {
        q: "How long does it take to learn Salsa On2?",
        a: "Expect 2-4 weeks to dance the basic step musically with confidence, 3-6 months to dance socially at a beginner level with a partner, and 1-2 years to reach intermediate social comfort. These estimates assume 3-5 hours of deliberate practice per week, not passive class attendance.",
    },
    {
        q: "Can I dance Salsa On2 at any salsa club?",
        a: "You can dance On2 to any salsa song, but socially you want to match your partner's timing. In New York City, most of Europe's dedicated On2 scenes, and the competitive world, On2 dominates. In much of Latin America, the Caribbean, and many local scenes in Europe and the US, On1 dominates. Most experienced dancers can switch between the two.",
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
        { "@type": "ListItem", position: 2, name: "What is Salsa On2?", item: PAGE_URL },
    ],
};

const esc = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c");

export default function WhatIsSalsaOn2Page() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: esc(articleSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: esc(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: esc(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: esc(breadcrumbSchema) }} />

            <NavBarAuth />

            <main className="relative min-h-screen bg-mambo-dark text-white selection:bg-[#39FF14] selection:text-black overflow-x-hidden">
                {/* Hero */}
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
                            <span className="text-white/80">Salsa On2</span>
                        </nav>

                        <span className="inline-block rounded-full border border-mambo-gold/40 bg-mambo-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-mambo-gold">
                            The Guide
                        </span>

                        <h1 className="mt-4 font-serif text-[clamp(1.8rem,6.5vw,3.4rem)] font-bold leading-[1.1] text-white sm:mt-5 lg:mt-6 landscape-phone:!text-2xl landscape-phone:!leading-tight">
                            What is Salsa On2? The Complete Guide to{" "}
                            <span className="text-mambo-gold">New York Style Mambo</span>
                        </h1>

                        <p className="mt-5 text-base text-white/70 sm:text-lg lg:text-xl landscape-phone:!text-sm landscape-phone:!mt-3">
                            By {FOUNDER.name} · 2x European Salsa Champion · 12 min read
                        </p>
                    </div>
                </header>

                {/* TL;DR callout */}
                <section className="relative px-5 pb-10 sm:px-8 lg:px-12 landscape-phone:!pb-6">
                    <div className="mx-auto max-w-3xl">
                        <div className="rounded-2xl border border-mambo-gold/30 bg-gradient-to-b from-mambo-gold/[0.07] to-transparent p-5 sm:p-7 landscape-phone:!p-4">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-mambo-gold">
                                The Short Answer
                            </p>
                            <p className="text-base leading-relaxed text-white/90 sm:text-lg landscape-phone:!text-sm landscape-phone:!leading-relaxed">
                                Salsa On2 is a timing style of salsa dancing where you break (change
                                direction) on the <strong className="text-mambo-gold">second beat</strong> of
                                the music instead of the first. It is also called{" "}
                                <strong className="text-mambo-gold">New York Style</strong> or{" "}
                                <strong className="text-mambo-gold">Mambo</strong>. The style was formalized at
                                New York&rsquo;s Palladium Ballroom in the 1950s and codified for modern teaching
                                by Eddie Torres in the 1970s. Dancing On2 aligns your body with the conga
                                drum&rsquo;s slap pattern, giving the dance a smoother, more syncopated feel than
                                On1.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Article body */}
                <article className="relative px-5 pb-16 sm:px-8 lg:px-12 landscape-phone:!pb-10">
                    <div className="mx-auto max-w-3xl text-white/85">

                        <Section title="The core idea: counting in 8s">
                            <p>
                                Every salsa song is written in 4/4 time, which dancers count as a repeating
                                8-count measure (1, 2, 3, 4, 5, 6, 7, 8). Whether you dance On1 or On2, you take
                                six steps inside each 8-count: three in the first half and three in the
                                second half, with pauses on the 4 and the 8.
                            </p>
                            <p>
                                What changes between the two styles is{" "}
                                <em>when</em> you change direction, what dancers call the &ldquo;break
                                step.&rdquo; An On1 dancer changes direction on the 1. An On2 dancer changes
                                direction on the 2. The rest of the footwork follows from that single decision.
                            </p>
                            <p>
                                The reason this matters is musical. In Afro-Cuban music, the conga drum plays a
                                pattern called the tumbao. Its defining accent, the open-tone slap,
                                falls on the 2 and the 6 of every 8-count measure, not on the 1 and the 5. When
                                you break on the 2, your weight change lands on that slap. Your body is moving in
                                sync with the rhythm section of the band instead of the melody.
                            </p>
                        </Section>

                        <Section title="On1 vs On2 at a glance">
                            <div className="my-5 overflow-x-auto rounded-xl border border-white/10">
                                <table className="w-full min-w-[520px] text-left text-sm sm:text-base landscape-phone:!min-w-[420px]">
                                    <thead className="border-b border-white/10 bg-white/[0.03] text-white/60 uppercase tracking-wider text-xs">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Attribute</th>
                                            <th className="px-4 py-3 font-semibold">Salsa On1 (LA Style)</th>
                                            <th className="px-4 py-3 font-semibold text-mambo-gold">Salsa On2 (NY Style)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        <Row a="Break step" b="Beat 1" c="Beat 2" />
                                        <Row a="Feel" b="Staccato, energetic" c="Smooth, laid-back" />
                                        <Row a="Sync with" b="Melody / downbeat" c="Conga slap / rhythm section" />
                                        <Row a="Origin" b="Los Angeles, 1990s (Vazquez brothers)" c="New York, 1950s Palladium" />
                                        <Row a="Dominant scenes" b="LA, much of Latin America, most European cities" c="NYC, competitive salsa, dedicated On2 scenes worldwide" />
                                        <Row a="Canonical teacher" b="Eddie Torres inspired many LA pioneers too" c="Eddie Torres (the father of modern On2 pedagogy)" />
                                    </tbody>
                                </table>
                            </div>
                        </Section>

                        <Section title="A brief history: Palladium, Eddie Torres, and modern On2">
                            <p>
                                In the early 1950s, New York&rsquo;s Palladium Ballroom became the crucible of
                                the Mambo Craze. Working-class dancers from the Bronx, Brooklyn, and Spanish
                                Harlem (Puerto Rican, Italian, Jewish, and African American) were
                                dancing to big-band Mambo led by Tito Puente, Tito Rodriguez, and Machito. The
                                era&rsquo;s legendary dancers like Cuban Pete, Millie Donay, and Killer Joe Piro
                                fused Afro-Cuban grounding with Lindy Hop acrobatics, tap phrasing, and ballroom
                                frame.
                            </p>
                            <p>
                                The Palladium Mambo that emerged was not a single, standardized style. It was a
                                competitive subculture of ad-hoc variations. Some dancers broke on the 1,
                                some on the 2, some floated between them. What unified the style was the
                                aesthetic: grounded lower body, locked frame, fast footwork, quiet chest.
                            </p>
                            <p>
                                In the 1970s, after the Palladium era, a dancer named{" "}
                                <strong>Eddie Torres</strong> codified what we now recognize as the standard
                                &ldquo;On2&rdquo; timing. Torres studied under Tito Puente, and Puente told him
                                that breaking on the 2 was truer to the clave and the tumbao than breaking on
                                the 1. Torres took that musical principle and built a teachable system around it.
                                Every modern Salsa On2 curriculum, including this one, ultimately traces back to
                                Eddie Torres&rsquo; structural work.
                            </p>
                        </Section>

                        <Section title="Why On2 feels different in your body">
                            <p>
                                The biomechanics of On2 are a controlled tug-of-war. Your lower body surrenders
                                to the floor: knees soft, center of gravity low, weight rolling through
                                the ball of the foot before the heel drops. Your upper body reaches up:
                                spine lifted, shoulders down, chest quiet.
                            </p>
                            <p>
                                That separation between a grounded lower body and a lifted upper body is why
                                world-class On2 dancers look like they are floating while their feet move at
                                dizzying speeds. It is also why the dance works musically: the rolling,
                                slightly-delayed weight transfer naturally lands on the conga slap instead of
                                racing ahead of it.
                            </p>
                            <p>
                                The two most common mistakes a newcomer makes are (1) dancing with straight,
                                locked legs, which kills the delay and flattens the hips into a march, and (2)
                                letting the shoulders bounce up and down with the footwork, which destroys the
                                frame.
                            </p>
                        </Section>

                        <Section title="How to start learning Salsa On2">
                            <ol className="list-decimal space-y-4 pl-5 marker:text-mambo-gold marker:font-semibold">
                                <li>
                                    <strong className="text-white">Train your ear for the conga tumbao.</strong>{" "}
                                    Listen to salsa tracks and isolate the conga drum. The recurring open-tone
                                    slap lands on the 2 and the 6. Until you can hear that slap, you cannot
                                    reliably dance On2.
                                </li>
                                <li>
                                    <strong className="text-white">Master the basic step solo, with no music.</strong>{" "}
                                    Count aloud &ldquo;1-2-3, 5-6-7&rdquo; with pauses on the 4 and the 8. Break
                                    back on the 2, break forward on the 6. Drill until the step is automatic.
                                </li>
                                <li>
                                    <strong className="text-white">Add music at a slow tempo (~90 BPM).</strong>{" "}
                                    Once the step is boring, put on a slow Mambo track (Tito Puente or
                                    Eddie Torres Big Band are canonical) and match your basic step to the
                                    music while continuing to count aloud.
                                </li>
                                <li>
                                    <strong className="text-white">Drill the weight transfer.</strong>{" "}
                                    Practice slow-motion basics focusing only on how your weight travels: ball
                                    of the foot first, heel drops after, weight settling with the knees soft.
                                    This is the habit that separates a dancer from a stepper.
                                </li>
                                <li>
                                    <strong className="text-white">Take a structured course.</strong>{" "}
                                    Self-study plateaus at around six months. A curriculum that isolates
                                    footwork, musicality, body mechanics, and partner work in the right order
                                    gets you past that plateau much faster. The exact reason is{" "}
                                    <Link href="/blog/the-85-percent-rule" className="text-mambo-gold underline underline-offset-2 hover:text-brass-light">
                                        the 85% rule
                                    </Link>{" "}
                                    of motor learning: your brain needs a specific balance of success and
                                    failure to keep improving.
                                </li>
                            </ol>
                        </Section>

                        <Section title="Myths to ignore">
                            <ul className="list-disc space-y-3 pl-5 marker:text-mambo-gold">
                                <li>
                                    <strong className="text-white">&ldquo;On2 is only for advanced dancers.&rdquo;</strong>{" "}
                                    False. Absolute beginners can start with On2. The adjustment is harder if
                                    you already trained your body to On1 for years, not if you are new.
                                </li>
                                <li>
                                    <strong className="text-white">&ldquo;Salsa On2 is a different dance from salsa.&rdquo;</strong>{" "}
                                    It is the same dance with a different timing. The partner work, the
                                    connection frame, the shines, the combinations. The vocabulary is
                                    shared.
                                </li>
                                <li>
                                    <strong className="text-white">&ldquo;You cannot dance On2 to LA-style music.&rdquo;</strong>{" "}
                                    You can dance On2 to any salsa song. Whether it feels good depends on the
                                    song&rsquo;s tempo and percussion arrangement, not on whether the song was
                                    recorded in LA or New York.
                                </li>
                            </ul>
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

                        {/* CTA */}
                        <div className="mt-12 rounded-2xl border border-mambo-gold/30 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 text-center sm:p-8 landscape-phone:!p-5">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-mambo-gold">
                                Start your On2 path
                            </p>
                            <h2 className="font-serif text-2xl font-bold leading-tight text-white sm:text-3xl">
                                The first 30 days of Salsa On2, structured.
                            </h2>
                            <p className="mx-auto mt-3 max-w-xl text-white/70">
                                A visual Skill Tree unlocks as you level up. 500+ lessons, new drops every
                                two weeks, taught by a 2x European Champion. 7-day free trial, cancel in two
                                clicks.
                            </p>
                            <Link
                                href="/register"
                                className="mt-6 inline-block rounded-full bg-[linear-gradient(135deg,#FCE205_0%,#D4AF37_100%)] px-7 py-3 text-sm font-extrabold uppercase tracking-wider text-black transition-transform hover:scale-[1.02] sm:text-base"
                            >
                                Start 7-day free trial
                            </Link>
                        </div>

                        {/* Related */}
                        <aside className="mt-10 border-t border-white/10 pt-8">
                            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-mambo-gold">
                                Keep reading
                            </p>
                            <ul className="space-y-3">
                                <RelatedLink href="/salsa-on1-vs-on2" title="Salsa On1 vs Salsa On2: which should you learn first?" />
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
