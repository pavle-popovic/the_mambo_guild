"""
Patch the badges.<id>.{name,description} tree across all 14 locales so the
trophy case stops showing raw i18n keys for new/revamped badges.

Scope (minimum useful):
  * Add missing entries for the post-migration-018 families (liked_*, motw_*,
    original_*, guild_*) and the new migration-019 families (motw_love_*,
    original_love_*, guild_love_*, promoter).
  * Update the description for existing families whose thresholds changed in
    migration_019 (new bronze = 1, new gold/diamond pushed higher).
  * Keep already-translated name fields untouched — the English name is only
    used as a fallback when a locale hasn't seen the ID yet.

Running this script is idempotent.
"""
from __future__ import annotations
import json
from pathlib import Path

MESSAGES_DIR = Path(__file__).resolve().parents[1] / "messages"

LOCALES = ["en", "es", "pt", "fr", "de", "it", "ja", "ko", "zh", "ru", "pl", "nl", "el", "ar", "sr", "tr"]


# English master strings for every currently-active badge_definition ID.
# For non-English locales we fall through to these when no translation exists
# yet — the trophy case also falls back to the DB-side English name.
EN_BADGES: dict[str, dict[str, str]] = {
    # --- Move Master (motw_videos) ---
    "motw_bronze":   {"name": "Move Master I",   "description": "Posted your first Move of the Week video. Welcome to the floor."},
    "motw_silver":   {"name": "Move Master II",  "description": "Posted 10 Move of the Week videos."},
    "motw_gold":     {"name": "Move Master III", "description": "Posted 30 Move of the Week videos. You're a regular."},
    "motw_diamond":  {"name": "Move Master IV",  "description": "Posted 100 Move of the Week videos. Certified weekly legend."},

    # --- The Originator (original_videos) ---
    "original_bronze":  {"name": "The Originator I",   "description": "Shared your first original choreo or freestyle."},
    "original_silver":  {"name": "The Originator II",  "description": "Shared 10 original choreos or freestyles."},
    "original_gold":    {"name": "The Originator III", "description": "Shared 30 original choreos or freestyles. You have a voice."},
    "original_diamond": {"name": "The Originator IV",  "description": "Shared 100 original choreos or freestyles. A true creator."},

    # --- Class Act (guild_videos) ---
    "guild_bronze":  {"name": "Class Act I",   "description": "Posted your first Guild-class choreo."},
    "guild_silver":  {"name": "Class Act II",  "description": "Posted 10 Guild-class choreos."},
    "guild_gold":    {"name": "Class Act III", "description": "Posted 30 Guild-class choreos. Full ensemble material."},
    "guild_diamond": {"name": "Class Act IV",  "description": "Posted 100 Guild-class choreos. Guild pillar."},

    # --- Center Stage (videos_posted) ---
    "center_stage_bronze":  {"name": "Center Stage I",   "description": "Posted your first video to The Stage."},
    "center_stage_silver":  {"name": "Center Stage II",  "description": "Posted 25 videos to The Stage."},
    "center_stage_gold":    {"name": "Center Stage III", "description": "Posted 75 videos to The Stage. Mic check permanent."},
    "center_stage_diamond": {"name": "Center Stage IV",  "description": "Posted 250 videos to The Stage. Headliner status."},

    # --- Crowd Favorite (likes_received, total) ---
    "liked_bronze":  {"name": "Crowd Favorite I",   "description": "Received your first like."},
    "liked_silver":  {"name": "Crowd Favorite II",  "description": "Received 100 total likes across your posts."},
    "liked_gold":    {"name": "Crowd Favorite III", "description": "Received 500 total likes across your posts."},
    "liked_diamond": {"name": "Crowd Favorite IV",  "description": "Received 2,500 total likes. The room loves you."},

    # --- Move Magnet (motw_likes) — NEW ---
    "motw_love_bronze":  {"name": "Move Magnet I",   "description": "Got your first like on a Move of the Week video."},
    "motw_love_silver":  {"name": "Move Magnet II",  "description": "25 likes across your Move of the Week videos."},
    "motw_love_gold":    {"name": "Move Magnet III", "description": "150 likes across your Move of the Week videos."},
    "motw_love_diamond": {"name": "Move Magnet IV",  "description": "1,000 likes across your Move of the Week videos."},

    # --- Fan Favorite (original_likes) — NEW ---
    "original_love_bronze":  {"name": "Fan Favorite I",   "description": "Got your first like on an original post."},
    "original_love_silver":  {"name": "Fan Favorite II",  "description": "25 likes across your original posts."},
    "original_love_gold":    {"name": "Fan Favorite III", "description": "150 likes across your original posts."},
    "original_love_diamond": {"name": "Fan Favorite IV",  "description": "1,000 likes across your original posts."},

    # --- Guild Applause (guild_likes) — NEW ---
    "guild_love_bronze":  {"name": "Guild Applause I",   "description": "Got your first like on a Guild-class post."},
    "guild_love_silver":  {"name": "Guild Applause II",  "description": "25 likes across your Guild-class posts."},
    "guild_love_gold":    {"name": "Guild Applause III", "description": "150 likes across your Guild-class posts."},
    "guild_love_diamond": {"name": "Guild Applause IV",  "description": "1,000 likes across your Guild-class posts."},

    # --- Talent Scout (reactions_given) ---
    "talent_scout_bronze":  {"name": "Talent Scout I",   "description": "Gave your first like."},
    "talent_scout_silver":  {"name": "Talent Scout II",  "description": "Gave 100 likes across the community."},
    "talent_scout_gold":    {"name": "Talent Scout III", "description": "Gave 500 likes. Eye for talent."},
    "talent_scout_diamond": {"name": "Talent Scout IV",  "description": "Gave 2,500 likes. Community champion."},

    # --- The Socialite (comments_posted) ---
    "the_socialite_bronze":  {"name": "The Socialite I",   "description": "Left your first comment."},
    "the_socialite_silver":  {"name": "The Socialite II",  "description": "Left 50 comments."},
    "the_socialite_gold":    {"name": "The Socialite III", "description": "Left 250 comments. You're the conversation."},
    "the_socialite_diamond": {"name": "The Socialite IV",  "description": "Left 1,000 comments."},

    # --- Curious Mind (questions_posted) ---
    "curious_mind_bronze":  {"name": "Curious Mind I",   "description": "Asked your first question in the Lab."},
    "curious_mind_silver":  {"name": "Curious Mind II",  "description": "Asked 15 questions in the Lab."},
    "curious_mind_gold":    {"name": "Curious Mind III", "description": "Asked 50 questions in the Lab."},
    "curious_mind_diamond": {"name": "Curious Mind IV",  "description": "Asked 150 questions. The Lab runs on your why."},

    # --- The Professor (solutions_accepted) ---
    "the_professor_bronze":  {"name": "The Professor I",   "description": "Had your first answer marked as the solution."},
    "the_professor_silver":  {"name": "The Professor II",  "description": "Had 10 answers marked as solutions."},
    "the_professor_gold":    {"name": "The Professor III", "description": "Had 40 answers marked as solutions. Tenured."},
    "the_professor_diamond": {"name": "The Professor IV",  "description": "Had 150 answers marked as solutions. Department chair."},

    # --- Unstoppable (daily_streak) ---
    "unstoppable_bronze":  {"name": "Unstoppable I",   "description": "Logged in two days in a row."},
    "unstoppable_silver":  {"name": "Unstoppable II",  "description": "14-day practice streak."},
    "unstoppable_gold":    {"name": "Unstoppable III", "description": "60-day practice streak. Two months, pure."},
    "unstoppable_diamond": {"name": "Unstoppable IV",  "description": "200-day practice streak. Built different."},

    # --- Promoter (referrals_converted) — NEW ---
    "promoter": {"name": "Promoter", "description": "Brought 3 dancers into the Guild through your referral link."},

    # --- Specials (unchanged; re-listed so descriptions are complete) ---
    "founder_diamond": {"name": "Founder X", "description": "One of the founding members of The Mambo Guild."},
    "beta_tester":     {"name": "Beta Tester", "description": "Helped test the platform during early access. Awarded by invitation only."},
    "pro_member":      {"name": "Pro Member", "description": "Active Advanced-tier subscriber."},
    "guild_master":    {"name": "Guild Master", "description": "Active Performer-tier subscriber."},
}


