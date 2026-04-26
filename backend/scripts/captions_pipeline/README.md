# Captions translation + re-upload pipeline

Resumable, in-session translation of every video VTT into 15 non-English
locales, plus a one-shot script to handle the case where a video is
re-recorded and everything downstream needs to refresh.

## Locales

EN is the master. 15 non-EN locales are translated:
`ar de el es fr it ja ko nl pl pt ru sr tr zh`

`Captions_<lang>_chunked/<CourseFolder>__<Stem>.vtt` is the on-disk format.
EN master is `Clean_Captions_chunked/<CourseFolder>__<Stem>.vtt` under
`D:/MamboGuild/caption_cleanup/`.

## Files in this folder

| File | Purpose |
| --- | --- |
| `caption_state.json` | Source of truth: per-(stem, locale) status. Refreshed by `build_state.py`. |
| `build_state.py` | Walks all caption dirs, refreshes state. Also marks/clears `needs_redo` flags. |
| `next_batch.py` | Read-only. Emits the next pending stem(s) + the EN VTT contents for in-chat translation. |
| `apply_translation.py` | Validates a freshly-written translated VTT and marks state `translated`. |
| `reupload_video.py` | One-shot: re-uploads an MP4 to Mux, updates DB, marks all non-EN for retranslation. |

## Translation workflow (in chat with Claude / Opus)

The translator is the LLM in the chat session — not an API key. The state file
makes the work resumable: when the session runs out of tokens, just start a
fresh chat and say "continue captions" and the next batch gets picked up
exactly where the last one stopped.

Each session, the translator runs:

```bash
# 1. Refresh state from disk (catches any files added/edited externally).
python backend/scripts/captions_pipeline/build_state.py --report

# 2. Pull the next pending stem (with the EN VTT body inlined for translation).
python backend/scripts/captions_pipeline/next_batch.py --stems 1 --print-en
# or scope to one locale:
python backend/scripts/captions_pipeline/next_batch.py --stems 5 --only-lang ar --print-en
# or one specific stem across every locale that's still pending for it:
python backend/scripts/captions_pipeline/next_batch.py --stem PachangaEdited__PachangaHistory1 --print-en
```

For each (stem, locale) job the translator:

1. Reads the EN VTT from the printed contents (or from `--en_vtt` path).
2. Writes a translated VTT to the printed `WRITE TO` path. **Preserves the
   `WEBVTT` header, the `STYLE` block, every cue index, every timestamp, and
   the position line. Only the cue text changes.**
3. Marks the cell done:

```bash
python backend/scripts/captions_pipeline/apply_translation.py --stem PachangaEdited__PachangaHistory1 --lang ar
```

`apply_translation.py` validates that the file starts with `WEBVTT` and that
the cue count matches EN within `--cue-tolerance 2`. If validation fails the
state is **not** updated and the file is left on disk so the translator can fix
it and re-run.

When the chat session runs low on tokens, the translator commits whatever
files are done and stops. The next session starts fresh; `next_batch.py`
returns whatever is still pending. **No special "resume" command needed.**

After all locales for a slug are translated, push them to Mux:

```bash
python backend/scripts/upload_captions_to_mux.py --execute --only-slug pachanga
# or a single locale:
python backend/scripts/upload_captions_to_mux.py --execute --only-lang ar
```

## Re-upload flow (replacing a recorded video)

When a lesson video is re-recorded, everything downstream needs to refresh:
the Mux asset is replaced, the DB row needs the new IDs, the EN VTT needs to
be re-transcribed, all 15 non-EN VTTs need to be retranslated, and all the
caption tracks need to be re-attached to the new Mux asset.

`reupload_video.py` automates the Mux + DB + state-marking parts. The
transcription + chunking + caption upload steps are existing scripts you run
afterward.

```bash
# 1. Re-upload the MP4 + update the DB row + mark non-EN as needs_redo.
python backend/scripts/captions_pipeline/reupload_video.py \
    --lesson-id <UUID-from-supabase> \
    --new-mp4 D:/MamboGuild/PachangaEdited/PachangaHistory1.mp4 \
    --course-folder PachangaEdited \
    --stem PachangaHistory1 \
    --invalidate-en      # if the new video has different speech, regenerate EN

# 2. Make sure the new MP4 is at d:/MamboGuild/<CourseFolder>/<stem>.mp4 so
#    the EN transcriber and caption resolver can find it.

# 3. Re-transcribe to get a fresh EN VTT.
python d:/MamboGuild/caption_cleanup/transcribe_videos.py
#    (this auto-runs clean_captions.py at the end)

# 4. Re-chunk the new EN VTT.
python backend/scripts/rechunk_vtt_captions.py --only en

# 5. Re-translate (in chat): start a session and say
#    "continue captions for stem PachangaEdited__PachangaHistory1".
#    The translator picks up the 15 needs_redo cells and writes new VTTs.

# 6. Re-attach caption tracks to the (new) Mux asset.
python backend/scripts/upload_captions_to_mux.py --execute --only-slug pachanga
```

`upload_captions_to_mux.py` is idempotent — it deletes any existing Mux text
track per language before re-creating it, so you can safely run step 6
multiple times.

## Invariants the translator must preserve

A translated VTT differs from the EN master in **only** the cue text body.
Everything else is byte-identical structure:

- The `WEBVTT` header line stays.
- The `STYLE` block stays exactly as in EN.
- Cue indices `1..N` stay in order.
- Every timestamp line is identical: `00:00:01.234 --> 00:00:03.456 line:97% position:50% size:80% align:center`.
- One blank line separates cues.
- Cue body line wrapping should target ≤ 42 chars / line, ≤ 2 lines, same as
  the EN chunked source. Translators may re-wrap as long as the cue's
  meaning fits the time slot.

`apply_translation.py` enforces the structural invariants by counting cues
and refusing to mark state done if the count drifts.

## Commands cheat sheet

```bash
# Health-check the inventory
python backend/scripts/captions_pipeline/build_state.py --report

# What's next (1 stem, all its pending locales, with EN body inlined)
python backend/scripts/captions_pipeline/next_batch.py --print-en

# What's next for one locale only (e.g. ar from scratch)
python backend/scripts/captions_pipeline/next_batch.py --only-lang ar --stems 3 --print-en

# Mark a specific cell done
python backend/scripts/captions_pipeline/apply_translation.py --stem X --lang ar

# Manually flag a stem for retranslation (e.g. you edited the EN master)
python backend/scripts/captions_pipeline/build_state.py --mark-redo all-non-en --stem X

# Push everything for one slug to Mux
python backend/scripts/upload_captions_to_mux.py --execute --only-slug pachanga
```
