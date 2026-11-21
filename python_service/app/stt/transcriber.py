import os
from typing import List, Dict, Any, Optional
from faster_whisper import WhisperModel
from app.core.config import settings

class LocalTranscriber:
    """
    Local speech-to-text module using Faster-Whisper.
    Runs locally on CPU/GPU without external paid APIs.
    Preserves exact start and end timestamps for each segment and word.
    """

    def __init__(self):
        self.model = None
        self.model_size = settings.WHISPER_MODEL_SIZE
        self.device = settings.WHISPER_DEVICE
        self.compute_type = settings.WHISPER_COMPUTE_TYPE

    def _load_model(self):
        if self.model is None:
            print(f"[Faster-Whisper] Loading local Whisper model '{self.model_size}' on {self.device} ({self.compute_type})...")
            try:
                self.model = WhisperModel(
                    self.model_size,
                    device=self.device,
                    compute_type=self.compute_type
                )
                print("[Faster-Whisper] Model loaded successfully.")
            except Exception as e:
                print(f"[Faster-Whisper] Primary load failed: {e}. Attempting fallback with cpu/float32...")
                self.model = WhisperModel(
                    "base",
                    device="cpu",
                    compute_type="float32"
                )

    def transcribe(self, audio_path: str, language: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Transcribe audio file locally and return timestamped segments.
        """
        self._load_model()

        segments, info = self.model.transcribe(
            audio_path,
            language=language if language and language != "auto" else None,
            word_timestamps=True,
            vad_filter=True, # Voice activity detection
            vad_parameters=dict(min_silence_duration_ms=500)
        )

        detected_lang = info.language
        lang_prob = info.language_probability

        results = []
        seg_idx = 0

        for segment in segments:
            # Word-level timestamps if available
            words_list = []
            if segment.words:
                for w in segment.words:
                    words_list.append({
                        "word": w.word.strip(),
                        "start": round(float(w.start), 2),
                        "end": round(float(w.end), 2),
                        "probability": round(float(w.probability), 2)
                    })

            # Alternating speaker label heuristic if diarization is not configured
            # (e.g. SPEAKER_1 for Agent, SPEAKER_2 for Borrower)
            speaker_tag = f"SPEAKER_{(seg_idx % 2) + 1}"

            results.append({
                "segment_id": seg_idx,
                "start_time": round(float(segment.start), 2),
                "end_time": round(float(segment.end), 2),
                "speaker": speaker_tag,
                "text": segment.text.strip(),
                "words": words_list,
                "confidence": round(float(segment.avg_logprob), 3),
                "language": detected_lang
            })
            seg_idx += 1

        return results

# Singleton instance
transcriber_instance = LocalTranscriber()
