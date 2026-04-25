/**
 * /blog/the-85-percent-rule article content per locale. Hand-authored.
 *
 * Rich-text markers (parsed in _Body.tsx):
 *   **bold**   -> gold inline emphasis
 *   *italic*   -> em (used for journal/book titles, foreign words)
 *
 * Note: this article's byline credential is article-specific
 * ("Certified in Learning Experience Design"), not the shared
 * "2x European Salsa Champion" line — so it's stored on the content
 * blob and the _Body uses content.bylineCredential instead of
 * shared.bylineCredential.
 */
import type { Locale } from "@/i18n/config";

export type Faq = { q: string; a: string };
export type HowToStep = { name: string; text: string };

export type EightyFiveContent = {
  metaTitle: string;
  metaDescription: string;

  breadcrumbHome: string;
  breadcrumbBlog: string;
  breadcrumbCurrent: string;

  badge: string;
  h1Pre: string;
  h1Accent: string;

  /** Article-specific byline credential — overrides the shared one. */
  bylineCredential: string;

  /** Rich; **bold** and *italic* allowed. */
  shortAnswerRich: string;

  sec1Title: string;
  sec1Paragraphs: string[];

  sec2Title: string;
  sec2Paragraphs: string[];

  sec3Title: string;
  sec3Paragraphs: string[];

  sec4Title: string;
  sec4Steps: string[]; // each starts with **Bold lead.** body

  sec5Title: string;
  sec5Paragraphs: string[];

  sec6Title: string;
  sec6Paragraphs: string[];

  sec7Title: string; // "Sources"
  sec7Sources: string[]; // *italic* allowed for titles

  faqs: Faq[];

  ctaEyebrow: string;
  ctaHeading: string;
  ctaBody: string;

  howToName: string;
  howToDescription: string;
  howToSteps: HowToStep[];
};

