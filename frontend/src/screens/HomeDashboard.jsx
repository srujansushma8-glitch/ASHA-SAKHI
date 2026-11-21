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
  ExternalLink,
  Baby,
  TrendingUp,
  AlertCircle,
  Pill,
  BarChart3
} from 'lucide-react';
import { api } from '../services/api';

export default function HomeDashboard({ 
  onStartRecording, 
  onSelectBeneficiary, 
  onNavigate, 
  emergencyCount = 0 
}) {
  const [stats, setStats] = useState({
    totalBeneficiaries: 48,
    todayVisits: 6,
    pendingFollowups: 5,
    emergencyReferrals: 2
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
        totalBeneficiaries: beneficiaries.length > 0 ? beneficiaries.length : 48,
        todayVisits: todayVisitsCount > 0 ? todayVisitsCount : 6,
        pendingFollowups: pendingCount > 0 ? pendingCount : 5,
        emergencyReferrals: emergencyAlerts.length > 0 ? emergencyAlerts.length : 2
      });

      setRecentVisits(visits.slice(0, 5));
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
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-7 animate-fade-in pb-24 lg:pb-12">
      {/* ============================================================ */}
      {/* 1. TOP WELCOME SECTION                                       */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 lg:p-7 border border-navy-200/60 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 text-xs font-bold border border-cyan-200">
            <span className="w-2 h-2 rounded-full bg-cyan animate-pulse"></span>
            <span>ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಅಭಿಯಾನ (NHM) • ಕರ್ನಾಟಕ ಆರೋಗ್ಯ ಇಲಾಖೆ</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-kannada text-navy-900 leading-tight">
            ನಮಸ್ಕಾರ, ಶಾರದಾ ಬಾಯಿ!
          </h1>
          <p className="text-xs text-navy-500 font-medium">
            ಆಶಾ ಕಾರ್ಯಕರ್ತೆ ದಿನಚರಿ (ASHA SAKHI Healthcare Field Register) • ಮಂಡ್ಯ PHC
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs text-navy-600 font-medium">
          <span className="flex items-center bg-softblue px-3.5 py-2 rounded-xl border border-navy-200/60">
            <Calendar className="w-4 h-4 mr-1.5 text-primary" />
            <span className="font-kannada font-bold text-navy-900">{todayFormatted}</span>
          </span>
          <span className="flex items-center bg-softblue px-3.5 py-2 rounded-xl border border-navy-200/60">
            <MapPin className="w-4 h-4 mr-1.5 text-primary" />
            <span>ಮಂಡ್ಯ ತಾಲೂಕು (ಶಿವಳ್ಳಿ & ಕೆರೆಗೋಡು ವಲಯ)</span>
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN HERO SECTION: PREMIUM AI VOICE ASSISTANT CARD        */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-primary text-white rounded-3xl p-6 lg:p-8 shadow-card relative overflow-hidden border border-cyan-500/20">
        {/* Subtle Decorative Background Wave */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-cyan/10 blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left: AI Status & Kannada Introduction */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan/20 text-cyan-300 text-xs font-bold border border-cyan/30">
                <Sparkles className="w-3.5 h-3.5 text-cyan" />
                <span>AI4Bharat Indic-Transcribe & Indic-Speak</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-healthcare/20 text-emerald-300 text-xs font-mono font-bold border border-healthcare/30">
                ● 16kHz VAD Active
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-xs font-mono font-medium">
                Latency: ~250ms
              </span>
            </div>

            <div>
              <h2 className="text-2xl lg:text-3xl font-bold font-kannada leading-tight text-white">
                ಧ್ವನಿ ಮೂಲಕ ಹೊಸ ಮನೆ ಭೇಟಿ ದಾಖಲಿಸಿ
              </h2>
              <p className="text-sm text-cyan-100/90 font-normal mt-1.5 max-w-2xl leading-relaxed">
                ಕನ್ನಡ ಭಾಷೆಯಲ್ಲಿ ಸ್ವಾಭಾವಿಕವಾಗಿ ಮಾತನಾಡಿ. ತಾಯಿ-ಮಗು ಆರೈಕೆ, ತೂಕ, ಲಸಿಕೆ (UIP), IFA ಮಾತ್ರೆಗಳು ಮತ್ತು ತುರ್ತು ಅಪಾಯಕಾರಿ ಲಕ್ಷಣಗಳನ್ನು ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ತಕ್ಷಣವೇ ಗುರುತಿಸಿ ದಾಖಲಿಸುತ್ತದೆ.
              </p>
            </div>

            {/* Quick Evaluation Scenario Chips */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-300 font-bold block mb-2">
                ಪರೀಕ್ಷಾ ಸನ್ನಿವೇಶಗಳು (Quick Evaluation Presets):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onStartRecording('anc_routine')}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-decelerate active:scale-95 flex items-center space-x-1.5"
                >
                  <span>🤰 1. ಗರ್ಭಿಣಿ ತಪಾಸಣೆ (ANC)</span>
                </button>
                <button
                  onClick={() => onStartRecording('child_immunization')}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-decelerate active:scale-95 flex items-center space-x-1.5"
                >
                  <span>👶 2. ಮಕ್ಕಳ ಲಸಿಕೆ (UIP)</span>
                </button>
                <button
                  onClick={() => onStartRecording('danger_sign_emergency')}
                  className="px-3 py-2 rounded-xl bg-emergency/30 hover:bg-emergency/50 border border-emergency/50 text-xs font-bold text-red-200 transition-decelerate active:scale-95 flex items-center space-x-1.5"
                >
                  <span>🚨 3. ತುರ್ತು ಲಕ್ಷಣ (Danger Sign)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Circular Animated Microphone & Start CTA */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-4">
            {/* Circular Pulsing Mic with Animated Cyan Sound Waves */}
            <div className="relative flex items-center justify-center">
              {/* Outer Cyan Ripple */}
              <div className="absolute w-36 h-36 rounded-full bg-cyan/20 animate-ping pointer-events-none"></div>
              {/* Middle Cyan Ring */}
              <div className="absolute w-28 h-28 rounded-full bg-cyan/30 animate-pulse pointer-events-none"></div>
              
              {/* Center Mic Button */}
              <button
                onClick={() => onStartRecording()}
                className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-cyan text-white flex flex-col items-center justify-center shadow-cyan active:scale-95 transition-decelerate border-4 border-white/20 hover:scale-105"
                title="ಧ್ವನಿ ಭೇಟಿ ಪ್ರಾರಂಭಿಸಿ"
              >
                <Mic className="w-9 h-9" />
              </button>
            </div>

            {/* Simulated Animated Sound Wave Bars */}
            <div className="flex items-center justify-center space-x-1.5 h-6">
              <span className="w-1 bg-cyan rounded-full animate-soundwave" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-1 bg-cyan-300 rounded-full animate-soundwave" style={{ animationDelay: '0.3s' }}></span>
              <span className="w-1 bg-primary rounded-full animate-soundwave" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1 bg-cyan rounded-full animate-soundwave" style={{ animationDelay: '0.5s' }}></span>
              <span className="w-1 bg-cyan-300 rounded-full animate-soundwave" style={{ animationDelay: '0.4s' }}></span>
            </div>

            {/* Start Button */}
            <button
              onClick={() => onStartRecording()}
              className="w-full bg-gradient-to-r from-cyan to-primary hover:from-cyan-hover hover:to-primary-hover text-white font-bold py-3.5 px-6 rounded-2xl shadow-cyan flex items-center justify-center space-x-2.5 text-sm active:scale-95 transition-decelerate"
            >
              <Mic className="w-4 h-4" />
              <span className="font-kannada text-base">ಧ್ವನಿ ಭೇಟಿ ಪ್ರಾರಂಭಿಸಿ (Start Voice Visit)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. STATISTICS SECTION (4 KPI CARDS WITH TRENDS)              */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* KPI 1: Total Beneficiaries */}
        <div 
          onClick={() => onNavigate('beneficiaries')}
          className="bg-white p-5 rounded-3xl border border-navy-200/60 shadow-card hover:shadow-card-hover hover:border-primary transition-decelerate cursor-pointer active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center group-hover:bg-cyan group-hover:text-white transition-decelerate">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-healthcare font-mono bg-healthcare-50 px-2.5 py-1 rounded-full border border-healthcare-100 flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12% ತಿಂಗಳು</span>
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl lg:text-4xl font-bold text-navy-900 font-mono leading-none tracking-tight">
              {stats.totalBeneficiaries}
            </div>
            <div className="text-sm font-bold text-navy-900 mt-1.5 font-kannada">
              ಒಟ್ಟು ಫಲಾನುಭವಿಗಳು
            </div>
            <div className="text-xs text-navy-400 font-medium">Total Beneficiaries Enrolled</div>
            <div className="text-[11px] text-primary font-semibold mt-2 pt-2 border-t border-navy-100 flex items-center justify-between">
              <span>ANC: 14 • ಮಕ್ಕಳು: 22</span>
              <ChevronRight className="w-3.5 h-3.5 text-navy-400 group-hover:translate-x-1 transition-decelerate" />
            </div>
          </div>
        </div>

        {/* KPI 2: Today's Home Visits */}
        <div 
          onClick={() => onNavigate('beneficiaries')}
          className="bg-white p-5 rounded-3xl border border-navy-200/60 shadow-card hover:shadow-card-hover hover:border-healthcare transition-decelerate cursor-pointer active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-healthcare-50 text-healthcare flex items-center justify-center group-hover:bg-healthcare group-hover:text-white transition-decelerate">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-healthcare font-mono bg-healthcare-50 px-2.5 py-1 rounded-full border border-healthcare-100">
              100% ಗುರಿ
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl lg:text-4xl font-bold text-healthcare font-mono leading-none tracking-tight">
              {stats.todayVisits}
            </div>
            <div className="text-sm font-bold text-navy-900 mt-1.5 font-kannada">
              ಇಂದಿನ ಮನೆ ಭೇಟಿಗಳು
            </div>
            <div className="text-xs text-navy-400 font-medium">Visits Completed Today</div>
            <div className="text-[11px] text-healthcare font-semibold mt-2 pt-2 border-t border-navy-100 flex items-center justify-between">
              <span>ದೈನಂದಿನ ಗುರಿ: 6 ಭೇಟಿಗಳು</span>
              <ChevronRight className="w-3.5 h-3.5 text-navy-400 group-hover:translate-x-1 transition-decelerate" />
            </div>
          </div>
        </div>

        {/* KPI 3: Pending Follow-ups */}
        <div 
          onClick={() => onNavigate('followups')}
          className="bg-white p-5 rounded-3xl border border-navy-200/60 shadow-card hover:shadow-card-hover hover:border-warning transition-decelerate cursor-pointer active:scale-[0.98] group"
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
            <div className="text-sm font-bold text-navy-900 mt-1.5 font-kannada">
              ಬಾಕಿ ಇರುವ ಭೇಟಿಗಳು
            </div>
            <div className="text-xs text-navy-400 font-medium">Pending Follow-ups</div>
            <div className="text-[11px] text-warning-700 font-semibold mt-2 pt-2 border-t border-navy-100 flex items-center justify-between">
              <span>ಲಸಿಕೆ & ತಪಾಸಣೆ ಬಾಕಿ</span>
              <ChevronRight className="w-3.5 h-3.5 text-navy-400 group-hover:translate-x-1 transition-decelerate" />
            </div>
          </div>
        </div>

        {/* KPI 4: Emergency Referrals */}
        <div 
          onClick={() => onNavigate('emergency')}
          className={`p-5 rounded-3xl border shadow-card transition-decelerate cursor-pointer active:scale-[0.98] group ${
            stats.emergencyReferrals > 0 
              ? 'bg-emergency-50/70 border-emergency-300 hover:border-emergency' 
              : 'bg-white border-navy-200/60 hover:border-navy-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-decelerate ${
              stats.emergencyReferrals > 0 
                ? 'bg-emergency text-white animate-pulse shadow-emergency' 
                : 'bg-navy-100 text-navy-500'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className={`text-[11px] font-bold font-mono px-2.5 py-1 rounded-full border ${
              stats.emergencyReferrals > 0 
                ? 'bg-emergency text-white border-emergency' 
                : 'bg-navy-100 text-navy-700 border-navy-200'
            }`}>
              108 Alert
            </span>
          </div>

          <div className="mt-4">
            <div className={`text-3xl lg:text-4xl font-bold font-mono leading-none tracking-tight ${
              stats.emergencyReferrals > 0 ? 'text-emergency' : 'text-navy-900'
            }`}>
              {stats.emergencyReferrals}
            </div>
            <div className="text-sm font-bold text-navy-900 mt-1.5 font-kannada">
              ತುರ್ತು ರೆಫರಲ್‌ಗಳು
            </div>
            <div className="text-xs text-navy-400 font-medium">Emergency Referrals</div>
            <div className="text-[11px] font-semibold mt-2 pt-2 border-t border-navy-100 flex items-center justify-between text-emergency">
              <span>{stats.emergencyReferrals > 0 ? 'ತಕ್ಷಣ PHC ಗೆ ರೆಫರ್ ಮಾಡಿ' : 'ಯಾವುದೇ ತುರ್ತು ಇಲ್ಲ'}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-decelerate" />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. ANALYTICS SECTION (BALANCED 2-COLUMN LAYOUT)              */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Maternal Health Overview & Risk Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-navy-200/60 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-navy-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                <Baby className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-navy-900 font-kannada">
                  ತಾಯಿ ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆ (Maternal Health Overview)
                </h3>
                <p className="text-xs text-navy-400 font-medium">ಒಟ್ಟು 14 ಗರ್ಭಿಣಿಯರ ಸ್ಥಿತಿ ಮತ್ತು ಅಪಾಯದ ವರ್ಗೀಕರಣ</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('maternal')}
              className="text-xs font-bold text-pink-700 hover:text-pink-800 flex items-center space-x-1 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-200"
            >
              <span>ಪೂರ್ಣ ವಿವರ</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Risk Distribution Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-navy-700">
              <span>ಗರ್ಭಾವಸ್ಥೆ ಅಪಾಯದ ಹಂಚಿಕೆ (Risk Distribution):</span>
              <span className="font-mono text-[11px] text-navy-500">14 Enrolled Mothers</span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Low Risk */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-healthcare flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-healthcare inline-block"></span>
                    <span>ಕಡಿಮೆ ಅಪಾಯ (Low Risk - Normal)</span>
                  </span>
                  <span className="font-mono font-bold text-navy-700">10 ತಾಯಂದಿರು (72%)</span>
                </div>
                <div className="w-full bg-softblue rounded-full h-2.5 overflow-hidden">
                  <div className="bg-healthcare h-full rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>

              {/* Moderate Risk */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-warning-700 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-warning inline-block"></span>
                    <span>ಮಧ್ಯಮ ಅಪಾಯ (Moderate Risk - Anemia)</span>
                  </span>
                  <span className="font-mono font-bold text-navy-700">3 ತಾಯಂದಿರು (21%)</span>
                </div>
                <div className="w-full bg-softblue rounded-full h-2.5 overflow-hidden">
                  <div className="bg-warning h-full rounded-full" style={{ width: '21%' }}></div>
                </div>
              </div>

              {/* High Risk */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-emergency flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emergency inline-block"></span>
                    <span>ಹೆಚ್ಚಿನ ಅಪಾಯ (High Risk - Pre-eclampsia)</span>
                  </span>
                  <span className="font-mono font-bold text-emergency">1 ತಾಯಿ (7% - Geetha M.)</span>
                </div>
                <div className="w-full bg-softblue rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emergency h-full rounded-full" style={{ width: '7%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Pregnancy Progress Visualization (Trimester Cohorts) */}
          <div className="p-4 rounded-2xl bg-softblue border border-navy-100 space-y-2">
            <span className="text-xs font-bold text-navy-800 font-kannada block">
              ಗರ್ಭಾವಸ್ಥೆಯ ತ್ರೈಮಾಸಿಕ ಪ್ರಗತಿ (Trimester Progress):
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-white rounded-xl border border-navy-100">
                <span className="text-[10px] text-navy-400 block font-medium">1ನೇ ತ್ರೈಮಾಸಿಕ</span>
                <span className="text-base font-bold text-primary font-mono">3 ತಾಯಂದಿರು</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-navy-100">
                <span className="text-[10px] text-navy-400 block font-medium">2ನೇ ತ್ರೈಮಾಸಿಕ</span>
                <span className="text-base font-bold text-cyan-700 font-mono">7 ತಾಯಂದಿರು</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-navy-100">
                <span className="text-[10px] text-navy-400 block font-medium">3ನೇ ತ್ರೈಮಾಸಿಕ</span>
                <span className="text-base font-bold text-pink-700 font-mono">4 ತಾಯಂದಿರು</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Child Immunization Statistics & Vaccination Completion */}
        <div className="bg-white rounded-3xl p-6 border border-navy-200/60 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-navy-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                <Syringe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-navy-900 font-kannada">
                  ಮಕ್ಕಳ ಲಸಿಕೆ ಪ್ರಗತಿ (Child Immunization Statistics)
                </h3>
                <p className="text-xs text-navy-400 font-medium">ಸಾರ್ವತ್ರಿಕ ಲಸಿಕಾ ಕಾರ್ಯಕ್ರಮ (UIP) ವರದಿ</p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-healthcare bg-healthcare-50 px-2.5 py-1 rounded-full border border-healthcare-100">
              88% ಕವರೇಜ್
            </span>
          </div>

          {/* Vaccination Coverage Progress Bars */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-navy-700">
              <span>ಲಸಿಕೆ ಪೂರ್ಣತೆಯ ಪ್ರಮಾಣ (Vaccine Cohorts):</span>
              <span className="font-mono text-[11px] text-navy-500">22 Eligible Infants</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-navy-700">ಜನನ ಡೋಸ್ (BCG, Hep B-0, OPV-0)</span>
                  <span className="font-mono font-bold text-healthcare">96% (21/22)</span>
                </div>
                <div className="w-full bg-softblue rounded-full h-2.5 overflow-hidden">
                  <div className="bg-healthcare h-full rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-navy-700">ಪೆಂಟಾವಲೆಂಟ್ 1-3 & ರೋಟಾವೈರಸ್</span>
                  <span className="font-mono font-bold text-primary">91% (20/22)</span>
                </div>
                <div className="w-full bg-softblue rounded-full h-2.5 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '91%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-navy-700">ಮೀಸಲ್ಸ್-ರುಬೆಲ್ಲಾ (MR-1 & Vit-A 9m)</span>
                  <span className="font-mono font-bold text-warning-700">82% (18/22)</span>
                </div>
                <div className="w-full bg-softblue rounded-full h-2.5 overflow-hidden">
                  <div className="bg-warning h-full rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Due and Overdue Indicators */}
          <div className="p-4 rounded-2xl bg-softblue border border-navy-100 space-y-2">
            <span className="text-xs font-bold text-navy-800 font-kannada block">
              ಇಂದು ಮತ್ತು ಈ ವಾರ ಬಾಕಿ ಇರುವ ಲಸಿಕೆಗಳು (Due Vaccines):
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-navy-100">
                <span className="font-kannada font-bold text-navy-900">👶 ಬೇಬಿ ಅನನ್ಯಾ (6 ವಾರ)</span>
                <span className="font-mono font-bold text-warning-700 bg-warning-50 px-2 py-0.5 rounded border border-warning-200">
                  Pentavalent-1 ಇಂದು ಬಾಕಿ
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-navy-100">
                <span className="font-kannada font-bold text-navy-900">👶 ಬೇಬಿ ಆರವ್ (6 ತಿಂಗಳು)</span>
                <span className="font-mono font-bold text-healthcare bg-healthcare-50 px-2 py-0.5 rounded border border-healthcare-100">
                  OPV-3 ಪೂರ್ಣಗೊಂಡಿದೆ ✓
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. RECENT ACTIVITIES & RIGHT-SIDE WIDGETS                    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RECENT FIELD VISITS TABLE (Span 8) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-navy-200/60 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-navy-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-healthcare-50 text-healthcare flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-navy-900 font-kannada">
                  ಇತ್ತೀಚಿನ ಭೇಟಿ ದಾಖಲೆಗಳು (Recent Completed Visits)
                </h3>
                <p className="text-xs text-navy-400 font-medium">ಕನ್ನಡ ಧ್ವನಿ ಮೂಲಕ ದಾಖಲಿಸಲಾದ ಇತ್ತೀಚಿನ ರೋಗಿಗಳ ವಿವರಗಳು</p>
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

          {/* Visits Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-navy-100 text-[11px] font-bold text-navy-400 uppercase tracking-wider font-mono">
                  <th className="pb-3 font-semibold">ಫಲಾನುಭವಿ (Beneficiary)</th>
                  <th className="pb-3 font-semibold">ಭೇಟಿ ಪ್ರಕಾರ (Visit Type)</th>
                  <th className="pb-3 font-semibold">ತೂಕ (Weight)</th>
                  <th className="pb-3 font-semibold">ಸ್ಥಿತಿ (Status)</th>
                  <th className="pb-3 font-semibold text-right">ಕ್ರಮ (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {recentVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-softblue/60 transition-decelerate">
                    <td className="py-3.5 pr-2">
                      <div className="font-bold text-navy-900 font-kannada text-[13px]">
                        {visit.beneficiary_name}
                      </div>
                      <div className="text-[10px] text-navy-400 font-mono">
                        {visit.beneficiary_id}
                      </div>
                    </td>
                    <td className="py-3.5 pr-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 font-bold text-[10px] border border-cyan-200">
                        {visit.visit_type}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 font-mono font-bold text-navy-700">
                      {visit.weight ? `${visit.weight} kg` : 'N/A'}
                    </td>
                    <td className="py-3.5 pr-2">
                      <span className="px-2 py-0.5 rounded-md bg-healthcare-50 text-healthcare font-bold text-[10px] border border-healthcare-100">
                        ಧೃಢೀಕೃತ (Saved)
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => onStartRecording(visit.beneficiary_id)}
                        className="text-xs font-bold text-primary hover:text-cyan-600 flex items-center justify-end space-x-1"
                      >
                        <Mic className="w-3 h-3" />
                        <span>ಭೇಟಿ</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT-SIDE WIDGETS (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Today's Scheduled Visits & Follow-up Checklist */}
          <div className="bg-white rounded-3xl p-5 border border-navy-200/60 shadow-card space-y-3.5">
            <div className="flex items-center justify-between border-b border-navy-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-warning"></span>
                <h3 className="font-bold text-xs text-navy-900 font-kannada">
                  ಇಂದಿನ ಮುಖ್ಯ ಕಾರ್ಯಗಳು (Today's Tasks)
                </h3>
              </div>
              <button 
                onClick={() => onNavigate('followups')}
                className="text-xs font-bold text-primary hover:underline flex items-center"
              >
                ಎಲ್ಲಾ ({todayFollowups.length}) <ChevronRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            <div className="space-y-2">
              {todayFollowups.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-softblue border border-navy-100 space-y-1.5 hover:border-primary-300 transition-decelerate"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-navy-900 font-kannada block">
                        {item.beneficiary_name_kn || item.beneficiary_name}
                      </span>
                      <span className="text-[10px] text-navy-500 font-medium">
                        {item.type}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-navy-400 font-medium pt-1 border-t border-navy-100">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-primary" />
                      {item.village}
                    </span>
                    <button
                      onClick={() => onStartRecording(item.beneficiary_id)}
                      className="text-primary font-bold hover:underline flex items-center space-x-0.5"
                    >
                      <Mic className="w-3 h-3" />
                      <span>ಭೇಟಿ</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 108 Ambulance Dispatch Simulator Widget */}
          <div className="bg-white rounded-3xl p-5 border border-navy-200/60 shadow-card space-y-3.5">
            <div className="flex items-center justify-between border-b border-navy-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emergency text-white flex items-center justify-center">
                  <Ambulance className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-kannada text-navy-900 leading-tight">
                    108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಸಿಮ್ಯುಲೇಶನ್
                  </h4>
                  <span className="text-[10px] text-navy-400 font-medium">Live Dispatch Status</span>
                </div>
              </div>

              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emergency text-white animate-pulse">
                {ambulanceInfo?.status || 'DISPATCHED'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-softblue border border-navy-100 space-y-1 text-xs">
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
                <span className="font-bold text-navy-900 font-kannada">
                  {ambulanceInfo?.driver_name || 'ರಮೇಶ್ ಗೌಡ'}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('ambulance')}
              className="w-full bg-cyan-50 hover:bg-cyan-100 text-cyan-800 font-bold py-2.5 px-3 rounded-xl border border-cyan-200 text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-decelerate"
            >
              <span>ಲೈವ್ ನಕ್ಷೆ ವೀಕ್ಷಿಸಿ (Open Map)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Emergency Helpline Shortcuts */}
          <div className="bg-navy-900 text-white rounded-3xl p-5 shadow-card space-y-3 border border-navy-800">
            <h4 className="text-xs font-bold font-kannada text-cyan-300 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-warning" />
              <span>ತುರ್ತು ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆಗಳು (Helplines)</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-navy-800/80 border border-navy-700">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-emergency text-white flex items-center justify-center font-bold text-[10px]">
                    108
                  </div>
                  <span className="font-kannada font-bold">ಆಂಬ್ಯುಲೆನ್ಸ್ ಸೇವೆ</span>
                </div>
                <button
                  onClick={() => window.open('tel:108', '_self')}
                  className="text-xs font-bold font-mono text-cyan-300 bg-navy-900 px-2.5 py-1 rounded-lg border border-navy-600 hover:bg-navy-950"
                >
                  ಕರೆ ಮಾಡಿ
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-navy-800/80 border border-navy-700">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-healthcare text-white flex items-center justify-center font-bold text-[10px]">
                    104
                  </div>
                  <span className="font-kannada font-bold">ಆರೋಗ್ಯ ಸಹಾಯವಾಣಿ</span>
                </div>
                <button
                  onClick={() => window.open('tel:104', '_self')}
                  className="text-xs font-bold font-mono text-cyan-300 bg-navy-900 px-2.5 py-1 rounded-lg border border-navy-600 hover:bg-navy-950"
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
