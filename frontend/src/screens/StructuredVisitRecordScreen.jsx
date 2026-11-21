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
  Activity,
  HeartPulse,
  Clock,
  Pill
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
    pregnancy_status: record?.pregnancy_status || existingDraft?.pregnancy_status || (record?.visit_type === 'PNC' ? 'Postpartum' : 'Pregnant'),
    gestational_age: record?.gestational_age || existingDraft?.gestational_age || '28 weeks',
    symptoms: Array.isArray(record?.symptoms) ? record.symptoms.join(', ') : (record?.symptoms || existingDraft?.symptoms || 'None reported'),
    symptom_duration: record?.symptom_duration || existingDraft?.symptom_duration || 'N/A',
    weight: record?.weight || existingDraft?.weight || '58.5',
    measurements: typeof record?.measurements === 'object' && record?.measurements !== null
      ? (record.measurements.bp ? `BP: ${record.measurements.bp}` : JSON.stringify(record.measurements))
      : (record?.measurements || existingDraft?.measurements || 'BP: 120/80 mmHg, Hb: 11.2 g/dL'),
    medications: Array.isArray(record?.medications) ? record.medications.join(', ') : (record?.medications || existingDraft?.medications || 'IFA (Iron Folic Acid), Calcium'),
    vaccinations_due: Array.isArray(record?.vaccinations_due) ? record.vaccinations_due.join(', ') : (record?.vaccinations_due || existingDraft?.vaccinations_due || 'TT-2 / TD-2 Booster'),
    vaccinations_completed: Array.isArray(record?.vaccinations_completed) ? record.vaccinations_completed.join(', ') : (record?.vaccinations_completed || existingDraft?.vaccinations_completed || 'TT-1, Albendazole'),
    next_visit_date: record?.next_visit_date || existingDraft?.next_visit_date || '2026-12-05',
    confidence_score: record?.confidence_score !== undefined ? record.confidence_score : (existingDraft?.confidence_score || 0.94),
    clinical_classification: record?.clinical_classification || record?.urgency_tier || existingDraft?.clinical_classification || 'Routine',
    danger_signs_detected: record?.danger_signs_detected || record?.danger_flags || existingDraft?.danger_signs_detected || [],
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

  const isEmergencyOrHighRisk = formData.clinical_classification === 'Emergency' || formData.clinical_classification === 'High risk';

  const generateReadbackText = () => {
    if (language === 'kn') {
      return `${formData.beneficiary_name} ಅವರ ${formData.visit_type} ಭೇಟಿ ವಿವರಗಳು: ಗರ್ಭಾವಸ್ಥೆ ${formData.gestational_age}, ತೂಕ ${formData.weight} ಕೆಜಿ, ಲಸಿಕೆ ${formData.vaccinations_completed}. ಮುಂದಿನ ಭೇಟಿ ${formData.next_visit_date}. ${t('structuredRecord.readbackQuestion') || 'ಮಾಹಿತಿ ಸರಿಯಾಗಿದೆಯೇ?'}`;
    }
    if (language === 'hi') {
      return `${formData.beneficiary_name} का ${formData.visit_type} दौरा: गर्भावस्था ${formData.gestational_age}, वजन ${formData.weight} किग्रा, टीके ${formData.vaccinations_completed}। अगली भेंट ${formData.next_visit_date}। ${t('structuredRecord.readbackQuestion') || 'क्या यह जानकारी सही है?'}`;
    }
    return `${formData.beneficiary_name} ${formData.visit_type} visit: Gestational age ${formData.gestational_age}, Weight ${formData.weight} kg, Completed vaccines ${formData.vaccinations_completed}. Next visit date ${formData.next_visit_date}. Is this information correct?`;
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
      setSuccessToast(t('structuredRecord.fieldUpdated') || 'Field updated');
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

    setSuccessToast(t('structuredRecord.voiceCorrectionSuccess') || 'Voice update applied');
    setTimeout(() => setSuccessToast(''), 3000);
    setVoiceCorrectionActive(false);
    setVoiceCorrectionField(null);
  };

  const handleSaveDraft = () => {
    if (api.saveDraftVisit) {
      api.saveDraftVisit(formData);
      setSuccessToast(t('structuredRecord.draftSaved') || 'Draft saved locally');
      setTimeout(() => setSuccessToast(''), 3000);
    }
  };

  const handleConfirmAndSave = async () => {
    try {
      setIsSaving(true);
      ttsService.stop();
      voiceWs.confirmRecord(formData);

      const parsedSymptoms = typeof formData.symptoms === 'string'
        ? formData.symptoms.split(',').map(s => s.trim()).filter(Boolean)
        : (formData.symptoms || []);

      const parsedMedications = typeof formData.medications === 'string'
        ? formData.medications.split(',').map(s => s.trim()).filter(Boolean)
        : (formData.medications || []);

      const parsedDue = typeof formData.vaccinations_due === 'string'
        ? formData.vaccinations_due.split(',').map(s => s.trim()).filter(Boolean)
        : (formData.vaccinations_due || []);

      const parsedCompleted = typeof formData.vaccinations_completed === 'string'
        ? formData.vaccinations_completed.split(',').map(s => s.trim()).filter(Boolean)
        : (formData.vaccinations_completed || []);

      const res = await api.confirmVisit({
        session_id: voiceWs.sessionId || `SES-${Date.now()}`,
        beneficiary_id: formData.beneficiary_id,
        beneficiary_name: formData.beneficiary_name,
        visit_type: formData.visit_type,
        pregnancy_status: formData.pregnancy_status,
        gestational_age: formData.gestational_age,
        symptoms: parsedSymptoms,
        symptom_duration: formData.symptom_duration,
        weight: parseFloat(formData.weight) || 55.0,
        measurements: { notes: formData.measurements },
        medications: parsedMedications,
        vaccinations_due: parsedDue,
        vaccinations_completed: parsedCompleted,
        next_visit_date: formData.next_visit_date,
        additional_notes: formData.additional_notes,
        confidence_score: parseFloat(formData.confidence_score) || 0.94,
        clinical_classification: formData.clinical_classification,
        danger_flag: isEmergencyOrHighRisk,
        referral_status: isEmergencyOrHighRisk ? 'REFERRAL_REQUIRED' : 'NONE',
        created_at: new Date().toISOString()
      });

      if (api.clearDraftVisit) api.clearDraftVisit();

      setSuccessToast(t('structuredRecord.saveSuccess') || 'Visit saved to register');
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

  const confidencePct = Math.round((parseFloat(formData.confidence_score) || 0.94) * 100);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12" dir={dir}>
      {/* 1. Header with Badges, Back and Readback */}
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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg lg:text-xl font-bold text-[#3B2A33] leading-tight font-serif">
                {t('structuredRecord.title') || 'Structured Clinical Record'}
              </h1>
              <span className="text-xs font-mono font-bold bg-[#E8F7F1] text-[#477A60] px-2.5 py-0.5 rounded-full border border-[#C8EEDD]">
                NHM Protocol
              </span>
              <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                AI Extraction: {confidencePct}%
              </span>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                formData.clinical_classification === 'Emergency'
                  ? 'bg-red-100 text-red-700 border-red-300'
                  : formData.clinical_classification === 'High risk'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                Triage: {formData.clinical_classification}
              </span>
            </div>
            <p className="text-xs text-[#7A6670] font-medium mt-1">
              {t('structuredRecord.subtitle') || 'Voice extracted maternal & neonatal clinical summary. Verify all values before saving.'}
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
            {isPlayingReadback ? (t('voice.stop') || 'Stop') : (t('voice.readback') || 'Listen Summary')}
          </span>
        </button>
      </div>

      {/* Emergency / High Risk Urgent Referral Banner */}
      {isEmergencyOrHighRisk && (
        <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-5 shadow-sm space-y-3 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider text-red-700 block">
                  {formData.clinical_classification.toUpperCase()} PROTOCOL REQUIRED
                </span>
                <p className="text-xs text-red-900 font-medium mt-0.5">
                  Clinical danger indicators identified: {Array.isArray(formData.danger_signs_detected) && formData.danger_signs_detected.length > 0 ? formData.danger_signs_detected.join(', ') : 'High-risk clinical symptoms detected'}. Transfer to Community Health Centre / District Hospital.
                </p>
              </div>
            </div>
            {onTriggerEmergency && (
              <button
                onClick={onTriggerEmergency}
                className="shrink-0 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-touch flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
              >
                <span>Immediate Referral & 108</span>
              </button>
            )}
          </div>
        </div>
      )}

      {successToast && (
        <div className="bg-[#477A60] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-card flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 2-Column Responsive Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: DEMOGRAPHICS, VITALS, SYMPTOMS */}
        <div className="lg:col-span-6 space-y-6">
          {/* Beneficiary & Maternal Status Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-4">
            <div className="flex items-start justify-between border-b border-[#F0DDE2] pb-3">
              <div className="flex items-start space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#FDF6F5] text-[#A25B74] flex items-center justify-center shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#C47A92] font-mono tracking-wider block">
                    {t('common.beneficiary') || 'Beneficiary'}
                  </span>
                  <h3 className="text-lg font-bold text-[#3B2A33] mt-0.5">
                    {formData.beneficiary_name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-bold bg-[#FDF6F5] text-[#3B2A33] px-2.5 py-0.5 rounded-lg border border-[#F0DDE2]">
                      ID: {formData.beneficiary_id}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FDF6F5] text-[#A25B74] font-bold text-xs border border-[#F0DDE2]">
                      {formData.visit_type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-[#84455C] font-semibold text-xs border border-rose-200">
                      {formData.pregnancy_status}
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

            {/* Maternal Gestational Age & Status Row */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
                <div className="flex items-center justify-between text-[#7A6670] mb-1">
                  <span className="text-[11px] font-bold text-[#3B2A33] flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-[#A25B74]" />
                    Gestational Age
                  </span>
                  <button
                    onClick={() => handleStartVoiceCorrection('gestational_age')}
                    className="text-[10px] text-[#A25B74] font-bold hover:underline"
                  >
                    <Mic className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-sm font-bold font-mono text-[#3B2A33]">
                  {formData.gestational_age || '--'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
                <div className="flex items-center justify-between text-[#7A6670] mb-1">
                  <span className="text-[11px] font-bold text-[#3B2A33] flex items-center">
                    <HeartPulse className="w-3.5 h-3.5 mr-1 text-[#A25B74]" />
                    Status
                  </span>
                  <button
                    onClick={() => handleStartVoiceCorrection('pregnancy_status')}
                    className="text-[10px] text-[#A25B74] font-bold hover:underline"
                  >
                    <Mic className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-sm font-bold text-[#3B2A33]">
                  {formData.pregnancy_status || '--'}
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Symptoms & Duration Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-2.5">
              <h3 className="font-bold text-sm text-[#3B2A33] flex items-center">
                <Activity className="w-4 h-4 mr-2 text-[#A25B74]" />
                Reported Symptoms & Duration
              </h3>
              <button
                onClick={() => handleStartEditField('symptoms', formData.symptoms)}
                className="text-xs text-[#A25B74] font-bold flex items-center space-x-1 hover:underline"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t('common.edit') || 'Edit'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] flex items-center justify-between">
                <span className="text-xs text-[#7A6670] font-medium">Symptoms:</span>
                <span className="text-xs font-bold text-[#3B2A33] max-w-[70%] text-right">{formData.symptoms || 'None reported'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] flex items-center justify-between">
                <span className="text-xs text-[#7A6670] font-medium">Duration:</span>
                <span className="text-xs font-bold text-[#3B2A33]">{formData.symptom_duration || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Vitals Grid (Weight & Next Visit) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Weight Card */}
            <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card relative space-y-2">
              <div className="flex items-center justify-between text-[#7A6670]">
                <span className="text-xs font-bold flex items-center text-[#3B2A33]">
                  <Scale className="w-4 h-4 mr-1.5 text-[#A25B74]" />
                  {t('common.weight') || 'Weight'}
                </span>
                <button
                  onClick={() => handleStartVoiceCorrection('weight')}
                  className="text-xs text-[#A25B74] font-bold flex items-center space-x-1 hover:underline"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{t('structuredRecord.voiceEdit') || 'Voice'}</span>
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
                  {t('structuredRecord.nextVisit') || 'Next Visit'}
                </span>
                <button
                  onClick={() => handleStartVoiceCorrection('next_visit_date')}
                  className="text-xs text-[#A25B74] font-bold flex items-center space-x-1 hover:underline"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{t('structuredRecord.voiceEdit') || 'Voice'}</span>
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
                {t('structuredRecord.notes') || 'Clinical Notes'}
              </h3>
              <button
                onClick={() => handleStartEditField('additional_notes', formData.additional_notes)}
                className="text-xs text-[#A25B74] font-bold flex items-center space-x-1 hover:underline"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t('common.edit') || 'Edit'}</span>
              </button>
            </div>
            <p className="text-sm text-[#3B2A33] font-medium leading-relaxed bg-[#FDF6F5] p-4 rounded-2xl border border-[#F0DDE2]">
              {formData.additional_notes || '--'}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: MEDICATIONS, IMMUNIZATION, READBACK, ACTIONS */}
        <div className="lg:col-span-6 space-y-6">
          {/* Clinical Measurements & Medications Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
              <h3 className="font-bold text-sm text-[#3B2A33] flex items-center">
                <Pill className="w-4 h-4 mr-2 text-[#A25B74]" />
                Measurements & Distributed Medications
              </h3>
              <button
                onClick={() => handleStartEditField('medications', formData.medications)}
                className="text-xs text-[#A25B74] font-bold flex items-center space-x-1 hover:underline"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t('common.edit') || 'Edit'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
                <span className="text-[11px] font-bold text-[#7A6670] uppercase tracking-wider block mb-1">
                  Vitals & Measurements
                </span>
                <span className="text-sm font-bold font-mono text-[#3B2A33]">
                  {formData.measurements || '--'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
                <span className="text-[11px] font-bold text-[#7A6670] uppercase tracking-wider block mb-1">
                  Medications Distributed / Prescribed
                </span>
                <span className="text-sm font-bold text-[#3B2A33]">
                  {formData.medications || '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Immunization Details Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
              <h3 className="font-bold text-sm text-[#3B2A33] flex items-center">
                <Syringe className="w-4 h-4 mr-2 text-[#A25B74]" />
                {t('immunization.title') || 'Immunization Record'}
              </h3>
              <button
                onClick={() => handleStartVoiceCorrection('vaccinations_completed')}
                className="text-xs text-[#A25B74] font-bold flex items-center space-x-1 hover:underline"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{t('structuredRecord.voiceEdit') || 'Voice'}</span>
              </button>
            </div>

            {/* Completed Vaccines */}
            <div className="p-4 rounded-2xl bg-[#E8F7F1] border border-[#C8EEDD] space-y-1">
              <span className="text-[11px] uppercase font-bold text-[#477A60] tracking-wider block">
                ✓ {t('structuredRecord.vaccinationsCompleted') || 'Completed Vaccines'}:
              </span>
              <div className="text-sm font-bold text-[#3B2A33]">
                {formData.vaccinations_completed || '--'}
              </div>
            </div>

            {/* Due Vaccines */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="text-[11px] uppercase font-bold text-amber-800 tracking-wider block">
                ⏳ {t('structuredRecord.vaccinationsDue') || 'Due Vaccines'}:
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
                {t('voice.readback') || 'Spoken Readback Preview'}
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
              className="w-full bg-[#477A60] hover:bg-[#3d6952] text-white font-bold py-4 px-6 rounded-2xl shadow-touch flex items-center justify-center space-x-2 text-base active:scale-95 transition-decelerate touch-manipulation disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>
                {isSaving ? (t('structuredRecord.saving') || 'Saving...') : (t('structuredRecord.saveToRegister') || 'Confirm & Save to Field Register')}
              </span>
            </button>

            <button
              onClick={handleSaveDraft}
              className="w-full py-3 px-4 rounded-2xl border border-[#A25B74]/30 text-[#A25B74] bg-[#FDF6F5]/50 font-bold text-xs hover:bg-[#FDF6F5] active:scale-95 transition-decelerate flex items-center justify-center space-x-2"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>{t('structuredRecord.saveDraft') || 'Save Local Draft'}</span>
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
                <span>{t('structuredRecord.voiceEdit') || 'Voice Update'}: {voiceCorrectionField}</span>
              </span>
              <button
                onClick={() => setVoiceCorrectionActive(false)}
                className="p-1.5 rounded-xl hover:bg-[#FDF6F5] text-[#C47A92]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#7A6670] font-medium">
              {t('voice.voiceCorrectionHint') || 'Speak or type the updated value:'}
            </p>

            <input
              type="text"
              value={voiceCorrectionInput}
              onChange={(e) => setVoiceCorrectionInput(e.target.value)}
              placeholder="e.g. 59.2 or TT-2 or 30 weeks"
              className="w-full text-xs font-bold border border-[#F0DDE2] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A25B74] bg-[#FDF6F5]"
            />

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setVoiceCorrectionActive(false)}
                className="flex-1 py-3 text-xs font-semibold rounded-2xl border border-[#F0DDE2] text-[#3B2A33] hover:bg-[#FDF6F5] active:scale-95"
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleApplyVoiceCorrection}
                className="flex-1 py-3 text-xs font-bold rounded-2xl bg-[#A25B74] text-white hover:bg-[#84455C] active:scale-95 shadow-touch"
              >
                {t('common.save') || 'Save'}
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
                {t('common.edit') || 'Edit'}: {editingField}
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
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleSaveFieldEdit}
                className="flex-1 py-3 text-xs font-bold rounded-2xl bg-[#A25B74] text-white hover:bg-[#84455C] active:scale-95 shadow-touch"
              >
                {t('common.save') || 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
