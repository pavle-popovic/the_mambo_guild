import numpy as np
from scipy.io.wavfile import write

def generate_modern_chime(filename='modern_mission_complete.wav'):
    sample_rate = 44100
    duration_s = 2.5  # Slightly longer for the echo tail
    
    # --- 1. Define the Notes (C Major 9 Chord) ---
    # Frequency format: (Hz, start_time_seconds)
    # Strumming them slightly apart creates a "human" feel
    notes = [
        (523.25, 0.05),  # C5
        (659.25, 0.10),  # E5
        (783.99, 0.15),  # G5
        (987.77, 0.20),  # B5
        (1174.66, 0.25)  # D6 (The "sparkle" note)
    ]

    # Create an empty buffer for the audio
    total_samples = int(sample_rate * duration_s)
    audio = np.zeros(total_samples)

    # --- 2. Synthesize "Electric Piano" Tone ---
    for freq, start_time in notes:
        # Calculate how many samples until this note starts
        start_sample = int(start_time * sample_rate)
        
        # Remaining duration for this note
        note_duration = duration_s - start_time
        t = np.linspace(0, note_duration, int(note_duration * sample_rate), endpoint=False)
        
        # FM SYNTHESIS TRICK:
        # Modulating a sine wave with another sine wave creates a "bell/glass" tone
        # Carrier = freq, Modulator = freq * 2 (one octave up)
        modulator = 0.5 * np.sin(2 * np.pi * (freq * 2) * t) * np.exp(-3 * t) # Modulator fades fast
        wave = np.sin(2 * np.pi * freq * t + modulator)
        
        # Envelope: Fast attack, long exponential decay (Bell shape)
        envelope = np.exp(-4 * t)  # The '4' controls how fast it fades out
        wave = wave * envelope * 0.2  # Multiply by 0.2 to prevent clipping when adding notes
        
        # Add this note to the main track
        end_sample = start_sample + len(wave)
        audio[start_sample:end_sample] += wave

    # --- 3. Add Stereo Delay (The "Modern" Polish) ---
    # We will create a simple echo effect
    delay_time = 0.25 # seconds
    delay_samples = int(delay_time * sample_rate)
    decay = 0.4 # Echo gets 40% quieter each repeat

    # Create a copy for the echo
    echo_signal = np.zeros_like(audio)
    echo_signal[delay_samples:] = audio[:-delay_samples] * decay
    
    # Mix original + echo
    final_audio = audio + echo_signal

    # --- 4. Normalize and Save ---
    # Scale to 16-bit integer range safely
    max_val = np.max(np.abs(final_audio))
    if max_val > 0:
        final_audio = final_audio / max_val
    
    audio_int16 = np.int16(final_audio * 32767)
    write(filename, sample_rate, audio_int16)
    print(f"Generated modern sound: {filename}")

if __name__ == "__main__":
    generate_modern_chime()