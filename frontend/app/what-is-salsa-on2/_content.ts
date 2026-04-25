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
  fr: {} as WhatIsOn2Content,
  de: {} as WhatIsOn2Content,
  it: {} as WhatIsOn2Content,
  ja: {} as WhatIsOn2Content,
  ko: {} as WhatIsOn2Content,
  zh: {} as WhatIsOn2Content,
  ru: {} as WhatIsOn2Content,
  pl: {} as WhatIsOn2Content,
  nl: {} as WhatIsOn2Content,
  ar: {} as WhatIsOn2Content,
  el: {} as WhatIsOn2Content,
  sr: {} as WhatIsOn2Content,
  tr: {} as WhatIsOn2Content,
};

// Backfill placeholder locales with English content so types are satisfied.
for (const k of Object.keys(CONTENT) as Locale[]) {
  if (!CONTENT[k].metaTitle) CONTENT[k] = CONTENT.en;
}

export function getWhatIsOn2Content(locale: Locale): WhatIsOn2Content {
  return CONTENT[locale] ?? CONTENT.en;
}
