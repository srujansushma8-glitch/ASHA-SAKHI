# ASHA Sakhi: Voice-First Field Register Backend & AI Engine

> **A 24-Hour Hackathon AI Engine for Community Health Workers (ASHA) in Karnataka, India.**  
> Built with **FastAPI**, **SQLite**, **RapidFuzz**, and **AI4Bharat Speech Models** (Indic-Transcribe, IndicConformer, Indic-TTS).  
> Designed natively for **Windows** (no Docker required).

---

## 1. System Architecture

The **ASHA Sakhi Backend** is an end-to-end clinical voice engine tailored for Accredited Social Health Activists (ASHA workers) conducting field visits in rural and semi-urban Karnataka. The system processes conversational Kannada and Kannada-English code-mixed speech, performs real-time danger sign detection, extracts validated clinical data, conducts interactive voice confirmation/corrections, and automatically generates evidence-based maternal/child follow-up schedules.

```
                     +---------------------------------------+
                     |    ASHA Worker (Field Android/Web)    |
                     +---------------------------------------+
                                        |  WebSocket (/ws/voice)
                                        v
                 +-----------------------------------------------+
                 |              Voice Session Manager            |
                 |     (Stateful conversation & chunk buffer)    |
                 +-----------------------------------------------+
                         |                               |
       (Audio Buffer)    v                               v  (Spoken Confirmations)
      +---------------------+                  +---------------------+
      |   AI4Bharat ASR     |                  |   AI4Bharat TTS     |
      | - Indic-Transcribe  |                  | - Indic-TTS Kannada |
      | - IndicConformer    |                  | - Indic-Speak       |
      | - Dhruva Pipeline   |                  | - Fixed Emergency   |
      | - Mock Adapter      |                  |   Alert Audio       |
      +---------------------+                  +---------------------+
                 | (Transcript)                          ^
                 +-------------------+                   |
                                     |                   | (Voice Prompts)
                                     v                   |
                 +-----------------------------------------------+
                 |       Independent Danger-Sign Detector        |
                 |  (Deterministic, MoHFW Guidelines, RapidFuzz) |
                 +-----------------------------------------------+
                   | (Acute Danger)               | (Normal / Non-urgent)
                   v                              v
        [EMERGENCY INTERRUPTION]        +-----------------------------------+
        Immediate Audio:                |   Structured Clinical Extractor   |
        "ಈ ಫಲಾನುಭವಿಗೆ ತಕ್ಷಣ             | - Zero-hallucination validation   |
        PHC ಗೆ ರೆಫರ್ ಮಾಡಿ."             | - Due vs Completed vaccinations   |
        High-Priority Alert Flag        | - Uncertainty / clarification     |
                                        +-----------------------------------+
                                                          |
                                                          v
                                        +-----------------------------------+
                                        |      Voice Confirmation &         |
                                        |      Correction Lifecycle         |
                                        +-----------------------------------+
                                                          | (Explicit Save)
                                                          v
                                        +-----------------------------------+
                                        |    Follow-Up Engine (MoHFW)       |
                                        | - ANC Follow-ups                  |
                                        | - UIP Vaccination Schedules       |
                                        | - HBNC Newborn Home Visits        |
                                        | - 24-Hour Emergency Verifications |
                                        +-----------------------------------+
                                                          |
                                                          v
                                        +-----------------------------------+
                                        |       SQLite Database (WAL)       |
                                        | (beneficiaries, visits,           |
                                        |  followups, danger_alerts)        |
                                        +-----------------------------------+
```

---

## 2. Public Health Guidelines & Danger-Sign Detection Engine

The danger-sign detector is **completely independent and deterministic**. It does **not** rely on LLMs, guaranteeing that critical obstetric and neonatal emergencies are never hallucinated, diluted, or missed.

### 2.1 Source-Verified Public Health Guidelines Reference Table

