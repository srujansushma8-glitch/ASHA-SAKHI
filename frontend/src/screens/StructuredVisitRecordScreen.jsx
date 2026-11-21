import React, { useState } from 'react';
import { 
  CheckCircle, 
  Edit3, 
  Mic, 
  Volume2, 
  VolumeX, 
  Save, 
  Calendar, 
  User, 
  Scale, 
  Syringe, 
  FileText, 
  ArrowLeft,
  X,
  Sparkles,
  Check,
  BookmarkCheck
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
  const existingDraft = api.getDraftVisit ? api.getDraftVisit() : null;

  const [formData, setFormData] = useState({
    beneficiary_id: record?.beneficiary_id || existingDraft?.beneficiary_id || 'ASHA-KA-2024-0101',
    beneficiary_name: record?.beneficiary_name || existingDraft?.beneficiary_name || 'ಲಕ್ಷ್ಮಮ್ಮ ಕೆ. (Lakshmamma K.)',
    visit_type: record?.visit_type || existingDraft?.visit_type || 'ANC (Antenatal Care)',
    weight: record?.weight || existingDraft?.weight || '58.5',
    vaccinations_due: record?.vaccinations_due || existingDraft?.vaccinations_due || 'TT-2 / TD-2 Booster',
    vaccinations_completed: record?.vaccinations_completed || existingDraft?.vaccinations_completed || 'TT-1, Albendazole',
    next_visit_date: record?.next_visit_date || existingDraft?.next_visit_date || '2026-12-05',
    additional_notes: record?.additional_notes || existingDraft?.additional_notes || 'ಭ್ರೂಣದ ಚಲನೆ ಸಾಮಾನ್ಯವಾಗಿದೆ. 30 ದಿನಗಳ ಐರನ್ ಮಾತ್ರೆ (IFA) ವಿತರಿಸಲಾಗಿದೆ.'
  });

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
    return `${formData.beneficiary_name} ಅವರ ${formData.visit_type} ಭೇಟಿ ದಾಖಲಾಗಿದೆ. ತೂಕ ${formData.weight} ಕೆಜಿ. ಪಡೆದ ಲಸಿಕೆ ${formData.vaccinations_completed}. ಮುಂದಿನ ಭೇಟಿ ದಿನಾಂಕ ${formData.next_visit_date}. ವಿವರ ಸರಿಯಾಗಿದೆಯೇ?`;
  };

  const handleListenReadback = () => {
    if (isPlayingReadback) {
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

  const handleStartEditField = (fieldName, currentValue) => {
    setEditingField(fieldName);
    setEditFieldValue(currentValue || '');
  };

  const handleSaveFieldEdit = async () => {
    if (!editingField) return;
    const updated = { ...formData, [editingField]: editFieldValue };
    setFormData(updated);

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

  const handleSaveDraft = () => {
    if (api.saveDraftVisit) {
      api.saveDraftVisit(formData);
      setSuccessToast('ಕರಡು (Draft) ಸುರಕ್ಷಿತವಾಗಿ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ.');
      setTimeout(() => setSuccessToast(''), 3000);
    }
  };

  const handleConfirmAndSave = async () => {
    try {
      setIsSaving(true);
      ttsService.stop();
      voiceWs.confirmRecord(formData);

      const res = await api.confirmVisit({
        session_id: voiceWs.sessionId || `SES-${Date.now()}`,
        visit_record: formData
      });

      setSuccessToast('ಭೇಟಿ ಯಶಸ್ವಿಯಾಗಿ ರಿಜಿಸ್ಟರ್‌ನಲ್ಲಿ ದಾಖಲಾಗಿದೆ!');
      setTimeout(() => {
        if (onSaved) onSaved(res);
      }, 1200);
    } catch (err) {
      console.error('[StructuredRecord] Save error', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-28 max-w-2xl mx-auto px-4 pt-3 animate-fade-in">
      {/* 1. Header Bar with Back and Readback Audio */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-card flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-ivory-bg border border-navy-200 text-navy hover:bg-navy-50 active:scale-[0.98] transition-decelerate"
            title="ಹಿಂದೆ / Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold font-kannada text-navy leading-tight">
              ದಾಖಲಾದ ಭೇಟಿ ವಿವರಗಳು
            </h2>
            <p className="text-[11px] text-navy-500 font-medium">
              Structured Field Register Entry
            </p>
          </div>
        </div>

        {/* Spoken Readback (Indic-Speak) Button */}
        <button
          onClick={handleListenReadback}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border active:scale-[0.98] transition-decelerate ${
            isPlayingReadback
              ? 'bg-healthcare text-white border-healthcare animate-pulse'
              : 'bg-mint-surface text-primary border-primary-200 hover:bg-teal-200'
          }`}
          title="AI4Bharat Indic-Speak ಧ್ವನಿ ಮೂಲಕ ಓದಿ ಕೇಳಿ"
        >
          {isPlayingReadback ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span className="font-kannada font-bold">
            {isPlayingReadback ? 'ನಿಲ್ಲಿಸಿ' : 'ಧ್ವನಿ ಓದುವಿಕೆ'}
          </span>
        </button>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="bg-healthcare text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-card flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 2. Beneficiary Info Card */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-card">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-navy font-kannada">
                  {formData.beneficiary_name}
                </span>
                <span className="text-[10px] font-mono font-bold bg-navy-50 text-navy-600 px-2 py-0.5 rounded border border-navy-100">
                  {formData.beneficiary_id}
                </span>
              </div>
              <div className="mt-1 flex items-center space-x-2 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-mint-surface text-primary font-bold text-[11px]">
                  {formData.visit_type}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleStartEditField('beneficiary_name', formData.beneficiary_name)}
            className="p-1.5 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-ivory-bg active:scale-[0.98]"
            title="Edit Beneficiary Name"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Clinical Vitals & Measurements Card */}
      <div className="grid grid-cols-2 gap-3">
        {/* Weight Field */}
        <div className="bg-white rounded-2xl p-3.5 border border-navy-100 shadow-subtle relative">
          <div className="flex items-center justify-between text-navy-500 mb-1.5">
            <span className="text-xs font-bold font-kannada flex items-center">
              <Scale className="w-4 h-4 mr-1 text-primary" />
              ತೂಕ (Weight)
            </span>
            <button
              onClick={() => handleStartVoiceCorrection('weight')}
              className="text-[10px] text-primary font-bold flex items-center space-x-0.5 hover:underline"
            >
              <Mic className="w-3 h-3" />
              <span>ಧ್ವನಿ ತಿದ್ದುಪಡಿ</span>
            </button>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-navy">
              {formData.weight || '--'}
            </span>
            <span className="text-xs font-bold text-navy-500">kg</span>
          </div>
        </div>

        {/* Next Visit Date */}
        <div className="bg-white rounded-2xl p-3.5 border border-navy-100 shadow-subtle relative">
          <div className="flex items-center justify-between text-navy-500 mb-1.5">
            <span className="text-xs font-bold font-kannada flex items-center">
              <Calendar className="w-4 h-4 mr-1 text-primary" />
              ಮುಂದಿನ ಭೇಟಿ
            </span>
            <button
              onClick={() => handleStartVoiceCorrection('next_visit_date')}
              className="text-[10px] text-primary font-bold flex items-center space-x-0.5 hover:underline"
            >
              <Mic className="w-3 h-3" />
              <span>ಧ್ವನಿ ತಿದ್ದುಪಡಿ</span>
            </button>
          </div>
          <div className="text-sm font-bold font-mono text-navy">
            {formData.next_visit_date || 'ನಿಗದಿಪಡಿಸಿಲ್ಲ'}
          </div>
        </div>
      </div>

      {/* 4. Immunization: Due vs Completed Vaccines */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-navy font-kannada flex items-center">
            <Syringe className="w-4 h-4 mr-1.5 text-primary" />
            ಲಸಿಕೆಗಳ ವಿವರ (Immunization Records)
          </h3>
          <button
            onClick={() => handleStartVoiceCorrection('vaccinations_completed')}
            className="text-[11px] text-primary font-bold flex items-center space-x-1 hover:underline"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>ಲಸಿಕೆ ತಿದ್ದುಪಡಿ</span>
          </button>
        </div>

        {/* Vaccinations Completed (Healthcare Green) */}
        <div className="p-3 rounded-xl bg-healthcare-50 border border-healthcare-100">
          <span className="text-[10px] uppercase font-bold text-healthcare-700 tracking-wider block mb-1">
            ಪೂರ್ಣಗೊಂಡ ಲಸಿಕೆಗಳು (Vaccinations Completed):
          </span>
          <div className="text-xs font-bold text-navy">
            {formData.vaccinations_completed || 'ಯಾವುದೂ ದಾಖಲಾಗಿಲ್ಲ'}
          </div>
        </div>

        {/* Vaccinations Due (Warning Amber) */}
        <div className="p-3 rounded-xl bg-warning-50 border border-warning-200">
          <span className="text-[10px] uppercase font-bold text-warning-700 tracking-wider block mb-1">
            ಮುಂದಿನ ಬಾಕಿ ಲಸಿಕೆಗಳು (Vaccinations Due):
          </span>
          <div className="text-xs font-bold text-navy">
            {formData.vaccinations_due || 'ಯಾವುದೂ ಬಾಕಿ ಇಲ್ಲ'}
          </div>
        </div>
      </div>

      {/* 5. Additional Clinical Notes */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-card space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-navy font-kannada flex items-center">
            <FileText className="w-4 h-4 mr-1.5 text-primary" />
            ಕ್ಷೇತ್ರ ಭೇಟಿ ಟಿಪ್ಪಣಿಗಳು (Field Observation Notes)
          </h3>
          <button
            onClick={() => handleStartEditField('additional_notes', formData.additional_notes)}
            className="text-[11px] text-primary font-bold flex items-center space-x-1 hover:underline"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>ಬದಲಾಯಿಸಿ</span>
          </button>
        </div>
        <p className="text-xs text-navy-700 font-medium leading-relaxed bg-ivory-bg p-3 rounded-xl border border-navy-100">
          {formData.additional_notes || 'ಯಾವುದೇ ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿ ಇಲ್ಲ.'}
        </p>
      </div>

      {/* 6. Voice Correction Popover Modal */}
      {voiceCorrectionActive && (
        <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 border border-navy-100 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy font-kannada flex items-center space-x-1.5">
                <Mic className="w-4 h-4 text-primary" />
                <span>ಧ್ವನಿ ತಿದ್ದುಪಡಿ: {voiceCorrectionField}</span>
              </span>
              <button
                onClick={() => setVoiceCorrectionActive(false)}
                className="p-1 rounded-lg hover:bg-navy-50 text-navy-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-navy-600 font-medium">
              ತಿದ್ದುಪಡಿ ಮಾಡಬೇಕಾದ ಹೊಸ ಮೌಲ್ಯವನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ:
            </p>

            <input
              type="text"
              value={voiceCorrectionInput}
              onChange={(e) => setVoiceCorrectionInput(e.target.value)}
              placeholder="ಉದಾಹರಣೆಗೆ: 59.2 ಅಥವಾ TT-2"
              className="w-full text-xs font-medium border border-navy-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setVoiceCorrectionActive(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-navy-200 text-navy hover:bg-ivory-bg active:scale-[0.98]"
              >
                ರದ್ದುಮಾಡಿ
              </button>
              <button
                onClick={handleApplyVoiceCorrection}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-hover active:scale-[0.98]"
              >
                ತಿದ್ದುಪಡಿ ಉಳಿಸಿ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Field Edit Modal */}
      {editingField && (
        <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 border border-navy-100 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy font-kannada">
                ಕ್ಷೇತ್ರ ಬದಲಾವಣೆ: {editingField}
              </span>
              <button
                onClick={() => setEditingField(null)}
                className="p-1 rounded-lg hover:bg-navy-50 text-navy-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={3}
              value={editFieldValue}
              onChange={(e) => setEditFieldValue(e.target.value)}
              className="w-full text-xs font-medium border border-navy-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setEditingField(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl border border-navy-200 text-navy hover:bg-ivory-bg active:scale-[0.98]"
              >
                ರದ್ದುಮಾಡಿ
              </button>
              <button
                onClick={handleSaveFieldEdit}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-hover active:scale-[0.98]"
              >
                ಉಳಿಸಿ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons: Draft Save & Primary Confirm */}
      <div className="space-y-2 pt-2">
        <button
          onClick={handleConfirmAndSave}
          disabled={isSaving}
          className="w-full bg-healthcare hover:bg-healthcare-hover text-white font-bold py-4 px-4 rounded-2xl shadow-touch flex items-center justify-center space-x-2 text-base active:scale-[0.98] transition-decelerate touch-manipulation"
        >
          <Save className="w-5 h-5" />
          <span className="font-kannada">
            {isSaving ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ದೃಢೀಕರಿಸಿ ಅಧಿಕೃತವಾಗಿ ಉಳಿಸಿ (Confirm & Save)'}
          </span>
        </button>

        <button
          onClick={handleSaveDraft}
          className="w-full py-2.5 px-3 rounded-xl border border-primary-200 text-primary bg-mint-surface/40 font-semibold text-xs hover:bg-mint-surface active:scale-[0.98] transition-decelerate flex items-center justify-center space-x-1.5"
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>ಕರಡು ಉಳಿಸಿ (Save Local Draft)</span>
        </button>
      </div>
    </div>
  );
}
