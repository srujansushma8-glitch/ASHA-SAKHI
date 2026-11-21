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
  UserPlus
} from 'lucide-react';
import { api } from '../services/api';

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
        todayVisits: todayVisitsCount || visits.length,
        pendingFollowups: pendingCount,
        emergencyReferrals: emergencyAlerts.length
      });

      setRecentVisits(visits.slice(0, 3));
      setTodayFollowups(followups.slice(0, 3));
    } catch (err) {
      console.error('[HomeDashboard] Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto px-4 pt-3 animate-fade-in">
      {/* 1. Personalized Welcome Section */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-card flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-mint-surface text-primary text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-healthcare"></span>
            <span>ಆಶಾ ಕಾರ್ಯಕರ್ತೆ ದಿನಚರಿ • ASHA SAKHI</span>
          </div>
          <h2 className="text-xl font-bold font-kannada text-navy leading-snug">
            ನಮಸ್ಕಾರ, ಶಾರದಾ ಬಾಯಿ
          </h2>
          <p className="text-xs text-navy-500 flex items-center font-medium">
            <MapPin className="w-3.5 h-3.5 mr-1 text-primary shrink-0" />
            <span>ಶಿವಳ್ಳಿ & ಕೆರೆಗೋಡು ಉಪಕೇಂದ್ರ (Mandya Sector 4)</span>
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
          <span className="text-2xl" role="img" aria-label="Healthcare worker">👩‍⚕️</span>
        </div>
      </div>

      {/* 2. Prominent Start Voice Visit Button (Visual Hero) */}
      <div className="bg-primary rounded-2xl p-5 text-white shadow-touch relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-mint-surface text-primary text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>AI4Bharat Indic-Transcribe ಸಕ್ರಿಯವಾಗಿದೆ</span>
          </div>
          
          <h3 className="text-lg font-bold font-kannada text-white leading-tight">
            ಹೊಸ ಮನೆ ಭೇಟಿ ಧ್ವನಿ ಮೂಲಕ ನಮೂದಿಸಿ
          </h3>
          <p className="text-xs text-mint-surface/90 font-medium leading-relaxed max-w-sm">
            ಕನ್ನಡ ಮತ್ತು ವೈದ್ಯಕೀಯ ಪದಗಳೊಂದಿಗೆ ಮಾತನಾಡಿ. ತಾಯಿ-ಮಗು ತೂಕ, ಲಸಿಕೆ ಹಾಗೂ ಅಪಾಯಕಾರಿ ಲಕ್ಷಣಗಳನ್ನು ತಾನಾಗಿಯೇ ದಾಖಲಿಸುತ್ತದೆ.
          </p>

          <button
            onClick={onStartRecording}
            className="mt-3 w-full bg-white hover:bg-ivory-bg text-primary font-bold py-3.5 px-4 rounded-xl shadow-card flex items-center justify-center space-x-2.5 active:scale-[0.98] transition-decelerate touch-manipulation"
          >
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <span className="text-base font-kannada font-bold">
              ಧ್ವನಿ ಭೇಟಿ ಪ್ರಾರಂಭಿಸಿ (Start Voice Visit)
            </span>
          </button>
        </div>
      </div>

      {/* 3. Beneficiary Statistics Grid (Nested Radii) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Beneficiaries */}
        <div 
          onClick={() => onNavigate('beneficiaries')}
          className="bg-white p-3.5 rounded-2xl border border-navy-100 shadow-subtle hover:border-primary-200 transition-decelerate cursor-pointer active:scale-[0.98] touch-manipulation"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-navy-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-navy leading-none font-mono">
              {stats.totalBeneficiaries}
            </div>
            <div className="text-xs font-semibold text-navy mt-1 font-kannada">
              ಒಟ್ಟು ಫಲಾನುಭವಿಗಳು
            </div>
            <div className="text-[10px] text-navy-400 font-medium">Total Beneficiaries</div>
          </div>
        </div>

        {/* Today's Visits */}
        <div 
          onClick={() => onNavigate('beneficiaries')}
          className="bg-white p-3.5 rounded-2xl border border-navy-100 shadow-subtle hover:border-healthcare-200 transition-decelerate cursor-pointer active:scale-[0.98] touch-manipulation"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-healthcare-50 text-healthcare flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-navy-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-healthcare leading-none font-mono">
              {stats.todayVisits}
            </div>
            <div className="text-xs font-semibold text-navy mt-1 font-kannada">
              ಇಂದಿನ ಭೇಟಿಗಳು
            </div>
            <div className="text-[10px] text-navy-400 font-medium">Today Visits Completed</div>
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div 
          onClick={() => onNavigate('followups')}
          className="bg-white p-3.5 rounded-2xl border border-navy-100 shadow-subtle hover:border-warning-200 transition-decelerate cursor-pointer active:scale-[0.98] touch-manipulation"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-warning-50 text-warning-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-navy-400" />
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-warning-700 leading-none font-mono">
              {stats.pendingFollowups}
            </div>
            <div className="text-xs font-semibold text-navy mt-1 font-kannada">
              ಬಾಕಿ ಇರುವ ಭೇಟಿಗಳು
            </div>
            <div className="text-[10px] text-navy-400 font-medium">Pending Follow-ups</div>
          </div>
        </div>

        {/* Emergency Referrals (Reserved Emergency Red) */}
        <div 
          onClick={() => onNavigate('emergency')}
          className={`p-3.5 rounded-2xl border shadow-subtle transition-decelerate cursor-pointer active:scale-[0.98] touch-manipulation ${
            stats.emergencyReferrals > 0
              ? 'bg-emergency-50 border-emergency-200 hover:border-emergency-500'
              : 'bg-white border-navy-100 hover:border-navy-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              stats.emergencyReferrals > 0 ? 'bg-emergency text-white animate-pulse' : 'bg-navy-50 text-navy-500'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <ChevronRight className={`w-4 h-4 ${stats.emergencyReferrals > 0 ? 'text-emergency' : 'text-navy-400'}`} />
          </div>
          <div className="mt-2.5">
            <div className={`text-2xl font-bold leading-none font-mono ${
              stats.emergencyReferrals > 0 ? 'text-emergency' : 'text-navy'
            }`}>
              {stats.emergencyReferrals}
            </div>
            <div className="text-xs font-semibold text-navy mt-1 font-kannada">
              ತುರ್ತು ರೆಫರಲ್‌ಗಳು
            </div>
            <div className={`text-[10px] font-medium ${stats.emergencyReferrals > 0 ? 'text-emergency' : 'text-navy-400'}`}>
              Emergency Referrals
            </div>
          </div>
        </div>
      </div>

      {/* 4. Today's Urgent Home Visits / Follow-ups */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-subtle">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-navy font-kannada flex items-center">
            <span className="w-2 h-2 rounded-full bg-warning mr-2"></span>
            ಇಂದಿನ ಮುಖ್ಯ ಭೇಟಿಗಳು (Today's Follow-up Visits)
          </h3>
          <button 
            onClick={() => onNavigate('followups')}
            className="text-xs font-semibold text-primary hover:text-primary-600 flex items-center active:scale-[0.98] transition-decelerate"
          >
            ಎಲ್ಲಾ ನೋಡಿ <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {todayFollowups.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('followups')}
              className="p-3 rounded-xl bg-ivory-bg border border-navy-100 flex items-center justify-between cursor-pointer hover:bg-navy-50 transition-decelerate active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-navy font-kannada">
                    {item.beneficiary_name_kn || item.beneficiary_name}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-mint-surface text-primary border border-primary-100">
                    {item.category}
                  </span>
                </div>
                <p className="text-[11px] text-navy-600 mt-0.5 font-medium">{item.type}</p>
                <p className="text-[10px] text-navy-400 mt-0.5 font-medium">
                  ಗ್ರಾಮ: {item.village} • ನಿಗದಿತ ದಿನಾಂಕ: {item.due_date}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-navy-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 5. Recent Activity / Completed Field Visits */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-subtle">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-navy font-kannada flex items-center">
            <CheckCircle2 className="w-4 h-4 text-healthcare mr-2" />
            ಇತ್ತೀಚಿನ ದಾಖಲೆಗಳು (Recent Completed Visits)
          </h3>
          <span className="text-[11px] text-navy-400 font-medium">ಧ್ವನಿ ಮೂಲಕ ನಮೂದಿಸಲಾದ</span>
        </div>

        <div className="space-y-2">
          {recentVisits.map((visit) => (
            <div
              key={visit.id}
              className="p-3 rounded-xl border border-navy-100 bg-white hover:bg-ivory-bg transition-decelerate"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-navy">{visit.beneficiary_name}</span>
                <span className="text-[10px] px-2 py-0.5 bg-healthcare-50 text-healthcare font-semibold rounded-full border border-healthcare-100">
                  {visit.visit_type}
                </span>
              </div>
              <p className="text-[11px] text-navy-600 mt-1 line-clamp-1 font-medium">
                {visit.additional_notes || 'ಭೇಟಿ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ.'}
              </p>
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-navy-50 text-[10px] text-navy-400 font-medium">
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