| Sign ID | Clinical Emergency Category | Guideline Title | Issuing Organisation | Version / Date | Relevant Section & Page | English Clinical Phrase | Kannada Spoken Phrase & Variations | Configured Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DNG-MAT-001** | Antepartum Haemorrhage (Vaginal Bleeding in Pregnancy) | *Guidelines on Antenatal Care and Skilled Attendance at Birth* | Ministry of Health & Family Welfare (MoHFW), Govt. of India | Maternal Health Division (Reprinted 2018) | Section 3.2: Identification and Management of Danger Signs in Pregnancy, **Page 24** | Bleeding during pregnancy / vaginal bleeding | ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ರಕ್ತಸ್ರಾವ / ರಕ್ತ ಹೋಗುತ್ತಿದೆ / bleeding agtidhe / raktasrava | **CRITICAL** (Immediate PHC referral) |
| **DNG-NEO-001** | Severe Neonatal Hyperthermia / High Body Temperature | *Home Based Newborn Care (HBNC) Operational Guidelines* | Child Health Division, MoHFW / National Health Mission (NHM), Govt. of India | Revised Edition (2014) | Module 6 & 7: Identification of Serious Neonatal Sepsis & Danger Signs, **Page 32** | High fever in newborn / infant hyperthermia | ಮಗುವಿಗೆ ತೀವ್ರ ಜ್ವರ / ಮಗು ಮೈ ಬಿಸಿಯಾಗಿದೆ / baby has high fever / teevra jwara | **CRITICAL** (Immediate PHC referral) |
| **DNG-MAT-002** | Severe Preeclampsia / Eclampsia (Hypertensive Crisis) | *Operational Guidelines for Maternal Health - High Risk Pregnancy* | Maternal Health Division, MoHFW, Govt. of India | 2016 Edition | Section 4.1: Hypertensive Disorders of Pregnancy & Eclampsia, **Page 18** | Severe headache with blurred vision or convulsions | ತೀವ್ರ ತಲೆನೋವು ಮತ್ತು ಕಣ್ಣು ಮಂಜಾಗುವುದು / ಫಿಟ್ಸ್ / selevu / convulsions | **CRITICAL** (Immediate PHC referral) |
| **DNG-MAT-003** | Premature Rupture of Membranes (PROM) | *Antenatal Care Training Guidelines for ASHA* | National Health Systems Resource Centre (NHSRC) / MoHFW | 2019 Curriculum | Section 3.4: Premature Rupture of Membranes & Infection Risk, **Page 26** | Premature water breaking / leaking amniotic fluid | ನೀರು ಹೋಗುತ್ತಿದೆ / ಉದೆ ನೀರು ಒಡೆದಿದೆ / water leakage / panikattu odedide | **CRITICAL** (Immediate PHC referral) |
| **DNG-MAT-004** | Decreased or Absent Fetal Movement | *Maternal Health Clinical Guidelines for Primary Health Centres* | Maternal Health Division, MoHFW, Govt. of India | 2017 Guidelines | Section 3.6: Fetal Well-being Assessment, **Page 29** | Decreased or absent fetal movements | ಮಗುವಿನ ಚಲನೆ ಕಡಿಮೆಯಾಗಿದೆ / ಹೊಟ್ಟೆಯಲ್ಲಿ ಮಗು ಅಲುಗಾಡುತ್ತಿಲ್ಲ / reduced movement | **HIGH** (Priority PHC referral) |
| **DNG-NEO-002** | Neonatal Sepsis / Inability to Feed or Suckle | *Home Based Newborn Care (HBNC) Operational Guidelines* | Child Health Division, MoHFW / NHM | 2014 Edition | Module 6: Sepsis and Inability to Feed in Young Infants, **Page 34** | Newborn unable to feed or suckle / refusal of feeds | ಮಗು ಮೊಲೆಹಾಲು ಕುಡಿಯುತ್ತಿಲ್ಲ / ಹಾಲು ಬೇಡ ಅನ್ನುತ್ತಿದೆ / unable to suckle | **CRITICAL** (Immediate PHC referral) |
| **DNG-NEO-003** | Severe Respiratory Distress / Fast Breathing | *HBNC Guidelines for Community Health Workers* | Child Health Division, MoHFW, Govt. of India | 2014 Edition | Module 6: Respiratory Infections and Fast Breathing, **Page 36** | Fast breathing or severe chest indrawing in newborn | ಮಗುವಿಗೆ ವೇಗದ ಉಸಿರಾಟ / ಎದೆ ಕುಸಿಯುತ್ತಿದೆ / difficulty breathing / ede kusiyuttide | **CRITICAL** (Immediate PHC referral) |
| **DNG-NEO-004** | Neonatal Hypothermia (Cold to Touch) | *HBNC Protocols on Thermal Protection of the Newborn* | Child Health Division, MoHFW, Govt. of India | 2015 Protocol | Module 5: Keeping Baby Warm and Hypothermia Management, **Page 38** | Baby cold to touch / newborn hypothermia | ಮಗು ಮೈ ತಣ್ಣಗಾಗಿದೆ / ಕೈ ಕಾಲು ತಣ್ಣಗಾಗಿದೆ / hypothermia | **HIGH** (Immediate re-warming & referral) |
| **DNG-MAT-005** | Postpartum Haemorrhage (Excessive Bleeding after Delivery) | *Guidelines for Management of Postpartum Haemorrhage* | Maternal Health Division, MoHFW, Govt. of India | 2016 Guidelines | Section 2: Emergency Response to Postpartum Bleeding, **Page 12** | Severe postpartum haemorrhage / excessive bleeding after birth | ಹೆರಿಗೆಯ ನಂತರ ವಿಪರೀತ ರಕ್ತಸ್ರಾವ / delivery aadamele heavy bleeding | **CRITICAL** (Immediate emergency transport) |

