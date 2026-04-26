"""
Build / refresh caption_state.json — the source of truth for which (stem,
locale) pairs are translated, which are missing, and which have been uploaded
to Mux.

Walks:
  D:/MamboGuild/caption_cleanup/Clean_Captions_chunked/   (EN master)
  D:/MamboGuild/caption_cleanup/Captions_<lang>_chunked/  (translations)

For each EN stem found, records per-locale state:
  - "translated"      : a chunked VTT exists for this (stem, locale)
  - "missing"         : no VTT exists yet
  - "needs_redo"      : sticky flag set elsewhere (kept on refresh)
  - "uploaded"        : sticky flag set after a successful Mux track upload

Refresh semantics:
  - missing → translated: when a new file appears
  - translated → missing: when a file disappears (rare)
  - "needs_redo" stays sticky until explicitly cleared (by re-translation
    completing or by build_state.py --clear-redo).
  - "uploaded" cleared automatically on the locale row when the underlying
    file's mtime moves forward (i.e. retranslation invalidates upload).

Usage:
  python build_state.py                 # refresh state in-place
  python build_state.py --report        # print summary, no write
  python build_state.py --mark-redo all-non-en --stem PachangaEdited__PachangaHistory1
  python build_state.py --clear-redo --stem ...
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Dict

CAPTION_BASE = Path("D:/MamboGuild/caption_cleanup")
STATE_PATH = Path(__file__).with_name("caption_state.json")

EN_DIR = "Clean_Captions_chunked"

# Locale -> chunked dir name. Must match upload_captions_to_mux.CAPTION_LANGS.
LOCALE_DIRS: Dict[str, str] = {
    "ar": "Captions_ar_chunked",
    "de": "Captions_de_chunked",
    "el": "Captions_el_chunked",
    "es": "Captions_es_chunked",
    "fr": "Captions_fr_chunked",
    "it": "Captions_it_chunked",
    "ja": "Captions_ja_chunked",
    "ko": "Captions_ko_chunked",
    "nl": "Captions_nl_chunked",
    "pl": "Captions_pl_chunked",
    "pt": "Captions_pt_chunked",
    "ru": "Captions_ru_chunked",
    "sr": "Captions_sr_chunked",
    "tr": "Captions_tr_chunked",
    "zh": "Captions_zh_chunked",
}
NON_EN_LOCALES = sorted(LOCALE_DIRS.keys())


def load_state() -> dict:
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    return {"version": 1, "stems": {}}


def save_state(state: dict) -> None:
    STATE_PATH.write_text(
        json.dumps(state, indent=2, ensure_ascii=False, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def file_mtime(p: Path) -> float | None:
    try:
        return p.stat().st_mtime
    except FileNotFoundError:
        return None


def refresh(state: dict) -> dict:
    en_dir = CAPTION_BASE / EN_DIR
    if not en_dir.is_dir():
        sys.exit(f"EN master dir not found: {en_dir}")

    en_stems = sorted(p.stem for p in en_dir.glob("*.vtt"))
    stems = state.setdefault("stems", {})

    # Add / update stems present in EN master
    for stem in en_stems:
        entry = stems.setdefault(stem, {"locales": {}})
        locales = entry.setdefault("locales", {})

        for loc, folder in LOCALE_DIRS.items():
            vtt = CAPTION_BASE / folder / f"{stem}.vtt"
            mtime = file_mtime(vtt)
            slot = locales.setdefault(loc, {"status": "missing"})

            if mtime is None:
                # File disappeared (or was never created)
                if slot.get("status") not in ("missing", "needs_redo"):
                    slot["status"] = "missing"
                slot.pop("translated_mtime", None)
                slot.pop("uploaded", None)
            else:
                prev_mtime = slot.get("translated_mtime")
                # First-time discovery or file changed since last seen
                if prev_mtime is None or mtime > prev_mtime + 0.001:
                    slot["status"] = "translated"
                    slot["translated_mtime"] = mtime
                    # If the underlying file moved, any prior Mux upload is stale
                    slot.pop("uploaded", None)
                else:
                    # File matches what we already knew about
                    if slot.get("status") in ("missing",):
                        slot["status"] = "translated"

    # Drop stems that no longer exist in EN master (very rare)
    for stem in list(stems.keys()):
        if stem not in en_stems:
            del stems[stem]

    return state


def report(state: dict) -> None:
    stems = state.get("stems", {})
    total_stems = len(stems)
    print(f"EN master stems: {total_stems}")
    print()
    print(f"{'locale':<8} {'translated':>10} {'missing':>10} {'redo':>6} {'uploaded':>10}")
    for loc in NON_EN_LOCALES:
        translated = missing = redo = uploaded = 0
        for entry in stems.values():
            slot = entry.get("locales", {}).get(loc, {"status": "missing"})
            st = slot.get("status", "missing")
            if st == "translated":
                translated += 1
            elif st == "needs_redo":
                redo += 1
            else:
                missing += 1
            if slot.get("uploaded"):
                uploaded += 1
        print(f"{loc:<8} {translated:>10} {missing:>10} {redo:>6} {uploaded:>10}")

    todo = sum(
        1
        for entry in stems.values()
        for loc in NON_EN_LOCALES
        if entry["locales"].get(loc, {}).get("status") in ("missing", "needs_redo")
    )
    print(f"\nTotal pending (missing + needs_redo): {todo}")


def mark_redo(state: dict, scope: str, stem: str | None) -> int:
    """Set status='needs_redo' on the targeted (stem, locale) cells."""
    stems = state["stems"]
    targets: list[tuple[str, list[str]]]

    if scope == "all-non-en":
        locs = list(NON_EN_LOCALES)
    elif scope in NON_EN_LOCALES:
        locs = [scope]
    else:
        sys.exit(f"Unknown scope: {scope}")

    if stem is not None:
        if stem not in stems:
            sys.exit(f"Unknown stem: {stem}")
        target_stems = [stem]
    else:
        target_stems = list(stems.keys())

    n = 0
    for s in target_stems:
        for loc in locs:
            slot = stems[s]["locales"].setdefault(loc, {"status": "missing"})
            slot["status"] = "needs_redo"
            slot.pop("translated_mtime", None)
            slot.pop("uploaded", None)
            n += 1
    return n


def clear_redo(state: dict, stem: str | None) -> int:
    """Clear sticky needs_redo flags. If a translated file is present, the
    next refresh() will set it back to translated. If not, it goes to missing."""
    stems = state["stems"]
    target_stems = [stem] if stem else list(stems.keys())
    n = 0
    for s in target_stems:
        for loc, slot in stems[s]["locales"].items():
            if slot.get("status") == "needs_redo":
                slot["status"] = "missing"
                n += 1
    return n


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--report", action="store_true",
                   help="Print summary after refresh.")
    p.add_argument("--mark-redo", choices=["all-non-en", *NON_EN_LOCALES],
                   help="Flag locales as needing retranslation (sticky).")
    p.add_argument("--clear-redo", action="store_true",
                   help="Clear sticky needs_redo flags.")
    p.add_argument("--stem",
                   help="Limit --mark-redo / --clear-redo to one stem.")
    p.add_argument("--no-write", action="store_true",
                   help="Refresh in memory only; do not write caption_state.json.")
    args = p.parse_args()

    state = load_state()
    state = refresh(state)

    if args.mark_redo:
        n = mark_redo(state, args.mark_redo, args.stem)
        print(f"Marked {n} (stem, locale) cells as needs_redo.")

    if args.clear_redo:
        n = clear_redo(state, args.stem)
        print(f"Cleared {n} needs_redo flags.")

    if not args.no_write:
        save_state(state)
        print(f"Wrote {STATE_PATH}")

    if args.report:
        print()
        report(state)


if __name__ == "__main__":
    main()
