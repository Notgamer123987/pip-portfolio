#!/usr/bin/env python3
"""
Pip's Midnight Nursery - Sound Effects Synthesizer
Generates clean, sweet, magical 16-bit 44.1kHz WAV sound effects:
- click.wav: Soft wooden/tictac click
- sparkle.wav: Ascending celestial pentatonic chime cascade
- giggle.wav: Playful cheerful synthesizer giggle / chirp
- delivery.wav: Pneumatic whoosh + golden bell delivery chime
- transform.wav: Mysterious dark rumble + rising crimson energy pulse
"""

import os
import math
import struct
import wave

SAMPLE_RATE = 44100

def write_wav(filename, samples):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)        # mono
        wf.setsampwidth(2)        # 16-bit
        wf.setframerate(SAMPLE_RATE)
        data = bytearray()
        for s in samples:
            # clamp to [-1.0, 1.0]
            s = max(-1.0, min(1.0, s))
            int_val = int(s * 32767.0)
            data.extend(struct.pack('<h', int_val))
        wf.writeframes(data)
    print(f"[+] Generated sound: {filename} ({len(samples)} samples, {len(samples)/SAMPLE_RATE:.2f}s)")

def make_click():
    # Soft rounded click (50ms)
    duration = 0.05
    n_samples = int(SAMPLE_RATE * duration)
    samples = []
    freq = 600.0
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        env = math.exp(-t * 90.0)
        s = math.sin(2.0 * math.pi * freq * t) * env * 0.4
        samples.append(s)
    return samples

def make_sparkle():
    # Ascending celestial chime cluster (C6, E6, G6, B6, C7, E7)
    duration = 0.8
    n_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * n_samples
    notes = [1046.50, 1318.51, 1567.98, 1975.53, 2093.00, 2637.02]
    note_gap = 0.07

    for idx, freq in enumerate(notes):
        start_t = idx * note_gap
        start_idx = int(start_t * SAMPLE_RATE)
        note_dur = duration - start_t
        for i in range(int(note_dur * SAMPLE_RATE)):
            pos = start_idx + i
            if pos >= n_samples:
                break
            t = i / SAMPLE_RATE
            env = math.exp(-t * 8.0)
            s = (math.sin(2.0 * math.pi * freq * t) +
                 0.3 * math.sin(2.0 * math.pi * freq * 2.0 * t)) * env * 0.18
            samples[pos] += s
    return samples

def make_giggle():
    # Cute playful pitch-wobbling baby giggle synth
    duration = 0.45
    n_samples = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        # frequency modulation between 650Hz and 880Hz with 18Hz vibrato
        wobble = math.sin(2.0 * math.pi * 18.0 * t)
        f = 720.0 + wobble * 180.0 + (t * 200.0)
        # pulsed amplitude envelopes simulating a laugh (ha-ha-ha)
        burst_env = math.sin(2.0 * math.pi * 7.0 * t)
        burst_env = max(0.0, burst_env) ** 1.5
        decay = (1.0 - t / duration)
        s = math.sin(2.0 * math.pi * f * t) * burst_env * decay * 0.35
        samples.append(s)
    return samples

def make_delivery():
    # Pneumatic launch whoosh + crystalline chime resolving
    duration = 1.2
    n_samples = int(SAMPLE_RATE * duration)
    samples = [0.0] * n_samples
    # Whoosh (noise-like pitch sweep)
    for i in range(int(SAMPLE_RATE * 0.35)):
        t = i / SAMPLE_RATE
        sweep_f = 200.0 + (t / 0.35) * 800.0
        env = math.sin(math.pi * (t / 0.35))
        # Pseudo-noise combined with sweep
        noise = math.sin(i * 1234.567)
        s = (math.sin(2.0 * math.pi * sweep_f * t) * 0.4 + noise * 0.3) * env * 0.25
        samples[i] += s

    # Crystalline bell chord at 0.3s (D5, F#5, A5, D6)
    bell_start = int(SAMPLE_RATE * 0.28)
    bell_notes = [587.33, 739.99, 880.00, 1174.66]
    for freq in bell_notes:
        for i in range(n_samples - bell_start):
            pos = bell_start + i
            t = i / SAMPLE_RATE
            env = math.exp(-t * 4.5)
            s = math.sin(2.0 * math.pi * freq * t) * env * 0.16
            samples[pos] += s
    return samples

def make_transform():
    # Dark sub-bass rumble + eerie harmonic detuned swell
    duration = 2.0
    n_samples = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(n_samples):
        t = i / SAMPLE_RATE
        # Sub-bass pulse
        sub = math.sin(2.0 * math.pi * 55.0 * t) * 0.4
        # Rising detuned sawtooth/sine harmonics
        f1 = 110.0 + (t / duration) * 120.0
        f2 = f1 * 1.015  # detuned beating
        harm = (math.sin(2.0 * math.pi * f1 * t) + math.sin(2.0 * math.pi * f2 * t)) * 0.25
        # Swell envelope
        env = (t / duration) ** 0.8 * (1.0 - (t / duration) ** 4)
        s = (sub + harm) * env * 0.6
        samples.append(s)
    return samples

def main():
    sounds = {
        "assets/audio/sounds/click.wav": make_click(),
        "assets/audio/sounds/sparkle.wav": make_sparkle(),
        "assets/audio/sounds/giggle.wav": make_giggle(),
        "assets/audio/sounds/delivery.wav": make_delivery(),
        "assets/audio/sounds/transform.wav": make_transform(),
    }
    for path, smps in sounds.items():
        write_wav(path, smps)
    print("\n[DONE] All 5 sound effects synthesized successfully!")

if __name__ == "__main__":
    main()
