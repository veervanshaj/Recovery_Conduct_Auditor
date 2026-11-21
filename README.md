# Recovery-Conduct Auditor
### AI-Powered Recovery Call Analysis and Compliance Monitoring Platform

**Recovery-Conduct Auditor** is an enterprise-grade RegTech platform designed for banks, NBFCs, and financial institutions to monitor, audit, and investigate debt recovery phone calls for compliance with fair lending codes and statutory guidelines (e.g., RBI Fair Practices Code for Lenders and IBA Code of Conduct for Direct Recovery Agents).

Rather than functioning as a generic chatbot or making arbitrary accusations, the system operates as an **evidence-based compliance intelligence suite** combining:
1. **Local Digital Signal Processing (DSP)**: Windowed RMS energy dynamics, fundamental pitch ($F_0$) tracking via pYIN, and millisecond-accurate silence/pause detection using Librosa, SciPy, and NumPy.
2. **Local Speech-to-Text (STT)**: Pretrained Faster-Whisper model executing locally with segment and word-level timestamps.
3. **Mathematical Timestamp Alignment Engine**: Interval-overlap temporal intersection matching acoustic events with transcript utterances and constructing $\pm 8\text{s}$ contextual windows.
4. **Contextual AI Language Analysis**: Evaluates whether demanding language combined with sudden vocal surges (high loudness + elevated pitch) represents potential intimidation or third-party threats (e.g., contacting employers/HR or family).
5. **Call Pattern & Metadata Rules Engine**: Audits telephony CSV logs against statutory calling hours (08:00 AM to 07:00 PM) and daily contact frequency limits.
6. **RegTech Compliance Dashboard & Forensic Player**: Multi-track synchronized canvas timeline, interactive audio player, human audit workflow, and printable compliance audit reports.

---

## Technical Architecture

```
                                    +-------------------------+
                                    |    Compliance Officer   |
                                    |     Web Browser UI      |
                                    +------------+------------+
                                                 |
                                    REST API / Audio Stream
                                                 v
                       +---------------------------------------------------+
                       |           Node.js / Express Backend (5000)        |
                       |  - Upload Validation & Audio Storage              |
                       |  - Mongoose ODM & MongoDB Persistence             |
                       |  - Human Compliance Workflow & Audit Trails       |
                       |  - Call Pattern CSV Ingestion & Rules Engine      |
                       +-------------------------+-------------------------+
                                                 |
                                    Internal Proxy / Multipart
                                                 v
                       +---------------------------------------------------+
                       |        Python FastAPI Audio AI Service (8000)     |
                       |                                                   |
                       |  1. DSP Engine (Librosa, SciPy, NumPy)            |
                       |     - Short-time RMS loudness dynamics (> +6dB)   |
                       |     - Fundamental pitch (pYIN/YIN F0 deviation)   |
                       |     - Silence & significant pause detector (>2.5s)|
                       |     - Spectral flux / Voice activity detection    |
                       |                                                   |
                       |  2. Speech-to-Text (Faster-Whisper Local)         |
                       |     - Utterance & word-level timestamps           |
                       |     - Channel-based / Diarized speaker labels     |
                       |                                                   |
                       |  3. Timestamp Alignment Engine                    |
                       |     - Interval-overlap matching (IOU)             |
                       |     - Pre/post context window builder (±8s)       |
                       |     - Pause-anchored conversational linking       |
                       |                                                   |
                       |  4. Contextual AI Analyzer                        |
                       |     - Multimodal evidence synthesis               |
                       |     - Grounded explanation (Language + Audio)     |
                       |     - Guardrail: no audio fabrication             |
                       |                                                   |
                       |  5. Evidence-Based Cumulative Risk Scorer         |
                       |     - Low Concern / Medium / High Priority Review |
                       +---------------------------------------------------+
```

---

## Core Capabilities

### 1. Local Digital Signal Processing (DSP)
- **Loudness Analysis**: Computes short-time RMS energy over overlapping 0.5s–1.0s sliding windows ($0.25\text{s}$ hop). Measures dB surges relative to the speaker's vocal baseline ($> +6\text{ dB}$ or $> 2.4\times$ baseline).
- **Pitch Estimation**: Tracks $F_0$ fundamental frequency contour via `librosa.yin` / `librosa.pyin`. Identifies sudden vocal jumps ($> 4$ semitones) without assuming high pitch alone proves anger.
- **Pause & Silence Detection**: Accurately extracts conversational pauses $> 2.5\text{s}$ and tags duress pauses ($> 6\text{s}$) following intimidation attempts.
- **Stereo Channel Preservation**: Preserves stereo participant channels where available, avoiding destructive mono downmixing.

### 2. Local Faster-Whisper Speech-to-Text
- Transcribes recordings locally without paid third-party APIs using Faster-Whisper (quantized CTranslate2 `base` / `small` model).
- Outputs timestamped segments and word-level timestamps.
- Supports English and multilingual recognition (including Hindi).

### 3. Timestamp Alignment Engine
- Formulates mathematical interval overlap:
  $$\text{Overlap} = \max(0, \min(t_{\text{end, transcript}}, t_{\text{end, audio}}) - \max(t_{\text{start, transcript}}, t_{\text{start, audio}}))$$
- Correlates acoustic loudness surges and pitch elevations directly with the spoken phrase.
- Extracts surrounding $\pm 8\text{s}$ dialogue windows to evaluate the context preceding and following every suspicious event.
- Associates pauses with the preceding statement and subsequent borrower response.

