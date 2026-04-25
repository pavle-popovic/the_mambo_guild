/**
 * Blog hub content per locale. Sourced manually in-session (per user
 * preference). When a translation drifts, edit here, not the page file.
 *
 * Each entry follows the same shape, so the page renderer is locale-agnostic.
 *
 * Brand and dance-vocabulary terms (The Mambo Guild, Pavle Popovic, Mambo,
 * Salsa, Salsa On1, Salsa On2, Eddie Torres, Arsenio Rodriguez, Palladium,
 * Cuban Danzon, Cuban Son, etc.) are kept in the original spelling.
 */
import type { Locale } from "@/i18n/config";

export type PostCard = {
  href: string;
  badge: string;
  title: string;
  description: string;
  readTime: string;
  date: string;
};

export type BlogHubContent = {
  metaTitle: string;
  metaDescription: string;
  heroBreadcrumbHome: string;
  heroBreadcrumbCurrent: string;
  heroHeading: string; // the gold "The Blog." accent
  heroSubhead: string;
  readArticleCta: string;
  posts: PostCard[];
};

const COMMON_DATE_EN = "Apr 25, 2026";

// Per-locale localized date for "Apr 25, 2026". Numerals stay Latin (we keep
// numeric formatting consistent across the site).
const DATE_BY_LOCALE: Record<Locale, string> = {
  en: "Apr 25, 2026",
  es: "25 abr 2026",
  pt: "25 abr 2026",
  fr: "25 avr. 2026",
  de: "25. Apr. 2026",
  it: "25 apr 2026",
  ja: "2026年4月25日",
  ko: "2026년 4월 25일",
  zh: "2026年4月25日",
  ru: "25 апр. 2026",
  pl: "25 kwi 2026",
  nl: "25 apr 2026",
  ar: "25 أبريل 2026",
  el: "25 Απρ 2026",
  sr: "25. апр 2026",
  tr: "25 Nis 2026",
};

