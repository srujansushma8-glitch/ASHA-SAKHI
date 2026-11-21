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
  ShieldAlert,
  Play,
  Pause,
  Building2,
  UserCheck,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Locate
} from 'lucide-react';
import { api, INITIAL_AMBULANCE_TRACKING } from '../services/api';
import { voiceWs } from '../services/websocket';
import GoogleAmbulanceMap from '../components/ambulance/GoogleAmbulanceMap';
import { t } from '../services/i18n';

export default function AmbulanceTrackingScreen({ 
  onBack, 
  onOpenDriverPortal,
  requestId = 'AMB-REQ-108-001',
  currentLanguage = 'kn'
}) {
  const [trackingData, setTrackingData] = useState(INITIAL_AMBULANCE_TRACKING);
  const [activeMode, setActiveMode] = useState('LIVE_GPS'); // 'LIVE_GPS' or 'DEMO_SIMULATION'
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const autoSimTimerRef = useRef(null);

  // Phase 4: 6 Required Emergency Lifecycle Statuses
  const STATUS_LIST = [
    { key: 'EMERGENCY_REQUESTED', label_en: 'Emergency Requested', label_kn: 'ತುರ್ತು ವಿನಂತಿ', label_hi: 'आपातकालीन अनुरोध' },
    { key: 'AMBULANCE_ASSIGNED', label_en: 'Ambulance Assigned', label_kn: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ನಿಯೋಜಿಸಲಾಗಿದೆ', label_hi: 'एम्बुलेंस आवंटित' },
    { key: 'EN_ROUTE', label_en: 'En Route', label_kn: 'ಮಾರ್ಗ ಮಧ್ಯದಲ್ಲಿದೆ', label_hi: 'मार्ग में' },
    { key: 'APPROACHING', label_en: 'Approaching', label_kn: 'ಸಮೀಪಿಸುತ್ತಿದೆ', label_hi: 'निकट आ रहा है' },
    { key: 'ARRIVED', label_en: 'Arrived', label_kn: 'ಸ್ಥಳ ತಲುಪಿದೆ', label_hi: 'पहुंच गया' },
    { key: 'TRIP_COMPLETED', label_en: 'Trip Completed', label_kn: 'ಪ್ರವಾಸ ಪೂರ್ಣಗೊಂಡಿದೆ', label_hi: 'यात्रा पूर्ण' }
  ];

  // Fetch initial telemetry
  useEffect(() => {
    api.getAmbulanceTracking(requestId).then(data => {
      if (data) {
        setTrackingData(data);
        if (data.tracking_mode) setActiveMode(data.tracking_mode);
      }
    });

    // 1. CustomEvent listener
    const handleAmbulanceUpdate = (e) => {
      if (e.detail?.ambulance) {
        setTrackingData(e.detail.ambulance);
        if (e.detail.ambulance.tracking_mode) {
          setActiveMode(e.detail.ambulance.tracking_mode);
        }
      }
    };
    window.addEventListener('asha_ambulance_updated', handleAmbulanceUpdate);

    // 2. BroadcastChannel for cross-tab communication (e.g. driver on second tab)
    let channel;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('asha_ambulance_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'AMBULANCE_UPDATE' && event.data.ambulance) {
            setTrackingData(event.data.ambulance);
            if (event.data.ambulance.tracking_mode) {
              setActiveMode(event.data.ambulance.tracking_mode);
            }
          }
        };
      }
    } catch (_) {}

    // 3. WebSocket real-time subscription
    const unsubWs = voiceWs.on('ambulance_update', (payload) => {
      if (payload) {
        setTrackingData(prev => ({
          ...prev,
          ...payload,
          updated_at: new Date().toISOString()
        }));
        if (payload.tracking_mode) setActiveMode(payload.tracking_mode);
      }
    });

    return () => {
      window.removeEventListener('asha_ambulance_updated', handleAmbulanceUpdate);
      if (channel) channel.close();
      unsubWs();
      if (autoSimTimerRef.current) clearInterval(autoSimTimerRef.current);
    };
  }, [requestId]);

  // Demo auto-simulation loop
  useEffect(() => {
    if (autoSimulate && activeMode === 'DEMO_SIMULATION') {
      autoSimTimerRef.current = setInterval(async () => {
        const next = await api.simulateNextAmbulanceStep(requestId);
        if (next.status === 'ARRIVED' || next.status === 'TRIP_COMPLETED') {
          setAutoSimulate(false);
          setStatusMessage(
            currentLanguage === 'kn' ? 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಸ್ಥಳಕ್ಕೆ ತಲುಪಿದೆ (ಸಿಮ್ಯುಲೇಶನ್ ಪೂರ್ಣ)' :
            currentLanguage === 'hi' ? 'एम्बुलेंस पहुंच गई (सिमुलेशन पूर्ण)' :
            'Ambulance has arrived at pickup location.'
          );
        }
      }, 3500);
    } else {
      if (autoSimTimerRef.current) clearInterval(autoSimTimerRef.current);
    }

    return () => {
      if (autoSimTimerRef.current) clearInterval(autoSimTimerRef.current);
    };
  }, [autoSimulate, activeMode, requestId, currentLanguage]);

  const handleNextStep = async () => {
    const updated = await api.simulateNextAmbulanceStep(requestId);
    setTrackingData(updated);
    setStatusMessage(
      currentLanguage === 'kn' ? `ರಸ್ತೆ ಸಿಮ್ಯುಲೇಶನ್ ಮುಂದುವರಿದಿದೆ: ${updated.status}` :
      currentLanguage === 'hi' ? `सिमुलेशन आगे बढ़ा: ${updated.status}` :
      `Simulation advanced: ${updated.status}`
    );
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleReset = () => {
    setAutoSimulate(false);
    const resetData = api.resetAmbulanceSimulation ? api.resetAmbulanceSimulation() : INITIAL_AMBULANCE_TRACKING;
    setTrackingData(resetData);
    setStatusMessage(
      currentLanguage === 'kn' ? 'ಸಿಮ್ಯುಲೇಶನ್ ಪ್ರಾರಂಭಿಕ ಹಂತಕ್ಕೆ ಮರುಹೊಂದಿಸಲಾಗಿದೆ.' :
      currentLanguage === 'hi' ? 'सिमुलेशन प्रारंभिक स्थिति पर रीसेट किया गया।' :
      'Simulation reset to hospital base.'
    );
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const copyDriverLink = () => {
    const driverUrl = `${window.location.origin}/?view=driver`;
    navigator.clipboard.writeText(driverUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const currentStatusUpper = (trackingData.status || 'AMBULANCE_ASSIGNED').toUpperCase().replace(/\s+/g, '_');
  
  // Normalize legacy status names
  const normalizedStatus = 
    currentStatusUpper === 'REQUESTED' ? 'EMERGENCY_REQUESTED' :
    currentStatusUpper === 'DISPATCHED' ? 'AMBULANCE_ASSIGNED' :
    currentStatusUpper === 'ON_THE_WAY' ? 'EN_ROUTE' :
    currentStatusUpper === 'COMPLETED' ? 'TRIP_COMPLETED' :
    currentStatusUpper;

  const currentIdx = STATUS_LIST.findIndex(s => s.key === normalizedStatus);

  const getStatusLabel = (key) => {
    const item = STATUS_LIST.find(s => s.key === key);
    if (!item) return key;
    return currentLanguage === 'kn' ? item.label_kn : currentLanguage === 'hi' ? item.label_hi : item.label_en;
  };

  const ambulanceLoc = {
    lat: Number(trackingData.current_latitude) || 12.5450,
    lng: Number(trackingData.current_longitude) || 76.9090
  };

  const patientLoc = {
    lat: Number(trackingData.pickup_lat) || 12.5835,
    lng: Number(trackingData.pickup_lng) || 76.9280
  };

  const hospitalLoc = {
    lat: Number(trackingData.base_hospital?.lat) || 12.5240,
    lng: Number(trackingData.base_hospital?.lng) || 76.8980
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12">
      {/* 1. Header with Back Button & Mode Indicator */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-[#F0DDE2] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] text-[#3B2A33] hover:bg-[#F9ECEC] active:scale-95 transition-decelerate"
            title={t('common.back', currentLanguage)}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] flex items-center justify-center text-[#B94A58]">
                <Ambulance className="w-5 h-5" />
              </div>
              <h1 className="text-lg lg:text-xl font-bold font-serif text-[#3B2A33] leading-tight">
                {t('ambulance.title', currentLanguage)}
              </h1>
            </div>
            <p className="text-xs text-[#7A6670] font-medium mt-1">
              {t('ambulance.subtitle', currentLanguage)}
            </p>
          </div>
        </div>

        {/* Phase 5: Clear Mode Tabs & Driver Portal Switch */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Selector Pill */}
          <div className="flex items-center p-1 bg-[#FDF6F5] rounded-2xl border border-[#F0DDE2] text-xs font-bold">
            <button
              onClick={() => setActiveMode('LIVE_GPS')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeMode === 'LIVE_GPS'
                  ? 'bg-white text-[#477A60] shadow-xs border border-[#C8EEDD]'
                  : 'text-[#7A6670] hover:text-[#3B2A33]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeMode === 'LIVE_GPS' ? 'bg-[#477A60] animate-ping' : 'bg-[#7A6670]'}`}></span>
              <span>LIVE GPS</span>
            </button>

            <button
              onClick={() => setActiveMode('DEMO_SIMULATION')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeMode === 'DEMO_SIMULATION'
                  ? 'bg-white text-[#B88745] shadow-xs border border-[#F2B84B]/40'
                  : 'text-[#7A6670] hover:text-[#3B2A33]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeMode === 'DEMO_SIMULATION' ? 'bg-[#B88745]' : 'bg-[#7A6670]'}`}></span>
              <span>DEMO MODE</span>
            </button>
          </div>

          {/* Phase 2: Dedicated Driver Portal Switch */}
          <button
            onClick={onOpenDriverPortal}
            className="px-3.5 py-2 rounded-2xl bg-[#A25B74] hover:bg-[#84455C] text-white text-xs font-bold shadow-touch flex items-center space-x-1.5 active:scale-95 transition-all"
            title="Open Ambulance Driver GPS Telemetry Cockpit"
          >
            <Smartphone className="w-4 h-4" />
            <span>Driver GPS Portal</span>
          </button>
        </div>
      </div>

      {/* Mode Disclaimer Banner */}
      {activeMode === 'DEMO_SIMULATION' ? (
        <div className="bg-[#FEF9EF] border border-[#F2B84B]/40 rounded-2xl p-4 shadow-subtle flex items-start space-x-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-[#B88745] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#3B2A33] block">
              🟡 DEMO SIMULATION MODE (Predefined Road Coordinates)
            </span>
            <p className="text-[#7A6670] mt-0.5 leading-relaxed">
              Demonstrating realistic road navigation along Mandya NH-275 corridor. To stream live GPS from an actual vehicle or smartphone, switch to <strong>LIVE GPS MODE</strong>.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#E8F7F1] border border-[#C8EEDD] rounded-2xl p-4 shadow-subtle flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-[#477A60] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#3B2A33] block">
                🟢 LIVE GPS MODE ACTIVE (Receiving Real Device Telemetry)
              </span>
              <p className="text-[#477A60] mt-0.5 leading-relaxed">
                Listening for real hardware coordinates from Driver GPS Portal over WebSockets. Open on phone to test:
              </p>
            </div>
          </div>
          <button
            onClick={copyDriverLink}
            className="px-3 py-1.5 rounded-xl bg-white text-[#477A60] border border-[#C8EEDD] font-bold text-[11px] shadow-xs hover:bg-[#E8F7F1] transition-all shrink-0"
          >
            {isCopied ? 'Link Copied!' : 'Copy Phone Link'}
          </button>
        </div>
      )}

      {statusMessage && (
        <div className="bg-[#477A60] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-card flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: REAL GOOGLE MAP & LIVE ROAD NAVIGATION (7)  */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#C47A92] font-mono uppercase font-bold block">
                {t('ambulance.requestId', currentLanguage)}
              </span>
              <div className="text-lg font-bold text-[#3B2A33] font-mono mt-0.5 flex items-center space-x-2">
                <span>{trackingData.id || trackingData.request_id || requestId}</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                  activeMode === 'LIVE_GPS'
                    ? 'bg-[#E8F7F1] text-[#477A60] border-[#C8EEDD]'
                    : 'bg-[#FEF9EF] text-[#B88745] border-[#F2B84B]/40'
                }`}>
                  {activeMode === 'LIVE_GPS' ? 'Real GPS' : 'Road Simulation'}
                </span>
              </div>
              <p className="text-xs font-bold text-[#3B2A33] mt-1">
                {t('common.beneficiary', currentLanguage)}: {trackingData.beneficiary_name || 'Geetha M.'} (High-Risk Obstetric Care)
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#C47A92] font-mono block font-medium">
                {t('ambulance.currentStatus', currentLanguage)}
              </span>
              <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase mt-1 ${
                normalizedStatus === 'ARRIVED'
                  ? 'bg-[#E8F7F1] text-[#477A60] border border-[#C8EEDD]'
                  : normalizedStatus === 'TRIP_COMPLETED'
                  ? 'bg-[#FDF6F5] text-[#3B2A33] border border-[#F0DDE2]'
                  : 'bg-[#B94A58] text-white shadow-touch animate-pulse'
              }`}>
                {getStatusLabel(normalizedStatus)}
              </span>
            </div>
          </div>

          {/* Phase 4: 6-Phase Emergency Stepper Progress Bar */}
          <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#3B2A33]">
                Emergency Response Lifecycle:
              </span>
              <span className="text-xs font-mono font-bold text-[#A25B74]">
                Step {Math.max(1, currentIdx + 1)} of {STATUS_LIST.length}
              </span>
            </div>

            <div className="relative flex items-center justify-between">
              <div className="absolute top-3.5 left-4 right-4 h-1 bg-[#FDF6F5] -z-0">
                <div 
                  className="h-full bg-gradient-to-r from-[#A25B74] to-[#C47A92] transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (Math.max(0, currentIdx) / (STATUS_LIST.length - 1)) * 100)}%` }}
                ></div>
              </div>

              {STATUS_LIST.map((s, idx) => {
                const isDone = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={s.key} className="flex flex-col items-center z-10 text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-decelerate ${
                      isCurrent
                        ? 'bg-[#B94A58] text-white ring-4 ring-[#B94A58]/20 shadow-touch'
                        : isDone
                        ? 'bg-[#477A60] text-white'
                        : 'bg-[#FDF6F5] text-[#C47A92] border border-[#F0DDE2]'
                    }`}>
                      {isDone ? '✓' : idx + 1}
                    </div>
                    <span className={`text-[10px] mt-1.5 font-semibold leading-tight max-w-[65px] ${
                      isCurrent ? 'text-[#B94A58] font-bold' : isDone ? 'text-[#3B2A33] font-bold' : 'text-[#C47A92]'
                    }`}>
                      {currentLanguage === 'kn' ? s.label_kn : currentLanguage === 'hi' ? s.label_hi : s.label_en}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Genuine Google Ambulance Map Component */}
          <GoogleAmbulanceMap
            ambulanceLocation={ambulanceLoc}
            patientLocation={patientLoc}
            hospitalLocation={hospitalLoc}
            status={normalizedStatus}
            etaMinutes={trackingData.eta_minutes ?? 8}
            distanceKm={trackingData.distance_km ?? 2.4}
            speedKmh={trackingData.speed_kmh ?? (normalizedStatus === 'ARRIVED' ? 0 : 42)}
            heading={trackingData.heading ?? 45}
            accuracy={trackingData.accuracy}
            trackingMode={activeMode}
            currentLanguage={currentLanguage}
            onRouteMetricsCalculated={({ distanceKm: calcDist, etaMinutes: calcEta }) => {
              setTrackingData(prev => ({
                ...prev,
                distance_km: calcDist,
                eta_minutes: calcEta
              }));
            }}
            onLocationDetected={(newCoords) => {
              setTrackingData(prev => ({
                ...prev,
                pickup_lat: newCoords.lat,
                pickup_lng: newCoords.lng
              }));
              setStatusMessage('Patient pickup coordinates set to your detected device GPS.');
              setTimeout(() => setStatusMessage(''), 3500);
            }}
          />
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: DRIVER TEAM, DESTINATION & CONTROLS (5)    */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* Driver & EMT Team Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card space-y-4">
            <h4 className="text-xs font-bold text-[#3B2A33] border-b border-[#F0DDE2] pb-2 flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-[#A25B74]" />
              <span>{t('ambulance.driverName', currentLanguage)} & EMT Team</span>
            </h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FDF6F5] text-[#A25B74] border border-[#F0DDE2] flex items-center justify-center font-bold text-xl shadow-inner">
                  👨‍✈️
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#3B2A33]">
                    {trackingData.driver_name || 'Ramesh Gowda'}
                  </h4>
                  <p className="text-xs text-[#7A6670] font-mono font-medium">
                    EMT: {trackingData.emergency_technician || 'Suresh Kumar'}
                  </p>
                  <p className="text-xs text-[#A25B74] font-mono font-bold mt-0.5">
                    {trackingData.vehicle_number || 'KA-11-G-1081'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => window.open(`tel:${trackingData.driver_phone || '108'}`, '_self')}
                className="bg-[#A25B74] hover:bg-[#84455C] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-touch flex items-center space-x-1.5 active:scale-95 transition-decelerate"
              >
                <Phone className="w-4 h-4" />
                <span>Call Driver</span>
              </button>
            </div>
          </div>

          {/* Location Details Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card space-y-3">
            <h4 className="text-xs font-bold text-[#3B2A33] border-b border-[#F0DDE2] pb-2 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-[#A25B74]" />
              <span>Pickup & Transfer Facility</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
                <span className="text-[10px] text-[#C47A92] uppercase font-bold block flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-[#B94A58]" /> Patient Pickup:
                </span>
                <p className="font-bold text-[#3B2A33] mt-1 leading-snug">
                  {trackingData.pickup_location || 'House #42, Main Road, Keregodu Village'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
                <span className="text-[10px] text-[#C47A92] uppercase font-bold block flex items-center">
                  <Building2 className="w-3.5 h-3.5 mr-1 text-[#A25B74]" /> Destination Hospital:
                </span>
                <p className="font-bold text-[#3B2A33] mt-1 leading-snug">
                  {trackingData.destination_facility || 'Mandya Taluk Hospital & 24/7 PHC'}
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Live Mode vs Demo Controls */}
          {activeMode === 'LIVE_GPS' ? (
            <div className="bg-white rounded-3xl p-6 shadow-card space-y-4 border border-[#F0DDE2]">
              <div className="flex items-center space-x-2 text-[#477A60] font-bold text-sm border-b border-[#F0DDE2] pb-3">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Live GPS Device Controls</span>
              </div>
              <p className="text-xs text-[#7A6670] leading-relaxed">
                ASHA Sakhi is currently receiving live coordinates from the driver's device. You can open the Driver Cockpit on this computer or a smartphone to control the trip:
              </p>
              <button
                onClick={onOpenDriverPortal}
                className="w-full bg-[#A25B74] hover:bg-[#84455C] text-white font-bold py-3.5 px-4 rounded-2xl shadow-touch text-xs flex items-center justify-center space-x-2 active:scale-95 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open Driver Cockpit Portal</span>
              </button>
            </div>
          ) : (
            <div className="bg-white text-[#3B2A33] rounded-3xl p-6 shadow-card space-y-4 border border-[#F0DDE2]">
              <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
                <div>
                  <span className="text-sm font-bold text-[#B88745] flex items-center space-x-1.5">
                    <Radio className="w-4 h-4 text-[#B88745] animate-pulse" />
                    <span>Demo Road Simulation Controls</span>
                  </span>
                  <p className="text-xs text-[#7A6670] mt-0.5">
                    Test live status transitions along Mandya road network
                  </p>
                </div>
                <button
                  onClick={() => setAutoSimulate(!autoSimulate)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-decelerate active:scale-95 flex items-center space-x-1 ${
                    autoSimulate
                      ? 'bg-[#B94A58] text-white border-[#B94A58]/30 animate-pulse'
                      : 'bg-[#FDF6F5] text-[#A25B74] border-[#F0DDE2] hover:bg-[#F9ECEC]'
                  }`}
                >
                  {autoSimulate ? (
                    <>
                      <Pause className="w-3 h-3" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      <span>Auto Play</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex space-x-3 pt-1">
                <button
                  onClick={handleNextStep}
                  className="flex-1 bg-[#A25B74] hover:bg-[#84455C] text-white font-bold py-3.5 px-4 rounded-2xl shadow-touch text-xs flex items-center justify-center space-x-2 active:scale-95 transition-decelerate"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>Advance Road Waypoint</span>
                </button>

                <button
                  onClick={handleReset}
                  className="p-3.5 rounded-2xl bg-[#FDF6F5] text-[#7A6670] hover:text-[#A25B74] border border-[#F0DDE2] active:scale-95 transition-decelerate"
                  title="Reset to Base"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
