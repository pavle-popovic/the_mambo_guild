/**
 * /salsa-on1-vs-on2 article content per locale. Hand-authored in-session.
 * Rich-text segments use **bold** markers for inline gold emphasis;
 * the renderer (_Body.tsx) parses them.
 */
import type { Locale } from "@/i18n/config";

export type Row = { a: string; b: string; c: string };
export type Faq = { q: string; a: string };
export type HowToStep = { name: string; text: string };

export type On1VsOn2Content = {
  metaTitle: string;
  metaDescription: string;

  breadcrumbHome: string;
  breadcrumbCurrent: string;
  badge: string;
  h1Pre: string;
  h1Accent: string;

  /** Rich; uses **bold** markers. */
  shortAnswerRich: string;

  sec1Title: string;
  sec1Paragraphs: string[]; // rich allowed

  sec2Title: string;
  sec2HeadAttr: string;
  sec2HeadOn1: string;
  sec2HeadOn2: string;
  sec2Rows: Row[];

  sec3Title: string;
  /** Rich; uses **bold** for gold emphasis and *italic* for em. */
  sec3Paragraphs: string[];

  sec4Title: string;
  sec4Intro: string;
  sec4Bullets: string[]; // each starts with **bold** prefix per source
  sec4Outro: string;

  sec5Title: string;
  sec5Bullets: string[]; // each starts with **bold** prefix

  sec6Title: string;
  sec6Intro: string;
  sec6Steps: string[]; // each starts with **bold** prefix
  sec6Outro: string;

  faqs: Faq[];

  /** Final CTA card heading (rest of CTA copy is shared across articles). */
  ctaHeading: string;

  /** HowTo schema steps. */
  howToSteps: HowToStep[];
};

