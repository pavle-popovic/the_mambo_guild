"""
Re-chunk every VTT in D:/MamboGuild/caption_cleanup/ so captions always fit in
the in-app caption rectangle and stay roughly in sync with speech.

Rules:
  - MAX_CHARS_PER_LINE = 42   (standard subtitle guideline)
  - MAX_LINES_PER_CUE  = 2
  - MAX_DURATION_SEC   = 5.0  (split longer cues proportionally)
  - MIN_DURATION_SEC   = 0.7  (soft floor; enforced by redistribution only)

Input layout (untouched):
  D:/MamboGuild/caption_cleanup/Clean_Captions/*.vtt          (EN)
  D:/MamboGuild/caption_cleanup/Captions_<loc>/*.vtt          (per-locale)

Output layout (mirrors input):
  D:/MamboGuild/caption_cleanup/Clean_Captions_chunked/*.vtt
  D:/MamboGuild/caption_cleanup/Captions_<loc>_chunked/*.vtt

Each output VTT preserves the same header/STYLE block the existing pipeline
writes. Only cue timings and text wrapping change.

Usage:
  python backend/scripts/rechunk_vtt_captions.py                 # all dirs
  python backend/scripts/rechunk_vtt_captions.py --only en       # EN only
  python backend/scripts/rechunk_vtt_captions.py --stats         # scan, no write
"""

import argparse
import re
import sys
from pathlib import Path

CAPTION_BASE = Path("D:/MamboGuild/caption_cleanup")

MAX_CHARS_PER_LINE = 42
MAX_LINES_PER_CUE = 2
MAX_DURATION_SEC = 5.0
MIN_DURATION_SEC = 0.7

VTT_HEADER = """WEBVTT

STYLE
::cue {
  background-color: transparent;
  color: white;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 85%;
  text-shadow: -1px -1px 0 rgba(0,0,0,0.95),
               1px -1px 0 rgba(0,0,0,0.95),
               -1px  1px 0 rgba(0,0,0,0.95),
               1px  1px 0 rgba(0,0,0,0.95);
}
"""
POSITION = "line:97% position:50% size:80% align:center"

TS_RE = re.compile(r"^(\d{1,2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}\.\d{3})")
TS_SHORT_RE = re.compile(r"^(\d{1,2}:\d{2}\.\d{3})\s*-->\s*(\d{1,2}:\d{2}\.\d{3})")


def parse_ts(ts: str) -> float:
    parts = ts.split(":")
    if len(parts) == 3:
        h, m = int(parts[0]), int(parts[1])
        s = float(parts[2])
    else:
        h = 0
        m = int(parts[0])
        s = float(parts[1])
    return h * 3600 + m * 60 + s


