"""
Add the two caption keys + the new profile image alt to the community
pillar on the howItWorks section, across all 14 locales.

Captions follow the same short all-caps pattern as the video-player
pillar ("MIRRORED VIEW" / "BACK VIEW").
"""
from __future__ import annotations
import json
from pathlib import Path

MESSAGES_DIR = Path(__file__).resolve().parents[1] / "messages"

LOCALES = ["en", "es", "pt", "fr", "de", "it", "ja", "ko", "zh", "ru", "pl", "nl", "el", "ar"]


UPDATES: dict[str, dict[str, str]] = {
    "en": {
        "pillarCommunityFeedCaption": "THE FEED",
        "pillarCommunityProfileCaption": "YOUR PROFILE",
        "pillarImageAltCommunityProfile": "Profile page showing streak, XP, tier, claves and trophy case",
    },
    "es": {
        "pillarCommunityFeedCaption": "EL FEED",
        "pillarCommunityProfileCaption": "TU PERFIL",
        "pillarImageAltCommunityProfile": "Perfil con racha, XP, tier, claves y vitrina de trofeos",
    },
    "pt": {
        "pillarCommunityFeedCaption": "O FEED",
        "pillarCommunityProfileCaption": "SEU PERFIL",
        "pillarImageAltCommunityProfile": "Perfil com streak, XP, tier, claves e vitrine de troféus",
    },
    "fr": {
        "pillarCommunityFeedCaption": "LE FEED",
        "pillarCommunityProfileCaption": "TON PROFIL",
        "pillarImageAltCommunityProfile": "Profil avec streak, XP, tier, claves et vitrine à trophées",
    },
    "de": {
        "pillarCommunityFeedCaption": "DER FEED",
        "pillarCommunityProfileCaption": "DEIN PROFIL",
        "pillarImageAltCommunityProfile": "Profil mit Streak, XP, Tier, Claves und Trophäenschrank",
    },
    "it": {
        "pillarCommunityFeedCaption": "IL FEED",
        "pillarCommunityProfileCaption": "IL TUO PROFILO",
        "pillarImageAltCommunityProfile": "Profilo con streak, XP, tier, claves e bacheca dei trofei",
    },
    "ja": {
        "pillarCommunityFeedCaption": "フィード",
        "pillarCommunityProfileCaption": "あなたのプロフィール",
        "pillarImageAltCommunityProfile": "連続記録、XP、ティア、クラベ、トロフィーケースを示すプロフィールページ",
    },
    "ko": {
        "pillarCommunityFeedCaption": "피드",
        "pillarCommunityProfileCaption": "내 프로필",
        "pillarImageAltCommunityProfile": "연속 기록, XP, 티어, 클라베, 트로피 케이스가 보이는 프로필",
    },
    "zh": {
        "pillarCommunityFeedCaption": "动态",
        "pillarCommunityProfileCaption": "你的主页",
        "pillarImageAltCommunityProfile": "显示连击、经验、等级、claves 和奖杯陈列的个人主页",
    },
    "ru": {
        "pillarCommunityFeedCaption": "ЛЕНТА",
        "pillarCommunityProfileCaption": "ТВОЙ ПРОФИЛЬ",
        "pillarImageAltCommunityProfile": "Профиль со стриком, XP, тиром, клавами и витриной трофеев",
    },
    "pl": {
        "pillarCommunityFeedCaption": "FEED",
        "pillarCommunityProfileCaption": "TWÓJ PROFIL",
        "pillarImageAltCommunityProfile": "Profil ze streakiem, XP, tierem, klawe i gablotą trofeów",
    },
    "nl": {
        "pillarCommunityFeedCaption": "DE FEED",
        "pillarCommunityProfileCaption": "JOUW PROFIEL",
        "pillarImageAltCommunityProfile": "Profiel met streak, XP, tier, claves en trofeeënkast",
    },
    "el": {
        "pillarCommunityFeedCaption": "ΤΟ FEED",
        "pillarCommunityProfileCaption": "ΤΟ ΠΡΟΦΙΛ ΣΟΥ",
        "pillarImageAltCommunityProfile": "Προφίλ με streak, XP, tier, claves και προθήκη τροπαίων",
    },
    "ar": {
        "pillarCommunityFeedCaption": "الخلاصة",
        "pillarCommunityProfileCaption": "ملفك الشخصي",
        "pillarImageAltCommunityProfile": "صفحة الملف الشخصي تعرض streak وXP والتير وclaves وخزانة الكؤوس",
    },
}


def patch_locale(locale: str) -> None:
    path = MESSAGES_DIR / f"{locale}.json"
    if not path.exists():
        print(f"skip {locale}.json — missing")
        return
    data = json.loads(path.read_text(encoding="utf-8"))
    how = data.setdefault("landing", {}).setdefault("howItWorks", {})
    for key, value in UPDATES.get(locale, UPDATES["en"]).items():
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
