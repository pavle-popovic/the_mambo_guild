"""
Update landing.howItWorks.pillarCommunity* and pillarCoursesBullet5 across
all 14 locales to match the refreshed English copy:
  - claves + Guild Shop framing in pillarCommunityBody
  - "+10 claves" / "+3 claves" in Community bullets 1 and 2
  - No em-dashes (project rule)
  - Drop "partnering" from pillarCoursesBullet5

This script OVERWRITES just these specific keys on each run.
"""
from __future__ import annotations
import json
from pathlib import Path

MESSAGES_DIR = Path(__file__).resolve().parents[1] / "messages"

LOCALES = ["en", "es", "pt", "fr", "de", "it", "ja", "ko", "zh", "ru", "pl", "nl", "el", "ar", "sr", "tr"]


# Each locale provides overrides for howItWorks.*
UPDATES: dict[str, dict[str, str]] = {
    "en": {
        "pillarCommunityBody": "Post videos. Ask questions. Earn claves. Spend them in the Guild Shop.",
        "pillarCommunityBullet1": "The Stage: post progress videos, +10 claves",
        "pillarCommunityBullet2": "The Lab: ask and answer questions, +3 claves",
        "pillarCommunityBullet3": "Hype or Coach feedback",
        "pillarCommunityBullet4": "38 badges, Bronze to Diamond",
        "pillarCommunityBullet5": "Weekly and all-time leaderboards",
        "pillarCoursesBullet5": "Technique, styling, musicality",
    },
    "es": {
        "pillarCommunityBody": "Publica videos. Haz preguntas. Gana claves. Gástalos en la Tienda del Gremio.",
        "pillarCommunityBullet1": "The Stage: publica videos de progreso, +10 claves",
        "pillarCommunityBullet2": "The Lab: pregunta y responde, +3 claves",
        "pillarCommunityBullet3": "Feedback tipo Hype o Coach",
        "pillarCommunityBullet4": "38 insignias, de Bronce a Diamante",
        "pillarCommunityBullet5": "Rankings semanales y de todos los tiempos",
        "pillarCoursesBullet5": "Técnica, estilo, musicalidad",
    },
    "pt": {
        "pillarCommunityBody": "Poste vídeos. Faça perguntas. Ganhe claves. Gaste na Loja da Guilda.",
        "pillarCommunityBullet1": "The Stage: poste vídeos de progresso, +10 claves",
        "pillarCommunityBullet2": "The Lab: pergunte e responda, +3 claves",
        "pillarCommunityBullet3": "Feedback Hype ou Coach",
        "pillarCommunityBullet4": "38 insígnias, do Bronze ao Diamante",
        "pillarCommunityBullet5": "Rankings semanais e de todos os tempos",
        "pillarCoursesBullet5": "Técnica, estilo, musicalidade",
    },
    "fr": {
        "pillarCommunityBody": "Poste tes vidéos. Pose des questions. Gagne des claves. Dépense-les dans la Boutique de la Guilde.",
        "pillarCommunityBullet1": "The Stage : poste des vidéos de progression, +10 claves",
        "pillarCommunityBullet2": "The Lab : pose et réponds aux questions, +3 claves",
        "pillarCommunityBullet3": "Retours Hype ou Coach",
        "pillarCommunityBullet4": "38 badges, du Bronze au Diamant",
        "pillarCommunityBullet5": "Classements hebdo et all-time",
        "pillarCoursesBullet5": "Technique, style, musicalité",
    },
    "de": {
        "pillarCommunityBody": "Videos posten. Fragen stellen. Claves verdienen. Im Gilden-Shop ausgeben.",
        "pillarCommunityBullet1": "The Stage: poste Fortschrittsvideos, +10 Claves",
        "pillarCommunityBullet2": "The Lab: Fragen stellen und beantworten, +3 Claves",
        "pillarCommunityBullet3": "Hype- oder Coach-Feedback",
        "pillarCommunityBullet4": "38 Badges, Bronze bis Diamant",
        "pillarCommunityBullet5": "Wöchentliche und All-Time-Bestenlisten",
        "pillarCoursesBullet5": "Technik, Styling, Musikalität",
    },
    "it": {
        "pillarCommunityBody": "Pubblica video. Fai domande. Guadagna claves. Spendili nel Negozio della Gilda.",
        "pillarCommunityBullet1": "The Stage: pubblica video di progresso, +10 claves",
        "pillarCommunityBullet2": "The Lab: fai e rispondi a domande, +3 claves",
        "pillarCommunityBullet3": "Feedback Hype o Coach",
        "pillarCommunityBullet4": "38 badge, dal Bronzo al Diamante",
        "pillarCommunityBullet5": "Classifiche settimanali e all-time",
        "pillarCoursesBullet5": "Tecnica, stile, musicalità",
    },
    "ja": {
        "pillarCommunityBody": "動画を投稿。質問を投げる。クラベを稼ぐ。ギルドショップで使う。",
        "pillarCommunityBullet1": "The Stage: 進捗動画を投稿、+10 クラベ",
        "pillarCommunityBullet2": "The Lab: 質問と回答、+3 クラベ",
        "pillarCommunityBullet3": "応援コメントまたはコーチングのフィードバック",
        "pillarCommunityBullet4": "38個のバッジ、ブロンズからダイヤモンドまで",
        "pillarCommunityBullet5": "週間＆歴代ランキング",
        "pillarCoursesBullet5": "テクニック、スタイリング、音楽性",
    },
    "ko": {
        "pillarCommunityBody": "영상을 올리세요. 질문하세요. 클라베를 얻고 길드 상점에서 쓰세요.",
        "pillarCommunityBullet1": "The Stage: 진행 영상 게시, +10 클라베",
        "pillarCommunityBullet2": "The Lab: 질문하고 답하기, +3 클라베",
        "pillarCommunityBullet3": "Hype 또는 Coach 피드백",
        "pillarCommunityBullet4": "38개 배지, 브론즈부터 다이아몬드까지",
        "pillarCommunityBullet5": "주간 및 역대 리더보드",
        "pillarCoursesBullet5": "기술, 스타일링, 음악성",
    },
    "zh": {
        "pillarCommunityBody": "发布视频。提问。赚取 claves。到公会商店花掉。",
        "pillarCommunityBullet1": "The Stage: 发布进度视频，+10 claves",
        "pillarCommunityBullet2": "The Lab: 提问和回答，+3 claves",
        "pillarCommunityBullet3": "Hype 或 Coach 反馈",
        "pillarCommunityBullet4": "38 枚徽章，从青铜到钻石",
        "pillarCommunityBullet5": "每周与历代榜单",
        "pillarCoursesBullet5": "技术、风格、乐感",
    },
    "ru": {
        "pillarCommunityBody": "Выкладывайте видео. Задавайте вопросы. Зарабатывайте клавы. Тратьте в Магазине Гильдии.",
        "pillarCommunityBullet1": "The Stage: публикуйте видео прогресса, +10 клав",
        "pillarCommunityBullet2": "The Lab: задавайте и отвечайте, +3 клав",
        "pillarCommunityBullet3": "Фидбэк Hype или Coach",
        "pillarCommunityBullet4": "38 значков, от Бронзы до Алмаза",
        "pillarCommunityBullet5": "Недельные и общие рейтинги",
        "pillarCoursesBullet5": "Техника, стиль, музыкальность",
    },
    "pl": {
        "pillarCommunityBody": "Wrzucaj filmy. Zadawaj pytania. Zdobywaj klawe. Wydawaj je w Sklepie Gildii.",
        "pillarCommunityBullet1": "The Stage: wrzucaj filmy z postępami, +10 klawe",
        "pillarCommunityBullet2": "The Lab: pytaj i odpowiadaj, +3 klawe",
        "pillarCommunityBullet3": "Feedback Hype lub Coach",
        "pillarCommunityBullet4": "38 odznak, od Brązu do Diamentu",
        "pillarCommunityBullet5": "Tygodniowe i wiecznotrwałe rankingi",
        "pillarCoursesBullet5": "Technika, styl, muzykalność",
    },
    "nl": {
        "pillarCommunityBody": "Post video's. Stel vragen. Verdien claves. Geef ze uit in de Gilde-winkel.",
        "pillarCommunityBullet1": "The Stage: post voortgangsvideo's, +10 claves",
        "pillarCommunityBullet2": "The Lab: stel en beantwoord vragen, +3 claves",
        "pillarCommunityBullet3": "Hype- of Coach-feedback",
        "pillarCommunityBullet4": "38 badges, Brons tot Diamant",
        "pillarCommunityBullet5": "Weekranglijsten en all-time",
        "pillarCoursesBullet5": "Techniek, styling, musicaliteit",
    },
    "el": {
        "pillarCommunityBody": "Δημοσίευσε βίντεο. Ρώτα. Κέρδισε claves. Ξόδεψέ τα στο κατάστημα της Συντεχνίας.",
        "pillarCommunityBullet1": "The Stage: δημοσίευσε βίντεο προόδου, +10 claves",
        "pillarCommunityBullet2": "The Lab: ρώτα και απάντα, +3 claves",
        "pillarCommunityBullet3": "Feedback τύπου Hype ή Coach",
        "pillarCommunityBullet4": "38 σήματα, από Χάλκινο ως Διαμαντένιο",
        "pillarCommunityBullet5": "Εβδομαδιαίες και all-time κατατάξεις",
        "pillarCoursesBullet5": "Τεχνική, στυλ, μουσικότητα",
    },
    "ar": {
        "pillarCommunityBody": "انشر الفيديوهات. اطرح الأسئلة. اكسب claves. أنفقها في متجر النقابة.",
        "pillarCommunityBullet1": "The Stage: انشر فيديوهات التقدّم، +10 claves",
        "pillarCommunityBullet2": "The Lab: اسأل وأجب، +3 claves",
        "pillarCommunityBullet3": "تشجيع أو ملاحظات مدرّب",
        "pillarCommunityBullet4": "38 شارة، من البرونزية إلى الماسية",
        "pillarCommunityBullet5": "لوحات صدارة أسبوعية ودائمة",
        "pillarCoursesBullet5": "تقنية، ستايل، موسيقية",
    },
}


def patch_locale(locale: str) -> None:
    path = MESSAGES_DIR / f"{locale}.json"
    if not path.exists():
        print(f"skip {locale}.json — missing")
        return
    if locale not in UPDATES:
        print(f"skip {locale}.json — no updates defined")
        return
    data = json.loads(path.read_text(encoding="utf-8"))
    landing = data.setdefault("landing", {})
    how = landing.setdefault("howItWorks", {})
    for key, value in UPDATES[locale].items():
        how[key] = value
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"patched {locale}.json")


def main() -> None:
    for locale in LOCALES:
        patch_locale(locale)


if __name__ == "__main__":
    main()
