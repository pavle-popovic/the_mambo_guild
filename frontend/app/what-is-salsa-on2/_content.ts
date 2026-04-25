/**
 * /what-is-salsa-on2 article content per locale. Hand-authored in-session.
 * Rich text: **bold** = gold strong, *italic* = em, [link]...[/link] = link
 * to /blog/the-85-percent-rule (used in step 5 of the starter path).
 */
import type { Locale } from "@/i18n/config";

export type Row = { a: string; b: string; c: string };
export type Faq = { q: string; a: string };
export type HowToStep = { name: string; text: string };

export type WhatIsOn2Content = {
  metaTitle: string;
  metaDescription: string;

  breadcrumbHome: string;
  breadcrumbCurrent: string;
  badge: string;
  h1Pre: string;
  h1Accent: string;

  /** Rich; uses **bold** markers for the three On2 callouts. */
  shortAnswerRich: string;

  sec1Title: string;
  sec1Paragraphs: string[];

  sec2Title: string;
  sec2HeadAttr: string;
  sec2HeadOn1: string;
  sec2HeadOn2: string;
  sec2Rows: Row[];

  sec3Title: string;
  sec3Paragraphs: string[];

  sec4Title: string;
  sec4Paragraphs: string[];

  sec5Title: string;
  /** 5 steps, each starts with **bold** label. Step 5 embeds [link]TEXT[/link]
   *  pointing to /blog/the-85-percent-rule. */
  sec5Steps: string[];

  sec6Title: string;
  /** 3 myth bullets, each starts with **bold** quoted myth then body. */
  sec6Bullets: string[];

  faqs: Faq[];

  ctaHeading: string;

  /** HowTo schema steps. */
  howToSteps: HowToStep[];
};

