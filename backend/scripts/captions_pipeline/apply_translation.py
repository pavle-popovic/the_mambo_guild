"""
Validate a freshly-written translated VTT and mark its (stem, locale) cell
as 'translated' in caption_state.json.

The translator (in-session Claude) writes the file via the Write tool, then
runs this to:
  1. Confirm the file exists and parses as VTT.
  2. Confirm cue count matches the EN master within tolerance (so a
     truncated paste fails loudly instead of silently shipping).
  3. Refresh state for that single (stem, locale) cell.

Usage:
  python apply_translation.py --stem X --lang ar
  python apply_translation.py --stem X --lang ar --cue-tolerance 0
  python apply_translation.py --stem X --lang ar --no-validate  (last resort)
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

from build_state import (
    CAPTION_BASE,
    EN_DIR,
    LOCALE_DIRS,
    NON_EN_LOCALES,
    file_mtime,
    load_state,
    save_state,
)


TS_RE = re.compile(r"^\d{1,2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{1,2}:\d{2}:\d{2}\.\d{3}")
TS_SHORT_RE = re.compile(r"^\d{1,2}:\d{2}\.\d{3}\s*-->\s*\d{1,2}:\d{2}\.\d{3}")


def count_cues(vtt_text: str) -> int:
    n = 0
    for line in vtt_text.splitlines():
        if TS_RE.match(line) or TS_SHORT_RE.match(line):
            n += 1
    return n


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--stem", required=True)
    p.add_argument("--lang", required=True, choices=NON_EN_LOCALES)
    p.add_argument("--cue-tolerance", type=int, default=2,
                   help="Allowed difference in cue count vs EN master.")
    p.add_argument("--no-validate", action="store_true",
                   help="Skip structural validation (use only when the EN "
                        "master itself was edited and you've manually verified "
                        "the translation).")
    args = p.parse_args()

    target = CAPTION_BASE / LOCALE_DIRS[args.lang] / f"{args.stem}.vtt"
    en_path = CAPTION_BASE / EN_DIR / f"{args.stem}.vtt"

    if not en_path.is_file():
        sys.exit(f"EN master missing: {en_path}")
    if not target.is_file():
        sys.exit(f"Translation file missing: {target}")

    text = target.read_text(encoding="utf-8")

    if not args.no_validate:
        if not text.lstrip().startswith("WEBVTT"):
            sys.exit(f"Validation failed: {target.name} does not start with WEBVTT.")
        en_cues = count_cues(en_path.read_text(encoding="utf-8"))
        tx_cues = count_cues(text)
        if abs(en_cues - tx_cues) > args.cue_tolerance:
            sys.exit(
                f"Validation failed: cue count mismatch for {target.name}: "
                f"EN={en_cues}, {args.lang}={tx_cues} (tolerance={args.cue_tolerance})."
            )
        if tx_cues == 0:
            sys.exit(f"Validation failed: zero cues in {target.name}.")

    state = load_state()
    entry = state.setdefault("stems", {}).setdefault(args.stem, {"locales": {}})
    locales = entry.setdefault("locales", {})
    slot = locales.setdefault(args.lang, {})
    slot["status"] = "translated"
    slot["translated_mtime"] = file_mtime(target)
    slot.pop("uploaded", None)
    save_state(state)

    print(f"OK  {args.stem} [{args.lang}]  -> translated")


if __name__ == "__main__":
    main()
