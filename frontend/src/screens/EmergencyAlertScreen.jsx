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
import { useLanguage } from '../context/LanguageContext';

export default function EmergencyAlertScreen({
  onBack, 
  alertData, 
  onTrackAmbulance 
}) {
  const { language, t, dir, isRtl, langInfo } = useLanguage();
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
    setActionStatusToast(t('emergency.statusUpdatedToast', { status: newStatus }));
    setTimeout(() => setActionStatusToast(''), 3500);
  };

  const handleCallAmbulance = async () => {
    window.open('tel:108', '_self');
    handleUpdateStatus(t('emergency.ambulanceCalled'));
  };

  const handleCallMedicalOfficer = () => {
    window.open('tel:94498XXXXX', '_self');
    handleUpdateStatus(t('emergency.moInformed'));
  };

  const handleAdvanceSimulationStep = async () => {
    try {
      setIsAdvancingAmbulance(true);
      const updated = await api.simulateNextAmbulanceStep();
      if (updated) {
        setAmbulanceRequest(updated);
        setActionStatusToast(`${t('common.status')}: ${updated.status}`);
        setTimeout(() => setActionStatusToast(''), 3000);
      }
    } catch (e) {
      console.warn('Simulation step advance error', e);
    } finally {
      setIsAdvancingAmbulance(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12" dir={dir}>
      {/* 1. Header with Back Button */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-[#F0DDE2] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] text-[#3B2A33] hover:bg-[#FDF6F5] active:scale-95 transition-decelerate"
            title={t('common.back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg lg:text-xl font-bold text-[#B94A58] leading-tight flex items-center space-x-2 font-serif">
                <AlertTriangle className="w-5 h-5 text-[#B94A58] animate-pulse" />
                <span>{t('emergency.title')}</span>
              </h1>
              <span className="text-xs font-mono font-bold bg-[#FCF1F1] text-[#B94A58] px-2.5 py-0.5 rounded-full border border-[#B94A58]/30">
                MoHFW Verified
              </span>
            </div>
            <p className="text-xs text-[#7A6670] font-medium mt-0.5">
              {t('emergency.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {actionStatusToast && (
        <div className="bg-[#477A60] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-card flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionStatusToast}</span>
        </div>
      )}

      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: HERO EMERGENCY CARD & PROTOCOL */}
        <div className="lg:col-span-7 space-y-6">
          {selectedAlert ? (
            <div className="bg-[#B94A58] text-white rounded-3xl p-6 lg:p-8 shadow-md border-2 border-[#A33D4A] relative overflow-hidden space-y-5">
              {/* Header Tag & ID */}
              <div className="flex items-center justify-between">
                <span className="bg-white/20 text-white text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider border border-white/30">
                  {t('emergency.referralDirective')}
                </span>
                <span className="text-xs font-mono font-bold bg-[#3B2A33]/30 px-3 py-1 rounded-xl">
                  ID: {selectedAlert.beneficiary_id}
                </span>
              </div>

              {/* Beneficiary Name & Location */}
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold leading-tight text-white font-serif">
                  {language === 'kn' ? (selectedAlert.beneficiary_name_kn || selectedAlert.beneficiary_name) : selectedAlert.beneficiary_name}
                </h3>
                <p className="text-xs text-white/90 mt-1 flex items-center font-medium">
                  <MapPin className="w-4 h-4 mr-1 text-white/80" />
                  {selectedAlert.village || 'Mandya Sector 4'}
                </p>
              </div>

              {/* Detected Danger Sign Description */}
              <div className="bg-white/10 rounded-2xl p-4 lg:p-5 border border-white/20 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-white/90 block">
                  {t('emergency.dangerSignsDetected')}:
                </span>
                <div className="space-y-2 mt-1">
                  {Array.isArray(selectedAlert.danger_signs) ? (
                    selectedAlert.danger_signs.map((sign, idx) => (
                      <div key={idx} className="flex items-start space-x-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-white mt-1.5 shrink-0"></span>
                        <div className="text-sm leading-relaxed font-bold">
                          <span>{typeof sign === 'string' ? sign : (sign[language] || sign.en || sign.kn)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-base font-bold">
                      {selectedAlert.danger_sign_description || t('maternal.highRiskAlert')}
                    </p>
                  )}
                </div>
              </div>

              {/* Mandatory Public Health Referral Directive */}
              <div className="bg-white text-[#3B2A33] rounded-2xl p-5 shadow-card border border-white space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B94A58] block">
                  {t('emergency.referralDirective')}:
                </span>
                <div className="text-2xl font-bold text-[#B94A58] leading-tight font-serif">
                  Refer to PHC immediately
                </div>
                <p className="text-xs font-bold text-[#3B2A33]">
                  {t('emergency.referToPhcNow')}
                </p>
                <div className="text-[11px] text-[#7A6670] mt-2 pt-2 border-t border-[#F0DDE2] font-medium">
                  {t('emergency.nhmGuidelines')}
                </div>
              </div>

              {/* Referral Status Bar */}
              <div className="bg-[#3B2A33]/30 rounded-2xl p-4 border border-white/20 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-white/80" />
                  <div>
                    <span className="text-[10px] text-white/80 block uppercase font-bold">
                      {t('emergency.referralStatus')}:
                    </span>
                    <span className="text-sm font-bold text-white">
                      {selectedAlert.referral_status || t('emergency.statusPending')}
                    </span>
                  </div>
                </div>
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping"></span>
              </div>

              {/* Emergency Call Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleCallAmbulance}
                  className="w-full bg-white hover:bg-[#FDF6F5] text-[#B94A58] font-bold py-4 px-4 rounded-2xl shadow-card flex items-center justify-center space-x-2 text-sm active:scale-95 transition-decelerate touch-manipulation"
                >
                  <Ambulance className="w-5 h-5 text-[#B94A58]" />
                  <span>{t('emergency.call108')}</span>
                </button>

                <button
                  onClick={handleCallMedicalOfficer}
                  className="w-full bg-[#8A3742] hover:bg-[#722D37] text-white font-bold py-4 px-4 rounded-2xl border border-white/30 flex items-center justify-center space-x-2 text-sm active:scale-95 transition-decelerate touch-manipulation"
                >
                  <PhoneCall className="w-5 h-5 text-white/90" />
                  <span>{t('emergency.callMo')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-[#F0DDE2] shadow-card">
              <CheckCircle className="w-12 h-12 text-[#477A60] mx-auto mb-2" />
              <h3 className="text-lg font-bold text-[#3B2A33] font-serif">
                {t('emergency.noActiveAlerts')}
              </h3>
              <p className="text-xs text-[#7A6670] mt-1">
                {t('emergency.noActiveAlertsSub')}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AMBULANCE TRACKING & ALERT HISTORY */}
        <div className="lg:col-span-5 space-y-6">
          {/* Ambulance Dispatch & Map Tracker Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FDF6F5] text-[#A25B74] flex items-center justify-center">
                  <Ambulance className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#3B2A33] flex items-center space-x-2 font-serif">
                    <span>{t('emergency.ambulanceSimulation')}</span>
                    <span className="text-[10px] bg-[#FFF4E5] text-[#8C5200] border border-[#FFE2B8] px-2 py-0.5 rounded-full font-mono font-bold">
                      SIMULATED
                    </span>
                  </h3>
                  <p className="text-xs text-[#C47A92] font-medium">108 Dispatch Telemetry Demonstration</p>
                </div>
              </div>

              <button
                onClick={handleAdvanceSimulationStep}
                disabled={isAdvancingAmbulance}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#A25B74] hover:bg-[#84455C] text-white text-xs font-bold active:scale-95 transition-decelerate"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isAdvancingAmbulance ? 'animate-spin' : ''}`} />
                <span>{t('emergency.advanceStage')}</span>
              </button>
            </div>

            {/* Simulation Disclaimer Banner */}
            <div className="bg-[#FFF8F0] border-2 border-amber-400 rounded-2xl p-3.5 text-xs text-[#8C5200] leading-relaxed flex items-start space-x-2.5 font-bold shadow-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="block text-xs font-bold text-amber-900">SIMULATED DEMONSTRATION ONLY — No real ambulance or 108 emergency service has been contacted.</span>
                <span className="text-[11px] font-normal text-amber-800 block mt-0.5">Simulates triage escalation, priority PHC/FRU routing, and 108 emergency dispatch telemetry for healthcare demonstration.</span>
              </div>
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
                        ? 'bg-[#A25B74] text-white ring-2 ring-[#A25B74]/20' 
                        : isPastOrCurrent 
                        ? 'bg-[#477A60] text-white' 
                        : 'bg-[#FDF6F5] text-[#C47A92]'
                    }`}>
                      {i + 1}
                    </div>
                    <span className={`leading-tight truncate max-w-full text-[10px] ${
                      isCurrent ? 'text-[#A25B74] font-bold' : isPastOrCurrent ? 'text-[#3B2A33]' : 'text-[#C47A92]'
                    }`}>
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Telemetry Summary */}
            <div className="p-4 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#7A6670] font-medium">{t('emergency.eta')}:</span>
                <span className="font-bold text-[#477A60] font-mono text-sm">
                  {ambulanceRequest?.eta_minutes ?? 8} {t('emergency.minutes')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7A6670] font-medium">{t('emergency.vehicleAndDriver')}</span>
                <span className="font-bold font-mono text-[#A25B74]">
                  {ambulanceRequest?.vehicle_number || 'KA-11-G-1081'}
                </span>
              </div>
            </div>

            {/* Open Full Map Tracking CTA */}
            <button
              onClick={() => onTrackAmbulance && onTrackAmbulance(selectedAlert?.id)}
              className="w-full bg-[#FDF6F5] hover:bg-[#F9ECEC] text-[#A25B74] font-bold py-3.5 px-4 rounded-2xl border border-[#F0DDE2] text-xs flex items-center justify-center space-x-2 active:scale-95 transition-decelerate"
            >
              <Navigation className="w-4 h-4 text-[#A25B74]" />
              <span>{t('emergency.openMap')}</span>
            </button>
          </div>

          {/* Past Alerts in Village */}
          {alerts.length > 1 && (
            <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-3">
              <h4 className="text-xs font-bold text-[#3B2A33]">
                {t('emergency.referralHistory')}
              </h4>
              <div className="space-y-2">
                {alerts.map((al) => (
                  <div
                    key={al.id}
                    onClick={() => setSelectedAlert(al)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-decelerate active:scale-95 ${
                      selectedAlert?.id === al.id
                        ? 'border-[#B94A58]/40 bg-[#FCF1F1]'
                        : 'border-[#F0DDE2] bg-white hover:bg-[#FDF6F5]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#3B2A33]">
                        {language === 'kn' ? (al.beneficiary_name_kn || al.beneficiary_name) : al.beneficiary_name} ({al.beneficiary_id})
                      </div>
                      <div className="text-[11px] text-[#7A6670] mt-0.5 font-medium">
                        {t('common.status')}: {al.referral_status}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#C47A92]" />
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