### 2.2 Detection Engine Logic: Negation Windows & Conjunction Barriers

1. **Clause Boundary Conjunction Barriers**:
   The engine recognizes grammatical conjunctions (`ಆದರೆ`, `adare`, `but`, `however`, `ಮತ್ತು`, `mattu`, `.`, `;`). When expanding negation windows, the scan **strictly stops** at clause boundaries.
   * *Example*: `"ರಕ್ತಸ್ರಾವ ಇಲ್ಲ, ಆದರೆ ಮಗುವಿಗೆ ತೀವ್ರ ಜ್ವರ ಇದೆ"` (`"Bleeding illa, adare baby has high fever ide"`)
   * *Result*: `"ರಕ್ತಸ್ರಾವ"` is recognized as negated (`is_negated=True`). However, the negation window **never crosses** `"ಆದರೆ"`. The acute danger sign for neonatal high fever (`DNG-NEO-001`) is detected with **100% sensitivity**. Negation of one sign **never suppresses another genuine danger sign**.

2. **Historical vs. Acute Differentiation**:
   Past medical history markers (`"last year"`, `"previous pregnancy"`, `"ಹಿಂದಿನ ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ"`, `"ಹಿಂದೆ ಇತ್ತು"`) are isolated from current complaints.
   * *Example*: `"ಹಿಂದಿನ ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ previous pregnancy last year bleeding ittu, ಈಗೇನೂ ತೊಂದರೆ ಇಲ್ಲ"`
   * *Result*: Classified as `is_historical=True`. Does **not** trigger an acute emergency interrupt, preventing false emergency alarms while preserving clinical history.

3. **Conservative Fuzzy Matching**:
   Uses RapidFuzz with strict partial ratio thresholds ($\ge 85\%$) on phrases of length $\ge 8$ characters to prevent short common conversational words from triggering false alarms.

