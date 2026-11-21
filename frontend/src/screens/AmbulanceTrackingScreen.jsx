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
  UserCheck
} from 'lucide-react';
import { api, INITIAL_AMBULANCE_TRACKING } from '../services/api';
import { voiceWs } from '../services/websocket';
import GoogleAmbulanceMap from '../components/ambulance/GoogleAmbulanceMap';
import { t } from '../services/i18n';

export default function AmbulanceTrackingScreen({ 
  onBack, 
  requestId = 'AMB-REQ-108-001',
  currentLanguage = 'kn'
}) {
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
          setStatusMessage(
            currentLanguage === 'kn' ? 'ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಿಮ್ಯುಲೇಶನ್ ಪೂರ್ಣಗೊಂಡಿದೆ' :
            currentLanguage === 'hi' ? 'एम्बुलेंस सिमुलेशन पूरा हुआ' :
            'Ambulance simulation completed'
          );
        }
      }, 3500);
    } else {
      if (autoSimTimerRef.current) clearInterval(autoSimTimerRef.current);
    }

    return () => {
      if (autoSimTimerRef.current) clearInterval(autoSimTimerRef.current);
    };
  }, [autoSimulate, requestId, currentLanguage]);

  const handleNextStep = async () => {
    const updated = await api.simulateNextAmbulanceStep(requestId);
    setTrackingData(updated);
    const statusLabel = formatStatusDisplay(updated.status);
    setStatusMessage(
      currentLanguage === 'kn' ? `ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ: ${statusLabel}` :
      currentLanguage === 'hi' ? `स्थिति अपडेट: ${statusLabel}` :
      `Status updated: ${statusLabel}`
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
      'Simulation reset to initial state.'
    );
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const statuses = [
    { key: 'REQUESTED', label: t('ambulance.requested', currentLanguage) },
    { key: 'DISPATCHED', label: t('ambulance.dispatched', currentLanguage) },
    { key: 'ON_THE_WAY', label: t('ambulance.onTheWay', currentLanguage) },
    { key: 'ARRIVED', label: t('ambulance.arrived', currentLanguage) },
    { key: 'COMPLETED', label: t('ambulance.completed', currentLanguage) }
  ];

  const currentStatusUpper = (trackingData.status || 'REQUESTED').toUpperCase().replace(/\s+/g, '_');
  const currentIdx = statuses.findIndex(s => s.key === currentStatusUpper);

  const formatStatusDisplay = (statusStr) => {
    if (!statusStr) return t('ambulance.requested', currentLanguage);
    const cleanKey = statusStr.toUpperCase().replace(/\s+/g, '_');
    const matched = statuses.find(s => s.key === cleanKey);
    if (matched) return matched.label;
    return statusStr.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
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
      {/* 1. Header with Back Button */}
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
              <span className="text-xs font-mono font-bold bg-[#FDF6F5] text-[#A25B74] px-2.5 py-0.5 rounded-full border border-[#F0DDE2]">
                GPS Telemetry
              </span>
            </div>
            <p className="text-xs text-[#7A6670] font-medium mt-1">
              {t('ambulance.subtitle', currentLanguage)}
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FDF6F5] text-[#A25B74] border border-[#F0DDE2]">
            <Radio className="w-3 h-3 text-[#B94A58] animate-pulse" />
            <span>108 SIMULATION</span>
          </span>
        </div>
      </div>

      {/* 2. Simulation Disclaimer Banner */}
      <div className="bg-[#FEF9EF] border border-[#F2B84B]/40 rounded-2xl p-4 shadow-subtle">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-[#B88745] shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs">
            <span className="font-bold text-[#3B2A33] block">
              ⚠️ {t('ambulance.disclaimerTitle', currentLanguage)}
            </span>
            <p className="text-[#3B2A33] mt-0.5 leading-relaxed font-medium">
              {t('ambulance.disclaimerText', currentLanguage)}
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-[#477A60] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-card flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: INTERACTIVE GOOGLE MAP & TELEMETRY HUD (7) */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Ambulance Request Summary Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#C47A92] font-mono uppercase font-bold block">
                {t('ambulance.requestId', currentLanguage)}
              </span>
              <div className="text-lg font-bold text-[#3B2A33] font-mono mt-0.5 flex items-center space-x-2">
                <span>{trackingData.id || trackingData.request_id || requestId}</span>
                <span className="text-[10px] bg-[#FDF6F5] text-[#A25B74] px-2.5 py-0.5 rounded-full font-bold border border-[#F0DDE2]">
                  {t('common.simulated', currentLanguage)}
                </span>
              </div>
              <p className="text-xs font-bold text-[#3B2A33] mt-1">
                {t('common.beneficiary', currentLanguage)}: {trackingData.beneficiary_name || 'Geetha M.'} ({trackingData.beneficiary_id || 'ASHA-KA-2024-0102'})
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#C47A92] font-mono block font-medium">
                {t('ambulance.currentStatus', currentLanguage)}
              </span>
              <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase mt-1 ${
                currentStatusUpper === 'ARRIVED'
                  ? 'bg-[#E8F7F1] text-[#477A60] border border-[#C8EEDD]'
                  : currentStatusUpper === 'COMPLETED'
                  ? 'bg-[#FDF6F5] text-[#3B2A33] border border-[#F0DDE2]'
                  : 'bg-[#B94A58] text-white shadow-touch animate-pulse'
              }`}>
                {formatStatusDisplay(trackingData.status)}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card">
            <span className="text-xs font-bold text-[#3B2A33] block mb-3">
              {t('ambulance.currentStatus', currentLanguage)}:
            </span>
            <div className="relative flex items-center justify-between">
              <div className="absolute top-3.5 left-4 right-4 h-1 bg-[#FDF6F5] -z-0">
                <div 
                  className="h-full bg-gradient-to-r from-[#A25B74] to-[#C47A92] transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (Math.max(0, currentIdx) / (statuses.length - 1)) * 100)}%` }}
                ></div>
              </div>

              {statuses.map((s, idx) => {
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
                    <span className={`text-[11px] mt-1.5 font-semibold leading-tight max-w-[70px] ${
                      isCurrent ? 'text-[#B94A58] font-bold' : isDone ? 'text-[#3B2A33] font-bold' : 'text-[#C47A92]'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Google Ambulance Map Component */}
          <GoogleAmbulanceMap
            ambulanceLocation={ambulanceLoc}
            patientLocation={patientLoc}
            hospitalLocation={hospitalLoc}
            status={trackingData.status || 'DISPATCHED'}
            etaMinutes={trackingData.eta_minutes ?? 8}
            distanceKm={trackingData.distance_km ?? 2.4}
            currentLanguage={currentLanguage}
            onLocationDetected={(newCoords) => {
              setTrackingData(prev => ({
                ...prev,
                pickup_lat: newCoords.lat,
                pickup_lng: newCoords.lng
              }));
              setStatusMessage(
                currentLanguage === 'kn' ? 'ನಿಮ್ಮ ಜಿಪಿಎಸ್ ಸ್ಥಳವನ್ನು ಪಿಕಪ್ ಬಿಂದುವಾಗಿ ಹೊಂದಿಸಲಾಗಿದೆ.' :
                currentLanguage === 'hi' ? 'आपका जीपीएस स्थान पिकअप बिंदु के रूप में सेट किया गया।' :
                'Patient pickup set to your current GPS position.'
              );
              setTimeout(() => setStatusMessage(''), 3500);
            }}
          />
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: DRIVER, TELEMETRY & SIMULATION CONTROLS    */}
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
                    {trackingData.driver_name || 'Ramesh Gowda'} ({currentLanguage === 'kn' ? 'ಚಾಲಕ' : currentLanguage === 'hi' ? 'चालक' : 'Driver'})
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
                <span>{currentLanguage === 'kn' ? 'ಕರೆ ಮಾಡಿ' : currentLanguage === 'hi' ? 'कॉल करें' : 'Call'}</span>
              </button>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card space-y-3">
            <h4 className="text-xs font-bold text-[#3B2A33] border-b border-[#F0DDE2] pb-2 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-[#A25B74]" />
              <span>{t('ambulance.patientLocation', currentLanguage)}</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
                <span className="text-[10px] text-[#C47A92] uppercase font-bold block flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-[#B94A58]" /> {t('ambulance.patientLocation', currentLanguage)}:
                </span>
                <p className="font-bold text-[#3B2A33] mt-1 leading-snug">
                  {trackingData.pickup_location || 'House #42, Main Road, Shivalli Village'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
                <span className="text-[10px] text-[#C47A92] uppercase font-bold block flex items-center">
                  <Building2 className="w-3.5 h-3.5 mr-1 text-[#A25B74]" /> {t('ambulance.hospitalLocation', currentLanguage)}:
                </span>
                <p className="font-bold text-[#3B2A33] mt-1 leading-snug">
                  {trackingData.destination_facility || 'Mandya Taluk Hospital & 24/7 PHC'}
                </p>
              </div>
            </div>
          </div>

          {/* Rose & Blush Simulation Controls */}
          <div className="bg-white text-[#3B2A33] rounded-3xl p-6 shadow-card space-y-4 border border-[#F0DDE2]">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
              <div>
                <span className="text-sm font-bold text-[#A25B74] flex items-center space-x-1.5">
                  <Radio className="w-4 h-4 text-[#B94A58] animate-pulse" />
                  <span>{currentLanguage === 'kn' ? 'ಸಿಮ್ಯುಲೇಶನ್ ನಿಯಂತ್ರಣಗಳು (Demo Controls)' : currentLanguage === 'hi' ? 'सिमुलेशन नियंत्रण (Demo Controls)' : 'Simulation Controls (Demo Mode)'}</span>
                </span>
                <p className="text-xs text-[#7A6670] mt-0.5">
                  {currentLanguage === 'kn' ? 'ಸ್ಥಿತಿ ಮತ್ತು ನಕ್ಷೆಯ ಲೈವ್ ನವೀಕರಣಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ' : currentLanguage === 'hi' ? 'स्थिति और मानचित्र के लाइव अपडेट्स जांचें' : 'Test live status transitions and route telemetry'}
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
                    <span>{currentLanguage === 'kn' ? 'ವಿರಾಮ' : currentLanguage === 'hi' ? 'रोकें' : 'Pause'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    <span>{currentLanguage === 'kn' ? 'ಸ್ವಯಂ ಪ್ಲೇ' : currentLanguage === 'hi' ? 'ऑटो प्ले' : 'Auto Play'}</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex space-x-3 pt-1">
              <button
                onClick={handleNextStep}
                className="flex-1 bg-[#A25B74] hover:bg-[#84455C] text-white font-bold py-3.5 px-4 rounded-2xl shadow-touch text-xs flex items-center justify-center space-x-2 active:scale-95 transition-decelerate touch-manipulation"
              >
                <ChevronRight className="w-4 h-4" />
                <span>{t('ambulance.demoAdvanceStep', currentLanguage)}</span>
              </button>

              <button
                onClick={handleReset}
                className="p-3.5 rounded-2xl bg-[#FDF6F5] text-[#7A6670] hover:text-[#A25B74] border border-[#F0DDE2] active:scale-95 transition-decelerate touch-manipulation"
                title={t('ambulance.demoReset', currentLanguage)}
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
