# DJ Booth Audio Stems

To make the DJ Booth functional, you need to add audio stem files for each track.

## Required Files per Track

Each track folder needs 4 audio files:
- `full_mix.mp3` - The complete original track
- `percussion.mp3` - Congas, timbales, bongos, cowbell, güiro
- `piano_bass.mp3` - Piano montuno + bass tumbao
- `vocals_brass.mp3` - Vocals + trumpets + trombones

## How to Create Stems

### Option 1: Use AI Stem Separation (Recommended)
1. **Demucs** (Free, open-source): https://github.com/facebookresearch/demucs
   ```bash
   demucs -n htdemucs_ft "your_song.mp3"
   ```
   
2. **Spleeter** (Free, by Deezer): https://github.com/deezer/spleeter
   ```bash
   spleeter separate -o output/ -p spleeter:4stems "your_song.mp3"
   ```

3. **LALAL.AI** (Paid, high quality): https://www.lalal.ai/
4. **RipX** (Paid, professional): https://hitnmix.com/ripx/

### Option 2: Use Pre-Made Loops
For learning purposes, you can use royalty-free salsa loops:
- Splice.com
- Loopmasters
- Native Instruments

## File Format Requirements
- Format: MP3 (recommended) or WAV
- Bitrate: 192kbps or higher
- Sample Rate: 44.1kHz
- **Important**: All stems MUST be the exact same length!

## Folder Structure
```
/audio/dj-booth/
├── quimbara/           (Celia Cruz - 95 BPM)
├── pedro-navaja/       (Rubén Blades - 92 BPM)
├── aguanile/           (Héctor Lavoe - 98 BPM)
├── el-cantante/        (Héctor Lavoe - 94 BPM)
├── lloraras/           (Oscar D'León - 96 BPM)
├── idilio/             (Willie Colón - 90 BPM)
├── periodico-de-ayer/  (Héctor Lavoe - 93 BPM)
├── la-rebelion/        (Joe Arroyo - 97 BPM)
├── tu-con-el/          (Frankie Ruiz - 95 BPM)
└── devorame-otra-vez/  (Lalo Rodríguez - 94 BPM)

Each folder needs these 4 files:
├── full_mix.mp3
├── percussion.mp3
├── piano_bass.mp3
└── vocals_brass.mp3
```

## Classic Salsa Instruments by Stem

### Percussion (percussion.mp3)
- 🥁 Congas (tumbadora) - The heartbeat of salsa
- 🔔 Timbales - Drives the rhythm with cascara
- 🎶 Bongos - High-pitched accents
- 🔔 Cowbell (campana) - Marks the mambo section
- 🎵 Güiro - Scraping gourd for texture
- 🥢 Claves - The 2-3 or 3-2 pattern foundation

### Piano/Bass (piano_bass.mp3)
- 🎹 Piano montuno - Repetitive syncopated pattern
- 🎸 Bass (bajo) - Tumbao pattern, locks with conga

### Vocals/Brass (vocals_brass.mp3)
- 🎤 Lead vocals (sonero)
- 🎺 Trumpets - Bright, punchy horn section
- 📯 Trombones - Rich, warm harmonies
- 🎷 Saxophones (sometimes)

## Tips for Best Results
1. Start with high-quality source audio (lossless if possible)
2. Use Demucs with `htdemucs_ft` model for best quality
3. Manually adjust levels so all stems are balanced
4. Test sync by playing all stems together
