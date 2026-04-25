/**
 * /blog/mambo-history article content per locale. Hand-authored in-session.
 *
 * Rich-text markers (parsed in _Body.tsx):
 *   **bold**            -> gold inline emphasis
 *   *italic*            -> em
 *   [link]TEXT[/link]   -> internal link to /what-is-salsa-on2
 *
 * The "Sources" list items are kept as plain bullets (italics handled with *...*),
 * because they need to render verbatim citation strings without locale-specific
 * paraphrasing of book titles. We translate publisher framing words only.
 */
import type { Locale } from "@/i18n/config";

export type Faq = { q: string; a: string };

export type MamboHistoryContent = {
  metaTitle: string;
  metaDescription: string;

  breadcrumbHome: string;
  breadcrumbBlog: string;
  breadcrumbCurrent: string;

  badge: string;
  h1Pre: string;
  h1Accent: string;

  /** Rich; **bold** allowed. */
  shortAnswerRich: string;

  /** Section 1: Three Cuban roots. */
  sec1Title: string;
  sec1Paragraphs: string[]; // rich allowed (bold + italic)

  /** Section 2: Arsenio Rodriguez. */
  sec2Title: string;
  sec2Paragraphs: string[];

  /** Section 3: Palladium. */
  sec3Title: string;
  sec3IntroParagraphs: string[];   // before bullet list
  sec3LegendsLeadIn: string;       // single line "The legends of the era:"
  sec3LegendsBullets: string[];    // each starts with **Bold Name** ...
  sec3OutroParagraphs: string[];   // after bullet list

  /** Section 4: Eddie Torres. */
  sec4Title: string;
  sec4Paragraphs: string[];

  /** Section 5: Why history matters on the floor. */
  sec5Title: string;
  sec5Intro: string;
  sec5Steps: string[];             // each starts with **Bold lead.** body
  /** Closing paragraph; uses [link]...[/link] marker for /what-is-salsa-on2. */
  sec5OutroRich: string;

  /** Sources & further reading section. */
  sec6Title: string;
  /** Each entry rendered as a single bullet line. *italic* allowed for titles. */
  sec6Sources: string[];

  /** Final CTA card. */
  ctaEyebrow: string;     // small uppercase label, e.g. "Go deeper"
  ctaHeading: string;     // big heading
  ctaBody: string;        // supporting body copy under heading

  /** FAQ section. */
  faqs: Faq[];
};

