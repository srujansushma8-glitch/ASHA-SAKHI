import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Mic, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Phone, 
  Baby, 
  Syringe, 
  Sparkles, 
  Layers, 
  Share2, 
  Compass, 
  HeartPulse,
  Info
} from 'lucide-react';

export default function HouseholdRouteScreen({ onStartVoiceVisit, onBack }) {
  const [selectedStopId, setSelectedStopId] = useState(2); // Default to highest risk
  const [filter, setFilter] = useState('all'); // 'all', 'high_risk', 'vaccine', 'anc'
  const [routeMode, setRouteMode] = useState('ai_priority'); // 'ai_priority', 'shortest'

  const stops = [
    {
      id: 1,
      name_kn: 'ಮಂಡ್ಯ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ (PHC)',
      name_en: 'Mandya Primary Health Centre',
      role: 'ಆರಂಭಿಕ ಕೇಂದ್ರ (Starting Depot)',
      type: 'depot',
      distance: '0.0 km',
      eta: '09:00 AM',
      coords: { x: 120, y: 70 },
      status: 'completed',
      address: 'ಮುಖ್ಯ ರಸ್ತೆ, ಶಿವಳ್ಳಿ',
      description: 'ಔಷಧಿ ಕಿಟ್, ಬಿಪಿ ಮಾನಿಟರ್, ತೂಕ ಯಂತ್ರ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ.'
    },
    {
      id: 2,
      beneficiaryId: 'ASHA-KA-2024-0102',
      name_kn: 'ಮೀನಾಕ್ಷಿ (Meenakshi)',
      name_en: 'Meenakshi - 28 yrs',
      type: 'high_risk',
      priority: 'ಅತ್ಯಂತ ತುರ್ತು (Critical High Risk)',
      distance: '0.9 km',
      eta: '09:20 AM',
      coords: { x: 260, y: 130 },
      phone: '+91 98450 12345',
      address: 'ಮನೆ ನಂ 28, ಕೆರೆ ಅಂಚು ಬೀದಿ, ಶಿವಳ್ಳಿ',
      clinicalNote: 'ರಕ್ತಹೀನತೆ (Hb 7.8 g/dL), ತೀವ್ರ ತಲೆನೋವು ಮತ್ತು ಮುಖದಲ್ಲಿ ಊತ. ಗರ್ಭಾವಸ್ಥೆ 32 ವಾರ.',
      actionLabel: 'ANC ತಪಾಸಣೆ & ತುರ್ತು ರೆಫರಲ್'
    },
    {
      id: 3,
      beneficiaryId: 'ASHA-KA-2024-0101',
      name_kn: 'ಲಕ್ಷ್ಮಿ ದೇವಿ (Lakshmi Devi)',
      name_en: 'Lakshmi Devi - 24 yrs',
      type: 'anc',
      priority: 'ನಿಯಮಿತ ಭೇಟಿ (Routine ANC)',
      distance: '1.6 km',
      eta: '09:55 AM',
      coords: { x: 380, y: 220 },
      phone: '+91 94480 54321',
      address: 'ಮನೆ ನಂ 14, ಮಾರಮ್ಮ ದೇವಸ್ಥಾನ ರಸ್ತೆ',
      clinicalNote: '36 ವಾರಗಳ ಗರ್ಭಿಣಿ. ತೂಕ ಪರೀಕ್ಷೆ, ಭ್ರೂಣದ ಚಲನೆ ಮತ್ತು IFA ಮಾತ್ರೆಗಳ ವಿತರಣೆ.',
      actionLabel: '4ನೇ ತ್ರೈಮಾಸಿಕ ANC ಪರಿಶೀಲನೆ'
    },
    {
      id: 4,
      beneficiaryId: 'ASHA-KA-2024-0103',
      name_kn: 'ಪೂಜಾ ಸುರೇಶ್ ಮತ್ತು ಮಗು (Pooja Suresh)',
      name_en: 'Pooja Suresh & Infant',
      type: 'vaccine',
      priority: 'ಲಸಿಕೆ ಬಾಕಿ (Vaccination Due)',
      distance: '2.3 km',
      eta: '10:30 AM',
      coords: { x: 210, y: 310 },
      phone: '+91 97410 87654',
      address: 'ಮನೆ ನಂ 42, ಬಸವೇಶ್ವರ ಬಡಾವಣೆ',
      clinicalNote: 'ಮಗು ವಯಸ್ಸು 6 ವಾರ. OPV-1, Pentavalent-1 ಮತ್ತು Rota-1 ಲಸಿಕೆ ಬಾಕಿ ಇದೆ.',
      actionLabel: 'ಲಸಿಕಾ ದಿನಚರಿ & ತೂಕ ದಾಖಲೆ'
    },
    {
      id: 5,
      beneficiaryId: 'ASHA-KA-2024-0104',
      name_kn: 'ಸೌಂದರ್ಯ ಕುಮಾರ್ (Soundarya Kumar)',
      name_en: 'Soundarya Kumar - 22 yrs',
      type: 'hbnc',
      priority: 'ನವಜಾತ ಶಿಶು ಆರೈಕೆ (HBNC)',
      distance: '3.1 km',
      eta: '11:15 AM',
      coords: { x: 440, y: 370 },
      phone: '+91 96110 33221',
      address: 'ಮನೆ ನಂ 53, ಶಾಲೆ ರಸ್ತೆ, ಕೆರೆಗೋಡು',
      clinicalNote: 'ಪ್ರಸವದ 14ನೇ ದಿನ. ತಾಯಿಯ ಎದೆಹಾಲುಣಿಸುವಿಕೆ ಮತ್ತು ಶಿಶುವಿನ ಹೊಕ್ಕಳು ಶುಚಿತ್ವ ಪರೀಕ್ಷೆ.',
      actionLabel: 'HBNC 3ನೇ ಮನೆ ಭೇಟಿ'
    },
    {
      id: 6,
      beneficiaryId: 'ASHA-KA-2024-0105',
      name_kn: 'ರೇಣುಕಾ ಬಾಯಿ (Renuka Bai)',
      name_en: 'Renuka Bai - 26 yrs',
      type: 'anc',
      priority: 'ನಿಯಮಿತ ಭೇಟಿ (Routine ANC)',
      distance: '3.8 km',
      eta: '11:50 AM',
      coords: { x: 550, y: 260 },
      phone: '+91 99800 66778',
      address: 'ಮನೆ ನಂ 67, ಅಂಚೆ ಕಚೇರಿ ಹತ್ತಿರ',
      clinicalNote: '24 ವಾರಗಳ ಗರ್ಭಿಣಿ. ಕ್ಯಾಲ್ಸಿಯಂ & ಜಂತುಹುಳು ಮಾತ್ರೆ ನೀಡಿಕೆ, ಟೆಟಾನಸ್ (Td) ಲಸಿಕೆ.',
      actionLabel: '2ನೇ ತ್ರೈಮಾಸಿಕ ANC ಫಾಲೋ-ಅಪ್'
    }
  ];

  const filteredStops = stops.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'high_risk') return s.type === 'high_risk';
    if (filter === 'vaccine') return s.type === 'vaccine';
    if (filter === 'anc') return s.type === 'anc' || s.type === 'hbnc';
    return true;
  });

  const activeStop = stops.find(s => s.id === selectedStopId) || stops[1];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-navy-200/60 dark:border-navy-700 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan/10 text-cyan-800 dark:text-cyan text-xs font-bold border border-cyan-200 dark:border-cyan/30 mb-2">
            <Navigation className="w-3.5 h-3.5 animate-pulse" />
            <span>ದಿನನಿತ್ಯದ ಕ್ಷೇತ್ರ ಮಾರ್ಗ (Daily Field Visit Optimization)</span>
          </div>
          <h1 className="text-2xl font-bold font-kannada text-navy-900 dark:text-white leading-tight">
            ಶಿವಳ್ಳಿ & ಕೆರೆಗೋಡು ವಲಯ ಮನೆ ಭೇಟಿ ನಕ್ಷೆ
          </h1>
          <p className="text-xs text-navy-500 dark:text-navy-400 mt-1">
            ಮಂಡ್ಯ ತಾಲೂಕು PHC • ಒಟ್ಟು 5 ಮನೆ ಭೇಟಿಗಳು • ಅಂದಾಜು ನಡಿಗೆ: 3.8 ಕಿ.ಮೀ • ಆಫ್‌ಲೈನ್ ಮ್ಯಾಪ್ ಲಭ್ಯ
          </p>
        </div>

        {/* Route Optimization Toggle & Distance Pill */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-navy-100 dark:bg-navy-800 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setRouteMode('ai_priority')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                routeMode === 'ai_priority'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-navy-600 dark:text-navy-300 hover:text-navy-900'
              }`}
            >
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI ಆದ್ಯತೆ (High Risk First)</span>
              </span>
            </button>
            <button
              onClick={() => setRouteMode('shortest')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                routeMode === 'shortest'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-navy-600 dark:text-navy-300 hover:text-navy-900'
              }`}
            >
              <span>ಕಡಿಮೆ ದೂರ (Shortest)</span>
            </button>
          </div>

          <div className="bg-healthcare-50 dark:bg-healthcare/10 border border-healthcare-200 dark:border-healthcare/30 px-3 py-2 rounded-2xl text-xs font-bold text-healthcare flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>ಮಾರ್ಗ ಆಪ್ಟಿಮೈಸ್ಡ್ ಆಗಿದೆ</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Split: Vector Map on Left, Route List & Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Vector Interactive Map (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-navy-900 rounded-3xl p-5 border border-navy-200/60 dark:border-navy-700 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-navy-800 dark:text-white">
              <Compass className="w-4 h-4 text-primary" />
              <span>ಲೈವ್ ಜಿಪಿಎಸ್ ವೆಕ್ಟರ್ ನಕ್ಷೆ (Live Field Vector Map)</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 px-2.5 py-1 rounded-full border border-navy-200 dark:border-navy-700">
              Offline GPS Caching Active
            </span>
          </div>

          {/* Interactive SVG Canvas */}
          <div className="relative w-full h-80 sm:h-96 bg-cream-50 dark:bg-navy-950 rounded-2xl border border-navy-200/50 dark:border-navy-800 overflow-hidden flex items-center justify-center select-none">
            <svg 
              className="w-full h-full" 
              viewBox="0 0 640 420" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background Village Terrain & Lanes */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-navy-200/40 dark:text-navy-800/40" />
                </pattern>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#087F8C" />
                  <stop offset="50%" stopColor="#D94343" />
                  <stop offset="100%" stopColor="#20A675" />
                </linearGradient>
              </defs>

              <rect width="640" height="420" fill="url(#grid)" />

              {/* Village Green Groves */}
              <path d="M 20 20 Q 90 60 140 20 T 260 30 Q 300 90 240 120 Z" fill="#20A675" fillOpacity="0.08" />
              <path d="M 400 300 Q 520 280 580 340 T 520 400 Q 420 410 400 300 Z" fill="#20A675" fillOpacity="0.08" />

              {/* Village Roads / Lanes */}
              <path d="M 40 70 L 600 70" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" className="dark:stroke-navy-800" />
              <path d="M 120 70 Q 200 130 260 130 T 380 220" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" className="dark:stroke-navy-800" />
              <path d="M 260 130 Q 210 240 210 310" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" className="dark:stroke-navy-800" />
              <path d="M 210 310 Q 340 340 440 370 T 550 260" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" className="dark:stroke-navy-800" />

              {/* Active Recommended Walking Path with Dash Glow */}
              <path 
                d="M 120 70 Q 200 130 260 130 T 380 220 Q 300 280 210 310 T 440 370 T 550 260" 
                stroke="url(#routeGrad)" 
                strokeWidth="4" 
                strokeDasharray="8 6" 
                className="animate-pulse"
              />

              {/* Landmark: Shivalli Lake */}
              <ellipse cx="280" cy="180" rx="35" ry="20" fill="#087F8C" fillOpacity="0.15" />
              <text x="260" y="184" fill="#087F8C" fontSize="10" fontWeight="bold" fontFamily="sans-serif">ಕೆರೆ (Lake)</text>

              {/* Map Pins / Household Nodes */}
              {stops.map((stop) => {
                const isSelected = stop.id === selectedStopId;
                const isCritical = stop.type === 'high_risk';
                const isDepot = stop.type === 'depot';

                let pinColor = '#087F8C'; // default teal
                if (isCritical) pinColor = '#D94343'; // emergency red
                else if (stop.type === 'vaccine') pinColor = '#F2B84B'; // amber
                else if (isDepot) pinColor = '#18364A'; // navy

                return (
                  <g 
                    key={stop.id} 
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => setSelectedStopId(stop.id)}
                  >
                    {/* Pulsing ring for critical high risk or selected */}
                    {(isSelected || isCritical) && (
                      <circle 
                        cx={stop.coords.x} 
                        cy={stop.coords.y} 
                        r={isSelected ? "22" : "18"} 
                        fill={pinColor} 
                        fillOpacity="0.25"
                        className="animate-ping"
                      />
                    )}

                    {/* Outer Circle */}
                    <circle 
                      cx={stop.coords.x} 
                      cy={stop.coords.y} 
                      r={isSelected ? "16" : "13"} 
                      fill={pinColor} 
                      stroke="#FFFFFF" 
                      strokeWidth="3" 
                      className="shadow-lg"
                    />

                    {/* Pin Number */}
                    <text 
                      x={stop.coords.x} 
                      y={stop.coords.y + 4} 
                      textAnchor="middle" 
                      fill="#FFFFFF" 
                      fontSize="10" 
                      fontWeight="bold" 
                      fontFamily="sans-serif"
                    >
                      {stop.id}
                    </text>

                    {/* Pin Label Floating Badge */}
                    <rect 
                      x={stop.coords.x - 45} 
                      y={stop.coords.y - 28} 
                      width="90" 
                      height="18" 
                      rx="6" 
                      fill="#FFFFFF" 
                      stroke={pinColor} 
                      strokeWidth="1" 
                      className="dark:fill-navy-900 shadow-sm"
                    />
                    <text 
                      x={stop.coords.x} 
                      y={stop.coords.y - 15} 
                      textAnchor="middle" 
                      fill={isCritical ? "#D94343" : "#18364A"} 
                      fontSize="9" 
                      fontWeight="bold" 
                      fontFamily="sans-serif"
                    >
                      {stop.name_kn.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Bottom Floating Legend */}
            <div className="absolute bottom-3 left-3 right-3 bg-white/90 dark:bg-navy-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-navy-200/60 dark:border-navy-700 flex flex-wrap items-center justify-between text-[11px] font-bold">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emergency"></span>
                  <span className="text-navy-700 dark:text-navy-300">ತುರ್ತು (Critical High-Risk)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-navy-700 dark:text-navy-300">ಲಸಿಕೆ ಬಾಕಿ (Vaccine)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <span className="text-navy-700 dark:text-navy-300">ನಿಯಮಿತ ANC</span>
                </span>
              </div>
              <span className="text-navy-400 font-mono text-[10px]">ನಕ್ಷೆಯಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ</span>
            </div>
          </div>

          {/* Active Stop Quick Info Strip */}
          <div className="mt-4 p-4 rounded-2xl bg-cream-50 dark:bg-navy-800/60 border border-navy-200/50 dark:border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                  #{activeStop.id}
                </span>
                <h4 className="text-sm font-bold font-kannada text-navy-900 dark:text-white">
                  {activeStop.name_kn}
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeStop.type === 'high_risk' 
                    ? 'bg-emergency-50 text-emergency border border-emergency-200' 
                    : 'bg-primary/10 text-primary'
                }`}>
                  {activeStop.distance}
                </span>
              </div>
              <p className="text-xs text-navy-500 dark:text-navy-400 mt-1">
                {activeStop.address}
              </p>
            </div>

            {activeStop.beneficiaryId && (
              <button
                onClick={() => onStartVoiceVisit(activeStop.beneficiaryId)}
                className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-cyan text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-cyan active:scale-95 transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>ಧ್ವನಿ ಭೇಟಿ ಪ್ರಾರಂಭಿಸಿ</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Detailed Itinerary Stops List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-kannada text-navy-900 dark:text-white">
              ಭೇಟಿ ವೇಳಾಪಟ್ಟಿ (Stop Itinerary)
            </h3>
            {/* Filter Tabs */}
            <div className="flex bg-navy-100 dark:bg-navy-800 p-0.5 rounded-xl text-[10px] font-bold">
              {[
                { id: 'all', label: 'ಎಲ್ಲಾ' },
                { id: 'high_risk', label: 'ತುರ್ತು' },
                { id: 'vaccine', label: 'ಲಸಿಕೆ' },
                { id: 'anc', label: 'ANC' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filter === t.id
                      ? 'bg-white dark:bg-navy-700 text-primary dark:text-cyan shadow-sm'
                      : 'text-navy-600 dark:text-navy-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stops List */}
          <div className="space-y-3">
            {filteredStops.map((stop) => {
              const isSelected = stop.id === selectedStopId;
              const isHighRisk = stop.type === 'high_risk';

              return (
                <div
                  key={stop.id}
                  onClick={() => setSelectedStopId(stop.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-navy-900 border-primary dark:border-cyan ring-2 ring-primary/20 shadow-card'
                      : 'bg-white/80 dark:bg-navy-900/60 border-navy-200/60 dark:border-navy-800 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                        isHighRisk
                          ? 'bg-emergency-50 text-emergency border border-emergency-300'
                          : stop.type === 'vaccine'
                          ? 'bg-amber-50 text-amber-600 border border-amber-300'
                          : 'bg-primary/10 text-primary border border-primary/20'
                      }`}>
                        #{stop.id}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold font-kannada text-navy-900 dark:text-white">
                            {stop.name_kn}
                          </h4>
                          {isHighRisk && (
                            <span className="w-2 h-2 rounded-full bg-emergency animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-[11px] text-navy-400 dark:text-navy-400">
                          {stop.name_en}
                        </p>
                        <p className="text-[11px] text-navy-600 dark:text-navy-300 font-medium mt-1">
                          {stop.clinicalNote || stop.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono font-bold text-navy-900 dark:text-white block">
                        {stop.eta}
                      </span>
                      <span className="text-[10px] text-navy-400 font-mono block">
                        {stop.distance}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Actions when selected */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-navy-100 dark:border-navy-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs">
                        {stop.phone && (
                          <a
                            href={`tel:${stop.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 hover:text-navy-900 font-medium"
                          >
                            <Phone className="w-3 h-3 text-primary" />
                            <span>ಕರೆ ಮಾಡಿ</span>
                          </a>
                        )}
                        <span className="text-[11px] text-navy-400">
                          {stop.priority}
                        </span>
                      </div>

                      {stop.beneficiaryId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartVoiceVisit(stop.beneficiaryId);
                          }}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm"
                        >
                          <Mic className="w-3 h-3" />
                          <span>ಭೇಟಿ ಆರಂಭಿಸಿ</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Summary Card */}
          <div className="p-4 rounded-2xl bg-primary/5 dark:bg-cyan/5 border border-primary/20 dark:border-cyan/20 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-primary dark:text-cyan">
              <Sparkles className="w-4 h-4" />
              <span>AI ಮಾರ್ಗ ಶಿಫಾರಸು (Smart Routing Insight)</span>
            </div>
            <p className="text-xs text-navy-600 dark:text-navy-300 leading-relaxed font-kannada">
              ಮೀನಾಕ್ಷಿಯವರಿಗೆ ತೀವ್ರ ರಕ್ತಹೀನತೆ ಮತ್ತು ಅಧಿಕ ರಕ್ತದೊತ್ತಡ ಇರುವುದರಿಂದ, ಅವರ ಮನೆಗೆ ಬೆಳಿಗ್ಗೆ 9:20 ಕ್ಕೆ ಮೊದಲ ಭೇಟಿ ನೀಡಲು ಮಾರ್ಗವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ. 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಮತ್ತು PHC ಮೆಡಿಕಲ್ ಆಫೀಸರ್ ಸಂಪರ್ಕ ಸಿದ್ಧವಾಗಿದೆ.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