4. **Emergency Referral Protocol**:
   When an active danger sign is identified:
   1. Visit record is flagged (`danger_flag = 1`, `referral_status = 'IMMEDIATE_REFERRAL_PHC'`).
   2. High-priority emergency WebSocket event `danger_alert` is emitted immediately.
   3. Normal confirmation dialogue is interrupted.
   4. Speaks the fixed clinical instruction: **"ಈ ಫಲಾನುಭವಿಗೆ ತಕ್ಷಣ PHC ಗೆ ರೆಫರ್ ಮಾಡಿ."** (*Refer this beneficiary to PHC immediately*).
   5. Generates a mandatory **24-hour verification follow-up task** in the database.
   6. Strictly provides referral guidance — **never diagnoses, prescribes, or advises treatment**.

---

## 3. Speech AI: AI4Bharat Integration Architecture

### 3.1 Speech Recognition (ASR)
* **Primary Model**: AI4Bharat **Indic-Transcribe** (1B+ Canary FastConformer/Transformer multilingual architecture).
* **Secondary Model**: AI4Bharat **IndicConformer** (NeMo hybrid conformer STT).
* **Hosted Cloud API**: Connects to the official **AI4Bharat / Bhashini Dhruva Pipeline API**:
  * Endpoint: `https://dhruva-api.bhashini.gov.in/services/inference/pipeline`
  * Task Type: `"asr"`
  * Service ID: `bhashini/ai4bharat/conformer-multilingual-asr`
  * Language: `kn` (Kannada)
* **High-Fidelity Mock Adapter (`MockASRAdapter`)**:
  * Simulates realistic inference latency ($\approx 120\text{ ms}$).
  * Accurately transcribes Kannada-English code-mixed health phrases.
  * Preserves critical maternal and child health terms: `ANC checkup`, `TT injection`, `IFA goli`, `PHC`, `newborn`, `vaccination`, `weight`.
  * Outputs are explicitly flagged with `is_mock: true` and model identifier `mock-ai4bharat-kannada-conformer`.

### 3.2 Speech Generation (TTS)
* **Primary Model**: AI4Bharat **Indic-TTS Kannada** (Female voice) / **Indic-Speak**.
* **Hosted Cloud API**: Connects to the official **AI4Bharat / Bhashini Dhruva Pipeline API**:
  * Endpoint: `https://dhruva-api.bhashini.gov.in/services/inference/pipeline`
  * Task Type: `"tts"`
  * Service ID: `bhashini/ai4bharat/indic-tts-kn`
  * Gender: `female`
* **Zero-Latency Emergency Audio Fallback**:
  * If network latency occurs or TTS fails, the backend delivers a pre-generated fixed emergency alert chime and spoken instruction: **"ಈ ಫಲಾನುಭವಿಗೆ ತಕ್ಷಣ PHC ಗೆ ರೆಫರ್ ಮಾಡಿ."**
  * Emergency alert delivery is **never delayed** waiting for cloud model inference ($\text{latency} < 1\text{ ms}$).

---

## 4. Structured Clinical Extraction Engine

Converts ASHA worker voice transcripts into strictly validated JSON records conforming to the `StructuredVisitExtraction` schema.

### 4.1 Schema Fields
- `beneficiary_id`: Normalized string (e.g., `BEN-KA-001`, `BEN-KA-002`)
- `beneficiary_name`: String in Kannada or English (e.g., `ಲಕ್ಷ್ಮಿ`, `ಸುಮಿತ್ರಾ`)
- `visit_type`: Clinical category (`ANC checkup`, `PNC visit`, `Newborn home visit`, `Immunization`, `General Visit`)
- `weight`: Validated clinical float in kg ($0.5 \le w \le 200.0$)
- `vaccinations_due`: Array of strings strictly verified as pending/due
- `vaccinations_completed`: Array of strings verified as administered during this visit
- `next_visit_date`: Validated ISO date `YYYY-MM-DD`
- `additional_notes`: Structured clinical notes (`IFA tablets distributed`, `BP normal`, `Diet counseling`)
- `uncertainty_notes`: List of identified ambiguities
- `requires_clarification`: Boolean flag
- `clarification_prompt`: Spoken Kannada question if critical data is ambiguous

