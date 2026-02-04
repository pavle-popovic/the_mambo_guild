# Salsa Rhythm Tutor - Audio Samples

## File Structure

Place your audio samples in this directory. The tutor component will automatically map them based on the file names.

## Current Samples

From "Old School Salsa" pack:
- `TC_OSS_90_conga_tape_harlem.wav` - Conga tumbao
- `TC_OSS_90_cowbell_tape_harlem.wav` - Cowbell (campana)
- `TC_OSS_90_guiro_tape_harlem.wav` - Güiro
- `TC_OSS_90_maracas_tape_harlem.wav` - Maracas
- `TC_OSS_90_timbal_tape_harlem.wav` - Timbales
- `TC_OSS_90_percussion_stack_tape_harlem.wav` - Full percussion mix

From "Midnight Rumba" pack:
- `TC_MR_120_percussion_kit_high_monte_clave.wav` - Clave

## Adding New Samples

1. **Copy audio files** to this directory
2. **Update `AUDIO_FILE_MAP`** in `SalsaRhythmTutor.tsx` to map instrument names to file paths
3. **Update `rhythm-encyclopedia.json`** to reference the new files in the `audio_file` field

## File Naming Convention

For best results, name files descriptively:
- `{instrument}_{rhythm}_{section}.wav`
- Example: `conga_tumbao_verse.wav`, `timbal_cascara_montuno.wav`

## Audio Requirements

- **Format**: WAV or MP3
- **Sample Rate**: 44.1kHz recommended
- **Bit Depth**: 16-bit or 24-bit
- **Length**: Loops should be 1-4 bars (4-16 beats)
- **BPM**: Match the BPM in `rhythm-encyclopedia.json` or use time-stretching

## Tips

- Use **looped samples** for continuous playback
- Ensure samples are **tempo-matched** to the rhythm's BPM
- **Normalize** audio levels for consistent volume
- **Trim silence** at the start/end for clean loops
