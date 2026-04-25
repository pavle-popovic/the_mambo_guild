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
  ja: {} as On1VsOn2Content,
  ko: {} as On1VsOn2Content,
  zh: {} as On1VsOn2Content,
  ru: {} as On1VsOn2Content,
  pl: {} as On1VsOn2Content,
  nl: {} as On1VsOn2Content,
  ar: {} as On1VsOn2Content,
  el: {} as On1VsOn2Content,
  sr: {} as On1VsOn2Content,
  tr: {} as On1VsOn2Content,
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
