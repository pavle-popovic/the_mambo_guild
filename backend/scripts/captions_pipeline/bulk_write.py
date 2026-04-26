"""
Write translated VTTs for one stem across multiple locales in a single call,
and update caption_state.json for each successful locale.

Reads a manifest from stdin shaped:

  {
    "stem": "PachangaEdited__Foo",
    "translations": {
      "ar": {"1": "...", "2": "..."},
      "de": {"1": "...", "2": "..."},
      ...
    }
  }

For each locale, writes Captions_<lang>_chunked/<stem>.vtt by cloning the EN
master's structure (header, STYLE, every cue index, every timestamp, every
position line) and substituting each cue's body. Then validates cue count
matches the EN master and marks state[stem][lang] = "translated".

A "\\n" inside any value indicates a real line-break inside that cue body
(max 2 lines per cue, same as the chunked EN source).

Usage:
  python bulk_write.py <<'JSON'
  {"stem": "...", "translations": {...}}
  JSON
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
    file_mtime,
    load_state,
    save_state,
)
from write_translated_vtt import parse_en_blocks


def write_one(stem: str, lang: str, cue_map: dict, en_blocks: list,
              en_indices: list[str]) -> tuple[bool, str]:
    if lang not in LOCALE_DIRS:
        return False, f"unknown locale {lang}"
    out_path = CAPTION_BASE / LOCALE_DIRS[lang] / f"{stem}.vtt"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    cue_map = {str(k).strip(): v for k, v in cue_map.items()}
    extra = [k for k in cue_map if k not in en_indices]
    if extra:
        return False, f"cue indices not in EN master: {extra}"
    missing = [k for k in en_indices if k not in cue_map]
    if missing:
        return False, f"missing cue indices: {missing}"

    out_lines: list[str] = []
    for block in en_blocks:
        if block[0] == "header":
            out_lines.append(block[1].rstrip("\n"))
            out_lines.append("")
            continue
        _, idx_line, ts_line, _en_body = block
        idx_key = idx_line.strip()
        translated = cue_map[idx_key]
        body_lines = translated.split("\n") if translated else [""]
        out_lines.append(idx_key)
        out_lines.append(ts_line)
        out_lines.extend(body_lines)
        out_lines.append("")

    out_path.write_text("\n".join(out_lines).rstrip("\n") + "\n", encoding="utf-8")
    return True, str(out_path)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--manifest-file", required=True,
                   help="Path to a UTF-8 JSON manifest file. (We use a file "
                        "rather than stdin because the Windows shell pipeline "
                        "mojibakes multi-byte chars.)")
    args = p.parse_args()

    manifest_path = Path(args.manifest_file)
    if not manifest_path.is_file():
        sys.exit(f"Manifest file not found: {manifest_path}")
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        sys.exit(f"Invalid JSON in {manifest_path}: {e}")

    stem = manifest.get("stem")
    if not stem:
        sys.exit("Manifest missing 'stem'.")
    translations = manifest.get("translations") or {}
    if not translations:
        sys.exit("Manifest 'translations' is empty.")

    en_path = CAPTION_BASE / EN_DIR / f"{stem}.vtt"
    if not en_path.is_file():
        sys.exit(f"EN master not found: {en_path}")
    en_text = en_path.read_text(encoding="utf-8")
    en_blocks = list(parse_en_blocks(en_text))
    en_indices = [b[1].strip() for b in en_blocks if b[0] == "cue"]

    state = load_state()
    entry = state.setdefault("stems", {}).setdefault(stem, {"locales": {}})
    locales_state = entry.setdefault("locales", {})

    print(f"=== Bulk write: {stem}  ({len(en_indices)} cues, "
          f"{len(translations)} locale(s)) ===")
    n_ok = 0
    failures: list[tuple[str, str]] = []
    for lang in sorted(translations):
        ok, msg = write_one(stem, lang, translations[lang], en_blocks, en_indices)
        if ok:
            slot = locales_state.setdefault(lang, {})
            slot["status"] = "translated"
            slot["translated_mtime"] = file_mtime(Path(msg))
            slot.pop("uploaded", None)
            n_ok += 1
            print(f"  OK   [{lang}]  -> {Path(msg).name}")
        else:
            failures.append((lang, msg))
            print(f"  FAIL [{lang}]  {msg}")

    save_state(state)
    print(f"\nWrote {n_ok}/{len(translations)} locale(s). State updated.")
    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
