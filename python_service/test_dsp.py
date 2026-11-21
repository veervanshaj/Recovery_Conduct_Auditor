import os
import sys
sys.path.insert(0, os.path.abspath("python_service"))

from app.dsp.dsp_analyzer import DSPAnalyzer
from app.core.audio_utils import load_audio_preserve_channels

audio_path = "backend/uploads/demo_scenario_2_intimidation_threat.wav"
data, sr, ch = load_audio_preserve_channels(audio_path)
print(f"Audio loaded: {len(data)/sr:.1f}s, SR={sr}, Channels={ch}")

analyzer = DSPAnalyzer(target_sr=sr)
res = analyzer.analyze(data, sr)
print(f"Duration: {res['audio_duration']}s")
print(f"Baseline RMS: {res['baseline_features']['baseline_rms_energy']}")
print(f"Baseline Pitch: {res['baseline_features']['baseline_pitch_hz']} Hz")
print(f"Total Audio Events Detected: {len(res['audio_events'])}")
for ev in res["audio_events"]:
    print(f" -> [{ev['start_time']} - {ev['end_time']}] {ev['event_type']} ({ev['severity']}): {ev['description']}")
