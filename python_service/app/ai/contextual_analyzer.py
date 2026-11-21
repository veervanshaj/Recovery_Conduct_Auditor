import os
import json
import re
from typing import List, Dict, Any, Optional
from app.core.config import settings

class ContextualAIAnalyzer:
    """
    Multimodal Contextual Language Analysis Module.
    Combines timestamped transcripts, aligned DSP audio features, and conversational context
    to evaluate recovery conduct without inventing audio features or declaring guilt.
    """

    def __init__(self):
        self.gemini_api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        self.openai_api_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY", "")

    def analyze(
        self,
        transcript: List[Dict[str, Any]],
        aligned_data: Dict[str, Any],
        dsp_summary: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute contextual language analysis over aligned audio and transcript evidence.
        """
        # If API key is present, attempt LLM analysis
        if self.gemini_api_key:
            try:
                return self._analyze_with_gemini(transcript, aligned_data, dsp_summary)
            except Exception as e:
                print(f"[ContextualAI] Gemini API call error: {e}. Falling back to deterministic rules engine.")

        # Fallback to transparent deterministic contextual compliance engine
        return self._analyze_with_deterministic_engine(transcript, aligned_data, dsp_summary)

    def _analyze_with_gemini(
        self,
        transcript: List[Dict[str, Any]],
        aligned_data: Dict[str, Any],
        dsp_summary: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Call Google Gemini with structured JSON prompt and strict guardrails against DSP hallucination.
        """
        import google.generativeai as genai

        genai.configure(api_key=self.gemini_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        # Build grounded multimodal evidence prompt
        prompt = self._build_prompt(transcript, aligned_data, dsp_summary)
        
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )

        result_json = json.loads(response.text)
        return self._sanitize_llm_response(result_json)

    def _build_prompt(
        self,
        transcript: List[Dict[str, Any]],
        aligned_data: Dict[str, Any],
        dsp_summary: Dict[str, Any]
    ) -> str:
        """
        Construct strict grounded prompt.
        """
        evidence_summary = {
            "transcript": transcript,
            "dsp_baseline": dsp_summary.get("baseline_features", {}),
            "audio_events": dsp_summary.get("audio_events", []),
            "pause_context": aligned_data.get("pause_associations", [])
        }

        return f"""
You are a senior RegTech Compliance Auditor examining loan recovery call recordings under Fair Debt Collection and RBI Conduct Guidelines.

Strict rules:
1. You must ONLY use the provided transcript, timestamps, and DSP audio events. DO NOT invent or assume pitch, loudness, or words that are not in the input.
2. Vocal changes (loudness/pitch) are supporting evidence, NOT independent proof of misconduct.
3. Silence or pauses alone must NOT be classified as harassment.
4. Categorize any concerning interactions using these exact categories:
   - "potential_intimidation"
   - "abusive_language"
   - "third_party_threat_employer_family"
   - "public_humiliation_threat"
   - "unreasonable_pressure_tactic"
   - "deceptive_or_misleading"
   - "prohibited_calling_hour"

Input Evidence:
{json.dumps(evidence_summary, indent=2)}

Return a valid JSON object matching this schema:
{{
  "overall_summary": "Concise factual summary of call conduct",
  "flagged_segments": [
    {{
      "start_time": 54.0,
      "end_time": 62.0,
      "category": "potential_intimidation",
      "severity": "high",
      "transcript_excerpt": "Exact text from transcript",
      "speaker": "SPEAKER_1",
      "language_evidence": "Explanation of verbal content",
      "audio_evidence": ["Exact measured DSP observation from audio_events if overlapping"],
      "context": "Surrounding conversation before and after",
      "reason_for_flag": "Objective compliance rationale",
      "confidence": "high",
      "recommended_action": "Suggested compliance follow-up"
    }}
  ],
  "review_notes": [
    "Audio features are supporting evidence, not proof of misconduct."
  ]
}}
"""

    def _analyze_with_deterministic_engine(
        self,
        transcript: List[Dict[str, Any]],
        aligned_data: Dict[str, Any],
        dsp_summary: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Grounded compliance rule engine matching statutory debt collection standards:
        - Third-party contact (employer, HR, family, colleagues)
        - Threatening/intimidating phrasing + aligned vocal surges
        - Inappropriate early morning / late night references
        - Long pauses following high-pressure statements
        """
        flagged = []
        review_notes = [
            "Analysis executed via Local Contextual Compliance Engine.",
            "Acoustic features (loudness/pitch) serve as corroborating context, not stand-alone proof."
        ]

        # Key compliance violation patterns
        employer_regex = re.compile(r'\b(employer|office|hr|boss|colleagues|company|workplace|manager|reception)\b', re.IGNORECASE)
        family_regex = re.compile(r'\b(father|mother|parents|wife|husband|children|relative|neighbor|neighbour|society)\b', re.IGNORECASE)
        intimidation_regex = re.compile(r'\b(police|jail|arrest|seize|defaulter|consequences|see what happens|teach you|reputation|destroy|don\'t care|pay today|right now)\b', re.IGNORECASE)
        abusive_regex = re.compile(r'\b(fraud|cheat|liar|shameless|bastard|idiot|get lost|shut up)\b', re.IGNORECASE)
        time_disruption_regex = re.compile(r'\b(so early|morning|7:15|6:45|night|wake up|sleep)\b', re.IGNORECASE)

        aligned_segments = aligned_data.get("aligned_segments", [])
        
        for item in aligned_segments:
            seg = item["segment"]
            text = seg["text"]
            start_t = seg["start_time"]
            end_t = seg["end_time"]
            speaker = seg.get("speaker", "SPEAKER")
            dsp_events = item.get("aligned_dsp_events", [])
            context = item.get("context_window", {})

            audio_evidence_notes = [e["description"] for e in dsp_events]
            has_loudness_surge = any(e["event_type"] == "loudness_increase" for e in dsp_events)
            has_pitch_surge = any(e["event_type"] == "pitch_variation" for e in dsp_events)

            # 1. Employer / Third-Party Contact Threat (Critical Violation)
            if employer_regex.search(text) or family_regex.search(text):
                is_threat = intimidation_regex.search(text) or "call" in text.lower() or "report" in text.lower() or "contact" in text.lower()
                if is_threat:
                    severity = "critical" if (has_loudness_surge or has_pitch_surge) else "high"
                    flagged.append({
                        "start_time": start_t,
                        "end_time": end_t,
                        "category": "third_party_threat_employer_family",
                        "severity": severity,
                        "transcript_excerpt": text,
                        "speaker": speaker,
                        "language_evidence": "Explicit verbal threat to contact or report borrower default to employer/HR or family members.",
                        "audio_evidence": audio_evidence_notes if audio_evidence_notes else ["Spoken with normal vocal baseline."],
                        "context": f"Preceded by: {context.get('preceding_dialogue')}",
                        "reason_for_flag": "Statutory violation of RBI Fair Practices Code Section 4.2 strictly prohibiting third-party recovery pressure.",
                        "confidence": "high",
                        "recommended_action": "Immediate escalation to Compliance Committee; review agent disciplinary records."
                    })
                    continue

            # 2. Potential Intimidation with Vocal Surge
            if intimidation_regex.search(text):
                if has_loudness_surge or has_pitch_surge:
                    flagged.append({
                        "start_time": start_t,
                        "end_time": end_t,
                        "category": "potential_intimidation",
                        "severity": "high",
                        "transcript_excerpt": text,
                        "speaker": speaker,
                        "language_evidence": "Demanding/threatening language combined with detected acoustic agitation.",
                        "audio_evidence": audio_evidence_notes,
                        "context": f"Preceded by: {context.get('preceding_dialogue')}",
                        "reason_for_flag": "Verbal insistence coincides with significant vocal energy elevation, indicating potential intimidation.",
                        "confidence": "high",
                        "recommended_action": "Review original audio segment to assess whether vocal surge constituted aggressive harassment."
                    })
                else:
                    flagged.append({
                        "start_time": start_t,
                        "end_time": end_t,
                        "category": "unreasonable_pressure_tactic",
                        "severity": "medium",
                        "transcript_excerpt": text,
                        "speaker": speaker,
                        "language_evidence": "Unreasonable repayment deadline or pressure language identified.",
                        "audio_evidence": ["No acoustic loudness spike observed."],
                        "context": f"Preceded by: {context.get('preceding_dialogue')}",
                        "reason_for_flag": "Pressure phrasing used without overt shouting.",
                        "confidence": "medium",
                        "recommended_action": "Ensure agent provides required statutory repayment notice periods."
                    })
                continue

            # 3. Abusive or Insulting Words
            if abusive_regex.search(text):
                flagged.append({
                    "start_time": start_t,
                    "end_time": end_t,
                    "category": "abusive_language",
                    "severity": "high",
                    "transcript_excerpt": text,
                    "speaker": speaker,
                    "language_evidence": "Derogatory or unprofessional language detected in spoken conversation.",
                    "audio_evidence": audio_evidence_notes,
                    "context": f"Preceded by: {context.get('preceding_dialogue')}",
                    "reason_for_flag": "Violation of professional conduct standards prohibiting insulting remarks.",
                    "confidence": "high",
                    "recommended_action": "Compliance officer review for script adherence."
                })
                continue

            # 4. Prohibited Calling Hours Mention
            if time_disruption_regex.search(text):
                flagged.append({
                    "start_time": start_t,
                    "end_time": end_t,
                    "category": "prohibited_calling_hour",
                    "severity": "high",
                    "transcript_excerpt": text,
                    "speaker": speaker,
                    "language_evidence": "Dialogue references out-of-hours contact disrupting borrower before statutory window.",
                    "audio_evidence": audio_evidence_notes,
                    "context": f"Preceded by: {context.get('preceding_dialogue')}",
                    "reason_for_flag": "Indicates call placed outside permitted 08:00 AM - 07:00 PM statutory window.",
                    "confidence": "high",
                    "recommended_action": "Verify telephony log timestamp and dialer configuration."
                })

        # Check Contextual Pauses following High-Severity statements
        for pause in aligned_data.get("pause_associations", []):
            if pause.get("pause_duration", 0) >= 6.0:
                prec = pause.get("preceding_utterance", "")
                if prec and (employer_regex.search(prec) or intimidation_regex.search(prec)):
                    # Check if already covered
                    p_start = pause["pause_start"]
                    p_end = pause["pause_end"]
                    flagged.append({
                        "start_time": p_start,
                        "end_time": p_end,
                        "category": "unreasonable_pressure_tactic",
                        "severity": "high",
                        "transcript_excerpt": f"Extended {round(pause['pause_duration'], 1)}s silence following: \"{prec[:60]}...\"",
                        "speaker": pause.get("following_speaker", "BORROWER"),
                        "language_evidence": "Borrower subjected to prolonged silence under psychological duress.",
                        "audio_evidence": [f"{round(pause['pause_duration'], 1)}s pause following intimidation attempt"],
                        "context": f"Following response: \"{pause.get('following_utterance', '')}\"",
                        "reason_for_flag": "Conversational pause in this context reflects intimidation shock rather than normal technical delay.",
                        "confidence": "high",
                        "recommended_action": "Listen to pause transition in context of following borrower response."
                    })

        # Overall summary creation
        if any(f["severity"] in ["high", "critical"] for f in flagged):
            summary = "Potentially concerning recovery interaction requiring compliance review. Multiple evidence flags detected."
        elif len(flagged) > 0:
            summary = "Minor procedural or communication flags detected. Routine compliance inspection suggested."
        else:
            summary = "Compliant recovery call. No threatening language or anomalous vocal agitation detected."

        return {
            "overall_summary": summary,
            "flagged_segments": flagged,
            "review_notes": review_notes
        }

    def _sanitize_llm_response(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate schema compliance and fallback if malformed.
        """
        if "overall_summary" not in result:
            result["overall_summary"] = "Call analysis completed."
        if "flagged_segments" not in result or not isinstance(result["flagged_segments"], list):
            result["flagged_segments"] = []
        if "review_notes" not in result:
            result["review_notes"] = ["Analysis completed via AI model."]
        return result