# ============================================================================
# Per-locale translations for every badge family.
#
# Badge names follow a "{family} {tier}" shape where tier is I/II/III/IV for
# bronze/silver/gold/diamond. Roman numerals stay the same across locales, so
# we only translate the family name.
#
# Descriptions are tier-specific and fully localized.
# ============================================================================

TIER_SUFFIX: dict[str, str] = {
    "bronze": " I",
    "silver": " II",
    "gold": " III",
    "diamond": " IV",
}

# family → locale → translated family name (name shown in trophy case =
# "{family_name} {roman}"). Each family must list all 14 locales.
FAMILY_NAMES: dict[str, dict[str, str]] = {
    "motw": {
        "en": "Move Master",     "es": "Maestro del Movimiento", "pt": "Mestre do Movimento",
        "fr": "Maître du Pas",   "de": "Move-Meister",            "it": "Maestro del Passo",
        "ja": "ムーブ・マスター",  "ko": "무브 마스터",             "zh": "动作大师",
        "ru": "Мастер Движения", "pl": "Mistrz Ruchu",            "nl": "Move Meester",
        "el": "Δάσκαλος Κίνησης","ar": "سيّد الحركة",
    },
    "original": {
        "en": "The Originator",  "es": "El Originador",   "pt": "O Originador",
        "fr": "L'Originateur",   "de": "Der Erschaffer",  "it": "L'Originatore",
        "ja": "オリジネーター",    "ko": "오리지네이터",     "zh": "原创者",
        "ru": "Создатель",       "pl": "Twórca",           "nl": "De Originator",
        "el": "Ο Δημιουργός",    "ar": "المُبدِع",
    },
    "guild": {
        "en": "Class Act",       "es": "Clase Magistral", "pt": "Classe Magistral",
        "fr": "Grande Classe",   "de": "Klasse-Akt",      "it": "Classe da Maestro",
        "ja": "クラス・アクト",    "ko": "클래스 액트",      "zh": "一流表演",
        "ru": "Высший Класс",    "pl": "Klasa Sama w Sobie", "nl": "Klassestuk",
        "el": "Υψηλή Κλάση",     "ar": "أداء راقٍ",
    },
    "liked": {
        "en": "Crowd Favorite",  "es": "Favorito del Público", "pt": "Favorito do Público",
        "fr": "Chouchou du Public", "de": "Publikumsliebling",  "it": "Beniamino del Pubblico",
        "ja": "オーディエンスの人気者", "ko": "관객의 총애",    "zh": "大众最爱",
        "ru": "Любимец Публики", "pl": "Ulubieniec Publiczności", "nl": "Publiekslieveling",
        "el": "Αγαπημένος του Κοινού", "ar": "مُفضّل الجمهور",
    },
    "motw_love": {
        "en": "Move Magnet",     "es": "Imán del Movimiento", "pt": "Ímã do Movimento",
        "fr": "Aimant à Pas",    "de": "Move-Magnet",         "it": "Calamita di Passi",
        "ja": "ムーブ・マグネット", "ko": "무브 마그넷",         "zh": "动作磁石",
        "ru": "Магнит Движения", "pl": "Magnes Ruchu",        "nl": "Move Magneet",
        "el": "Μαγνήτης Κίνησης","ar": "مغناطيس الحركة",
    },
    "original_love": {
        "en": "Fan Favorite",    "es": "Favorito de los Fans","pt": "Favorito dos Fãs",
        "fr": "Coup de Cœur des Fans","de": "Fan-Liebling",  "it": "Beniamino dei Fan",
        "ja": "ファンの人気者",    "ko": "팬 최애",            "zh": "粉丝最爱",
        "ru": "Любимец Фанатов", "pl": "Ulubieniec Fanów",   "nl": "Fanfavoriet",
        "el": "Αγαπημένος των Φαν","ar": "مُفضّل المعجبين",
    },
    "guild_love": {
        "en": "Guild Applause",  "es": "Aplauso del Gremio", "pt": "Aplauso da Guilda",
        "fr": "Ovation de la Guilde", "de": "Gilden-Applaus","it": "Applauso della Gilda",
        "ja": "ギルドの喝采",      "ko": "길드의 박수",        "zh": "公会喝彩",
        "ru": "Аплодисменты Гильдии", "pl": "Oklaski Gildii","nl": "Gilde-applaus",
        "el": "Χειροκρότημα Συντεχνίας", "ar": "تصفيق النقابة",
    },
}


