from typing import List, Dict, Any
from app.core.config import settings

class TimestampAlignmentEngine:
    """
    Mathematical interval-overlap alignment engine.
    Aligns DSP acoustic observations (loudness spikes, pitch variations, pauses)
    with speech-to-text transcript segments based on temporal overlap [t_start, t_end].
    Constructs surrounding context windows (+/- 5-10s) and pause-dialogue associations.
    """

    def __init__(self, context_window_sec: float = 8.0):
        self.context_window_sec = context_window_sec

    def align(
        self, 
        transcript: List[Dict[str, Any]], 
        audio_events: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Produce unified temporal alignments between transcript utterances and DSP events.
        """
        aligned_items = []

        for seg in transcript:
            seg_start = seg["start_time"]
            seg_end = seg["end_time"]

            # Find overlapping DSP events
            matching_events = []
            for ev in audio_events:
                ev_start = ev["start_time"]
                ev_end = ev["end_time"]

                # Calculate temporal intersection
                overlap_start = max(seg_start, ev_start)
                overlap_end = min(seg_end, ev_end)
                overlap_duration = max(0.0, overlap_end - overlap_start)

                # Segment duration or event duration
                min_len = min(seg_end - seg_start, ev_end - ev_start)

                # If overlap exceeds 0.25s or represents significant proportion
                if overlap_duration >= 0.25 or (min_len > 0 and (overlap_duration / min_len) > 0.3):
                    matching_events.append({
                        "event_type": ev["event_type"],
                        "severity": ev["severity"],
                        "start_time": ev_start,
                        "end_time": ev_end,
                        "overlap_duration": round(overlap_duration, 2),
                        "description": ev["description"],
                        "measured_features": ev.get("measured_features", {})
                    })

            # Retrieve surrounding conversation context (+/- 8 seconds)
            context_window = self._extract_context_window(transcript, seg_start, seg_end)

            aligned_items.append({
                "segment": seg,
                "aligned_dsp_events": matching_events,
                "context_window": context_window
            })

        # Process long pauses and associate with preceding and succeeding utterances
        pause_associations = self._associate_pauses(transcript, audio_events)

        return {
            "aligned_segments": aligned_items,
            "pause_associations": pause_associations
        }

    def _extract_context_window(
        self, 
        transcript: List[Dict[str, Any]], 
        target_start: float, 
        target_end: float
    ) -> Dict[str, Any]:
        """
        Extract dialogue utterances occurring immediately before and after the event.
        """
        pre_window_start = max(0.0, target_start - self.context_window_sec)
        post_window_end = target_end + self.context_window_sec

        preceding = []
        following = []

        for s in transcript:
            if s["end_time"] <= target_start and s["end_time"] >= pre_window_start:
                preceding.append(f"{s.get('speaker', 'SPEAKER')}: \"{s['text']}\"")
            elif s["start_time"] >= target_end and s["start_time"] <= post_window_end:
                following.append(f"{s.get('speaker', 'SPEAKER')}: \"{s['text']}\"")

        return {
            "preceding_dialogue": " | ".join(preceding) if preceding else "Beginning of call interaction.",
            "following_dialogue": " | ".join(following) if following else "End of call interaction."
        }

    def _associate_pauses(
        self, 
        transcript: List[Dict[str, Any]], 
        audio_events: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Associates detected pauses with preceding statements (e.g. pressure/threats)
        and subsequent borrower responses (e.g. capitulation/distress).
        """
        pause_events = [e for e in audio_events if e["event_type"] == "long_pause"]
        associations = []

        for pause in pause_events:
            p_start = pause["start_time"]
            p_end = pause["end_time"]

            # Preceding utterance: segment ending closest to pause start
            preceding_seg = None
            following_seg = None

            for s in transcript:
                if s["end_time"] <= p_start + 0.5:
                    if preceding_seg is None or s["end_time"] > preceding_seg["end_time"]:
                        preceding_seg = s
                elif s["start_time"] >= p_end - 0.5:
                    if following_seg is None or s["start_time"] < following_seg["start_time"]:
                        following_seg = s

            associations.append({
                "pause_start": p_start,
                "pause_end": p_end,
                "pause_duration": pause.get("duration", p_end - p_start),
                "preceding_utterance": preceding_seg["text"] if preceding_seg else None,
                "preceding_speaker": preceding_seg.get("speaker") if preceding_seg else None,
                "following_utterance": following_seg["text"] if following_seg else None,
                "following_speaker": following_seg.get("speaker") if following_seg else None
            })

        return associations