const CONTENT: Record<Locale, On1VsOn2Content> = {
  // ============================================================ EN
  en: {
    metaTitle: "Salsa On1 vs Salsa On2: Which Should You Learn First?",
    metaDescription:
      "On1 breaks on beat 1, On2 breaks on beat 2. Full comparison of feel, history, scenes, and music, plus a practical framework for deciding which style to learn first.",
    breadcrumbHome: "Home",
    breadcrumbCurrent: "On1 vs On2",
    badge: "Comparison",
    h1Pre: "Salsa On1 vs Salsa On2: ",
    h1Accent: "Which Should You Learn First?",

    shortAnswerRich:
      "**On1** breaks on the 1st beat. LA Style, easier onboarding. **On2** breaks on the 2nd beat. New York Style, truer to the conga, dominant in competition. **Best first choice:** learn whichever style dominates your local scene so you have people to dance with. Serious long-term dancers typically end up learning both, with one as their home base.",

    sec1Title: "The one difference that matters",
    sec1Paragraphs: [
      "Both On1 and On2 use the same 8-count structure. Both take six steps per 8-count with a pause on the 4 and the 8. Both use the same partner work vocabulary, the same shines, the same turn patterns.",
      "The single distinction is **which beat you break on**: which beat you change direction on. On1 dancers break forward on the 1 and back on the 5. On2 dancers break back on the 2 and forward on the 6.",
      "That one-beat shift changes everything else: the feel, the phrasing, the music you gravitate toward, and which clubs feel like home.",
    ],

    sec2Title: "Side-by-side",
    sec2HeadAttr: "Attribute",
    sec2HeadOn1: "Salsa On1",
    sec2HeadOn2: "Salsa On2",
    sec2Rows: [
      { a: "Break step", b: "Forward on 1, back on 5", c: "Back on 2, forward on 6" },
      { a: "Musical sync", b: "Melody / downbeat", c: "Conga tumbao slap" },
      { a: "Feel", b: "Punchy, bright, staccato", c: "Smoother, deeper in the pocket" },
      { a: "Learning curve (weeks 1-2)", b: "Faster", c: "Slightly slower" },
      { a: "Learning curve (months 3+)", b: "Equal", c: "Equal" },
      { a: "Originated", b: "LA, 1990s (Vazquez brothers)", c: "NYC Palladium 1950s; codified by Eddie Torres 1970s" },
      { a: "Dominant scenes", b: "LA, most Latin America, many European cities", c: "NYC, competition circuits, dedicated On2 nights worldwide" },
      { a: "Typical music preference", b: "Fast, melodic, polished arrangements", c: "Slower, percussive, rhythm-forward arrangements" },
    ],

    sec3Title: "How each one feels",
    sec3Paragraphs: [
      "The clearest way to describe the difference: On1 feels like dancing to the *singer*. On2 feels like dancing to the *band*.",
      "On1 lands your weight change on the same beat the melody tends to emphasize. The dance is punchy and synchronized to the vocal line. Styling hits happen on the 1, the 3, the 5, the 7: predictable, satisfying, and easy to spot.",
      'On2 lands your weight change on the conga slap: the 2 and the 6. That alignment with the percussion section is the source of the "smoother" quality people associate with On2. The break step coincides with the rhythm, not the melody, which gives the dance a deeper, more patient feel.',
    ],

    sec4Title: "Which style is danced where?",
    sec4Intro: "A rough map of the global salsa geography:",
    sec4Bullets: [
      "**New York City:** overwhelmingly On2.",
      "**Los Angeles:** overwhelmingly On1.",
      "**Latin America:** mostly On1, though several cities (notably Puerto Rico) have strong On2 scenes.",
      "**Europe:** mixed. London, Rome, Berlin, and the competitive circuits tend On2. Most local scenes outside those hubs are primarily On1.",
      "**Competition salsa:** On2 dominates the New York Style and Cabaret categories of the major championships.",
    ],
    sec4Outro:
      "If you are serious about salsa long-term, you will end up exposed to both. Most professional dancers can switch fluently, though they usually have a home style.",

    sec5Title: "A decision framework",
    sec5Bullets: [
      "**Your local scene is clearly one style.** Learn what your scene dances. You need practice partners.",
      "**Your local scene is mixed.** Start with On2 if you want to lean serious and competitive; start with On1 if you want the fastest social onboarding.",
      "**You are learning online with no local scene.** On2 for the long game. Better teachers, richer pedagogy, and it scales into the most prestigious scenes worldwide.",
      "**You grew up with Latin music.** Either works, but On2 tends to feel musically natural to trained ears because it matches the percussion you already internalized.",
    ],

    sec6Title: "Transitioning from On1 to On2 (or vice versa)",
    sec6Intro:
      "The good news: 80% of what you learned in one timing (the partner work, the turn patterns, the lead-follow technique) transfers directly. The work is mostly ear training and re-wiring the break-step habit.",
    sec6Steps: [
      "**Re-train your ear before your feet.** A week of listening to salsa while clapping the conga slap on the 2 and 6.",
      "**Drill the basic silently, slowly.** Half-speed, counting aloud, no music. 10 minutes a day until the new break step stops feeling like a foreign language.",
      "**Dance alone before dancing with a partner.** Partner work with unstable new timing reverts you to the old habit instantly.",
      "**Socially dance only in the new style at first.** Mixed-timing rooms are cognitive chaos during a transition. Find a dedicated night and stay there for the first month.",
    ],
    sec6Outro:
      "Most On1 dancers dance socially on On2 after 4-8 weeks of serious practice. Professionals do it in half the time because the habit is clearer and the drilling is deliberate.",

    faqs: [
      { q: "Which is easier for a complete beginner, On1 or On2?", a: "Salsa On1 is slightly easier to pick up in the first two weeks because Western music trains us to step on the 1. After the first month, the gap closes. Absolute beginners who start with On2 reach social-level competence at the same rate as those who start with On1." },
      { q: "If my local scene dances On1, should I still learn On2?", a: "Pragmatically, learn what your local scene dances first. You need somewhere to practice socially, and every salsa social has people who will partner with a beginner. Once you are a confident social dancer in your local style, adding the other timing is a 1-2 month project." },
      { q: "Do professional dancers prefer On1 or On2?", a: "Competitive salsa at the World Salsa Championships and the Salsa Open categories is dominated by On2, especially the New York Style and the Cabaret categories. LA Style competitions are On1. Socially, most pros can dance both, but their home style tends to be On2." },
      { q: "Can I dance On1 and On2 at the same party?", a: "You can switch between songs, but inside one song you commit to one timing. Switching timing mid-dance is jarring for your partner and the music. Most experienced dancers adapt their timing to match their partner." },
      { q: "How do I know if a song is 'On1' or 'On2'?", a: "Songs are not written in a specific timing. Any salsa song can be danced either way. That said, slower, smoother arrangements with prominent conga and timbales (classic New York Mambo, Eddie Palmieri, Tito Puente) feel more natural for On2. Fast, melodic, polished productions (classic LA style) feel more natural for On1." },
    ],

    ctaHeading: "A structured curriculum from beat to boss-level.",

    howToSteps: [
      { name: "Re-train your ear before your feet", text: "Spend a week listening to salsa music and clapping along to the conga slap on the 2 and the 6. Until you can hear that pulse, you cannot reliably dance On2." },
      { name: "Drill the basic silently and slowly", text: "Practice the new break step at half speed, counting aloud, with no music. 10 minutes a day until the new break step stops feeling like a foreign language." },
      { name: "Dance alone before dancing with a partner", text: "Partner work with an unstable new timing reverts you to the old habit instantly. Solidify the timing solo first." },
      { name: "Socially dance only to On2 DJs at first", text: "For your first month dancing On2 socially, seek out dedicated On2 nights. Dancing to an On1 room while trying to hold On2 timing is cognitive chaos. Ease the transition by removing that conflict." },
    ],
  },

  // ============================================================ ES
  es: {
    metaTitle: "Salsa On1 vs Salsa On2: ¿cuál deberías aprender primero?",
    metaDescription:
      "On1 marca el paso en el tiempo 1, On2 en el tiempo 2. Comparación completa de feeling, historia, escenas y música, más un marco práctico para decidir qué estilo aprender primero.",
    breadcrumbHome: "Inicio",
    breadcrumbCurrent: "On1 vs On2",
    badge: "Comparación",
    h1Pre: "Salsa On1 vs Salsa On2: ",
    h1Accent: "¿cuál deberías aprender primero?",

    shortAnswerRich:
      "**On1** marca el paso en el primer tiempo. Estilo LA, aprendizaje más rápido. **On2** marca el paso en el segundo tiempo. Estilo New York, más fiel a la conga, dominante en competición. **Mejor primera elección:** aprende el estilo que domine en tu escena local para tener con quién bailar. Los bailarines serios a largo plazo terminan aprendiendo ambos, con uno como base.",

    sec1Title: "La única diferencia que importa",
    sec1Paragraphs: [
      "Tanto On1 como On2 usan la misma estructura de 8 tiempos. Ambos dan seis pasos por cada 8 tiempos con una pausa en el 4 y el 8. Ambos usan el mismo vocabulario de trabajo en pareja, los mismos shines, los mismos giros.",
      "La única distinción es **en qué tiempo marcas**: en qué tiempo cambias de dirección. Los bailarines de On1 marcan adelante en el 1 y atrás en el 5. Los de On2 marcan atrás en el 2 y adelante en el 6.",
      "Ese desplazamiento de un tiempo lo cambia todo: el feeling, el fraseo, la música que prefieres y qué clubs sientes como tu casa.",
    ],

    sec2Title: "Comparación lado a lado",
    sec2HeadAttr: "Atributo",
    sec2HeadOn1: "Salsa On1",
    sec2HeadOn2: "Salsa On2",
    sec2Rows: [
      { a: "Paso de break", b: "Adelante en 1, atrás en 5", c: "Atrás en 2, adelante en 6" },
      { a: "Sincronización musical", b: "Melodía / tiempo fuerte", c: "Slap de la conga tumbao" },
      { a: "Feeling", b: "Marcado, brillante, staccato", c: "Más suave, más anclado" },
      { a: "Curva de aprendizaje (semanas 1-2)", b: "Más rápida", c: "Un poco más lenta" },
      { a: "Curva de aprendizaje (mes 3+)", b: "Igual", c: "Igual" },
      { a: "Origen", b: "LA, años 90 (hermanos Vazquez)", c: "NYC Palladium años 50; codificado por Eddie Torres en los 70" },
      { a: "Escenas dominantes", b: "LA, gran parte de Latinoamérica, muchas ciudades europeas", c: "NYC, circuitos de competición, noches dedicadas a On2 en todo el mundo" },
      { a: "Música típica", b: "Arreglos rápidos, melódicos, pulidos", c: "Arreglos más lentos, percusivos, con la rítmica al frente" },
    ],

    sec3Title: "Cómo se siente cada uno",
    sec3Paragraphs: [
      "La forma más clara de describir la diferencia: On1 se siente como bailar al *cantante*. On2 se siente como bailar a la *banda*.",
      "On1 hace coincidir tu cambio de peso con el mismo tiempo que la melodía suele enfatizar. El baile es marcado y sincronizado con la línea vocal. Los hits de styling caen en 1, 3, 5, 7: predecibles, satisfactorios y fáciles de detectar.",
      'On2 hace coincidir tu cambio de peso con el slap de la conga: el 2 y el 6. Esa alineación con la sección de percusión es el origen de la calidad "más suave" que la gente asocia con On2. El paso de break coincide con el ritmo, no con la melodía, lo que le da al baile un feeling más profundo y paciente.',
    ],

    sec4Title: "¿Dónde se baila cada estilo?",
    sec4Intro: "Un mapa rápido de la geografía global de la salsa:",
    sec4Bullets: [
      "**Nueva York:** abrumadoramente On2.",
      "**Los Ángeles:** abrumadoramente On1.",
      "**Latinoamérica:** mayormente On1, aunque varias ciudades (sobre todo Puerto Rico) tienen escenas fuertes de On2.",
      "**Europa:** mezclada. Londres, Roma, Berlín y los circuitos de competición tienden a On2. La mayoría de las escenas locales fuera de esos hubs son principalmente On1.",
      "**Salsa de competición:** On2 domina las categorías New York Style y Cabaret de los grandes campeonatos.",
    ],
    sec4Outro:
      "Si vas en serio con la salsa a largo plazo, terminarás expuesto a ambos. La mayoría de los bailarines profesionales pueden cambiar con fluidez, aunque suelen tener un estilo de casa.",

    sec5Title: "Un marco para decidir",
    sec5Bullets: [
      "**Tu escena local es claramente un estilo.** Aprende lo que se baila en tu escena. Necesitas pareja para practicar.",
      "**Tu escena local es mixta.** Empieza con On2 si quieres tomarte la salsa en serio y competir; empieza con On1 si quieres el onboarding social más rápido.",
      "**Estás aprendiendo online sin escena local.** On2 para el largo plazo. Mejores profesores, pedagogía más rica, y escala hacia las escenas más prestigiosas del mundo.",
      "**Creciste con música latina.** Cualquiera funciona, pero On2 suele sentirse más natural a oídos entrenados porque coincide con la percusión que ya tienes interiorizada.",
    ],

    sec6Title: "Pasar de On1 a On2 (o al revés)",
    sec6Intro:
      "La buena noticia: el 80% de lo que aprendiste en un timing (el trabajo en pareja, los giros, la técnica de guía) se transfiere directamente. El trabajo es sobre todo entrenamiento auditivo y reprogramar el hábito del paso de break.",
    sec6Steps: [
      "**Reentrena tu oído antes que tus pies.** Una semana escuchando salsa y aplaudiendo el slap de la conga en el 2 y el 6.",
      "**Practica el básico en silencio, lento.** Mitad de velocidad, contando en voz alta, sin música. 10 minutos al día hasta que el nuevo paso de break deje de sentirse como un idioma extranjero.",
      "**Baila solo antes de bailar en pareja.** Bailar en pareja con un timing nuevo e inestable te hace volver al hábito viejo al instante.",
      "**Socialmente baila solo el nuevo estilo al principio.** Las salas con timing mixto son un caos cognitivo durante una transición. Encuentra una noche dedicada y quédate ahí el primer mes.",
    ],
    sec6Outro:
      "La mayoría de los bailarines de On1 bailan socialmente en On2 después de 4-8 semanas de práctica seria. Los profesionales lo hacen en la mitad del tiempo porque el hábito es más claro y la práctica es deliberada.",

    faqs: [
      { q: "¿Cuál es más fácil para un principiante absoluto, On1 u On2?", a: "Salsa On1 es ligeramente más fácil de pillar en las primeras dos semanas porque la música occidental nos entrena para pisar en el 1. Después del primer mes, la diferencia se cierra. Los principiantes absolutos que empiezan con On2 alcanzan competencia social al mismo ritmo que los que empiezan con On1." },
      { q: "Si mi escena local baila On1, ¿debería aprender On2 igualmente?", a: "Pragmáticamente, aprende primero lo que se baila en tu escena. Necesitas un sitio donde practicar socialmente, y cada social de salsa tiene gente dispuesta a bailar con un principiante. Una vez que seas un bailarín social seguro en tu estilo local, añadir el otro timing es un proyecto de 1-2 meses." },
      { q: "¿Los bailarines profesionales prefieren On1 u On2?", a: "La salsa de competición en los World Salsa Championships y las categorías Salsa Open está dominada por On2, especialmente las categorías New York Style y Cabaret. Las competiciones LA Style son On1. Socialmente, la mayoría de los profesionales pueden bailar ambos, pero su estilo de casa suele ser On2." },
      { q: "¿Puedo bailar On1 y On2 en la misma fiesta?", a: "Puedes cambiar entre canciones, pero dentro de una canción te comprometes con un timing. Cambiar de timing a mitad de baile es discordante para tu pareja y la música. La mayoría de los bailarines experimentados adaptan su timing al de su pareja." },
      { q: "¿Cómo sé si una canción es 'On1' o 'On2'?", a: "Las canciones no se escriben en un timing específico. Cualquier canción de salsa se puede bailar de las dos formas. Dicho esto, los arreglos más lentos y suaves con conga y timbales prominentes (Mambo clásico de Nueva York, Eddie Palmieri, Tito Puente) se sienten más naturales para On2. Las producciones rápidas, melódicas y pulidas (estilo LA clásico) se sienten más naturales para On1." },
    ],

    ctaHeading: "Un currículum estructurado desde el primer beat hasta nivel jefe.",

    howToSteps: [
      { name: "Reentrena tu oído antes que tus pies", text: "Pasa una semana escuchando música de salsa y aplaudiendo al slap de la conga en el 2 y el 6. Hasta que puedas oír ese pulso, no podrás bailar On2 con fiabilidad." },
      { name: "Practica el básico en silencio y lento", text: "Practica el nuevo paso de break a mitad de velocidad, contando en voz alta, sin música. 10 minutos al día hasta que el nuevo paso de break deje de sentirse como un idioma extranjero." },
      { name: "Baila solo antes de bailar en pareja", text: "Bailar en pareja con un timing nuevo e inestable te devuelve al hábito viejo al instante. Solidifica el timing en solo primero." },
      { name: "Socialmente baila solo en noches On2 al principio", text: "Para tu primer mes bailando On2 socialmente, busca noches dedicadas a On2. Bailar en una sala On1 mientras intentas mantener el timing On2 es un caos cognitivo. Facilita la transición eliminando ese conflicto." },
    ],
  },

  // ============================================================ PT
  pt: {
    metaTitle: "Salsa On1 vs Salsa On2: qual deves aprender primeiro?",
    metaDescription:
      "On1 marca o passo no tempo 1, On2 no tempo 2. Comparação completa de feeling, história, cenas e música, mais um quadro prático para decidir qual estilo aprender primeiro.",
    breadcrumbHome: "Início",
    breadcrumbCurrent: "On1 vs On2",
    badge: "Comparação",
    h1Pre: "Salsa On1 vs Salsa On2: ",
    h1Accent: "qual deves aprender primeiro?",
    shortAnswerRich:
      "**On1** marca no primeiro tempo. Estilo LA, aprendizagem mais rápida. **On2** marca no segundo tempo. Estilo New York, mais fiel à conga, dominante em competição. **Melhor primeira escolha:** aprende o estilo que domina na tua cena local para teres com quem dançar. Os dançarinos sérios a longo prazo acabam por aprender os dois, com um como base.",
    sec1Title: "A única diferença que importa",
    sec1Paragraphs: [
      "On1 e On2 usam a mesma estrutura de 8 tempos. Ambos dão seis passos por 8 tempos com uma pausa no 4 e no 8. Ambos usam o mesmo vocabulário de trabalho a pares, os mesmos shines, as mesmas voltas.",
      "A única distinção é **em que tempo marcas**: em que tempo mudas de direção. Os dançarinos de On1 marcam à frente no 1 e atrás no 5. Os de On2 marcam atrás no 2 e à frente no 6.",
      "Esse desfasamento de um tempo muda tudo o resto: o feeling, o fraseado, a música para a qual gravitas e quais clubes sentes como casa.",
    ],
    sec2Title: "Comparação lado a lado",
    sec2HeadAttr: "Atributo",
    sec2HeadOn1: "Salsa On1",
    sec2HeadOn2: "Salsa On2",
    sec2Rows: [
      { a: "Passo de break", b: "À frente no 1, atrás no 5", c: "Atrás no 2, à frente no 6" },
      { a: "Sincronização musical", b: "Melodia / tempo forte", c: "Slap da conga tumbao" },
      { a: "Feeling", b: "Marcado, brilhante, staccato", c: "Mais suave, mais ancorado" },
      { a: "Curva de aprendizagem (semanas 1-2)", b: "Mais rápida", c: "Ligeiramente mais lenta" },
      { a: "Curva de aprendizagem (mês 3+)", b: "Igual", c: "Igual" },
      { a: "Origem", b: "LA, anos 90 (irmãos Vazquez)", c: "NYC Palladium anos 50; codificado por Eddie Torres nos 70" },
      { a: "Cenas dominantes", b: "LA, grande parte da América Latina, muitas cidades europeias", c: "NYC, circuitos de competição, noites dedicadas a On2 em todo o mundo" },
      { a: "Música típica", b: "Arranjos rápidos, melódicos, polidos", c: "Arranjos mais lentos, percussivos, com a rítmica em primeiro plano" },
    ],
    sec3Title: "Como cada um se sente",
    sec3Paragraphs: [
      "A forma mais clara de descrever a diferença: On1 sente-se como dançar ao *cantor*. On2 sente-se como dançar à *banda*.",
      "On1 alinha a tua mudança de peso com o mesmo tempo que a melodia tende a enfatizar. A dança é marcada e sincronizada com a linha vocal. Os hits de styling caem no 1, 3, 5, 7: previsíveis, satisfatórios e fáceis de identificar.",
      'On2 alinha a tua mudança de peso com o slap da conga: o 2 e o 6. Esse alinhamento com a secção de percussão é a origem da qualidade "mais suave" que as pessoas associam ao On2. O passo de break coincide com o ritmo, não com a melodia, o que dá à dança um feeling mais profundo e paciente.',
    ],
    sec4Title: "Onde se dança cada estilo?",
    sec4Intro: "Um mapa rápido da geografia global da salsa:",
    sec4Bullets: [
      "**Nova Iorque:** esmagadoramente On2.",
      "**Los Angeles:** esmagadoramente On1.",
      "**América Latina:** maioritariamente On1, embora várias cidades (sobretudo Porto Rico) tenham cenas fortes de On2.",
      "**Europa:** mista. Londres, Roma, Berlim e os circuitos de competição tendem para On2. A maior parte das cenas locais fora desses hubs é maioritariamente On1.",
      "**Salsa de competição:** On2 domina as categorias New York Style e Cabaret dos grandes campeonatos.",
    ],
    sec4Outro:
      "Se levas a salsa a sério a longo prazo, vais acabar exposto a ambos. A maioria dos dançarinos profissionais consegue alternar com fluência, embora costumem ter um estilo de casa.",
    sec5Title: "Um quadro para decidir",
    sec5Bullets: [
      "**A tua cena local é claramente um estilo.** Aprende o que se dança na tua cena. Precisas de parceiros de prática.",
      "**A tua cena local é mista.** Começa com On2 se queres ir a sério e competir; começa com On1 se queres o onboarding social mais rápido.",
      "**Estás a aprender online sem cena local.** On2 para longo prazo. Melhores professores, pedagogia mais rica, e escala para as cenas mais prestigiadas do mundo.",
      "**Cresceste com música latina.** Qualquer um funciona, mas On2 costuma sentir-se mais natural a ouvidos treinados porque corresponde à percussão que já interiorizaste.",
    ],
    sec6Title: "Transitar de On1 para On2 (ou vice-versa)",
    sec6Intro:
      "A boa notícia: 80% do que aprendeste num timing (o trabalho a pares, as voltas, a técnica de condução) transfere-se diretamente. O trabalho é sobretudo treino auditivo e reprogramar o hábito do passo de break.",
    sec6Steps: [
      "**Treina o teu ouvido antes dos teus pés.** Uma semana a ouvir salsa e a bater palmas no slap da conga no 2 e no 6.",
      "**Pratica o básico em silêncio, devagar.** Meia velocidade, a contar em voz alta, sem música. 10 minutos por dia até o novo passo de break deixar de parecer uma língua estrangeira.",
      "**Dança sozinho antes de dançar a pares.** Trabalho a pares com um timing novo e instável faz-te voltar ao hábito antigo instantaneamente.",
      "**Socialmente dança só no novo estilo no início.** Salas com timing misto são um caos cognitivo durante uma transição. Encontra uma noite dedicada e fica lá no primeiro mês.",
    ],
    sec6Outro:
      "A maior parte dos dançarinos de On1 dança socialmente em On2 após 4-8 semanas de prática séria. Os profissionais fazem-no em metade do tempo porque o hábito é mais claro e o treino é deliberado.",
    faqs: [
      { q: "Qual é mais fácil para um principiante absoluto, On1 ou On2?", a: "Salsa On1 é ligeiramente mais fácil de apanhar nas primeiras duas semanas porque a música ocidental treina-nos para pisar no 1. Após o primeiro mês, a diferença fecha-se. Os principiantes absolutos que começam com On2 atingem competência social ao mesmo ritmo que os que começam com On1." },
      { q: "Se a minha cena local dança On1, devo aprender On2 na mesma?", a: "Pragmaticamente, aprende primeiro o que se dança na tua cena. Precisas de um sítio para praticar socialmente, e cada social de salsa tem gente disposta a dançar com um principiante. Uma vez que sejas um dançarino social confiante no teu estilo local, adicionar o outro timing é um projeto de 1-2 meses." },
      { q: "Os dançarinos profissionais preferem On1 ou On2?", a: "A salsa de competição nos World Salsa Championships e nas categorias Salsa Open é dominada por On2, especialmente as categorias New York Style e Cabaret. As competições LA Style são On1. Socialmente, a maior parte dos profissionais consegue dançar ambos, mas o estilo de casa costuma ser On2." },
      { q: "Posso dançar On1 e On2 na mesma festa?", a: "Podes alternar entre músicas, mas dentro de uma música comprometes-te com um timing. Trocar de timing a meio da dança é desconcertante para o teu par e para a música. A maior parte dos dançarinos experientes adapta o seu timing ao do par." },
      { q: "Como é que sei se uma música é 'On1' ou 'On2'?", a: "As músicas não são escritas num timing específico. Qualquer música de salsa pode ser dançada das duas formas. Dito isto, arranjos mais lentos e suaves com conga e timbales proeminentes (Mambo clássico de Nova Iorque, Eddie Palmieri, Tito Puente) sentem-se mais naturais para On2. Produções rápidas, melódicas e polidas (estilo LA clássico) sentem-se mais naturais para On1." },
    ],
    ctaHeading: "Um currículo estruturado do primeiro beat ao nível chefe.",
    howToSteps: [
      { name: "Treina o teu ouvido antes dos teus pés", text: "Passa uma semana a ouvir música de salsa e a bater palmas no slap da conga no 2 e no 6. Até conseguires ouvir essa pulsação, não conseguirás dançar On2 com fiabilidade." },
      { name: "Pratica o básico em silêncio e devagar", text: "Pratica o novo passo de break a meia velocidade, a contar em voz alta, sem música. 10 minutos por dia até o novo passo de break deixar de parecer uma língua estrangeira." },
      { name: "Dança sozinho antes de dançar a pares", text: "Trabalho a pares com um timing novo e instável faz-te voltar ao hábito antigo instantaneamente. Solidifica o timing a solo primeiro." },
      { name: "Socialmente dança só em noites On2 no início", text: "No teu primeiro mês a dançar On2 socialmente, procura noites dedicadas a On2. Dançar numa sala On1 enquanto tentas manter o timing On2 é um caos cognitivo. Facilita a transição removendo esse conflito." },
    ],
  },

  // ============================================================ FR
  fr: {
    metaTitle: "Salsa On1 vs Salsa On2 : laquelle apprendre en premier ?",
    metaDescription:
      "On1 marque sur le temps 1, On2 sur le temps 2. Comparaison complète du feeling, de l'histoire, des scènes et de la musique, plus un cadre pratique pour décider quel style apprendre en premier.",
    breadcrumbHome: "Accueil",
    breadcrumbCurrent: "On1 vs On2",
    badge: "Comparaison",
    h1Pre: "Salsa On1 vs Salsa On2 : ",
    h1Accent: "laquelle apprendre en premier ?",
    shortAnswerRich:
      "**On1** marque sur le 1er temps. Style LA, apprentissage plus rapide. **On2** marque sur le 2e temps. Style New York, plus fidèle à la conga, dominant en compétition. **Meilleur premier choix :** apprends le style qui domine ta scène locale pour avoir des partenaires. Les danseurs sérieux finissent généralement par apprendre les deux, avec l'un comme base.",
    sec1Title: "La seule différence qui compte",
    sec1Paragraphs: [
      "On1 et On2 utilisent la même structure en 8 temps. Tous deux font six pas par 8 temps avec une pause sur le 4 et le 8. Tous deux utilisent le même vocabulaire de partenariat, les mêmes shines, les mêmes tours.",
      "La seule distinction est **sur quel temps tu marques** : sur quel temps tu changes de direction. Les danseurs On1 marquent en avant sur le 1 et en arrière sur le 5. Les On2 marquent en arrière sur le 2 et en avant sur le 6.",
      "Ce décalage d'un temps change tout le reste : le feeling, le phrasé, la musique vers laquelle tu graves et les clubs qui te font sentir chez toi.",
    ],
    sec2Title: "Côte à côte",
    sec2HeadAttr: "Attribut",
    sec2HeadOn1: "Salsa On1",
    sec2HeadOn2: "Salsa On2",
    sec2Rows: [
      { a: "Pas de break", b: "En avant sur 1, en arrière sur 5", c: "En arrière sur 2, en avant sur 6" },
      { a: "Synchronisation musicale", b: "Mélodie / temps fort", c: "Slap de la conga tumbao" },
      { a: "Feeling", b: "Marqué, brillant, staccato", c: "Plus doux, plus ancré" },
      { a: "Courbe d'apprentissage (semaines 1-2)", b: "Plus rapide", c: "Légèrement plus lente" },
      { a: "Courbe d'apprentissage (mois 3+)", b: "Égale", c: "Égale" },
      { a: "Origine", b: "LA, années 90 (frères Vazquez)", c: "NYC Palladium années 50 ; codifié par Eddie Torres dans les 70" },
      { a: "Scènes dominantes", b: "LA, la majeure partie de l'Amérique latine, de nombreuses villes européennes", c: "NYC, circuits de compétition, soirées dédiées à On2 dans le monde entier" },
      { a: "Musique typique", b: "Arrangements rapides, mélodiques, soignés", c: "Arrangements plus lents, percussifs, avec la rythmique en avant" },
    ],
    sec3Title: "Comment chacune se ressent",
    sec3Paragraphs: [
      "La manière la plus claire de décrire la différence : On1 se ressent comme danser au *chanteur*. On2 se ressent comme danser à la *bande*.",
      "On1 fait coïncider ton changement de poids avec le même temps que la mélodie tend à souligner. La danse est marquée et synchronisée à la ligne vocale. Les hits de styling tombent sur le 1, le 3, le 5, le 7 : prévisibles, satisfaisants, et faciles à repérer.",
      'On2 fait coïncider ton changement de poids avec le slap de la conga : le 2 et le 6. Cet alignement avec la section percussion est l\'origine de la qualité "plus douce" que les gens associent à On2. Le pas de break coïncide avec le rythme, pas avec la mélodie, ce qui donne à la danse un feeling plus profond et plus patient.',
    ],
    sec4Title: "Où se danse chaque style ?",
    sec4Intro: "Une carte approximative de la géographie globale de la salsa :",
    sec4Bullets: [
      "**New York :** massivement On2.",
      "**Los Angeles :** massivement On1.",
      "**Amérique latine :** majoritairement On1, bien que plusieurs villes (notamment Porto Rico) aient des scènes On2 fortes.",
      "**Europe :** mixte. Londres, Rome, Berlin et les circuits de compétition tendent vers On2. La plupart des scènes locales hors de ces hubs sont principalement On1.",
      "**Salsa de compétition :** On2 domine les catégories New York Style et Cabaret des grands championnats.",
    ],
    sec4Outro:
      "Si tu es sérieux à long terme avec la salsa, tu finiras par être exposé aux deux. La plupart des danseurs professionnels peuvent passer fluidement de l'un à l'autre, mais ils ont généralement un style de référence.",
    sec5Title: "Un cadre de décision",
    sec5Bullets: [
      "**Ta scène locale est clairement un style.** Apprends ce que ta scène danse. Tu as besoin de partenaires de pratique.",
      "**Ta scène locale est mixte.** Commence par On2 si tu veux du sérieux et de la compétition ; commence par On1 si tu veux l'onboarding social le plus rapide.",
      "**Tu apprends en ligne sans scène locale.** On2 pour le long terme. Meilleurs profs, pédagogie plus riche, et passage à l'échelle vers les scènes les plus prestigieuses du monde.",
      "**Tu as grandi avec la musique latine.** L'un ou l'autre marche, mais On2 tend à se ressentir comme musicalement naturel pour des oreilles entraînées parce qu'il colle à la percussion que tu as déjà intégrée.",
    ],
    sec6Title: "Passer de On1 à On2 (ou inversement)",
    sec6Intro:
      "La bonne nouvelle : 80% de ce que tu as appris dans un timing (le partenariat, les tours, la technique de guide-suiveur) se transfère directement. Le travail consiste surtout en entraînement auditif et reprogrammation du pas de break.",
    sec6Steps: [
      "**Réentraîne ton oreille avant tes pieds.** Une semaine à écouter de la salsa en frappant des mains sur le slap de la conga sur le 2 et le 6.",
      "**Travaille le basique en silence, doucement.** Demi-vitesse, en comptant à voix haute, sans musique. 10 minutes par jour jusqu'à ce que le nouveau pas de break cesse de te paraître une langue étrangère.",
      "**Danse seul avant de danser en couple.** Le partenariat avec un timing nouveau et instable te fait revenir à l'ancienne habitude instantanément.",
      "**Socialement, danse seulement dans le nouveau style au début.** Les salles à timing mixte sont un chaos cognitif pendant une transition. Trouve une soirée dédiée et reste-y le premier mois.",
    ],
    sec6Outro:
      "La plupart des danseurs On1 dansent socialement en On2 après 4-8 semaines de pratique sérieuse. Les pros le font en deux fois moins de temps parce que l'habitude est plus claire et l'entraînement plus délibéré.",
    faqs: [
      { q: "Lequel est plus facile pour un débutant absolu, On1 ou On2 ?", a: "Salsa On1 est légèrement plus facile à attraper dans les deux premières semaines car la musique occidentale nous entraîne à pas sur le 1. Après le premier mois, l'écart se referme. Les débutants absolus qui commencent par On2 atteignent la compétence sociale au même rythme que ceux qui commencent par On1." },
      { q: "Si ma scène locale danse On1, devrais-je quand même apprendre On2 ?", a: "Pragmatiquement, apprends d'abord ce que danse ta scène. Tu as besoin d'un endroit où pratiquer socialement, et chaque social de salsa a des gens prêts à danser avec un débutant. Une fois que tu es un danseur social confiant dans ton style local, ajouter l'autre timing est un projet d'1-2 mois." },
      { q: "Les danseurs professionnels préfèrent-ils On1 ou On2 ?", a: "La salsa de compétition aux World Salsa Championships et dans les catégories Salsa Open est dominée par On2, surtout les catégories New York Style et Cabaret. Les compétitions LA Style sont On1. Socialement, la plupart des pros peuvent danser les deux, mais leur style de référence tend à être On2." },
      { q: "Puis-je danser On1 et On2 à la même soirée ?", a: "Tu peux changer entre les morceaux, mais à l'intérieur d'un morceau tu t'engages sur un timing. Changer de timing au milieu d'une danse est déstabilisant pour ton partenaire et pour la musique. La plupart des danseurs expérimentés adaptent leur timing à celui de leur partenaire." },
      { q: "Comment savoir si un morceau est 'On1' ou 'On2' ?", a: "Les morceaux ne sont pas écrits dans un timing spécifique. N'importe quel morceau de salsa peut être dansé dans les deux. Cela dit, les arrangements plus lents et plus doux avec conga et timbales en avant (Mambo classique de New York, Eddie Palmieri, Tito Puente) se ressentent plus naturellement pour On2. Les productions rapides, mélodiques et soignées (style LA classique) se ressentent plus naturellement pour On1." },
    ],
    ctaHeading: "Un cursus structuré du beat au niveau boss.",
    howToSteps: [
      { name: "Réentraîne ton oreille avant tes pieds", text: "Passe une semaine à écouter de la salsa en frappant des mains sur le slap de la conga sur le 2 et le 6. Tant que tu n'entends pas cette pulsation, tu ne peux pas danser On2 de manière fiable." },
      { name: "Travaille le basique en silence et doucement", text: "Travaille le nouveau pas de break à demi-vitesse, en comptant à voix haute, sans musique. 10 minutes par jour jusqu'à ce que le nouveau pas de break cesse de te paraître une langue étrangère." },
      { name: "Danse seul avant de danser en couple", text: "Le partenariat avec un timing nouveau et instable te fait revenir à l'ancienne habitude instantanément. Solidifie le timing en solo d'abord." },
      { name: "Socialement, danse uniquement dans des soirées On2 au début", text: "Pour ton premier mois à danser On2 socialement, cherche des soirées dédiées à On2. Danser dans une salle On1 en essayant de tenir le timing On2 est un chaos cognitif. Facilite la transition en supprimant ce conflit." },
    ],
  },

  // ============================================================ DE
  de: {
    metaTitle: "Salsa On1 vs. Salsa On2: Welche solltest du zuerst lernen?",
    metaDescription:
      "On1 bricht auf Beat 1, On2 auf Beat 2. Vollständiger Vergleich von Feeling, Geschichte, Szenen und Musik, plus ein praktischer Rahmen, um zu entscheiden, welchen Stil du zuerst lernen solltest.",
    breadcrumbHome: "Startseite",
    breadcrumbCurrent: "On1 vs. On2",
    badge: "Vergleich",
    h1Pre: "Salsa On1 vs. Salsa On2: ",
    h1Accent: "Welche solltest du zuerst lernen?",
    shortAnswerRich:
      "**On1** bricht auf den 1. Beat. LA Style, leichteres Onboarding. **On2** bricht auf den 2. Beat. New York Style, näher an der Conga, dominant im Wettkampf. **Beste erste Wahl:** Lerne den Stil, der in deiner lokalen Szene dominiert, damit du Tanzpartner hast. Ernsthafte Langzeit-Tänzer lernen am Ende beide, mit einem als Heimatbasis.",
    sec1Title: "Der eine Unterschied, der zählt",
    sec1Paragraphs: [
      "On1 und On2 verwenden die gleiche 8-Count-Struktur. Beide nehmen sechs Schritte pro 8 Count mit einer Pause auf der 4 und der 8. Beide nutzen das gleiche Partnerwerk-Vokabular, die gleichen Shines, die gleichen Drehungen.",
      "Der einzige Unterschied ist **auf welchem Beat du brichst**: auf welchem Beat du die Richtung wechselst. On1-Tänzer brechen vorwärts auf der 1 und zurück auf der 5. On2-Tänzer brechen zurück auf der 2 und vorwärts auf der 6.",
      "Diese Verschiebung um einen Beat ändert alles andere: das Feeling, die Phrasierung, die Musik, zu der du tendierst, und welche Clubs sich wie Zuhause anfühlen.",
    ],
    sec2Title: "Direkt nebeneinander",
    sec2HeadAttr: "Attribut",
    sec2HeadOn1: "Salsa On1",
    sec2HeadOn2: "Salsa On2",
    sec2Rows: [
      { a: "Break-Schritt", b: "Vorwärts auf 1, zurück auf 5", c: "Zurück auf 2, vorwärts auf 6" },
      { a: "Musikalische Sync", b: "Melodie / Downbeat", c: "Slap der Conga Tumbao" },
      { a: "Feeling", b: "Akzentuiert, hell, staccato", c: "Sanfter, tiefer im Pocket" },
      { a: "Lernkurve (Wochen 1-2)", b: "Schneller", c: "Etwas langsamer" },
      { a: "Lernkurve (Monat 3+)", b: "Gleich", c: "Gleich" },
      { a: "Ursprung", b: "LA, 90er (Vazquez-Brüder)", c: "NYC Palladium 50er; kodifiziert von Eddie Torres in den 70ern" },
      { a: "Dominante Szenen", b: "LA, der grösste Teil Lateinamerikas, viele europäische Städte", c: "NYC, Wettkampfszenen, dedizierte On2-Nächte weltweit" },
      { a: "Typische Musik", b: "Schnelle, melodische, polierte Arrangements", c: "Langsamere, perkussive, rhythmusbetonte Arrangements" },
    ],
    sec3Title: "Wie sich jede anfühlt",
    sec3Paragraphs: [
      "Die klarste Art, den Unterschied zu beschreiben: On1 fühlt sich an wie zum *Sänger* zu tanzen. On2 fühlt sich an wie zur *Band* zu tanzen.",
      "On1 lässt deinen Gewichtswechsel auf den gleichen Beat fallen, den die Melodie betont. Der Tanz ist akzentuiert und mit der Vocal-Linie synchronisiert. Styling-Hits passieren auf der 1, der 3, der 5, der 7: vorhersehbar, befriedigend und leicht zu erkennen.",
      'On2 lässt deinen Gewichtswechsel auf den Conga-Slap fallen: die 2 und die 6. Diese Ausrichtung mit der Percussion-Sektion ist die Quelle der "sanfteren" Qualität, die Leute mit On2 verbinden. Der Break-Schritt fällt mit dem Rhythmus, nicht mit der Melodie, was dem Tanz ein tieferes, geduldigeres Feeling gibt.',
    ],
    sec4Title: "Wo wird welcher Stil getanzt?",
    sec4Intro: "Eine grobe Karte der globalen Salsa-Geografie:",
    sec4Bullets: [
      "**New York City:** überwältigend On2.",
      "**Los Angeles:** überwältigend On1.",
      "**Lateinamerika:** überwiegend On1, obwohl mehrere Städte (insbesondere Puerto Rico) starke On2-Szenen haben.",
      "**Europa:** gemischt. London, Rom, Berlin und die Wettkampfszenen tendieren zu On2. Die meisten lokalen Szenen ausserhalb dieser Hubs sind primär On1.",
      "**Wettkampf-Salsa:** On2 dominiert die Kategorien New York Style und Cabaret der grossen Meisterschaften.",
    ],
    sec4Outro:
      "Wenn du es langfristig ernst mit Salsa meinst, wirst du am Ende beiden ausgesetzt sein. Die meisten professionellen Tänzer können fliessend wechseln, aber sie haben meist einen Heimatstil.",
    sec5Title: "Ein Entscheidungsrahmen",
    sec5Bullets: [
      "**Deine lokale Szene ist klar ein Stil.** Lerne, was deine Szene tanzt. Du brauchst Übungspartner.",
      "**Deine lokale Szene ist gemischt.** Beginne mit On2, wenn du seriös und kompetitiv lernen willst; beginne mit On1, wenn du das schnellste soziale Onboarding willst.",
      "**Du lernst online ohne lokale Szene.** On2 für die lange Sicht. Bessere Lehrer, reichhaltigere Pädagogik, und es skaliert in die prestigeträchtigsten Szenen weltweit.",
      "**Du bist mit lateinamerikanischer Musik aufgewachsen.** Beides funktioniert, aber On2 fühlt sich für trainierte Ohren musikalisch natürlicher an, weil es zu der Percussion passt, die du bereits verinnerlicht hast.",
    ],
    sec6Title: "Übergang von On1 zu On2 (oder umgekehrt)",
    sec6Intro:
      "Die gute Nachricht: 80% von dem, was du in einem Timing gelernt hast (das Partnerwerk, die Drehungen, die Lead-Follow-Technik) überträgt sich direkt. Die Arbeit ist hauptsächlich Gehörschulung und das Umpolen der Break-Schritt-Gewohnheit.",
    sec6Steps: [
      "**Trainiere dein Ohr, bevor du deine Füsse trainierst.** Eine Woche Salsa hören und auf den Conga-Slap auf der 2 und 6 klatschen.",
      "**Drille den Basic still, langsam.** Halbe Geschwindigkeit, laut zählen, ohne Musik. 10 Minuten pro Tag, bis sich der neue Break-Schritt nicht mehr wie eine fremde Sprache anfühlt.",
      "**Tanze allein, bevor du mit einem Partner tanzt.** Partnerwerk mit instabilem neuem Timing wirft dich sofort auf die alte Gewohnheit zurück.",
      "**Tanze sozial nur im neuen Stil zu Beginn.** Räume mit gemischtem Timing sind kognitives Chaos während eines Übergangs. Finde eine dedizierte Nacht und bleibe dort den ersten Monat.",
    ],
    sec6Outro:
      "Die meisten On1-Tänzer tanzen sozial On2 nach 4-8 Wochen ernsthafter Praxis. Profis schaffen es in der halben Zeit, weil die Gewohnheit klarer und das Drillen bewusster ist.",
    faqs: [
      { q: "Was ist für absolute Anfänger leichter, On1 oder On2?", a: "Salsa On1 ist in den ersten zwei Wochen leicht einfacher zu erfassen, weil westliche Musik uns trainiert, auf der 1 zu treten. Nach dem ersten Monat schliesst sich die Lücke. Absolute Anfänger, die mit On2 beginnen, erreichen soziale Kompetenz im gleichen Tempo wie diejenigen, die mit On1 anfangen." },
      { q: "Wenn meine lokale Szene On1 tanzt, sollte ich trotzdem On2 lernen?", a: "Pragmatisch: lerne zuerst, was deine Szene tanzt. Du brauchst einen Ort zum sozial Üben, und jede Salsa-Social hat Leute, die mit Anfängern tanzen. Sobald du ein selbstbewusster Social-Tänzer in deinem lokalen Stil bist, ist das Hinzufügen des anderen Timings ein 1-2-monatiges Projekt." },
      { q: "Bevorzugen professionelle Tänzer On1 oder On2?", a: "Wettkampf-Salsa bei den World Salsa Championships und den Salsa Open Kategorien wird von On2 dominiert, besonders die Kategorien New York Style und Cabaret. LA-Style-Wettbewerbe sind On1. Sozial können die meisten Profis beides tanzen, aber ihr Heimatstil tendiert zu On2." },
      { q: "Kann ich auf der gleichen Party On1 und On2 tanzen?", a: "Du kannst zwischen Songs wechseln, aber innerhalb eines Songs verpflichtest du dich auf ein Timing. Mitten im Tanz das Timing zu wechseln ist für deinen Partner und die Musik irritierend. Die meisten erfahrenen Tänzer passen ihr Timing dem ihres Partners an." },
      { q: "Wie weiss ich, ob ein Song 'On1' oder 'On2' ist?", a: "Songs werden nicht in einem spezifischen Timing geschrieben. Jeder Salsa-Song kann beidseitig getanzt werden. Allerdings fühlen sich langsamere, sanftere Arrangements mit prominenter Conga und Timbales (klassischer New Yorker Mambo, Eddie Palmieri, Tito Puente) für On2 natürlicher an. Schnelle, melodische, polierte Produktionen (klassischer LA-Stil) fühlen sich für On1 natürlicher an." },
    ],
    ctaHeading: "Ein strukturiertes Curriculum vom Beat bis zum Boss-Level.",
    howToSteps: [
      { name: "Trainiere dein Ohr, bevor du deine Füsse trainierst", text: "Verbringe eine Woche damit, Salsa-Musik zu hören und zum Conga-Slap auf der 2 und der 6 zu klatschen. Bis du diesen Puls hörst, kannst du On2 nicht zuverlässig tanzen." },
      { name: "Drille den Basic still und langsam", text: "Übe den neuen Break-Schritt mit halber Geschwindigkeit, laut zählend, ohne Musik. 10 Minuten pro Tag, bis sich der neue Break-Schritt nicht mehr wie eine fremde Sprache anfühlt." },
      { name: "Tanze allein, bevor du mit einem Partner tanzt", text: "Partnerwerk mit instabilem neuem Timing wirft dich sofort auf die alte Gewohnheit zurück. Festige das Timing zuerst solo." },
      { name: "Tanze sozial zu Beginn nur zu On2-DJs", text: "Suche im ersten Monat sozialen On2-Tanzens dedizierte On2-Nächte. In einem On1-Raum zu tanzen, während du On2-Timing halten willst, ist kognitives Chaos. Erleichtere den Übergang, indem du diesen Konflikt eliminierst." },
    ],
  },

  // ============================================================ IT
  it: {
    metaTitle: "Salsa On1 vs Salsa On2: quale dovresti imparare per prima?",
    metaDescription:
      "On1 marca sul tempo 1, On2 sul tempo 2. Confronto completo di feeling, storia, scene e musica, più una struttura pratica per decidere quale stile imparare per primo.",
    breadcrumbHome: "Home",
    breadcrumbCurrent: "On1 vs On2",
    badge: "Confronto",
    h1Pre: "Salsa On1 vs Salsa On2: ",
    h1Accent: "quale dovresti imparare per prima?",
    shortAnswerRich:
      "**On1** marca sul 1° tempo. Stile LA, onboarding più facile. **On2** marca sul 2° tempo. Stile New York, più fedele alla conga, dominante in competizione. **Migliore prima scelta:** impara lo stile che domina nella tua scena locale così avrai con chi ballare. I ballerini seri a lungo termine finiscono per imparare entrambi, con uno come base.",
    sec1Title: "L'unica differenza che conta",
    sec1Paragraphs: [
      "On1 e On2 usano la stessa struttura a 8 tempi. Entrambi fanno sei passi per 8 tempi con una pausa sul 4 e sull'8. Entrambi usano lo stesso vocabolario di lavoro in coppia, le stesse shines, le stesse figure di giro.",
      "L'unica distinzione è **su quale tempo marchi**: su quale tempo cambi direzione. I ballerini di On1 marcano avanti sull'1 e indietro sul 5. Quelli di On2 marcano indietro sul 2 e avanti sul 6.",
      "Quello scarto di un tempo cambia tutto il resto: il feeling, il fraseggio, la musica verso cui gravi e quali club senti come casa.",
    ],
    sec2Title: "Fianco a fianco",
    sec2HeadAttr: "Attributo",
    sec2HeadOn1: "Salsa On1",
    sec2HeadOn2: "Salsa On2",
    sec2Rows: [
      { a: "Passo di break", b: "Avanti su 1, indietro su 5", c: "Indietro su 2, avanti su 6" },
      { a: "Sincronizzazione musicale", b: "Melodia / battere", c: "Slap della conga tumbao" },
      { a: "Feeling", b: "Marcato, brillante, staccato", c: "Più morbido, più ancorato" },
      { a: "Curva di apprendimento (settimane 1-2)", b: "Più veloce", c: "Leggermente più lenta" },
      { a: "Curva di apprendimento (mese 3+)", b: "Uguale", c: "Uguale" },
      { a: "Origine", b: "LA, anni '90 (fratelli Vazquez)", c: "NYC Palladium anni '50; codificato da Eddie Torres negli anni '70" },
      { a: "Scene dominanti", b: "LA, gran parte dell'America Latina, molte città europee", c: "NYC, circuiti competitivi, serate dedicate a On2 nel mondo" },
      { a: "Musica tipica", b: "Arrangiamenti veloci, melodici, raffinati", c: "Arrangiamenti più lenti, percussivi, ritmica in primo piano" },
    ],
    sec3Title: "Come ognuna si sente",
    sec3Paragraphs: [
      "Il modo più chiaro per descrivere la differenza: On1 si sente come ballare al *cantante*. On2 si sente come ballare alla *band*.",
      "On1 fa coincidere il tuo cambio di peso con lo stesso tempo che la melodia tende a enfatizzare. Il ballo è marcato e sincronizzato con la linea vocale. Gli hit di styling cadono su 1, 3, 5, 7: prevedibili, soddisfacenti e facili da individuare.",
      'On2 fa coincidere il tuo cambio di peso con lo slap della conga: il 2 e il 6. Quell\'allineamento con la sezione percussiva è la fonte della qualità "più morbida" che la gente associa a On2. Il passo di break coincide con il ritmo, non con la melodia, dando al ballo un feeling più profondo e paziente.',
    ],
    sec4Title: "Dove si balla ogni stile?",
    sec4Intro: "Una mappa approssimativa della geografia globale della salsa:",
    sec4Bullets: [
      "**New York City:** in modo schiacciante On2.",
      "**Los Angeles:** in modo schiacciante On1.",
      "**America Latina:** principalmente On1, anche se diverse città (in particolare Porto Rico) hanno scene On2 forti.",
      "**Europa:** mista. Londra, Roma, Berlino e i circuiti competitivi tendono a On2. La maggior parte delle scene locali fuori da quegli hub è principalmente On1.",
      "**Salsa di competizione:** On2 domina le categorie New York Style e Cabaret dei grandi campionati.",
    ],
    sec4Outro:
      "Se sei serio sulla salsa a lungo termine, finirai per essere esposto a entrambi. La maggior parte dei ballerini professionisti riesce a passare fluentemente, anche se di solito ha uno stile di casa.",
    sec5Title: "Una struttura per decidere",
    sec5Bullets: [
      "**La tua scena locale è chiaramente uno stile.** Impara quello che balla la tua scena. Ti servono partner di pratica.",
      "**La tua scena locale è mista.** Inizia con On2 se vuoi puntare al serio e al competitivo; inizia con On1 se vuoi l'onboarding sociale più rapido.",
      "**Stai imparando online senza scena locale.** On2 per il lungo periodo. Insegnanti migliori, pedagogia più ricca, e scala verso le scene più prestigiose del mondo.",
      "**Sei cresciuto con la musica latina.** Entrambi vanno bene, ma On2 tende a sentirsi musicalmente naturale per orecchie allenate perché coincide con la percussione che hai già interiorizzato.",
    ],
    sec6Title: "Passare da On1 a On2 (o viceversa)",
    sec6Intro:
      "La buona notizia: l'80% di quello che hai imparato in un timing (il lavoro in coppia, le figure di giro, la tecnica di guida) si trasferisce direttamente. Il lavoro è soprattutto allenamento dell'orecchio e riprogrammare l'abitudine del passo di break.",
    sec6Steps: [
      "**Allena il tuo orecchio prima dei tuoi piedi.** Una settimana ad ascoltare salsa battendo le mani sullo slap della conga sul 2 e sul 6.",
      "**Drilla il base in silenzio, lento.** Mezza velocità, contando ad alta voce, senza musica. 10 minuti al giorno finché il nuovo passo di break non smette di sembrarti una lingua straniera.",
      "**Balla da solo prima di ballare in coppia.** Il lavoro in coppia con un timing nuovo e instabile ti riporta all'abitudine vecchia all'istante.",
      "**Socialmente balla solo nel nuovo stile all'inizio.** Le sale a timing misto sono caos cognitivo durante una transizione. Trova una serata dedicata e resta lì il primo mese.",
    ],
    sec6Outro:
      "La maggior parte dei ballerini di On1 balla socialmente in On2 dopo 4-8 settimane di pratica seria. I professionisti lo fanno in metà tempo perché l'abitudine è più chiara e il drilling è deliberato.",
    faqs: [
      { q: "Quale è più facile per un principiante assoluto, On1 o On2?", a: "Salsa On1 è leggermente più facile da prendere nelle prime due settimane perché la musica occidentale ci allena a mettere il piede sull'1. Dopo il primo mese, il divario si chiude. I principianti assoluti che iniziano con On2 raggiungono la competenza sociale allo stesso ritmo di chi inizia con On1." },
      { q: "Se la mia scena locale balla On1, dovrei comunque imparare On2?", a: "Pragmaticamente, impara prima quello che balla la tua scena. Ti serve un posto dove praticare socialmente, e ogni serata di salsa ha persone disposte a ballare con un principiante. Una volta che sei un ballerino sociale sicuro nel tuo stile locale, aggiungere l'altro timing è un progetto da 1-2 mesi." },
      { q: "I ballerini professionisti preferiscono On1 o On2?", a: "La salsa di competizione ai World Salsa Championships e nelle categorie Salsa Open è dominata da On2, soprattutto le categorie New York Style e Cabaret. Le competizioni LA Style sono On1. Socialmente, la maggior parte dei pro può ballare entrambi, ma il loro stile di casa tende a essere On2." },
      { q: "Posso ballare On1 e On2 alla stessa festa?", a: "Puoi cambiare tra canzoni, ma all'interno di una canzone ti impegni su un timing. Cambiare timing a metà ballo è destabilizzante per il tuo partner e per la musica. La maggior parte dei ballerini esperti adatta il proprio timing a quello del partner." },
      { q: "Come faccio a sapere se una canzone è 'On1' o 'On2'?", a: "Le canzoni non sono scritte in un timing specifico. Qualsiasi canzone di salsa può essere ballata in entrambi i modi. Detto questo, arrangiamenti più lenti e morbidi con conga e timbales prominenti (Mambo classico di New York, Eddie Palmieri, Tito Puente) si sentono più naturali per On2. Produzioni veloci, melodiche e raffinate (stile LA classico) si sentono più naturali per On1." },
    ],
    ctaHeading: "Un curriculum strutturato dal beat al livello boss.",
    howToSteps: [
      { name: "Allena il tuo orecchio prima dei tuoi piedi", text: "Passa una settimana ad ascoltare musica salsa battendo le mani sullo slap della conga sul 2 e sul 6. Finché non riesci a sentire quel pulso, non puoi ballare On2 in modo affidabile." },
      { name: "Drilla il base in silenzio e lento", text: "Pratica il nuovo passo di break a metà velocità, contando ad alta voce, senza musica. 10 minuti al giorno finché il nuovo passo di break non smette di sembrarti una lingua straniera." },
      { name: "Balla da solo prima di ballare in coppia", text: "Il lavoro in coppia con un timing nuovo e instabile ti riporta all'abitudine vecchia all'istante. Solidifica il timing in solo prima." },
      { name: "Socialmente balla solo a serate On2 all'inizio", text: "Per il tuo primo mese di On2 sociale, cerca serate dedicate a On2. Ballare in una sala On1 cercando di tenere il timing On2 è caos cognitivo. Facilita la transizione rimuovendo quel conflitto." },
    ],
  },

  // For brevity in this turn, the remaining locales (ja, ko, zh, ru, pl, nl,
  // ar, el, sr, tr) reuse the English shape so the page renders cleanly while
  // I land their hand-translated text in the next commit. They are NOT yet
  // listed in /salsa-on1-vs-on2's readyLocales — middleware redirects them
  // back to /salsa-on1-vs-on2 with the locale cookie pinned, so users see
  // English bodies with localised chrome until the translation lands.
  ja: {
    metaTitle: "Salsa On1 vs Salsa On2：どちらを先に学ぶべきか？",
    metaDescription:
      "On1 は1拍目で踏み込み、On2 は2拍目で踏み込む。フィーリング、歴史、世界のシーン、音楽の完全比較と、最初に学ぶスタイルを決めるための実用的な枠組み。",
    breadcrumbHome: "ホーム",
    breadcrumbCurrent: "On1 vs On2",
    badge: "比較",
    h1Pre: "Salsa On1 vs Salsa On2：",
    h1Accent: "どちらを先に学ぶべきか？",
    shortAnswerRich:
      "**On1** は1拍目で踏み込む。LAスタイル、立ち上がりが楽。**On2** は2拍目で踏み込む。ニューヨークスタイル、コンガにより忠実、競技で主流。**最初の選択：** あなたの地元シーンで主流のスタイルを学ぼう。一緒に踊る相手が必要だから。長期的に本気の踊り手は結局両方を学び、一方をホームにする。",
    sec1Title: "本当に重要な唯一の違い",
    sec1Paragraphs: [
      "On1 と On2 は同じ8カウント構造を使う。両方とも8カウント中6歩を踏み、4と8で休む。同じパートナーワークの語彙、同じシャイン、同じターンパターンを使う。",
      "唯一の違いは **どの拍で踏み込むか**：どの拍で方向を変えるかだ。On1 のダンサーは1で前に、5で後ろに踏み込む。On2 のダンサーは2で後ろに、6で前に踏み込む。",
      "その1拍のずれが他のすべてを変える：フィーリング、フレージング、引き寄せられる音楽、そして居心地の良いクラブ。",
    ],
    sec2Title: "横並び比較",
    sec2HeadAttr: "項目",
    sec2HeadOn1: "Salsa On1",
    sec2HeadOn2: "Salsa On2",
    sec2Rows: [
      { a: "ブレイクステップ", b: "1で前、5で後ろ", c: "2で後ろ、6で前" },
      { a: "音楽との同期", b: "メロディ／ダウンビート", c: "コンガ・トゥンバオのスラップ" },
      { a: "フィーリング", b: "鋭い、明るい、スタッカート", c: "滑らか、深く溝にハマる" },
      { a: "学習曲線（1〜2週目）", b: "速い", c: "やや遅い" },
      { a: "学習曲線（3か月以降）", b: "同じ", c: "同じ" },
      { a: "起源", b: "LA、1990年代（バスケス兄弟）", c: "NYC Palladium 1950年代；1970年代に Eddie Torres が体系化" },
      { a: "主流シーン", b: "LA、ラテンアメリカの大半、多くのヨーロッパの都市", c: "NYC、競技サーキット、世界各地の On2 専門ナイト" },
      { a: "典型的な音楽", b: "速くメロディアスで磨かれたアレンジ", c: "ゆったりとした、パーカッシブで、リズム重視のアレンジ" },
    ],
    sec3Title: "それぞれの感じ方",
    sec3Paragraphs: [
      "違いを最も明確に表現すると：On1 は *歌手* に合わせて踊る感覚。On2 は *バンド* に合わせて踊る感覚。",
      "On1 は体重移動をメロディが強調しがちな拍に合わせる。ダンスは鋭くボーカルラインに同期する。スタイリングのヒットは1、3、5、7に来る：予測可能で、満足感があり、見つけやすい。",
      "On2 は体重移動をコンガのスラップ：2と6に合わせる。パーカッションセクションとのその一致が、人々が On2 と結びつける「滑らかさ」の源だ。ブレイクステップはメロディではなくリズムと一致し、ダンスにより深く忍耐強いフィーリングを与える。",
    ],
    sec4Title: "どこでどちらが踊られているか？",
    sec4Intro: "世界のサルサ地理の大まかな地図：",
    sec4Bullets: [
      "**ニューヨーク：** 圧倒的に On2。",
      "**ロサンゼルス：** 圧倒的に On1。",
      "**ラテンアメリカ：** ほとんど On1、ただしいくつかの都市（特にプエルトリコ）には強力な On2 シーンがある。",
      "**ヨーロッパ：** 混在。ロンドン、ローマ、ベルリン、競技サーキットは On2 寄り。それらのハブ以外のローカルシーンは主に On1。",
      "**競技サルサ：** 主要選手権の New York Style と Cabaret カテゴリは On2 が主流。",
    ],
    sec4Outro:
      "サルサに長期的に本気で取り組むなら、結局両方に触れることになる。プロのダンサーの大半は流暢に切り替えられるが、通常はホームスタイルを持つ。",
    sec5Title: "意思決定の枠組み",
    sec5Bullets: [
      "**地元シーンが明確に一方のスタイル。** シーンが踊るものを学ぼう。練習相手が必要だ。",
      "**地元シーンが混在している。** 真剣に競技志向で行きたいなら On2 から始めよう。最速のソーシャル参入を望むなら On1 から始めよう。",
      "**地元シーンなしでオンライン学習中。** 長期戦には On2。指導者が優れ、教育論が豊かで、世界で最も権威あるシーンに通用する。",
      "**ラテン音楽で育った。** どちらでも機能するが、On2 は訓練された耳には音楽的に自然に感じられる傾向がある。すでに体に馴染んだパーカッションと一致するからだ。",
    ],
    sec6Title: "On1 から On2 へ（またはその逆）の移行",
    sec6Intro:
      "良い知らせ：あるタイミングで学んだことの80%（パートナーワーク、ターンパターン、リード／フォローのテクニック）は直接転用できる。作業はほぼ耳のトレーニングと、ブレイクステップの習慣を再配線することだ。",
    sec6Steps: [
      "**足より先に耳を再訓練する。** 1週間サルサを聴きながら、コンガのスラップに合わせて2と6で手を叩く。",
      "**ベーシックを無音でゆっくりドリルする。** ハーフスピード、声に出してカウント、音楽なし。新しいブレイクステップが外国語のように感じなくなるまで毎日10分。",
      "**パートナーと踊る前に1人で踊る。** 不安定な新しいタイミングでパートナーワークをすると、瞬時に古い習慣に戻ってしまう。",
      "**最初は新しいスタイルだけでソーシャルする。** タイミングが混在する部屋は移行中の認知的混乱を生む。専門のナイトを見つけて最初の1か月はそこに留まろう。",
    ],
    sec6Outro:
      "On1 のダンサーの大半は、4〜8週間の真剣な練習で On2 でソーシャルに踊れるようになる。プロは半分の時間でやってのける、習慣がより明確で、ドリルが意図的だからだ。",
    faqs: [
      { q: "完全な初心者には On1 と On2 どちらが簡単？", a: "Salsa On1 は最初の2週間でやや簡単に習得できる。西洋音楽は1で踏むことを訓練するからだ。1か月後にはその差は埋まる。On2 から始めた完全初心者は、On1 から始めた人と同じペースでソーシャルレベルの能力に達する。" },
      { q: "地元シーンが On1 を踊っていても On2 を学ぶべき？", a: "実用的には、まずシーンが踊るものを学ぼう。ソーシャルで練習する場所が必要で、サルサのソーシャルには初心者と組んでくれる人がいる。地元スタイルで自信あるソーシャルダンサーになったら、もう一方のタイミングを加えるのは1〜2か月のプロジェクトだ。" },
      { q: "プロのダンサーは On1 と On2 どちらを好む？", a: "World Salsa Championships や Salsa Open カテゴリの競技サルサは On2 が主流で、特に New York Style と Cabaret カテゴリ。LA Style 競技は On1。ソーシャルではほとんどのプロが両方踊れるが、ホームスタイルは On2 になる傾向がある。" },
      { q: "同じパーティーで On1 と On2 を踊れる？", a: "曲ごとに切り替えられるが、1曲の中では1つのタイミングにコミットする。踊りの途中でタイミングを変えるとパートナーと音楽にとって違和感がある。経験豊富なダンサーの大半は、自分のタイミングをパートナーに合わせて調整する。" },
      { q: "曲が「On1」か「On2」かはどう判断する？", a: "曲は特定のタイミングで書かれているわけではない。どんなサルサ曲も両方で踊れる。とはいえ、コンガやティンバレスが目立つゆっくりした滑らかなアレンジ（クラシックなニューヨーク Mambo、Eddie Palmieri、Tito Puente）は On2 により自然に感じる。速くメロディアスで磨かれたプロダクション（クラシック LA スタイル）は On1 により自然に感じる。" },
    ],
    ctaHeading: "ビートからボスレベルまで体系化されたカリキュラム。",
    howToSteps: [
      { name: "足より先に耳を再訓練する", text: "1週間サルサを聴き、コンガのスラップに合わせて2と6で手を叩こう。そのパルスが聞こえるまでは、On2 を確実に踊ることはできない。" },
      { name: "ベーシックを無音でゆっくりドリルする", text: "新しいブレイクステップをハーフスピードで、声に出してカウントしながら、音楽なしで練習する。新しいブレイクステップが外国語のように感じなくなるまで毎日10分。" },
      { name: "パートナーと踊る前に1人で踊る", text: "不安定な新しいタイミングでのパートナーワークは瞬時に古い習慣に戻してしまう。まずソロでタイミングを固めよう。" },
      { name: "最初は On2 のDJのナイトだけでソーシャルする", text: "On2 でソーシャルする最初の1か月は、On2 専門のナイトを探そう。On1 の部屋で踊りながら On2 のタイミングを保とうとするのは認知的混乱だ。その対立を取り除いて移行を楽にしよう。" },
    ],
  },
  ko: {
    metaTitle: "Salsa On1 vs Salsa On2: 어느 쪽을 먼저 배워야 할까?",
    metaDescription:
      "On1은 박자 1에서 브레이크하고, On2는 박자 2에서 브레이크한다. 느낌, 역사, 씬, 음악의 완전한 비교와 어느 스타일을 먼저 배울지 결정하는 실용적인 프레임워크.",
    breadcrumbHome: "홈",
    breadcrumbCurrent: "On1 vs On2",
    badge: "비교",
    h1Pre: "Salsa On1 vs Salsa On2: ",
    h1Accent: "어느 쪽을 먼저 배워야 할까?",
    shortAnswerRich:
      "**On1**은 1박에서 브레이크한다. LA 스타일, 진입이 더 쉽다. **On2**는 2박에서 브레이크한다. 뉴욕 스타일, 콩가에 더 충실하며 대회에서 주류다. **첫 번째 선택의 정답:** 너의 지역 씬에서 주류인 스타일을 배워라. 함께 출 사람이 필요하다. 진지하게 장기적으로 추는 댄서들은 결국 둘 다 배우게 되며, 한쪽을 홈베이스로 삼는다.",
    sec1Title: "정말 중요한 단 하나의 차이",
    sec1Paragraphs: [
      "On1과 On2는 같은 8박 구조를 사용한다. 둘 다 8박당 여섯 스텝을 밟고 4와 8에서 쉰다. 둘 다 같은 파트너워크 어휘, 같은 샤인, 같은 턴 패턴을 사용한다.",
      "유일한 차이는 **어느 박에 브레이크하느냐**: 어느 박에 방향을 바꾸느냐다. On1 댄서는 1에 앞으로 브레이크하고 5에 뒤로 브레이크한다. On2 댄서는 2에 뒤로 브레이크하고 6에 앞으로 브레이크한다.",
      "그 1박의 차이가 다른 모든 것을 바꾼다: 느낌, 프레이징, 끌리는 음악, 그리고 어떤 클럽이 집처럼 느껴지는지.",
    ],
    sec2Title: "나란히 비교",
    sec2HeadAttr: "항목",
    sec2HeadOn1: "Salsa On1",
    sec2HeadOn2: "Salsa On2",
    sec2Rows: [
      { a: "브레이크 스텝", b: "1에서 앞으로, 5에서 뒤로", c: "2에서 뒤로, 6에서 앞으로" },
      { a: "음악 동기화", b: "멜로디 / 다운비트", c: "콩가 툼바오 슬랩" },
      { a: "느낌", b: "강하고 밝고 스타카토", c: "부드럽고 더 깊이 그루브에 안착" },
      { a: "학습 곡선 (1-2주차)", b: "더 빠름", c: "약간 더 느림" },
      { a: "학습 곡선 (3개월 이후)", b: "같음", c: "같음" },
      { a: "기원", b: "LA, 1990년대 (Vazquez 형제)", c: "NYC Palladium 1950년대; 1970년대 Eddie Torres가 체계화" },
      { a: "주류 씬", b: "LA, 대부분의 라틴 아메리카, 많은 유럽 도시", c: "NYC, 대회 서킷, 전 세계 On2 전용 나이트" },
      { a: "전형적인 음악", b: "빠르고 멜로디적이며 정제된 편곡", c: "느리고 타악기적이며 리듬 중심의 편곡" },
    ],
    sec3Title: "각각이 어떻게 느껴지는가",
    sec3Paragraphs: [
      "차이를 가장 명확히 표현하는 방법: On1은 *가수*에 맞춰 추는 느낌. On2는 *밴드*에 맞춰 추는 느낌.",
      "On1은 체중 이동을 멜로디가 강조하는 박자에 맞춘다. 댄스는 강하고 보컬 라인과 동기화된다. 스타일링 히트는 1, 3, 5, 7에 떨어진다: 예측 가능하고, 만족스럽고, 알아보기 쉽다.",
      "On2는 체중 이동을 콩가 슬랩에 맞춘다: 2와 6. 타악기 섹션과의 그 정렬이 사람들이 On2와 연관시키는 \"부드러움\"의 원천이다. 브레이크 스텝은 멜로디가 아닌 리듬과 일치하며, 이는 댄스에 더 깊고 차분한 느낌을 준다.",
    ],
    sec4Title: "어디서 어떤 스타일을 추는가?",
    sec4Intro: "글로벌 살사 지리의 대략적인 지도:",
    sec4Bullets: [
      "**뉴욕 시:** 압도적으로 On2.",
      "**로스앤젤레스:** 압도적으로 On1.",
      "**라틴 아메리카:** 대부분 On1, 다만 몇몇 도시(특히 푸에르토리코)에는 강력한 On2 씬이 있다.",
      "**유럽:** 혼합. 런던, 로마, 베를린, 그리고 대회 서킷은 On2 경향. 그 허브 외부의 대부분의 지역 씬은 주로 On1.",
      "**대회 살사:** On2가 주요 선수권의 New York Style과 Cabaret 카테고리를 지배한다.",
    ],
    sec4Outro:
      "장기적으로 살사를 진지하게 한다면 결국 둘 다 접하게 된다. 대부분의 프로 댄서는 유창하게 전환할 수 있지만 보통 홈스타일이 있다.",
    sec5Title: "결정 프레임워크",
    sec5Bullets: [
      "**지역 씬이 명확히 한 스타일.** 너의 씬이 추는 것을 배워라. 연습 파트너가 필요하다.",
      "**지역 씬이 혼합되어 있다.** 진지하고 경쟁적으로 가고 싶으면 On2부터 시작; 가장 빠른 사회적 진입을 원하면 On1부터.",
      "**지역 씬 없이 온라인으로 배우는 중.** 장기전이라면 On2. 더 좋은 강사, 풍부한 교육론, 그리고 세계에서 가장 권위 있는 씬으로 확장된다.",
      "**라틴 음악과 함께 자랐다.** 둘 다 작동하지만, On2는 이미 체화한 타악기와 일치하기에 훈련된 귀에 음악적으로 자연스럽게 느껴지는 경향이 있다.",
    ],
    sec6Title: "On1에서 On2로 (또는 그 반대로) 전환하기",
    sec6Intro:
      "좋은 소식: 한 타이밍에서 배운 것의 80% (파트너워크, 턴 패턴, 리드-팔로우 테크닉)는 직접 전이된다. 작업은 주로 청각 훈련과 브레이크 스텝 습관 재배선이다.",
    sec6Steps: [
      "**발보다 귀를 먼저 재훈련하라.** 일주일간 살사를 들으면서 콩가 슬랩에 맞춰 2와 6에서 박수치기.",
      "**기본 스텝을 조용히, 천천히 드릴하라.** 절반 속도, 소리 내어 카운트, 음악 없이. 새로운 브레이크 스텝이 외국어처럼 느껴지지 않을 때까지 매일 10분.",
      "**파트너와 추기 전에 혼자 춰라.** 불안정한 새 타이밍으로 파트너워크를 하면 즉시 오래된 습관으로 돌아간다.",
      "**처음에는 사회적으로 새 스타일에서만 춰라.** 타이밍이 혼합된 방은 전환 중 인지적 혼돈이다. 전용 나이트를 찾아 첫 한 달간 그곳에 머물러라.",
    ],
    sec6Outro:
      "대부분의 On1 댄서는 진지한 연습 4-8주 후 On2로 사회적으로 춘다. 프로는 절반 시간에 해낸다. 습관이 더 명확하고 드릴이 의도적이기 때문이다.",
    faqs: [
      { q: "완전 초보자에게 On1과 On2 중 어느 쪽이 더 쉬울까?", a: "Salsa On1은 첫 2주 동안 약간 더 쉽게 잡을 수 있다. 서양 음악이 우리를 1에서 스텝을 밟도록 훈련시키기 때문이다. 첫 달이 지나면 격차가 좁혀진다. On2부터 시작하는 완전 초보자도 On1부터 시작하는 사람과 같은 속도로 사회적 수준의 능력에 도달한다." },
      { q: "지역 씬이 On1을 추는데도 On2를 배워야 할까?", a: "실용적으로, 너의 씬이 추는 것을 먼저 배워라. 사회적으로 연습할 곳이 필요하고, 모든 살사 소셜에는 초보자와 파트너가 되어줄 사람들이 있다. 지역 스타일에서 자신감 있는 사회적 댄서가 되면, 다른 타이밍을 추가하는 것은 1-2개월 프로젝트다." },
      { q: "프로 댄서는 On1을 선호할까 On2를 선호할까?", a: "World Salsa Championships와 Salsa Open 카테고리의 대회 살사는 On2가 지배하며, 특히 New York Style과 Cabaret 카테고리. LA Style 대회는 On1. 사회적으로는 대부분의 프로가 둘 다 출 수 있지만, 홈스타일은 On2 경향이 있다." },
      { q: "같은 파티에서 On1과 On2를 출 수 있을까?", a: "곡 사이에 전환할 수 있지만, 한 곡 안에서는 한 타이밍에 전념한다. 춤 도중에 타이밍을 바꾸면 파트너와 음악에 거슬린다. 경험 많은 댄서 대부분은 자신의 타이밍을 파트너에 맞춘다." },
      { q: "곡이 'On1'인지 'On2'인지 어떻게 알까?", a: "곡은 특정 타이밍으로 쓰이지 않는다. 어떤 살사 곡이든 둘 다로 출 수 있다. 그렇긴 해도, 콩가와 팀발레스가 두드러진 더 느리고 부드러운 편곡(클래식 뉴욕 Mambo, Eddie Palmieri, Tito Puente)은 On2에 더 자연스럽게 느껴진다. 빠르고 멜로디적이며 정제된 프로덕션(클래식 LA 스타일)은 On1에 더 자연스럽게 느껴진다." },
    ],
    ctaHeading: "비트부터 보스 레벨까지의 체계적인 커리큘럼.",
    howToSteps: [
      { name: "발보다 귀를 먼저 재훈련하라", text: "일주일 동안 살사 음악을 들으면서 2와 6의 콩가 슬랩에 맞춰 박수쳐라. 그 펄스를 들을 수 있을 때까지 On2를 안정적으로 출 수 없다." },
      { name: "기본 스텝을 조용히 천천히 드릴하라", text: "새로운 브레이크 스텝을 절반 속도로, 소리 내어 카운트하며, 음악 없이 연습하라. 새 브레이크 스텝이 외국어처럼 느껴지지 않을 때까지 매일 10분." },
      { name: "파트너와 추기 전에 혼자 춰라", text: "불안정한 새 타이밍으로 파트너워크를 하면 즉시 오래된 습관으로 돌아간다. 솔로로 먼저 타이밍을 굳혀라." },
      { name: "처음에는 On2 DJ 나이트에서만 사회적으로 춰라", text: "On2로 사회적으로 추는 첫 한 달, 전용 On2 나이트를 찾아라. On1 방에서 On2 타이밍을 유지하려는 것은 인지적 혼돈이다. 그 충돌을 제거해 전환을 쉽게 하라." },
    ],
  },
  zh: {
    metaTitle: "Salsa On1 vs Salsa On2:先学哪一种?",
    metaDescription:
      "On1 在第 1 拍踏入,On2 在第 2 拍踏入。完整对比感觉、历史、场景与音乐,以及决定先学哪种风格的实用框架。",
    breadcrumbHome: "首页",
    breadcrumbCurrent: "On1 vs On2",
    badge: "对比",
    h1Pre: "Salsa On1 vs Salsa On2:",
    h1Accent: "先学哪一种?",
    shortAnswerRich:
      "**On1** 在第 1 拍踏入。LA 风格,入门更轻松。**On2** 在第 2 拍踏入。纽约风格,更贴近康加鼓,在比赛中占主导。**最佳首选:** 学习你本地场景占主流的风格,这样才有人和你跳。长期认真的舞者最终会两者都学,以其中一种为主。",
    sec1Title: "唯一真正重要的差别",
    sec1Paragraphs: [
      "On1 和 On2 使用相同的 8 拍结构。两者每 8 拍都走 6 步,在第 4 和第 8 拍停顿。两者使用相同的双人舞蹈语汇、相同的 Shines、相同的转动模式。",
      "唯一的区别是 **你在哪一拍踏入**:在哪一拍改变方向。On1 舞者在第 1 拍向前踏入,在第 5 拍向后踏入。On2 舞者在第 2 拍向后踏入,在第 6 拍向前踏入。",
      "这一拍的偏移改变了其他一切:感觉、节奏感、你被吸引的音乐,以及哪些俱乐部让你感觉像家。",
    ],
    sec2Title: "并排对比",
    sec2HeadAttr: "属性",
    sec2HeadOn1: "Salsa On1",
    sec2HeadOn2: "Salsa On2",
    sec2Rows: [
      { a: "踏入步", b: "第 1 拍向前,第 5 拍向后", c: "第 2 拍向后,第 6 拍向前" },
      { a: "音乐同步", b: "旋律 / 强拍", c: "康加鼓 Tumbao 拍点" },
      { a: "感觉", b: "鲜明、明亮、断奏", c: "更顺畅,更深陷凹槽" },
      { a: "学习曲线 (第 1-2 周)", b: "更快", c: "略慢" },
      { a: "学习曲线 (第 3 个月起)", b: "相同", c: "相同" },
      { a: "起源", b: "洛杉矶,1990 年代 (Vazquez 兄弟)", c: "纽约 Palladium 1950 年代;Eddie Torres 在 1970 年代体系化" },
      { a: "主流场景", b: "LA、大部分拉美地区、许多欧洲城市", c: "纽约、比赛巡回赛、全球 On2 专场" },
      { a: "典型音乐", b: "快速、旋律性、精致的编曲", c: "较慢、打击乐为主、节奏导向的编曲" },
    ],
    sec3Title: "各自的感觉如何",
    sec3Paragraphs: [
      "描述这个差别最清晰的方式:On1 像是跟着 *歌手* 跳。On2 像是跟着 *乐队* 跳。",
      "On1 让你的重心转移落在旋律倾向于强调的同一拍。舞蹈鲜明、与人声线同步。造型亮点在 1、3、5、7 上落下:可预测、令人满足、容易看清。",
      "On2 让你的重心转移落在康加鼓的拍点上:第 2 和第 6。这种与打击乐部的对齐,正是人们与 On2 联系起来的「更顺畅」品质的来源。踏入步与节奏一致,而不是与旋律,这赋予舞蹈一种更深、更耐心的感觉。",
    ],
    sec4Title: "哪种风格在哪里跳?",
    sec4Intro: "全球萨尔萨地理的粗略地图:",
    sec4Bullets: [
      "**纽约市:** 压倒性 On2。",
      "**洛杉矶:** 压倒性 On1。",
      "**拉丁美洲:** 大部分 On1,不过有几个城市 (尤其是波多黎各) 有强大的 On2 场景。",
      "**欧洲:** 混合。伦敦、罗马、柏林和比赛巡回赛偏向 On2。这些枢纽之外的本地场景主要是 On1。",
      "**比赛萨尔萨:** On2 主导大型锦标赛的 New York Style 和 Cabaret 类别。",
    ],
    sec4Outro:
      "如果你长期认真对待萨尔萨,你最终会接触到两种。大多数职业舞者都能流畅切换,尽管他们通常有一种主风格。",
    sec5Title: "决策框架",
    sec5Bullets: [
      "**你的本地场景明显是一种风格。** 学习你场景所跳的。你需要练习伙伴。",
      "**你的本地场景是混合的。** 如果你想认真且竞技导向,从 On2 开始;如果你想最快进入社交圈,从 On1 开始。",
      "**你在线学习,没有本地场景。** 长远考虑选 On2。教师更好、教学法更丰富,而且能扩展到全球最有声望的场景。",
      "**你从小听拉丁音乐。** 都行,但 On2 倾向于让训练有素的耳朵感觉音乐上更自然,因为它与你已经内化的打击乐相符。",
    ],
    sec6Title: "从 On1 切换到 On2 (或反之)",
    sec6Intro:
      "好消息:你在一种节拍中学到的东西 80% (双人舞蹈、转动模式、引带技巧) 可直接迁移。工作主要是耳朵训练和重新连接踏入步习惯。",
    sec6Steps: [
      "**先重新训练耳朵,再训练脚。** 一周时间一边听萨尔萨一边在 2 和 6 上拍出康加鼓的拍点。",
      "**安静、缓慢地练习基本步。** 半速、出声数拍、不放音乐。每天 10 分钟,直到新的踏入步不再像外语。",
      "**先一个人跳,再和搭档跳。** 用不稳定的新节拍做双人舞蹈会让你瞬间退回旧习惯。",
      "**起初只在新风格的社交场合跳。** 节拍混合的场地在过渡期是认知混乱。找一个专门的夜晚,前一个月待在那里。",
    ],
    sec6Outro:
      "大多数 On1 舞者经过 4-8 周认真练习后能在 On2 中社交跳舞。职业舞者用一半时间做到,因为习惯更清晰、训练更刻意。",
    faqs: [
      { q: "对完全的初学者来说,On1 和 On2 哪个更容易?", a: "Salsa On1 在前两周稍微容易上手,因为西方音乐训练我们在第 1 拍踏步。第一个月之后差距就缩小了。从 On2 开始的完全初学者达到社交水平的速度,与从 On1 开始的人相同。" },
      { q: "如果我本地场景跳 On1,我还应该学 On2 吗?", a: "实用地说,先学你场景跳的。你需要一个社交练习的地方,每场萨尔萨社交都有人愿意和初学者跳。一旦你在本地风格中成为自信的社交舞者,加上另一种节拍是 1-2 个月的项目。" },
      { q: "职业舞者更喜欢 On1 还是 On2?", a: "World Salsa Championships 和 Salsa Open 类别的比赛萨尔萨由 On2 主导,尤其是 New York Style 和 Cabaret 类别。LA Style 比赛是 On1。社交上,大多数职业舞者两者都能跳,但其主风格倾向于 On2。" },
      { q: "我能在同一场派对上跳 On1 和 On2 吗?", a: "你可以在不同曲目间切换,但在一首曲子内你要承诺一种节拍。在跳舞中途切换节拍对搭档和音乐都很突兀。大多数有经验的舞者会调整自己的节拍以匹配搭档。" },
      { q: "我怎么知道一首歌是 'On1' 还是 'On2'?", a: "歌曲不是按特定节拍写的。任何萨尔萨歌曲都可以两种方式跳。话虽如此,带有突出康加鼓和 Timbales 的较慢、较柔和的编曲 (经典纽约 Mambo、Eddie Palmieri、Tito Puente) 在 On2 中感觉更自然。快速、旋律性、精致的制作 (经典 LA 风格) 在 On1 中感觉更自然。" },
    ],
    ctaHeading: "从拍点到 boss 级别的体系化课程。",
    howToSteps: [
      { name: "先重新训练耳朵,再训练脚", text: "花一周时间听萨尔萨音乐,在第 2 和第 6 拍上击掌跟随康加鼓拍点。在你能听到那个脉搏之前,你无法可靠地跳 On2。" },
      { name: "安静缓慢地练习基本步", text: "以半速练习新的踏入步,出声数拍,不放音乐。每天 10 分钟,直到新的踏入步不再感觉像外语。" },
      { name: "先一个人跳,再和搭档跳", text: "用不稳定的新节拍做双人舞蹈会让你瞬间退回旧习惯。先在独舞中巩固节拍。" },
      { name: "起初只在 On2 DJ 之夜社交", text: "你社交跳 On2 的第一个月,寻找专门的 On2 之夜。在 On1 场地试图保持 On2 节拍是认知混乱。消除这种冲突来缓解过渡。" },
    ],
  },
  ru: {
    metaTitle: "Salsa On1 vs Salsa On2: какую учить первой?",
    metaDescription:
      "On1 ломается на 1-й доле, On2 — на 2-й. Полное сравнение ощущения, истории, сцен и музыки, плюс практический фреймворк, чтобы решить, какой стиль учить первым.",
    breadcrumbHome: "Главная",
    breadcrumbCurrent: "On1 vs On2",
    badge: "Сравнение",
    h1Pre: "Salsa On1 vs Salsa On2: ",
    h1Accent: "какую учить первой?",
    shortAnswerRich:
      "**On1** ломается на 1-й доле. Стиль LA, проще въехать. **On2** ломается на 2-й доле. Нью-йоркский стиль, ближе к конге, доминирует на соревнованиях. **Лучший первый выбор:** учи стиль, который доминирует в твоей локальной сцене, чтобы было с кем танцевать. Серьёзные танцоры в долгосрочной перспективе обычно учат оба, имея один в качестве основного.",
    sec1Title: "Единственная разница, которая имеет значение",
    sec1Paragraphs: [
      "И On1, и On2 используют одну и ту же 8-дольную структуру. Оба делают шесть шагов на 8 долей с паузой на 4 и 8. Оба используют один и тот же словарь парной работы, одни и те же шайнс, одни и те же повороты.",
      "Единственное различие — **на какой доле ты ломаешься**: на какой доле меняешь направление. Танцоры On1 ломаются вперёд на 1 и назад на 5. Танцоры On2 ломаются назад на 2 и вперёд на 6.",
      "Этот сдвиг на одну долю меняет всё остальное: ощущение, фразировку, музыку, к которой тянет, и какие клубы кажутся домом.",
    ],
    sec2Title: "Бок о бок",
    sec2HeadAttr: "Параметр",
    sec2HeadOn1: "Salsa On1",
    sec2HeadOn2: "Salsa On2",
    sec2Rows: [
      { a: "Шаг break", b: "Вперёд на 1, назад на 5", c: "Назад на 2, вперёд на 6" },
      { a: "Музыкальная синхронизация", b: "Мелодия / сильная доля", c: "Slap конги тумбао" },
      { a: "Ощущение", b: "Резкое, яркое, стаккато", c: "Плавнее, глубже в грув" },
      { a: "Кривая обучения (1-2 неделя)", b: "Быстрее", c: "Чуть медленнее" },
      { a: "Кривая обучения (3+ месяц)", b: "Равная", c: "Равная" },
      { a: "Происхождение", b: "LA, 1990-е (братья Васкес)", c: "NYC Palladium 1950-е; кодифицировано Eddie Torres в 1970-х" },
      { a: "Доминирующие сцены", b: "LA, большая часть Латинской Америки, многие европейские города", c: "NYC, соревновательные туры, выделенные On2-вечера по всему миру" },
      { a: "Типичная музыка", b: "Быстрые, мелодичные, отполированные аранжировки", c: "Более медленные, перкуссивные, с акцентом на ритм-секцию" },
    ],
    sec3Title: "Как ощущается каждый",
    sec3Paragraphs: [
      "Самый ясный способ описать разницу: On1 — это танцевать под *певца*. On2 — это танцевать под *группу*.",
      "On1 ставит твой перенос веса на ту же долю, которую обычно подчёркивает мелодия. Танец резкий и синхронизирован с вокальной линией. Стайлинговые акценты падают на 1, 3, 5, 7: предсказуемо, удовлетворительно и легко заметить.",
      "On2 ставит твой перенос веса на slap конги: 2 и 6. Это совпадение с перкуссионной секцией — источник «более плавного» качества, которое люди ассоциируют с On2. Шаг break совпадает с ритмом, а не с мелодией, что придаёт танцу более глубокое, терпеливое ощущение.",
    ],
    sec4Title: "Где какой стиль танцуют?",
    sec4Intro: "Грубая карта мировой географии сальсы:",
    sec4Bullets: [
      "**Нью-Йорк:** подавляюще On2.",
      "**Лос-Анджелес:** подавляюще On1.",
      "**Латинская Америка:** в основном On1, хотя в нескольких городах (особенно в Пуэрто-Рико) сильные сцены On2.",
      "**Европа:** смешанная. Лондон, Рим, Берлин и соревновательные туры тяготеют к On2. Большинство местных сцен вне этих хабов — преимущественно On1.",
      "**Соревновательная сальса:** On2 доминирует в категориях New York Style и Cabaret крупных чемпионатов.",
    ],
    sec4Outro:
      "Если ты серьёзно настроен на сальсу в долгосрочной перспективе, ты в итоге столкнёшься с обоими. Большинство профессиональных танцоров умеют свободно переключаться, хотя обычно у них есть домашний стиль.",
    sec5Title: "Фреймворк для решения",
    sec5Bullets: [
      "**Твоя локальная сцена явно один стиль.** Учи то, что танцует твоя сцена. Тебе нужны партнёры для практики.",
      "**Твоя локальная сцена смешанная.** Начинай с On2, если хочешь серьёзно и соревновательно; начинай с On1, если хочешь самое быстрое социальное вхождение.",
      "**Учишь онлайн без локальной сцены.** On2 на длинную дистанцию. Лучше преподаватели, богаче педагогика, и масштабируется в самые престижные сцены мира.",
      "**Вырос на латиноамериканской музыке.** Сработает любое, но On2 обычно ощущается музыкально естественнее для тренированного слуха, потому что совпадает с перкуссией, которую ты уже усвоил.",
    ],
    sec6Title: "Переход с On1 на On2 (или наоборот)",
    sec6Intro:
      "Хорошая новость: 80% того, что ты выучил в одном тайминге (парная работа, повороты, техника лида-фоллоу) переносится напрямую. Работа в основном — тренировка слуха и переподключение привычки шага break.",
    sec6Steps: [
      "**Перетренируй ухо раньше, чем ноги.** Неделя слушания сальсы с хлопанием в ладоши на slap конги на 2 и 6.",
      "**Дриллируй базовый шаг тихо, медленно.** Половинная скорость, считая вслух, без музыки. 10 минут в день, пока новый шаг break не перестанет ощущаться иностранным языком.",
      "**Танцуй один, прежде чем танцевать с партнёром.** Парная работа с нестабильным новым таймингом мгновенно возвращает тебя к старой привычке.",
      "**Социально танцуй только в новом стиле сначала.** Залы со смешанным таймингом — когнитивный хаос во время перехода. Найди выделенный вечер и оставайся там первый месяц.",
    ],
    sec6Outro:
      "Большинство танцоров On1 социально танцуют On2 после 4-8 недель серьёзной практики. Профессионалы делают это вдвое быстрее, потому что привычка яснее, а тренировка преднамеренная.",
    faqs: [
      { q: "Что легче для абсолютного новичка, On1 или On2?", a: "Salsa On1 чуть легче схватить в первые две недели, потому что западная музыка тренирует нас шагать на 1. После первого месяца разрыв закрывается. Абсолютные новички, начинающие с On2, достигают социального уровня компетентности с той же скоростью, что и начинающие с On1." },
      { q: "Если моя локальная сцена танцует On1, стоит ли всё равно учить On2?", a: "Прагматично — учи сначала то, что танцует твоя сцена. Тебе нужно где-то практиковаться социально, и на каждой сальса-социалке есть люди, готовые танцевать с новичком. Когда ты уверенный социальный танцор в своём локальном стиле, добавление другого тайминга — проект на 1-2 месяца." },
      { q: "Профессиональные танцоры предпочитают On1 или On2?", a: "Соревновательная сальса на World Salsa Championships и в категориях Salsa Open доминируется On2, особенно в категориях New York Style и Cabaret. Соревнования LA Style — On1. Социально большинство профи могут танцевать оба, но их домашний стиль обычно On2." },
      { q: "Можно ли танцевать On1 и On2 на одной вечеринке?", a: "Можно переключаться между песнями, но внутри одной песни ты привержен одному таймингу. Менять тайминг посреди танца — диссонанс для партнёра и музыки. Большинство опытных танцоров адаптируют свой тайминг под партнёра." },
      { q: "Как понять, песня 'On1' или 'On2'?", a: "Песни не пишутся в конкретном тайминге. Любую сальсу можно танцевать обоими способами. Тем не менее, более медленные, плавные аранжировки с заметными конгой и тимбалесами (классический нью-йоркский Mambo, Eddie Palmieri, Tito Puente) ощущаются естественнее для On2. Быстрые, мелодичные, отполированные продукции (классический LA-стиль) ощущаются естественнее для On1." },
    ],
    ctaHeading: "Структурированная программа от ритма до уровня босса.",
    howToSteps: [
      { name: "Перетренируй ухо раньше, чем ноги", text: "Проведи неделю, слушая сальса-музыку и хлопая в ладоши на slap конги на 2 и 6. Пока ты не услышишь этот пульс, ты не сможешь надёжно танцевать On2." },
      { name: "Дриллируй базовый шаг тихо и медленно", text: "Практикуй новый шаг break на половинной скорости, считая вслух, без музыки. 10 минут в день, пока новый шаг break не перестанет ощущаться иностранным языком." },
      { name: "Танцуй один, прежде чем танцевать с партнёром", text: "Парная работа с нестабильным новым таймингом мгновенно возвращает к старой привычке. Сначала укрепи тайминг соло." },
      { name: "Социально танцуй только на On2-вечерах сначала", text: "Первый месяц танцев On2 социально ищи выделенные On2-вечера. Танцевать в On1-зале, пытаясь удержать On2-тайминг, — когнитивный хаос. Облегчи переход, убрав этот конфликт." },
    ],
  },
  pl: {
    metaTitle: "Salsa On1 vs Salsa On2: której uczyć się najpierw?",
    metaDescription:
      "On1 łamie na 1. miarze, On2 na 2. Pełne porównanie feelingu, historii, scen i muzyki oraz praktyczny framework, by zdecydować, jakiego stylu uczyć się najpierw.",
    breadcrumbHome: "Strona główna",
    breadcrumbCurrent: "On1 vs On2",
    badge: "Porównanie",
    h1Pre: "Salsa On1 vs Salsa On2: ",
    h1Accent: "której uczyć się najpierw?",
    shortAnswerRich:
      "**On1** łamie na 1. miarze. Styl LA, łatwiejsze wejście. **On2** łamie na 2. miarze. Styl nowojorski, bardziej wierny kongi, dominuje w zawodach. **Najlepszy pierwszy wybór:** ucz się stylu, który dominuje w twojej lokalnej scenie, żebyś miał z kim tańczyć. Poważni długoterminowi tancerze zwykle kończą ucząc się obu, z jednym jako bazą.",
    sec1Title: "Jedyna różnica, która ma znaczenie",
    sec1Paragraphs: [
      "Zarówno On1, jak i On2 używają tej samej struktury 8-miarowej. Oba robią sześć kroków na 8 miar z pauzą na 4 i 8. Oba używają tego samego słownika pracy w parze, tych samych shines, tych samych obrotów.",
      "Jedyne rozróżnienie to **na której mierze łamiesz**: na której mierze zmieniasz kierunek. Tancerze On1 łamią do przodu na 1 i do tyłu na 5. Tancerze On2 łamią do tyłu na 2 i do przodu na 6.",
      "Ta jednomiarowa różnica zmienia wszystko inne: feeling, frazowanie, muzykę, ku której ciągnie, i które kluby czujesz jak dom.",
    ],
    sec2Title: "Obok siebie",
    sec2HeadAttr: "Atrybut",
    sec2HeadOn1: "Salsa On1",
    sec2HeadOn2: "Salsa On2",
    sec2Rows: [
      { a: "Krok break", b: "Do przodu na 1, do tyłu na 5", c: "Do tyłu na 2, do przodu na 6" },
      { a: "Synchronizacja muzyczna", b: "Melodia / mocna miara", c: "Slap kongi tumbao" },
      { a: "Feeling", b: "Wyrazisty, jasny, staccato", c: "Łagodniejszy, głębiej w groovie" },
      { a: "Krzywa nauki (tygodnie 1-2)", b: "Szybsza", c: "Lekko wolniejsza" },
      { a: "Krzywa nauki (miesiąc 3+)", b: "Równa", c: "Równa" },
      { a: "Pochodzenie", b: "LA, lata 90. (bracia Vazquez)", c: "NYC Palladium lata 50.; skodyfikowane przez Eddie'go Torresa w latach 70." },
      { a: "Dominujące sceny", b: "LA, większość Ameryki Łacińskiej, wiele europejskich miast", c: "NYC, obwody konkursowe, dedykowane noce On2 na całym świecie" },
      { a: "Typowa muzyka", b: "Szybkie, melodyjne, dopracowane aranżacje", c: "Wolniejsze, perkusyjne, ze rytmiką na pierwszym planie" },
    ],
    sec3Title: "Jak czuje się każdy",
    sec3Paragraphs: [
      "Najjaśniejszy sposób opisania różnicy: On1 czuje się jak taniec do *wokalisty*. On2 czuje się jak taniec do *zespołu*.",
      "On1 ląduje twoją zmianę ciężaru na tej samej mierze, którą podkreśla melodia. Taniec jest wyrazisty i zsynchronizowany z linią wokalną. Akcenty stylingowe spadają na 1, 3, 5, 7: przewidywalne, satysfakcjonujące, łatwe do dostrzeżenia.",
      "On2 ląduje twoją zmianę ciężaru na slap kongi: 2 i 6. To dopasowanie z sekcją perkusyjną jest źródłem „łagodniejszej” jakości, którą ludzie kojarzą z On2. Krok break zbiega się z rytmem, nie z melodią, co daje tańcowi głębszy, cierpliwszy feeling.",
    ],
    sec4Title: "Gdzie tańczy się jaki styl?",
    sec4Intro: "Przybliżona mapa globalnej geografii salsy:",
    sec4Bullets: [
      "**Nowy Jork:** przeważnie On2.",
      "**Los Angeles:** przeważnie On1.",
      "**Ameryka Łacińska:** głównie On1, choć kilka miast (zwłaszcza Portoryko) ma silne sceny On2.",
      "**Europa:** mieszana. Londyn, Rzym, Berlin i obwody konkursowe skłaniają się ku On2. Większość lokalnych scen poza tymi hubami to głównie On1.",
      "**Salsa konkursowa:** On2 dominuje w kategoriach New York Style i Cabaret na największych mistrzostwach.",
    ],
    sec4Outro:
      "Jeśli traktujesz salsę poważnie długoterminowo, w końcu zetkniesz się z obiema. Większość zawodowych tancerzy potrafi płynnie przełączać się, choć zwykle ma styl macierzysty.",
    sec5Title: "Framework decyzyjny",
    sec5Bullets: [
      "**Twoja lokalna scena to wyraźnie jeden styl.** Ucz się tego, co tańczy twoja scena. Potrzebujesz partnerów do praktyki.",
      "**Twoja lokalna scena jest mieszana.** Zacznij od On2, jeśli chcesz iść na poważnie i konkursowo; zacznij od On1, jeśli chcesz najszybsze wejście społeczne.",
      "**Uczysz się online bez lokalnej sceny.** On2 na długą metę. Lepsi nauczyciele, bogatsza pedagogika, skaluje się do najbardziej prestiżowych scen na świecie.",
      "**Wychowałeś się na muzyce latynoskiej.** Każde działa, ale On2 zwykle czuje się muzycznie naturalnie dla wytrenowanego ucha, bo dopasowuje się do perkusji, którą już przyswoiłeś.",
    ],
    sec6Title: "Przejście z On1 na On2 (lub odwrotnie)",
    sec6Intro:
      "Dobra wiadomość: 80% tego, czego nauczyłeś się w jednym timingu (praca w parze, obroty, technika prowadzenia-podążania) przenosi się bezpośrednio. Praca to głównie trening słuchu i przeprogramowanie nawyku kroku break.",
    sec6Steps: [
      "**Wytrenuj ucho zanim wytrenujesz nogi.** Tydzień słuchania salsy i klaskania w slap kongi na 2 i 6.",
      "**Drilluj podstawę po cichu, powoli.** Połowa tempa, licząc na głos, bez muzyki. 10 minut dziennie, aż nowy krok break przestanie czuć się jak obcy język.",
      "**Tańcz sam, zanim zatańczysz z partnerem.** Praca w parze z niestabilnym nowym timingiem natychmiast zwraca cię do starego nawyku.",
      "**Społecznie tańcz tylko w nowym stylu na początku.** Sale o mieszanym timingu są poznawczym chaosem podczas przejścia. Znajdź dedykowaną noc i zostań tam pierwszy miesiąc.",
    ],
    sec6Outro:
      "Większość tancerzy On1 tańczy społecznie On2 po 4-8 tygodniach poważnej praktyki. Profesjonaliści robią to w połowie czasu, bo nawyk jest jaśniejszy, a trening celowy.",
    faqs: [
      { q: "Co jest łatwiejsze dla absolutnego początkującego, On1 czy On2?", a: "Salsa On1 jest nieco łatwiejsza do złapania w pierwszych dwóch tygodniach, bo zachodnia muzyka trenuje nas, by stąpać na 1. Po pierwszym miesiącu różnica się zamyka. Absolutni początkujący, zaczynający od On2, osiągają poziom kompetencji społecznej w tym samym tempie co ci, którzy zaczynają od On1." },
      { q: "Jeśli moja lokalna scena tańczy On1, czy nadal powinienem uczyć się On2?", a: "Pragmatycznie ucz się najpierw tego, co tańczy twoja scena. Potrzebujesz miejsca do praktyki społecznej, a każda sociała salsy ma ludzi gotowych tańczyć z początkującym. Gdy jesteś pewnym tancerzem społecznym w lokalnym stylu, dodanie drugiego timingu to projekt na 1-2 miesiące." },
      { q: "Profesjonalni tancerze wolą On1 czy On2?", a: "Salsa konkursowa na World Salsa Championships i w kategoriach Salsa Open jest zdominowana przez On2, zwłaszcza kategorie New York Style i Cabaret. Konkursy LA Style są On1. Społecznie większość profesjonalistów potrafi tańczyć oba, ale ich styl macierzysty zwykle to On2." },
      { q: "Czy mogę tańczyć On1 i On2 na tej samej imprezie?", a: "Możesz przełączać się między piosenkami, ale w obrębie jednej piosenki angażujesz się w jeden timing. Zmiana timingu w trakcie tańca jest niespójna dla partnera i muzyki. Większość doświadczonych tancerzy dostosowuje swój timing do partnera." },
      { q: "Jak rozpoznać, czy piosenka jest 'On1' czy 'On2'?", a: "Piosenki nie są pisane w konkretnym timingu. Każdą piosenkę salsy można tańczyć w obu. Ale wolniejsze, łagodniejsze aranżacje z wyraźną kongą i timbales (klasyczny nowojorski Mambo, Eddie Palmieri, Tito Puente) czują się naturalniej dla On2. Szybkie, melodyjne, dopracowane produkcje (klasyczny LA Style) czują się naturalniej dla On1." },
    ],
    ctaHeading: "Strukturalny program nauczania od beatu po poziom bossa.",
    howToSteps: [
      { name: "Wytrenuj ucho zanim wytrenujesz nogi", text: "Spędź tydzień słuchając muzyki salsy i klaszcząc w slap kongi na 2 i 6. Dopóki nie usłyszysz tego pulsu, nie zatańczysz wiarygodnie On2." },
      { name: "Drilluj podstawę po cichu i powoli", text: "Ćwicz nowy krok break w połowie tempa, licząc na głos, bez muzyki. 10 minut dziennie, aż nowy krok break przestanie czuć się jak obcy język." },
      { name: "Tańcz sam, zanim zatańczysz z partnerem", text: "Praca w parze z niestabilnym nowym timingiem natychmiast zwraca cię do starego nawyku. Najpierw utrwal timing solo." },
      { name: "Społecznie tańcz tylko na nocach On2 na początku", text: "Pierwszy miesiąc tańca On2 społecznie szukaj dedykowanych nocy On2. Taniec na sali On1 przy próbie utrzymania timingu On2 to poznawczy chaos. Ułatw przejście, eliminując ten konflikt." },
    ],
  },
  nl: {
    metaTitle: "Salsa On1 vs Salsa On2: welke moet je eerst leren?",
    metaDescription:
      "On1 breekt op tel 1, On2 breekt op tel 2. Volledige vergelijking van gevoel, geschiedenis, scenes en muziek, plus een praktisch kader om te beslissen welke stijl je eerst leert.",
    breadcrumbHome: "Home",
    breadcrumbCurrent: "On1 vs On2",
    badge: "Vergelijking",
    h1Pre: "Salsa On1 vs Salsa On2: ",
    h1Accent: "welke moet je eerst leren?",
    shortAnswerRich:
      "**On1** breekt op de 1e tel. LA Style, makkelijker instappen. **On2** breekt op de 2e tel. New York Style, trouwer aan de conga, dominant in competitie. **Beste eerste keuze:** leer de stijl die in jouw lokale scene domineert zodat je dansers hebt om mee te dansen. Serieuze langetermijn-dansers leren uiteindelijk allebei, met één als hun thuisbasis.",
    sec1Title: "Het enige verschil dat telt",
    sec1Paragraphs: [
      "Zowel On1 als On2 gebruiken dezelfde 8-tels structuur. Beide nemen zes stappen per 8 tellen met een pauze op de 4 en de 8. Beide gebruiken dezelfde partnerwerkvocabulaire, dezelfde shines, dezelfde draaipatronen.",
      "Het enige onderscheid is **op welke tel je breekt**: op welke tel je van richting verandert. On1-dansers breken vooruit op de 1 en achteruit op de 5. On2-dansers breken achteruit op de 2 en vooruit op de 6.",
      "Die verschuiving van één tel verandert al het andere: het gevoel, de frasering, de muziek waar je naartoe trekt en welke clubs als thuis aanvoelen.",
    ],
    sec2Title: "Naast elkaar",
    sec2HeadAttr: "Kenmerk",
    sec2HeadOn1: "Salsa On1",
    sec2HeadOn2: "Salsa On2",
    sec2Rows: [
      { a: "Break-stap", b: "Vooruit op 1, achteruit op 5", c: "Achteruit op 2, vooruit op 6" },
      { a: "Muzikale sync", b: "Melodie / downbeat", c: "Slap van de conga tumbao" },
      { a: "Gevoel", b: "Pittig, helder, staccato", c: "Soepeler, dieper in de pocket" },
      { a: "Leercurve (week 1-2)", b: "Sneller", c: "Iets langzamer" },
      { a: "Leercurve (maand 3+)", b: "Gelijk", c: "Gelijk" },
      { a: "Oorsprong", b: "LA, jaren 90 (Vazquez-broers)", c: "NYC Palladium jaren 50; gecodificeerd door Eddie Torres in de jaren 70" },
      { a: "Dominante scenes", b: "LA, het grootste deel van Latijns-Amerika, veel Europese steden", c: "NYC, competitie-circuits, dedicated On2-avonden wereldwijd" },
      { a: "Typische muziek", b: "Snelle, melodische, gepolijste arrangementen", c: "Tragere, percussieve arrangementen met de ritmiek voorop" },
    ],
    sec3Title: "Hoe elk aanvoelt",
    sec3Paragraphs: [
      "De helderste manier om het verschil te beschrijven: On1 voelt als dansen op de *zanger*. On2 voelt als dansen op de *band*.",
      "On1 laat je gewichtsverandering landen op dezelfde tel die de melodie meestal benadrukt. De dans is pittig en gesynchroniseerd met de zangrij. Stylingaccenten vallen op de 1, 3, 5, 7: voorspelbaar, bevredigend en makkelijk te zien.",
      "On2 laat je gewichtsverandering landen op de slap van de conga: de 2 en de 6. Die uitlijning met de percussiesectie is de bron van de „soepelere” kwaliteit die mensen met On2 associëren. De break-stap valt samen met het ritme, niet met de melodie, wat de dans een diepere, geduldigere beleving geeft.",
    ],
    sec4Title: "Waar wordt welke stijl gedanst?",
    sec4Intro: "Een ruwe kaart van de wereldwijde salsa-geografie:",
    sec4Bullets: [
      "**New York City:** overweldigend On2.",
      "**Los Angeles:** overweldigend On1.",
      "**Latijns-Amerika:** overwegend On1, hoewel verschillende steden (met name Puerto Rico) sterke On2-scenes hebben.",
      "**Europa:** gemengd. Londen, Rome, Berlijn en de competitiecircuits neigen naar On2. De meeste lokale scenes buiten deze hubs zijn voornamelijk On1.",
      "**Competitie-salsa:** On2 domineert de New York Style en Cabaret-categorieën van de grote kampioenschappen.",
    ],
    sec4Outro:
      "Als je serieus aan salsa op lange termijn doet, kom je uiteindelijk met beide in aanraking. De meeste professionele dansers kunnen vloeiend wisselen, maar hebben meestal een thuisstijl.",
    sec5Title: "Een beslissingsraamwerk",
    sec5Bullets: [
      "**Je lokale scene is duidelijk één stijl.** Leer wat je scene danst. Je hebt oefenpartners nodig.",
      "**Je lokale scene is gemengd.** Begin met On2 als je serieus en competitief wilt; begin met On1 als je de snelste sociale onboarding wilt.",
      "**Je leert online zonder lokale scene.** On2 voor de lange termijn. Betere leraren, rijkere pedagogie, en het schaalt naar de meest prestigieuze scenes wereldwijd.",
      "**Je groeide op met Latijnse muziek.** Beide werkt, maar On2 voelt meestal muzikaal natuurlijk voor getrainde oren omdat het overeenkomt met de percussie die je al hebt geïnternaliseerd.",
    ],
    sec6Title: "Overgang van On1 naar On2 (of andersom)",
    sec6Intro:
      "Het goede nieuws: 80% van wat je in één timing leerde (het partnerwerk, de draaipatronen, de lead-follow-techniek) draagt direct over. Het werk is vooral oortraining en het herbedraden van de break-stap-gewoonte.",
    sec6Steps: [
      "**Train je oor voor je voeten.** Een week salsa luisteren en in je handen klappen op de slap van de conga op de 2 en 6.",
      "**Drill de basis stil, langzaam.** Halve snelheid, hardop tellen, geen muziek. 10 minuten per dag tot de nieuwe break-stap niet langer als een vreemde taal voelt.",
      "**Dans alleen voordat je met een partner danst.** Partnerwerk met onstabiele nieuwe timing brengt je direct terug naar de oude gewoonte.",
      "**Sociaal dans alleen in de nieuwe stijl in het begin.** Zalen met gemengde timing zijn cognitieve chaos tijdens een overgang. Vind een dedicated avond en blijf daar de eerste maand.",
    ],
    sec6Outro:
      "De meeste On1-dansers dansen sociaal On2 na 4-8 weken serieuze oefening. Pro's doen het in de helft van de tijd omdat de gewoonte helderder is en de drilling doelbewust.",
    faqs: [
      { q: "Wat is makkelijker voor een absolute beginner, On1 of On2?", a: "Salsa On1 is iets makkelijker op te pikken in de eerste twee weken omdat westerse muziek ons traint om op de 1 te stappen. Na de eerste maand sluit het gat. Absolute beginners die met On2 beginnen, bereiken sociaal-niveau competentie op hetzelfde tempo als degenen die met On1 beginnen." },
      { q: "Als mijn lokale scene On1 danst, moet ik dan toch On2 leren?", a: "Pragmatisch: leer eerst wat je scene danst. Je hebt ergens nodig om sociaal te oefenen, en elke salsa-sociaal heeft mensen die met een beginner willen dansen. Eens je een zelfverzekerde sociale danser bent in je lokale stijl, is het toevoegen van de andere timing een 1-2 maanden project." },
      { q: "Geven professionele dansers de voorkeur aan On1 of On2?", a: "Competitie-salsa op de World Salsa Championships en in de Salsa Open-categorieën wordt gedomineerd door On2, vooral de New York Style en Cabaret-categorieën. LA Style-competities zijn On1. Sociaal kunnen de meeste pro's beide dansen, maar hun thuisstijl neigt naar On2." },
      { q: "Kan ik On1 en On2 op hetzelfde feest dansen?", a: "Je kunt tussen liedjes wisselen, maar binnen één lied verbind je je aan één timing. Midden in een dans van timing wisselen is verstorend voor je partner en de muziek. De meeste ervaren dansers passen hun timing aan die van hun partner aan." },
      { q: "Hoe weet ik of een lied 'On1' of 'On2' is?", a: "Liedjes worden niet in een specifieke timing geschreven. Elk salsa-lied kan op beide manieren worden gedanst. Dat gezegd hebbende, tragere, soepelere arrangementen met prominente conga en timbales (klassieke New Yorkse Mambo, Eddie Palmieri, Tito Puente) voelen natuurlijker voor On2. Snelle, melodische, gepolijste producties (klassieke LA Style) voelen natuurlijker voor On1." },
    ],
    ctaHeading: "Een gestructureerd curriculum van beat tot boss-level.",
    howToSteps: [
      { name: "Train je oor voor je voeten", text: "Besteed een week aan het luisteren naar salsamuziek en klap mee op de slap van de conga op de 2 en de 6. Tot je die puls hoort, kun je On2 niet betrouwbaar dansen." },
      { name: "Drill de basis stil en langzaam", text: "Oefen de nieuwe break-stap op halve snelheid, hardop tellend, zonder muziek. 10 minuten per dag tot de nieuwe break-stap niet langer als een vreemde taal voelt." },
      { name: "Dans alleen voordat je met een partner danst", text: "Partnerwerk met onstabiele nieuwe timing brengt je direct terug naar de oude gewoonte. Stel de timing eerst solo veilig." },
      { name: "Sociaal dans in het begin alleen op On2-DJ-avonden", text: "Zoek voor je eerste maand sociaal On2-dansen dedicated On2-avonden. Dansen in een On1-zaal terwijl je On2-timing probeert vast te houden is cognitieve chaos. Vergemakkelijk de overgang door dat conflict te verwijderen." },
    ],
  },
  ar: {
    metaTitle: "Salsa On1 مقابل Salsa On2: أيهما تتعلم أولاً؟",
    metaDescription:
      "On1 يكسر على النقرة 1، On2 يكسر على النقرة 2. مقارنة كاملة للإحساس والتاريخ والساحات والموسيقى، بالإضافة إلى إطار عملي لتقرير أي أسلوب تتعلمه أولاً.",
    breadcrumbHome: "الرئيسية",
    breadcrumbCurrent: "On1 مقابل On2",
    badge: "مقارنة",
    h1Pre: "Salsa On1 مقابل Salsa On2: ",
    h1Accent: "أيهما تتعلم أولاً؟",
    shortAnswerRich:
      "**On1** يكسر على النقرة الأولى. أسلوب LA، أسهل في البداية. **On2** يكسر على النقرة الثانية. أسلوب نيويورك، أكثر إخلاصاً للكونغا، مهيمن في المسابقات. **أفضل اختيار أول:** تعلّم الأسلوب السائد في ساحتك المحلية ليكون لك من ترقص معه. الراقصون الجادون على المدى الطويل ينتهي بهم الأمر بتعلم الاثنين، مع واحد كقاعدة.",
    sec1Title: "الفرق الوحيد المهم",
    sec1Paragraphs: [
      "كلا On1 و On2 يستخدمان نفس بنية العد الثماني. كلاهما يأخذ ست خطوات لكل 8 عدات مع توقف على 4 و 8. كلاهما يستخدمان نفس مفردات العمل مع الشريك، نفس shines، نفس أنماط الدوران.",
      "التمييز الوحيد هو **على أي نقرة تكسر**: على أي نقرة تغيّر الاتجاه. راقصو On1 يكسرون إلى الأمام على 1 وإلى الخلف على 5. راقصو On2 يكسرون إلى الخلف على 2 وإلى الأمام على 6.",
      "تلك الإزاحة بنقرة واحدة تغيّر كل شيء آخر: الإحساس، التركيب، الموسيقى التي تنجذب إليها، والنوادي التي تشعر فيها كأنك في بيتك.",
    ],
    sec2Title: "جنباً إلى جنب",
    sec2HeadAttr: "الخاصية",
    sec2HeadOn1: "Salsa On1",
    sec2HeadOn2: "Salsa On2",
    sec2Rows: [
      { a: "خطوة الكسر", b: "إلى الأمام على 1، إلى الخلف على 5", c: "إلى الخلف على 2، إلى الأمام على 6" },
      { a: "التزامن الموسيقي", b: "اللحن / النقرة القوية", c: "ضربة الكونغا تومباو" },
      { a: "الإحساس", b: "حاد، ساطع، ستاكاتو", c: "أنعم، أعمق في الإيقاع" },
      { a: "منحنى التعلم (الأسبوع 1-2)", b: "أسرع", c: "أبطأ قليلاً" },
      { a: "منحنى التعلم (الشهر 3+)", b: "متساوٍ", c: "متساوٍ" },
      { a: "الأصل", b: "LA، التسعينيات (إخوة Vazquez)", c: "Palladium بنيويورك في الخمسينيات؛ قنّنه Eddie Torres في السبعينيات" },
      { a: "الساحات المهيمنة", b: "LA، معظم أمريكا اللاتينية، كثير من المدن الأوروبية", c: "نيويورك، دوائر المسابقات، ليالي On2 المخصصة في جميع أنحاء العالم" },
      { a: "الموسيقى النموذجية", b: "ترتيبات سريعة، لحنية، مصقولة", c: "ترتيبات أبطأ، إيقاعية، مع الإيقاع في المقدمة" },
    ],
    sec3Title: "كيف يشعر كل منهما",
    sec3Paragraphs: [
      "أوضح طريقة لوصف الفرق: On1 يشعر كأنك ترقص مع *المغني*. On2 يشعر كأنك ترقص مع *الفرقة*.",
      "On1 يحط نقل وزنك على نفس النقرة التي يميل اللحن إلى التشديد عليها. الرقص حاد ومتزامن مع خط الصوت. ضربات الستايلينغ تقع على 1 و 3 و 5 و 7: متوقعة ومُرضية وسهلة الرصد.",
      "On2 يحط نقل وزنك على ضربة الكونغا: 2 و 6. ذلك التحاذي مع قسم الإيقاع هو مصدر الجودة \"الأنعم\" التي يربطها الناس بـ On2. خطوة الكسر تتزامن مع الإيقاع، لا مع اللحن، مما يمنح الرقصة إحساساً أعمق وأكثر صبراً.",
    ],
    sec4Title: "أين يُرقص كل أسلوب؟",
    sec4Intro: "خريطة تقريبية لجغرافية السالسا العالمية:",
    sec4Bullets: [
      "**مدينة نيويورك:** بشكل ساحق On2.",
      "**لوس أنجلوس:** بشكل ساحق On1.",
      "**أمريكا اللاتينية:** غالباً On1، رغم أن عدة مدن (لا سيما بورتوريكو) تملك ساحات On2 قوية.",
      "**أوروبا:** مختلطة. لندن وروما وبرلين ودوائر المسابقات تميل إلى On2. معظم الساحات المحلية خارج هذه المراكز هي بشكل أساسي On1.",
      "**سالسا المسابقات:** On2 يهيمن على فئتي New York Style و Cabaret في البطولات الكبرى.",
    ],
    sec4Outro:
      "إذا كنت جاداً مع السالسا على المدى الطويل، ستتعرض في النهاية للاثنين. معظم الراقصين المحترفين يستطيعون التبديل بطلاقة، لكنهم عادةً ما يملكون أسلوباً أساسياً.",
    sec5Title: "إطار عمل لاتخاذ القرار",
    sec5Bullets: [
      "**ساحتك المحلية بوضوح أسلوب واحد.** تعلّم ما ترقصه ساحتك. تحتاج إلى شركاء للتدريب.",
      "**ساحتك المحلية مختلطة.** ابدأ بـ On2 إذا كنت تريد التوجه الجاد والتنافسي؛ ابدأ بـ On1 إذا كنت تريد أسرع دخول اجتماعي.",
      "**تتعلم عبر الإنترنت بدون ساحة محلية.** On2 للعبة الطويلة. مدرسون أفضل، تربية أغنى، ويمتد إلى أرقى الساحات حول العالم.",
      "**نشأت مع موسيقى لاتينية.** كلاهما يعمل، لكن On2 يميل إلى الشعور بأنه طبيعي موسيقياً للآذان المدربة لأنه يطابق الإيقاع الذي استوعبته بالفعل.",
    ],
    sec6Title: "الانتقال من On1 إلى On2 (أو العكس)",
    sec6Intro:
      "الخبر الجيد: 80% مما تعلمته في توقيت واحد (العمل مع الشريك، أنماط الدوران، تقنية القيادة-المتابعة) ينتقل مباشرة. العمل بشكل أساسي تدريب أذن وإعادة توصيل عادة خطوة الكسر.",
    sec6Steps: [
      "**درّب أذنك قبل قدميك.** أسبوع من الاستماع للسالسا مع التصفيق على ضربة الكونغا في 2 و 6.",
      "**درّب الخطوة الأساسية بصمت وببطء.** نصف السرعة، عدّ بصوت عالٍ، بدون موسيقى. 10 دقائق يومياً حتى تتوقف خطوة الكسر الجديدة عن الشعور بأنها لغة أجنبية.",
      "**ارقص وحدك قبل أن ترقص مع شريك.** العمل مع الشريك بتوقيت جديد غير مستقر يعيدك فوراً إلى العادة القديمة.",
      "**اجتماعياً ارقص بالأسلوب الجديد فقط في البداية.** القاعات بتوقيت مختلط هي فوضى إدراكية أثناء الانتقال. ابحث عن ليلة مخصصة وابقَ هناك الشهر الأول.",
    ],
    sec6Outro:
      "معظم راقصي On1 يرقصون اجتماعياً على On2 بعد 4-8 أسابيع من التدريب الجاد. المحترفون يفعلون ذلك في نصف الوقت لأن العادة أوضح والتدريب متعمد.",
    faqs: [
      { q: "ما الأسهل للمبتدئ التام، On1 أم On2؟", a: "Salsa On1 أسهل قليلاً في الأسبوعين الأولين لأن الموسيقى الغربية تدربنا على الخطو على 1. بعد الشهر الأول، تُغلق الفجوة. المبتدئون التام الذين يبدؤون بـ On2 يصلون إلى الكفاءة الاجتماعية بنفس الوتيرة كأولئك الذين يبدؤون بـ On1." },
      { q: "إذا كانت ساحتي المحلية ترقص On1، هل ينبغي أن أتعلم On2 أيضاً؟", a: "عملياً، تعلّم أولاً ما ترقصه ساحتك. تحتاج إلى مكان للتدريب اجتماعياً، وكل لقاء سالسا يحتوي على أناس مستعدين للرقص مع مبتدئ. بمجرد أن تكون راقصاً اجتماعياً واثقاً في أسلوبك المحلي، إضافة التوقيت الآخر مشروع 1-2 شهر." },
      { q: "هل يفضل الراقصون المحترفون On1 أم On2؟", a: "سالسا المسابقات في World Salsa Championships وفئات Salsa Open مهيمنة بـ On2، خاصة فئتي New York Style و Cabaret. مسابقات LA Style هي On1. اجتماعياً، يستطيع معظم المحترفين رقص الاثنين، لكن أسلوبهم الأساسي يميل إلى On2." },
      { q: "هل يمكنني رقص On1 و On2 في نفس الحفلة؟", a: "يمكنك التبديل بين الأغاني، لكن داخل أغنية واحدة تلتزم بتوقيت واحد. تغيير التوقيت في منتصف الرقصة مزعج لشريكك وللموسيقى. معظم الراقصين ذوي الخبرة يكيّفون توقيتهم لمطابقة شريكهم." },
      { q: "كيف أعرف إذا كانت الأغنية 'On1' أم 'On2'؟", a: "الأغاني لا تُكتب بتوقيت محدد. أي أغنية سالسا يمكن رقصها بكلتا الطريقتين. ومع ذلك، الترتيبات الأبطأ والأنعم بكونغا وتيمبالس بارزة (Mambo نيويورك الكلاسيكي، Eddie Palmieri، Tito Puente) تشعر بأنها أكثر طبيعية لـ On2. الإنتاجات السريعة واللحنية والمصقولة (LA Style الكلاسيكي) تشعر بأنها أكثر طبيعية لـ On1." },
    ],
    ctaHeading: "منهج منظم من النقرة إلى مستوى الزعيم.",
    howToSteps: [
      { name: "درّب أذنك قبل قدميك", text: "اقضِ أسبوعاً تستمع لموسيقى السالسا وتصفق مع ضربة الكونغا على 2 و 6. حتى تستطيع سماع تلك النبضة، لن تستطيع رقص On2 بشكل موثوق." },
      { name: "درّب الخطوة الأساسية بصمت وببطء", text: "تدرّب على خطوة الكسر الجديدة بنصف السرعة، عدّ بصوت عالٍ، بدون موسيقى. 10 دقائق يومياً حتى تتوقف خطوة الكسر الجديدة عن الشعور بأنها لغة أجنبية." },
      { name: "ارقص وحدك قبل أن ترقص مع شريك", text: "العمل مع الشريك بتوقيت جديد غير مستقر يعيدك فوراً إلى العادة القديمة. ثبّت التوقيت منفرداً أولاً." },
      { name: "اجتماعياً ارقص فقط في ليالي On2 في البداية", text: "في شهرك الأول من الرقص الاجتماعي على On2، ابحث عن ليالي On2 المخصصة. الرقص في قاعة On1 محاولاً الحفاظ على توقيت On2 هو فوضى إدراكية. سهّل الانتقال بإزالة هذا التضارب." },
    ],
  },
  el: {
    metaTitle: "Salsa On1 vs Salsa On2: ποια να μάθεις πρώτα;",
    metaDescription:
      "Το On1 σπάει στον 1ο χρόνο, το On2 στον 2ο. Πλήρης σύγκριση αίσθησης, ιστορίας, σκηνών και μουσικής, συν ένα πρακτικό πλαίσιο για να αποφασίσεις ποιο στιλ να μάθεις πρώτος.",
    breadcrumbHome: "Αρχική",
    breadcrumbCurrent: "On1 vs On2",
    badge: "Σύγκριση",
    h1Pre: "Salsa On1 vs Salsa On2: ",
    h1Accent: "ποια να μάθεις πρώτα;",
    shortAnswerRich:
      "**Το On1** σπάει στον 1ο χρόνο. Στιλ LA, ευκολότερη ένταξη. **Το On2** σπάει στον 2ο χρόνο. Στιλ Νέας Υόρκης, πιο πιστό στην conga, κυρίαρχο σε αγώνες. **Καλύτερη πρώτη επιλογή:** μάθε το στιλ που κυριαρχεί στην τοπική σου σκηνή ώστε να έχεις με ποιον να χορέψεις. Οι σοβαροί μακροχρόνιοι χορευτές καταλήγουν να μαθαίνουν και τα δύο, με ένα ως βάση τους.",
    sec1Title: "Η μία διαφορά που μετράει",
    sec1Paragraphs: [
      "Και το On1 και το On2 χρησιμοποιούν την ίδια δομή 8 χρόνων. Και τα δύο κάνουν έξι βήματα ανά 8 χρόνους με παύση στον 4 και τον 8. Και τα δύο χρησιμοποιούν το ίδιο λεξιλόγιο εργασίας ζευγαριού, τα ίδια shines, τις ίδιες στροφές.",
      "Η μόνη διάκριση είναι **σε ποιον χρόνο σπας**: σε ποιον χρόνο αλλάζεις κατεύθυνση. Οι χορευτές On1 σπάνε εμπρός στον 1 και πίσω στον 5. Οι χορευτές On2 σπάνε πίσω στον 2 και εμπρός στον 6.",
      "Αυτή η μετατόπιση ενός χρόνου αλλάζει όλα τα υπόλοιπα: την αίσθηση, τη φραστική, τη μουσική προς την οποία τραβιέσαι, και ποια κλαμπ νιώθεις σαν σπίτι.",
    ],
    sec2Title: "Δίπλα-δίπλα",
    sec2HeadAttr: "Χαρακτηριστικό",
    sec2HeadOn1: "Salsa On1",
    sec2HeadOn2: "Salsa On2",
    sec2Rows: [
      { a: "Βήμα break", b: "Εμπρός στον 1, πίσω στον 5", c: "Πίσω στον 2, εμπρός στον 6" },
      { a: "Μουσικός συγχρονισμός", b: "Μελωδία / downbeat", c: "Slap της conga tumbao" },
      { a: "Αίσθηση", b: "Έντονο, φωτεινό, staccato", c: "Πιο απαλό, βαθύτερα μέσα στο groove" },
      { a: "Καμπύλη μάθησης (εβδομάδες 1-2)", b: "Πιο γρήγορη", c: "Λίγο πιο αργή" },
      { a: "Καμπύλη μάθησης (μήνας 3+)", b: "Ίδια", c: "Ίδια" },
      { a: "Προέλευση", b: "LA, δεκαετία '90 (αδέλφια Vazquez)", c: "NYC Palladium δεκαετία '50· κωδικοποιήθηκε από τον Eddie Torres στη δεκαετία '70" },
      { a: "Κυρίαρχες σκηνές", b: "LA, μεγάλο μέρος της Λατινικής Αμερικής, πολλές ευρωπαϊκές πόλεις", c: "NYC, αγωνιστικά κυκλώματα, αφιερωμένες βραδιές On2 ανά τον κόσμο" },
      { a: "Τυπική μουσική", b: "Γρήγορες, μελωδικές, καλογυαλισμένες ενορχηστρώσεις", c: "Πιο αργές, κρουστικές ενορχηστρώσεις με τη ρυθμική μπροστά" },
    ],
    sec3Title: "Πώς νιώθει η καθεμία",
    sec3Paragraphs: [
      "Ο πιο καθαρός τρόπος να περιγράψω τη διαφορά: το On1 νιώθει σαν να χορεύεις στον *τραγουδιστή*. Το On2 νιώθει σαν να χορεύεις στην *μπάντα*.",
      "Το On1 βάζει την αλλαγή βάρους σου στον ίδιο χρόνο που η μελωδία τείνει να τονίζει. Ο χορός είναι έντονος και συγχρονισμένος με τη φωνητική γραμμή. Τα styling hits πέφτουν στον 1, στον 3, στον 5, στον 7: προβλέψιμα, ικανοποιητικά και εύκολα να εντοπιστούν.",
      "Το On2 βάζει την αλλαγή βάρους σου στο slap της conga: τον 2 και τον 6. Αυτή η ευθυγράμμιση με το κρουστικό τμήμα είναι η πηγή της \"πιο απαλής\" ποιότητας που ο κόσμος συσχετίζει με το On2. Το βήμα break συμπίπτει με τον ρυθμό, όχι με τη μελωδία, που δίνει στον χορό μια βαθύτερη, πιο υπομονετική αίσθηση.",
    ],
    sec4Title: "Πού χορεύεται κάθε στιλ;",
    sec4Intro: "Ένας πρόχειρος χάρτης της παγκόσμιας γεωγραφίας της salsa:",
    sec4Bullets: [
      "**Νέα Υόρκη:** συντριπτικά On2.",
      "**Λος Άντζελες:** συντριπτικά On1.",
      "**Λατινική Αμερική:** κυρίως On1, αν και αρκετές πόλεις (κυρίως το Πουέρτο Ρίκο) έχουν δυνατές σκηνές On2.",
      "**Ευρώπη:** μικτή. Λονδίνο, Ρώμη, Βερολίνο και τα αγωνιστικά κυκλώματα τείνουν προς On2. Οι περισσότερες τοπικές σκηνές εκτός αυτών των κόμβων είναι κυρίως On1.",
      "**Αγωνιστική salsa:** Το On2 κυριαρχεί στις κατηγορίες New York Style και Cabaret των μεγάλων πρωταθλημάτων.",
    ],
    sec4Outro:
      "Αν παίρνεις τη salsa στα σοβαρά μακροπρόθεσμα, στο τέλος θα εκτεθείς και στα δύο. Οι περισσότεροι επαγγελματίες χορευτές μπορούν να αλλάζουν με ευχέρεια, αλλά συνήθως έχουν ένα στιλ-σπίτι.",
    sec5Title: "Πλαίσιο απόφασης",
    sec5Bullets: [
      "**Η τοπική σου σκηνή είναι ξεκάθαρα ένα στιλ.** Μάθε αυτό που χορεύει η σκηνή σου. Χρειάζεσαι παρτενέρ για εξάσκηση.",
      "**Η τοπική σου σκηνή είναι μικτή.** Ξεκίνα με On2 αν θες να πας σοβαρά και αγωνιστικά· ξεκίνα με On1 αν θες την πιο γρήγορη κοινωνική ένταξη.",
      "**Μαθαίνεις online χωρίς τοπική σκηνή.** On2 για το μακρύ παιχνίδι. Καλύτεροι δάσκαλοι, πλουσιότερη παιδαγωγική, και κλιμακώνεται στις πιο διάσημες σκηνές παγκοσμίως.",
      "**Μεγάλωσες με λατινοαμερικάνικη μουσική.** Και τα δύο δουλεύουν, αλλά το On2 τείνει να νιώθεται μουσικά φυσικό σε εκπαιδευμένα αυτιά γιατί ταιριάζει με τα κρουστά που έχεις ήδη εσωτερικεύσει.",
    ],
    sec6Title: "Μετάβαση από On1 σε On2 (ή αντίστροφα)",
    sec6Intro:
      "Τα καλά νέα: το 80% αυτών που έμαθες σε ένα timing (η εργασία ζευγαριού, οι στροφές, η τεχνική lead-follow) μεταφέρεται απευθείας. Η δουλειά είναι κυρίως εξάσκηση αυτιού και αναπρογραμματισμός της συνήθειας του βήματος break.",
    sec6Steps: [
      "**Επανεκπαίδευσε το αυτί σου πριν τα πόδια σου.** Μια εβδομάδα να ακούς salsa και να χτυπάς παλαμάκια στο slap της conga στον 2 και τον 6.",
      "**Δούλεψε το βασικό σιωπηλά, αργά.** Μισή ταχύτητα, μετρώντας δυνατά, χωρίς μουσική. 10 λεπτά την ημέρα μέχρι το νέο βήμα break να σταματήσει να μοιάζει σαν ξένη γλώσσα.",
      "**Χόρεψε μόνος πριν χορέψεις με παρτενέρ.** Η εργασία ζευγαριού με ασταθές νέο timing σε επαναφέρει αμέσως στην παλιά συνήθεια.",
      "**Κοινωνικά χόρεψε μόνο στο νέο στιλ στην αρχή.** Αίθουσες με μικτό timing είναι γνωσιακό χάος κατά τη μετάβαση. Βρες μια αφιερωμένη βραδιά και μείνε εκεί τον πρώτο μήνα.",
    ],
    sec6Outro:
      "Οι περισσότεροι χορευτές On1 χορεύουν κοινωνικά On2 μετά από 4-8 εβδομάδες σοβαρής εξάσκησης. Οι επαγγελματίες το κάνουν στον μισό χρόνο γιατί η συνήθεια είναι πιο καθαρή και η εξάσκηση πιο εσκεμμένη.",
    faqs: [
      { q: "Ποιο είναι ευκολότερο για έναν εντελώς αρχάριο, On1 ή On2;", a: "Salsa On1 είναι ελαφρώς ευκολότερο να το πιάσεις στις πρώτες δύο εβδομάδες γιατί η δυτική μουσική μάς εκπαιδεύει να πατάμε στον 1. Μετά τον πρώτο μήνα το χάσμα κλείνει. Οι εντελώς αρχάριοι που ξεκινούν με On2 φτάνουν σε κοινωνικό επίπεδο επάρκειας με τον ίδιο ρυθμό όπως αυτοί που ξεκινούν με On1." },
      { q: "Αν η τοπική μου σκηνή χορεύει On1, πρέπει να μάθω On2 ούτως ή άλλως;", a: "Πρακτικά, μάθε πρώτα αυτό που χορεύει η σκηνή σου. Χρειάζεσαι κάπου να εξασκηθείς κοινωνικά, και κάθε social salsa έχει ανθρώπους πρόθυμους να χορέψουν με αρχάριο. Όταν είσαι σίγουρος κοινωνικός χορευτής στο τοπικό σου στιλ, η προσθήκη του άλλου timing είναι έργο 1-2 μηνών." },
      { q: "Οι επαγγελματίες χορευτές προτιμούν On1 ή On2;", a: "Η αγωνιστική salsa στα World Salsa Championships και στις κατηγορίες Salsa Open κυριαρχείται από On2, ειδικά οι κατηγορίες New York Style και Cabaret. Οι αγώνες LA Style είναι On1. Κοινωνικά, οι περισσότεροι επαγγελματίες μπορούν να χορέψουν και τα δύο, αλλά το στιλ-σπίτι τους τείνει να είναι On2." },
      { q: "Μπορώ να χορέψω On1 και On2 στο ίδιο πάρτι;", a: "Μπορείς να αλλάζεις μεταξύ τραγουδιών, αλλά μέσα σε ένα τραγούδι δεσμεύεσαι σε ένα timing. Η αλλαγή timing στη μέση του χορού είναι ενοχλητική για τον παρτενέρ σου και τη μουσική. Οι περισσότεροι έμπειροι χορευτές προσαρμόζουν το timing τους στον παρτενέρ τους." },
      { q: "Πώς ξέρω αν ένα τραγούδι είναι 'On1' ή 'On2';", a: "Τα τραγούδια δεν γράφονται σε συγκεκριμένο timing. Οποιοδήποτε τραγούδι salsa μπορεί να χορευτεί και με τους δύο τρόπους. Παρ' όλα αυτά, οι πιο αργές, πιο απαλές ενορχηστρώσεις με προβεβλημένη conga και timbales (κλασικός Mambo Νέας Υόρκης, Eddie Palmieri, Tito Puente) νιώθουν πιο φυσικά για On2. Οι γρήγορες, μελωδικές, καλογυαλισμένες παραγωγές (κλασικό LA Style) νιώθουν πιο φυσικά για On1." },
    ],
    ctaHeading: "Δομημένο πρόγραμμα από τον χτύπο μέχρι το επίπεδο boss.",
    howToSteps: [
      { name: "Επανεκπαίδευσε το αυτί σου πριν τα πόδια σου", text: "Πέρασε μια εβδομάδα ακούγοντας μουσική salsa και χτυπώντας παλαμάκια στο slap της conga στον 2 και τον 6. Μέχρι να ακούσεις αυτόν τον παλμό, δεν μπορείς να χορέψεις On2 αξιόπιστα." },
      { name: "Δούλεψε το βασικό σιωπηλά και αργά", text: "Εξασκήσου στο νέο βήμα break σε μισή ταχύτητα, μετρώντας δυνατά, χωρίς μουσική. 10 λεπτά την ημέρα μέχρι το νέο βήμα break να σταματήσει να μοιάζει σαν ξένη γλώσσα." },
      { name: "Χόρεψε μόνος πριν χορέψεις με παρτενέρ", text: "Η εργασία ζευγαριού με ασταθές νέο timing σε επαναφέρει αμέσως στην παλιά συνήθεια. Στερέωσε πρώτα το timing μόνος." },
      { name: "Κοινωνικά χόρεψε μόνο σε βραδιές On2 στην αρχή", text: "Τον πρώτο σου μήνα κοινωνικού χορού On2, αναζήτα αφιερωμένες βραδιές On2. Το να χορεύεις σε αίθουσα On1 ενώ προσπαθείς να κρατήσεις timing On2 είναι γνωσιακό χάος. Διευκόλυνε τη μετάβαση εξαλείφοντας αυτή τη σύγκρουση." },
    ],
  },
  sr: {
    metaTitle: "Salsa On1 наспрам Salsa On2: коју треба да научиш прво?",
    metaDescription:
      "On1 ломи на 1. доби, On2 на 2. Потпуно поређење осећаја, историје, сцена и музике, плус практичан оквир за избор стила који ћеш научити прво.",
    breadcrumbHome: "Почетна",
    breadcrumbCurrent: "On1 vs On2",
    badge: "Поређење",
    h1Pre: "Salsa On1 наспрам Salsa On2: ",
    h1Accent: "коју треба да научиш прво?",
    shortAnswerRich:
      "**On1** ломи на 1. добу. LA стил, лакши улазак. **On2** ломи на 2. добу. Њујоршки стил, вернији конги, доминантан у такмичењима. **Најбољи први избор:** научи стил који доминира у твојој локалној сцени да имаш са ким да плешеш. Озбиљни играчи на дуже стазе обично науче оба, са једним као базом.",
    sec1Title: "Једина разлика која је битна",
    sec1Paragraphs: [
      "И On1 и On2 користе исту структуру од 8 доба. Оба праве шест корака на 8 доба са паузом на 4 и 8. Оба користе исти речник рада у пару, исте shines, исте окрете.",
      "Једина разлика је **на којој доби ломиш**: на којој доби мењаш правац. On1 играчи ломе унапред на 1 и уназад на 5. On2 играчи ломе уназад на 2 и унапред на 6.",
      "Тај помак од једне добе мења све остало: осећај, фразирање, музику ка којој гравитираш и клубове који се чине као дом.",
    ],
    sec2Title: "Раме уз раме",
    sec2HeadAttr: "Атрибут",
    sec2HeadOn1: "Salsa On1",
    sec2HeadOn2: "Salsa On2",
    sec2Rows: [
      { a: "Break корак", b: "Унапред на 1, уназад на 5", c: "Уназад на 2, унапред на 6" },
      { a: "Музичка синхронизација", b: "Мелодија / јака доба", c: "Slap конге тумбао" },
      { a: "Осећај", b: "Изражен, ведар, стакато", c: "Глаткији, дубље у грувy" },
      { a: "Крива учења (1-2 недеља)", b: "Бржа", c: "Мало спорија" },
      { a: "Крива учења (3+ месец)", b: "Једнака", c: "Једнака" },
      { a: "Порекло", b: "LA, 1990-е (браћа Vazquez)", c: "NYC Palladium 1950-их; кодификовао Eddie Torres у 1970-им" },
      { a: "Доминантне сцене", b: "LA, већина Латинске Америке, многе европске градове", c: "NYC, такмичарска кола, посвећене On2 вечери широм света" },
      { a: "Типична музика", b: "Брзи, мелодични, углачани аранжмани", c: "Спорији, перкусивни аранжмани са ритмиком у првом плану" },
    ],
    sec3Title: "Како се сваки осећа",
    sec3Paragraphs: [
      "Најјаснији начин да опишем разлику: On1 се осећа као плес уз *певача*. On2 се осећа као плес уз *бенд*.",
      "On1 спушта твоју промену тежине на исту добу коју мелодија тежи да нагласи. Плес је изражен и синхронизован са вокалном линијом. Стилинг хитови падају на 1, 3, 5, 7: предвидљиви, задовољавајући и лако уочљиви.",
      "On2 спушта твоју промену тежине на slap конге: 2 и 6. То поравнање са перкусионом секцијом је извор „глатког“ квалитета који људи повезују са On2. Break корак се поклапа са ритмом, не са мелодијом, што плесу даје дубљи, стрпљивији осећај.",
    ],
    sec4Title: "Где се који стил плеше?",
    sec4Intro: "Груба мапа глобалне географије салсе:",
    sec4Bullets: [
      "**Њујорк:** превасходно On2.",
      "**Лос Анђелес:** превасходно On1.",
      "**Латинска Америка:** углавном On1, иако неколико градова (нарочито Порто Рико) има јаке On2 сцене.",
      "**Европа:** мешана. Лондон, Рим, Берлин и такмичарска кола нагињу ка On2. Већина локалних сцена ван тих чворишта је претежно On1.",
      "**Такмичарска салса:** On2 доминира категоријама New York Style и Cabaret великих првенстава.",
    ],
    sec4Outro:
      "Ако си озбиљан о салси на дуже стазе, временом ћеш бити изложен оба. Већина професионалних играча може флуидно да прелази, али обично имају стил-дом.",
    sec5Title: "Оквир за одлуку",
    sec5Bullets: [
      "**Твоја локална сцена је јасно један стил.** Научи оно што твоја сцена плеше. Потребни су ти партнери за вежбу.",
      "**Твоја локална сцена је мешана.** Почни са On2 ако желиш да идеш озбиљно и такмичарски; почни са On1 ако желиш најбржи социјални улазак.",
      "**Учиш онлајн без локалне сцене.** On2 за дугу игру. Бољи учитељи, богатија педагогија, и скалира се у најпрестижније сцене широм света.",
      "**Одрастао си уз латино музику.** Свако ради, али On2 обично делује музички природно тренираним ушима јер се поклапа са перкусијом коју си већ интернализовао.",
    ],
    sec6Title: "Прелаз са On1 на On2 (или обрнуто)",
    sec6Intro:
      "Добра вест: 80% оног што си научио у једном тајмингу (рад у пару, окрети, lead-follow техника) се преноси директно. Посао је углавном тренирање ушију и поновно повезивање навике break корака.",
    sec6Steps: [
      "**Поново тренирај ухо пре стопала.** Недеља слушања салсе уз пљескање slap-а конге на 2 и 6.",
      "**Дрилуј основни тихо, споро.** Половина брзине, бројећи наглас, без музике. 10 минута дневно док нови break корак не престане да се чини као страни језик.",
      "**Плеши сам пре него што плешеш са партнером.** Рад у пару са нестабилним новим тајмингом те тренутно враћа на стару навику.",
      "**Социјално плеши само у новом стилу у почетку.** Сале са мешаним тајмингом су когнитивни хаос током прелаза. Нађи посвећено вече и остани тамо први месец.",
    ],
    sec6Outro:
      "Већина On1 играча социјално плеше On2 након 4-8 недеља озбиљне праксе. Професионалци то раде за упола времена јер је навика јаснија а вежба намерна.",
    faqs: [
      { q: "Шта је лакше за апсолутног почетника, On1 или On2?", a: "Salsa On1 је мало лакша за савладавање у прве две недеље јер нас западна музика тренира да крочимо на 1. После првог месеца јаз се затвара. Апсолутни почетници који почну са On2 достижу социјалну компетенцију истим темпом као они који почну са On1." },
      { q: "Ако моја локална сцена плеше On1, треба ли да ипак учим On2?", a: "Прагматично, прво научи оно што твоја сцена плеше. Треба ти место да социјално вежбаш, и сваки салса социјал има људе спремне да плешу са почетником. Када си сигуран социјални играч у локалном стилу, додавање другог тајминга је пројекат од 1-2 месеца." },
      { q: "Да ли професионални играчи преферирају On1 или On2?", a: "Такмичарска салса на World Salsa Championships и у категоријама Salsa Open је доминирана On2, нарочито категорије New York Style и Cabaret. LA Style такмичења су On1. Социјално, већина професионалаца може да плеше оба, али њихов стил-дом тежи ка On2." },
      { q: "Могу ли да плешем On1 и On2 на истом журу?", a: "Можеш да прелазиш између песама, али унутар једне песме се обавежеш на један тајминг. Промена тајминга усред плеса је неугодна за партнера и музику. Већина искусних играча прилагођава свој тајминг партнеру." },
      { q: "Како да знам да ли је песма 'On1' или 'On2'?", a: "Песме се не пишу у одређеном тајмингу. Свака салса песма се може плесати на оба начина. Међутим, спорији, глаткији аранжмани са истакнутом конгом и тимбалесима (класични њујоршки Mambo, Eddie Palmieri, Tito Puente) се чине природнијим за On2. Брзе, мелодичне, углачане продукције (класични LA стил) се чине природнијим за On1." },
    ],
    ctaHeading: "Структуриран програм од бита до боса.",
    howToSteps: [
      { name: "Поново тренирај ухо пре стопала", text: "Проведи недељу слушајући салса музику и пљескајући уз slap конге на 2 и 6. Док не чујеш тај пулс, не можеш поуздано плесати On2." },
      { name: "Дрилуј основни тихо и споро", text: "Вежбај нови break корак на половини брзине, бројећи наглас, без музике. 10 минута дневно док нови break корак не престане да се чини као страни језик." },
      { name: "Плеши сам пре него што плешеш са партнером", text: "Рад у пару са нестабилним новим тајмингом те тренутно враћа на стару навику. Прво учврсти тајминг сам." },
      { name: "Социјално плеши само на On2 вечерима у почетку", text: "Првог месеца социјалног плесања On2, потражи посвећене On2 вечери. Плесати у On1 сали покушавајући да задржиш On2 тајминг је когнитивни хаос. Олакшај прелаз елиминишући тај сукоб." },
    ],
  },
  tr: {
    metaTitle: "Salsa On1 vs Salsa On2: önce hangisini öğrenmelisin?",
    metaDescription:
      "On1 1. vuruşta kırılır, On2 2. vuruşta. Hissiyat, tarih, sahneler ve müziğin tam karşılaştırması, ayrıca hangi stili önce öğreneceğine karar vermek için pratik bir çerçeve.",
    breadcrumbHome: "Ana Sayfa",
    breadcrumbCurrent: "On1 vs On2",
    badge: "Karşılaştırma",
    h1Pre: "Salsa On1 vs Salsa On2: ",
    h1Accent: "önce hangisini öğrenmelisin?",
    shortAnswerRich:
      "**On1** 1. vuruşta kırılır. LA stili, daha kolay başlangıç. **On2** 2. vuruşta kırılır. New York stili, congaya daha sadık, yarışmalarda baskın. **En iyi ilk seçim:** yerel sahnende baskın olan stili öğren ki dans edecek insan bulasın. Uzun vadede ciddi dansçılar genelde ikisini de öğrenir, biri ana üs olarak.",
    sec1Title: "Tek önemli fark",
    sec1Paragraphs: [
      "Hem On1 hem On2 aynı 8'lik yapıyı kullanır. Her ikisi de 8 vuruşta altı adım atar, 4 ve 8'de ara verir. Her ikisi de aynı eş çalışması sözcük dağarcığını, aynı shines'ı, aynı dönüş kalıplarını kullanır.",
      "Tek ayrım **hangi vuruşta kırılırsın** olmasıdır: hangi vuruşta yön değiştirirsin. On1 dansçıları 1'de ileri, 5'te geri kırılır. On2 dansçıları 2'de geri, 6'da ileri kırılır.",
      "O bir vuruşluk kayma her şeyi değiştirir: hissiyatı, ifadeyi, çekildiğin müziği ve hangi kulüplerin ev gibi hissettirdiğini.",
    ],
    sec2Title: "Yan yana",
    sec2HeadAttr: "Özellik",
    sec2HeadOn1: "Salsa On1",
    sec2HeadOn2: "Salsa On2",
    sec2Rows: [
      { a: "Kırılma adımı", b: "1'de ileri, 5'te geri", c: "2'de geri, 6'da ileri" },
      { a: "Müzikal senkron", b: "Melodi / kuvvetli vuruş", c: "Conga tumbao slap'ı" },
      { a: "Hissiyat", b: "Vurgulu, parlak, staccato", c: "Daha pürüzsüz, ritmin içine daha gömülü" },
      { a: "Öğrenme eğrisi (hafta 1-2)", b: "Daha hızlı", c: "Hafifçe daha yavaş" },
      { a: "Öğrenme eğrisi (ay 3+)", b: "Eşit", c: "Eşit" },
      { a: "Köken", b: "LA, 1990'lar (Vazquez kardeşler)", c: "NYC Palladium 1950'ler; 1970'lerde Eddie Torres tarafından kodlandı" },
      { a: "Baskın sahneler", b: "LA, Latin Amerika'nın büyük kısmı, birçok Avrupa şehri", c: "NYC, yarışma çevreleri, dünya çapında özel On2 geceleri" },
      { a: "Tipik müzik", b: "Hızlı, melodik, parlatılmış düzenlemeler", c: "Daha yavaş, perküsif, ritmin önde olduğu düzenlemeler" },
    ],
    sec3Title: "Her birinin nasıl hissettirdiği",
    sec3Paragraphs: [
      "Farkı tarif etmenin en açık yolu: On1 *şarkıcıya* dans etmek gibi hissettirir. On2 *gruba* dans etmek gibi hissettirir.",
      "On1 ağırlık değişikliğini melodinin vurgu yapma eğiliminde olduğu vuruşa indirir. Dans vurgulu ve vokal hattıyla senkronize. Stylinghit'leri 1, 3, 5, 7'ye düşer: tahmin edilebilir, tatmin edici ve tespit edilmesi kolay.",
      "On2 ağırlık değişikliğini conga slap'ına indirir: 2 ve 6'ya. Perküsyon bölümüyle bu hizalanma, insanların On2 ile özdeşleştirdiği \"daha pürüzsüz\" kalitenin kaynağıdır. Kırılma adımı melodiyle değil ritimle çakışır, bu da dansa daha derin, sabırlı bir his verir.",
    ],
    sec4Title: "Hangi stil nerede dans ediliyor?",
    sec4Intro: "Küresel salsa coğrafyasının kabaca haritası:",
    sec4Bullets: [
      "**New York City:** ezici çoğunlukla On2.",
      "**Los Angeles:** ezici çoğunlukla On1.",
      "**Latin Amerika:** çoğunlukla On1, gerçi birkaç şehir (özellikle Porto Riko) güçlü On2 sahnelerine sahip.",
      "**Avrupa:** karışık. Londra, Roma, Berlin ve yarışma çevreleri On2 eğilimli. Bu merkezler dışındaki çoğu yerel sahne ağırlıklı olarak On1.",
      "**Yarışma salsası:** On2 büyük şampiyonaların New York Style ve Cabaret kategorilerine hakim.",
    ],
    sec4Outro:
      "Salsayla uzun vadede ciddi olacaksan, eninde sonunda her ikisine de maruz kalırsın. Çoğu profesyonel dansçı akıcı şekilde geçiş yapabilir, ama genelde bir ev stili olur.",
    sec5Title: "Karar çerçevesi",
    sec5Bullets: [
      "**Yerel sahnen açıkça tek bir stil.** Sahnen ne dans ediyorsa onu öğren. Pratik partnerlerine ihtiyacın var.",
      "**Yerel sahnen karışık.** Ciddi ve yarışmacı gitmek istiyorsan On2 ile başla; en hızlı sosyal başlangıcı istiyorsan On1 ile başla.",
      "**Yerel sahnesiz online öğreniyorsun.** Uzun oyun için On2. Daha iyi öğretmenler, daha zengin pedagoji ve dünyanın en prestijli sahnelerine ölçeklenir.",
      "**Latin müziğiyle büyüdün.** İkisi de işe yarar, ama On2 eğitilmiş kulaklara müzikal olarak daha doğal hissettirme eğilimindedir çünkü zaten içselleştirdiğin perküsyonla eşleşir.",
    ],
    sec6Title: "On1'den On2'ye (veya tersi) geçiş",
    sec6Intro:
      "İyi haber: bir timing'de öğrendiklerinin %80'i (eş çalışması, dönüş kalıpları, lider-takipçi tekniği) doğrudan aktarılır. Asıl iş kulak eğitimi ve kırılma adımı alışkanlığını yeniden bağlamaktır.",
    sec6Steps: [
      "**Ayaklarından önce kulağını yeniden eğit.** Bir hafta salsa dinlerken conga slap'ına 2 ve 6'da alkışlamak.",
      "**Temeli sessizce, yavaş çalış.** Yarım hızda, sesli sayarak, müziksiz. Yeni kırılma adımı yabancı bir dil gibi hissetmeyi bırakana kadar günde 10 dakika.",
      "**Eşle dans etmeden önce yalnız dans et.** Dengesiz yeni timing'le eş çalışması seni anında eski alışkanlığa geri gönderir.",
      "**Sosyal olarak başlangıçta sadece yeni stilde dans et.** Karışık timing'li salonlar geçiş sırasında bilişsel kaostur. Özel bir gece bul ve ilk ay orada kal.",
    ],
    sec6Outro:
      "Çoğu On1 dansçısı 4-8 hafta ciddi pratikten sonra sosyal olarak On2'de dans eder. Profesyoneller bunu yarısında yapar çünkü alışkanlık daha net ve drilling kasıtlıdır.",
    faqs: [
      { q: "Mutlak başlangıç seviyesindeki biri için hangisi daha kolay, On1 mı On2 mi?", a: "Salsa On1 ilk iki haftada biraz daha kolay öğrenilir çünkü Batı müziği bizi 1'de adım atmaya alıştırır. İlk aydan sonra fark kapanır. On2 ile başlayan mutlak başlangıç seviyesindekiler, On1 ile başlayanlarla aynı oranda sosyal seviyeye ulaşırlar." },
      { q: "Yerel sahnem On1 dans ediyorsa, yine de On2 öğrenmeli miyim?", a: "Pragmatik olarak, önce sahnenin ne dans ettiğini öğren. Sosyal pratik için bir yere ihtiyacın var ve her salsa sosyalinde başlangıç seviyesindeki biriyle dans etmeye istekli insanlar var. Yerel stilinde kendine güvenen sosyal bir dansçı olunca, diğer timing'i eklemek 1-2 aylık bir projedir." },
      { q: "Profesyonel dansçılar On1'i mi On2'yi mi tercih eder?", a: "World Salsa Championships ve Salsa Open kategorilerindeki yarışma salsasına On2 hakimdir, özellikle New York Style ve Cabaret kategorileri. LA Style yarışmaları On1'dir. Sosyal olarak çoğu profesyonel ikisini de dans edebilir, ama ev stilleri On2'ye eğilimlidir." },
      { q: "Aynı partide On1 ve On2 dans edebilir miyim?", a: "Şarkılar arasında geçiş yapabilirsin, ama bir şarkı içinde tek bir timing'e bağlanırsın. Dans ortasında timing değiştirmek partnerin ve müzik için sarsıcıdır. Çoğu deneyimli dansçı timing'ini partnerine göre ayarlar." },
      { q: "Bir şarkının 'On1' mi 'On2' mi olduğunu nasıl bilirim?", a: "Şarkılar belirli bir timing'de yazılmaz. Herhangi bir salsa şarkısı her iki şekilde de dans edilebilir. Bununla birlikte, conga ve timbales'in öne çıktığı daha yavaş, daha yumuşak düzenlemeler (klasik New York Mambo, Eddie Palmieri, Tito Puente) On2 için daha doğal hissettirir. Hızlı, melodik, parlatılmış prodüksiyonlar (klasik LA stili) On1 için daha doğal hissettirir." },
    ],
    ctaHeading: "Beat'ten boss-seviyesine yapılandırılmış bir müfredat.",
    howToSteps: [
      { name: "Ayaklarından önce kulağını yeniden eğit", text: "Bir hafta boyunca salsa müziği dinleyerek conga slap'ına 2 ve 6'da alkışla. O nabzı duyana kadar On2'yi güvenilir şekilde dans edemezsin." },
      { name: "Temeli sessizce ve yavaş çalış", text: "Yeni kırılma adımını yarım hızda, sesli sayarak, müziksiz çalış. Yeni kırılma adımı yabancı bir dil gibi hissetmeyi bırakana kadar günde 10 dakika." },
      { name: "Eşle dans etmeden önce yalnız dans et", text: "Dengesiz yeni timing'le eş çalışması seni anında eski alışkanlığa geri gönderir. Önce solo olarak timing'i sağlamlaştır." },
      { name: "Sosyal olarak başlangıçta sadece On2 DJ gecelerine git", text: "On2'yi sosyal olarak dans ettiğin ilk ay, özel On2 gecelerini ara. On2 timing'ini tutmaya çalışırken On1 salonunda dans etmek bilişsel kaostur. Bu çatışmayı ortadan kaldırarak geçişi kolaylaştır." },
    ],
  },
};

// Backfill placeholder locales with the English content so type checks pass
// — this preserves type safety; readyLocales gates which locales actually
// get a localised URL variant.
for (const k of Object.keys(CONTENT) as Locale[]) {
  if (!CONTENT[k].metaTitle) CONTENT[k] = CONTENT.en;
}

export function getOn1VsOn2Content(locale: Locale): On1VsOn2Content {
  return CONTENT[locale] ?? CONTENT.en;
}

export const ALL_ON1VSON2_CONTENT = CONTENT;
