import type { Metadata } from "next";
import Link from "next/link";
import NavBarAuth from "@/components/NavBarAuth";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME, FOUNDER } from "@/lib/site";

const PAGE_PATH = "/blog/the-85-percent-rule";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PUBLISHED = "2026-04-25T00:00:00Z";
const MODIFIED = "2026-04-25T00:00:00Z";

const TITLE = "The 85% Rule: How Your Brain Actually Learns to Dance";
const DESCRIPTION =
    "A 2019 Nature paper found the mathematically optimal error rate for learning is 15.87%. Here is what that means for salsa practice, how to calibrate your drills, and why 'clean' practice stalls progress.";

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
    citation: [
        "Wilson, R.C., Shenhav, A., Steine-Hanson, M., & Cohen, J.D. (2019). The Eighty Five Percent Rule for Optimal Learning. Nature Human Behaviour, 3, 1316-1323.",
        "Bjork, R.A. (1994). Memory and Metamemory Considerations in the Training of Human Beings. In J. Metcalfe & A. Shimamura (Eds.), Metacognition. MIT Press.",
        "Schmidt, R.A., & Lee, T.D. (2011). Motor Learning and Performance: From Principles to Application (5th ed.). Human Kinetics.",
    ],
    about: [
        { "@type": "Thing", name: "Motor learning" },
        { "@type": "Thing", name: "Deliberate practice" },
        { "@type": "Thing", name: "Salsa practice" },
        { "@type": "Thing", name: "Skill acquisition" },
    ],
};

const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${PAGE_URL}#howto`,
    name: "How to apply the 85% rule in a salsa practice session",
    description:
        "A 4-step protocol for calibrating drill difficulty to the mathematically optimal 15.87% error rate.",
    totalTime: "PT45M",
    step: [
        {
            "@type": "HowToStep",
            position: 1,
            name: "Pick one isolated skill per session",
            text: "Do not drill 'salsa.' Drill one specific thing: a spin technique, a cross-body lead timing, a shine. A single success/failure definition is required to measure a hit rate.",
        },
        {
            "@type": "HowToStep",
            position: 2,
            name: "Run 10 reps and score each one honestly",
            text: "Decide before you start what counts as a hit vs a miss. After 10 reps, count your hits. If you land 9 or 10, the drill is too easy. If you land 5 or fewer, it is too hard.",
        },
        {
            "@type": "HowToStep",
            position: 3,
            name: "Adjust the difficulty dial",
            text: "Too easy: increase the tempo 10%, add an arm styling layer, add a partner, add a non-dominant-side version, or remove visual feedback. Too hard: simplify until you stabilize at 8 hits out of 10.",
        },
        {
            "@type": "HowToStep",
            position: 4,
            name: "Stay in the 80-90% band for 20 minutes",
            text: "Once you are landing 8-9 of 10 reps, stay there for sustained practice. That is the zone where your cerebellum gets clear error signals and your motor cortex keeps updating.",
        },
    ],
};

const faqs = [
    {
        q: "What is the 85% rule in plain terms?",
        a: "A 2019 paper in Nature Human Behaviour showed that the human brain learns new skills fastest when practice difficulty is calibrated so that you succeed about 85% of the time and miss about 15% of the time. The exact optimum is 15.87% failure. Practicing at much higher or much lower failure rates slows down learning.",
    },
    {
        q: "Where does the 15.87% number come from?",
        a: "It is derived mathematically from the shape of a standard learning curve (a sigmoid). The slope of the curve - how fast you improve per rep - is steepest at a specific point, and that point corresponds to a 15.87% failure rate. It is not an empirical guess; it falls out of the math.",
    },
    {
        q: "Does the 85% rule apply to all skills, including dance?",
        a: "The Wilson et al. paper was about learning in neural network models and binary classification tasks, but it generalizes strongly to any skill that involves your brain producing a motor output and updating based on feedback. Dance is textbook motor learning.",
    },
    {
        q: "What if I want to perform a routine cleanly without any mistakes?",
        a: "Performance and practice are different modes. You should drill at 85% success and perform at 100%. The 15% failure zone is where the learning happens; the 100% zone is where you verify the learning is stable.",
    },
    {
        q: "How does 'desirable difficulty' fit in?",
        a: "Robert Bjork's research on desirable difficulties shows that practice conditions that make learning feel harder in the moment - spaced repetition, interleaving, reduced feedback - produce better long-term retention. It is the behavioral sibling of the 85% rule: manageable struggle beats effortless repetition for anything you want to keep.",
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
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: "The 85% Rule", item: PAGE_URL },
    ],
};

const esc = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c");

