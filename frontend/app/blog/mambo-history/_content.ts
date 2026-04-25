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
  // ============================================================ JA
  ja: {
    metaTitle: "マンボの誕生:ハバナからパラディアムへ",
    metaDescription:
      "マンボがいかにキューバのダンソン、ソン、アフロキューバンのリズムから生まれ、アルセニオ・ロドリゲスとパラディアムのダンサーたちによって変容し、エディ・トーレスによって現代のニューヨーク・スタイルのサルサ On2 として体系化されたか。",

    breadcrumbHome: "ホーム",
    breadcrumbBlog: "ブログ",
    breadcrumbCurrent: "マンボの歴史",

    badge: "歴史",
    h1Pre: "マンボの誕生:",
    h1Accent: "ハバナからパラディアムへ",

    shortAnswerRich:
      "マンボはひとつの瞬間に発明されたものではない。それは1世紀にわたる総合の到達点だ。アフロキューバンの打楽器の伝統、スペイン・ヨーロッパ系の社交ダンスの形式、アメリカ都市の劇場性が、3つの連続する時代に衝突して生まれた。その現代的な形は、1940年代のハバナで **アルセニオ・ロドリゲス** が結晶化させ、1950年代のニューヨークで **パラディアムのダンサーたち** が変貌させ、1970年代に **エディ・トーレス** が指導用に体系化した。",

    sec1Title: "第1部:キューバの3つのルーツ",
    sec1Paragraphs: [
      "ニューヨークがマンボを自分のものとして主張する前に、ダンスのリズムと身体言語は、動き方について正反対の考えを持つ2つの文化が衝突するなかでキューバで鍛えられた。",
      "一方は **ヨーロッパの伝統** だ。スペイン植民地の舞踏会、コントラダンサ、そして最終的にダンソン(1879年にミゲル・ファイルデが初演)。ダンスは直立していた。フレームは厳格だった。脚は比較的伸ばされていた。音楽はバイオリン、フルート、ピアノで奏でられた。ダンサーは表拍をしっかりと踏んだ。",
      "もう一方は **アフロキューバンの伝統** だ。*ソラレス*(中庭)や労働者階級の地区で守られていた:ルンバ、なかでもグアグアンコ、ヤンブ、コロンビア。姿勢は低く、膝は曲げられ、重心は地面にしっかりと根を張っていた。動きは肩、肋骨、腰に宿った。フレーズはオフビートと、その間にある空白を強調した。",
      "20世紀前半を通じて、これらの伝統は階級と人種によって分け隔てられていた。両者をつなぐ橋は1920年代に **ソン** という形で現れた。東部のオリエンテ州を発祥とするソンは、スペインのギターと歌詞構造をアフロキューバンの打楽器(ボンゴ、マラカス、クラーベ)と結びつけた。それは上流階級のクラブで社会的に許容され、同時に街の本物のリズムの伝統に駆動された最初の音楽だった。",
    ],

    sec2Title: "第2部:アルセニオ・ロドリゲスとコンガ",
    sec2Paragraphs: [
      "1930〜40年代、盲目のトレス奏者 **アルセニオ・ロドリゲス** は、ソンのアンサンブルにはもっと推進力が必要だと判断した。彼は伝統的なセプテートを *コンフント* に拡張し、複数のトランペット、ピアノ、そして(最も論争を呼んだ)コンガを加えた。コンガはそれまで、フォーマルなアンサンブルには「ストリート的すぎる」として退けられていた。アルセニオはそれをサウンドの中心に据えた。",
      "彼はまた、曲の **モントゥーノ** 部分を引き伸ばした。あの開かれた、強くシンコペーションされた、繰り返しの終結ヴァンプ。歌い手が即興し、ダンサーがついに解放される場所だ。そこから生まれた、遅く、突き進み、打楽器が前面に出るソン・モントゥーノは、マンボの直接のリズム的祖先だ。",
      "アルセニオが音楽的に押し通したのは、アフロキューバン的な時間の捉え方だった。音楽の根幹のパターンは **クラーベ** で、5つの打点からなる骨格が、その上に積まれるすべての層の感覚を決める。正しく踊られると、音楽は身体に対して、膝を緩め、重心を下げ、体重移動を遅らせて、ステップがリズムを踏みつけるのではなくリズムに沈み込むことを要求する。その遅れこそが、キューバ的な動き(腰の8の字)を機械的にではなく自然に生じさせるものだ。",
    ],

    sec3Title: "第3部:パラディアム・ボールルーム(1948-1966)",
    sec3IntroParagraphs: [
      "1948年、53丁目とブロードウェイの角にあるパラディアム・ボールルームは、人種統合のラテン音楽ナイトに門戸を開いた。数年のうちに、そこは **マンボ・クレイズ** の震源地となった。3人のハウス・バンドリーダー(ティト・プエンテ、ティト・ロドリゲス、マチート)が音楽を引っ張った。ブロンクス、ブルックリン、スパニッシュ・ハーレムのダンサーたちがダンスを引っ張った。",
      "パラディアムのダンサーたちは学術的な訓練を受けていなかった。彼らは公的な社会的地位を持たず、代わりにダンスフロアの上で自分のアイデンティティを築いていた、労働者階級のプエルトリコ系、イタリア系、ユダヤ系、アフリカ系アメリカ人の若者たちだった。彼らはあらゆるところから盗んだ。コットン・クラブからはタップ、サヴォイ・ボールルームからはリンディ・ホップのアクロバット、ミッドタウン・マンハッタンのスタジオからは社交ダンスのフレーム。それらすべてをアフロキューバンのクラーベの上にボルトで留めた。",
    ],
    sec3LegendsLeadIn: "この時代の伝説たち:",
    sec3LegendsBullets: [
      "**キューバン・ピート(ペドロ・アギラール)**、ブロンクス出身のプエルトリコ系ダンサーで、タップとリンディ・ホップのバックグラウンドを持ち、アフロキューバンの地に足のついた感覚をアメリカン・ジャズのスタイリングと融合させ、エキシビションのマンボを職業として確立した。",
      "**ミリー・ドネイ**、キューバン・ピートのイタリア系アメリカ人パートナー。フォロワーの役割を革命的に変えた。ミリー以前、ラテン・ダンスのフォロワーはリーダーに受動的に従うことが期待されていた。彼女は一打一打、彼に応酬した。",
      "**キラー・ジョー・ピロ**、イタリア系アメリカ人ダンサー。国でもっとも有名なマンボ講師となり、パラディアムのフロアの混沌を、アメリカの中産階級に売れるステップへと体系化した人物。",
      "**オーギー&マーゴ・ロドリゲス** はマンボを大きな社交ダンスのテクニックと融合させ、エド・サリヴァン・ショーを通じてダンスを全米テレビに送り込んだ。",
    ],
    sec3OutroParagraphs: [
      "この衝突から、いまもニューヨーク・マンボを定義する生体力学的な署名が生まれた。地に根ざした膝を曲げた下半身と、攻撃的に直立し、フレームをロックした上半身。腹筋のコアが両者の間のショックアブソーバーとして働く。世界レベルの On2 ダンサーの足が目にもとまらぬ速さで動く一方で、胸が完全に静止しているのを見るとき、あなたが見ているのはこの時代の直接の遺産だ。",
    ],

    sec4Title: "第4部:エディ・トーレスと On2 の体系化",
    sec4Paragraphs: [
      "パラディアムは1966年に閉鎖された。1970年代までに、「マンボ」と呼ばれていたものは、レコード業界によって「サルサ」として再ブランド化されていた。同じアフロキューバンの音楽的伝統が、市場に受けやすい新しいラベルの下に置かれたのだ。",
      "パラディアムの時代と現代の橋渡しをしたダンサーが **エディ・トーレス** だ。トーレスはティト・プエンテに学び、プエンテ自身から、2でブレイクすることが1でブレイクするよりもクラーベとコンガに忠実だと直接告げられた。トーレスはその音楽的原理を、教えられるシステムへと組み立てた。具体的なカウント構造、具体的なベーシック・ステップ、何年ものクラブ漬けで吸収するのではなく、レッスンごとに学べる教育法だ。",
      "現代のサルサ On2 のあらゆるカリキュラム、これも例外ではないが、最終的にはエディ・トーレスの構造的な仕事に行き着く。「ニューヨーク・スタイル」という言葉はトーレスの系譜の同義語となった。今日、ニューヨークから東京まで「On2」が教えられているが、ほぼすべての教師が受け継ぐシステムは、ティト・プエンテが2について彼に投げかけたひとつの問いに対するトーレスの答えだった。",
    ],

    sec5Title: "なぜこの歴史がフロアで重要なのか",
    sec5Intro:
      "ここでの歴史は飾りではない。ダンスがどこから来たのかを理解すると、実際の動き方において3つのことが変わる:",
    sec5Steps: [
      "**膝を曲げることに抗うのをやめる。** 柔らかい膝はスタイルの選択ではない。リズムを成立させる遅延した体重移動を実行するために、生物学的に必要なものだ。",
      "**肩を弾ませるのをやめる。** 静かな上半身は美学的なポーズではない。フットワークを読み取れるようにし、フレームを通じてリードを読み取れるようにする、受け継がれた社交ダンスの規律だ。",
      "**1でブレイクするのをやめる。** コンガのスラップは2に落ちる。あなたのブレイク・ステップは恣意的なカウントの選択ではなく、あなたの身体とバンドのリズムセクションの出会う場所だ。",
    ],
    sec5OutroRich:
      "これが [link]On2 スタイル[/link] の主張であり、The Mambo Guild のカリキュラムの中核だ。",

    sec6Title: "出典とさらなる読書",
    sec6Sources: [
      "McMains, Juliet. *Spinning Mambo into Salsa: Caribbean Dance in Global Commerce*. Oxford University Press, 2015.",
      "Roberts, John Storm. *The Latin Tinge: The Impact of Latin American Music on the United States*. Oxford University Press, 1999.",
      "Fernandez, Raul A. *From Afro-Cuban Rhythms to Latin Jazz*. University of California Press, 2006.",
      "Manuel, Peter. *Caribbean Currents: Caribbean Music from Rumba to Reggae*. Temple University Press, 2009.",
      "Gottschild, Brenda Dixon. *Digging the Africanist Presence in American Performance*. Greenwood Press, 1996.",
    ],

    ctaEyebrow: "もっと深く",
    ctaHeading: "The Mambo Guild には全20モジュールの歴史コースがあります。",
    ctaBody:
      "各モジュールが物語のひとつの糸をたどります。アフリカの太鼓の伝統からファニア時代まで。すべてに出典があり、すべて認定されたダンス研究者が教えます。The Mambo Guild のすべての会員プランに含まれます。",

    faqs: [
      {
        q: "実際にマンボを発明したのは誰ですか?",
        a: "唯一の発明者はいません。キューバのバンドリーダー、アルセニオ・ロドリゲス(1940年代ハバナ)とペレス・プラード(1948年以降のメキシコシティ)が音楽の基礎的な形を与えました。ダンスは1948〜1966年のパラディアム・ボールルームで、労働者階級のニューヨーカーたちによって結晶化されました。",
      },
      {
        q: "マンボとサルサは同じものですか?",
        a: "音楽的には、現代のサルサは1970年代初頭にニューヨークのレコード業界が行った、マンボと隣接するアフロキューバンのジャンルのマーケティング上の再ブランド化です。ダンスとして今日サルサ On2(ニューヨーク・スタイル)として教えられているものは、パラディアム時代のマンボの直接の子孫です。",
      },
      {
        q: "クラーベとは何ですか?",
        a: "クラーベは2小節にわたる5打点のリズム・パターン(3-2 または 2-3)で、すべてのアフロキューバン音楽を支えています。他のすべての楽器はそれに対してフレージングされます。正しく踊れば、あなたの体重移動もそれに揃います。",
      },
      {
        q: "なぜパラディアム時代は終わったのですか?",
        a: "パラディアム・ボールルームは1966年に酒類販売免許を失い、その後まもなく閉鎖されました。マンボ・ブームはまた、より広い文化のなかではロックンロールに、ラテン音楽の内部ではブーガルーと初期サルサ・レーベル時代によって、すでに置き換えられていました。",
      },
      {
        q: "エディ・トーレスとは誰ですか?",
        a: "エディ・トーレスはニューヨークのダンサー兼振付家で、ティト・プエンテに師事し、現在世界中でサルサ On2 / ニューヨーク・スタイルとして教えられているものを体系化しました。彼はパラディアム時代のダンサーたちのフロアの知を、教えられるカリキュラムへと変えたのです。",
      },
    ],
  },
  // ============================================================ KO
  ko: {
    metaTitle: "맘보의 탄생: 아바나에서 팔라디움까지",
    metaDescription:
      "맘보가 어떻게 쿠바의 단존, 손, 아프로쿠반 리듬에서 출현했고, 아르세니오 로드리게스와 팔라디움 댄서들에 의해 변형되었으며, 에디 토레스에 의해 현대 뉴욕 스타일 살사 On2로 체계화되었는지.",

    breadcrumbHome: "홈",
    breadcrumbBlog: "블로그",
    breadcrumbCurrent: "맘보의 역사",

    badge: "역사",
    h1Pre: "맘보의 탄생: ",
    h1Accent: "아바나에서 팔라디움까지",

    shortAnswerRich:
      "맘보는 어느 한 순간에 발명된 것이 아니다. 한 세기에 걸친 종합의 정점이다. 아프로쿠반 타악 전통, 스페인-유럽계 사교 무용 형식, 미국 도시의 연극성이 세 시대에 걸쳐 충돌하면서 만들어졌다. 그 현대적 형태는 1940년대 아바나에서 **아르세니오 로드리게스** 가 결정화시켰고, 1950년대 뉴욕에서 **팔라디움 댄서들** 이 변모시켰으며, 1970년대에 **에디 토레스** 가 가르치기 위한 형태로 체계화했다.",

    sec1Title: "1부: 쿠바의 세 가지 뿌리",
    sec1Paragraphs: [
      "뉴욕이 맘보를 자기 것이라 주장하기 전, 이 춤의 리듬과 신체 언어는 움직임에 대해 정반대의 생각을 가진 두 문화의 충돌 속에서 쿠바에서 벼려졌다.",
      "한쪽은 **유럽의 전통** 이었다. 스페인 식민지 시대의 무도장, 콘트라단사, 그리고 마침내 단존(1879년 미겔 파일데가 초연). 춤은 곧추서 있었다. 자세는 엄격했다. 다리는 비교적 곧게 뻗어 있었다. 음악은 바이올린, 플루트, 피아노로 연주되었다. 댄서들은 박자의 강박을 단단히 디뎠다.",
      "다른 한쪽은 **아프로쿠반 전통** 이었다. *솔라레스*(안뜰)와 노동계급 동네에 보존되어 있었다. 룸바, 그 안에 과과앙코, 얌부, 콜룸비아. 자세는 낮고 무릎은 굽혀져 있으며 무게중심은 땅에 단단히 박혀 있었다. 움직임은 어깨, 갈비뼈, 엉덩이에 살았다. 프레이징은 오프비트와 그 사이의 빈 공간을 강조했다.",
      "20세기 초까지 이 두 전통은 계급과 인종에 의해 분리되어 있었다. 둘 사이의 다리는 1920년대에 **손(Son)** 의 형태로 등장했다. 동부 오리엔테주에서 기원한 손은 스페인의 기타와 가사 구조를 아프로쿠반 타악(봉고, 마라카스, 클라베)과 결합시켰다. 그것은 상류층 클럽에서 사회적으로 받아들여지면서도, 거리의 리듬 전통에 의해 진정으로 추동된 최초의 음악이었다.",
    ],

    sec2Title: "2부: 아르세니오 로드리게스와 콩가",
    sec2Paragraphs: [
      "1930~40년대, 시각장애인 트레스 연주자 **아르세니오 로드리게스** 는 손 앙상블에 더 많은 추진력이 필요하다고 결정했다. 그는 전통적인 셉테토를 *콘훈토* 로 확장해 여러 트럼펫과 피아노를 더했고, (가장 논란이 된) 콩가도 추가했다. 콩가는 그때까지 정식 앙상블에는 너무 \"거리적\"이라며 배제되어 왔다. 아르세니오는 그것을 사운드의 중심에 놓았다.",
      "그는 또 곡의 **몬투노** 부분을 길게 늘였다. 끝에 위치한, 열려 있고 강하게 싱코페이션된 반복적인 뱀프 구간. 가수가 즉흥을 펼치고 댄서들이 마침내 풀려날 수 있는 곳. 거기서 나온 느리고 밀어붙이며 타악기가 전면에 나선 손 몬투노가 맘보의 직계 리듬 조상이다.",
      "아르세니오가 음악적으로 관철시킨 것은 시간을 다루는 아프로쿠반적 방식이었다. 음악의 기초 패턴은 **클라베** 다. 다섯 타격으로 이루어진 골격이 그 위에 쌓이는 모든 층의 감각을 결정한다. 제대로 춤을 추면 음악은 몸에게 무릎을 부드럽게 하고 무게중심을 낮추며 체중 이동을 지연시키도록 요구한다. 그래야 스텝이 리듬 위를 행진하는 것이 아니라 리듬 속으로 가라앉는다. 그 지연이 바로 쿠바적 움직임(엉덩이의 8자 모양)을 기계적이지 않고 자연스럽게 일어나게 만든다.",
    ],

    sec3Title: "3부: 팔라디움 볼룸 (1948-1966)",
    sec3IntroParagraphs: [
      "1948년, 53번가와 브로드웨이 모퉁이의 팔라디움 볼룸이 인종 통합 라틴 음악의 밤들을 위해 문을 열었다. 몇 년 만에 그곳은 **맘보 열풍** 의 진원지가 되었다. 세 명의 하우스 밴드 리더(티토 푸엔테, 티토 로드리게스, 마치토)가 음악을 이끌었다. 브롱크스, 브루클린, 스패니시 할렘의 댄서들이 춤을 이끌었다.",
      "팔라디움 댄서들은 학문적 훈련을 받은 사람들이 아니었다. 공식적인 사회적 지위가 없었기에 댄스 플로어 위에서 자신의 정체성을 만들어가던 노동계급의 푸에르토리코계, 이탈리아계, 유대계, 아프리카계 미국인 청소년들이었다. 그들은 모든 것에서 훔쳐왔다. 코튼 클럽의 탭, 사보이 볼룸의 린디 합 곡예, 미드타운 맨해튼 스튜디오의 사교 무용 프레임. 그들은 이 모든 것을 아프로쿠반의 클라베 위에 볼트로 고정시켰다.",
    ],
    sec3LegendsLeadIn: "이 시대의 전설들:",
    sec3LegendsBullets: [
      "**쿠반 피트(페드로 아길라르)**, 브롱크스 출신의 푸에르토리코계 댄서로 탭과 린디 합 배경을 가지고 있으며, 아프로쿠반의 묵직한 그라운딩과 미국 재즈의 스타일링을 융합해 전시용 맘보를 직업화했다.",
      "**밀리 도네이**, 쿠반 피트의 이탈리아계 미국인 파트너. 팔로워의 역할을 혁명적으로 바꿨다. 밀리 이전에는 라틴 댄스에서 팔로워는 리더를 수동적으로 따르도록 기대받았다. 그녀는 한 박자 한 박자 그에게 맞받아쳤다.",
      "**킬러 조 피로**, 이탈리아계 미국인 댄서. 미국에서 가장 유명한 맘보 강사가 되었으며, 팔라디움 플로어의 혼돈을 미국 중산층에게 팔 수 있는 스텝으로 체계화한 인물.",
      "**오기 & 마고 로드리게스** 는 맘보를 시원시원한 사교 무용 기법과 융합시키고, 에드 설리번 쇼를 통해 이 춤을 전국 텔레비전에 올렸다.",
    ],
    sec3OutroParagraphs: [
      "이 충돌에서 지금도 뉴욕 맘보를 정의하는 생체역학적 서명이 나왔다. 단단히 자리잡고 무릎이 굽혀진 하체에, 공격적으로 곧추서고 프레임이 잠긴 상체가 결합된다. 복부 코어가 둘 사이의 충격 흡수 장치 역할을 한다. 세계 정상급 On2 댄서의 발이 눈으로 좇기 어려운 속도로 움직이는 동안 가슴은 완전히 고요하게 머물러 있는 것을 본다면, 당신은 이 시대의 직접적인 유산을 보고 있는 것이다.",
    ],

    sec4Title: "4부: 에디 토레스와 On2의 체계화",
    sec4Paragraphs: [
      "팔라디움은 1966년에 문을 닫았다. 1970년대까지 \"맘보\"라 불리던 것은 음반 산업에 의해 \"살사\"로 리브랜딩되고 있었다. 같은 아프로쿠반 음악 전통이 시장친화적인 새 라벨 아래에 놓인 것이다.",
      "팔라디움 시대와 현대를 연결한 댄서가 **에디 토레스** 다. 토레스는 티토 푸엔테에게 사사했는데, 푸엔테는 직접 그에게 2박에서 브레이크하는 것이 1박에서 브레이크하는 것보다 클라베와 콩가에 더 충실하다고 말했다. 토레스는 그 음악적 원리를 가르칠 수 있는 시스템으로 쌓아올렸다. 구체적인 카운트 구조, 구체적인 베이직 스텝, 클럽 삼투작용으로 수년에 걸쳐 흡수하는 것이 아니라 수업 단위로 배울 수 있는 교육 방식.",
      "이 커리큘럼을 포함한 모든 현대 살사 On2 커리큘럼은 결국 에디 토레스의 구조적 작업으로 거슬러 올라간다. \"뉴욕 스타일\"이라는 표현은 토레스의 계보와 동의어가 되었다. 오늘날 \"On2\"는 뉴욕에서 도쿄까지 어디서든 가르쳐지지만, 거의 모든 그 강사들이 물려받는 시스템은 티토 푸엔테가 2박에 대해 던진 단 하나의 질문에 대한 토레스의 답이었다.",
    ],

    sec5Title: "이 역사가 플로어에서 중요한 이유",
    sec5Intro:
      "여기서 역사는 장식이 아니다. 춤이 어디에서 왔는지를 이해하면, 실제로 움직이는 방식에서 세 가지가 바뀐다:",
    sec5Steps: [
      "**굽힌 무릎과 싸우기를 멈춘다.** 부드러운 무릎은 스타일의 선택이 아니다. 리듬을 성립시키는 지연된 체중 이동을 실행하기 위해 생물학적으로 요구되는 것이다.",
      "**어깨를 들썩이는 것을 멈춘다.** 고요한 상체는 미적 가식이 아니다. 풋워크를 읽힐 수 있게 만들고, 프레임을 통해 리드를 읽힐 수 있게 만드는 물려받은 사교 무용의 규율이다.",
      "**1박에서 브레이크하는 것을 멈춘다.** 콩가의 슬랩은 2박에 떨어진다. 당신의 브레이크 스텝은 임의의 카운트 선택이 아니라, 당신의 몸과 밴드의 리듬 섹션이 만나는 지점이다.",
    ],
    sec5OutroRich:
      "이것이 [link]On2 스타일[/link]의 명제이며 The Mambo Guild 커리큘럼의 핵심이다.",

    sec6Title: "출처 및 더 읽을거리",
    sec6Sources: [
      "McMains, Juliet. *Spinning Mambo into Salsa: Caribbean Dance in Global Commerce*. Oxford University Press, 2015.",
      "Roberts, John Storm. *The Latin Tinge: The Impact of Latin American Music on the United States*. Oxford University Press, 1999.",
      "Fernandez, Raul A. *From Afro-Cuban Rhythms to Latin Jazz*. University of California Press, 2006.",
      "Manuel, Peter. *Caribbean Currents: Caribbean Music from Rumba to Reggae*. Temple University Press, 2009.",
      "Gottschild, Brenda Dixon. *Digging the Africanist Presence in American Performance*. Greenwood Press, 1996.",
    ],

    ctaEyebrow: "더 깊이",
    ctaHeading: "The Mambo Guild에는 20개 모듈로 구성된 전체 역사 강좌가 있습니다.",
    ctaBody:
      "각 모듈은 이야기의 한 가닥을 따라갑니다. 아프리카 드럼 전통에서 파니아 시대까지. 모두 출처가 있고, 모두 공인 무용 학자들이 가르칩니다. 모든 The Mambo Guild 멤버십에 포함되어 있습니다.",

    faqs: [
      {
        q: "실제로 맘보를 발명한 사람은 누구입니까?",
        a: "단일한 발명자는 없습니다. 쿠바의 밴드 리더 아르세니오 로드리게스(1940년대 아바나)와 페레스 프라도(1948년 이후 멕시코시티)가 음악에 기초적 형태를 부여했고, 춤은 1948-1966년 팔라디움 볼룸에서 노동계급 뉴요커들에 의해 결정화되었습니다.",
      },
      {
        q: "맘보와 살사는 같은 것입니까?",
        a: "음악적으로 현대의 살사는 1970년대 초 뉴욕 음반 산업이 만든, 맘보와 인접한 아프로쿠반 장르의 마케팅 리브랜딩입니다. 춤으로서, 오늘날 살사 On2(뉴욕 스타일)로 가르쳐지는 것은 팔라디움 시대 맘보의 직접 후손입니다.",
      },
      {
        q: "클라베란 무엇입니까?",
        a: "클라베는 두 마디에 걸친 5타격 리듬 패턴(3-2 또는 2-3)으로, 모든 아프로쿠반 음악을 떠받칩니다. 다른 모든 악기는 그에 맞추어 프레이징되며, 제대로 춤을 추면 당신의 체중 이동도 그것에 정렬됩니다.",
      },
      {
        q: "팔라디움 시대는 왜 끝났습니까?",
        a: "팔라디움 볼룸은 1966년에 주류 판매 면허를 잃고 곧 폐쇄되었습니다. 맘보 열풍은 또한 더 넓은 문화 안에서는 로큰롤에 의해, 라틴 음악 안에서는 부갈루와 초기 살사 레이블 시대에 의해 이미 자리를 내준 상태였습니다.",
      },
      {
        q: "에디 토레스는 누구입니까?",
        a: "에디 토레스는 티토 푸엔테에게 사사하고, 현재 전 세계에서 살사 On2 / 뉴욕 스타일로 가르쳐지는 것을 체계화한 뉴욕의 댄서이자 안무가입니다. 그는 팔라디움 시대 댄서들의 플로어 지식을 가르칠 수 있는 커리큘럼으로 만들었습니다.",
      },
    ],
  },
  // ============================================================ ZH
  zh: {
    metaTitle: "曼波的诞生:从哈瓦那到帕拉迪姆",
    metaDescription:
      "曼波如何从古巴的丹松、Son 和非洲-古巴节奏中诞生,如何被阿森尼奥·罗德里格斯和帕拉迪姆舞者们改造,又如何被埃迪·托雷斯整理成现代的纽约风格萨尔萨 On2。",

    breadcrumbHome: "首页",
    breadcrumbBlog: "博客",
    breadcrumbCurrent: "曼波的历史",

    badge: "历史",
    h1Pre: "曼波的诞生:",
    h1Accent: "从哈瓦那到帕拉迪姆",

    shortAnswerRich:
      "曼波并非在某一个瞬间被发明出来。它是一场长达一个世纪的综合的高潮:非洲-古巴打击乐传统、西班牙-欧洲舞蹈形式与美国都市剧场性,在三个相继的时代里相互碰撞。它的现代形态由 1940 年代哈瓦那的 **阿森尼奥·罗德里格斯** 凝结成形,在 1950 年代纽约由 **帕拉迪姆舞者们** 加以改造,并由 **埃迪·托雷斯** 在 1970 年代整理成可教学的体系。",

    sec1Title: "第一部分:三条古巴根源",
    sec1Paragraphs: [
      "在纽约把曼波宣告为自己的之前,这种舞蹈的节奏与身体语言已经在古巴的两个文化的撞击中被锻造出来,这两个文化对于「该如何动」有着完全相反的想法。",
      "一边是 **欧洲传统**:西班牙殖民时代的舞厅、Contradanza,最终是丹松(Miguel Failde 于 1879 年首演)。舞蹈是直立的。架子很严格。腿相对伸直。音乐由小提琴、长笛和钢琴演奏。舞者牢牢地踩在正拍上。",
      "另一边是 **非洲-古巴传统**,保留在 *solares*(院落)和工人阶级社区中:Rumba,包括 Guaguancó、Yambú、Columbia。姿态偏低,膝盖弯曲,重心扎在地上。动作活在肩膀、肋骨和胯部。乐句强调反拍以及反拍之间的留白。",
      "整个 20 世纪上半叶,这两种传统因阶级与种族而被分隔。它们之间的桥梁出现在 1920 年代,以 **Son** 的形式。Son 起源于古巴东部的 Oriente 省,把西班牙吉他与歌词结构和非洲-古巴打击乐(邦戈、马拉卡斯、Clave)结合在一起。它是第一种既能在上层俱乐部被社会接受、又被街头节奏传统真正驱动的音乐。",
    ],

    sec2Title: "第二部分:阿森尼奥·罗德里格斯与康加鼓",
    sec2Paragraphs: [
      "在 1930 至 40 年代,一位失明的 tres 吉他演奏者 **阿森尼奥·罗德里格斯** 决定:Son 乐团需要更强的推动力。他把传统的 septeto 扩展为 *conjunto*,加入多支小号、钢琴,以及(最具争议的)康加鼓。康加鼓在此之前一直被认为太「街头」,不适合正式乐团。阿森尼奥把它放在了声音的中心。",
      "他还把曲子的 **montuno** 部分拉长:那段开放的、强烈切分的、重复的结尾 vamp,在那里歌手即兴,舞者也终于可以真正放开。由此产生的、缓慢、推进、以打击乐为主导的 son montuno,正是曼波的直接节奏祖先。",
      "阿森尼奥在音乐上贯彻的,是一种非洲-古巴式的对待时间的方式。这门音乐的根本图式是 **Clave**,一个由 5 个击点构成的骨架,决定了之上每一层的感觉。正确地舞动时,音乐要求身体放软膝盖、降低重心、并延后重心转移,让步子沉入节奏,而不是从节奏上踏过。正是这种延后,让古巴式的动作(胯部的 8 字)自然发生,而非机械执行。",
    ],

    sec3Title: "第三部分:帕拉迪姆舞厅(1948-1966)",
    sec3IntroParagraphs: [
      "1948 年,位于第 53 街与百老汇交口的帕拉迪姆舞厅,向种族融合的拉丁音乐之夜敞开了大门。在几年之内,它就成了 **曼波热潮** 的震中。三位驻场乐队领队(Tito Puente、Tito Rodríguez 和 Machito)推动了音乐。来自布朗克斯、布鲁克林和西班牙哈林区的舞者们推动了舞蹈。",
      "帕拉迪姆的舞者们没有受过学院训练。他们是工人阶级的波多黎各裔、意大利裔、犹太裔和非裔美国孩子,没有任何正式的社会地位,转而在舞池上建构自己的身份。他们到处偷招:从 Cotton Club 偷来踢踏,从 Savoy 舞厅偷来 Lindy Hop 的杂技,从中城曼哈顿的舞蹈工作室偷来交谊舞的架子。他们把这一切都拧到了非洲-古巴的 Clave 之上。",
    ],
    sec3LegendsLeadIn: "那个时代的传奇:",
    sec3LegendsBullets: [
      "**Cuban Pete(Pedro Aguilar)**,布朗克斯的波多黎各裔舞者,有踢踏与 Lindy Hop 背景,把非洲-古巴式的扎实接地与美国爵士风格融合,把表演性曼波专业化。",
      "**Millie Donay**,Cuban Pete 的意大利裔美国女搭档,彻底改变了 follower 的角色。在 Millie 之前,拉丁舞中的 follower 被期待被动地跟随 leader。她则是一拍一拍地与他对答如流。",
      "**Killer Joe Piro**,意大利裔美国舞者,成为全美最著名的曼波教师,正是他把帕拉迪姆舞池的混乱整理成可以卖给中产美国的舞步。",
      "**Augie & Margo Rodríguez** 把曼波与大开大合的交谊舞技术融合,通过 Ed Sullivan Show 把这门舞带上全国电视。",
    ],
    sec3OutroParagraphs: [
      "正是这种碰撞,塑造了至今仍定义纽约曼波的生物力学签名:扎实、屈膝的下半身,与极度直立、架子锁住的上半身相结合。腹部核心则是两者之间的减震器。当你看到一位世界级 On2 女舞者的脚以惊人速度移动,而胸口却几乎完全静止,你看到的就是这个时代的直接遗产。",
    ],

    sec4Title: "第四部分:埃迪·托雷斯与 On2 的体系化",
    sec4Paragraphs: [
      "帕拉迪姆于 1966 年关闭。到了 1970 年代,过去被称为「曼波」的东西,被唱片业重新包装为「萨尔萨」——同一套非洲-古巴音乐传统,换上了一个更易于市场接受的新标签。",
      "在帕拉迪姆时代和现代之间架起桥梁的舞者是 **埃迪·托雷斯**。托雷斯在 Tito Puente 门下学习,Puente 亲口告诉他:在 2 拍 break 比在 1 拍 break 更忠于 Clave 与康加鼓。托雷斯把这条音乐原则,搭建成了一套可以传授的体系:具体的拍数结构、具体的基本步、可以一节课一节课学的教学法,而不是靠多年泡夜场慢慢渗透。",
      "包括本课程在内的每一套现代萨尔萨 On2 教学体系,最终都可以追溯到埃迪·托雷斯的结构性工作。「纽约风格」一词就此与托雷斯的师承同义。今天,从纽约到东京,「On2」无处不教,但几乎所有这些老师所继承的体系,都是托雷斯对 Tito Puente 关于 2 拍那一个问题的回答。",
    ],

    sec5Title: "为什么这段历史在舞池里很重要",
    sec5Intro:
      "这里的历史不是装饰。一旦你理解这门舞从哪里来,你实际的动作方式会有三件事发生改变:",
    sec5Steps: [
      "**你不再与屈膝对抗。** 软膝并不是一种风格选择。它在生物学上是必须的,只有这样才能完成让节奏成立的「延后重心转移」。",
      "**你不再用肩膀上下弹跳。** 上半身的安静并不是审美上的做作,而是继承自交谊舞的纪律——它让脚下的工作可读,也让通过架子传递的引导可读。",
      "**你不再在 1 拍上 break。** 康加鼓的 slap 落在 2 拍上。你的 break step 不是一个随意的拍数选择,而是你的身体与乐队节奏组的相遇之处。",
    ],
    sec5OutroRich:
      "这就是 [link]On2 风格[/link] 的核心论点,也是 The Mambo Guild 教学体系的核心。",

    sec6Title: "参考资料与延伸阅读",
    sec6Sources: [
      "McMains, Juliet. *Spinning Mambo into Salsa: Caribbean Dance in Global Commerce*. Oxford University Press, 2015.",
      "Roberts, John Storm. *The Latin Tinge: The Impact of Latin American Music on the United States*. Oxford University Press, 1999.",
      "Fernandez, Raul A. *From Afro-Cuban Rhythms to Latin Jazz*. University of California Press, 2006.",
      "Manuel, Peter. *Caribbean Currents: Caribbean Music from Rumba to Reggae*. Temple University Press, 2009.",
      "Gottschild, Brenda Dixon. *Digging the Africanist Presence in American Performance*. Greenwood Press, 1996.",
    ],

    ctaEyebrow: "深入了解",
    ctaHeading: "The Mambo Guild 拥有完整的 20 个模块的历史课程。",
    ctaBody:
      "每个模块追踪故事中的一条线索,从非洲鼓的传统一直到 Fania 时代。全部有出处,全部由获得认证的舞蹈学者教授。包含在每一份 The Mambo Guild 会籍中。",

    faqs: [
      {
        q: "曼波到底是谁发明的?",
        a: "没有单一的发明者。古巴乐队领队阿森尼奥·罗德里格斯(1940 年代哈瓦那)和 Pérez Prado(1948 年之后的墨西哥城)赋予了这门音乐基础形态;舞蹈则在 1948-1966 年的帕拉迪姆舞厅,由纽约工人阶级的年轻人们结晶成型。",
      },
      {
        q: "曼波和萨尔萨是同一个东西吗?",
        a: "在音乐上,现代萨尔萨是 1970 年代初纽约唱片业对曼波及邻近的非洲-古巴流派进行的市场化改包装。作为舞蹈,今天被作为萨尔萨 On2(纽约风格)教授的内容,正是帕拉迪姆时代曼波的直接后裔。",
      },
      {
        q: "什么是 Clave?",
        a: "Clave 是横跨两个小节的 5 击节奏型(3-2 或 2-3),所有非洲-古巴音乐都以它为锚点。其他每一件乐器都是相对于它来分句的;正确舞动时,你的重心切换也会与之对齐。",
      },
      {
        q: "帕拉迪姆时代为什么会结束?",
        a: "帕拉迪姆舞厅在 1966 年失去了酒类经营许可,不久后关门。在更宽广的文化中,曼波热潮也已被摇滚乐所取代;在拉丁音乐内部,则被 Boogaloo 和早期「萨尔萨」标签时代所取代。",
      },
      {
        q: "埃迪·托雷斯是谁?",
        a: "埃迪·托雷斯是一位在 Tito Puente 门下学习的纽约舞者与编舞家,他整理出了如今全世界以萨尔萨 On2 / 纽约风格教授的体系。他把帕拉迪姆时代舞者们的舞池经验,变成了一套可以教学的课程。",
      },
    ],
  },
  // ============================================================ RU
  ru: {
    metaTitle: "Рождение мамбо: от Гаваны до «Палладиума»",
    metaDescription:
      "Как мамбо вырос из кубинского данзона, сона и афрокубинских ритмов, был преображён Арсенио Родригесом и танцорами «Палладиума» и был кодифицирован Эдди Торресом как современный нью-йоркский стиль сальсы On2.",

    breadcrumbHome: "Главная",
    breadcrumbBlog: "Блог",
    breadcrumbCurrent: "История мамбо",

    badge: "История",
    h1Pre: "Рождение мамбо: ",
    h1Accent: "от Гаваны до «Палладиума»",

    shortAnswerRich:
      "Мамбо не был изобретён в одну минуту. Это кульминация почти столетнего синтеза: афрокубинские традиции перкуссии, испано-европейская танцевальная форма и американская городская театральность сталкиваются в трёх последовательных эпохах. Его современная форма была кристаллизована **Арсенио Родригесом** в Гаване 1940-х, преображена **танцорами «Палладиума»** в Нью-Йорке 1950-х и кодифицирована для преподавания **Эдди Торресом** в 1970-х.",

    sec1Title: "Часть 1: три кубинских корня",
    sec1Paragraphs: [
      "До того как Нью-Йорк объявил мамбо своим, ритмы и язык тела этого танца были выкованы на Кубе в столкновении двух культур, у которых были противоположные представления о том, как двигаться.",
      "С одной стороны — **европейская традиция**: испанские колониальные бальные залы, контрданса и, в конце концов, данзон (премьера в 1879 году у Мигеля Файлде). Танцы были вертикальными. Рамка — строгой. Ноги — относительно прямыми. Музыку играли на скрипках, флейтах и фортепиано. Танцоры твёрдо ставили ногу на сильную долю.",
      "С другой стороны — **афрокубинская традиция**, сохранявшаяся в *соларес* (внутренних дворах) и рабочих кварталах: румба, в том числе гуагуанко, ямбу, колумбия. Положение было низким, колени согнуты, центр тяжести укоренён в земле. Движение жило в плечах, рёбрах, бёдрах. Фразировка подчёркивала слабые доли и пустоты между ними.",
      "На протяжении начала XX века эти традиции были разделены классом и расой. Мост между ними появился в 1920-х в виде **сона**. Возникнув в восточной провинции Орьенте, сон соединил испанскую гитару и лирическую структуру с афрокубинской перкуссией (бонго, маракасы, клаве). Это была первая музыка, одновременно социально приемлемая в клубах высшего класса и подлинно движимая уличными ритмическими традициями.",
    ],

    sec2Title: "Часть 2: Арсенио Родригес и конга",
    sec2Paragraphs: [
      "В 1930–40-х слепой исполнитель на тресе по имени **Арсенио Родригес** решил, что ансамблю сона нужно больше драйва. Он расширил традиционный септето до *конхунто*, добавив несколько труб, фортепиано и (самое спорное) конгу. До этого конгу отвергали как слишком «уличную» для официальных ансамблей. Арсенио поставил её в самое сердце звука.",
      "Он также растянул раздел **монтуно** в композиции — открытую, сильно синкопированную, повторяющуюся вампу в конце, где певцы импровизировали, а танцоры наконец могли отпустить себя. Возникший там медленный, давящий, перкуссионно-ориентированный сон-монтуно — прямой ритмический предок мамбо.",
      "Музыкально Арсенио утвердил афрокубинский подход ко времени. Основополагающая фигура этой музыки — **клаве**, скелет из пяти ударов, который задаёт ощущение каждого следующего слоя. Если танцевать правильно, музыка просит тело смягчить колени, опустить центр тяжести и задержать перенос веса так, чтобы шаг садился в ритм, а не маршировал поверх него. Именно эта задержка делает кубинское движение (восьмёрка бёдер) естественным, а не механическим.",
    ],

    sec3Title: "Часть 3: бальный зал «Палладиум» (1948–1966)",
    sec3IntroParagraphs: [
      "В 1948 году бальный зал «Палладиум» на углу 53-й улицы и Бродвея открыл двери для расово смешанных вечеров латиноамериканской музыки. Через несколько лет он стал эпицентром **мамбо-лихорадки**. Музыку двигали три домашних бэндлидера (Тито Пуэнте, Тито Родригес и Мачито). Танцоры из Бронкса, Бруклина и Спэниш-Гарлема двигали танец.",
      "Танцоры «Палладиума» не имели академического образования. Это были рабочие пуэрториканские, итальянские, еврейские и афроамериканские подростки без формального социального статуса, которые строили свою идентичность на танцполе. Они тащили отовсюду: чечётку из «Cotton Club», акробатику Линди-Хопа из «Savoy», бальную рамку из студий мидтауна. Всё это они привинтили к афрокубинской клаве.",
    ],
    sec3LegendsLeadIn: "Легенды эпохи:",
    sec3LegendsBullets: [
      "**Cuban Pete (Педро Агилар)** — пуэрториканский танцор из Бронкса с фоном чечётки и Линди-Хопа, соединил афрокубинскую заземлённость с американской джазовой стилистикой и сделал выставочное мамбо профессиональной дисциплиной.",
      "**Милли Донэй**, итало-американская партнёрша Cuban Pete, революционизировала роль follower. До Милли в латинских танцах от партнёрши ожидали пассивно следовать за ведущим. Она отвечала ему удар на удар.",
      "**Killer Joe Piro**, итало-американский танцор, стал самым известным преподавателем мамбо в стране — фигурой, которая упорядочила хаос «Палладиума» в шаги, которые можно было продать среднему классу Америки.",
      "**Оги и Марго Родригес** соединили мамбо с широкими бальными техниками и вывели танец на национальное телевидение в шоу Эда Салливана.",
    ],
    sec3OutroParagraphs: [
      "Из этого столкновения родилась биомеханическая подпись, которая до сих пор определяет нью-йоркское мамбо: заземлённый низ корпуса с согнутыми коленями, женатый на агрессивно прямом, заблокированном по рамке верхе. Брюшной кор служит амортизатором между ними. Когда вы видите, как у топ-танцовщицы On2 ноги мелькают со слепящей скоростью, а грудная клетка остаётся совершенно неподвижной, вы смотрите на прямое наследство этой эпохи.",
    ],

    sec4Title: "Часть 4: Эдди Торрес и кодификация On2",
    sec4Paragraphs: [
      "«Палладиум» закрылся в 1966 году. К 1970-м то, что называлось «мамбо», звукозаписывающая индустрия стала переименовывать в «сальсу» — те же афрокубинские музыкальные традиции под новой, более маркетинговой этикеткой.",
      "Танцором, перекинувшим мост между эпохой «Палладиума» и современной, стал **Эдди Торрес**. Торрес учился у Тито Пуэнте, который лично сказал ему, что брейк на 2 точнее соответствует клаве и конге, чем брейк на 1. Торрес взял этот музыкальный принцип и построил вокруг него систему, которой можно учить: конкретную структуру счёта, конкретный базовый шаг, педагогику, которую можно осваивать урок за уроком, а не впитывать годами клубного осмоса.",
      "Любая современная программа сальсы On2, включая эту, в конечном счёте восходит к структурной работе Эдди Торреса. Выражение «нью-йоркский стиль» стало синонимом линии Торреса. Сегодня «On2» преподают повсюду — от Нью-Йорка до Токио, — но систему, которую наследует почти каждый из этих учителей, Торрес выстроил как ответ на единственный вопрос, заданный ему Тито Пуэнте о двойке.",
    ],

    sec5Title: "Почему эта история важна на танцполе",
    sec5Intro:
      "История здесь не декоративна. Когда вы понимаете, откуда пришёл танец, в том, как вы реально двигаетесь, меняются три вещи:",
    sec5Steps: [
      "**Вы перестаёте бороться с согнутыми коленями.** Мягкие колени — это не стилистический выбор. Они биологически необходимы, чтобы выполнить тот самый отложенный перенос веса, который заставляет ритм работать.",
      "**Вы перестаёте подпрыгивать плечами.** Тихий верх — не эстетический жест, а унаследованная бальная дисциплина: только она делает работу стоп читаемой и делает ведение читаемым через рамку.",
      "**Вы перестаёте брейкать на 1.** Слэп конги падает на 2. Ваш брейк-шаг — не произвольный выбор счёта, а точка встречи вашего тела с ритм-секцией оркестра.",
    ],
    sec5OutroRich:
      "В этом тезис [link]стиля On2[/link] и сердцевина программы The Mambo Guild.",

    sec6Title: "Источники и дополнительное чтение",
    sec6Sources: [
      "McMains, Juliet. *Spinning Mambo into Salsa: Caribbean Dance in Global Commerce*. Oxford University Press, 2015.",
      "Roberts, John Storm. *The Latin Tinge: The Impact of Latin American Music on the United States*. Oxford University Press, 1999.",
      "Fernandez, Raul A. *From Afro-Cuban Rhythms to Latin Jazz*. University of California Press, 2006.",
      "Manuel, Peter. *Caribbean Currents: Caribbean Music from Rumba to Reggae*. Temple University Press, 2009.",
      "Gottschild, Brenda Dixon. *Digging the Africanist Presence in American Performance*. Greenwood Press, 1996.",
    ],

    ctaEyebrow: "Глубже",
    ctaHeading: "В The Mambo Guild есть полный 20-модульный курс по истории.",
    ctaBody:
      "Каждый модуль ведёт по одной нити сюжета — от африканских барабанных традиций до эпохи Fania. Всё с источниками, всё преподают сертифицированные исследователи танца. Включено в любую подписку The Mambo Guild.",

    faqs: [
      {
        q: "Кто на самом деле изобрёл мамбо?",
        a: "Единственного изобретателя нет. Кубинские бэндлидеры Арсенио Родригес (Гавана, 1940-е) и Перес Прадо (Мехико, с 1948 года) задали музыке её базовую форму; танец был кристаллизован рабочими нью-йоркцами в бальном зале «Палладиум» в 1948–1966 годах.",
      },
      {
        q: "Мамбо и сальса — это одно и то же?",
        a: "Музыкально современная сальса — это маркетинговый ребрендинг мамбо и соседних афрокубинских жанров, проведённый нью-йоркской звукозаписывающей индустрией в начале 1970-х. Как танец то, что сегодня преподают как сальсу On2 (нью-йоркский стиль), — прямой потомок мамбо эпохи «Палладиума».",
      },
      {
        q: "Что такое клаве?",
        a: "Клаве — это пятиударная ритмическая фигура, растянутая на два такта (3-2 или 2-3), которая закрепляет всю афрокубинскую музыку. Все остальные инструменты фразируются относительно неё; если танцевать правильно, ваши переносы веса тоже выстраиваются по ней.",
      },
      {
        q: "Почему закончилась эпоха «Палладиума»?",
        a: "Бальный зал «Палладиум» в 1966 году лишился алкогольной лицензии и вскоре закрылся. Мамбо-лихорадка к тому моменту уже была вытеснена в широкой культуре рок-н-роллом, а внутри латиноамериканской музыки — бугалу и ранней эпохой ярлыка «сальса».",
      },
      {
        q: "Кто такой Эдди Торрес?",
        a: "Эдди Торрес — нью-йоркский танцор и хореограф, ученик Тито Пуэнте, кодифицировавший то, что сегодня по всему миру преподают как сальсу On2 / нью-йоркский стиль. Он превратил танцпольное знание танцоров эпохи «Палладиума» в обучаемую программу.",
      },
    ],
  },
  // ============================================================ PL
  pl: {
    metaTitle: "Narodziny mambo: od Hawany po Palladium",
    metaDescription:
      "Jak mambo wyłoniło się z kubańskiego danzónu, sonu i afrokubańskiego rytmu, jak zostało przekształcone przez Arsenia Rodrígueza i tancerzy z Palladium oraz jak Eddie Torres skodyfikował je jako współczesną nowojorską salsę On2.",

    breadcrumbHome: "Strona główna",
    breadcrumbBlog: "Blog",
    breadcrumbCurrent: "Historia mambo",

    badge: "Historia",
    h1Pre: "Narodziny mambo: ",
    h1Accent: "od Hawany po Palladium",

    shortAnswerRich:
      "Mambo nie zostało wynalezione w jednym momencie. Jest kulminacją trwającej stulecie syntezy: afrokubańskich tradycji perkusji, hiszpańsko-europejskiej formy tanecznej i amerykańskiej miejskiej teatralności, które zderzają się w trzech kolejnych epokach. Jego współczesną formę skrystalizował **Arsenio Rodríguez** w Hawanie lat 40., **tancerze z Palladium** przekształcili ją w Nowym Jorku lat 50., a **Eddie Torres** skodyfikował ją do nauczania w latach 70.",

    sec1Title: "Część 1: trzy kubańskie korzenie",
    sec1Paragraphs: [
      "Zanim Nowy Jork uznał mambo za swoje, rytmy i język ciała tego tańca zostały wykute na Kubie w starciu dwóch kultur o przeciwstawnych pomysłach na to, jak ma się ruszać.",
      "Z jednej strony była **tradycja europejska**: hiszpańskie kolonialne sale balowe, contradanza i wreszcie danzón (debiut w 1879 roku w wykonaniu Miguela Failde'a). Tańce były wyprostowane. Postawa była rygorystyczna. Nogi były względnie wyprostowane. Muzyka grała na skrzypcach, fletach i fortepianach. Tancerze stawiali stopę zdecydowanie na mocnej części taktu.",
      "Z drugiej strony była **tradycja afrokubańska**, zachowywana w *solares* (podwórkach) i robotniczych dzielnicach: rumba, w tym Guaguancó, Yambú, Columbia. Postawa była niska, kolana ugięte, środek ciężkości zakorzeniony w ziemi. Ruch żył w barkach, żebrach, biodrach. Frazowanie podkreślało pauzy między mocnymi częściami taktu i puste przestrzenie między nimi.",
      "Przez początek XX wieku te tradycje były rozdzielone klasą i rasą. Most między nimi pojawił się w latach 20. w postaci **sonu**. Pochodzący ze wschodniej prowincji Oriente, son łączył hiszpańską gitarę i lirykę z afrokubańską perkusją (bongosy, marakasy, klawes). Była to pierwsza muzyka, która jednocześnie była społecznie akceptowalna w klubach klas wyższych i autentycznie napędzana przez uliczne tradycje rytmiczne.",
    ],

    sec2Title: "Część 2: Arsenio Rodríguez i konga",
    sec2Paragraphs: [
      "W latach 30. i 40. niewidomy gitarzysta tres o nazwisku **Arsenio Rodríguez** uznał, że zespół sonu potrzebuje większej siły napędowej. Rozszerzył tradycyjne septeto do *conjunto*, dodając kilka trąbek, fortepian i (najbardziej kontrowersyjnie) kongę. Konga wcześniej była odrzucana jako zbyt „uliczna\" do formalnych zespołów. Arsenio postawił ją w samym sercu brzmienia.",
      "Rozciągnął również część **montuno** utworu — otwarty, mocno synkopowany, repetytywny vamp na końcu, w którym śpiewacy improwizowali, a tancerze mogli wreszcie się rozluźnić. Powstały tam wolny, napierający, prowadzony przez perkusję son montuno jest bezpośrednim rytmicznym przodkiem mambo.",
      "Muzycznie Arsenio narzucił afrokubańskie podejście do czasu. Fundamentalnym wzorcem tej muzyki jest **klawes**, pięciouderzeniowy szkielet, który definiuje wrażenie każdej kolejnej warstwy. Tańczona prawidłowo, muzyka prosi ciało, by zmiękczyło kolana, obniżyło środek ciężkości i opóźniło przeniesienie ciężaru tak, by krok osiadał w rytmie zamiast po nim maszerować. To właśnie to opóźnienie sprawia, że kubański ruch (ósemka bioder) dzieje się naturalnie, a nie mechanicznie.",
    ],

    sec3Title: "Część 3: Palladium Ballroom (1948-1966)",
    sec3IntroParagraphs: [
      "W 1948 roku Palladium Ballroom przy 53. ulicy i Broadwayu otworzył drzwi dla rasowo zintegrowanych wieczorów muzyki latynoskiej. W ciągu kilku lat stał się epicentrum **mambo-szaleństwa**. Trzech rezydentów-bandleaderów (Tito Puente, Tito Rodríguez i Machito) napędzało muzykę. Tancerze z Bronxu, Brooklynu i Spanish Harlem napędzali taniec.",
      "Tancerze z Palladium nie mieli akademickiego wykształcenia. Byli to portorykańscy, włoscy, żydowscy i afroamerykańscy chłopcy i dziewczęta z klasy robotniczej, bez formalnego statusu społecznego, którzy zamiast tego budowali swoją tożsamość na parkiecie. Kradli ze wszystkiego: stepowanie z Cotton Clubu, akrobatykę Lindy Hopa z Savoy Ballroom, bal-room frame ze studiów midtown Manhattanu. Wszystko to przykręcili do afrokubańskiego klawesa.",
    ],
    sec3LegendsLeadIn: "Legendy tej epoki:",
    sec3LegendsBullets: [
      "**Cuban Pete (Pedro Aguilar)**, portorykański tancerz z Bronxu z bagażem stepu i Lindy Hopa, połączył afrokubańskie zakorzenienie z amerykańskim stylem jazzowym i sprofesjonalizował mambo wystawowe.",
      "**Millie Donay**, włosko-amerykańska partnerka Cuban Pete'a, zrewolucjonizowała rolę partnerki podążającej. Przed Millie oczekiwano, że partnerki w tańcu latynoskim będą biernie podążać za prowadzącym. Ona odpowiadała mu uderzenie na uderzenie.",
      "**Killer Joe Piro**, włosko-amerykański tancerz, stał się najbardziej znanym instruktorem mambo w kraju, postacią, która ujęła chaos parkietu Palladium w kroki, które dało się sprzedać amerykańskiej klasie średniej.",
      "**Augie i Margo Rodríguez** połączyli mambo z szerokimi technikami sali balowej i przenieśli ten taniec do telewizji ogólnokrajowej w Ed Sullivan Show.",
    ],
    sec3OutroParagraphs: [
      "Z tego zderzenia wyszedł biomechaniczny podpis, który do dziś definiuje nowojorskie mambo: zakorzeniony, ugięty w kolanach dół ciała ożeniony z agresywnie wyprostowaną, zablokowaną w postawie górą. Mięśnie brzucha działają jako amortyzator między nimi. Kiedy widzisz, jak stopy światowej klasy tancerki On2 poruszają się z oślepiającą prędkością, podczas gdy jej klatka piersiowa pozostaje zupełnie nieruchoma, patrzysz na bezpośrednie dziedzictwo tej epoki.",
    ],

    sec4Title: "Część 4: Eddie Torres i kodyfikacja On2",
    sec4Paragraphs: [
      "Palladium zamknięto w 1966 roku. Do lat 70. to, co nazywano „mambo\", było rebrandowane przez przemysł płytowy jako „salsa\" — te same afrokubańskie tradycje muzyczne pod nową, marketingową etykietą.",
      "Tancerzem, który zbudował most między epoką Palladium a współczesnością, był **Eddie Torres**. Torres uczył się u Tita Puente, który osobiście powiedział mu, że łamanie na 2 jest wierniejsze klawesowi i kondze niż łamanie na 1. Torres wziął tę zasadę muzyczną i zbudował wokół niej system, którego dało się nauczać: konkretną strukturę liczenia, konkretny krok podstawowy, dydaktykę, której można się uczyć lekcja po lekcji, zamiast wchłaniać przez lata klubowej osmozy.",
      "Każdy współczesny program nauczania salsy On2, łącznie z tym, ostatecznie wywodzi się ze strukturalnej pracy Eddiego Torresa. Wyrażenie „styl nowojorski\" stało się synonimem linii Torresa. Dziś „On2\" naucza się od Nowego Jorku po Tokio, ale system, który niemal wszyscy ci nauczyciele dziedziczą, był odpowiedzią Torresa na jedno pytanie, które Tito Puente zadał mu o dwójce.",
    ],

    sec5Title: "Dlaczego ta historia ma znaczenie na parkiecie",
    sec5Intro:
      "Historia nie jest tu dekoracją. Gdy zrozumiesz, skąd przyszedł ten taniec, w sposobie, w jaki naprawdę się ruszasz, zmienią się trzy rzeczy:",
    sec5Steps: [
      "**Przestajesz walczyć z ugiętymi kolanami.** Miękkie kolana to nie wybór stylistyczny. Są biologicznie wymagane, by wykonać opóźnione przeniesienie ciężaru, które sprawia, że rytm w ogóle działa.",
      "**Przestajesz odbijać barkami.** Cicha góra ciała to nie estetyczna pretensja. To odziedziczona dyscyplina sali balowej, która sprawia, że praca stóp jest czytelna, a prowadzenie czytelne przez postawę.",
      "**Przestajesz łamać na 1.** Slap kongi spada na 2. Twój break step nie jest arbitralnym wyborem liczenia; to punkt spotkania twojego ciała z sekcją rytmiczną zespołu.",
    ],
    sec5OutroRich:
      "Taka jest teza [link]stylu On2[/link] i rdzeń programu nauczania The Mambo Guild.",

    sec6Title: "Źródła i dalsza lektura",
    sec6Sources: [
      "McMains, Juliet. *Spinning Mambo into Salsa: Caribbean Dance in Global Commerce*. Oxford University Press, 2015.",
      "Roberts, John Storm. *The Latin Tinge: The Impact of Latin American Music on the United States*. Oxford University Press, 1999.",
      "Fernandez, Raul A. *From Afro-Cuban Rhythms to Latin Jazz*. University of California Press, 2006.",
      "Manuel, Peter. *Caribbean Currents: Caribbean Music from Rumba to Reggae*. Temple University Press, 2009.",
      "Gottschild, Brenda Dixon. *Digging the Africanist Presence in American Performance*. Greenwood Press, 1996.",
    ],

    ctaEyebrow: "Głębiej",
    ctaHeading: "The Mambo Guild ma pełny 20-modułowy kurs historii.",
    ctaBody:
      "Każdy moduł śledzi jedną nić tej historii — od afrykańskich tradycji bębnowych po erę Fanii. Wszystko ze źródłami, wszystko prowadzone przez certyfikowanych badaczy tańca. Wliczone w każdą subskrypcję The Mambo Guild.",

    faqs: [
      {
        q: "Kto naprawdę wynalazł mambo?",
        a: "Nie ma jednego wynalazcy. Kubańscy bandleaderzy Arsenio Rodríguez (Hawana, lata 40.) i Pérez Prado (Meksyk, od 1948 roku) nadali tej muzyce jej fundamentalny kształt; taniec został skrystalizowany przez nowojorczyków z klasy robotniczej w Palladium Ballroom w latach 1948-1966.",
      },
      {
        q: "Czy mambo i salsa to to samo?",
        a: "Muzycznie współczesna salsa to marketingowy rebranding mambo i sąsiednich gatunków afrokubańskich, dokonany przez nowojorski przemysł płytowy na początku lat 70. Jako taniec to, co dziś naucza się jako salsę On2 (styl nowojorski), jest bezpośrednim potomkiem mambo z epoki Palladium.",
      },
      {
        q: "Co to jest klawes?",
        a: "Klawes to pięciouderzeniowy wzorzec rytmiczny rozłożony na dwóch taktach (3-2 lub 2-3), który zakotwicza całą muzykę afrokubańską. Każdy inny instrument frazuje się w stosunku do niego; jeśli tańczysz prawidłowo, twoje zmiany ciężaru również się z nim zgrywają.",
      },
      {
        q: "Dlaczego skończyła się epoka Palladium?",
        a: "Palladium Ballroom stracił koncesję na alkohol w 1966 roku i wkrótce został zamknięty. Mambo-szaleństwo zostało już zresztą wyparte w szerszej kulturze przez rock and rolla, a wewnątrz muzyki latynoskiej — przez boogaloo i wczesną erę etykiety „salsa\".",
      },
      {
        q: "Kim był Eddie Torres?",
        a: "Eddie Torres to nowojorski tancerz i choreograf, który uczył się u Tita Puente i skodyfikował to, co dziś naucza się na całym świecie jako salsa On2 / styl nowojorski. Zamienił parkietową wiedzę tancerzy z epoki Palladium w nadający się do nauczania program.",
      },
    ],
  },
  // ============================================================ NL
  nl: {
    metaTitle: "De geboorte van Mambo: van Havana tot het Palladium",
    metaDescription:
      "Hoe Mambo voortkwam uit de Cubaanse Danzón, Son en Afro-Cubaanse ritmes, werd getransformeerd door Arsenio Rodríguez en de dansers van het Palladium, en als moderne New York Style Salsa On2 werd gecodificeerd door Eddie Torres.",

    breadcrumbHome: "Home",
    breadcrumbBlog: "Blog",
    breadcrumbCurrent: "Geschiedenis van Mambo",

    badge: "Geschiedenis",
    h1Pre: "De geboorte van Mambo: ",
    h1Accent: "van Havana tot het Palladium",

    shortAnswerRich:
      "Mambo werd niet in één moment uitgevonden. Het is het hoogtepunt van een eeuwenlange synthese: Afro-Cubaanse percussietradities, Spaans-Europese dansvorm en Amerikaanse stedelijke theatraliteit die in drie opeenvolgende tijdperken botsten. De moderne vorm werd gekristalliseerd door **Arsenio Rodríguez** in het Havana van de jaren '40, getransformeerd door de **dansers van het Palladium** in het New York van de jaren '50, en gecodificeerd voor het lesgeven door **Eddie Torres** in de jaren '70.",

    sec1Title: "Deel 1: de drie Cubaanse wortels",
    sec1Paragraphs: [
      "Voordat New York Mambo als zijn eigen claim opeiste, werden de ritmes en de lichaamstaal van de dans op Cuba gesmeed in een botsing tussen twee culturen met tegengestelde ideeën over hoe te bewegen.",
      "Aan de ene kant de **Europese traditie**: Spaanse koloniale balzalen, de contradanza en uiteindelijk de Danzón (in 1879 in première gegaan door Miguel Failde). De dansen waren rechtop. De houding was strikt. De benen relatief gestrekt. De muziek werd gespeeld op violen, fluiten en piano's. Dansers stapten stevig op de telslag.",
      "Aan de andere kant de **Afro-Cubaanse traditie**, bewaard in de *solares* (binnenplaatsen) en arbeidersbuurten: Rumba, met Guaguancó, Yambú en Columbia. De houding was laag, met gebogen knieën en een geaarde zwaartepunt. Beweging leefde in de schouders, de ribben, de heupen. De frasering benadrukte de tegentellen en de lege ruimtes ertussen.",
      "Door de vroege twintigste eeuw werden deze tradities gescheiden gehouden door klasse en ras. De brug ertussen ontstond in de jaren '20 in de vorm van de **Son**. Afkomstig uit de oostelijke provincie Oriente, combineerde de Son Spaanse gitaar en lyrische structuur met Afro-Cubaanse percussie (bongo's, maraca's, clave). Het was de eerste muziek die zowel sociaal aanvaardbaar was in de clubs van de hogere klassen als authentiek werd aangedreven door de straatritmische tradities.",
    ],

    sec2Title: "Deel 2: Arsenio Rodríguez en de conga",
    sec2Paragraphs: [
      "In de jaren '30 en '40 besloot een blinde tres-gitarist genaamd **Arsenio Rodríguez** dat het Son-ensemble meer stuwkracht nodig had. Hij breidde het traditionele septeto uit tot een *conjunto*, voegde meerdere trompetten en de piano toe en (het meest controversieel) de conga. De conga was tot dan toe afgewezen als te \"straat\" voor formele ensembles. Arsenio plaatste hem in het hart van de sound.",
      "Hij rekte ook het **montuno**-deel van het nummer op: de open, sterk gesyncopeerde, repetitieve eindvamp waarin zangers improviseerden en dansers eindelijk los konden gaan. De trage, stuwende, percussiegestuwde son montuno die daaruit voortkwam, is de directe ritmische voorouder van Mambo.",
      "Wat Arsenio muzikaal afdwong, was een Afro-Cubaanse benadering van tijd. Het funderende patroon van de muziek is de **clave**, een skelet van vijf slagen dat de feel van elke volgende laag bepaalt. Goed gedanst, vraagt de muziek je lichaam om de knieën te verzachten, het zwaartepunt te verlagen en de gewichtsoverdracht te vertragen, zodat de stap zich in het ritme nestelt in plaats van eroverheen te marcheren. Die vertraging is wat de Cubaanse beweging (de acht van de heupen) op natuurlijke wijze laat ontstaan in plaats van mechanisch.",
    ],

    sec3Title: "Deel 3: het Palladium Ballroom (1948-1966)",
    sec3IntroParagraphs: [
      "In 1948 opende het Palladium Ballroom op de hoek van 53rd en Broadway zijn deuren voor raciaal geïntegreerde Latin-muzieknachten. Binnen enkele jaren was het het epicentrum van de **Mambo-rage**. Drie huisbandleiders (Tito Puente, Tito Rodríguez en Machito) dreven de muziek. Dansers uit de Bronx, Brooklyn en Spanish Harlem dreven de dans.",
      "De Palladium-dansers waren niet academisch geschoold. Het waren Puerto Ricaanse, Italiaanse, joodse en Afro-Amerikaanse jongeren uit de arbeidersklasse, zonder formele sociale status, die hun identiteit in plaats daarvan op de dansvloer opbouwden. Ze stalen overal vandaan: tap uit de Cotton Club, Lindy Hop-acrobatiek uit het Savoy Ballroom, balzaal-frame uit de studio's van midtown Manhattan. Ze schroefden het allemaal op de Afro-Cubaanse clave.",
    ],
    sec3LegendsLeadIn: "De legendes uit die tijd:",
    sec3LegendsBullets: [
      "**Cuban Pete (Pedro Aguilar)**, een Puerto Ricaanse danser uit de Bronx met een tap- en Lindy Hop-achtergrond, smolt Afro-Cubaanse aarding samen met Amerikaanse jazz-styling en professionaliseerde de Mambo-exhibitiedans.",
      "**Millie Donay**, Cuban Pete's Italiaans-Amerikaanse partner, hervormde de rol van de volger. Vóór Millie werd van volgers in de Latin-dans verwacht dat ze de leider passief volgden. Zij beantwoordde elke accent.",
      "**Killer Joe Piro**, een Italiaans-Amerikaanse danser, werd de bekendste Mambo-instructeur van het land — de figuur die de chaos van de Palladium-vloer codificeerde tot stappen die aan middenklasse-Amerika konden worden verkocht.",
      "**Augie en Margo Rodríguez** smolten Mambo samen met weidse balzaaltechnieken en brachten de dans naar nationale televisie in de Ed Sullivan Show.",
    ],
    sec3OutroParagraphs: [
      "Uit deze botsing kwam de biomechanische signatuur die de New Yorkse Mambo nog steeds definieert: een geaard, in de knieën gebogen onderlichaam, gehuwd aan een agressief rechtopstaand, in de frame vergrendeld bovenlichaam. De buikkern fungeert als schokdemper tussen de twee. Wanneer je de voeten van een wereldklasse On2-danseres in oogverblindende snelheid ziet bewegen terwijl haar borst volkomen stil blijft, kijk je naar de directe erfenis van dit tijdperk.",
    ],

    sec4Title: "Deel 4: Eddie Torres en de codificatie van On2",
    sec4Paragraphs: [
      "Het Palladium sloot in 1966. Tegen de jaren '70 werd wat \"Mambo\" had geheten door de platenindustrie hernoemd tot \"Salsa\": dezelfde Afro-Cubaanse muzikale tradities onder een nieuw, marktvriendelijker label.",
      "De danser die de brug sloeg tussen het Palladium-tijdperk en het moderne was **Eddie Torres**. Torres studeerde bij Tito Puente, die hem persoonlijk vertelde dat breken op de 2 trouwer was aan de clave en de conga dan breken op de 1. Torres nam dat muzikale principe en bouwde er een onderwijsbaar systeem omheen: een specifieke telstructuur, een specifieke basisstap, een didactiek die je les voor les kon leren in plaats van in jaren clubosmose op te nemen.",
      "Elke moderne Salsa On2-leerlijn, ook deze, is uiteindelijk te herleiden tot het structurele werk van Eddie Torres. De uitdrukking \"New York Style\" werd synoniem met de lijn van Torres. Vandaag wordt \"On2\" overal van New York tot Tokio onderwezen, maar het systeem dat bijna al die docenten erven, was Torres' antwoord op één enkele vraag die Tito Puente hem stelde over de 2.",
    ],

    sec5Title: "Waarom deze geschiedenis op de dansvloer telt",
    sec5Intro:
      "Hier is de geschiedenis geen versiering. Drie dingen veranderen aan hoe je werkelijk beweegt zodra je begrijpt waar de dans vandaan komt:",
    sec5Steps: [
      "**Je stopt met vechten tegen de gebogen knieën.** Zachte knieën zijn geen stilistische keuze. Ze zijn biologisch vereist om de vertraagde gewichtsoverdracht uit te voeren die het ritme laat werken.",
      "**Je stopt met stuiteren met de schouders.** Het stille bovenlichaam is geen esthetische affectatie. Het is de geërfde balzaaldiscipline die het voetenwerk leesbaar maakt en de leiding leesbaar via de frame.",
      "**Je stopt met breken op de 1.** De slap van de conga valt op de 2. Je break-stap is geen willekeurige telkeuze; het is de ontmoetingsplek tussen jouw lichaam en de ritmesectie van de band.",
    ],
    sec5OutroRich:
      "Dat is de stelling van [link]de On2-stijl[/link] en de kern van het Mambo Guild-curriculum.",

    sec6Title: "Bronnen en verder lezen",
    sec6Sources: [
      "McMains, Juliet. *Spinning Mambo into Salsa: Caribbean Dance in Global Commerce*. Oxford University Press, 2015.",
      "Roberts, John Storm. *The Latin Tinge: The Impact of Latin American Music on the United States*. Oxford University Press, 1999.",
      "Fernandez, Raul A. *From Afro-Cuban Rhythms to Latin Jazz*. University of California Press, 2006.",
      "Manuel, Peter. *Caribbean Currents: Caribbean Music from Rumba to Reggae*. Temple University Press, 2009.",
      "Gottschild, Brenda Dixon. *Digging the Africanist Presence in American Performance*. Greenwood Press, 1996.",
    ],

    ctaEyebrow: "Ga dieper",
    ctaHeading: "The Mambo Guild heeft een complete geschiedeniscursus van 20 modules.",
    ctaBody:
      "Elke module volgt één draad uit het verhaal, van de Afrikaanse trommeltradities tot het Fania-tijdperk. Allemaal met bronvermelding, allemaal gegeven door gecertificeerde dansacademici. Inbegrepen bij elk Mambo Guild-lidmaatschap.",

    faqs: [
      {
        q: "Wie heeft Mambo eigenlijk uitgevonden?",
        a: "Er is geen enkele uitvinder. De Cubaanse bandleiders Arsenio Rodríguez (Havana, jaren '40) en Pérez Prado (Mexico-Stad, vanaf 1948) gaven de muziek haar funderende vorm; de dans werd gekristalliseerd door arbeidersklasse-New Yorkers in het Palladium Ballroom tussen 1948 en 1966.",
      },
      {
        q: "Zijn Mambo en Salsa hetzelfde?",
        a: "Muzikaal is moderne Salsa een commerciële herbranding van Mambo en aangrenzende Afro-Cubaanse genres, gemaakt door de New Yorkse platenindustrie aan het begin van de jaren '70. Als dans is wat tegenwoordig wordt onderwezen als Salsa On2 (New York Style) de directe afstammeling van de Mambo uit het Palladium-tijdperk.",
      },
      {
        q: "Wat is de clave?",
        a: "De clave is een ritmisch patroon van vijf slagen verspreid over twee maten (3-2 of 2-3) dat alle Afro-Cubaanse muziek verankert. Elk ander instrument wordt ten opzichte van haar gefraseerd; goed gedanst stemmen ook jouw gewichtsverplaatsingen zich op haar af.",
      },
      {
        q: "Waarom eindigde het Palladium-tijdperk?",
        a: "Het Palladium Ballroom verloor in 1966 zijn drankvergunning en sloot kort daarna. De Mambo-rage was bovendien in de bredere cultuur al verdrongen door rock-'n-roll en, binnen de Latin-muziek, door Boogaloo en het vroege \"Salsa\"-labeltijdperk.",
      },
      {
        q: "Wie was Eddie Torres?",
        a: "Eddie Torres is een New Yorkse danser en choreograaf die studeerde bij Tito Puente en codificeerde wat tegenwoordig wereldwijd wordt onderwezen als Salsa On2 / New York Style. Hij maakte van de vloerkennis van de Palladium-dansers een onderwijsbaar curriculum.",
      },
    ],
  },
  // ============================================================ AR
  ar: {
    metaTitle: "ميلاد المامبو: من هافانا إلى البلاديوم",
    metaDescription:
      "كيف نشأ المامبو من الدانزون الكوبي والـ«سون» والإيقاعات الأفروكوبية، وكيف حوّله أرسينيو رودريغيز وراقصو البلاديوم، ثم قنّنه إيدي توريس بصيغته الحديثة كسالسا أون 2 على الطريقة النيويوركية.",

    breadcrumbHome: "الرئيسية",
    breadcrumbBlog: "المدونة",
    breadcrumbCurrent: "تاريخ المامبو",

    badge: "تاريخ",
    h1Pre: "ميلاد المامبو: ",
    h1Accent: "من هافانا إلى البلاديوم",

    shortAnswerRich:
      "لم يُختَرع المامبو في لحظة واحدة. هو ذروة تركيبٍ امتد قرنًا من الزمن: تقاليد الإيقاع الأفروكوبية، والشكل الإسباني-الأوروبي للرقص، والمسرحية الحضرية الأمريكية، تتصادم في ثلاث حقب متعاقبة. صورته الحديثة بلورها **أرسينيو رودريغيز** في هافانا الأربعينيات، ثم حوّلها **راقصو البلاديوم** في نيويورك الخمسينيات، وقنّنها للتدريس **إيدي توريس** في السبعينيات.",

    sec1Title: "الجزء 1: الجذور الكوبية الثلاثة",
    sec1Paragraphs: [
      "قبل أن تنسب نيويورك المامبو لنفسها، صُقلت إيقاعات هذا الرقص ولغة جسده في كوبا في تصادم ثقافتين تتعاكسان في فهم كيفية الحركة.",
      "في جانب، **التقليد الأوروبي**: قاعات الرقص الكولونيالية الإسبانية، والكونترادانزا، ثم الدانزون (الذي قدّمه ميغيل فايلده لأول مرة عام 1879). كانت الرقصات منتصبة. كان القوام صارمًا. الساقان مستقيمتان نسبيًا. وكانت الموسيقى تُعزف على الكمان والفلوت والبيانو. وكان الراقصون يدوسون بثبات على النغمة القوية.",
      "وفي الجانب الآخر، **التقليد الأفروكوبي**، المحفوظ في الـ*solares* (الأفنية) والأحياء العمالية: الرومبا، ومنها الغواغوانكو واليامبو والكولومبيا. كان الوضع منخفضًا، الركبتان مثنيتان، ومركز الثقل مزروع في الأرض. كانت الحركة تعيش في الأكتاف والأضلاع والأرداف. وكان البناء الإيقاعي يبرز ضربات الـ«off-beat» والفراغات بينها.",
      "خلال أوائل القرن العشرين، ظلت هاتان التقليدتان منفصلتين بفعل الطبقة والعرق. ظهر الجسر بينهما في العشرينيات في صورة الـ**سون**. نشأ السون في إقليم أورينتي شرقي الجزيرة، وجمع الغيتار الإسباني والبنية الغنائية الإسبانية مع الإيقاع الأفروكوبي (البونغو والماراكاس والكلافي). كان أول موسيقى مقبولة اجتماعيًا في نوادي الطبقة العليا، ومدفوعة في الوقت ذاته بصدق من تقاليد إيقاع الشارع.",
    ],

    sec2Title: "الجزء 2: أرسينيو رودريغيز والكونغا",
    sec2Paragraphs: [
      "في الثلاثينيات والأربعينيات، قرر عازف التريس الكفيف **أرسينيو رودريغيز** أن أنسامبل الـ«سون» يحتاج إلى دفع أقوى. وسّع السبتيتو التقليدي إلى *كونخونتو*، فأضاف عدة أبواق، والبيانو، و(وهو الأكثر إثارة للجدل) الكونغا. كانت الكونغا مرفوضة قبل ذلك بوصفها «شارعية» أكثر من اللازم على الأنسامبلات الرسمية. وضعها أرسينيو في قلب الصوت.",
      "كذلك مدّ مقطع الـ**مونتونو** في الأغنية: تلك الفقرة الختامية المفتوحة شديدة التضاد الإيقاعي والمتكررة، حيث يرتجل المغنون ويُطلق الراقصون أنفسهم أخيرًا. الـ«سون مونتونو» البطيء الدافع المتمحور حول الإيقاع الذي خرج من هناك هو السلف الإيقاعي المباشر للمامبو.",
      "ما فرضه أرسينيو موسيقيًا كان مقاربة أفروكوبية للزمن. النمط المؤسس لهذه الموسيقى هو **الكلافي**، هيكل من خمس ضربات يحدد إحساس كل طبقة فوقه. عند الرقص الصحيح، تطلب الموسيقى من الجسد أن يلين الركبتين، ويخفض مركز الثقل، ويؤجّل نقل الوزن، حتى تستقرّ الخطوة في الإيقاع بدلاً من أن تسير فوقه. هذا التأخير هو ما يجعل الحركة الكوبية (شكل الرقم 8 بالأرداف) تحدث بشكل طبيعي بدلاً من ميكانيكي.",
    ],

    sec3Title: "الجزء 3: قاعة البلاديوم (1948-1966)",
    sec3IntroParagraphs: [
      "في عام 1948، فتحت قاعة البلاديوم على ناصية الشارع الـ53 وبرودواي أبوابها لأمسيات موسيقى لاتينية مختلطة عرقيًا. وفي غضون سنوات قليلة، صارت بؤرة **حُمّى المامبو**. ثلاثة قادة فرق مقيمين (تيتو بوينتي وتيتو رودريغيز وماتشيتو) كانوا يدفعون الموسيقى. وراقصون من برونكس وبروكلين وسبانيش هارلم كانوا يدفعون الرقص.",
      "لم يكن راقصو البلاديوم متخرجين من معاهد. كانوا شبابًا من الطبقة العاملة من أصول بورتوريكية وإيطالية ويهودية وأمريكية أفريقية، بلا مكانة اجتماعية رسمية، فبنوا هويتهم على أرضية الرقص بدلاً من ذلك. سرقوا من كل شيء: التابدانس من الكوتون كلوب، وحركات الـ«ليندي هوب» الأكروباتية من قاعة الـ«سافوي»، وقوام قاعات الرقص من استوديوهات وسط مانهاتن. ثم ثبّتوا كل ذلك على الكلافي الأفروكوبي.",
    ],
    sec3LegendsLeadIn: "أساطير ذلك العصر:",
    sec3LegendsBullets: [
      "**كيوبان بيت (بيدرو أغيلار)**، راقص بورتوريكي من برونكس بخلفية تابدانس وليندي هوب، مزج الجذور الأفروكوبية بالأسلوب الأمريكي للجاز، وأكسب مامبو العرض طابعه المهني.",
      "**ميلي دوناي**، شريكة كيوبان بيت من أصل إيطالي أمريكي، أحدثت ثورة في دور الراقصة المتابِعة. قبل ميلي، كان يُتوقع من المتابِعات في الرقص اللاتيني أن يتبعن القائد بشكل سلبي. لكنها كانت ترد عليه ضربةً بضربة.",
      "**كيلر جو بيرو**، راقص إيطالي أمريكي، صار أشهر مدرّسي المامبو في البلاد، الشخصيةَ التي قنّنت فوضى أرضية البلاديوم في خطوات يمكن بيعها للطبقة الوسطى الأمريكية.",
      "**أوغي ومارغو رودريغيز** مزجا المامبو بتقنيات قاعة الرقص الواسعة، وأخذا الرقص إلى التلفزيون الوطني في برنامج إد سوليفان شو.",
    ],
    sec3OutroParagraphs: [
      "من ذلك التصادم خرجت البصمة البيوميكانيكية التي لا تزال تحدّد المامبو النيويوركي: نصف سفلي مزروع وركبتاه مثنيتان، متزوّج من نصف علوي منتصب بحدّة وقوام مقفل. وتعمل عضلات البطن مركزًا ماصًّا للصدمات بين الاثنين. حين ترى قدمَي راقصة أون 2 من الطراز العالمي تتحرّكان بسرعة مذهلة بينما يبقى صدرها ثابتًا تمامًا، فأنت تشاهد الإرث المباشر لذلك العصر.",
    ],

    sec4Title: "الجزء 4: إيدي توريس وتقنين أون 2",
    sec4Paragraphs: [
      "أُغلقت البلاديوم عام 1966. وبحلول السبعينيات، كانت صناعة الأسطوانات تعيد تسمية ما كان يُدعى «مامبو» بـ«السالسا»: نفس التقاليد الموسيقية الأفروكوبية تحت لافتة جديدة وأقرب إلى السوق.",
      "الراقص الذي وصل بين عصر البلاديوم والعصر الحديث هو **إيدي توريس**. درس توريس على يد تيتو بوينتي، الذي قال له شخصيًا إن الكسر على الـ2 أصدق للكلافي والكونغا من الكسر على الـ1. أخذ توريس هذا المبدأ الموسيقي وبنى حوله نظامًا قابلاً للتدريس: بنية عدّ محددة، وخطوة أساسية محددة، ومنهجية يمكن تعلّمها درسًا بعد درس بدلاً من امتصاصها بسنوات من التشرّب في النوادي.",
      "كل منهج حديث للسالسا أون 2، بما في ذلك هذا، يعود في النهاية إلى عمل إيدي توريس البنيوي. وصارت عبارة «الطريقة النيويوركية» مرادفة لخط توريس. اليوم يُدرَّس «أون 2» من نيويورك إلى طوكيو، لكن النظام الذي يرثه تقريبًا كل أولئك المعلمين كان جواب توريس على سؤال واحد طرحه عليه تيتو بوينتي عن الـ2.",
    ],

    sec5Title: "لماذا يهمّ هذا التاريخ على أرضية الرقص",
    sec5Intro:
      "التاريخ هنا ليس زينة. ثلاثة أمور تتغير في طريقة تحرّكك فعلًا حين تدرك من أين جاء هذا الرقص:",
    sec5Steps: [
      "**تتوقّف عن مقاومة الركبتين المثنيتين.** الركبتان الليّنتان ليستا اختيارًا أسلوبيًا. هما ضرورة بيولوجية لتنفيذ نقل الوزن المؤجَّل الذي يجعل الإيقاع يعمل.",
      "**تتوقف عن نطّ الكتفين.** هدوء النصف العلوي ليس تصنّعًا جماليًا، بل انضباط قاعات الرقص الموروث، الذي يجعل عمل القدمين قابلاً للقراءة، ويجعل القيادة قابلة للقراءة عبر القوام.",
      "**تتوقف عن الكسر على الـ1.** صفعة الكونغا تقع على الـ2. خطوة الكسر عندك ليست اختيار عدٍّ اعتباطيًا؛ بل نقطة لقاء بين جسدك والقسم الإيقاعي للفرقة.",
    ],
    sec5OutroRich:
      "هذه هي أطروحة [link]أسلوب أون 2[/link] وجوهر منهج The Mambo Guild.",

    sec6Title: "المصادر وقراءات إضافية",
    sec6Sources: [
      "McMains, Juliet. *Spinning Mambo into Salsa: Caribbean Dance in Global Commerce*. Oxford University Press, 2015.",
      "Roberts, John Storm. *The Latin Tinge: The Impact of Latin American Music on the United States*. Oxford University Press, 1999.",
      "Fernandez, Raul A. *From Afro-Cuban Rhythms to Latin Jazz*. University of California Press, 2006.",
      "Manuel, Peter. *Caribbean Currents: Caribbean Music from Rumba to Reggae*. Temple University Press, 2009.",
      "Gottschild, Brenda Dixon. *Digging the Africanist Presence in American Performance*. Greenwood Press, 1996.",
    ],

    ctaEyebrow: "تعمّق أكثر",
    ctaHeading: "تقدّم The Mambo Guild كورس تاريخ كاملًا من 20 وحدة.",
    ctaBody:
      "كل وحدة تتتبّع خيطًا من القصة، من تقاليد الطبل الأفريقية حتى عصر فانيا. كل شيء بمصادر موثّقة، وكلّه بإشراف باحثين معتمدين في الرقص. متاحة ضمن كل اشتراك في The Mambo Guild.",

    faqs: [
      {
        q: "من اخترع المامبو فعلاً؟",
        a: "لا يوجد مخترع واحد. قائدا الفِرق الكوبيان أرسينيو رودريغيز (هافانا، الأربعينيات) وبيريز برادو (مكسيكو سيتي، اعتبارًا من 1948) أعطيا الموسيقى شكلها التأسيسي؛ والرقص بلوره أبناء الطبقة العاملة في نيويورك في قاعة البلاديوم بين 1948 و1966.",
      },
      {
        q: "هل المامبو والسالسا الشيء نفسه؟",
        a: "موسيقيًا، السالسا الحديثة هي إعادة تغليف تسويقية للمامبو والأنواع الأفروكوبية المجاورة، أنجزتها صناعة الأسطوانات في نيويورك في مطلع السبعينيات. وكرقص، فإن ما يُدرَّس اليوم باسم سالسا أون 2 (الطريقة النيويوركية) هو السليل المباشر لمامبو حقبة البلاديوم.",
      },
      {
        q: "ما هو الكلافي؟",
        a: "الكلافي نمط إيقاعي من خمس ضربات يمتد على مازورتين (3-2 أو 2-3) ويرسي كل الموسيقى الأفروكوبية. كل آلة أخرى تُصاغ إيقاعيًا بالنسبة إليه؛ وعند الرقص الصحيح، تتوافق نقلات وزنك أنت أيضًا معه.",
      },
      {
        q: "لماذا انتهت حقبة البلاديوم؟",
        a: "خسرت قاعة البلاديوم رخصة بيع الكحول عام 1966 وأُغلقت بعد ذلك بقليل. كما كانت حُمّى المامبو قد أُزيحت بالفعل في الثقافة العامة على يد الروك أند رول، وداخل الموسيقى اللاتينية على يد البوغالو والمرحلة المبكرة من تسمية «السالسا».",
      },
      {
        q: "من هو إيدي توريس؟",
        a: "إيدي توريس راقص ومصمم رقص نيويوركي درس على يد تيتو بوينتي، وقنّن ما يُدرَّس اليوم في العالم باسم سالسا أون 2 / الطريقة النيويوركية. حوّل المعرفة الميدانية لراقصي حقبة البلاديوم إلى منهج قابل للتدريس.",
      },
    ],
  },
  // ============================================================ EL
  el: {
    metaTitle: "Η γέννηση του Mambo: από την Αβάνα στο Palladium",
    metaDescription:
      "Πώς το Mambo αναδύθηκε από το κουβανικό Danzón, τον Son και τον αφροκουβανικό ρυθμό, μεταμορφώθηκε από τον Arsenio Rodríguez και τους χορευτές του Palladium και κωδικοποιήθηκε ως σύγχρονη Salsa On2 New York Style από τον Eddie Torres.",

    breadcrumbHome: "Αρχική",
    breadcrumbBlog: "Blog",
    breadcrumbCurrent: "Ιστορία του Mambo",

    badge: "Ιστορία",
    h1Pre: "Η γέννηση του Mambo: ",
    h1Accent: "από την Αβάνα στο Palladium",

    shortAnswerRich:
      "Το Mambo δεν εφευρέθηκε σε μία στιγμή. Είναι η κορύφωση μιας σύνθεσης που κράτησε έναν αιώνα: αφροκουβανικές παραδόσεις κρουστών, ισπανο-ευρωπαϊκή χορευτική φόρμα και αμερικανική αστική θεατρικότητα να συγκρούονται σε τρεις διαδοχικές εποχές. Η σύγχρονη μορφή του κρυσταλλώθηκε από τον **Arsenio Rodríguez** στην Αβάνα της δεκαετίας του '40, μεταμορφώθηκε από τους **χορευτές του Palladium** στη Νέα Υόρκη της δεκαετίας του '50 και κωδικοποιήθηκε για διδασκαλία από τον **Eddie Torres** στη δεκαετία του '70.",

    sec1Title: "Μέρος 1: οι τρεις κουβανικές ρίζες",
    sec1Paragraphs: [
      "Πριν η Νέα Υόρκη διεκδικήσει το Mambo ως δικό της, οι ρυθμοί και η σωματική γλώσσα του χορού σφυρηλατήθηκαν στην Κούβα μέσα από τη σύγκρουση δύο πολιτισμών με αντίθετες ιδέες για το πώς πρέπει να κινείται το σώμα.",
      "Από τη μία, η **ευρωπαϊκή παράδοση**: ισπανικές αποικιοκρατικές αίθουσες χορού, η contradanza και τελικά το Danzón (πρεμιέρα το 1879 από τον Miguel Failde). Οι χοροί ήταν όρθιοι. Το πλαίσιο αυστηρό. Τα πόδια σχετικά τεντωμένα. Η μουσική παιζόταν με βιολιά, φλάουτα και πιάνα. Οι χορευτές πατούσαν αποφασιστικά στο ισχυρό μέρος του μέτρου.",
      "Από την άλλη, η **αφροκουβανική παράδοση**, που διατηρήθηκε στα *solares* (αυλές) και στις γειτονιές της εργατικής τάξης: Rumba, και μέσα της Guaguancó, Yambú, Columbia. Η στάση ήταν χαμηλή, με λυγισμένα γόνατα και κέντρο βάρους ριζωμένο στο έδαφος. Η κίνηση ζούσε στους ώμους, στα πλευρά, στους γοφούς. Η φραστική έδινε έμφαση στα off-beats και στους κενούς χώρους ανάμεσά τους.",
      "Στις πρώτες δεκαετίες του 20ού αιώνα, αυτές οι παραδόσεις παρέμειναν χωρισμένες από την τάξη και τη φυλή. Η γέφυρα ανάμεσά τους εμφανίστηκε στη δεκαετία του '20 με τη μορφή του **Son**. Με καταγωγή από την ανατολική επαρχία Oriente, ο Son συνδύασε την ισπανική κιθάρα και τη στιχουργική δομή με την αφροκουβανική κρουστή (μπόνγκος, μαράκες, clave). Ήταν η πρώτη μουσική που ήταν ταυτόχρονα κοινωνικά αποδεκτή στα κλαμπ των ανώτερων τάξεων και αυθεντικά οδηγημένη από τις ρυθμικές παραδόσεις του δρόμου.",
    ],

    sec2Title: "Μέρος 2: ο Arsenio Rodríguez και η conga",
    sec2Paragraphs: [
      "Στις δεκαετίες του '30 και του '40, ένας τυφλός παίκτης tres ονόματι **Arsenio Rodríguez** αποφάσισε ότι το ensemble του Son χρειαζόταν περισσότερη ώθηση. Επέκτεινε το παραδοσιακό septeto σε ένα *conjunto*, προσθέτοντας πολλά τρομπόνια και πιάνο, και (το πιο αμφιλεγόμενο) την conga. Η conga είχε απορριφθεί μέχρι τότε ως υπερβολικά «του δρόμου» για επίσημα ensembles. Ο Arsenio την έβαλε στην καρδιά του ήχου.",
      "Επεξέτεινε επίσης το τμήμα **montuno** του τραγουδιού: εκείνο το ανοιχτό, έντονα συγκοπικό, επαναλαμβανόμενο vamp στο τέλος, όπου οι τραγουδιστές αυτοσχεδίαζαν και οι χορευτές μπορούσαν επιτέλους να ξεσπάσουν. Το αργό, πιεστικό, κρουστά-οδηγούμενο son montuno που προέκυψε είναι ο άμεσος ρυθμικός πρόγονος του Mambo.",
      "Αυτό που ο Arsenio επέβαλε μουσικά ήταν μια αφροκουβανική προσέγγιση του χρόνου. Το θεμελιώδες μοτίβο της μουσικής είναι η **clave**, ένας σκελετός πέντε χτυπημάτων που καθορίζει την αίσθηση κάθε επόμενης στρώσης. Όταν χορεύεται σωστά, η μουσική ζητάει από το σώμα να χαλαρώσει τα γόνατα, να χαμηλώσει το κέντρο βάρους και να καθυστερήσει τη μεταφορά βάρους, ώστε το βήμα να κάθεται μέσα στον ρυθμό αντί να βαδίζει από πάνω του. Αυτή η καθυστέρηση είναι που κάνει την κουβανική κίνηση (το οχτάρι των γοφών) να συμβαίνει φυσικά αντί για μηχανικά.",
    ],

    sec3Title: "Μέρος 3: το Palladium Ballroom (1948-1966)",
    sec3IntroParagraphs: [
      "Το 1948, το Palladium Ballroom στη γωνία της 53ης Οδού και του Broadway άνοιξε τις πόρτες του σε φυλετικά μικτές βραδιές λάτιν μουσικής. Μέσα σε λίγα χρόνια ήταν το επίκεντρο της **Mambo Craze**. Τρεις σταθεροί αρχηγοί ορχήστρας (Tito Puente, Tito Rodríguez και Machito) τραβούσαν τη μουσική. Χορευτές από το Bronx, το Brooklyn και το Spanish Harlem τραβούσαν τον χορό.",
      "Οι χορευτές του Palladium δεν είχαν ακαδημαϊκή εκπαίδευση. Ήταν πορτορικανά, ιταλικά, εβραϊκά και αφροαμερικανικά παιδιά της εργατικής τάξης χωρίς επίσημο κοινωνικό κύρος, που έχτιζαν την ταυτότητά τους πάνω στην πίστα του χορού. Έκλεβαν από τα πάντα: tap από το Cotton Club, ακροβατικά Lindy Hop από το Savoy Ballroom, στάση αίθουσας χορού από τα στούντιο του midtown Manhattan. Τα βίδωσαν όλα πάνω στην αφροκουβανική clave.",
    ],
    sec3LegendsLeadIn: "Οι θρύλοι της εποχής:",
    sec3LegendsBullets: [
      "**Cuban Pete (Pedro Aguilar)**, πορτορικάνος χορευτής από το Bronx με υπόβαθρο σε tap και Lindy Hop, συγχώνευσε την αφροκουβανική γείωση με το αμερικανικό jazz styling και επαγγελματοποίησε το Mambo επίδειξης.",
      "**Millie Donay**, η ιταλοαμερικανίδα παρτενέρ του Cuban Pete, έκανε επανάσταση στον ρόλο της follower. Πριν από τη Millie, οι followers στους λατινοαμερικανικούς χορούς αναμενόταν να ακολουθούν παθητικά τον leader. Εκείνη του απαντούσε ξύλο με ξύλο.",
      "**Killer Joe Piro**, ιταλοαμερικάνος χορευτής, έγινε ο πιο διάσημος δάσκαλος Mambo στη χώρα — η μορφή που κωδικοποίησε το χάος της πίστας του Palladium σε βήματα που μπορούσαν να πουληθούν στη μεσαία τάξη της Αμερικής.",
      "**Augie και Margo Rodríguez** συγχώνευσαν το Mambo με σαρωτικές τεχνικές αίθουσας χορού και πήγαν τον χορό στην εθνική τηλεόραση στο Ed Sullivan Show.",
    ],
    sec3OutroParagraphs: [
      "Από αυτή τη σύγκρουση βγήκε η βιομηχανική υπογραφή που ορίζει ακόμη το Mambo της Νέας Υόρκης: ένα γειωμένο, με λυγισμένα γόνατα κάτω σώμα, παντρεμένο με ένα επιθετικά όρθιο, κλειδωμένο στο πλαίσιο πάνω σώμα. Ο κορμός των κοιλιακών δουλεύει ως αμορτισέρ ανάμεσά τους. Όταν βλέπεις τα πόδια μιας χορεύτριας On2 παγκόσμιας κλάσης να κινούνται με εκτυφλωτική ταχύτητα ενώ ο θώρακάς της μένει εντελώς ακίνητος, βλέπεις την άμεση κληρονομιά αυτής της εποχής.",
    ],

    sec4Title: "Μέρος 4: ο Eddie Torres και η κωδικοποίηση του On2",
    sec4Paragraphs: [
      "Το Palladium έκλεισε το 1966. Μέχρι τη δεκαετία του '70, αυτό που λεγόταν «Mambo» μετονομαζόταν από τη βιομηχανία της δισκογραφίας σε «Salsa»: οι ίδιες αφροκουβανικές μουσικές παραδόσεις κάτω από μια νέα, εμπορικά πιο φιλική ετικέτα.",
      "Ο χορευτής που γεφύρωσε την εποχή του Palladium και τη σύγχρονη ήταν ο **Eddie Torres**. Ο Torres σπούδασε με τον Tito Puente, ο οποίος του είπε προσωπικά ότι το να σπας στο 2 ήταν πιο πιστό στην clave και στην conga από το να σπας στο 1. Ο Torres πήρε αυτή τη μουσική αρχή και έχτισε γύρω της ένα διδάξιμο σύστημα: συγκεκριμένη δομή μετρήματος, συγκεκριμένο βασικό βήμα, μια παιδαγωγική που μπορούσε να μαθευτεί μάθημα μάθημα αντί να απορροφάται με χρόνια κλαμπικής όσμωσης.",
      "Κάθε σύγχρονο πρόγραμμα Salsa On2, μαζί και αυτό εδώ, ανάγεται τελικά στη δομική δουλειά του Eddie Torres. Η έκφραση «New York Style» έγινε συνώνυμη με τη γενεαλογία του Torres. Σήμερα το «On2» διδάσκεται από τη Νέα Υόρκη μέχρι το Τόκιο, αλλά το σύστημα που σχεδόν όλοι αυτοί οι δάσκαλοι κληρονομούν ήταν η απάντηση του Torres σε μία και μόνη ερώτηση που του έθεσε ο Tito Puente για το 2.",
    ],

    sec5Title: "Γιατί αυτή η ιστορία μετράει στην πίστα",
    sec5Intro:
      "Εδώ η ιστορία δεν είναι διακόσμηση. Τρία πράγματα αλλάζουν στον τρόπο που πραγματικά κινείσαι, μόλις καταλάβεις από πού ήρθε ο χορός:",
    sec5Steps: [
      "**Σταματάς να παλεύεις τα λυγισμένα γόνατα.** Τα μαλακά γόνατα δεν είναι στιλιστική επιλογή. Είναι βιολογικά απαραίτητα για να εκτελέσεις την καθυστερημένη μεταφορά βάρους που κάνει τον ρυθμό να δουλεύει.",
      "**Σταματάς να κουνάς τους ώμους.** Το ήσυχο πάνω σώμα δεν είναι αισθητική επιτήδευση. Είναι η κληρονομημένη πειθαρχία της αίθουσας χορού που κάνει το παιχνίδι των ποδιών αναγνώσιμο και την οδήγηση αναγνώσιμη μέσα από το πλαίσιο.",
      "**Σταματάς να σπας στο 1.** Το slap της conga πέφτει στο 2. Το break-βήμα σου δεν είναι αυθαίρετη επιλογή μετρήματος, είναι ένα σημείο συνάντησης ανάμεσα στο σώμα σου και τη ρυθμική σεξιόν της μπάντας.",
    ],
    sec5OutroRich:
      "Αυτή είναι η θέση του [link]στιλ On2[/link] και ο πυρήνας του προγράμματος του The Mambo Guild.",

    sec6Title: "Πηγές και περαιτέρω ανάγνωση",
    sec6Sources: [
      "McMains, Juliet. *Spinning Mambo into Salsa: Caribbean Dance in Global Commerce*. Oxford University Press, 2015.",
      "Roberts, John Storm. *The Latin Tinge: The Impact of Latin American Music on the United States*. Oxford University Press, 1999.",
      "Fernandez, Raul A. *From Afro-Cuban Rhythms to Latin Jazz*. University of California Press, 2006.",
      "Manuel, Peter. *Caribbean Currents: Caribbean Music from Rumba to Reggae*. Temple University Press, 2009.",
      "Gottschild, Brenda Dixon. *Digging the Africanist Presence in American Performance*. Greenwood Press, 1996.",
    ],

    ctaEyebrow: "Πήγαινε πιο βαθιά",
    ctaHeading: "Το The Mambo Guild έχει πλήρες μάθημα ιστορίας 20 ενοτήτων.",
    ctaBody:
      "Κάθε ενότητα ακολουθεί ένα νήμα της ιστορίας, από τις αφρικανικές παραδόσεις των κρουστών μέχρι την εποχή της Fania. Όλα με πηγές, όλα διδαγμένα από πιστοποιημένους ακαδημαϊκούς του χορού. Περιλαμβάνεται σε κάθε συνδρομή του The Mambo Guild.",

    faqs: [
      {
        q: "Ποιος εφηύρε στ' αλήθεια το Mambo;",
        a: "Δεν υπάρχει μοναδικός εφευρέτης. Οι κουβανοί αρχηγοί ορχήστρας Arsenio Rodríguez (Αβάνα, δεκαετία '40) και Pérez Prado (Πόλη του Μεξικού, από το 1948 και μετά) έδωσαν στη μουσική τη θεμελιώδη μορφή της· ο χορός κρυσταλλώθηκε από νεοϋορκέζους της εργατικής τάξης στο Palladium Ballroom μεταξύ 1948 και 1966.",
      },
      {
        q: "Είναι το Mambo και η Salsa το ίδιο πράγμα;",
        a: "Μουσικά, η σύγχρονη Salsa είναι μια εμπορική αναβάπτιση του Mambo και των γειτονικών αφροκουβανικών ειδών, που έγινε από τη δισκογραφική βιομηχανία της Νέας Υόρκης στις αρχές της δεκαετίας του '70. Ως χορός, αυτό που σήμερα διδάσκεται ως Salsa On2 (New York Style) είναι ο άμεσος απόγονος του Mambo της εποχής του Palladium.",
      },
      {
        q: "Τι είναι η clave;",
        a: "Η clave είναι ένα ρυθμικό μοτίβο πέντε χτυπημάτων κατανεμημένο σε δύο μέτρα (3-2 ή 2-3) που αγκυροβολεί όλη την αφροκουβανική μουσική. Κάθε άλλο όργανο φράζεται σε σχέση με αυτήν· όταν χορεύεται σωστά, οι μεταφορές βάρους σου ευθυγραμμίζονται και αυτές με αυτήν.",
      },
      {
        q: "Γιατί τελείωσε η εποχή του Palladium;",
        a: "Το Palladium Ballroom έχασε την άδεια αλκοόλ το 1966 και έκλεισε λίγο αργότερα. Η Mambo Craze είχε εξάλλου ήδη εκτοπιστεί στην ευρύτερη κουλτούρα από το rock and roll και, εντός της λάτιν μουσικής, από το Boogaloo και την πρώιμη εποχή της ετικέτας «Salsa».",
      },
      {
        q: "Ποιος ήταν ο Eddie Torres;",
        a: "Ο Eddie Torres είναι νεοϋορκέζος χορευτής και χορογράφος που σπούδασε με τον Tito Puente και κωδικοποίησε αυτό που σήμερα διδάσκεται παγκοσμίως ως Salsa On2 / New York Style. Μετέτρεψε τη γνώση πίστας των χορευτών της εποχής του Palladium σε διδάξιμο πρόγραμμα.",
      },
    ],
  },
  // ============================================================ SR
  sr: {
    metaTitle: "Рођење мамба: од Хаване до Палладијума",
    metaDescription:
      "Како је мамбо настао из кубанског Дансона, Сона и афрокубанског ритма, како су га преобразили Арсенио Родригез и плесачи Палладијума и како га је Еди Торес кодификовао као модерну њујоршку салсу On2.",

    breadcrumbHome: "Почетна",
    breadcrumbBlog: "Блог",
    breadcrumbCurrent: "Историја мамба",

    badge: "Историја",
    h1Pre: "Рођење мамба: ",
    h1Accent: "од Хаване до Палладијума",

    shortAnswerRich:
      "Мамбо није измишљен у једном тренутку. То је врхунац вековне синтезе: афрокубанске традиције удараљки, шпанско-европске плесне форме и америчке урбане позоришности који се сударају у три узастопне епохе. Његову модерну форму искристалисао је **Арсенио Родригез** у Хавани четрдесетих, преобразили **плесачи Палладијума** у Њујорку педесетих, а кодификовао је за подучавање **Еди Торес** седамдесетих.",

    sec1Title: "Део 1: три кубанска корена",
    sec1Paragraphs: [
      "Пре него што је Њујорк прогласио мамбо својим, ритмови и говор тела овог плеса искован је на Куби у судару две културе са супротним идејама о томе како се треба кретати.",
      "С једне стране, **европска традиција**: шпанске колонијалне дворане, контраданца и на крају Дансон (премијерно изведен 1879. од стране Мигела Фаилдеа). Плесови су били усправни. Држање строго. Ноге релативно равне. Музика је свирана на виолинама, флаутама и клавирима. Плесачи су чврсто ступали на наглашену добу.",
      "С друге стране, **афрокубанска традиција**, очувана у *солареима* (двориштима) и радничким крајевима: Румба, укључујући Гуагуанко, Јамбу, Колумбију. Држање је било ниско, са савијеним коленима и тежиштем укотвљеним у тлу. Кретање је живело у раменима, у ребрима, у куковима. Фразирање је наглашавало нагласке „ван добе” и празне просторе између њих.",
      "Током раног двадесетог века ове традиције су биле раздвојене класом и расом. Мост између њих појавио се двадесетих година у виду **Сона**. Пореклом из источне провинције Оријенте, Сон је спојио шпанску гитару и текстуалну структуру са афрокубанском перкусијом (бонгои, мараке, клаве). Била је то прва музика која је била и друштвено прихватљива у клубовима виших класа и аутентично вођена уличним ритмичким традицијама.",
    ],

    sec2Title: "Део 2: Арсенио Родригез и конга",
    sec2Paragraphs: [
      "Тридесетих и четрдесетих година, слепи свирач трес-гитаре по имену **Арсенио Родригез** одлучио је да Сон-ансамблу треба више погона. Проширио је традиционални септето у *конхунто*, додавши више трубе, клавир и (најконтроверзније) конгу. Конга је дотад била одбацивана као превише „улична” за формалне ансамбле. Арсенио ју је ставио у само срце звука.",
      "Такође је развукао **монтуно** одсек песме: онај отворени, снажно синкопирани, репетитивни вамп на крају у којем певачи импровизују и плесачи најзад могу да се распусте. Спори, потискујући, перкусионо-вођен сон монтуно који је одатле израстао директан је ритмички предак мамба.",
      "Оно што је Арсенио музички наметнуо био је афрокубански однос према времену. Темељни образац ове музике је **клаве**, костур од пет удараца који одређује осећај сваког следећег слоја. Када се плеше исправно, музика од тела тражи да омекша колена, спусти тежиште и одложи пренос тежине, тако да се корак спусти у ритам уместо да маршира преко њега. Управо то одлагање чини да се кубанско кретање (осмица куковима) дешава природно, а не механички.",
    ],

    sec3Title: "Део 3: Палладијумова дворана (1948-1966)",
    sec3IntroParagraphs: [
      "Године 1948. Палладијумова дворана на углу 53. улице и Бродвеја отворила је врата расно интегрисаним вечерима латиноамеричке музике. За неколико година постала је епицентар **мамбо помаме**. Три кућна вођа оркестара (Тито Пуенте, Тито Родригез и Мачито) гурали су музику. Плесачи из Бронкса, Бруклина и Спанског Харлема гурали су плес.",
      "Палладијумови плесачи нису имали академску обуку. Били су то порториканска, италијанска, јеврејска и афроамеричка деца радничке класе, без формалног друштвеног статуса, која су свој идентитет градила на плесном подијуму. Крали су из свега: степ из Котон Клаба, акробатику Линди Хопа из Савој дворане, држање плесних дворана из студија средњег Менхетна. Све то су зашрафили на афрокубанску клаве.",
    ],
    sec3LegendsLeadIn: "Легенде те епохе:",
    sec3LegendsBullets: [
      "**Куван Пит (Педро Агилар)**, порторикански плесач из Бронкса са степом и Линди Хопом у позадини, спојио је афрокубанску укотвљеност са америчким џез стилом и професионализовао изложбени мамбо.",
      "**Мили Донеј**, италијанско-америчка партнерка Куван Пита, направила је револуцију у улози пратиоца. Пре Мили, од пратилаца у латиноамеричком плесу се очекивало да пасивно прате водитеља. Она му је одговарала ударац за ударац.",
      "**Килер Џо Пиро**, италијанско-амерички плесач, постао је најпознатији инструктор мамба у земљи — фигура која је хаос Палладијумовог подијума кодификовала у кораке који су се могли продати америчкој средњој класи.",
      "**Оџи и Марго Родригез** су спојили мамбо са замашним техникама плесних дворана и однели плес на националну телевизију у Ед Саливен Шоу.",
    ],
    sec3OutroParagraphs: [
      "Из тог судара изашао је биомеханички потпис који и данас одређује њујоршки мамбо: укотвљен доњи део тела са савијеним коленима, ожењен агресивно усправним горњим делом тела закључаног држања. Стомачни кор делује као амортизер између њих. Када видите како стопала врхунске On2 плесачице језиво брзо лете, а њене груди остају потпуно мирне, гледате директно наслеђе те епохе.",
    ],

    sec4Title: "Део 4: Еди Торес и кодификација On2",
    sec4Paragraphs: [
      "Палладијум је затворен 1966. године. До седамдесетих, оно што се звало „мамбо” дискографска индустрија је пребрендирала у „салсу”: исте афрокубанске музичке традиције под новом, тржишно прихватљивијом етикетом.",
      "Плесач који је премостио Палладијумову епоху и модерну био је **Еди Торес**. Торес је учио код Тита Пуентеа, који му је лично рекао да брејковати на 2 значи бити вернији клавеу и конги него брејковати на 1. Торес је узео тај музички принцип и око њега изградио систем који се може учити: одређену структуру бројања, одређени основни корак, педагогију коју је могуће усвајати час по час уместо упијањем кроз године клупске осмозе.",
      "Сваки модерни наставни план за салсу On2, укључујући и овај, у крајњој линији сеже до структуралног рада Едија Тореса. Израз „њујоршки стил” постао је синоним за Торесову лозу. Данас се „On2” учи од Њујорка до Токија, али систем који скоро сви ти учитељи наслеђују био је Торесов одговор на једно једино питање које му је Тито Пуенте поставио о двојци.",
    ],

    sec5Title: "Зашто је ова историја важна на подијуму",
    sec5Intro:
      "Историја овде није украс. Када разумете одакле овај плес долази, мењају се три ствари у томе како се заиста крећете:",
    sec5Steps: [
      "**Престајете да се борите против савијених колена.** Мека колена нису стилски избор. Она су биолошки неопходна да би се извео одложен пренос тежине који чини да ритам функционише.",
      "**Престајете да поскакујете раменима.** Тиха горња страна тела није естетска поза. То је наслеђена дисциплина плесних дворана која чита рад стопала и води преко држања.",
      "**Престајете да брејковате на 1.** Слап конге пада на 2. Ваш брејк-корак није произвољан избор бројања; он је тачка сусрета између вашег тела и ритам секције бенда.",
    ],
    sec5OutroRich:
      "То је теза [link]On2 стила[/link] и срж програма The Mambo Guild.",

    sec6Title: "Извори и даље читање",
    sec6Sources: [
      "McMains, Juliet. *Spinning Mambo into Salsa: Caribbean Dance in Global Commerce*. Oxford University Press, 2015.",
      "Roberts, John Storm. *The Latin Tinge: The Impact of Latin American Music on the United States*. Oxford University Press, 1999.",
      "Fernandez, Raul A. *From Afro-Cuban Rhythms to Latin Jazz*. University of California Press, 2006.",
      "Manuel, Peter. *Caribbean Currents: Caribbean Music from Rumba to Reggae*. Temple University Press, 2009.",
      "Gottschild, Brenda Dixon. *Digging the Africanist Presence in American Performance*. Greenwood Press, 1996.",
    ],

    ctaEyebrow: "Иди дубље",
    ctaHeading: "The Mambo Guild има потпуни курс историје од 20 модула.",
    ctaBody:
      "Сваки модул прати по једну нит приче, од афричких традиција бубња до Фанијине ере. Све са изворима, све предају сертификовани истраживачи плеса. Укључено у сваку чланарину The Mambo Guild-а.",

    faqs: [
      {
        q: "Ко је заиста изумео мамбо?",
        a: "Не постоји један изумитељ. Кубански вође оркестара Арсенио Родригез (Хавана, четрдесете) и Перез Прадо (Мексико Сити, од 1948. па надаље) дали су музици њен темељни облик; плес су искристалисали радници Њујорка у Палладијумовој дворани између 1948. и 1966.",
      },
      {
        q: "Да ли су мамбо и салса исто?",
        a: "Музички, модерна салса је маркетиншко пребрендирање мамба и сродних афрокубанских жанрова, које је направила њујоршка дискографска индустрија почетком седамдесетих. Као плес, оно што се данас учи као салса On2 (њујоршки стил) директан је потомак мамба из Палладијумове епохе.",
      },
      {
        q: "Шта је клаве?",
        a: "Клаве је ритмички образац од пет удараца преко два такта (3-2 или 2-3) који утемељује сву афрокубанску музику. Сваки други инструмент се фразира у односу на њу; ако се плеше исправно, и ваше промене тежине се поравнавају са њом.",
      },
      {
        q: "Зашто је завршила Палладијумова епоха?",
        a: "Палладијумова дворана је 1966. изгубила лиценцу за алкохол и убрзо потом затворена. Мамбо помама је уз то већ била потиснута у широј култури рокенролом, а унутар латиноамеричке музике бугалоом и раним добом етикете „салса”.",
      },
      {
        q: "Ко је био Еди Торес?",
        a: "Еди Торес је њујоршки плесач и кореограф који је учио код Тита Пуентеа и кодификовао оно што се данас широм света учи као салса On2 / њујоршки стил. Знање са подијума плесача из Палладијумове епохе претворио је у наставни план који се може предавати.",
      },
    ],
  },
  // ============================================================ TR
  tr: {
    metaTitle: "Mambo'nun doğuşu: Havana'dan Palladium'a",
    metaDescription:
      "Mambo'nun Küba Danzón'undan, Son'dan ve Afro-Küba ritminden nasıl ortaya çıktığı, Arsenio Rodríguez ve Palladium dansçıları tarafından nasıl dönüştürüldüğü ve Eddie Torres tarafından modern New York Style Salsa On2 olarak nasıl kodlandığı.",

    breadcrumbHome: "Ana Sayfa",
    breadcrumbBlog: "Blog",
    breadcrumbCurrent: "Mambo Tarihi",

    badge: "Tarih",
    h1Pre: "Mambo'nun doğuşu: ",
    h1Accent: "Havana'dan Palladium'a",

    shortAnswerRich:
      "Mambo tek bir anda icat edilmedi. Bir asır süren bir sentezin doruk noktasıdır: Afro-Küba perküsyon gelenekleri, İspanyol-Avrupa dans formu ve Amerikan kentsel tiyatrallığının üç ardışık dönemde çarpışmasıdır. Modern biçimini 1940'ların Havana'sında **Arsenio Rodríguez** kristalleştirdi, 1950'lerin New York'unda **Palladium dansçıları** dönüştürdü ve 1970'lerde öğretilebilir hâle **Eddie Torres** kodladı.",

    sec1Title: "1. Bölüm: üç Küba kökü",
    sec1Paragraphs: [
      "New York Mambo'yu kendi başarısı ilan etmeden önce, dansın ritimleri ve beden dili Küba'da, hareket etmeye dair birbirine zıt fikirleri olan iki kültürün çarpışmasında dövüldü.",
      "Bir tarafta **Avrupa geleneği**: İspanyol sömürge balo salonları, contradanza ve nihayet Danzón (1879'da Miguel Failde tarafından sahnelendi). Danslar dik dururdu. Tutuş sertti. Bacaklar görece düzdü. Müzik kemanlar, flütler ve piyanolarla çalınırdı. Dansçılar güçlü vuruşa kararlı biçimde basardı.",
      "Diğer tarafta **Afro-Küba geleneği**, *solares*'lerde (avlular) ve işçi mahallelerinde korundu: Rumba, içinde Guaguancó, Yambú, Columbia. Duruş alçaktı, dizler bükük, ağırlık merkezi yere kök salmıştı. Hareket omuzlarda, kaburgalarda, kalçalarda yaşıyordu. Cümleleme \"off-beat\"leri ve aralarındaki boş alanları öne çıkarıyordu.",
      "20. yüzyılın başları boyunca bu iki gelenek sınıf ve ırk tarafından ayrı tutuldu. Aralarındaki köprü 1920'lerde **Son** biçiminde ortaya çıktı. Doğudaki Oriente eyaletinden çıkan Son, İspanyol gitarını ve sözel yapıyı Afro-Küba perküsyonuyla (bongolar, marakaslar, clave) birleştirdi. Üst sınıf kulüplerinde sosyal olarak kabul edilirken aynı zamanda sokağın ritim geleneklerinden gerçek anlamda beslenen ilk müzikti.",
    ],

    sec2Title: "2. Bölüm: Arsenio Rodríguez ve konga",
    sec2Paragraphs: [
      "1930'lar ve 40'larda, görme engelli bir tres çalgıcısı olan **Arsenio Rodríguez**, Son topluluğunun daha çok itki ihtiyacı olduğuna karar verdi. Geleneksel septeto'yu *conjunto*'ya genişletti, birden fazla trompet, piyano ve (en tartışmalı şekilde) konga ekledi. Konga, o güne dek resmi topluluklar için fazla \"sokak işi\" sayılıp dışlanıyordu. Arsenio onu sesin tam ortasına yerleştirdi.",
      "Aynı zamanda parçanın **montuno** bölümünü uzattı: şarkıcıların doğaçlama yaptığı, dansçıların nihayet kendilerini bıraktığı; açık uçlu, ağır senkoplu, tekrara dayalı kapanış vamp'ı. Buradan çıkan yavaş, iten, perküsyon-ağırlıklı son montuno, Mambo'nun doğrudan ritmik atasıdır.",
      "Arsenio'nun müzikal olarak dayattığı şey, zamanın Afro-Küba yorumuydu. Müziğin kurucu örüntüsü **clave**'dir; bunun üstüne yerleşen her katmanın hissini belirleyen, beş vuruşluk bir iskelettir. Doğru dans edildiğinde müzik bedenden dizleri yumuşatmasını, ağırlık merkezini düşürmesini ve ağırlık aktarımını geciktirmesini ister; böylece adım, ritmin üstünde yürümek yerine ritmin içine yerleşir. Küba hareketinin (kalçaların sekiz çizmesi) mekanik değil doğal biçimde gerçekleşmesini sağlayan tam da bu gecikmedir.",
    ],

    sec3Title: "3. Bölüm: Palladium Ballroom (1948-1966)",
    sec3IntroParagraphs: [
      "1948'de 53. Cadde ile Broadway köşesindeki Palladium Ballroom, ırklarüstü Latin müzik gecelerine kapılarını açtı. Birkaç yıl içinde **Mambo Çılgınlığı**'nın merkez üssü oldu. Üç ev orkestra şefi (Tito Puente, Tito Rodríguez ve Machito) müziği itiyordu. Bronx, Brooklyn ve Spanish Harlem'den dansçılar dansı itiyordu.",
      "Palladium dansçıları akademik eğitim almamıştı. Resmi sosyal statüsü olmayan, kimliklerini bunun yerine dans pistinde inşa eden Porto Riko, İtalyan, Yahudi ve Afrika kökenli Amerikalı işçi sınıfı gençleriydi. Her yerden çalıyorlardı: Cotton Club'tan tap, Savoy Ballroom'dan Lindy Hop akrobasisi, midtown Manhattan'daki stüdyolardan balo salonu tutuşu. Hepsini Afro-Küba clave'ine cıvatadılar.",
    ],
    sec3LegendsLeadIn: "O dönemin efsaneleri:",
    sec3LegendsBullets: [
      "**Cuban Pete (Pedro Aguilar)**, tap ve Lindy Hop geçmişi olan, Bronx'tan Porto Rikolu bir dansçı; Afro-Küba'nın yere bağlı duruşunu Amerikan caz stiliyle birleştirdi ve gösteri Mambo'sunu profesyonelleştirdi.",
      "**Millie Donay**, Cuban Pete'in İtalyan-Amerikalı partneri, takipçi rolünde devrim yaptı. Millie'den önce Latin danslarda takipçilerden lideri pasif biçimde takip etmeleri beklenirdi. O ise vuruşa vuruşla cevap verdi.",
      "**Killer Joe Piro**, İtalyan-Amerikalı bir dansçı; ülkenin en ünlü Mambo eğitmeni oldu — Palladium pistinin kaosunu Amerikan orta sınıfına satılabilir adımlara kodlayan figürdür.",
      "**Augie ve Margo Rodríguez** Mambo'yu geniş balo salonu teknikleriyle birleştirdi ve dansı Ed Sullivan Show'da ulusal televizyona taşıdı.",
    ],
    sec3OutroParagraphs: [
      "Bu çarpışmadan New York Mambo'sunu hâlâ tanımlayan biyomekanik imza çıktı: yere bağlı, dizleri bükülü bir alt vücut ile agresif biçimde dik, tutuşu kilitli bir üst vücut. Karın çekirdeği bu ikisi arasında şok emici görevi görür. Dünya çapında bir On2 dansçısının ayakları göz kamaştırıcı hızda hareket ederken göğsünün tamamen sessiz kaldığını gördüğünüzde, bu çağın doğrudan mirasını seyrediyorsunuz demektir.",
    ],

    sec4Title: "4. Bölüm: Eddie Torres ve On2'nin kodlanması",
    sec4Paragraphs: [
      "Palladium 1966'da kapandı. 1970'lere gelindiğinde, plak endüstrisi \"Mambo\" denen şeyi \"Salsa\" olarak yeniden markalıyordu: aynı Afro-Küba müzik gelenekleri, daha pazarlanabilir yeni bir etiket altında.",
      "Palladium çağıyla modern çağı bağlayan dansçı **Eddie Torres**'tir. Torres, kendisine 2'de break yapmanın 1'de break yapmaktan clave ve konga açısından daha sadık olduğunu bizzat söyleyen Tito Puente'nin yanında çalıştı. Torres bu müzikal ilkeyi alıp etrafına öğretilebilir bir sistem kurdu: belirli bir sayım yapısı, belirli bir temel adım, yıllarca kulüp emilimiyle özümsenmek yerine ders ders öğrenilebilen bir pedagoji.",
      "Bu da dahil her modern Salsa On2 müfredatı, sonunda Eddie Torres'in yapısal çalışmasına dayanır. \"New York Style\" ifadesi Torres'in soyuyla eşanlamlı hâle geldi. Bugün \"On2\" New York'tan Tokyo'ya kadar her yerde öğretiliyor; ama o eğitmenlerin neredeyse tamamının devraldığı sistem, Tito Puente'nin Torres'e 2 hakkında sorduğu tek bir sorunun cevabıdır.",
    ],

    sec5Title: "Bu tarih dans pistinde neden önemli",
    sec5Intro:
      "Buradaki tarih dekoratif değil. Dansın nereden geldiğini anladığında, gerçekten nasıl hareket ettiğine dair üç şey değişir:",
    sec5Steps: [
      "**Bükük dizlerle savaşmayı bırakırsın.** Yumuşak dizler bir stil tercihi değildir. Ritmi işler kılan gecikmeli ağırlık aktarımını gerçekleştirmek için biyolojik olarak gereklidir.",
      "**Omuzlarla zıplamayı bırakırsın.** Sessiz üst gövde estetik bir poz değil, miras alınmış balo salonu disiplinidir; ayak işini okunur kılan, tutuş üzerinden liderliği okunur kılan da odur.",
      "**1'de break yapmayı bırakırsın.** Konganın slap'i 2'ye düşer. Senin break-adımın keyfi bir sayım tercihi değil, bedenin ile orkestranın ritim bölümünün buluşma noktasıdır.",
    ],
    sec5OutroRich:
      "Bu, [link]On2 stilinin[/link] tezi ve The Mambo Guild müfredatının çekirdeğidir.",

    sec6Title: "Kaynaklar ve daha fazla okuma",
    sec6Sources: [
      "McMains, Juliet. *Spinning Mambo into Salsa: Caribbean Dance in Global Commerce*. Oxford University Press, 2015.",
      "Roberts, John Storm. *The Latin Tinge: The Impact of Latin American Music on the United States*. Oxford University Press, 1999.",
      "Fernandez, Raul A. *From Afro-Cuban Rhythms to Latin Jazz*. University of California Press, 2006.",
      "Manuel, Peter. *Caribbean Currents: Caribbean Music from Rumba to Reggae*. Temple University Press, 2009.",
      "Gottschild, Brenda Dixon. *Digging the Africanist Presence in American Performance*. Greenwood Press, 1996.",
    ],

    ctaEyebrow: "Daha derine in",
    ctaHeading: "The Mambo Guild'de 20 modüllük tam bir tarih kursu var.",
    ctaBody:
      "Her modül hikâyenin bir ipliğini izler — Afrika davul geleneklerinden Fania dönemine kadar. Hepsi kaynaklı, hepsi sertifikalı dans akademisyenleri tarafından anlatılıyor. Her The Mambo Guild üyeliğinde dahildir.",

    faqs: [
      {
        q: "Mambo'yu gerçekte kim icat etti?",
        a: "Tek bir mucit yok. Kübalı orkestra şefleri Arsenio Rodríguez (Havana, 1940'lar) ve Pérez Prado (Mexico City, 1948'den itibaren) müziğe kurucu biçimini verdi; dans 1948-1966 arasında Palladium Ballroom'da işçi sınıfı New Yorklular tarafından kristalleştirildi.",
      },
      {
        q: "Mambo ile Salsa aynı şey mi?",
        a: "Müzikal olarak modern Salsa, 1970'lerin başında New York plak endüstrisinin yaptığı, Mambo ve komşu Afro-Küba türlerinin pazarlama amaçlı yeniden markalanmasıdır. Dans olarak bugün Salsa On2 (New York Style) adıyla öğretilen şey, Palladium dönemi Mambo'sunun doğrudan torunudur.",
      },
      {
        q: "Clave nedir?",
        a: "Clave, iki ölçüye yayılan beş vuruşluk bir ritim örüntüsüdür (3-2 ya da 2-3) ve tüm Afro-Küba müziğini sabitler. Diğer her enstrüman ona göre cümlelenir; doğru dans edildiğinde, senin ağırlık geçişlerin de ona hizalanır.",
      },
      {
        q: "Palladium dönemi neden bitti?",
        a: "Palladium Ballroom 1966'da içki ruhsatını kaybetti ve kısa süre sonra kapandı. Mambo çılgınlığı zaten geniş kültürde rock and roll tarafından, Latin müzik içinde ise Boogaloo ve erken \"Salsa\" etiket dönemi tarafından yerinden edilmişti.",
      },
      {
        q: "Eddie Torres kimdi?",
        a: "Eddie Torres, Tito Puente'nin yanında çalışan ve bugün dünya çapında Salsa On2 / New York Style olarak öğretilen şeyi kodlayan New Yorklu bir dansçı ve koreograftır. Palladium dönemi dansçılarının pist bilgisini öğretilebilir bir müfredata çevirdi.",
      },
    ],
  },
};

export function getMamboHistoryContent(locale: Locale): MamboHistoryContent {
  const c = CONTENT[locale];
  // Fallback to en if a locale's blob is empty (placeholder).
  if (!c || !c.metaTitle) return CONTENT.en;
  return c;
}
