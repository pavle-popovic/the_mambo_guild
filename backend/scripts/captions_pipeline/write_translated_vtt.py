"""
Write a translated VTT by cloning the EN master's structure (header, STYLE
block, every cue index, every timestamp, every position line) and replacing
ONLY the cue body text from a JSON map of {cue_index: "translated text"}.

Reads the cue map from stdin so it composes well with shell heredocs:

    python write_translated_vtt.py --stem PachangaEdited__Foo --lang ar <<'EOF'
    {"1": "translated cue 1", "2": "translated cue 2"}
    EOF

Use \\n in a string to indicate a soft line-break inside a single cue (max
two lines per cue, same as the chunked EN source).

Refuses to overwrite unless --force is passed AND any cue index in the JSON
is missing from EN (would leave that cue with the original EN body, which is
almost never what you want).

After writing, run apply_translation.py to validate + mark state done.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

CAPTION_BASE = Path("D:/MamboGuild/caption_cleanup")
EN_DIR = "Clean_Captions_chunked"

# Locale -> chunked dir (mirror of upload_captions_to_mux.CAPTION_LANGS)
LOCALE_DIRS = {
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

TS_RE = re.compile(r"^(\d{1,2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}\.\d{3})")


def parse_en_blocks(text: str):
    """Yield blocks of the EN VTT in original order. Each block is a tuple
    ('header', str) | ('cue', idx_line, ts_line, body_lines). The 'header'
    block contains everything up to (and including) the blank line before the
    first cue."""
    lines = text.splitlines()
    n = len(lines)
    # Header = everything up to the first cue index line that's followed by a TS.
    header_end = 0
    for i in range(n - 1):
        if lines[i].strip().isdigit() and TS_RE.match(lines[i + 1] or ""):
            header_end = i
            break
    header = "\n".join(lines[:header_end]).rstrip() + "\n\n"
    yield ("header", header)

    i = header_end
    while i < n:
        if not lines[i].strip().isdigit():
            i += 1
            continue
        idx_line = lines[i]
        if i + 1 >= n or not TS_RE.match(lines[i + 1]):
            i += 1
            continue
        ts_line = lines[i + 1]
        body = []
        j = i + 2
        while j < n and lines[j].strip() != "":
            body.append(lines[j])
            j += 1
        yield ("cue", idx_line, ts_line, body)
        # Skip blank line(s)
        while j < n and lines[j].strip() == "":
            j += 1
        i = j


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--stem", required=True)
    p.add_argument("--lang", required=True, choices=list(LOCALE_DIRS))
    p.add_argument("--force", action="store_true",
                   help="Allow writing even if some cues are missing from the JSON.")
    args = p.parse_args()

    raw_bytes = sys.stdin.buffer.read()
    if not raw_bytes.strip():
        sys.exit("No JSON cue-map on stdin.")
    try:
        raw = raw_bytes.decode("utf-8")
    except UnicodeDecodeError as e:
        sys.exit(f"stdin is not valid UTF-8: {e}")
    try:
        cue_map = json.loads(raw)
    except json.JSONDecodeError as e:
        sys.exit(f"Invalid JSON on stdin: {e}")

    # Normalize keys -> str of int
    cue_map = {str(k).strip(): v for k, v in cue_map.items()}

    en_path = CAPTION_BASE / EN_DIR / f"{args.stem}.vtt"
    if not en_path.is_file():
        sys.exit(f"EN master not found: {en_path}")

    out_path = CAPTION_BASE / LOCALE_DIRS[args.lang] / f"{args.stem}.vtt"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    en_text = en_path.read_text(encoding="utf-8")
    blocks = list(parse_en_blocks(en_text))

    out_lines: list[str] = []
    cue_indices_seen: list[str] = []
    missing: list[str] = []

    for block in blocks:
        if block[0] == "header":
            out_lines.append(block[1].rstrip("\n"))
            out_lines.append("")  # blank line after header
            continue
        _, idx_line, ts_line, _en_body = block
        idx_key = idx_line.strip()
        cue_indices_seen.append(idx_key)

        translated = cue_map.get(idx_key)
        if translated is None:
            missing.append(idx_key)
            translated = ""

        # Allow "\n" in JSON value to mean a real line-break in the cue body.
        body_lines = translated.split("\n") if translated else [""]

        out_lines.append(idx_key)
        out_lines.append(ts_line)
        out_lines.extend(body_lines)
        out_lines.append("")

    extra = [k for k in cue_map if k not in cue_indices_seen]
    if extra:
        sys.exit(f"JSON contains cue indices not in EN master: {extra}")

    if missing and not args.force:
        sys.exit(
            f"Missing translations for cue indices: {missing}\n"
            f"(Total cues in EN: {len(cue_indices_seen)})\n"
            "Re-run with --force to write a partial file (those cues will be empty)."
        )

    out_path.write_text("\n".join(out_lines).rstrip("\n") + "\n", encoding="utf-8")
    print(f"Wrote {out_path}  ({len(cue_indices_seen)} cues, "
          f"{len(cue_indices_seen) - len(missing)} translated"
          + (f", {len(missing)} blank" if missing else "") + ")")


if __name__ == "__main__":
    main()