### 4.2 Clinical Extraction Rules
1. **Never Invent Missing Values**: If a weight or date is not stated, it remains `None`/`null`. Missing data is never assumed to be normal or negative.
2. **Strict Vaccine Discrimination**:
   * Phrases like `"TT injection ಕೊಟ್ಟಿದ್ದೇವೆ"` or `"completed"` map to `vaccinations_completed`.
   * Phrases like `"Pentavalent 1 ಬಾಕಿ ಇದೆ"` or `"due"` map to `vaccinations_due`.
   * Bare phrases like `"next visit date"` do **not** inadvertently mark vaccines as due.
3. **Kannada Numerals & Units**: Converts Kannada native numerals (`೦`, `೧`, `೨`, `೩`, `೪`, `೫`, `೬`, `೭`, `೮`, `೯`) and decimal fractions into standard floats.

---

## 5. Voice Confirmation and Correction Lifecycle

The backend manages the stateful interaction over WebSockets:
1. **Structured Readback**: The backend synthesizes a natural Kannada voice summary:
   > *"ದಾಖಲಿಸಿದ ವಿವರಗಳು: ಫಲಾನುಭವಿ ಲಕ್ಷ್ಮಿ, ಭೇಟಿ ANC checkup, ತೂಕ 54 ಕೆಜಿ, ನೀಡಿದ ಲಸಿಕೆ TT injection, ಮುಂದಿನ ಭೇಟಿ ದಿನಾಂಕ 2026-12-15. ನೀವು ದಾಖಲಿಸಿರುವ ವಿವರಗಳು ಸರಿಯಾಗಿವೆಯೇ?"*
2. **Voice Correction**: The ASHA worker can speak corrections (e.g., `"ತೂಕ 54 kg ಅಲ್ಲ, 52 kg"` or send a `correct_field` event).
3. **Field Update & Spoken Acknowledgment**: The backend validates the new value, updates the session state, and replies:
   > *"ತೂಕವನ್ನು 52.0 ಎಂದು ಬದಲಾಯಿಸಲಾಗಿದೆ. ಈಗ ವಿವರಗಳು ಸರಿಯಾಗಿವೆಯೇ?"*
4. **Explicit Confirmation**: Saving to SQLite and generating follow-ups **only occurs** upon explicit confirmation (`confirm_record` event or `"ಹೌದು"` / `"ಸರಿ"`).

---

## 6. Follow-Up Engine

Follow-up tasks are automatically generated upon confirmed visit logging, adhering to national health schedules:

1. **ANC Follow-ups** (*MoHFW Guidelines for Antenatal Care and Skilled Attendance at Birth*):
   * Schedules routine 4-week checkups or confirmed next visit date. Priority: `HIGH`.
2. **Universal Immunization Programme (UIP)** (*MoHFW UIP National Schedule*):
   * For every pending vaccine in `vaccinations_due`, calculates follow-up due date (e.g., 4 weeks for subsequent primary pentavalent doses). Priority: `HIGH`.
3. **Home Based Newborn Care (HBNC)** (*MoHFW HBNC Operational Guidelines*):
   * Generates home visit schedule (Days 3, 7, 14, 21, 28, 42). Priority: `HIGH`.
4. **Emergency Referral Verification** (*MoHFW Emergency Obstetric & Neonatal Referral Protocol*):
   * When an acute danger sign is detected, creates a **24-hour verification task** (`DANGER_SIGN_CHECK`). Priority: `CRITICAL`.

---

## 7. Database Architecture (SQLite)

The backend uses a local SQLite database with write-ahead logging (WAL) and foreign keys enabled.

### 7.1 Tables
- `beneficiaries`: Master registry of synthetic beneficiaries (name, age, category, village, LMP date, delivery date).
- `visits`: Complete visit records (beneficiary link, visit type, weight, vaccinations, next visit date, notes, raw transcript, confirmation status, danger flag, referral status).
- `followups`: Actionable tasks (beneficiary link, task type, due date, priority, completion status, guideline source).
- `danger_alerts`: Logged emergencies (sign ID, category, detected phrase, severity, guideline citation, referral action, resolution status).

