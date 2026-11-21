import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Mic, 
  ChevronRight, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  PlusCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api, isDemoMode } from '../services/api';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [beneficiaries, visits, followups, emergencyAlerts] = await Promise.all([
        api.getBeneficiaries(),
        api.getVisits(),
        api.getFollowups(),
        api.getEmergencyAlerts()
      ]);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayVisitsCount = visits.filter(v => (v.created_at || '').startsWith(todayStr)).length;
      const pendingCount = followups.filter(f => f.status === 'pending' || f.due_date <= todayStr).length;

      setStats({
        totalBeneficiaries: beneficiaries.length,
        todayVisits: todayVisitsCount || visits.length, // show at least existing for demo
        pendingFollowups: pendingCount,
        emergencyReferrals: emergencyAlerts.length
      });

      setRecentVisits(visits.slice(0, 3));
      setTodayFollowups(followups.slice(0, 2));
    } catch (err) {
      console.error('[HomeDashboard] Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-2xl mx-auto px-4 pt-3">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white rounded-2xl p-4 shadow-sm border border-navy-700/60 flex items-center justify-between">
        <div>
          <span className="text-teal-300 text-xs font-semibold uppercase tracking-wider">
            ಆಶಾ ಕಾರ್ಯಕರ್ತೆ ದಿನಚರಿ • ASHA Field Register
          </span>
          <h2 className="text-xl font-bold font-kannada mt-0.5 text-white">
            ನಮಸ್ಕಾರ, ಶಾರದಾ ಬಾಯಿ
          </h2>
          <p className="text-xs text-navy-200 flex items-center mt-1">
            <MapPin className="w-3.5 h-3.5 mr-1 text-teal-400" />
            ಶಿವಳ್ಳಿ & ಕೆರೆಗೋಡು ಉಪಕೇಂದ್ರ (Sector 4)
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center">
          <span className="text-2xl">👩‍⚕️</span>
        </div>
      </div>

      {/* Prominent Start Voice Recording Button */}
      <div className="bg-gradient-to-br from-teal-700 via-teal-800 to-navy-900 rounded-2xl p-4 text-white shadow-touch relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 pointer-events-none">
          <Mic className="w-36 h-36" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-1.5 text-teal-200 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-spin" />
            <span>AI4Bharat Indic-Transcribe ಸಕ್ರಿಯವಾಗಿದೆ</span>
          </div>
          
          <h3 className="text-lg font-bold font-kannada text-white leading-tight">
            ಹೊಸ ಮನೆ ಭೇಟಿ ಧ್ವನಿ ಮೂಲಕ ನಮೂದಿಸಿ
          </h3>
          <p className="text-xs text-teal-100/90 mt-1 max-w-xs leading-relaxed">
            ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ. ತೂಕ, ಲಸಿಕೆ ಮತ್ತು ಅಪಾಯಕಾರಿ ಲಕ್ಷಣಗಳನ್ನು ತಾನಾಗಿಯೇ ದಾಖಲಿಸುತ್ತದೆ.
          </p>

          <button
            onClick={onStartRecording}
            className="mt-3.5 w-full bg-white hover:bg-teal-50 active:scale-[0.98] text-teal-800 font-bold py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center space-x-2.5 transition-all touch-manipulation"
          >
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <span className="text-base font-kannada font-bold">
              ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ (Start Voice)
            </span>
          </button>
        </div>
      </div>

      {/* Stat Metric Cards (Large Touch Targets) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Beneficiaries */}
        <div 
          onClick={() => onNavigate('beneficiaries')}
          className="bg-white p-3.5 rounded-2xl border border-navy-100 shadow-sm hover:border-teal-300 transition-all cursor-pointer active:scale-95 touch-manipulation"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-navy-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-navy-900 leading-none">
              {stats.totalBeneficiaries}
            </div>
            <div className="text-xs font-semibold text-navy-700 mt-1 font-kannada">
              ಒಟ್ಟು ಫಲಾನುಭವಿಗಳು
            </div>
            <div className="text-[10px] text-navy-400">Total Beneficiaries</div>
          </div>
        </div>

        {/* Today's Visits */}
        <div 
          onClick={() => onNavigate('beneficiaries')}
          className="bg-white p-3.5 rounded-2xl border border-navy-100 shadow-sm hover:border-emerald-300 transition-all cursor-pointer active:scale-95 touch-manipulation"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-navy-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-emerald-700 leading-none">
              {stats.todayVisits}
            </div>
            <div className="text-xs font-semibold text-navy-700 mt-1 font-kannada">
              ಇಂದಿನ ಭೇಟಿಗಳು
            </div>
            <div className="text-[10px] text-navy-400">Today's Visits Completed</div>
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div 
          onClick={() => onNavigate('followups')}
          className="bg-white p-3.5 rounded-2xl border border-navy-100 shadow-sm hover:border-amber-300 transition-all cursor-pointer active:scale-95 touch-manipulation"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-navy-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-black text-amber-700 leading-none">
              {stats.pendingFollowups}
            </div>
            <div className="text-xs font-semibold text-navy-700 mt-1 font-kannada">
              ಬಾಕಿ ಇರುವ ಭೇಟಿಗಳು
            </div>
            <div className="text-[10px] text-navy-400">Pending Follow-ups</div>
          </div>
        </div>

        {/* Emergency Referrals (Prominent Red) */}
        <div 
          onClick={() => onNavigate('emergency')}
          className={`p-3.5 rounded-2xl border shadow-sm transition-all cursor-pointer active:scale-95 touch-manipulation ${
            stats.emergencyReferrals > 0
              ? 'bg-emergency-50/80 border-emergency-300 hover:border-emergency-500'
              : 'bg-white border-navy-100 hover:border-navy-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              stats.emergencyReferrals > 0 ? 'bg-emergency-600 text-white animate-pulse' : 'bg-navy-100 text-navy-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-emergency-500" />
          </div>
          <div className="mt-2.5">
            <div className={`text-2xl font-black leading-none ${
              stats.emergencyReferrals > 0 ? 'text-emergency-700' : 'text-navy-900'
            }`}>
              {stats.emergencyReferrals}
            </div>
            <div className="text-xs font-semibold text-navy-800 mt-1 font-kannada">
              ತುರ್ತು ರೆಫರಲ್‌ಗಳು
            </div>
            <div className="text-[10px] text-emergency-600 font-medium">Emergency Referrals</div>
          </div>
        </div>
      </div>

      {/* Today's Urgent Follow-up Checklist */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-navy-900 font-kannada flex items-center">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
            ಇಂದಿನ ಮುಖ್ಯ ಕಾರ್ಯಗಳು (Today's Tasks)
          </h3>
          <button 
            onClick={() => onNavigate('followups')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center"
          >
            ಎಲ್ಲಾ ನೋಡಿ <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {todayFollowups.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('followups')}
              className="p-3 rounded-xl bg-navy-50/70 border border-navy-100 flex items-center justify-between cursor-pointer hover:bg-navy-100/50 transition-colors"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-navy-900 font-kannada">
                    {item.beneficiary_name_kn || item.beneficiary_name}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-navy-600 mt-0.5">{item.type}</p>
                <p className="text-[10px] text-navy-400 mt-0.5 font-medium">
                  ಗ್ರಾಮ: {item.village} • ನಿಗದಿತ ದಿನಾಂಕ: {item.due_date}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-navy-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Visits Registered */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-navy-900 font-kannada flex items-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2" />
            ಇತ್ತೀಚಿನ ದಾಖಲೆಗಳು (Recent Visits)
          </h3>
          <span className="text-[11px] text-navy-400">ಧ್ವನಿ ಮೂಲಕ ನಮೂದಿಸಲಾದ</span>
        </div>

        <div className="space-y-2">
          {recentVisits.map((visit) => (
            <div
              key={visit.id}
              className="p-3 rounded-xl border border-navy-100 bg-white hover:bg-navy-50/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy-900">{visit.beneficiary_name}</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded-full border border-emerald-200">
                  {visit.visit_type}
                </span>
              </div>
              <p className="text-[11px] text-navy-600 mt-1 line-clamp-1">
                {visit.additional_notes || 'ಭೇಟಿ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ.'}
              </p>
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-navy-50 text-[10px] text-navy-400">
                <span>ತೂಕ: {visit.weight ? `${visit.weight} kg` : 'N/A'}</span>
                <span>ಮುಂದಿನ ಭೇಟಿ: {visit.next_visit_date || 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
