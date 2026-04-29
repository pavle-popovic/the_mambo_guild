"""Refresh EN Mux captions for the 5 assets whose VTTs had typos fixed.

Pipeline per asset:
  1. Upload chunked VTT to R2 at captions/en/<course>__<stem>.vtt (overwrite).
  2. Delete existing EN Mux text track for the asset.
  3. Create a new EN Mux text track pointing at the same R2 URL (forces
     Mux to re-ingest the updated VTT content).

Other-locale tracks are NOT touched — this fix is English-only.

Usage:
  python backend/scripts/_refresh_caption_typo_fixes.py --dry-run
  python backend/scripts/_refresh_caption_typo_fixes.py --execute
"""
import argparse
import os
import sys
import time
from pathlib import Path

import boto3
import mux_python
from dotenv import load_dotenv
from mux_python.rest import ApiException

load_dotenv("C:/Users/pavle/Desktop/salsa_lab_v2/.env")

MUX_TOKEN_ID = os.environ["MUX_TOKEN_ID"]
MUX_TOKEN_SECRET = os.environ["MUX_TOKEN_SECRET"]
R2_ENDPOINT = os.environ["AWS_ENDPOINT_URL"]
R2_KEY = os.environ["AWS_ACCESS_KEY_ID"]
R2_SECRET = os.environ["AWS_SECRET_ACCESS_KEY"]
R2_BUCKET = os.environ["AWS_BUCKET_NAME"]
R2_DOMAIN = os.environ["R2_PUBLIC_DOMAIN"].rstrip("/")

CAPTION_BASE = Path("D:/MamboGuild/caption_cleanup/Clean_Captions_chunked")

# (label, mux_asset_id, course_folder, stem)
# Round 1 targets (already refreshed once). Re-running is idempotent.
TARGETS = [
    ("Rebelion Full Choreography",
     "fE02KP8UKplGr7Uh1hGYi2PhpDk4GjRPpAxNKUk8zzgA",
     "RebelionEdited", "Rebelion_Lesson"),
    ("Mambo 301 - Timing 2 Son Drill",
     "LVRP9J99VhqU7ON8oukQL9Fz2AjTSPwjrxt9MJG4P01g",
     "Mambo301Edited", "Timing_2_Drill"),
    ("Mambo 301 - Combo 12 Drill 1",
     "QIJsw6qokRTO2p3i01f02L2c9pEumeGFdgXPSdMnWdBOc",
     "Mambo301Edited", "Combo_12_Drill_1"),
    ("Mambo 301 - Timing 3 Syncopation Drill",
     "P1VSkvcikfJGfA584fF7jzY7QBwlwPjvZbIud7AVje8",
     "Mambo301Edited", "Timing_3_Drill"),
    ("Mambo 201 - Building Blocks Lesson 1",
     "ds00gi016Byg01Nj6NcCEQecLfKmTu7Y7loaVqKAcbnOwk",
     "Mambo201Edited", "Building_blocks_1_Lesson_1"),
]

# Round 2 — second sweep surfaced 6 more typos.
TARGETS += [
    ("Mambo 201 - Building Blocks Drill (Suzuki -> Suzy Q)",
     "RE2QhHl2fS001p4HpWFSGZJ8eqRYi8z00dEsvypzb5Afw",
     "Mambo201Edited", "Building_blocks_1_Drill"),
    ("Mambo 101 - Taps 1 Drill (inter -> turn)",
     "Hsv8fQO00BXTrd580200kbrs23yeb9ig00UtnUS8Kx01i82s",
     "Mambo101Edited", "Taps_1_Drill"),
    ("Mambo 101 - Syncopation 1 Lesson 1 (end -> and)",
     "yTSGeTjBjV8JW3hS02ikfecwEsnN2jnUBmXerHoi1Q01E",
     "Mambo101Edited", "Syncopation_1_Lesson_1"),
    ("Mambo 101 - Basic Step 3 Drill (peladian -> Palladium)",
     "d9VfAkZGT2PJnfqEswsF4I78Nu00lWcfOhkejgezR4UU",
     "Mambo101Edited", "Basic_Step_3_Drill"),
    ("Mambo 101 - Flares 1 Lesson 2 (Syncopation rhythms -> Syncopated)",
     "3ZqJgeyOWu011WbOsKTzyw1PMn5AqbnnrcWJHRls93SQ",
     "Mambo101Edited", "Flares_1_Lesson_2"),
    ("Mambo 101 - Twist 1 Lesson 1 (step-step-step stutter)",
     "2Lb6TALFyT00iwFmNDyJYikwadOsi77zrJ01D01dey4yoI",
     "Mambo101Edited", "Twist_1_Lesson_1"),
]