const CONTENT: Record<Locale, MamboHistoryContent> = {
  // ============================================================ EN
  en: {
    metaTitle: "The Birth of Mambo: From Havana to the Palladium",
    metaDescription:
      "How Mambo emerged from Cuban Danzon, Son, and Afro-Cuban rhythm, was transformed by Arsenio Rodriguez and the Palladium dancers, and was codified as modern New York Style Salsa On2 by Eddie Torres.",

    breadcrumbHome: "Home",
    breadcrumbBlog: "Blog",
    breadcrumbCurrent: "Mambo History",

    badge: "History",
    h1Pre: "The Birth of Mambo: ",
    h1Accent: "From Havana to the Palladium",

    shortAnswerRich:
      "Mambo was not invented in a single moment. It is the climax of a century-long synthesis: Afro-Cuban percussion traditions, Spanish-European dance form, and American urban theatricality colliding in three successive eras. Its modern form was crystallized by **Arsenio Rodriguez** in 1940s Havana, transformed by the **Palladium dancers** in 1950s New York, and codified for teaching by **Eddie Torres** in the 1970s.",

    sec1Title: "Part 1: The three Cuban roots",
    sec1Paragraphs: [
      "Before New York claimed Mambo as its own, the rhythms and body language of the dance were forged in Cuba through a collision between two cultures with opposite ideas about how to move.",
      "On one side, the **European tradition**: Spanish colonial ballrooms, the contradanza, and eventually the Danzon (debuted in 1879 by Miguel Failde). The dances were upright. The frame was strict. The legs were relatively straight. Music was played on violins, flutes, and pianos. Dancers stepped firmly on the downbeat.",
      "On the other side, the **Afro-Cuban tradition**, preserved in the *solares* (courtyards) and working-class neighborhoods: Rumba, including Guaguanco, Yambu, Columbia. The posture was low, with bent knees and a grounded center of gravity. Movement lived in the shoulders, the ribs, the hips. The phrasing emphasized the offbeats and the empty spaces between them.",
      "Through the early 20th century, these traditions were kept separate by class and race. The bridge between them emerged in the 1920s in the form of **Son**. Originating in the eastern Oriente province, Son combined Spanish guitar and lyrical structures with Afro-Cuban percussion (bongos, maracas, the clave). It was the first music that was socially acceptable in the upper-class clubs and authentically driven by the street rhythm traditions.",
    ],

    sec2Title: "Part 2: Arsenio Rodriguez and the conga drum",
    sec2Paragraphs: [
      "In the 1930s and 1940s, a blind tres-guitar player named **Arsenio Rodriguez** decided the Son ensemble needed more drive. He expanded the traditional septeto into a *conjunto*, adding multiple trumpets, the piano, and (most controversially) the conga drum. The conga had previously been dismissed as too \"street\" for formal ensembles. Arsenio put it at the heart of the sound.",
      "He also stretched the **montuno** section of the song: the open-ended, heavily syncopated, repetitive vamp at the end where singers improvised and dancers could finally cut loose. The slow, driving, percussion-forward son montuno that emerged is the direct rhythmic ancestor of Mambo.",
      "What Arsenio enforced, musically, was an Afro-Cuban approach to time. The foundational pattern of the music is the **clave**, a 5-stroke skeleton that defines the feel of every subsequent layer. Danced correctly, the music asks your body to soften the knees, lower the center of gravity, and delay the weight transfer so that the step settles into the rhythm rather than marching over it. That delay is what causes Cuban motion (the figure-eight of the hips) to happen naturally instead of mechanically.",
    ],

    sec3Title: "Part 3: The Palladium Ballroom (1948-1966)",
    sec3IntroParagraphs: [
      "In 1948, the Palladium Ballroom at 53rd and Broadway opened its doors to racially integrated Latin music nights. Within a few years, it was the epicenter of the **Mambo Craze**. Three house bandleaders (Tito Puente, Tito Rodriguez, and Machito) drove the music. Dancers from the Bronx, Brooklyn, and Spanish Harlem drove the dance.",
      "The Palladium dancers were not academically trained. They were working-class Puerto Rican, Italian, Jewish, and African American kids who had no formal social status and built their identity on the dance floor instead. They stole from everything: tap dancing from the Cotton Club, Lindy Hop acrobatics from the Savoy Ballroom, ballroom frame from the studios of midtown Manhattan. They bolted it all onto the Afro-Cuban clave.",
    ],
    sec3LegendsLeadIn: "The legends of the era:",
    sec3LegendsBullets: [
      "**Cuban Pete (Pedro Aguilar)**, a Puerto Rican dancer from the Bronx with a tap and Lindy Hop background, fused Afro-Cuban grounding with American jazz styling and professionalized Mambo exhibition dancing.",
      "**Millie Donay**, Cuban Pete's Italian-American partner, revolutionized the role of the follow. Before Millie, follows in Latin dance were expected to passively follow the lead. She matched him hit for hit.",
      "**Killer Joe Piro**, an Italian-American dancer, became the most famous Mambo instructor in the country, the figure who codified the chaos of the Palladium floor into steps that could be sold to middle-class America.",
      "**Augie and Margo Rodriguez** fused Mambo with sweeping ballroom techniques and took the dance to national television on the Ed Sullivan Show.",
    ],
    sec3OutroParagraphs: [
      "Out of this collision came the biomechanical signature that still defines New York Mambo: a grounded, bent-knee lower body married to an aggressively upright, locked-frame upper body. The abdominal core acts as the shock absorber between the two. When you see a world-class On2 dancer's feet moving at blinding speed while her chest stays completely quiet, you are looking at the direct inheritance of this era.",
    ],

    sec4Title: "Part 4: Eddie Torres and the codification of On2",
    sec4Paragraphs: [
      "The Palladium closed in 1966. By the 1970s, what had been called \"Mambo\" was being rebranded by the record industry as \"Salsa\", the same Afro-Cuban musical traditions under a new, market-friendly label.",
      "The dancer who bridged the Palladium era and the modern one was **Eddie Torres**. Torres studied under Tito Puente, who personally told him that breaking on the 2 was truer to the clave and the conga than breaking on the 1. Torres took that musical principle and built a teachable system around it: a specific count structure, a specific basic step, a pedagogy that could be learned class by class rather than absorbed by years of club osmosis.",
      "Every modern Salsa On2 curriculum, including this one, ultimately traces back to Eddie Torres' structural work. The phrase \"New York Style\" became synonymous with Torres' lineage. Today, \"On2\" is taught everywhere from New York to Tokyo, but the system nearly all of those teachers inherit was Torres' answer to a single question Tito Puente asked him about the 2.",
    ],

    sec5Title: "Why this history matters on the dance floor",
    sec5Intro:
      "History is not decoration here. Three things change how you actually move once you understand where the dance came from:",
    sec5Steps: [
      "**You stop fighting the bent knees.** Soft knees are not a stylistic choice. They are biologically required to execute the delayed weight transfer that makes the rhythm work.",
      "**You stop bouncing the shoulders.** The quiet upper body is not aesthetic affectation. It is the inherited ballroom discipline that makes the footwork legible and the lead legible through the frame.",
      "**You stop breaking on the 1.** The conga slap falls on the 2. Your break step is not an arbitrary count choice; it is a meeting point between your body and the rhythm section of the band.",
    ],
    sec5OutroRich:
      "This is the thesis of [link]the On2 style[/link] and the core of the Mambo Guild curriculum.",

    sec6Title: "Sources and further reading",
    sec6Sources: [
      "McMains, Juliet. *Spinning Mambo into Salsa: Caribbean Dance in Global Commerce*. Oxford University Press, 2015.",
      "Roberts, John Storm. *The Latin Tinge: The Impact of Latin American Music on the United States*. Oxford University Press, 1999.",
      "Fernandez, Raul A. *From Afro-Cuban Rhythms to Latin Jazz*. University of California Press, 2006.",
      "Manuel, Peter. *Caribbean Currents: Caribbean Music from Rumba to Reggae*. Temple University Press, 2009.",
      "Gottschild, Brenda Dixon. *Digging the Africanist Presence in American Performance*. Greenwood Press, 1996.",
    ],

    ctaEyebrow: "Go deeper",
    ctaHeading: "The Mambo Guild has a full 20-module history course.",
    ctaBody:
      "Each module traces one thread of the story, from the African drum traditions through the Fania era. All sourced, all taught by certified dance academics. Included in every Mambo Guild membership.",

    faqs: [
      {
        q: "Who actually invented Mambo?",
        a: "There is no single inventor. Cuban bandleaders Arsenio Rodriguez (1940s Havana) and Perez Prado (Mexico City, 1948 onward) gave the music its foundational shape; the dance was crystallized by working-class New Yorkers at the Palladium Ballroom across 1948-1966.",
      },
      {
        q: "Is Mambo the same as Salsa?",
        a: "Musically, modern Salsa is a marketing rebrand of Mambo and adjacent Afro-Cuban genres made by the New York record industry in the early 1970s. As a dance, what is taught today as Salsa On2 (New York Style) is the direct descendant of Palladium-era Mambo.",
      },
      {
        q: "What is the clave?",
        a: "The clave is a 5-stroke rhythmic pattern over two bars (3-2 or 2-3) that anchors all Afro-Cuban music. Every other instrument is phrased in relation to it; danced correctly, your weight changes also align to it.",
      },
      {
        q: "Why did the Palladium era end?",
        a: "The Palladium Ballroom lost its liquor license in 1966 and closed shortly after. The Mambo craze had also been displaced in the broader culture by rock and roll and, within Latin music, by Boogaloo and the early Salsa label era.",
      },
      {
        q: "Who was Eddie Torres?",
        a: "Eddie Torres is a New York dancer and choreographer who studied under Tito Puente and codified what is now taught worldwide as Salsa On2 / New York Style. He turned the floor knowledge of Palladium-era dancers into a teachable curriculum.",
      },
    ],
  },

  // ============================================================ ES
  es: {
    metaTitle: "El nacimiento del Mambo: de La Habana al Palladium",
    metaDescription:
      "Cómo el Mambo surgió del Danzón cubano, el Son y los ritmos afrocubanos, fue transformado por Arsenio Rodríguez y los bailarines del Palladium, y fue codificado como la Salsa On2 estilo Nueva York moderna por Eddie Torres.",

    breadcrumbHome: "Inicio",
    breadcrumbBlog: "Blog",
    breadcrumbCurrent: "Historia del Mambo",

    badge: "Historia",
    h1Pre: "El nacimiento del Mambo: ",
    h1Accent: "de La Habana al Palladium",

    shortAnswerRich:
      "El Mambo no se inventó en un solo momento. Es la culminación de una síntesis de un siglo: tradiciones afrocubanas de percusión, formas de baile español-europeas y teatralidad urbana estadounidense colisionando en tres eras sucesivas. Su forma moderna fue cristalizada por **Arsenio Rodríguez** en La Habana de los años 40, transformada por los **bailarines del Palladium** en la Nueva York de los 50, y codificada para la enseñanza por **Eddie Torres** en los años 70.",

    sec1Title: "Parte 1: Las tres raíces cubanas",
    sec1Paragraphs: [
      "Antes de que Nueva York reclamara el Mambo como suyo, los ritmos y el lenguaje corporal del baile se forjaron en Cuba a través del choque entre dos culturas con ideas opuestas sobre cómo moverse.",
      "Por un lado, la **tradición europea**: salones coloniales españoles, la contradanza y, finalmente, el Danzón (estrenado en 1879 por Miguel Failde). Los bailes eran erguidos. La postura era estricta. Las piernas relativamente rectas. La música se tocaba con violines, flautas y pianos. Los bailarines pisaban firmes en el tiempo fuerte.",
      "Por el otro, la **tradición afrocubana**, conservada en los *solares* (patios) y los barrios obreros: la Rumba, incluyendo Guaguancó, Yambú y Columbia. La postura era baja, con las rodillas flexionadas y un centro de gravedad arraigado al suelo. El movimiento vivía en los hombros, las costillas, las caderas. La fraseología enfatizaba los contratiempos y los espacios vacíos entre ellos.",
      "A lo largo de comienzos del siglo XX, estas tradiciones se mantuvieron separadas por clase y raza. El puente entre ambas surgió en los años 20 con la forma del **Son**. Originario de la provincia oriental de Oriente, el Son combinaba la guitarra y la estructura lírica españolas con la percusión afrocubana (bongós, maracas, clave). Fue la primera música que era socialmente aceptable en los clubes de clase alta y a la vez auténticamente impulsada por las tradiciones rítmicas de la calle.",
    ],

    sec2Title: "Parte 2: Arsenio Rodríguez y la conga",
    sec2Paragraphs: [
      "En las décadas de 1930 y 1940, un tresero ciego llamado **Arsenio Rodríguez** decidió que el ensamble del Son necesitaba más empuje. Expandió el septeto tradicional hasta convertirlo en un *conjunto*, añadiendo varias trompetas, el piano y, lo más controvertido, la conga. Hasta entonces, la conga había sido descartada como demasiado \"callejera\" para los ensambles formales. Arsenio la puso en el corazón del sonido.",
      "También extendió la sección **montuno** de la canción: ese vamp final, abierto, fuertemente sincopado y repetitivo, donde los cantantes improvisaban y los bailarines por fin podían soltarse. El son montuno lento, machacante y dominado por la percusión que surgió ahí es el ancestro rítmico directo del Mambo.",
      "Lo que Arsenio impuso, musicalmente, fue una concepción afrocubana del tiempo. El patrón fundacional de la música es la **clave**, un esqueleto de cinco golpes que define la sensación de cada capa posterior. Bailada correctamente, la música pide al cuerpo ablandar las rodillas, bajar el centro de gravedad y retrasar la transferencia de peso para que el paso se asiente en el ritmo en lugar de marcharse encima de él. Ese retraso es lo que hace que el movimiento cubano (el ocho de las caderas) ocurra de forma natural y no mecánica.",
    ],

    sec3Title: "Parte 3: el Palladium Ballroom (1948-1966)",
    sec3IntroParagraphs: [
      "En 1948, el Palladium Ballroom, en la calle 53 con Broadway, abrió sus puertas a noches de música latina racialmente integradas. En pocos años, era el epicentro de la **fiebre del Mambo**. Tres directores de orquesta de la casa (Tito Puente, Tito Rodríguez y Machito) impulsaban la música. Bailarines del Bronx, Brooklyn y el Spanish Harlem impulsaban el baile.",
      "Los bailarines del Palladium no tenían formación académica. Eran chavales puertorriqueños, italianos, judíos y afroamericanos de clase obrera, sin estatus social formal, que construían su identidad sobre la pista de baile. Robaban de todo: tap del Cotton Club, acrobacias de Lindy Hop del Savoy Ballroom, postura de salón de los estudios del centro de Manhattan. Lo atornillaron todo sobre la clave afrocubana.",
    ],
    sec3LegendsLeadIn: "Las leyendas de la época:",
    sec3LegendsBullets: [
      "**Cuban Pete (Pedro Aguilar)**, un bailarín puertorriqueño del Bronx con base de tap y Lindy Hop, fusionó el arraigo afrocubano con el estilo del jazz estadounidense y profesionalizó el Mambo de exhibición.",
      "**Millie Donay**, la pareja italoamericana de Cuban Pete, revolucionó el papel de la seguidora. Antes de Millie, se esperaba que las seguidoras del baile latino acompañaran pasivamente al líder. Ella le devolvía cada golpe.",
      "**Killer Joe Piro**, bailarín italoamericano, se convirtió en el instructor de Mambo más famoso del país, la figura que codificó el caos de la pista del Palladium en pasos que podían venderse a la clase media estadounidense.",
      "**Augie y Margo Rodríguez** fusionaron el Mambo con técnicas amplias de baile de salón y llevaron el baile a la televisión nacional en el Ed Sullivan Show.",
    ],
    sec3OutroParagraphs: [
      "De este choque salió la firma biomecánica que aún define al Mambo neoyorquino: un tren inferior arraigado y con rodillas flexionadas, casado con un tren superior agresivamente erguido y de postura bloqueada. El núcleo abdominal actúa como amortiguador entre ambos. Cuando ves los pies de una bailarina de On2 de clase mundial moviéndose a velocidad de vértigo mientras su pecho permanece completamente quieto, estás viendo la herencia directa de esta era.",
    ],

    sec4Title: "Parte 4: Eddie Torres y la codificación del On2",
    sec4Paragraphs: [
      "El Palladium cerró en 1966. En los años 70, lo que se había llamado \"Mambo\" estaba siendo rebautizado por la industria discográfica como \"Salsa\": las mismas tradiciones musicales afrocubanas bajo una etiqueta nueva y comercial.",
      "El bailarín que tendió el puente entre la era del Palladium y la moderna fue **Eddie Torres**. Torres estudió con Tito Puente, quien personalmente le dijo que romper en el 2 era más fiel a la clave y a la conga que romper en el 1. Torres tomó ese principio musical y construyó a su alrededor un sistema enseñable: una estructura de conteo concreta, un paso básico concreto, una pedagogía que podía aprenderse clase a clase en lugar de absorberse a lo largo de años de osmosis de club.",
      "Cada plan de estudios moderno de Salsa On2, incluido este, se remonta en última instancia al trabajo estructural de Eddie Torres. La expresión \"estilo Nueva York\" se volvió sinónimo del linaje de Torres. Hoy, el \"On2\" se enseña desde Nueva York hasta Tokio, pero el sistema que casi todos esos profesores heredan fue la respuesta de Torres a una sola pregunta que Tito Puente le hizo sobre el 2.",
    ],

    sec5Title: "Por qué esta historia importa en la pista",
    sec5Intro:
      "Aquí la historia no es decoración. Tres cosas cambian en cómo te mueves realmente una vez que entiendes de dónde viene el baile:",
    sec5Steps: [
      "**Dejas de pelearte con las rodillas flexionadas.** Las rodillas suaves no son una elección estilística. Son biológicamente necesarias para ejecutar la transferencia de peso retrasada que hace funcionar el ritmo.",
      "**Dejas de rebotar los hombros.** El tren superior quieto no es una afectación estética. Es la disciplina de salón heredada que hace legible el trabajo de pies y legible el liderazgo a través de la postura.",
      "**Dejas de romper en el 1.** El golpe de la conga cae en el 2. Tu paso de break no es una elección de conteo arbitraria; es el punto de encuentro entre tu cuerpo y la sección rítmica de la banda.",
    ],
    sec5OutroRich:
      "Esta es la tesis del [link]estilo On2[/link] y el núcleo del plan de estudios de The Mambo Guild.",

    sec6Title: "Fuentes y lecturas adicionales",
    sec6Sources: [
      "McMains, Juliet. *Spinning Mambo into Salsa: Caribbean Dance in Global Commerce*. Oxford University Press, 2015.",
      "Roberts, John Storm. *The Latin Tinge: The Impact of Latin American Music on the United States*. Oxford University Press, 1999.",
      "Fernandez, Raul A. *From Afro-Cuban Rhythms to Latin Jazz*. University of California Press, 2006.",
      "Manuel, Peter. *Caribbean Currents: Caribbean Music from Rumba to Reggae*. Temple University Press, 2009.",
      "Gottschild, Brenda Dixon. *Digging the Africanist Presence in American Performance*. Greenwood Press, 1996.",
    ],

    ctaEyebrow: "Profundiza más",
    ctaHeading: "The Mambo Guild tiene un curso completo de historia de 20 módulos.",
    ctaBody:
      "Cada módulo recorre un hilo de la historia, desde las tradiciones africanas del tambor hasta la era de Fania. Todo con fuentes, todo enseñado por académicos certificados de la danza. Incluido en cada membresía de The Mambo Guild.",

    faqs: [
      {
        q: "¿Quién inventó realmente el Mambo?",
        a: "No hay un único inventor. Los directores cubanos Arsenio Rodríguez (La Habana, años 40) y Pérez Prado (Ciudad de México, desde 1948) le dieron a la música su forma fundacional; el baile fue cristalizado por neoyorquinos de clase obrera en el Palladium Ballroom entre 1948 y 1966.",
      },
      {
        q: "¿Mambo y Salsa son lo mismo?",
        a: "Musicalmente, la Salsa moderna es un rebranding comercial del Mambo y de los géneros afrocubanos contiguos hecho por la industria discográfica neoyorquina a principios de los 70. Como baile, lo que hoy se enseña como Salsa On2 (estilo Nueva York) es el descendiente directo del Mambo de la era del Palladium.",
      },
      {
        q: "¿Qué es la clave?",
        a: "La clave es un patrón rítmico de cinco golpes a lo largo de dos compases (3-2 o 2-3) que ancla toda la música afrocubana. Cada uno de los demás instrumentos se fraseiona en relación a ella; bailada correctamente, tus cambios de peso también se alinean con ella.",
      },
      {
        q: "¿Por qué terminó la era del Palladium?",
        a: "El Palladium Ballroom perdió su licencia de bebidas en 1966 y cerró poco después. La fiebre del Mambo también había sido desplazada en la cultura general por el rock and roll y, dentro de la música latina, por el Boogaloo y los inicios de la era \"Salsa\".",
      },
      {
        q: "¿Quién fue Eddie Torres?",
        a: "Eddie Torres es un bailarín y coreógrafo neoyorquino que estudió con Tito Puente y codificó lo que hoy se enseña en todo el mundo como Salsa On2 / estilo Nueva York. Convirtió el conocimiento de pista de los bailarines de la era del Palladium en un plan de estudios enseñable.",
      },
    ],
  },
  // ============================================================ PT
  pt: {
    metaTitle: "O nascimento do Mambo: de Havana ao Palladium",
    metaDescription:
      "Como o Mambo emergiu do Danzón cubano, do Son e do ritmo afro-cubano, foi transformado por Arsenio Rodríguez e pelos bailarinos do Palladium, e foi codificado como a moderna Salsa On2 estilo Nova Iorque por Eddie Torres.",

    breadcrumbHome: "Início",
    breadcrumbBlog: "Blog",
    breadcrumbCurrent: "História do Mambo",

    badge: "História",
    h1Pre: "O nascimento do Mambo: ",
    h1Accent: "de Havana ao Palladium",

    shortAnswerRich:
      "O Mambo não foi inventado num só momento. É o auge de uma síntese de um século: tradições afro-cubanas de percussão, formas de dança espanhol-europeias e teatralidade urbana americana a colidirem em três eras sucessivas. A sua forma moderna foi cristalizada por **Arsenio Rodríguez** na Havana dos anos 40, transformada pelos **bailarinos do Palladium** na Nova Iorque dos anos 50, e codificada para o ensino por **Eddie Torres** nos anos 70.",

    sec1Title: "Parte 1: As três raízes cubanas",
    sec1Paragraphs: [
      "Antes de Nova Iorque reivindicar o Mambo como seu, os ritmos e a linguagem corporal da dança foram forjados em Cuba através do choque entre duas culturas com ideias opostas sobre como mover-se.",
      "De um lado, a **tradição europeia**: salões coloniais espanhóis, a contradanza e, finalmente, o Danzón (estreado em 1879 por Miguel Failde). As danças eram eretas. A postura era rígida. As pernas relativamente esticadas. A música tocava-se com violinos, flautas e pianos. Os bailarinos pisavam firmes no tempo forte.",
      "Do outro lado, a **tradição afro-cubana**, preservada nos *solares* (pátios) e nos bairros operários: a Rumba, incluindo Guaguancó, Yambú e Columbia. A postura era baixa, com joelhos flectidos e um centro de gravidade ancorado no chão. O movimento vivia nos ombros, nas costelas, nas ancas. O fraseado enfatizava os contratempos e os espaços vazios entre eles.",
      "Ao longo do início do século XX, estas tradições mantiveram-se separadas pela classe e pela raça. A ponte entre elas surgiu nos anos 20 sob a forma do **Son**. Originário da província oriental de Oriente, o Son combinou a guitarra e a estrutura lírica espanholas com a percussão afro-cubana (bongós, maracas, clave). Foi a primeira música socialmente aceite nos clubes da alta sociedade e ao mesmo tempo autenticamente impulsionada pelas tradições rítmicas da rua.",
    ],

    sec2Title: "Parte 2: Arsenio Rodríguez e a conga",
    sec2Paragraphs: [
      "Nas décadas de 1930 e 1940, um tocador de tres cego chamado **Arsenio Rodríguez** decidiu que o ensemble do Son precisava de mais força. Expandiu o septeto tradicional para um *conjunto*, acrescentando vários trompetes, o piano e (o mais polémico) a conga. A conga tinha sido até então rejeitada como demasiado \"de rua\" para os ensembles formais. Arsenio colocou-a no coração do som.",
      "Esticou também a secção **montuno** da canção: o vamp final, aberto, fortemente sincopado e repetitivo, onde os cantores improvisavam e os bailarinos podiam finalmente soltar-se. O son montuno lento, machucante e dominado pela percussão que daí surgiu é o ancestral rítmico direto do Mambo.",
      "O que Arsenio impôs, musicalmente, foi uma forma afro-cubana de pensar o tempo. O padrão fundacional da música é a **clave**, um esqueleto de cinco batidas que define a sensação de cada camada subsequente. Dançada corretamente, a música pede ao corpo que amoleça os joelhos, baixe o centro de gravidade e atrase a transferência de peso para que o passo se assente no ritmo em vez de marchar por cima dele. É esse atraso que faz com que o movimento cubano (o oito das ancas) aconteça naturalmente em vez de mecanicamente.",
    ],

    sec3Title: "Parte 3: o Palladium Ballroom (1948-1966)",
    sec3IntroParagraphs: [
      "Em 1948, o Palladium Ballroom, na 53ª com a Broadway, abriu as suas portas a noites de música latina racialmente integradas. Em poucos anos, era o epicentro da **febre do Mambo**. Três maestros residentes (Tito Puente, Tito Rodríguez e Machito) impulsionavam a música. Bailarinos do Bronx, de Brooklyn e do Spanish Harlem impulsionavam a dança.",
      "Os bailarinos do Palladium não tinham formação académica. Eram miúdos porto-riquenhos, italianos, judeus e afro-americanos da classe operária, sem estatuto social formal, que construíam a sua identidade na pista de dança. Roubavam de tudo: sapateado do Cotton Club, acrobacias de Lindy Hop do Savoy Ballroom, postura de salão dos estúdios do centro de Manhattan. Aparafusaram tudo isso à clave afro-cubana.",
    ],
    sec3LegendsLeadIn: "As lendas da época:",
    sec3LegendsBullets: [
      "**Cuban Pete (Pedro Aguilar)**, bailarino porto-riquenho do Bronx com base de sapateado e Lindy Hop, fundiu o enraizamento afro-cubano com o estilo de jazz americano e profissionalizou o Mambo de exibição.",
      "**Millie Donay**, parceira ítalo-americana de Cuban Pete, revolucionou o papel da seguidora. Antes de Millie, esperava-se que as seguidoras na dança latina seguissem passivamente o líder. Ela respondia-lhe a cada batida.",
      "**Killer Joe Piro**, bailarino ítalo-americano, tornou-se o instrutor de Mambo mais famoso do país, a figura que codificou o caos da pista do Palladium em passos que podiam ser vendidos à classe média americana.",
      "**Augie e Margo Rodríguez** fundiram o Mambo com técnicas amplas de salão e levaram a dança à televisão nacional no Ed Sullivan Show.",
    ],
    sec3OutroParagraphs: [
      "Deste choque saiu a assinatura biomecânica que ainda define o Mambo nova-iorquino: um trem inferior enraizado e de joelhos flectidos, casado com um trem superior agressivamente erguido, de postura bloqueada. O core abdominal funciona como amortecedor entre os dois. Quando vês os pés de uma bailarina de On2 de classe mundial a moverem-se a uma velocidade vertiginosa enquanto o peito permanece completamente quieto, estás a ver a herança direta desta era.",
    ],

    sec4Title: "Parte 4: Eddie Torres e a codificação do On2",
    sec4Paragraphs: [
      "O Palladium fechou em 1966. Nos anos 70, aquilo a que se chamava \"Mambo\" estava a ser rebatizado pela indústria discográfica como \"Salsa\": as mesmas tradições musicais afro-cubanas debaixo de uma nova etiqueta, mais comercial.",
      "O bailarino que fez a ponte entre a era do Palladium e a moderna foi **Eddie Torres**. Torres estudou com Tito Puente, que pessoalmente lhe disse que partir no 2 era mais fiel à clave e à conga do que partir no 1. Torres pegou nesse princípio musical e construiu à volta dele um sistema ensinável: uma estrutura de contagem específica, um passo básico específico, uma pedagogia que podia ser aprendida aula a aula em vez de absorvida por anos de osmose de clube.",
      "Cada plano curricular moderno de Salsa On2, incluindo este, remonta em última instância ao trabalho estrutural de Eddie Torres. A expressão \"estilo Nova Iorque\" tornou-se sinónimo da linhagem de Torres. Hoje, o \"On2\" é ensinado de Nova Iorque a Tóquio, mas o sistema que quase todos esses professores herdam foi a resposta de Torres a uma única pergunta que Tito Puente lhe fez sobre o 2.",
    ],

    sec5Title: "Porque é que esta história importa na pista",
    sec5Intro:
      "Aqui a história não é decoração. Três coisas mudam na forma como te moves de facto assim que percebes de onde vem a dança:",
    sec5Steps: [
      "**Deixas de lutar contra os joelhos flectidos.** Joelhos macios não são uma escolha de estilo. São biologicamente necessários para executar a transferência de peso atrasada que faz o ritmo funcionar.",
      "**Deixas de saltar com os ombros.** O trem superior quieto não é uma afetação estética. É a disciplina de salão herdada que torna legível o trabalho de pés e legível a condução através da postura.",
      "**Deixas de partir no 1.** A pancada da conga cai no 2. O teu break não é uma escolha de contagem arbitrária; é o ponto de encontro entre o teu corpo e a secção rítmica da banda.",
    ],
    sec5OutroRich:
      "Esta é a tese do [link]estilo On2[/link] e o núcleo do currículo da The Mambo Guild.",

    sec6Title: "Fontes e leituras complementares",
    sec6Sources: [
      "McMains, Juliet. *Spinning Mambo into Salsa: Caribbean Dance in Global Commerce*. Oxford University Press, 2015.",
      "Roberts, John Storm. *The Latin Tinge: The Impact of Latin American Music on the United States*. Oxford University Press, 1999.",
      "Fernandez, Raul A. *From Afro-Cuban Rhythms to Latin Jazz*. University of California Press, 2006.",
      "Manuel, Peter. *Caribbean Currents: Caribbean Music from Rumba to Reggae*. Temple University Press, 2009.",
      "Gottschild, Brenda Dixon. *Digging the Africanist Presence in American Performance*. Greenwood Press, 1996.",
    ],

    ctaEyebrow: "Aprofunda-te",
    ctaHeading: "A The Mambo Guild tem um curso completo de história em 20 módulos.",
    ctaBody:
      "Cada módulo segue um fio da história, desde as tradições africanas do tambor até à era da Fania. Tudo com fontes, tudo ensinado por académicos da dança certificados. Incluído em cada subscrição da The Mambo Guild.",

    faqs: [
      {
        q: "Quem inventou de facto o Mambo?",
        a: "Não há um único inventor. Os maestros cubanos Arsenio Rodríguez (Havana, anos 40) e Pérez Prado (Cidade do México, a partir de 1948) deram à música a sua forma fundacional; a dança foi cristalizada por nova-iorquinos da classe operária no Palladium Ballroom entre 1948 e 1966.",
      },
      {
        q: "Mambo e Salsa são a mesma coisa?",
        a: "Musicalmente, a Salsa moderna é um rebranding comercial do Mambo e dos géneros afro-cubanos vizinhos feito pela indústria discográfica de Nova Iorque no início dos anos 70. Como dança, aquilo que hoje se ensina como Salsa On2 (estilo Nova Iorque) é o descendente direto do Mambo da era do Palladium.",
      },
      {
        q: "O que é a clave?",
        a: "A clave é um padrão rítmico de cinco batidas ao longo de dois compassos (3-2 ou 2-3) que ancora toda a música afro-cubana. Todos os outros instrumentos são fraseados em relação a ela; dançada corretamente, as tuas mudanças de peso também se alinham com ela.",
      },
      {
        q: "Porque é que a era do Palladium acabou?",
        a: "O Palladium Ballroom perdeu a licença de bebidas em 1966 e fechou pouco depois. A febre do Mambo também tinha sido deslocada na cultura geral pelo rock and roll e, dentro da música latina, pelo Boogaloo e pelos primórdios da era \"Salsa\".",
      },
      {
        q: "Quem foi Eddie Torres?",
        a: "Eddie Torres é um bailarino e coreógrafo nova-iorquino que estudou com Tito Puente e codificou aquilo que hoje se ensina em todo o mundo como Salsa On2 / estilo Nova Iorque. Transformou o saber de pista dos bailarinos da era do Palladium num currículo ensinável.",
      },
    ],
  },
  // ============================================================ FR
  fr: {
    metaTitle: "La naissance du Mambo : de La Havane au Palladium",
    metaDescription:
      "Comment le Mambo est né du Danzón cubain, du Son et du rythme afro-cubain, fut transformé par Arsenio Rodríguez et les danseurs du Palladium, puis codifié en Salsa On2 style New York moderne par Eddie Torres.",

    breadcrumbHome: "Accueil",
    breadcrumbBlog: "Blog",
    breadcrumbCurrent: "Histoire du Mambo",

    badge: "Histoire",
    h1Pre: "La naissance du Mambo : ",
    h1Accent: "de La Havane au Palladium",

    shortAnswerRich:
      "Le Mambo n'a pas été inventé en un seul instant. C'est l'aboutissement d'une synthèse d'un siècle : traditions de percussion afro-cubaines, formes de danse hispano-européennes et théâtralité urbaine américaine entrant en collision sur trois époques successives. Sa forme moderne a été cristallisée par **Arsenio Rodríguez** dans la Havane des années 1940, transformée par les **danseurs du Palladium** dans le New York des années 1950, puis codifiée pour l'enseignement par **Eddie Torres** dans les années 1970.",

    sec1Title: "Partie 1 : les trois racines cubaines",
    sec1Paragraphs: [
      "Avant que New York ne s'approprie le Mambo, les rythmes et le langage corporel de la danse ont été forgés à Cuba à travers la collision entre deux cultures aux idées opposées sur la façon de bouger.",
      "D'un côté, la **tradition européenne** : salons coloniaux espagnols, contradanza, et finalement le Danzón (créé en 1879 par Miguel Failde). Les danses étaient droites. La tenue était stricte. Les jambes relativement tendues. La musique était jouée au violon, à la flûte et au piano. Les danseurs marquaient fermement le temps fort.",
      "De l'autre, la **tradition afro-cubaine**, conservée dans les *solares* (cours intérieures) et les quartiers populaires : la Rumba, dont Guaguancó, Yambú et Columbia. La posture était basse, les genoux fléchis, le centre de gravité ancré au sol. Le mouvement vivait dans les épaules, les côtes, les hanches. Le phrasé soulignait les contretemps et les espaces vides entre eux.",
      "Tout au long du début du XXᵉ siècle, ces traditions sont restées séparées par la classe et la race. Le pont entre elles est apparu dans les années 1920 avec le **Son**. Originaire de la province orientale d'Oriente, le Son combinait la guitare et la structure lyrique espagnoles avec la percussion afro-cubaine (bongos, maracas, clave). C'était la première musique à la fois socialement acceptable dans les clubs des classes supérieures et authentiquement portée par les traditions rythmiques de la rue.",
    ],

    sec2Title: "Partie 2 : Arsenio Rodríguez et la conga",
    sec2Paragraphs: [
      "Dans les années 1930 et 1940, un joueur de tres aveugle nommé **Arsenio Rodríguez** décida que l'ensemble du Son avait besoin de plus d'élan. Il étendit le septeto traditionnel en *conjunto*, ajoutant plusieurs trompettes, le piano et, le plus controversé, la conga. La conga avait jusque-là été écartée comme trop \"de rue\" pour les ensembles formels. Arsenio la plaça au cœur du son.",
      "Il étira aussi la section **montuno** du morceau : ce vamp final, ouvert, fortement syncopé et répétitif où les chanteurs improvisaient et où les danseurs pouvaient enfin se lâcher. Le son montuno lent, puissant et porté par la percussion qui en émergea est l'ancêtre rythmique direct du Mambo.",
      "Ce qu'Arsenio a imposé, musicalement, c'est une approche afro-cubaine du temps. Le motif fondateur de la musique est la **clave**, un squelette de cinq frappes qui définit le ressenti de chaque couche suivante. Dansée correctement, la musique demande au corps d'assouplir les genoux, d'abaisser le centre de gravité et de retarder le transfert de poids pour que le pas s'installe dans le rythme au lieu de marcher par-dessus. C'est ce retard qui fait que le mouvement cubain (le huit des hanches) se produit naturellement plutôt que mécaniquement.",
    ],

    sec3Title: "Partie 3 : le Palladium Ballroom (1948-1966)",
    sec3IntroParagraphs: [
      "En 1948, le Palladium Ballroom, à l'angle de la 53ᵉ et de Broadway, ouvre ses portes à des soirées de musique latine racialement intégrées. En quelques années, c'est l'épicentre de la **fièvre du Mambo**. Trois chefs d'orchestre maison (Tito Puente, Tito Rodríguez et Machito) portaient la musique. Des danseurs du Bronx, de Brooklyn et du Spanish Harlem portaient la danse.",
      "Les danseurs du Palladium n'avaient pas de formation académique. C'étaient des jeunes portoricains, italiens, juifs et afro-américains de classe ouvrière, sans statut social formel, qui construisaient leur identité sur la piste de danse. Ils volaient à tout le monde : claquettes du Cotton Club, acrobaties Lindy Hop du Savoy Ballroom, tenue de salon des studios du midtown Manhattan. Ils ont boulonné tout cela sur la clave afro-cubaine.",
    ],
    sec3LegendsLeadIn: "Les légendes de l'époque :",
    sec3LegendsBullets: [
      "**Cuban Pete (Pedro Aguilar)**, danseur portoricain du Bronx, formé aux claquettes et au Lindy Hop, a fusionné l'ancrage afro-cubain avec le style du jazz américain et professionnalisé le Mambo de démonstration.",
      "**Millie Donay**, partenaire italo-américaine de Cuban Pete, a révolutionné le rôle de la suiveuse. Avant Millie, on attendait des suiveuses en danse latine qu'elles suivent passivement le guide. Elle lui rendait coup pour coup.",
      "**Killer Joe Piro**, danseur italo-américain, est devenu le professeur de Mambo le plus célèbre du pays, la figure qui a codifié le chaos de la piste du Palladium en pas que l'on pouvait vendre à la classe moyenne américaine.",
      "**Augie et Margo Rodríguez** ont fusionné le Mambo avec d'amples techniques de danse de salon et porté la danse à la télévision nationale dans le Ed Sullivan Show.",
    ],
    sec3OutroParagraphs: [
      "De cette collision est sortie la signature biomécanique qui définit encore le Mambo new-yorkais : un bas du corps ancré, genoux fléchis, marié à un haut du corps agressivement droit, à la posture verrouillée. Le centre abdominal sert d'amortisseur entre les deux. Quand vous voyez les pieds d'une danseuse On2 de classe mondiale bouger à une vitesse fulgurante alors que sa cage thoracique reste totalement immobile, vous regardez l'héritage direct de cette époque.",
    ],

    sec4Title: "Partie 4 : Eddie Torres et la codification du On2",
    sec4Paragraphs: [
      "Le Palladium ferme en 1966. Dans les années 1970, ce que l'on appelait \"Mambo\" est rebaptisé par l'industrie du disque \"Salsa\" : les mêmes traditions musicales afro-cubaines sous une nouvelle étiquette plus commerciale.",
      "Le danseur qui a fait le pont entre l'ère du Palladium et la moderne est **Eddie Torres**. Torres a étudié auprès de Tito Puente, qui lui dit personnellement que casser sur le 2 était plus fidèle à la clave et à la conga que de casser sur le 1. Torres a pris ce principe musical et a construit autour un système enseignable : une structure de comptage précise, un pas de base précis, une pédagogie que l'on pouvait apprendre cours après cours plutôt que d'absorber par des années d'osmose en club.",
      "Tout cursus moderne de Salsa On2, y compris celui-ci, remonte en dernière instance au travail structurel d'Eddie Torres. L'expression \"style New York\" est devenue synonyme de la lignée Torres. Aujourd'hui, le \"On2\" s'enseigne de New York à Tokyo, mais le système dont presque tous ces professeurs héritent était la réponse de Torres à une seule question que Tito Puente lui a posée sur le 2.",
    ],

    sec5Title: "Pourquoi cette histoire compte sur la piste",
    sec5Intro:
      "Ici, l'histoire n'est pas décorative. Trois choses changent dans la façon dont vous bougez réellement, une fois que vous comprenez d'où vient la danse :",
    sec5Steps: [
      "**Vous arrêtez de lutter contre les genoux fléchis.** Les genoux souples ne sont pas un choix stylistique. Ils sont biologiquement nécessaires pour exécuter le transfert de poids retardé qui fait fonctionner le rythme.",
      "**Vous arrêtez de faire rebondir les épaules.** Le haut du corps immobile n'est pas une affectation esthétique. C'est la discipline de salon héritée qui rend le travail de pieds lisible et la conduite lisible à travers la tenue.",
      "**Vous arrêtez de casser sur le 1.** Le coup de conga tombe sur le 2. Votre break n'est pas un choix de comptage arbitraire ; c'est le point de rencontre entre votre corps et la section rythmique de l'orchestre.",
    ],
    sec5OutroRich:
      "C'est la thèse du [link]style On2[/link] et le cœur du cursus de The Mambo Guild.",

    sec6Title: "Sources et lectures complémentaires",
    sec6Sources: [
      "McMains, Juliet. *Spinning Mambo into Salsa: Caribbean Dance in Global Commerce*. Oxford University Press, 2015.",
      "Roberts, John Storm. *The Latin Tinge: The Impact of Latin American Music on the United States*. Oxford University Press, 1999.",
      "Fernandez, Raul A. *From Afro-Cuban Rhythms to Latin Jazz*. University of California Press, 2006.",
      "Manuel, Peter. *Caribbean Currents: Caribbean Music from Rumba to Reggae*. Temple University Press, 2009.",
      "Gottschild, Brenda Dixon. *Digging the Africanist Presence in American Performance*. Greenwood Press, 1996.",
    ],

    ctaEyebrow: "Va plus loin",
    ctaHeading: "The Mambo Guild propose un cours complet d'histoire en 20 modules.",
    ctaBody:
      "Chaque module suit un fil de l'histoire, des traditions africaines du tambour jusqu'à l'ère Fania. Tout est sourcé, tout est enseigné par des universitaires de la danse certifiés. Inclus dans chaque adhésion à The Mambo Guild.",

    faqs: [
      {
        q: "Qui a réellement inventé le Mambo ?",
        a: "Il n'y a pas d'inventeur unique. Les chefs d'orchestre cubains Arsenio Rodríguez (La Havane, années 1940) et Pérez Prado (Mexico, à partir de 1948) ont donné à la musique sa forme fondatrice ; la danse a été cristallisée par les New-Yorkais de la classe ouvrière au Palladium Ballroom entre 1948 et 1966.",
      },
      {
        q: "Le Mambo et la Salsa, c'est la même chose ?",
        a: "Musicalement, la Salsa moderne est un rebranding commercial du Mambo et des genres afro-cubains voisins, opéré par l'industrie new-yorkaise du disque au début des années 1970. Comme danse, ce qui s'enseigne aujourd'hui sous le nom de Salsa On2 (style New York) est le descendant direct du Mambo de l'ère du Palladium.",
      },
      {
        q: "Qu'est-ce que la clave ?",
        a: "La clave est un motif rythmique de cinq frappes étalé sur deux mesures (3-2 ou 2-3) qui ancre toute la musique afro-cubaine. Tous les autres instruments sont phrasés par rapport à elle ; dansé correctement, vos changements de poids s'alignent eux aussi sur elle.",
      },
      {
        q: "Pourquoi l'ère du Palladium s'est-elle terminée ?",
        a: "Le Palladium Ballroom a perdu sa licence d'alcool en 1966 et a fermé peu après. La fièvre du Mambo avait par ailleurs été supplantée dans la culture générale par le rock and roll et, à l'intérieur de la musique latine, par le Boogaloo et les débuts de l'ère \"Salsa\".",
      },
      {
        q: "Qui était Eddie Torres ?",
        a: "Eddie Torres est un danseur et chorégraphe new-yorkais qui a étudié auprès de Tito Puente et a codifié ce qui s'enseigne aujourd'hui dans le monde entier sous le nom de Salsa On2 / style New York. Il a transformé le savoir de piste des danseurs de l'ère du Palladium en un cursus enseignable.",
      },
    ],
  },
  // ============================================================ DE
  de: {
    metaTitle: "Die Geburt des Mambo: von Havanna zum Palladium",
    metaDescription:
      "Wie der Mambo aus dem kubanischen Danzón, dem Son und afrokubanischen Rhythmen entstand, von Arsenio Rodríguez und den Palladium-Tänzern verändert wurde und von Eddie Torres als moderner New York Style Salsa On2 kodifiziert wurde.",

    breadcrumbHome: "Start",
    breadcrumbBlog: "Blog",
    breadcrumbCurrent: "Mambo-Geschichte",

    badge: "Geschichte",
    h1Pre: "Die Geburt des Mambo: ",
    h1Accent: "von Havanna zum Palladium",

    shortAnswerRich:
      "Der Mambo wurde nicht in einem einzigen Moment erfunden. Er ist der Höhepunkt einer hundertjährigen Synthese: afrokubanische Perkussionstraditionen, spanisch-europäische Tanzformen und amerikanische urbane Theatralität, die in drei aufeinanderfolgenden Epochen aufeinanderprallten. Seine moderne Form wurde von **Arsenio Rodríguez** im Havanna der 1940er kristallisiert, von den **Palladium-Tänzern** im New York der 1950er verändert und von **Eddie Torres** in den 1970ern lehrbar kodifiziert.",

    sec1Title: "Teil 1: Die drei kubanischen Wurzeln",
    sec1Paragraphs: [
      "Bevor New York den Mambo für sich beanspruchte, wurden die Rhythmen und die Körpersprache des Tanzes in Kuba im Aufeinandertreffen zweier Kulturen mit gegensätzlichen Vorstellungen vom Bewegen geschmiedet.",
      "Auf der einen Seite die **europäische Tradition**: spanische Kolonialsäle, die contradanza und schließlich der Danzón (1879 von Miguel Failde uraufgeführt). Die Tänze waren aufrecht. Die Haltung war streng. Die Beine relativ gestreckt. Die Musik wurde mit Geigen, Flöten und Klavieren gespielt. Die Tänzer traten fest auf den Taktschlag.",
      "Auf der anderen Seite die **afrokubanische Tradition**, bewahrt in den *solares* (Innenhöfen) und Arbeitervierteln: Rumba, einschließlich Guaguancó, Yambú, Columbia. Die Haltung war tief, mit gebeugten Knien und einem im Boden verankerten Schwerpunkt. Die Bewegung lebte in Schultern, Rippen, Hüften. Die Phrasierung betonte die Off-Beats und die leeren Räume zwischen ihnen.",
      "Im frühen 20. Jahrhundert blieben diese Traditionen durch Klasse und Hautfarbe getrennt. Die Brücke zwischen ihnen entstand in den 1920ern in Form des **Son**. Aus der östlichen Provinz Oriente stammend, verband der Son spanische Gitarren- und Liedstrukturen mit afrokubanischer Perkussion (Bongos, Maracas, Clave). Er war die erste Musik, die in den Clubs der Oberschicht gesellschaftlich akzeptabel und zugleich authentisch von den Straßenrhythmus-Traditionen getragen war.",
    ],

    sec2Title: "Teil 2: Arsenio Rodríguez und die Conga",
    sec2Paragraphs: [
      "In den 1930er und 1940er Jahren entschied der blinde Tres-Spieler **Arsenio Rodríguez**, dass das Son-Ensemble mehr Druck brauchte. Er erweiterte das traditionelle Septeto zum *Conjunto*, fügte mehrere Trompeten, das Klavier und (am umstrittensten) die Conga hinzu. Die Conga war zuvor als zu \"straßennah\" für formelle Ensembles abgelehnt worden. Arsenio rückte sie ins Herz des Sounds.",
      "Er dehnte auch den **Montuno**-Teil des Stücks: jenen offenen, stark synkopierten, repetitiven Schlussvamp, in dem die Sänger improvisierten und die Tänzer endlich loslassen konnten. Der langsame, treibende, perkussionsdominierte Son montuno, der dabei entstand, ist der direkte rhythmische Vorfahr des Mambo.",
      "Was Arsenio musikalisch durchsetzte, war ein afrokubanischer Umgang mit der Zeit. Das fundamentale Muster der Musik ist die **Clave**, ein Skelett aus fünf Schlägen, das das Gefühl jeder weiteren Schicht definiert. Richtig getanzt, fordert die Musik vom Körper, die Knie weicher zu machen, den Schwerpunkt zu senken und die Gewichtsverlagerung zu verzögern, damit der Schritt sich in den Rhythmus setzt, statt darüber zu marschieren. Diese Verzögerung ist es, die die kubanische Bewegung (die Achterfigur der Hüfte) natürlich entstehen lässt statt mechanisch.",
    ],

    sec3Title: "Teil 3: das Palladium Ballroom (1948-1966)",
    sec3IntroParagraphs: [
      "1948 öffnete das Palladium Ballroom an der Ecke 53. Straße / Broadway seine Türen für rassisch integrierte lateinamerikanische Musiknächte. Innerhalb weniger Jahre war es das Epizentrum des **Mambo-Fiebers**. Drei Hausbandleader (Tito Puente, Tito Rodríguez und Machito) trugen die Musik. Tänzer aus der Bronx, Brooklyn und Spanish Harlem trugen den Tanz.",
      "Die Palladium-Tänzer hatten keine akademische Ausbildung. Sie waren puerto-ricanische, italienische, jüdische und afroamerikanische Arbeiterkinder ohne formellen sozialen Status, die ihre Identität stattdessen auf der Tanzfläche aufbauten. Sie klauten überall: Stepptanz aus dem Cotton Club, Lindy-Hop-Akrobatik aus dem Savoy Ballroom, Ballsaalhaltung aus den Studios von Midtown Manhattan. Sie schraubten alles auf die afrokubanische Clave.",
    ],
    sec3LegendsLeadIn: "Die Legenden der Ära:",
    sec3LegendsBullets: [
      "**Cuban Pete (Pedro Aguilar)**, ein puerto-ricanischer Tänzer aus der Bronx mit Stepptanz- und Lindy-Hop-Hintergrund, verschmolz die afrokubanische Erdung mit amerikanischem Jazz-Styling und professionalisierte das Mambo-Showtanzen.",
      "**Millie Donay**, Cuban Petes italoamerikanische Partnerin, revolutionierte die Rolle der Folgenden. Vor Millie wurde von Folgenden im Latin-Tanz erwartet, dass sie dem Führenden passiv folgten. Sie beantwortete jeden Akzent.",
      "**Killer Joe Piro**, ein italoamerikanischer Tänzer, wurde zum berühmtesten Mambo-Lehrer des Landes — der, der das Chaos der Palladium-Tanzfläche in Schritte kodifizierte, die man der amerikanischen Mittelschicht verkaufen konnte.",
      "**Augie und Margo Rodríguez** verschmolzen den Mambo mit ausladenden Ballroom-Techniken und brachten den Tanz in der Ed Sullivan Show ins nationale Fernsehen.",
    ],
    sec3OutroParagraphs: [
      "Aus diesem Aufeinanderprallen entstand die biomechanische Signatur, die den New Yorker Mambo bis heute definiert: ein geerdeter Unterkörper mit gebeugten Knien, kombiniert mit einem aggressiv aufrechten, in der Haltung verriegelten Oberkörper. Die Bauchmuskulatur fungiert als Stoßdämpfer dazwischen. Wenn du die Füße einer On2-Weltklasse-Tänzerin in atemberaubender Geschwindigkeit siehst, während ihr Brustkorb völlig ruhig bleibt, siehst du das direkte Erbe dieser Ära.",
    ],

    sec4Title: "Teil 4: Eddie Torres und die Kodifizierung von On2",
    sec4Paragraphs: [
      "Das Palladium schloss 1966. In den 1970ern wurde das, was man \"Mambo\" genannt hatte, von der Plattenindustrie als \"Salsa\" neu gebrandet — dieselben afrokubanischen musikalischen Traditionen unter einem neuen, marktfreundlichen Etikett.",
      "Der Tänzer, der die Brücke zwischen der Palladium-Ära und der modernen schlug, war **Eddie Torres**. Torres studierte bei Tito Puente, der ihm persönlich sagte, dass das Brechen auf der 2 der Clave und der Conga treuer sei als das Brechen auf der 1. Torres nahm dieses musikalische Prinzip und baute ein lehrbares System darum: eine konkrete Zählstruktur, einen konkreten Grundschritt, eine Pädagogik, die man Stunde für Stunde lernen konnte, statt sie über Jahre Club-Osmose aufzunehmen.",
      "Jeder moderne Salsa-On2-Lehrplan, einschließlich dieses, geht letztlich auf Eddie Torres' strukturelle Arbeit zurück. Die Bezeichnung \"New York Style\" wurde zum Synonym für Torres' Linie. Heute wird \"On2\" von New York bis Tokio unterrichtet, aber das System, das fast alle dieser Lehrer übernehmen, war Torres' Antwort auf eine einzige Frage, die Tito Puente ihm zur 2 gestellt hatte.",
    ],

    sec5Title: "Warum diese Geschichte auf der Tanzfläche zählt",
    sec5Intro:
      "Geschichte ist hier keine Dekoration. Drei Dinge ändern, wie du dich tatsächlich bewegst, sobald du verstehst, woher der Tanz kommt:",
    sec5Steps: [
      "**Du hörst auf, gegen die gebeugten Knie zu kämpfen.** Weiche Knie sind keine stilistische Wahl. Sie sind biologisch erforderlich, um die verzögerte Gewichtsverlagerung auszuführen, die den Rhythmus zum Funktionieren bringt.",
      "**Du hörst auf, mit den Schultern zu wippen.** Der ruhige Oberkörper ist keine ästhetische Affektiertheit. Er ist die geerbte Ballroom-Disziplin, die die Fußarbeit lesbar und die Führung über die Haltung lesbar macht.",
      "**Du hörst auf, auf der 1 zu brechen.** Der Conga-Schlag fällt auf die 2. Dein Break-Schritt ist keine willkürliche Zählwahl, sondern ein Treffpunkt zwischen deinem Körper und der Rhythmusgruppe der Band.",
    ],
    sec5OutroRich:
      "Das ist die These des [link]On2-Stils[/link] und der Kern des Lehrplans von The Mambo Guild.",

    sec6Title: "Quellen und weiterführende Lektüre",
    sec6Sources: [
      "McMains, Juliet. *Spinning Mambo into Salsa: Caribbean Dance in Global Commerce*. Oxford University Press, 2015.",
      "Roberts, John Storm. *The Latin Tinge: The Impact of Latin American Music on the United States*. Oxford University Press, 1999.",
      "Fernandez, Raul A. *From Afro-Cuban Rhythms to Latin Jazz*. University of California Press, 2006.",
      "Manuel, Peter. *Caribbean Currents: Caribbean Music from Rumba to Reggae*. Temple University Press, 2009.",
      "Gottschild, Brenda Dixon. *Digging the Africanist Presence in American Performance*. Greenwood Press, 1996.",
    ],

    ctaEyebrow: "Geh tiefer",
    ctaHeading: "The Mambo Guild bietet einen vollständigen 20-Modul-Geschichtskurs.",
    ctaBody:
      "Jedes Modul folgt einem Faden der Geschichte, von den afrikanischen Trommeltraditionen bis zur Fania-Ära. Alles mit Quellen, alles unterrichtet von zertifizierten Tanzwissenschaftlern. In jeder Mitgliedschaft bei The Mambo Guild enthalten.",

    faqs: [
      {
        q: "Wer hat den Mambo eigentlich erfunden?",
        a: "Es gibt keinen einzelnen Erfinder. Die kubanischen Bandleader Arsenio Rodríguez (Havanna, 1940er) und Pérez Prado (Mexiko-Stadt, ab 1948) gaben der Musik ihre fundamentale Form; der Tanz wurde von New Yorker Arbeiterkindern im Palladium Ballroom zwischen 1948 und 1966 kristallisiert.",
      },
      {
        q: "Sind Mambo und Salsa dasselbe?",
        a: "Musikalisch ist die moderne Salsa ein Marketing-Rebranding des Mambo und benachbarter afrokubanischer Genres, gemacht von der New Yorker Plattenindustrie zu Beginn der 1970er. Als Tanz ist das, was heute als Salsa On2 (New York Style) gelehrt wird, der direkte Nachfolger des Palladium-Mambo.",
      },
      {
        q: "Was ist die Clave?",
        a: "Die Clave ist ein rhythmisches Muster aus fünf Schlägen über zwei Takte (3-2 oder 2-3), das die gesamte afrokubanische Musik verankert. Jedes andere Instrument wird in Bezug auf sie phrasiert; richtig getanzt, richten sich auch deine Gewichtswechsel an ihr aus.",
      },
      {
        q: "Warum endete die Palladium-Ära?",
        a: "Das Palladium Ballroom verlor 1966 seine Schanklizenz und schloss kurz darauf. Das Mambo-Fieber war zudem in der breiteren Kultur durch Rock and Roll und innerhalb der lateinamerikanischen Musik durch Boogaloo und die frühe Salsa-Etiketten-Ära verdrängt worden.",
      },
      {
        q: "Wer war Eddie Torres?",
        a: "Eddie Torres ist ein New Yorker Tänzer und Choreograf, der bei Tito Puente studierte und das kodifizierte, was heute weltweit als Salsa On2 / New York Style unterrichtet wird. Er machte aus dem Tanzflächen-Wissen der Palladium-Tänzer einen lehrbaren Lehrplan.",
      },
    ],
  },
  // ============================================================ IT
  it: {
    metaTitle: "La nascita del Mambo: dall'Avana al Palladium",
    metaDescription:
      "Come il Mambo è emerso dal Danzón cubano, dal Son e dai ritmi afro-cubani, è stato trasformato da Arsenio Rodríguez e dai ballerini del Palladium ed è stato codificato come moderna Salsa On2 New York Style da Eddie Torres.",

    breadcrumbHome: "Home",
    breadcrumbBlog: "Blog",
    breadcrumbCurrent: "Storia del Mambo",

    badge: "Storia",
    h1Pre: "La nascita del Mambo: ",
    h1Accent: "dall'Avana al Palladium",

    shortAnswerRich:
      "Il Mambo non è stato inventato in un singolo momento. È il culmine di una sintesi di un secolo: tradizioni afro-cubane di percussioni, forma di ballo ispano-europea e teatralità urbana americana che si scontrano in tre epoche successive. La sua forma moderna è stata cristallizzata da **Arsenio Rodríguez** nell'Avana degli anni '40, trasformata dai **ballerini del Palladium** nella New York degli anni '50 e codificata per l'insegnamento da **Eddie Torres** negli anni '70.",

    sec1Title: "Parte 1: le tre radici cubane",
    sec1Paragraphs: [
      "Prima che New York rivendicasse il Mambo come proprio, i ritmi e il linguaggio corporeo del ballo sono stati forgiati a Cuba nello scontro tra due culture con idee opposte sul modo di muoversi.",
      "Da una parte, la **tradizione europea**: saloni coloniali spagnoli, la contradanza e infine il Danzón (debutto nel 1879 con Miguel Failde). I balli erano eretti. La tenuta era rigida. Le gambe relativamente dritte. La musica era suonata con violini, flauti e pianoforti. I ballerini calcavano con decisione il battere.",
      "Dall'altra, la **tradizione afro-cubana**, conservata nei *solares* (cortili) e nei quartieri popolari: la Rumba, comprese Guaguancó, Yambú e Columbia. La postura era bassa, con le ginocchia piegate e un baricentro radicato a terra. Il movimento viveva nelle spalle, nelle costole, nei fianchi. Il fraseggio enfatizzava i contrattempi e gli spazi vuoti tra di essi.",
      "Per tutto il primo Novecento, queste tradizioni sono rimaste separate da classe e razza. Il ponte tra di esse è emerso negli anni '20 con il **Son**. Originario della provincia orientale di Oriente, il Son combinava la chitarra e la struttura lirica spagnole con la percussione afro-cubana (bongos, maracas, clave). Era la prima musica al tempo stesso socialmente accettabile nei club delle classi alte e autenticamente trainata dalle tradizioni ritmiche di strada.",
    ],

    sec2Title: "Parte 2: Arsenio Rodríguez e la conga",
    sec2Paragraphs: [
      "Negli anni '30 e '40, un suonatore di tres cieco di nome **Arsenio Rodríguez** decise che l'ensemble del Son aveva bisogno di più spinta. Espanse il septeto tradizionale in un *conjunto*, aggiungendo più trombe, il pianoforte e (la cosa più controversa) la conga. La conga era stata fino ad allora rifiutata come troppo \"da strada\" per gli ensemble formali. Arsenio la mise al cuore del suono.",
      "Allungò anche la sezione **montuno** del brano: quel vamp finale aperto, fortemente sincopato e ripetitivo, in cui i cantanti improvvisavano e i ballerini potevano finalmente lasciarsi andare. Il son montuno lento, martellante e dominato dalla percussione che ne emerse è l'antenato ritmico diretto del Mambo.",
      "Quello che Arsenio impose, musicalmente, fu un approccio afro-cubano al tempo. Il pattern fondante della musica è la **clave**, uno scheletro a cinque colpi che definisce la sensazione di ogni livello successivo. Ballata correttamente, la musica chiede al corpo di ammorbidire le ginocchia, abbassare il baricentro e ritardare il trasferimento di peso così che il passo si posi nel ritmo invece di marciarci sopra. È quel ritardo a far sì che il movimento cubano (l'otto delle anche) avvenga in modo naturale invece che meccanico.",
    ],

    sec3Title: "Parte 3: il Palladium Ballroom (1948-1966)",
    sec3IntroParagraphs: [
      "Nel 1948 il Palladium Ballroom, all'angolo tra la 53ª strada e Broadway, aprì le porte a serate di musica latina razzialmente integrate. Nel giro di pochi anni era l'epicentro della **febbre del Mambo**. Tre direttori d'orchestra di casa (Tito Puente, Tito Rodríguez e Machito) trainavano la musica. Ballerini del Bronx, di Brooklyn e dello Spanish Harlem trainavano il ballo.",
      "I ballerini del Palladium non avevano formazione accademica. Erano ragazzi portoricani, italiani, ebrei e afroamericani della classe operaia, senza status sociale formale, che costruivano la propria identità sulla pista da ballo. Rubavano da tutto: tip-tap dal Cotton Club, acrobazie di Lindy Hop dal Savoy Ballroom, tenuta da sala dagli studi di midtown Manhattan. Hanno imbullonato tutto questo sulla clave afro-cubana.",
    ],
    sec3LegendsLeadIn: "Le leggende dell'epoca:",
    sec3LegendsBullets: [
      "**Cuban Pete (Pedro Aguilar)**, ballerino portoricano del Bronx con base di tip-tap e Lindy Hop, fuse il radicamento afro-cubano con lo styling del jazz americano e professionalizzò il Mambo da esibizione.",
      "**Millie Donay**, partner italo-americana di Cuban Pete, rivoluzionò il ruolo della seguace. Prima di Millie, ci si aspettava che le seguaci nel ballo latino seguissero passivamente il leader. Lei rispondeva colpo su colpo.",
      "**Killer Joe Piro**, ballerino italo-americano, divenne l'insegnante di Mambo più famoso del paese, la figura che codificò il caos della pista del Palladium in passi vendibili alla classe media americana.",
      "**Augie e Margo Rodríguez** fusero il Mambo con tecniche ampie da sala da ballo e portarono il ballo in televisione nazionale all'Ed Sullivan Show.",
    ],
    sec3OutroParagraphs: [
      "Da questo scontro è uscita la firma biomeccanica che ancora definisce il Mambo newyorkese: una parte inferiore del corpo radicata, con le ginocchia piegate, sposata a una parte superiore aggressivamente eretta, dalla tenuta bloccata. Il core addominale fa da ammortizzatore tra le due. Quando vedi i piedi di una ballerina di On2 di livello mondiale muoversi a velocità accecante mentre il torace resta completamente fermo, stai guardando l'eredità diretta di quest'epoca.",
    ],

    sec4Title: "Parte 4: Eddie Torres e la codifica dell'On2",
    sec4Paragraphs: [
      "Il Palladium chiuse nel 1966. Negli anni '70, ciò che era stato chiamato \"Mambo\" veniva rilanciato dall'industria discografica come \"Salsa\": le stesse tradizioni musicali afro-cubane sotto un'etichetta nuova e più commerciale.",
      "Il ballerino che ha fatto da ponte tra l'epoca del Palladium e quella moderna è **Eddie Torres**. Torres studiò con Tito Puente, che gli disse personalmente che rompere sul 2 era più fedele alla clave e alla conga rispetto al rompere sull'1. Torres prese quel principio musicale e ci costruì attorno un sistema insegnabile: una struttura di conteggio specifica, un passo base specifico, una pedagogia che si poteva apprendere lezione dopo lezione invece di assorbirla in anni di osmosi da club.",
      "Ogni programma moderno di Salsa On2, incluso questo, risale in ultima istanza al lavoro strutturale di Eddie Torres. L'espressione \"New York Style\" è diventata sinonimo della linea di Torres. Oggi l'\"On2\" si insegna da New York a Tokyo, ma il sistema che quasi tutti quegli insegnanti ereditano è stato la risposta di Torres a una sola domanda che Tito Puente gli pose sul 2.",
    ],

    sec5Title: "Perché questa storia conta sulla pista",
    sec5Intro:
      "Qui la storia non è decorazione. Tre cose cambiano nel modo in cui ti muovi davvero, una volta che capisci da dove arriva il ballo:",
    sec5Steps: [
      "**Smetti di lottare contro le ginocchia piegate.** Ginocchia morbide non sono una scelta stilistica. Sono biologicamente necessarie per eseguire il trasferimento di peso ritardato che fa funzionare il ritmo.",
      "**Smetti di rimbalzare con le spalle.** La parte superiore ferma non è un'affettazione estetica. È la disciplina da sala da ballo ereditata che rende leggibile il lavoro di piedi e leggibile la guida attraverso la tenuta.",
      "**Smetti di rompere sull'1.** Il colpo della conga cade sul 2. Il tuo break non è una scelta di conteggio arbitraria; è il punto di incontro tra il tuo corpo e la sezione ritmica della band.",
    ],
    sec5OutroRich:
      "Questa è la tesi dello [link]stile On2[/link] e il cuore del programma di The Mambo Guild.",

    sec6Title: "Fonti e ulteriori letture",
    sec6Sources: [
      "McMains, Juliet. *Spinning Mambo into Salsa: Caribbean Dance in Global Commerce*. Oxford University Press, 2015.",
      "Roberts, John Storm. *The Latin Tinge: The Impact of Latin American Music on the United States*. Oxford University Press, 1999.",
      "Fernandez, Raul A. *From Afro-Cuban Rhythms to Latin Jazz*. University of California Press, 2006.",
      "Manuel, Peter. *Caribbean Currents: Caribbean Music from Rumba to Reggae*. Temple University Press, 2009.",
      "Gottschild, Brenda Dixon. *Digging the Africanist Presence in American Performance*. Greenwood Press, 1996.",
    ],

    ctaEyebrow: "Vai più a fondo",
    ctaHeading: "The Mambo Guild ha un corso di storia completo da 20 moduli.",
    ctaBody:
      "Ogni modulo segue un filo della storia, dalle tradizioni africane del tamburo fino all'era Fania. Tutto con fonti, tutto insegnato da accademici della danza certificati. Incluso in ogni iscrizione a The Mambo Guild.",

    faqs: [
      {
        q: "Chi ha davvero inventato il Mambo?",
        a: "Non c'è un unico inventore. I direttori d'orchestra cubani Arsenio Rodríguez (L'Avana, anni '40) e Pérez Prado (Città del Messico, dal 1948) diedero alla musica la sua forma fondante; il ballo è stato cristallizzato dai newyorchesi della classe operaia al Palladium Ballroom tra il 1948 e il 1966.",
      },
      {
        q: "Mambo e Salsa sono la stessa cosa?",
        a: "Musicalmente, la Salsa moderna è un rebranding commerciale del Mambo e dei generi afro-cubani vicini fatto dall'industria discografica newyorkese all'inizio degli anni '70. Come ballo, ciò che oggi si insegna come Salsa On2 (New York Style) è il discendente diretto del Mambo dell'epoca del Palladium.",
      },
      {
        q: "Cos'è la clave?",
        a: "La clave è un pattern ritmico di cinque colpi distribuito su due battute (3-2 o 2-3) che ancora tutta la musica afro-cubana. Ogni altro strumento è fraseggiato in relazione ad essa; ballata correttamente, anche i tuoi cambi di peso si allineano ad essa.",
      },
      {
        q: "Perché è finita l'epoca del Palladium?",
        a: "Il Palladium Ballroom perse la licenza per gli alcolici nel 1966 e chiuse poco dopo. La febbre del Mambo era stata inoltre soppiantata nella cultura più ampia dal rock and roll e, all'interno della musica latina, dal Boogaloo e dai primordi dell'era \"Salsa\".",
      },
      {
        q: "Chi era Eddie Torres?",
        a: "Eddie Torres è un ballerino e coreografo newyorkese che ha studiato con Tito Puente e ha codificato ciò che oggi viene insegnato in tutto il mondo come Salsa On2 / New York Style. Ha trasformato il sapere di pista dei ballerini dell'epoca del Palladium in un programma insegnabile.",
      },
    ],
  },
  ja: {} as MamboHistoryContent,
  ko: {} as MamboHistoryContent,
  zh: {} as MamboHistoryContent,
  ru: {} as MamboHistoryContent,
  pl: {} as MamboHistoryContent,
  nl: {} as MamboHistoryContent,
  ar: {} as MamboHistoryContent,
  el: {} as MamboHistoryContent,
  sr: {} as MamboHistoryContent,
  tr: {} as MamboHistoryContent,
};

export function getMamboHistoryContent(locale: Locale): MamboHistoryContent {
  const c = CONTENT[locale];
  // Fallback to en if a locale's blob is empty (placeholder).
  if (!c || !c.metaTitle) return CONTENT.en;
  return c;
}
