"""One-shot insert of `downgradeCooldownNotice` after `downgradeKeep1`
in every translation file. Idempotent — skips files where the key
already exists. Run once after this PR; safe to re-run."""
from __future__ import annotations

import os
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
MESSAGES = REPO / "frontend" / "messages"

# Per-language new line that goes IMMEDIATELY AFTER the downgradeKeep1
# line. Exactly two spaces of indent + key + value, matching the
# existing JSON style. Trailing comma so the next line ("stayOnGuildMaster")
# stays valid.
LINES: dict[str, str] = {
    "en": '      "downgradeCooldownNotice": "After switching, you won\'t be able to upgrade back to Guild Master for 30 days.",',
    "fr": '      "downgradeCooldownNotice": "Après ce changement, vous ne pourrez pas revenir à Guild Master pendant 30 jours.",',
    "es": '      "downgradeCooldownNotice": "Tras el cambio, no podrás volver a Guild Master durante 30 días.",',
    "de": '      "downgradeCooldownNotice": "Nach dem Wechsel kannst du 30 Tage lang nicht zurück zu Guild Master upgraden.",',
    "it": '      "downgradeCooldownNotice": "Dopo il cambio, non potrai tornare a Guild Master per 30 giorni.",',
    "pt": '      "downgradeCooldownNotice": "Após a troca, você não poderá voltar para o Guild Master por 30 dias.",',
    "nl": '      "downgradeCooldownNotice": "Na het overschakelen kun je 30 dagen lang niet terug upgraden naar Guild Master.",',
    "pl": '      "downgradeCooldownNotice": "Po przełączeniu nie będziesz mógł wrócić do Guild Master przez 30 dni.",',
    "ru": '      "downgradeCooldownNotice": "После переключения вы не сможете вернуться на Guild Master в течение 30 дней.",',
    "sr": '      "downgradeCooldownNotice": "Након промене, нећете моћи да се вратите на Guild Master 30 дана.",',
    "tr": '      "downgradeCooldownNotice": "Geçişten sonra 30 gün boyunca Guild Master seviyesine geri yükseltme yapamazsınız.",',
    "el": '      "downgradeCooldownNotice": "Μετά την αλλαγή, δεν θα μπορείτε να επιστρέψετε στο Guild Master για 30 ημέρες.",',
    "ja": '      "downgradeCooldownNotice": "切り替え後、30日間はGuild Masterへの再アップグレードができません。",',
    "ko": '      "downgradeCooldownNotice": "변경 후 30일 동안 Guild Master로 다시 업그레이드할 수 없습니다.",',
    "zh": '      "downgradeCooldownNotice": "切换后,30天内将无法升级回 Guild Master.",',
    "ar": '      "downgradeCooldownNotice": "بعد التبديل، لن تتمكن من الترقية إلى Guild Master لمدة 30 يومًا.",',
}

ANCHOR_PREFIX = '      "downgradeKeep1":'


def main() -> None:
    for lang, new_line in LINES.items():
        path = MESSAGES / f"{lang}.json"
        if not path.exists():
            print(f"[skip] {lang}: file missing")
            continue
        text = path.read_text(encoding="utf-8")
        if '"downgradeCooldownNotice"' in text:
            print(f"[skip] {lang}: already present")
            continue
        lines = text.splitlines(keepends=True)
        out: list[str] = []
        inserted = False
        for line in lines:
            out.append(line)
            if (not inserted) and line.lstrip().startswith('"downgradeKeep1":'):
                # Preserve the existing newline style: append the new
                # content with a matching line ending.
                eol = "\r\n" if line.endswith("\r\n") else "\n"
                out.append(new_line + eol)
                inserted = True
        if not inserted:
            print(f"[warn] {lang}: anchor not found, no-op")
            continue
        path.write_text("".join(out), encoding="utf-8")
        print(f"[ok]   {lang}: inserted")


if __name__ == "__main__":
    main()