# Round 3 — bug-report sweep surfaced one more lesson where source VTT was
# corrected but the Mux track was never refreshed (still serving stale caption).
TARGETS += [
    ("Mambo 101 - Turns 1 / Lesson 1 (Techique -> Technique)",
     "01dVSpMcFhijbW7W9D3N9NeVbDfx7PWKYW7sB3D6EcqM",
     "Mambo101Edited", "Turn_1_Lesson_1"),
]

# Round 4 — broader bug-report sweep (spelling/wrong/incorrect terms) surfaced
# 3 more EN caption typos. Source VTTs edited in this round before refresh.
TARGETS += [
    ("Mambo 101 - Basic Steps 1 / Lesson 2 (weight -> wait, dance count)",
     "ALT3VXZd24PpkO9esyYGEbSxKzF8MnyDNxmu2wp4lqc",
     "Mambo101Edited", "Basic_Step_1_Lesson_2"),
    ("Mambo 101 - Combo 4 / Drill 2 (Tress -> Tres)",
     "3vz902vgE5vUTOYsgTu01pD6Zd6B3tnP1ezeZJoCuP4N4",
     "Mambo101Edited", "Combo_4_Drill_2"),
    ("Mambo 101 - Basic Timing / Lesson 1 (tiempo -> tempo, first occurrence)",
     "Asb00hwO01VoYmfRZbveKtNeuEq4Fkwv5mCFC895RF4M4",
     "Mambo101Edited", "Timing_1_Lesson_1"),
]

# Round 5 — sweep of user 73d717b8's full bug-report history surfaced 2 more.
TARGETS += [
    ("Mambo 101 - Syncopation 1 / Lesson 1 (second 'end -> and', off-beat)",
     "yTSGeTjBjV8JW3hS02ikfecwEsnN2jnUBmXerHoi1Q01E",
     "Mambo101Edited", "Syncopation_1_Lesson_1"),
    ("Mambo 101 - Combo 4 / Lesson 1 (refresh; Mux may still serve stale VTT)",
     "2buLvftsauL2lM3WyDd5yFRj02aA4EEUJxXVjzUbje008",
     "Mambo101Edited", "Combo_4_Lesson_1"),
]

# Round 6 — Combo 5 Drill (Mambo 201) had 10 trailing ASR-hallucinated garbage
# cues from 01:34 onwards ("Left Essen", "How-o-o-to-to-to..." etc). Truncated
# the VTT to cue 30. User 'ca30d12a' bug report: subtitles wrong from 01:35.
TARGETS += [
    ("Mambo 201 - Combo 5 / Drill (truncate ASR garbage tail after 01:34)",
     "kKUHd12VKAAwh02c00g5bAYU00z1KuEve02QXdi14EG1l9U",
     "Mambo201Edited", "Combo_5_Drill"),
]