### 4. Multimodal Contextual AI Language Analysis
- Synthesizes transcript text, acoustic observations, speaker attribution, and pauses.
- **Strict Guardrail**: The AI analyzer is constrained to measured DSP outputs and cannot hallucinate audio features.
- Flags statutory violation categories:
  - `third_party_threat_employer_family` (Critical)
  - `potential_intimidation` (High)
  - `abusive_language` (High)
  - `prohibited_calling_hour` (High)
  - `unreasonable_pressure_tactic` (Medium)
- Operates with Gemini API (`GEMINI_API_KEY`) or transparent local deterministic compliance rules engine when no API key is configured.

### 5. Call Pattern & Compliance Rules Engine
- Ingests synthetic CSV telephony logs (`borrower_id`, `agent_id`, `phone_number`, `call_datetime`, `call_duration`, `call_status`).
- Evaluates against configurable statutory thresholds:
  - **Permitted Calling Hours**: 08:00 AM – 07:00 PM (RBI Section 4.2).
  - **Daily Contact Frequency**: Maximum 3 calls per borrower per calendar day.
  - **Repetition Cooldown**: Minimum 120-minute interval between consecutive attempts.
  - **Agent Risk Concentration**: Identifies agents with repeated pattern violations.

### 6. Interactive RegTech Dashboard & Forensic Player
- **Multi-Track Timeline**: Canvas-rendered tracks for Speech Utterances, RMS Loudness, Pitch ($F_0$), Pauses, and Conduct Flags with synchronized playhead cursor.
- **Click-to-Seek**: Clicking any event seeks audio playback, highlights the transcript utterance, and displays full DSP measurements and contextual reasoning in the Inspector.
- **Human Review Sign-off**: Record auditor notes and update case status (`Pending Review`, `Under Investigation`, `Escalated`, `Cleared`).
- **Downloadable/Printable Audit Dossier**: Printable compliance audit report with executive summary, acoustic summary, and human sign-off section.

---

## Preloaded Demonstration Scenarios

The system includes three preloaded benchmark scenarios with playable synthetic WAV audio:

1. **Scenario 1: Compliant Recovery Interaction (Low Concern)**
   - Agent politely identifies herself, inquires about overdue personal loan EMI, and agrees to a 48-hour follow-up after the borrower explains a salary delay.
   - Nominal vocal energy, no threats, 1 natural pause. Risk Score: **12 / 100 (Low Concern)**.

2. **Scenario 2: Severe Intimidation & Employer Threat (High Priority Review)**
   - Borrower explains a family medical emergency.
   - Agent shouts (*+8.4 dB surge, pitch jump to 286 Hz*) and explicitly threatens to contact the borrower's office reception and HR department at 3 PM.
   - Followed by a **7.8-second duress pause** before the frightened borrower pleads not to involve his employer.
   - Risk Score: **88 / 100 (High Priority Review)**.

3. **Scenario 3: Repeated Calling & Early Hours Violation (High Priority Review)**
   - Telephony log reveals 6 calls placed within 8 hours to the same borrower, starting before permitted statutory hours at **07:15 AM** (and 06:45 AM).
   - Dialogue corroborates borrower disruption and aggressive repetition.
   - Risk Score: **76 / 100 (High Priority Review)**.

---

## Quickstart & Setup Guide

### Prerequisites
- **Node.js** (v18+) and **npm**
- **Python** (v3.10+)
- **MongoDB** running locally on default port `27017`

### 1. Python Audio AI Service Setup
```powershell
# Navigate to python_service
cd python_service

# Install dependencies
pip install -r requirements.txt

# (Optional) Generate the 3 demo audio files
python app/demo/generate_demo_audio.py

# Launch FastAPI service (port 8000)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Node.js Backend Setup
```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start Express backend (port 5000)
npm start
```

### 3. Frontend Setup
```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Launch Vite dev server (port 3000)
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## Environment Variables Configuration

### `backend/.env`
```ini
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/recovery_conduct_auditor
PYTHON_SERVICE_URL=http://127.0.0.1:8000
NODE_ENV=development
```

### `python_service/.env` (Optional)
```ini
PYTHON_SERVICE_HOST=127.0.0.1
PYTHON_SERVICE_PORT=8000
WHISPER_MODEL_SIZE=base
WHISPER_DEVICE=cpu
WHISPER_COMPUTE_TYPE=int8
# Optional LLM API Key (System automatically uses deterministic compliance engine if unset)
GEMINI_API_KEY=
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health & model status |
| `GET` | `/api/dashboard/metrics` | Dashboard KPI metrics & chart data |
| `POST` | `/api/calls/upload` | Upload and analyze WAV/MP3 recording |
| `GET` | `/api/calls` | List audited calls with filters |
| `GET` | `/api/calls/:id` | Full forensic detail for single call |
| `POST` | `/api/calls/:id/review` | Submit human compliance review |
| `GET` | `/api/calls/:id/report` | Export printable compliance audit dossier |
| `POST` | `/api/call-logs/upload` | Ingest CSV telephony logs and audit patterns |
| `GET` | `/api/rules` | Fetch configurable statutory rules |
| `PUT` | `/api/rules/:id` | Update statutory rule parameters |
| `POST` | `/api/demo/seed` | Seed benchmark demo scenarios |

---

## Compliance & Privacy Governance
- Uploaded recordings are processed within the local environment without sending raw audio to public endpoints.
- Audio observations are supporting context for compliance officers and never substitute for human due process.
- All demo data is synthetically generated and clearly labelled.