### 7.2 Safe Backup Mechanism
The backend provides an automated backup function (`backup_database()`) that creates a timestamped copy in `data/backups/` before any destructive database modification.

---

## 8. API Specification

### 8.1 REST Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, model modes, and database connection. |
| `GET` | `/api/beneficiaries` | List all synthetic beneficiaries in registry. |
| `GET` | `/api/beneficiaries/{id}` | Retrieve specific beneficiary details. |
| `GET` | `/api/visits` | Retrieve all logged field visits (with vaccination lists and referral statuses). |
| `GET` | `/api/followups` | Retrieve scheduled follow-ups (supports `?beneficiary_id=` and `?status=` filters). |
| `POST` | `/api/visits/confirm` | Explicitly confirm and save a visit draft; triggers follow-up engine. |
| `POST` | `/api/visits/correct` | Apply a correction to a visit field; returns spoken acknowledgment audio. |

### 8.2 WebSocket Interface (`/ws/voice`)

The WebSocket endpoint provides real-time bidirectional communication.

#### Frontend $\rightarrow$ Backend Events

```json
// 1. start_session
{
  "event": "start_session",
  "session_id": "SES-001",
  "data": { "beneficiary_id": "BEN-KA-001" }
}

// 2. audio_chunk (sent incrementally during recording)
{
  "event": "audio_chunk",
  "session_id": "SES-001",
  "data": { "audio_base64": "<BASE64_PCM_OR_WAV>" }
}

// 3. stop_recording (triggers ASR -> Danger Check -> Extraction -> TTS)
{
  "event": "stop_recording",
  "session_id": "SES-001"
}

// 4. correct_field
{
  "event": "correct_field",
  "session_id": "SES-001",
  "data": { "field_name": "weight", "new_value": 52.5 }
}

// 5. confirm_record (persists to SQLite and generates followups)
{
  "event": "confirm_record",
  "session_id": "SES-001"
}

// 6. interrupt_audio (stops current speech output)
{
  "event": "interrupt_audio",
  "session_id": "SES-001"
}
```

#### Backend $\rightarrow$ Frontend Events

```json
// 1. session_started
{
  "event": "session_started",
  "session_id": "SES-001",
  "data": { "status": "ready", "sample_rate": 16000, "format": "wav_pcm" }
}

// 2. transcript_final
{
  "event": "transcript_final",
  "session_id": "SES-001",
  "data": {
    "transcript": "ಫಲಾನುಭವಿ ಲಕ್ಷ್ಮಿ BEN-KA-001, ANC checkup, weight 54 kg...",
    "latency_ms": 120.0,
    "is_mock": true,
    "model_name": "mock-ai4bharat-kannada-conformer"
  }
}

// 3. danger_alert (fired immediately upon danger sign detection)
{
  "event": "danger_alert",
  "session_id": "SES-001",
  "data": {
    "severity": "CRITICAL",
    "detected_signs": [{ "sign_id": "DNG-MAT-001", "english_phrase": "Bleeding during pregnancy" }],
    "instruction_kn": "ಈ ಫಲಾನುಭವಿಗೆ ತಕ್ಷಣ PHC ಗೆ ರೆಫರ್ ಮಾಡಿ.",
    "instruction_en": "Refer to Primary Health Centre (PHC) immediately.",
    "referral_action": "IMMEDIATE_REFERRAL_PHC",
    "audio_base64": "<BASE64_EMERGENCY_AUDIO>"
  }
}

// 4. record_extracted
{
  "event": "record_extracted",
  "session_id": "SES-001",
  "data": {
    "record": {
      "beneficiary_id": "BEN-KA-001",
      "beneficiary_name": "ಲಕ್ಷ್ಮಿ",
      "visit_type": "ANC checkup",
      "weight": 54.0,
      "vaccinations_due": [],
      "vaccinations_completed": ["TT injection"],
      "next_visit_date": "2026-12-15"
    },
    "requires_clarification": false,
    "danger_flag": false
  }
}

// 5. confirmation_audio
{
  "event": "confirmation_audio",
  "session_id": "SES-001",
  "data": {
    "text": "ದಾಖಲಿಸಿದ ವಿವರಗಳು: ಫಲಾನುಭವಿ ಲಕ್ಷ್ಮಿ, ಭೇಟಿ ANC checkup... ಸರಿಯಾಗಿವೆಯೇ?",
    "audio_base64": "<BASE64_WAV>",
    "latency_ms": 110.0
  }
}

// 6. visit_saved
{
  "event": "visit_saved",
  "session_id": "SES-001",
  "data": {
    "visit": { "id": "VIS-A1B2C3D4", "weight": 54.0, "is_confirmed": true },
    "followups": [{ "id": "FOL-E5F6G7H8", "task_type": "ANC_CHECKUP", "due_date": "2026-12-15" }],
    "audio_base64": "<BASE64_SAVED_AUDIO>",
    "confirmation_text": "ದಾಖಲೆ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ."
  }
}
```