# description templates per family + tier, localized.
# {n} in template gets replaced with the threshold number.
DESCRIPTION_TEMPLATES: dict[str, dict[str, dict[str, str]]] = {
    "motw": {
        "bronze": {
            "en": "Posted your first Move of the Week video. Welcome to the floor.",
            "es": "Publicaste tu primer video de Move of the Week. Bienvenido a la pista.",
            "pt": "Postou seu primeiro vídeo de Move of the Week. Bem-vindo à pista.",
            "fr": "Tu as posté ta première vidéo Move of the Week. Bienvenue sur la piste.",
            "de": "Erstes Move-of-the-Week-Video gepostet. Willkommen auf dem Floor.",
            "it": "Pubblicato il primo video Move of the Week. Benvenuto in pista.",
            "ja": "初めての Move of the Week 動画を投稿。フロアへようこそ。",
            "ko": "첫 Move of the Week 영상을 올렸습니다. 플로어에 오신 것을 환영합니다.",
            "zh": "发布了你的第一个 Move of the Week 视频。欢迎来到舞池。",
            "ru": "Первое видео Move of the Week. Добро пожаловать на пол.",
            "pl": "Wrzuciłeś pierwsze wideo Move of the Week. Witaj na parkiecie.",
            "nl": "Je eerste Move of the Week-video gepost. Welkom op de dansvloer.",
            "el": "Δημοσίευσες το πρώτο σου βίντεο Move of the Week. Καλώς ήρθες στην πίστα.",
            "ar": "نشرت أول فيديو Move of the Week. أهلاً بك على حلبة الرقص.",
        },
        "silver": {
            "en": "Posted 10 Move of the Week videos.",
            "es": "Publicaste 10 videos de Move of the Week.",
            "pt": "Postou 10 vídeos de Move of the Week.",
            "fr": "10 vidéos Move of the Week postées.",
            "de": "10 Move-of-the-Week-Videos gepostet.",
            "it": "Pubblicati 10 video Move of the Week.",
            "ja": "Move of the Week 動画を 10 本投稿。",
            "ko": "Move of the Week 영상 10개를 올렸습니다.",
            "zh": "发布了 10 个 Move of the Week 视频。",
            "ru": "10 видео Move of the Week.",
            "pl": "Wrzuciłeś 10 wideo Move of the Week.",
            "nl": "10 Move of the Week-video's gepost.",
            "el": "Δημοσίευσες 10 βίντεο Move of the Week.",
            "ar": "نشرت 10 فيديوهات Move of the Week.",
        },
        "gold": {
            "en": "Posted 30 Move of the Week videos. You're a regular.",
            "es": "Publicaste 30 videos de Move of the Week. Eres un habitual.",
            "pt": "Postou 30 vídeos de Move of the Week. Você é frequente.",
            "fr": "30 vidéos Move of the Week postées. Un habitué.",
            "de": "30 Move-of-the-Week-Videos gepostet. Du bist Stammgast.",
            "it": "Pubblicati 30 video Move of the Week. Sei di casa.",
            "ja": "Move of the Week 動画を 30 本投稿。常連ですね。",
            "ko": "Move of the Week 영상 30개를 올렸습니다. 단골이군요.",
            "zh": "发布了 30 个 Move of the Week 视频。你是常客。",
            "ru": "30 видео Move of the Week. Вы здесь свой.",
            "pl": "30 wideo Move of the Week. Jesteś stałym bywalcem.",
            "nl": "30 Move of the Week-video's gepost. Je bent een vaste gast.",
            "el": "30 βίντεο Move of the Week. Τακτικός/ή.",
            "ar": "نشرت 30 فيديو Move of the Week. أصبحت من الوجوه المعتادة.",
        },
        "diamond": {
            "en": "Posted 100 Move of the Week videos. Certified weekly legend.",
            "es": "Publicaste 100 videos de Move of the Week. Leyenda semanal certificada.",
            "pt": "Postou 100 vídeos de Move of the Week. Lenda semanal certificada.",
            "fr": "100 vidéos Move of the Week postées. Légende hebdomadaire confirmée.",
            "de": "100 Move-of-the-Week-Videos gepostet. Zertifizierte wöchentliche Legende.",
            "it": "Pubblicati 100 video Move of the Week. Leggenda settimanale certificata.",
            "ja": "Move of the Week 動画を 100 本投稿。公認のウィークリー・レジェンド。",
            "ko": "Move of the Week 영상 100개를 올렸습니다. 공인된 위클리 레전드.",
            "zh": "发布了 100 个 Move of the Week 视频。名副其实的每周传奇。",
            "ru": "100 видео Move of the Week. Подтверждённая еженедельная легенда.",
            "pl": "100 wideo Move of the Week. Tygodniowa legenda.",
            "nl": "100 Move of the Week-video's gepost. Gecertificeerde weeklegende.",
            "el": "100 βίντεο Move of the Week. Επίσημος εβδομαδιαίος θρύλος.",
            "ar": "نشرت 100 فيديو Move of the Week. أسطورة أسبوعية موثّقة.",
        },
    },
    "original": {
        "bronze": {
            "en": "Shared your first original choreo or freestyle.",
            "es": "Compartiste tu primera coreografía o freestyle original.",
            "pt": "Compartilhou sua primeira coreografia ou freestyle original.",
            "fr": "Tu as partagé ta première choré ou ton premier freestyle original.",
            "de": "Erste eigene Choreo oder Freestyle geteilt.",
            "it": "Condiviso la prima coreografia o freestyle originale.",
            "ja": "初めてのオリジナル振付またはフリースタイルを公開。",
            "ko": "첫 오리지널 안무 또는 프리스타일을 공유했습니다.",
            "zh": "分享了你的第一个原创编舞或 freestyle。",
            "ru": "Первая оригинальная хореография или фристайл.",
            "pl": "Udostępniłeś pierwszą autorską choreo lub freestyle.",
            "nl": "Je eerste originele choreo of freestyle gedeeld.",
            "el": "Μοιράστηκες την πρώτη σου πρωτότυπη χορογραφία ή freestyle.",
            "ar": "شاركت أول تصميم رقص أصلي أو freestyle.",
        },
        "silver": {
            "en": "Shared 10 original choreos or freestyles.",
            "es": "Compartiste 10 coreografías o freestyles originales.",
            "pt": "Compartilhou 10 coreografias ou freestyles originais.",
            "fr": "10 chorés ou freestyles originaux partagés.",
            "de": "10 eigene Choreos oder Freestyles geteilt.",
            "it": "Condivise 10 coreografie o freestyle originali.",
            "ja": "オリジナル振付またはフリースタイルを 10 作品公開。",
            "ko": "오리지널 안무 또는 프리스타일 10개를 공유했습니다.",
            "zh": "分享了 10 个原创编舞或 freestyle。",
            "ru": "10 оригинальных хореографий или фристайлов.",
            "pl": "Udostępniłeś 10 autorskich choreo lub freestyle.",
            "nl": "10 originele choreo's of freestyles gedeeld.",
            "el": "Μοιράστηκες 10 πρωτότυπες χορογραφίες ή freestyles.",
            "ar": "شاركت 10 تصاميم رقص أصلية أو freestyles.",
        },
        "gold": {
            "en": "Shared 30 original choreos or freestyles. You have a voice.",
            "es": "Compartiste 30 coreografías o freestyles originales. Tienes voz propia.",
            "pt": "Compartilhou 30 coreografias ou freestyles originais. Você tem voz.",
            "fr": "30 chorés ou freestyles originaux partagés. Tu as une voix.",
            "de": "30 eigene Choreos oder Freestyles geteilt. Du hast eine eigene Stimme.",
            "it": "Condivise 30 coreografie o freestyle originali. Hai una voce.",
            "ja": "オリジナル振付またはフリースタイルを 30 作品公開。独自の声を持つダンサー。",
            "ko": "오리지널 안무 또는 프리스타일 30개를 공유했습니다. 자신만의 목소리가 있군요.",
            "zh": "分享了 30 个原创编舞或 freestyle。你有自己的声音。",
            "ru": "30 оригинальных хореографий или фристайлов. У вас есть голос.",
            "pl": "30 autorskich choreo lub freestyle. Masz własny styl.",
            "nl": "30 originele choreo's of freestyles gedeeld. Je hebt een eigen stem.",
            "el": "30 πρωτότυπες χορογραφίες ή freestyles. Έχεις δική σου φωνή.",
            "ar": "شاركت 30 تصميماً أصلياً أو freestyle. لديك صوت خاص.",
        },
        "diamond": {
            "en": "Shared 100 original choreos or freestyles. A true creator.",
            "es": "Compartiste 100 coreografías o freestyles originales. Un verdadero creador.",
            "pt": "Compartilhou 100 coreografias ou freestyles originais. Um verdadeiro criador.",
            "fr": "100 chorés ou freestyles originaux partagés. Un vrai créateur.",
            "de": "100 eigene Choreos oder Freestyles geteilt. Wahrer Creator.",
            "it": "Condivise 100 coreografie o freestyle originali. Un vero creatore.",
            "ja": "オリジナル振付またはフリースタイルを 100 作品公開。真のクリエイター。",
            "ko": "오리지널 안무 또는 프리스타일 100개를 공유했습니다. 진정한 크리에이터.",
            "zh": "分享了 100 个原创编舞或 freestyle。真正的创作者。",
            "ru": "100 оригинальных хореографий или фристайлов. Настоящий творец.",
            "pl": "100 autorskich choreo lub freestyle. Prawdziwy twórca.",
            "nl": "100 originele choreo's of freestyles gedeeld. Een echte creator.",
            "el": "100 πρωτότυπες χορογραφίες ή freestyles. Πραγματικός δημιουργός.",
            "ar": "شاركت 100 تصميم أصلي أو freestyle. مبدع حقيقي.",
        },
    },
    "guild": {
        "bronze": {
            "en": "Posted your first Guild-class choreo.",
            "es": "Publicaste tu primera coreografía nivel Gremio.",
            "pt": "Postou sua primeira coreografia nível Guilda.",
            "fr": "Première choréo niveau Guilde postée.",
            "de": "Erste Choreo auf Gilden-Niveau gepostet.",
            "it": "Pubblicata la prima coreografia da Gilda.",
            "ja": "初めてのギルド級振付を投稿。",
            "ko": "첫 길드급 안무를 올렸습니다.",
            "zh": "发布了你的第一个公会级编舞。",
            "ru": "Первая хореография гильдийного уровня.",
            "pl": "Pierwsza choreo na poziomie Gildii.",
            "nl": "Je eerste Gilde-klasse choreo gepost.",
            "el": "Δημοσίευσες την πρώτη σου χορογραφία επιπέδου Συντεχνίας.",
            "ar": "نشرت أول تصميم رقص بمستوى النقابة.",
        },
        "silver": {
            "en": "Posted 10 Guild-class choreos.",
            "es": "Publicaste 10 coreografías nivel Gremio.",
            "pt": "Postou 10 coreografias nível Guilda.",
            "fr": "10 chorés niveau Guilde postées.",
            "de": "10 Choreos auf Gilden-Niveau gepostet.",
            "it": "Pubblicate 10 coreografie da Gilda.",
            "ja": "ギルド級振付を 10 本投稿。",
            "ko": "길드급 안무 10개를 올렸습니다.",
            "zh": "发布了 10 个公会级编舞。",
            "ru": "10 хореографий гильдийного уровня.",
            "pl": "10 choreo na poziomie Gildii.",
            "nl": "10 Gilde-klasse choreo's gepost.",
            "el": "Δημοσίευσες 10 χορογραφίες επιπέδου Συντεχνίας.",
            "ar": "نشرت 10 تصاميم بمستوى النقابة.",
        },
        "gold": {
            "en": "Posted 30 Guild-class choreos. Full ensemble material.",
            "es": "Publicaste 30 coreografías nivel Gremio. Material de compañía.",
            "pt": "Postou 30 coreografias nível Guilda. Material de companhia.",
            "fr": "30 chorés niveau Guilde postées. Du niveau compagnie.",
            "de": "30 Choreos auf Gilden-Niveau gepostet. Ensemble-würdig.",
            "it": "Pubblicate 30 coreografie da Gilda. Da compagnia vera e propria.",
            "ja": "ギルド級振付を 30 本投稿。カンパニー級の素材。",
            "ko": "길드급 안무 30개를 올렸습니다. 앙상블급 수준.",
            "zh": "发布了 30 个公会级编舞。整团级水准。",
            "ru": "30 хореографий гильдийного уровня. Уровень труппы.",
            "pl": "30 choreo na poziomie Gildii. Materiał na cały zespół.",
            "nl": "30 Gilde-klasse choreo's gepost. Ensemble-niveau.",
            "el": "30 χορογραφίες επιπέδου Συντεχνίας. Υλικό για πλήρες ensemble.",
            "ar": "نشرت 30 تصميماً بمستوى النقابة. مستوى فرقة كاملة.",
        },
        "diamond": {
            "en": "Posted 100 Guild-class choreos. Guild pillar.",
            "es": "Publicaste 100 coreografías nivel Gremio. Pilar del Gremio.",
            "pt": "Postou 100 coreografias nível Guilda. Pilar da Guilda.",
            "fr": "100 chorés niveau Guilde postées. Pilier de la Guilde.",
            "de": "100 Choreos auf Gilden-Niveau gepostet. Gilden-Säule.",
            "it": "Pubblicate 100 coreografie da Gilda. Pilastro della Gilda.",
            "ja": "ギルド級振付を 100 本投稿。ギルドの大黒柱。",
            "ko": "길드급 안무 100개를 올렸습니다. 길드의 기둥.",
            "zh": "发布了 100 个公会级编舞。公会支柱。",
            "ru": "100 хореографий гильдийного уровня. Опора гильдии.",
            "pl": "100 choreo na poziomie Gildii. Filar Gildii.",
            "nl": "100 Gilde-klasse choreo's gepost. Pijler van het Gilde.",
            "el": "100 χορογραφίες επιπέδου Συντεχνίας. Στυλοβάτης της Συντεχνίας.",
            "ar": "نشرت 100 تصميماً بمستوى النقابة. ركيزة النقابة.",
        },
    },
    "liked": {
        "bronze": {
            "en": "Received your first like.",
            "es": "Recibiste tu primer me gusta.",
            "pt": "Recebeu seu primeiro like.",
            "fr": "Tu as reçu ton premier like.",
            "de": "Erstes Like erhalten.",
            "it": "Ricevuto il primo like.",
            "ja": "初めての「いいね」を獲得。",
            "ko": "첫 좋아요를 받았습니다.",
            "zh": "收到了第一个点赞。",
            "ru": "Первый лайк получен.",
            "pl": "Pierwsze polubienie.",
            "nl": "Je eerste like ontvangen.",
            "el": "Πήρες το πρώτο σου like.",
            "ar": "حصلت على أول إعجاب.",
        },
        "silver": {
            "en": "Received 100 total likes across your posts.",
            "es": "Recibiste 100 me gusta en total en tus publicaciones.",
            "pt": "Recebeu 100 likes no total em seus posts.",
            "fr": "100 likes au total sur tes posts.",
            "de": "Insgesamt 100 Likes auf deinen Posts.",
            "it": "Ricevuti 100 like totali sui tuoi post.",
            "ja": "投稿に合計 100 の「いいね」を獲得。",
            "ko": "게시글에 총 100개의 좋아요를 받았습니다.",
            "zh": "所有帖子累计获得 100 个点赞。",
            "ru": "100 лайков суммарно на постах.",
            "pl": "Łącznie 100 polubień pod postami.",
            "nl": "100 likes in totaal op je posts.",
            "el": "100 likes συνολικά στις δημοσιεύσεις σου.",
            "ar": "حصلت على 100 إعجاب إجمالي على منشوراتك.",
        },
        "gold": {
            "en": "Received 500 total likes across your posts.",
            "es": "Recibiste 500 me gusta en total en tus publicaciones.",
            "pt": "Recebeu 500 likes no total em seus posts.",
            "fr": "500 likes au total sur tes posts.",
            "de": "Insgesamt 500 Likes auf deinen Posts.",
            "it": "Ricevuti 500 like totali sui tuoi post.",
            "ja": "投稿に合計 500 の「いいね」を獲得。",
            "ko": "게시글에 총 500개의 좋아요를 받았습니다.",
            "zh": "所有帖子累计获得 500 个点赞。",
            "ru": "500 лайков суммарно на постах.",
            "pl": "Łącznie 500 polubień pod postami.",
            "nl": "500 likes in totaal op je posts.",
            "el": "500 likes συνολικά στις δημοσιεύσεις σου.",
            "ar": "حصلت على 500 إعجاب إجمالي على منشوراتك.",
        },
        "diamond": {
            "en": "Received 2,500 total likes. The room loves you.",
            "es": "Recibiste 2,500 me gusta en total. La sala te adora.",
            "pt": "Recebeu 2.500 likes no total. A sala te ama.",
            "fr": "2 500 likes au total. La salle t'adore.",
            "de": "2.500 Likes insgesamt. Der Saal liebt dich.",
            "it": "Ricevuti 2.500 like totali. La sala ti ama.",
            "ja": "合計 2,500 の「いいね」を獲得。会場中が君を愛してる。",
            "ko": "총 2,500개의 좋아요를 받았습니다. 온 플로어가 당신을 사랑합니다.",
            "zh": "累计获得 2,500 个点赞。全场都爱你。",
            "ru": "2 500 лайков суммарно. Зал вас обожает.",
            "pl": "Łącznie 2 500 polubień. Cała sala cię kocha.",
            "nl": "2.500 likes in totaal. De zaal is weg van je.",
            "el": "2.500 likes συνολικά. Όλη η αίθουσα σε λατρεύει.",
            "ar": "حصلت على 2,500 إعجاب إجمالي. الجمهور يحبّك.",
        },
    },
    "motw_love": {
        "bronze": {
            "en": "Got your first like on a Move of the Week video.",
            "es": "Recibiste tu primer me gusta en un video de Move of the Week.",
            "pt": "Recebeu seu primeiro like em um vídeo Move of the Week.",
            "fr": "Premier like sur une vidéo Move of the Week.",
            "de": "Erstes Like auf einem Move-of-the-Week-Video.",
            "it": "Primo like su un video Move of the Week.",
            "ja": "Move of the Week 動画で初めて「いいね」を獲得。",
            "ko": "Move of the Week 영상에서 첫 좋아요를 받았습니다.",
            "zh": "在 Move of the Week 视频上收到第一个点赞。",
            "ru": "Первый лайк на видео Move of the Week.",
            "pl": "Pierwsze polubienie na filmie Move of the Week.",
            "nl": "Je eerste like op een Move of the Week-video.",
            "el": "Πήρες το πρώτο σου like σε βίντεο Move of the Week.",
            "ar": "حصلت على أول إعجاب على فيديو Move of the Week.",
        },
        "silver": {
            "en": "25 likes across your Move of the Week videos.",
            "es": "25 me gusta en tus videos de Move of the Week.",
            "pt": "25 likes nos seus vídeos Move of the Week.",
            "fr": "25 likes sur tes vidéos Move of the Week.",
            "de": "25 Likes auf deinen Move-of-the-Week-Videos.",
            "it": "25 like sui tuoi video Move of the Week.",
            "ja": "Move of the Week 動画で「いいね」を合計 25 獲得。",
            "ko": "Move of the Week 영상에 총 25개의 좋아요.",
            "zh": "你的 Move of the Week 视频共获得 25 个点赞。",
            "ru": "25 лайков на ваших видео Move of the Week.",
            "pl": "25 polubień pod twoimi filmami Move of the Week.",
            "nl": "25 likes op je Move of the Week-video's.",
            "el": "25 likes συνολικά στα βίντεο Move of the Week.",
            "ar": "25 إعجاباً على فيديوهات Move of the Week الخاصة بك.",
        },
        "gold": {
            "en": "150 likes across your Move of the Week videos.",
            "es": "150 me gusta en tus videos de Move of the Week.",
            "pt": "150 likes nos seus vídeos Move of the Week.",
            "fr": "150 likes sur tes vidéos Move of the Week.",
            "de": "150 Likes auf deinen Move-of-the-Week-Videos.",
            "it": "150 like sui tuoi video Move of the Week.",
            "ja": "Move of the Week 動画で「いいね」を合計 150 獲得。",
            "ko": "Move of the Week 영상에 총 150개의 좋아요.",
            "zh": "你的 Move of the Week 视频共获得 150 个点赞。",
            "ru": "150 лайков на ваших видео Move of the Week.",
            "pl": "150 polubień pod twoimi filmami Move of the Week.",
            "nl": "150 likes op je Move of the Week-video's.",
            "el": "150 likes συνολικά στα βίντεο Move of the Week.",
            "ar": "150 إعجاباً على فيديوهات Move of the Week الخاصة بك.",
        },
        "diamond": {
            "en": "1,000 likes across your Move of the Week videos.",
            "es": "1,000 me gusta en tus videos de Move of the Week.",
            "pt": "1.000 likes nos seus vídeos Move of the Week.",
            "fr": "1 000 likes sur tes vidéos Move of the Week.",
            "de": "1.000 Likes auf deinen Move-of-the-Week-Videos.",
            "it": "1.000 like sui tuoi video Move of the Week.",
            "ja": "Move of the Week 動画で「いいね」を合計 1,000 獲得。",
            "ko": "Move of the Week 영상에 총 1,000개의 좋아요.",
            "zh": "你的 Move of the Week 视频共获得 1,000 个点赞。",
            "ru": "1 000 лайков на ваших видео Move of the Week.",
            "pl": "1 000 polubień pod twoimi filmami Move of the Week.",
            "nl": "1.000 likes op je Move of the Week-video's.",
            "el": "1.000 likes συνολικά στα βίντεο Move of the Week.",
            "ar": "1,000 إعجاب على فيديوهات Move of the Week الخاصة بك.",
        },
    },
    "original_love": {
        "bronze": {
            "en": "Got your first like on an original post.",
            "es": "Recibiste tu primer me gusta en una publicación original.",
            "pt": "Recebeu seu primeiro like em um post original.",
            "fr": "Premier like sur un post original.",
            "de": "Erstes Like auf einem originalen Post.",
            "it": "Primo like su un post originale.",
            "ja": "オリジナル投稿で初めて「いいね」を獲得。",
            "ko": "오리지널 게시물에서 첫 좋아요를 받았습니다.",
            "zh": "在原创帖子上收到第一个点赞。",
            "ru": "Первый лайк на оригинальном посте.",
            "pl": "Pierwsze polubienie pod autorskim postem.",
            "nl": "Je eerste like op een originele post.",
            "el": "Πήρες το πρώτο σου like σε πρωτότυπη δημοσίευση.",
            "ar": "حصلت على أول إعجاب على منشور أصلي.",
        },
        "silver": {
            "en": "25 likes across your original posts.",
            "es": "25 me gusta en tus publicaciones originales.",
            "pt": "25 likes nos seus posts originais.",
            "fr": "25 likes sur tes posts originaux.",
            "de": "25 Likes auf deinen originalen Posts.",
            "it": "25 like sui tuoi post originali.",
            "ja": "オリジナル投稿で合計 25 の「いいね」。",
            "ko": "오리지널 게시물에 총 25개의 좋아요.",
            "zh": "原创帖子共获得 25 个点赞。",
            "ru": "25 лайков на оригинальных постах.",
            "pl": "25 polubień pod autorskimi postami.",
            "nl": "25 likes op je originele posts.",
            "el": "25 likes στις πρωτότυπες δημοσιεύσεις σου.",
            "ar": "25 إعجاباً على منشوراتك الأصلية.",
        },
        "gold": {
            "en": "150 likes across your original posts.",
            "es": "150 me gusta en tus publicaciones originales.",
            "pt": "150 likes nos seus posts originais.",
            "fr": "150 likes sur tes posts originaux.",
            "de": "150 Likes auf deinen originalen Posts.",
            "it": "150 like sui tuoi post originali.",
            "ja": "オリジナル投稿で合計 150 の「いいね」。",
            "ko": "오리지널 게시물에 총 150개의 좋아요.",
            "zh": "原创帖子共获得 150 个点赞。",
            "ru": "150 лайков на оригинальных постах.",
            "pl": "150 polubień pod autorskimi postami.",
            "nl": "150 likes op je originele posts.",
            "el": "150 likes στις πρωτότυπες δημοσιεύσεις σου.",
            "ar": "150 إعجاباً على منشوراتك الأصلية.",
        },
        "diamond": {
            "en": "1,000 likes across your original posts.",
            "es": "1,000 me gusta en tus publicaciones originales.",
            "pt": "1.000 likes nos seus posts originais.",
            "fr": "1 000 likes sur tes posts originaux.",
            "de": "1.000 Likes auf deinen originalen Posts.",
            "it": "1.000 like sui tuoi post originali.",
            "ja": "オリジナル投稿で合計 1,000 の「いいね」。",
            "ko": "오리지널 게시물에 총 1,000개의 좋아요.",
            "zh": "原创帖子共获得 1,000 个点赞。",
            "ru": "1 000 лайков на оригинальных постах.",
            "pl": "1 000 polubień pod autorskimi postami.",
            "nl": "1.000 likes op je originele posts.",
            "el": "1.000 likes στις πρωτότυπες δημοσιεύσεις σου.",
            "ar": "1,000 إعجاب على منشوراتك الأصلية.",
        },
    },
    "guild_love": {
        "bronze": {
            "en": "Got your first like on a Guild-class post.",
            "es": "Recibiste tu primer me gusta en una publicación nivel Gremio.",
            "pt": "Recebeu seu primeiro like em um post nível Guilda.",
            "fr": "Premier like sur un post niveau Guilde.",
            "de": "Erstes Like auf einem Post auf Gilden-Niveau.",
            "it": "Primo like su un post da Gilda.",
            "ja": "ギルド級の投稿で初めて「いいね」を獲得。",
            "ko": "길드급 게시물에서 첫 좋아요를 받았습니다.",
            "zh": "在公会级帖子上收到第一个点赞。",
            "ru": "Первый лайк на посте гильдийного уровня.",
            "pl": "Pierwsze polubienie pod postem na poziomie Gildii.",
            "nl": "Je eerste like op een Gilde-klasse post.",
            "el": "Πήρες το πρώτο σου like σε δημοσίευση επιπέδου Συντεχνίας.",
            "ar": "حصلت على أول إعجاب على منشور بمستوى النقابة.",
        },
        "silver": {
            "en": "25 likes across your Guild-class posts.",
            "es": "25 me gusta en tus publicaciones nivel Gremio.",
            "pt": "25 likes nos seus posts nível Guilda.",
            "fr": "25 likes sur tes posts niveau Guilde.",
            "de": "25 Likes auf deinen Posts auf Gilden-Niveau.",
            "it": "25 like sui tuoi post da Gilda.",
            "ja": "ギルド級投稿で合計 25 の「いいね」。",
            "ko": "길드급 게시물에 총 25개의 좋아요.",
            "zh": "公会级帖子共获得 25 个点赞。",
            "ru": "25 лайков на постах гильдийного уровня.",
            "pl": "25 polubień pod postami na poziomie Gildii.",
            "nl": "25 likes op je Gilde-klasse posts.",
            "el": "25 likes στις δημοσιεύσεις επιπέδου Συντεχνίας.",
            "ar": "25 إعجاباً على منشوراتك بمستوى النقابة.",
        },
        "gold": {
            "en": "150 likes across your Guild-class posts.",
            "es": "150 me gusta en tus publicaciones nivel Gremio.",
            "pt": "150 likes nos seus posts nível Guilda.",
            "fr": "150 likes sur tes posts niveau Guilde.",
            "de": "150 Likes auf deinen Posts auf Gilden-Niveau.",
            "it": "150 like sui tuoi post da Gilda.",
            "ja": "ギルド級投稿で合計 150 の「いいね」。",
            "ko": "길드급 게시물에 총 150개의 좋아요.",
            "zh": "公会级帖子共获得 150 个点赞。",
            "ru": "150 лайков на постах гильдийного уровня.",
            "pl": "150 polubień pod postami na poziomie Gildii.",
            "nl": "150 likes op je Gilde-klasse posts.",
            "el": "150 likes στις δημοσιεύσεις επιπέδου Συντεχνίας.",
            "ar": "150 إعجاباً على منشوراتك بمستوى النقابة.",
        },
        "diamond": {
            "en": "1,000 likes across your Guild-class posts.",
            "es": "1,000 me gusta en tus publicaciones nivel Gremio.",
            "pt": "1.000 likes nos seus posts nível Guilda.",
            "fr": "1 000 likes sur tes posts niveau Guilde.",
            "de": "1.000 Likes auf deinen Posts auf Gilden-Niveau.",
            "it": "1.000 like sui tuoi post da Gilda.",
            "ja": "ギルド級投稿で合計 1,000 の「いいね」。",
            "ko": "길드급 게시물에 총 1,000개의 좋아요.",
            "zh": "公会级帖子共获得 1,000 个点赞。",
            "ru": "1 000 лайков на постах гильдийного уровня.",
            "pl": "1 000 polubień pod postami na poziomie Gildii.",
            "nl": "1.000 likes op je Gilde-klasse posts.",
            "el": "1.000 likes στις δημοσιεύσεις επιπέδου Συντεχνίας.",
            "ar": "1,000 إعجاب على منشوراتك بمستوى النقابة.",
        },
    },
}


