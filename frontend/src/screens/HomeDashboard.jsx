import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Mic, 
  ChevronRight, 
  CheckCircle2, 
  MapPin, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  UserPlus,
  Ambulance,
  Phone,
  HeartPulse,
  Activity,
  CalendarCheck,
  Scale,
  Syringe,
  FileText,
  Radio,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import WaveformVisualizer from '../components/WaveformVisualizer';

export default function HomeDashboard({ 
  onStartRecording, 
  onSelectBeneficiary, 
  onNavigate, 
  emergencyCount = 0 
}) {
  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    todayVisits: 0,
    pendingFollowups: 0,
    emergencyReferrals: 0
  });
  const [recentVisits, setRecentVisits] = useState([]);
  const [todayFollowups, setTodayFollowups] = useState([]);
  const [ambulanceInfo, setAmbulanceInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [beneficiaries, visits, followups, emergencyAlerts, ambulanceData] = await Promise.all([
        api.getBeneficiaries(),
        api.getVisits(),
        api.getFollowups(),
        api.getEmergencyAlerts(),
        api.getAmbulanceTracking ? api.getAmbulanceTracking() : null
      ]);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayVisitsCount = visits.filter(v => (v.created_at || '').startsWith(todayStr)).length;
      const pendingCount = followups.filter(f => f.status === 'pending' || f.due_date <= todayStr).length;

      setStats({
        totalBeneficiaries: beneficiaries.length || 5,
        todayVisits: todayVisitsCount || visits.length || 4,
        pendingFollowups: pendingCount || 3,
        emergencyReferrals: emergencyAlerts.length || 1
      });

      setRecentVisits(visits.slice(0, 4));
      setTodayFollowups(followups.slice(0, 4));
      if (ambulanceData) setAmbulanceInfo(ambulanceData);
    } catch (err) {
      console.error('[HomeDashboard] Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const todayFormatted = new Intl.DateTimeFormat('kn-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12">
      {/* ============================================================ */}
      {/* 1. WELCOME SECTION WITH HEALTHCARE ILLUSTRATION BANNER       */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-navy-100 shadow-card relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Welcome Text & Info */}
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-mint-surface text-primary text-xs font-bold border border-primary-200">
              <span className="w-2 h-2 rounded-full bg-healthcare animate-pulse"></span>
              <span>ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಅಭಿಯಾನ (NHM) • ಕರ್ನಾಟಕ</span>
            </div>

            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-kannada text-navy leading-tight">
                ನಮಸ್ಕಾರ, ಶಾರದಾ ಬಾಯಿ!
              </h1>
              <p className="text-sm font-medium text-navy-600 mt-1">
                ಆಶಾ ಕಾರ್ಯಕರ್ತೆ ದಿನಚರಿ (ASHA SAKHI Health Register)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-navy-500 font-medium pt-1">
              <span className="flex items-center bg-ivory-bg px-3 py-1.5 rounded-xl border border-navy-100">
                <Calendar className="w-4 h-4 mr-1.5 text-primary" />
                <span className="font-kannada font-bold text-navy">{todayFormatted}</span>
              </span>
              <span className="flex items-center bg-ivory-bg px-3 py-1.5 rounded-xl border border-navy-100">
                <MapPin className="w-4 h-4 mr-1.5 text-primary" />
                <span>ಮಂಡ್ಯ ತಾಲೂಕು PHC (ಶಿವಳ್ಳಿ & ಕೆರೆಗೋಡು ವಲಯ - Sector 4)</span>
              </span>
            </div>

            <p className="text-xs text-navy-500 leading-relaxed max-w-2xl pt-1">
              ತಾಯಿ ಮತ್ತು ನವಜಾತ ಶಿಶುಗಳ ಸಮುದಾಯ ಆರೋಗ್ಯ ತಪಾಸಣೆ, ಪೌಷ್ಟಿಕಾಂಶ ಮಾತ್ರೆಗಳು, ಲಸಿಕೆ ಹಾಗೂ ತುರ್ತು ಅಪಾಯಕಾರಿ ಲಕ್ಷಣಗಳನ್ನು ಕನ್ನಡ ಧ್ವನಿ ಮೂಲಕ ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ದಾಖಲಿಸಿ.
            </p>
          </div>

          {/* Healthcare Illustration Graphic */}
          <div className="lg:col-span-4 flex items-center justify-center lg:justify-end">
            <div className="w-44 h-44 rounded-3xl bg-mint-surface/40 border border-primary-100 flex flex-col items-center justify-center p-4 shadow-subtle relative group">
              {/* Decorative Pulse Rings */}
              <div className="absolute inset-2 rounded-2xl border-2 border-dashed border-primary-200 pointer-events-none"></div>
              
              <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-touch mb-2">
                <HeartPulse className="w-9 h-9 text-mint-surface animate-pulse" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-navy font-kannada block">
                  ಆಶಾ ಡಿಜಿಟಲ್ ಸಖಿ
                </span>
                <span className="text-[10px] text-primary font-mono font-bold block mt-0.5">
                  AI4Bharat Voice Enabled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PROMINENT 4 METRIC STATISTICS CARDS (Large & Prominent)    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Card 1: Total Beneficiaries */}
        <div 
          onClick={() => onNavigate('beneficiaries')}
          className="bg-white p-5 rounded-3xl border border-navy-100 shadow-card hover:border-primary-300 hover:shadow-touch transition-decelerate cursor-pointer active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-decelerate">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-primary font-mono bg-mint-surface/80 px-2.5 py-1 rounded-full border border-primary-100">
              ಗ್ರಾಮ ನಿವಾಸಿ
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl lg:text-4xl font-bold text-navy font-mono leading-none tracking-tight">
              {stats.totalBeneficiaries}
            </div>
            <div className="text-sm font-bold text-navy mt-1.5 font-kannada">
              ಒಟ್ಟು ಫಲಾನುಭವಿಗಳು
            </div>
            <div className="text-xs text-navy-400 font-medium mt-0.5">Total Beneficiaries Enrolled</div>
            <div className="text-[11px] text-primary font-semibold mt-2 pt-2 border-t border-navy-50 flex items-center justify-between">
              <span>ANC: 14 • ಮಕ್ಕಳು: 18</span>
              <ChevronRight className="w-3.5 h-3.5 text-navy-400 group-hover:translate-x-1 transition-decelerate" />
            </div>
          </div>
        </div>

        {/* Card 2: Today's Completed Visits */}
        <div 
          onClick={() => onNavigate('beneficiaries')}
          className="bg-white p-5 rounded-3xl border border-navy-100 shadow-card hover:border-healthcare-300 hover:shadow-touch transition-decelerate cursor-pointer active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-healthcare-50 text-healthcare flex items-center justify-center group-hover:bg-healthcare group-hover:text-white transition-decelerate">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-healthcare font-mono bg-healthcare-50 px-2.5 py-1 rounded-full border border-healthcare-200">
              ಇಂದು (Today)
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl lg:text-4xl font-bold text-healthcare font-mono leading-none tracking-tight">
              {stats.todayVisits}
            </div>
            <div className="text-sm font-bold text-navy mt-1.5 font-kannada">
              ಇಂದಿನ ಪೂರ್ಣ ಭೇಟಿಗಳು
            </div>
            <div className="text-xs text-navy-400 font-medium mt-0.5">Visits Completed Today</div>
            <div className="text-[11px] text-healthcare font-semibold mt-2 pt-2 border-t border-navy-50 flex items-center justify-between">
              <span>ದೈನಂದಿನ ಗುರಿ: 6 ಭೇಟಿ</span>
              <ChevronRight className="w-3.5 h-3.5 text-navy-400 group-hover:translate-x-1 transition-decelerate" />
            </div>
          </div>
        </div>

        {/* Card 3: Pending Follow-ups */}
        <div 
          onClick={() => onNavigate('followups')}
          className="bg-white p-5 rounded-3xl border border-navy-100 shadow-card hover:border-warning-300 hover:shadow-touch transition-decelerate cursor-pointer active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-warning-50 text-warning-700 flex items-center justify-center group-hover:bg-warning group-hover:text-white transition-decelerate">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-warning-700 font-mono bg-warning-50 px-2.5 py-1 rounded-full border border-warning-200">
              ಬಾಕಿ (Due)
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl lg:text-4xl font-bold text-warning-700 font-mono leading-none tracking-tight">
              {stats.pendingFollowups}
            </div>
            <div className="text-sm font-bold text-navy mt-1.5 font-kannada">
              ಬಾಕಿ ಇರುವ ಭೇಟಿಗಳು
            </div>
            <div className="text-xs text-navy-400 font-medium mt-0.5">Pending Follow-ups</div>
            <div className="text-[11px] text-warning-700 font-semibold mt-2 pt-2 border-t border-navy-50 flex items-center justify-between">
              <span>ಲಸಿಕೆ & ತಪಾಸಣೆ ಬಾಕಿ</span>
              <ChevronRight className="w-3.5 h-3.5 text-navy-400 group-hover:translate-x-1 transition-decelerate" />
            </div>
          </div>
        </div>

        {/* Card 4: Emergency Danger Referrals */}
        <div 
          onClick={() => onNavigate('emergency')}
          className={`p-5 rounded-3xl border shadow-card transition-decelerate cursor-pointer active:scale-[0.98] group ${
            stats.emergencyReferrals > 0 
              ? 'bg-emergency-50/60 border-emergency-300 hover:border-emergency-500' 
              : 'bg-white border-navy-100 hover:border-navy-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-decelerate ${
              stats.emergencyReferrals > 0 
                ? 'bg-emergency text-white animate-pulse shadow-emergency' 
                : 'bg-navy-50 text-navy-500'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className={`text-[11px] font-bold font-mono px-2.5 py-1 rounded-full border ${
              stats.emergencyReferrals > 0 
                ? 'bg-emergency text-white border-emergency' 
                : 'bg-navy-50 text-navy-600 border-navy-200'
            }`}>
              108 Alert
            </span>
          </div>

          <div className="mt-4">
            <div className={`text-3xl lg:text-4xl font-bold font-mono leading-none tracking-tight ${
              stats.emergencyReferrals > 0 ? 'text-emergency' : 'text-navy'
            }`}>
              {stats.emergencyReferrals}
            </div>
            <div className="text-sm font-bold text-navy mt-1.5 font-kannada">
              ತುರ್ತು ರೆಫರಲ್‌ಗಳು
            </div>
            <div className="text-xs text-navy-400 font-medium mt-0.5">Emergency Referrals</div>
            <div className="text-[11px] font-semibold mt-2 pt-2 border-t border-navy-100 flex items-center justify-between text-emergency">
              <span>{stats.emergencyReferrals > 0 ? 'ತಕ್ಷಣ PHC ಗೆ ರೆಫರ್ ಮಾಡಿ' : 'ಯಾವುದೇ ತುರ್ತು ಇಲ್ಲ'}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-decelerate" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MAIN TWO-COLUMN CONTENT GRID (Span 8 + Span 4 on Desktop) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================== */}
        {/* LEFT COLUMN: VOICE ASSISTANT HERO & RECENT VISITS (Span 8) */}
        {/* ========================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* VOICE ASSISTANT HERO SECTION (Visual Highlight) */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-navy-100 shadow-card relative overflow-hidden space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-100 pb-5">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-mint-surface text-primary text-xs font-bold border border-primary-200 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>AI4Bharat Indic-Transcribe & Indic-Speak</span>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold font-kannada text-navy leading-tight">
                  ಧ್ವನಿ ಮೂಲಕ ಹೊಸ ಮನೆ ಭೇಟಿ ದಾಖಲಿಸಿ
                </h2>
                <p className="text-xs text-navy-500 font-medium mt-1">
                  ಕನ್ನಡ ಭಾಷೆಯಲ್ಲಿ ಸ್ವಾಭಾವಿಕವಾಗಿ ಮಾತನಾಡಿ. ತೂಕ, ಲಸಿಕೆ ಮತ್ತು ಅಪಾಯಕಾರಿ ಲಕ್ಷಣಗಳನ್ನು ಆಟೋಮ್ಯಾಟಿಕ್ ರಚನಾತ್ಮಕವಾಗಿ ಪ್ರತ್ಯೇಕಿಸುತ್ತದೆ.
                </p>
              </div>

              {/* Primary Start Voice Visit Button */}
              <button
                onClick={onStartRecording}
                className="bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-2xl shadow-touch flex items-center justify-center space-x-2.5 text-sm active:scale-[0.98] transition-decelerate touch-manipulation shrink-0"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <span className="font-kannada text-base">ಭೇಟಿ ಪ್ರಾರಂಭಿಸಿ (Start Visit)</span>
              </button>
            </div>

            {/* Live Visual Waveform & Audio Preview Box */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-ivory-bg border border-navy-100 text-center">
                <div className="relative flex items-center justify-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-touch">
                    <Mic className="w-7 h-7" />
                  </div>
                </div>
                <span className="text-xs font-bold text-navy font-kannada">
                  ಧ್ವನಿ ಮಾದರಿ ಸಿದ್ಧವಾಗಿದೆ
                </span>
                <span className="text-[10px] text-primary font-mono font-semibold mt-0.5">
                  16kHz High Precision
                </span>
              </div>

              <div className="sm:col-span-8 p-4 rounded-2xl bg-ivory-bg border border-navy-100 flex flex-col justify-center space-y-2">
                <div className="flex items-center justify-between text-xs text-navy-500">
                  <span className="font-semibold font-kannada text-navy-700">ಗುರುತಿಸಲ್ಪಡುವ ವೈದ್ಯಕೀಯ ಪದಗಳು:</span>
                  <span className="font-mono text-[10px] text-healthcare font-bold">Code-Mixed Ready</span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {['ANC Checkup', 'TT Injection', 'IFA Goli', 'ಮಗುವಿನ ತೂಕ', 'Bleeding', 'ಜ್ವರ', 'Newborn Check'].map((term) => (
                    <span 
                      key={term} 
                      className="px-2.5 py-1 rounded-lg bg-white border border-navy-200 text-navy-800 text-[11px] font-medium"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Evaluation Presets (Clickable Shortcuts) */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider block font-mono mb-2">
                ಪರೀಕ್ಷಾ ಸನ್ನಿವೇಶಗಳು (Quick Evaluation Scenarios):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => onStartRecording('anc_routine')}
                  className="p-3 rounded-xl bg-ivory-bg hover:bg-mint-surface/50 border border-navy-200 hover:border-primary text-left transition-decelerate active:scale-[0.98]"
                >
                  <span className="text-xs font-bold text-navy block font-kannada">🤰 1. ಗರ್ಭಿಣಿ ತಪಾಸಣೆ (ANC)</span>
                  <span className="text-[10px] text-navy-500 block mt-0.5">ತೂಕ, ರಕ್ತಹೀನತೆ, IFA ಮಾತ್ರೆ</span>
                </button>
                <button
                  onClick={() => onStartRecording('child_immunization')}
                  className="p-3 rounded-xl bg-ivory-bg hover:bg-mint-surface/50 border border-navy-200 hover:border-primary text-left transition-decelerate active:scale-[0.98]"
                >
                  <span className="text-xs font-bold text-navy block font-kannada">👶 2. ಮಕ್ಕಳ ಲಸಿಕೆ (UIP)</span>
                  <span className="text-[10px] text-navy-500 block mt-0.5">ಪೆಂಟಾವಲೆಂಟ್, ಪೋಲಿಯೋ ಡೋಸ್</span>
                </button>
                <button
                  onClick={() => onStartRecording('danger_sign_emergency')}
                  className="p-3 rounded-xl bg-emergency-50/50 hover:bg-emergency-50 border border-emergency-200 hover:border-emergency text-left transition-decelerate active:scale-[0.98]"
                >
                  <span className="text-xs font-bold text-emergency block font-kannada">🚨 3. ತುರ್ತು ಲಕ್ಷಣ (Danger Sign)</span>
                  <span className="text-[10px] text-emergency-700 block mt-0.5">ರಕ್ತಸ್ರಾವ, ತಕ್ಷಣ 108 ಆಂಬ್ಯುಲೆನ್ಸ್</span>
                </button>
              </div>
            </div>
          </div>

          {/* RECENT BENEFICIARY FIELD VISITS TABLE */}
          <div className="bg-white rounded-3xl p-6 border border-navy-100 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-healthcare-50 text-healthcare flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-navy font-kannada">
                    ಇತ್ತೀಚಿನ ಭೇಟಿ ದಾಖಲೆಗಳು (Recent Completed Visits)
                  </h3>
                  <p className="text-xs text-navy-400 font-medium">ಧ್ವನಿ ಮೂಲಕ ನಮೂದಿಸಲಾದ ಇತ್ತೀಚಿನ ಭೇಟಿಗಳು</p>
                </div>
              </div>

              <button 
                onClick={() => onNavigate('beneficiaries')}
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center space-x-1"
              >
                <span>ಎಲ್ಲಾ ನೋಡಿ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List / Table of Visits */}
            <div className="space-y-3">
              {recentVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="p-4 rounded-2xl border border-navy-100 bg-white hover:bg-ivory-bg transition-decelerate flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-mint-surface text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {visit.beneficiary_name?.slice(0, 1) || 'A'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-navy font-kannada">
                          {visit.beneficiary_name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-healthcare-50 text-healthcare border border-healthcare-100">
                          {visit.visit_type}
                        </span>
                      </div>
                      <p className="text-xs text-navy-600 mt-1 line-clamp-1 font-medium">
                        {visit.additional_notes || 'ಭೇಟಿ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ. ಯಾವುದೇ ತೊಂದರೆ ಇಲ್ಲ.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4 text-xs text-navy-500 font-medium pt-2 sm:pt-0 border-t sm:border-t-0 border-navy-50">
                    <span className="flex items-center">
                      <Scale className="w-3.5 h-3.5 mr-1 text-primary" />
                      {visit.weight ? `${visit.weight} kg` : 'N/A'}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-primary" />
                      {visit.next_visit_date || 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* RIGHT COLUMN: TODAY'S TASKS & EMERGENCY STATUS (Span 4)    */}
        {/* ========================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* TODAY'S TASKS & FOLLOW-UP CHECKLIST */}
          <div className="bg-white rounded-3xl p-5 border border-navy-100 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-warning"></span>
                <h3 className="font-bold text-sm text-navy font-kannada">
                  ಇಂದಿನ ಮುಖ್ಯ ಕಾರ್ಯಗಳು (Today's Tasks)
                </h3>
              </div>
              <button 
                onClick={() => onNavigate('followups')}
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center"
              >
                ಎಲ್ಲಾ ({todayFollowups.length}) <ChevronRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {todayFollowups.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-ivory-bg border border-navy-100 space-y-2 hover:border-primary-200 transition-decelerate"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-navy font-kannada block">
                        {item.beneficiary_name_kn || item.beneficiary_name}
                      </span>
                      <span className="text-[11px] text-navy-600 font-medium">
                        {item.type}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-mint-surface text-primary border border-primary-200">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-navy-400 font-medium pt-1 border-t border-navy-50">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-primary" />
                      {item.village}
                    </span>
                    <button
                      onClick={() => onStartRecording(item.beneficiary_id)}
                      className="text-primary font-bold hover:underline flex items-center space-x-0.5"
                    >
                      <Mic className="w-3 h-3" />
                      <span>ಭೇಟಿ ಪ್ರಾರಂಭಿಸಿ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 108 AMBULANCE DISPATCH WIDGET */}
          <div className="bg-white rounded-3xl p-5 border border-navy-100 shadow-card space-y-3.5">
            <div className="flex items-center justify-between border-b border-navy-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emergency text-white flex items-center justify-center">
                  <Ambulance className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-kannada text-navy leading-tight">
                    108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಿಮ್ಯುಲೇಶನ್
                  </h4>
                  <span className="text-[10px] text-navy-400 font-medium">Live Dispatch Status</span>
                </div>
              </div>

              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emergency text-white animate-pulse">
                {ambulanceInfo?.status || 'DISPATCHED'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-ivory-bg border border-navy-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-navy-500 font-medium">ಅಂದಾಜು ಸಮಯ (ETA):</span>
                <span className="font-bold text-healthcare font-mono">
                  {ambulanceInfo?.eta_minutes ?? 8} ನಿಮಿಷಗಳು
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-500 font-medium">ವಾಹನ ಸಂಖ್ಯೆ:</span>
                <span className="font-bold font-mono text-primary">
                  {ambulanceInfo?.vehicle_number || 'KA-11-G-1081'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-500 font-medium">ಚಾಲಕ:</span>
                <span className="font-bold text-navy font-kannada">
                  {ambulanceInfo?.driver_name || 'ರಮೇಶ್ ಗೌಡ'}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('ambulance')}
              className="w-full bg-mint-surface hover:bg-mint-surface/80 text-primary font-bold py-2.5 px-3 rounded-xl border border-primary-200 text-xs flex items-center justify-center space-x-1.5 active:scale-[0.98] transition-decelerate"
            >
              <span>ಲೈವ್ ನಕ್ಷೆ ವೀಕ್ಷಿಸಿ (Open Map)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* EMERGENCY HELPLINES SHORTCUTS */}
          <div className="bg-navy text-white rounded-3xl p-5 shadow-touch space-y-3">
            <h4 className="text-xs font-bold font-kannada text-mint-surface flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-warning" />
              <span>ತುರ್ತು ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆಗಳು (Helplines)</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-navy-800 border border-navy-700">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-emergency text-white flex items-center justify-center font-bold text-[10px]">
                    108
                  </div>
                  <span className="font-kannada font-bold">ಆಂಬ್ಯುಲೆನ್ಸ್ ಸೇವೆ</span>
                </div>
                <button
                  onClick={() => window.open('tel:108', '_self')}
                  className="text-xs font-bold font-mono text-mint-surface bg-navy-900 px-2.5 py-1 rounded-lg border border-navy-600 hover:bg-navy-950"
                >
                  ಕರೆ ಮಾಡಿ
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-navy-800 border border-navy-700">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-healthcare text-white flex items-center justify-center font-bold text-[10px]">
                    104
                  </div>
                  <span className="font-kannada font-bold">ಆರೋಗ್ಯ ಸಹಾಯವಾಣಿ</span>
                </div>
                <button
                  onClick={() => window.open('tel:104', '_self')}
                  className="text-xs font-bold font-mono text-mint-surface bg-navy-900 px-2.5 py-1 rounded-lg border border-navy-600 hover:bg-navy-950"
                >
                  ಕರೆ ಮಾಡಿ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