export default function EightyFivePercentRulePage() {
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
                            <Link href="/blog" className="hover:text-mambo-gold transition-colors">Blog</Link>
                            <span className="mx-2 opacity-40">/</span>
                            <span className="text-white/80">The 85% Rule</span>
                        </nav>

                        <span className="inline-block rounded-full border border-mambo-gold/40 bg-mambo-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-mambo-gold">
                            Training Science
                        </span>

                        <h1 className="mt-4 font-serif text-[clamp(1.8rem,6.5vw,3.4rem)] font-bold leading-[1.1] text-white sm:mt-5 lg:mt-6 landscape-phone:!text-2xl landscape-phone:!leading-tight">
                            The 85% Rule:{" "}
                            <span className="text-mambo-gold">How Your Brain Actually Learns to Dance</span>
                        </h1>

                        <p className="mt-5 text-base text-white/70 sm:text-lg lg:text-xl landscape-phone:!text-sm landscape-phone:!mt-3">
                            By {FOUNDER.name} · Certified in Learning Experience Design · 10 min read
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
                                A 2019 paper in <em>Nature Human Behaviour</em> by Wilson, Shenhav,
                                Steine-Hanson, and Cohen found the mathematically optimal error rate for skill
                                acquisition is exactly{" "}
                                <strong className="text-mambo-gold">15.87% failure</strong>, or about 85%
                                success. Higher than that, your brain cannot lock onto a clear pattern. Lower
                                than that, your brain files the skill as &ldquo;done&rdquo; and stops
                                upgrading it. This is the math behind why clean practice stalls progress and
                                why slightly-too-hard drills are the fastest path to improvement.
                            </p>
                        </div>
                    </div>
                </section>

                <article className="relative px-5 pb-16 sm:px-8 lg:px-12 landscape-phone:!pb-10">
                    <div className="mx-auto max-w-3xl text-white/85">

                        <Section title="The study">
                            <p>
                                In 2019, Robert Wilson and colleagues at the University of Arizona published{" "}
                                <em>
                                    &ldquo;The Eighty Five Percent Rule for Optimal Learning&rdquo;
                                </em>{" "}
                                in <em>Nature Human Behaviour</em>. They asked a precise question: if you
                                could set the difficulty dial on a practice session to any number, what
                                would the dial be set to in order to learn as fast as mathematically possible?
                            </p>
                            <p>
                                The answer comes out of the shape of a standard learning curve: an
                                S-shaped sigmoid. The curve rises slowly when the skill is new, rises
                                fastest in the middle, and plateaus at the top when the skill is mastered.
                                Wilson asked: at which point on the curve is the slope (the rate of
                                improvement per rep) steepest?
                            </p>
                            <p>
                                That point, derived from the math, is{" "}
                                <strong className="text-mambo-gold">15.87% failure</strong>. Not 10%. Not 25%.
                                15.87%. It is a specific number that falls out of a specific curve, not a
                                rough guess someone proposed.
                            </p>
                        </Section>

                        <Section title="Why your brain works this way">
                            <p>
                                Movement learning is an error-correction loop. You try something, your body
                                does a version of it, and your brain compares what you <em>meant</em> to do
                                against what <em>actually happened</em>. The mismatch generates a signal in
                                the cerebellum (the region at the back of your brain that fine-tunes
                                movement), and that signal is what tells your motor cortex to update.
                            </p>
                            <p>
                                If every rep lands perfectly, there is no mismatch. No signal. Your brain
                                decides the move is handled and re-routes attention to whatever is still
                                broken. That is why clean practice feels productive but produces diminishing
                                returns: you are rehearsing what you already know instead of training what
                                is still forming.
                            </p>
                            <p>
                                If too many reps fail, the signal is noisy. Your brain cannot distinguish a
                                real pattern from random error. Researchers call this{" "}
                                <strong className="text-white">frustrated learning</strong>: you are working
                                hard but the brain has nothing stable to update toward.
                            </p>
                            <p>
                                The 15% failure zone is where the signal is clean. Your brain knows
                                approximately what went wrong, has a stable reference for what going right
                                looks like, and can make a small update per rep.
                            </p>
                        </Section>

                        <Section title="Desirable difficulty (Bjork)">
                            <p>
                                The 85% rule has a behavioural sibling: Robert Bjork&rsquo;s concept of{" "}
                                <strong className="text-white">desirable difficulty</strong>. Bjork spent
                                decades showing that practice conditions which feel{" "}
                                <em>harder in the moment</em> (spacing reps out, interleaving
                                different skills, reducing feedback) produce better{" "}
                                <em>long-term</em> retention. Massed practice of a single skill with constant
                                feedback feels better while you are doing it and produces noticeably worse
                                retention a week later.
                            </p>
                            <p>
                                The practical implication for dance: if your practice session feels
                                effortless and seamless, you are probably not learning much. If it feels
                                slightly above your current level (uncomfortable, a little chaotic,
                                lots of honest misses), you are probably learning at close to the
                                maximum rate your brain allows.
                            </p>
                        </Section>

                        <Section title="How to apply the 85% rule to salsa practice">
                            <ol className="list-decimal space-y-4 pl-5 marker:text-mambo-gold marker:font-semibold">
                                <li>
                                    <strong className="text-white">Pick one isolated skill.</strong>{" "}
                                    Do not drill &ldquo;salsa.&rdquo; Drill a specific thing: a spin
                                    prep, a cross-body lead on a specific count, a shine sequence at a
                                    specific tempo. You need a binary hit/miss criterion to measure a rate.
                                </li>
                                <li>
                                    <strong className="text-white">Run 10 reps and score them honestly.</strong>{" "}
                                    Define in advance what counts as a hit. Then count. 9 or 10 hits means
                                    the drill is too easy. 5 or fewer means it is too hard.
                                </li>
                                <li>
                                    <strong className="text-white">Adjust the difficulty dial.</strong>{" "}
                                    Too easy: bump the BPM up 10%, add an arm styling layer, run it on
                                    the non-dominant side, add a partner, or remove mirror feedback. Too
                                    hard: simplify until you stabilize at 8-9 hits of 10.
                                </li>
                                <li>
                                    <strong className="text-white">Stay in the 80-90% band.</strong>{" "}
                                    Once you find the band, stay there for 15-20 sustained minutes. That is
                                    the zone where your cerebellum is producing clean error signals and your
                                    motor cortex is updating the movement representation rep by rep.
                                </li>
                            </ol>
                        </Section>

                        <Section title="Why &lsquo;clean&rsquo; practice feels good but teaches less">
                            <p>
                                If you have ever finished a 60-minute practice session where every rep
                                felt smooth and walked out thinking &ldquo;that was great,&rdquo; you
                                probably taught yourself less than you would have in 20 minutes of messy
                                drilling at the edge of your ability.
                            </p>
                            <p>
                                The brain does not reward exertion. It rewards prediction error, and
                                specifically, a manageable amount of it. An hour of rehearsing what you
                                already know keeps the dance safely inside your comfort zone and generates
                                almost no update signal. Twenty minutes of drilling at 85% success, where
                                you are missing two out of every ten reps and honestly feeling those misses,
                                is where the neurology of learning actually operates.
                            </p>
                            <p>
                                This is not an argument for punishing yourself. It is an argument for{" "}
                                <em>calibration</em>. Your practice should feel honestly difficult, not
                                crushing. 15% failure, not 50%.
                            </p>
                        </Section>

                        <Section title="What this looks like in a structured curriculum">
                            <p>
                                The Mambo Guild curriculum is built around this principle. Every lesson
                                gates to the next at an explicit mastery criterion. Every drill has a
                                difficulty slider. The Skill Tree only unlocks a new branch once you can
                                execute the current branch consistently, not flawlessly, but
                                consistently. The whole point is to keep you in the 85% band without having
                                to measure your own hit rate with a clipboard.
                            </p>
                            <p>
                                The alternative (taking random classes, drilling whatever the teacher
                                happened to cover this week) almost always puts you either too low
                                (bored, repeating what you know) or too high (lost, learning nothing). Both
                                failure modes are visible in the plateaus self-taught salsa dancers hit
                                around six to nine months of casual learning.
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

                        <Section title="Sources">
                            <ul className="list-disc space-y-2 pl-5 text-sm text-white/70 marker:text-mambo-gold">
                                <li>
                                    Wilson, R.C., Shenhav, A., Steine-Hanson, M., &amp; Cohen, J.D.
                                    (2019). <em>The Eighty Five Percent Rule for Optimal Learning</em>.
                                    Nature Human Behaviour, 3, 1316-1323.
                                </li>
                                <li>
                                    Bjork, R.A. (1994). Memory and Metamemory Considerations in the
                                    Training of Human Beings. In J. Metcalfe &amp; A. Shimamura (Eds.),{" "}
                                    <em>Metacognition</em>. MIT Press.
                                </li>
                                <li>
                                    Schmidt, R.A., &amp; Lee, T.D. (2011).{" "}
                                    <em>Motor Learning and Performance: From Principles to Application</em>{" "}
                                    (5th ed.). Human Kinetics.
                                </li>
                            </ul>
                        </Section>

                        <div className="mt-12 rounded-2xl border border-mambo-gold/30 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 text-center sm:p-8 landscape-phone:!p-5">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-mambo-gold">
                                Practice smarter
                            </p>
                            <h2 className="font-serif text-2xl font-bold leading-tight text-white sm:text-3xl">
                                A curriculum calibrated to the 85% zone.
                            </h2>
                            <p className="mx-auto mt-3 max-w-xl text-white/70">
                                Every drill, lesson, and skill tree branch in the Mambo Guild is tuned to
                                keep you at the difficulty band where learning actually happens. Built on
                                learning-science principles by a certified Learning Experience Designer.
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
                                <RelatedLink href="/salsa-on1-vs-on2" title="Salsa On1 vs Salsa On2: which should you learn first?" />
                                <RelatedLink href="/blog/mambo-history" title="The Birth of Mambo: from Havana to the Palladium" />
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
