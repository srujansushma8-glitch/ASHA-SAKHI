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
  ExternalLink
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
    <div className="space-y-4 pb-28 max-w-2xl mx-auto px-4 pt-3 animate-fade-in">
      {/* 1. Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-navy-100 text-navy hover:bg-ivory-bg active:scale-[0.98] transition-decelerate"
          title="ಹಿಂದೆ / Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-base font-bold font-kannada text-emergency leading-tight flex items-center justify-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-emergency animate-pulse" />
            <span>ತುರ್ತು ಅಪಾಯಕಾರಿ ಎಚ್ಚರಿಕೆ</span>
          </h2>
          <p className="text-[11px] text-emergency font-bold uppercase tracking-wider">
            Verified Danger Sign Detected
          </p>
        </div>
        <div className="w-9 h-9"></div>
      </div>

      {actionStatusToast && (
        <div className="bg-healthcare text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-card flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionStatusToast}</span>
        </div>
      )}

      {/* 2. Prominent Emergency Red Card (Reserved Red) */}
      {selectedAlert ? (
        <div className="bg-emergency text-white rounded-3xl p-5 shadow-emergency border-2 border-emergency-700 relative overflow-hidden space-y-4">
          {/* Header Tag & ID */}
          <div className="flex items-center justify-between">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/30">
              ತುರ್ತು ರೆಫರಲ್ (Emergency Referral)
            </span>
            <span className="text-xs font-mono font-bold bg-navy-950/40 px-2.5 py-0.5 rounded-lg">
              ID: {selectedAlert.beneficiary_id}
            </span>
          </div>

          {/* Beneficiary Name & Location */}
          <div>
            <h3 className="text-2xl font-bold font-kannada leading-tight text-white">
              {selectedAlert.beneficiary_name_kn || selectedAlert.beneficiary_name}
            </h3>
            <p className="text-xs text-emergency-50 mt-1 flex items-center font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1 text-emergency-100" />
              {selectedAlert.village || 'ಮಂಡ್ಯ PHC ವ್ಯಾಪ್ತಿ (Mandya Sector 4)'}
            </p>
          </div>

          {/* Detected Danger Sign Description */}
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emergency-100 block">
              ಪತ್ತೆಯಾದ ಅಪಾಯಕಾರಿ ಲಕ್ಷಣ (MoHFW Verified Danger Sign):
            </span>
            <div className="space-y-1.5 mt-1">
              {Array.isArray(selectedAlert.danger_signs) ? (
                selectedAlert.danger_signs.map((sign, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <span className="w-2 h-2 rounded-full bg-white mt-1.5 shrink-0"></span>
                    <div className="text-xs leading-relaxed font-kannada font-bold">
                      <span>{typeof sign === 'string' ? sign : sign.kn}</span>
                      {sign.en && <span className="block text-[11px] font-normal text-emergency-50">{sign.en}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm font-bold font-kannada">
                  {selectedAlert.danger_sign_description || 'ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ರಕ್ತಸ್ರಾವ / ತೀವ್ರ ಜ್ವರ ಕಂಡುಬಂದಿದೆ.'}
                </p>
              )}
            </div>
          </div>

          {/* Mandatory Public Health Instruction: Refer to PHC now */}
          <div className="bg-white text-navy rounded-2xl p-4 shadow-card border border-white space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emergency block">
              ಮುಖ್ಯ ಶಿಫಾರಸು ನಿರ್ದೇಶನ (Referral Directive):
            </span>
            <div className="text-xl font-bold font-kannada text-emergency leading-tight">
              Refer to PHC now
            </div>
            <p className="text-xs font-bold text-navy font-kannada mt-0.5">
              ತಕ್ಷಣವೇ ಸಮೀಪದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಕ್ಕೆ (PHC) ಕರೆದೊಯ್ಯಿರಿ
            </p>
            <div className="text-[10px] text-navy-500 mt-2 pt-2 border-t border-navy-100 font-medium">
              *ಗಮನಿಸಿ: NHM ಮಾರ್ಗಸೂಚಿ ಪ್ರಕಾರ ಆಶಾ ಕಾರ್ಯಕರ್ತರು ಚಿಕಿತ್ಸೆ ಅಥವಾ ರೋಗನಿರ್ಣಯ ನೀಡಬಾರದು. ತುರ್ತು ರೆಫರಲ್ ಮಾತ್ರ ಕಡ್ಡಾಯ.
            </div>
          </div>

          {/* Referral Status Bar */}
          <div className="bg-navy-950/40 rounded-2xl p-3 border border-white/20 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emergency-100" />
              <div>
                <span className="text-[10px] text-emergency-100 block uppercase font-bold">
                  ರೆಫರಲ್ ಸ್ಥಿತಿ (Referral Status):
                </span>
                <span className="text-xs font-bold text-white font-kannada">
                  {selectedAlert.referral_status || 'ಕ್ರಿಯೆ ಬಾಕಿ ಇದೆ (Pending Action)'}
                </span>
              </div>
            </div>
            <span className="w-3 h-3 rounded-full bg-warning animate-ping"></span>
          </div>

          {/* Emergency Calling & Map Tracking Actions */}
          <div className="space-y-2.5 pt-1">
            {/* Direct Map Tracking Screen Button */}
            <button
              onClick={() => onTrackAmbulance && onTrackAmbulance(selectedAlert.id)}
              className="w-full bg-mint-surface hover:bg-mint-surface/90 text-primary font-bold py-3.5 px-4 rounded-2xl shadow-touch flex items-center justify-center space-x-2 text-sm active:scale-[0.98] transition-decelerate touch-manipulation"
            >
              <Navigation className="w-5 h-5 text-primary" />
              <span className="font-kannada">ಆಂಬ್ಯುಲೆನ್ಸ್ ಲೈವ್ ಮ್ಯಾಪ್ ನೋಡಿ (Track Ambulance Map)</span>
            </button>

            <button
              onClick={handleCallAmbulance}
              className="w-full bg-white hover:bg-ivory-bg text-emergency font-bold py-3.5 px-4 rounded-2xl shadow-card flex items-center justify-center space-x-2.5 text-base active:scale-[0.98] transition-decelerate touch-manipulation"
            >
              <div className="w-8 h-8 rounded-full bg-emergency text-white flex items-center justify-center">
                <Ambulance className="w-5 h-5" />
              </div>
              <span>108 ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ಕರೆ (Call 108)</span>
            </button>

            <button
              onClick={handleCallMedicalOfficer}
              className="w-full bg-emergency-800 hover:bg-emergency-900 text-white font-semibold py-3 px-4 rounded-2xl border border-emergency-500 flex items-center justify-center space-x-2 text-xs active:scale-[0.98] transition-decelerate touch-manipulation"
            >
              <PhoneCall className="w-4 h-4 text-emergency-100" />
              <span>PHC ವೈದ್ಯಾಧಿಕಾರಿಗೆ ಕರೆ (Call Medical Officer)</span>
            </button>
          </div>

          {/* Quick Status Update Chips */}
          <div className="pt-2 border-t border-emergency-500/40">
            <span className="text-[10px] font-bold text-emergency-100 block mb-2">
              ಸ್ಥಿತಿಯನ್ನು ತ್ವರಿತವಾಗಿ ನವೀಕರಿಸಿ (Quick Status Update):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleUpdateStatus('108 ವಾಹನ ಹೊರಟಿದೆ (Ambulance Dispatched)')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-center active:scale-[0.98] transition-decelerate"
              >
                🚑 ವಾಹನ ಹೊರಟಿದೆ
              </button>
              <button
                onClick={() => handleUpdateStatus('PHC ತಲುಪಿದೆ (Arrived at PHC)')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-center active:scale-[0.98] transition-decelerate"
              >
                🏥 PHC ತಲುಪಿದೆ
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center border border-navy-100 shadow-subtle">
          <CheckCircle className="w-12 h-12 text-healthcare mx-auto mb-2" />
          <h3 className="text-base font-bold text-navy font-kannada">
            ಯಾವುದೇ ಸಕ್ರಿಯ ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ
          </h3>
          <p className="text-xs text-navy-500 mt-1">
            No active danger sign alerts at this moment.
          </p>
        </div>
      )}

      {/* 3. SIMULATED 108 AMBULANCE TRACKING CARD */}
      <div className="bg-white rounded-3xl p-5 border border-navy-100 shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-navy-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary flex items-center justify-center">
              <Ambulance className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold font-kannada text-navy flex items-center space-x-1.5">
                <span>108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಟ್ರ್ಯಾಕಿಂಗ್</span>
                <span className="text-[10px] bg-mint-surface text-primary px-1.5 py-0.2 rounded font-mono font-bold">
                  SIMULATION
                </span>
              </h3>
              <p className="text-[10px] text-navy-400 font-medium">
                Live Status & Telemetry Simulator
              </p>
            </div>
          </div>

          <button
            onClick={handleAdvanceSimulationStep}
            disabled={isAdvancingAmbulance}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-subtle active:scale-[0.98] transition-decelerate touch-manipulation"
            title="Advance Simulation Step"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAdvancingAmbulance ? 'animate-spin' : ''}`} />
            <span>ಹಂತ ಮುನ್ನಡೆಸಿ</span>
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="py-1">
          <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-bold">
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
                      : 'bg-navy-100 text-navy-400'
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`leading-tight truncate max-w-full ${
                    isCurrent ? 'text-primary font-black' : isPastOrCurrent ? 'text-navy-700 font-semibold' : 'text-navy-400'
                  }`}>
                    {st === 'REQUESTED' ? 'ಕೋರಿಕೆ' : st === 'DISPATCHED' ? 'ಹೊರಟಿದೆ' : st === 'ON_THE_WAY' ? 'ದಾರಿ ಮಧ್ಯೆ' : st === 'ARRIVED' ? 'ತಲುಪಿದೆ' : 'ಮುಗಿದಿದೆ'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry Details Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-ivory-bg border border-navy-100 space-y-1">
            <span className="text-[10px] text-navy-400 font-bold uppercase block">ಚಾಲಕ & ವಾಹನ:</span>
            <div className="text-xs font-bold text-navy">
              {ambulanceRequest?.driver_name || 'ರಮೇಶ್ ಕುಮಾರ್ (Ramesh)'}
            </div>
            <div className="text-[11px] font-mono font-semibold text-primary">
              {ambulanceRequest?.vehicle_number || 'KA-11-G-1080'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-ivory-bg border border-navy-100 space-y-1">
            <span className="text-[10px] text-navy-400 font-bold uppercase block">ಅಂದಾಜು ಸಮಯ (ETA):</span>
            <div className="text-xs font-bold text-healthcare flex items-center space-x-1">
              <Navigation className="w-3.5 h-3.5 text-healthcare" />
              <span>{ambulanceRequest?.eta_minutes ?? 8} ನಿಮಿಷಗಳು (mins)</span>
            </div>
            <div className="w-full bg-navy-100 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-healthcare h-full transition-all duration-500 rounded-full"
                style={{ width: `${(ambulanceRequest?.route_step ?? 2) * 20}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Simulation Disclaimer */}
        <div className="p-2.5 rounded-xl bg-warning-50 border border-warning-200 text-[10px] text-warning-700 font-semibold leading-tight">
          ⚠️ {ambulanceRequest?.simulation_disclaimer || 'ಗಮನಿಸಿ: ಇದು 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಿಮ್ಯುಲೇಶನ್ ಆಗಿದೆ. ನೈಜ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ 108 ಸಂಖ್ಯೆಗೆ ನೇರವಾಗಿ ಕರೆ ಮಾಡಿ.'}
        </div>
      </div>

      {/* 4. Historical Emergency Records in Sector */}
      {alerts.length > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-subtle">
          <h4 className="text-xs font-bold text-navy font-kannada mb-2.5">
            ಹಿಂದಿನ ತುರ್ತು ದಾಖಲೆಗಳು (Emergency History)
          </h4>
          <div className="space-y-2">
            {alerts.map((al) => (
              <div
                key={al.id}
                onClick={() => setSelectedAlert(al)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-decelerate active:scale-[0.98] ${
                  selectedAlert?.id === al.id
                    ? 'border-emergency-300 bg-emergency-50'
                    : 'border-navy-100 bg-white hover:bg-ivory-bg'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-navy font-kannada">
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
  );
}