const HUB_BY_LOCALE: Record<Locale, BlogHubContent> = {
  en: {
    metaTitle: "Blog: Salsa On2 guides, history, and training science",
    metaDescription:
      "Long-form articles on Salsa On2, the history of Mambo, and the learning-science principles behind the Mambo Guild curriculum. Written by a 2x European Champion.",
    heroBreadcrumbHome: "Home",
    heroBreadcrumbCurrent: "Blog",
    heroHeading: "The Blog.",
    heroSubhead:
      "Long-form guides on Salsa On2, the history of Mambo, and the training-science principles behind the curriculum.",
    readArticleCta: "Read article",
    posts: [
      {
        href: "/what-is-salsa-on2",
        badge: "The Guide",
        title: "What is Salsa On2? The Complete Guide to New York Style Mambo",
        description:
          "Definition, history, biomechanics, and a 5-step path for a complete beginner to start dancing Salsa On2.",
        readTime: "12 min read",
        date: DATE_BY_LOCALE.en,
      },
      {
        href: "/salsa-on1-vs-on2",
        badge: "Comparison",
        title: "Salsa On1 vs Salsa On2: Which Should You Learn First?",
        description:
          "Full side-by-side: feel, history, global scenes, and a practical framework for choosing your first style.",
        readTime: "9 min read",
        date: DATE_BY_LOCALE.en,
      },
      {
        href: "/blog/mambo-history",
        badge: "History",
        title: "The Birth of Mambo: From Havana to the Palladium",
        description:
          "How Mambo emerged from Cuban Danzon and Son, was forged by Arsenio Rodriguez, and was codified as modern Salsa On2 by Eddie Torres.",
        readTime: "14 min read",
        date: DATE_BY_LOCALE.en,
      },
      {
        href: "/blog/the-85-percent-rule",
        badge: "Training Science",
        title: "The 85% Rule: How Your Brain Actually Learns to Dance",
        description:
          "A 2019 Nature paper pinpointed the optimal error rate for learning at 15.87%. Here is what that means for your salsa drills.",
        readTime: "10 min read",
        date: DATE_BY_LOCALE.en,
      },
    ],
  },

  es: {
    metaTitle: "Blog: guías de Salsa On2, historia y ciencia del entrenamiento",
    metaDescription:
      "Artículos largos sobre Salsa On2, la historia del Mambo y los principios de ciencia del aprendizaje detrás del currículum de Mambo Guild. Escritos por un 2x Campeón de Europa.",
    heroBreadcrumbHome: "Inicio",
    heroBreadcrumbCurrent: "Blog",
    heroHeading: "El Blog.",
    heroSubhead:
      "Guías largas sobre Salsa On2, la historia del Mambo y los principios de ciencia del entrenamiento detrás del currículum.",
    readArticleCta: "Leer artículo",
    posts: [
      {
        href: "/what-is-salsa-on2",
        badge: "La Guía",
        title: "¿Qué es la Salsa On2? La guía completa al Mambo Estilo Nueva York",
        description:
          "Definición, historia, biomecánica y un camino de 5 pasos para que un principiante absoluto empiece a bailar Salsa On2.",
        readTime: "12 min de lectura",
        date: DATE_BY_LOCALE.es,
      },
      {
        href: "/salsa-on1-vs-on2",
        badge: "Comparación",
        title: "Salsa On1 vs Salsa On2: ¿cuál deberías aprender primero?",
        description:
          "Comparación completa lado a lado: feeling, historia, escenas globales y un marco práctico para elegir tu primer estilo.",
        readTime: "9 min de lectura",
        date: DATE_BY_LOCALE.es,
      },
      {
        href: "/blog/mambo-history",
        badge: "Historia",
        title: "El nacimiento del Mambo: de La Habana al Palladium",
        description:
          "Cómo el Mambo surgió del Danzón y el Son cubanos, fue forjado por Arsenio Rodríguez y codificado como la Salsa On2 moderna por Eddie Torres.",
        readTime: "14 min de lectura",
        date: DATE_BY_LOCALE.es,
      },
      {
        href: "/blog/the-85-percent-rule",
        badge: "Ciencia del Entrenamiento",
        title: "La regla del 85%: cómo tu cerebro aprende de verdad a bailar",
        description:
          "Un artículo de Nature de 2019 fijó la tasa óptima de error para el aprendizaje en 15,87%. Aquí está lo que eso significa para tus drills de salsa.",
        readTime: "10 min de lectura",
        date: DATE_BY_LOCALE.es,
      },
    ],
  },

  pt: {
    metaTitle: "Blog: guias de Salsa On2, história e ciência do treino",
    metaDescription:
      "Artigos longos sobre Salsa On2, a história do Mambo e os princípios da ciência da aprendizagem por trás do currículo da Mambo Guild. Escritos por um 2x Campeão Europeu.",
    heroBreadcrumbHome: "Início",
    heroBreadcrumbCurrent: "Blog",
    heroHeading: "O Blog.",
    heroSubhead:
      "Guias longos sobre Salsa On2, a história do Mambo e os princípios da ciência do treino por trás do currículo.",
    readArticleCta: "Ler artigo",
    posts: [
      {
        href: "/what-is-salsa-on2",
        badge: "O Guia",
        title: "O que é Salsa On2? O guia completo do Mambo Estilo Nova York",
        description:
          "Definição, história, biomecânica e um caminho de 5 passos para um iniciante absoluto começar a dançar Salsa On2.",
        readTime: "12 min de leitura",
        date: DATE_BY_LOCALE.pt,
      },
      {
        href: "/salsa-on1-vs-on2",
        badge: "Comparação",
        title: "Salsa On1 vs Salsa On2: qual deves aprender primeiro?",
        description:
          "Comparação lado a lado completa: feeling, história, cenas globais e um quadro prático para escolher o teu primeiro estilo.",
        readTime: "9 min de leitura",
        date: DATE_BY_LOCALE.pt,
      },
      {
        href: "/blog/mambo-history",
        badge: "História",
        title: "O nascimento do Mambo: de Havana ao Palladium",
        description:
          "Como o Mambo emergiu do Danzón e do Son cubanos, foi forjado por Arsenio Rodríguez e codificado como Salsa On2 moderna por Eddie Torres.",
        readTime: "14 min de leitura",
        date: DATE_BY_LOCALE.pt,
      },
      {
        href: "/blog/the-85-percent-rule",
        badge: "Ciência do Treino",
        title: "A regra dos 85%: como o teu cérebro realmente aprende a dançar",
        description:
          "Um artigo da Nature de 2019 identificou a taxa de erro ideal para a aprendizagem em 15,87%. Eis o que isso significa para os teus drills de salsa.",
        readTime: "10 min de leitura",
        date: DATE_BY_LOCALE.pt,
      },
    ],
  },

  fr: {
    metaTitle: "Blog : guides de Salsa On2, histoire et science de l'entraînement",
    metaDescription:
      "Articles longs sur la Salsa On2, l'histoire du Mambo et les principes de science de l'apprentissage derrière le programme de The Mambo Guild. Écrits par un 2x Champion d'Europe.",
    heroBreadcrumbHome: "Accueil",
    heroBreadcrumbCurrent: "Blog",
    heroHeading: "Le Blog.",
    heroSubhead:
      "Guides longs sur la Salsa On2, l'histoire du Mambo et les principes de science de l'entraînement derrière le programme.",
    readArticleCta: "Lire l'article",
    posts: [
      {
        href: "/what-is-salsa-on2",
        badge: "Le Guide",
        title: "Qu'est-ce que la Salsa On2 ? Le guide complet du Mambo Style New York",
        description:
          "Définition, histoire, biomécanique et un parcours en 5 étapes pour un débutant absolu pour commencer à danser la Salsa On2.",
        readTime: "12 min de lecture",
        date: DATE_BY_LOCALE.fr,
      },
      {
        href: "/salsa-on1-vs-on2",
        badge: "Comparaison",
        title: "Salsa On1 vs Salsa On2 : laquelle apprendre en premier ?",
        description:
          "Comparaison côte à côte complète : feeling, histoire, scènes mondiales et un cadre pratique pour choisir ton premier style.",
        readTime: "9 min de lecture",
        date: DATE_BY_LOCALE.fr,
      },
      {
        href: "/blog/mambo-history",
        badge: "Histoire",
        title: "La naissance du Mambo : de La Havane au Palladium",
        description:
          "Comment le Mambo a émergé du Danzón et du Son cubains, a été forgé par Arsenio Rodríguez et codifié comme la Salsa On2 moderne par Eddie Torres.",
        readTime: "14 min de lecture",
        date: DATE_BY_LOCALE.fr,
      },
      {
        href: "/blog/the-85-percent-rule",
        badge: "Science de l'Entraînement",
        title: "La règle des 85% : comment ton cerveau apprend vraiment à danser",
        description:
          "Un article de Nature de 2019 a identifié le taux d'erreur optimal pour l'apprentissage à 15,87%. Voici ce que cela signifie pour tes drills de salsa.",
        readTime: "10 min de lecture",
        date: DATE_BY_LOCALE.fr,
      },
    ],
  },

  de: {
    metaTitle: "Blog: Salsa On2 Guides, Geschichte und Trainingswissenschaft",
    metaDescription:
      "Lange Artikel über Salsa On2, die Geschichte des Mambo und die lernwissenschaftlichen Prinzipien hinter dem Mambo Guild Curriculum. Geschrieben von einem 2x Europameister.",
    heroBreadcrumbHome: "Startseite",
    heroBreadcrumbCurrent: "Blog",
    heroHeading: "Der Blog.",
    heroSubhead:
      "Lange Guides über Salsa On2, die Geschichte des Mambo und die trainingswissenschaftlichen Prinzipien hinter dem Curriculum.",
    readArticleCta: "Artikel lesen",
    posts: [
      {
        href: "/what-is-salsa-on2",
        badge: "Der Guide",
        title: "Was ist Salsa On2? Der vollständige Guide zum New York Style Mambo",
        description:
          "Definition, Geschichte, Biomechanik und ein 5-Schritte-Pfad für absolute Anfänger, um Salsa On2 zu lernen.",
        readTime: "12 Min. Lesezeit",
        date: DATE_BY_LOCALE.de,
      },
      {
        href: "/salsa-on1-vs-on2",
        badge: "Vergleich",
        title: "Salsa On1 vs. Salsa On2: Welche solltest du zuerst lernen?",
        description:
          "Voller Side-by-Side-Vergleich: Feeling, Geschichte, weltweite Szenen und ein praktischer Rahmen, um deinen ersten Stil zu wählen.",
        readTime: "9 Min. Lesezeit",
        date: DATE_BY_LOCALE.de,
      },
      {
        href: "/blog/mambo-history",
        badge: "Geschichte",
        title: "Die Geburt des Mambo: Von Havanna zum Palladium",
        description:
          "Wie der Mambo aus dem kubanischen Danzón und Son entstand, von Arsenio Rodríguez geprägt und von Eddie Torres als moderne Salsa On2 kodifiziert wurde.",
        readTime: "14 Min. Lesezeit",
        date: DATE_BY_LOCALE.de,
      },
      {
        href: "/blog/the-85-percent-rule",
        badge: "Trainingswissenschaft",
        title: "Die 85%-Regel: Wie dein Gehirn wirklich tanzen lernt",
        description:
          "Eine Nature-Studie von 2019 ermittelte die optimale Fehlerquote für das Lernen mit 15,87%. Was das für deine Salsa-Drills bedeutet.",
        readTime: "10 Min. Lesezeit",
        date: DATE_BY_LOCALE.de,
      },
    ],
  },

  it: {
    metaTitle: "Blog: guide di Salsa On2, storia e scienza dell'allenamento",
    metaDescription:
      "Articoli lunghi sulla Salsa On2, la storia del Mambo e i principi di scienza dell'apprendimento dietro il curriculum di The Mambo Guild. Scritti da un 2x Campione Europeo.",
    heroBreadcrumbHome: "Home",
    heroBreadcrumbCurrent: "Blog",
    heroHeading: "Il Blog.",
    heroSubhead:
      "Guide lunghe sulla Salsa On2, la storia del Mambo e i principi di scienza dell'allenamento dietro il curriculum.",
    readArticleCta: "Leggi l'articolo",
    posts: [
      {
        href: "/what-is-salsa-on2",
        badge: "La Guida",
        title: "Cos'è la Salsa On2? La guida completa al Mambo Stile New York",
        description:
          "Definizione, storia, biomeccanica e un percorso in 5 passi per un principiante assoluto che vuole iniziare a ballare Salsa On2.",
        readTime: "12 min di lettura",
        date: DATE_BY_LOCALE.it,
      },
      {
        href: "/salsa-on1-vs-on2",
        badge: "Confronto",
        title: "Salsa On1 vs Salsa On2: quale dovresti imparare per prima?",
        description:
          "Confronto fianco a fianco completo: feeling, storia, scene globali e una struttura pratica per scegliere il tuo primo stile.",
        readTime: "9 min di lettura",
        date: DATE_BY_LOCALE.it,
      },
      {
        href: "/blog/mambo-history",
        badge: "Storia",
        title: "La nascita del Mambo: dall'Avana al Palladium",
        description:
          "Come il Mambo è emerso dal Danzón e dal Son cubani, è stato forgiato da Arsenio Rodríguez e codificato come Salsa On2 moderna da Eddie Torres.",
        readTime: "14 min di lettura",
        date: DATE_BY_LOCALE.it,
      },
      {
        href: "/blog/the-85-percent-rule",
        badge: "Scienza dell'Allenamento",
        title: "La regola dell'85%: come il tuo cervello impara davvero a ballare",
        description:
          "Un articolo di Nature del 2019 ha individuato il tasso di errore ottimale per l'apprendimento al 15,87%. Ecco cosa significa per i tuoi drill di salsa.",
        readTime: "10 min di lettura",
        date: DATE_BY_LOCALE.it,
      },
    ],
  },

  ja: {
    metaTitle: "ブログ：Salsa On2 ガイド、歴史、トレーニング科学",
    metaDescription:
      "Salsa On2、Mamboの歴史、そしてThe Mambo Guildカリキュラムの背景にある学習科学の原則についての長文記事。2度の欧州チャンピオンによる執筆。",
    heroBreadcrumbHome: "ホーム",
    heroBreadcrumbCurrent: "ブログ",
    heroHeading: "ブログ。",
    heroSubhead:
      "Salsa On2、Mamboの歴史、そしてカリキュラムの背景にあるトレーニング科学の原則についての長文ガイド。",
    readArticleCta: "記事を読む",
    posts: [
      {
        href: "/what-is-salsa-on2",
        badge: "ガイド",
        title: "Salsa On2とは？ニューヨークスタイル Mambo の完全ガイド",
        description:
          "定義、歴史、バイオメカニクス、そして全くの初心者が Salsa On2 を踊り始めるための5ステップの道筋。",
        readTime: "12分で読了",
        date: DATE_BY_LOCALE.ja,
      },
      {
        href: "/salsa-on1-vs-on2",
        badge: "比較",
        title: "Salsa On1 vs Salsa On2：どちらを先に学ぶべきか？",
        description:
          "フィーリング、歴史、世界のシーンを並べて比較し、最初のスタイルを選ぶための実用的な枠組み。",
        readTime: "9分で読了",
        date: DATE_BY_LOCALE.ja,
      },
      {
        href: "/blog/mambo-history",
        badge: "歴史",
        title: "Mamboの誕生：ハバナから Palladium へ",
        description:
          "Mamboがどのようにキューバの Danzón と Son から生まれ、Arsenio Rodríguez によって形作られ、Eddie Torres によって現代の Salsa On2 として体系化されたか。",
        readTime: "14分で読了",
        date: DATE_BY_LOCALE.ja,
      },
      {
        href: "/blog/the-85-percent-rule",
        badge: "トレーニング科学",
        title: "85%ルール：脳が実際にダンスを学ぶ仕組み",
        description:
          "2019年のNature論文が学習に最適なエラー率を15.87%と特定した。それがあなたのサルサ練習にとって何を意味するか。",
        readTime: "10分で読了",
        date: DATE_BY_LOCALE.ja,
      },
    ],
  },

  ko: {
    metaTitle: "블로그: Salsa On2 가이드, 역사, 그리고 트레이닝 과학",
    metaDescription:
      "Salsa On2, Mambo의 역사, 그리고 The Mambo Guild 커리큘럼 뒤에 있는 학습 과학 원칙에 대한 장문 기사. 2회 유럽 챔피언이 직접 집필.",
    heroBreadcrumbHome: "홈",
    heroBreadcrumbCurrent: "블로그",
    heroHeading: "블로그.",
    heroSubhead:
      "Salsa On2, Mambo의 역사, 그리고 커리큘럼 뒤에 있는 트레이닝 과학 원칙에 대한 장문 가이드.",
    readArticleCta: "기사 읽기",
    posts: [
      {
        href: "/what-is-salsa-on2",
        badge: "가이드",
        title: "Salsa On2란? 뉴욕 스타일 Mambo 완벽 가이드",
        description:
          "정의, 역사, 생체역학, 그리고 완전 초보자가 Salsa On2를 추기 시작하는 5단계 경로.",
        readTime: "12분 분량",
        date: DATE_BY_LOCALE.ko,
      },
      {
        href: "/salsa-on1-vs-on2",
        badge: "비교",
        title: "Salsa On1 vs Salsa On2: 어느 쪽을 먼저 배워야 할까?",
        description:
          "느낌, 역사, 세계 씬을 나란히 비교하고, 첫 스타일을 고르기 위한 실용적인 프레임워크.",
        readTime: "9분 분량",
        date: DATE_BY_LOCALE.ko,
      },
      {
        href: "/blog/mambo-history",
        badge: "역사",
        title: "Mambo의 탄생: 아바나에서 Palladium까지",
        description:
          "Mambo가 어떻게 쿠바의 Danzón과 Son에서 시작되어, Arsenio Rodríguez에 의해 다듬어지고, Eddie Torres에 의해 현대의 Salsa On2로 체계화되었는지.",
        readTime: "14분 분량",
        date: DATE_BY_LOCALE.ko,
      },
      {
        href: "/blog/the-85-percent-rule",
        badge: "트레이닝 과학",
        title: "85% 법칙: 뇌가 실제로 춤을 배우는 방식",
        description:
          "2019년 Nature 논문이 학습에 최적인 오류율을 15.87%로 밝혔다. 이것이 너의 살사 드릴에 어떤 의미인지.",
        readTime: "10분 분량",
        date: DATE_BY_LOCALE.ko,
      },
    ],
  },

  zh: {
    metaTitle: "博客：Salsa On2 指南、历史与训练科学",
    metaDescription:
      "关于 Salsa On2、Mambo 历史以及 The Mambo Guild 课程背后学习科学原理的长文。由 2 届欧洲冠军撰写。",
    heroBreadcrumbHome: "首页",
    heroBreadcrumbCurrent: "博客",
    heroHeading: "博客。",
    heroSubhead:
      "关于 Salsa On2、Mambo 历史以及课程背后训练科学原理的长篇指南。",
    readArticleCta: "阅读文章",
    posts: [
      {
        href: "/what-is-salsa-on2",
        badge: "指南",
        title: "什么是 Salsa On2？纽约风格 Mambo 完整指南",
        description:
          "定义、历史、生物力学,以及让完全的初学者开始跳 Salsa On2 的 5 步路径。",
        readTime: "12 分钟阅读",
        date: DATE_BY_LOCALE.zh,
      },
      {
        href: "/salsa-on1-vs-on2",
        badge: "对比",
        title: "Salsa On1 与 Salsa On2:先学哪一种?",
        description:
          "完整并列对比:感觉、历史、全球场景,以及选择第一种风格的实用框架。",
        readTime: "9 分钟阅读",
        date: DATE_BY_LOCALE.zh,
      },
      {
        href: "/blog/mambo-history",
        badge: "历史",
        title: "Mambo 的诞生:从哈瓦那到 Palladium",
        description:
          "Mambo 如何从古巴 Danzón 和 Son 中诞生,被 Arsenio Rodríguez 锻造,并由 Eddie Torres 编纂为现代 Salsa On2。",
        readTime: "14 分钟阅读",
        date: DATE_BY_LOCALE.zh,
      },
      {
        href: "/blog/the-85-percent-rule",
        badge: "训练科学",
        title: "85% 法则:大脑究竟如何学会跳舞",
        description:
          "2019 年 Nature 论文确定学习的最佳错误率为 15.87%。这对你的萨尔萨练习意味着什么。",
        readTime: "10 分钟阅读",
        date: DATE_BY_LOCALE.zh,
      },
    ],
  },

  ru: {
    metaTitle: "Блог: гайды по Salsa On2, история и наука тренировок",
    metaDescription:
      "Длинные статьи о Salsa On2, истории Mambo и принципах науки об обучении, лежащих в основе программы The Mambo Guild. Написаны 2-кратным чемпионом Европы.",
    heroBreadcrumbHome: "Главная",
    heroBreadcrumbCurrent: "Блог",
    heroHeading: "Блог.",
    heroSubhead:
      "Длинные гайды о Salsa On2, истории Mambo и принципах науки тренировок, лежащих в основе программы.",
    readArticleCta: "Читать статью",
    posts: [
      {
        href: "/what-is-salsa-on2",
        badge: "Гайд",
        title: "Что такое Salsa On2? Полный гайд по нью-йоркскому Mambo",
        description:
          "Определение, история, биомеханика и 5-шаговый путь для абсолютного новичка, чтобы начать танцевать Salsa On2.",
        readTime: "12 мин чтения",
        date: DATE_BY_LOCALE.ru,
      },
      {
        href: "/salsa-on1-vs-on2",
        badge: "Сравнение",
        title: "Salsa On1 vs Salsa On2: какую учить первой?",
        description:
          "Полное сравнение бок о бок: ощущение, история, мировые сцены и практический фреймворк для выбора первого стиля.",
        readTime: "9 мин чтения",
        date: DATE_BY_LOCALE.ru,
      },
      {
        href: "/blog/mambo-history",
        badge: "История",
        title: "Рождение Mambo: от Гаваны до Palladium",
        description:
          "Как Mambo возник из кубинских Danzón и Son, был выкован Arsenio Rodríguez и кодифицирован как современная Salsa On2 Eddie Torres.",
        readTime: "14 мин чтения",
        date: DATE_BY_LOCALE.ru,
      },
      {
        href: "/blog/the-85-percent-rule",
        badge: "Наука тренировок",
        title: "Правило 85%: как мозг на самом деле учится танцевать",
        description:
          "Статья в Nature 2019 года определила оптимальный уровень ошибок для обучения в 15,87%. Вот что это значит для твоих сальса-дриллов.",
        readTime: "10 мин чтения",
        date: DATE_BY_LOCALE.ru,
      },
    ],
  },

  pl: {
    metaTitle: "Blog: poradniki Salsa On2, historia i nauka treningu",
    metaDescription:
      "Długie artykuły o Salsa On2, historii Mambo i zasadach nauki uczenia się stojących za programem The Mambo Guild. Napisane przez 2-krotnego Mistrza Europy.",
    heroBreadcrumbHome: "Strona główna",
    heroBreadcrumbCurrent: "Blog",
    heroHeading: "Blog.",
    heroSubhead:
      "Długie poradniki o Salsa On2, historii Mambo i zasadach nauki treningu stojących za programem.",
    readArticleCta: "Czytaj artykuł",
    posts: [
      {
        href: "/what-is-salsa-on2",
        badge: "Poradnik",
        title: "Czym jest Salsa On2? Kompletny przewodnik po nowojorskim stylu Mambo",
        description:
          "Definicja, historia, biomechanika oraz 5-krokowa ścieżka dla zupełnego początkującego, by zacząć tańczyć Salsa On2.",
        readTime: "12 min czytania",
        date: DATE_BY_LOCALE.pl,
      },
      {
        href: "/salsa-on1-vs-on2",
        badge: "Porównanie",
        title: "Salsa On1 vs Salsa On2: której uczyć się najpierw?",
        description:
          "Pełne porównanie obok siebie: feeling, historia, sceny na świecie oraz praktyczne ramy do wyboru pierwszego stylu.",
        readTime: "9 min czytania",
        date: DATE_BY_LOCALE.pl,
      },
      {
        href: "/blog/mambo-history",
        badge: "Historia",
        title: "Narodziny Mambo: z Hawany do Palladium",
        description:
          "Jak Mambo wyłoniło się z kubańskiego Danzón i Son, zostało ukute przez Arsenio Rodrígueza i skodyfikowane jako nowoczesna Salsa On2 przez Eddie Torresa.",
        readTime: "14 min czytania",
        date: DATE_BY_LOCALE.pl,
      },
      {
        href: "/blog/the-85-percent-rule",
        badge: "Nauka treningu",
        title: "Reguła 85%: jak twój mózg naprawdę uczy się tańczyć",
        description:
          "Artykuł w Nature z 2019 roku wyznaczył optymalny wskaźnik błędów dla uczenia się na poziomie 15,87%. Oto, co to oznacza dla twoich treningów salsy.",
        readTime: "10 min czytania",
        date: DATE_BY_LOCALE.pl,
      },
    ],
  },

  nl: {
    metaTitle: "Blog: gidsen voor Salsa On2, geschiedenis en trainingswetenschap",
    metaDescription:
      "Lange artikelen over Salsa On2, de geschiedenis van Mambo en de leerwetenschappelijke principes achter het The Mambo Guild curriculum. Geschreven door een 2x Europees Kampioen.",
    heroBreadcrumbHome: "Home",
    heroBreadcrumbCurrent: "Blog",
    heroHeading: "De Blog.",
    heroSubhead:
      "Lange gidsen over Salsa On2, de geschiedenis van Mambo en de trainingswetenschappelijke principes achter het curriculum.",
    readArticleCta: "Lees artikel",
    posts: [
      {
        href: "/what-is-salsa-on2",
        badge: "De Gids",
        title: "Wat is Salsa On2? De complete gids voor New York Style Mambo",
        description:
          "Definitie, geschiedenis, biomechanica en een 5-stappenpad voor een complete beginner om Salsa On2 te leren dansen.",
        readTime: "12 min lezen",
        date: DATE_BY_LOCALE.nl,
      },
      {
        href: "/salsa-on1-vs-on2",
        badge: "Vergelijking",
        title: "Salsa On1 vs Salsa On2: welke moet je eerst leren?",
        description:
          "Volledige zij-aan-zij vergelijking: gevoel, geschiedenis, mondiale scenes en een praktisch kader om je eerste stijl te kiezen.",
        readTime: "9 min lezen",
        date: DATE_BY_LOCALE.nl,
      },
      {
        href: "/blog/mambo-history",
        badge: "Geschiedenis",
        title: "De geboorte van Mambo: van Havana tot het Palladium",
        description:
          "Hoe Mambo voortkwam uit de Cubaanse Danzón en Son, werd gesmeed door Arsenio Rodríguez en gecodificeerd als moderne Salsa On2 door Eddie Torres.",
        readTime: "14 min lezen",
        date: DATE_BY_LOCALE.nl,
      },
      {
        href: "/blog/the-85-percent-rule",
        badge: "Trainingswetenschap",
        title: "De 85%-regel: hoe je brein echt leert dansen",
        description:
          "Een Nature-paper uit 2019 lokaliseerde de optimale foutpercentage voor leren op 15,87%. Dit is wat dat betekent voor je salsa-drills.",
        readTime: "10 min lezen",
        date: DATE_BY_LOCALE.nl,
      },
    ],
  },

  ar: {
    metaTitle: "المدونة: أدلة Salsa On2 والتاريخ وعلم التدريب",
    metaDescription:
      "مقالات طويلة عن Salsa On2 وتاريخ Mambo ومبادئ علم التعلم وراء منهج The Mambo Guild. كتبها بطل أوروبا مرتين.",
    heroBreadcrumbHome: "الرئيسية",
    heroBreadcrumbCurrent: "المدونة",
    heroHeading: "المدونة.",
    heroSubhead:
      "أدلة طويلة عن Salsa On2 وتاريخ Mambo ومبادئ علم التدريب وراء المنهج.",
    readArticleCta: "اقرأ المقال",
    posts: [
      {
        href: "/what-is-salsa-on2",
        badge: "الدليل",
        title: "ما هي Salsa On2؟ الدليل الكامل لأسلوب نيويورك Mambo",
        description:
          "تعريف وتاريخ وميكانيكا حيوية ومسار من 5 خطوات لمبتدئ تمامًا ليبدأ في رقص Salsa On2.",
        readTime: "12 دقيقة قراءة",
        date: DATE_BY_LOCALE.ar,
      },
      {
        href: "/salsa-on1-vs-on2",
        badge: "مقارنة",
        title: "Salsa On1 مقابل Salsa On2: أيهما تتعلم أولاً؟",
        description:
          "مقارنة جنبًا إلى جنب كاملة: الإحساس والتاريخ والساحات العالمية وإطار عملي لاختيار أسلوبك الأول.",
        readTime: "9 دقائق قراءة",
        date: DATE_BY_LOCALE.ar,
      },
      {
        href: "/blog/mambo-history",
        badge: "التاريخ",
        title: "ولادة Mambo: من هافانا إلى Palladium",
        description:
          "كيف نشأ Mambo من Danzón و Son الكوبيين، وصاغه Arsenio Rodríguez، ودوّنه Eddie Torres كـ Salsa On2 الحديثة.",
        readTime: "14 دقيقة قراءة",
        date: DATE_BY_LOCALE.ar,
      },
      {
        href: "/blog/the-85-percent-rule",
        badge: "علم التدريب",
        title: "قاعدة 85%: كيف يتعلم دماغك الرقص فعلاً",
        description:
          "حدد بحث في Nature عام 2019 معدل الخطأ الأمثل للتعلم عند 15.87%. هذا ما يعنيه لتمارين السالسا الخاصة بك.",
        readTime: "10 دقائق قراءة",
        date: DATE_BY_LOCALE.ar,
      },
    ],
  },

  el: {
    metaTitle: "Blog: οδηγοί Salsa On2, ιστορία και επιστήμη της προπόνησης",
    metaDescription:
      "Εκτενή άρθρα για τη Salsa On2, την ιστορία του Mambo και τις αρχές της επιστήμης της μάθησης πίσω από το πρόγραμμα της The Mambo Guild. Γραμμένα από έναν 2x Πρωταθλητή Ευρώπης.",
    heroBreadcrumbHome: "Αρχική",
    heroBreadcrumbCurrent: "Blog",
    heroHeading: "Το Blog.",
    heroSubhead:
      "Εκτενείς οδηγοί για τη Salsa On2, την ιστορία του Mambo και τις αρχές της επιστήμης της προπόνησης πίσω από το πρόγραμμα.",
    readArticleCta: "Διάβασε το άρθρο",
    posts: [
      {
        href: "/what-is-salsa-on2",
        badge: "Ο Οδηγός",
        title: "Τι είναι η Salsa On2; Ο πλήρης οδηγός για το Mambo Στιλ Νέας Υόρκης",
        description:
          "Ορισμός, ιστορία, εμβιομηχανική και ένα μονοπάτι 5 βημάτων για έναν εντελώς αρχάριο να αρχίσει να χορεύει Salsa On2.",
        readTime: "12 λεπτά ανάγνωσης",
        date: DATE_BY_LOCALE.el,
      },
      {
        href: "/salsa-on1-vs-on2",
        badge: "Σύγκριση",
        title: "Salsa On1 vs Salsa On2: ποια να μάθεις πρώτα;",
        description:
          "Πλήρης σύγκριση δίπλα-δίπλα: αίσθηση, ιστορία, παγκόσμιες σκηνές και ένα πρακτικό πλαίσιο για να επιλέξεις το πρώτο σου στιλ.",
        readTime: "9 λεπτά ανάγνωσης",
        date: DATE_BY_LOCALE.el,
      },
      {
        href: "/blog/mambo-history",
        badge: "Ιστορία",
        title: "Η γέννηση του Mambo: από την Αβάνα στο Palladium",
        description:
          "Πώς το Mambo ξεπήδησε από τον κουβανέζικο Danzón και τον Son, σφυρηλατήθηκε από τον Arsenio Rodríguez και κωδικοποιήθηκε ως σύγχρονη Salsa On2 από τον Eddie Torres.",
        readTime: "14 λεπτά ανάγνωσης",
        date: DATE_BY_LOCALE.el,
      },
      {
        href: "/blog/the-85-percent-rule",
        badge: "Επιστήμη της Προπόνησης",
        title: "Ο κανόνας του 85%: πώς το μυαλό σου μαθαίνει πραγματικά να χορεύει",
        description:
          "Μια εργασία στο Nature το 2019 εντόπισε το βέλτιστο ποσοστό σφάλματος για τη μάθηση στο 15,87%. Δες τι σημαίνει αυτό για τα σάλσα drills σου.",
        readTime: "10 λεπτά ανάγνωσης",
        date: DATE_BY_LOCALE.el,
      },
    ],
  },

  sr: {
    metaTitle: "Блог: водичи за Salsa On2, историја и наука тренинга",
    metaDescription:
      "Дугачки чланци о Salsa On2, историји Mambo и принципима науке учења који стоје иза The Mambo Guild наставног плана. Написао их је 2x првак Европе.",
    heroBreadcrumbHome: "Почетна",
    heroBreadcrumbCurrent: "Блог",
    heroHeading: "Блог.",
    heroSubhead:
      "Дугачки водичи о Salsa On2, историји Mambo и принципима науке тренинга који стоје иза наставног плана.",
    readArticleCta: "Прочитај чланак",
    posts: [
      {
        href: "/what-is-salsa-on2",
        badge: "Водич",
        title: "Шта је Salsa On2? Комплетан водич за њујоршки стил Mambo",
        description:
          "Дефиниција, историја, биомеханика и 5-корачни пут за апсолутног почетника да почне да плеше Salsa On2.",
        readTime: "12 мин читања",
        date: DATE_BY_LOCALE.sr,
      },
      {
        href: "/salsa-on1-vs-on2",
        badge: "Поређење",
        title: "Salsa On1 наспрам Salsa On2: коју треба да научиш прво?",
        description:
          "Потпуно поређење раме уз раме: осећај, историја, светске сцене и практичан оквир за избор твог првог стила.",
        readTime: "9 мин читања",
        date: DATE_BY_LOCALE.sr,
      },
      {
        href: "/blog/mambo-history",
        badge: "Историја",
        title: "Рођење Mamba: од Хаване до Palladium-а",
        description:
          "Како је Mambo настао из кубанских Danzón и Son, обликовао га Arsenio Rodríguez, а кодификовао као модерну Salsa On2 Eddie Torres.",
        readTime: "14 мин читања",
        date: DATE_BY_LOCALE.sr,
      },
      {
        href: "/blog/the-85-percent-rule",
        badge: "Наука тренинга",
        title: "Правило 85%: како твој мозак заиста учи да плеше",
        description:
          "Рад у часопису Nature из 2019. утврдио је оптималну стопу грешке за учење на 15,87%. Ево шта то значи за твоје вежбе салсе.",
        readTime: "10 мин читања",
        date: DATE_BY_LOCALE.sr,
      },
    ],
  },

  tr: {
    metaTitle: "Blog: Salsa On2 rehberleri, tarih ve antrenman bilimi",
    metaDescription:
      "Salsa On2, Mambo'nun tarihi ve The Mambo Guild müfredatının arkasındaki öğrenme bilimi ilkeleri üzerine uzun makaleler. 2x Avrupa Şampiyonu tarafından yazıldı.",
    heroBreadcrumbHome: "Ana Sayfa",
    heroBreadcrumbCurrent: "Blog",
    heroHeading: "Blog.",
    heroSubhead:
      "Salsa On2, Mambo'nun tarihi ve müfredatın arkasındaki antrenman bilimi ilkeleri üzerine uzun rehberler.",
    readArticleCta: "Makaleyi oku",
    posts: [
      {
        href: "/what-is-salsa-on2",
        badge: "Rehber",
        title: "Salsa On2 nedir? New York Style Mambo'nun eksiksiz rehberi",
        description:
          "Tanım, tarih, biyomekanik ve mutlak başlangıç seviyesindekilerin Salsa On2 dansına başlaması için 5 adımlık yol.",
        readTime: "12 dk okuma",
        date: DATE_BY_LOCALE.tr,
      },
      {
        href: "/salsa-on1-vs-on2",
        badge: "Karşılaştırma",
        title: "Salsa On1 vs Salsa On2: önce hangisini öğrenmelisin?",
        description:
          "Tam yan yana karşılaştırma: hissiyat, tarih, dünya sahneleri ve ilk stilini seçmek için pratik bir çerçeve.",
        readTime: "9 dk okuma",
        date: DATE_BY_LOCALE.tr,
      },
      {
        href: "/blog/mambo-history",
        badge: "Tarih",
        title: "Mambo'nun doğuşu: Havana'dan Palladium'a",
        description:
          "Mambo'nun Küba Danzón ve Son'dan nasıl çıktığı, Arsenio Rodríguez tarafından nasıl şekillendirildiği ve Eddie Torres tarafından modern Salsa On2 olarak nasıl kodlandığı.",
        readTime: "14 dk okuma",
        date: DATE_BY_LOCALE.tr,
      },
      {
        href: "/blog/the-85-percent-rule",
        badge: "Antrenman Bilimi",
        title: "%85 kuralı: beynin dans etmeyi gerçekten nasıl öğrenir",
        description:
          "2019'da Nature'da yayımlanan bir makale, öğrenme için optimum hata oranını %15,87 olarak belirledi. Bunun salsa antrenmanların için ne anlama geldiği.",
        readTime: "10 dk okuma",
        date: DATE_BY_LOCALE.tr,
      },
    ],
  },
};

void COMMON_DATE_EN; // keep linter happy if unused

export function getBlogHubContent(locale: Locale): BlogHubContent {
  return HUB_BY_LOCALE[locale] ?? HUB_BY_LOCALE.en;
}
