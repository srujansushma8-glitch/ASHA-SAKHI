import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  PhoneCall, 
  Ambulance, 
  MapPin, 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Navigation,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function EmergencyAlertScreen({ onBack, alertData, onTrackAmbulance }) {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(alertData || null);
  const [actionStatusToast, setActionStatusToast] = useState('');

  useEffect(() => {
    loadAlerts();
  }, [alertData]);

  const loadAlerts = async () => {
    const list = await api.getEmergencyAlerts();
    setAlerts(list);
    if (!selectedAlert && list.length > 0) {
      setSelectedAlert(list[0]);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedAlert) return;
    const updated = { ...selectedAlert, referral_status: newStatus };
    setSelectedAlert(updated);
    await api.updateEmergencyAlert(updated);
    loadAlerts();
    setActionStatusToast(`ರೆಫರಲ್ ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ: ${newStatus}`);
    setTimeout(() => setActionStatusToast(''), 3500);
  };

  const handleCallAmbulance = () => {
    window.open('tel:108', '_self');
    handleUpdateStatus('108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಂಪರ್ಕಿಸಲಾಗಿದೆ (108 Ambulance Called)');
  };

  const handleCallMedicalOfficer = () => {
    window.open('tel:94498XXXXX', '_self');
    handleUpdateStatus('PHC ವೈದ್ಯಾಧಿಕಾರಿಗೆ ಮಾಹಿತಿ ನೀಡಲಾಗಿದೆ (MO Informed)');
  };

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto px-4 pt-3">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-navy-100 text-navy-700 hover:bg-navy-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-base font-bold font-kannada text-emergency-700 leading-tight flex items-center justify-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-emergency-600 animate-pulse" />
            <span>ತುರ್ತು ಅಪಾಯಕಾರಿ ಎಚ್ಚರಿಕೆ</span>
          </h2>
          <p className="text-[11px] text-emergency-600 font-semibold uppercase tracking-wider">
            Verified Danger Sign Detected
          </p>
        </div>
        <div className="w-9 h-9"></div>
      </div>

      {actionStatusToast && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionStatusToast}</span>
        </div>
      )}

      {/* Prominent Red Emergency Card */}
      {selectedAlert ? (
        <div className="bg-emergency-600 text-white rounded-3xl p-5 shadow-emergency border-4 border-emergency-700 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-15 pointer-events-none">
            <AlertTriangle className="w-48 h-48" />
          </div>

          <div className="relative z-10 space-y-4">
            {/* Header Tag */}
            <div className="flex items-center justify-between">
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-white/30">
                ತುರ್ತು ರೆಫರಲ್ (Emergency Referral)
              </span>
              <span className="text-xs font-mono font-bold bg-navy-950/40 px-2.5 py-0.5 rounded-lg">
                ID: {selectedAlert.beneficiary_id}
              </span>
            </div>

            {/* Beneficiary Name & Location */}
            <div>
              <h3 className="text-2xl font-black font-kannada leading-tight text-white">
                {selectedAlert.beneficiary_name_kn || selectedAlert.beneficiary_name}
              </h3>
              <p className="text-xs text-emergency-100 mt-1 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-emergency-200" />
                {selectedAlert.village || 'ಮಂಡ್ಯ PHC ವ್ಯಾಪ್ತಿ'}
              </p>
            </div>

            {/* Detected Danger Sign Description */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emergency-200 block mb-1">
                ಪತ್ತೆಯಾದ ಅಪಾಯಕಾರಿ ಲಕ್ಷಣ (Detected Danger Sign):
              </span>
              <div className="space-y-1.5 mt-2">
                {Array.isArray(selectedAlert.danger_signs) ? (
                  selectedAlert.danger_signs.map((sign, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="w-2 h-2 rounded-full bg-white mt-1.5 shrink-0"></span>
                      <div className="text-xs leading-relaxed font-kannada">
                        <span className="font-bold">{typeof sign === 'string' ? sign : sign.kn}</span>
                        {sign.en && <span className="block text-[11px] text-emergency-100">{sign.en}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm font-bold font-kannada">
                    {selectedAlert.danger_sign_description || 'ತೀವ್ರ ಅಪಾಯಕಾರಿ ಲಕ್ಷಣ ಕಂಡುಬಂದಿದೆ.'}
                  </p>
                )}
              </div>
            </div>

            {/* Mandatory Referral Instruction: Refer to PHC now */}
            <div className="bg-white text-navy-950 rounded-2xl p-4 shadow-lg border-2 border-white">
              <span className="text-[10px] font-black uppercase tracking-wider text-emergency-700 block">
                ಮುಖ್ಯ ಶಿಫಾರಸು ನಿರ್ದೇಶನ (Referral Instruction):
              </span>
              <div className="text-xl font-black font-kannada text-emergency-700 mt-0.5 leading-tight">
                Refer to PHC now
              </div>
              <p className="text-xs font-bold text-navy-800 font-kannada mt-1">
                ತಕ್ಷಣವೇ ಸಮೀಪದ ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರಕ್ಕೆ (PHC) ಕರೆದೊಯ್ಯಿರಿ
              </p>
              {/* Important: No diagnosis or treatment recommendation per specification */}
              <div className="text-[10px] text-navy-500 mt-2 pt-2 border-t border-navy-100">
                *ಗಮನಿಸಿ: ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಅಭಿಯಾನ (NHM) ನಿಯಮಾವಳಿ ಪ್ರಕಾರ ಆಶಾ ಕಾರ್ಯಕರ್ತರು ಚಿಕಿತ್ಸೆ ಅಥವಾ ರೋಗನಿರ್ಣಯ ನೀಡಬಾರದು. ತುರ್ತು ರೆಫರಲ್ ಮಾತ್ರ ಕಡ್ಡಾಯ.
              </div>
            </div>

            {/* Referral Status Tracker */}
            <div className="bg-emergency-900/60 rounded-2xl p-3 border border-emergency-500/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emergency-200" />
                <div>
                  <span className="text-[10px] text-emergency-200 block uppercase font-bold">
                    ರೆಫರಲ್ ಸ್ಥಿತಿ (Referral Status):
                  </span>
                  <span className="text-xs font-black text-white font-kannada">
                    {selectedAlert.referral_status || 'Pending Action'}
                  </span>
                </div>
              </div>
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
            </div>

            {/* Mobile Touch Action Buttons */}
            <div className="space-y-2.5 pt-1">
              {/* Ambulance Map Tracking Button */}
              <button
                onClick={() => onTrackAmbulance && onTrackAmbulance(selectedAlert.id)}
                className="w-full bg-teal-500 hover:bg-teal-400 active:scale-[0.98] text-navy-950 font-black py-3.5 px-4 rounded-2xl shadow-xl flex items-center justify-center space-x-2 text-sm touch-manipulation transition-transform"
              >
                <Navigation className="w-5 h-5 text-navy-950" />
                <span>ಆಂಬ್ಯುಲೆನ್ಸ್ ಲೈವ್ ಮ್ಯಾಪ್ ನೋಡಿ (Track Ambulance Map)</span>
              </button>

              <button
                onClick={handleCallAmbulance}
                className="w-full bg-white hover:bg-emergency-50 active:scale-[0.98] text-emergency-700 font-black py-3.5 px-4 rounded-2xl shadow-md flex items-center justify-center space-x-2.5 text-sm touch-manipulation transition-transform"
              >
                <div className="w-7 h-7 rounded-full bg-emergency-600 text-white flex items-center justify-center">
                  <Ambulance className="w-4 h-4" />
                </div>
                <span>108 ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ ಕರೆ (Call 108)</span>
              </button>

              <button
                onClick={handleCallMedicalOfficer}
                className="w-full bg-emergency-800/90 hover:bg-emergency-900 active:scale-[0.98] text-white font-bold py-2.5 px-4 rounded-2xl border border-emergency-400 flex items-center justify-center space-x-2 text-xs touch-manipulation"
              >
                <PhoneCall className="w-4 h-4 text-emergency-200" />
                <span>PHC ವೈದ್ಯಾಧಿಕಾರಿಗೆ ಕರೆ (Call Medical Officer)</span>
              </button>
            </div>

            {/* Update Status Actions */}
            <div className="pt-2 border-t border-emergency-500/40">
              <span className="text-[10px] font-bold text-emergency-200 block mb-2">
                ಸ್ಥಿತಿಯನ್ನು ತ್ವರಿತವಾಗಿ ನವೀಕರಿಸಿ (Quick Status Update):
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleUpdateStatus('108 ವಾಹನ ಹೊರಟಿದೆ (Ambulance Dispatched)')}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-center touch-manipulation"
                >
                  🚑 ವಾಹನ ಹೊರಟಿದೆ
                </button>
                <button
                  onClick={() => handleUpdateStatus('PHC ತಲುಪಿದೆ (Arrived at PHC)')}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-center touch-manipulation"
                >
                  🏥 PHC ತಲುಪಿದೆ
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center border border-navy-100">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-navy-900 font-kannada">
            ಯಾವುದೇ ಸಕ್ರಿಯ ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ
          </h3>
          <p className="text-xs text-navy-500 mt-1">
            No active danger sign alerts at this moment.
          </p>
        </div>
      )}

      {/* Historical Danger Alerts in Village */}
      {alerts.length > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-sm">
          <h4 className="text-xs font-bold text-navy-800 font-kannada mb-2.5">
            ಹಿಂದಿನ ತುರ್ತು ದಾಖಲೆಗಳು (Emergency History)
          </h4>
          <div className="space-y-2">
            {alerts.map((al) => (
              <div
                key={al.id}
                onClick={() => setSelectedAlert(al)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  selectedAlert?.id === al.id
                    ? 'border-emergency-500 bg-emergency-50/50'
                    : 'border-navy-100 bg-white hover:bg-navy-50'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-navy-900 font-kannada">
                    {al.beneficiary_name_kn || al.beneficiary_name} ({al.beneficiary_id})
                  </div>
                  <div className="text-[11px] text-navy-500 mt-0.5">
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