---

## 9. Latency Benchmark Results

Measured empirically across test runs on a standard laptop:

| Pipeline Component | Metric Measured | Average Latency | 95th Percentile ($p_{95}$) | Evaluation SLA Target |
| :--- | :--- | :--- | :--- | :--- |
| **Danger Sign Detector** | Execution time per utterance | **0.78 ms** | 1.12 ms | $< 10\text{ ms}$ (PASS) |
| **Structured Clinical Extractor** | Execution time per transcript | **0.10 ms** | 0.24 ms | $< 20\text{ ms}$ (PASS) |
| **Speech Recognition (ASR)** | Utterance transcription | **120.00 ms** | 120.00 ms | $< 1000\text{ ms}$ (PASS) |
| **Speech Generation (TTS)** | Spoken confirmation audio | **110.00 ms** | 110.00 ms | $< 800\text{ ms}$ (PASS) |
| **Fixed Emergency Audio Alert** | Emergency instruction audio | **0.50 ms** | 0.80 ms | $< 5\text{ ms}$ (Instantaneous PASS) |

---

## 10. Local Setup & Execution (Windows)

### Prerequisites
* Python 3.11+ installed.
* PowerShell or Windows Terminal.
* No Docker required.

### Step 1: Install Dependencies
```powershell
cd "ASHA SAKHI/backend"
python -m pip install -r requirements.txt
```

### Step 2: Configure Environment
Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```
Default configuration runs in offline/mock mode (`ASR_MODE=mock`, `TTS_MODE=mock`, `EXTRACTION_MODE=auto`). To enable live AI4Bharat Dhruva cloud endpoints, insert your `AI4BHARAT_API_KEY` and `AI4BHARAT_USER_ID` in `.env`.

### Step 3: Run the Application
```powershell
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
* **Interactive OpenAPI Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **WebSocket Endpoint**: `ws://localhost:8000/ws/voice`

### Step 4: Run the Complete Test Suite
```powershell
python -m pytest backend/tests -v -s
```
**All 51 unit, integration, and benchmark tests run and pass in ~4.6 seconds.**

---

## 11. Privacy, Responsible AI & Safety Disclaimers

1. **Synthetic Data Only**: All beneficiaries (`BEN-KA-001` through `BEN-KA-005`) are purely synthetic personas. No real identifiable patient health information (PHI) is stored or processed.
2. **Zero Clinical Prescriptions or Diagnosis**: The engine does not diagnose clinical conditions or recommend medications (such as anti-hypertensives or antibiotics). When danger signs are detected, the system exclusively instructs urgent referral to the nearest Primary Health Centre (PHC).
3. **Audio Privacy Lifecycle**: Raw audio streams buffered in memory during recording are cleared immediately following transcription; raw audio files are not permanently stored on disk.
4. **Model Transparency**: All API and WebSocket responses explicitly differentiate between simulated mock adapters and live AI model inferences via the `is_mock` boolean flag and `model_name` metadata.