# Badges that don't fit the family/tier template — translate directly.
SPECIAL_BADGES: dict[str, dict[str, dict[str, str]]] = {
    "promoter": {
        "en": {"name": "Promoter",  "description": "Brought 3 dancers into the Guild through your referral link."},
        "es": {"name": "Promotor",  "description": "Trajiste 3 bailarines al Gremio mediante tu enlace de referido."},
        "pt": {"name": "Promotor",  "description": "Trouxe 3 dançarinos para a Guilda pelo seu link de indicação."},
        "fr": {"name": "Promoteur", "description": "Tu as amené 3 danseurs dans la Guilde via ton lien de parrainage."},
        "de": {"name": "Promoter",  "description": "Drei Tänzer über deinen Einladungslink in die Gilde gebracht."},
        "it": {"name": "Promotore", "description": "Hai portato 3 ballerini nella Gilda tramite il tuo link di invito."},
        "ja": {"name": "プロモーター", "description": "紹介リンク経由で 3 人のダンサーをギルドに招待。"},
        "ko": {"name": "프로모터",    "description": "추천 링크로 댄서 3명을 길드에 데려왔습니다."},
        "zh": {"name": "推广者",      "description": "通过你的推荐链接带了 3 位舞者加入公会。"},
        "ru": {"name": "Промоутер",   "description": "Привели 3 танцоров в Гильдию по реферальной ссылке."},
        "pl": {"name": "Promotor",    "description": "Sprowadziłeś 3 tancerzy do Gildii przez swój link referencyjny."},
        "nl": {"name": "Promoter",    "description": "Drie dansers via je verwijslink het Gilde in gebracht."},
        "el": {"name": "Προωθητής",   "description": "Έφερες 3 χορευτές στη Συντεχνία μέσω του συνδέσμου πρόσκλησής σου."},
        "ar": {"name": "مُروّج",       "description": "جلبت 3 راقصين إلى النقابة عبر رابط الإحالة."},
    },
    "founder_diamond": {
        "en": {"name": "Founder",  "description": "One of the founding members of The Mambo Guild."},
        "es": {"name": "Fundador", "description": "Miembro fundador de The Mambo Guild."},
        "pt": {"name": "Fundador", "description": "Membro fundador de The Mambo Guild."},
        "fr": {"name": "Fondateur","description": "Membre fondateur de The Mambo Guild."},
        "de": {"name": "Gründer",  "description": "Gründungsmitglied von The Mambo Guild."},
        "it": {"name": "Fondatore","description": "Membro fondatore di The Mambo Guild."},
        "ja": {"name": "ファウンダー", "description": "The Mambo Guild の創設メンバーの一人。"},
        "ko": {"name": "파운더",      "description": "The Mambo Guild의 창립 멤버 중 한 명."},
        "zh": {"name": "创始人",      "description": "The Mambo Guild 的创始成员之一。"},
        "ru": {"name": "Основатель",  "description": "Один из основателей The Mambo Guild."},
        "pl": {"name": "Założyciel",  "description": "Jeden z członków założycieli The Mambo Guild."},
        "nl": {"name": "Oprichter",   "description": "Een van de oprichtende leden van The Mambo Guild."},
        "el": {"name": "Ιδρυτής",     "description": "Ένας από τους ιδρυτές του The Mambo Guild."},
        "ar": {"name": "مؤسس",        "description": "أحد الأعضاء المؤسسين لـ The Mambo Guild."},
    },
}


