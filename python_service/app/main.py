import os
import shutil
import tempfile
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from app.core.config import settings
from app.core.audio_utils import load_audio_preserve_channels
from app.dsp.dsp_analyzer import DSPAnalyzer
from app.stt.transcriber import transcriber_instance
from app.alignment.alignment_engine import TimestampAlignmentEngine
from app.ai.contextual_analyzer import ContextualAIAnalyzer
from app.ai.risk_scorer import CumulativeRiskScorer

app = FastAPI(
    title="Recovery-Conduct Auditor Audio & AI Service",
    description="Local DSP Analysis, Faster-Whisper Transcription, and Contextual Multimodal Compliance Monitoring",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
dsp_analyzer = DSPAnalyzer(target_sr=settings.TARGET_SAMPLE_RATE)
alignment_engine = TimestampAlignmentEngine(context_window_sec=settings.CONTEXT_WINDOW_SEC)
ai_analyzer = ContextualAIAnalyzer()
risk_scorer = CumulativeRiskScorer()

@app.get("/")
def root():
    return {
        "service": "Recovery-Conduct Auditor Audio AI Engine",
        "status": "online",
        "dsp_engine": "Librosa + SciPy local",
        "stt_engine": f"Faster-Whisper ({settings.WHISPER_MODEL_SIZE}) local"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "whisper_model": settings.WHISPER_MODEL_SIZE,
        "whisper_device": settings.WHISPER_DEVICE,
        "target_sample_rate": settings.TARGET_SAMPLE_RATE
    }

@app.post("/api/v1/analyze-audio")
async def analyze_audio(
    audio_file: UploadFile = File(...),
    call_id: Optional[str] = Form(None),
    agent_id: Optional[str] = Form("AGENT_UNKNOWN"),
    borrower_id: Optional[str] = Form("BORROWER_UNKNOWN"),
    language: Optional[str] = Form("en")
):
    """
    Main audio processing pipeline:
    1. Validate format & save temp file
    2. Extract local DSP features (RMS, pYIN pitch, pauses, spectral)
    3. Run Faster-Whisper local transcription with timestamps
    4. Run Timestamp Alignment Engine (interval overlap & context windows)
    5. Run Contextual AI Analyzer
    6. Calculate evidence-based cumulative risk score
    """
    allowed_exts = [".wav", ".mp3", ".ogg", ".flac"]
    ext = os.path.splitext(audio_file.filename)[1].lower()
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported audio format '{ext}'. Allowed: {', '.join(allowed_exts)}"
        )

    # Save to temp file for processing
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, f"rca_upload_{os.urandom(8).hex()}{ext}")

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)

        # 1. Load audio preserving stereo channels
        audio_data, sr, channels = load_audio_preserve_channels(
            temp_path, 
            target_sr=settings.TARGET_SAMPLE_RATE
        )

        # 2. Local DSP Analysis
        dsp_results = dsp_analyzer.analyze(audio_data, sample_rate=sr)

        # 3. Local Faster-Whisper Transcription
        transcript_segments = transcriber_instance.transcribe(
            temp_path, 
            language=language
        )

        # 4. Mathematical Interval-Overlap Timestamp Alignment
        aligned_data = alignment_engine.align(
            transcript=transcript_segments,
            audio_events=dsp_results.get("audio_events", [])
        )

        # 5. Multimodal Contextual AI Analysis
        ai_assessment = ai_analyzer.analyze(
            transcript=transcript_segments,
            aligned_data=aligned_data,
            dsp_summary=dsp_results
        )

        # 6. Cumulative Evidence-Based Risk Scoring
        risk_verdict = risk_scorer.calculate_risk(
            flagged_segments=ai_assessment.get("flagged_segments", []),
            audio_events=dsp_results.get("audio_events", []),
            dsp_summary=dsp_results
        )

        # Metrics calculation
        agent_talk_time = sum(
            s["end_time"] - s["start_time"] 
            for s in transcript_segments 
            if "SPEAKER_1" in s.get("speaker", "") or "AGENT" in s.get("speaker", "")
        )
        borrower_talk_time = sum(
            s["end_time"] - s["start_time"] 
            for s in transcript_segments 
            if "SPEAKER_2" in s.get("speaker", "") or "BORROWER" in s.get("speaker", "")
        )
        total_pause_dur = sum(
            e.get("duration", 0) 
            for e in dsp_results.get("audio_events", []) 
            if e["event_type"] == "long_pause"
        )

        return {
            "call_id": call_id or f"CALL-{os.urandom(4).hex()}",
            "agent_id": agent_id,
            "borrower_id": borrower_id,
            "audio_duration": dsp_results.get("audio_duration", 0),
            "sample_rate": sr,
            "channels": channels,
            "call_summary": ai_assessment.get("overall_summary", ""),
            "risk_assessment": risk_verdict,
            "transcript": transcript_segments,
            "audio_events": dsp_results.get("audio_events", []),
            "flagged_segments": ai_assessment.get("flagged_segments", []),
            "pause_associations": aligned_data.get("pause_associations", []),
            "baseline_features": dsp_results.get("baseline_features", {}),
            "metrics": {
                "talk_time_agent_sec": round(float(agent_talk_time), 1),
                "talk_time_borrower_sec": round(float(borrower_talk_time), 1),
                "silence_duration_sec": round(float(total_pause_dur), 1),
                "total_pauses_count": len([e for e in dsp_results.get("audio_events", []) if e["event_type"] == "long_pause"])
            },
            "review_notes": ai_assessment.get("review_notes", [])
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Audio processing failure: {str(e)}")

    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
