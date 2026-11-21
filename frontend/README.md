# ASHA ಧ್ವನಿ ಕ್ಷೇತ್ರ ದಿನಚರಿ | AI4Bharat-Powered Voice Field Register for ASHA Workers

A mobile-first, voice-first application designed for **Accredited Social Health Activists (ASHA)** in Karnataka, India. Enables community health workers to record beneficiary home visits, vitals, vaccinations, and follow-ups in **Kannada (with mixed English medical terms)** without manual typing, powered by **AI4Bharat Indic-Transcribe** and **Indic-Speak**.

---

## 🌟 Key Capabilities

1. **Voice-First Visit Recording**:
   - High-contrast, large touch-friendly microphone interface designed for ordinary Android smartphones.
   - Real-time Web Audio API waveform visualization.
   - Windowed audio chunking (1000ms buffers) matching AI4Bharat Indic-Transcribe batch windowing.
   - Support for partial transcript streaming events and final transcript generation.

2. **Structured Clinical Extraction (8 Core Fields)**:
   - Beneficiary ID & Beneficiary Name
   - Visit Type (ANC, PNC, Immunization, NCD)
   - Weight (kg)
   - Vaccinations Due & Completed
   - Next Visit Date
   - Additional Notes
   - Inline field editing & targeted **Voice Correction** (`correct_field` event).
   - Spoken readback in Kannada (AI4Bharat Indic-Speak) with instant interruption support (`interrupt_audio`).

3. **Prominent Emergency Danger Sign Alerts**:
   - Instant visual red alert (`#DC2626`) triggered when verified danger signs are detected (e.g. severe headache + blurred vision, severe facial/pedal edema, reduced fetal movements).
   - Strict adherence to WHO/NHM guidelines: **Zero diagnosis or treatment recommendations**; displays only detected danger signs, referral status, and clear instruction: **"Refer to PHC now" / "ತಕ್ಷಣ ಸಮೀಪದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಕ್ಕೆ (PHC) ಕರೆದೊಯ್ಯಿರಿ"**.
   - One-tap quick actions: Call 108 Ambulance, Contact PHC Medical Officer, Log Transport.

4. **Ambulance Tracking & Map Interface (Simulation)**:
   - Live interactive route map between the PHC/hospital base and the beneficiary pickup location.
   - Real-time ambulance coordinates with animated beacon, speed, distance remaining, and ETA timer.
   - 5-step status progression: `Requested` ➔ `Dispatched` ➔ `On the way` ➔ `Arrived` ➔ `Completed`.
   - **Prominently labeled as a simulation**: Does not imply a real ambulance has been contacted.
   - Manual next-step stepper and auto-simulation modes.
   - Listens to backend location updates via WebSocket (`ambulance_update` event).

5. **Robust Offline Support & PWA**:
   - Progressive Web App (`manifest.json` and service worker `sw.js`).
   - Temporary local storage of unfinished visit records (**Drafts autosave** & restore).
   - Real-time online and offline connection state detection.
   - Pending synchronization queue (`api.syncPendingVisits()`) draining automatically upon reconnect.
   - **Duplicate visit submission prevention**: Client-side submission ID tracking and idempotent confirmation.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 (Vite 5) |
| **Language** | JavaScript (ESM, JSX) |
| **Styling** | Tailwind CSS 3 (Theme: White, Teal `#0D9488`, Emerald, Navy `#0F172A`, Red reserved for Emergency `#DC2626`) |
| **Typography** | Noto Sans Kannada, Baloo Tamma 2, System UI |
| **Audio Processing** | Web Audio API (`AudioContext`, `AnalyserNode`), `MediaRecorder` |
| **Audio Constraints** | `echoCancellation: true`, `noiseSuppression: true`, `autoGainControl: true`, `sampleRate: 16000` |
| **Networking** | Fetch API with timeout & WebSocket (`/ws/voice`) |
| **Offline / PWA** | Service Worker, Cache API, Web App Manifest, LocalStorage Sync Queue |

---

## 📱 Development Stages Completed

- [x] **Stage 1**: UI and navigation (Mobile header, bottom thumb navigation, responsive layout).
- [x] **Stage 2**: Dashboard and beneficiary management (Metric cards, synthetic beneficiary registry, search, filters, timeline).
- [x] **Stage 3**: Voice recording interface (Web Audio AnalyserNode waveform canvas, Indic-Transcribe window processing, mic permission modal).
- [x] **Stage 4**: Structured visit record (8 clinical fields, inline editing, validation).
- [x] **Stage 5**: Voice confirmation and correction (Indic-Speak Kannada readback, interrupt audio, field-targeted voice correction).
- [x] **Stage 6**: Emergency alert interface (Red danger alert, WHO-compliant referral instruction, quick calling).
- [x] **Stage 7**: Ambulance map and tracking (Beneficiary pickup, simulated ambulance GPS, 5-stage stepper, clear simulation disclaimers).
- [x] **Stage 8**: Follow-up dashboard (Pending, upcoming, missed visits, one-tap voice visit).
- [x] **Stage 9**: Offline support (PWA, draft persistence, sync queue, duplicate prevention).
- [x] **Stage 10**: Integration, testing, and deployment verification.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Installation & Run

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser. Open DevTools in **Responsive Device Mode** (e.g., Pixel 7 or Galaxy S20, 390x844px) to experience the mobile-first UI.

### Configuration (`.env`)

```env
# Backend REST and WebSocket URLs
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws/voice

# Set to true for standalone hackathon demo mode (works without backend)
VITE_DEMO_MODE=true

# AI Model Labels
VITE_ASR_MODEL=AI4Bharat Indic-Transcribe (Kannada)
VITE_TTS_MODEL=AI4Bharat Indic-Speak (Kannada)
```
