import React, { useState, useEffect, useRef } from 'react';
import { 
  Ambulance, 
  MapPin, 
  Navigation, 
  Phone, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  RotateCcw, 
  Radio, 
  ChevronRight, 
  ShieldAlert
} from 'lucide-react';
import { api, INITIAL_AMBULANCE_TRACKING } from '../services/api';
import { voiceWs } from '../services/websocket';

export default function AmbulanceTrackingScreen({ onBack, requestId = 'AMB-REQ-108-001' }) {
  const [trackingData, setTrackingData] = useState(INITIAL_AMBULANCE_TRACKING);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const autoSimTimerRef = useRef(null);

  useEffect(() => {
    api.getAmbulanceTracking(requestId).then(data => {
      if (data) setTrackingData(data);
    });

    const handleAmbulanceUpdate = (e) => {
      if (e.detail?.ambulance) {
        setTrackingData(e.detail.ambulance);
      }
    };
    window.addEventListener('asha_ambulance_updated', handleAmbulanceUpdate);

    const unsubWs = voiceWs.on('ambulance_update', (payload) => {
      if (payload) {
        setTrackingData(prev => ({
          ...prev,
          ...payload,
          updated_at: new Date().toISOString()
        }));
      }
    });

    return () => {
      window.removeEventListener('asha_ambulance_updated', handleAmbulanceUpdate);
      unsubWs();
      if (autoSimTimerRef.current) clearInterval(autoSimTimerRef.current);
    };
  }, [requestId]);

  useEffect(() => {
    if (autoSimulate) {
      autoSimTimerRef.current = setInterval(async () => {
        const next = await api.simulateNextAmbulanceStep(requestId);
        if (next.status?.toUpperCase() === 'COMPLETED') {
          setAutoSimulate(false);
          setStatusMessage('ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಿಮ್ಯುಲೇಶನ್ ಪೂರ್ಣಗೊಂಡಿದೆ (Simulation completed)');
        }
      }, 3500);
    } else {
      if (autoSimTimerRef.current) clearInterval(autoSimTimerRef.current);
    }

    return () => {
      if (autoSimTimerRef.current) clearInterval(autoSimTimerRef.current);
    };
  }, [autoSimulate, requestId]);

  const handleNextStep = async () => {
    const updated = await api.simulateNextAmbulanceStep(requestId);
    setTrackingData(updated);
    setStatusMessage(`ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ: ${formatStatusDisplay(updated.status)}`);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleReset = () => {
    setAutoSimulate(false);
    const resetData = api.resetAmbulanceSimulation ? api.resetAmbulanceSimulation() : INITIAL_AMBULANCE_TRACKING;
    setTrackingData(resetData);
    setStatusMessage('ಸಿಮ್ಯುಲೇಶನ್ ಪ್ರಾರಂಭಿಕ ಹಂತಕ್ಕೆ ಮರುಹೊಂದಿಸಲಾಗಿದೆ.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const statuses = [
    { keys: ['REQUESTED', 'Requested'], label_en: 'Requested', label_kn: 'ವಿನಂತಿಸಲಾಗಿದೆ' },
    { keys: ['DISPATCHED', 'Dispatched'], label_en: 'Dispatched', label_kn: 'ಹೊರಟಿದೆ' },
    { keys: ['ON_THE_WAY', 'On the way', 'ON THE WAY'], label_en: 'On the way', label_kn: 'ಮಾರ್ಗದಲ್ಲಿದೆ' },
    { keys: ['ARRIVED', 'Arrived'], label_en: 'Arrived', label_kn: 'ಸ್ಥಳ ತಲುಪಿದೆ' },
    { keys: ['COMPLETED', 'Completed'], label_en: 'Completed', label_kn: 'ಪೂರ್ಣಗೊಂಡಿದೆ' }
  ];

  const currentStatusUpper = (trackingData.status || 'REQUESTED').toUpperCase().replace(/\s+/g, '_');
  const currentIdx = statuses.findIndex(s => 
    s.keys.some(k => k.toUpperCase().replace(/\s+/g, '_') === currentStatusUpper)
  );

  const formatStatusDisplay = (statusStr) => {
    if (!statusStr) return 'Requested';
    return statusStr.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const waypoints = trackingData.route_waypoints || [
    { lat: 12.5240, lng: 76.8980, label: 'PHC Mandya Base' },
    { lat: 12.5350, lng: 76.9020, label: 'Kallalli Circle' },
    { lat: 12.5450, lng: 76.9090, label: 'Sugar Town Cross' },
    { lat: 12.5580, lng: 76.9150, label: 'Shivalli Gate' },
    { lat: 12.5710, lng: 76.9220, label: 'Keregodu Main Road' },
    { lat: 12.5835, lng: 76.9280, label: 'Beneficiary Home' }
  ];

  const minLat = 12.5200;
  const maxLat = 12.5880;
  const minLng = 76.8950;
  const maxLng = 76.9320;

  const projectToSvg = (lat, lng) => {
    const x = 30 + (((lng || 76.91) - minLng) / (maxLng - minLng)) * 340;
    const y = 200 - (((lat || 12.55) - minLat) / (maxLat - minLat)) * 160;
    return { x: Math.max(20, Math.min(380, x)), y: Math.max(20, Math.min(220, y)) };
  };

  const hospitalPos = projectToSvg(
    trackingData.base_hospital?.lat || 12.5240, 
    trackingData.base_hospital?.lng || 76.8980
  );
  const pickupPos = projectToSvg(
    trackingData.pickup_lat || 12.5835, 
    trackingData.pickup_lng || 76.9280
  );
  const ambulancePos = projectToSvg(
    trackingData.current_latitude || 12.5450, 
    trackingData.current_longitude || 76.9090
  );

  const pathD = waypoints.reduce((acc, wp, i) => {
    const p = projectToSvg(wp.lat, wp.lng);
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12">
      {/* 1. Header with Back Button */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-navy-200/60 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-softblue border border-navy-200 text-navy-800 hover:bg-navy-100 active:scale-95 transition-decelerate"
            title="ಹಿಂದೆ / Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg lg:text-xl font-bold font-kannada text-navy-900 leading-tight flex items-center space-x-2">
                <Ambulance className="w-5 h-5 text-emergency" />
                <span>108 ತುರ್ತು ವಾಹನ ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್ (Ambulance Simulation)</span>
              </h1>
              <span className="text-xs font-mono font-bold bg-cyan-50 text-cyan-800 px-2.5 py-0.5 rounded-full border border-cyan-200">
                GPS Telemetry
              </span>
            </div>
            <p className="text-xs text-navy-500 font-medium mt-0.5">
              ನೈಜ ಸಮಯದ ಮಾರ್ಗ ಪ್ರಗತಿ ಮತ್ತು ಚಾಲಕರ ಸಂವಹನ
            </p>
          </div>
        </div>
      </div>

      {/* 2. Simulation Disclaimer Banner */}
      <div className="bg-warning-50 border border-warning-200 rounded-2xl p-4 shadow-subtle">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-warning-700 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs">
            <span className="font-bold text-navy-900 block font-kannada">
              ⚠️ ತರಬೇತಿ ಮತ್ತು ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ಸಿಮ್ಯುಲೇಶನ್ ಮಾತ್ರ (TRAINING & EVALUATION SIMULATION ONLY)
            </span>
            <p className="text-navy-700 mt-0.5 leading-relaxed font-medium">
              ಇದು ಕೇವಲ ಡೆಮೊ ಸಿಮ್ಯುಲೇಶನ್ ಆಗಿದೆ. ಯಾವುದೇ ನಿಜವಾದ 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಅಥವಾ ತುರ್ತು ವಿಭಾಗವನ್ನು ಸಂಪರ್ಕಿಸಲಾಗಿಲ್ಲ.
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-healthcare text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-card flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: SVG MAP CANVAS & STATUS PROGRESSION (Span 7) */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Ambulance Request Summary Card */}
          <div className="bg-white rounded-3xl p-5 border border-navy-200/60 shadow-card flex items-center justify-between">
            <div>
              <span className="text-[10px] text-navy-400 font-mono uppercase font-bold block">
                Ambulance Request ID
              </span>
              <div className="text-lg font-bold text-navy-900 font-mono mt-0.5 flex items-center space-x-2">
                <span>{trackingData.id || trackingData.request_id}</span>
                <span className="text-[10px] bg-cyan-50 text-cyan-800 px-2.5 py-0.5 rounded-full font-bold border border-cyan-200">
                  SIMULATED
                </span>
              </div>
              <p className="text-xs font-bold text-navy-900 font-kannada mt-1">
                ಫಲಾನುಭವಿ: {trackingData.beneficiary_name_kn || trackingData.beneficiary_name || 'ಗೀತಾ ಎಂ.'} ({trackingData.beneficiary_id || 'ASHA-KA-2024-0102'})
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-navy-400 font-mono block font-medium">ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ</span>
              <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase mt-1 ${
                currentStatusUpper === 'ARRIVED'
                  ? 'bg-healthcare-50 text-healthcare border border-healthcare-200'
                  : currentStatusUpper === 'COMPLETED'
                  ? 'bg-navy-100 text-navy-800'
                  : 'bg-emergency text-white animate-pulse shadow-emergency'
              }`}>
                {formatStatusDisplay(trackingData.status)}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="bg-white rounded-3xl p-5 border border-navy-200/60 shadow-card">
            <span className="text-xs font-bold text-navy-900 font-kannada block mb-3">
              ವಾಹನ ಪ್ರಗತಿ ಹಂತಗಳು (Ambulance Status Flow):
            </span>
            <div className="relative flex items-center justify-between">
              <div className="absolute top-3.5 left-4 right-4 h-1 bg-softblue -z-0">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-cyan transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (Math.max(0, currentIdx) / (statuses.length - 1)) * 100)}%` }}
                ></div>
              </div>

              {statuses.map((s, idx) => {
                const isDone = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={s.label_en} className="flex flex-col items-center z-10 text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-decelerate ${
                      isCurrent
                        ? 'bg-emergency text-white ring-4 ring-emergency-100 shadow-emergency'
                        : isDone
                        ? 'bg-healthcare text-white'
                        : 'bg-softblue text-navy-400'
                    }`}>
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <span className={`text-[11px] mt-1.5 font-semibold leading-tight max-w-[70px] font-kannada ${
                      isCurrent ? 'text-emergency font-bold' : isDone ? 'text-navy-900 font-bold' : 'text-navy-400'
                    }`}>
                      {s.label_kn}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Large Interactive SVG Road Map Canvas */}
          <div className="bg-white rounded-3xl p-5 border border-navy-200/60 shadow-card overflow-hidden space-y-3">
            <div className="flex items-center justify-between border-b border-navy-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-xs text-navy-900 font-kannada">
                  ಲೈವ್ ಸಿಮ್ಯುಲೇಟೆಡ್ ಮಾರ್ಗ (Simulated Route Map)
                </h3>
              </div>
              <span className="text-[11px] font-mono bg-softblue text-navy-800 px-2.5 py-0.5 rounded-full border border-navy-200 flex items-center">
                <Radio className="w-3.5 h-3.5 mr-1 text-healthcare animate-pulse" />
                GPS: {(trackingData.current_latitude || 12.545).toFixed(3)}° N, {(trackingData.current_longitude || 76.909).toFixed(3)}° E
              </span>
            </div>

            <div className="relative w-full h-80 rounded-2xl bg-navy-950 border border-navy-800 shadow-inner overflow-hidden">
              <svg viewBox="0 0 400 240" className="w-full h-full">
                <path
                  d={pathD}
                  fill="none"
                  stroke="#1E4260"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke="#087F8C"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke="#19B8D5"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  className="animate-pulse"
                />

                {waypoints.map((wp, i) => {
                  const p = projectToSvg(wp.lat, wp.lng);
                  return (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r="3.5"
                      fill="#9FBED8"
                    />
                  );
                })}

                {/* Hospital Pin */}
                <g transform={`translate(${hospitalPos.x}, ${hospitalPos.y})`}>
                  <circle r="12" fill="#20A675" opacity="0.3" className="animate-ping" />
                  <circle r="9" fill="#20A675" />
                  <text x="0" y="3" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">+</text>
                  <text x="0" y="20" textAnchor="middle" fill="#E8F7F1" fontSize="8" fontWeight="bold">PHC Base</text>
                </g>

                {/* Beneficiary Pickup Pin */}
                <g transform={`translate(${pickupPos.x}, ${pickupPos.y})`}>
                  <circle r="14" fill="#D94343" opacity="0.35" className="animate-ping" />
                  <circle r="9" fill="#D94343" />
                  <circle r="4" fill="#FFFFFF" />
                  <text x="0" y="20" textAnchor="middle" fill="#FCF1F1" fontSize="8" fontWeight="bold">Pickup Location</text>
                </g>

                {/* Moving Ambulance Marker */}
                <g transform={`translate(${ambulancePos.x}, ${ambulancePos.y})`}>
                  <circle r="18" fill="#D94343" opacity="0.35" className="animate-ping" />
                  <rect x="-12" y="-9" width="24" height="18" rx="4" fill="#FFFFFF" stroke="#D94343" strokeWidth="2" />
                  <rect x="-9" y="-7" width="8" height="7" fill="#087F8C" rx="1" />
                  <rect x="1" y="-7" width="8" height="7" fill="#D94343" rx="1" />
                  <circle cx="-6" cy="9" r="2.5" fill="#142B45" />
                  <circle cx="6" cy="9" r="2.5" fill="#142B45" />
                  <text x="0" y="-13" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">🚑 108</text>
                </g>
              </svg>

              {/* Floating ETA Pill */}
              <div className="absolute top-3 left-3 bg-navy-900/90 text-white px-3.5 py-2 rounded-xl border border-navy-700 shadow-card text-xs flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-cyan" />
                  <span className="font-bold">ETA: {trackingData.eta_minutes || 0} ನಿಮಿಷ</span>
                </div>
                <span className="text-navy-500">•</span>
                <div className="flex items-center space-x-1">
                  <Navigation className="w-4 h-4 text-warning" />
                  <span className="font-mono">{trackingData.distance_km || '2.4'} km</span>
                </div>
              </div>

              {/* Speed Indicator */}
              <div className="absolute bottom-3 right-3 bg-navy-900/90 text-cyan font-mono text-xs px-3 py-1 rounded-xl border border-navy-700">
                ವೇಗ: {trackingData.speed_kmh || 45} km/h
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: DRIVER, TELEMETRY & SIMULATION CONTROLS    */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* Driver & EMT Team Card */}
          <div className="bg-white rounded-3xl p-5 border border-navy-200/60 shadow-card space-y-4">
            <h4 className="text-xs font-bold text-navy-900 font-kannada border-b border-navy-100 pb-2">
              ವಾಹನ ಮತ್ತು ಚಾಲಕರ ಮಾಹಿತಿ (Driver & EMT Team):
            </h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-xl">
                  👨‍✈️
                </div>
                <div>
                  <h4 className="text-sm font-bold text-navy-900 font-kannada">
                    {trackingData.driver_name || 'ರಮೇಶ್ ಗೌಡ'} (ಚಾಲಕ)
                  </h4>
                  <p className="text-xs text-navy-500 font-mono font-medium">
                    EMT: {trackingData.emergency_technician || 'ಸುರೇಶ್ ಕುಮಾರ್'}
                  </p>
                  <p className="text-xs text-primary font-mono font-bold mt-0.5">
                    {trackingData.vehicle_number || 'KA-11-G-1081'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => window.open(`tel:${trackingData.driver_phone || '108'}`, '_self')}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-touch flex items-center space-x-1.5 active:scale-95 transition-decelerate"
              >
                <Phone className="w-4 h-4" />
                <span>ಕರೆ ಮಾಡಿ</span>
              </button>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-white rounded-3xl p-5 border border-navy-200/60 shadow-card space-y-3">
            <h4 className="text-xs font-bold text-navy-900 font-kannada border-b border-navy-100 pb-2">
              ಮಾರ್ಗ ವಿವರಗಳು (Location Details):
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-softblue border border-navy-100">
                <span className="text-[10px] text-navy-400 uppercase font-bold block flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-emergency" /> ಪಿಕಪ್ ಸ್ಥಳ (Pickup Location):
                </span>
                <p className="font-bold text-navy-900 mt-1 leading-snug">
                  {trackingData.pickup_location_kn || trackingData.pickup_location}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-softblue border border-navy-100">
                <span className="text-[10px] text-navy-400 uppercase font-bold block flex items-center">
                  <Ambulance className="w-3.5 h-3.5 mr-1 text-primary" /> ಗಮ್ಯಸ್ಥಾನ PHC (Destination):
                </span>
                <p className="font-bold text-navy-900 mt-1 leading-snug">
                  {trackingData.destination_facility_kn || trackingData.destination_facility}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="bg-navy-900 text-white rounded-3xl p-6 shadow-card space-y-4 border border-navy-800">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div>
                <span className="text-sm font-bold font-kannada text-cyan-300">
                  ಸಿಮ್ಯುಲೇಶನ್ ನಿಯಂತ್ರಣಗಳು (Demo Controls)
                </span>
                <p className="text-xs text-navy-300 mt-0.5">
                  ಸ್ಥಿತಿ ಮತ್ತು ನಕ್ಷೆಯ ಲೈವ್ ನವೀಕರಣಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ
                </p>
              </div>
              <button
                onClick={() => setAutoSimulate(!autoSimulate)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-decelerate active:scale-95 ${
                  autoSimulate
                    ? 'bg-emergency text-white border-emergency-200 animate-pulse'
                    : 'bg-navy-800 text-cyan-300 border-navy-700 hover:bg-navy-700'
                }`}
              >
                {autoSimulate ? '⏸ ವಿರಾಮ' : '▶️ ಸ್ವಯಂ ಪ್ಲೇ'}
              </button>
            </div>

            <div className="flex space-x-3 pt-1">
              <button
                onClick={handleNextStep}
                className="flex-1 bg-healthcare hover:bg-healthcare-hover text-white font-bold py-3.5 px-4 rounded-2xl shadow-touch text-xs flex items-center justify-center space-x-2 active:scale-95 transition-decelerate touch-manipulation"
              >
                <ChevronRight className="w-4 h-4" />
                <span className="font-kannada">ಮುಂದಿನ ಹಂತಕ್ಕೆ ಸರಿಸಿ (Next Step)</span>
              </button>

              <button
                onClick={handleReset}
                className="p-3.5 rounded-2xl bg-navy-800 text-navy-200 hover:text-white border border-navy-700 active:scale-95 transition-decelerate touch-manipulation"
                title="ಮರುಹೊಂದಿಸಿ (Reset)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
