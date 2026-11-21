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
import { useLanguage } from '../context/LanguageContext';

export default function StructuredVisitRecordScreen({
  record, 
  onSaved, 
  onBack, 
  onTriggerEmergency 
}) {
  const { language, t, dir, isRtl, langInfo } = useLanguage();
  const existingDraft = api.getDraftVisit ? api.getDraftVisit() : null;

  const [formData, setFormData] = useState({
    beneficiary_id: record?.beneficiary_id || existingDraft?.beneficiary_id || 'ASHA-KA-2024-0101',
    beneficiary_name: record?.beneficiary_name || existingDraft?.beneficiary_name || 'Lakshmamma K.',
    visit_type: record?.visit_type || existingDraft?.visit_type || 'ANC',
    weight: record?.weight || existingDraft?.weight || '58.5',
    vaccinations_due: record?.vaccinations_due || existingDraft?.vaccinations_due || 'TT-2 / TD-2 Booster',
    vaccinations_completed: record?.vaccinations_completed || existingDraft?.vaccinations_completed || 'TT-1, Albendazole',
    next_visit_date: record?.next_visit_date || existingDraft?.next_visit_date || '2026-12-05',
    additional_notes: record?.additional_notes || existingDraft?.additional_notes || (
      language === 'kn'
        ? 'ಭ್ರೂಣದ ಚಲನೆ ಸಾಮಾನ್ಯವಾಗಿದೆ. 30 ದಿನಗಳ ಐರನ್ ಮಾತ್ರೆ (IFA) ವಿತರಿಸಲಾಗಿದೆ.'
        : language === 'hi'
        ? 'भ्रूण की हलचल सामान्य है। 30 दिनों की आयरन की गोलियां (IFA) वितरित की गईं।'
        : 'Fetal movements normal. 30 days of IFA tablets distributed.'
    )
  });

  const [editingField, setEditingField] = useState(null);
  const [editFieldValue, setEditFieldValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPlayingReadback, setIsPlayingReadback] = useState(false);
  const [voiceCorrectionActive, setVoiceCorrectionActive] = useState(false);
  const [voiceCorrectionField, setVoiceCorrectionField] = useState(null);
  const [voiceCorrectionInput, setVoiceCorrectionInput] = useState('');
  const [successToast, setSuccessToast] = useState('');

  const generateReadbackText = () => {
    if (language === 'kn') {
      return `${formData.beneficiary_name} ಅವರ ${formData.visit_type} ಭೇಟಿ ದಾಖಲಾಗಿದೆ. ತೂಕ ${formData.weight} ಕೆಜಿ. ಪಡೆದ ಲಸಿಕೆ ${formData.vaccinations_completed}. ಮುಂದಿನ ಭೇಟಿ ದಿನಾಂಕ ${formData.next_visit_date}. ${t('structuredRecord.readbackQuestion')}`;
    }
    if (language === 'hi') {
      return `${formData.beneficiary_name} का ${formData.visit_type} दौरा दर्ज किया गया। वजन ${formData.weight} किग्रा। दिए गए टीके ${formData.vaccinations_completed}। अगली भेंट तिथि ${formData.next_visit_date}। ${t('structuredRecord.readbackQuestion')}`;
    }
    return `${formData.beneficiary_name} ${formData.visit_type} visit recorded. Weight ${formData.weight} kg. Completed vaccines ${formData.vaccinations_completed}. Next visit date ${formData.next_visit_date}. ${t('structuredRecord.readbackQuestion')}`;
  };

  const handleListenReadback = () => {
    if (isPlayingReadback) {
      voiceWs.interruptAudio();
      ttsService.stop();
      setIsPlayingReadback(false);
      return;
    }

    const readbackText = generateReadbackText();
    setIsPlayingReadback(true);

    ttsService.speakText(readbackText, {
      language: langInfo.bcp47,
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
      setSuccessToast(t('structuredRecord.fieldUpdated'));
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

    setSuccessToast(t('structuredRecord.voiceCorrectionSuccess'));
    setTimeout(() => setSuccessToast(''), 3000);
    setVoiceCorrectionActive(false);
    setVoiceCorrectionField(null);
  };

  const handleSaveDraft = () => {
    if (api.saveDraftVisit) {
      api.saveDraftVisit(formData);
      setSuccessToast(t('structuredRecord.draftSaved'));
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
        beneficiary_id: formData.beneficiary_id,
        beneficiary_name: formData.beneficiary_name,
        visit_type: formData.visit_type,
        weight: parseFloat(formData.weight) || 55.0,
        vaccinations_due: formData.vaccinations_due,
        vaccinations_completed: formData.vaccinations_completed,
        next_visit_date: formData.next_visit_date,
        additional_notes: formData.additional_notes,
        created_at: new Date().toISOString()
      });

      if (api.clearDraftVisit) api.clearDraftVisit();

      setSuccessToast(t('structuredRecord.saveSuccess'));
      setTimeout(() => {
        if (onSaved) onSaved(res || formData);
      }, 1000);
    } catch (err) {
      console.error('[StructuredRecord] Save error', err);
      if (onSaved) onSaved(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12" dir={dir}>
      {/* 1. Header with Back Button and Readback Button */}
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
              <h1 className="text-lg lg:text-xl font-bold text-[#3B2A33] leading-tight font-serif">
                {t('structuredRecord.title')}
              </h1>
              <span className="text-xs font-mono font-bold bg-[#E8F7F1] text-[#477A60] px-2.5 py-0.5 rounded-full border border-[#C8EEDD]">
                NHM Compliant
              </span>
            </div>
            <p className="text-xs text-[#7A6670] font-medium mt-0.5">
              {t('structuredRecord.subtitle')}
            </p>
          </div>
        </div>

        {/* Readback Voice Button */}
        <button
          onClick={handleListenReadback}
          className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-bold text-xs transition-decelerate active:scale-95 shadow-touch self-start sm:self-auto ${
            isPlayingReadback
              ? 'bg-[#A25B74] text-white shadow-touch animate-pulse'
              : 'bg-[#FDF6F5] text-[#A25B74] border border-[#F0DDE2] hover:bg-[#F9ECEC]'
          }`}
          title={t('voice.readback')}
        >
          {isPlayingReadback ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span className="text-sm">
            {isPlayingReadback ? t('voice.stop') : t('voice.readback')}
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
        {/* LEFT COLUMN: DEMOGRAPHICS, VITALS & CLINICAL OBSERVATION */}
        <div className="lg:col-span-6 space-y-6">
          {/* Beneficiary Info Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-4">
            <div className="flex items-start justify-between border-b border-[#F0DDE2] pb-3">
              <div className="flex items-start space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#FDF6F5] text-[#A25B74] flex items-center justify-center shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C47A92] font-mono tracking-wider block">
                    {t('common.beneficiary')}
                  </span>
                  <h3 className="text-lg font-bold text-[#3B2A33] mt-0.5">
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
                title={t('common.edit')}
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
                <span className="text-xs font-bold flex items-center text-[#3B2A33]">
                  <Scale className="w-4 h-4 mr-1.5 text-[#A25B74]" />
                  {t('common.weight')}
                </span>
                <button
                  onClick={() => handleStartVoiceCorrection('weight')}
                  className="text-xs text-[#A25B74] font-bold flex items-center space-x-1 hover:underline"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{t('structuredRecord.voiceEdit')}</span>
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
                <span className="text-xs font-bold flex items-center text-[#3B2A33]">
                  <Calendar className="w-4 h-4 mr-1.5 text-[#A25B74]" />
                  {t('structuredRecord.nextVisit')}
                </span>
                <button
                  onClick={() => handleStartVoiceCorrection('next_visit_date')}
                  className="text-xs text-[#A25B74] font-bold flex items-center space-x-1 hover:underline"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{t('structuredRecord.voiceEdit')}</span>
                </button>
              </div>
              <div className="text-lg font-bold font-mono text-[#3B2A33] pt-2">
                {formData.next_visit_date || '--'}
              </div>
            </div>
          </div>

          {/* Clinical Observation Notes */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-2.5">
              <h3 className="font-bold text-sm text-[#3B2A33] flex items-center">
                <FileText className="w-4 h-4 mr-2 text-[#A25B74]" />
                {t('structuredRecord.notes')}
              </h3>
              <button
                onClick={() => handleStartEditField('additional_notes', formData.additional_notes)}
                className="text-xs text-[#A25B74] font-bold flex items-center space-x-1 hover:underline"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t('common.edit')}</span>
              </button>
            </div>
            <p className="text-sm text-[#3B2A33] font-medium leading-relaxed bg-[#FDF6F5] p-4 rounded-2xl border border-[#F0DDE2]">
              {formData.additional_notes || '--'}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: IMMUNIZATION, CONFIRMATION & ACTIONS */}
        <div className="lg:col-span-6 space-y-6">
          {/* Immunization Details Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
              <h3 className="font-bold text-sm text-[#3B2A33] flex items-center">
                <Syringe className="w-4 h-4 mr-2 text-[#A25B74]" />
                {t('immunization.title')}
              </h3>
              <button
                onClick={() => handleStartVoiceCorrection('vaccinations_completed')}
                className="text-xs text-[#A25B74] font-bold flex items-center space-x-1 hover:underline"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{t('structuredRecord.voiceEdit')}</span>
              </button>
            </div>

            {/* Completed Vaccines */}
            <div className="p-4 rounded-2xl bg-[#E8F7F1] border border-[#C8EEDD] space-y-1">
              <span className="text-[11px] uppercase font-bold text-[#477A60] tracking-wider block">
                ✓ {t('structuredRecord.vaccinationsCompleted')}:
              </span>
              <div className="text-sm font-bold text-[#3B2A33]">
                {formData.vaccinations_completed || '--'}
              </div>
            </div>

            {/* Due Vaccines */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="text-[11px] uppercase font-bold text-amber-800 tracking-wider block">
                ⏳ {t('structuredRecord.vaccinationsDue')}:
              </span>
              <div className="text-sm font-bold text-[#3B2A33]">
                {formData.vaccinations_due || '--'}
              </div>
            </div>
          </div>

          {/* Spoken Readback Status Box */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#A25B74]" />
              <h4 className="text-xs font-bold text-[#3B2A33]">
                {t('voice.readback')}
              </h4>
            </div>
            <p className="text-xs text-[#3B2A33] bg-[#FDF6F5] p-3.5 rounded-2xl border border-[#F0DDE2] leading-relaxed">
              "{generateReadbackText()}"
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleConfirmAndSave}
              disabled={isSaving}
              className="w-full bg-[#477A60] hover:bg-[#3d6952] text-white font-bold py-4 px-6 rounded-2xl shadow-touch flex items-center justify-center space-x-2 text-base active:scale-95 transition-decelerate touch-manipulation"
            >
              <Save className="w-5 h-5" />
              <span>
                {isSaving ? t('structuredRecord.saving') : t('structuredRecord.saveToRegister')}
              </span>
            </button>

            <button
              onClick={handleSaveDraft}
              className="w-full py-3 px-4 rounded-2xl border border-[#A25B74]/30 text-[#A25B74] bg-[#FDF6F5]/50 font-bold text-xs hover:bg-[#FDF6F5] active:scale-95 transition-decelerate flex items-center justify-center space-x-2"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>{t('structuredRecord.saveDraft')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Voice Correction Popover Modal */}
      {voiceCorrectionActive && (
        <div className="fixed inset-0 z-50 bg-[#3B2A33]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-[#F0DDE2] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-2">
              <span className="text-xs font-bold text-[#3B2A33] flex items-center space-x-2">
                <Mic className="w-4 h-4 text-[#A25B74]" />
                <span>{t('structuredRecord.voiceEdit')}: {voiceCorrectionField}</span>
              </span>
              <button
                onClick={() => setVoiceCorrectionActive(false)}
                className="p-1.5 rounded-xl hover:bg-[#FDF6F5] text-[#C47A92]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#7A6670] font-medium">
              {t('voice.voiceCorrectionHint')}
            </p>

            <input
              type="text"
              value={voiceCorrectionInput}
              onChange={(e) => setVoiceCorrectionInput(e.target.value)}
              placeholder="e.g. 59.2 or TT-2"
              className="w-full text-xs font-bold border border-[#F0DDE2] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A25B74] bg-[#FDF6F5]"
            />

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setVoiceCorrectionActive(false)}
                className="flex-1 py-3 text-xs font-semibold rounded-2xl border border-[#F0DDE2] text-[#3B2A33] hover:bg-[#FDF6F5] active:scale-95"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleApplyVoiceCorrection}
                className="flex-1 py-3 text-xs font-bold rounded-2xl bg-[#A25B74] text-white hover:bg-[#84455C] active:scale-95 shadow-touch"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Field Edit Modal */}
      {editingField && (
        <div className="fixed inset-0 z-50 bg-[#3B2A33]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-[#F0DDE2] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-2">
              <span className="text-xs font-bold text-[#3B2A33]">
                {t('common.edit')}: {editingField}
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
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSaveFieldEdit}
                className="flex-1 py-3 text-xs font-bold rounded-2xl bg-[#A25B74] text-white hover:bg-[#84455C] active:scale-95 shadow-touch"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
