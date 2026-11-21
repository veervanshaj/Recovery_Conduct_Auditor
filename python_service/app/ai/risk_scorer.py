from typing import List, Dict, Any

class CumulativeRiskScorer:
    """
    Transparent, evidence-based cumulative risk scoring engine.
    Combines language analysis, acoustic DSP observations, and context
    to categorize calls into:
      - 'low': Nominal compliance
      - 'medium': Procedural concern / moderate priority
      - 'high': High priority for human review
    Never assigns arbitrary points for pitch or silence alone.
    """

    def calculate_risk(
        self,
        flagged_segments: List[Dict[str, Any]],
        audio_events: List[Dict[str, Any]],
        dsp_summary: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate transparent risk classification with traceable reasons.
        """
        score = 0
        reasons = []

        # 1. Evaluate Flagged Segments (Language + Context)
        critical_flags = [f for f in flagged_segments if f.get("severity") == "critical"]
        high_flags = [f for f in flagged_segments if f.get("severity") == "high"]
        medium_flags = [f for f in flagged_segments if f.get("severity") == "medium"]

        # Critical violation (Third-party employer / family threat)
        if len(critical_flags) > 0:
            score += 55
            for cf in critical_flags:
                reasons.append(f"Critical violation: {cf.get('reason_for_flag', 'Statutory third-party threat')} at {round(cf.get('start_time', 0), 1)}s")

        # High severity flags (Intimidation, abusive language, prohibited calling hours)
        if len(high_flags) > 0:
            score += min(len(high_flags) * 25, 45)
            for hf in high_flags[:2]:
                reasons.append(f"High-priority flag: {hf.get('reason_for_flag', 'Concerning conduct')} at {round(hf.get('start_time', 0), 1)}s")

        # Medium severity flags (Unreasonable pressure tactics)
        if len(medium_flags) > 0:
            score += min(len(medium_flags) * 10, 20)
            reasons.append(f"Procedural pressure: {len(medium_flags)} moderate communication flag(s) identified")

        # 2. Acoustic Corroboration (Supporting evidence only)
        loudness_spikes = [e for e in audio_events if e.get("event_type") == "loudness_increase"]
        pitch_variations = [e for e in audio_events if e.get("event_type") == "pitch_variation"]

        # If verbal flags coincide with acoustic agitation, prioritize review
        if (len(critical_flags) > 0 or len(high_flags) > 0) and (len(loudness_spikes) > 0 or len(pitch_variations) > 0):
            score += 15
            reasons.append("Acoustic agitation (+loudness/pitch) coincides with demanding statements, elevating review urgency")

        # Baseline compliant call
        if len(flagged_segments) == 0:
            score = 10
            reasons.append("No threatening language or anomalous vocal agitation detected throughout recording")

        score = max(5, min(100, score))

        # Determine Category
        if score >= 65:
            overall_risk = "high"
        elif score >= 35:
            overall_risk = "medium"
        else:
            overall_risk = "low"

        return {
            "overall_risk_level": overall_risk,
            "risk_score": score,
            "risk_reasons": reasons
        }
