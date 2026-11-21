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
  BookmarkCheck, 
  ShieldAlert,
  Activity
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
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12">
      {/* 1. Header Bar with Back and Readback Audio */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-[#F0DDE2] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] text-[#3B2A33] hover:bg-navy-100 active:scale-95 transition-decelerate"
            title="ಹಿಂದೆ / Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg lg:text-xl font-bold font-kannada text-[#3B2A33] leading-tight">
                ರಚನಾತ್ಮಕ ಭೇಟಿ ದಾಖಲೆ (Structured Clinical Visit)
              </h1>
              <span className="text-xs font-mono font-bold bg-[#FDF6F5] text-[#A25B74] px-2.5 py-0.5 rounded-full border border-[#F0DDE2]">
                MoHFW Verified
              </span>
            </div>
            <p className="text-xs text-[#7A6670] font-medium mt-0.5">
              ಧ್ವನಿ ಮಾದರಿಯಿಂದ ಪರಿವರ್ತಿಸಲಾದ ಕ್ಲಿನಿಕಲ್ ಮಾಹಿತಿ ಪರಿಶೀಲನೆ & ದೃಢೀಕರಣ
            </p>
          </div>
        </div>

        {/* Indic-Speak Voice Readback Button */}
        <button
          onClick={handleListenReadback}
          className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs font-bold border active:scale-95 transition-decelerate self-start sm:self-auto ${
            isPlayingReadback
              ? 'bg-[#477A60] text-white border-healthcare shadow-touch animate-pulse'
              : 'bg-[#FDF6F5] text-[#A25B74] border-[#F0DDE2] hover:bg-cyan-100'
          }`}
          title="AI4Bharat Indic-Speak ಧ್ವನಿ ಮೂಲಕ ಓದಿ ಕೇಳಿ"
        >
          {isPlayingReadback ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span className="font-kannada text-sm">
            {isPlayingReadback ? 'ನಿಲ್ಲಿಸಿ' : 'ಧ್ವನಿ ಮೂಲಕ ಓದಿ ಕೇಳಿ (Voice Readback)'}
          </span>
        </button>
      </div>

      {successToast && (
        <div className="bg-[#477A60] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-card flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 2-Column Responsive Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: DEMOGRAPHICS, VITALS & CLINICAL OBSERVATION */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 space-y-6">
          {/* Beneficiary Info Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-4">
            <div className="flex items-start justify-between border-b border-[#F0DDE2] pb-3">
              <div className="flex items-start space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#FDF6F5] text-cyan-700 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C47A92] font-mono tracking-wider block">
                    Beneficiary Demographics
                  </span>
                  <h3 className="text-lg font-bold text-[#3B2A33] font-kannada mt-0.5">
                    {formData.beneficiary_name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs font-mono font-bold bg-[#FDF6F5] text-[#3B2A33] px-2.5 py-0.5 rounded-lg border border-[#F0DDE2]">
                      ID: {formData.beneficiary_id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FDF6F5] text-[#A25B74] font-bold text-xs border border-[#F0DDE2]">
                      {formData.visit_type}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartEditField('beneficiary_name', formData.beneficiary_name)}
                className="p-2 rounded-xl text-[#C47A92] hover:text-[#3B2A33] hover:bg-[#FDF6F5] active:scale-95"
                title="Edit Beneficiary Name"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Weight Card */}
            <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card relative space-y-2">
              <div className="flex items-center justify-between text-[#7A6670]">
                <span className="text-xs font-bold font-kannada flex items-center text-[#3B2A33]">
                  <Scale className="w-4 h-4 mr-1.5 text-[#A25B74]" />
                  ತಾಯಿ/ಮಗು ತೂಕ (Weight)
                </span>
                <button
                  onClick={() => handleStartVoiceCorrection('weight')}
                  className="text-xs text-[#A25B74] font-bold flex items-center space-x-1 hover:underline"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>ಧ್ವನಿ ತಿದ್ದುಪಡಿ</span>
                </button>
              </div>
              <div className="flex items-baseline space-x-1.5 pt-1">
                <span className="text-3xl font-bold font-mono text-[#3B2A33]">
                  {formData.weight || '--'}
                </span>
                <span className="text-sm font-bold text-[#C47A92]">kg</span>
              </div>
            </div>

            {/* Next Visit Date Card */}
            <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card relative space-y-2">
              <div className="flex items-center justify-between text-[#7A6670]">
                <span className="text-xs font-bold font-kannada flex items-center text-[#3B2A33]">
                  <Calendar className="w-4 h-4 mr-1.5 text-[#A25B74]" />
                  ಮುಂದಿನ ಭೇಟಿ ದಿನಾಂಕ
                </span>
                <button
                  onClick={() => handleStartVoiceCorrection('next_visit_date')}
                  className="text-xs text-[#A25B74] font-bold flex items-center space-x-1 hover:underline"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>ಧ್ವನಿ ತಿದ್ದುಪಡಿ</span>
                </button>
              </div>
              <div className="text-lg font-bold font-mono text-[#3B2A33] pt-2">
                {formData.next_visit_date || 'ನಿಗದಿಪಡಿಸಿಲ್ಲ'}
              </div>
            </div>
          </div>

          {/* Clinical Observation Notes */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-2.5">
              <h3 className="font-bold text-sm text-[#3B2A33] font-kannada flex items-center">
                <FileText className="w-4 h-4 mr-2 text-[#A25B74]" />
                ಕ್ಷೇತ್ರ ಭೇಟಿ ಟಿಪ್ಪಣಿಗಳು (Field Observation Notes)
              </h3>
              <button
                onClick={() => handleStartEditField('additional_notes', formData.additional_notes)}
                className="text-xs text-[#A25B74] font-bold flex items-center space-x-1 hover:underline"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>ಬದಲಾಯಿಸಿ</span>
              </button>
            </div>
            <p className="text-sm text-[#3B2A33] font-medium leading-relaxed bg-[#FDF6F5] p-4 rounded-2xl border border-[#F0DDE2]">
              {formData.additional_notes || 'ಯಾವುದೇ ಹೆಚ್ಚುವರಿ ಟಿಪ್ಪಣಿ ಇಲ್ಲ.'}
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: IMMUNIZATION, CONFIRMATION & ACTIONS       */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 space-y-6">
          {/* Immunization Details Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
              <h3 className="font-bold text-sm text-[#3B2A33] font-kannada flex items-center">
                <Syringe className="w-4 h-4 mr-2 text-[#A25B74]" />
                ಲಸಿಕೆಗಳ ವಿವರ (Immunization Records)
              </h3>
              <button
                onClick={() => handleStartVoiceCorrection('vaccinations_completed')}
                className="text-xs text-[#A25B74] font-bold flex items-center space-x-1 hover:underline"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>ಲಸಿಕೆ ತಿದ್ದುಪಡಿ</span>
              </button>
            </div>

            {/* Completed Vaccines */}
            <div className="p-4 rounded-2xl bg-[#E8F7F1] border border-[#C8EEDD] space-y-1">
              <span className="text-[11px] uppercase font-bold text-[#477A60] tracking-wider block">
                ✓ ಪೂರ್ಣಗೊಂಡ ಲಸಿಕೆಗಳು (Vaccinations Completed):
              </span>
              <div className="text-sm font-bold text-[#3B2A33]">
                {formData.vaccinations_completed || 'ಯಾವುದೂ ದಾಖಲಾಗಿಲ್ಲ'}
              </div>
            </div>

            {/* Due Vaccines */}
            <div className="p-4 rounded-2xl bg-warning-50 border border-warning-200 space-y-1">
              <span className="text-[11px] uppercase font-bold text-warning-700 tracking-wider block">
                ⏳ ಮುಂದಿನ ಬಾಕಿ ಲಸಿಕೆಗಳು (Vaccinations Due):
              </span>
              <div className="text-sm font-bold text-[#3B2A33]">
                {formData.vaccinations_due || 'ಯಾವುದೂ ಬಾಕಿ ಇಲ್ಲ'}
              </div>
            </div>
          </div>

          {/* Spoken Readback Status Box */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#A25B74]" />
              <h4 className="text-xs font-bold text-[#3B2A33] font-kannada">
                ಧ್ವನಿ ದೃಢೀಕರಣ ಪಠ್ಯ (Spoken Confirmation Script)
              </h4>
            </div>
            <p className="text-xs text-[#3B2A33] bg-[#FDF6F5] p-3.5 rounded-2xl border border-[#F0DDE2] leading-relaxed font-kannada">
              "{generateKannadaReadback()}"
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleConfirmAndSave}
              disabled={isSaving}
              className="w-full bg-[#477A60] hover:bg-[#477A60]-hover text-white font-bold py-4 px-6 rounded-2xl shadow-touch flex items-center justify-center space-x-2 text-base active:scale-95 transition-decelerate touch-manipulation"
            >
              <Save className="w-5 h-5" />
              <span className="font-kannada">
                {isSaving ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ದೃಢೀಕರಿಸಿ ಅಧಿಕೃತವಾಗಿ ಉಳಿಸಿ (Confirm & Save)'}
              </span>
            </button>

            <button
              onClick={handleSaveDraft}
              className="w-full py-3 px-4 rounded-2xl border border-primary-200 text-[#A25B74] bg-[#FDF6F5]/50 font-bold text-xs hover:bg-cyan-100 active:scale-95 transition-decelerate flex items-center justify-center space-x-2"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>ಕರಡು ಉಳಿಸಿ (Save Local Draft for Offline Sync)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Voice Correction Popover Modal */}
      {voiceCorrectionActive && (
        <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-[#F0DDE2] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-2">
              <span className="text-xs font-bold text-[#3B2A33] font-kannada flex items-center space-x-2">
                <Mic className="w-4 h-4 text-[#A25B74]" />
                <span>ಧ್ವನಿ ತಿದ್ದುಪಡಿ: {voiceCorrectionField}</span>
              </span>
              <button
                onClick={() => setVoiceCorrectionActive(false)}
                className="p-1.5 rounded-xl hover:bg-[#FDF6F5] text-[#C47A92]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#7A6670] font-medium">
              ತಿದ್ದುಪಡಿ ಮಾಡಬೇಕಾದ ಹೊಸ ಮೌಲ್ಯವನ್ನು ನಮೂದಿಸಿ ಅಥವಾ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ:
            </p>

            <input
              type="text"
              value={voiceCorrectionInput}
              onChange={(e) => setVoiceCorrectionInput(e.target.value)}
              placeholder="ಉದಾಹರಣೆಗೆ: 59.2 ಅಥವಾ TT-2"
              className="w-full text-xs font-bold border border-[#F0DDE2] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A25B74] bg-[#FDF6F5]"
            />

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setVoiceCorrectionActive(false)}
                className="flex-1 py-3 text-xs font-semibold rounded-2xl border border-[#F0DDE2] text-[#3B2A33] hover:bg-[#FDF6F5] active:scale-95"
              >
                ರದ್ದುಮಾಡಿ
              </button>
              <button
                onClick={handleApplyVoiceCorrection}
                className="flex-1 py-3 text-xs font-bold rounded-2xl bg-[#A25B74] text-white hover:bg-[#A25B74]-hover active:scale-95 shadow-touch"
              >
                ತಿದ್ದುಪಡಿ ಉಳಿಸಿ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Field Edit Modal */}
      {editingField && (
        <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-[#F0DDE2] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-2">
              <span className="text-xs font-bold text-[#3B2A33] font-kannada">
                ಕ್ಷೇತ್ರ ಬದಲಾವಣೆ: {editingField}
              </span>
              <button
                onClick={() => setEditingField(null)}
                className="p-1.5 rounded-xl hover:bg-[#FDF6F5] text-[#C47A92]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={4}
              value={editFieldValue}
              onChange={(e) => setEditFieldValue(e.target.value)}
              className="w-full text-xs font-medium border border-[#F0DDE2] rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#A25B74] bg-[#FDF6F5]"
            />

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setEditingField(null)}
                className="flex-1 py-3 text-xs font-semibold rounded-2xl border border-[#F0DDE2] text-[#3B2A33] hover:bg-[#FDF6F5] active:scale-95"
              >
                ರದ್ದುಮಾಡಿ
              </button>
              <button
                onClick={handleSaveFieldEdit}
                className="flex-1 py-3 text-xs font-bold rounded-2xl bg-[#A25B74] text-white hover:bg-[#A25B74]-hover active:scale-95 shadow-touch"
              >
                ಉಳಿಸಿ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
