import type { Metadata } from "next";
import Link from "next/link";
import NavBarAuth from "@/components/NavBarAuth";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME, FOUNDER } from "@/lib/site";
import { hreflangAlternates } from "@/i18n/seo-routing";

const PAGE_PATH = "/blog/mambo-history";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const PUBLISHED = "2026-04-25T00:00:00Z";
const MODIFIED = "2026-04-25T00:00:00Z";

const TITLE = "The Birth of Mambo: From Havana to the Palladium";
const DESCRIPTION =
    "How Mambo emerged from Cuban Danzon, Son, and Afro-Cuban rhythm, was transformed by Arsenio Rodriguez and the Palladium dancers, and was codified as modern New York Style Salsa On2 by Eddie Torres.";

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

const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
        { "@type": "ListItem", position: 3, name: "The Birth of Mambo", item: PAGE_URL },
    ],
};

const esc = (o: unknown) => JSON.stringify(o).replace(/</g, "\\u003c");

export default function MamboHistoryPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: esc(articleSchema) }} />
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
                            <span className="text-white/80">Mambo History</span>
                        </nav>

                        <span className="inline-block rounded-full border border-mambo-gold/40 bg-mambo-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-mambo-gold">
                            History
                        </span>

                        <h1 className="mt-4 font-serif text-[clamp(1.8rem,6.5vw,3.4rem)] font-bold leading-[1.1] text-white sm:mt-5 lg:mt-6 landscape-phone:!text-2xl landscape-phone:!leading-tight">
                            The Birth of Mambo:{" "}
                            <span className="text-mambo-gold">From Havana to the Palladium</span>
                        </h1>

                        <p className="mt-5 text-base text-white/70 sm:text-lg lg:text-xl landscape-phone:!text-sm landscape-phone:!mt-3">
                            By {FOUNDER.name} · 2x European Salsa Champion · 14 min read
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
                                Mambo was not invented in a single moment. It is the climax of a century-long
                                synthesis: Afro-Cuban percussion traditions, Spanish-European dance form, and
                                American urban theatricality colliding in three successive eras. Its modern
                                form was crystallized by{" "}
                                <strong className="text-mambo-gold">Arsenio Rodriguez</strong> in 1940s Havana,
                                transformed by the{" "}
                                <strong className="text-mambo-gold">Palladium dancers</strong> in 1950s New
                                York, and codified for teaching by{" "}
                                <strong className="text-mambo-gold">Eddie Torres</strong> in the 1970s.
                            </p>
                        </div>
                    </div>
                </section>

                <article className="relative px-5 pb-16 sm:px-8 lg:px-12 landscape-phone:!pb-10">
                    <div className="mx-auto max-w-3xl text-white/85">

                        <Section title="Part 1: The three Cuban roots">
                            <p>
                                Before New York claimed Mambo as its own, the rhythms and body language of
                                the dance were forged in Cuba through a collision between two cultures with
                                opposite ideas about how to move.
                            </p>
                            <p>
                                On one side, the{" "}
                                <strong className="text-white">European tradition</strong>: Spanish colonial
                                ballrooms, the contradanza, and eventually the Danzon (debuted in 1879 by
                                Miguel Failde). The dances were upright. The frame was strict. The legs were
                                relatively straight. Music was played on violins, flutes, and pianos. Dancers
                                stepped firmly on the downbeat.
                            </p>
                            <p>
                                On the other side, the{" "}
                                <strong className="text-white">Afro-Cuban tradition</strong>, preserved in the{" "}
                                <em>solares</em> (courtyards) and working-class neighborhoods: Rumba, including
                                Guaguanco, Yambu, Columbia. The posture was low, with bent knees and a grounded
                                center of gravity. Movement lived in the shoulders, the ribs, the hips. The
                                phrasing emphasized the offbeats and the empty spaces between them.
                            </p>
                            <p>
                                Through the early 20th century, these traditions were kept separate by class
                                and race. The bridge between them emerged in the 1920s in the form of{" "}
                                <strong className="text-white">Son</strong>. Originating in the eastern Oriente
                                province, Son combined Spanish guitar and lyrical structures with Afro-Cuban
                                percussion (bongos, maracas, the clave). It was the first music that was
                                socially acceptable in the upper-class clubs and authentically driven by the
                                street rhythm traditions.
                            </p>
                        </Section>

                        <Section title="Part 2: Arsenio Rodriguez and the conga drum">
                            <p>
                                In the 1930s and 1940s, a blind tres-guitar player named{" "}
                                <strong className="text-white">Arsenio Rodriguez</strong> decided the Son
                                ensemble needed more drive. He expanded the traditional septeto into a{" "}
                                <em>conjunto</em>, adding multiple trumpets, the piano, and (most
                                controversially) the conga drum. The conga had previously been
                                dismissed as too &ldquo;street&rdquo; for formal ensembles. Arsenio put it at
                                the heart of the sound.
                            </p>
                            <p>
                                He also stretched the{" "}
                                <strong className="text-white">montuno</strong> section of the song: the open-
                                ended, heavily syncopated, repetitive vamp at the end where singers improvised
                                and dancers could finally cut loose. The slow, driving, percussion-forward son
                                montuno that emerged is the direct rhythmic ancestor of Mambo.
                            </p>
                            <p>
                                What Arsenio enforced, musically, was an Afro-Cuban approach to time. The
                                foundational pattern of the music is the{" "}
                                <strong className="text-white">clave</strong>, a 5-stroke skeleton that defines
                                the feel of every subsequent layer. Danced correctly, the music asks your body
                                to soften the knees, lower the center of gravity, and delay the weight transfer
                                so that the step settles into the rhythm rather than marching over it. That
                                delay is what causes Cuban motion (the figure-eight of the hips)
                                to happen naturally instead of mechanically.
                            </p>
                        </Section>

                        <Section title="Part 3: The Palladium Ballroom (1948-1966)">
                            <p>
                                In 1948, the Palladium Ballroom at 53rd and Broadway opened its doors to
                                racially integrated Latin music nights. Within a few years, it was the
                                epicenter of the{" "}
                                <strong className="text-white">Mambo Craze</strong>. Three house bandleaders
                                (Tito Puente, Tito Rodriguez, and Machito) drove the music.
                                Dancers from the Bronx, Brooklyn, and Spanish Harlem drove the dance.
                            </p>
                            <p>
                                The Palladium dancers were not academically trained. They were working-class
                                Puerto Rican, Italian, Jewish, and African American kids who had no formal
                                social status and built their identity on the dance floor instead. They
                                stole from everything: tap dancing from the Cotton Club, Lindy Hop acrobatics
                                from the Savoy Ballroom, ballroom frame from the studios of midtown Manhattan.
                                They bolted it all onto the Afro-Cuban clave.
                            </p>
                            <p>
                                The legends of the era:
                            </p>
                            <ul className="list-disc space-y-3 pl-5 marker:text-mambo-gold">
                                <li>
                                    <strong className="text-white">Cuban Pete (Pedro Aguilar)</strong>, a Puerto
                                    Rican dancer from the Bronx with a tap and Lindy Hop background, fused
                                    Afro-Cuban grounding with American jazz styling and professionalized Mambo
                                    exhibition dancing.
                                </li>
                                <li>
                                    <strong className="text-white">Millie Donay</strong>, Cuban Pete&rsquo;s
                                    Italian-American partner, revolutionized the role of the follow. Before
                                    Millie, follows in Latin dance were expected to passively follow the lead.
                                    She matched him hit for hit.
                                </li>
                                <li>
                                    <strong className="text-white">Killer Joe Piro</strong>, an
                                    Italian-American dancer, became the most famous Mambo instructor in the
                                    country, the figure who codified the chaos of the Palladium floor
                                    into steps that could be sold to middle-class America.
                                </li>
                                <li>
                                    <strong className="text-white">Augie and Margo Rodriguez</strong> fused
                                    Mambo with sweeping ballroom techniques and took the dance to national
                                    television on the Ed Sullivan Show.
                                </li>
                            </ul>
                            <p>
                                Out of this collision came the biomechanical signature that still defines New
                                York Mambo: a grounded, bent-knee lower body married to an aggressively
                                upright, locked-frame upper body. The abdominal core acts as the shock absorber
                                between the two. When you see a world-class On2 dancer&rsquo;s feet moving at
                                blinding speed while her chest stays completely quiet, you are looking at the
                                direct inheritance of this era.
                            </p>
                        </Section>

                        <Section title="Part 4: Eddie Torres and the codification of On2">
                            <p>
                                The Palladium closed in 1966. By the 1970s, what had been called &ldquo;Mambo&rdquo;
                                was being rebranded by the record industry as &ldquo;Salsa&rdquo;, the
                                same Afro-Cuban musical traditions under a new, market-friendly label.
                            </p>
                            <p>
                                The dancer who bridged the Palladium era and the modern one was{" "}
                                <strong className="text-white">Eddie Torres</strong>. Torres studied under
                                Tito Puente, who personally told him that breaking on the 2 was truer to the
                                clave and the conga than breaking on the 1. Torres took that musical principle
                                and built a teachable system around it: a specific count structure, a
                                specific basic step, a pedagogy that could be learned class by class rather
                                than absorbed by years of club osmosis.
                            </p>
                            <p>
                                Every modern Salsa On2 curriculum, including this one, ultimately traces back
                                to Eddie Torres&rsquo; structural work. The phrase &ldquo;New York Style&rdquo;
                                became synonymous with Torres&rsquo; lineage. Today, &ldquo;On2&rdquo; is
                                taught everywhere from New York to Tokyo, but the system nearly all of those
                                teachers inherit was Torres&rsquo; answer to a single question Tito Puente
                                asked him about the 2.
                            </p>
                        </Section>

                        <Section title="Why this history matters on the dance floor">
                            <p>
                                History is not decoration here. Three things change how you actually move
                                once you understand where the dance came from:
                            </p>
                            <ol className="list-decimal space-y-3 pl-5 marker:text-mambo-gold marker:font-semibold">
                                <li>
                                    <strong className="text-white">You stop fighting the bent knees.</strong>{" "}
                                    Soft knees are not a stylistic choice. They are biologically required to
                                    execute the delayed weight transfer that makes the rhythm work.
                                </li>
                                <li>
                                    <strong className="text-white">You stop bouncing the shoulders.</strong>{" "}
                                    The quiet upper body is not aesthetic affectation. It is the inherited
                                    ballroom discipline that makes the footwork legible and the lead legible
                                    through the frame.
                                </li>
                                <li>
                                    <strong className="text-white">You stop breaking on the 1.</strong>{" "}
                                    The conga slap falls on the 2. Your break step is not an arbitrary count
                                    choice; it is a meeting point between your body and the rhythm section
                                    of the band.
                                </li>
                            </ol>
                            <p>
                                This is the thesis of{" "}
                                <Link href="/what-is-salsa-on2" className="text-mambo-gold underline underline-offset-2 hover:text-brass-light">
                                    the On2 style
                                </Link>{" "}
                                and the core of the Mambo Guild curriculum.
                            </p>
                        </Section>

                        <Section title="Sources and further reading">
                            <ul className="list-disc space-y-2 pl-5 text-sm text-white/70 marker:text-mambo-gold">
                                <li>McMains, Juliet. <em>Spinning Mambo into Salsa: Caribbean Dance in Global Commerce</em>. Oxford University Press, 2015.</li>
                                <li>Roberts, John Storm. <em>The Latin Tinge: The Impact of Latin American Music on the United States</em>. Oxford University Press, 1999.</li>
                                <li>Fernandez, Raul A. <em>From Afro-Cuban Rhythms to Latin Jazz</em>. University of California Press, 2006.</li>
                                <li>Manuel, Peter. <em>Caribbean Currents: Caribbean Music from Rumba to Reggae</em>. Temple University Press, 2009.</li>
                                <li>Gottschild, Brenda Dixon. <em>Digging the Africanist Presence in American Performance</em>. Greenwood Press, 1996.</li>
                            </ul>
                        </Section>

                        <div className="mt-12 rounded-2xl border border-mambo-gold/30 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 text-center sm:p-8 landscape-phone:!p-5">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-mambo-gold">
                                Go deeper
                            </p>
                            <h2 className="font-serif text-2xl font-bold leading-tight text-white sm:text-3xl">
                                The Mambo Guild has a full 20-module history course.
                            </h2>
                            <p className="mx-auto mt-3 max-w-xl text-white/70">
                                Each module traces one thread of the story, from the African drum traditions
                                through the Fania era. All sourced, all taught by certified dance academics.
                                Included in every Mambo Guild membership.
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
