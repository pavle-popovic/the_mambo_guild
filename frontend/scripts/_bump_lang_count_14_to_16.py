"""One-off: bump the '14 languages' references to '16' across all locale
message files. Touches only three known leaf paths to keep the change
narrow and locale-noun preserved.

Usage:  python frontend/scripts/_bump_lang_count_14_to_16.py
"""
import json
from pathlib import Path

MESSAGES = Path(__file__).resolve().parents[1] / "messages"
LOCALES = ["en", "es", "pt", "fr", "de", "it", "ja", "ko", "zh", "ru", "pl", "nl", "ar", "el"]
PATHS = [
    ("landing", "hero", "bulletLanguages"),
    ("landing", "howItWorks", "pillarPlayerBody"),
    ("landing", "howItWorks", "pillarPlayerBullet3"),
]


def bump(value: str) -> str:
    # Replace only "14" tokens that are immediately followed by a space, an
    # alphabetic character (CJK glyph for ja/zh/ko), or a punctuation mark
    # used in the existing strings. We only target the count token itself.
    if "14" not in value:
        return value
    # In our specific values "14" only appears once and is the count.
    return value.replace("14", "16", 1)


def main() -> None:
    for loc in LOCALES:
        path = MESSAGES / f"{loc}.json"
        d = json.loads(path.read_text(encoding="utf-8"))
        changed = 0
        for p in PATHS:
            node = d
            for seg in p[:-1]:
                node = node[seg]
            old = node[p[-1]]
            new = bump(old)
            if old != new:
                node[p[-1]] = new
                changed += 1
        if changed:
            # Match the project's JSON format: 2-space indent, ensure_ascii=False,
            # trailing newline.
            out = json.dumps(d, ensure_ascii=False, indent=2) + "\n"
            path.write_text(out, encoding="utf-8")
        print(f"  {loc}: {changed}/3 strings bumped")


if __name__ == "__main__":
    main()
