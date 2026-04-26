"""
Emit the next pending caption-translation jobs from caption_state.json.

Designed to be run inside a chat session: the output tells the in-session
translator (Claude / Opus) exactly which EN VTT to read, which target paths
to write, and what locales remain. Pure read-only — does not modify state.

Default ordering picks the next pending stems in alphabetical order, with
the smallest set of remaining locales considered together so that one stem
can be translated across all its still-missing locales in a single pass.

Usage:
  python next_batch.py                         # next 1 stem, all its pending locales
  python next_batch.py --stems 5               # next 5 stems
  python next_batch.py --only-lang ar          # next 5 stems for one locale only
  python next_batch.py --stem PachangaEdited__PachangaHistory1   # one specific stem
  python next_batch.py --print-en              # also print the EN VTT contents
  python next_batch.py --json                  # machine-readable output
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from build_state import (
    CAPTION_BASE,
    EN_DIR,
    LOCALE_DIRS,
    NON_EN_LOCALES,
    STATE_PATH,
    load_state,
)


PENDING = ("missing", "needs_redo")


def en_vtt_path(stem: str) -> Path:
    return CAPTION_BASE / EN_DIR / f"{stem}.vtt"


def target_path(stem: str, locale: str) -> Path:
    return CAPTION_BASE / LOCALE_DIRS[locale] / f"{stem}.vtt"


def collect_jobs(state: dict, *, n_stems: int, only_lang: str | None,
                 only_stem: str | None) -> list[dict]:
    stems = state.get("stems", {})
    out: list[dict] = []

    if only_stem is not None:
        if only_stem not in stems:
            sys.exit(f"Unknown stem: {only_stem}")
        candidates = [only_stem]
    else:
        candidates = sorted(stems.keys())

    for stem in candidates:
        if len(out) >= n_stems:
            break
        locales_state = stems[stem].get("locales", {})
        if only_lang is not None:
            locs = [only_lang] if locales_state.get(only_lang, {}).get("status") in PENDING else []
        else:
            locs = [
                loc for loc in NON_EN_LOCALES
                if locales_state.get(loc, {}).get("status") in PENDING
            ]
        if not locs:
            continue
        en = en_vtt_path(stem)
        if not en.is_file():
            continue
        out.append({
            "stem": stem,
            "en_vtt": str(en),
            "pending_locales": locs,
            "targets": {loc: str(target_path(stem, loc)) for loc in locs},
        })
    return out


def render_human(jobs: list[dict], *, print_en: bool) -> None:
    if not jobs:
        print("No pending jobs.")
        return
    print(f"=== {len(jobs)} stem(s) pending ===")
    for j in jobs:
        print()
        print(f"STEM: {j['stem']}")
        print(f"EN  : {j['en_vtt']}")
        print(f"PENDING ({len(j['pending_locales'])}): {' '.join(j['pending_locales'])}")
        print("WRITE TO:")
        for loc, p in j["targets"].items():
            print(f"  [{loc}] {p}")
        if print_en:
            print("--- EN VTT ---")
            try:
                print(Path(j["en_vtt"]).read_text(encoding="utf-8"))
            except Exception as e:
                print(f"  <read failed: {e}>")
            print("--- /EN VTT ---")


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--stems", type=int, default=1,
                   help="Number of stems to surface (default 1).")
    p.add_argument("--only-lang", choices=NON_EN_LOCALES,
                   help="Restrict to one locale.")
    p.add_argument("--stem", help="Surface this specific stem (overrides --stems).")
    p.add_argument("--print-en", action="store_true",
                   help="Also print the EN VTT body (handy for in-chat use).")
    p.add_argument("--json", dest="as_json", action="store_true",
                   help="Emit machine-readable JSON.")
    args = p.parse_args()

    state = load_state()
    if not state.get("stems"):
        sys.exit(f"caption_state.json empty or missing — run build_state.py first ({STATE_PATH}).")

    n = 1 if args.stem else args.stems
    jobs = collect_jobs(state, n_stems=n, only_lang=args.only_lang, only_stem=args.stem)

    if args.as_json:
        print(json.dumps(jobs, indent=2, ensure_ascii=False))
    else:
        render_human(jobs, print_en=args.print_en)


if __name__ == "__main__":
    main()