def _resolve_family_badge(locale: str, bid: str) -> dict[str, str] | None:
    """Parse `{family}_{tier}` ID and return {name, description} for locale,
    or None if the ID doesn't match a known family."""
    for family in sorted(FAMILY_NAMES, key=len, reverse=True):
        for tier, suffix in TIER_SUFFIX.items():
            if bid == f"{family}_{tier}":
                name_map = FAMILY_NAMES[family]
                desc_map = DESCRIPTION_TEMPLATES.get(family, {}).get(tier, {})
                if locale not in name_map or locale not in desc_map:
                    return None
                return {
                    "name": name_map[locale] + suffix,
                    "description": desc_map[locale],
                }
    return None


def patch_locale(locale: str) -> None:
    path = MESSAGES_DIR / f"{locale}.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    badges = data.get("badges", {})
    if not isinstance(badges, dict):
        print(f"skip {locale}.json — badges is not an object")
        return

    added = 0
    updated = 0
    for bid, strings in EN_BADGES.items():
        # 1. Try the localized family template first.
        localized = _resolve_family_badge(locale, bid)
        # 2. Fall back to explicit special-badge translations.
        if localized is None and bid in SPECIAL_BADGES:
            localized = SPECIAL_BADGES[bid].get(locale)
        # 3. Final fallback is English.
        if localized is None:
            localized = strings

        existing = badges.get(bid)
        if existing is None:
            badges[bid] = {"name": localized["name"], "description": localized["description"]}
            added += 1
            continue

        # Always overwrite with localized values when available — this is what
        # "propagate to all locales" means. For locales that still resolve to
        # English (no family match + no special entry), we leave existing
        # translator-supplied values alone via the setdefault path.
        if localized is strings:
            existing.setdefault("name", strings["name"])
            existing.setdefault("description", strings["description"])
            # Also refresh threshold-style descriptions as the legacy script did.
            if "description" in existing and any(c.isdigit() for c in existing["description"]):
                if existing["description"] != strings["description"]:
                    existing["description"] = strings["description"]
                    updated += 1
        else:
            # We have a real translation — overwrite the existing fallback.
            changed = False
            if existing.get("name") != localized["name"]:
                existing["name"] = localized["name"]
                changed = True
            if existing.get("description") != localized["description"]:
                existing["description"] = localized["description"]
                changed = True
            if changed:
                updated += 1

    data["badges"] = badges
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"patched {locale}.json  (+{added} new, {updated} description updates)")


def main() -> None:
    for locale in LOCALES:
        patch_locale(locale)


if __name__ == "__main__":
    main()
