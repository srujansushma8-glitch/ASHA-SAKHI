import React, { useState, useEffect } from 'react';
import { 
  Baby, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Activity, 
  Heart, 
  ShieldAlert, 
  Scale, 
  Syringe, 
  Pill, 
  ArrowLeft, 
  Mic, 
  TrendingUp, 
  User, 
  MapPin, 
  Phone,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function MaternalHealthScreen({
  onStartVoiceVisit, 
  onBack, 
  selectedBeneficiaryId = null 
}) {
  const { t, currentLanguage } = useLanguage();
  const [pregnantMothers, setPregnantMothers] = useState([]);
  const [selectedMotherId, setSelectedMotherId] = useState(selectedBeneficiaryId || 'ASHA-KA-2024-0101');
  const [motherData, setMotherData] = useState(null);
  const [checklist, setChecklist] = useState({
    headache: false,
    blurredVision: false,
    bleeding: false,
    reducedMovement: false,
    edema: false,
    fever: false
  });

  useEffect(() => {
    loadMothers();
  }, []);

  const loadMothers = async () => {
    try {
      const all = await api.getBeneficiaries();
      const ancMothers = all.filter(b => b.category === 'ANC');
      if (ancMothers.length > 0) {
        setPregnantMothers(ancMothers);
        const current = ancMothers.find(m => m.id === selectedMotherId) || ancMothers[0];
        setSelectedMotherId(current.id);
        setMotherData(current);
        if (current.highRisk) {
          setChecklist(prev => ({
            ...prev,
            headache: true,
            blurredVision: true,
            edema: true
          }));
        }
      }
    } catch (e) {
      console.warn('Could not load mothers', e);
    }
  };

  const handleSelectMother = (id) => {
    setSelectedMotherId(id);
    const found = pregnantMothers.find(m => m.id === id);
    if (found) {
      setMotherData(found);
      if (found.highRisk) {
        setChecklist({
          headache: true,
          blurredVision: true,
          bleeding: false,
          reducedMovement: true,
          edema: true,
          fever: false
        });
      } else {
        setChecklist({
          headache: false,
          blurredVision: false,
          bleeding: false,
          reducedMovement: false,
          edema: false,
          fever: false
        });
      }
    }
  };

  const currentMother = motherData || pregnantMothers[0] || {
    id: "ASHA-KA-2024-0101",
    name_kn: "ಲಕ್ಷ್ಮಮ್ಮ ಕೆ.",
    name_en: "Lakshmamma K.",
    age: 24,
    weight: 56.5,
    bloodGroup: "B+",
    subCategory: "2nd Trimester (24 weeks)",
    village: "Shivalli, Mandya PHC",
    highRisk: false
  };

  const motherName = currentLanguage === 'kn' ? (currentMother.name_kn || currentMother.name_en) : (currentMother.name_en || currentMother.name);
  const gestationalWeeks = currentMother.id === 'ASHA-KA-2024-0102' ? 34 : currentMother.id === 'ASHA-KA-2024-0105' ? 10 : 24;
  const edd = currentMother.id === 'ASHA-KA-2024-0102' ? '2027-01-08' : currentMother.id === 'ASHA-KA-2024-0105' ? '2027-06-25' : '2027-03-18';
  const bp = currentMother.id === 'ASHA-KA-2024-0102' ? '146/94' : '118/76';
  const hb = currentMother.id === 'ASHA-KA-2024-0102' ? '10.2' : currentMother.id === 'ASHA-KA-2024-0105' ? '11.8' : '11.4';
  const fhr = currentMother.id === 'ASHA-KA-2024-0102' ? '136' : '144';
  const ifaCount = currentMother.id === 'ASHA-KA-2024-0102' ? 80 : currentMother.id === 'ASHA-KA-2024-0105' ? 20 : 60;
  const calciumCompliance = currentMother.id === 'ASHA-KA-2024-0102' ? '85%' : '90%';

  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const dangerItems = [
    { key: 'headache', label: currentLanguage === 'kn' ? 'ತೀವ್ರ ನಿರಂತರ ತಲೆನೋವು ಮತ್ತು ಕಣ್ಣು ಮಬ್ಬು' : currentLanguage === 'hi' ? 'गंभीर सिरदर्द और धुंधला दिखना' : 'Severe persistent headache and blurred vision' },
    { key: 'edema', label: currentLanguage === 'kn' ? 'ಮುಖ, ಕೈ ಮತ್ತು ಕಾಲುಗಳಲ್ಲಿ ತೀವ್ರ ಊತ' : currentLanguage === 'hi' ? 'चेहरे, हाथ और पैरों में गंभीर सूजन' : 'Severe swelling of face, hands, and feet' },
    { key: 'bleeding', label: currentLanguage === 'kn' ? 'ಯೋನಿ ರಕ್ತಸ್ರಾವ ಅಥವಾ ನೀರಿನ ಸ್ರಾವ' : currentLanguage === 'hi' ? 'योनि से रक्तस्राव या पानी का स्राव' : 'Vaginal bleeding or watery discharge' },
    { key: 'reducedMovement', label: currentLanguage === 'kn' ? 'ಹೊಟ್ಟೆಯಲ್ಲಿ ಮಗುವಿನ ಚಲನೆ ಕಡಿಮೆಯಾಗುವುದು' : currentLanguage === 'hi' ? 'गर्भ में शिशु की हलचल कम होना' : 'Reduced or absent fetal movements' },
    { key: 'fever', label: currentLanguage === 'kn' ? 'ನಡುಕದೊಂದಿಗೆ ತೀವ್ರ ಜ್ವರ' : currentLanguage === 'hi' ? 'कंपकंपी के साथ तेज बुखार' : 'High fever with chills' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12">
      {/* 1. Header with Back Button and Quick Patient Selector */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-[#F0DDE2] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] text-[#3B2A33] hover:bg-[#F9ECEC] active:scale-[0.98] transition-decelerate"
            title={t("common.back")}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#F9ECEC] text-[#A25B74] flex items-center justify-center">
                <Baby className="w-5 h-5" />
              </div>
              <h1 className="text-lg lg:text-xl font-bold text-[#3B2A33] leading-tight">
                {t("maternal.title")}
              </h1>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#FDF6F5] text-[#A25B74] border border-[#F0DDE2]">
                ANC
              </span>
            </div>
            <p className="text-xs text-[#7A6670] font-medium mt-0.5">
              {t("maternal.subtitle")}
            </p>
          </div>
        </div>

        {/* Patient Selector Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <span className="text-xs font-bold text-[#7A6670] hidden md:inline">{t("maternal.selectMother")}</span>
          {pregnantMothers.map(m => {
            const mLabel = currentLanguage === 'kn' ? (m.name_kn || m.name_en) : (m.name_en || m.name);
            return (
              <button
                key={m.id}
                onClick={() => handleSelectMother(m.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap active:scale-[0.98] transition-decelerate flex items-center space-x-1.5 ${
                  selectedMotherId === m.id
                    ? 'bg-[#A25B74] text-white shadow-md shadow-[#A25B74]/20'
                    : 'bg-[#FDF6F5] hover:bg-[#F9ECEC] text-[#3B2A33] border border-[#F0DDE2]'
                }`}
              >
                <span>{mLabel}</span>
                {m.highRisk && (
                  <span className={`w-2 h-2 rounded-full ${selectedMotherId === m.id ? 'bg-white' : 'bg-[#B94A58] animate-pulse'}`}></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Top Hero Profile & Gestational Weeks Banner */}
      <div className="bg-gradient-to-r from-[#A25B74] via-[#84455C] to-[#5C2B3E] rounded-3xl p-6 lg:p-8 text-white shadow-card relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/5 rounded-l-full pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Mother Basic Data */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-2xl bg-white/15 text-white flex items-center justify-center font-bold text-2xl border border-white/20">
                🤰
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold text-white leading-tight">
                    {motherName}
                  </h2>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/20">
                    {currentMother.id}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-white/80 font-medium">
                  <span>{t("common.age")}: {currentMother.age || 24}</span>
                  <span>•</span>
                  <span>{t("common.risk")}: {currentMother.highRisk ? t("common.highRisk") : t("common.lowRisk")}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
                <span className="text-[11px] text-white/70 block">{t("maternal.gestationalAge")}</span>
                <span className="text-2xl font-bold font-mono text-white">{gestationalWeeks} {t("maternal.weeks")}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
                <span className="text-[11px] text-white/70 block">{t("dashboard.trimesterProgress")}</span>
                <span className="text-sm font-bold text-white">
                  {gestationalWeeks <= 12 ? t("maternal.firstTrimester") : gestationalWeeks <= 28 ? t("maternal.secondTrimester") : t("maternal.thirdTrimester")}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
                <span className="text-[11px] text-white/70 block">EDD</span>
                <span className="text-sm font-mono font-bold text-white">{edd}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
                <span className="text-[11px] text-white/70 block">{t("common.weight")}</span>
                <span className="text-sm font-mono font-bold text-white">{currentMother.weight || 56.5} kg</span>
              </div>
            </div>
          </div>

          {/* Voice Action Button */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-3">
            <button
              onClick={() => onStartVoiceVisit && onStartVoiceVisit(currentMother.id)}
              className="w-full bg-white hover:bg-[#FDF6F5] text-[#A25B74] font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center space-x-3 text-base active:scale-95 transition-all group"
            >
              <Mic className="w-5 h-5 text-[#A25B74] group-hover:scale-110 transition-transform" />
              <span>{t("maternal.startVisitBtn")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Clinical Vitals & Danger Sign Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vitals Cards (Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-5">
          <h3 className="font-bold text-base text-[#3B2A33]">
            {t("structuredRecord.vitalsHeader")}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
              <span className="text-xs font-bold text-[#7A6670] block">{t("maternal.bloodPressure")}</span>
              <span className="text-lg font-bold font-mono text-[#3B2A33] mt-1 block">{bp}</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
              <span className="text-xs font-bold text-[#7A6670] block">{t("maternal.hemoglobin")}</span>
              <span className="text-lg font-bold font-mono text-[#3B2A33] mt-1 block">{hb} g/dL</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
              <span className="text-xs font-bold text-[#7A6670] block">{t("maternal.fetalHeartRate")}</span>
              <span className="text-lg font-bold font-mono text-[#3B2A33] mt-1 block">{fhr} bpm</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
              <span className="text-xs font-bold text-[#7A6670] block">{t("maternal.ifaTablets")}</span>
              <span className="text-lg font-bold font-mono text-[#3B2A33] mt-1 block">{ifaCount} / 100</span>
            </div>
          </div>
        </div>

        {/* Danger Signs Checklist (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
            <h3 className="font-bold text-base text-[#B94A58] flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#B94A58]" />
              <span>{t("maternal.dangerSigns")}</span>
            </h3>
          </div>

          <div className="space-y-2">
            {dangerItems.map(item => (
              <label 
                key={item.key}
                className={`flex items-center space-x-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  checklist[item.key]
                    ? 'bg-[#FCF1F1] border-red-300 text-[#B94A58]'
                    : 'bg-[#FDF6F5] border-[#F0DDE2] text-[#3B2A33] hover:bg-[#F9ECEC]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist[item.key] || false}
                  onChange={() => toggleChecklist(item.key)}
                  className="rounded text-[#A25B74] focus:ring-[#A25B74] w-4 h-4"
                />
                <span className="text-xs font-semibold">{item.label}</span>
              </label>
            ))}
          </div>

          {currentMother.highRisk && (
            <div className="p-3.5 rounded-2xl bg-[#FCF1F1] border border-red-300 text-xs text-[#B94A58] font-semibold flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{t("maternal.highRiskAlert")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
