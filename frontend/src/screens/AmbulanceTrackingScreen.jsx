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
  Play, 
  RotateCcw, 
  ShieldAlert, 
  Radio, 
  ExternalLink,
  Info,
  ChevronRight
} from 'lucide-react';
import { api, INITIAL_AMBULANCE_TRACKING } from '../services/api';
import { voiceWs } from '../services/websocket';

export default function AmbulanceTrackingScreen({ onBack, requestId = 'AMB-REQ-108-001' }) {
  const [trackingData, setTrackingData] = useState(INITIAL_AMBULANCE_TRACKING);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const autoSimTimerRef = useRef(null);

  useEffect(() => {
    // Initial load
    api.getAmbulanceTracking(requestId).then(data => {
      if (data) setTrackingData(data);
    });

    // Listen to local update events
    const handleAmbulanceUpdate = (e) => {
      if (e.detail?.ambulance) {
        setTrackingData(e.detail.ambulance);
      }
    };
    window.addEventListener('asha_ambulance_updated', handleAmbulanceUpdate);

    // Listen to backend WebSocket events (agreed schema)
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

  // Handle auto-simulation progression
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
    const resetData = api.resetAmbulanceSimulation();
    setTrackingData(resetData);
    setStatusMessage('ಸಿಮ್ಯುಲೇಶನ್ ಪ್ರಾರಂಭಿಕ ಹಂತಕ್ಕೆ ಮರುಹೊಂದಿಸಲಾಗಿದೆ.');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Status mapping supporting both uppercase and titlecase
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

  // SVG Map dimensions and coordinates
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

  // Path string
  const pathD = waypoints.reduce((acc, wp, i) => {
    const p = projectToSvg(wp.lat, wp.lng);
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto px-4 pt-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-navy-100 text-navy-700 hover:bg-navy-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-base font-bold font-kannada text-navy-900 leading-tight flex items-center justify-center space-x-1.5">
            <Ambulance className="w-4 h-4 text-emergency-600" />
            <span>108 ತುರ್ತು ವಾಹನ ಟ್ರ್ಯಾಕಿಂಗ್</span>
          </h2>
          <p className="text-[11px] text-navy-500 font-mono">Ambulance Simulation Screen</p>
        </div>
        <div className="w-9 h-9"></div>
      </div>

      {/* Prominent Disclaimer Banner */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 shadow-sm">
        <div className="flex items-start space-x-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs">
            <span className="font-bold text-amber-900 block font-kannada">
              ⚠️ ತರಬೇತಿ ಮತ್ತು ಪ್ರಾತ್ಯಕ್ಷಿಕೆ ಸಿಮ್ಯುಲೇಶನ್ ಮಾತ್ರ (SIMULATION ONLY)
            </span>
            <p className="text-amber-800 mt-0.5 leading-relaxed">
              ಇದು ಕೇವಲ ಡೆಮೊ ಸಿಮ್ಯುಲೇಶನ್ ಆಗಿದೆ. ಯಾವುದೇ ನಿಜವಾದ 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಅಥವಾ ತುರ್ತು ವಿಭಾಗವನ್ನು ಸಂಪರ್ಕಿಸಲಾಗಿಲ್ಲ.
            </p>
            <p className="text-[10px] text-amber-700 font-medium mt-0.5">
              {trackingData.simulation_disclaimer || 'No real emergency vehicle or dispatch center has been contacted.'}
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Ambulance Request ID & Summary Card */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] text-navy-400 font-mono uppercase font-bold block">
            Ambulance Request ID
          </span>
          <div className="text-base font-black text-navy-900 font-mono mt-0.5 flex items-center space-x-2">
            <span>{trackingData.id || trackingData.request_id}</span>
            <span className="text-[10px] bg-emergency-100 text-emergency-700 px-2 py-0.5 rounded-full font-bold">
              SIMULATED
            </span>
          </div>
          <p className="text-xs font-bold text-navy-700 font-kannada mt-1">
            ಫಲಾನುಭವಿ: {trackingData.beneficiary_name_kn || trackingData.beneficiary_name || 'Geetha M.'} ({trackingData.beneficiary_id || 'ASHA-KA-2024-0102'})
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="text-right">
          <span className="text-[10px] text-navy-400 font-mono block">ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ</span>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase mt-1 ${
            currentStatusUpper === 'ARRIVED'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : currentStatusUpper === 'COMPLETED'
              ? 'bg-navy-100 text-navy-800'
              : 'bg-emergency-600 text-white animate-pulse'
          }`}>
            {formatStatusDisplay(trackingData.status)}
          </span>
        </div>
      </div>

      {/* 5-Step Status Stepper */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-sm">
        <span className="text-xs font-bold text-navy-800 font-kannada block mb-3">
          ವಾಹನ ಪ್ರಗತಿ ಹಂತಗಳು (Ambulance Status Flow):
        </span>
        <div className="relative flex items-center justify-between">
          {/* Connector Line */}
          <div className="absolute top-3.5 left-4 right-4 h-1 bg-navy-100 -z-0">
            <div 
              className="h-full bg-teal-600 transition-all duration-500"
              style={{ width: `${Math.min(100, (Math.max(0, currentIdx) / (statuses.length - 1)) * 100)}%` }}
            ></div>
          </div>

          {statuses.map((s, idx) => {
            const isDone = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div key={s.label_en} className="flex flex-col items-center z-10 text-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isCurrent
                    ? 'bg-emergency-600 text-white ring-4 ring-emergency-100 shadow-emergency'
                    : isDone
                    ? 'bg-teal-600 text-white'
                    : 'bg-navy-100 text-navy-400'
                }`}>
                  {isDone ? '✓' : idx + 1}
                </div>
                <span className={`text-[10px] mt-1 font-semibold leading-tight max-w-[60px] ${
                  isCurrent ? 'text-emergency-700 font-bold' : isDone ? 'text-teal-800' : 'text-navy-400'
                }`}>
                  {s.label_kn}
                </span>
                <span className="text-[9px] text-navy-400 font-mono hidden sm:inline">
                  {s.label_en}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Simulated Map View */}
      <div className="bg-white rounded-3xl p-4 border border-navy-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-xs text-navy-900 font-kannada">
              ಲೈವ್ ಸಿಮ್ಯುಲೇಟೆಡ್ ಮಾರ್ಗ (Simulated Route Map)
            </h3>
          </div>
          <span className="text-[10px] font-mono bg-navy-100 text-navy-700 px-2 py-0.5 rounded-full flex items-center">
            <Radio className="w-3 h-3 mr-1 text-emerald-600 animate-pulse" />
            GPS: {(trackingData.current_latitude || 12.545).toFixed(3)}° N, {(trackingData.current_longitude || 76.909).toFixed(3)}° E
          </span>
        </div>

        {/* SVG Road Map Canvas */}
        <div className="relative w-full h-56 rounded-2xl bg-gradient-to-b from-navy-900 via-navy-950 to-navy-900 border border-navy-800 shadow-inner overflow-hidden">
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(#14B8A6 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          <svg viewBox="0 0 400 240" className="w-full h-full">
            {/* Base road outline */}
            <path
              d={pathD}
              fill="none"
              stroke="#1E293B"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Road route line */}
            <path
              d={pathD}
              fill="none"
              stroke="#0D9488"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Animated dashed active route */}
            <path
              d={pathD}
              fill="none"
              stroke="#5EEAD4"
              strokeWidth="2"
              strokeDasharray="6 6"
              strokeLinecap="round"
              className="animate-pulse"
            />

            {/* Waypoint milestone dots */}
            {waypoints.map((wp, i) => {
              const p = projectToSvg(wp.lat, wp.lng);
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  fill="#94A3B8"
                />
              );
            })}

            {/* Hospital Pin */}
            <g transform={`translate(${hospitalPos.x}, ${hospitalPos.y})`}>
              <circle r="12" fill="#047857" opacity="0.3" className="animate-ping" />
              <circle r="9" fill="#059669" />
              <text x="0" y="3" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">+</text>
              <text x="0" y="20" textAnchor="middle" fill="#A7F3D0" fontSize="8" fontWeight="bold">PHC Base</text>
            </g>

            {/* Beneficiary Pickup Pin */}
            <g transform={`translate(${pickupPos.x}, ${pickupPos.y})`}>
              <circle r="14" fill="#DC2626" opacity="0.35" className="animate-ping" />
              <circle r="9" fill="#DC2626" />
              <circle r="4" fill="#FFFFFF" />
              <text x="0" y="20" textAnchor="middle" fill="#FECACA" fontSize="8" fontWeight="bold">Pickup Location</text>
            </g>

            {/* Moving Ambulance Marker with Siren Pulse */}
            <g transform={`translate(${ambulancePos.x}, ${ambulancePos.y})`}>
              <circle r="18" fill="#EF4444" opacity="0.4" className="animate-ping" />
              <rect x="-11" y="-8" width="22" height="16" rx="4" fill="#FFFFFF" stroke="#DC2626" strokeWidth="2" />
              <rect x="-8" y="-6" width="7" height="6" fill="#38BDF8" rx="1" />
              <rect x="1" y="-6" width="7" height="6" fill="#DC2626" rx="1" />
              <circle cx="-5" cy="8" r="2.5" fill="#1E293B" />
              <circle cx="5" cy="8" r="2.5" fill="#1E293B" />
              <text x="0" y="-12" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">🚑 108</text>
            </g>
          </svg>

          {/* Floating ETA & Distance Pill */}
          <div className="absolute top-2.5 left-2.5 bg-navy-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-navy-700/80 shadow-md text-xs flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-bold">ETA: {trackingData.eta_minutes || 0} ನಿಮಿಷ</span>
            </div>
            <span className="text-navy-500">•</span>
            <div className="flex items-center space-x-1">
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono">{trackingData.distance_km || '2.4'} km</span>
            </div>
          </div>

          {/* Speed Indicator */}
          <div className="absolute bottom-2.5 right-2.5 bg-navy-900/90 backdrop-blur-md text-teal-300 font-mono text-[10px] px-2.5 py-1 rounded-lg border border-navy-700">
            ವೇಗ: {trackingData.speed_kmh || 45} km/h
          </div>
        </div>

        {/* Location Descriptions */}
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="p-2.5 rounded-xl bg-navy-50 border border-navy-100">
            <span className="text-[10px] text-navy-400 uppercase font-bold block flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-emergency-600" /> ಪಿಕಪ್ ಸ್ಥಳ (Pickup Location)
            </span>
            <p className="font-bold text-navy-900 mt-0.5 leading-snug">
              {trackingData.pickup_location_kn || trackingData.pickup_location}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-navy-50 border border-navy-100">
            <span className="text-[10px] text-navy-400 uppercase font-bold block flex items-center">
              <Ambulance className="w-3 h-3 mr-1 text-teal-600" /> ವಾಹನ ವಿವರ (Vehicle Details)
            </span>
            <p className="font-bold text-navy-900 mt-0.5 font-mono">
              {trackingData.vehicle_number || 'KA-11-G-1081'}
            </p>
            <span className="text-[10px] text-navy-600 mt-0.5 block">
              ಚಾಲಕ: {trackingData.driver_name || 'Ramesh Gowda'}
            </span>
          </div>
        </div>
      </div>

      {/* Driver & EMT Team Card */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            👨‍✈️
          </div>
          <div>
            <h4 className="text-xs font-bold text-navy-900 font-kannada">
              {trackingData.driver_name || 'Ramesh Gowda'} (ಚಾಲಕ)
            </h4>
            <p className="text-[11px] text-navy-500 font-mono">
              EMT: {trackingData.emergency_technician || 'Suresh Kumar'}
            </p>
          </div>
        </div>

        <button
          onClick={() => window.open(`tel:${trackingData.driver_phone || '108'}`, '_self')}
          className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-touch flex items-center space-x-1.5 touch-manipulation"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>ಕರೆ ಮಾಡಿ (Call)</span>
        </button>
      </div>

      {/* Simulation Stepping Controls */}
      <div className="bg-navy-900 text-white rounded-2xl p-4 shadow-touch space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold font-kannada text-teal-300">
              ಸಿಮ್ಯುಲೇಶನ್ ನಿಯಂತ್ರಣಗಳು (Demo Controls)
            </span>
            <p className="text-[11px] text-navy-300">
              ಸ್ಥಿತಿ ಮತ್ತು ನಕ್ಷೆಯ ಲೈವ್ ನವೀಕರಣಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ
            </p>
          </div>
          <button
            onClick={() => setAutoSimulate(!autoSimulate)}
            className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors ${
              autoSimulate
                ? 'bg-emergency-600 text-white border-emergency-400 animate-pulse'
                : 'bg-navy-800 text-teal-300 border-navy-700 hover:bg-navy-700'
            }`}
          >
            {autoSimulate ? '⏸ ಸ್ವಯಂ ಚಲನೆ ವಿರಾಮ' : '▶️ ಸ್ವಯಂ ಪ್ಲೇ (Auto-Play)'}
          </button>
        </div>

        <div className="flex space-x-2 pt-1">
          <button
            onClick={handleNextStep}
            className="flex-1 bg-teal-500 hover:bg-teal-400 active:scale-95 text-navy-950 font-black py-3 px-4 rounded-xl shadow text-xs flex items-center justify-center space-x-2 touch-manipulation"
          >
            <ChevronRight className="w-4 h-4" />
            <span>ಮುಂದಿನ ಹಂತಕ್ಕೆ ಸರಿಸಿ (Next Step)</span>
          </button>

          <button
            onClick={handleReset}
            className="p-3 rounded-xl bg-navy-800 text-navy-300 hover:text-white border border-navy-700 active:scale-95 touch-manipulation"
            title="ಮರುಹೊಂದಿಸಿ (Reset)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