const CONTENT: Record<Locale, EightyFiveContent> = {
  // ============================================================ EN
  en: {
    metaTitle: "The 85% Rule: How Your Brain Actually Learns to Dance",
    metaDescription:
      "A 2019 Nature paper found the mathematically optimal error rate for learning is 15.87%. Here is what that means for salsa practice, how to calibrate your drills, and why 'clean' practice stalls progress.",

    breadcrumbHome: "Home",
    breadcrumbBlog: "Blog",
    breadcrumbCurrent: "The 85% Rule",

    badge: "Training Science",
    h1Pre: "The 85% Rule: ",
    h1Accent: "How Your Brain Actually Learns to Dance",

    bylineCredential: "Certified in Learning Experience Design",

    shortAnswerRich:
      "A 2019 paper in *Nature Human Behaviour* by Wilson, Shenhav, Steine-Hanson, and Cohen found the mathematically optimal error rate for skill acquisition is exactly **15.87% failure**, or about 85% success. Higher than that, your brain cannot lock onto a clear pattern. Lower than that, your brain files the skill as \"done\" and stops upgrading it. This is the math behind why clean practice stalls progress and why slightly-too-hard drills are the fastest path to improvement.",

    sec1Title: "The study",
    sec1Paragraphs: [
      "In 2019, Robert Wilson and colleagues at the University of Arizona published *\"The Eighty Five Percent Rule for Optimal Learning\"* in *Nature Human Behaviour*. They asked a precise question: if you could set the difficulty dial on a practice session to any number, what would the dial be set to in order to learn as fast as mathematically possible?",
      "The answer comes out of the shape of a standard learning curve: an S-shaped sigmoid. The curve rises slowly when the skill is new, rises fastest in the middle, and plateaus at the top when the skill is mastered. Wilson asked: at which point on the curve is the slope (the rate of improvement per rep) steepest?",
      "That point, derived from the math, is **15.87% failure**. Not 10%. Not 25%. 15.87%. It is a specific number that falls out of a specific curve, not a rough guess someone proposed.",
    ],

    sec2Title: "Why your brain works this way",
    sec2Paragraphs: [
      "Movement learning is an error-correction loop. You try something, your body does a version of it, and your brain compares what you *meant* to do against what *actually happened*. The mismatch generates a signal in the cerebellum (the region at the back of your brain that fine-tunes movement), and that signal is what tells your motor cortex to update.",
      "If every rep lands perfectly, there is no mismatch. No signal. Your brain decides the move is handled and re-routes attention to whatever is still broken. That is why clean practice feels productive but produces diminishing returns: you are rehearsing what you already know instead of training what is still forming.",
      "If too many reps fail, the signal is noisy. Your brain cannot distinguish a real pattern from random error. Researchers call this **frustrated learning**: you are working hard but the brain has nothing stable to update toward.",
      "The 15% failure zone is where the signal is clean. Your brain knows approximately what went wrong, has a stable reference for what going right looks like, and can make a small update per rep.",
    ],

    sec3Title: "Desirable difficulty (Bjork)",
    sec3Paragraphs: [
      "The 85% rule has a behavioural sibling: Robert Bjork's concept of **desirable difficulty**. Bjork spent decades showing that practice conditions which feel *harder in the moment* (spacing reps out, interleaving different skills, reducing feedback) produce better *long-term* retention. Massed practice of a single skill with constant feedback feels better while you are doing it and produces noticeably worse retention a week later.",
      "The practical implication for dance: if your practice session feels effortless and seamless, you are probably not learning much. If it feels slightly above your current level (uncomfortable, a little chaotic, lots of honest misses), you are probably learning at close to the maximum rate your brain allows.",
    ],

    sec4Title: "How to apply the 85% rule to salsa practice",
    sec4Steps: [
      "**Pick one isolated skill.** Do not drill \"salsa.\" Drill a specific thing: a spin prep, a cross-body lead on a specific count, a shine sequence at a specific tempo. You need a binary hit/miss criterion to measure a rate.",
      "**Run 10 reps and score them honestly.** Define in advance what counts as a hit. Then count. 9 or 10 hits means the drill is too easy. 5 or fewer means it is too hard.",
      "**Adjust the difficulty dial.** Too easy: bump the BPM up 10%, add an arm styling layer, run it on the non-dominant side, add a partner, or remove mirror feedback. Too hard: simplify until you stabilize at 8-9 hits of 10.",
      "**Stay in the 80-90% band.** Once you find the band, stay there for 15-20 sustained minutes. That is the zone where your cerebellum is producing clean error signals and your motor cortex is updating the movement representation rep by rep.",
    ],

    sec5Title: "Why 'clean' practice feels good but teaches less",
    sec5Paragraphs: [
      "If you have ever finished a 60-minute practice session where every rep felt smooth and walked out thinking \"that was great,\" you probably taught yourself less than you would have in 20 minutes of messy drilling at the edge of your ability.",
      "The brain does not reward exertion. It rewards prediction error, and specifically, a manageable amount of it. An hour of rehearsing what you already know keeps the dance safely inside your comfort zone and generates almost no update signal. Twenty minutes of drilling at 85% success, where you are missing two out of every ten reps and honestly feeling those misses, is where the neurology of learning actually operates.",
      "This is not an argument for punishing yourself. It is an argument for *calibration*. Your practice should feel honestly difficult, not crushing. 15% failure, not 50%.",
    ],

    sec6Title: "What this looks like in a structured curriculum",
    sec6Paragraphs: [
      "The Mambo Guild curriculum is built around this principle. Every lesson gates to the next at an explicit mastery criterion. Every drill has a difficulty slider. The Skill Tree only unlocks a new branch once you can execute the current branch consistently, not flawlessly, but consistently. The whole point is to keep you in the 85% band without having to measure your own hit rate with a clipboard.",
      "The alternative (taking random classes, drilling whatever the teacher happened to cover this week) almost always puts you either too low (bored, repeating what you know) or too high (lost, learning nothing). Both failure modes are visible in the plateaus self-taught salsa dancers hit around six to nine months of casual learning.",
    ],

    sec7Title: "Sources",
    sec7Sources: [
      "Wilson, R.C., Shenhav, A., Steine-Hanson, M., & Cohen, J.D. (2019). *The Eighty Five Percent Rule for Optimal Learning*. Nature Human Behaviour, 3, 1316-1323.",
      "Bjork, R.A. (1994). Memory and Metamemory Considerations in the Training of Human Beings. In J. Metcalfe & A. Shimamura (Eds.), *Metacognition*. MIT Press.",
      "Schmidt, R.A., & Lee, T.D. (2011). *Motor Learning and Performance: From Principles to Application* (5th ed.). Human Kinetics.",
    ],

    faqs: [
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
    ],

    ctaEyebrow: "Practice smarter",
    ctaHeading: "A curriculum calibrated to the 85% zone.",
    ctaBody:
      "Every drill, lesson, and skill tree branch in the Mambo Guild is tuned to keep you at the difficulty band where learning actually happens. Built on learning-science principles by a certified Learning Experience Designer.",

    howToName: "How to apply the 85% rule in a salsa practice session",
    howToDescription:
      "A 4-step protocol for calibrating drill difficulty to the mathematically optimal 15.87% error rate.",
    howToSteps: [
      {
        name: "Pick one isolated skill per session",
        text: "Do not drill 'salsa.' Drill one specific thing: a spin technique, a cross-body lead timing, a shine. A single success/failure definition is required to measure a hit rate.",
      },
      {
        name: "Run 10 reps and score each one honestly",
        text: "Decide before you start what counts as a hit vs a miss. After 10 reps, count your hits. If you land 9 or 10, the drill is too easy. If you land 5 or fewer, it is too hard.",
      },
      {
        name: "Adjust the difficulty dial",
        text: "Too easy: increase the tempo 10%, add an arm styling layer, add a partner, add a non-dominant-side version, or remove visual feedback. Too hard: simplify until you stabilize at 8 hits out of 10.",
      },
      {
        name: "Stay in the 80-90% band for 20 minutes",
        text: "Once you are landing 8-9 of 10 reps, stay there for sustained practice. That is the zone where your cerebellum gets clear error signals and your motor cortex keeps updating.",
      },
    ],
  },

  // ============================================================ ES
  es: {
    metaTitle: "La regla del 85 %: cómo aprende a bailar tu cerebro de verdad",
    metaDescription:
      "Un artículo de Nature de 2019 encontró que la tasa de error matemáticamente óptima para aprender es del 15,87 %. Esto es lo que significa para la práctica de salsa, cómo calibrar tus drills y por qué la práctica \"limpia\" estanca el progreso.",

    breadcrumbHome: "Inicio",
    breadcrumbBlog: "Blog",
    breadcrumbCurrent: "La regla del 85 %",

    badge: "Ciencia del entrenamiento",
    h1Pre: "La regla del 85 %: ",
    h1Accent: "cómo aprende a bailar tu cerebro de verdad",

    bylineCredential: "Certificado en Diseño de Experiencias de Aprendizaje",

    shortAnswerRich:
      "Un artículo de 2019 en *Nature Human Behaviour* de Wilson, Shenhav, Steine-Hanson y Cohen encontró que la tasa de error matemáticamente óptima para adquirir una habilidad es exactamente **15,87 % de fallo**, es decir, en torno al 85 % de aciertos. Por encima de eso, el cerebro no puede engancharse a un patrón claro. Por debajo, el cerebro archiva la habilidad como \"hecha\" y deja de mejorarla. Estas son las matemáticas detrás de por qué la práctica limpia estanca el progreso y por qué los drills ligeramente demasiado difíciles son el camino más rápido para mejorar.",

    sec1Title: "El estudio",
    sec1Paragraphs: [
      "En 2019, Robert Wilson y sus colegas de la Universidad de Arizona publicaron *\"The Eighty Five Percent Rule for Optimal Learning\"* en *Nature Human Behaviour*. Hicieron una pregunta precisa: si pudieras poner el dial de dificultad de una sesión de práctica en cualquier número, ¿en qué número estaría puesto para aprender lo más rápido posible matemáticamente?",
      "La respuesta sale de la forma de una curva de aprendizaje estándar: una sigmoide en S. La curva sube despacio cuando la habilidad es nueva, sube más rápido en el medio y se aplana arriba cuando la habilidad está dominada. Wilson preguntó: ¿en qué punto de la curva la pendiente (el ritmo de mejora por repetición) es más empinada?",
      "Ese punto, derivado de las matemáticas, es **15,87 % de fallo**. No 10 %. No 25 %. 15,87 %. Es un número específico que sale de una curva específica, no una conjetura aproximada que alguien propuso.",
    ],

    sec2Title: "Por qué tu cerebro funciona así",
    sec2Paragraphs: [
      "El aprendizaje motor es un bucle de corrección de errores. Intentas algo, tu cuerpo hace una versión de ello y tu cerebro compara lo que *querías* hacer con lo que *realmente pasó*. La discrepancia genera una señal en el cerebelo (la región en la parte trasera de tu cerebro que ajusta finamente el movimiento), y esa señal es la que le dice a tu corteza motora que se actualice.",
      "Si cada repetición sale perfecta, no hay discrepancia. No hay señal. Tu cerebro decide que el movimiento está resuelto y redirige la atención a lo que aún está mal. Por eso la práctica limpia se siente productiva pero da rendimientos decrecientes: estás repasando lo que ya sabes en lugar de entrenar lo que todavía se está formando.",
      "Si fallan demasiadas repeticiones, la señal es ruidosa. Tu cerebro no puede distinguir un patrón real de un error aleatorio. Los investigadores llaman a esto **aprendizaje frustrado**: estás esforzándote, pero el cerebro no tiene nada estable hacia lo cual actualizarse.",
      "La zona del 15 % de fallo es donde la señal está limpia. Tu cerebro sabe aproximadamente qué salió mal, tiene una referencia estable de cómo se ve hacerlo bien, y puede hacer una pequeña actualización por repetición.",
    ],

    sec3Title: "Dificultad deseable (Bjork)",
    sec3Paragraphs: [
      "La regla del 85 % tiene un hermano conductual: el concepto de **dificultad deseable** de Robert Bjork. Bjork pasó décadas mostrando que las condiciones de práctica que se sienten *más difíciles en el momento* (espaciar las repeticiones, alternar habilidades distintas, reducir el feedback) producen mejor *retención a largo plazo*. La práctica masiva de una sola habilidad con feedback constante se siente mejor mientras la haces y produce una retención notablemente peor una semana después.",
      "La implicación práctica para el baile: si tu sesión de práctica se siente sin esfuerzo y sin fricción, probablemente no estás aprendiendo mucho. Si se siente ligeramente por encima de tu nivel actual (incómoda, un poco caótica, muchos fallos honestos), probablemente estás aprendiendo casi al ritmo máximo que tu cerebro permite.",
    ],

    sec4Title: "Cómo aplicar la regla del 85 % a la práctica de salsa",
    sec4Steps: [
      "**Elige una sola habilidad aislada.** No practiques \"salsa\". Practica algo concreto: una preparación de giro, un cross-body lead en un conteo específico, una secuencia de shines a un tempo concreto. Necesitas un criterio binario acierto/fallo para medir una tasa.",
      "**Haz 10 repeticiones y puntúalas con honestidad.** Define de antemano qué cuenta como acierto. Luego cuenta. 9 o 10 aciertos significa que el drill es demasiado fácil. 5 o menos significa que es demasiado difícil.",
      "**Ajusta el dial de dificultad.** Demasiado fácil: sube los BPM un 10 %, añade una capa de estilo de brazos, hazlo en el lado no dominante, añade pareja o quita el feedback del espejo. Demasiado difícil: simplifica hasta estabilizar 8-9 aciertos sobre 10.",
      "**Quédate en la franja del 80-90 %.** Una vez que encuentres la franja, quédate ahí 15-20 minutos sostenidos. Esa es la zona donde tu cerebelo produce señales de error limpias y tu corteza motora actualiza la representación del movimiento repetición a repetición.",
    ],

    sec5Title: "Por qué la práctica \"limpia\" se siente bien pero enseña menos",
    sec5Paragraphs: [
      "Si alguna vez has terminado una sesión de práctica de 60 minutos en la que cada repetición se sintió suave y has salido pensando \"ha estado genial\", probablemente te enseñaste menos de lo que te habrías enseñado en 20 minutos de drilling sucio al borde de tu capacidad.",
      "El cerebro no premia el esfuerzo. Premia el error de predicción y, específicamente, una cantidad manejable de él. Una hora repasando lo que ya sabes mantiene el baile a salvo dentro de tu zona de confort y genera casi ninguna señal de actualización. Veinte minutos drilleando al 85 % de aciertos, donde fallas dos de cada diez repeticiones y sientes esos fallos honestamente, es donde opera de verdad la neurología del aprendizaje.",
      "Esto no es un argumento para castigarte. Es un argumento para *calibrar*. Tu práctica debería sentirse honestamente difícil, no aplastante. 15 % de fallo, no 50 %.",
    ],

    sec6Title: "Cómo se ve esto en un plan de estudios estructurado",
    sec6Paragraphs: [
      "El plan de estudios de The Mambo Guild está construido en torno a este principio. Cada lección abre paso a la siguiente con un criterio explícito de dominio. Cada drill tiene un slider de dificultad. El Árbol de Habilidades sólo desbloquea una nueva rama cuando puedes ejecutar la rama actual de forma consistente, no impecable, sino consistente. La idea es mantenerte en la franja del 85 % sin tener que medir tu propia tasa de aciertos con un portapapeles.",
      "La alternativa (tomar clases al azar, practicar lo que el profesor haya cubierto esa semana) casi siempre te coloca o demasiado bajo (aburrido, repitiendo lo que ya sabes) o demasiado alto (perdido, sin aprender nada). Ambos modos de fallo se ven en los estancamientos a los que llegan los bailarines autodidactas de salsa entre los seis y los nueve meses de aprendizaje casual.",
    ],

    sec7Title: "Fuentes",
    sec7Sources: [
      "Wilson, R.C., Shenhav, A., Steine-Hanson, M. & Cohen, J.D. (2019). *The Eighty Five Percent Rule for Optimal Learning*. Nature Human Behaviour, 3, 1316-1323.",
      "Bjork, R.A. (1994). Memory and Metamemory Considerations in the Training of Human Beings. En J. Metcalfe y A. Shimamura (Eds.), *Metacognition*. MIT Press.",
      "Schmidt, R.A. & Lee, T.D. (2011). *Motor Learning and Performance: From Principles to Application* (5.ª ed.). Human Kinetics.",
    ],

    faqs: [
      {
        q: "¿Qué es la regla del 85 % en términos sencillos?",
        a: "Un artículo de 2019 en Nature Human Behaviour mostró que el cerebro humano aprende habilidades nuevas más rápido cuando la dificultad de la práctica está calibrada para acertar alrededor del 85 % de las veces y fallar alrededor del 15 %. El óptimo exacto es 15,87 % de fallo. Practicar con tasas de fallo mucho más altas o mucho más bajas ralentiza el aprendizaje.",
      },
      {
        q: "¿De dónde sale el número 15,87 %?",
        a: "Se deriva matemáticamente de la forma de una curva de aprendizaje estándar (una sigmoide). La pendiente de la curva, lo rápido que mejoras por repetición, es máxima en un punto concreto, y ese punto corresponde a una tasa de fallo del 15,87 %. No es una conjetura empírica; sale directamente de las matemáticas.",
      },
      {
        q: "¿Se aplica la regla del 85 % a todas las habilidades, incluyendo el baile?",
        a: "El artículo de Wilson et al. trataba sobre el aprendizaje en modelos de redes neuronales y tareas de clasificación binaria, pero se generaliza con fuerza a cualquier habilidad que implique que tu cerebro produzca una salida motora y se actualice en función del feedback. El baile es aprendizaje motor de manual.",
      },
      {
        q: "¿Y si quiero ejecutar una coreografía limpia, sin ningún error?",
        a: "Práctica y actuación son modos distintos. Deberías entrenar al 85 % de aciertos y actuar al 100 %. La zona del 15 % de fallo es donde ocurre el aprendizaje; la zona del 100 % es donde verificas que el aprendizaje es estable.",
      },
      {
        q: "¿Cómo encaja la \"dificultad deseable\"?",
        a: "La investigación de Robert Bjork sobre dificultades deseables muestra que las condiciones de práctica que hacen que aprender se sienta más difícil en el momento (repaso espaciado, alternancia, menos feedback) producen mejor retención a largo plazo. Es la hermana conductual de la regla del 85 %: la lucha manejable supera a la repetición sin esfuerzo para todo lo que quieras conservar.",
      },
    ],

    ctaEyebrow: "Practica más inteligente",
    ctaHeading: "Un plan de estudios calibrado a la zona del 85 %.",
    ctaBody:
      "Cada drill, lección y rama del Árbol de Habilidades en The Mambo Guild está afinado para mantenerte en la franja de dificultad donde realmente ocurre el aprendizaje. Construido sobre principios de la ciencia del aprendizaje por un Diseñador de Experiencias de Aprendizaje certificado.",

    howToName: "Cómo aplicar la regla del 85 % en una sesión de práctica de salsa",
    howToDescription:
      "Un protocolo de 4 pasos para calibrar la dificultad del drill a la tasa de error matemáticamente óptima del 15,87 %.",
    howToSteps: [
      {
        name: "Elige una sola habilidad aislada por sesión",
        text: "No practiques 'salsa'. Practica una cosa concreta: una técnica de giro, el timing de un cross-body lead, una shine. Necesitas una sola definición de éxito/fallo para medir una tasa de aciertos.",
      },
      {
        name: "Haz 10 repeticiones y puntúa cada una con honestidad",
        text: "Decide antes de empezar qué cuenta como acierto y qué como fallo. Tras 10 repeticiones, cuenta tus aciertos. Si aciertas 9 o 10, el drill es demasiado fácil. Si aciertas 5 o menos, es demasiado difícil.",
      },
      {
        name: "Ajusta el dial de dificultad",
        text: "Demasiado fácil: sube el tempo un 10 %, añade una capa de estilo de brazos, mete pareja, prueba la versión del lado no dominante o quita el feedback visual. Demasiado difícil: simplifica hasta estabilizar 8 aciertos sobre 10.",
      },
      {
        name: "Quédate en la franja del 80-90 % durante 20 minutos",
        text: "Una vez que aciertas 8-9 de 10 repeticiones, quédate ahí para una práctica sostenida. Esa es la zona donde tu cerebelo recibe señales de error claras y tu corteza motora sigue actualizándose.",
      },
    ],
  },
  // ============================================================ PT
  pt: {
    metaTitle: "A regra dos 85 %: como o teu cérebro aprende a dançar de verdade",
    metaDescription:
      "Um artigo de 2019 na Nature mostrou que a taxa de erro matematicamente ótima para aprender é de 15,87 %. Aqui está o que isso significa para a prática de salsa, como calibrar os teus drills e porque a prática \"limpa\" estagna o progresso.",

    breadcrumbHome: "Início",
    breadcrumbBlog: "Blog",
    breadcrumbCurrent: "A regra dos 85 %",

    badge: "Ciência do treino",
    h1Pre: "A regra dos 85 %: ",
    h1Accent: "como o teu cérebro aprende a dançar de verdade",

    bylineCredential: "Certificado em Design de Experiências de Aprendizagem",

    shortAnswerRich:
      "Um artigo de 2019 na *Nature Human Behaviour*, de Wilson, Shenhav, Steine-Hanson e Cohen, mostrou que a taxa de erro matematicamente ótima para adquirir uma habilidade é exatamente **15,87 % de falha**, ou seja, cerca de 85 % de acerto. Acima disso, o cérebro não consegue agarrar-se a um padrão claro. Abaixo disso, o cérebro arquiva a habilidade como \"feita\" e deixa de a melhorar. É esta a matemática por detrás da razão pela qual a prática limpa estagna o progresso e os drills ligeiramente difíceis demais são o caminho mais rápido para evoluir.",

    sec1Title: "O estudo",
    sec1Paragraphs: [
      "Em 2019, Robert Wilson e colegas da Universidade do Arizona publicaram *\"The Eighty Five Percent Rule for Optimal Learning\"* na *Nature Human Behaviour*. Fizeram uma pergunta precisa: se pudesses pôr o botão da dificuldade de uma sessão de prática em qualquer número, em que número estaria para aprender o mais rápido matematicamente possível?",
      "A resposta sai da forma de uma curva de aprendizagem padrão: uma sigmoide em S. A curva sobe devagar quando a habilidade é nova, sobe mais depressa no meio e estabiliza no topo quando a habilidade é dominada. Wilson perguntou: em que ponto da curva é mais inclinada a tangente (o ritmo de melhoria por repetição)?",
      "Esse ponto, derivado matematicamente, é **15,87 % de falha**. Não 10 %. Não 25 %. 15,87 %. É um número específico que sai de uma curva específica, não um palpite aproximado proposto por alguém.",
    ],

    sec2Title: "Porque é que o teu cérebro funciona assim",
    sec2Paragraphs: [
      "A aprendizagem motora é um ciclo de correção de erro. Tentas algo, o teu corpo executa uma versão disso, e o teu cérebro compara o que *querias* fazer com o que *realmente aconteceu*. A discrepância gera um sinal no cerebelo (a região na parte de trás do cérebro que afina o movimento), e é esse sinal que diz ao teu córtex motor para se atualizar.",
      "Se cada repetição saísse perfeita, não haveria discrepância. Sem sinal. O teu cérebro decide que o movimento está resolvido e redireciona a atenção para o que ainda está partido. Por isso é que a prática limpa parece produtiva mas dá retornos decrescentes: estás a repetir o que já sabes em vez de treinar o que ainda se está a formar.",
      "Se demasiadas repetições falharem, o sinal fica ruidoso. O teu cérebro não consegue distinguir um padrão real de erro aleatório. Os investigadores chamam a isto **aprendizagem frustrada**: estás a esforçar-te, mas o cérebro não tem nada estável para o qual se atualizar.",
      "A zona dos 15 % de falha é onde o sinal está limpo. O teu cérebro sabe aproximadamente o que correu mal, tem uma referência estável de como é fazer bem, e consegue fazer uma pequena atualização por repetição.",
    ],

    sec3Title: "Dificuldade desejável (Bjork)",
    sec3Paragraphs: [
      "A regra dos 85 % tem uma irmã comportamental: o conceito de **dificuldade desejável** de Robert Bjork. Bjork passou décadas a mostrar que condições de prática que parecem *mais difíceis no momento* (espaçar repetições, intercalar habilidades diferentes, reduzir feedback) produzem melhor retenção *a longo prazo*. A prática maciça de uma única habilidade com feedback constante parece melhor enquanto a fazes e produz uma retenção visivelmente pior uma semana depois.",
      "A implicação prática para a dança: se a tua sessão de prática parece sem esforço e sem fricção, provavelmente não estás a aprender muito. Se parece ligeiramente acima do teu nível atual (desconfortável, um pouco caótica, com bastantes falhas honestas), provavelmente estás a aprender perto do ritmo máximo que o teu cérebro permite.",
    ],

    sec4Title: "Como aplicar a regra dos 85 % à prática de salsa",
    sec4Steps: [
      "**Escolhe uma única habilidade isolada.** Não trabalhes \"salsa\". Trabalha uma coisa concreta: uma preparação de pirueta, um cross-body lead num tempo específico, uma sequência de shines a um BPM específico. Precisas de um critério binário acerto/falha para medir uma taxa.",
      "**Faz 10 repetições e pontua-as com honestidade.** Define antecipadamente o que conta como acerto. Depois conta. 9 ou 10 acertos significa que o drill é fácil demais. 5 ou menos significa que é difícil demais.",
      "**Ajusta o botão da dificuldade.** Fácil demais: aumenta os BPM em 10 %, acrescenta uma camada de estilo de braços, faz do lado não dominante, mete par ou retira o feedback do espelho. Difícil demais: simplifica até estabilizares em 8-9 acertos em 10.",
      "**Fica na faixa dos 80-90 %.** Assim que encontrares a faixa, fica lá durante 15-20 minutos sustentados. Essa é a zona onde o teu cerebelo produz sinais de erro limpos e o teu córtex motor atualiza a representação do movimento repetição a repetição.",
    ],

    sec5Title: "Porque é que a prática \"limpa\" sabe bem mas ensina menos",
    sec5Paragraphs: [
      "Se já alguma vez terminaste uma sessão de 60 minutos em que cada repetição soou suave e saíste a pensar \"foi ótimo\", provavelmente ensinaste-te menos do que terias ensinado em 20 minutos de drilling sujo no limite das tuas capacidades.",
      "O cérebro não recompensa o esforço. Recompensa o erro de previsão e, mais especificamente, uma quantidade administrável dele. Uma hora a repetir o que já sabes mantém a dança bem dentro da tua zona de conforto e gera quase nenhum sinal de atualização. Vinte minutos de drill a 85 % de acerto, em que falhas duas em cada dez repetições e sentes essas falhas honestamente, é onde a neurologia da aprendizagem realmente opera.",
      "Isto não é um argumento para te castigares. É um argumento para *calibrares*. A tua prática deve sentir-se honestamente difícil, não esmagadora. 15 % de falha, não 50 %.",
    ],

    sec6Title: "Como é que isto se vê num currículo estruturado",
    sec6Paragraphs: [
      "O currículo da The Mambo Guild está construído à volta deste princípio. Cada lição abre passagem para a seguinte com um critério explícito de domínio. Cada drill tem um slider de dificuldade. A Árvore de Habilidades só desbloqueia um novo ramo quando consegues executar o ramo atual de forma consistente, não impecável, mas consistente. A ideia é manter-te na faixa dos 85 % sem teres de medir a tua própria taxa de acerto com um bloco de notas.",
      "A alternativa (apanhar aulas aleatórias, treinar o que o professor calhou cobrir nessa semana) quase sempre te coloca ou demasiado em baixo (entediado, a repetir o que já sabes) ou demasiado em cima (perdido, a não aprender nada). Ambos os modos de falha são visíveis nos planaltos a que os bailarinos de salsa autodidatas chegam aos seis a nove meses de aprendizagem casual.",
    ],

    sec7Title: "Fontes",
    sec7Sources: [
      "Wilson, R.C., Shenhav, A., Steine-Hanson, M. & Cohen, J.D. (2019). *The Eighty Five Percent Rule for Optimal Learning*. Nature Human Behaviour, 3, 1316-1323.",
      "Bjork, R.A. (1994). Memory and Metamemory Considerations in the Training of Human Beings. Em J. Metcalfe e A. Shimamura (Eds.), *Metacognition*. MIT Press.",
      "Schmidt, R.A. & Lee, T.D. (2011). *Motor Learning and Performance: From Principles to Application* (5.ª ed.). Human Kinetics.",
    ],

    faqs: [
      {
        q: "O que é a regra dos 85 % em termos simples?",
        a: "Um artigo de 2019 na Nature Human Behaviour mostrou que o cérebro humano aprende habilidades novas mais depressa quando a dificuldade da prática está calibrada para acertares cerca de 85 % das vezes e falhares cerca de 15 %. O ótimo exato é 15,87 % de falha. Praticar a taxas de falha muito mais altas ou mais baixas atrasa a aprendizagem.",
      },
      {
        q: "De onde vem o número 15,87 %?",
        a: "É derivado matematicamente da forma de uma curva de aprendizagem padrão (uma sigmoide). O declive da curva, a velocidade a que melhoras por repetição, é máximo num ponto específico, e esse ponto corresponde a uma taxa de falha de 15,87 %. Não é um palpite empírico; sai diretamente da matemática.",
      },
      {
        q: "A regra dos 85 % aplica-se a todas as habilidades, incluindo a dança?",
        a: "O artigo de Wilson et al. era sobre aprendizagem em modelos de redes neuronais e tarefas de classificação binária, mas generaliza-se fortemente a qualquer habilidade em que o teu cérebro produz uma saída motora e se atualiza com base em feedback. A dança é aprendizagem motora de manual.",
      },
      {
        q: "E se eu quiser fazer uma coreografia limpa, sem qualquer erro?",
        a: "Prática e atuação são modos diferentes. Deves treinar a 85 % de acerto e atuar a 100 %. A zona dos 15 % de falha é onde acontece a aprendizagem; a zona dos 100 % é onde verificas que a aprendizagem está estável.",
      },
      {
        q: "Como é que a \"dificuldade desejável\" se encaixa nisto?",
        a: "A investigação de Robert Bjork sobre dificuldades desejáveis mostra que condições de prática que tornam a aprendizagem mais difícil no momento (repetição espaçada, intercalação, feedback reduzido) produzem melhor retenção a longo prazo. É a irmã comportamental da regra dos 85 %: a luta administrável bate a repetição sem esforço para tudo o que queiras manter.",
      },
    ],

    ctaEyebrow: "Treina mais inteligente",
    ctaHeading: "Um currículo calibrado para a zona dos 85 %.",
    ctaBody:
      "Cada drill, aula e ramo da Árvore de Habilidades na The Mambo Guild está afinado para te manter na faixa de dificuldade onde a aprendizagem realmente acontece. Construído com princípios da ciência da aprendizagem por um Designer de Experiências de Aprendizagem certificado.",

    howToName: "Como aplicar a regra dos 85 % numa sessão de prática de salsa",
    howToDescription:
      "Um protocolo de 4 passos para calibrar a dificuldade do drill à taxa de erro matematicamente ótima de 15,87 %.",
    howToSteps: [
      {
        name: "Escolhe uma única habilidade isolada por sessão",
        text: "Não treines 'salsa'. Treina uma coisa concreta: uma técnica de pirueta, o timing de um cross-body lead, um shine. Precisas de uma única definição de sucesso/falha para medir uma taxa de acerto.",
      },
      {
        name: "Faz 10 repetições e pontua cada uma com honestidade",
        text: "Decide antes de começar o que conta como acerto e o que conta como falha. Após 10 repetições, conta os teus acertos. Se acertares 9 ou 10, o drill é fácil demais. Se acertares 5 ou menos, é difícil demais.",
      },
      {
        name: "Ajusta o botão da dificuldade",
        text: "Fácil demais: aumenta o tempo em 10 %, acrescenta uma camada de estilo de braços, mete par, prova a versão do lado não dominante ou retira o feedback visual. Difícil demais: simplifica até estabilizares em 8 acertos em 10.",
      },
      {
        name: "Fica na faixa dos 80-90 % durante 20 minutos",
        text: "Assim que estiveres a acertar 8-9 em 10 repetições, fica aí para uma prática sustentada. Essa é a zona onde o teu cerebelo recebe sinais de erro claros e o teu córtex motor continua a atualizar-se.",
      },
    ],
  },
  // ============================================================ FR
  fr: {
    metaTitle: "La règle des 85 % : comment ton cerveau apprend vraiment à danser",
    metaDescription:
      "Un article de 2019 dans Nature a montré que le taux d'erreur mathématiquement optimal pour apprendre est de 15,87 %. Voici ce que cela signifie pour la pratique de la salsa, comment calibrer tes drills, et pourquoi la pratique \"propre\" stagne la progression.",

    breadcrumbHome: "Accueil",
    breadcrumbBlog: "Blog",
    breadcrumbCurrent: "La règle des 85 %",

    badge: "Science de l'entraînement",
    h1Pre: "La règle des 85 % : ",
    h1Accent: "comment ton cerveau apprend vraiment à danser",

    bylineCredential: "Certifié en Conception d'Expériences d'Apprentissage",

    shortAnswerRich:
      "Un article de 2019 dans *Nature Human Behaviour*, par Wilson, Shenhav, Steine-Hanson et Cohen, a établi que le taux d'erreur mathématiquement optimal pour acquérir une compétence est exactement **15,87 % d'échec**, soit environ 85 % de réussite. Au-dessus, ton cerveau ne peut pas se verrouiller sur un schéma clair. En dessous, ton cerveau classe la compétence comme « réglée » et arrête de l'améliorer. C'est la mathématique derrière le fait que la pratique propre stagne la progression et que des drills légèrement trop difficiles sont le chemin le plus rapide vers le progrès.",

    sec1Title: "L'étude",
    sec1Paragraphs: [
      "En 2019, Robert Wilson et ses collègues de l'Université de l'Arizona ont publié *« The Eighty Five Percent Rule for Optimal Learning »* dans *Nature Human Behaviour*. Ils ont posé une question précise : si tu pouvais régler le bouton de difficulté d'une séance de pratique sur n'importe quel chiffre, sur quel chiffre faudrait-il le mettre pour apprendre aussi vite que mathématiquement possible ?",
      "La réponse sort de la forme d'une courbe d'apprentissage standard : une sigmoïde en S. La courbe monte lentement quand la compétence est nouvelle, monte le plus vite au milieu, et plafonne en haut quand la compétence est maîtrisée. Wilson a demandé : à quel point de la courbe la pente (le rythme d'amélioration par répétition) est-elle la plus raide ?",
      "Ce point, dérivé des mathématiques, est de **15,87 % d'échec**. Pas 10 %. Pas 25 %. 15,87 %. C'est un nombre précis qui sort d'une courbe précise, pas une supposition approximative.",
    ],

    sec2Title: "Pourquoi ton cerveau fonctionne ainsi",
    sec2Paragraphs: [
      "L'apprentissage moteur est une boucle de correction d'erreur. Tu essaies quelque chose, ton corps en fait une version, et ton cerveau compare ce que tu *voulais* faire à ce qui *s'est réellement passé*. L'écart génère un signal dans le cervelet (la région à l'arrière du cerveau qui règle finement le mouvement), et c'est ce signal qui dit à ton cortex moteur de se mettre à jour.",
      "Si chaque répétition est parfaite, il n'y a pas d'écart. Pas de signal. Ton cerveau décide que le mouvement est réglé et redirige l'attention vers ce qui est encore cassé. C'est pour ça que la pratique propre semble productive mais donne des rendements décroissants : tu répètes ce que tu sais déjà au lieu d'entraîner ce qui se forme encore.",
      "Si trop de répétitions échouent, le signal devient bruité. Ton cerveau ne distingue plus un vrai schéma d'une erreur aléatoire. Les chercheurs appellent ça **l'apprentissage frustré** : tu travailles dur, mais le cerveau n'a rien de stable vers quoi se mettre à jour.",
      "La zone des 15 % d'échec est celle où le signal est propre. Ton cerveau sait à peu près ce qui a mal tourné, dispose d'une référence stable de ce à quoi ressemble la réussite, et peut faire une petite mise à jour par répétition.",
    ],

    sec3Title: "Difficulté désirable (Bjork)",
    sec3Paragraphs: [
      "La règle des 85 % a une sœur comportementale : le concept de **difficulté désirable** de Robert Bjork. Bjork a passé des décennies à montrer que les conditions de pratique qui semblent *plus difficiles sur le moment* (espacement des répétitions, alternance entre compétences, feedback réduit) produisent une meilleure rétention *à long terme*. Pratiquer en bloc une seule compétence avec un feedback constant donne une meilleure sensation pendant la séance et une rétention nettement moins bonne une semaine plus tard.",
      "L'implication pratique pour la danse : si ta séance se déroule sans effort et sans accroc, tu n'apprends sans doute pas grand-chose. Si elle te paraît légèrement au-dessus de ton niveau (inconfortable, un peu chaotique, beaucoup de ratés honnêtes), tu apprends sans doute proche du rythme maximal que ton cerveau autorise.",
    ],

    sec4Title: "Comment appliquer la règle des 85 % à la pratique de la salsa",
    sec4Steps: [
      "**Choisis une seule compétence isolée.** Ne « pratique » pas la salsa. Pratique une chose précise : une préparation de tour, un cross-body lead sur un compte précis, une séquence de shines à un BPM précis. Il te faut un critère binaire réussi/raté pour mesurer un taux.",
      "**Fais 10 répétitions et note-les honnêtement.** Définis à l'avance ce qui compte comme une réussite. Puis compte. 9 ou 10 réussites veut dire que le drill est trop facile. 5 ou moins veut dire qu'il est trop difficile.",
      "**Règle le bouton de difficulté.** Trop facile : augmente le BPM de 10 %, ajoute une couche de styling des bras, fais-le côté non dominant, ajoute un partenaire ou retire le retour visuel du miroir. Trop difficile : simplifie jusqu'à stabiliser à 8-9 réussites sur 10.",
      "**Reste dans la bande des 80-90 %.** Une fois la bande trouvée, reste-y 15-20 minutes en continu. C'est la zone où ton cervelet produit des signaux d'erreur propres et où ton cortex moteur met à jour la représentation du mouvement répétition après répétition.",
    ],

    sec5Title: "Pourquoi la pratique « propre » fait du bien mais enseigne moins",
    sec5Paragraphs: [
      "Si tu as déjà terminé une séance de 60 minutes où chaque répétition semblait fluide en pensant « c'était top », tu t'es probablement moins enseigné qu'en 20 minutes de drilling sale au bord de tes capacités.",
      "Le cerveau ne récompense pas l'effort. Il récompense l'erreur de prédiction, et plus précisément une dose gérable. Une heure à répéter ce que tu sais déjà laisse la danse à l'abri dans ta zone de confort et ne génère presque aucun signal de mise à jour. Vingt minutes de drill à 85 % de réussite, où tu rates deux répétitions sur dix et où tu sens honnêtement ces ratés, c'est là que la neurologie de l'apprentissage opère réellement.",
      "Ce n'est pas un argument pour te punir. C'est un argument pour *calibrer*. Ta pratique doit te paraître honnêtement difficile, pas écrasante. 15 % d'échec, pas 50 %.",
    ],

    sec6Title: "À quoi cela ressemble dans un cursus structuré",
    sec6Paragraphs: [
      "Le cursus de The Mambo Guild est construit autour de ce principe. Chaque leçon ouvre l'accès à la suivante selon un critère explicite de maîtrise. Chaque drill a un curseur de difficulté. L'Arbre des Compétences ne déverrouille une nouvelle branche que lorsque tu sais exécuter la branche actuelle de manière constante — pas parfaite, mais constante. Tout l'objectif est de te garder dans la bande des 85 % sans que tu aies à mesurer ton propre taux de réussite avec une fiche.",
      "L'alternative (prendre des cours au hasard, drillerce que le prof a abordé cette semaine) te place presque toujours soit trop bas (tu t'ennuies, tu répètes ce que tu sais déjà), soit trop haut (tu es perdu, tu n'apprends rien). Les deux modes d'échec se voient dans les plateaux que les danseurs autodidactes de salsa atteignent autour de six à neuf mois d'apprentissage informel.",
    ],

    sec7Title: "Sources",
    sec7Sources: [
      "Wilson, R.C., Shenhav, A., Steine-Hanson, M. & Cohen, J.D. (2019). *The Eighty Five Percent Rule for Optimal Learning*. Nature Human Behaviour, 3, 1316-1323.",
      "Bjork, R.A. (1994). Memory and Metamemory Considerations in the Training of Human Beings. Dans J. Metcalfe et A. Shimamura (Éds.), *Metacognition*. MIT Press.",
      "Schmidt, R.A. & Lee, T.D. (2011). *Motor Learning and Performance: From Principles to Application* (5e éd.). Human Kinetics.",
    ],

    faqs: [
      {
        q: "Qu'est-ce que la règle des 85 % en termes simples ?",
        a: "Un article de 2019 dans Nature Human Behaviour a montré que le cerveau humain apprend de nouvelles compétences plus vite quand la difficulté de la pratique est calibrée pour réussir environ 85 % du temps et rater environ 15 %. L'optimum exact est 15,87 % d'échec. Pratiquer à des taux d'échec beaucoup plus élevés ou plus bas ralentit l'apprentissage.",
      },
      {
        q: "D'où vient le chiffre 15,87 % ?",
        a: "Il est dérivé mathématiquement de la forme d'une courbe d'apprentissage standard (une sigmoïde). La pente de la courbe — la vitesse à laquelle tu progresses par répétition — est maximale en un point précis, et ce point correspond à un taux d'échec de 15,87 %. Ce n'est pas une supposition empirique ; ça sort directement des maths.",
      },
      {
        q: "La règle des 85 % s'applique-t-elle à toutes les compétences, y compris la danse ?",
        a: "L'article de Wilson et al. portait sur l'apprentissage dans des modèles de réseaux de neurones et des tâches de classification binaire, mais il se généralise fortement à toute compétence où ton cerveau produit une sortie motrice et se met à jour sur la base d'un feedback. La danse, c'est de l'apprentissage moteur de manuel.",
      },
      {
        q: "Et si je veux exécuter une chorégraphie proprement, sans aucune erreur ?",
        a: "Pratique et performance sont deux modes différents. Tu dois driller à 85 % de réussite et performer à 100 %. La zone des 15 % d'échec, c'est là où l'apprentissage se fait ; la zone des 100 %, c'est là où tu vérifies que l'apprentissage est stable.",
      },
      {
        q: "Comment la « difficulté désirable » s'inscrit-elle là-dedans ?",
        a: "Les recherches de Robert Bjork sur les difficultés désirables montrent que les conditions de pratique qui rendent l'apprentissage plus difficile sur le moment (répétition espacée, entrelacement, feedback réduit) produisent une meilleure rétention à long terme. C'est la sœur comportementale de la règle des 85 % : une lutte gérable bat la répétition sans effort pour tout ce que tu veux conserver.",
      },
    ],

    ctaEyebrow: "Pratique plus intelligemment",
    ctaHeading: "Un cursus calibré sur la zone des 85 %.",
    ctaBody:
      "Chaque drill, leçon et branche de l'Arbre des Compétences dans The Mambo Guild est calé pour te garder dans la bande de difficulté où l'apprentissage se passe vraiment. Bâti sur les principes des sciences de l'apprentissage par un Concepteur d'Expériences d'Apprentissage certifié.",

    howToName: "Comment appliquer la règle des 85 % dans une séance de salsa",
    howToDescription:
      "Un protocole en 4 étapes pour calibrer la difficulté du drill au taux d'erreur mathématiquement optimal de 15,87 %.",
    howToSteps: [
      {
        name: "Choisis une seule compétence isolée par séance",
        text: "Ne « pratique » pas la salsa. Pratique une chose précise : une technique de tour, le timing d'un cross-body lead, un shine. Il faut une seule définition de réussite/échec pour mesurer un taux de réussite.",
      },
      {
        name: "Fais 10 répétitions et note honnêtement chacune",
        text: "Décide avant de commencer ce qui compte comme une réussite et ce qui compte comme un raté. Après 10 répétitions, compte tes réussites. Si tu en mets 9 ou 10, le drill est trop facile. Si tu n'en mets que 5 ou moins, il est trop difficile.",
      },
      {
        name: "Règle le bouton de difficulté",
        text: "Trop facile : monte le tempo de 10 %, ajoute une couche de styling des bras, ajoute un partenaire, fais le côté non dominant ou retire le retour visuel. Trop difficile : simplifie jusqu'à stabiliser à 8 réussites sur 10.",
      },
      {
        name: "Reste dans la bande des 80-90 % pendant 20 minutes",
        text: "Une fois que tu mets 8-9 répétitions sur 10, reste-là pour une pratique soutenue. C'est la zone où ton cervelet reçoit des signaux d'erreur clairs et où ton cortex moteur continue à se mettre à jour.",
      },
    ],
  },
  // ============================================================ DE
  de: {
    metaTitle: "Die 85-Prozent-Regel: wie dein Gehirn wirklich tanzen lernt",
    metaDescription:
      "Eine Nature-Studie von 2019 fand heraus, dass die mathematisch optimale Fehlerrate für Lernen bei 15,87 % liegt. Was das für die Salsa-Praxis bedeutet, wie du deine Drills kalibrierst und warum „saubere\" Übung den Fortschritt blockiert.",

    breadcrumbHome: "Start",
    breadcrumbBlog: "Blog",
    breadcrumbCurrent: "Die 85-%-Regel",

    badge: "Trainingswissenschaft",
    h1Pre: "Die 85-Prozent-Regel: ",
    h1Accent: "wie dein Gehirn wirklich tanzen lernt",

    bylineCredential: "Zertifiziert in Learning Experience Design",

    shortAnswerRich:
      "Eine Studie von Wilson, Shenhav, Steine-Hanson und Cohen aus dem Jahr 2019 in *Nature Human Behaviour* zeigte, dass die mathematisch optimale Fehlerrate beim Erwerb einer Fertigkeit genau **15,87 % Fehler** beträgt — also rund 85 % Erfolg. Darüber kann sich dein Gehirn auf kein klares Muster verriegeln. Darunter legt dein Gehirn die Fertigkeit als „erledigt\" ab und verbessert sie nicht weiter. Das ist die Mathematik dahinter, warum saubere Übung den Fortschritt blockiert und warum leicht zu schwere Drills der schnellste Weg zum Lernen sind.",

    sec1Title: "Die Studie",
    sec1Paragraphs: [
      "2019 veröffentlichten Robert Wilson und Kollegen an der University of Arizona *„The Eighty Five Percent Rule for Optimal Learning\"* in *Nature Human Behaviour*. Sie stellten eine präzise Frage: Wenn man den Schwierigkeitsregler einer Übungseinheit auf eine beliebige Zahl stellen könnte, auf welcher Zahl müsste er stehen, um mathematisch so schnell wie möglich zu lernen?",
      "Die Antwort folgt aus der Form einer Standard-Lernkurve: einer S-förmigen Sigmoide. Die Kurve steigt langsam, wenn die Fertigkeit neu ist, am schnellsten in der Mitte und flacht oben ab, wenn die Fertigkeit beherrscht wird. Wilson fragte: An welcher Stelle der Kurve ist die Steigung (die Verbesserungsrate pro Wiederholung) am steilsten?",
      "Dieser Punkt, mathematisch hergeleitet, liegt bei **15,87 % Fehler**. Nicht bei 10 %. Nicht bei 25 %. Bei 15,87 %. Das ist eine konkrete Zahl, die aus einer konkreten Kurve fällt — keine grobe Schätzung von irgendwem.",
    ],

    sec2Title: "Warum dein Gehirn so funktioniert",
    sec2Paragraphs: [
      "Bewegungslernen ist eine Fehlerkorrekturschleife. Du versuchst etwas, dein Körper macht eine Version davon, und dein Gehirn vergleicht, was du *tun wolltest*, mit dem, *was tatsächlich passiert ist*. Die Diskrepanz erzeugt ein Signal im Kleinhirn (jenem Bereich am hinteren Teil deines Gehirns, der Bewegung feinabstimmt), und dieses Signal sagt deinem motorischen Kortex, dass er sich aktualisieren soll.",
      "Wenn jede Wiederholung perfekt sitzt, gibt es keine Diskrepanz. Kein Signal. Dein Gehirn entscheidet, dass die Bewegung erledigt ist, und richtet die Aufmerksamkeit auf das, was noch nicht stimmt. Genau deshalb fühlt sich saubere Übung produktiv an, bringt aber abnehmende Erträge: Du wiederholst, was du schon kannst, statt das zu trainieren, was sich noch bildet.",
      "Wenn zu viele Wiederholungen scheitern, wird das Signal verrauscht. Dein Gehirn kann ein echtes Muster nicht von zufälligem Fehler unterscheiden. Forscher nennen das **frustriertes Lernen**: Du arbeitest hart, aber dem Gehirn fehlt etwas Stabiles, worauf es sich aktualisieren könnte.",
      "Die 15-%-Fehlerzone ist die, in der das Signal sauber ist. Dein Gehirn weiß ungefähr, was schiefgegangen ist, hat eine stabile Referenz für „richtig\" und kann pro Wiederholung eine kleine Aktualisierung vornehmen.",
    ],

    sec3Title: "Wünschenswerte Schwierigkeit (Bjork)",
    sec3Paragraphs: [
      "Die 85-%-Regel hat eine verhaltenswissenschaftliche Schwester: Robert Bjorks Konzept der **wünschenswerten Schwierigkeit** (desirable difficulty). Bjork hat über Jahrzehnte gezeigt, dass Übungsbedingungen, die sich *im Moment schwerer anfühlen* (Wiederholungen verteilen, verschiedene Fertigkeiten verschränken, Feedback reduzieren), eine bessere *Langzeitretention* liefern. Geballte Übung einer einzigen Fertigkeit mit ständigem Feedback fühlt sich währenddessen besser an und führt eine Woche später zu spürbar schlechterer Retention.",
      "Praktische Implikation für Tanz: Wenn deine Übungseinheit mühelos und reibungslos wirkt, lernst du wahrscheinlich nicht viel. Wenn sie sich leicht oberhalb deines aktuellen Niveaus anfühlt (unangenehm, etwas chaotisch, viele ehrliche Fehler), lernst du vermutlich nahe der maximalen Rate, die dein Gehirn zulässt.",
    ],

    sec4Title: "Wie du die 85-%-Regel auf Salsa-Training anwendest",
    sec4Steps: [
      "**Wähle eine isolierte Fertigkeit.** Übe nicht „Salsa\". Übe etwas Konkretes: eine Drehvorbereitung, einen Cross-Body-Lead auf einen bestimmten Count, eine Shine-Sequenz bei einem bestimmten Tempo. Du brauchst ein binäres Treffer/Verfehlt-Kriterium, um eine Quote zu messen.",
      "**Mach 10 Wiederholungen und bewerte ehrlich.** Lege vorher fest, was als Treffer zählt. Dann zähle. 9 oder 10 Treffer heißt: zu leicht. 5 oder weniger heißt: zu schwer.",
      "**Stelle den Schwierigkeitsregler nach.** Zu leicht: BPM um 10 % erhöhen, Arm-Styling-Schicht hinzufügen, auf der nicht-dominanten Seite üben, Partner einbeziehen oder Spiegel-Feedback wegnehmen. Zu schwer: vereinfache, bis du bei 8-9 von 10 Treffern stabilisiert bist.",
      "**Bleibe im 80-90-%-Band.** Wenn du das Band gefunden hast, bleibe 15-20 zusammenhängende Minuten dort. Das ist die Zone, in der dein Kleinhirn saubere Fehlersignale liefert und dein motorischer Kortex die Bewegungsrepräsentation Wiederholung für Wiederholung aktualisiert.",
    ],

    sec5Title: "Warum „saubere\" Übung sich gut anfühlt, aber weniger lehrt",
    sec5Paragraphs: [
      "Wenn du je eine 60-Minuten-Übung beendet hast, in der jede Wiederholung glatt war, und mit dem Gefühl rausgegangen bist „das war super\", hast du dir wahrscheinlich weniger beigebracht als in 20 Minuten unsauberer Drills am Rand deiner Fähigkeiten.",
      "Das Gehirn belohnt nicht Anstrengung. Es belohnt Vorhersagefehler — und zwar in handhabbarer Menge. Eine Stunde, in der du repetierst, was du schon kannst, hält den Tanz sicher in deiner Komfortzone und erzeugt fast kein Update-Signal. Zwanzig Minuten Drill bei 85 % Erfolg, in denen du zwei von zehn Wiederholungen verfehlst und diese Verfehlungen ehrlich spürst, sind die Stelle, an der die Neurologie des Lernens tatsächlich operiert.",
      "Das ist kein Argument fürs Selbstkasteien. Es ist ein Argument für *Kalibrierung*. Deine Übung soll sich ehrlich schwierig anfühlen, nicht erdrückend. 15 % Fehler, nicht 50 %.",
    ],

    sec6Title: "Wie das in einem strukturierten Lehrplan aussieht",
    sec6Paragraphs: [
      "Der Lehrplan von The Mambo Guild ist um dieses Prinzip herum gebaut. Jede Lektion öffnet die nächste an einem expliziten Beherrschungskriterium. Jeder Drill hat einen Schwierigkeitsregler. Der Skill-Tree schaltet einen neuen Ast erst frei, wenn du den aktuellen Ast konsistent — nicht fehlerlos, aber konsistent — ausführen kannst. Der Sinn ist, dich im 85-%-Band zu halten, ohne dass du deine Trefferquote selbst mit Zettel und Stift mitschreiben musst.",
      "Die Alternative (zufällige Kurse besuchen, das drillen, was die Lehrkraft diese Woche zufällig behandelt hat) setzt dich fast immer entweder zu tief (gelangweilt, du wiederholst, was du kannst) oder zu hoch (verloren, du lernst nichts). Beide Ausfallmodi sieht man in den Plateaus, an denen autodidaktische Salsa-Tänzer nach sechs bis neun Monaten lockeren Lernens hängenbleiben.",
    ],

    sec7Title: "Quellen",
    sec7Sources: [
      "Wilson, R.C., Shenhav, A., Steine-Hanson, M. & Cohen, J.D. (2019). *The Eighty Five Percent Rule for Optimal Learning*. Nature Human Behaviour, 3, 1316-1323.",
      "Bjork, R.A. (1994). Memory and Metamemory Considerations in the Training of Human Beings. In J. Metcalfe & A. Shimamura (Hrsg.), *Metacognition*. MIT Press.",
      "Schmidt, R.A. & Lee, T.D. (2011). *Motor Learning and Performance: From Principles to Application* (5. Aufl.). Human Kinetics.",
    ],

    faqs: [
      {
        q: "Was ist die 85-%-Regel in einfachen Worten?",
        a: "Eine Studie von 2019 in Nature Human Behaviour zeigte, dass das menschliche Gehirn neue Fertigkeiten am schnellsten lernt, wenn die Übungsschwierigkeit so kalibriert ist, dass du etwa zu 85 % Erfolg hast und zu etwa 15 % scheiterst. Das exakte Optimum liegt bei 15,87 % Fehler. Üben mit deutlich höheren oder niedrigeren Fehlerraten verlangsamt das Lernen.",
      },
      {
        q: "Woher kommt die Zahl 15,87 %?",
        a: "Sie ergibt sich mathematisch aus der Form einer Standard-Lernkurve (einer Sigmoide). Die Steigung der Kurve — wie schnell du pro Wiederholung besser wirst — ist an einem bestimmten Punkt am größten, und dieser Punkt entspricht einer Fehlerrate von 15,87 %. Es ist keine empirische Schätzung, sondern fällt aus der Mathematik heraus.",
      },
      {
        q: "Gilt die 85-%-Regel für alle Fertigkeiten, einschließlich Tanz?",
        a: "Wilson et al. ging es im Paper um Lernen in neuronalen Netzwerkmodellen und binäre Klassifikationsaufgaben, doch die Aussage verallgemeinert sich stark auf jede Fertigkeit, bei der das Gehirn eine motorische Ausgabe produziert und sich anhand von Feedback aktualisiert. Tanz ist Lehrbuchfall für motorisches Lernen.",
      },
      {
        q: "Was, wenn ich eine Choreographie sauber ohne Fehler aufführen will?",
        a: "Üben und Auftreten sind zwei Modi. Du solltest auf 85 % Erfolg drillen und auf 100 % auftreten. Die 15-%-Fehlerzone ist, wo das Lernen passiert; die 100-%-Zone ist, wo du verifizierst, dass das Gelernte stabil ist.",
      },
      {
        q: "Wie passt die „wünschenswerte Schwierigkeit\" hierzu?",
        a: "Robert Bjorks Forschung zu wünschenswerten Schwierigkeiten zeigt, dass Übungsbedingungen, die das Lernen im Moment schwerer wirken lassen — verteilte Wiederholungen, Verschränkung, reduziertes Feedback —, eine bessere Langzeitretention erzeugen. Sie ist die verhaltenswissenschaftliche Schwester der 85-%-Regel: handhabbarer Kampf schlägt mühelose Wiederholung für alles, was du behalten willst.",
      },
    ],

    ctaEyebrow: "Klüger üben",
    ctaHeading: "Ein Lehrplan, kalibriert auf die 85-%-Zone.",
    ctaBody:
      "Jeder Drill, jede Lektion und jeder Skill-Tree-Ast in The Mambo Guild ist so abgestimmt, dass du im Schwierigkeitsbereich bleibst, in dem Lernen wirklich passiert. Aufgebaut auf lernwissenschaftlichen Prinzipien von einem zertifizierten Learning Experience Designer.",

    howToName: "Wie du die 85-%-Regel in einer Salsa-Übungseinheit anwendest",
    howToDescription:
      "Ein 4-Schritte-Protokoll, um die Drill-Schwierigkeit auf die mathematisch optimale Fehlerrate von 15,87 % zu kalibrieren.",
    howToSteps: [
      {
        name: "Wähle pro Einheit eine isolierte Fertigkeit",
        text: "Übe nicht 'Salsa'. Übe eine konkrete Sache: eine Drehtechnik, das Timing eines Cross-Body-Leads, einen Shine. Eine eindeutige Treffer/Verfehlt-Definition ist nötig, um eine Trefferquote messen zu können.",
      },
      {
        name: "Mach 10 Wiederholungen und bewerte jede ehrlich",
        text: "Lege vorher fest, was als Treffer und was als Fehler zählt. Nach 10 Wiederholungen zählst du deine Treffer. Wenn du 9 oder 10 triffst, ist der Drill zu leicht. Wenn du nur 5 oder weniger triffst, ist er zu schwer.",
      },
      {
        name: "Stelle den Schwierigkeitsregler nach",
        text: "Zu leicht: Tempo um 10 % anheben, Arm-Styling-Schicht hinzufügen, Partner einbinden, nicht-dominante Seite trainieren oder visuelles Feedback weglassen. Zu schwer: vereinfache, bis du bei 8 von 10 Treffern stabil bist.",
      },
      {
        name: "Bleibe 20 Minuten im 80-90-%-Band",
        text: "Sobald du 8-9 von 10 Wiederholungen schaffst, bleibe für eine längere Übung dort. Das ist die Zone, in der dein Kleinhirn klare Fehlersignale bekommt und dein motorischer Kortex weiter aktualisiert.",
      },
    ],
  },
  // ============================================================ IT
  it: {
    metaTitle: "La regola dell'85 %: come il tuo cervello impara davvero a ballare",
    metaDescription:
      "Un articolo del 2019 su Nature ha trovato che il tasso di errore matematicamente ottimale per imparare è del 15,87 %. Cosa significa per la pratica della salsa, come calibrare i tuoi drill, e perché la pratica \"pulita\" blocca i progressi.",

    breadcrumbHome: "Home",
    breadcrumbBlog: "Blog",
    breadcrumbCurrent: "La regola dell'85 %",

    badge: "Scienza dell'allenamento",
    h1Pre: "La regola dell'85 %: ",
    h1Accent: "come il tuo cervello impara davvero a ballare",

    bylineCredential: "Certificato in Learning Experience Design",

    shortAnswerRich:
      "Un articolo del 2019 su *Nature Human Behaviour* di Wilson, Shenhav, Steine-Hanson e Cohen ha trovato che il tasso di errore matematicamente ottimale per acquisire un'abilità è esattamente il **15,87 % di insuccesso**, ovvero circa l'85 % di successo. Sopra a quella soglia, il cervello non riesce ad agganciarsi a uno schema chiaro. Sotto, il cervello archivia l'abilità come \"fatta\" e smette di migliorarla. È la matematica dietro al fatto che la pratica pulita stagna i progressi e che i drill leggermente troppo difficili sono la via più rapida per migliorare.",

    sec1Title: "Lo studio",
    sec1Paragraphs: [
      "Nel 2019 Robert Wilson e colleghi dell'Università dell'Arizona hanno pubblicato *\"The Eighty Five Percent Rule for Optimal Learning\"* su *Nature Human Behaviour*. Hanno fatto una domanda precisa: se potessi mettere la manopola della difficoltà di una sessione di pratica su un numero qualsiasi, su quale numero andrebbe messa per imparare il più velocemente possibile dal punto di vista matematico?",
      "La risposta esce dalla forma di una curva di apprendimento standard: una sigmoide a S. La curva sale lentamente quando l'abilità è nuova, sale più velocemente al centro e si appiattisce in alto quando l'abilità è padroneggiata. Wilson ha chiesto: in che punto della curva la pendenza (il ritmo di miglioramento per ripetizione) è più ripida?",
      "Quel punto, derivato dalla matematica, è il **15,87 % di fallimento**. Non il 10 %. Non il 25 %. 15,87 %. È un numero specifico che cade da una curva specifica, non un'ipotesi grezza proposta da qualcuno.",
    ],

    sec2Title: "Perché il tuo cervello funziona così",
    sec2Paragraphs: [
      "L'apprendimento motorio è un ciclo di correzione dell'errore. Provi qualcosa, il tuo corpo ne fa una versione e il tuo cervello confronta ciò che *intendevi* fare con ciò che *è effettivamente successo*. Lo scarto genera un segnale nel cervelletto (la regione nella parte posteriore del cervello che mette a punto il movimento), e quel segnale è ciò che dice alla corteccia motoria di aggiornarsi.",
      "Se ogni ripetizione esce perfetta, non c'è scarto. Niente segnale. Il cervello decide che il movimento è gestito e ridirige l'attenzione su ciò che è ancora rotto. È per questo che la pratica pulita sembra produttiva ma dà rendimenti decrescenti: stai ripassando ciò che già sai invece di allenare ciò che si sta ancora formando.",
      "Se troppe ripetizioni falliscono, il segnale diventa rumoroso. Il cervello non riesce a distinguere uno schema reale dall'errore casuale. I ricercatori chiamano questo **apprendimento frustrato**: stai lavorando duro, ma il cervello non ha nulla di stabile verso cui aggiornarsi.",
      "La zona del 15 % di errore è quella in cui il segnale è pulito. Il tuo cervello sa più o meno cosa è andato storto, ha un riferimento stabile di come appare farlo bene e può fare un piccolo aggiornamento per ripetizione.",
    ],

    sec3Title: "Difficoltà desiderabile (Bjork)",
    sec3Paragraphs: [
      "La regola dell'85 % ha una sorella comportamentale: il concetto di **difficoltà desiderabile** di Robert Bjork. Bjork ha passato decenni a mostrare che le condizioni di pratica che sembrano *più difficili sul momento* (distanziare le ripetizioni, alternare abilità diverse, ridurre il feedback) producono una migliore *ritenzione a lungo termine*. La pratica massiccia di una singola abilità con feedback costante ti dà una sensazione migliore mentre la fai e produce una ritenzione visibilmente peggiore una settimana dopo.",
      "Implicazione pratica per il ballo: se la tua sessione di pratica sembra senza sforzo e senza attriti, probabilmente non stai imparando granché. Se sembra leggermente sopra il tuo livello attuale (scomoda, un po' caotica, con tante mancanze oneste), probabilmente stai imparando vicino al ritmo massimo che il cervello consente.",
    ],

    sec4Title: "Come applicare la regola dell'85 % alla pratica di salsa",
    sec4Steps: [
      "**Scegli una sola abilità isolata.** Non praticare \"la salsa\". Pratica una cosa specifica: una preparazione di giro, un cross-body lead su un conteggio specifico, una sequenza di shine a un BPM specifico. Ti serve un criterio binario riuscito/fallito per misurare un tasso.",
      "**Fai 10 ripetizioni e valutale onestamente.** Definisci in anticipo cosa conta come riuscita. Poi conta. 9 o 10 successi vuol dire che il drill è troppo facile. 5 o meno vuol dire troppo difficile.",
      "**Regola la manopola della difficoltà.** Troppo facile: alza i BPM del 10 %, aggiungi un livello di styling delle braccia, fallo dal lato non dominante, aggiungi un partner o togli il feedback dello specchio. Troppo difficile: semplifica finché non ti stabilizzi a 8-9 successi su 10.",
      "**Resta nella fascia 80-90 %.** Una volta trovata la fascia, restaci 15-20 minuti continuativi. È la zona in cui il tuo cervelletto produce segnali di errore puliti e la corteccia motoria aggiorna la rappresentazione del movimento ripetizione dopo ripetizione.",
    ],

    sec5Title: "Perché la pratica \"pulita\" sembra bella ma insegna meno",
    sec5Paragraphs: [
      "Se hai mai finito una sessione di 60 minuti in cui ogni ripetizione sembrava liscia e sei uscito pensando \"è andata grandiosa\", probabilmente ti sei insegnato meno di quanto avresti fatto in 20 minuti di drill sporco al limite delle tue capacità.",
      "Il cervello non premia lo sforzo. Premia l'errore di previsione, e in particolare una quantità gestibile. Un'ora a ripassare ciò che già sai tiene il ballo al sicuro nella tua zona di comfort e genera quasi nessun segnale di aggiornamento. Venti minuti di drill all'85 % di successo, in cui sbagli due ripetizioni su dieci e senti onestamente quegli errori, è dove la neurologia dell'apprendimento opera davvero.",
      "Non è un argomento per punirti. È un argomento per *calibrare*. La tua pratica deve sembrare onestamente difficile, non schiacciante. 15 % di errore, non 50 %.",
    ],

    sec6Title: "Come appare tutto questo in un curriculum strutturato",
    sec6Paragraphs: [
      "Il curriculum di The Mambo Guild è costruito attorno a questo principio. Ogni lezione apre la successiva con un criterio esplicito di padronanza. Ogni drill ha uno slider di difficoltà. L'Albero delle Abilità sblocca un nuovo ramo solo quando riesci a eseguire il ramo attuale in modo coerente, non perfetto, ma coerente. L'idea è tenerti nella fascia dell'85 % senza che tu debba misurare il tuo tasso di successo con una scheda.",
      "L'alternativa (prendere lezioni a caso, allenare ciò che il maestro ha capitato di coprire questa settimana) ti mette quasi sempre o troppo in basso (ti annoi, ripeti ciò che sai) o troppo in alto (sei perso, non impari nulla). Entrambi i modi di fallimento si vedono negli stalli che i ballerini di salsa autodidatti raggiungono intorno ai sei-nove mesi di apprendimento casuale.",
    ],

    sec7Title: "Fonti",
    sec7Sources: [
      "Wilson, R.C., Shenhav, A., Steine-Hanson, M. & Cohen, J.D. (2019). *The Eighty Five Percent Rule for Optimal Learning*. Nature Human Behaviour, 3, 1316-1323.",
      "Bjork, R.A. (1994). Memory and Metamemory Considerations in the Training of Human Beings. In J. Metcalfe e A. Shimamura (a cura di), *Metacognition*. MIT Press.",
      "Schmidt, R.A. & Lee, T.D. (2011). *Motor Learning and Performance: From Principles to Application* (5ª ed.). Human Kinetics.",
    ],

    faqs: [
      {
        q: "Cos'è la regola dell'85 % in termini semplici?",
        a: "Un articolo del 2019 su Nature Human Behaviour ha mostrato che il cervello umano impara abilità nuove più velocemente quando la difficoltà della pratica è calibrata in modo che riesci circa l'85 % delle volte e fallisci circa il 15 %. L'ottimo esatto è 15,87 % di fallimento. Praticare a tassi di errore molto più alti o più bassi rallenta l'apprendimento.",
      },
      {
        q: "Da dove viene il numero 15,87 %?",
        a: "È derivato matematicamente dalla forma di una curva di apprendimento standard (una sigmoide). La pendenza della curva, ovvero quanto migliori per ripetizione, è massima in un punto specifico, e quel punto corrisponde a un tasso di fallimento del 15,87 %. Non è una stima empirica; salta fuori dai conti.",
      },
      {
        q: "La regola dell'85 % vale per tutte le abilità, ballo incluso?",
        a: "L'articolo di Wilson et al. era sull'apprendimento in modelli di reti neurali e compiti di classificazione binaria, ma si generalizza fortemente a qualsiasi abilità in cui il cervello produce un'uscita motoria e si aggiorna sulla base del feedback. Il ballo è apprendimento motorio da manuale.",
      },
      {
        q: "E se voglio eseguire una coreografia pulita, senza errori?",
        a: "Pratica e performance sono modalità diverse. Devi allenare al 85 % di successo ed eseguire al 100 %. La zona del 15 % di errore è dove avviene l'apprendimento; la zona del 100 % è dove verifichi che l'apprendimento sia stabile.",
      },
      {
        q: "Come si inserisce la \"difficoltà desiderabile\"?",
        a: "La ricerca di Robert Bjork sulle difficoltà desiderabili mostra che le condizioni di pratica che fanno sembrare l'apprendimento più difficile sul momento — ripetizione distanziata, interleaving, feedback ridotto — producono una migliore ritenzione a lungo termine. È la sorella comportamentale della regola dell'85 %: la fatica gestibile batte la ripetizione senza sforzo per qualsiasi cosa tu voglia conservare.",
      },
    ],

    ctaEyebrow: "Allenati in modo più intelligente",
    ctaHeading: "Un curriculum calibrato sulla zona dell'85 %.",
    ctaBody:
      "Ogni drill, lezione e ramo dell'Albero delle Abilità in The Mambo Guild è regolato per tenerti nella fascia di difficoltà dove l'apprendimento avviene davvero. Costruito su principi delle scienze dell'apprendimento da un Learning Experience Designer certificato.",

    howToName: "Come applicare la regola dell'85 % in una sessione di salsa",
    howToDescription:
      "Un protocollo in 4 passi per calibrare la difficoltà del drill al tasso di errore matematicamente ottimale del 15,87 %.",
    howToSteps: [
      {
        name: "Scegli una sola abilità isolata per sessione",
        text: "Non allenare 'la salsa'. Allena una cosa specifica: una tecnica di giro, il timing di un cross-body lead, uno shine. Serve un'unica definizione di successo/fallimento per misurare un tasso di successo.",
      },
      {
        name: "Fai 10 ripetizioni e valuta ognuna onestamente",
        text: "Decidi prima di iniziare cosa conta come riuscita e cosa come errore. Dopo 10 ripetizioni, conta i successi. Se ne fai 9 o 10, il drill è troppo facile. Se ne fai 5 o meno, è troppo difficile.",
      },
      {
        name: "Regola la manopola della difficoltà",
        text: "Troppo facile: aumenta il tempo del 10 %, aggiungi un livello di styling delle braccia, aggiungi un partner, prova la versione del lato non dominante o togli il feedback visivo. Troppo difficile: semplifica fino a stabilizzarti a 8 successi su 10.",
      },
      {
        name: "Resta nella fascia 80-90 % per 20 minuti",
        text: "Una volta che riesci a fare 8-9 ripetizioni su 10, restaci per una pratica sostenuta. È la zona in cui il cervelletto riceve segnali di errore chiari e la corteccia motoria continua ad aggiornarsi.",
      },
    ],
  },
  // ============================================================ JA
  ja: {
    metaTitle: "85% ルール:あなたの脳は実際にどう踊りを学ぶのか",
    metaDescription:
      "2019 年の Nature 論文によると、学習にとって数学的に最適なエラー率は 15.87% です。これがサルサ練習に何を意味するか、ドリルをどう調整するか、そしてなぜ「クリーンな」練習が上達を止めるのかを解説します。",

    breadcrumbHome: "ホーム",
    breadcrumbBlog: "ブログ",
    breadcrumbCurrent: "85% ルール",

    badge: "トレーニング科学",
    h1Pre: "85% ルール:",
    h1Accent: "あなたの脳は実際にどう踊りを学ぶのか",

    bylineCredential: "ラーニング・エクスペリエンス・デザイン認定",

    shortAnswerRich:
      "2019 年に Wilson、Shenhav、Steine-Hanson、Cohen の 4 名が *Nature Human Behaviour* に発表した論文によると、スキル習得にとって数学的に最適なエラー率はちょうど **15.87% の失敗**、つまり約 85% の成功です。これより高ければ、脳は明確なパターンに固定できません。これより低ければ、脳はそのスキルを「完了」として保管し、改良をやめてしまいます。これが、クリーンな練習が伸びを止め、わずかに難しすぎるドリルこそ最速の上達ルートだという背後の数学です。",

    sec1Title: "その研究について",
    sec1Paragraphs: [
      "2019 年、アリゾナ大学の Robert Wilson らが *Nature Human Behaviour* に *「The Eighty Five Percent Rule for Optimal Learning」* を発表した。彼らはひとつの精密な問いを立てた:練習セッションの難易度ダイヤルを好きな数字に設定できるとしたら、数学的にできるかぎり速く学ぶには、その数字をいくつにすればよいのか?",
      "答えは、標準的な学習曲線の形、すなわち S 字のシグモイドから出てくる。スキルが新しいときには曲線はゆっくり上がり、中盤でもっとも速く上がり、習得すると上で頭打ちになる。Wilson はこう問うた。曲線のどこで傾き(1 反復あたりの上達率)がもっとも急になるか?",
      "数学から導かれるその点が **15.87% の失敗** である。10% でも 25% でもなく、15.87%。誰かが提案した大雑把な推測ではなく、特定の曲線から落ちてくる特定の数だ。",
    ],

    sec2Title: "なぜあなたの脳はこう働くのか",
    sec2Paragraphs: [
      "運動学習はエラー修正のループだ。何かを試し、身体がそのバージョンを実行し、脳は *意図したこと* と *実際に起きたこと* を比較する。そのズレが小脳(脳の後部にある運動を微調整する領域)に信号を生み、その信号が運動野に「更新せよ」と伝える。",
      "もしすべての反復が完璧に決まれば、ズレはない。信号もない。脳はその動きは片付いたと判断し、注意をまだ壊れている別のところへ振り向ける。だからクリーンな練習は生産的に感じられても収穫は逓減する。あなたはまだ形成中のものを訓練するのではなく、すでに知っているものを反復しているからだ。",
      "失敗の反復が多すぎると、信号はノイズだらけになる。脳は本物のパターンとランダムなエラーを区別できない。研究者はこれを **フラストレートされた学習** と呼ぶ。あなたは懸命に取り組んでいるのに、脳には更新の方向となる安定した先がない。",
      "15% 失敗のゾーンこそ信号がクリーンな場所だ。脳は何が間違っていたかをほぼ把握し、正しくできたときの安定した参照を持ち、1 反復ごとに小さな更新ができる。",
    ],

    sec3Title: "望ましい困難(Bjork)",
    sec3Paragraphs: [
      "85% ルールには行動学的な姉妹がいる。Robert Bjork の **望ましい困難**(desirable difficulty)という概念だ。Bjork は数十年にわたって、その場では *より難しく感じられる* 練習条件(反復を間隔をあけて行う、異なるスキルを織り交ぜる、フィードバックを減らす)が、*長期的な* 保持を高めることを示してきた。一つのスキルを集中して反復し、絶え間ないフィードバックを受ける練習は、やっている間は気持ちがよく、しかし 1 週間後には目に見えて保持が悪い。",
      "ダンスへの実践的な含意:練習がほぼ無努力でなめらかに感じられるなら、たぶんあなたはあまり学んでいない。今の自分の少し上に感じられるなら(不快で、少しカオスで、正直なミスが多い)、おそらく脳が許す最大に近い速度で学んでいる。",
    ],

    sec4Title: "85% ルールをサルサ練習に適用する方法",
    sec4Steps: [
      "**孤立したスキルをひとつ選ぶ。** 「サルサ」を練習しないこと。具体的なものを練習する:スピンの準備、特定のカウントでのクロスボディ・リード、特定の BPM でのシャイン・シーケンスなど。成功率を測るには、二値の成功/失敗の基準が必要だ。",
      "**10 回反復し、正直に採点する。** 何を成功とみなすかを始める前に決める。それから数える。10 回中 9〜10 回成功ならドリルは簡単すぎ。5 回以下なら難しすぎる。",
      "**難易度ダイヤルを調整する。** 簡単すぎ:BPM を 10% 上げる、腕のスタイリング層を加える、非利き手側で行う、パートナーを加える、鏡のフィードバックを外す。難しすぎ:10 回中 8〜9 回で安定するまで簡略化する。",
      "**80〜90% の帯にとどまる。** その帯を見つけたら、15〜20 分連続でそこにいる。それが小脳がクリーンなエラー信号を生み、運動野が反復ごとに動きの表現を更新するゾーンだ。",
    ],

    sec5Title: "なぜ「クリーンな」練習は気分がいいのに学びは少ないのか",
    sec5Paragraphs: [
      "60 分の練習セッションで反復のすべてがなめらかに感じられ、「最高だった」と思って出てきた経験があるなら、自分の限界ぎりぎりで雑に 20 分ドリルした場合より、たぶんあなたは自分に教えられなかった。",
      "脳は努力に報いるのではない。予測誤差に、それも管理可能な量の予測誤差に報いる。すでに知っていることの 1 時間のリハーサルは、踊りを快適ゾーンの内側に安全にとどめ、ほとんど更新信号を生まない。85% 成功のドリル 20 分、10 回中 2 回外していて、その 2 回を正直に感じている時間こそが、学習の神経学が実際に動く場所だ。",
      "これは自分を罰するための主張ではない。*キャリブレーション* のための主張だ。練習は正直に難しいと感じるべきで、押しつぶされるほどではない。50% ではなく 15% の失敗だ。",
    ],

    sec6Title: "構造化されたカリキュラムではこれがどう見えるか",
    sec6Paragraphs: [
      "The Mambo Guild のカリキュラムはこの原理を中心に作られている。各レッスンは、明示的な習得基準で次のレッスンに通じる。各ドリルには難易度のスライダーがある。Skill Tree は、現在の枝を完璧にではなく一貫して実行できるようになって初めて、新しい枝を開放する。要点は、自分の成功率をクリップボードで計らずとも、あなたを 85% の帯にとどめておくことだ。",
      "代替手段(ランダムにクラスを取る、その週に先生が偶然扱った内容をドリルする)は、ほとんどいつも、低すぎ(退屈、知っていることの繰り返し)か高すぎ(迷子、何も学べない)のどちらかにあなたを置く。両方の失敗モードは、独学のサルサ・ダンサーがおおむね 6〜9 か月のカジュアルな学習で当たるプラトーに見える。",
    ],

    sec7Title: "出典",
    sec7Sources: [
      "Wilson, R.C., Shenhav, A., Steine-Hanson, M. & Cohen, J.D. (2019). *The Eighty Five Percent Rule for Optimal Learning*. Nature Human Behaviour, 3, 1316-1323.",
      "Bjork, R.A. (1994). Memory and Metamemory Considerations in the Training of Human Beings. In J. Metcalfe & A. Shimamura (Eds.), *Metacognition*. MIT Press.",
      "Schmidt, R.A. & Lee, T.D. (2011). *Motor Learning and Performance: From Principles to Application* (5th ed.). Human Kinetics.",
    ],

    faqs: [
      {
        q: "85% ルールを平易な言葉で言うと?",
        a: "2019 年の Nature Human Behaviour 論文は、人間の脳が新しいスキルをもっとも速く学ぶのは、練習の難易度を「およそ 85% 成功し、約 15% 失敗する」ように調整したときだと示しました。正確な最適値は 15.87% の失敗です。これより大幅に高いか低い失敗率では学習は遅くなります。",
      },
      {
        q: "15.87% という数字はどこから来るの?",
        a: "標準的な学習曲線(シグモイド)の形から数学的に導かれます。曲線の傾き、つまり 1 反復あたりの上達速度がもっとも急になる特定の点があり、その点が失敗率 15.87% に対応します。経験的な推測ではなく、計算からそのまま落ちてくる値です。",
      },
      {
        q: "85% ルールはダンスを含むあらゆるスキルに当てはまる?",
        a: "Wilson らの論文はニューラルネットワーク・モデルや二値分類タスクの学習についてでしたが、運動出力を脳が生み、フィードバックに基づいて更新するあらゆるスキルに強く一般化します。ダンスはまさに教科書通りの運動学習です。",
      },
      {
        q: "ルーティンをノーミスでクリーンにパフォームしたい場合は?",
        a: "練習とパフォーマンスは別のモードです。85% 成功でドリルし、100% でパフォームすべきです。15% 失敗のゾーンは学習が起きる場所、100% のゾーンは学習が安定したことを確認する場所です。",
      },
      {
        q: "「望ましい困難」はどう関わる?",
        a: "Robert Bjork の望ましい困難の研究は、その場では学習を難しく感じさせる練習条件(間隔をあけた反復、インターリービング、フィードバックの削減)が、長期保持を高めることを示します。85% ルールの行動学的な姉妹であり、保ちたいことに対しては、努力を要さない反復よりも、管理可能な苦闘の方が勝ります。",
      },
    ],

    ctaEyebrow: "賢く練習する",
    ctaHeading: "85% ゾーンに合わせて調整されたカリキュラム。",
    ctaBody:
      "The Mambo Guild のすべてのドリル、レッスン、Skill Tree の枝は、学習が実際に起きる難易度帯にあなたをとどめるよう調律されています。認定 Learning Experience Designer による学習科学の原則に基づいて構築。",

    howToName: "サルサ練習セッションで 85% ルールを適用する方法",
    howToDescription:
      "数学的に最適な誤差率 15.87% にドリルの難易度を調整するための 4 ステップのプロトコル。",
    howToSteps: [
      {
        name: "1 セッションにつき孤立したスキルを 1 つ選ぶ",
        text: "「サルサ」を練習しないこと。1 つの具体的なもの:スピン技術、クロスボディ・リードのタイミング、シャインなどを練習する。成功率を測るには成功/失敗の単一の定義が必要だ。",
      },
      {
        name: "10 回反復し、それぞれを正直に採点する",
        text: "何を成功とし、何を失敗とするかを始める前に決める。10 回後、成功を数える。9〜10 回成功ならドリルは簡単すぎ。5 回以下なら難しすぎる。",
      },
      {
        name: "難易度ダイヤルを調整する",
        text: "簡単すぎ:テンポを 10% 上げる、腕のスタイリング層を加える、パートナーを加える、非利き手側のバージョンを行う、視覚フィードバックを外す。難しすぎ:10 回中 8 回で安定するまで簡略化する。",
      },
      {
        name: "80〜90% の帯に 20 分とどまる",
        text: "10 回中 8〜9 回当てられるようになったら、そこに留まり持続的に練習する。それが小脳が明確なエラー信号を受け取り、運動野が更新を続けるゾーンだ。",
      },
    ],
  },
  // ============================================================ KO
  ko: {
    metaTitle: "85% 규칙: 당신의 뇌는 실제로 어떻게 춤을 배우는가",
    metaDescription:
      "2019년 Nature 논문은 학습에 수학적으로 최적인 오류율이 15.87%임을 밝혔습니다. 이것이 살사 연습에 무엇을 의미하는지, 드릴을 어떻게 보정해야 하는지, 그리고 왜 \"깨끗한\" 연습이 진전을 멈추는지를 다룹니다.",

    breadcrumbHome: "홈",
    breadcrumbBlog: "블로그",
    breadcrumbCurrent: "85% 규칙",

    badge: "트레이닝 과학",
    h1Pre: "85% 규칙: ",
    h1Accent: "당신의 뇌는 실제로 어떻게 춤을 배우는가",

    bylineCredential: "러닝 익스피리언스 디자인 인증",

    shortAnswerRich:
      "2019년 *Nature Human Behaviour*에 실린 Wilson, Shenhav, Steine-Hanson, Cohen의 논문은 기술 습득에 수학적으로 최적인 오류율이 정확히 **15.87% 실패**, 즉 약 85% 성공임을 보였습니다. 이보다 높으면 뇌가 명확한 패턴에 고정될 수 없습니다. 이보다 낮으면 뇌는 그 기술을 \"끝났다\"고 처리하고 더 이상 업그레이드하지 않습니다. 이것이 깨끗한 연습이 진전을 멈추게 하는, 그리고 약간 너무 어려운 드릴이 향상으로 가는 가장 빠른 길인 이유의 수학입니다.",

    sec1Title: "그 연구",
    sec1Paragraphs: [
      "2019년, 애리조나 대학교의 Robert Wilson과 동료들은 *Nature Human Behaviour*에 *\"The Eighty Five Percent Rule for Optimal Learning\"*을 발표했다. 그들은 정확한 질문을 던졌다. 만약 당신이 연습 세션의 난이도 다이얼을 어떤 숫자에든 맞출 수 있다면, 수학적으로 가장 빠르게 배우려면 그 다이얼을 어디에 맞춰야 하는가?",
      "답은 표준 학습 곡선의 모양, 즉 S자 시그모이드에서 나온다. 이 곡선은 기술이 새로울 때 천천히 올라가고, 중간에서 가장 빠르게 올라가며, 기술이 숙달되면 위에서 평탄해진다. Wilson은 물었다. 곡선의 어느 지점에서 기울기(반복당 향상 속도)가 가장 가파른가?",
      "수학에서 도출된 그 지점은 **15.87% 실패** 다. 10%도 아니고, 25%도 아니다. 15.87%. 이는 누군가가 던진 대략적인 추측이 아니라, 특정한 곡선에서 떨어져 나오는 특정한 숫자다.",
    ],

    sec2Title: "당신의 뇌가 이렇게 작동하는 이유",
    sec2Paragraphs: [
      "운동 학습은 오류 수정 루프다. 당신이 무언가를 시도하면 몸은 그 한 가지 버전을 수행하고, 뇌는 *의도했던 것* 과 *실제 일어난 것* 을 비교한다. 그 차이가 소뇌(움직임을 미세하게 조정하는 뇌 뒤쪽 영역)에서 신호를 만들고, 그 신호가 운동 피질에게 업데이트하라고 지시한다.",
      "모든 반복이 완벽하게 떨어지면 차이가 없다. 신호도 없다. 뇌는 그 동작이 처리되었다고 판단하고 주의를 아직 망가져 있는 다른 곳으로 돌린다. 그래서 깨끗한 연습이 생산적으로 느껴지지만 수익은 점차 줄어든다. 당신은 아직 형성 중인 것을 훈련하는 것이 아니라 이미 알고 있는 것을 반복하고 있는 것이다.",
      "너무 많은 반복이 실패하면 신호가 잡음으로 가득해진다. 뇌는 진짜 패턴과 무작위 오류를 구분할 수 없다. 연구자들은 이를 **좌절된 학습** 이라고 부른다. 당신은 열심히 일하고 있지만 뇌에는 업데이트해 갈 안정적인 목표가 없다.",
      "15% 실패 구역은 신호가 깨끗한 곳이다. 뇌는 무엇이 잘못되었는지 대략 알고, 잘된 것이 어떤 모습인지에 대한 안정된 참조를 가지고 있으며, 반복마다 작은 업데이트를 할 수 있다.",
    ],

    sec3Title: "바람직한 어려움(Bjork)",
    sec3Paragraphs: [
      "85% 규칙에는 행동학적 자매가 있다. Robert Bjork의 **바람직한 어려움**(desirable difficulty) 개념이다. Bjork는 수십 년간 *그 순간에는 더 어렵게 느껴지는* 연습 조건(반복을 띄우고, 다른 기술을 섞고, 피드백을 줄이는 것)이 *장기적인* 보존력을 더 높인다는 것을 보였다. 단일 기술을 한꺼번에 반복하며 끊임없는 피드백을 받는 연습은 하는 동안에는 기분이 더 좋지만 일주일 뒤의 보존력은 눈에 띄게 더 나쁘다.",
      "춤에 대한 실용적인 함의: 연습 세션이 힘들이지 않고 매끄럽게 느껴진다면, 아마 많이 배우고 있지는 않을 것이다. 현재 수준보다 살짝 위로 느껴진다면(불편하고, 약간 혼란스럽고, 정직한 미스가 많다면), 아마 뇌가 허용하는 거의 최대 속도로 배우고 있는 것이다.",
    ],

    sec4Title: "85% 규칙을 살사 연습에 적용하는 방법",
    sec4Steps: [
      "**고립된 한 가지 기술을 골라라.** \"살사\"를 연습하지 마라. 구체적인 것을 연습하라: 스핀 준비, 특정 카운트의 크로스바디 리드, 특정 BPM의 샤인 시퀀스. 비율을 측정하려면 이진 성공/실패 기준이 필요하다.",
      "**10번 반복하고 정직하게 채점하라.** 시작하기 전에 무엇을 성공으로 칠지 정의하라. 그런 다음 세어라. 9-10번 성공이면 드릴이 너무 쉬운 것이다. 5번 이하라면 너무 어려운 것이다.",
      "**난이도 다이얼을 조정하라.** 너무 쉬울 때: BPM을 10% 올리거나, 팔 스타일링 레이어를 추가하거나, 비주된 쪽으로 하거나, 파트너를 추가하거나, 거울 피드백을 제거하라. 너무 어려울 때: 10번 중 8-9번에서 안정될 때까지 단순화하라.",
      "**80-90% 구간에 머물러라.** 그 구간을 찾으면 15-20분 동안 지속적으로 머물러라. 그곳이 소뇌가 깨끗한 오류 신호를 만들고 운동 피질이 반복마다 움직임 표상을 업데이트하는 구역이다.",
    ],

    sec5Title: "왜 '깨끗한' 연습은 기분이 좋지만 덜 가르치는가",
    sec5Paragraphs: [
      "60분짜리 연습 세션을 마치며 모든 반복이 매끄러웠다고 느끼고 \"좋았어\"라고 생각하며 나온 적이 있다면, 능력의 가장자리에서 지저분한 드릴을 20분 한 경우보다 자신에게 덜 가르친 것이다.",
      "뇌는 노력에 보상하지 않는다. 뇌는 예측 오류에, 그것도 관리 가능한 양의 예측 오류에 보상한다. 이미 알고 있는 것을 한 시간 동안 반복하는 것은 춤을 안전하게 컴포트 존 안에 두고, 업데이트 신호를 거의 만들지 않는다. 85% 성공으로 드릴하는 20분, 즉 10번 중 2번을 놓치고 그 미스를 정직하게 느끼는 시간이야말로 학습의 신경학이 실제로 작동하는 곳이다.",
      "이는 자신을 벌하라는 주장이 아니다. *보정* 하라는 주장이다. 당신의 연습은 짓누르는 정도가 아니라 정직하게 어렵게 느껴져야 한다. 50%가 아니라 15% 실패다.",
    ],

    sec6Title: "구조화된 커리큘럼에서 이것이 어떻게 보이는가",
    sec6Paragraphs: [
      "The Mambo Guild의 커리큘럼은 이 원리를 중심으로 만들어졌다. 모든 레슨은 명시적인 숙달 기준에 따라 다음으로 통한다. 모든 드릴에는 난이도 슬라이더가 있다. Skill Tree는 현재 가지를 완벽하지는 않더라도 일관되게 실행할 수 있어야만 새 가지를 잠금 해제한다. 요점은 클립보드를 들고 자기 성공률을 측정하지 않더라도 당신을 85% 구간에 머무르게 하는 것이다.",
      "대안(아무 클래스나 듣고, 그 주에 강사가 우연히 다룬 것을 드릴하는 것)은 거의 항상 너무 낮은 곳(지루함, 아는 것 반복) 또는 너무 높은 곳(길을 잃고 아무것도 배우지 못함)에 당신을 두게 한다. 두 실패 모드는 모두, 독학으로 살사를 배우는 사람들이 6-9개월의 캐주얼한 학습 즈음에 부딪히는 정체기에서 보인다.",
    ],

    sec7Title: "출처",
    sec7Sources: [
      "Wilson, R.C., Shenhav, A., Steine-Hanson, M. & Cohen, J.D. (2019). *The Eighty Five Percent Rule for Optimal Learning*. Nature Human Behaviour, 3, 1316-1323.",
      "Bjork, R.A. (1994). Memory and Metamemory Considerations in the Training of Human Beings. In J. Metcalfe & A. Shimamura (Eds.), *Metacognition*. MIT Press.",
      "Schmidt, R.A. & Lee, T.D. (2011). *Motor Learning and Performance: From Principles to Application* (5th ed.). Human Kinetics.",
    ],

    faqs: [
      {
        q: "85% 규칙을 쉬운 말로 하면?",
        a: "2019년 Nature Human Behaviour 논문은, 인간의 뇌가 약 85% 성공하고 약 15% 실패하도록 연습 난이도를 보정했을 때 새 기술을 가장 빠르게 배운다고 보였습니다. 정확한 최적값은 15.87% 실패입니다. 훨씬 높거나 훨씬 낮은 실패율로 연습하면 학습이 느려집니다.",
      },
      {
        q: "15.87%라는 숫자는 어디서 나온 것인가요?",
        a: "표준 학습 곡선(시그모이드)의 모양에서 수학적으로 도출됩니다. 곡선의 기울기—반복당 얼마나 빨리 향상되는지—는 특정 지점에서 가장 가파르며, 그 지점이 15.87% 실패율에 해당합니다. 경험적 추정이 아니라 수학에서 그대로 떨어져 나오는 값입니다.",
      },
      {
        q: "85% 규칙은 춤을 포함한 모든 기술에 적용되나요?",
        a: "Wilson 등의 논문은 신경망 모델과 이진 분류 작업에서의 학습에 관한 것이었지만, 뇌가 운동 출력을 만들고 피드백에 따라 업데이트하는 모든 기술로 강하게 일반화됩니다. 춤은 교과서적인 운동 학습입니다.",
      },
      {
        q: "루틴을 깔끔하게, 실수 없이 공연하고 싶다면요?",
        a: "공연과 연습은 다른 모드입니다. 85% 성공으로 드릴하고 100%로 공연해야 합니다. 15% 실패 구역은 학습이 일어나는 곳이고, 100% 구역은 학습이 안정적인지 확인하는 곳입니다.",
      },
      {
        q: "'바람직한 어려움'은 어떻게 들어맞나요?",
        a: "Robert Bjork의 바람직한 어려움 연구는, 그 순간에 학습을 더 어렵게 느끼게 만드는 연습 조건—간격 반복, 인터리빙, 줄어든 피드백—이 장기 보존을 더 잘 만든다는 것을 보입니다. 85% 규칙의 행동학적 자매로, 보존하고자 하는 것에 대해서는 힘들이지 않는 반복보다 관리 가능한 분투가 더 낫습니다.",
      },
    ],

    ctaEyebrow: "더 똑똑하게 연습하라",
    ctaHeading: "85% 구역에 보정된 커리큘럼.",
    ctaBody:
      "The Mambo Guild의 모든 드릴, 레슨, Skill Tree 가지는 학습이 실제로 일어나는 난이도 구간에 당신을 머물게 하도록 조율되어 있습니다. 인증된 Learning Experience Designer가 학습 과학 원리 위에 구축했습니다.",

    howToName: "살사 연습 세션에서 85% 규칙을 적용하는 방법",
    howToDescription:
      "수학적으로 최적인 15.87% 오류율로 드릴 난이도를 보정하기 위한 4단계 프로토콜.",
    howToSteps: [
      {
        name: "세션당 고립된 기술 하나를 골라라",
        text: "'살사'를 연습하지 마라. 한 가지 구체적인 것을 연습하라: 스핀 기술, 크로스바디 리드 타이밍, 샤인. 성공률을 측정하려면 단일한 성공/실패 정의가 필요하다.",
      },
      {
        name: "10번 반복하고 각각을 정직하게 채점하라",
        text: "시작하기 전에 무엇이 성공이고 무엇이 실패인지 결정하라. 10번 반복 후 성공을 세어라. 9 또는 10번 성공하면 드릴이 너무 쉬운 것이다. 5번 이하라면 너무 어려운 것이다.",
      },
      {
        name: "난이도 다이얼을 조정하라",
        text: "너무 쉬울 때: 템포를 10% 올리거나, 팔 스타일링 레이어를 추가하거나, 파트너를 추가하거나, 비주된 쪽 버전을 시도하거나, 시각 피드백을 제거하라. 너무 어려울 때: 10번 중 8번에서 안정될 때까지 단순화하라.",
      },
      {
        name: "80-90% 구간에 20분 머물러라",
        text: "10번 중 8-9번을 성공시키게 되면 그곳에 머물러 지속 연습하라. 그곳이 소뇌가 명확한 오류 신호를 받고 운동 피질이 계속 업데이트되는 구역이다.",
      },
    ],
  },
  // ============================================================ ZH
  zh: {
    metaTitle: "85% 法则:你的大脑实际是怎么学跳舞的",
    metaDescription:
      "2019 年 Nature 的一项研究发现,学习时数学上最优的错误率是 15.87%。这对萨尔萨练习意味着什么、如何校准你的练习,以及为什么「干净」的练习会让进步停滞。",

    breadcrumbHome: "首页",
    breadcrumbBlog: "博客",
    breadcrumbCurrent: "85% 法则",

    badge: "训练科学",
    h1Pre: "85% 法则:",
    h1Accent: "你的大脑实际是怎么学跳舞的",

    bylineCredential: "学习体验设计认证",

    shortAnswerRich:
      "2019 年,Wilson、Shenhav、Steine-Hanson 与 Cohen 在 *Nature Human Behaviour* 上的一篇论文发现,技能习得在数学上的最优错误率正好是 **15.87% 失败率**,也就是约 85% 成功率。高于这个水平,大脑无法锁定到一个清晰的模式;低于这个水平,大脑会把这项技能归档为「已经搞定」,不再升级。这就是干净练习让进步停滞、稍微太难一点的练习反而是最快进步路径背后的数学。",

    sec1Title: "那项研究",
    sec1Paragraphs: [
      "2019 年,亚利桑那大学的 Robert Wilson 与同事在 *Nature Human Behaviour* 上发表了 *《The Eighty Five Percent Rule for Optimal Learning》*。他们提了一个精确的问题:如果你可以把一节练习的难度旋钮调到任意数值,那这个数值要调到多少,才能在数学上学得尽可能快?",
      "答案出自一条标准学习曲线的形状:一条 S 形 sigmoid。当技能很新时,曲线缓慢上升;在中段上升最快;在技能掌握后在顶部趋于平稳。Wilson 问的是:在曲线的哪个点上,斜率(每次重复带来的进步速度)最陡?",
      "这个由数学推导出的点是 **15.87% 失败率**。不是 10%,也不是 25%。是 15.87%。这是一个具体数字,从一条具体曲线里掉出来,而不是某个人随手提出的粗略估计。",
    ],

    sec2Title: "你的大脑为什么会这样运作",
    sec2Paragraphs: [
      "动作学习是一个误差修正循环。你尝试一件事,身体执行其某个版本,大脑会把你 *本来想* 做的与 *实际发生* 的进行比较。两者之间的差异在小脑(脑后部、负责微调动作的区域)产生一个信号,这个信号告诉你的运动皮层去更新。",
      "如果每次重复都完美落地,就没有差异。没有信号。大脑会判定这个动作已经搞定,把注意力转向其他还没搞定的地方。所以干净的练习感觉很有产出,但回报递减——你只是在重温自己已经会的,而不是训练还在成形中的部分。",
      "如果太多重复都失败,信号就成了噪声。大脑无法把真实模式和随机错误区分开。研究者把这种状态称为 **挫败学习**:你很努力,但大脑没有一个稳定的方向去更新。",
      "15% 失败的区域是信号最干净的地方。大脑大致知道哪里出了问题,有一个关于「做对是什么样」的稳定参考,可以在每次重复时做一次小小的更新。",
    ],

    sec3Title: "理想的难度(Bjork)",
    sec3Paragraphs: [
      "85% 法则有一个行为学上的姊妹:Robert Bjork 的 **理想的难度**(desirable difficulty)概念。Bjork 用几十年的研究表明:那些 *当下感觉更难* 的练习条件(把重复隔开、把不同技能交错、减少反馈)能带来更好的 *长期* 留存。集中地反复一项技能、并伴随持续反馈的练习,做的时候感觉更好,而一周之后留存却明显更差。",
      "这对跳舞的实际意义:如果你的练习感觉毫不费力、行云流水,那你大概没学到太多。如果它感觉略高于你目前的水平(不太舒服、有点混乱、有不少诚实的失误),那你大概正以接近大脑允许的最大速率在学。",
    ],

    sec4Title: "如何把 85% 法则用到萨尔萨练习上",
    sec4Steps: [
      "**挑出一个孤立的技能。** 别去练「萨尔萨」。练一个具体的东西:一个旋转准备、特定拍上的 cross-body lead、一个特定 BPM 下的 shine 段子。你需要一个二元的成功/失败标准来度量比例。",
      "**做 10 次重复并诚实打分。** 在开始前定义什么算成功。然后数。9 或 10 次成功说明这个练习太简单。5 次或以下说明太难。",
      "**调整难度旋钮。** 太简单:把 BPM 提高 10%、加一层手臂 styling、用非惯用侧做、加一个搭档,或者去掉镜子反馈。太难:简化到你能稳定在 10 次中 8-9 次成功为止。",
      "**待在 80-90% 的区间里。** 一旦找到这个区间,就在里面持续练习 15-20 分钟。这就是小脑产出干净误差信号、运动皮层逐次重复地更新动作表征的区域。",
    ],

    sec5Title: "为什么「干净」的练习感觉好却教得少",
    sec5Paragraphs: [
      "如果你曾经做完一节 60 分钟的练习,每一次重复都很顺,然后心里想着「今天真不错」走出去,那你给自己的教益,可能比你在能力边缘上 20 分钟乱练还要少。",
      "大脑奖励的不是用力,而是预测误差,准确说,是一个可控量的预测误差。一小时反复练自己已经会的东西,会把舞蹈安全地留在你的舒适区里,几乎不产生更新信号。在 85% 成功率上练 20 分钟、十次里失误两次、并诚实地感受这两次失误,这才是学习神经学真正运作的地方。",
      "这不是要你折磨自己,而是要你 *校准*。你的练习应当感觉诚实地有难度,而不是把人压垮。15% 失败率,而不是 50%。",
    ],

    sec6Title: "在一套结构化课程里这是什么样子",
    sec6Paragraphs: [
      "The Mambo Guild 的课程就是围绕这一原则构建的。每一节课都按一个明确的掌握标准开启下一节。每一个练习都有一个难度滑块。Skill Tree 只有当你能稳定地——不是完美地,而是稳定地——执行当前分支时,才会解锁新的分支。整体目的就是让你留在 85% 区间里,而不需要你拿着夹板自己量你的成功率。",
      "另一个选择(随便上课、把这周老师正好讲的内容拿来练)几乎总是把你放在两边:要么太低(无聊地重复你已经会的),要么太高(迷失,什么都没学到)。两种失败模式都能在自学者大约 6-9 个月时撞上的瓶颈里看到。",
    ],

    sec7Title: "参考资料",
    sec7Sources: [
      "Wilson, R.C., Shenhav, A., Steine-Hanson, M. & Cohen, J.D. (2019). *The Eighty Five Percent Rule for Optimal Learning*. Nature Human Behaviour, 3, 1316-1323.",
      "Bjork, R.A. (1994). Memory and Metamemory Considerations in the Training of Human Beings. 收录于 J. Metcalfe & A. Shimamura(主编),*Metacognition*. MIT Press.",
      "Schmidt, R.A. & Lee, T.D. (2011). *Motor Learning and Performance: From Principles to Application*(第 5 版). Human Kinetics.",
    ],

    faqs: [
      {
        q: "用大白话讲,85% 法则是什么?",
        a: "2019 年 Nature Human Behaviour 上的一篇论文表明,当练习难度被校准为大约 85% 成功、约 15% 失败时,人类大脑学习新技能最快。精确的最优值是 15.87% 失败率。失败率远高或远低于此都会让学习变慢。",
      },
      {
        q: "15.87% 这个数字是哪儿来的?",
        a: "它是从一条标准学习曲线(sigmoid)的形状里数学推出来的。曲线的斜率,也就是每次重复带来多少进步,在某个特定点上最陡,而那个点对应的就是 15.87% 失败率。这不是经验估计,而是从数学里直接掉出来的。",
      },
      {
        q: "85% 法则适用于所有技能,包括跳舞吗?",
        a: "Wilson 等人的论文研究的是神经网络模型和二元分类任务的学习,但其结论可以强力地推广到任何由大脑产生运动输出、再根据反馈进行更新的技能。跳舞就是教科书式的运动学习。",
      },
      {
        q: "如果我想干干净净、毫无差错地表演一段套路呢?",
        a: "练习和表演是两种模式。你应当以 85% 成功率来练,以 100% 来表演。15% 失败区是学习发生的地方;100% 区是你验证学习是否稳定的地方。",
      },
      {
        q: "「理想的难度」是怎么嵌进来的?",
        a: "Robert Bjork 关于理想难度的研究表明:那些让学习在当下感觉更难的练习条件——间隔重复、交错练习、减少反馈——会带来更好的长期留存。这是 85% 法则的行为学姊妹:对于一切你想保留下来的东西,可控的挣扎都胜过毫不费力的重复。",
      },
    ],

    ctaEyebrow: "练得更聪明",
    ctaHeading: "围绕 85% 区间校准过的课程体系。",
    ctaBody:
      "The Mambo Guild 中的每一个练习、每一节课、Skill Tree 上的每一根分支,都被调到能让你停留在「学习真正发生」的难度区间。由获得认证的 Learning Experience Designer 基于学习科学原则构建。",

    howToName: "如何在一节萨尔萨练习中应用 85% 法则",
    howToDescription:
      "一份四步协议,把练习难度校准到数学上最优的 15.87% 错误率。",
    howToSteps: [
      {
        name: "每节练习只挑一个孤立的技能",
        text: "别去练「萨尔萨」。练一个具体的:一项旋转技术、cross-body lead 的 timing、一个 shine。要测一个成功率,你需要一套单一的成功/失败定义。",
      },
      {
        name: "做 10 次重复,逐一诚实打分",
        text: "在开始前先决定哪种算成功、哪种算失败。10 次结束后,数你的成功次数。如果是 9 或 10,这个练习太简单;如果是 5 次或更少,就是太难。",
      },
      {
        name: "调整难度旋钮",
        text: "太简单:把节奏提高 10%、加一层手臂 styling、加一个搭档、做非惯用侧版本,或者去掉视觉反馈。太难:简化到你能稳定在 10 次中 8 次成功为止。",
      },
      {
        name: "在 80-90% 区间里持续 20 分钟",
        text: "一旦你能稳定地 10 次中成功 8-9 次,就在那里持续地练。那就是小脑能拿到清晰误差信号、运动皮层不断更新的区域。",
      },
    ],
  },
  // ============================================================ RU
  ru: {
    metaTitle: "Правило 85 %: как ваш мозг на самом деле учится танцевать",
    metaDescription:
      "Статья 2019 года в Nature показала, что математически оптимальная частота ошибок при обучении — 15,87 %. Что это значит для практики сальсы, как калибровать упражнения и почему «чистая» практика тормозит прогресс.",

    breadcrumbHome: "Главная",
    breadcrumbBlog: "Блог",
    breadcrumbCurrent: "Правило 85 %",

    badge: "Наука тренировок",
    h1Pre: "Правило 85 %: ",
    h1Accent: "как ваш мозг на самом деле учится танцевать",

    bylineCredential: "Сертифицирован в Learning Experience Design",

    shortAnswerRich:
      "Статья 2019 года в *Nature Human Behaviour* (Wilson, Shenhav, Steine-Hanson и Cohen) показала, что математически оптимальная частота ошибок при освоении навыка — ровно **15,87 % неудач**, или около 85 % успехов. Выше этого порога мозг не может зацепиться за чёткую закономерность. Ниже — мозг помечает навык как «готово» и перестаёт его улучшать. Это и есть математика того, почему чистая практика тормозит прогресс, а упражнения чуть-чуть на грани — самый быстрый путь к росту.",

    sec1Title: "Само исследование",
    sec1Paragraphs: [
      "В 2019 году Robert Wilson и его коллеги из Университета Аризоны опубликовали в *Nature Human Behaviour* статью *«The Eighty Five Percent Rule for Optimal Learning»*. Они задали точный вопрос: если бы вы могли выставить регулятор сложности тренировки на любое число, на какое число его поставить, чтобы учиться так быстро, как это математически возможно?",
      "Ответ вытекает из формы стандартной кривой обучения — S-образной сигмоиды. Когда навык новый, кривая растёт медленно; в середине растёт быстрее всего; на освоении выходит на плато наверху. Wilson спросил: в какой точке кривой её наклон (скорость улучшения за повторение) максимален?",
      "Эта точка, выведенная из математики, — **15,87 % неудач**. Не 10 %. Не 25 %. 15,87 %. Это конкретное число, выпадающее из конкретной кривой, а не чьё-то приблизительное предположение.",
    ],

    sec2Title: "Почему ваш мозг устроен именно так",
    sec2Paragraphs: [
      "Двигательное обучение — это петля коррекции ошибок. Вы пробуете, тело делает свою версию, мозг сравнивает то, что вы *хотели* сделать, с тем, что *реально произошло*. Это рассогласование рождает сигнал в мозжечке (область в задней части мозга, тонко настраивающая движение), и именно этот сигнал говорит моторной коре: обновляйся.",
      "Если каждое повторение идеально, рассогласования нет. Сигнала нет. Мозг решает, что движение разобрано, и переключает внимание на то, что ещё сломано. Поэтому чистая практика кажется продуктивной, но даёт убывающую отдачу: вы повторяете то, что уже умеете, вместо того чтобы тренировать то, что ещё формируется.",
      "Если слишком много повторов проваливается, сигнал становится шумным. Мозг не может отличить настоящую закономерность от случайной ошибки. Исследователи называют это **фрустрированным обучением**: вы стараетесь, но у мозга нет ничего стабильного, к чему он мог бы обновиться.",
      "Зона 15 % неудач — там, где сигнал чистый. Мозг примерно знает, что пошло не так, имеет стабильную опору на то, как выглядит «правильно», и за каждый повтор делает маленькое обновление.",
    ],

    sec3Title: "Желательная сложность (Bjork)",
    sec3Paragraphs: [
      "У правила 85 % есть поведенческая сестра — концепция **желательной сложности** (desirable difficulty) Robert Bjork. Bjork десятилетиями показывал, что условия практики, которые *в моменте кажутся труднее* (разносить повторы по времени, перемежать разные навыки, сокращать обратную связь), дают лучшее *долгосрочное* удержание. Массированная практика одного навыка с постоянной обратной связью ощущается приятнее, пока вы её делаете, и заметно хуже удерживается через неделю.",
      "Практический вывод для танца: если ваша тренировка идёт без усилий и без шероховатостей, вы, скорее всего, мало чему учитесь. Если она ощущается чуть выше вашего текущего уровня (неуютно, немного хаотично, много честных промахов), вы, вероятно, учитесь близко к максимальной скорости, которую позволяет мозг.",
    ],

    sec4Title: "Как применять правило 85 % в практике сальсы",
    sec4Steps: [
      "**Возьмите один изолированный навык.** Не «тренируйте сальсу». Тренируйте конкретное: подготовку к вращению, cross-body lead на конкретном счёте, серию шайнов на конкретном BPM. Для измерения частоты нужен бинарный критерий «попал/промазал».",
      "**Сделайте 10 повторов и честно их оцените.** Заранее определите, что считается попаданием. Потом посчитайте. 9-10 попаданий из 10 — упражнение слишком лёгкое. 5 и меньше — слишком сложное.",
      "**Подкрутите регулятор сложности.** Слишком легко: поднимите BPM на 10 %, добавьте слой стилизации рук, выполните на не доминирующей стороне, добавьте партнёра или уберите зеркало. Слишком сложно: упрощайте, пока не стабилизируетесь на 8-9 попаданиях из 10.",
      "**Держитесь в полосе 80-90 %.** Найдя её, оставайтесь в ней 15-20 непрерывных минут. Это та зона, где мозжечок выдаёт чистые сигналы ошибок, а моторная кора обновляет представление движения от повтора к повтору.",
    ],

    sec5Title: "Почему «чистая» практика приятна, но учит меньше",
    sec5Paragraphs: [
      "Если вы хоть раз заканчивали 60-минутную тренировку, на которой каждое повторение шло гладко, и выходили с мыслью «было классно», — вы, скорее всего, научили себя меньшему, чем за 20 минут грязной отработки на грани собственных возможностей.",
      "Мозг награждает не усилие. Мозг награждает ошибку предсказания, причём в управляемых количествах. Час повторения того, что вы и так знаете, держит танец надёжно внутри зоны комфорта и почти не порождает сигнала к обновлению. Двадцать минут отработки на 85 % успеха, где вы промахиваетесь два раза из десяти и честно ощущаете эти промахи, — вот где реально работает нейрология обучения.",
      "Это не призыв наказывать себя. Это призыв *калибровать*. Ваша практика должна ощущаться честно сложной, а не сокрушительной. 15 % неудач, не 50 %.",
    ],

    sec6Title: "Как это выглядит в структурированной программе",
    sec6Paragraphs: [
      "Программа The Mambo Guild построена вокруг этого принципа. Каждый урок открывает следующий по явному критерию освоения. У каждого упражнения есть ползунок сложности. Skill Tree открывает новую ветку только когда вы можете уверенно — не идеально, а уверенно — выполнять текущую. Смысл в том, чтобы держать вас в полосе 85 % без необходимости считать собственный процент попаданий с планшетом в руках.",
      "Альтернатива (брать случайные классы, отрабатывать то, что преподаватель решил охватить именно на этой неделе) почти всегда ставит вас либо слишком низко (скучно, повторяете уже знакомое), либо слишком высоко (потеряны, ничему не учитесь). Оба режима провала видны в плато, на которые самоучки сальсы попадают примерно через шесть-девять месяцев казуального обучения.",
    ],

    sec7Title: "Источники",
    sec7Sources: [
      "Wilson, R.C., Shenhav, A., Steine-Hanson, M. & Cohen, J.D. (2019). *The Eighty Five Percent Rule for Optimal Learning*. Nature Human Behaviour, 3, 1316-1323.",
      "Bjork, R.A. (1994). Memory and Metamemory Considerations in the Training of Human Beings. В J. Metcalfe и A. Shimamura (ред.), *Metacognition*. MIT Press.",
      "Schmidt, R.A. & Lee, T.D. (2011). *Motor Learning and Performance: From Principles to Application* (5-е изд.). Human Kinetics.",
    ],

    faqs: [
      {
        q: "Что такое правило 85 % простыми словами?",
        a: "Статья 2019 года в Nature Human Behaviour показала, что человеческий мозг быстрее всего учится новым навыкам, когда сложность практики откалибрована так, чтобы вы успешно справлялись примерно в 85 % случаев и ошибались примерно в 15 %. Точный оптимум — 15,87 % неудач. Практика при значительно более высокой или более низкой частоте ошибок замедляет обучение.",
      },
      {
        q: "Откуда берётся число 15,87 %?",
        a: "Оно выведено математически из формы стандартной кривой обучения (сигмоиды). Наклон кривой — то, насколько быстро вы улучшаетесь за повтор, — максимален в конкретной точке, и эта точка соответствует частоте неудач 15,87 %. Это не эмпирическая догадка; число выпадает из самой математики.",
      },
      {
        q: "Применимо ли правило 85 % ко всем навыкам, включая танец?",
        a: "Статья Wilson и др. была про обучение в моделях нейронных сетей и задачах бинарной классификации, но вывод сильно обобщается на любой навык, в котором мозг порождает моторный выход и обновляется по обратной связи. Танец — это учебный пример моторного обучения.",
      },
      {
        q: "А если я хочу исполнить связку чисто, без ошибок?",
        a: "Практика и исполнение — это разные режимы. Тренироваться нужно при 85 % успеха, а исполнять — при 100 %. Зона 15 % неудач — там, где идёт обучение; зона 100 % — там, где вы убеждаетесь, что обучение стабильно.",
      },
      {
        q: "Как сюда вписывается «желательная сложность»?",
        a: "Исследования Robert Bjork по желательным сложностям показывают, что условия практики, которые делают обучение труднее в моменте — разнесённое повторение, чередование, сниженная обратная связь, — дают лучшее долгосрочное удержание. Это поведенческая сестра правила 85 %: для всего, что вы хотите сохранить, управляемая борьба бьёт лёгкое повторение.",
      },
    ],

    ctaEyebrow: "Практикуйте умнее",
    ctaHeading: "Программа, откалиброванная под зону 85 %.",
    ctaBody:
      "Каждое упражнение, урок и ветка Skill Tree в The Mambo Guild настроены так, чтобы держать вас в полосе сложности, где обучение действительно происходит. Построено на принципах науки об обучении сертифицированным Learning Experience Designer'ом.",

    howToName: "Как применить правило 85 % в одной тренировке по сальсе",
    howToDescription:
      "Протокол из 4 шагов, чтобы откалибровать сложность упражнения под математически оптимальную частоту ошибок 15,87 %.",
    howToSteps: [
      {
        name: "На сессию выбирайте один изолированный навык",
        text: "Не «тренируйте сальсу». Тренируйте одно конкретное: технику вращения, тайминг cross-body lead, шайн. Для измерения частоты попаданий нужно одно определение успеха/неудачи.",
      },
      {
        name: "Сделайте 10 повторов и честно оцените каждый",
        text: "Решите до начала, что считается попаданием, а что — промахом. После 10 повторов посчитайте попадания. Если 9 или 10 — упражнение слишком лёгкое. Если 5 или меньше — слишком сложное.",
      },
      {
        name: "Подкрутите регулятор сложности",
        text: "Слишком легко: поднимите темп на 10 %, добавьте слой стилизации рук, добавьте партнёра, выполните на не доминирующей стороне или уберите визуальную обратную связь. Слишком сложно: упрощайте, пока не стабилизируетесь на 8 попаданиях из 10.",
      },
      {
        name: "Удерживайтесь в полосе 80-90 % в течение 20 минут",
        text: "Когда вы попадаете 8-9 из 10 повторов, оставайтесь там для устойчивой практики. Это и есть зона, где мозжечок получает чистые сигналы ошибок, а моторная кора продолжает обновляться.",
      },
    ],
  },
  // ============================================================ PL
  pl: {
    metaTitle: "Reguła 85 %: jak twój mózg naprawdę uczy się tańczyć",
    metaDescription:
      "Artykuł z 2019 roku w Nature pokazał, że matematycznie optymalny współczynnik błędu w nauce to 15,87 %. Co to znaczy dla praktyki salsy, jak kalibrować swoje drille i dlaczego \"czysta\" praktyka zatrzymuje postępy.",

    breadcrumbHome: "Strona główna",
    breadcrumbBlog: "Blog",
    breadcrumbCurrent: "Reguła 85 %",

    badge: "Nauka treningu",
    h1Pre: "Reguła 85 %: ",
    h1Accent: "jak twój mózg naprawdę uczy się tańczyć",

    bylineCredential: "Certyfikowany w Learning Experience Design",

    shortAnswerRich:
      "Artykuł z 2019 roku w *Nature Human Behaviour* autorstwa Wilsona, Shenhava, Steine-Hanson i Cohena pokazał, że matematycznie optymalny współczynnik błędu przy zdobywaniu umiejętności to dokładnie **15,87 % porażek**, czyli około 85 % sukcesów. Powyżej tej wartości mózg nie potrafi zablokować się na czytelnym wzorcu. Poniżej — mózg uznaje umiejętność za \"załatwioną\" i przestaje ją ulepszać. To jest matematyka stojąca za tym, dlaczego czysta praktyka zatrzymuje postępy, a drille trochę za trudne są najszybszą drogą do poprawy.",

    sec1Title: "Samo badanie",
    sec1Paragraphs: [
      "W 2019 roku Robert Wilson i współpracownicy z Uniwersytetu Arizony opublikowali w *Nature Human Behaviour* tekst *„The Eighty Five Percent Rule for Optimal Learning\"*. Postawili precyzyjne pytanie: gdyby można było ustawić pokrętło trudności sesji treningowej na dowolną liczbę, na ile trzeba by je ustawić, żeby uczyć się tak szybko, jak to matematycznie możliwe?",
      "Odpowiedź wynika z kształtu standardowej krzywej uczenia: sigmoidy w kształcie litery S. Krzywa rośnie wolno, gdy umiejętność jest nowa, najszybciej w środku i wypłaszcza się u góry, gdy umiejętność jest opanowana. Wilson zapytał: w którym punkcie krzywej jej nachylenie (tempo poprawy na powtórzenie) jest najbardziej strome?",
      "Ten punkt, wyprowadzony z matematyki, to **15,87 % porażek**. Nie 10 %. Nie 25 %. 15,87 %. To konkretna liczba, która wypada z konkretnej krzywej, a nie czyjeś zgrubne przypuszczenie.",
    ],

    sec2Title: "Dlaczego twój mózg działa właśnie tak",
    sec2Paragraphs: [
      "Uczenie ruchu to pętla korekty błędu. Próbujesz coś, ciało wykonuje swoją wersję, a mózg porównuje to, co *zamierzałeś* zrobić, z tym, *co naprawdę się stało*. Rozbieżność generuje sygnał w móżdżku (obszar z tyłu mózgu, który dostraja ruch), i ten sygnał mówi twojej korze ruchowej: aktualizuj się.",
      "Jeśli każde powtórzenie kładziesz idealnie, nie ma rozbieżności. Nie ma sygnału. Mózg uznaje, że ruch jest załatwiony, i przekierowuje uwagę na to, co jeszcze się nie układa. Dlatego czysta praktyka wydaje się produktywna, ale daje malejące zwroty: powtarzasz to, co już umiesz, zamiast trenować to, co jeszcze się formuje.",
      "Jeśli zbyt wiele powtórzeń wypada nietrafnie, sygnał jest zaszumiony. Mózg nie potrafi odróżnić prawdziwego wzorca od losowego błędu. Naukowcy nazywają to **uczeniem sfrustrowanym**: pracujesz ciężko, ale mózg nie ma niczego stabilnego, do czego mógłby się aktualizować.",
      "Strefa 15 % porażek to miejsce, w którym sygnał jest czysty. Mózg z grubsza wie, co poszło nie tak, ma stabilny punkt odniesienia dla tego, jak wygląda dobrze, i może na każde powtórzenie zrobić mały update.",
    ],

    sec3Title: "Pożądana trudność (Bjork)",
    sec3Paragraphs: [
      "Reguła 85 % ma siostrę behawioralną: koncepcję **pożądanej trudności** (desirable difficulty) Roberta Bjorka. Bjork przez dekady pokazywał, że warunki praktyki, które *w danej chwili wydają się trudniejsze* (rozkładanie powtórzeń w czasie, przeplatanie różnych umiejętności, ograniczanie informacji zwrotnej), dają lepsze *długoterminowe* zatrzymanie. Skoncentrowana praktyka jednej umiejętności przy stałym feedbacku daje lepsze odczucie w trakcie i wyraźnie gorsze zatrzymanie tydzień później.",
      "Praktyczne znaczenie dla tańca: jeśli twoja sesja treningowa wydaje się bezwysiłkowa i gładka, to prawdopodobnie nie uczysz się wiele. Jeśli wydaje się odrobinę powyżej twojego obecnego poziomu (niewygodna, trochę chaotyczna, sporo uczciwych chybień), prawdopodobnie uczysz się blisko maksymalnego tempa, jakie pozwala mózg.",
    ],

    sec4Title: "Jak zastosować regułę 85 % w praktyce salsy",
    sec4Steps: [
      "**Wybierz jedną wyizolowaną umiejętność.** Nie ćwicz \"salsy\". Ćwicz coś konkretnego: przygotowanie do obrotu, cross-body lead na konkretnym takcie, sekwencję shines na konkretnym BPM. Do mierzenia współczynnika potrzebujesz binarnego kryterium trafienie/chybienie.",
      "**Zrób 10 powtórzeń i uczciwie je oceń.** Z góry zdefiniuj, co liczy się jako trafienie. Potem licz. 9 lub 10 trafień znaczy, że drill jest za łatwy. 5 lub mniej znaczy, że za trudny.",
      "**Podkręć pokrętło trudności.** Za łatwo: podnieś BPM o 10 %, dodaj warstwę stylowania rąk, zrób na stronie niedominującej, dodaj partnera albo zabierz feedback z lustra. Za trudno: upraszczaj, aż ustabilizujesz się na 8-9 trafieniach na 10.",
      "**Zostań w paśmie 80-90 %.** Kiedy znajdziesz pasmo, zostań w nim 15-20 ciągłych minut. To jest strefa, w której twój móżdżek produkuje czyste sygnały błędu, a kora ruchowa aktualizuje reprezentację ruchu z powtórzenia na powtórzenie.",
    ],

    sec5Title: "Dlaczego \"czysta\" praktyka jest przyjemna, ale uczy mniej",
    sec5Paragraphs: [
      "Jeśli kiedykolwiek skończyłeś 60-minutową sesję, w której każde powtórzenie szło gładko, i wyszedłeś z myślą \"super było\", to prawdopodobnie nauczyłeś siebie mniej, niż nauczyłbyś się przez 20 minut brudnego drillingu na granicy swoich możliwości.",
      "Mózg nie nagradza wysiłku. Mózg nagradza błąd predykcji, i to konkretnie: w ilości znośnej. Godzina powtarzania tego, co już umiesz, trzyma taniec bezpiecznie wewnątrz strefy komfortu i prawie wcale nie generuje sygnału aktualizacji. Dwadzieścia minut drilla na 85 % skuteczności, w którym chybiasz dwa razy na dziesięć powtórzeń i uczciwie czujesz te chybienia, to miejsce, w którym naprawdę pracuje neurologia uczenia.",
      "To nie argument za karaniem siebie. To argument za *kalibracją*. Twoja praktyka powinna sprawiać wrażenie uczciwie trudnej, ale nie miażdżącej. 15 % porażek, nie 50 %.",
    ],

    sec6Title: "Jak to wygląda w ustrukturyzowanym programie",
    sec6Paragraphs: [
      "Program The Mambo Guild jest zbudowany wokół tej zasady. Każda lekcja otwiera następną według jasnego kryterium opanowania. Każdy drill ma suwak trudności. Skill Tree odblokowuje nową gałąź dopiero wtedy, gdy potrafisz wykonywać aktualną gałąź konsekwentnie — nie bezbłędnie, ale konsekwentnie. Cały sens jest w tym, żeby trzymać cię w paśmie 85 %, bez konieczności mierzenia własnej skuteczności kartką w ręce.",
      "Alternatywa (chodzenie na losowe zajęcia, drilling tego, co akurat trener przerabiał w tym tygodniu) prawie zawsze stawia cię albo zbyt nisko (nuda, powtarzasz to, co umiesz), albo zbyt wysoko (zgubiony, niczego się nie uczysz). Oba tryby porażki widać w plateau, na które samouki w salsie wpadają zwykle po sześciu do dziewięciu miesiącach swobodnej nauki.",
    ],

    sec7Title: "Źródła",
    sec7Sources: [
      "Wilson, R.C., Shenhav, A., Steine-Hanson, M. & Cohen, J.D. (2019). *The Eighty Five Percent Rule for Optimal Learning*. Nature Human Behaviour, 3, 1316-1323.",
      "Bjork, R.A. (1994). Memory and Metamemory Considerations in the Training of Human Beings. W: J. Metcalfe i A. Shimamura (red.), *Metacognition*. MIT Press.",
      "Schmidt, R.A. & Lee, T.D. (2011). *Motor Learning and Performance: From Principles to Application* (wyd. 5). Human Kinetics.",
    ],

    faqs: [
      {
        q: "Czym jest reguła 85 % w prostych słowach?",
        a: "Artykuł z 2019 roku w Nature Human Behaviour pokazał, że ludzki mózg uczy się nowych umiejętności najszybciej, gdy trudność praktyki jest skalibrowana tak, żeby udawało się około 85 % razy, a nie udawało się około 15 %. Dokładne optimum to 15,87 % porażek. Praktyka przy znacznie wyższym lub niższym wskaźniku błędów spowalnia naukę.",
      },
      {
        q: "Skąd bierze się liczba 15,87 %?",
        a: "Wynika matematycznie z kształtu standardowej krzywej uczenia (sigmoidy). Nachylenie krzywej, czyli tempo poprawy na powtórzenie, jest maksymalne w konkretnym punkcie, a ten punkt odpowiada wskaźnikowi porażek 15,87 %. To nie jest empiryczne zgadywanie; ta liczba wypada z samej matematyki.",
      },
      {
        q: "Czy reguła 85 % stosuje się do wszystkich umiejętności, w tym do tańca?",
        a: "Artykuł Wilsona i in. dotyczył uczenia w modelach sieci neuronowych i zadaniach klasyfikacji binarnej, ale silnie generalizuje się na każdą umiejętność, w której mózg produkuje wyjście ruchowe i aktualizuje się w oparciu o sprzężenie zwrotne. Taniec to podręcznikowy przypadek uczenia ruchowego.",
      },
      {
        q: "A jeśli chcę wykonać układ czysto, bez błędów?",
        a: "Praktyka i występ to różne tryby. Trenuj na 85 % skuteczności, a występuj na 100 %. Strefa 15 % porażek to miejsce, w którym dzieje się uczenie; strefa 100 % to miejsce, w którym potwierdzasz, że uczenie jest stabilne.",
      },
      {
        q: "Jak wpasowuje się tu „pożądana trudność\"?",
        a: "Badania Roberta Bjorka nad pożądaną trudnością pokazują, że warunki praktyki, które w danej chwili sprawiają, że uczenie wydaje się trudniejsze — repetycje rozłożone w czasie, przeplatanie, mniej informacji zwrotnej — dają lepsze długoterminowe zatrzymanie. To behawioralna siostra reguły 85 %: znośne zmaganie wygrywa z bezwysiłkowym powtarzaniem we wszystkim, co chcesz zatrzymać.",
      },
    ],

    ctaEyebrow: "Ćwicz mądrzej",
    ctaHeading: "Program skalibrowany do strefy 85 %.",
    ctaBody:
      "Każdy drill, lekcja i gałąź Skill Tree w The Mambo Guild jest dostrojona, żeby utrzymywać cię w paśmie trudności, w którym uczenie naprawdę się dzieje. Zbudowane na zasadach nauk o uczeniu się przez certyfikowanego Learning Experience Designera.",

    howToName: "Jak zastosować regułę 85 % w jednej sesji praktyki salsy",
    howToDescription:
      "Czteroetapowy protokół, by wykalibrować trudność drilla do matematycznie optymalnego wskaźnika błędów 15,87 %.",
    howToSteps: [
      {
        name: "Na sesję wybierz jedną wyizolowaną umiejętność",
        text: "Nie ćwicz „salsy\". Ćwicz jedną konkretną rzecz: technikę obrotu, timing cross-body leada, shine. Do mierzenia skuteczności potrzebujesz pojedynczej definicji sukcesu/porażki.",
      },
      {
        name: "Wykonaj 10 powtórzeń i uczciwie oceń każde",
        text: "Zanim zaczniesz, zdecyduj, co liczy się jako trafienie, a co jako chybienie. Po 10 powtórzeniach policz trafienia. Jeśli wyszło 9 lub 10, drill jest za łatwy. Jeśli 5 lub mniej, jest za trudny.",
      },
      {
        name: "Podkręć pokrętło trudności",
        text: "Za łatwo: zwiększ tempo o 10 %, dodaj warstwę stylowania rąk, dodaj partnera, zrób wersję na stronie niedominującej albo zabierz wzrokową informację zwrotną. Za trudno: upraszczaj, aż ustabilizujesz się na 8 trafieniach na 10.",
      },
      {
        name: "Zostań w paśmie 80-90 % przez 20 minut",
        text: "Kiedy zaczniesz trafiać 8-9 powtórzeń na 10, zostań tam, żeby utrzymać praktykę. To strefa, w której móżdżek dostaje wyraźne sygnały błędu, a kora ruchowa nadal się aktualizuje.",
      },
    ],
  },
  nl: {} as EightyFiveContent,
  ar: {} as EightyFiveContent,
  el: {} as EightyFiveContent,
  sr: {} as EightyFiveContent,
  tr: {} as EightyFiveContent,
};

export function getEightyFiveContent(locale: Locale): EightyFiveContent {
  const c = CONTENT[locale];
  if (!c || !c.metaTitle) return CONTENT.en;
  return c;
}
