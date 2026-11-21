import numpy as np
import librosa
from scipy import signal
from typing import List, Dict, Any
from app.core.config import settings
from app.core.audio_utils import get_channel_or_mono

class DSPAnalyzer:
    """
    Local Digital Signal Processing (DSP) engine using Librosa, SciPy, and NumPy.
    Extracts time-windowed RMS loudness, fundamental pitch (pYIN), and pauses.
    Strictly treats audio features as supporting evidence, NOT proof of misconduct.
    """

    def __init__(self, target_sr: int = 16000):
        self.sr = target_sr
        self.window_sec = settings.WINDOW_SEC
        self.hop_sec = settings.HOP_SEC

    def analyze(self, audio_data: np.ndarray, sample_rate: int = 16000) -> Dict[str, Any]:
        """
        Execute comprehensive DSP feature extraction.
        """
        mono_signal = get_channel_or_mono(audio_data)
        duration_sec = len(mono_signal) / sample_rate

        if duration_sec < 0.5:
            return {
                "audio_duration": duration_sec,
                "sample_rate": sample_rate,
                "audio_events": [],
                "timeline_features": []
            }

        # 1. Loudness Analysis (Short-Time RMS Energy)
        rms_events, rms_timeline, baseline_rms = self._analyze_loudness(mono_signal, sample_rate)

        # 2. Pitch & Vocal Variation Analysis (pYIN / YIN)
        pitch_events, pitch_timeline, baseline_pitch = self._analyze_pitch(mono_signal, sample_rate)

        # 3. Silence & Pause Detection
        pause_events, pause_timeline = self._analyze_silence_and_pauses(mono_signal, sample_rate)

        # 4. Vocal Strain / Spectral Dynamics
        spectral_events, spectral_timeline = self._analyze_spectral_strain(mono_signal, sample_rate)

        # Combine all audio events and sort chronologically by start_time
        all_events = rms_events + pitch_events + pause_events + spectral_events
        all_events.sort(key=lambda x: x["start_time"])

        # Compute summary metrics
        total_pause_duration = sum(e["duration"] for e in pause_events if "duration" in e)
        silence_ratio = total_pause_duration / max(duration_sec, 0.1)

        return {
            "audio_duration": round(duration_sec, 2),
            "sample_rate": sample_rate,
            "baseline_features": {
                "baseline_rms_energy": round(float(baseline_rms), 4),
                "baseline_pitch_hz": round(float(baseline_pitch), 1),
                "silence_ratio": round(float(silence_ratio), 3)
            },
            "audio_events": all_events,
            "timeline_samples": {
                "rms": rms_timeline,
                "pitch": pitch_timeline,
                "pauses": pause_timeline,
                "spectral": spectral_timeline
            }
        }

    def _analyze_loudness(self, y: np.ndarray, sr: int):
        """
        Calculates windowed RMS energy and identifies sudden loudness increases
        relative to the baseline vocal energy.
        """
        frame_length = int(sr * self.window_sec)
        hop_length = int(sr * self.hop_sec)

        rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
        times = librosa.times_like(rms, sr=sr, hop_length=hop_length)

        # Non-silent speech frames for baseline
        speech_frames = rms[rms > 0.015]
        baseline_rms = float(np.median(speech_frames)) if len(speech_frames) > 0 else 0.05
        baseline_rms = max(baseline_rms, 0.02) # Prevent division by near-zero

        events = []
        timeline = []

        in_spike = False
        spike_start = 0.0
        peak_rms = 0.0

        for t, val in zip(times, rms):
            val_f = float(val)
            ratio = val_f / baseline_rms
            timeline.append({"time": round(float(t), 2), "rms": round(val_f, 4), "ratio": round(ratio, 2)})

            if ratio >= settings.LOUDNESS_INCREASE_RATIO:
                if not in_spike:
                    in_spike = True
                    spike_start = float(t)
                    peak_rms = val_f
                else:
                    peak_rms = max(peak_rms, val_f)
            else:
                if in_spike:
                    spike_end = float(t)
                    duration = spike_end - spike_start
                    if duration >= 0.8: # Only register substantial surges > 0.8s
                        db_increase = 20 * np.log10(max(peak_rms / baseline_rms, 1.01))
                        severity = "high" if db_increase > 9.0 else "medium"
                        events.append({
                            "event_type": "loudness_increase",
                            "start_time": round(spike_start, 2),
                            "end_time": round(spike_end, 2),
                            "duration": round(duration, 2),
                            "severity": severity,
                            "measured_features": {
                                "rms_peak": round(float(peak_rms), 4),
                                "rms_relative_ratio": round(float(peak_rms / baseline_rms), 2),
                                "db_increase": round(float(db_increase), 1)
                            },
                            "description": f"Loudness increased by +{round(db_increase, 1)} dB ({round(peak_rms / baseline_rms, 1)}x baseline) relative to earlier speech."
                        })
                    in_spike = False

        if in_spike:
            spike_end = float(times[-1])
            duration = spike_end - spike_start
            if duration >= 0.8:
                db_increase = 20 * np.log10(max(peak_rms / baseline_rms, 1.01))
                events.append({
                    "event_type": "loudness_increase",
                    "start_time": round(spike_start, 2),
                    "end_time": round(spike_end, 2),
                    "duration": round(duration, 2),
                    "severity": "medium",
                    "measured_features": {
                        "rms_peak": round(float(peak_rms), 4),
                        "rms_relative_ratio": round(float(peak_rms / baseline_rms), 2),
                        "db_increase": round(float(db_increase), 1)
                    },
                    "description": f"Loudness elevated near end of recording (+{round(db_increase, 1)} dB relative to baseline)."
                })

        return events, timeline, baseline_rms

    def _analyze_pitch(self, y: np.ndarray, sr: int):
        """
        Pitch estimation using librosa.yin / pyin to track F0 fundamental frequency.
        Identifies sudden pitch elevation relative to earlier vocal baseline.
        """
        hop_length = int(sr * self.hop_sec)
        
        # Using librosa.yin for fast, robust local F0 estimation
        f0 = librosa.yin(
            y, 
            fmin=settings.PITCH_MIN_HZ, 
            fmax=settings.PITCH_MAX_HZ, 
            sr=sr, 
            hop_length=hop_length
        )
        times = librosa.times_like(f0, sr=sr, hop_length=hop_length)

        valid_pitches = f0[~np.isnan(f0) & (f0 > settings.PITCH_MIN_HZ)]
        baseline_pitch = float(np.median(valid_pitches)) if len(valid_pitches) > 0 else 160.0

        events = []
        timeline = []

        in_jump = False
        jump_start = 0.0
        peak_pitch = baseline_pitch

        for t, pitch_val in zip(times, f0):
            if np.isnan(pitch_val) or pitch_val <= settings.PITCH_MIN_HZ:
                timeline.append({"time": round(float(t), 2), "pitch_hz": None})
                if in_jump:
                    jump_end = float(t)
                    self._check_and_add_pitch_event(events, jump_start, jump_end, peak_pitch, baseline_pitch)
                    in_jump = False
                continue

            p_val = float(pitch_val)
            timeline.append({"time": round(float(t), 2), "pitch_hz": round(p_val, 1)})

            # Semitone shift: 12 * log2(pitch / baseline)
            semitone_shift = 12 * np.log2(max(p_val / baseline_pitch, 0.1))
            if semitone_shift >= settings.PITCH_SHIFT_SEMITONES:
                if not in_jump:
                    in_jump = True
                    jump_start = float(t)
                    peak_pitch = p_val
                else:
                    peak_pitch = max(peak_pitch, p_val)
            else:
                if in_jump:
                    jump_end = float(t)
                    self._check_and_add_pitch_event(events, jump_start, jump_end, peak_pitch, baseline_pitch)
                    in_jump = False

        if in_jump:
            self._check_and_add_pitch_event(events, jump_start, float(times[-1]), peak_pitch, baseline_pitch)

        return events, timeline, baseline_pitch

    def _check_and_add_pitch_event(self, events: List[Dict], start: float, end: float, peak_hz: float, baseline_hz: float):
        duration = end - start
        if duration >= 0.8: # Register persistent pitch elevation
            hz_diff = peak_hz - baseline_hz
            semitones = 12 * np.log2(max(peak_hz / baseline_hz, 0.1))
            severity = "high" if semitones > 6.0 else "medium"
            events.append({
                "event_type": "pitch_variation",
                "start_time": round(start, 2),
                "end_time": round(end, 2),
                "duration": round(duration, 2),
                "severity": severity,
                "measured_features": {
                    "pitch_hz": round(float(peak_hz), 1),
                    "baseline_hz": round(float(baseline_hz), 1),
                    "pitch_shift_hz": round(float(hz_diff), 1),
                    "pitch_relative_shift_semitones": round(float(semitones), 1)
                },
                "description": f"Vocal pitch elevated to {round(peak_hz, 1)} Hz (+{round(hz_diff, 1)} Hz / +{round(semitones, 1)} semitones relative to earlier baseline)."
            })

    def _analyze_silence_and_pauses(self, y: np.ndarray, sr: int):
        """
        Detects significant pauses (> 2.5 seconds) preserving exact start/end timestamps
        so contextual module can inspect the conversation before and after.
        """
        # Non-silent intervals using librosa.effects.split (top_db=28)
        non_silent_intervals = librosa.effects.split(y, top_db=28, frame_length=2048, hop_length=512)
        
        events = []
        timeline = []
        prev_end_sec = 0.0

        for interval in non_silent_intervals:
            start_sec = float(interval[0]) / sr
            end_sec = float(interval[1]) / sr

            pause_duration = start_sec - prev_end_sec
            if pause_duration >= settings.PAUSE_MIN_DURATION_SEC:
                severity = "medium" if pause_duration >= 6.0 else "informational"
                events.append({
                    "event_type": "long_pause",
                    "start_time": round(prev_end_sec, 2),
                    "end_time": round(start_sec, 2),
                    "duration": round(pause_duration, 2),
                    "severity": severity,
                    "measured_features": {
                        "silence_duration_sec": round(pause_duration, 2)
                    },
                    "description": f"{round(pause_duration, 1)}-second conversational pause detected. Surrounding dialogue preserved for contextual analysis."
                })
                timeline.append({
                    "start": round(prev_end_sec, 2),
                    "end": round(start_sec, 2),
                    "duration": round(pause_duration, 2)
                })

            prev_end_sec = end_sec

        # Check trailing silence
        total_duration = len(y) / sr
        trailing_pause = total_duration - prev_end_sec
        if trailing_pause >= settings.PAUSE_MIN_DURATION_SEC:
            events.append({
                "event_type": "long_pause",
                "start_time": round(prev_end_sec, 2),
                "end_time": round(total_duration, 2),
                "duration": round(trailing_pause, 2),
                "severity": "informational",
                "measured_features": {
                    "silence_duration_sec": round(trailing_pause, 2)
                },
                "description": f"{round(trailing_pause, 1)}-second pause detected at the conclusion of recording."
            })

        return events, timeline

    def _analyze_spectral_strain(self, y: np.ndarray, sr: int):
        """
        Calculates spectral centroid tracking acoustic energy distribution.
        Higher spectral centroid often accompanies tense vocal strain.
        """
        hop_length = int(sr * self.hop_sec)
        cent = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop_length)[0]
        times = librosa.times_like(cent, sr=sr, hop_length=hop_length)

        valid_cent = cent[cent > 300]
        baseline_cent = float(np.median(valid_cent)) if len(valid_cent) > 0 else 1500.0

        events = []
        timeline = []
        for t, c in zip(times, cent):
            timeline.append({"time": round(float(t), 2), "centroid": round(float(c), 1)})

        return events, timeline
