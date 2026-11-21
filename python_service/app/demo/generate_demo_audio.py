import os
import numpy as np
from scipy.io import wavfile

def generate_formant_speech(duration_sec, sample_rate=16000, f0=150.0, volume=0.5, formants=[700, 1220, 2600]):
    """
    Synthesize speech-like formant harmonics with natural vocal timbre.
    """
    total_samples = int(duration_sec * sample_rate)
    if total_samples <= 0:
        return np.zeros(0, dtype=np.float32)

    t = np.linspace(0, duration_sec, total_samples, endpoint=False)
    
    # Slight natural pitch flutter (vibrato)
    flutter = 2.0 * np.sin(2 * np.pi * 5.0 * t)
    instant_f0 = f0 + flutter
    phase = 2 * np.pi * np.cumsum(instant_f0) / sample_rate
    
    # Harmonic series
    signal = np.zeros(total_samples, dtype=np.float32)
    harmonics_count = min(25, int(sample_rate / (2 * (f0 + 50))))
    for h in range(1, harmonics_count + 1):
        freq = h * f0
        # Formant resonance filter envelope
        resonance = 0.0
        for f_res in formants:
            bw = 100.0
            resonance += np.exp(-((freq - f_res) ** 2) / (2 * (bw ** 2)))
        amp = (1.0 / h) * (0.2 + 0.8 * resonance)
        signal += amp * np.sin(h * phase)

    # Syllabic envelope modulation (approx 3.5 syllables per second)
    syllable_mod = 0.5 * (1.0 + np.sin(2 * np.pi * 3.5 * t))
    syllable_mod = np.clip(syllable_mod, 0.1, 1.0)
    
    # Smooth start and stop envelope (fade in / fade out)
    fade_len = min(int(0.05 * sample_rate), total_samples // 4)
    if fade_len > 0:
        fade_in = np.linspace(0, 1, fade_len)
        fade_out = np.linspace(1, 0, fade_len)
        signal[:fade_len] *= fade_in
        signal[-fade_len:] *= fade_out

    signal = signal * syllable_mod * volume
    return signal.astype(np.float32)

def generate_call_audio_files(output_dir="backend/uploads"):
    os.makedirs(output_dir, exist_ok=True)
    sr = 16000

    # -------------------------------------------------------------
    # Scenario 1: Compliant polite recovery call (52 seconds)
    # Agent f0 ~ 210 Hz (female Priya), Borrower f0 ~ 130 Hz (male Rahul)
    # -------------------------------------------------------------
    sc1_total_samples = int(52.0 * sr)
    sc1_audio = np.zeros(sc1_total_samples, dtype=np.float32)

    def add_segment(audio_buf, start_s, end_s, f0, vol, formants=[700, 1220, 2600]):
        s_idx = int(start_s * sr)
        e_idx = int(end_s * sr)
        dur = end_s - start_s
        seg = generate_formant_speech(dur, sr, f0=f0, volume=vol, formants=formants)
        audio_buf[s_idx:s_idx + len(seg)] += seg

    # Segments matching transcript:
    add_segment(sc1_audio, 0.0, 5.2, f0=210, vol=0.35, formants=[800, 1400, 2800])
    add_segment(sc1_audio, 5.8, 11.5, f0=130, vol=0.30, formants=[500, 1100, 2400])
    add_segment(sc1_audio, 12.0, 19.8, f0=210, vol=0.35, formants=[800, 1400, 2800])
    # Pause between 20.0 and 23.5s (portal check)
    add_segment(sc1_audio, 23.5, 29.2, f0=130, vol=0.30, formants=[500, 1100, 2400])
    add_segment(sc1_audio, 29.8, 38.6, f0=210, vol=0.35, formants=[800, 1400, 2800])
    add_segment(sc1_audio, 39.2, 44.0, f0=130, vol=0.30, formants=[500, 1100, 2400])
    add_segment(sc1_audio, 44.5, 51.5, f0=210, vol=0.32, formants=[800, 1400, 2800])

    # Add light realistic line noise
    sc1_audio += np.random.normal(0, 0.003, sc1_total_samples).astype(np.float32)
    sc1_int16 = np.int16(np.clip(sc1_audio, -1.0, 1.0) * 32767)
    p1 = os.path.join(output_dir, "demo_scenario_1_compliant_recovery.wav")
    wavfile.write(p1, sr, sc1_int16)
    print(f"Generated Scenario 1 audio: {p1}")

    # -------------------------------------------------------------
    # Scenario 2: Severe Intimidation & Employer Threat (68 seconds)
    # Agent baseline f0 = 170 Hz, Loudness spikes to volume=0.95 and f0=285 Hz at 29s-37.5s
    # 7.8s pause at 37.5s - 45.3s
    # Borrower pleading f0=150 Hz with trembling
    # -------------------------------------------------------------
    sc2_total_samples = int(68.0 * sr)
    sc2_audio = np.zeros(sc2_total_samples, dtype=np.float32)

    add_segment(sc2_audio, 0.0, 6.0, f0=170, vol=0.38) # Agent intro
    add_segment(sc2_audio, 6.5, 14.2, f0=135, vol=0.28) # Borrower explanation
    add_segment(sc2_audio, 14.8, 21.0, f0=185, vol=0.45) # Agent dismissing
    add_segment(sc2_audio, 21.5, 28.5, f0=138, vol=0.25) # Borrower pleading
    # SPIKE: 29.0s to 37.5s (Loudness increase + Pitch surge: Threatening employer!)
    add_segment(sc2_audio, 29.0, 37.5, f0=285, vol=0.92, formants=[950, 1600, 3100])
    # 37.5s to 45.3s is 7.8s silence / intimidation pause! (zero speech)
    add_segment(sc2_audio, 45.4, 55.0, f0=155, vol=0.24) # Borrower frightened pleading
    add_segment(sc2_audio, 55.5, 65.2, f0=220, vol=0.65) # Agent final pressure threat

    sc2_audio += np.random.normal(0, 0.003, sc2_total_samples).astype(np.float32)
    sc2_int16 = np.int16(np.clip(sc2_audio, -1.0, 1.0) * 32767)
    p2 = os.path.join(output_dir, "demo_scenario_2_intimidation_threat.wav")
    wavfile.write(p2, sr, sc2_int16)
    print(f"Generated Scenario 2 audio: {p2}")

    # -------------------------------------------------------------
    # Scenario 3: Repeated Calling & Early Morning Disruption (45 seconds)
    # Call at 7:15 AM
    # -------------------------------------------------------------
    sc3_total_samples = int(45.0 * sr)
    sc3_audio = np.zeros(sc3_total_samples, dtype=np.float32)

    add_segment(sc3_audio, 0.0, 6.5, f0=230, vol=0.60) # Borrower annoyed (early morning)
    add_segment(sc3_audio, 7.0, 14.8, f0=180, vol=0.42) # Agent justifying
    add_segment(sc3_audio, 15.2, 22.0, f0=225, vol=0.55) # Borrower complaining of 5 calls
    add_segment(sc3_audio, 22.5, 31.0, f0=185, vol=0.45) # Agent insistent
    add_segment(sc3_audio, 31.5, 38.0, f0=210, vol=0.48) # Borrower asking to stop calling
    add_segment(sc3_audio, 38.5, 44.5, f0=180, vol=0.40) # Agent warning

    sc3_audio += np.random.normal(0, 0.003, sc3_total_samples).astype(np.float32)
    sc3_int16 = np.int16(np.clip(sc3_audio, -1.0, 1.0) * 32767)
    p3 = os.path.join(output_dir, "demo_scenario_3_repeated_pattern.wav")
    wavfile.write(p3, sr, sc3_int16)
    print(f"Generated Scenario 3 audio: {p3}")

if __name__ == "__main__":
    generate_call_audio_files()