# Round 7 — Pachanga lessons reported as "screen filled with paragraph of
# text"; current R2/source VTTs are well-chunked (max 2 lines, 42 chars).
# Likely Mux serves the un-chunked initial ingest. Refresh forces re-ingest.
TARGETS += [
    ("Pachanga - Single Single Double / Lesson (refresh — Mux likely stale)",
     "fJMyA2vl2syr1vyD02HJUjUt1QMfnWgtSJhFaKDoTC5M",
     "PachangaEdited", "Single_Single_Double_Lesson"),
    ("Pachanga - Basic Pachanga / Lesson (refresh — Mux likely stale)",
     "PvArn00f5PgyI7PXh00702wDj1ks00U8OJDx00MGzrYSQPbI",
     "PachangaEdited", "Pachanga_Basic_Lesson"),
]

# Round 8 — Bodymovement Mastery / Head Lesson 2 reported as CC-out-of-sync
# at 1:21. Source cues read coherently. Refresh in case Mux serves stale.
TARGETS += [
    ("Bodymovement Mastery - Head / Lesson 2 (refresh — CC reported out-of-sync at 1:21)",
     "Iwzy857u8ooTcLxRDWh5ez0101w7vyoD51zvt8016VA00KA",
     "BodymovementsEdited", "Head_Lesson_2"),
]

# Rounds 1-8 all refreshed. Re-running is idempotent — slice as needed.
TARGETS = TARGETS[20:21]


def main():
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--dry-run", action="store_true")
    g.add_argument("--execute", action="store_true")
    args = ap.parse_args()

    cfg = mux_python.Configuration()
    cfg.username = MUX_TOKEN_ID
    cfg.password = MUX_TOKEN_SECRET
    api = mux_python.AssetsApi(mux_python.ApiClient(cfg))
    s3 = boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_KEY,
        aws_secret_access_key=R2_SECRET,
    )

    print(f"=== Caption typo-fix refresh ({'DRY-RUN' if args.dry_run else 'EXECUTE'}) ===\n")

    for label, asset_id, course, stem in TARGETS:
        vtt_path = CAPTION_BASE / f"{course}__{stem}.vtt"
        r2_key = f"captions/en/{course}__{stem}.vtt"
        r2_url = f"{R2_DOMAIN}/{r2_key}"

        print(f"[{label}]")
        if not vtt_path.exists():
            print(f"  MISSING local VTT: {vtt_path}")
            continue
        size = vtt_path.stat().st_size
        print(f"  VTT      : {vtt_path.name} ({size:,} bytes)")
        print(f"  R2 key   : {r2_key}")
        print(f"  asset_id : {asset_id}")

        try:
            asset = api.get_asset(asset_id)
        except ApiException as e:
            print(f"  ERROR fetching asset: {e}")
            continue

        en_tracks = [t for t in (asset.data.tracks or []) if t.type == "text" and t.language_code == "en"]
        print(f"  current  : {len(en_tracks)} EN track(s): {[t.id for t in en_tracks]}")

        if args.dry_run:
            print(f"  plan     : upload->R2, delete {len(en_tracks)} EN track(s), create 1 new EN track\n")
            continue

        # 1) Upload chunked VTT to R2 (same key, overwrites).
        try:
            s3.upload_file(str(vtt_path), R2_BUCKET, r2_key,
                           ExtraArgs={"ContentType": "text/vtt"})
            print(f"  uploaded : R2 ok")
        except Exception as e:
            print(f"  ERROR R2 upload: {e}")
            continue

        # 2) Delete existing EN tracks for this asset.
        for t in en_tracks:
            try:
                api.delete_asset_track(asset_id, t.id)
                print(f"  deleted  : track {t.id}")
                time.sleep(0.3)
            except ApiException as e:
                print(f"  ERROR deleting track {t.id}: {e}")

        # 3) Create fresh EN track pointing at the refreshed R2 URL.
        req = mux_python.CreateTrackRequest(
            url=r2_url, type="text", text_type="subtitles",
            language_code="en", name="English",
            closed_captions=True, passthrough="en",
        )
        try:
            new = api.create_asset_track(asset_id, req)
            print(f"  created  : new track {new.data.id}")
        except ApiException as e:
            print(f"  ERROR create track: {e}")

        time.sleep(0.5)
        print()

    print("=== Done ===")


if __name__ == "__main__":
    main()
