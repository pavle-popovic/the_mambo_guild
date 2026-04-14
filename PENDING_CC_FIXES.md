# Pending Closed-Caption / On-Screen Text Fixes

These four issues were reported by founder members during Apr 12–13 2026 testing.
They cannot be fixed in this repo — the text lives in Mux text tracks (or is
burned into the video). Action them via the Mux Dashboard or the Mux API
(`POST /video/v1/assets/{ASSET_ID}/tracks` to upload a corrected VTT, then
delete the old track).

## Bug 02 — Basic Steps Video 2: "weight" → "wait"

- **Lesson UUID:** `aed7ba29-c540-44b4-a7d2-505834c0f943`
- **Page:** https://www.themamboguild.com/lesson/aed7ba29-c540-44b4-a7d2-505834c0f943
- **Language:** English CC
- **Fix:** Change "weight" to "wait" at the relevant cue.
- **Reporter:** Founder Member `user-07b127e2-6d7f-4964-82a9-266da04d8875`
- **Received:** 2026-04-14 UTC

---

## Bug 19 — Basic Steps: "Valse" on-screen note doesn't make sense in English

- **Lesson UUID:** `e9f03ed9-562f-4032-adc6-39e2b752f0d3`
- **Page:** https://www.themamboguild.com/lesson/e9f03ed9-562f-4032-adc6-39e2b752f0d3
- **Language:** English on-screen note
- **Current text:** "This a little bit like Valse"
- **Suggested fix:** "This is similar to the Waltz" — or remove the note entirely,
  since the Waltz reference is unfamiliar to US audiences.
- **⚠️ Note:** The text may be burned into the video rather than a text track.
  Confirm the source before editing; if burned-in, the video itself needs to be
  re-rendered.
- **Reporter:** Founder Member `user-73d717b8-1c16-4b17-9ac7-8c00b6315544`
- **Received:** 2026-04-13 UTC

---

## Bug 20 — Basic Timing: "Tiempo" misspelled for "Tempo"

- **Lesson UUID:** `e76418d7-a327-48f5-9cb2-6d6ff4478433`
- **Page:** https://www.themamboguild.com/lesson/e76418d7-a327-48f5-9cb2-6d6ff4478433
- **Language:** English CC
- **Fix:** First occurrence of "Tiempo" → "Tempo". The second occurrence in the
  same video is already spelled correctly.
- **Reporter:** Founder Member `user-73d717b8-1c16-4b17-9ac7-8c00b6315544`
- **Received:** 2026-04-13 UTC

---

## Bug 21 — Basic Timing: English CC out of sync

- **Lesson UUID:** `e76418d7-a327-48f5-9cb2-6d6ff4478433` (same lesson as bug 20)
- **Page:** https://www.themamboguild.com/lesson/e76418d7-a327-48f5-9cb2-6d6ff4478433
- **Language:** English CC
- **Fix:** Re-time the English VTT so cues line up with Pavle's speech. Some
  spoken words are missing from the caption track entirely — a full pass is
  recommended rather than a partial re-time.
- **Reporter:** Founder Member `user-73d717b8-1c16-4b17-9ac7-8c00b6315544`
- **Received:** 2026-04-13 UTC

---

## Suggested workflow

1. Pull the current VTT for each asset from Mux.
2. Apply the text corrections above (bugs 02, 20) and re-time bug 21.
3. For bug 19, inspect the source file to determine whether the note is
   burned-in or a separate text track before deciding on a fix path.
4. Upload corrected tracks via the Mux API, verify playback on
   themamboguild.com, then delete the superseded tracks.
