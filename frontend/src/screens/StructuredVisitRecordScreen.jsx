import React, { useState } from 'react';
import { 
  CheckCircle, 
  Edit3, 
  Mic, 
  Volume2, 
  VolumeX, 
  Save, 
  AlertTriangle, 
  Calendar, 
  User, 
  Scale, 
  Syringe, 
  FileText, 
  ArrowLeft,
  X,
  Sparkles,
  Check
} from 'lucide-react';
import { voiceWs } from '../services/websocket';
import { api } from '../services/api';
import { ttsService } from '../services/ttsService';

export default function StructuredVisitRecordScreen({ 
  record, 
  onSaved, 
  onBack, 
  onTriggerEmergency 
}) {
  // Local state for extracted fields
  const [formData, setFormData] = useState({
    beneficiary_id: record?.beneficiary_id || 'ASHA-KA-2024-0101',
    beneficiary_name: record?.beneficiary_name || 'Lakshmamma K.',
    visit_type: record?.visit_type || 'ANC (Antenatal Care)',
    weight: record?.weight || '58.5',
    vaccinations_due: record?.vaccinations_due || 'TT-2 / TD-2 Booster',
    vaccinations_completed: record?.vaccinations_completed || 'TT-1, Albendazole',
    next_visit_date: record?.next_visit_date || '2026-12-05',
    additional_notes: record?.additional_notes || 'Normal fetal movement felt. IFA tablets refilled for 30 days.'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editFieldValue, setEditFieldValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPlayingReadback, setIsPlayingReadback] = useState(false);
  const [voiceCorrectionActive, setVoiceCorrectionActive] = useState(false);
  const [voiceCorrectionField, setVoiceCorrectionField] = useState(null);
  const [voiceCorrectionInput, setVoiceCorrectionInput] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Spoken readback in Kannada (AI4Bharat Indic-Speak representation)
  const generateKannadaReadback = () => {
    return `${formData.beneficiary_name} ಅವರ ${formData.visit_type} ಭೇಟಿ ದಾಖಲಾಗಿದೆ. ತೂಕ ${formData.weight} ಕೆಜಿ. ಲಸಿಕೆ ${formData.vaccinations_completed}. ಮುಂದಿನ ಭೇಟಿ ದಿನಾಂಕ ${formData.next_visit_date}. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ ಖಚಿತಪಡಿಸಿ.`;
  };

  const handleListenReadback = () => {
    if (isPlayingReadback) {
      // Worker interrupted spoken audio
      voiceWs.interruptAudio();
      ttsService.stop();
      setIsPlayingReadback(false);
      return;
    }

    const readbackText = generateKannadaReadback();
    setIsPlayingReadback(true);

    ttsService.speakText(readbackText, {
      language: 'kn-IN',
      onEnd: () => setIsPlayingReadback(false)
    });
  };

  // Open manual edit modal for a field
  const handleStartEditField = (fieldName, currentValue) => {
    setEditingField(fieldName);
    setEditFieldValue(currentValue || '');
  };

  const handleSaveFieldEdit = async () => {
    if (!editingField) return;
    const updated = { ...formData, [editingField]: editFieldValue };
    setFormData(updated);

    // Call REST /api/visits/correct and notify WS
    try {
      await api.correctVisitField({
        field_name: editingField,
        new_value: editFieldValue,
        session_id: voiceWs.sessionId
      });
      voiceWs.correctField({
        fieldName: editingField,
        newValue: editFieldValue
      });
      setSuccessToast(`ಕ್ಷೇತ್ರ '${editingField}' ಅನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ.`);
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      console.warn('[StructuredRecord] Correction error', err);
    }

    setEditingField(null);
  };

  // Voice Correction Handler
  const handleStartVoiceCorrection = (fieldKey) => {
    setVoiceCorrectionField(fieldKey);
    setVoiceCorrectionActive(true);
    setVoiceCorrectionInput('');
  };

  const handleApplyVoiceCorrection = async () => {
    if (!voiceCorrectionField || !voiceCorrectionInput) return;
    const updated = { ...formData, [voiceCorrectionField]: voiceCorrectionInput };
    setFormData(updated);

    await api.correctVisitField({
      field_name: voiceCorrectionField,
      new_value: voiceCorrectionInput,
      correction_text: voiceCorrectionInput,
      session_id: voiceWs.sessionId
    });

    voiceWs.correctField({
      fieldName: voiceCorrectionField,
      newValue: voiceCorrectionInput,
      correctionText: voiceCorrectionInput
    });

    setSuccessToast(`ಧ್ವನಿ ಮೂಲಕ '${voiceCorrectionField}' ತಿದ್ದುಪಡಿ ಮಾಡಲಾಗಿದೆ.`);
    setTimeout(() => setSuccessToast(''), 3000);
    setVoiceCorrectionActive(false);
    setVoiceCorrectionField(null);
  };

  // Confirm and Save
  const handleConfirmAndSave = async () => {
    try {
      setIsSaving(true);
      ttsService.stop();

      // Notify WebSocket confirm_record
      voiceWs.confirmRecord(formData);

      // Save via REST API
      const result = await api.confirmVisit({
        session_id: voiceWs.sessionId,
        visit_record: formData
      });

      setIsSaving(false);
      if (onSaved) onSaved(result);
    } catch (err) {
      console.error('[StructuredRecord] Save error', err);
      setIsSaving(false);
    }
  };

  const fieldLabels = {
    beneficiary_id: { kn: 'ಫಲಾನುಭವಿ ಐಡಿ (Beneficiary ID)', icon: User },
    beneficiary_name: { kn: 'ಹೆಸರು (Beneficiary Name)', icon: User },
    visit_type: { kn: 'ಭೇಟಿಯ ವಿಧ (Visit Type)', icon: Calendar },
    weight: { kn: 'ತೂಕ (Weight in kg)', icon: Scale },
    vaccinations_due: { kn: 'ಬಾಕಿ ಇರುವ ಲಸಿಕೆಗಳು (Vaccinations Due)', icon: Syringe },
    vaccinations_completed: { kn: 'ಪೂರ್ಣಗೊಂಡ ಲಸಿಕೆಗಳು (Vaccinations Completed)', icon: CheckCircle },
    next_visit_date: { kn: 'ಮುಂದಿನ ಭೇಟಿ ದಿನಾಂಕ (Next Visit Date)', icon: Calendar },
    additional_notes: { kn: 'ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿಗಳು (Additional Notes)', icon: FileText }
  };

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto px-4 pt-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white border border-navy-100 text-navy-700 hover:bg-navy-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-base font-bold font-kannada text-navy-900 leading-tight">
            ರಚನಾತ್ಮಕ ಭೇಟಿ ದಾಖಲೆ
          </h2>
          <p className="text-[11px] text-navy-500 font-mono">Structured Visit Record</p>
        </div>
        <div className="w-9 h-9"></div> {/* Balancer */}
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Spoken Readback Bar (AI4Bharat Indic-Speak) */}
      <div className="bg-gradient-to-r from-teal-800 to-navy-900 text-white rounded-2xl p-4 shadow-touch flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleListenReadback}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isPlayingReadback
                ? 'bg-emergency-600 text-white animate-pulse'
                : 'bg-teal-500 hover:bg-teal-400 text-white'
            }`}
            title={isPlayingReadback ? 'Stop Readback (Interrupt)' : 'Listen to Kannada Readback'}
          >
            {isPlayingReadback ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
          <div>
            <h4 className="text-xs font-bold font-kannada text-teal-200">
              {isPlayingReadback ? 'ಧ್ವನಿ ಓದಲಾಗುತ್ತಿದೆ (Reading Back...)' : 'ಧ್ವನಿ ಓದುವಿಕೆ (Listen to Readback)'}
            </h4>
            <p className="text-[11px] text-white/80">
              {isPlayingReadback ? 'ನಿಲ್ಲಿಸಲು ಬಟನ್ ಒತ್ತಿ (Tap to Interrupt)' : 'ದಾಖಲೆಯನ್ನು ಕನ್ನಡದಲ್ಲಿ ಆಲಿಸಿ'}
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-teal-900 text-teal-200 px-2 py-0.5 rounded font-mono border border-teal-700">
          Indic-Speak
        </span>
      </div>

      {/* Structured Fields Grid */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-navy-100 pb-2">
          <span className="text-xs font-bold text-navy-800 font-kannada">
            AI ಗುರುತಿಸಿದ ಕ್ಷೇತ್ರಗಳು (Extracted Fields)
          </span>
          <span className="text-[10px] text-navy-400 font-medium">
            ತಿದ್ದುಪಡಿ ಮಾಡಲು ಕ್ಷೇತ್ರವನ್ನು ಸ್ಪರ್ಶಿಸಿ
          </span>
        </div>

        {Object.entries(formData).map(([key, value]) => {
          const config = fieldLabels[key] || { kn: key, icon: FileText };
          const Icon = config.icon;

          return (
            <div
              key={key}
              className="p-3 rounded-xl border border-navy-100 hover:border-teal-300 bg-navy-50/40 hover:bg-white transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2.5 flex-1 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-semibold text-navy-500 block leading-tight font-kannada">
                      {config.kn}
                    </span>
                    <span className="text-xs font-bold text-navy-900 block mt-0.5 break-words">
                      {value || '—'}
                    </span>
                  </div>
                </div>

                {/* Edit Controls: Manual & Voice Correction */}
                <div className="flex items-center space-x-1.5 shrink-0">
                  {/* Voice Correction Button */}
                  <button
                    onClick={() => handleStartVoiceCorrection(key)}
                    className="p-1.5 rounded-lg text-teal-700 bg-teal-50 hover:bg-teal-100 touch-manipulation"
                    title="ಧ್ವನಿ ತಿದ್ದುಪಡಿ / Voice Correction"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>

                  {/* Manual Edit Button */}
                  <button
                    onClick={() => handleStartEditField(key, value)}
                    className="p-1.5 rounded-lg text-navy-600 bg-navy-100 hover:bg-navy-200 touch-manipulation"
                    title="ಬರೆದು ತಿದ್ದುಪಡಿ / Manual Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation & Save Buttons */}
      <div className="space-y-2 pt-2">
        <button
          onClick={handleConfirmAndSave}
          disabled={isSaving}
          className="w-full bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-xl shadow-touch flex items-center justify-center space-x-2 transition-all touch-manipulation"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              <span>ಉಳಿಸಲಾಗುತ್ತಿದೆ... (Saving...)</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-kannada font-bold">
                ಖಚಿತಪಡಿಸಿ ಮತ್ತು ಉಳಿಸಿ (Confirm & Save Record)
              </span>
            </>
          )}
        </button>

        <button
          onClick={onBack}
          className="w-full py-2.5 px-4 rounded-xl border border-navy-200 text-navy-700 font-semibold text-xs hover:bg-navy-50 active:scale-98 transition-all touch-manipulation"
        >
          ಮತ್ತೆ ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಮಾಡಿ (Record Again)
        </button>
      </div>

      {/* Manual Field Edit Modal */}
      {editingField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-navy-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-navy-900 font-kannada">
                ಕ್ಷೇತ್ರ ತಿದ್ದುಪಡಿ: {fieldLabels[editingField]?.kn || editingField}
              </h4>
              <button
                onClick={() => setEditingField(null)}
                className="p-1 rounded-lg text-navy-400 hover:text-navy-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              value={editFieldValue}
              onChange={(e) => setEditFieldValue(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border border-navy-300 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-medium"
              placeholder="ಸರಿಯಾದ ಮೌಲ್ಯವನ್ನು ನಮೂದಿಸಿ..."
            />

            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => setEditingField(null)}
                className="flex-1 py-2.5 rounded-xl border border-navy-200 text-navy-700 font-semibold text-xs"
              >
                ರದ್ದುಮಾಡಿ
              </button>
              <button
                onClick={handleSaveFieldEdit}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 shadow-touch"
              >
                ಉಳಿಸಿ (Save)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Correction Modal */}
      {voiceCorrectionActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-navy-200 text-center">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-3">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>

            <h4 className="text-base font-bold text-navy-900 font-kannada">
              ಧ್ವನಿ ತಿದ್ದುಪಡಿ (Voice Correction)
            </h4>
            <p className="text-xs text-navy-500 mb-3 font-medium">
              ಕ್ಷೇತ್ರ: {fieldLabels[voiceCorrectionField]?.kn || voiceCorrectionField}
            </p>

            <div className="bg-navy-50 rounded-xl p-3 border border-navy-100 text-xs text-left mb-3">
              <label className="text-[10px] font-bold text-navy-500 uppercase block mb-1">
                ಹೊಸ ಮೌಲ್ಯ / New Value:
              </label>
              <input
                type="text"
                value={voiceCorrectionInput}
                onChange={(e) => setVoiceCorrectionInput(e.target.value)}
                placeholder="ಉದಾ: 59 kg ಅಥವಾ ಮುಂದಿನ ಭೇಟಿ 2026-12-10"
                className="w-full bg-white p-2 rounded-lg border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
              />
            </div>

            {/* Quick Suggestions based on field */}
            <div className="flex flex-wrap gap-1.5 justify-center mb-4">
              {voiceCorrectionField === 'weight' && (
                ['55.0', '58.0', '60.5', '62.0'].map(val => (
                  <button
                    key={val}
                    onClick={() => setVoiceCorrectionInput(val)}
                    className="text-[11px] px-2 py-1 rounded-lg bg-navy-100 text-navy-700 hover:bg-teal-100 hover:text-teal-800 font-mono"
                  >
                    {val} kg
                  </button>
                ))
              )}
              {voiceCorrectionField === 'vaccinations_completed' && (
                ['TT-1 Completed', 'TT-2 Completed', 'OPV-3 + Penta-3'].map(val => (
                  <button
                    key={val}
                    onClick={() => setVoiceCorrectionInput(val)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-navy-100 text-navy-700 hover:bg-teal-100 hover:text-teal-800"
                  >
                    {val}
                  </button>
                ))
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setVoiceCorrectionActive(false)}
                className="flex-1 py-2.5 rounded-xl border border-navy-200 text-navy-700 font-semibold text-xs"
              >
                ರದ್ದುಮಾಡಿ
              </button>
              <button
                onClick={handleApplyVoiceCorrection}
                disabled={!voiceCorrectionInput}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 shadow-touch disabled:opacity-50"
              >
                ಅನ್ವಯಿಸಿ (Apply)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
