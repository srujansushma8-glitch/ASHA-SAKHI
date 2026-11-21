import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  PhoneCall, 
  Ambulance, 
  MapPin, 
  CheckCircle, 
  Clock, 
  ArrowLeft, 
  ChevronRight, 
  ShieldAlert, 
  RotateCw, 
  Navigation, 
  ExternalLink, 
  HeartPulse
} from 'lucide-react';
import { api } from '../services/api';

export default function EmergencyAlertScreen({ onBack, alertData, onTrackAmbulance }) {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(alertData || null);
  const [actionStatusToast, setActionStatusToast] = useState('');
  const [ambulanceRequest, setAmbulanceRequest] = useState(null);
  const [isAdvancingAmbulance, setIsAdvancingAmbulance] = useState(false);

  useEffect(() => {
    loadAlertsAndAmbulance();
  }, [alertData]);

  const loadAlertsAndAmbulance = async () => {
    const list = await api.getEmergencyAlerts();
    setAlerts(list);
    const active = selectedAlert || (list.length > 0 ? list[0] : null);
    if (!selectedAlert && active) {
      setSelectedAlert(active);
    }

    try {
      const ambData = await api.getAmbulanceTracking();
      if (ambData) {
        setAmbulanceRequest(ambData);
      }
    } catch (e) {
      console.warn('Could not load ambulance tracking', e);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedAlert) return;
    const updated = { ...selectedAlert, referral_status: newStatus };
    setSelectedAlert(updated);
    await api.updateEmergencyAlert(updated);
    loadAlertsAndAmbulance();
    setActionStatusToast(`ರೆಫರಲ್ ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ: ${newStatus}`);
    setTimeout(() => setActionStatusToast(''), 3500);
  };

  const handleCallAmbulance = async () => {
    window.open('tel:108', '_self');
    handleUpdateStatus('108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಂಪರ್ಕಿಸಲಾಗಿದೆ (108 Ambulance Called)');
  };

  const handleCallMedicalOfficer = () => {
    window.open('tel:94498XXXXX', '_self');
    handleUpdateStatus('PHC ವೈದ್ಯಾಧಿಕಾರಿಗೆ ಮಾಹಿತಿ ನೀಡಲಾಗಿದೆ (MO Informed)');
  };

  const handleAdvanceSimulationStep = async () => {
    try {
      setIsAdvancingAmbulance(true);
      const updated = await api.simulateNextAmbulanceStep();
      if (updated) {
        setAmbulanceRequest(updated);
        setActionStatusToast(`ಆಂಬ್ಯುಲೆನ್ಸ್ ಸ್ಥಿತಿ: ${updated.status}`);
        setTimeout(() => setActionStatusToast(''), 3000);
      }
    } catch (e) {
      console.warn('Simulation step advance error', e);
    } finally {
      setIsAdvancingAmbulance(false);
    }
  };

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
              <h1 className="text-lg lg:text-xl font-bold font-kannada text-emergency leading-tight flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-emergency animate-pulse" />
                <span>ತುರ್ತು ಅಪಾಯಕಾರಿ ಎಚ್ಚರಿಕೆ (Emergency Danger Sign & Referral)</span>
              </h1>
              <span className="text-xs font-mono font-bold bg-emergency-100 text-emergency px-2.5 py-0.5 rounded-full border border-emergency-200">
                MoHFW Verified
              </span>
            </div>
            <p className="text-xs text-navy-500 font-medium mt-0.5">
              ತುರ್ತು ರೆಫರಲ್ ನಿರ್ದೇಶನ ಮತ್ತು 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ನಿರ್ವಹಣಾ ಕೇಂದ್ರ
            </p>
          </div>
        </div>
      </div>

      {actionStatusToast && (
        <div className="bg-healthcare text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-card flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionStatusToast}</span>
        </div>
      )}

      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: HERO EMERGENCY CARD & PROTOCOL (Span 7)     */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {selectedAlert ? (
            <div className="bg-emergency text-white rounded-3xl p-6 lg:p-8 shadow-emergency border-2 border-emergency-700 relative overflow-hidden space-y-5">
              {/* Header Tag & ID */}
              <div className="flex items-center justify-between">
                <span className="bg-white/20 text-white text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider border border-white/30">
                  ತುರ್ತು ರೆಫರಲ್ (Emergency Referral)
                </span>
                <span className="text-xs font-mono font-bold bg-navy-950/40 px-3 py-1 rounded-xl">
                  ID: {selectedAlert.beneficiary_id}
                </span>
              </div>

              {/* Beneficiary Name & Location */}
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold font-kannada leading-tight text-white">
                  {selectedAlert.beneficiary_name_kn || selectedAlert.beneficiary_name}
                </h3>
                <p className="text-xs text-emergency-50 mt-1 flex items-center font-medium">
                  <MapPin className="w-4 h-4 mr-1 text-emergency-100" />
                  {selectedAlert.village || 'ಮಂಡ್ಯ PHC ವ್ಯಾಪ್ತಿ (Mandya Sector 4)'}
                </p>
              </div>

              {/* Detected Danger Sign Description */}
              <div className="bg-white/10 rounded-2xl p-4 lg:p-5 border border-white/20 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emergency-100 block">
                  ಪತ್ತೆಯಾದ ಅಪಾಯಕಾರಿ ಲಕ್ಷಣ (MoHFW Verified Danger Sign):
                </span>
                <div className="space-y-2 mt-1">
                  {Array.isArray(selectedAlert.danger_signs) ? (
                    selectedAlert.danger_signs.map((sign, idx) => (
                      <div key={idx} className="flex items-start space-x-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-white mt-1.5 shrink-0"></span>
                        <div className="text-sm leading-relaxed font-kannada font-bold">
                          <span>{typeof sign === 'string' ? sign : sign.kn}</span>
                          {sign.en && <span className="block text-xs font-normal text-emergency-50">{sign.en}</span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-base font-bold font-kannada">
                      {selectedAlert.danger_sign_description || 'ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ರಕ್ತಸ್ರಾವ / ತೀವ್ರ ಜ್ವರ ಕಂಡುಬಂದಿದೆ.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Mandatory Public Health Referral Directive */}
              <div className="bg-white text-navy-900 rounded-2xl p-5 shadow-card border border-white space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emergency block">
                  ಮುಖ್ಯ ಶಿಫಾರಸು ನಿರ್ದೇಶನ (Referral Directive):
                </span>
                <div className="text-2xl font-bold font-kannada text-emergency leading-tight">
                  Refer to PHC now
                </div>
                <p className="text-xs font-bold text-navy-900 font-kannada">
                  ತಕ್ಷಣವೇ ಸಮೀಪದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಕ್ಕೆ (PHC) ಕರೆದೊಯ್ಯಿರಿ
                </p>
                <div className="text-[11px] text-navy-500 mt-2 pt-2 border-t border-navy-100 font-medium">
                  *ಗಮನಿಸಿ: NHM ಮಾರ್ಗಸೂಚಿ ಪ್ರಕಾರ ಆಶಾ ಕಾರ್ಯಕರ್ತರು ಚಿಕಿತ್ಸೆ ಅಥವಾ ರೋಗನಿರ್ಣಯ ನೀಡಬಾರದು. ತುರ್ತು ರೆಫರಲ್ ಮಾತ್ರ ಕಡ್ಡಾಯ.
                </div>
              </div>

              {/* Referral Status Bar */}
              <div className="bg-navy-950/40 rounded-2xl p-4 border border-white/20 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-emergency-100" />
                  <div>
                    <span className="text-[10px] text-emergency-100 block uppercase font-bold">
                      ರೆಫರಲ್ ಸ್ಥಿತಿ (Referral Status):
                    </span>
                    <span className="text-sm font-bold text-white font-kannada">
                      {selectedAlert.referral_status || 'ಕ್ರಿಯೆ ಬಾಕಿ ಇದೆ (Pending Action)'}
                    </span>
                  </div>
                </div>
                <span className="w-3.5 h-3.5 rounded-full bg-warning animate-ping"></span>
              </div>

              {/* Emergency Call Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleCallAmbulance}
                  className="w-full bg-white hover:bg-softblue text-emergency font-bold py-4 px-4 rounded-2xl shadow-card flex items-center justify-center space-x-2 text-sm active:scale-95 transition-decelerate touch-manipulation"
                >
                  <Ambulance className="w-5 h-5 text-emergency" />
                  <span>108 ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ಕರೆ (Call 108)</span>
                </button>

                <button
                  onClick={handleCallMedicalOfficer}
                  className="w-full bg-emergency-800 hover:bg-emergency-900 text-white font-bold py-4 px-4 rounded-2xl border border-emergency-400 flex items-center justify-center space-x-2 text-sm active:scale-95 transition-decelerate touch-manipulation"
                >
                  <PhoneCall className="w-5 h-5 text-emergency-100" />
                  <span>ವೈದ್ಯಾಧಿಕಾರಿಗೆ ಕರೆ (MO)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-navy-200/60 shadow-card">
              <CheckCircle className="w-12 h-12 text-healthcare mx-auto mb-2" />
              <h3 className="text-lg font-bold text-navy-900 font-kannada">
                ಯಾವುದೇ ಸಕ್ರಿಯ ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ
              </h3>
              <p className="text-xs text-navy-500 mt-1">
                No active danger sign alerts at this moment.
              </p>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: AMBULANCE TRACKING & ALERT HISTORY (Span 5) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* Ambulance Dispatch & Map Tracker Card */}
          <div className="bg-white rounded-3xl p-6 border border-navy-200/60 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                  <Ambulance className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-kannada text-navy-900 flex items-center space-x-2">
                    <span>108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಿಮ್ಯುಲೇಶನ್</span>
                    <span className="text-[10px] bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded-full font-mono font-bold">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-xs text-navy-400 font-medium">Status & Telemetry Simulator</p>
                </div>
              </div>

              <button
                onClick={handleAdvanceSimulationStep}
                disabled={isAdvancingAmbulance}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold active:scale-95 transition-decelerate"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isAdvancingAmbulance ? 'animate-spin' : ''}`} />
                <span>ಹಂತ ಮುನ್ನಡೆಸಿ</span>
              </button>
            </div>

            {/* Stepper Status Progression */}
            <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-bold py-1">
              {['REQUESTED', 'DISPATCHED', 'ON_THE_WAY', 'ARRIVED', 'COMPLETED'].map((st, i) => {
                const currentStatus = ambulanceRequest?.status || 'REQUESTED';
                const order = ['REQUESTED', 'DISPATCHED', 'ON_THE_WAY', 'ARRIVED', 'COMPLETED'];
                const isPastOrCurrent = order.indexOf(currentStatus) >= i;
                const isCurrent = currentStatus === st;

                return (
                  <div key={st} className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] mb-1 transition-decelerate ${
                      isCurrent 
                        ? 'bg-primary text-white ring-2 ring-primary-100 shadow-subtle' 
                        : isPastOrCurrent 
                        ? 'bg-healthcare text-white' 
                        : 'bg-softblue text-navy-400'
                    }`}>
                      {i + 1}
                    </div>
                    <span className={`leading-tight truncate max-w-full font-kannada ${
                      isCurrent ? 'text-primary font-bold' : isPastOrCurrent ? 'text-navy-800' : 'text-navy-400'
                    }`}>
                      {st === 'REQUESTED' ? 'ಕೋರಿಕೆ' : st === 'DISPATCHED' ? 'ಹೊರಟಿದೆ' : st === 'ON_THE_WAY' ? 'ದಾರಿ ಮಧ್ಯೆ' : st === 'ARRIVED' ? 'ತಲುಪಿದೆ' : 'ಮುಗಿದಿದೆ'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Telemetry Summary */}
            <div className="p-4 rounded-2xl bg-softblue border border-navy-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-navy-500 font-medium">ಅಂದಾಜು ಸಮಯ (ETA):</span>
                <span className="font-bold text-healthcare font-mono text-sm">
                  {ambulanceRequest?.eta_minutes ?? 8} ನಿಮಿಷಗಳು (mins)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-500 font-medium">ವಾಹನ & ಚಾಲಕ:</span>
                <span className="font-bold font-mono text-primary">
                  {ambulanceRequest?.vehicle_number || 'KA-11-G-1081'} • {ambulanceRequest?.driver_name || 'ರಮೇಶ್ ಗೌಡ'}
                </span>
              </div>
            </div>

            {/* Open Full Map Tracking CTA */}
            <button
              onClick={() => onTrackAmbulance && onTrackAmbulance(selectedAlert?.id)}
              className="w-full bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold py-3.5 px-4 rounded-2xl shadow-subtle border border-cyan-200 text-xs flex items-center justify-center space-x-2 active:scale-95 transition-decelerate"
            >
              <Navigation className="w-4 h-4 text-cyan-700" />
              <span className="font-kannada">ಪೂರ್ಣ ಜಿಪಿಎಸ್ ನಕ್ಷೆ ವೀಕ್ಷಿಸಿ (Open Live Map)</span>
            </button>
          </div>

          {/* Past Alerts in Village */}
          {alerts.length > 1 && (
            <div className="bg-white rounded-3xl p-6 border border-navy-200/60 shadow-card space-y-3">
              <h4 className="text-xs font-bold text-navy-900 font-kannada">
                ಹಿಂದಿನ ತುರ್ತು ದಾಖಲೆಗಳು (Emergency Referral History)
              </h4>
              <div className="space-y-2">
                {alerts.map((al) => (
                  <div
                    key={al.id}
                    onClick={() => setSelectedAlert(al)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-decelerate active:scale-95 ${
                      selectedAlert?.id === al.id
                        ? 'border-emergency-300 bg-emergency-50'
                        : 'border-navy-100 bg-white hover:bg-softblue'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-navy-900 font-kannada">
                        {al.beneficiary_name_kn || al.beneficiary_name} ({al.beneficiary_id})
                      </div>
                      <div className="text-[11px] text-navy-500 mt-0.5 font-medium">
                        ಸ್ಥಿತಿ: {al.referral_status}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-navy-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
