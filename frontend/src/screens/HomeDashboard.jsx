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
  BarChart3,
  IndianRupee,
  Volume2,
  VolumeX,
  Navigation
} from 'lucide-react';
import { api } from '../services/api';
import { ttsService } from '../services/ttsService';
import { useLanguage } from '../context/LanguageContext';

export default function HomeDashboard({ 
  onStartRecording, 
  onSelectBeneficiary, 
  onNavigate, 
  emergencyCount = 0
}) {
  const { t, currentLanguage, formatDate, formatNumber } = useLanguage();

  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    todayVisits: 0,
    pendingFollowups: 0,
    emergencyReferrals: 0,
    pendingSync: 0
  });
  const [recentVisits, setRecentVisits] = useState([]);
  const [todayFollowups, setTodayFollowups] = useState([]);
  const [communityRequests, setCommunityRequests] = useState([]);
  const [ambulanceInfo, setAmbulanceInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlayingBriefing, setIsPlayingBriefing] = useState(false);

  const toggleBriefingAudio = () => {
    if (isPlayingBriefing) {
      ttsService.stop();
      setIsPlayingBriefing(false);
    } else {
      setIsPlayingBriefing(true);
      const briefingText = currentLanguage === 'kn'
        ? 'ನಮಸ್ಕಾರ ಶಾರದಾ ಅವರೇ. ಇಂದಿನ ದಿನಚರಿ: 6 ಮನೆ ಭೇಟಿಗಳು ನಿಗದಿಯಾಗಿವೆ. ಮೀನಾಕ್ಷಿಯವರ ತೀವ್ರ ರಕ್ತಹೀನತೆ ತಪಾಸಣೆ ಅತ್ಯಂತ ಪ್ರಮುಖವಾಗಿದೆ. ಪೂಜಾ ಅವರ ಶಿಶುವಿಗೆ ಲಸಿಕೆ ಬಾಕಿ ಇದೆ. ನಿಮ್ಮ ಒಟ್ಟು ಪ್ರೋತ್ಸಾಹಧನ 6850 ರೂಪಾಯಿ ತಲುಪಿದೆ.'
        : currentLanguage === 'hi'
        ? 'नमस्ते शारदा जी। आज की कार्यसूची: 6 गृह दौरे निर्धारित हैं। मीनाक्षी की गंभीर एनीमिया जांच सबसे महत्वपूर्ण है। पूजा के शिशु का टीकाकरण लंबित है। आपका कुल प्रोत्साहन 6850 रुपये हो गया है।'
        : currentLanguage === 'te'
        ? 'నమస్కారం శారదా అక్క. నేటి కార్యాచరణ: 6 ఇళ్ళ సందర్శనలు ఉన్నాయి. మీనాక్షి రక్తహీనత పరీక్ష ముఖ్యం.'
        : currentLanguage === 'ta'
        ? 'வணக்கம் சாரதா அக்கா. இன்றைய பணி: 6 வீட்டு வருகைகள் திட்டமிடப்பட்டுள்ளன. மீனாட்சி ரத்த சோகை பரிசோதனை முக்கியமானது.'
        : 'Hello Sharada. Today agenda: 6 home visits scheduled. Meenakshi severe anaemia checkup is critical. Pooja infant vaccination is due. Your total incentive reached 6850 rupees.';
      
      ttsService.speakText(briefingText, {
        onEnd: () => setIsPlayingBriefing(false)
      });
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleSyncUpdate = (e) => {
      const count = e?.detail?.count ?? 0;
      setStats(prev => ({ ...prev, pendingSync: count }));
    };
    window.addEventListener('asha_sync_updated', handleSyncUpdate);
    return () => window.removeEventListener('asha_sync_updated', handleSyncUpdate);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [beneficiaries, visits, followups, emergencyAlerts, ambulanceData, visitReqs] = await Promise.all([
        api.getBeneficiaries(),
        api.getVisits(),
        api.getFollowups(),
        api.getEmergencyAlerts(),
        api.getAmbulanceTracking ? api.getAmbulanceTracking() : null,
        api.getVisitRequests ? api.getVisitRequests() : Promise.resolve([])
      ]);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayVisitsCount = visits.filter(v => (v.created_at || '').startsWith(todayStr)).length;
      const pendingCount = followups.filter(f => f.status === 'pending' || f.due_date <= todayStr).length;

      const queue = api.getPendingSyncQueue ? api.getPendingSyncQueue() : [];
      setStats({
        totalBeneficiaries: beneficiaries ? beneficiaries.length : 0,
        todayVisits: todayVisitsCount,
        pendingFollowups: pendingCount,
        emergencyReferrals: emergencyAlerts ? emergencyAlerts.length : 0,
        pendingSync: queue.length
      });

      setRecentVisits(visits.slice(0, 5));
      setTodayFollowups(followups.slice(0, 4));
      if (ambulanceData) setAmbulanceInfo(ambulanceData);
      if (Array.isArray(visitReqs)) setCommunityRequests(visitReqs);
    } catch (err) {
      console.error('[HomeDashboard] Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRequest = async (reqId) => {
    try {
      if (api.updateVisitRequestStatus) {
        await api.updateVisitRequestStatus(reqId, 'CONFIRMED');
      }
      setCommunityRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'CONFIRMED' } : r));
    } catch (e) {
      console.warn('Could not update request status', e);
      setCommunityRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'CONFIRMED' } : r));
    }
  };

  const todayFormatted = formatDate(new Date(), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-7 animate-fade-in pb-24 lg:pb-12">
      {/* ============================================================ */}
      {/* 1. TOP WELCOME SECTION                                       */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-r from-white via-[#FFF9F7] to-[#FDF6F5] rounded-3xl p-6 lg:p-7 border border-[#F0DDE2] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FDF6F5] text-[#A25B74] text-xs font-bold border border-[#F0DDE2]">
            <span className="w-2 h-2 rounded-full bg-[#A25B74] animate-pulse"></span>
            <span>{t("common.department")}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif text-[#3B2A33] leading-tight">
            {t("dashboard.greeting")}
          </h1>
          <p className="text-xs text-[#7A6670] font-medium">
            {t("dashboard.roleDesc")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#7A6670] font-medium">
          {/* Daily Audio Briefing Play Button */}
          <button
            onClick={toggleBriefingAudio}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm ${
              isPlayingBriefing 
                ? 'bg-[#B94A58] text-white animate-pulse shadow-emergency'
                : 'bg-[#FDF6F5] hover:bg-[#A25B74]/20 text-[#A25B74] border border-[#F0DDE2]'
            }`}
          >
            {isPlayingBriefing ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#A25B74]" />}
            <span>
              {isPlayingBriefing ? t("dashboard.audioBriefingStop") : t("dashboard.audioBriefingStart")}
            </span>
          </button>

          <span className="flex items-center bg-[#FDF6F5] px-3.5 py-2.5 rounded-xl border border-[#F0DDE2]">
            <Calendar className="w-4 h-4 mr-1.5 text-[#A25B74]" />
            <span className="font-bold text-[#3B2A33]">{todayFormatted}</span>
          </span>
          <span className="flex items-center bg-[#FDF6F5] px-3.5 py-2.5 rounded-xl border border-[#F0DDE2]">
            <MapPin className="w-4 h-4 mr-1.5 text-[#A25B74]" />
            <span>{t("common.mandyaSector")}</span>
          </span>

          <span className="flex items-center bg-[#FDF6F5] px-3.5 py-2.5 rounded-xl border border-[#F0DDE2]">
            {stats.pendingSync > 0 ? (
              <span className="flex items-center text-[#B94A58] font-bold">
                <Clock className="w-4 h-4 mr-1.5 text-[#B94A58] animate-pulse" />
                <span>{stats.pendingSync} Pending Sync</span>
              </span>
            ) : (
              <span className="flex items-center text-[#477A60] font-bold">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-[#477A60]" />
                <span>PHC Sync: Active</span>
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => onStartRecording()}
          className="p-3.5 rounded-2xl bg-white border border-[#F0DDE2] shadow-sm hover:shadow-md hover:border-[#A25B74] transition-all flex flex-col items-center text-center group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FDF6F5] text-[#A25B74] flex items-center justify-center mb-2 group-hover:bg-[#A25B74] group-hover:text-white transition-colors">
            <Mic className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#3B2A33]">{t("dashboard.quickVoiceVisit")}</span>
          <span className="text-[10px] text-[#C47A92]">{t("common.live")}</span>
        </button>

        <button
          onClick={() => onNavigate('route')}
          className="p-3.5 rounded-2xl bg-white border border-[#F0DDE2]/70 shadow-sm hover:shadow-md hover:border-[#A25B74] transition-all flex flex-col items-center text-center group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-[#FDF6F5] text-[#A25B74] flex items-center justify-center mb-2 group-hover:bg-[#A25B74] group-hover:text-white transition-colors">
            <Navigation className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#3B2A33]">{t("dashboard.quickRoute")}</span>
          <span className="text-[10px] text-[#C47A92]">{t("route.optimizedBadge")}</span>
        </button>

        <button
          onClick={() => onNavigate('maternal')}
          className="p-3.5 rounded-2xl bg-white border border-[#F0DDE2]/70 shadow-sm hover:shadow-md hover:border-pink-400 transition-all flex flex-col items-center text-center group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-2 group-hover:bg-pink-500 group-hover:text-white transition-colors">
            <Baby className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#3B2A33]">{t("dashboard.quickMaternal")}</span>
          <span className="text-[10px] text-[#C47A92]">{t("maternal.mothersDirectory")}</span>
        </button>

        <button
          onClick={() => onNavigate('incentives')}
          className="p-3.5 rounded-2xl bg-white border border-[#F0DDE2]/70 shadow-sm hover:shadow-md hover:border-amber-400 transition-all flex flex-col items-center text-center group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:bg-amber-500 group-hover:text-white transition-colors">
            <IndianRupee className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#3B2A33]">{t("dashboard.quickIncentives")}</span>
          <span className="text-[10px] text-[#C47A92]">₹6,850</span>
        </button>

        <button
          onClick={() => onNavigate('beneficiaries')}
          className="p-3.5 rounded-2xl bg-white border border-[#F0DDE2]/70 shadow-sm hover:shadow-md hover:border-[#477A60] transition-all flex flex-col items-center text-center group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-[#477A60]/10 text-[#477A60] flex items-center justify-center mb-2 group-hover:bg-[#477A60] group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#3B2A33]">{t("dashboard.quickBeneficiaries")}</span>
          <span className="text-[10px] text-[#C47A92]">{formatNumber(stats.totalBeneficiaries)}</span>
        </button>

        <button
          onClick={() => onNavigate('emergency')}
          className="p-3.5 rounded-2xl bg-white border border-[#B94A58]/30 shadow-sm hover:shadow-md hover:border-[#B94A58] transition-all flex flex-col items-center text-center group active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-[#B94A58]/10 text-[#B94A58] flex items-center justify-center mb-2 group-hover:bg-[#B94A58] group-hover:text-white transition-colors">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[#B94A58]">{t("dashboard.quickEmergency")}</span>
          <span className="text-[10px] text-[#C47A92]">108 SOS</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 2. MAIN HERO SECTION: PREMIUM AI VOICE ASSISTANT CARD        */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-br from-[#A25B74] via-[#84455C] to-[#5C2B3E] text-white rounded-3xl p-6 lg:p-8 shadow-card relative overflow-hidden border border-[#E9B9C8]/30">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>AI4Bharat Indic-Transcribe & Indic-Speak</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#477A60]/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-400/30">
                ● 16kHz VAD Active
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-xs font-mono font-medium">
                Latency: ~250ms
              </span>
            </div>

            <div>
              <h2 className="text-2xl lg:text-3xl font-bold leading-tight text-white">
                {t("dashboard.aiVoiceHeroTitle")}
              </h2>
              <p className="text-sm text-white/90 font-normal mt-1.5 max-w-2xl leading-relaxed">
                {t("dashboard.aiVoiceHeroSubtitle")}
              </p>
            </div>

            {/* Quick Evaluation Scenario Chips */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-white/80 font-bold block mb-2">
                {t("dashboard.evalPresetsTitle")}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onStartRecording('anc_routine')}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-decelerate active:scale-95 flex items-center space-x-1.5"
                >
                  <span>{t("dashboard.presetAnc")}</span>
                </button>
                <button
                  onClick={() => onStartRecording('child_immunization')}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-decelerate active:scale-95 flex items-center space-x-1.5"
                >
                  <span>{t("dashboard.presetImmunization")}</span>
                </button>
                <button
                  onClick={() => onStartRecording('danger_sign_emergency')}
                  className="px-3 py-2 rounded-xl bg-[#B94A58]/30 hover:bg-[#B94A58]/50 border border-red-400/50 text-xs font-bold text-red-200 transition-decelerate active:scale-95 flex items-center space-x-1.5"
                >
                  <span>{t("dashboard.presetDanger")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Circular Animated Microphone & Start CTA */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-36 h-36 rounded-full bg-white/20 animate-ping pointer-events-none"></div>
              <div className="absolute w-28 h-28 rounded-full bg-white/30 animate-pulse pointer-events-none"></div>
              
              <button
                onClick={() => onStartRecording()}
                className="relative z-10 w-24 h-24 rounded-full bg-white text-[#A25B74] flex flex-col items-center justify-center shadow-lg active:scale-95 transition-decelerate border-4 border-white/20 hover:scale-105"
                title={t("voice.startListening")}
              >
                <Mic className="w-9 h-9" />
              </button>
            </div>

            <div className="flex items-center justify-center space-x-1.5 h-6">
              <span className="w-1 bg-white rounded-full animate-soundwave" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-1 bg-[#E9B9C8] rounded-full animate-soundwave" style={{ animationDelay: '0.3s' }}></span>
              <span className="w-1 bg-[#FDF6F5] rounded-full animate-soundwave" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1 bg-white rounded-full animate-soundwave" style={{ animationDelay: '0.5s' }}></span>
              <span className="w-1 bg-[#E9B9C8] rounded-full animate-soundwave" style={{ animationDelay: '0.4s' }}></span>
            </div>

            <button
              onClick={() => onStartRecording()}
              className="w-full bg-white hover:bg-[#FDF6F5] text-[#A25B74] font-bold py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center space-x-2.5 text-sm active:scale-95 transition-decelerate"
            >
              <Mic className="w-4 h-4" />
              <span className="text-base">{t("voice.startListening")}</span>
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
          className="bg-white p-5 rounded-3xl border border-[#F0DDE2] shadow-card hover:shadow-lg hover:border-[#A25B74] transition-decelerate cursor-pointer active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#FDF6F5] text-[#A25B74] flex items-center justify-center group-hover:bg-[#A25B74] group-hover:text-white transition-decelerate">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-[#477A60] font-mono bg-[#E8F7F1] px-2.5 py-1 rounded-full border border-[#C8EEDD] flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12%</span>
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl lg:text-4xl font-bold text-[#3B2A33] font-mono leading-none tracking-tight">
              {formatNumber(stats.totalBeneficiaries)}
            </div>
            <div className="text-sm font-bold text-[#3B2A33] mt-1.5">
              {t("dashboard.statBeneficiaries")}
            </div>
            <div className="text-[11px] text-[#A25B74] font-semibold mt-2 pt-2 border-t border-[#F0DDE2] flex items-center justify-between">
              <span>ANC: 14 • {t("beneficiaries.tabInfants")}: 22</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#C47A92] group-hover:translate-x-1 transition-decelerate" />
            </div>
          </div>
        </div>

        {/* KPI 2: Today's Home Visits */}
        <div 
          onClick={() => onNavigate('beneficiaries')}
          className="bg-white p-5 rounded-3xl border border-[#F0DDE2] shadow-card hover:shadow-lg hover:border-[#477A60] transition-decelerate cursor-pointer active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F7F1] text-[#477A60] flex items-center justify-center group-hover:bg-[#477A60] group-hover:text-white transition-decelerate">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-[#477A60] font-mono bg-[#E8F7F1] px-2.5 py-1 rounded-full border border-[#C8EEDD]">
              100% {t("common.completed")}
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl lg:text-4xl font-bold text-[#477A60] font-mono leading-none tracking-tight">
              {formatNumber(stats.todayVisits)}
            </div>
            <div className="text-sm font-bold text-[#3B2A33] mt-1.5">
              {t("dashboard.statVisitsToday")}
            </div>
            <div className="text-[11px] text-[#477A60] font-semibold mt-2 pt-2 border-t border-[#F0DDE2] flex items-center justify-between">
              <span>{t("common.due")}: 6</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#C47A92] group-hover:translate-x-1 transition-decelerate" />
            </div>
          </div>
        </div>

        {/* KPI 3: Pending Follow-ups */}
        <div 
          onClick={() => onNavigate('followups')}
          className="bg-white p-5 rounded-3xl border border-[#F0DDE2] shadow-card hover:shadow-lg hover:border-amber-400 transition-decelerate cursor-pointer active:scale-[0.98] group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-decelerate">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-amber-700 font-mono bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {t("common.pending")}
            </span>
          </div>

          <div className="mt-4">
            <div className="text-3xl lg:text-4xl font-bold text-amber-700 font-mono leading-none tracking-tight">
              {formatNumber(stats.pendingFollowups)}
            </div>
            <div className="text-sm font-bold text-[#3B2A33] mt-1.5">
              {t("dashboard.statFollowupsDue")}
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-2 pt-2 border-t border-[#F0DDE2] flex items-center justify-between">
              <span>{t("common.overdue")}: 2</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#C47A92] group-hover:translate-x-1 transition-decelerate" />
            </div>
          </div>
        </div>

        {/* KPI 4: Emergency Referrals */}
        <div 
          onClick={() => onNavigate('emergency')}
          className={`p-5 rounded-3xl border shadow-card transition-decelerate cursor-pointer active:scale-[0.98] group ${
            stats.emergencyReferrals > 0 
              ? 'bg-[#FCF1F1]/70 border-red-300 hover:border-red-500' 
              : 'bg-white border-[#F0DDE2] hover:border-[#A25B74]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-decelerate ${
              stats.emergencyReferrals > 0 
                ? 'bg-[#B94A58] text-white animate-pulse shadow-emergency' 
                : 'bg-[#FDF6F5] text-[#7A6670]'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className={`text-[11px] font-bold font-mono px-2.5 py-1 rounded-full border ${
              stats.emergencyReferrals > 0 
                ? 'bg-[#B94A58] text-white border-red-400' 
                : 'bg-[#FDF6F5] text-[#3B2A33] border-[#F0DDE2]'
            }`}>
              108 Alert
            </span>
          </div>

          <div className="mt-4">
            <div className={`text-3xl lg:text-4xl font-bold font-mono leading-none tracking-tight ${
              stats.emergencyReferrals > 0 ? 'text-[#B94A58]' : 'text-[#3B2A33]'
            }`}>
              {formatNumber(stats.emergencyReferrals)}
            </div>
            <div className="text-sm font-bold text-[#3B2A33] mt-1.5">
              {t("dashboard.statEmergencies")}
            </div>
            <div className="text-[11px] font-semibold mt-2 pt-2 border-t border-[#F0DDE2] flex items-center justify-between text-[#B94A58]">
              <span>{stats.emergencyReferrals > 0 ? t("common.emergency") : t("common.all")}</span>
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
        <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                <Baby className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#3B2A33]">
                  {t("dashboard.maternalOverview")}
                </h3>
                <p className="text-xs text-[#C47A92] font-medium">{t("dashboard.maternalSubtext")}</p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('maternal')}
              className="text-xs font-bold text-pink-700 hover:text-pink-800 flex items-center space-x-1 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-200"
            >
              <span>{t("common.viewDetails")}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Risk Distribution Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#3B2A33]">
              <span>{t("dashboard.riskDistribution")}:</span>
              <span className="font-mono text-[11px] text-[#7A6670]">14 Enrolled Mothers</span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Low Risk */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-[#477A60] flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-[#477A60] inline-block"></span>
                    <span>{t("common.lowRisk")}</span>
                  </span>
                  <span className="font-mono font-bold text-[#3B2A33]">10 (72%)</span>
                </div>
                <div className="w-full bg-[#FDF6F5] rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#477A60] h-full rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>

              {/* Moderate Risk */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-amber-700 flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                    <span>{t("common.moderateRisk")}</span>
                  </span>
                  <span className="font-mono font-bold text-[#3B2A33]">3 (21%)</span>
                </div>
                <div className="w-full bg-[#FDF6F5] rounded-full h-2.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '21%' }}></div>
                </div>
              </div>

              {/* High Risk */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-[#B94A58] flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-[#B94A58] inline-block"></span>
                    <span>{t("common.highRisk")}</span>
                  </span>
                  <span className="font-mono font-bold text-[#B94A58]">1 (7%)</span>
                </div>
                <div className="w-full bg-[#FDF6F5] rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#B94A58] h-full rounded-full" style={{ width: '7%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Pregnancy Progress Visualization (Trimester Cohorts) */}
          <div className="p-4 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] space-y-2">
            <span className="text-xs font-bold text-[#3B2A33] block">
              {t("dashboard.trimesterProgress")}:
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-white rounded-xl border border-[#F0DDE2]">
                <span className="text-[10px] text-[#C47A92] block font-medium">{t("dashboard.trimester1")}</span>
                <span className="text-base font-bold text-[#A25B74] font-mono">3</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-[#F0DDE2]">
                <span className="text-[10px] text-[#C47A92] block font-medium">{t("dashboard.trimester2")}</span>
                <span className="text-base font-bold text-[#A25B74] font-mono">7</span>
              </div>
              <div className="p-2 bg-white rounded-xl border border-[#F0DDE2]">
                <span className="text-[10px] text-[#C47A92] block font-medium">{t("dashboard.trimester3")}</span>
                <span className="text-base font-bold text-pink-700 font-mono">4</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Child Immunization Statistics & Vaccination Completion */}
        <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FDF6F5] text-[#A25B74] flex items-center justify-center">
                <Syringe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#3B2A33]">
                  {t("immunization.title")}
                </h3>
                <p className="text-xs text-[#C47A92] font-medium">{t("immunization.subtitle")}</p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-[#477A60] bg-[#E8F7F1] px-2.5 py-1 rounded-full border border-[#C8EEDD]">
              88% {t("common.completed")}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#3B2A33]">
              <span>{t("immunization.vaccineSchedule")}:</span>
              <span className="font-mono text-[11px] text-[#7A6670]">22 Eligible Infants</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-[#3B2A33]">{t("immunization.birthDoses")}</span>
                  <span className="font-mono font-bold text-[#477A60]">96% (21/22)</span>
                </div>
                <div className="w-full bg-[#FDF6F5] rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#477A60] h-full rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-[#3B2A33]">{t("immunization.weeks6")}</span>
                  <span className="font-mono font-bold text-[#A25B74]">91% (20/22)</span>
                </div>
                <div className="w-full bg-[#FDF6F5] rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#A25B74] h-full rounded-full" style={{ width: '91%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold text-[#3B2A33]">{t("immunization.months9")}</span>
                  <span className="font-mono font-bold text-amber-700">82% (18/22)</span>
                </div>
                <div className="w-full bg-[#FDF6F5] rounded-full h-2.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] space-y-2">
            <span className="text-xs font-bold text-[#3B2A33] block">
              {t("dashboard.followupsDueTitle")}:
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-[#F0DDE2]">
                <span className="font-bold text-[#3B2A33]">Baby Ananya (6w)</span>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Pentavalent-1 {t("common.due")}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-[#F0DDE2]">
                <span className="font-bold text-[#3B2A33]">Baby Aarav (6m)</span>
                <span className="font-mono font-bold text-[#477A60] bg-[#E8F7F1] px-2 py-0.5 rounded border border-[#C8EEDD]">
                  OPV-3 {t("common.completed")} ✓
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
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E8F7F1] text-[#477A60] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#3B2A33]">
                  {t("dashboard.recentVisitsTitle")}
                </h3>
                <p className="text-xs text-[#C47A92] font-medium">{t("structuredRecord.subtitle")}</p>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('beneficiaries')}
              className="text-xs font-bold text-[#A25B74] hover:text-[#84455C] flex items-center space-x-1"
            >
              <span>{t("common.all")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Visits Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F0DDE2] text-[11px] font-bold text-[#C47A92] uppercase tracking-wider font-mono">
                  <th className="pb-3 font-semibold">{t("common.beneficiary")}</th>
                  <th className="pb-3 font-semibold">{t("structuredRecord.visitType")}</th>
                  <th className="pb-3 font-semibold">{t("common.weight")}</th>
                  <th className="pb-3 font-semibold">{t("common.status")}</th>
                  <th className="pb-3 font-semibold text-right">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0DDE2]">
                {recentVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-[#FDF6F5] transition-decelerate">
                    <td className="py-3.5 pr-2">
                      <div className="font-bold text-[#3B2A33] text-[13px]">
                        {visit.beneficiary_name}
                      </div>
                      <div className="text-[10px] text-[#C47A92] font-mono">
                        {visit.beneficiary_id}
                      </div>
                    </td>
                    <td className="py-3.5 pr-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FDF6F5] text-[#A25B74] font-bold text-[10px] border border-[#F0DDE2]">
                        {visit.visit_type}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 font-mono font-bold text-[#3B2A33]">
                      {visit.weight ? `${visit.weight} kg` : 'N/A'}
                    </td>
                    <td className="py-3.5 pr-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#E8F7F1] text-[#477A60] font-bold text-[10px] border border-[#C8EEDD]">
                        {t("common.verified")}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => onStartRecording(visit.beneficiary_id)}
                        className="text-xs font-bold text-[#A25B74] hover:text-[#A25B74] flex items-center justify-end space-x-1"
                      >
                        <Mic className="w-3 h-3" />
                        <span>{t("common.startVisit")}</span>
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
          <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h3 className="font-bold text-xs text-[#3B2A33]">
                  {t("dashboard.followupsDueTitle")}
                </h3>
              </div>
              <button 
                onClick={() => onNavigate('followups')}
                className="text-xs font-bold text-[#A25B74] hover:underline flex items-center"
              >
                {t("common.all")} ({todayFollowups.length}) <ChevronRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            <div className="space-y-2">
              {todayFollowups.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] space-y-1.5 hover:border-pink-300 transition-decelerate"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#3B2A33] block">
                        {item.beneficiary_name}
                      </span>
                      <span className="text-[10px] text-[#7A6670] font-medium">
                        {item.type}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#FDF6F5] text-[#A25B74] border border-[#F0DDE2]">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#C47A92] font-medium pt-1 border-t border-[#F0DDE2]">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-[#A25B74]" />
                      {item.village}
                    </span>
                    <button
                      onClick={() => onStartRecording(item.beneficiary_id)}
                      className="text-[#A25B74] font-bold hover:underline flex items-center space-x-0.5"
                    >
                      <Mic className="w-3 h-3" />
                      <span>{t("common.startVisit")}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Community Visit Requests from Public Portal */}
          <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#A25B74] flex items-center justify-center font-bold">
                  🌸
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#3B2A33] leading-tight">
                    {t("dashboard.communityRequestsTitle")}
                  </h4>
                  <span className="text-[10px] text-[#C47A92] font-medium">({communityRequests.length})</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-[#A25B74] border border-rose-200">
                {communityRequests.filter(r => r.status === 'PENDING').length} {t("common.pending")}
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {communityRequests.length === 0 ? (
                <div className="text-center py-4 text-xs text-[#C47A92] font-medium">
                  {t("dashboard.noFollowups")}
                </div>
              ) : (
                communityRequests.slice(0, 3).map((req) => (
                  <div key={req.id} className="p-3 rounded-2xl bg-[#FDF6F5] border border-rose-100 space-y-1.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-[#3B2A33] block">
                          {req.mother_name || req.name}
                        </span>
                        <span className="text-[10px] text-[#7A6670] font-medium">
                          {req.service_type || req.reason} • {req.village}
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                        req.status === 'CONFIRMED'
                          ? 'bg-[#E8F7F1] text-[#477A60] border border-[#C8EEDD]'
                          : 'bg-rose-50 text-[#A25B74] border border-rose-200'
                      }`}>
                        {req.status === 'CONFIRMED' ? t("common.confirmed") : t("common.pending")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-rose-100">
                      <span className="font-mono text-[#7A6670] text-[10px]">
                        📞 {req.phone}
                      </span>
                      {req.status !== 'CONFIRMED' ? (
                        <button
                          onClick={() => handleConfirmRequest(req.id)}
                          className="text-[10px] font-bold text-[#A25B74] bg-white px-2 py-0.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-decelerate"
                        >
                          {t("common.confirm")}
                        </button>
                      ) : (
                        <button
                          onClick={() => onStartRecording(req.id)}
                          className="text-[10px] font-bold text-[#A25B74] hover:underline flex items-center space-x-0.5"
                        >
                          <Mic className="w-3 h-3 mr-0.5" />
                          <span>{t("common.startVisit")}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 108 Ambulance Dispatch Simulator Widget */}
          <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#B94A58] text-white flex items-center justify-center">
                  <Ambulance className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#3B2A33] leading-tight">
                    {t("ambulance.title")}
                  </h4>
                  <span className="text-[10px] text-[#C47A92] font-medium">{t("common.live")}</span>
                </div>
              </div>

              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#B94A58] text-white animate-pulse">
                {ambulanceInfo?.status || t("ambulance.statusAssigned")}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#7A6670] font-medium">{t("ambulance.eta")}:</span>
                <span className="font-bold text-[#477A60] font-mono">
                  {ambulanceInfo?.eta_minutes ?? 8} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7A6670] font-medium">{t("ambulance.vehicleNumber")}:</span>
                <span className="font-bold font-mono text-[#A25B74]">
                  {ambulanceInfo?.vehicle_number || 'KA-11-G-1081'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7A6670] font-medium">{t("ambulance.driverName")}:</span>
                <span className="font-bold text-[#3B2A33]">
                  {ambulanceInfo?.driver_name || 'Ramesh Gowda'}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('ambulance')}
              className="w-full bg-[#FDF6F5] hover:bg-[#F9ECEC] text-[#A25B74] font-bold py-2.5 px-3 rounded-xl border border-[#F0DDE2] text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-decelerate"
            >
              <span>{t("ambulance.title")}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Emergency Helpline Shortcuts */}
          <div className="bg-gradient-to-br from-[#84455C] to-[#A25B74] text-white rounded-3xl p-5 shadow-card space-y-3 border border-[#A25B74]/30">
            <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-300" />
              <span>{t("emergency.hospitalContact")}</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-[#B94A58] text-white flex items-center justify-center font-bold text-[10px]">
                    108
                  </div>
                  <span className="font-bold">{t("ambulance.title")}</span>
                </div>
                <button
                  onClick={() => window.open('tel:108', '_self')}
                  className="text-xs font-bold font-mono bg-white/20 px-2.5 py-1 rounded-lg border border-white/30 hover:bg-white/30 text-white"
                >
                  {t("emergency.callAmbulance")}
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-lg bg-[#477A60] text-white flex items-center justify-center font-bold text-[10px]">
                    104
                  </div>
                  <span className="font-bold">Health Helpline (104)</span>
                </div>
                <button
                  onClick={() => window.open('tel:104', '_self')}
                  className="text-xs font-bold font-mono bg-white/20 px-2.5 py-1 rounded-lg border border-white/30 hover:bg-white/30 text-white"
                >
                  {t("common.actions")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