def fmt_ts(sec: float) -> str:
    if sec < 0:
        sec = 0
    h = int(sec // 3600)
    m = int((sec % 3600) // 60)
    s = sec % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}"


def parse_vtt(text: str):
    """Yield (start_sec, end_sec, content_text) per cue. content is a single
    string with original line breaks collapsed to spaces."""
    lines = text.splitlines()
    i = 0
    n = len(lines)
    # Skip header (WEBVTT line + optional STYLE block + blank separators)
    while i < n and not (TS_RE.match(lines[i]) or TS_SHORT_RE.match(lines[i])):
        i += 1
    while i < n:
        m = TS_RE.match(lines[i]) or TS_SHORT_RE.match(lines[i])
        if not m:
            i += 1
            continue
        start, end = parse_ts(m.group(1)), parse_ts(m.group(2))
        i += 1
        buf = []
        while i < n and lines[i].strip() != "":
            # another cue number line? skip (only if pure digits + next is ts)
            if lines[i].strip().isdigit() and i + 1 < n and (TS_RE.match(lines[i + 1]) or TS_SHORT_RE.match(lines[i + 1])):
                break
            buf.append(lines[i])
            i += 1
        text_joined = " ".join(s.strip() for s in buf if s.strip())
        text_joined = re.sub(r"<[^>]+>", "", text_joined)
        text_joined = re.sub(r"\s+", " ", text_joined).strip()
        if text_joined and end > start:
            yield (start, end, text_joined)
        # consume blank line(s) and optional numeric id
        while i < n and lines[i].strip() == "":
            i += 1
        if i < n and lines[i].strip().isdigit() and i + 1 < n and (TS_RE.match(lines[i + 1]) or TS_SHORT_RE.match(lines[i + 1])):
            i += 1  # drop numeric id, loop hits timestamp next


def pack_lines(words, max_chars):
    """Greedy pack words into lines, each line <= max_chars. If a single word
    exceeds max_chars (rare, e.g. URL), it gets its own line anyway."""
    lines = []
    cur = []
    cur_len = 0
    for w in words:
        add_len = len(w) if not cur else len(w) + 1
        if cur and cur_len + add_len > max_chars:
            lines.append(" ".join(cur))
            cur = [w]
            cur_len = len(w)
        else:
            cur.append(w)
            cur_len += add_len
    if cur:
        lines.append(" ".join(cur))
    return lines


def split_cue(start, end, text):
    """Split one cue into a list of (start, end, text_with_linebreak) sub-cues.
    Each sub-cue has <= MAX_LINES_PER_CUE lines, each line <= MAX_CHARS_PER_LINE,
    duration <= MAX_DURATION_SEC, with timing proportional to char count."""
    words = text.split()
    if not words:
        return []
    lines = pack_lines(words, MAX_CHARS_PER_LINE)
    # Group lines into cues of up to MAX_LINES_PER_CUE each
    groups = [lines[i:i + MAX_LINES_PER_CUE] for i in range(0, len(lines), MAX_LINES_PER_CUE)]

    duration = end - start
    # If any group would exceed MAX_DURATION, further split groups
    # (rare — only when MAX_LINES_PER_CUE = 2 but total duration >> 5s)
    final_groups = []
    # char-weights for proportional timing
    group_texts = ["\n".join(g) for g in groups]
    group_chars = [max(1, len(g.replace("\n", " "))) for g in group_texts]
    total_chars = sum(group_chars)
    # initial timings
    out = []
    t = start
    for g, gt, gc in zip(groups, group_texts, group_chars):
        gdur = duration * (gc / total_chars)
        g_start = t
        g_end = t + gdur
        # split further if too long
        if gdur > MAX_DURATION_SEC and len(" ".join(g).split()) > 2:
            # split this group in two sub-cues at word boundary
            combined_text = " ".join(g)
            ws = combined_text.split()
            mid = len(ws) // 2
            a = " ".join(ws[:mid])
            b = " ".join(ws[mid:])
            a_lines = pack_lines(a.split(), MAX_CHARS_PER_LINE)[:MAX_LINES_PER_CUE]
            b_lines = pack_lines(b.split(), MAX_CHARS_PER_LINE)[:MAX_LINES_PER_CUE]
            la = sum(len(x) for x in a_lines) or 1
            lb = sum(len(x) for x in b_lines) or 1
            mid_t = g_start + gdur * (la / (la + lb))
            out.append((g_start, mid_t, "\n".join(a_lines)))
            out.append((mid_t, g_end, "\n".join(b_lines)))
        else:
            out.append((g_start, g_end, gt))
        t = g_end
    # snap last end to original
    if out:
        last = out[-1]
        out[-1] = (last[0], end, last[2])
    return out


def rechunk_file(in_path: Path, out_path: Path, stats: dict):
    text = in_path.read_text(encoding="utf-8")
    cues = list(parse_vtt(text))
    stats["files_scanned"] += 1
    stats["cues_in"] += len(cues)

    new_cues = []
    any_change = False
    for start, end, t in cues:
        # already-short? accept unchanged
        # Check both: line count ≤2, max line length ≤ MAX_CHARS_PER_LINE,
        # duration ≤ MAX_DURATION, and the cue text doesn't collapse to a
        # paragraph that violates line-length when re-packed.
        current_lines = t.split("\n")
        longest = max((len(x) for x in current_lines), default=0)
        dur = end - start
        if (len(current_lines) <= MAX_LINES_PER_CUE
                and longest <= MAX_CHARS_PER_LINE
                and dur <= MAX_DURATION_SEC):
            new_cues.append((start, end, t))
            continue
        any_change = True
        new_cues.extend(split_cue(start, end, t.replace("\n", " ")))

    stats["cues_out"] += len(new_cues)
    if any_change:
        stats["files_changed"] += 1

    # Write
    out_path.parent.mkdir(parents=True, exist_ok=True)
    buf = [VTT_HEADER.strip(), ""]
    for idx, (s, e, tx) in enumerate(new_cues, 1):
        # Enforce MIN_DURATION only if we created micro-cues
        if e - s < MIN_DURATION_SEC and idx < len(new_cues):
            e = s + MIN_DURATION_SEC
        buf.append(str(idx))
        buf.append(f"{fmt_ts(s)} --> {fmt_ts(e)} {POSITION}")
        buf.append(tx)
        buf.append("")
    out_path.write_text("\n".join(buf) + "\n", encoding="utf-8")


def process_dir(in_dir: Path, out_dir: Path, stats: dict):
    if not in_dir.is_dir():
        print(f"  SKIP (not found): {in_dir}")
        return
    for vtt in sorted(in_dir.glob("*.vtt")):
        out = out_dir / vtt.name
        rechunk_file(vtt, out, stats)


LOCALE_DIRS = {
    "en": "Clean_Captions",
    "de": "Captions_de",
    "es": "Captions_es",
    "fr": "Captions_fr",
    "it": "Captions_it",
    "ja": "Captions_ja",
    "ko": "Captions_ko",
    "nl": "Captions_nl",
    "pl": "Captions_pl",
    "pt": "Captions_pt",
    "ru": "Captions_ru",
    "sr": "Captions_sr",
    "tr": "Captions_tr",
    "zh": "Captions_zh",
}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--only", help="Process only this locale (e.g. 'en', 'es')")
    p.add_argument("--stats", action="store_true",
                   help="Parse files and report stats without writing output")
    args = p.parse_args()

    targets = LOCALE_DIRS.items()
    if args.only:
        if args.only not in LOCALE_DIRS:
            print(f"Unknown locale: {args.only}. Options: {list(LOCALE_DIRS)}")
            sys.exit(2)
        targets = [(args.only, LOCALE_DIRS[args.only])]

    grand = {"files_scanned": 0, "files_changed": 0, "cues_in": 0, "cues_out": 0}
    for loc, folder in targets:
        in_dir = CAPTION_BASE / folder
        out_dir = CAPTION_BASE / (folder + "_chunked")
        stats = {"files_scanned": 0, "files_changed": 0, "cues_in": 0, "cues_out": 0}
        if args.stats:
            # count without writing
            if in_dir.is_dir():
                for vtt in sorted(in_dir.glob("*.vtt")):
                    stats["files_scanned"] += 1
                    text = vtt.read_text(encoding="utf-8")
                    for _ in parse_vtt(text):
                        stats["cues_in"] += 1
        else:
            process_dir(in_dir, out_dir, stats)
        print(f"  [{loc}] files={stats['files_scanned']} changed={stats['files_changed']}  "
              f"cues {stats['cues_in']} -> {stats['cues_out']}")
        for k in grand:
            grand[k] += stats[k]

    print("\n" + "=" * 60)
    print(f"TOTAL files: {grand['files_scanned']}  changed: {grand['files_changed']}")
    print(f"TOTAL cues : {grand['cues_in']} -> {grand['cues_out']}  "
          f"(+{grand['cues_out'] - grand['cues_in']})")
    if args.stats:
        print("(--stats: no files written)")


if __name__ == "__main__":
    main()