const CONTENT: Record<Locale, WhatIsOn2Content> = {
  // ============================================================ EN
  en: {
    metaTitle: "What is Salsa On2? The Complete Guide to New York Style Mambo",
    metaDescription:
      "Salsa On2 is a timing style where dancers break on the 2nd beat of the music. Also called New York Style or Mambo. Full definition, history, biomechanics, and a 5-step starter path.",
    breadcrumbHome: "Home",
    breadcrumbCurrent: "Salsa On2",
    badge: "The Guide",
    h1Pre: "What is Salsa On2? The Complete Guide to ",
    h1Accent: "New York Style Mambo",
    shortAnswerRich:
      "Salsa On2 is a timing style of salsa dancing where you break (change direction) on the **second beat** of the music instead of the first. It is also called **New York Style** or **Mambo**. The style was formalized at New York's Palladium Ballroom in the 1950s and codified for modern teaching by Eddie Torres in the 1970s. Dancing On2 aligns your body with the conga drum's slap pattern, giving the dance a smoother, more syncopated feel than On1.",
    sec1Title: "The core idea: counting in 8s",
    sec1Paragraphs: [
      "Every salsa song is written in 4/4 time, which dancers count as a repeating 8-count measure (1, 2, 3, 4, 5, 6, 7, 8). Whether you dance On1 or On2, you take six steps inside each 8-count: three in the first half and three in the second half, with pauses on the 4 and the 8.",
      "What changes between the two styles is *when* you change direction, what dancers call the \"break step.\" An On1 dancer changes direction on the 1. An On2 dancer changes direction on the 2. The rest of the footwork follows from that single decision.",
      "The reason this matters is musical. In Afro-Cuban music, the conga drum plays a pattern called the tumbao. Its defining accent, the open-tone slap, falls on the 2 and the 6 of every 8-count measure, not on the 1 and the 5. When you break on the 2, your weight change lands on that slap. Your body is moving in sync with the rhythm section of the band instead of the melody.",
    ],
    sec2Title: "On1 vs On2 at a glance",
    sec2HeadAttr: "Attribute",
    sec2HeadOn1: "Salsa On1 (LA Style)",
    sec2HeadOn2: "Salsa On2 (NY Style)",
    sec2Rows: [
      { a: "Break step", b: "Beat 1", c: "Beat 2" },
      { a: "Feel", b: "Staccato, energetic", c: "Smooth, laid-back" },
      { a: "Sync with", b: "Melody / downbeat", c: "Conga slap / rhythm section" },
      { a: "Origin", b: "Los Angeles, 1990s (Vazquez brothers)", c: "New York, 1950s Palladium" },
      { a: "Dominant scenes", b: "LA, much of Latin America, most European cities", c: "NYC, competitive salsa, dedicated On2 scenes worldwide" },
      { a: "Canonical teacher", b: "Eddie Torres inspired many LA pioneers too", c: "Eddie Torres (the father of modern On2 pedagogy)" },
    ],
    sec3Title: "A brief history: Palladium, Eddie Torres, and modern On2",
    sec3Paragraphs: [
      "In the early 1950s, New York's Palladium Ballroom became the crucible of the Mambo Craze. Working-class dancers from the Bronx, Brooklyn, and Spanish Harlem (Puerto Rican, Italian, Jewish, and African American) were dancing to big-band Mambo led by Tito Puente, Tito Rodriguez, and Machito. The era's legendary dancers like Cuban Pete, Millie Donay, and Killer Joe Piro fused Afro-Cuban grounding with Lindy Hop acrobatics, tap phrasing, and ballroom frame.",
      "The Palladium Mambo that emerged was not a single, standardized style. It was a competitive subculture of ad-hoc variations. Some dancers broke on the 1, some on the 2, some floated between them. What unified the style was the aesthetic: grounded lower body, locked frame, fast footwork, quiet chest.",
      "In the 1970s, after the Palladium era, a dancer named **Eddie Torres** codified what we now recognize as the standard \"On2\" timing. Torres studied under Tito Puente, and Puente told him that breaking on the 2 was truer to the clave and the tumbao than breaking on the 1. Torres took that musical principle and built a teachable system around it. Every modern Salsa On2 curriculum, including this one, ultimately traces back to Eddie Torres' structural work.",
    ],
    sec4Title: "Why On2 feels different in your body",
    sec4Paragraphs: [
      "The biomechanics of On2 are a controlled tug-of-war. Your lower body surrenders to the floor: knees soft, center of gravity low, weight rolling through the ball of the foot before the heel drops. Your upper body reaches up: spine lifted, shoulders down, chest quiet.",
      "That separation between a grounded lower body and a lifted upper body is why world-class On2 dancers look like they are floating while their feet move at dizzying speeds. It is also why the dance works musically: the rolling, slightly-delayed weight transfer naturally lands on the conga slap instead of racing ahead of it.",
      "The two most common mistakes a newcomer makes are (1) dancing with straight, locked legs, which kills the delay and flattens the hips into a march, and (2) letting the shoulders bounce up and down with the footwork, which destroys the frame.",
    ],
    sec5Title: "How to start learning Salsa On2",
    sec5Steps: [
      "**Train your ear for the conga tumbao.** Listen to salsa tracks and isolate the conga drum. The recurring open-tone slap lands on the 2 and the 6. Until you can hear that slap, you cannot reliably dance On2.",
      "**Master the basic step solo, with no music.** Count aloud \"1-2-3, 5-6-7\" with pauses on the 4 and the 8. Break back on the 2, break forward on the 6. Drill until the step is automatic.",
      "**Add music at a slow tempo (~90 BPM).** Once the step is boring, put on a slow Mambo track (Tito Puente or Eddie Torres Big Band are canonical) and match your basic step to the music while continuing to count aloud.",
      "**Drill the weight transfer.** Practice slow-motion basics focusing only on how your weight travels: ball of the foot first, heel drops after, weight settling with the knees soft. This is the habit that separates a dancer from a stepper.",
      "**Take a structured course.** Self-study plateaus at around six months. A curriculum that isolates footwork, musicality, body mechanics, and partner work in the right order gets you past that plateau much faster. The exact reason is [link]the 85% rule[/link] of motor learning: your brain needs a specific balance of success and failure to keep improving.",
    ],
    sec6Title: "Myths to ignore",
    sec6Bullets: [
      "**\"On2 is only for advanced dancers.\"** False. Absolute beginners can start with On2. The adjustment is harder if you already trained your body to On1 for years, not if you are new.",
      "**\"Salsa On2 is a different dance from salsa.\"** It is the same dance with a different timing. The partner work, the connection frame, the shines, the combinations. The vocabulary is shared.",
      "**\"You cannot dance On2 to LA-style music.\"** You can dance On2 to any salsa song. Whether it feels good depends on the song's tempo and percussion arrangement, not on whether the song was recorded in LA or New York.",
    ],
    faqs: [
      { q: "Is Salsa On2 harder than Salsa On1?", a: "On2 is not objectively harder. It is less intuitive for people raised on Western downbeat music, because the first break step falls on the 2, not the 1. Dancers who already internalized On1 often report a 2-4 week adjustment period. Beginners who learn On2 first usually reach the same level of comfort at the same rate." },
      { q: "Do I need to learn Salsa On1 before learning On2?", a: "No. You can learn On2 first. Eddie Torres' original students were mostly absolute beginners. Starting with On2 avoids rewiring timing habits later. That said, if you live in a city where the social scene dances On1, learning On1 first is pragmatic because you need somewhere to practice." },
      { q: "Is Salsa On2 the same thing as Mambo?", a: "In the contemporary online salsa world the two terms are used interchangeably. Historically, Mambo was the 1950s Palladium Ballroom dance style formalized by dancers like Cuban Pete, Millie Donay, and later Eddie Torres. Modern Salsa On2, sometimes called New York Style, is a direct descendant of that tradition." },
      { q: "How long does it take to learn Salsa On2?", a: "Expect 2-4 weeks to dance the basic step musically with confidence, 3-6 months to dance socially at a beginner level with a partner, and 1-2 years to reach intermediate social comfort. These estimates assume 3-5 hours of deliberate practice per week, not passive class attendance." },
      { q: "Can I dance Salsa On2 at any salsa club?", a: "You can dance On2 to any salsa song, but socially you want to match your partner's timing. In New York City, most of Europe's dedicated On2 scenes, and the competitive world, On2 dominates. In much of Latin America, the Caribbean, and many local scenes in Europe and the US, On1 dominates. Most experienced dancers can switch between the two." },
    ],
    ctaHeading: "The first 30 days of Salsa On2, structured.",
    howToSteps: [
      { name: "Train your ear for the conga tumbao", text: "Listen to Salsa On2 tracks and isolate the conga drum. The recurring 'slap' falls on the 2 and the 6 of the 8-count measure. Hearing this slap is the prerequisite for dancing On2 in time." },
      { name: "Master the basic step solo", text: "Practice the 6-step basic (forward break / back break) without music first. Count aloud 1-2-3, 5-6-7 with a pause on 4 and 8. Break (change direction) on the 2 going back, and on the 6 going forward." },
      { name: "Add music at a slow tempo (~90 BPM)", text: "Once the step is automatic, dance it to a slow Mambo track. Keep counting aloud. Most teachers recommend Tito Puente's mid-tempo recordings or Eddie Torres Big Band for practice music." },
      { name: "Drill the weight transfer", text: "On2 requires a delayed weight transfer: you place the ball of the foot first, then let the heel drop. Practice slow-motion basic steps focusing only on how weight travels through the foot." },
      { name: "Take a structured course", text: "Self-study has a ceiling. A curriculum that isolates footwork, musicality, body mechanics, and partner work in the right order will accelerate you past the plateau self-taught dancers hit at ~6 months." },
    ],
  },

  // ============================================================ ES
  es: {
    metaTitle: "¿Qué es la Salsa On2? La guía completa al Mambo Estilo Nueva York",
    metaDescription:
      "La Salsa On2 es un estilo de timing en el que los bailarines marcan el paso en el 2º tiempo de la música. También se llama Estilo Nueva York o Mambo. Definición completa, historia, biomecánica y un camino de 5 pasos para empezar.",
    breadcrumbHome: "Inicio",
    breadcrumbCurrent: "Salsa On2",
    badge: "La Guía",
    h1Pre: "¿Qué es la Salsa On2? La guía completa al ",
    h1Accent: "Mambo Estilo Nueva York",
    shortAnswerRich:
      "La Salsa On2 es un estilo de timing del baile de salsa donde marcas el paso (cambias de dirección) en el **segundo tiempo** de la música en lugar del primero. También se conoce como **Estilo Nueva York** o **Mambo**. El estilo se formalizó en el Palladium Ballroom de Nueva York en los años 50 y fue codificado para la enseñanza moderna por Eddie Torres en los 70. Bailar On2 alinea tu cuerpo con el patrón de slap de la conga, dando al baile un feeling más suave y sincopado que el On1.",
    sec1Title: "La idea central: contar en 8s",
    sec1Paragraphs: [
      "Cada canción de salsa está escrita en compás 4/4, que los bailarines cuentan como una medida de 8 tiempos repetida (1, 2, 3, 4, 5, 6, 7, 8). Tanto si bailas On1 como On2, das seis pasos dentro de cada 8 tiempos: tres en la primera mitad y tres en la segunda, con pausas en el 4 y el 8.",
      "Lo que cambia entre los dos estilos es *cuándo* cambias de dirección, lo que los bailarines llaman \"el paso de break\". Un bailarín de On1 cambia de dirección en el 1. Un bailarín de On2 cambia de dirección en el 2. El resto del trabajo de pies se desprende de esa única decisión.",
      "La razón por la que esto importa es musical. En la música afrocubana, la conga toca un patrón llamado tumbao. Su acento definitorio, el slap de tono abierto, cae en el 2 y en el 6 de cada medida de 8 tiempos, no en el 1 ni en el 5. Cuando marcas en el 2, tu cambio de peso aterriza en ese slap. Tu cuerpo se mueve en sincronía con la sección rítmica de la banda en lugar de con la melodía.",
    ],
    sec2Title: "On1 vs On2 de un vistazo",
    sec2HeadAttr: "Atributo",
    sec2HeadOn1: "Salsa On1 (Estilo LA)",
    sec2HeadOn2: "Salsa On2 (Estilo NY)",
    sec2Rows: [
      { a: "Paso de break", b: "Tiempo 1", c: "Tiempo 2" },
      { a: "Feeling", b: "Staccato, enérgico", c: "Suave, relajado" },
      { a: "Sincroniza con", b: "Melodía / tiempo fuerte", c: "Slap de la conga / sección rítmica" },
      { a: "Origen", b: "Los Ángeles, años 90 (hermanos Vazquez)", c: "Nueva York, Palladium años 50" },
      { a: "Escenas dominantes", b: "LA, gran parte de Latinoamérica, la mayoría de las ciudades europeas", c: "NYC, salsa de competición, escenas dedicadas a On2 en todo el mundo" },
      { a: "Maestro canónico", b: "Eddie Torres también inspiró a muchos pioneros de LA", c: "Eddie Torres (el padre de la pedagogía moderna del On2)" },
    ],
    sec3Title: "Una breve historia: Palladium, Eddie Torres y el On2 moderno",
    sec3Paragraphs: [
      "A principios de los años 50, el Palladium Ballroom de Nueva York se convirtió en el crisol de la Mambo Craze. Bailarines de clase trabajadora del Bronx, Brooklyn y el Spanish Harlem (puertorriqueños, italianos, judíos y afroamericanos) bailaban Mambo de big-band liderado por Tito Puente, Tito Rodriguez y Machito. Los bailarines legendarios de la época, como Cuban Pete, Millie Donay y Killer Joe Piro, fusionaron el grounding afrocubano con la acrobacia del Lindy Hop, el fraseo del tap y el frame de los bailes de salón.",
      "El Mambo del Palladium que emergió no era un estilo único y estandarizado. Era una subcultura competitiva de variaciones improvisadas. Algunos bailarines marcaban en el 1, otros en el 2, otros flotaban entre ambos. Lo que unificaba el estilo era la estética: tren inferior anclado, frame bloqueado, trabajo de pies rápido, pecho quieto.",
      "En los años 70, tras la era del Palladium, un bailarín llamado **Eddie Torres** codificó lo que hoy reconocemos como el timing \"On2\" estándar. Torres estudió bajo Tito Puente, y Puente le dijo que marcar en el 2 era más fiel a la clave y al tumbao que marcar en el 1. Torres tomó ese principio musical y construyó un sistema enseñable a su alrededor. Cada currículum moderno de Salsa On2, incluido este, en última instancia tiene su origen en el trabajo estructural de Eddie Torres.",
    ],
    sec4Title: "Por qué el On2 se siente diferente en tu cuerpo",
    sec4Paragraphs: [
      "La biomecánica del On2 es un tira y afloja controlado. Tu tren inferior se rinde al suelo: rodillas blandas, centro de gravedad bajo, peso rodando a través de la planta del pie antes de que caiga el talón. Tu tren superior se eleva: columna estirada, hombros abajo, pecho quieto.",
      "Esa separación entre un tren inferior anclado y un tren superior elevado es por la que los bailarines de On2 de clase mundial parecen flotar mientras sus pies se mueven a velocidades vertiginosas. También es por lo que el baile funciona musicalmente: la transferencia de peso rodante y ligeramente retrasada aterriza naturalmente en el slap de la conga en lugar de adelantarse a él.",
      "Los dos errores más comunes que comete un recién llegado son (1) bailar con piernas rectas y bloqueadas, lo que mata el retraso y aplana las caderas en una marcha, y (2) dejar que los hombros reboten arriba y abajo con el trabajo de pies, lo que destruye el frame.",
    ],
    sec5Title: "Cómo empezar a aprender Salsa On2",
    sec5Steps: [
      "**Entrena tu oído para el tumbao de la conga.** Escucha temas de salsa y aísla la conga. El slap de tono abierto recurrente cae en el 2 y el 6. Hasta que puedas oír ese slap, no podrás bailar On2 con fiabilidad.",
      "**Domina el paso básico solo, sin música.** Cuenta en voz alta \"1-2-3, 5-6-7\" con pausas en el 4 y el 8. Marca atrás en el 2, marca adelante en el 6. Practica hasta que el paso sea automático.",
      "**Añade música a tempo lento (~90 BPM).** Cuando el paso te aburra, pon un tema de Mambo lento (Tito Puente o Eddie Torres Big Band son canónicos) y haz coincidir tu paso básico con la música mientras sigues contando en voz alta.",
      "**Practica la transferencia de peso.** Haz básicos a cámara lenta enfocándote solo en cómo viaja tu peso: planta del pie primero, talón después, peso asentándose con las rodillas blandas. Este es el hábito que separa a un bailarín de un caminante.",
      "**Toma un curso estructurado.** El autoestudio se estanca alrededor de los seis meses. Un currículum que aísla trabajo de pies, musicalidad, biomecánica y trabajo en pareja en el orden correcto te lleva más allá de ese estancamiento mucho más rápido. La razón exacta es [link]la regla del 85%[/link] del aprendizaje motor: tu cerebro necesita un equilibrio específico de éxito y fracaso para seguir mejorando.",
    ],
    sec6Title: "Mitos a ignorar",
    sec6Bullets: [
      "**\"El On2 es solo para bailarines avanzados.\"** Falso. Los principiantes absolutos pueden empezar con On2. El ajuste es más difícil si ya entrenaste tu cuerpo para On1 durante años, no si eres nuevo.",
      "**\"La Salsa On2 es un baile diferente de la salsa.\"** Es el mismo baile con un timing diferente. El trabajo en pareja, el frame de conexión, los shines, las combinaciones. El vocabulario es compartido.",
      "**\"No puedes bailar On2 con música de estilo LA.\"** Puedes bailar On2 con cualquier canción de salsa. Que se sienta bien depende del tempo y del arreglo de percusión de la canción, no de si la canción se grabó en LA o en Nueva York.",
    ],
    faqs: [
      { q: "¿Es la Salsa On2 más difícil que la Salsa On1?", a: "El On2 no es objetivamente más difícil. Es menos intuitivo para personas criadas con música occidental de tiempo fuerte, porque el primer paso de break cae en el 2, no en el 1. Los bailarines que ya interiorizaron el On1 a menudo informan de un periodo de ajuste de 2 a 4 semanas. Los principiantes que aprenden On2 primero suelen alcanzar el mismo nivel de comodidad al mismo ritmo." },
      { q: "¿Necesito aprender Salsa On1 antes de aprender On2?", a: "No. Puedes aprender On2 primero. Los estudiantes originales de Eddie Torres eran en su mayoría principiantes absolutos. Empezar con On2 evita reprogramar hábitos de timing más tarde. Dicho esto, si vives en una ciudad donde la escena social baila On1, aprender On1 primero es pragmático porque necesitas dónde practicar." },
      { q: "¿Es la Salsa On2 lo mismo que el Mambo?", a: "En el mundo contemporáneo de la salsa online, los dos términos se usan indistintamente. Históricamente, el Mambo era el estilo de baile de los años 50 del Palladium Ballroom, formalizado por bailarines como Cuban Pete, Millie Donay y más tarde Eddie Torres. La Salsa On2 moderna, a veces llamada Estilo Nueva York, es un descendiente directo de esa tradición." },
      { q: "¿Cuánto tiempo se tarda en aprender Salsa On2?", a: "Espera de 2 a 4 semanas para bailar el paso básico de forma musical con confianza, de 3 a 6 meses para bailar socialmente a nivel principiante con una pareja, y de 1 a 2 años para alcanzar comodidad social intermedia. Estas estimaciones asumen de 3 a 5 horas de práctica deliberada por semana, no asistencia pasiva a clase." },
      { q: "¿Puedo bailar Salsa On2 en cualquier club de salsa?", a: "Puedes bailar On2 con cualquier canción de salsa, pero socialmente quieres hacer coincidir el timing de tu pareja. En Nueva York, en la mayoría de las escenas dedicadas a On2 de Europa y en el mundo competitivo, domina el On2. En gran parte de Latinoamérica, el Caribe y muchas escenas locales de Europa y EE. UU., domina el On1. La mayoría de los bailarines experimentados pueden cambiar entre los dos." },
    ],
    ctaHeading: "Los primeros 30 días de Salsa On2, estructurados.",
    howToSteps: [
      { name: "Entrena tu oído para el tumbao de la conga", text: "Escucha temas de Salsa On2 y aísla la conga. El 'slap' recurrente cae en el 2 y el 6 de la medida de 8 tiempos. Oír este slap es el prerrequisito para bailar On2 a tiempo." },
      { name: "Domina el paso básico solo", text: "Practica el básico de 6 pasos (break adelante / break atrás) sin música primero. Cuenta en voz alta 1-2-3, 5-6-7 con una pausa en 4 y 8. Marca (cambia de dirección) en el 2 yendo atrás, y en el 6 yendo adelante." },
      { name: "Añade música a tempo lento (~90 BPM)", text: "Cuando el paso sea automático, báilalo con un tema de Mambo lento. Sigue contando en voz alta. La mayoría de profesores recomiendan grabaciones de tempo medio de Tito Puente o de Eddie Torres Big Band como música de práctica." },
      { name: "Practica la transferencia de peso", text: "El On2 requiere una transferencia de peso retrasada: colocas la planta del pie primero, luego dejas caer el talón. Practica básicos a cámara lenta enfocándote solo en cómo viaja el peso a través del pie." },
      { name: "Toma un curso estructurado", text: "El autoestudio tiene un techo. Un currículum que aísla trabajo de pies, musicalidad, biomecánica y trabajo en pareja en el orden correcto te acelerará más allá del estancamiento que los bailarines autodidactas alcanzan a los ~6 meses." },
    ],
  },

  // ============================================================ PT
  pt: {
    metaTitle: "O que é Salsa On2? O guia completo do Mambo Estilo Nova York",
    metaDescription:
      "Salsa On2 é um estilo de timing em que os dançarinos marcam no 2º tempo da música. Também chamado Estilo Nova York ou Mambo. Definição completa, história, biomecânica e um caminho de 5 passos para começar.",
    breadcrumbHome: "Início",
    breadcrumbCurrent: "Salsa On2",
    badge: "O Guia",
    h1Pre: "O que é Salsa On2? O guia completo do ",
    h1Accent: "Mambo Estilo Nova York",
    shortAnswerRich:
      "Salsa On2 é um estilo de timing da dança da salsa onde marcas (mudas de direção) no **segundo tempo** da música em vez do primeiro. Também é conhecida como **Estilo Nova York** ou **Mambo**. O estilo foi formalizado no Palladium Ballroom de Nova York nos anos 50 e codificado para o ensino moderno por Eddie Torres nos anos 70. Dançar On2 alinha o teu corpo com o padrão de slap da conga, dando à dança um feeling mais suave e sincopado que o On1.",
    sec1Title: "A ideia central: contar em 8s",
    sec1Paragraphs: [
      "Cada música de salsa é escrita em compasso 4/4, que os dançarinos contam como uma medida de 8 tempos repetida (1, 2, 3, 4, 5, 6, 7, 8). Quer dances On1 ou On2, dás seis passos dentro de cada 8 tempos: três na primeira metade e três na segunda, com pausas no 4 e no 8.",
      "O que muda entre os dois estilos é *quando* mudas de direção, o que os dançarinos chamam \"o passo de break\". Um dançarino de On1 muda de direção no 1. Um dançarino de On2 muda de direção no 2. O resto do trabalho de pés segue dessa única decisão.",
      "A razão pela qual isto importa é musical. Na música afro-cubana, a conga toca um padrão chamado tumbao. O seu acento definidor, o slap de tom aberto, cai no 2 e no 6 de cada medida de 8 tempos, não no 1 nem no 5. Quando marcas no 2, a tua mudança de peso aterra nesse slap. O teu corpo move-se em sincronia com a secção rítmica da banda em vez da melodia.",
    ],
    sec2Title: "On1 vs On2 num relance",
    sec2HeadAttr: "Atributo",
    sec2HeadOn1: "Salsa On1 (Estilo LA)",
    sec2HeadOn2: "Salsa On2 (Estilo NY)",
    sec2Rows: [
      { a: "Passo de break", b: "Tempo 1", c: "Tempo 2" },
      { a: "Feeling", b: "Staccato, enérgico", c: "Suave, descontraído" },
      { a: "Sincroniza com", b: "Melodia / tempo forte", c: "Slap da conga / secção rítmica" },
      { a: "Origem", b: "Los Angeles, anos 90 (irmãos Vazquez)", c: "Nova York, Palladium anos 50" },
      { a: "Cenas dominantes", b: "LA, grande parte da América Latina, maioria das cidades europeias", c: "NYC, salsa de competição, cenas dedicadas a On2 mundialmente" },
      { a: "Professor canónico", b: "Eddie Torres também inspirou muitos pioneiros de LA", c: "Eddie Torres (o pai da pedagogia moderna do On2)" },
    ],
    sec3Title: "Uma breve história: Palladium, Eddie Torres e o On2 moderno",
    sec3Paragraphs: [
      "No início dos anos 50, o Palladium Ballroom de Nova York tornou-se o caldeirão da Mambo Craze. Dançarinos da classe trabalhadora do Bronx, Brooklyn e Spanish Harlem (porto-riquenhos, italianos, judeus e afro-americanos) dançavam Mambo de big-band liderado por Tito Puente, Tito Rodriguez e Machito. Os dançarinos lendários da época, como Cuban Pete, Millie Donay e Killer Joe Piro, fundiram o grounding afro-cubano com a acrobacia do Lindy Hop, o fraseado do tap e o frame de salão.",
      "O Mambo do Palladium que emergiu não era um único estilo padronizado. Era uma subcultura competitiva de variações improvisadas. Alguns dançarinos marcavam no 1, outros no 2, outros flutuavam entre ambos. O que unificava o estilo era a estética: tronco inferior ancorado, frame bloqueado, trabalho de pés rápido, peito quieto.",
      "Nos anos 70, depois da era do Palladium, um dançarino chamado **Eddie Torres** codificou o que hoje reconhecemos como o timing \"On2\" padrão. Torres estudou sob Tito Puente, e Puente disse-lhe que marcar no 2 era mais fiel à clave e ao tumbao do que marcar no 1. Torres pegou nesse princípio musical e construiu um sistema ensinável à sua volta. Todo currículo moderno de Salsa On2, incluindo este, em última análise traça-se até ao trabalho estrutural de Eddie Torres.",
    ],
    sec4Title: "Porque o On2 se sente diferente no teu corpo",
    sec4Paragraphs: [
      "A biomecânica do On2 é um cabo de guerra controlado. O teu tronco inferior rende-se ao chão: joelhos macios, centro de gravidade baixo, peso a rolar pela planta do pé antes do calcanhar cair. O teu tronco superior eleva-se: coluna estendida, ombros para baixo, peito quieto.",
      "Essa separação entre um tronco inferior ancorado e um tronco superior elevado é a razão pela qual os dançarinos de On2 de classe mundial parecem flutuar enquanto os seus pés se movem a velocidades vertiginosas. Também é por isso que a dança funciona musicalmente: a transferência de peso rolante e ligeiramente atrasada aterra naturalmente no slap da conga em vez de se adiantar.",
      "Os dois erros mais comuns que um recém-chegado comete são (1) dançar com pernas direitas e bloqueadas, o que mata o atraso e achata as ancas numa marcha, e (2) deixar os ombros saltar para cima e para baixo com o trabalho de pés, o que destrói o frame.",
    ],
    sec5Title: "Como começar a aprender Salsa On2",
    sec5Steps: [
      "**Treina o teu ouvido para o tumbao da conga.** Ouve faixas de salsa e isola a conga. O slap de tom aberto recorrente cai no 2 e no 6. Até conseguires ouvir esse slap, não conseguirás dançar On2 com fiabilidade.",
      "**Domina o passo básico sozinho, sem música.** Conta em voz alta \"1-2-3, 5-6-7\" com pausas no 4 e no 8. Marca atrás no 2, marca à frente no 6. Treina até o passo se tornar automático.",
      "**Adiciona música a um tempo lento (~90 BPM).** Quando o passo te entediar, põe uma faixa de Mambo lenta (Tito Puente ou Eddie Torres Big Band são canónicos) e faz o teu passo básico coincidir com a música enquanto continuas a contar em voz alta.",
      "**Treina a transferência de peso.** Pratica básicos em câmara lenta focando apenas em como o teu peso viaja: planta do pé primeiro, calcanhar cai depois, peso a assentar com os joelhos macios. Este é o hábito que separa um dançarino de um caminhante.",
      "**Faz um curso estruturado.** O auto-estudo estagna por volta dos seis meses. Um currículo que isola trabalho de pés, musicalidade, biomecânica e trabalho a pares na ordem certa leva-te para além desse plateau muito mais rápido. A razão exacta é [link]a regra dos 85%[/link] da aprendizagem motora: o teu cérebro precisa de um equilíbrio específico de sucesso e fracasso para continuar a melhorar.",
    ],
    sec6Title: "Mitos a ignorar",
    sec6Bullets: [
      "**\"O On2 é só para dançarinos avançados.\"** Falso. Iniciantes absolutos podem começar com On2. O ajuste é mais difícil se já treinaste o teu corpo para On1 durante anos, não se és novo.",
      "**\"A Salsa On2 é uma dança diferente da salsa.\"** É a mesma dança com um timing diferente. O trabalho a pares, o frame de conexão, os shines, as combinações. O vocabulário é partilhado.",
      "**\"Não podes dançar On2 com música de estilo LA.\"** Podes dançar On2 com qualquer música de salsa. Se se sente bem depende do tempo e do arranjo de percussão da música, não de se a música foi gravada em LA ou em Nova York.",
    ],
    faqs: [
      { q: "A Salsa On2 é mais difícil que a Salsa On1?", a: "O On2 não é objetivamente mais difícil. É menos intuitivo para pessoas criadas com música ocidental de tempo forte, porque o primeiro passo de break cai no 2, não no 1. Os dançarinos que já interiorizaram o On1 frequentemente reportam um período de ajuste de 2 a 4 semanas. Os iniciantes que aprendem On2 primeiro normalmente atingem o mesmo nível de conforto ao mesmo ritmo." },
      { q: "Preciso de aprender Salsa On1 antes de aprender On2?", a: "Não. Podes aprender On2 primeiro. Os alunos originais de Eddie Torres eram na maioria iniciantes absolutos. Começar com On2 evita reprogramar hábitos de timing mais tarde. Dito isto, se vives numa cidade onde a cena social dança On1, aprender On1 primeiro é pragmático porque precisas de algures para praticar." },
      { q: "A Salsa On2 é a mesma coisa que o Mambo?", a: "No mundo contemporâneo da salsa online, os dois termos são usados indistintamente. Historicamente, o Mambo era o estilo de dança dos anos 50 do Palladium Ballroom, formalizado por dançarinos como Cuban Pete, Millie Donay e mais tarde Eddie Torres. A Salsa On2 moderna, às vezes chamada de Estilo Nova York, é descendente direta dessa tradição." },
      { q: "Quanto tempo demora a aprender Salsa On2?", a: "Espera 2 a 4 semanas para dançar o passo básico musicalmente com confiança, 3 a 6 meses para dançar socialmente a nível iniciante com um par, e 1 a 2 anos para atingir conforto social intermediário. Estas estimativas pressupõem 3 a 5 horas de prática deliberada por semana, não frequência passiva de aulas." },
      { q: "Posso dançar Salsa On2 em qualquer clube de salsa?", a: "Podes dançar On2 com qualquer música de salsa, mas socialmente queres fazer coincidir o timing do teu par. Em Nova York, na maioria das cenas dedicadas a On2 da Europa e no mundo competitivo, domina o On2. Em grande parte da América Latina, das Caraíbas e em muitas cenas locais da Europa e dos EUA, domina o On1. A maioria dos dançarinos experientes consegue alternar entre os dois." },
    ],
    ctaHeading: "Os primeiros 30 dias de Salsa On2, estruturados.",
    howToSteps: [
      { name: "Treina o teu ouvido para o tumbao da conga", text: "Ouve faixas de Salsa On2 e isola a conga. O 'slap' recorrente cai no 2 e no 6 da medida de 8 tempos. Ouvir este slap é o pré-requisito para dançar On2 no tempo." },
      { name: "Domina o passo básico sozinho", text: "Pratica o básico de 6 passos (break à frente / break atrás) sem música primeiro. Conta em voz alta 1-2-3, 5-6-7 com uma pausa em 4 e 8. Marca (muda de direção) no 2 indo atrás, e no 6 indo à frente." },
      { name: "Adiciona música a tempo lento (~90 BPM)", text: "Quando o passo for automático, dança-o com uma faixa de Mambo lenta. Continua a contar em voz alta. A maioria dos professores recomenda gravações de tempo médio de Tito Puente ou de Eddie Torres Big Band como música de prática." },
      { name: "Treina a transferência de peso", text: "O On2 requer uma transferência de peso atrasada: colocas a planta do pé primeiro, depois deixas o calcanhar cair. Pratica básicos em câmara lenta focando apenas em como o peso viaja pelo pé." },
      { name: "Faz um curso estruturado", text: "O auto-estudo tem um teto. Um currículo que isola trabalho de pés, musicalidade, biomecânica e trabalho a pares na ordem certa vai acelerar-te para além do plateau que os dançarinos autodidatas atingem aos ~6 meses." },
    ],
  },

  // For brevity in this commit, the remaining locales (fr, de, it + 10 more)
  // reuse the English content. They are NOT in readyLocales — middleware
  // redirects them back to /what-is-salsa-on2 with the locale cookie pinned.
  fr: {
    metaTitle: "Qu'est-ce que la Salsa On2 ? Le guide complet du Mambo Style New York",
    metaDescription:
      "La Salsa On2 est un style de timing où les danseurs marquent sur le 2e temps de la musique. Aussi appelée Style New York ou Mambo. Définition complète, histoire, biomécanique et un parcours en 5 étapes pour débuter.",
    breadcrumbHome: "Accueil",
    breadcrumbCurrent: "Salsa On2",
    badge: "Le Guide",
    h1Pre: "Qu'est-ce que la Salsa On2 ? Le guide complet du ",
    h1Accent: "Mambo Style New York",
    shortAnswerRich:
      "La Salsa On2 est un style de timing de la danse salsa où tu marques (changes de direction) sur le **deuxième temps** de la musique au lieu du premier. On l'appelle aussi **Style New York** ou **Mambo**. Le style a été formalisé au Palladium Ballroom de New York dans les années 50 et codifié pour l'enseignement moderne par Eddie Torres dans les années 70. Danser On2 aligne ton corps avec le motif de slap de la conga, donnant à la danse un feeling plus doux et plus syncopé que le On1.",
    sec1Title: "L'idée centrale : compter en 8",
    sec1Paragraphs: [
      "Chaque morceau de salsa est écrit en mesure 4/4, que les danseurs comptent comme une mesure de 8 temps répétée (1, 2, 3, 4, 5, 6, 7, 8). Que tu danses On1 ou On2, tu fais six pas dans chaque 8 temps : trois dans la première moitié et trois dans la seconde, avec des pauses sur le 4 et le 8.",
      "Ce qui change entre les deux styles, c'est *quand* tu changes de direction, ce que les danseurs appellent le « pas de break ». Un danseur On1 change de direction sur le 1. Un danseur On2 change de direction sur le 2. Le reste du travail de pieds découle de cette unique décision.",
      "La raison pour laquelle ça compte est musicale. Dans la musique afro-cubaine, la conga joue un motif appelé tumbao. Son accent caractéristique, le slap au son ouvert, tombe sur le 2 et le 6 de chaque mesure de 8 temps, pas sur le 1 ni le 5. Quand tu marques sur le 2, ton changement de poids atterrit sur ce slap. Ton corps se déplace en synchronie avec la section rythmique du groupe au lieu de la mélodie.",
    ],
    sec2Title: "On1 vs On2 en un coup d'œil",
    sec2HeadAttr: "Attribut",
    sec2HeadOn1: "Salsa On1 (Style LA)",
    sec2HeadOn2: "Salsa On2 (Style NY)",
    sec2Rows: [
      { a: "Pas de break", b: "Temps 1", c: "Temps 2" },
      { a: "Feeling", b: "Staccato, énergique", c: "Doux, posé" },
      { a: "Synchronisation avec", b: "Mélodie / temps fort", c: "Slap de la conga / section rythmique" },
      { a: "Origine", b: "Los Angeles, années 90 (frères Vazquez)", c: "New York, Palladium années 50" },
      { a: "Scènes dominantes", b: "LA, la majeure partie de l'Amérique latine, la plupart des villes européennes", c: "NYC, salsa de compétition, scènes dédiées à On2 dans le monde entier" },
      { a: "Enseignant canonique", b: "Eddie Torres a aussi inspiré beaucoup de pionniers de LA", c: "Eddie Torres (le père de la pédagogie moderne du On2)" },
    ],
    sec3Title: "Une brève histoire : Palladium, Eddie Torres et le On2 moderne",
    sec3Paragraphs: [
      "Au début des années 50, le Palladium Ballroom de New York est devenu le creuset de la Mambo Craze. Des danseurs de la classe ouvrière du Bronx, de Brooklyn et du Spanish Harlem (portoricains, italiens, juifs et afro-américains) dansaient sur du Mambo big-band mené par Tito Puente, Tito Rodriguez et Machito. Les danseurs légendaires de l'époque comme Cuban Pete, Millie Donay et Killer Joe Piro fusionnaient le grounding afro-cubain avec l'acrobatie du Lindy Hop, le phrasé du tap et le frame des danses de salon.",
      "Le Mambo du Palladium qui en a émergé n'était pas un seul style standardisé. C'était une sous-culture compétitive de variations improvisées. Certains danseurs marquaient sur le 1, d'autres sur le 2, d'autres flottaient entre les deux. Ce qui unifiait le style, c'était l'esthétique : bas du corps ancré, frame verrouillé, travail de pieds rapide, poitrine immobile.",
      "Dans les années 70, après l'ère du Palladium, un danseur nommé **Eddie Torres** a codifié ce qu'on reconnaît aujourd'hui comme le timing « On2 » standard. Torres a étudié sous Tito Puente, et Puente lui a dit que marquer sur le 2 était plus fidèle à la clave et au tumbao que marquer sur le 1. Torres a pris ce principe musical et a construit un système enseignable autour. Tout cursus moderne de Salsa On2, y compris celui-ci, remonte finalement au travail structurel d'Eddie Torres.",
    ],
    sec4Title: "Pourquoi le On2 se ressent différemment dans ton corps",
    sec4Paragraphs: [
      "La biomécanique du On2 est un bras de fer contrôlé. Ton bas du corps se rend au sol : genoux souples, centre de gravité bas, poids qui roule par la plante du pied avant que le talon ne tombe. Ton haut du corps se grandit : colonne étirée, épaules basses, poitrine immobile.",
      "Cette séparation entre un bas du corps ancré et un haut du corps élevé est la raison pour laquelle les danseurs On2 de classe mondiale donnent l'impression de flotter alors que leurs pieds bougent à des vitesses vertigineuses. C'est aussi pourquoi la danse fonctionne musicalement : le transfert de poids roulant et légèrement retardé atterrit naturellement sur le slap de la conga au lieu de le devancer.",
      "Les deux erreurs les plus courantes qu'un débutant fait sont (1) danser avec des jambes droites et verrouillées, ce qui tue le retard et aplatit les hanches en marche, et (2) laisser les épaules rebondir avec le travail de pieds, ce qui détruit le frame.",
    ],
    sec5Title: "Comment commencer à apprendre la Salsa On2",
    sec5Steps: [
      "**Entraîne ton oreille au tumbao de la conga.** Écoute des morceaux de salsa et isole la conga. Le slap au son ouvert récurrent tombe sur le 2 et le 6. Tant que tu n'entends pas ce slap, tu ne pourras pas danser On2 de manière fiable.",
      "**Maîtrise le pas de base seul, sans musique.** Compte à voix haute « 1-2-3, 5-6-7 » avec des pauses sur le 4 et le 8. Marque arrière sur le 2, marque avant sur le 6. Travaille jusqu'à ce que le pas devienne automatique.",
      "**Ajoute la musique à un tempo lent (~90 BPM).** Quand le pas est ennuyeux, mets un morceau de Mambo lent (Tito Puente ou Eddie Torres Big Band sont canoniques) et synchronise ton pas de base avec la musique tout en continuant à compter à voix haute.",
      "**Travaille le transfert de poids.** Pratique des bases au ralenti en te concentrant uniquement sur la façon dont ton poids voyage : plante du pied d'abord, talon ensuite, poids qui s'installe avec les genoux souples. C'est l'habitude qui sépare un danseur d'un marcheur.",
      "**Suis un cursus structuré.** L'auto-apprentissage plafonne vers six mois. Un cursus qui isole le travail de pieds, la musicalité, la biomécanique et le travail en couple dans le bon ordre te fait passer ce plafond beaucoup plus vite. La raison exacte est [link]la règle des 85%[/link] de l'apprentissage moteur : ton cerveau a besoin d'un équilibre spécifique de réussite et d'échec pour continuer à progresser.",
    ],
    sec6Title: "Mythes à ignorer",
    sec6Bullets: [
      "**« Le On2, c'est seulement pour les danseurs avancés. »** Faux. Les débutants absolus peuvent commencer par le On2. L'ajustement est plus difficile si tu as déjà entraîné ton corps au On1 pendant des années, pas si tu es nouveau.",
      "**« La Salsa On2 est une danse différente de la salsa. »** C'est la même danse avec un timing différent. Le travail en couple, le frame de connexion, les shines, les combinaisons. Le vocabulaire est partagé.",
      "**« On ne peut pas danser On2 sur de la musique style LA. »** Tu peux danser On2 sur n'importe quel morceau de salsa. Si ça se ressent bien dépend du tempo et de l'arrangement de percussion du morceau, pas du fait que le morceau ait été enregistré à LA ou à New York.",
    ],
    faqs: [
      { q: "La Salsa On2 est-elle plus difficile que la Salsa On1 ?", a: "Le On2 n'est pas objectivement plus difficile. Il est moins intuitif pour les gens élevés à la musique occidentale à temps fort, parce que le premier pas de break tombe sur le 2, pas sur le 1. Les danseurs qui ont déjà intériorisé le On1 rapportent souvent une période d'ajustement de 2 à 4 semaines. Les débutants qui apprennent le On2 en premier atteignent généralement le même niveau de confort au même rythme." },
      { q: "Dois-je apprendre la Salsa On1 avant d'apprendre le On2 ?", a: "Non. Tu peux apprendre le On2 en premier. Les premiers étudiants d'Eddie Torres étaient pour la plupart des débutants absolus. Commencer par le On2 évite de recâbler les habitudes de timing plus tard. Cela dit, si tu vis dans une ville où la scène sociale danse On1, apprendre On1 d'abord est pragmatique parce que tu as besoin d'un endroit pour pratiquer." },
      { q: "La Salsa On2 est-elle la même chose que le Mambo ?", a: "Dans le monde contemporain de la salsa en ligne, les deux termes sont utilisés indifféremment. Historiquement, le Mambo était le style de danse des années 50 du Palladium Ballroom, formalisé par des danseurs comme Cuban Pete, Millie Donay et plus tard Eddie Torres. La Salsa On2 moderne, parfois appelée Style New York, est une descendante directe de cette tradition." },
      { q: "Combien de temps faut-il pour apprendre la Salsa On2 ?", a: "Compte 2 à 4 semaines pour danser le pas de base musicalement avec confiance, 3 à 6 mois pour danser socialement à un niveau débutant avec un partenaire, et 1 à 2 ans pour atteindre un confort social intermédiaire. Ces estimations supposent 3 à 5 heures de pratique délibérée par semaine, pas une fréquentation passive des cours." },
      { q: "Puis-je danser la Salsa On2 dans n'importe quel club de salsa ?", a: "Tu peux danser On2 sur n'importe quel morceau de salsa, mais socialement tu veux faire correspondre le timing de ton partenaire. À New York, dans la plupart des scènes dédiées à On2 d'Europe et dans le monde compétitif, le On2 domine. Dans une grande partie de l'Amérique latine, des Caraïbes et dans de nombreuses scènes locales d'Europe et des États-Unis, le On1 domine. La plupart des danseurs expérimentés peuvent passer de l'un à l'autre." },
    ],
    ctaHeading: "Les 30 premiers jours de Salsa On2, structurés.",
    howToSteps: [
      { name: "Entraîne ton oreille au tumbao de la conga", text: "Écoute des morceaux de Salsa On2 et isole la conga. Le 'slap' récurrent tombe sur le 2 et le 6 de la mesure de 8 temps. Entendre ce slap est le prérequis pour danser On2 dans le tempo." },
      { name: "Maîtrise le pas de base seul", text: "Pratique le pas de base à 6 pas (break avant / break arrière) sans musique d'abord. Compte à voix haute 1-2-3, 5-6-7 avec une pause sur 4 et 8. Marque (change de direction) sur le 2 en allant en arrière, et sur le 6 en allant en avant." },
      { name: "Ajoute la musique à un tempo lent (~90 BPM)", text: "Une fois le pas automatique, danse-le sur un morceau de Mambo lent. Continue à compter à voix haute. La plupart des professeurs recommandent les enregistrements à tempo moyen de Tito Puente ou d'Eddie Torres Big Band comme musique de pratique." },
      { name: "Travaille le transfert de poids", text: "Le On2 nécessite un transfert de poids retardé : tu places la plante du pied d'abord, puis tu laisses le talon tomber. Pratique des pas de base au ralenti en te concentrant uniquement sur la façon dont le poids voyage à travers le pied." },
      { name: "Suis un cursus structuré", text: "L'auto-apprentissage a un plafond. Un cursus qui isole le travail de pieds, la musicalité, la biomécanique et le travail en couple dans le bon ordre te fera dépasser le plafond que les danseurs autodidactes atteignent à ~6 mois." },
    ],
  },
  de: {
    metaTitle: "Was ist Salsa On2? Der vollständige Guide zum New York Style Mambo",
    metaDescription:
      "Salsa On2 ist ein Timing-Stil, bei dem Tänzer auf dem 2. Beat der Musik brechen. Auch New York Style oder Mambo genannt. Vollständige Definition, Geschichte, Biomechanik und ein 5-Schritte-Einsteigerpfad.",
    breadcrumbHome: "Startseite",
    breadcrumbCurrent: "Salsa On2",
    badge: "Der Guide",
    h1Pre: "Was ist Salsa On2? Der vollständige Guide zum ",
    h1Accent: "New York Style Mambo",
    shortAnswerRich:
      "Salsa On2 ist ein Timing-Stil des Salsa-Tanzes, bei dem du auf dem **zweiten Beat** der Musik brichst (die Richtung wechselst) statt auf dem ersten. Er wird auch **New York Style** oder **Mambo** genannt. Der Stil wurde im Palladium Ballroom in New York in den 1950er Jahren formalisiert und in den 1970ern von Eddie Torres für den modernen Unterricht kodifiziert. On2 zu tanzen richtet deinen Körper am Slap-Muster der Conga aus und gibt dem Tanz ein sanfteres, synkopierteres Feeling als On1.",
    sec1Title: "Die Kernidee: Zählen in 8ern",
    sec1Paragraphs: [
      "Jeder Salsa-Song ist im 4/4-Takt geschrieben, den Tänzer als wiederkehrendes 8-Count-Mass (1, 2, 3, 4, 5, 6, 7, 8) zählen. Egal, ob du On1 oder On2 tanzt, du machst sechs Schritte in jedem 8-Count: drei in der ersten Hälfte und drei in der zweiten, mit Pausen auf 4 und 8.",
      "Was sich zwischen den beiden Stilen ändert, ist *wann* du die Richtung wechselst, was Tänzer den „Break-Schritt“ nennen. Ein On1-Tänzer wechselt die Richtung auf der 1. Ein On2-Tänzer wechselt die Richtung auf der 2. Der Rest der Fussarbeit folgt aus dieser einen Entscheidung.",
      "Der Grund, warum das wichtig ist, ist musikalisch. In der afro-kubanischen Musik spielt die Conga ein Muster namens Tumbao. Sein definierender Akzent, der Open-Tone-Slap, fällt auf die 2 und die 6 jedes 8-Count-Masses, nicht auf die 1 und die 5. Wenn du auf der 2 brichst, landet dein Gewichtswechsel auf diesem Slap. Dein Körper bewegt sich synchron zur Rhythmussektion der Band statt zur Melodie.",
    ],
    sec2Title: "On1 vs. On2 auf einen Blick",
    sec2HeadAttr: "Attribut",
    sec2HeadOn1: "Salsa On1 (LA Style)",
    sec2HeadOn2: "Salsa On2 (NY Style)",
    sec2Rows: [
      { a: "Break-Schritt", b: "Beat 1", c: "Beat 2" },
      { a: "Feeling", b: "Staccato, energetisch", c: "Sanft, entspannt" },
      { a: "Synchronisation mit", b: "Melodie / Downbeat", c: "Conga-Slap / Rhythmussektion" },
      { a: "Ursprung", b: "Los Angeles, 1990er (Vazquez-Brüder)", c: "New York, 1950er Palladium" },
      { a: "Dominante Szenen", b: "LA, grosse Teile Lateinamerikas, die meisten europäischen Städte", c: "NYC, Wettkampf-Salsa, dedizierte On2-Szenen weltweit" },
      { a: "Kanonischer Lehrer", b: "Eddie Torres inspirierte auch viele LA-Pioniere", c: "Eddie Torres (der Vater der modernen On2-Pädagogik)" },
    ],
    sec3Title: "Eine kurze Geschichte: Palladium, Eddie Torres und modernes On2",
    sec3Paragraphs: [
      "In den frühen 1950er Jahren wurde der Palladium Ballroom in New York zum Schmelztiegel der Mambo Craze. Tänzer aus der Arbeiterklasse aus der Bronx, Brooklyn und Spanish Harlem (Puerto-Ricaner, Italiener, Juden und Afroamerikaner) tanzten zu Big-Band-Mambo, geleitet von Tito Puente, Tito Rodriguez und Machito. Die legendären Tänzer der Ära wie Cuban Pete, Millie Donay und Killer Joe Piro verschmolzen afro-kubanisches Grounding mit Lindy-Hop-Akrobatik, Tap-Phrasierung und Ballroom-Frame.",
      "Das Palladium-Mambo, das daraus hervorging, war kein einzelner, standardisierter Stil. Es war eine kompetitive Subkultur ad-hoc-Variationen. Manche Tänzer brachen auf der 1, manche auf der 2, manche schwankten dazwischen. Was den Stil einte, war die Ästhetik: geerdeter Unterkörper, gesperrter Frame, schnelle Fussarbeit, ruhige Brust.",
      "In den 1970er Jahren, nach der Palladium-Ära, kodifizierte ein Tänzer namens **Eddie Torres** das, was wir heute als das Standard-„On2“-Timing erkennen. Torres lernte unter Tito Puente, und Puente sagte ihm, auf der 2 zu brechen sei der Clave und dem Tumbao treuer als auf der 1 zu brechen. Torres nahm dieses musikalische Prinzip und baute ein lehrbares System darum herum. Jedes moderne Salsa-On2-Curriculum, einschliesslich dieses, geht letztlich auf Eddie Torres' strukturelle Arbeit zurück.",
    ],
    sec4Title: "Warum sich On2 anders im Körper anfühlt",
    sec4Paragraphs: [
      "Die Biomechanik von On2 ist ein kontrolliertes Tauziehen. Dein Unterkörper ergibt sich dem Boden: Knie weich, Schwerpunkt tief, Gewicht rollt durch den Fussballen, bevor die Ferse fällt. Dein Oberkörper streckt sich nach oben: Wirbelsäule angehoben, Schultern unten, Brust ruhig.",
      "Diese Trennung zwischen einem geerdeten Unterkörper und einem angehobenen Oberkörper ist der Grund, warum Weltklasse-On2-Tänzer aussehen, als würden sie schweben, während ihre Füsse mit schwindelerregender Geschwindigkeit bewegen. Es ist auch der Grund, warum der Tanz musikalisch funktioniert: Der rollende, leicht verzögerte Gewichtstransfer landet natürlich auf dem Conga-Slap, statt ihm vorauszueilen.",
      "Die zwei häufigsten Fehler, die ein Anfänger macht, sind (1) mit geraden, gesperrten Beinen zu tanzen, was die Verzögerung tötet und die Hüften zum Marsch flacht, und (2) die Schultern mit der Fussarbeit auf und ab hüpfen zu lassen, was den Frame zerstört.",
    ],
    sec5Title: "Wie du anfängst, Salsa On2 zu lernen",
    sec5Steps: [
      "**Trainiere dein Ohr für das Conga-Tumbao.** Höre Salsa-Tracks und isoliere die Conga. Der wiederkehrende Open-Tone-Slap landet auf der 2 und der 6. Bis du diesen Slap hören kannst, kannst du On2 nicht zuverlässig tanzen.",
      "**Beherrsche den Grundschritt allein, ohne Musik.** Zähle laut „1-2-3, 5-6-7“ mit Pausen auf der 4 und der 8. Brich zurück auf der 2, brich vorwärts auf der 6. Drille, bis der Schritt automatisch ist.",
      "**Füge Musik in einem langsamen Tempo hinzu (~90 BPM).** Wenn der Schritt langweilig wird, leg einen langsamen Mambo-Track auf (Tito Puente oder Eddie Torres Big Band sind kanonisch) und passe deinen Grundschritt an die Musik an, während du weiter laut zählst.",
      "**Drille den Gewichtstransfer.** Übe Zeitlupen-Grundschritte und konzentriere dich nur darauf, wie dein Gewicht reist: zuerst Fussballen, dann Ferse, Gewicht setzt sich mit weichen Knien. Das ist die Gewohnheit, die einen Tänzer von einem Schreiter trennt.",
      "**Mach einen strukturierten Kurs.** Das Selbststudium plateauisiert nach etwa sechs Monaten. Ein Curriculum, das Fussarbeit, Musikalität, Körpermechanik und Partnerwerk in der richtigen Reihenfolge isoliert, bringt dich viel schneller über dieses Plateau hinaus. Der genaue Grund ist [link]die 85%-Regel[/link] des motorischen Lernens: Dein Gehirn braucht eine bestimmte Balance aus Erfolg und Misserfolg, um sich weiter zu verbessern.",
    ],
    sec6Title: "Mythen, die du ignorieren solltest",
    sec6Bullets: [
      "**„On2 ist nur für fortgeschrittene Tänzer.“** Falsch. Absolute Anfänger können mit On2 beginnen. Die Anpassung ist schwieriger, wenn du deinen Körper bereits jahrelang auf On1 trainiert hast, nicht wenn du neu bist.",
      "**„Salsa On2 ist ein anderer Tanz als Salsa.“** Es ist derselbe Tanz mit anderem Timing. Das Partnerwerk, der Verbindungsframe, die Shines, die Kombinationen. Das Vokabular ist geteilt.",
      "**„Man kann nicht On2 zu LA-Style-Musik tanzen.“** Du kannst On2 zu jedem Salsa-Song tanzen. Ob es sich gut anfühlt, hängt vom Tempo und der Perkussionsanordnung des Songs ab, nicht davon, ob der Song in LA oder New York aufgenommen wurde.",
    ],
    faqs: [
      { q: "Ist Salsa On2 schwieriger als Salsa On1?", a: "On2 ist objektiv nicht schwieriger. Es ist weniger intuitiv für Menschen, die mit westlicher Downbeat-Musik aufgewachsen sind, weil der erste Break-Schritt auf die 2 fällt, nicht auf die 1. Tänzer, die On1 bereits verinnerlicht haben, berichten oft von einer Anpassungszeit von 2-4 Wochen. Anfänger, die On2 zuerst lernen, erreichen normalerweise im selben Tempo dasselbe Komfortniveau." },
      { q: "Muss ich Salsa On1 lernen, bevor ich On2 lerne?", a: "Nein. Du kannst On2 zuerst lernen. Eddie Torres' ursprüngliche Schüler waren grösstenteils absolute Anfänger. Mit On2 zu beginnen, vermeidet das spätere Umverdrahten von Timing-Gewohnheiten. Allerdings: Wenn du in einer Stadt lebst, in der die soziale Szene On1 tanzt, ist es pragmatisch, On1 zuerst zu lernen, weil du irgendwo üben musst." },
      { q: "Ist Salsa On2 dasselbe wie Mambo?", a: "In der zeitgenössischen Online-Salsa-Welt werden die beiden Begriffe austauschbar verwendet. Historisch war Mambo der Tanzstil der 1950er Jahre des Palladium Ballroom, formalisiert von Tänzern wie Cuban Pete, Millie Donay und später Eddie Torres. Modernes Salsa On2, manchmal New York Style genannt, ist ein direkter Nachfahre dieser Tradition." },
      { q: "Wie lange dauert es, Salsa On2 zu lernen?", a: "Rechne mit 2-4 Wochen, um den Grundschritt musikalisch mit Sicherheit zu tanzen, 3-6 Monate, um sozial auf Anfängerniveau mit einem Partner zu tanzen, und 1-2 Jahre, um intermediären sozialen Komfort zu erreichen. Diese Schätzungen setzen 3-5 Stunden bewusste Übung pro Woche voraus, nicht passiven Kursbesuch." },
      { q: "Kann ich Salsa On2 in jedem Salsa-Club tanzen?", a: "Du kannst On2 zu jedem Salsa-Song tanzen, aber sozial willst du dich an das Timing deines Partners anpassen. In New York City, den meisten dedizierten On2-Szenen Europas und der Wettkampfwelt dominiert On2. In grossen Teilen Lateinamerikas, der Karibik und vielen lokalen Szenen in Europa und den USA dominiert On1. Die meisten erfahrenen Tänzer können zwischen beiden wechseln." },
    ],
    ctaHeading: "Die ersten 30 Tage Salsa On2, strukturiert.",
    howToSteps: [
      { name: "Trainiere dein Ohr für das Conga-Tumbao", text: "Höre Salsa-On2-Tracks und isoliere die Conga. Der wiederkehrende 'Slap' fällt auf die 2 und die 6 des 8-Count-Masses. Diesen Slap zu hören ist die Voraussetzung, um On2 im Takt zu tanzen." },
      { name: "Beherrsche den Grundschritt allein", text: "Übe den 6-Schritt-Grundschritt (Vorwärtsbreak / Rückwärtsbreak) zuerst ohne Musik. Zähle laut 1-2-3, 5-6-7 mit einer Pause auf 4 und 8. Brich (wechsle die Richtung) auf der 2, wenn du nach hinten gehst, und auf der 6, wenn du nach vorne gehst." },
      { name: "Füge Musik in einem langsamen Tempo hinzu (~90 BPM)", text: "Sobald der Schritt automatisch ist, tanze ihn zu einem langsamen Mambo-Track. Zähle weiter laut. Die meisten Lehrer empfehlen mid-tempo Aufnahmen von Tito Puente oder Eddie Torres Big Band als Übungsmusik." },
      { name: "Drille den Gewichtstransfer", text: "On2 erfordert einen verzögerten Gewichtstransfer: Du setzt zuerst den Fussballen, dann lässt du die Ferse fallen. Übe Zeitlupen-Grundschritte und konzentriere dich nur darauf, wie das Gewicht durch den Fuss reist." },
      { name: "Mach einen strukturierten Kurs", text: "Das Selbststudium hat eine Decke. Ein Curriculum, das Fussarbeit, Musikalität, Körpermechanik und Partnerwerk in der richtigen Reihenfolge isoliert, beschleunigt dich über das Plateau hinaus, das selbstunterrichtete Tänzer bei ~6 Monaten erreichen." },
    ],
  },
  it: {
    metaTitle: "Cos'è la Salsa On2? La guida completa al Mambo Stile New York",
    metaDescription:
      "La Salsa On2 è uno stile di timing in cui i ballerini marcano sul 2° tempo della musica. Detta anche Stile New York o Mambo. Definizione completa, storia, biomeccanica e un percorso in 5 passi per iniziare.",
    breadcrumbHome: "Home",
    breadcrumbCurrent: "Salsa On2",
    badge: "La Guida",
    h1Pre: "Cos'è la Salsa On2? La guida completa al ",
    h1Accent: "Mambo Stile New York",
    shortAnswerRich:
      "La Salsa On2 è uno stile di timing del ballo salsa in cui marchi (cambi direzione) sul **secondo tempo** della musica invece che sul primo. È anche chiamata **Stile New York** o **Mambo**. Lo stile è stato formalizzato al Palladium Ballroom di New York negli anni '50 e codificato per l'insegnamento moderno da Eddie Torres negli anni '70. Ballare On2 allinea il tuo corpo con il pattern di slap della conga, dando al ballo un feeling più morbido e sincopato rispetto a On1.",
    sec1Title: "L'idea centrale: contare in 8",
    sec1Paragraphs: [
      "Ogni canzone di salsa è scritta in tempo 4/4, che i ballerini contano come una misura di 8 tempi ripetuta (1, 2, 3, 4, 5, 6, 7, 8). Che tu balli On1 o On2, fai sei passi all'interno di ogni 8 tempi: tre nella prima metà e tre nella seconda, con pause sul 4 e sull'8.",
      "Quello che cambia tra i due stili è *quando* cambi direzione, ciò che i ballerini chiamano \"il passo di break\". Un ballerino On1 cambia direzione sull'1. Un ballerino On2 cambia direzione sul 2. Il resto del lavoro di piedi deriva da quella singola decisione.",
      "Il motivo per cui questo conta è musicale. Nella musica afro-cubana, la conga suona un pattern chiamato tumbao. Il suo accento caratterizzante, lo slap di tono aperto, cade sul 2 e sul 6 di ogni misura di 8 tempi, non sull'1 e sul 5. Quando marchi sul 2, il tuo cambio di peso atterra su quello slap. Il tuo corpo si muove in sincronia con la sezione ritmica della band invece che con la melodia.",
    ],
    sec2Title: "On1 vs On2 a colpo d'occhio",
    sec2HeadAttr: "Attributo",
    sec2HeadOn1: "Salsa On1 (Stile LA)",
    sec2HeadOn2: "Salsa On2 (Stile NY)",
    sec2Rows: [
      { a: "Passo di break", b: "Tempo 1", c: "Tempo 2" },
      { a: "Feeling", b: "Staccato, energico", c: "Morbido, rilassato" },
      { a: "Sincronizzato con", b: "Melodia / battere", c: "Slap della conga / sezione ritmica" },
      { a: "Origine", b: "Los Angeles, anni '90 (fratelli Vazquez)", c: "New York, Palladium anni '50" },
      { a: "Scene dominanti", b: "LA, gran parte dell'America Latina, la maggior parte delle città europee", c: "NYC, salsa di competizione, scene dedicate a On2 nel mondo" },
      { a: "Insegnante canonico", b: "Eddie Torres ha ispirato anche molti pionieri di LA", c: "Eddie Torres (il padre della pedagogia moderna di On2)" },
    ],
    sec3Title: "Una breve storia: Palladium, Eddie Torres e l'On2 moderno",
    sec3Paragraphs: [
      "All'inizio degli anni '50, il Palladium Ballroom di New York divenne il crogiolo della Mambo Craze. Ballerini della classe operaia del Bronx, Brooklyn e Spanish Harlem (portoricani, italiani, ebrei e afroamericani) ballavano su Mambo big-band guidato da Tito Puente, Tito Rodriguez e Machito. I ballerini leggendari dell'epoca come Cuban Pete, Millie Donay e Killer Joe Piro fondevano il grounding afrocubano con l'acrobazia del Lindy Hop, il fraseggio del tap e il frame da sala.",
      "Il Mambo del Palladium che ne emerse non era un singolo stile standardizzato. Era una sottocultura competitiva di variazioni improvvisate. Alcuni ballerini marcavano sull'1, altri sul 2, altri fluttuavano tra i due. Quello che unificava lo stile era l'estetica: parte inferiore radicata, frame bloccato, lavoro di piedi rapido, petto immobile.",
      "Negli anni '70, dopo l'era del Palladium, un ballerino di nome **Eddie Torres** codificò ciò che oggi riconosciamo come il timing standard \"On2\". Torres studiò sotto Tito Puente, e Puente gli disse che marcare sul 2 era più fedele alla clave e al tumbao che marcare sull'1. Torres prese quel principio musicale e costruì un sistema insegnabile attorno. Ogni curriculum moderno di Salsa On2, incluso questo, in ultima analisi risale al lavoro strutturale di Eddie Torres.",
    ],
    sec4Title: "Perché On2 si sente diverso nel tuo corpo",
    sec4Paragraphs: [
      "La biomeccanica di On2 è un tiro alla fune controllato. La tua parte inferiore si arrende al pavimento: ginocchia morbide, baricentro basso, peso che rotola attraverso la pianta del piede prima che il tallone scenda. La tua parte superiore si allunga verso l'alto: colonna sollevata, spalle giù, petto fermo.",
      "Quella separazione tra una parte inferiore radicata e una parte superiore sollevata è il motivo per cui i ballerini di On2 di livello mondiale sembrano fluttuare mentre i loro piedi si muovono a velocità vertiginose. È anche il motivo per cui il ballo funziona musicalmente: il trasferimento di peso rotolante e leggermente ritardato atterra naturalmente sullo slap della conga invece di anticiparlo.",
      "I due errori più comuni che un nuovo arrivato fa sono (1) ballare con gambe dritte e bloccate, che uccide il ritardo e appiattisce le anche in una marcia, e (2) lasciare che le spalle rimbalzino su e giù con il lavoro di piedi, che distrugge il frame.",
    ],
    sec5Title: "Come iniziare a imparare la Salsa On2",
    sec5Steps: [
      "**Allena il tuo orecchio per il tumbao della conga.** Ascolta tracce di salsa e isola la conga. Lo slap di tono aperto ricorrente atterra sul 2 e sul 6. Finché non riesci a sentire quello slap, non puoi ballare On2 in modo affidabile.",
      "**Padroneggia il passo base da solo, senza musica.** Conta ad alta voce \"1-2-3, 5-6-7\" con pause sul 4 e sull'8. Marca indietro sul 2, marca avanti sul 6. Drilla finché il passo non diventa automatico.",
      "**Aggiungi musica a un tempo lento (~90 BPM).** Una volta che il passo è noioso, metti una traccia di Mambo lenta (Tito Puente o Eddie Torres Big Band sono canonici) e abbina il tuo passo base alla musica continuando a contare ad alta voce.",
      "**Drilla il trasferimento di peso.** Pratica passi base al rallentatore concentrandoti solo su come viaggia il tuo peso: pianta del piede prima, tallone dopo, peso che si stabilizza con le ginocchia morbide. Questa è l'abitudine che separa un ballerino da un camminatore.",
      "**Segui un corso strutturato.** L'autoapprendimento si stabilizza intorno ai sei mesi. Un curriculum che isola il lavoro di piedi, la musicalità, la biomeccanica e il lavoro in coppia nell'ordine giusto ti porta oltre quel plateau molto più velocemente. La ragione esatta è [link]la regola dell'85%[/link] dell'apprendimento motorio: il tuo cervello ha bisogno di un equilibrio specifico di successo e fallimento per continuare a migliorare.",
    ],
    sec6Title: "Miti da ignorare",
    sec6Bullets: [
      "**\"On2 è solo per ballerini avanzati.\"** Falso. I principianti assoluti possono iniziare con On2. L'aggiustamento è più difficile se hai già allenato il tuo corpo a On1 per anni, non se sei nuovo.",
      "**\"La Salsa On2 è un ballo diverso dalla salsa.\"** È lo stesso ballo con un timing diverso. Il lavoro in coppia, il frame di connessione, gli shines, le combinazioni. Il vocabolario è condiviso.",
      "**\"Non puoi ballare On2 con musica stile LA.\"** Puoi ballare On2 con qualsiasi canzone di salsa. Se si sente bene dipende dal tempo e dall'arrangiamento di percussione della canzone, non dal fatto che la canzone sia stata registrata a LA o a New York.",
    ],
    faqs: [
      { q: "La Salsa On2 è più difficile della Salsa On1?", a: "On2 non è oggettivamente più difficile. È meno intuitivo per le persone cresciute con musica occidentale a tempo forte, perché il primo passo di break cade sul 2, non sull'1. I ballerini che hanno già interiorizzato On1 spesso riportano un periodo di aggiustamento di 2-4 settimane. I principianti che imparano On2 per primi di solito raggiungono lo stesso livello di comfort allo stesso ritmo." },
      { q: "Devo imparare la Salsa On1 prima di imparare On2?", a: "No. Puoi imparare On2 prima. Gli studenti originali di Eddie Torres erano per lo più principianti assoluti. Iniziare con On2 evita di dover ricablare le abitudini di timing in seguito. Detto ciò, se vivi in una città dove la scena sociale balla On1, imparare On1 prima è pragmatico perché hai bisogno di un posto dove esercitarti." },
      { q: "La Salsa On2 è la stessa cosa del Mambo?", a: "Nel mondo contemporaneo della salsa online, i due termini sono usati in modo intercambiabile. Storicamente, il Mambo era lo stile di ballo degli anni '50 del Palladium Ballroom, formalizzato da ballerini come Cuban Pete, Millie Donay e successivamente Eddie Torres. La Salsa On2 moderna, a volte chiamata Stile New York, è una discendente diretta di quella tradizione." },
      { q: "Quanto tempo ci vuole per imparare la Salsa On2?", a: "Aspettati 2-4 settimane per ballare il passo base musicalmente con sicurezza, 3-6 mesi per ballare socialmente a livello principiante con un partner, e 1-2 anni per raggiungere comfort sociale intermedio. Queste stime presumono 3-5 ore di pratica deliberata a settimana, non frequenza passiva delle lezioni." },
      { q: "Posso ballare la Salsa On2 in qualsiasi club di salsa?", a: "Puoi ballare On2 con qualsiasi canzone di salsa, ma socialmente vuoi abbinare il timing del tuo partner. A New York, nella maggior parte delle scene dedicate a On2 d'Europa e nel mondo competitivo, On2 domina. In gran parte dell'America Latina, dei Caraibi e in molte scene locali in Europa e negli Stati Uniti, On1 domina. La maggior parte dei ballerini esperti può passare da uno all'altro." },
    ],
    ctaHeading: "I primi 30 giorni di Salsa On2, strutturati.",
    howToSteps: [
      { name: "Allena il tuo orecchio per il tumbao della conga", text: "Ascolta tracce di Salsa On2 e isola la conga. Lo 'slap' ricorrente cade sul 2 e sul 6 della misura di 8 tempi. Sentire questo slap è il prerequisito per ballare On2 a tempo." },
      { name: "Padroneggia il passo base da solo", text: "Pratica il passo base a 6 (break avanti / break indietro) prima senza musica. Conta ad alta voce 1-2-3, 5-6-7 con una pausa su 4 e 8. Marca (cambia direzione) sul 2 andando indietro, e sul 6 andando avanti." },
      { name: "Aggiungi musica a un tempo lento (~90 BPM)", text: "Una volta che il passo è automatico, ballalo su una traccia di Mambo lenta. Continua a contare ad alta voce. La maggior parte degli insegnanti raccomanda registrazioni a tempo medio di Tito Puente o Eddie Torres Big Band come musica di pratica." },
      { name: "Drilla il trasferimento di peso", text: "On2 richiede un trasferimento di peso ritardato: metti prima la pianta del piede, poi lasci cadere il tallone. Pratica passi base al rallentatore concentrandoti solo su come il peso viaggia attraverso il piede." },
      { name: "Segui un corso strutturato", text: "L'autoapprendimento ha un soffitto. Un curriculum che isola il lavoro di piedi, la musicalità, la biomeccanica e il lavoro in coppia nell'ordine giusto ti accelererà oltre il plateau che i ballerini autodidatti raggiungono a ~6 mesi." },
    ],
  },
  ja: {
    metaTitle: "Salsa On2 とは？ニューヨークスタイル Mambo の完全ガイド",
    metaDescription:
      "Salsa On2 は、ダンサーが音楽の2拍目で踏み込むタイミングスタイル。ニューヨークスタイルや Mambo とも呼ばれる。完全な定義、歴史、バイオメカニクス、そして5ステップの初心者向けパス。",
    breadcrumbHome: "ホーム",
    breadcrumbCurrent: "Salsa On2",
    badge: "ガイド",
    h1Pre: "Salsa On2 とは？完全ガイド：",
    h1Accent: "ニューヨークスタイル Mambo",
    shortAnswerRich:
      "Salsa On2 は、音楽の最初の拍ではなく **2拍目** で踏み込む（方向を変える）サルサのタイミングスタイル。**ニューヨークスタイル** または **Mambo** とも呼ばれる。1950年代にニューヨークの Palladium Ballroom で形式化され、1970年代に Eddie Torres によって現代の指導法として体系化された。On2 で踊ると体がコンガのスラップパターンに合い、On1 よりも滑らかでシンコペートされたフィーリングをダンスに与える。",
    sec1Title: "中心となる考え方：8カウントで数える",
    sec1Paragraphs: [
      "すべてのサルサ曲は4/4拍子で書かれており、ダンサーはそれを繰り返す8カウント（1、2、3、4、5、6、7、8）として数える。On1 でも On2 でも、各8カウントで6歩踏む：前半に3歩、後半に3歩、4と8で休む。",
      "2つのスタイルの違いは *いつ* 方向を変えるか、ダンサーが「ブレイクステップ」と呼ぶ部分にある。On1 のダンサーは1で方向を変える。On2 のダンサーは2で方向を変える。残りの足の動きはこの1つの決定から派生する。",
      "なぜこれが重要かというと、音楽的だからだ。アフロキューバン音楽では、コンガはトゥンバオというパターンを叩く。その特徴的なアクセント、オープントーンのスラップは、各8カウントの2と6に落ち、1と5には落ちない。2で踏み込むと、体重移動がそのスラップに合う。体がメロディではなくバンドのリズムセクションと同期して動く。",
    ],
    sec2Title: "On1 vs On2 一目で",
    sec2HeadAttr: "項目",
    sec2HeadOn1: "Salsa On1（LAスタイル）",
    sec2HeadOn2: "Salsa On2（NYスタイル）",
    sec2Rows: [
      { a: "ブレイクステップ", b: "拍 1", c: "拍 2" },
      { a: "フィーリング", b: "スタッカート、エネルギッシュ", c: "滑らか、落ち着いた" },
      { a: "同期する対象", b: "メロディ／ダウンビート", c: "コンガのスラップ／リズムセクション" },
      { a: "起源", b: "ロサンゼルス、1990年代（バスケス兄弟）", c: "ニューヨーク、1950年代の Palladium" },
      { a: "主流のシーン", b: "LA、ラテンアメリカの大半、ヨーロッパの多くの都市", c: "NYC、競技サルサ、世界中の On2 専用シーン" },
      { a: "代表的な指導者", b: "Eddie Torres は LA のパイオニアにも影響を与えた", c: "Eddie Torres（現代 On2 教育の父）" },
    ],
    sec3Title: "簡単な歴史：Palladium、Eddie Torres、現代の On2",
    sec3Paragraphs: [
      "1950年代初頭、ニューヨークの Palladium Ballroom は Mambo Craze の坩堝となった。ブロンクス、ブルックリン、スパニッシュハーレム出身の労働者階級のダンサー（プエルトリコ人、イタリア人、ユダヤ人、アフリカ系アメリカ人）が、Tito Puente、Tito Rodriguez、Machito が率いるビッグバンド Mambo に合わせて踊っていた。Cuban Pete、Millie Donay、Killer Joe Piro といった伝説的なダンサーたちは、アフロキューバンのグラウンディングと Lindy Hop のアクロバット、タップのフレージング、社交ダンスのフレームを融合させた。",
      "そこから生まれた Palladium Mambo は単一の標準化されたスタイルではなかった。それは即興的なバリエーションの競争的サブカルチャーだった。1で踏み込むダンサーもいれば、2で踏み込むダンサーもいて、その間を漂うダンサーもいた。スタイルを統一していたのは美学だった：地に足のついた下半身、ロックされたフレーム、速い足さばき、静かな胸。",
      "1970年代、Palladium 時代の後、**Eddie Torres** というダンサーが、現在私たちが標準的な「On2」タイミングとして認識するものを体系化した。Torres は Tito Puente の下で学び、Puente は2で踏み込むことが1で踏み込むよりもクラーベとトゥンバオに忠実だと彼に伝えた。Torres はその音楽的原則を受け取り、それを中心に教えやすいシステムを構築した。このカリキュラムを含むすべての現代 Salsa On2 カリキュラムは、最終的に Eddie Torres の構造的な仕事に遡る。",
    ],
    sec4Title: "On2 が体で違って感じる理由",
    sec4Paragraphs: [
      "On2 のバイオメカニクスは制御された綱引きだ。下半身は床に身を任せる：膝は柔らかく、重心は低く、踵が落ちる前に体重が母指球を通って転がる。上半身は上に伸びる：背骨は引き上げられ、肩は下がり、胸は静かに。",
      "地に足のついた下半身と引き上げられた上半身の間のその分離が、世界クラスの On2 ダンサーが目まぐるしい速度で足を動かしながらも浮かんでいるように見える理由だ。これがダンスが音楽的に機能する理由でもある：転がるようにわずかに遅れた体重移動が、コンガのスラップを追い越すのではなく、自然にそこに着地する。",
      "新しいダンサーが犯す最も一般的な2つの間違いは、(1) 真っ直ぐにロックされた脚で踊ることで、これは遅延を殺し、腰を行進のように平坦化する、(2) 足さばきと一緒に肩を上下に弾ませることで、これはフレームを破壊する。",
    ],
    sec5Title: "Salsa On2 を学び始める方法",
    sec5Steps: [
      "**コンガのトゥンバオに耳を慣らせ。** サルサの曲を聴いてコンガを分離する。繰り返されるオープントーンのスラップは2と6に落ちる。そのスラップが聞こえるまで、On2 を確実に踊ることはできない。",
      "**音楽なしで一人で基本ステップを習得しろ。** 4と8で休みながら「1-2-3、5-6-7」と声に出して数える。2で後ろに、6で前に踏み込む。ステップが自動的になるまでドリルする。",
      "**ゆっくりしたテンポ（~90 BPM）の音楽を加えろ。** ステップが退屈になったら、ゆっくりした Mambo の曲（Tito Puente や Eddie Torres Big Band が定番）をかけ、声に出して数えながら基本ステップを音楽に合わせる。",
      "**体重移動をドリルしろ。** 体重がどう移動するかだけに集中して、スローモーションで基本を練習する：先に母指球、次に踵が落ちる、膝を柔らかくして体重が落ち着く。これがダンサーと単に歩く人を分ける習慣だ。",
      "**体系化されたコースを取れ。** 自己学習は約6か月で頭打ちになる。足さばき、音楽性、体の力学、パートナーワークを正しい順序で分離するカリキュラムは、その停滞をはるかに早く突破させる。正確な理由は運動学習の[link]85%ルール[/link]だ：脳は改善し続けるために成功と失敗の特定のバランスを必要とする。",
    ],
    sec6Title: "無視すべき神話",
    sec6Bullets: [
      "**「On2 は上級ダンサーだけのものだ。」** 誤り。完全初心者でも On2 から始められる。何年も On1 で体を訓練してきた場合は調整が難しいが、新しい場合はそうではない。",
      "**「Salsa On2 はサルサとは違うダンスだ。」** 同じダンスでタイミングが違うだけだ。パートナーワーク、コネクションフレーム、シャイン、コンビネーション。語彙は共有されている。",
      "**「LA スタイルの音楽で On2 は踊れない。」** どんなサルサの曲でも On2 で踊れる。気持ちよく感じるかどうかは曲のテンポとパーカッションのアレンジによるもので、曲が LA で録音されたかニューヨークで録音されたかではない。",
    ],
    faqs: [
      { q: "Salsa On2 は Salsa On1 より難しいですか？", a: "On2 は客観的に難しいわけではない。西洋のダウンビート音楽で育った人にとっては直感的でない。最初のブレイクステップが1ではなく2に落ちるからだ。すでに On1 を内面化したダンサーは2〜4週間の調整期間をよく報告する。On2 を最初に学ぶ初心者は通常、同じペースで同じ快適レベルに達する。" },
      { q: "On2 を学ぶ前に Salsa On1 を学ぶ必要がありますか？", a: "いいえ。On2 を最初に学べる。Eddie Torres の最初の生徒は大半が完全初心者だった。On2 から始めると、後でタイミングの習慣を再配線する必要がない。とはいえ、社交シーンで On1 が踊られている都市に住んでいるなら、練習する場所が必要なので、まず On1 を学ぶのは実用的だ。" },
      { q: "Salsa On2 は Mambo と同じですか？", a: "現代のオンラインサルサ世界では、2つの用語は互換的に使われる。歴史的に、Mambo は1950年代の Palladium Ballroom のダンススタイルで、Cuban Pete、Millie Donay、後に Eddie Torres のようなダンサーによって形式化された。現代の Salsa On2、時にニューヨークスタイルと呼ばれるものは、その伝統の直接の子孫だ。" },
      { q: "Salsa On2 を学ぶのにどのくらいかかりますか？", a: "音楽に合わせて自信を持って基本ステップを踊るのに2〜4週間、パートナーと初心者レベルで社交的に踊るのに3〜6か月、中級の社交的快適さに達するのに1〜2年を見込もう。これらの推定は週3〜5時間の意識的な練習を前提とし、受動的なクラス出席ではない。" },
      { q: "どんなサルサクラブでも Salsa On2 で踊れますか？", a: "どんなサルサ曲でも On2 で踊れるが、社交的にはパートナーのタイミングに合わせたい。ニューヨーク、ヨーロッパの On2 専用シーンの大半、競技世界では On2 が支配的。ラテンアメリカの大半、カリブ海、ヨーロッパとアメリカの多くのローカルシーンでは On1 が支配的。経験豊富なダンサーの大半は両方を切り替えられる。" },
    ],
    ctaHeading: "Salsa On2 の最初の30日、体系化された。",
    howToSteps: [
      { name: "コンガのトゥンバオに耳を慣らせ", text: "Salsa On2 の曲を聴いてコンガを分離する。繰り返される「スラップ」は8カウントの2と6に落ちる。このスラップを聞くことが On2 をテンポ通りに踊る前提条件だ。" },
      { name: "一人で基本ステップを習得しろ", text: "まず音楽なしで6ステップの基本（前ブレイク／後ブレイク）を練習する。4と8で休みながら1-2-3、5-6-7と声に出して数える。後ろに行くときは2で、前に行くときは6で踏み込む（方向を変える）。" },
      { name: "ゆっくりしたテンポ（~90 BPM）の音楽を加えろ", text: "ステップが自動的になったら、ゆっくりした Mambo の曲に合わせて踊る。声に出して数え続ける。ほとんどの教師は練習音楽として Tito Puente または Eddie Torres Big Band の中テンポの録音を推奨する。" },
      { name: "体重移動をドリルしろ", text: "On2 は遅延した体重移動を必要とする：先に母指球を置き、次に踵を落とす。体重がどう足を通って移動するかだけに集中して、スローモーションで基本ステップを練習する。" },
      { name: "体系化されたコースを取れ", text: "自己学習には天井がある。足さばき、音楽性、体の力学、パートナーワークを正しい順序で分離するカリキュラムは、独学のダンサーが~6か月で達する停滞を突破させる。" },
    ],
  },
  ko: {
    metaTitle: "Salsa On2란? 뉴욕 스타일 Mambo 완벽 가이드",
    metaDescription:
      "Salsa On2는 댄서가 음악의 2박에서 브레이크하는 타이밍 스타일. 뉴욕 스타일이나 Mambo로도 불린다. 완전한 정의, 역사, 생체역학, 그리고 5단계 초보자 시작 경로.",
    breadcrumbHome: "홈",
    breadcrumbCurrent: "Salsa On2",
    badge: "가이드",
    h1Pre: "Salsa On2란? 완벽 가이드: ",
    h1Accent: "뉴욕 스타일 Mambo",
    shortAnswerRich:
      "Salsa On2는 음악의 첫 박이 아닌 **두 번째 박**에서 브레이크하는(방향을 바꾸는) 살사 댄스의 타이밍 스타일이다. **뉴욕 스타일** 또는 **Mambo**로도 불린다. 이 스타일은 1950년대 뉴욕의 Palladium Ballroom에서 정립되었고 1970년대 Eddie Torres에 의해 현대 교육용으로 체계화되었다. On2로 추는 것은 너의 몸을 콩가의 슬랩 패턴과 정렬시켜, On1보다 더 부드럽고 더 신코페이션된 느낌을 댄스에 준다.",
    sec1Title: "핵심 아이디어: 8박으로 세기",
    sec1Paragraphs: [
      "모든 살사 곡은 4/4 박자로 쓰여 있으며, 댄서들은 이를 반복되는 8박 마디(1, 2, 3, 4, 5, 6, 7, 8)로 센다. On1을 추든 On2를 추든, 각 8박 안에서 여섯 스텝을 밟는다: 전반부에 셋, 후반부에 셋, 4와 8에서 멈춘다.",
      "두 스타일 사이의 차이는 *언제* 방향을 바꾸느냐, 댄서들이 \"브레이크 스텝\"이라고 부르는 것이다. On1 댄서는 1에서 방향을 바꾼다. On2 댄서는 2에서 방향을 바꾼다. 나머지 풋워크는 그 단 하나의 결정에서 따라온다.",
      "이것이 중요한 이유는 음악적이다. 아프로-쿠바 음악에서 콩가는 툼바오라는 패턴을 친다. 그 특징적인 악센트인 오픈톤 슬랩은 각 8박 마디의 2와 6에 떨어지며, 1과 5에는 떨어지지 않는다. 2에서 브레이크하면 너의 체중 이동이 그 슬랩에 닿는다. 너의 몸이 멜로디가 아닌 밴드의 리듬 섹션과 동기화되어 움직인다.",
    ],
    sec2Title: "On1 vs On2 한눈에",
    sec2HeadAttr: "항목",
    sec2HeadOn1: "Salsa On1 (LA 스타일)",
    sec2HeadOn2: "Salsa On2 (NY 스타일)",
    sec2Rows: [
      { a: "브레이크 스텝", b: "박자 1", c: "박자 2" },
      { a: "느낌", b: "스타카토, 활기찬", c: "부드러운, 여유로운" },
      { a: "동기화 대상", b: "멜로디 / 다운비트", c: "콩가 슬랩 / 리듬 섹션" },
      { a: "기원", b: "로스앤젤레스, 1990년대 (Vazquez 형제)", c: "뉴욕, 1950년대 Palladium" },
      { a: "주요 씬", b: "LA, 라틴 아메리카의 대부분, 대부분의 유럽 도시", c: "NYC, 대회 살사, 전 세계 On2 전용 씬" },
      { a: "정통 강사", b: "Eddie Torres는 LA 개척자들에게도 영감을 주었다", c: "Eddie Torres (현대 On2 교육법의 아버지)" },
    ],
    sec3Title: "간단한 역사: Palladium, Eddie Torres, 현대 On2",
    sec3Paragraphs: [
      "1950년대 초, 뉴욕의 Palladium Ballroom은 Mambo Craze의 도가니가 되었다. 브롱크스, 브루클린, 스패니시 할렘 출신의 노동자 계급 댄서들 (푸에르토리코인, 이탈리아인, 유대인, 아프리카계 미국인)이 Tito Puente, Tito Rodriguez, Machito가 이끄는 빅 밴드 Mambo에 맞춰 추고 있었다. 그 시대의 전설적인 댄서들 Cuban Pete, Millie Donay, Killer Joe Piro 등은 아프로-쿠바 그라운딩을 Lindy Hop 곡예, 탭 프레이징, 볼룸 프레임과 융합시켰다.",
      "거기서 나온 Palladium Mambo는 단일하고 표준화된 스타일이 아니었다. 즉흥적인 변주의 경쟁적 하위문화였다. 어떤 댄서들은 1에서, 어떤 이들은 2에서, 어떤 이들은 그 사이를 떠다녔다. 스타일을 통합한 것은 미학이었다: 땅에 닿은 하체, 잠긴 프레임, 빠른 풋워크, 조용한 가슴.",
      "1970년대, Palladium 시대 이후, **Eddie Torres**라는 댄서가 우리가 지금 표준 \"On2\" 타이밍이라고 인식하는 것을 체계화했다. Torres는 Tito Puente 밑에서 공부했고, Puente는 그에게 2에서 브레이크하는 것이 1에서 브레이크하는 것보다 클라베와 툼바오에 더 충실하다고 말했다. Torres는 그 음악적 원칙을 가져다가 그 주위에 가르칠 수 있는 시스템을 구축했다. 이것을 포함한 모든 현대 Salsa On2 커리큘럼은 궁극적으로 Eddie Torres의 구조적 작업으로 거슬러 올라간다.",
    ],
    sec4Title: "On2가 너의 몸에서 다르게 느껴지는 이유",
    sec4Paragraphs: [
      "On2의 생체역학은 통제된 줄다리기다. 너의 하체는 바닥에 자신을 맡긴다: 무릎은 부드럽게, 무게중심은 낮게, 발 뒤꿈치가 떨어지기 전에 무게가 발바닥 앞쪽을 통해 굴러간다. 너의 상체는 위로 뻗는다: 척추는 들어올려지고, 어깨는 내려가고, 가슴은 조용히.",
      "땅에 닿은 하체와 들어올려진 상체 사이의 그 분리가 세계적 수준의 On2 댄서들이 그들의 발이 어지러운 속도로 움직이는 동안에도 떠 있는 것처럼 보이는 이유다. 또한 댄스가 음악적으로 작동하는 이유다: 굴러가는 듯한, 약간 지연된 체중 이동이 콩가 슬랩보다 앞서 가는 대신 자연스럽게 그 위에 안착한다.",
      "초보자가 가장 자주 하는 두 가지 실수는 (1) 곧고 잠긴 다리로 추는 것으로, 이는 지연을 죽이고 엉덩이를 행진처럼 평평하게 만들고, (2) 풋워크와 함께 어깨를 위아래로 튀게 하는 것으로, 이는 프레임을 파괴한다.",
    ],
    sec5Title: "Salsa On2를 시작하는 방법",
    sec5Steps: [
      "**콩가 툼바오에 귀를 훈련시켜라.** 살사 곡을 듣고 콩가를 분리해라. 반복되는 오픈톤 슬랩은 2와 6에 떨어진다. 그 슬랩을 들을 수 있을 때까지 On2를 안정적으로 출 수 없다.",
      "**음악 없이 혼자 기본 스텝을 마스터해라.** 4와 8에서 쉬면서 \"1-2-3, 5-6-7\"을 소리 내어 세어라. 2에서 뒤로 브레이크, 6에서 앞으로 브레이크. 스텝이 자동이 될 때까지 드릴해라.",
      "**느린 템포(~90 BPM)에서 음악을 추가해라.** 스텝이 지루해지면, 느린 Mambo 트랙(Tito Puente 또는 Eddie Torres Big Band가 정통적)을 틀고, 소리 내어 세면서 너의 기본 스텝을 음악에 맞춰라.",
      "**체중 이동을 드릴해라.** 체중이 어떻게 이동하는지에만 집중하면서 슬로우 모션 기본 스텝을 연습해라: 발바닥 앞쪽 먼저, 발뒤꿈치는 나중에, 무릎을 부드럽게 해서 무게가 정착하게. 이것이 댄서와 단순히 걷는 사람을 구분하는 습관이다.",
      "**체계화된 코스를 들어라.** 자기 학습은 약 6개월에 정체된다. 풋워크, 음악성, 신체 역학, 파트너워크를 올바른 순서로 분리하는 커리큘럼은 그 정체를 훨씬 빨리 넘게 해준다. 정확한 이유는 운동 학습의 [link]85% 법칙[/link]이다: 너의 뇌는 계속 개선하기 위해 성공과 실패의 특정한 균형이 필요하다.",
    ],
    sec6Title: "무시할 신화들",
    sec6Bullets: [
      "**\"On2는 고급 댄서들만을 위한 것이다.\"** 거짓. 완전 초보자도 On2로 시작할 수 있다. 이미 몇 년 동안 몸을 On1에 훈련시켰다면 조정이 더 어렵지만, 새로 시작한다면 그렇지 않다.",
      "**\"Salsa On2는 살사와 다른 댄스다.\"** 다른 타이밍을 가진 같은 댄스다. 파트너워크, 연결 프레임, 샤인, 콤비네이션. 어휘는 공유된다.",
      "**\"LA 스타일 음악으로 On2를 출 수 없다.\"** 어떤 살사 곡으로도 On2를 출 수 있다. 좋게 느껴지는지는 곡의 템포와 타악기 편곡에 달려 있지, 곡이 LA에서 녹음되었는지 뉴욕에서 녹음되었는지에 달려 있지 않다.",
    ],
    faqs: [
      { q: "Salsa On2가 Salsa On1보다 더 어렵나요?", a: "On2는 객관적으로 더 어렵지 않다. 서양의 다운비트 음악으로 자란 사람들에게는 덜 직관적이다. 첫 브레이크 스텝이 1이 아닌 2에 떨어지기 때문이다. On1을 이미 내면화한 댄서들은 종종 2-4주의 적응 기간을 보고한다. On2를 먼저 배우는 초보자들은 보통 같은 속도로 같은 편안함 수준에 도달한다." },
      { q: "On2를 배우기 전에 Salsa On1을 배워야 하나요?", a: "아니다. On2를 먼저 배울 수 있다. Eddie Torres의 원래 학생들은 대부분 완전 초보자였다. On2로 시작하면 나중에 타이밍 습관을 재배선할 필요가 없다. 그렇긴 하지만, 사교 씬이 On1을 추는 도시에 살고 있다면, 연습할 곳이 필요하므로 On1을 먼저 배우는 것이 실용적이다." },
      { q: "Salsa On2는 Mambo와 같은 것인가요?", a: "현대 온라인 살사 세계에서는 두 용어가 상호 교환적으로 사용된다. 역사적으로 Mambo는 Cuban Pete, Millie Donay, 나중에 Eddie Torres 같은 댄서들에 의해 정립된 1950년대 Palladium Ballroom 댄스 스타일이었다. 때로 뉴욕 스타일이라고 불리는 현대 Salsa On2는 그 전통의 직접적인 후손이다." },
      { q: "Salsa On2를 배우는 데 얼마나 걸리나요?", a: "기본 스텝을 음악적으로 자신있게 추기까지 2-4주, 파트너와 초보자 수준으로 사교적으로 추기까지 3-6개월, 중급 사교 편안함에 도달하기까지 1-2년을 예상해라. 이 추정치는 주당 3-5시간의 의도적 연습을 가정하며, 수동적인 수업 출석이 아니다." },
      { q: "어떤 살사 클럽에서든 Salsa On2를 출 수 있나요?", a: "어떤 살사 곡으로도 On2를 출 수 있지만, 사교적으로는 파트너의 타이밍에 맞추고 싶을 것이다. 뉴욕, 유럽의 On2 전용 씬 대부분, 그리고 경쟁 세계에서는 On2가 지배적이다. 라틴 아메리카의 대부분, 카리브해, 그리고 유럽과 미국의 많은 지역 씬에서는 On1이 지배적이다. 대부분의 경험 많은 댄서들은 두 가지를 전환할 수 있다." },
    ],
    ctaHeading: "Salsa On2의 첫 30일, 체계화된.",
    howToSteps: [
      { name: "콩가 툼바오에 귀를 훈련시켜라", text: "Salsa On2 곡을 듣고 콩가를 분리해라. 반복되는 '슬랩'은 8박 마디의 2와 6에 떨어진다. 이 슬랩을 듣는 것이 On2를 박자에 맞게 추는 전제조건이다." },
      { name: "혼자 기본 스텝을 마스터해라", text: "먼저 음악 없이 6스텝 기본(앞 브레이크 / 뒤 브레이크)을 연습해라. 4와 8에서 쉬면서 1-2-3, 5-6-7을 소리 내어 세어라. 뒤로 갈 때 2에서, 앞으로 갈 때 6에서 브레이크(방향 변경)해라." },
      { name: "느린 템포(~90 BPM)에서 음악을 추가해라", text: "스텝이 자동화되면, 느린 Mambo 트랙에 맞춰 추어라. 소리 내어 계속 세어라. 대부분의 강사는 연습 음악으로 Tito Puente 또는 Eddie Torres Big Band의 중간 템포 녹음을 추천한다." },
      { name: "체중 이동을 드릴해라", text: "On2는 지연된 체중 이동을 필요로 한다: 발바닥 앞쪽을 먼저 놓고, 그 다음 발뒤꿈치를 떨어뜨린다. 무게가 발을 통해 어떻게 이동하는지에만 집중하면서 슬로우 모션 기본 스텝을 연습해라." },
      { name: "체계화된 코스를 들어라", text: "자기 학습에는 천장이 있다. 풋워크, 음악성, 신체 역학, 파트너워크를 올바른 순서로 분리하는 커리큘럼은 독학 댄서들이 ~6개월에 도달하는 정체를 넘어 가속화시킬 것이다." },
    ],
  },
  zh: {
    metaTitle: "什么是 Salsa On2?纽约风格 Mambo 完整指南",
    metaDescription:
      "Salsa On2 是一种舞者在音乐第 2 拍踏入的节奏风格。也称为纽约风格或 Mambo。完整定义、历史、生物力学和 5 步入门路径。",
    breadcrumbHome: "首页",
    breadcrumbCurrent: "Salsa On2",
    badge: "指南",
    h1Pre: "什么是 Salsa On2?完整指南:",
    h1Accent: "纽约风格 Mambo",
    shortAnswerRich:
      "Salsa On2 是萨尔萨舞蹈的一种节奏风格,你在音乐的 **第二拍** 而不是第一拍踏入(改变方向)。也称为 **纽约风格** 或 **Mambo**。这种风格在 1950 年代纽约的 Palladium Ballroom 形成,并由 Eddie Torres 在 1970 年代为现代教学体系化。跳 On2 让你的身体与康加鼓的拍点对齐,给舞蹈带来比 On1 更顺畅、更具切分音感觉的体验。",
    sec1Title: "核心理念:以 8 计数",
    sec1Paragraphs: [
      "每首萨尔萨歌曲都以 4/4 拍写成,舞者将其计为重复的 8 拍小节(1, 2, 3, 4, 5, 6, 7, 8)。无论你跳 On1 还是 On2,你在每个 8 拍中走六步:前半部分三步,后半部分三步,在第 4 和第 8 拍停顿。",
      "两种风格之间的变化是 *何时* 改变方向,舞者称之为「踏入步」。On1 舞者在第 1 拍改变方向。On2 舞者在第 2 拍改变方向。其余的脚步动作都从这一个决定中延伸。",
      "这件事重要的原因是音乐性。在非洲-古巴音乐中,康加鼓演奏一种叫做 tumbao 的节奏型。它的标志性重音,即开放音色拍点,落在每个 8 拍小节的第 2 和第 6 拍上,而不是第 1 和第 5 拍。当你在第 2 拍踏入时,你的重心转移落在那个拍点上。你的身体与乐队的节奏部分而非旋律同步移动。",
    ],
    sec2Title: "On1 vs On2 一览",
    sec2HeadAttr: "属性",
    sec2HeadOn1: "Salsa On1 (LA 风格)",
    sec2HeadOn2: "Salsa On2 (NY 风格)",
    sec2Rows: [
      { a: "踏入步", b: "拍 1", c: "拍 2" },
      { a: "感觉", b: "断奏的、有活力", c: "顺畅、放松" },
      { a: "同步对象", b: "旋律 / 强拍", c: "康加拍点 / 节奏部分" },
      { a: "起源", b: "洛杉矶,1990 年代 (Vazquez 兄弟)", c: "纽约,1950 年代 Palladium" },
      { a: "主流场景", b: "LA、大部分拉美地区、大部分欧洲城市", c: "纽约、比赛萨尔萨、全球 On2 专场" },
      { a: "经典老师", b: "Eddie Torres 也启发了许多 LA 先驱", c: "Eddie Torres (现代 On2 教学法之父)" },
    ],
    sec3Title: "简短历史:Palladium、Eddie Torres 和现代 On2",
    sec3Paragraphs: [
      "1950 年代初,纽约的 Palladium Ballroom 成为 Mambo 热潮的熔炉。来自布朗克斯、布鲁克林和西班牙哈林区的工人阶级舞者(波多黎各人、意大利人、犹太人和非裔美国人)伴着由 Tito Puente、Tito Rodriguez 和 Machito 领导的大乐团 Mambo 起舞。那个时代的传奇舞者如 Cuban Pete、Millie Donay 和 Killer Joe Piro 将非洲-古巴的扎根感与 Lindy Hop 杂技、踢踏舞的节奏感和交谊舞的框架融合在一起。",
      "由此涌现的 Palladium Mambo 不是单一的标准化风格。它是一种即兴变化的竞争性亚文化。一些舞者在第 1 拍踏入,一些在第 2 拍,一些在两者之间漂浮。统一这种风格的是其美学:扎根的下半身、锁定的框架、快速的脚步、安静的胸部。",
      "1970 年代,Palladium 时代之后,一位名叫 **Eddie Torres** 的舞者将我们现在认识的标准「On2」节奏体系化。Torres 在 Tito Puente 门下学习,Puente 告诉他在第 2 拍踏入比在第 1 拍踏入更忠实于克拉维和 tumbao。Torres 接受了那个音乐原则,并围绕它构建了一个可教授的系统。包括这个在内的每一个现代 Salsa On2 课程,最终都可以追溯到 Eddie Torres 的结构性工作。",
    ],
    sec4Title: "为什么 On2 在你的身体里感觉不同",
    sec4Paragraphs: [
      "On2 的生物力学是一场受控的拔河。你的下半身向地板屈服:膝盖柔软、重心低、重心在脚跟落下之前从脚掌前部滚动。你的上半身向上伸展:脊椎抬起、肩膀放下、胸部安静。",
      "扎根的下半身和抬起的上半身之间的这种分离,正是世界级 On2 舞者看起来在脚以令人眩晕的速度移动时却像是漂浮的原因。这也是舞蹈在音乐上有效的原因:滚动的、略微延迟的重心转移自然地落在康加拍点上,而不是赶在它前面。",
      "新手最常犯的两个错误是 (1) 用直立、锁定的腿跳,这会扼杀延迟并将髋部压平为行进,以及 (2) 让肩膀随着脚步上下弹跳,这会破坏框架。",
    ],
    sec5Title: "如何开始学习 Salsa On2",
    sec5Steps: [
      "**训练你的耳朵分辨康加 tumbao。** 听萨尔萨曲子并分离康加鼓。重复出现的开放音拍点落在第 2 和第 6 拍上。在你能听到那个拍点之前,你无法可靠地跳 On2。",
      "**独自掌握基本步,不放音乐。** 大声数「1-2-3, 5-6-7」,在 4 和 8 上停顿。在第 2 拍向后踏入,在第 6 拍向前踏入。练到步子自动为止。",
      "**以慢速(~90 BPM)加入音乐。** 当步子变得无聊时,放一首慢速 Mambo 曲(Tito Puente 或 Eddie Torres Big Band 是经典)并将你的基本步与音乐对齐,同时继续大声数。",
      "**练习重心转移。** 慢动作练习基本步,只关注你的重心如何移动:先脚掌前部,再脚跟落下,膝盖柔软地让重心安稳。这是区分舞者和单纯走路的人的习惯。",
      "**参加结构化课程。** 自学在大约六个月时停滞。一个按正确顺序分离脚步、音乐性、身体力学和双人舞蹈的课程会让你更快超越那个停滞期。确切的原因是运动学习的[link]85% 法则[/link]:你的大脑需要特定的成功和失败平衡才能持续改进。",
    ],
    sec6Title: "可以忽略的迷思",
    sec6Bullets: [
      "**「On2 只适合高级舞者。」** 错。绝对初学者可以从 On2 开始。如果你已经把身体训练成 On1 多年,调整会更困难,而不是如果你是新手。",
      "**「Salsa On2 是与萨尔萨不同的舞蹈。」** 它是同一种舞蹈,只是节奏不同。双人舞蹈、连接框架、shines、组合。词汇是共享的。",
      "**「你不能用 LA 风格的音乐跳 On2。」** 你可以用任何萨尔萨曲跳 On2。是否感觉好取决于歌曲的速度和打击乐编排,而不是歌曲是在 LA 还是纽约录制的。",
    ],
    faqs: [
      { q: "Salsa On2 比 Salsa On1 更难吗?", a: "On2 客观上并不更难。对于在西方强拍音乐中长大的人来说,它不那么直观,因为第一个踏入步落在第 2 拍而不是第 1 拍。已经内化 On1 的舞者通常报告 2-4 周的调整期。先学 On2 的初学者通常以相同速度达到同样的舒适度。" },
      { q: "我在学 On2 之前需要先学 Salsa On1 吗?", a: "不需要。你可以先学 On2。Eddie Torres 最初的学生大多是绝对初学者。从 On2 开始可以避免以后重新连接节奏习惯。话虽如此,如果你住在社交场景跳 On1 的城市,先学 On1 是务实的,因为你需要地方练习。" },
      { q: "Salsa On2 和 Mambo 是一回事吗?", a: "在当代在线萨尔萨世界,这两个术语可以互换使用。从历史上看,Mambo 是 1950 年代 Palladium Ballroom 的舞蹈风格,由 Cuban Pete、Millie Donay 和后来的 Eddie Torres 等舞者形式化。现代 Salsa On2,有时称为纽约风格,是那个传统的直接后裔。" },
      { q: "学 Salsa On2 需要多长时间?", a: "预计 2-4 周可以自信地跟着音乐跳基本步,3-6 个月可以与搭档以初学者水平社交跳舞,1-2 年达到中级社交舒适度。这些估计假设每周 3-5 小时的刻意练习,而不是被动上课。" },
      { q: "我可以在任何萨尔萨俱乐部跳 Salsa On2 吗?", a: "你可以用任何萨尔萨曲跳 On2,但社交上你想匹配搭档的节奏。在纽约市、欧洲大部分专门的 On2 场景以及竞技世界,On2 占主导。在拉丁美洲、加勒比海和欧洲与美国的许多本地场景,On1 占主导。大多数有经验的舞者可以在两者之间切换。" },
    ],
    ctaHeading: "Salsa On2 的前 30 天,体系化。",
    howToSteps: [
      { name: "训练你的耳朵分辨康加 tumbao", text: "听 Salsa On2 曲子并分离康加鼓。重复出现的「拍点」落在 8 拍小节的第 2 和第 6 拍上。听到这个拍点是按时跳 On2 的前提。" },
      { name: "独自掌握基本步", text: "先在没有音乐的情况下练习 6 步基本步(向前踏入 / 向后踏入)。大声数 1-2-3, 5-6-7,在 4 和 8 上停顿。向后时在第 2 拍踏入(改变方向),向前时在第 6 拍踏入。" },
      { name: "以慢速(~90 BPM)加入音乐", text: "一旦步子自动了,跟着慢速 Mambo 曲跳。继续大声数。大多数老师推荐 Tito Puente 或 Eddie Torres Big Band 的中速录音作为练习音乐。" },
      { name: "练习重心转移", text: "On2 需要延迟的重心转移:你先放脚掌前部,然后让脚跟落下。慢动作练习基本步,只关注重心如何在脚上移动。" },
      { name: "参加结构化课程", text: "自学有上限。一个按正确顺序分离脚步、音乐性、身体力学和双人舞蹈的课程,会让你越过自学者在约 6 个月时遇到的停滞。" },
    ],
  },
  ru: {
    metaTitle: "Что такое Salsa On2? Полный гид по нью-йоркскому Mambo",
    metaDescription:
      "Salsa On2 — это стиль тайминга, в котором танцоры ломаются на 2-й доле музыки. Также называется нью-йоркским стилем или Mambo. Полное определение, история, биомеханика и 5-шаговый путь для новичка.",
    breadcrumbHome: "Главная",
    breadcrumbCurrent: "Salsa On2",
    badge: "Гид",
    h1Pre: "Что такое Salsa On2? Полный гид по ",
    h1Accent: "нью-йоркскому Mambo",
    shortAnswerRich:
      "Salsa On2 — это стиль тайминга в танце сальса, в котором ты ломаешься (меняешь направление) на **второй доле** музыки вместо первой. Также называется **нью-йоркским стилем** или **Mambo**. Стиль был формализован в Palladium Ballroom Нью-Йорка в 1950-х и кодифицирован для современного обучения Eddie Torres в 1970-х. Танцевать On2 выравнивает твоё тело с паттерном слэпа конги, давая танцу более плавное, синкопированное ощущение, чем On1.",
    sec1Title: "Основная идея: считать восьмёрками",
    sec1Paragraphs: [
      "Каждая сальса написана в размере 4/4, который танцоры считают как повторяющийся такт из 8 долей (1, 2, 3, 4, 5, 6, 7, 8). Танцуешь ли ты On1 или On2, ты делаешь шесть шагов внутри каждой восьмёрки: три в первой половине и три во второй, с паузами на 4 и 8.",
      "Что меняется между двумя стилями — это *когда* ты меняешь направление, что танцоры называют «шагом break». Танцор On1 меняет направление на 1. Танцор On2 меняет направление на 2. Остальная работа ног следует из этого единственного решения.",
      "Причина, почему это важно, — музыкальная. В афро-кубинской музыке конга играет паттерн под названием тумбао. Его определяющий акцент, slap с открытым тоном, падает на 2 и 6 каждой восьмёрки, а не на 1 и 5. Когда ты ломаешься на 2, твоя смена веса попадает на этот slap. Твоё тело движется синхронно с ритм-секцией группы, а не с мелодией.",
    ],
    sec2Title: "On1 vs On2 с первого взгляда",
    sec2HeadAttr: "Параметр",
    sec2HeadOn1: "Salsa On1 (LA Style)",
    sec2HeadOn2: "Salsa On2 (NY Style)",
    sec2Rows: [
      { a: "Шаг break", b: "Доля 1", c: "Доля 2" },
      { a: "Ощущение", b: "Стаккато, энергично", c: "Плавно, расслабленно" },
      { a: "Синхронизация с", b: "Мелодия / сильная доля", c: "Slap конги / ритм-секция" },
      { a: "Происхождение", b: "Лос-Анджелес, 1990-е (братья Vazquez)", c: "Нью-Йорк, Palladium 1950-х" },
      { a: "Доминирующие сцены", b: "LA, большая часть Латинской Америки, большинство европейских городов", c: "NYC, соревновательная сальса, выделенные сцены On2 по всему миру" },
      { a: "Канонический учитель", b: "Eddie Torres также вдохновил многих пионеров LA", c: "Eddie Torres (отец современной педагогики On2)" },
    ],
    sec3Title: "Краткая история: Palladium, Eddie Torres и современный On2",
    sec3Paragraphs: [
      "В начале 1950-х Palladium Ballroom Нью-Йорка стал тиглем Mambo Craze. Танцоры рабочего класса из Бронкса, Бруклина и Испанского Гарлема (пуэрториканцы, итальянцы, евреи и афроамериканцы) танцевали под биг-бэнд Mambo во главе с Tito Puente, Tito Rodriguez и Machito. Легендарные танцоры эпохи, такие как Cuban Pete, Millie Donay и Killer Joe Piro, объединили афро-кубинский гроундинг с акробатикой Lindy Hop, фразировкой степа и фреймом бальных танцев.",
      "Возникший Mambo Palladium не был единым стандартизированным стилем. Это была соревновательная субкультура импровизированных вариаций. Одни танцоры ломались на 1, другие на 2, третьи плавали между ними. Что объединяло стиль — это эстетика: заземлённая нижняя часть тела, заблокированная рамка, быстрая работа ног, тихая грудь.",
      "В 1970-х, после эры Palladium, танцор по имени **Eddie Torres** кодифицировал то, что мы теперь признаём стандартным таймингом «On2». Torres учился у Tito Puente, и Puente сказал ему, что ломаться на 2 более верно клаве и тумбао, чем ломаться на 1. Torres взял этот музыкальный принцип и построил вокруг него обучаемую систему. Каждая современная учебная программа Salsa On2, включая эту, в конечном итоге восходит к структурной работе Eddie Torres.",
    ],
    sec4Title: "Почему On2 ощущается по-другому в твоём теле",
    sec4Paragraphs: [
      "Биомеханика On2 — это контролируемое перетягивание каната. Твоя нижняя часть тела сдаётся полу: колени мягкие, центр тяжести низкий, вес перекатывается через подушечку стопы, прежде чем опустится пятка. Твоя верхняя часть тела тянется вверх: позвоночник поднят, плечи опущены, грудь спокойна.",
      "Это разделение между заземлённой нижней частью тела и поднятой верхней частью — причина, почему танцоры On2 мирового класса выглядят так, будто они парят, пока их ноги движутся с головокружительной скоростью. Это также причина, почему танец работает музыкально: перекатывающийся, слегка задержанный перенос веса естественно приземляется на slap конги, а не опережает его.",
      "Две самые распространённые ошибки новичка: (1) танцевать с прямыми, заблокированными ногами, что убивает задержку и расплющивает бёдра в марш, и (2) позволять плечам подпрыгивать вверх и вниз с работой ног, что разрушает фрейм.",
    ],
    sec5Title: "Как начать учить Salsa On2",
    sec5Steps: [
      "**Тренируй ухо для тумбао конги.** Слушай сальса-треки и изолируй конгу. Повторяющийся slap с открытым тоном падает на 2 и 6. Пока ты не услышишь этот slap, ты не сможешь надёжно танцевать On2.",
      "**Освой базовый шаг соло, без музыки.** Считай вслух «1-2-3, 5-6-7» с паузами на 4 и 8. Ломайся назад на 2, ломайся вперёд на 6. Дриллируй, пока шаг не станет автоматическим.",
      "**Добавь музыку в медленном темпе (~90 BPM).** Когда шаг наскучит, поставь медленный трек Mambo (Tito Puente или Eddie Torres Big Band — канон) и подгони базовый шаг под музыку, продолжая считать вслух.",
      "**Дриллируй перенос веса.** Практикуй базовые шаги в замедленной съёмке, сосредоточившись только на том, как путешествует вес: сначала подушечка стопы, затем пятка, вес устанавливается с мягкими коленями. Это привычка, которая отделяет танцора от шагающего.",
      "**Пройди структурированный курс.** Самостоятельное обучение выходит на плато примерно через шесть месяцев. Учебная программа, которая изолирует работу ног, музыкальность, биомеханику и партнёрскую работу в правильном порядке, проводит тебя через это плато гораздо быстрее. Точная причина — [link]правило 85%[/link] моторного обучения: твоему мозгу нужен определённый баланс успеха и неудачи, чтобы продолжать улучшаться.",
    ],
    sec6Title: "Мифы, которые стоит игнорировать",
    sec6Bullets: [
      "**«On2 только для продвинутых танцоров.»** Ложь. Абсолютные новички могут начать с On2. Корректировка сложнее, если ты уже годами тренировал тело на On1, а не если ты новичок.",
      "**«Salsa On2 — это другой танец, отличный от сальсы.»** Это тот же танец с другим таймингом. Партнёрская работа, фрейм связи, шайнс, комбинации. Словарь общий.",
      "**«Нельзя танцевать On2 под музыку в стиле LA.»** Ты можешь танцевать On2 под любую сальса-песню. Хорошо ли ощущается зависит от темпа и аранжировки перкуссии песни, а не от того, записана ли песня в LA или Нью-Йорке.",
    ],
    faqs: [
      { q: "Salsa On2 сложнее, чем Salsa On1?", a: "On2 объективно не сложнее. Он менее интуитивен для людей, выросших на западной музыке с сильной долей, потому что первый шаг break падает на 2, а не на 1. Танцоры, уже усвоившие On1, часто сообщают о периоде корректировки в 2-4 недели. Новички, которые сначала учат On2, обычно достигают того же уровня комфорта в том же темпе." },
      { q: "Нужно ли учить Salsa On1 перед On2?", a: "Нет. Ты можешь сначала учить On2. Первоначальные ученики Eddie Torres были в основном абсолютными новичками. Начало с On2 избегает переподключения привычек тайминга позже. Тем не менее, если ты живёшь в городе, где социальная сцена танцует On1, выучить On1 первым прагматично, потому что тебе нужно где-то практиковаться." },
      { q: "Salsa On2 — это то же самое, что Mambo?", a: "В современном онлайн-мире сальсы эти два термина используются взаимозаменяемо. Исторически Mambo был стилем танца Palladium Ballroom 1950-х, формализованным такими танцорами, как Cuban Pete, Millie Donay и позже Eddie Torres. Современный Salsa On2, иногда называемый нью-йоркским стилем, — прямой потомок этой традиции." },
      { q: "Сколько времени нужно, чтобы выучить Salsa On2?", a: "Ожидай 2-4 недели, чтобы танцевать базовый шаг музыкально с уверенностью, 3-6 месяцев, чтобы танцевать социально на уровне новичка с партнёром, и 1-2 года, чтобы достичь среднего социального комфорта. Эти оценки предполагают 3-5 часов осознанной практики в неделю, а не пассивное посещение занятий." },
      { q: "Могу ли я танцевать Salsa On2 в любом сальса-клубе?", a: "Ты можешь танцевать On2 под любую сальса-песню, но социально ты хочешь подстроиться под тайминг партнёра. В Нью-Йорке, большинстве европейских On2-сцен и в соревновательном мире доминирует On2. В большей части Латинской Америки, Карибов и многих местных сценах в Европе и США доминирует On1. Большинство опытных танцоров могут переключаться между ними." },
    ],
    ctaHeading: "Первые 30 дней Salsa On2, структурированно.",
    howToSteps: [
      { name: "Тренируй ухо для тумбао конги", text: "Слушай Salsa On2 треки и изолируй конгу. Повторяющийся «slap» падает на 2 и 6 восьмёрки. Услышать этот slap — обязательное условие для танца On2 в такт." },
      { name: "Освой базовый шаг соло", text: "Сначала практикуй 6-шаговый базовый шаг (break вперёд / break назад) без музыки. Считай вслух 1-2-3, 5-6-7 с паузой на 4 и 8. Ломайся (меняй направление) на 2, идя назад, и на 6, идя вперёд." },
      { name: "Добавь музыку в медленном темпе (~90 BPM)", text: "Когда шаг автоматизирован, танцуй его под медленный трек Mambo. Продолжай считать вслух. Большинство учителей рекомендуют записи Tito Puente или Eddie Torres Big Band среднего темпа в качестве музыки для практики." },
      { name: "Дриллируй перенос веса", text: "On2 требует задержанного переноса веса: сначала ставишь подушечку стопы, затем опускаешь пятку. Практикуй базовые шаги в замедленной съёмке, сосредоточившись только на том, как вес путешествует через стопу." },
      { name: "Пройди структурированный курс", text: "У самостоятельного обучения есть потолок. Учебная программа, которая изолирует работу ног, музыкальность, биомеханику и партнёрскую работу в правильном порядке, ускорит твой прогресс через плато, на которое самоучки выходят примерно через 6 месяцев." },
    ],
  },
  pl: {
    metaTitle: "Czym jest Salsa On2? Kompletny przewodnik po nowojorskim Mambo",
    metaDescription:
      "Salsa On2 to styl timingu, w którym tancerze łamią na 2. mierze muzyki. Nazywany też nowojorskim stylem lub Mambo. Pełna definicja, historia, biomechanika oraz 5-krokowa ścieżka dla początkującego.",
    breadcrumbHome: "Strona główna",
    breadcrumbCurrent: "Salsa On2",
    badge: "Przewodnik",
    h1Pre: "Czym jest Salsa On2? Kompletny przewodnik po ",
    h1Accent: "nowojorskim Mambo",
    shortAnswerRich:
      "Salsa On2 to styl timingu salsy, w którym łamiesz (zmieniasz kierunek) na **drugiej mierze** muzyki zamiast pierwszej. Nazywany też **nowojorskim stylem** lub **Mambo**. Styl został sformalizowany w Palladium Ballroom w Nowym Jorku w latach 50. i skodyfikowany dla nowoczesnego nauczania przez Eddie'go Torresa w latach 70. Tańczenie On2 wyrównuje twoje ciało z wzorcem slapu kongi, dając tańcowi gładsze, bardziej zsynkopowane uczucie niż On1.",
    sec1Title: "Główna idea: liczenie w 8",
    sec1Paragraphs: [
      "Każda piosenka salsy jest napisana w metrum 4/4, które tancerze liczą jako powtarzający się takt 8-miarowy (1, 2, 3, 4, 5, 6, 7, 8). Czy tańczysz On1 czy On2, robisz sześć kroków w każdym 8-miarowym takcie: trzy w pierwszej połowie i trzy w drugiej, z pauzami na 4 i 8.",
      "Tym, co się zmienia między dwoma stylami, jest *kiedy* zmieniasz kierunek, czyli to, co tancerze nazywają „krokiem break”. Tancerz On1 zmienia kierunek na 1. Tancerz On2 zmienia kierunek na 2. Reszta pracy stóp wynika z tej jednej decyzji.",
      "Powodem, dla którego to jest istotne, jest muzyka. W muzyce afro-kubańskiej konga gra wzorzec zwany tumbao. Jego charakterystyczny akcent, slap o otwartym tonie, pada na 2 i 6 każdego 8-miarowego taktu, nie na 1 i 5. Kiedy łamiesz na 2, twoja zmiana ciężaru ląduje na tym slap. Twoje ciało porusza się synchronicznie z sekcją rytmiczną zespołu, a nie z melodią.",
    ],
    sec2Title: "On1 vs On2 w skrócie",
    sec2HeadAttr: "Atrybut",
    sec2HeadOn1: "Salsa On1 (styl LA)",
    sec2HeadOn2: "Salsa On2 (styl NY)",
    sec2Rows: [
      { a: "Krok break", b: "Miara 1", c: "Miara 2" },
      { a: "Feeling", b: "Staccato, energiczny", c: "Gładki, rozluźniony" },
      { a: "Synchronizacja z", b: "Melodia / mocna miara", c: "Slap kongi / sekcja rytmiczna" },
      { a: "Pochodzenie", b: "Los Angeles, lata 90. (bracia Vazquez)", c: "Nowy Jork, Palladium lata 50." },
      { a: "Dominujące sceny", b: "LA, większość Ameryki Łacińskiej, większość europejskich miast", c: "NYC, salsa konkursowa, dedykowane sceny On2 na całym świecie" },
      { a: "Kanoniczny nauczyciel", b: "Eddie Torres zainspirował też wielu pionierów LA", c: "Eddie Torres (ojciec nowoczesnej pedagogiki On2)" },
    ],
    sec3Title: "Krótka historia: Palladium, Eddie Torres i nowoczesna On2",
    sec3Paragraphs: [
      "Na początku lat 50. Palladium Ballroom w Nowym Jorku stał się tyglem Mambo Craze. Tancerze klasy robotniczej z Bronxu, Brooklynu i Spanish Harlemu (Portorykańczycy, Włosi, Żydzi i Afroamerykanie) tańczyli przy big-bandowym Mambo prowadzonym przez Tito Puente, Tito Rodrigueza i Machito. Legendarni tancerze ery, jak Cuban Pete, Millie Donay i Killer Joe Piro, łączyli afro-kubańskie ugruntowanie z akrobatyką Lindy Hopa, frazowaniem stepowania i ramą tańca towarzyskiego.",
      "Mambo Palladium, które się wyłoniło, nie było jednym, znormalizowanym stylem. Było konkurencyjną subkulturą doraźnych wariacji. Niektórzy tancerze łamali na 1, inni na 2, jeszcze inni unosili się między nimi. Tym, co jednoczyło styl, była estetyka: ugruntowana dolna część ciała, zablokowana rama, szybka praca stóp, spokojna klatka piersiowa.",
      "W latach 70., po erze Palladium, tancerz o imieniu **Eddie Torres** skodyfikował to, co dziś rozpoznajemy jako standardowy timing „On2”. Torres uczył się u Tito Puente, a Puente powiedział mu, że łamanie na 2 jest bardziej wierne clave i tumbao niż łamanie na 1. Torres wziął tę zasadę muzyczną i zbudował wokół niej system, który można uczyć. Każdy nowoczesny program Salsa On2, w tym ten, ostatecznie wywodzi się z pracy strukturalnej Eddie'go Torresa.",
    ],
    sec4Title: "Dlaczego On2 czuje się inaczej w twoim ciele",
    sec4Paragraphs: [
      "Biomechanika On2 to kontrolowane przeciąganie liny. Twoja dolna część ciała poddaje się podłodze: kolana miękkie, środek ciężkości nisko, ciężar przewija się przez podbicie stopy, zanim opadnie pięta. Twoja górna część ciała sięga w górę: kręgosłup uniesiony, ramiona w dół, klatka piersiowa spokojna.",
      "To rozdzielenie między ugruntowaną dolną częścią ciała a uniesioną górną częścią to powód, dla którego światowej klasy tancerze On2 wyglądają, jakby się unosili, podczas gdy ich stopy poruszają się z zawrotnymi prędkościami. To także powód, dla którego taniec działa muzycznie: toczący się, lekko opóźniony transfer ciężaru naturalnie ląduje na slap kongi, zamiast wyprzedzać go.",
      "Dwa najczęstsze błędy nowicjusza to (1) tańczenie z prostymi, zablokowanymi nogami, co zabija opóźnienie i spłaszcza biodra w marsz, oraz (2) pozwalanie ramionom skakać w górę i w dół z pracą stóp, co niszczy ramę.",
    ],
    sec5Title: "Jak zacząć uczyć się Salsa On2",
    sec5Steps: [
      "**Wytrenuj ucho na tumbao kongi.** Słuchaj utworów salsy i izoluj kongę. Powtarzający się slap o otwartym tonie ląduje na 2 i 6. Dopóki nie usłyszysz tego slap, nie zatańczysz On2 wiarygodnie.",
      "**Opanuj krok podstawowy solo, bez muzyki.** Liczy na głos „1-2-3, 5-6-7” z pauzami na 4 i 8. Łam się do tyłu na 2, łam się do przodu na 6. Drilluj, aż krok stanie się automatyczny.",
      "**Dodaj muzykę w wolnym tempie (~90 BPM).** Gdy krok jest nudny, włącz wolny utwór Mambo (Tito Puente lub Eddie Torres Big Band są kanoniczne) i dopasuj swój krok podstawowy do muzyki, kontynuując liczenie na głos.",
      "**Drilluj transfer ciężaru.** Ćwicz podstawy w zwolnionym tempie, koncentrując się tylko na tym, jak twój ciężar podróżuje: najpierw podbicie stopy, potem opada pięta, ciężar osiada z miękkimi kolanami. To nawyk, który oddziela tancerza od chodzącego.",
      "**Weź ustrukturyzowany kurs.** Samodzielna nauka osiąga plateau po około sześciu miesiącach. Program nauczania, który izoluje pracę stóp, muzykalność, biomechanikę i pracę w parze we właściwej kolejności, przeprowadza cię przez to plateau znacznie szybciej. Dokładny powód to [link]reguła 85%[/link] uczenia motorycznego: twój mózg potrzebuje określonej równowagi sukcesu i porażki, aby kontynuować poprawę.",
    ],
    sec6Title: "Mity do zignorowania",
    sec6Bullets: [
      "**„On2 jest tylko dla zaawansowanych tancerzy.”** Fałsz. Absolutni początkujący mogą zacząć od On2. Dostosowanie jest trudniejsze, jeśli już lata trenowałeś ciało na On1, nie jeśli jesteś nowy.",
      "**„Salsa On2 to inny taniec niż salsa.”** To ten sam taniec z innym timingiem. Praca w parze, rama połączenia, shines, kombinacje. Słownik jest wspólny.",
      "**„Nie można tańczyć On2 przy muzyce w stylu LA.”** Możesz tańczyć On2 przy każdej piosence salsy. Czy będzie się to dobrze czuło, zależy od tempa i aranżacji perkusji utworu, a nie od tego, czy utwór został nagrany w LA czy w Nowym Jorku.",
    ],
    faqs: [
      { q: "Czy Salsa On2 jest trudniejsza niż Salsa On1?", a: "On2 nie jest obiektywnie trudniejsza. Jest mniej intuicyjna dla osób wychowanych na zachodniej muzyce z mocną miarą, ponieważ pierwszy krok break pada na 2, a nie na 1. Tancerze, którzy już zinternalizowali On1, często zgłaszają okres dostosowania od 2 do 4 tygodni. Początkujący, którzy najpierw uczą się On2, zwykle osiągają ten sam poziom komfortu w tym samym tempie." },
      { q: "Czy muszę uczyć się Salsa On1 przed nauką On2?", a: "Nie. Możesz najpierw uczyć się On2. Pierwsi uczniowie Eddie'go Torresa byli w większości absolutnymi początkującymi. Rozpoczynanie od On2 unika konieczności przeprogramowania nawyków timingu później. Mimo to, jeśli mieszkasz w mieście, w którym scena społeczna tańczy On1, najpierw uczyć się On1 jest pragmatyczne, ponieważ potrzebujesz miejsca do praktyki." },
      { q: "Czy Salsa On2 to to samo co Mambo?", a: "We współczesnym świecie online salsy te dwa terminy są używane wymiennie. Historycznie Mambo było stylem tańca Palladium Ballroom z lat 50., sformalizowanym przez tancerzy takich jak Cuban Pete, Millie Donay i później Eddie Torres. Współczesna Salsa On2, czasami nazywana nowojorskim stylem, jest bezpośrednim potomkiem tej tradycji." },
      { q: "Ile czasu zajmuje nauka Salsa On2?", a: "Spodziewaj się 2-4 tygodni, by tańczyć krok podstawowy muzycznie z pewnością siebie, 3-6 miesięcy, by tańczyć społecznie na poziomie początkującym z partnerem, i 1-2 lat, by osiągnąć średni komfort społeczny. Te szacunki zakładają 3-5 godzin świadomej praktyki tygodniowo, a nie biernego uczęszczania na zajęcia." },
      { q: "Czy mogę tańczyć Salsa On2 w każdym klubie salsy?", a: "Możesz tańczyć On2 przy każdej piosence salsy, ale społecznie chcesz dopasować się do timingu partnera. W Nowym Jorku, większości dedykowanych europejskich scen On2 i w świecie konkursowym dominuje On2. W dużej części Ameryki Łacińskiej, na Karaibach i w wielu lokalnych scenach w Europie i USA dominuje On1. Większość doświadczonych tancerzy może przełączać się między nimi." },
    ],
    ctaHeading: "Pierwsze 30 dni Salsa On2, ustrukturyzowane.",
    howToSteps: [
      { name: "Wytrenuj ucho na tumbao kongi", text: "Słuchaj utworów Salsa On2 i izoluj kongę. Powtarzający się 'slap' ląduje na 2 i 6 8-miarowego taktu. Słyszenie tego slap jest warunkiem koniecznym, aby tańczyć On2 w rytm." },
      { name: "Opanuj krok podstawowy solo", text: "Najpierw ćwicz 6-krokowy krok podstawowy (break do przodu / break do tyłu) bez muzyki. Liczy na głos 1-2-3, 5-6-7 z pauzą na 4 i 8. Łam się (zmień kierunek) na 2 idąc do tyłu, i na 6 idąc do przodu." },
      { name: "Dodaj muzykę w wolnym tempie (~90 BPM)", text: "Gdy krok jest automatyczny, tańcz go do wolnego utworu Mambo. Kontynuuj liczenie na głos. Większość nauczycieli zaleca nagrania w średnim tempie Tito Puente lub Eddie Torres Big Band jako muzykę do ćwiczeń." },
      { name: "Drilluj transfer ciężaru", text: "On2 wymaga opóźnionego transferu ciężaru: najpierw stawiasz podbicie stopy, potem pozwalasz opaść pięcie. Ćwicz podstawowe kroki w zwolnionym tempie, koncentrując się tylko na tym, jak ciężar podróżuje przez stopę." },
      { name: "Weź ustrukturyzowany kurs", text: "Samodzielna nauka ma sufit. Program nauczania, który izoluje pracę stóp, muzykalność, biomechanikę i pracę w parze we właściwej kolejności, przyspieszy cię poza plateau, na które samoucy trafiają po ~6 miesiącach." },
    ],
  },
  nl: {
    metaTitle: "Wat is Salsa On2? De complete gids voor New York Style Mambo",
    metaDescription:
      "Salsa On2 is een timingstijl waarbij dansers breken op de 2e tel van de muziek. Ook New York Style of Mambo genoemd. Volledige definitie, geschiedenis, biomechanica en een 5-stappenpad voor beginners.",
    breadcrumbHome: "Home",
    breadcrumbCurrent: "Salsa On2",
    badge: "De Gids",
    h1Pre: "Wat is Salsa On2? De complete gids voor ",
    h1Accent: "New York Style Mambo",
    shortAnswerRich:
      "Salsa On2 is een timingstijl van het salsadansen waarbij je breekt (van richting verandert) op de **tweede tel** van de muziek in plaats van de eerste. Het wordt ook **New York Style** of **Mambo** genoemd. De stijl werd geformaliseerd in het Palladium Ballroom van New York in de jaren 50 en gecodificeerd voor moderne lessen door Eddie Torres in de jaren 70. On2 dansen lijnt je lichaam uit met het slappatroon van de conga en geeft de dans een soepeler, syncopater gevoel dan On1.",
    sec1Title: "Het kernidee: tellen in 8en",
    sec1Paragraphs: [
      "Elk salsanummer is geschreven in 4/4-maat, die dansers tellen als een herhalende 8-telmeting (1, 2, 3, 4, 5, 6, 7, 8). Of je On1 of On2 danst, je doet zes stappen in elke 8 tellen: drie in de eerste helft en drie in de tweede helft, met pauzes op de 4 en de 8.",
      "Wat verandert tussen de twee stijlen is *wanneer* je van richting verandert, wat dansers de \"break-stap\" noemen. Een On1-danser verandert van richting op de 1. Een On2-danser verandert van richting op de 2. De rest van het voetenwerk volgt uit die ene beslissing.",
      "Waarom dit ertoe doet, is muzikaal. In Afro-Cubaanse muziek speelt de conga een patroon dat tumbao heet. Het bepalende accent, de open-toon-slap, valt op de 2 en de 6 van elke 8-telmeting, niet op de 1 en de 5. Wanneer je breekt op de 2, landt je gewichtsverandering op die slap. Je lichaam beweegt synchroon met de ritmesectie van de band in plaats van met de melodie.",
    ],
    sec2Title: "On1 vs On2 in één oogopslag",
    sec2HeadAttr: "Kenmerk",
    sec2HeadOn1: "Salsa On1 (LA Style)",
    sec2HeadOn2: "Salsa On2 (NY Style)",
    sec2Rows: [
      { a: "Break-stap", b: "Tel 1", c: "Tel 2" },
      { a: "Gevoel", b: "Staccato, energiek", c: "Soepel, ontspannen" },
      { a: "Synchroon met", b: "Melodie / downbeat", c: "Conga-slap / ritmesectie" },
      { a: "Oorsprong", b: "Los Angeles, jaren 90 (Vazquez-broers)", c: "New York, jaren 50 Palladium" },
      { a: "Dominante scenes", b: "LA, een groot deel van Latijns-Amerika, de meeste Europese steden", c: "NYC, competitiesalsa, dedicated On2-scenes wereldwijd" },
      { a: "Canonieke leraar", b: "Eddie Torres inspireerde ook veel LA-pioniers", c: "Eddie Torres (de vader van de moderne On2-pedagogiek)" },
    ],
    sec3Title: "Een korte geschiedenis: Palladium, Eddie Torres en moderne On2",
    sec3Paragraphs: [
      "In de vroege jaren 50 werd het Palladium Ballroom van New York de smeltkroes van de Mambo Craze. Dansers uit de arbeidersklasse uit de Bronx, Brooklyn en Spanish Harlem (Puerto Ricanen, Italianen, Joden en Afro-Amerikanen) dansten op big-band Mambo onder leiding van Tito Puente, Tito Rodriguez en Machito. De legendarische dansers van het tijdperk zoals Cuban Pete, Millie Donay en Killer Joe Piro versmolten Afro-Cubaanse grounding met Lindy Hop-acrobatiek, tap-frasering en ballroom-frame.",
      "De Palladium-Mambo die ontstond, was geen enkele, gestandaardiseerde stijl. Het was een competitieve subcultuur van ad-hoc variaties. Sommige dansers braken op de 1, anderen op de 2, anderen zweefden ertussen. Wat de stijl verenigde, was de esthetiek: geaard onderlichaam, vergrendeld frame, snel voetenwerk, stille borst.",
      "In de jaren 70, na het Palladium-tijdperk, codificeerde een danser genaamd **Eddie Torres** wat we nu herkennen als de standaard \"On2\"-timing. Torres studeerde onder Tito Puente, en Puente vertelde hem dat breken op de 2 trouwer was aan de clave en de tumbao dan breken op de 1. Torres nam dat muzikale principe en bouwde er een leerbaar systeem omheen. Elk modern Salsa On2-curriculum, inclusief dit, gaat uiteindelijk terug op het structurele werk van Eddie Torres.",
    ],
    sec4Title: "Waarom On2 anders aanvoelt in je lichaam",
    sec4Paragraphs: [
      "De biomechanica van On2 is een gecontroleerd touwtrekken. Je onderlichaam geeft zich over aan de vloer: knieën zacht, zwaartepunt laag, gewicht rolt door de bal van de voet voordat de hiel valt. Je bovenlichaam reikt omhoog: ruggengraat opgetild, schouders omlaag, borst stil.",
      "Die scheiding tussen een geaard onderlichaam en een opgetild bovenlichaam is waarom wereldklasse On2-dansers eruitzien alsof ze zweven terwijl hun voeten met duizelingwekkende snelheden bewegen. Het is ook waarom de dans muzikaal werkt: de rollende, licht vertraagde gewichtsoverdracht landt natuurlijk op de conga-slap in plaats van eraan vooruit te lopen.",
      "De twee meest voorkomende fouten die een nieuwkomer maakt zijn (1) dansen met rechte, vergrendelde benen, wat de vertraging doodt en de heupen plat maakt tot een mars, en (2) de schouders op en neer laten stuiteren met het voetenwerk, wat het frame vernietigt.",
    ],
    sec5Title: "Hoe je begint met Salsa On2 leren",
    sec5Steps: [
      "**Train je oor voor de conga-tumbao.** Luister naar salsanummers en isoleer de conga. De terugkerende open-toon-slap landt op de 2 en de 6. Tot je die slap kunt horen, kun je On2 niet betrouwbaar dansen.",
      "**Beheers de basisstap solo, zonder muziek.** Tel hardop \"1-2-3, 5-6-7\" met pauzes op de 4 en de 8. Breek terug op de 2, breek vooruit op de 6. Drill totdat de stap automatisch is.",
      "**Voeg muziek toe op een traag tempo (~90 BPM).** Zodra de stap saai is, zet een trage Mambo-track op (Tito Puente of Eddie Torres Big Band zijn canoniek) en pas je basisstap aan op de muziek terwijl je hardop blijft tellen.",
      "**Drill de gewichtsoverdracht.** Oefen slow-motion basisstappen waarbij je je alleen concentreert op hoe je gewicht reist: bal van de voet eerst, hiel valt later, gewicht zet zich met zachte knieën. Dit is de gewoonte die een danser onderscheidt van een stapper.",
      "**Volg een gestructureerde cursus.** Zelfstudie plateauiseert rond zes maanden. Een curriculum dat voetenwerk, muzikaliteit, lichaamsmechanica en partnerwerk in de juiste volgorde isoleert, brengt je veel sneller voorbij dat plateau. De exacte reden is [link]de 85%-regel[/link] van motorisch leren: je hersenen hebben een specifieke balans van succes en falen nodig om te blijven verbeteren.",
    ],
    sec6Title: "Mythes om te negeren",
    sec6Bullets: [
      "**\"On2 is alleen voor gevorderde dansers.\"** Onwaar. Absolute beginners kunnen met On2 beginnen. De aanpassing is moeilijker als je je lichaam al jarenlang op On1 hebt getraind, niet als je nieuw bent.",
      "**\"Salsa On2 is een andere dans dan salsa.\"** Het is dezelfde dans met een andere timing. Het partnerwerk, het verbindingsframe, de shines, de combinaties. Het vocabulaire is gedeeld.",
      "**\"Je kunt geen On2 dansen op LA-style muziek.\"** Je kunt On2 dansen op elk salsanummer. Of het lekker voelt, hangt af van het tempo en de percussiearrangement van het nummer, niet van het feit of het nummer is opgenomen in LA of New York.",
    ],
    faqs: [
      { q: "Is Salsa On2 moeilijker dan Salsa On1?", a: "On2 is objectief niet moeilijker. Het is minder intuïtief voor mensen die zijn opgegroeid met westerse downbeat-muziek, omdat de eerste break-stap op de 2 valt, niet op de 1. Dansers die On1 al hebben verinnerlijkt, melden vaak een aanpassingsperiode van 2-4 weken. Beginners die On2 als eerste leren, bereiken meestal hetzelfde comfortniveau in hetzelfde tempo." },
      { q: "Moet ik Salsa On1 leren voordat ik On2 leer?", a: "Nee. Je kunt On2 als eerste leren. De oorspronkelijke studenten van Eddie Torres waren grotendeels absolute beginners. Beginnen met On2 voorkomt het later opnieuw bedraden van timinggewoonten. Dat gezegd, als je in een stad woont waar de sociale scene On1 danst, is On1 eerst leren pragmatisch omdat je ergens nodig hebt om te oefenen." },
      { q: "Is Salsa On2 hetzelfde als Mambo?", a: "In de hedendaagse online salsawereld worden de twee termen door elkaar gebruikt. Historisch was Mambo de jaren-50 dansstijl van het Palladium Ballroom, geformaliseerd door dansers als Cuban Pete, Millie Donay en later Eddie Torres. Moderne Salsa On2, soms New York Style genoemd, is een directe afstammeling van die traditie." },
      { q: "Hoe lang duurt het om Salsa On2 te leren?", a: "Verwacht 2-4 weken om de basisstap muzikaal met vertrouwen te dansen, 3-6 maanden om sociaal op beginnersniveau met een partner te dansen, en 1-2 jaar om gemiddeld sociaal comfort te bereiken. Deze schattingen veronderstellen 3-5 uur bewuste oefening per week, geen passieve lesbezoek." },
      { q: "Kan ik Salsa On2 dansen in elke salsaclub?", a: "Je kunt On2 dansen op elk salsanummer, maar sociaal wil je de timing van je partner matchen. In New York City, de meeste dedicated On2-scenes van Europa en de competitiewereld domineert On2. In een groot deel van Latijns-Amerika, het Caribisch gebied en veel lokale scenes in Europa en de VS domineert On1. De meeste ervaren dansers kunnen tussen beide schakelen." },
    ],
    ctaHeading: "De eerste 30 dagen Salsa On2, gestructureerd.",
    howToSteps: [
      { name: "Train je oor voor de conga-tumbao", text: "Luister naar Salsa On2-nummers en isoleer de conga. De terugkerende 'slap' valt op de 2 en de 6 van de 8-telmeting. Deze slap horen is de voorwaarde om On2 op tijd te dansen." },
      { name: "Beheers de basisstap solo", text: "Oefen de 6-staps basis (vooruit-break / achteruit-break) eerst zonder muziek. Tel hardop 1-2-3, 5-6-7 met een pauze op 4 en 8. Breek (verander van richting) op de 2 als je achteruit gaat, en op de 6 als je vooruit gaat." },
      { name: "Voeg muziek toe op een traag tempo (~90 BPM)", text: "Zodra de stap automatisch is, dans hem op een trage Mambo-track. Blijf hardop tellen. De meeste leraren bevelen mid-tempo opnames van Tito Puente of Eddie Torres Big Band aan als oefenmuziek." },
      { name: "Drill de gewichtsoverdracht", text: "On2 vereist een vertraagde gewichtsoverdracht: je plaatst eerst de bal van de voet, dan laat je de hiel vallen. Oefen slow-motion basisstappen waarbij je je alleen concentreert op hoe gewicht door de voet reist." },
      { name: "Volg een gestructureerde cursus", text: "Zelfstudie heeft een plafond. Een curriculum dat voetenwerk, muzikaliteit, lichaamsmechanica en partnerwerk in de juiste volgorde isoleert, zal je sneller voorbij het plateau brengen dat zelflerende dansers bereiken op ~6 maanden." },
    ],
  },
  ar: {
    metaTitle: "ما هي Salsa On2؟ الدليل الكامل لأسلوب نيويورك Mambo",
    metaDescription:
      "Salsa On2 هي أسلوب توقيت يقوم فيه الراقصون بالكسر على النقرة الثانية من الموسيقى. تُسمى أيضاً أسلوب نيويورك أو Mambo. تعريف كامل، وتاريخ، وميكانيكا حيوية، ومسار من 5 خطوات للمبتدئين.",
    breadcrumbHome: "الرئيسية",
    breadcrumbCurrent: "Salsa On2",
    badge: "الدليل",
    h1Pre: "ما هي Salsa On2؟ الدليل الكامل لـ ",
    h1Accent: "أسلوب نيويورك Mambo",
    shortAnswerRich:
      "Salsa On2 هي أسلوب توقيت في رقصة السالسا حيث تكسر (تغير الاتجاه) على **النقرة الثانية** من الموسيقى بدلاً من الأولى. تُعرف أيضاً بـ **أسلوب نيويورك** أو **Mambo**. تم تشكيل الأسلوب رسمياً في Palladium Ballroom بنيويورك في الخمسينيات وتم تقنينه للتدريس الحديث بواسطة Eddie Torres في السبعينيات. رقص On2 يحاذي جسمك مع نمط slap الكونغا، مما يمنح الرقصة إحساساً أنعم وأكثر تركيباً من On1.",
    sec1Title: "الفكرة الأساسية: العد بالثمانيات",
    sec1Paragraphs: [
      "كل أغنية سالسا مكتوبة بميزان 4/4، يعدها الراقصون كقياس متكرر من 8 نقرات (1، 2، 3، 4، 5، 6، 7، 8). سواء رقصت On1 أو On2، تخطو ست خطوات في كل ثمانية: ثلاث في النصف الأول وثلاث في الثاني، مع توقفات على 4 و 8.",
      "ما يتغير بين الأسلوبين هو *متى* تغير الاتجاه، ما يسميه الراقصون «خطوة الكسر». راقص On1 يغير الاتجاه على 1. راقص On2 يغير الاتجاه على 2. باقي عمل القدمين يتبع تلك القرار الواحد.",
      "السبب في أهمية ذلك موسيقي. في الموسيقى الأفروكوبية، تعزف الكونغا نمطاً يسمى تومباو. لهجته المميزة، slap بالنغمة المفتوحة، تقع على 2 و 6 من كل قياس ثماني، وليس على 1 و 5. عندما تكسر على 2، يقع تغيير وزنك على ذلك slap. جسمك يتحرك بالتزامن مع قسم الإيقاع في الفرقة بدلاً من اللحن.",
    ],
    sec2Title: "On1 مقابل On2 لمحة سريعة",
    sec2HeadAttr: "الخاصية",
    sec2HeadOn1: "Salsa On1 (أسلوب LA)",
    sec2HeadOn2: "Salsa On2 (أسلوب NY)",
    sec2Rows: [
      { a: "خطوة الكسر", b: "النقرة 1", c: "النقرة 2" },
      { a: "الإحساس", b: "حاد، حيوي", c: "أنعم، مسترخٍ" },
      { a: "تزامن مع", b: "اللحن / النقرة القوية", c: "slap الكونغا / قسم الإيقاع" },
      { a: "الأصل", b: "لوس أنجلوس، التسعينيات (إخوة Vazquez)", c: "نيويورك، Palladium الخمسينيات" },
      { a: "الساحات المهيمنة", b: "LA، معظم أمريكا اللاتينية، معظم المدن الأوروبية", c: "نيويورك، سالسا المسابقات، ساحات On2 المخصصة حول العالم" },
      { a: "المعلم الرسمي", b: "Eddie Torres ألهم أيضاً كثيراً من رواد LA", c: "Eddie Torres (والد التربية الحديثة لـ On2)" },
    ],
    sec3Title: "تاريخ موجز: Palladium، Eddie Torres، و On2 الحديثة",
    sec3Paragraphs: [
      "في أوائل الخمسينيات، أصبح Palladium Ballroom في نيويورك بوتقة Mambo Craze. كان الراقصون من الطبقة العاملة من Bronx، Brooklyn، و Spanish Harlem (بورتوريكيون، إيطاليون، يهود، وأمريكيون من أصل أفريقي) يرقصون على Mambo big-band بقيادة Tito Puente، Tito Rodriguez، و Machito. الراقصون الأسطوريون في تلك الحقبة مثل Cuban Pete، Millie Donay، و Killer Joe Piro دمجوا التأصيل الأفروكوبي مع بهلوانية Lindy Hop، صياغة tap، وإطار قاعات الرقص.",
      "Mambo Palladium الذي ظهر لم يكن أسلوباً واحداً موحداً. كان ثقافة فرعية تنافسية من الاختلافات الفورية. بعض الراقصين كسروا على 1، آخرون على 2، آخرون يعومون بينهما. ما وحد الأسلوب كان الجمال: نصف سفلي مرسخ، إطار مقفل، عمل قدمين سريع، صدر هادئ.",
      "في السبعينيات، بعد عصر Palladium، قنّن راقص يدعى **Eddie Torres** ما نعترف به الآن باسم توقيت «On2» المعياري. درس Torres تحت Tito Puente، وأخبره Puente أن الكسر على 2 أكثر إخلاصاً للكلافي والتومباو من الكسر على 1. أخذ Torres ذلك المبدأ الموسيقي وبنى نظاماً قابلاً للتدريس حوله. كل منهج Salsa On2 حديث، بما في ذلك هذا، يعود في النهاية إلى العمل الهيكلي لـ Eddie Torres.",
    ],
    sec4Title: "لماذا يشعر On2 بشكل مختلف في جسمك",
    sec4Paragraphs: [
      "ميكانيكا On2 الحيوية هي شد حبل محكوم. نصفك السفلي يستسلم للأرض: الركبتان لينتان، مركز الجاذبية منخفض، الوزن يتدحرج عبر مشط القدم قبل أن يهبط الكعب. نصفك العلوي يمتد إلى أعلى: العمود الفقري مرفوع، الكتفان منخفضان، الصدر هادئ.",
      "ذلك الفصل بين نصف سفلي مرسخ ونصف علوي مرفوع هو السبب في أن راقصي On2 العالميين يبدون كأنهم يطفون بينما تتحرك أقدامهم بسرعات مذهلة. هو أيضاً السبب في أن الرقصة تعمل موسيقياً: نقل الوزن المتدحرج، المتأخر قليلاً، يهبط بشكل طبيعي على slap الكونغا بدلاً من سبقه.",
      "الخطآن الأكثر شيوعاً اللذان يرتكبهما المبتدئ هما (1) الرقص بساقين مستقيمتين ومقفلتين، مما يقتل التأخير ويسطح الوركين إلى مسيرة، و (2) السماح للكتفين بالقفز لأعلى وأسفل مع عمل القدمين، مما يدمر الإطار.",
    ],
    sec5Title: "كيف تبدأ في تعلم Salsa On2",
    sec5Steps: [
      "**درّب أذنك على تومباو الكونغا.** استمع إلى مسارات السالسا واعزل الكونغا. slap بالنغمة المفتوحة المتكرر يهبط على 2 و 6. حتى تتمكن من سماع تلك slap، لا يمكنك الرقص On2 بشكل موثوق.",
      "**أتقن الخطوة الأساسية منفرداً، بدون موسيقى.** عدّ بصوت عالٍ «1-2-3، 5-6-7» مع توقفات على 4 و 8. اكسر إلى الخلف على 2، اكسر إلى الأمام على 6. درّب حتى تصبح الخطوة تلقائية.",
      "**أضف الموسيقى بإيقاع بطيء (~90 BPM).** عندما تصبح الخطوة مملة، شغّل مسار Mambo بطيء (Tito Puente أو Eddie Torres Big Band هما الكلاسيكيان) وطابق خطوتك الأساسية مع الموسيقى مع الاستمرار في العد بصوت عالٍ.",
      "**درّب نقل الوزن.** مارس الخطوات الأساسية بحركة بطيئة، مركزاً فقط على كيفية انتقال وزنك: مشط القدم أولاً، الكعب يهبط بعد ذلك، الوزن يستقر مع ركبتين لينتين. هذه هي العادة التي تفصل الراقص عن الماشي.",
      "**خذ دورة منظمة.** الدراسة الذاتية تصل إلى مستوى ثابت حوالي ستة أشهر. منهج يعزل عمل القدمين والموسيقية والميكانيكا الحيوية والعمل مع الشريك بالترتيب الصحيح يأخذك خلف ذلك الثبات أسرع بكثير. السبب الدقيق هو [link]قاعدة الـ 85%[/link] للتعلم الحركي: عقلك يحتاج توازناً معيناً من النجاح والفشل ليستمر في التحسن.",
    ],
    sec6Title: "خرافات يجب تجاهلها",
    sec6Bullets: [
      "**«On2 فقط للراقصين المتقدمين.»** خطأ. المبتدئون التام يمكنهم البدء بـ On2. التعديل أصعب إذا كنت قد دربت جسمك على On1 لسنوات، وليس إذا كنت جديداً.",
      "**«Salsa On2 رقصة مختلفة عن السالسا.»** إنها نفس الرقصة بتوقيت مختلف. العمل مع الشريك، إطار الاتصال، الـ shines، التركيبات. المفردات مشتركة.",
      "**«لا يمكنك رقص On2 على موسيقى أسلوب LA.»** يمكنك رقص On2 على أي أغنية سالسا. سواء كان شعور جيداً يعتمد على إيقاع الأغنية وترتيب الإيقاع، وليس على ما إذا كانت الأغنية مسجلة في LA أو نيويورك.",
    ],
    faqs: [
      { q: "هل Salsa On2 أصعب من Salsa On1؟", a: "On2 ليست أصعب موضوعياً. هي أقل بديهية للأشخاص الذين نشأوا على الموسيقى الغربية ذات النقرة القوية، لأن أول خطوة كسر تقع على 2، لا على 1. الراقصون الذين استوعبوا On1 بالفعل غالباً ما يبلغون عن فترة تكيف من 2-4 أسابيع. المبتدئون الذين يتعلمون On2 أولاً عادةً ما يصلون إلى نفس مستوى الراحة بنفس المعدل." },
      { q: "هل أحتاج لتعلم Salsa On1 قبل تعلم On2؟", a: "لا. يمكنك تعلم On2 أولاً. كان معظم طلاب Eddie Torres الأصليين مبتدئين تامين. البدء بـ On2 يتجنب إعادة توصيل عادات التوقيت لاحقاً. ومع ذلك، إذا كنت تعيش في مدينة حيث الساحة الاجتماعية ترقص On1، فإن تعلم On1 أولاً عملي لأنك تحتاج إلى مكان للممارسة." },
      { q: "هل Salsa On2 هي نفس Mambo؟", a: "في عالم السالسا الإلكتروني المعاصر، يستخدم المصطلحان بالتبادل. تاريخياً، كان Mambo أسلوب الرقص في Palladium Ballroom في الخمسينيات، الذي شكّله راقصون مثل Cuban Pete، Millie Donay، ولاحقاً Eddie Torres. Salsa On2 الحديثة، التي تسمى أحياناً أسلوب نيويورك، هي نسل مباشر لتلك التقاليد." },
      { q: "كم من الوقت يستغرق تعلم Salsa On2؟", a: "توقع 2-4 أسابيع لرقص الخطوة الأساسية موسيقياً بثقة، 3-6 أشهر للرقص اجتماعياً على مستوى المبتدئين مع شريك، و 1-2 سنة للوصول إلى راحة اجتماعية متوسطة. هذه التقديرات تفترض 3-5 ساعات من الممارسة المتعمدة في الأسبوع، وليس حضوراً سلبياً للفصول." },
      { q: "هل يمكنني رقص Salsa On2 في أي نادي سالسا؟", a: "يمكنك رقص On2 على أي أغنية سالسا، لكن اجتماعياً تريد مطابقة توقيت شريكك. في مدينة نيويورك، معظم ساحات On2 المخصصة في أوروبا، وعالم المنافسات، يهيمن On2. في كثير من أمريكا اللاتينية، الكاريبي، وكثير من الساحات المحلية في أوروبا والولايات المتحدة، يهيمن On1. معظم الراقصين ذوي الخبرة يمكنهم التبديل بين الاثنين." },
    ],
    ctaHeading: "أول 30 يوماً من Salsa On2، منظمة.",
    howToSteps: [
      { name: "درّب أذنك على تومباو الكونغا", text: "استمع إلى مسارات Salsa On2 واعزل الكونغا. الـ 'slap' المتكرر يهبط على 2 و 6 من القياس الثماني. سماع هذه slap هو شرط مسبق لرقص On2 في الوقت." },
      { name: "أتقن الخطوة الأساسية منفرداً", text: "مارس الخطوة الأساسية ذات الـ 6 خطوات (كسر للأمام / كسر للخلف) بدون موسيقى أولاً. عدّ بصوت عالٍ 1-2-3، 5-6-7 مع توقف على 4 و 8. اكسر (غيّر الاتجاه) على 2 ذاهباً للخلف، وعلى 6 ذاهباً للأمام." },
      { name: "أضف الموسيقى بإيقاع بطيء (~90 BPM)", text: "بمجرد أن تصبح الخطوة تلقائية، ارقصها على مسار Mambo بطيء. استمر في العد بصوت عالٍ. معظم المعلمين يوصون بتسجيلات Tito Puente أو Eddie Torres Big Band بإيقاع متوسط كموسيقى للممارسة." },
      { name: "درّب نقل الوزن", text: "On2 يتطلب نقل وزن متأخر: تضع مشط القدم أولاً، ثم تترك الكعب يهبط. مارس الخطوات الأساسية بحركة بطيئة، مركزاً فقط على كيفية انتقال الوزن عبر القدم." },
      { name: "خذ دورة منظمة", text: "للدراسة الذاتية سقف. منهج يعزل عمل القدمين والموسيقية والميكانيكا الحيوية والعمل مع الشريك بالترتيب الصحيح سيسرعك خلف الثبات الذي يصل إليه الراقصون الذاتيون عند ~6 أشهر." },
    ],
  },
  el: {
    metaTitle: "Τι είναι η Salsa On2; Ο πλήρης οδηγός για το Mambo Στιλ Νέας Υόρκης",
    metaDescription:
      "Η Salsa On2 είναι ένα στιλ timing όπου οι χορευτές σπάνε στον 2ο χρόνο της μουσικής. Ονομάζεται επίσης Στιλ Νέας Υόρκης ή Mambo. Πλήρης ορισμός, ιστορία, εμβιομηχανική και μονοπάτι 5 βημάτων για τον εκκινήριο.",
    breadcrumbHome: "Αρχική",
    breadcrumbCurrent: "Salsa On2",
    badge: "Ο Οδηγός",
    h1Pre: "Τι είναι η Salsa On2; Ο πλήρης οδηγός για το ",
    h1Accent: "Mambo Στιλ Νέας Υόρκης",
    shortAnswerRich:
      "Η Salsa On2 είναι ένα στιλ timing του χορού salsa όπου σπας (αλλάζεις κατεύθυνση) στον **δεύτερο χρόνο** της μουσικής αντί του πρώτου. Ονομάζεται επίσης **Στιλ Νέας Υόρκης** ή **Mambo**. Το στιλ τυποποιήθηκε στο Palladium Ballroom της Νέας Υόρκης στη δεκαετία του '50 και κωδικοποιήθηκε για σύγχρονη διδασκαλία από τον Eddie Torres στη δεκαετία του '70. Ο χορός On2 ευθυγραμμίζει το σώμα σου με το μοτίβο slap της conga, δίνοντας στον χορό μια πιο ομαλή, πιο συγκοπτική αίσθηση από την On1.",
    sec1Title: "Η βασική ιδέα: μέτρηση σε 8άρια",
    sec1Paragraphs: [
      "Κάθε τραγούδι salsa είναι γραμμένο σε 4/4, που οι χορευτές μετράνε ως ένα επαναλαμβανόμενο μέτρο 8 χρόνων (1, 2, 3, 4, 5, 6, 7, 8). Είτε χορεύεις On1 είτε On2, κάνεις έξι βήματα μέσα σε κάθε 8άρι: τρία στο πρώτο μισό και τρία στο δεύτερο, με παύσεις στον 4 και τον 8.",
      "Αυτό που αλλάζει μεταξύ των δύο στιλ είναι *πότε* αλλάζεις κατεύθυνση, αυτό που οι χορευτές αποκαλούν «βήμα break». Ο χορευτής On1 αλλάζει κατεύθυνση στον 1. Ο χορευτής On2 αλλάζει κατεύθυνση στον 2. Το υπόλοιπο της εργασίας ποδιών ακολουθεί από αυτή τη μία απόφαση.",
      "Ο λόγος που αυτό έχει σημασία είναι μουσικός. Στην αφρο-κουβανική μουσική, η conga παίζει ένα μοτίβο που λέγεται tumbao. Η χαρακτηριστική προφορά του, το slap ανοιχτού τόνου, πέφτει στον 2 και τον 6 κάθε 8άρι, όχι στον 1 και τον 5. Όταν σπας στον 2, η αλλαγή βάρους σου προσγειώνεται σε αυτό το slap. Το σώμα σου κινείται συγχρονισμένα με το ρυθμικό τμήμα της μπάντας αντί για τη μελωδία.",
    ],
    sec2Title: "On1 vs On2 με μια ματιά",
    sec2HeadAttr: "Χαρακτηριστικό",
    sec2HeadOn1: "Salsa On1 (Στιλ LA)",
    sec2HeadOn2: "Salsa On2 (Στιλ NY)",
    sec2Rows: [
      { a: "Βήμα break", b: "Χρόνος 1", c: "Χρόνος 2" },
      { a: "Αίσθηση", b: "Staccato, ενεργητικό", c: "Ομαλό, χαλαρό" },
      { a: "Συγχρονισμός με", b: "Μελωδία / downbeat", c: "Slap conga / ρυθμικό τμήμα" },
      { a: "Προέλευση", b: "Λος Άντζελες, δεκαετία '90 (αδέλφια Vazquez)", c: "Νέα Υόρκη, Palladium δεκαετία '50" },
      { a: "Κυρίαρχες σκηνές", b: "LA, μεγάλο μέρος της Λατινικής Αμερικής, οι περισσότερες ευρωπαϊκές πόλεις", c: "NYC, αγωνιστική salsa, αφιερωμένες σκηνές On2 παγκοσμίως" },
      { a: "Κανονικός δάσκαλος", b: "Ο Eddie Torres ενέπνευσε επίσης πολλούς πρωτοπόρους του LA", c: "Eddie Torres (ο πατέρας της σύγχρονης παιδαγωγικής On2)" },
    ],
    sec3Title: "Σύντομη ιστορία: Palladium, Eddie Torres και σύγχρονο On2",
    sec3Paragraphs: [
      "Στις αρχές της δεκαετίας του '50, το Palladium Ballroom της Νέας Υόρκης έγινε το χωνευτήρι του Mambo Craze. Χορευτές της εργατικής τάξης από το Bronx, το Brooklyn και το Spanish Harlem (Πορτορικανοί, Ιταλοί, Εβραίοι και Αφροαμερικανοί) χόρευαν σε big-band Mambo με επικεφαλής τους Tito Puente, Tito Rodriguez και Machito. Οι θρυλικοί χορευτές της εποχής όπως οι Cuban Pete, Millie Donay και Killer Joe Piro συνέκεραν το αφρο-κουβανικό grounding με την ακροβατική του Lindy Hop, την φραστική του tap και το frame των χορών αιθούσης.",
      "Το Mambo του Palladium που προέκυψε δεν ήταν ένα ενιαίο, τυποποιημένο στιλ. Ήταν μια ανταγωνιστική υποκουλτούρα ad-hoc παραλλαγών. Κάποιοι χορευτές έσπαγαν στον 1, άλλοι στον 2, άλλοι αιωρούνταν ανάμεσα. Αυτό που ένωνε το στιλ ήταν η αισθητική: γειωμένο κάτω σώμα, κλειδωμένο frame, γρήγορη εργασία ποδιών, ήσυχο στήθος.",
      "Στη δεκαετία του '70, μετά την εποχή του Palladium, ένας χορευτής ονόματι **Eddie Torres** κωδικοποίησε αυτό που τώρα αναγνωρίζουμε ως το πρότυπο timing «On2». Ο Torres σπούδασε υπό τον Tito Puente, και ο Puente του είπε ότι το σπάσιμο στον 2 ήταν πιο πιστό στην clave και το tumbao από το σπάσιμο στον 1. Ο Torres πήρε αυτή τη μουσική αρχή και έχτισε ένα διδακτικό σύστημα γύρω της. Κάθε σύγχρονο πρόγραμμα Salsa On2, συμπεριλαμβανομένου αυτού, εν τέλει ανάγεται στο δομικό έργο του Eddie Torres.",
    ],
    sec4Title: "Γιατί το On2 αισθάνεται διαφορετικά στο σώμα σου",
    sec4Paragraphs: [
      "Η εμβιομηχανική του On2 είναι ένα ελεγχόμενο πάλεμα διελκυστίνδας. Το κάτω σώμα σου παραδίδεται στο πάτωμα: γόνατα μαλακά, κέντρο βάρους χαμηλά, βάρος που κυλάει μέσα από την μπάλα του ποδιού πριν πέσει η φτέρνα. Το πάνω σώμα σου εκτείνεται προς τα πάνω: σπονδυλική στήλη ανυψωμένη, ώμοι κάτω, στήθος ήσυχο.",
      "Αυτός ο διαχωρισμός μεταξύ ενός γειωμένου κάτω σώματος και ενός ανυψωμένου πάνω σώματος είναι ο λόγος που οι παγκοσμίου επιπέδου χορευτές On2 φαίνεται να αιωρούνται ενώ τα πόδια τους κινούνται σε ιλιγγιώδεις ταχύτητες. Είναι επίσης ο λόγος που ο χορός λειτουργεί μουσικά: η κυλιόμενη, ελαφρώς καθυστερημένη μεταφορά βάρους προσγειώνεται φυσικά στο slap της conga αντί να τρέχει μπροστά του.",
      "Τα δύο πιο κοινά λάθη που κάνει ένας νεοεισερχόμενος είναι (1) να χορεύει με ίσια, κλειδωμένα πόδια, που σκοτώνει την καθυστέρηση και ισοπεδώνει τους γοφούς σε πορεία, και (2) να αφήνει τους ώμους να αναπηδούν πάνω-κάτω με την εργασία ποδιών, που καταστρέφει το frame.",
    ],
    sec5Title: "Πώς να ξεκινήσεις να μαθαίνεις Salsa On2",
    sec5Steps: [
      "**Εκπαίδευσε το αυτί σου στο tumbao της conga.** Άκου κομμάτια salsa και απομόνωσε την conga. Το επαναλαμβανόμενο slap ανοιχτού τόνου προσγειώνεται στον 2 και τον 6. Μέχρι να ακούσεις αυτό το slap, δεν μπορείς να χορέψεις On2 αξιόπιστα.",
      "**Κατέκτησε το βασικό βήμα μόνος, χωρίς μουσική.** Μέτρα δυνατά «1-2-3, 5-6-7» με παύσεις στον 4 και τον 8. Σπάσε πίσω στον 2, σπάσε μπροστά στον 6. Δούλεψε μέχρι το βήμα να γίνει αυτόματο.",
      "**Πρόσθεσε μουσική σε αργό tempo (~90 BPM).** Όταν το βήμα γίνει βαρετό, βάλε ένα αργό κομμάτι Mambo (Tito Puente ή Eddie Torres Big Band είναι κανονικοί) και ταίριαξε το βασικό σου βήμα με τη μουσική συνεχίζοντας να μετράς δυνατά.",
      "**Δούλεψε τη μεταφορά βάρους.** Εξάσκησε αργά βασικά εστιάζοντας μόνο στο πώς ταξιδεύει το βάρος σου: μπάλα του ποδιού πρώτα, φτέρνα μετά, βάρος που εγκαθίσταται με μαλακά γόνατα. Αυτή είναι η συνήθεια που χωρίζει έναν χορευτή από έναν περπατητή.",
      "**Πάρε ένα δομημένο μάθημα.** Η αυτο-εκπαίδευση φτάνει σε plateau γύρω στους έξι μήνες. Ένα πρόγραμμα που απομονώνει την εργασία ποδιών, τη μουσικότητα, την εμβιομηχανική και την εργασία ζευγαριού με τη σωστή σειρά σε προσπερνά αυτό το plateau πολύ πιο γρήγορα. Ο ακριβής λόγος είναι ο [link]κανόνας του 85%[/link] της κινητικής μάθησης: ο εγκέφαλός σου χρειάζεται μια συγκεκριμένη ισορροπία επιτυχίας και αποτυχίας για να συνεχίσει να βελτιώνεται.",
    ],
    sec6Title: "Μύθοι προς αγνόηση",
    sec6Bullets: [
      "**«Το On2 είναι μόνο για προχωρημένους χορευτές.»** Ψέμα. Οι απόλυτοι αρχάριοι μπορούν να ξεκινήσουν με On2. Η προσαρμογή είναι πιο δύσκολη αν ήδη έχεις εκπαιδεύσει το σώμα σου σε On1 για χρόνια, όχι αν είσαι νέος.",
      "**«Η Salsa On2 είναι διαφορετικός χορός από τη salsa.»** Είναι ο ίδιος χορός με διαφορετικό timing. Η εργασία ζευγαριού, το frame σύνδεσης, τα shines, οι συνδυασμοί. Το λεξιλόγιο είναι κοινό.",
      "**«Δεν μπορείς να χορεύεις On2 σε μουσική στιλ LA.»** Μπορείς να χορεύεις On2 σε οποιοδήποτε τραγούδι salsa. Το αν αισθάνεται καλά εξαρτάται από το tempo και την ενορχήστρωση κρουστών του τραγουδιού, όχι από το αν το τραγούδι ηχογραφήθηκε στο LA ή στη Νέα Υόρκη.",
    ],
    faqs: [
      { q: "Είναι η Salsa On2 πιο δύσκολη από τη Salsa On1;", a: "Το On2 δεν είναι αντικειμενικά πιο δύσκολο. Είναι λιγότερο διαισθητικό για ανθρώπους που μεγάλωσαν με δυτική μουσική downbeat, επειδή το πρώτο βήμα break πέφτει στον 2, όχι στον 1. Χορευτές που έχουν ήδη εσωτερικεύσει το On1 συχνά αναφέρουν περίοδο προσαρμογής 2-4 εβδομάδων. Αρχάριοι που μαθαίνουν On2 πρώτοι συνήθως φτάνουν στο ίδιο επίπεδο άνεσης με τον ίδιο ρυθμό." },
      { q: "Χρειάζεται να μάθω Salsa On1 πριν μάθω On2;", a: "Όχι. Μπορείς να μάθεις On2 πρώτο. Οι αρχικοί μαθητές του Eddie Torres ήταν κυρίως απόλυτοι αρχάριοι. Ξεκινώντας με On2 αποφεύγεις να επαναπρογραμματίζεις συνήθειες timing αργότερα. Παρ' όλα αυτά, αν ζεις σε πόλη όπου η κοινωνική σκηνή χορεύει On1, μαθαίνοντας On1 πρώτο είναι πραγματιστικό επειδή χρειάζεσαι κάπου να εξασκείσαι." },
      { q: "Είναι η Salsa On2 το ίδιο πράγμα με το Mambo;", a: "Στον σύγχρονο online κόσμο της salsa, οι δύο όροι χρησιμοποιούνται εναλλακτικά. Ιστορικά, το Mambo ήταν το χορευτικό στιλ της δεκαετίας του '50 του Palladium Ballroom, που τυποποιήθηκε από χορευτές όπως οι Cuban Pete, Millie Donay και αργότερα ο Eddie Torres. Η σύγχρονη Salsa On2, που μερικές φορές αποκαλείται Στιλ Νέας Υόρκης, είναι άμεσος απόγονος αυτής της παράδοσης." },
      { q: "Πόσο χρόνο χρειάζεται για να μάθεις Salsa On2;", a: "Περίμενε 2-4 εβδομάδες για να χορέψεις το βασικό βήμα μουσικά με αυτοπεποίθηση, 3-6 μήνες για να χορέψεις κοινωνικά σε επίπεδο αρχαρίου με σύντροφο, και 1-2 χρόνια για να φτάσεις σε ενδιάμεση κοινωνική άνεση. Αυτές οι εκτιμήσεις προϋποθέτουν 3-5 ώρες σκόπιμης εξάσκησης την εβδομάδα, όχι παθητική παρακολούθηση μαθημάτων." },
      { q: "Μπορώ να χορεύω Salsa On2 σε οποιοδήποτε κλαμπ salsa;", a: "Μπορείς να χορεύεις On2 σε οποιοδήποτε τραγούδι salsa, αλλά κοινωνικά θες να ταιριάξεις το timing του παρτενέρ σου. Στη Νέα Υόρκη, στις περισσότερες αφιερωμένες σκηνές On2 της Ευρώπης και στον αγωνιστικό κόσμο, το On2 κυριαρχεί. Σε μεγάλο μέρος της Λατινικής Αμερικής, της Καραϊβικής και πολλών τοπικών σκηνών στην Ευρώπη και τις ΗΠΑ, το On1 κυριαρχεί. Οι περισσότεροι έμπειροι χορευτές μπορούν να εναλλάσσονται μεταξύ των δύο." },
    ],
    ctaHeading: "Οι πρώτες 30 ημέρες Salsa On2, δομημένες.",
    howToSteps: [
      { name: "Εκπαίδευσε το αυτί σου στο tumbao της conga", text: "Άκου κομμάτια Salsa On2 και απομόνωσε την conga. Το επαναλαμβανόμενο 'slap' πέφτει στον 2 και τον 6 του 8άρι. Το να ακούσεις αυτό το slap είναι προαπαιτούμενο για να χορεύεις On2 στο tempo." },
      { name: "Κατέκτησε το βασικό βήμα μόνος", text: "Εξάσκησε το βασικό 6 βημάτων (break μπροστά / break πίσω) χωρίς μουσική πρώτα. Μέτρα δυνατά 1-2-3, 5-6-7 με παύση στον 4 και τον 8. Σπάσε (αλλάξε κατεύθυνση) στον 2 πηγαίνοντας πίσω, και στον 6 πηγαίνοντας μπροστά." },
      { name: "Πρόσθεσε μουσική σε αργό tempo (~90 BPM)", text: "Μόλις το βήμα είναι αυτόματο, χόρεψέ το σε ένα αργό κομμάτι Mambo. Συνέχισε να μετράς δυνατά. Οι περισσότεροι δάσκαλοι συνιστούν ηχογραφήσεις μέτριου tempo του Tito Puente ή του Eddie Torres Big Band ως μουσική εξάσκησης." },
      { name: "Δούλεψε τη μεταφορά βάρους", text: "Το On2 απαιτεί καθυστερημένη μεταφορά βάρους: τοποθετείς πρώτα την μπάλα του ποδιού, μετά αφήνεις τη φτέρνα να πέσει. Εξάσκησε αργά βασικά βήματα εστιάζοντας μόνο στο πώς ταξιδεύει το βάρος μέσα από το πόδι." },
      { name: "Πάρε ένα δομημένο μάθημα", text: "Η αυτο-εκπαίδευση έχει ταβάνι. Ένα πρόγραμμα που απομονώνει την εργασία ποδιών, τη μουσικότητα, την εμβιομηχανική και την εργασία ζευγαριού με τη σωστή σειρά θα σε επιταχύνει πέρα από το plateau που οι αυτοδίδακτοι χορευτές χτυπούν στους ~6 μήνες." },
    ],
  },
  sr: {
    metaTitle: "Шта је Salsa On2? Комплетан водич за њујоршки стил Mambo",
    metaDescription:
      "Salsa On2 је стил тајминга где играчи ломе на 2. доби музике. Зове се и њујоршки стил или Mambo. Потпуна дефиниција, историја, биомеханика и пут од 5 корака за почетнике.",
    breadcrumbHome: "Почетна",
    breadcrumbCurrent: "Salsa On2",
    badge: "Водич",
    h1Pre: "Шта је Salsa On2? Комплетан водич за ",
    h1Accent: "њујоршки стил Mambo",
    shortAnswerRich:
      "Salsa On2 је стил тајминга салса плеса где ломиш (мењаш правац) на **другој доби** музике уместо прве. Зове се и **њујоршки стил** или **Mambo**. Стил је формализован у Palladium Ballroom-у у Њујорку 1950-их и кодификован за модерну наставу од стране Eddie Torres-а 1970-их. Плес On2 поравнава твоје тело са slap обрасцем конге, дајући плесу глаткији, синкопаранији осећај од On1.",
    sec1Title: "Кључна идеја: бројање у осмицама",
    sec1Paragraphs: [
      "Свака салса песма је написана у 4/4 такту, који играчи броје као понављајућу осмицу (1, 2, 3, 4, 5, 6, 7, 8). Било да играш On1 или On2, правиш шест корака у свакој осмици: три у првој половини и три у другој, са паузама на 4 и 8.",
      "Оно што се мења између два стила је *када* мењаш правац, оно што играчи зову „break корак“. On1 играч мења правац на 1. On2 играч мења правац на 2. Остатак рада ногу следи из те једне одлуке.",
      "Разлог зашто је ово важно је музички. У афро-кубанској музици, конга свира образац који се зове тумбао. Његов карактеристичан акценат, slap отвореног тона, пада на 2 и 6 сваке осмице, не на 1 и 5. Када ломиш на 2, твоја промена тежине пада на тај slap. Твоје тело се креће у синхронији са ритмичком секцијом бенда уместо са мелодијом.",
    ],
    sec2Title: "On1 vs On2 на први поглед",
    sec2HeadAttr: "Атрибут",
    sec2HeadOn1: "Salsa On1 (LA стил)",
    sec2HeadOn2: "Salsa On2 (NY стил)",
    sec2Rows: [
      { a: "Break корак", b: "Доба 1", c: "Доба 2" },
      { a: "Осећај", b: "Стакато, енергично", c: "Глатко, опуштено" },
      { a: "Синхронизација са", b: "Мелодија / јака доба", c: "Slap конге / ритмичка секција" },
      { a: "Порекло", b: "Лос Анђелес, 1990-е (браћа Vazquez)", c: "Њујорк, Palladium 1950-их" },
      { a: "Доминантне сцене", b: "LA, већина Латинске Америке, већина европских градова", c: "NYC, такмичарска салса, посвећене On2 сцене широм света" },
      { a: "Канонски учитељ", b: "Eddie Torres је такође инспирисао многе LA пионире", c: "Eddie Torres (отац модерне On2 педагогије)" },
    ],
    sec3Title: "Кратка историја: Palladium, Eddie Torres и модерни On2",
    sec3Paragraphs: [
      "Почетком 1950-их, Palladium Ballroom у Њујорку је постао лонац Mambo Craze. Радничка класа играча из Бронкса, Бруклина и шпанског Харлема (Порториканци, Италијани, Јевреји и Афроамериканци) играла је уз биг-банд Mambo предвођен од стране Tito Puente, Tito Rodriguez и Machito. Легендарни играчи ере као Cuban Pete, Millie Donay и Killer Joe Piro су стопили афро-кубанско уземљење са акробатиком Lindy Hop-а, фразирањем степа и оквиром бала.",
      "Mambo Palladium-а који је настао није био један стандардизован стил. Био је такмичарска подкултура импровизованих варијација. Неки играчи су ломили на 1, други на 2, неки лебдели између. Оно што је уједињавало стил била је естетика: уземљено доње тело, закључан оквир, брзи рад ногу, мирне груди.",
      "У 1970-им, после ере Palladium-а, играч по имену **Eddie Torres** кодификовао је оно што данас препознајемо као стандардни „On2“ тајминг. Torres је учио код Tito Puente, и Puente му је рекао да је ломљење на 2 верније клавину и тумбау од ломљења на 1. Torres је узео тај музички принцип и изградио систем који се може учити око њега. Сваки модерни Salsa On2 програм, укључујући овај, у крајњој линији потиче од структурног рада Eddie Torres-а.",
    ],
    sec4Title: "Зашто се On2 другачије осећа у твом телу",
    sec4Paragraphs: [
      "Биомеханика On2 је контролисано надвлачење конопца. Твоје доње тело се предаје поду: колена мека, центар гравитације низак, тежина се котрља кроз јастуче стопала пре него што пета падне. Твоје горње тело се пружа нагоре: кичма подигнута, рамена доле, груди мирне.",
      "То раздвајање између уземљеног доњег тела и подигнутог горњег тела је разлог зашто играчи On2 светске класе изгледају као да лебде док им се ноге крећу вртоглавим брзинама. То је такође разлог зашто плес функционише музички: котрљајући, благо одложени пренос тежине природно пада на slap конге уместо да трчи испред њега.",
      "Две најчешће грешке које новајлија прави су (1) играње са правим, закључаним ногама, што убија одлагање и спљошти кукове у марш, и (2) допуштање раменима да скачу горе-доле са радом ногу, што уништава оквир.",
    ],
    sec5Title: "Како почети учити Salsa On2",
    sec5Steps: [
      "**Тренирај ухо за тумбао конге.** Слушај салса нумере и изолуј конгу. Понављајући slap отвореног тона пада на 2 и 6. Док не можеш да чујеш тај slap, не можеш поуздано да играш On2.",
      "**Савладај основни корак сам, без музике.** Броји наглас „1-2-3, 5-6-7“ са паузама на 4 и 8. Ломи назад на 2, ломи напред на 6. Дрилуј док корак не постане аутоматски.",
      "**Додај музику у спором темпу (~90 BPM).** Када корак постане досадан, пусти спору Mambo нумеру (Tito Puente или Eddie Torres Big Band су канонски) и усклади свој основни корак са музиком настављајући да бројиш наглас.",
      "**Дрилуј пренос тежине.** Вежбај основе у спором покрету фокусирајући се само на то како твоја тежина путује: јастуче стопала прво, пета пада касније, тежина се смирује са меким коленима. Ово је навика која дели играча од пешака.",
      "**Узми структуриран курс.** Самостално учење достиже плато око шест месеци. Програм који изолује рад ногу, музикалност, биомеханику и рад у пару у правом редоследу те води преко тог платоа много брже. Тачан разлог је [link]правило 85%[/link] моторног учења: твој мозак треба специфичну равнотежу успеха и неуспеха да би наставио да се побољшава.",
    ],
    sec6Title: "Митови које треба игнорисати",
    sec6Bullets: [
      "**„On2 је само за напредне играче.“** Лажно. Апсолутни почетници могу да почну са On2. Прилагођавање је теже ако си већ годинама тренирао тело за On1, не ако си нов.",
      "**„Salsa On2 је другачији плес од салсе.“** То је исти плес са другачијим тајмингом. Рад у пару, оквир везе, shines, комбинације. Речник је заједнички.",
      "**„Не можеш да играш On2 уз LA стил музику.“** Можеш да играш On2 уз било коју салса песму. Да ли се добро осећа зависи од темпа и аранжмана перкусија песме, не од тога да ли је песма снимљена у LA или Њујорку.",
    ],
    faqs: [
      { q: "Да ли је Salsa On2 тежа од Salsa On1?", a: "On2 није објективно тежа. Мање је интуитивна за људе одрасле уз западну музику јаке добе, јер први break корак пада на 2, не на 1. Играчи који су већ интернализовали On1 често пријављују период прилагођавања од 2-4 недеље. Почетници који прво уче On2 обично достижу исти ниво удобности истим темпом." },
      { q: "Да ли треба да научим Salsa On1 пре него што научим On2?", a: "Не. Можеш прво да учиш On2. Оригинални студенти Eddie Torres-а били су већином апсолутни почетници. Почињање са On2 избегава касније преповезивање навика тајминга. Међутим, ако живиш у граду где социјална сцена игра On1, прво учити On1 је прагматично јер ти треба место да вежбаш." },
      { q: "Да ли је Salsa On2 исто што и Mambo?", a: "У савременом онлајн салса свету, ова два термина се користе наизменично. Историјски, Mambo је био плесни стил Palladium Ballroom-а из 1950-их, формализован од стране играча као Cuban Pete, Millie Donay и касније Eddie Torres. Модерна Salsa On2, понекад звана њујоршки стил, директан је потомак те традиције." },
      { q: "Колико времена треба да научиш Salsa On2?", a: "Очекуј 2-4 недеље да играш основни корак музикално са самопоуздањем, 3-6 месеци да играш социјално на нивоу почетника са партнером, и 1-2 године да достигнеш средњу социјалну удобност. Ове процене претпостављају 3-5 сати свесне праксе недељно, не пасивно похађање часова." },
      { q: "Могу ли да играм Salsa On2 у било ком салса клубу?", a: "Можеш да играш On2 уз било коју салса песму, али социјално желиш да ускладиш тајминг са партнером. У Њујорку, већини европских On2 сцена и у такмичарском свету, On2 доминира. У великом делу Латинске Америке, Карибима и многим локалним сценама у Европи и САД, On1 доминира. Већина искусних играча може да прелази између оба." },
    ],
    ctaHeading: "Првих 30 дана Salsa On2, структурирано.",
    howToSteps: [
      { name: "Тренирај ухо за тумбао конге", text: "Слушај Salsa On2 нумере и изолуј конгу. Понављајући 'slap' пада на 2 и 6 осмице. Чути тај slap је предуслов да играш On2 у такту." },
      { name: "Савладај основни корак сам", text: "Прво вежбај основни 6-корачни (break напред / break назад) без музике. Броји наглас 1-2-3, 5-6-7 са паузом на 4 и 8. Ломи (мењај правац) на 2 идући назад, и на 6 идући напред." },
      { name: "Додај музику у спором темпу (~90 BPM)", text: "Када корак постане аутоматски, играј уз спору Mambo нумеру. Настави да бројиш наглас. Већина учитеља препоручује снимке средњег темпа Tito Puente или Eddie Torres Big Band-а као вежбовну музику." },
      { name: "Дрилуј пренос тежине", text: "On2 захтева одложен пренос тежине: прво ставиш јастуче стопала, онда пустиш пету да падне. Вежбај основне кораке у спором покрету фокусирајући се само на то како тежина путује кроз стопало." },
      { name: "Узми структуриран курс", text: "Самостално учење има плафон. Програм који изолује рад ногу, музикалност, биомеханику и рад у пару у правом редоследу убрзаће те преко платоа на који самоуки играчи наилазе око ~6 месеци." },
    ],
  },
  tr: {
    metaTitle: "Salsa On2 nedir? New York Stili Mambo'nun eksiksiz rehberi",
    metaDescription:
      "Salsa On2, dansçıların müziğin 2. vuruşunda kırıldığı bir timing stilidir. New York Stili veya Mambo olarak da bilinir. Tam tanım, tarih, biyomekanik ve başlangıç için 5 adımlık bir yol.",
    breadcrumbHome: "Ana Sayfa",
    breadcrumbCurrent: "Salsa On2",
    badge: "Rehber",
    h1Pre: "Salsa On2 nedir? Eksiksiz rehber: ",
    h1Accent: "New York Stili Mambo",
    shortAnswerRich:
      "Salsa On2, salsa dansının bir timing stilidir; ilk vuruş yerine müziğin **ikinci vuruşunda** kırılırsın (yön değiştirirsin). **New York Stili** veya **Mambo** olarak da bilinir. Stil 1950'lerde New York'taki Palladium Ballroom'da resmileştirildi ve 1970'lerde Eddie Torres tarafından modern öğretim için kodlandı. On2 dans etmek bedenini conga'nın slap kalıbıyla hizalar ve dansa On1'den daha pürüzsüz, daha senkoplu bir his verir.",
    sec1Title: "Temel fikir: 8'lerde saymak",
    sec1Paragraphs: [
      "Her salsa şarkısı 4/4 ölçüde yazılır; dansçılar bunu tekrarlayan 8 vuruşluk bir ölçü olarak sayar (1, 2, 3, 4, 5, 6, 7, 8). On1 ya da On2 dans etsen de, her 8 vuruşta altı adım atarsın: ilk yarıda üç ve ikinci yarıda üç, 4 ve 8'de duraksamayla.",
      "İki stil arasındaki fark, yön değiştirdiğin *zaman*dır—dansçıların \"kırılma adımı\" dediği şey. On1 dansçısı 1'de yön değiştirir. On2 dansçısı 2'de yön değiştirir. Geri kalan ayak işi bu tek karardan akar.",
      "Bunun önemli olmasının sebebi müzikseldir. Afro-Küba müziğinde conga, tumbao adı verilen bir kalıp çalar. Tanımlayıcı vurgusu, açık tonlu slap, her 8 vuruşluk ölçünün 2 ve 6'sına düşer, 1 ve 5'ine değil. 2'de kırıldığında, ağırlık değişimin o slap'a iner. Bedenin melodi yerine grubun ritim bölümüyle senkronize hareket eder.",
    ],
    sec2Title: "On1 vs On2 bir bakışta",
    sec2HeadAttr: "Özellik",
    sec2HeadOn1: "Salsa On1 (LA Stili)",
    sec2HeadOn2: "Salsa On2 (NY Stili)",
    sec2Rows: [
      { a: "Kırılma adımı", b: "Vuruş 1", c: "Vuruş 2" },
      { a: "Hissiyat", b: "Staccato, enerjik", c: "Pürüzsüz, rahat" },
      { a: "Senkronize olduğu", b: "Melodi / kuvvetli vuruş", c: "Conga slap'ı / ritim bölümü" },
      { a: "Köken", b: "Los Angeles, 1990'lar (Vazquez kardeşler)", c: "New York, 1950'ler Palladium" },
      { a: "Baskın sahneler", b: "LA, Latin Amerika'nın büyük kısmı, Avrupa'nın çoğu şehri", c: "NYC, yarışma salsası, dünya çapında özel On2 sahneleri" },
      { a: "Kanonik öğretmen", b: "Eddie Torres birçok LA öncüsünü de etkiledi", c: "Eddie Torres (modern On2 pedagojisinin babası)" },
    ],
    sec3Title: "Kısa bir tarih: Palladium, Eddie Torres ve modern On2",
    sec3Paragraphs: [
      "1950'lerin başlarında, New York'taki Palladium Ballroom Mambo Craze'in potası haline geldi. Bronx, Brooklyn ve Spanish Harlem'den (Porto Rikolular, İtalyanlar, Yahudiler ve Afro-Amerikalılar) işçi sınıfı dansçılar, Tito Puente, Tito Rodriguez ve Machito tarafından yönetilen big-band Mambo'ya dans ediyordu. Cuban Pete, Millie Donay ve Killer Joe Piro gibi dönemin efsanevi dansçıları Afro-Küba toprağa basışını Lindy Hop akrobasisi, tap fraksesi ve balo salonu çerçevesiyle harmanladı.",
      "Ortaya çıkan Palladium Mambo'su tek, standartlaştırılmış bir stil değildi. Anlık varyasyonların rekabetçi bir alt kültürüydü. Bazı dansçılar 1'de, bazıları 2'de kırılıyordu, bazıları aralarında geziniyordu. Stili birleştiren estetikti: topraklı alt beden, kilitli çerçeve, hızlı ayak işi, sessiz göğüs.",
      "1970'lerde, Palladium döneminden sonra, **Eddie Torres** adlı bir dansçı şu an standart \"On2\" timing olarak tanıdığımız şeyi kodladı. Torres, Tito Puente'nin yanında çalıştı ve Puente ona 2'de kırılmanın 1'de kırılmaktan daha çok clave ve tumbao'ya sadık olduğunu söyledi. Torres bu müzikal ilkeyi aldı ve etrafında öğretilebilir bir sistem inşa etti. Bu da dahil her modern Salsa On2 müfredatı, sonuç olarak Eddie Torres'in yapısal çalışmasına dayanır.",
    ],
    sec4Title: "On2 neden bedeninde farklı hissettirir",
    sec4Paragraphs: [
      "On2'nin biyomekaniği kontrollü bir halat çekme oyunudur. Alt bedenin yere teslim olur: dizler yumuşak, ağırlık merkezi düşük, ağırlık topuk düşmeden önce ayak topuğundan yuvarlanır. Üst bedenin yukarı uzanır: omurga yükseltilmiş, omuzlar aşağıda, göğüs sessiz.",
      "Topraklı bir alt beden ile yükseltilmiş bir üst beden arasındaki bu ayrım, dünya klası On2 dansçılarının ayakları baş döndürücü hızlarda hareket ederken yüzüyormuş gibi görünmesinin sebebidir. Aynı zamanda dansın müzikal olarak işe yaramasının da sebebidir: yuvarlanan, hafifçe gecikmeli ağırlık aktarımı, conga slap'inin önüne geçmek yerine doğal olarak üzerine iner.",
      "Yeni başlayan birinin yaptığı en yaygın iki hata (1) düz, kilitli bacaklarla dans etmek, ki bu gecikmeyi öldürür ve kalçaları bir yürüyüşe dümdüz eder ve (2) omuzların ayak işiyle birlikte aşağı yukarı zıplamasına izin vermek, ki bu çerçeveyi yok eder.",
    ],
    sec5Title: "Salsa On2'yi öğrenmeye nasıl başlanır",
    sec5Steps: [
      "**Kulağını conga tumbao'su için eğit.** Salsa parçalarını dinle ve conga'yı izole et. Tekrarlanan açık tonlu slap 2 ve 6'ya iner. O slap'i duyana kadar, On2'yi güvenilir şekilde dans edemezsin.",
      "**Temel adımı yalnız ustalaş, müziksiz.** Sesli olarak \"1-2-3, 5-6-7\" say, 4 ve 8'de duraksamayla. 2'de geri kırıl, 6'da ileri kırıl. Adım otomatik olana kadar drill et.",
      "**Yavaş tempoda (~90 BPM) müzik ekle.** Adım sıkıcı olduğunda, yavaş bir Mambo parçası koy (Tito Puente veya Eddie Torres Big Band kanoniktir) ve sesli saymaya devam ederken temel adımını müziğe uydur.",
      "**Ağırlık aktarımını drill et.** Sadece ağırlığının nasıl seyahat ettiğine odaklanan ağır çekim temel adımlarını uygula: önce ayak topuğu, sonra topuk düşer, dizler yumuşak ağırlık yerleşir. Bu, bir dansçıyı bir adımcıdan ayıran alışkanlıktır.",
      "**Yapılandırılmış bir kurs al.** Kendi kendine çalışma yaklaşık altı ayda platoya ulaşır. Ayak işi, müzikalite, beden mekaniği ve eş çalışmasını doğru sırada izole eden bir müfredat seni o platonun çok ötesine geçirir. Tam sebep motor öğrenmenin [link]%85 kuralı[/link]dır: beynin gelişmeye devam etmek için belirli bir başarı ve başarısızlık dengesine ihtiyaç duyar.",
    ],
    sec6Title: "Görmezden gelinecek mitler",
    sec6Bullets: [
      "**\"On2 sadece ileri seviye dansçılar içindir.\"** Yanlış. Mutlak başlangıç seviyesindekiler On2 ile başlayabilir. Yıllarca bedenini On1'e eğittiysen ayarlama daha zordur, yeniysen değil.",
      "**\"Salsa On2 salsa'dan farklı bir danstır.\"** Farklı timing'le aynı danstır. Eş çalışması, bağlantı çerçevesi, shines, kombinasyonlar. Kelime dağarcığı paylaşılır.",
      "**\"LA stili müziğe On2 dans edemezsin.\"** Herhangi bir salsa şarkısına On2 dans edebilirsin. İyi hissedip hissetmemesi şarkının tempo ve perküsyon düzenlemesine bağlıdır, şarkının LA'da mı yoksa New York'ta mı kaydedildiğine değil.",
    ],
    faqs: [
      { q: "Salsa On2, Salsa On1'den daha mı zordur?", a: "On2 nesnel olarak daha zor değildir. Batı kuvvetli vuruşlu müzikle yetişen insanlar için daha az sezgiseldir, çünkü ilk kırılma adımı 1'e değil, 2'ye düşer. On1'i zaten içselleştirmiş dansçılar genellikle 2-4 haftalık bir adaptasyon dönemi bildirir. Önce On2 öğrenen yeni başlayanlar genellikle aynı oranda aynı rahatlık seviyesine ulaşır." },
      { q: "On2 öğrenmeden önce Salsa On1 öğrenmem gerekir mi?", a: "Hayır. Önce On2 öğrenebilirsin. Eddie Torres'in orijinal öğrencileri çoğunlukla mutlak başlangıç seviyesindeydi. On2 ile başlamak sonradan timing alışkanlıklarını yeniden bağlamayı önler. Bununla birlikte, sosyal sahnenin On1 dans ettiği bir şehirde yaşıyorsan, önce On1 öğrenmek pragmatiktir çünkü pratik yapmak için bir yere ihtiyacın var." },
      { q: "Salsa On2 ile Mambo aynı şey mi?", a: "Çağdaş çevrimiçi salsa dünyasında bu iki terim birbirinin yerine kullanılır. Tarihsel olarak, Mambo, Cuban Pete, Millie Donay ve daha sonra Eddie Torres gibi dansçılar tarafından resmileştirilen 1950'lerin Palladium Ballroom dans stiliydi. Bazen New York Stili olarak adlandırılan modern Salsa On2, o geleneğin doğrudan torunudur." },
      { q: "Salsa On2'yi öğrenmek ne kadar sürer?", a: "Temel adımı müzikal olarak güvenle dans etmek için 2-4 hafta, bir partnerle başlangıç seviyesinde sosyal olarak dans etmek için 3-6 ay ve orta düzey sosyal rahatlığa ulaşmak için 1-2 yıl bekle. Bu tahminler, pasif ders devamı değil, haftada 3-5 saat kasıtlı pratik yapıldığını varsayar." },
      { q: "Herhangi bir salsa kulübünde Salsa On2 dans edebilir miyim?", a: "Herhangi bir salsa şarkısına On2 dans edebilirsin, ama sosyal olarak partnerinin timing'ine uymak istersin. New York City'de, Avrupa'nın özel On2 sahnelerinin çoğunda ve yarışma dünyasında On2 baskındır. Latin Amerika'nın büyük kısmında, Karayipler'de ve Avrupa ile ABD'deki birçok yerel sahnede On1 baskındır. Çoğu deneyimli dansçı ikisi arasında geçiş yapabilir." },
    ],
    ctaHeading: "Salsa On2'nin ilk 30 günü, yapılandırılmış.",
    howToSteps: [
      { name: "Kulağını conga tumbao'su için eğit", text: "Salsa On2 parçalarını dinle ve conga'yı izole et. Tekrarlanan 'slap' 8 vuruşluk ölçünün 2 ve 6'sına iner. Bu slap'i duymak On2'yi tempoda dans etmenin ön koşuludur." },
      { name: "Temel adımı yalnız ustalaş", text: "Önce müziksiz 6 adımlı temeli (ileri kırılma / geri kırılma) uygula. 4 ve 8'de duraksamayla 1-2-3, 5-6-7 say. Geri giderken 2'de, ileri giderken 6'da kırıl (yön değiştir)." },
      { name: "Yavaş tempoda (~90 BPM) müzik ekle", text: "Adım otomatik olduğunda, yavaş bir Mambo parçasına dans et. Sesli saymaya devam et. Çoğu öğretmen, pratik müziği olarak Tito Puente veya Eddie Torres Big Band'ın orta tempolu kayıtlarını önerir." },
      { name: "Ağırlık aktarımını drill et", text: "On2 gecikmeli ağırlık aktarımı gerektirir: önce ayak topuğunu yerleştirirsin, sonra topuğu düşürürsün. Sadece ağırlığın ayaktan nasıl seyahat ettiğine odaklanan ağır çekim temel adımları uygula." },
      { name: "Yapılandırılmış bir kurs al", text: "Kendi kendine çalışmanın bir tavanı vardır. Ayak işi, müzikalite, beden mekaniği ve eş çalışmasını doğru sırada izole eden bir müfredat seni kendi kendine çalışan dansçıların ~6 ayda çarptığı platonun ötesine hızlandıracaktır." },
    ],
  },
};

// Backfill placeholder locales with English content so types are satisfied.
for (const k of Object.keys(CONTENT) as Locale[]) {
  if (!CONTENT[k].metaTitle) CONTENT[k] = CONTENT.en;
}

export function getWhatIsOn2Content(locale: Locale): WhatIsOn2Content {
  return CONTENT[locale] ?? CONTENT.en;
}
