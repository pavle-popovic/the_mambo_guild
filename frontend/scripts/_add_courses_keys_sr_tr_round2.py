"""One-off: add a small set of new courses.* keys (badge labels, course-type
labels, empty-state hint) to every locale message file in all 16 supported
locales. Translations are hand-written below.
"""
from __future__ import annotations
import json
from pathlib import Path

MESSAGES = Path(__file__).resolve().parents[1] / "messages"

# ─── Per-locale translations for the new keys ───────────────────────────────
# All values authored in-session.
TRANSLATIONS: dict[str, dict[str, str]] = {
    "en": {
        "modules":          "Modules",
        "clearFilters":     "Clear All Filters",
        "typeCourse":       "Course",
        "typeChoreo":       "Choreo",
        "typeTopic":        "Topic",
        "noResultsHint":    "Try a different filter or clear all filters.",
    },
    "es": {
        "modules":          "Módulos",
        "clearFilters":     "Borrar todos los filtros",
        "typeCourse":       "Curso",
        "typeChoreo":       "Coreo",
        "typeTopic":        "Tema",
        "noResultsHint":    "Prueba con otro filtro o borra todos los filtros.",
    },
    "pt": {
        "modules":          "Módulos",
        "clearFilters":     "Limpar todos os filtros",
        "typeCourse":       "Curso",
        "typeChoreo":       "Coreo",
        "typeTopic":        "Tema",
        "noResultsHint":    "Tente outro filtro ou limpe todos os filtros.",
    },
    "fr": {
        "modules":          "Modules",
        "clearFilters":     "Effacer tous les filtres",
        "typeCourse":       "Cours",
        "typeChoreo":       "Choré",
        "typeTopic":        "Sujet",
        "noResultsHint":    "Essaie un autre filtre ou efface tous les filtres.",
    },
    "de": {
        "modules":          "Module",
        "clearFilters":     "Alle Filter löschen",
        "typeCourse":       "Kurs",
        "typeChoreo":       "Choreo",
        "typeTopic":        "Thema",
        "noResultsHint":    "Probier einen anderen Filter oder lösch alle Filter.",
    },
    "it": {
        "modules":          "Moduli",
        "clearFilters":     "Cancella tutti i filtri",
        "typeCourse":       "Corso",
        "typeChoreo":       "Coreo",
        "typeTopic":        "Argomento",
        "noResultsHint":    "Prova un altro filtro o cancellali tutti.",
    },
    "ja": {
        "modules":          "モジュール",
        "clearFilters":     "すべてのフィルターをクリア",
        "typeCourse":       "コース",
        "typeChoreo":       "振付",
        "typeTopic":        "トピック",
        "noResultsHint":    "別のフィルターを試すか、すべてクリアしてください。",
    },
    "ko": {
        "modules":          "모듈",
        "clearFilters":     "모든 필터 지우기",
        "typeCourse":       "코스",
        "typeChoreo":       "안무",
        "typeTopic":        "주제",
        "noResultsHint":    "다른 필터를 시도하거나 모두 지워보세요.",
    },
    "zh": {
        "modules":          "模块",
        "clearFilters":     "清除所有筛选",
        "typeCourse":       "课程",
        "typeChoreo":       "编舞",
        "typeTopic":        "主题",
        "noResultsHint":    "尝试不同的筛选条件或清除所有筛选。",
    },
    "ru": {
        "modules":          "Модули",
        "clearFilters":     "Сбросить все фильтры",
        "typeCourse":       "Курс",
        "typeChoreo":       "Хорео",
        "typeTopic":        "Тема",
        "noResultsHint":    "Попробуй другой фильтр или сбрось все.",
    },
    "pl": {
        "modules":          "Moduły",
        "clearFilters":     "Wyczyść wszystkie filtry",
        "typeCourse":       "Kurs",
        "typeChoreo":       "Choreo",
        "typeTopic":        "Temat",
        "noResultsHint":    "Spróbuj innego filtra lub wyczyść wszystkie.",
    },
    "nl": {
        "modules":          "Modules",
        "clearFilters":     "Alle filters wissen",
        "typeCourse":       "Cursus",
        "typeChoreo":       "Choreo",
        "typeTopic":        "Onderwerp",
        "noResultsHint":    "Probeer een ander filter of wis ze allemaal.",
    },
    "ar": {
        "modules":          "وحدات",
        "clearFilters":     "مسح كل المرشحات",
        "typeCourse":       "دورة",
        "typeChoreo":       "كوريو",
        "typeTopic":        "موضوع",
        "noResultsHint":    "جرب مرشحًا آخر أو امسحها جميعًا.",
    },
    "el": {
        "modules":          "Ενότητες",
        "clearFilters":     "Καθαρισμός όλων των φίλτρων",
        "typeCourse":       "Μάθημα",
        "typeChoreo":       "Χορογραφία",
        "typeTopic":        "Θέμα",
        "noResultsHint":    "Δοκίμασε άλλο φίλτρο ή καθάρισέ τα όλα.",
    },
    "sr": {
        "modules":          "Модули",
        "clearFilters":     "Очисти све филтере",
        "typeCourse":       "Курс",
        "typeChoreo":       "Корео",
        "typeTopic":        "Тема",
        "noResultsHint":    "Покушај други филтер или очисти све.",
    },
    "tr": {
        "modules":          "Modüller",
        "clearFilters":     "Tüm Filtreleri Temizle",
        "typeCourse":       "Ders",
        "typeChoreo":       "Koreografi",
        "typeTopic":        "Konu",
        "noResultsHint":    "Farklı bir filtre dene veya tümünü temizle.",
    },
}


def main() -> None:
    expected = set(TRANSLATIONS["en"].keys())
    for loc in TRANSLATIONS:
        path = MESSAGES / f"{loc}.json"
        d = json.loads(path.read_text(encoding="utf-8"))
        d.setdefault("courses", {}).update(TRANSLATIONS[loc])
        path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        # Sanity: every expected key landed.
        missing = expected - set(d["courses"].keys())
        if missing:
            print(f"  {loc}: MISSING {missing}")
        else:
            print(f"  {loc}: +{len(expected)} keys ok")


if __name__ == "__main__":
    main()
