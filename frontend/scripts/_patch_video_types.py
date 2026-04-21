"""
One-shot patch: replace feedback-chip i18n keys with video-type keys across
all 14 locales.

Removes:
  fbHype, fbTiming, fbFootwork, fbFrame, fbStyling,
  feedbackWantedLabel, feedbackWantedHint, feedbackWantedPrefix

Adds (under "community"):
  videoTypeLabel, videoTypeHint, videoTypeRequired,
  videoTypeMotw, videoTypeMotwHint,
  videoTypeOriginal, videoTypeOriginalHint,
  videoTypeGuild, videoTypeGuildHint
"""
from __future__ import annotations
import json
from pathlib import Path

MESSAGES_DIR = Path(__file__).resolve().parents[1] / "messages"

REMOVE_KEYS = [
    "fbHype",
    "fbTiming",
    "fbFootwork",
    "fbFrame",
    "fbStyling",
    "feedbackWantedLabel",
    "feedbackWantedHint",
    "feedbackWantedPrefix",
]

# One entry per locale. Keep it terse — this is a picker inside the composer.
LOCALE_STRINGS: dict[str, dict[str, str]] = {
    "en": {
        "videoTypeLabel": "Video type",
        "videoTypeHint": "Pick what kind of video this is. It shows on the card.",
        "videoTypeRequired": "Please pick a video type.",
        "videoTypeMotw": "Move of the Week",
        "videoTypeMotwHint": "Your take on this week's challenge move.",
        "videoTypeOriginal": "Original",
        "videoTypeOriginalHint": "Your own choreo or freestyle.",
        "videoTypeGuild": "Guild",
        "videoTypeGuildHint": "A combo from a Guild class or rehearsal.",
    },
    "es": {
        "videoTypeLabel": "Tipo de video",
        "videoTypeHint": "Elige de qué tipo es este video. Se muestra en la tarjeta.",
        "videoTypeRequired": "Selecciona un tipo de video.",
        "videoTypeMotw": "Paso de la semana",
        "videoTypeMotwHint": "Tu versión del reto de esta semana.",
        "videoTypeOriginal": "Original",
        "videoTypeOriginalHint": "Tu propia coreografía o freestyle.",
        "videoTypeGuild": "Guild",
        "videoTypeGuildHint": "Un combo de clase o ensayo del Guild.",
    },
    "pt": {
        "videoTypeLabel": "Tipo de vídeo",
        "videoTypeHint": "Escolha que tipo de vídeo é. Aparece no card.",
        "videoTypeRequired": "Escolha um tipo de vídeo.",
        "videoTypeMotw": "Passo da semana",
        "videoTypeMotwHint": "Sua versão do desafio da semana.",
        "videoTypeOriginal": "Original",
        "videoTypeOriginalHint": "Sua própria coreografia ou freestyle.",
        "videoTypeGuild": "Guild",
        "videoTypeGuildHint": "Um combo de aula ou ensaio do Guild.",
    },
    "fr": {
        "videoTypeLabel": "Type de vidéo",
        "videoTypeHint": "Choisis le type de vidéo. Il s'affiche sur la carte.",
        "videoTypeRequired": "Choisis un type de vidéo.",
        "videoTypeMotw": "Pas de la semaine",
        "videoTypeMotwHint": "Ta version du défi de la semaine.",
        "videoTypeOriginal": "Original",
        "videoTypeOriginalHint": "Ta propre choré ou freestyle.",
        "videoTypeGuild": "Guild",
        "videoTypeGuildHint": "Un combo de cours ou de répétition Guild.",
    },
    "de": {
        "videoTypeLabel": "Video-Typ",
        "videoTypeHint": "Wähle, was für ein Video das ist. Wird auf der Karte angezeigt.",
        "videoTypeRequired": "Bitte wähle einen Video-Typ.",
        "videoTypeMotw": "Move der Woche",
        "videoTypeMotwHint": "Deine Version der Challenge dieser Woche.",
        "videoTypeOriginal": "Original",
        "videoTypeOriginalHint": "Deine eigene Choreo oder Freestyle.",
        "videoTypeGuild": "Guild",
        "videoTypeGuildHint": "Ein Combo aus einer Guild-Stunde oder Probe.",
    },
    "it": {
        "videoTypeLabel": "Tipo di video",
        "videoTypeHint": "Scegli che tipo di video è. Appare sulla card.",
        "videoTypeRequired": "Scegli un tipo di video.",
        "videoTypeMotw": "Passo della settimana",
        "videoTypeMotwHint": "La tua versione della sfida della settimana.",
        "videoTypeOriginal": "Originale",
        "videoTypeOriginalHint": "La tua coreografia o freestyle.",
        "videoTypeGuild": "Guild",
        "videoTypeGuildHint": "Un combo da una lezione o prova Guild.",
    },
    "ja": {
        "videoTypeLabel": "ビデオの種類",
        "videoTypeHint": "どのタイプの動画か選んでください。カードに表示されます。",
        "videoTypeRequired": "ビデオの種類を選んでください。",
        "videoTypeMotw": "今週のムーブ",
        "videoTypeMotwHint": "今週のチャレンジへの挑戦。",
        "videoTypeOriginal": "オリジナル",
        "videoTypeOriginalHint": "自作の振付またはフリースタイル。",
        "videoTypeGuild": "ギルド",
        "videoTypeGuildHint": "ギルドのクラスやリハのコンボ。",
    },
    "ko": {
        "videoTypeLabel": "비디오 유형",
        "videoTypeHint": "어떤 종류의 영상인지 선택하세요. 카드에 표시됩니다.",
        "videoTypeRequired": "비디오 유형을 선택하세요.",
        "videoTypeMotw": "이주의 무브",
        "videoTypeMotwHint": "이번 주 챌린지에 대한 당신의 해석.",
        "videoTypeOriginal": "오리지널",
        "videoTypeOriginalHint": "자작 안무 또는 프리스타일.",
        "videoTypeGuild": "길드",
        "videoTypeGuildHint": "길드 수업 또는 리허설 콤보.",
    },
    "zh": {
        "videoTypeLabel": "视频类型",
        "videoTypeHint": "选择这段视频的类型。会显示在卡片上。",
        "videoTypeRequired": "请选择视频类型。",
        "videoTypeMotw": "本周动作",
        "videoTypeMotwHint": "你对本周挑战的演绎。",
        "videoTypeOriginal": "原创",
        "videoTypeOriginalHint": "你自己的编舞或自由舞。",
        "videoTypeGuild": "Guild",
        "videoTypeGuildHint": "来自 Guild 课堂或排练的组合。",
    },
    "ru": {
        "videoTypeLabel": "Тип видео",
        "videoTypeHint": "Выбери, что это за видео. Показывается на карточке.",
        "videoTypeRequired": "Выбери тип видео.",
        "videoTypeMotw": "Движение недели",
        "videoTypeMotwHint": "Твой вариант вызова этой недели.",
        "videoTypeOriginal": "Оригинал",
        "videoTypeOriginalHint": "Твоя хореография или фристайл.",
        "videoTypeGuild": "Гильдия",
        "videoTypeGuildHint": "Комбо с урока или репетиции Гильдии.",
    },
    "pl": {
        "videoTypeLabel": "Typ wideo",
        "videoTypeHint": "Wybierz, jakiego rodzaju to wideo. Pojawia się na karcie.",
        "videoTypeRequired": "Wybierz typ wideo.",
        "videoTypeMotw": "Ruch tygodnia",
        "videoTypeMotwHint": "Twoja wersja tygodniowego wyzwania.",
        "videoTypeOriginal": "Oryginał",
        "videoTypeOriginalHint": "Twoja choreografia lub freestyle.",
        "videoTypeGuild": "Guild",
        "videoTypeGuildHint": "Kombo z zajęć lub próby Guild.",
    },
    "nl": {
        "videoTypeLabel": "Videotype",
        "videoTypeHint": "Kies wat voor video dit is. Komt op de kaart te staan.",
        "videoTypeRequired": "Kies een videotype.",
        "videoTypeMotw": "Move van de week",
        "videoTypeMotwHint": "Jouw versie van de challenge van deze week.",
        "videoTypeOriginal": "Origineel",
        "videoTypeOriginalHint": "Je eigen choreo of freestyle.",
        "videoTypeGuild": "Guild",
        "videoTypeGuildHint": "Een combo uit een Guild-les of repetitie.",
    },
    "el": {
        "videoTypeLabel": "Τύπος βίντεο",
        "videoTypeHint": "Διάλεξε τι είδους βίντεο είναι. Εμφανίζεται στην κάρτα.",
        "videoTypeRequired": "Διάλεξε τύπο βίντεο.",
        "videoTypeMotw": "Κίνηση της εβδομάδας",
        "videoTypeMotwHint": "Η εκδοχή σου στην πρόκληση της εβδομάδας.",
        "videoTypeOriginal": "Πρωτότυπο",
        "videoTypeOriginalHint": "Η δική σου χορογραφία ή freestyle.",
        "videoTypeGuild": "Guild",
        "videoTypeGuildHint": "Combo από μάθημα ή πρόβα του Guild.",
    },
    "ar": {
        "videoTypeLabel": "نوع الفيديو",
        "videoTypeHint": "اختر نوع هذا الفيديو. يظهر على البطاقة.",
        "videoTypeRequired": "اختر نوع الفيديو.",
        "videoTypeMotw": "حركة الأسبوع",
        "videoTypeMotwHint": "نسختك من تحدي هذا الأسبوع.",
        "videoTypeOriginal": "أصلي",
        "videoTypeOriginalHint": "كوريو أو فري ستايل من تأليفك.",
        "videoTypeGuild": "Guild",
        "videoTypeGuildHint": "كومبو من حصة أو بروفة Guild.",
    },
}


def patch_locale(locale_code: str) -> None:
    path = MESSAGES_DIR / f"{locale_code}.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    community = data.get("community", {})

    # Remove old keys
    for key in REMOVE_KEYS:
        community.pop(key, None)

    # Add new keys
    new_strings = LOCALE_STRINGS.get(locale_code, LOCALE_STRINGS["en"])
    community.update(new_strings)

    data["community"] = community
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"patched {locale_code}.json")


def main() -> None:
    for locale_code in sorted(LOCALE_STRINGS.keys()):
        patch_locale(locale_code)


if __name__ == "__main__":
    main()
