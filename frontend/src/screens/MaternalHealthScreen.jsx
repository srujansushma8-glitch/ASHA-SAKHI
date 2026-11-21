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
import { INITIAL_BENEFICIARIES } from '../services/mockData';
import { api } from '../services/api';

export default function MaternalHealthScreen({ 
  onStartVoiceVisit, 
  onBack, 
  selectedBeneficiaryId = null 
}) {
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

  // Derived clinical metrics
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12">
      {/* 1. Header with Back Button and Quick Patient Selector */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-[#F0DDE2] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] text-[#3B2A33] hover:bg-navy-100 active:scale-[0.98] transition-decelerate"
            title="ಹಿಂದೆ ಹೋಗಿ (Back)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#F9ECEC] text-[#A25B74] flex items-center justify-center">
                <Baby className="w-5 h-5" />
              </div>
              <h1 className="text-lg lg:text-xl font-bold font-kannada text-[#3B2A33] leading-tight">
                ತಾಯಿ ಮತ್ತು ಗರ್ಭಿಣಿ ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆ (Maternal Health)
              </h1>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#FDF6F5] text-[#A25B74] border border-[#F0DDE2]">
                ANC Analytics
              </span>
            </div>
            <p className="text-xs text-[#7A6670] font-medium mt-0.5">
              ಸುರಕ್ಷಿತ ಮಾತೃತ್ವ (Pradhan Mantri Surakshit Matritva Abhiyan - PMSMA)
            </p>
          </div>
        </div>

        {/* Patient Selector Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <span className="text-xs font-bold text-[#7A6670] hidden md:inline font-kannada">ಗರ್ಭಿಣಿ ಆಯ್ಕೆಮಾಡಿ:</span>
          {pregnantMothers.map(m => (
            <button
              key={m.id}
              onClick={() => handleSelectMother(m.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap active:scale-[0.98] transition-decelerate flex items-center space-x-1.5 ${
                selectedMotherId === m.id
                  ? 'bg-[#A25B74] text-white shadow-pink'
                  : 'bg-[#FDF6F5] hover:bg-[#FDF6F5] text-[#3B2A33] border border-[#F0DDE2]'
              }`}
            >
              <span>{m.name_kn || m.name_en}</span>
              {m.highRisk && (
                <span className={`w-2 h-2 rounded-full ${selectedMotherId === m.id ? 'bg-white' : 'bg-[#B94A58] animate-pulse'}`}></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top Hero Profile & Gestational Weeks Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-primary to-teal rounded-3xl p-6 lg:p-8 text-white shadow-card relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white/5 rounded-l-full pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Mother Bio */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#FDF6F5]0/80 text-white text-xs font-bold font-mono">
                RCH ID: {currentMother.id}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium">
                ವಯಸ್ಸು: {currentMother.age || 24} ವರ್ಷ
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium font-mono">
                ರಕ್ತ: {currentMother.bloodGroup || 'B+'}
              </span>
              {currentMother.highRisk ? (
                <span className="px-3 py-1 rounded-full bg-[#B94A58] text-white text-xs font-bold animate-pulse shadow-emergency flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ಹೆಚ್ಚಿನ ಅಪಾಯದ ಗರ್ಭಾವಸ್ಥೆ (High Risk)</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-[#477A60] text-white text-xs font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ಸಾಮಾನ್ಯ ಗರ್ಭಾವಸ್ಥೆ (Low Risk)</span>
                </span>
              )}
            </div>

            <div>
              <h2 className="text-2xl lg:text-3xl font-bold font-kannada leading-tight">
                {currentMother.name_kn || currentMother.name_en}
              </h2>
              <p className="text-xs text-white/80 font-medium mt-1 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-cyan" />
                {currentMother.village || 'Shivalli, Mandya PHC'} • ವಾರ್ಡ್ 3
              </p>
            </div>

            {/* Gestational Week & EDD Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <span className="text-[11px] text-white/70 block font-kannada">ಗರ್ಭಾವಸ್ಥೆ ವಾರ</span>
                <span className="text-2xl font-bold font-mono text-cyan">{gestationalWeeks} ವಾರಗಳು</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <span className="text-[11px] text-white/70 block font-kannada">ತ್ರೈಮಾಸಿಕ (Trimester)</span>
                <span className="text-lg font-bold font-kannada text-white">
                  {gestationalWeeks <= 12 ? '1ನೇ ತ್ರೈಮಾಸಿಕ' : gestationalWeeks <= 28 ? '2ನೇ ತ್ರೈಮಾಸಿಕ' : '3ನೇ ತ್ರೈಮಾಸಿಕ'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <span className="text-[11px] text-white/70 block font-kannada">ವಿತರಣೆಯ ಅಂದಾಜು ದಿನ (EDD)</span>
                <span className="text-sm font-bold font-mono text-white mt-1 block">{edd}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                <span className="text-[11px] text-white/70 block font-kannada">ತೂಕ ಏರಿಕೆ</span>
                <span className="text-lg font-bold font-mono text-[#477A60]">+4.5 kg</span>
              </div>
            </div>
          </div>

          {/* Action Button: Start Voice ANC Visit */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center">
            <button
              onClick={() => onStartVoiceVisit(currentMother.id)}
              className="w-full sm:w-auto bg-gradient-to-r from-pink to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-2xl shadow-pink flex items-center justify-center space-x-3 text-sm active:scale-[0.98] transition-decelerate touch-manipulation"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <span className="font-kannada text-base">ಈ ಗರ್ಭಿಣಿಗೆ ಧ್ವನಿ ಭೇಟಿ ಪ್ರಾರಂಭಿಸಿ</span>
            </button>
            <p className="text-[11px] text-white/70 mt-2 text-center lg:text-right font-kannada">
              *ಕನ್ನಡ ಧ್ವನಿ ಮೂಲಕ ANC ವಿವರ ದಾಖಲಿಸಿ
            </p>
          </div>
        </div>
      </div>

      {/* 3. Vitals KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BP */}
        <div className="bg-white p-5 rounded-3xl border border-[#F0DDE2] shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A6670] font-kannada">ರಕ್ತದೊತ್ತಡ (BP)</span>
            <Activity className={`w-4 h-4 ${currentMother.highRisk ? 'text-[#B94A58]' : 'text-[#A25B74]'}`} />
          </div>
          <div className="mt-3">
            <div className={`text-2xl lg:text-3xl font-bold font-mono ${currentMother.highRisk ? 'text-[#B94A58]' : 'text-[#3B2A33]'}`}>
              {bp} <span className="text-xs font-normal text-[#C47A92]">mmHg</span>
            </div>
            <span className={`text-[11px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full ${
              currentMother.highRisk ? 'bg-[#FCF1F1] text-[#B94A58]' : 'bg-[#E8F7F1] text-[#477A60]'
            }`}>
              {currentMother.highRisk ? 'ಅಧಿಕ ರಕ್ತದೊತ್ತಡ (Stage 1)' : 'ಸಾಮಾನ್ಯ (Normal)'}
            </span>
          </div>
        </div>

        {/* Haemoglobin (Hb) */}
        <div className="bg-white p-5 rounded-3xl border border-[#F0DDE2] shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A6670] font-kannada">ಹಿಮೋಗ್ಲೋಬಿನ್ (Hb)</span>
            <Heart className="w-4 h-4 text-pink" />
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold font-mono text-[#3B2A33]">
              {hb} <span className="text-xs font-normal text-[#C47A92]">g/dL</span>
            </div>
            <span className="text-[11px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full bg-warning-50 text-warning-700">
              {parseFloat(hb) < 11 ? 'ಮಧ್ಯಮ ರಕ್ತಹೀನತೆ (Mild)' : 'ಸಾಮಾನ್ಯ (Healthy)'}
            </span>
          </div>
        </div>

        {/* Current Weight */}
        <div className="bg-white p-5 rounded-3xl border border-[#F0DDE2] shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A6670] font-kannada">ಪ್ರಸ್ತುತ ತೂಕ</span>
            <Scale className="w-4 h-4 text-[#A25B74]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold font-mono text-[#3B2A33]">
              {currentMother.weight || 56.5} <span className="text-xs font-normal text-[#C47A92]">kg</span>
            </div>
            <span className="text-[11px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full bg-[#FDF6F5] text-cyan-700">
              ಪ್ರತಿ ತಿಂಗಳಿಗೆ ~1.5 kg ಏರಿಕೆ
            </span>
          </div>
        </div>

        {/* Fetal Heart Rate */}
        <div className="bg-white p-5 rounded-3xl border border-[#F0DDE2] shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7A6670] font-kannada">ಭ್ರೂಣದ ಹೃದಯ ಬಡಿತ (FHR)</span>
            <Baby className="w-4 h-4 text-[#477A60]" />
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold font-mono text-[#477A60]">
              {fhr} <span className="text-xs font-normal text-[#C47A92]">bpm</span>
            </div>
            <span className="text-[11px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full bg-[#E8F7F1] text-[#477A60]">
              ಉತ್ತಮ (Healthy Range 120-160)
            </span>
          </div>
        </div>
      </div>

      {/* 4. Balanced 2-Column Analytics & Trackers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: ANC Stepper & Supplement Adherence */}
        <div className="lg:col-span-7 space-y-6">
          {/* ANC Checkup Schedule Stepper */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FDF6F5] text-[#A25B74] flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#3B2A33] font-kannada">
                    ANC ತಪಾಸಣೆ ವೇಳಾಪಟ್ಟಿ (MoHFW 4-ANC Protocol)
                  </h3>
                  <span className="text-[11px] text-[#C47A92] font-medium">ಕನಿಷ್ಠ 4 ತಪಾಸಣೆಗಳು ಕಡ್ಡಾಯ</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#A25B74] bg-[#FDF6F5] px-2.5 py-1 rounded-full border border-[#F0DDE2]">
                {gestationalWeeks >= 28 ? '3/4 ಪೂರ್ಣಗೊಂಡಿದೆ' : '2/4 ಪೂರ್ಣಗೊಂಡಿದೆ'}
              </span>
            </div>

            {/* Stepper items */}
            <div className="space-y-3">
              {[
                { name: '1ನೇ ANC ತಪಾಸಣೆ (12 ವಾರಗಳಲ್ಲಿ)', status: 'completed', date: '2026-08-15', details: 'RCH ನೋಂದಣಿ, ರಕ್ತ ಪರೀಕ್ಷೆ, ತೂಕ, TT-1 ಲಸಿಕೆ' },
                { name: '2ನೇ ANC ತಪಾಸಣೆ (14-26 ವಾರಗಳಲ್ಲಿ)', status: 'completed', date: '2026-10-28', details: 'ಅಲ್ಟ್ರಾಸೌಂಡ್, ತೂಕ, IFA ಮಾತ್ರೆ ವಿತರಣೆ, TT-2' },
                { name: '3ನೇ ANC ತಪಾಸಣೆ (28-34 ವಾರಗಳಲ್ಲಿ)', status: gestationalWeeks >= 28 ? 'due' : 'upcoming', date: '2026-11-25', details: 'ರಕ್ತದೊತ್ತಡ, ಗರ್ಭದ ಎತ್ತರ, ರಕ್ತಹೀನತೆ ತಪಾಸಣೆ' },
                { name: '4ನೇ ANC ತಪಾಸಣೆ (36 ವಾರಗಳಲ್ಲಿ)', status: 'upcoming', date: '2026-12-20', details: 'ಹೆರಿಗೆ ಸಿದ್ಧತೆ, ಆಸ್ಪತ್ರೆ ಆಯ್ಕೆ, ತುರ್ತು ಯೋಜನೆ' }
              ].map((step, idx) => (
                <div key={idx} className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-[#FDF6F5]/60 border border-[#F0DDE2]">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    step.status === 'completed'
                      ? 'bg-[#477A60] text-white'
                      : step.status === 'due'
                      ? 'bg-warning text-white animate-pulse'
                      : 'bg-navy-200 text-[#3B2A33]'
                  }`}>
                    {step.status === 'completed' ? '✓' : idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#3B2A33] font-kannada">{step.name}</span>
                      <span className="text-[10px] font-mono font-bold text-[#7A6670]">{step.date}</span>
                    </div>
                    <p className="text-[11px] text-[#7A6670] mt-0.5">{step.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supplement Adherence (IFA & Calcium) */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-4">
            <h3 className="font-bold text-sm text-[#3B2A33] font-kannada flex items-center space-x-2">
              <Pill className="w-4 h-4 text-pink" />
              <span>ಪೌಷ್ಟಿಕಾಂಶ ಮಾತ್ರೆಗಳ ಅನುಸರಣೆ (Nutritional Adherence)</span>
            </h3>

            {/* IFA Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-kannada font-bold text-[#3B2A33]">ಐರನ್ ಫೋಲಿಕ್ ಆಸಿಡ್ (IFA - ಕೆಂಪು ಮಾತ್ರೆಗಳು):</span>
                <span className="font-mono font-bold text-[#A25B74]">{ifaCount} / 100 ಮಾತ್ರೆಗಳು ({Math.round(ifaCount)}%)</span>
              </div>
              <div className="w-full bg-[#FDF6F5] rounded-full h-3 overflow-hidden border border-[#F0DDE2]">
                <div 
                  className="bg-gradient-to-r from-primary to-cyan h-full rounded-full transition-all duration-700" 
                  style={{ width: `${ifaCount}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-[#C47A92] font-medium">ಕನಿಷ್ಠ 100 ದಿನಗಳ ಕಾಲ ಪ್ರತಿದಿನ 1 IFA ಮಾತ್ರೆ ಕಡ್ಡಾಯ</p>
            </div>

            {/* Calcium Progress */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-kannada font-bold text-[#3B2A33]">ಕ್ಯಾಲ್ಸಿಯಂ 500mg ಮಾತ್ರೆಗಳು (14 ವಾರಗಳ ನಂತರ):</span>
                <span className="font-mono font-bold text-[#477A60]">{calciumCompliance} ಸೇವನೆ</span>
              </div>
              <div className="w-full bg-[#FDF6F5] rounded-full h-3 overflow-hidden border border-[#F0DDE2]">
                <div 
                  className="bg-[#477A60] h-full rounded-full transition-all duration-700" 
                  style={{ width: calciumCompliance }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Danger Signs Checklist & High-Risk Alert Box */}
        <div className="lg:col-span-5 space-y-6">
          {/* Danger Sign Checklist Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-[#B94A58]" />
                <h3 className="font-bold text-sm text-[#3B2A33] font-kannada">
                  ಅಪಾಯಕಾರಿ ಲಕ್ಷಣಗಳ ಪರಿಶೀಲನೆ (Danger Signs)
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#B94A58] bg-[#FCF1F1] px-2 py-0.5 rounded-full border border-[#B94A58]/30">
                MoHFW Guidelines
              </span>
            </div>

            <p className="text-xs text-[#7A6670] font-kannada">
              ಈ ಕೆಳಗಿನ ಯಾವುದೇ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದರೆ ತಕ್ಷಣವೇ ಸಮೀಪದ PHC ಅಥವಾ 108 ಗೆ ಸಂಪರ್ಕಿಸಿ:
            </p>

            <div className="space-y-2">
              {[
                { key: 'headache', label_kn: 'ತೀವ್ರ ನಿರಂತರ ತಲೆನೋವು ಮತ್ತು ಕಣ್ಣು ಮಬ್ಬು', label_en: 'Severe headache & blurred vision' },
                { key: 'edema', label_kn: 'ಮುಖ, ಕೈ ಮತ್ತು ಕಾಲುಗಳಲ್ಲಿ ತೀವ್ರ ಊತ', label_en: 'Severe swelling of face and hands' },
                { key: 'bleeding', label_kn: 'ಯೋನಿ ರಕ್ತಸ್ರಾವ ಅಥವಾ ನೀರಿನ ಸ್ರಾವ', label_en: 'Vaginal bleeding or watery discharge' },
                { key: 'reducedMovement', label_kn: 'ಹೊಟ್ಟೆಯಲ್ಲಿ ಮಗುವಿನ ಚಲನೆ ಕಡಿಮೆಯಾಗುವುದು', label_en: 'Reduced / absence of fetal movements' },
                { key: 'fever', label_kn: 'ನಡುಕದೊಂದಿಗೆ ತೀವ್ರ ಜ್ವರ', label_en: 'High fever with chills' }
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => toggleChecklist(item.key)}
                  className={`p-3 rounded-2xl border transition-decelerate cursor-pointer flex items-center justify-between ${
                    checklist[item.key]
                      ? 'bg-[#FCF1F1] border-[#B94A58]/40 text-[#B94A58]'
                      : 'bg-[#FDF6F5] border-[#F0DDE2] text-[#3B2A33] hover:bg-navy-50'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block font-kannada">{item.label_kn}</span>
                    <span className="text-[10px] block opacity-80 font-mono">{item.label_en}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={() => {}}
                    className="w-4 h-4 text-[#B94A58] rounded border-navy-300 focus:ring-emergency"
                  />
                </div>
              ))}
            </div>

            {/* If any danger sign is checked, show immediate action recommendation */}
            {(checklist.headache || checklist.edema || checklist.bleeding || checklist.reducedMovement) && (
              <div className="p-4 rounded-2xl bg-[#B94A58] text-white space-y-2 shadow-emergency animate-fade-in">
                <div className="flex items-center space-x-2 text-xs font-bold font-kannada">
                  <AlertCircle className="w-4 h-4" />
                  <span>ಎಚ್ಚರಿಕೆ! ತಕ್ಷಣವೇ PHC ಗೆ ರೆಫರ್ ಮಾಡಿ (Refer to PHC Now)</span>
                </div>
                <p className="text-[11px] text-white/90">
                  ಪ್ರೀ-ಎಕ್ಲಾಂಪ್ಸಿಯಾ ಅಥವಾ ಗಂಭೀರ ಅಪಾಯದ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿವೆ. 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಮೂಲಕ ತಕ್ಷಣ ಆಸ್ಪತ್ರೆಗೆ ಕಳುಹಿಸಿ.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
