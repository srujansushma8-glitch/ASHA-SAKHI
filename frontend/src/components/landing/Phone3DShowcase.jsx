import React, { useState } from 'react';
import { Mic, CheckCircle2, Ambulance, ShieldAlert, Sparkles, Activity, MapPin, Scale } from 'lucide-react';

export default function Phone3DShowcase({ activeStep = 0, onStepClick }) {
  const [selectedScreen, setSelectedScreen] = useState(activeStep);

  const current = selectedScreen !== undefined ? selectedScreen : activeStep;

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[380px] mx-auto perspective-1000">
      {/* 3D Phone Shell with Subtle Dynamic Tilt */}
      <div 
        className="relative rounded-[44px] p-3.5 bg-gradient-to-b from-navy-800 via-navy-900 to-navy-950 border-4 border-navy-700/80 shadow-2xl transition-transform duration-700 ease-out hover:rotate-1"
        style={{
          boxShadow: '0 25px 60px -15px rgba(10, 92, 90, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          transform: current === 0 ? 'rotateY(-4deg) rotateX(2deg)' : current === 1 ? 'rotateY(0deg) rotateX(0deg)' : 'rotateY(4deg) rotateX(-2deg)'
        }}
      >
        {/* Speaker Notch & Front Camera */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-navy-950 rounded-full z-30 flex items-center justify-center space-x-2 border border-navy-800/80">
          <div className="w-10 h-1 bg-navy-700 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-navy-800 rounded-full border border-navy-700"></div>
        </div>

        {/* Screen Bezel & Display Viewport */}
        <div className="relative w-full h-[580px] bg-cream-100 rounded-[36px] overflow-hidden border border-navy-200/50 flex flex-col justify-between shadow-inner select-none font-sans">
          {/* Top Status Bar */}
          <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] font-mono text-navy-600 bg-white/70 backdrop-blur-md border-b border-navy-100 z-20">
            <span className="font-bold">09:41</span>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-bold text-healthcare">4G • 98%</span>
              <div className="w-4 h-2 rounded-sm border border-navy-600 relative p-0.5">
                <div className="w-full h-full bg-healthcare rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* Dynamic App Screens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pt-6">
            {/* SCREEN 1: Voice Recording */}
            {current === 0 && (
              <div className="space-y-4 animate-fade-in text-center">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 text-[10px] font-bold border border-cyan-200">
                  <Sparkles className="w-3 h-3 text-cyan" />
                  <span>AI4Bharat Indic-Transcribe</span>
                </div>

                <div>
                  <h4 className="text-base font-bold font-kannada text-navy-900">
                    ಧ್ವನಿ ಕ್ಷೇತ್ರ ದಿನಚರಿ (Voice Visit)
                  </h4>
                  <p className="text-[11px] text-navy-500">ಲಕ್ಷ್ಮಮ್ಮ ಕೆ. • 2nd Trimester (24w)</p>
                </div>

                {/* Animated Pulsing Mic */}
                <div className="py-4 relative flex items-center justify-center">
                  <div className="absolute w-28 h-28 rounded-full bg-cyan-100 animate-ping opacity-60"></div>
                  <div className="absolute w-24 h-24 rounded-full bg-cyan-200 animate-pulse"></div>
                  <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-cyan text-white flex items-center justify-center shadow-cyan">
                    <Mic className="w-7 h-7" />
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-navy-100 text-left text-xs space-y-1 shadow-sm">
                  <span className="text-[10px] font-mono font-bold text-cyan-700 block">ಕನ್ನಡ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ (Live):</span>
                  <p className="font-kannada text-navy-800 leading-relaxed text-[11px]">
                    "ಲಕ್ಷ್ಮಮ್ಮ ಅವರ ಗರ್ಭಿಣಿ ತಪಾಸಣೆ. ತೂಕ 58.5 kg ಇದೆ. ಬಿಪಿ normal. ಟಿಟಿ-2 ನೀಡಲಾಗಿದೆ..."
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-1.5 text-[10px] font-mono text-healthcare font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ವಿಶ್ವಾಸಾರ್ಹತೆ: 94% • VAD ಸಕ್ರಿಯ</span>
                </div>
              </div>
            )}

            {/* SCREEN 2: Structured Clinical Record */}
            {current === 1 && (
              <div className="space-y-3.5 animate-fade-in">
                <div className="flex items-center justify-between border-b border-navy-100 pb-2">
                  <span className="text-xs font-bold font-kannada text-navy-900">ರಚನಾತ್ಮಕ ಭೇಟಿ ದಾಖಲೆ</span>
                  <span className="text-[9px] font-mono bg-healthcare-50 text-healthcare px-2 py-0.5 rounded-full font-bold">
                    VERIFIED
                  </span>
                </div>

                {/* Patient Summary Card */}
                <div className="p-3 rounded-2xl bg-white border border-navy-100 space-y-1 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold font-kannada text-navy-900">ಲಕ್ಷ್ಮಮ್ಮ ಕೆ.</span>
                    <span className="text-[10px] font-mono text-navy-400">ID: 0101</span>
                  </div>
                  <span className="text-[10px] text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full font-bold">
                    ANC 2nd Trimester
                  </span>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-softblue border border-navy-100">
                    <span className="text-[10px] text-navy-400 block font-kannada">ತೂಕ (Weight)</span>
                    <span className="font-bold text-navy-900 text-sm font-mono">58.5 kg</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-softblue border border-navy-100">
                    <span className="text-[10px] text-navy-400 block font-kannada">ರಕ್ತದೊತ್ತಡ (BP)</span>
                    <span className="font-bold text-healthcare text-sm font-mono">118/76</span>
                  </div>
                </div>

                {/* Vaccine Status */}
                <div className="p-2.5 rounded-xl bg-healthcare-50 border border-healthcare-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-healthcare uppercase">✓ ನೀಡಲಾದ ಲಸಿಕೆ:</span>
                  <p className="font-bold text-navy-900 text-[11px]">TT-2 / TD-2 Booster ಪೂರ್ಣ</p>
                </div>

                {/* Spoken Confirmation */}
                <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-[10px] text-cyan-800 leading-snug font-kannada">
                  🔊 Indic-Speak: "ದಾಖಲಿಸಿರುವ ವಿವರಗಳು ಸರಿಯಾಗಿವೆಯೇ?"
                </div>
              </div>
            )}

            {/* SCREEN 3: 108 Ambulance Live Simulation */}
            {current === 2 && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-navy-100 pb-2">
                  <div className="flex items-center space-x-1.5">
                    <Ambulance className="w-4 h-4 text-emergency" />
                    <span className="text-xs font-bold font-kannada text-emergency">108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಲೈವ್</span>
                  </div>
                  <span className="text-[9px] font-mono bg-emergency text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                    DISPATCHED
                  </span>
                </div>

                {/* Vector Map Preview */}
                <div className="relative w-full h-44 rounded-2xl bg-navy-950 border border-navy-800 overflow-hidden flex items-center justify-center">
                  <svg viewBox="0 0 200 120" className="w-full h-full opacity-90">
                    <path d="M 20 100 Q 60 40 100 70 T 180 20" fill="none" stroke="#087F8C" strokeWidth="4" />
                    <path d="M 20 100 Q 60 40 100 70 T 180 20" fill="none" stroke="#19B8D5" strokeWidth="2" strokeDasharray="4 4" />
                    <circle cx="20" cy="100" r="5" fill="#20A675" />
                    <circle cx="180" cy="20" r="6" fill="#D94343" className="animate-ping" />
                    <circle cx="100" cy="70" r="6" fill="#FFFFFF" stroke="#D94343" strokeWidth="2" />
                  </svg>
                  <div className="absolute top-2 left-2 bg-navy-900/90 text-white text-[10px] px-2 py-1 rounded-lg font-mono">
                    ETA: 8 mins • 2.4 km
                  </div>
                  <div className="absolute bottom-2 right-2 bg-emergency text-white text-[9px] px-2 py-0.5 rounded font-bold">
                    KA-11-G-1081
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-softblue border border-navy-100 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-navy-900 text-[11px]">
                    <span>ಚಾಲಕ: ರಮೇಶ್ ಗೌಡ</span>
                    <span className="text-primary font-mono">EMT: ಸುರೇಶ್</span>
                  </div>
                  <span className="text-[10px] text-navy-500 block">ಪಿಕಪ್: ಕೆರೆಗೋಡು ವಲಯ, ಮಂಡ್ಯ</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Screen Switcher Bar */}
          <div className="p-3 bg-white/90 backdrop-blur-md border-t border-navy-100 flex items-center justify-around z-20">
            {[
              { id: 0, label: 'ಧ್ವನಿ (Voice)' },
              { id: 1, label: 'ದಾಖಲೆ (Record)' },
              { id: 2, label: '108 ನಕ್ಷೆ (Map)' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedScreen(tab.id);
                  if (onStepClick) onStepClick(tab.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  current === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-navy-500 hover:text-navy-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
