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
  ja: {} as EightyFiveContent,
  ko: {} as EightyFiveContent,
  zh: {} as EightyFiveContent,
  ru: {} as EightyFiveContent,
  pl: {} as EightyFiveContent,
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
