import React, { useState, useEffect, useRef } from 'react';
import {
  Ambulance,
  Navigation,
  Play,
  Square,
  Radio,
  MapPin,
  Compass,
  Gauge,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Locate
} from 'lucide-react';
import { api, INITIAL_AMBULANCE_TRACKING } from '../services/api';
import GoogleAmbulanceMap from '../components/ambulance/GoogleAmbulanceMap';
import { t } from '../services/i18n';

export default function AmbulanceDriverScreen({
  onBack,
  requestId = 'AMB-REQ-108-001',
  currentLanguage = 'kn'
}) {
  const [trackingData, setTrackingData] = useState(INITIAL_AMBULANCE_TRACKING);
  const [isTripActive, setIsTripActive] = useState(false);
  const [gpsWatchId, setGpsWatchId] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [headingDeg, setHeadingDeg] = useState(0);
  const [telemetryCount, setTelemetryCount] = useState(0);
  const [lastTelemetryTime, setLastTelemetryTime] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const heartbeatTimerRef = useRef(null);
  const currentCoordsRef = useRef({ lat: 12.5450, lng: 76.9090 });

  // 6 Emergency Lifecycle Statuses (Phase 4)
  const STATUSES = [
    { key: 'EMERGENCY_REQUESTED', label: 'Emergency Requested', label_kn: 'ತುರ್ತು ವಿನಂತಿ', label_hi: 'आपातकालीन अनुरोध' },
    { key: 'AMBULANCE_ASSIGNED', label: 'Ambulance Assigned', label_kn: 'ಆಂಬ್ಯುಲೆನ್ಸ್ ನಿಯೋಜಿಸಲಾಗಿದೆ', label_hi: 'एम्बुलेंस आवंटित' },
    { key: 'EN_ROUTE', label: 'En Route', label_kn: 'ಮಾರ್ಗ ಮಧ್ಯದಲ್ಲಿದೆ', label_hi: 'मार्ग में' },
    { key: 'APPROACHING', label: 'Approaching', label_kn: 'ಸಮೀಪಿಸುತ್ತಿದೆ', label_hi: 'निकट आ रहा है' },
    { key: 'ARRIVED', label: 'Arrived', label_kn: 'ಸ್ಥಳ ತಲುಪಿದೆ', label_hi: 'पहुंच गया' },
    { key: 'TRIP_COMPLETED', label: 'Trip Completed', label_kn: 'ಪ್ರವಾಸ ಪೂರ್ಣಗೊಂಡಿದೆ', label_hi: 'यात्रा पूर्ण' }
  ];

  // Fetch initial tracking record
  useEffect(() => {
    api.getAmbulanceTracking(requestId).then(data => {
      if (data) {
        setTrackingData(data);
        if (data.current_latitude && data.current_longitude) {
          currentCoordsRef.current = {
            lat: Number(data.current_latitude),
            lng: Number(data.current_longitude)
          };
        }
      }
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (gpsWatchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(gpsWatchId);
      }
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    };
  }, [requestId]);

  // Transmit GPS Telemetry to Backend & ASHA Dashboard
  const transmitTelemetry = async (coords, statusOverride = null) => {
    const lat = Number(coords.latitude || coords.lat);
    const lng = Number(coords.longitude || coords.lng);
    const acc = coords.accuracy || null;
    const speed = coords.speed !== null && coords.speed !== undefined ? Math.round(coords.speed * 3.6) : speedKmh;
    const head = coords.heading !== null && coords.heading !== undefined ? Math.round(coords.heading) : headingDeg;

    currentCoordsRef.current = { lat, lng };
    setGpsAccuracy(acc);
    if (speed !== undefined) setSpeedKmh(speed);
    if (head !== undefined) setHeadingDeg(head);

    const activeStatus = statusOverride || trackingData.status || 'EN_ROUTE';

    const telemetryPayload = {
      latitude: lat,
      longitude: lng,
      accuracy: acc,
      speed_kmh: speed,
      heading: head,
      status: activeStatus,
      tracking_mode: 'LIVE_GPS',
      trip_active: true,
      driver_name: trackingData.driver_name || 'Ramesh Gowda',
      driver_phone: trackingData.driver_phone || '+91 94480 10801',
      vehicle_number: trackingData.vehicle_number || 'KA-11-G-1081'
    };

    setTrackingData(prev => ({
      ...prev,
      ...telemetryPayload,
      current_latitude: lat,
      current_longitude: lng
    }));

    setTelemetryCount(prev => prev + 1);
    setLastTelemetryTime(new Date().toLocaleTimeString());

    await api.sendAmbulanceTelemetry(requestId, telemetryPayload);
  };

  // Start Trip (Phase 2): Request location permission & watch position
  const handleStartTrip = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsError(null);
    setIsTripActive(true);
    setStatusMessage('GPS tracking started. Broadcasting real device coordinates...');

    // 1. Get initial GPS location immediately
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        transmitTelemetry(pos.coords, 'AMBULANCE_ASSIGNED');
      },
      (err) => {
        console.warn('[DriverGPS] Initial position error:', err);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );

    // 2. Start high-frequency continuous position watch
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setGpsError(null);
        transmitTelemetry(position.coords);
      },
      (error) => {
        console.error('[DriverGPS] watchPosition error:', error);
        if (error.code === 1) {
          setGpsError('Location permission was denied. Please allow location access in your device settings.');
        } else if (error.code === 2) {
          setGpsError('GPS signal unavailable. Please ensure location is turned ON and move to an open area.');
        } else if (error.code === 3) {
          setGpsError('GPS request timed out. Retrying...');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000
      }
    );

    setGpsWatchId(watchId);

    // 3. Heartbeat transmitter every 4 seconds to maintain connection
    heartbeatTimerRef.current = setInterval(() => {
      if (currentCoordsRef.current) {
        transmitTelemetry(currentCoordsRef.current);
      }
    }, 4000);

    setTimeout(() => setStatusMessage(''), 3500);
  };

  // Stop Trip (Phase 2): Terminate watchPosition and finalize trip
  const handleStopTrip = async () => {
    if (gpsWatchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(gpsWatchId);
      setGpsWatchId(null);
    }
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
    }

    setIsTripActive(false);
    await api.stopAmbulanceTrip(requestId);

    setTrackingData(prev => ({
      ...prev,
      status: 'TRIP_COMPLETED',
      trip_active: false
    }));

    setStatusMessage('Trip completed. Vehicle returned to available status.');
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Manual Status Transition
  const handleSelectStatus = async (newStatus) => {
    setTrackingData(prev => ({ ...prev, status: newStatus }));
    await transmitTelemetry(currentCoordsRef.current, newStatus);
    setStatusMessage(`Status updated to: ${newStatus.replace(/_/g, ' ')}`);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const copyMobileLink = () => {
    const mobileUrl = `${window.location.origin}/?view=driver`;
    navigator.clipboard.writeText(mobileUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const ambulanceLoc = {
    lat: Number(trackingData.current_latitude) || currentCoordsRef.current.lat,
    lng: Number(trackingData.current_longitude) || currentCoordsRef.current.lng
  };

  const patientLoc = {
    lat: Number(trackingData.pickup_lat) || 12.5835,
    lng: Number(trackingData.pickup_lng) || 76.9280
  };

  const hospitalLoc = {
    lat: Number(trackingData.base_hospital?.lat) || 12.5240,
    lng: Number(trackingData.base_hospital?.lng) || 76.8980
  };

  const currentStatusIdx = STATUSES.findIndex(s => s.key === trackingData.status);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12">
      {/* 1. Header with Vehicle Info & Mode */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-[#F0DDE2] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] text-[#3B2A33] hover:bg-[#F9ECEC] active:scale-95 transition-decelerate"
            title="Back to ASHA Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#A25B74] text-white flex items-center justify-center font-bold shadow-md">
                <Ambulance className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold font-serif text-[#3B2A33] leading-tight flex items-center space-x-2">
                  <span>108 Ambulance Driver GPS Portal</span>
                  <span className="text-xs font-mono font-bold bg-[#E8F7F1] text-[#477A60] px-2.5 py-0.5 rounded-full border border-[#C8EEDD]">
                    {isTripActive ? 'LIVE BROADCASTING' : 'READY'}
                  </span>
                </h1>
                <p className="text-xs text-[#7A6670] font-medium mt-0.5">
                  Driver: {trackingData.driver_name || 'Ramesh Gowda'} • Vehicle: {trackingData.vehicle_number || 'KA-11-G-1081'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Start / Stop Trip Primary Action Button */}
        <div className="flex items-center space-x-3">
          {!isTripActive ? (
            <button
              onClick={handleStartTrip}
              className="bg-[#477A60] hover:bg-[#38624C] text-white font-bold py-3 px-6 rounded-2xl shadow-touch flex items-center space-x-2 active:scale-95 transition-all text-xs"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START TRIP & BROADCAST GPS</span>
            </button>
          ) : (
            <button
              onClick={handleStopTrip}
              className="bg-[#B94A58] hover:bg-[#963744] text-white font-bold py-3 px-6 rounded-2xl shadow-touch flex items-center space-x-2 active:scale-95 transition-all text-xs animate-pulse"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>STOP TRIP & COMPLETE</span>
            </button>
          )}
        </div>
      </div>

      {/* Network or GPS Alert Messages */}
      {!isOnline && (
        <div className="bg-[#FCF1F1] border border-[#B94A58]/30 rounded-2xl p-4 text-xs text-[#B94A58] flex items-center space-x-2 font-bold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Device is currently offline. GPS coordinates will synchronize once connection resumes.</span>
        </div>
      )}

      {gpsError && (
        <div className="bg-[#FEF9EF] border border-[#F2B84B]/50 rounded-2xl p-4 text-xs text-[#B88745] flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">GPS Hardware Notice:</span>
            <p className="mt-0.5">{gpsError}</p>
          </div>
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
        {/* LEFT COLUMN: LIVE COCKPIT & HARDWARE GPS TELEMETRY (5)  */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Real-time Hardware Telemetry HUD Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
              <div className="flex items-center space-x-2">
                <Radio className={`w-4 h-4 ${isTripActive ? 'text-[#477A60] animate-pulse' : 'text-[#7A6670]'}`} />
                <h3 className="text-xs font-bold text-[#3B2A33] uppercase tracking-wider font-mono">
                  Hardware Sensor Readout
                </h3>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                gpsAccuracy && gpsAccuracy < 15
                  ? 'bg-[#E8F7F1] text-[#477A60] border border-[#C8EEDD]'
                  : gpsAccuracy && gpsAccuracy < 50
                  ? 'bg-[#FEF9EF] text-[#B88745] border border-[#F2B84B]/40'
                  : 'bg-[#FDF6F5] text-[#7A6670] border border-[#F0DDE2]'
              }`}>
                {gpsAccuracy ? `±${gpsAccuracy.toFixed(1)}m accuracy` : 'Standby'}
              </span>
            </div>

            {/* Coordinates Grid */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
                <span className="text-[10px] text-[#7A6670] font-mono block">LATITUDE</span>
                <span className="text-base font-bold text-[#3B2A33] font-mono mt-0.5 block">
                  {ambulanceLoc.lat.toFixed(5)}° N
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
                <span className="text-[10px] text-[#7A6670] font-mono block">LONGITUDE</span>
                <span className="text-base font-bold text-[#3B2A33] font-mono mt-0.5 block">
                  {ambulanceLoc.lng.toFixed(5)}° E
                </span>
              </div>
            </div>

            {/* Speed & Heading Gauge */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] flex items-center justify-center space-x-2">
                <Gauge className="w-5 h-5 text-[#A25B74]" />
                <div className="text-left">
                  <span className="text-[10px] text-[#7A6670] font-mono block">SPEED</span>
                  <span className="text-sm font-bold text-[#3B2A33] font-mono">{speedKmh} km/h</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] flex items-center justify-center space-x-2">
                <Compass className="w-5 h-5 text-[#C47A92]" />
                <div className="text-left">
                  <span className="text-[10px] text-[#7A6670] font-mono block">HEADING</span>
                  <span className="text-sm font-bold text-[#3B2A33] font-mono">{headingDeg}°</span>
                </div>
              </div>
            </div>

            {/* Packet Stream Stats */}
            <div className="pt-2 border-t border-[#F0DDE2] flex items-center justify-between text-[11px] text-[#7A6670] font-mono">
              <span>Packets Transmitted: <strong className="text-[#3B2A33]">{telemetryCount}</strong></span>
              <span>Last Fix: <strong className="text-[#3B2A33]">{lastTelemetryTime || 'None'}</strong></span>
            </div>
          </div>

          {/* Phase 4: Emergency Lifecycle Progression Stepper */}
          <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card space-y-3">
            <h3 className="text-xs font-bold text-[#3B2A33] border-b border-[#F0DDE2] pb-2 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#A25B74]" />
              <span>Phase 4 Emergency Status Controls</span>
            </h3>
            <p className="text-[11px] text-[#7A6670] leading-snug">
              Tap any status to update your live transport phase across the ASHA Sakhi emergency network:
            </p>

            <div className="space-y-2 pt-1">
              {STATUSES.map((st, idx) => {
                const isSelected = trackingData.status === st.key;
                const isPassed = idx < currentStatusIdx;
                return (
                  <button
                    key={st.key}
                    onClick={() => handleSelectStatus(st.key)}
                    className={`w-full text-left p-3 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all active:scale-98 ${
                      isSelected
                        ? 'bg-[#A25B74] text-white border-[#A25B74] shadow-touch'
                        : isPassed
                        ? 'bg-[#E8F7F1] text-[#477A60] border-[#C8EEDD]'
                        : 'bg-[#FDF6F5] text-[#3B2A33] border-[#F0DDE2] hover:bg-[#F9ECEC]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                        isSelected
                          ? 'bg-white text-[#A25B74]'
                          : isPassed
                          ? 'bg-[#477A60] text-white'
                          : 'bg-white text-[#7A6670] border border-[#F0DDE2]'
                      }`}>
                        {isPassed ? '✓' : idx + 1}
                      </span>
                      <span>{st.label} ({st.label_kn})</span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full">ACTIVE</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Driver Link Card (Second Device Testing) */}
          <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card space-y-3">
            <div className="flex items-center space-x-2 text-[#A25B74] font-bold text-xs">
              <Smartphone className="w-4 h-4" />
              <span>Open on Driver's Smartphone</span>
            </div>
            <p className="text-[11px] text-[#7A6670] leading-relaxed">
              Open this URL on the ambulance driver's mobile phone browser to test streaming live smartphone GPS coordinates to this dashboard:
            </p>
            <div className="flex items-center space-x-2 bg-[#FDF6F5] p-2.5 rounded-xl border border-[#F0DDE2] text-xs font-mono text-[#3B2A33] overflow-hidden">
              <span className="truncate flex-1">{window.location.origin}/?view=driver</span>
              <button
                onClick={copyMobileLink}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#F0DDE2] text-[#A25B74] font-bold text-[11px] hover:bg-[#F9ECEC] active:scale-95 transition-all shrink-0"
              >
                {isCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: TURN-BY-TURN ROAD NAVIGATION MAP (7)      */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Patient Referral Banner */}
          <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-[#C47A92] font-mono uppercase font-bold block">
                Emergency Case Referral
              </span>
              <h3 className="text-base font-bold text-[#3B2A33] mt-0.5">
                Geetha M. • Keregodu Village
              </h3>
              <p className="text-xs text-[#B94A58] font-bold mt-0.5">
                Pre-eclampsia (High Blood Pressure & Severe Anemia)
              </p>
            </div>

            <button
              onClick={() => window.open('tel:108', '_self')}
              className="px-4 py-2.5 rounded-xl bg-[#A25B74] hover:bg-[#84455C] text-white font-bold text-xs flex items-center space-x-1.5 shadow-touch self-start sm:self-auto"
            >
              <Phone className="w-4 h-4" />
              <span>Call PHC Doctor</span>
            </button>
          </div>

          {/* Embedded Google Maps Component */}
          <GoogleAmbulanceMap
            ambulanceLocation={ambulanceLoc}
            patientLocation={patientLoc}
            hospitalLocation={hospitalLoc}
            status={trackingData.status || 'AMBULANCE_ASSIGNED'}
            etaMinutes={trackingData.eta_minutes ?? 8}
            distanceKm={trackingData.distance_km ?? 2.4}
            speedKmh={speedKmh}
            heading={headingDeg}
            accuracy={gpsAccuracy}
            trackingMode={trackingData.tracking_mode || 'LIVE_GPS'}
            currentLanguage={currentLanguage}
          />
        </div>
      </div>
    </div>
  );
}
