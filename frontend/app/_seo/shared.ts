/**
 * Cross-article shared strings used by the SEO blog/pillar pages.
 * Keeping these here avoids having to retranslate identical phrases
 * (byline credential, CTA, "Keep reading" header) per article. Each
 * value is hand-authored per locale.
 */
import type { Locale } from "@/i18n/config";

export type ArticleSharedStrings = {
  /** Byline credential — e.g. "2x European Salsa Champion". */
  bylineCredential: string;
  /** Short-answer pull-out eyebrow (used at the top of pillar pages). */
  shortAnswerEyebrow: string;
  /** "Frequently asked questions" section heading. */
  faqHeading: string;
  /** Eyebrow above the bottom CTA card on pillar pages. */
  startOn2PathEyebrow: string;
  /** Body copy under the bottom CTA. */
  startOn2PathBody: string;
  /** "Start 7-day free trial" CTA button label. */
  startFreeTrialCta: string;
  /** "Keep reading" eyebrow for the related-articles aside. */
  keepReadingEyebrow: string;
};

export const SHARED_BY_LOCALE: Record<Locale, ArticleSharedStrings> = {
  en: {
    bylineCredential: "2x European Salsa Champion",
    shortAnswerEyebrow: "The Short Answer",
    faqHeading: "Frequently asked questions",
    startOn2PathEyebrow: "Start your On2 path",
    startOn2PathBody:
      "500+ lessons, visual Skill Tree, bi-weekly new drops. Taught by a 2x European Champion. 7-day free trial, cancel in two clicks.",
    startFreeTrialCta: "Start 7-day free trial",
    keepReadingEyebrow: "Keep reading",
  },
  es: {
    bylineCredential: "2x Campeón de Europa de Salsa",
    shortAnswerEyebrow: "La respuesta corta",
    faqHeading: "Preguntas frecuentes",
    startOn2PathEyebrow: "Empieza tu camino en On2",
    startOn2PathBody:
      "500+ lecciones, Árbol de Habilidades visual, nuevas entregas cada dos semanas. Enseñado por un 2x Campeón de Europa. Prueba gratuita de 7 días, cancela en dos clics.",
    startFreeTrialCta: "Empieza la prueba gratuita de 7 días",
    keepReadingEyebrow: "Sigue leyendo",
  },
  pt: {
    bylineCredential: "2x Campeão Europeu de Salsa",
    shortAnswerEyebrow: "A resposta curta",
    faqHeading: "Perguntas frequentes",
    startOn2PathEyebrow: "Começa o teu percurso em On2",
    startOn2PathBody:
      "500+ aulas, Árvore de Habilidades visual, novos lançamentos a cada duas semanas. Ensinado por um 2x Campeão Europeu. Teste grátis de 7 dias, cancela em dois cliques.",
    startFreeTrialCta: "Começa o teste grátis de 7 dias",
    keepReadingEyebrow: "Continua a ler",
  },
  fr: {
    bylineCredential: "2x Champion d'Europe de Salsa",
    shortAnswerEyebrow: "La réponse courte",
    faqHeading: "Questions fréquentes",
    startOn2PathEyebrow: "Commence ton parcours en On2",
    startOn2PathBody:
      "500+ leçons, Arbre des Compétences visuel, nouveautés toutes les deux semaines. Enseigné par un 2x Champion d'Europe. Essai gratuit de 7 jours, annule en deux clics.",
    startFreeTrialCta: "Commence l'essai gratuit de 7 jours",
    keepReadingEyebrow: "Continue à lire",
  },
  de: {
    bylineCredential: "2x Europameister im Salsa",
    shortAnswerEyebrow: "Die kurze Antwort",
    faqHeading: "Häufig gestellte Fragen",
    startOn2PathEyebrow: "Starte deinen On2-Weg",
    startOn2PathBody:
      "500+ Lektionen, visueller Skill-Tree, alle zwei Wochen neue Drops. Unterrichtet von einem 2x Europameister. 7-Tage-Gratistest, Kündigung in zwei Klicks.",
    startFreeTrialCta: "Starte die 7-Tage-Gratistestphase",
    keepReadingEyebrow: "Weiterlesen",
  },
  it: {
    bylineCredential: "2x Campione Europeo di Salsa",
    shortAnswerEyebrow: "La risposta breve",
    faqHeading: "Domande frequenti",
    startOn2PathEyebrow: "Inizia il tuo percorso On2",
    startOn2PathBody:
      "500+ lezioni, Skill Tree visivo, nuovi rilasci ogni due settimane. Insegnato da un 2x Campione Europeo. Prova gratuita di 7 giorni, cancella in due clic.",
    startFreeTrialCta: "Inizia la prova gratuita di 7 giorni",
    keepReadingEyebrow: "Continua a leggere",
  },
  ja: {
    bylineCredential: "2度の欧州サルサチャンピオン",
    shortAnswerEyebrow: "短い答え",
    faqHeading: "よくある質問",
    startOn2PathEyebrow: "On2 への道を始めよう",
    startOn2PathBody:
      "500以上のレッスン、ビジュアル化された Skill Tree、隔週で新コンテンツ追加。2度の欧州チャンピオンが指導。7日間の無料トライアル、2クリックでキャンセル可能。",
    startFreeTrialCta: "7日間の無料トライアルを開始",
    keepReadingEyebrow: "続けて読む",
  },
  ko: {
    bylineCredential: "2회 유럽 살사 챔피언",
    shortAnswerEyebrow: "짧은 답변",
    faqHeading: "자주 묻는 질문",
    startOn2PathEyebrow: "On2 여정을 시작하세요",
    startOn2PathBody:
      "500개 이상의 레슨, 시각적 Skill Tree, 격주로 추가되는 새 콘텐츠. 2회 유럽 챔피언이 직접 가르칩니다. 7일 무료 체험, 두 번의 클릭으로 취소 가능.",
    startFreeTrialCta: "7일 무료 체험 시작",
    keepReadingEyebrow: "계속 읽기",
  },
  zh: {
    bylineCredential: "2届欧洲萨尔萨冠军",
    shortAnswerEyebrow: "简短回答",
    faqHeading: "常见问题",
    startOn2PathEyebrow: "开始你的 On2 之路",
    startOn2PathBody:
      "500+ 节课程,视觉化技能树,每两周更新内容。由 2 届欧洲冠军授课。7 天免费试用,两次点击即可取消。",
    startFreeTrialCta: "开始 7 天免费试用",
    keepReadingEyebrow: "继续阅读",
  },
  ru: {
    bylineCredential: "2-кратный чемпион Европы по сальсе",
    shortAnswerEyebrow: "Короткий ответ",
    faqHeading: "Частые вопросы",
    startOn2PathEyebrow: "Начни свой путь в On2",
    startOn2PathBody:
      "500+ уроков, визуальный Skill Tree, новые материалы каждые две недели. Преподаёт 2-кратный чемпион Европы. 7 дней бесплатно, отмена в два клика.",
    startFreeTrialCta: "Начать 7-дневный бесплатный пробный период",
    keepReadingEyebrow: "Продолжить чтение",
  },
  pl: {
    bylineCredential: "2x Mistrz Europy w Salsie",
    shortAnswerEyebrow: "Krótka odpowiedź",
    faqHeading: "Najczęściej zadawane pytania",
    startOn2PathEyebrow: "Zacznij swoją drogę w On2",
    startOn2PathBody:
      "500+ lekcji, wizualne Drzewo Umiejętności, nowe materiały co dwa tygodnie. Prowadzi 2x Mistrz Europy. Darmowy 7-dniowy okres próbny, anuluj w dwa kliknięcia.",
    startFreeTrialCta: "Rozpocznij darmowy 7-dniowy okres próbny",
    keepReadingEyebrow: "Czytaj dalej",
  },
  nl: {
    bylineCredential: "2x Europees Kampioen Salsa",
    shortAnswerEyebrow: "Het korte antwoord",
    faqHeading: "Veelgestelde vragen",
    startOn2PathEyebrow: "Start je On2-pad",
    startOn2PathBody:
      "500+ lessen, visuele Skill Tree, om de twee weken nieuwe drops. Onderwezen door een 2x Europees Kampioen. 7 dagen gratis proberen, opzegbaar in twee klikken.",
    startFreeTrialCta: "Start de gratis proefperiode van 7 dagen",
    keepReadingEyebrow: "Lees verder",
  },
  ar: {
    bylineCredential: "بطل أوروبا في السالسا مرتين",
    shortAnswerEyebrow: "الإجابة المختصرة",
    faqHeading: "الأسئلة الشائعة",
    startOn2PathEyebrow: "ابدأ مسارك في On2",
    startOn2PathBody:
      "أكثر من 500 درس، شجرة مهارات مرئية، إصدارات جديدة كل أسبوعين. يُدرّسها بطل أوروبا مرتين. تجربة مجانية لمدة 7 أيام، الإلغاء بنقرتين.",
    startFreeTrialCta: "ابدأ التجربة المجانية لـ 7 أيام",
    keepReadingEyebrow: "تابع القراءة",
  },
  el: {
    bylineCredential: "2x Πρωταθλητής Ευρώπης στη Σάλσα",
    shortAnswerEyebrow: "Η σύντομη απάντηση",
    faqHeading: "Συχνές ερωτήσεις",
    startOn2PathEyebrow: "Ξεκίνα το μονοπάτι σου στο On2",
    startOn2PathBody:
      "500+ μαθήματα, οπτικό Skill Tree, νέα κυκλοφορία κάθε δύο εβδομάδες. Διδάσκει ένας 2x Πρωταθλητής Ευρώπης. Δωρεάν δοκιμή 7 ημερών, ακύρωση με δύο κλικ.",
    startFreeTrialCta: "Ξεκίνα τη δωρεάν δοκιμή 7 ημερών",
    keepReadingEyebrow: "Συνέχισε την ανάγνωση",
  },
  sr: {
    bylineCredential: "2x првак Европе у салси",
    shortAnswerEyebrow: "Кратак одговор",
    faqHeading: "Често постављана питања",
    startOn2PathEyebrow: "Започни свој пут у On2",
    startOn2PathBody:
      "500+ лекција, визуелно Дрво вештина, нови садржаји сваке две недеље. Предаје 2x првак Европе. Бесплатан период од 7 дана, откажи у два клика.",
    startFreeTrialCta: "Започни бесплатан период од 7 дана",
    keepReadingEyebrow: "Настави са читањем",
  },
  tr: {
    bylineCredential: "2x Avrupa Salsa Şampiyonu",
    shortAnswerEyebrow: "Kısa cevap",
    faqHeading: "Sık sorulan sorular",
    startOn2PathEyebrow: "On2 yolculuğuna başla",
    startOn2PathBody:
      "500+ ders, görsel Yetenek Ağacı, iki haftada bir yeni içerik. 2x Avrupa Şampiyonu tarafından öğretiliyor. 7 günlük ücretsiz deneme, iki tıklamayla iptal.",
    startFreeTrialCta: "7 günlük ücretsiz denemeyi başlat",
    keepReadingEyebrow: "Okumaya devam et",
  },
};

/** Localized "12 min read" / "9 min read" pattern. minutes is a number,
 *  output style varies per locale. Used for byline construction. */
export function readTimeLabel(locale: Locale, minutes: number): string {
  switch (locale) {
    case "en": return `${minutes} min read`;
    case "es": return `${minutes} min de lectura`;
    case "pt": return `${minutes} min de leitura`;
    case "fr": return `${minutes} min de lecture`;
    case "de": return `${minutes} Min. Lesezeit`;
    case "it": return `${minutes} min di lettura`;
    case "ja": return `${minutes}分で読了`;
    case "ko": return `${minutes}분 분량`;
    case "zh": return `${minutes} 分钟阅读`;
    case "ru": return `${minutes} мин чтения`;
    case "pl": return `${minutes} min czytania`;
    case "nl": return `${minutes} min lezen`;
    case "ar": return `${minutes} دقيقة قراءة`;
    case "el": return `${minutes} λεπτά ανάγνωσης`;
    case "sr": return `${minutes} мин читања`;
    case "tr": return `${minutes} dk okuma`;
  }
}

export function getSharedStrings(locale: Locale): ArticleSharedStrings {
  return SHARED_BY_LOCALE[locale] ?? SHARED_BY_LOCALE.en;
}
