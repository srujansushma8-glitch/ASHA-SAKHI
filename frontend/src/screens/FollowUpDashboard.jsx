import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  MapPin, 
  Search, 
  Mic, 
  RotateCcw, 
  Check, 
  CalendarCheck,
  TrendingUp,
  BarChart2,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function FollowUpDashboard({
  onStartVoiceVisit, 
  onSelectBeneficiary 
}) {
  const { language, t, dir, isRtl, langInfo } = useLanguage();
  const [followups, setFollowups] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'upcoming', 'missed', 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadFollowups();
  }, []);

  const loadFollowups = async () => {
    try {
      setLoading(true);
      const data = await api.getFollowups();
      setFollowups(data);
    } catch (err) {
      console.error('[FollowUpDashboard] Load error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (item) => {
    try {
      await api.updateFollowup(item.id, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });
      loadFollowups();
      setToastMessage(t('followup.completedToast', { name: item.beneficiary_name }));
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReschedule = async (item) => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dateStr = nextWeek.toISOString().split('T')[0];

    await api.updateFollowup(item.id, {
      due_date: dateStr,
      status: 'upcoming'
    });
    loadFollowups();
    setToastMessage(t('followup.rescheduledToast', { date: dateStr }));
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredItems = followups.filter(item => {
    const matchesTab = item.status === activeTab;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      item.beneficiary_name.toLowerCase().includes(q) ||
      (item.beneficiary_name_kn && item.beneficiary_name_kn.includes(searchQuery)) ||
      item.village.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const counts = {
    pending: followups.filter(f => f.status === 'pending').length,
    upcoming: followups.filter(f => f.status === 'upcoming').length,
    missed: followups.filter(f => f.status === 'missed').length
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12" dir={dir}>
      {/* 1. Header */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-[#F0DDE2] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF9EF] text-[#B88745] flex items-center justify-center font-bold">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg lg:text-xl font-bold text-[#3B2A33] leading-tight font-serif">
                {t('followup.title')}
              </h1>
              <span className="text-xs font-mono font-bold bg-[#FDF6F5] text-[#A25B74] px-2.5 py-0.5 rounded-full border border-[#F0DDE2]">
                {t('common.all')}: {followups.length}
              </span>
            </div>
            <p className="text-xs text-[#7A6670] font-medium mt-0.5">
              {t('followup.subtitle')}
            </p>
          </div>
        </div>

        {/* Statistical Summary Pills */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-[#E8F7F1] text-[#477A60] font-bold border border-[#C8EEDD] flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t('followup.completionRate')}</span>
          </span>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-[#477A60] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-card flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Full-Width Search & Filter Chips */}
      <div className="bg-white rounded-3xl p-4 lg:p-5 border border-[#F0DDE2] shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#C47A92] absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('followup.searchPlaceholder')}
            className="w-full text-xs font-medium pl-10 pr-4 py-3 bg-[#FDF6F5] border border-[#F0DDE2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A25B74] focus:bg-white transition-decelerate"
          />
        </div>

        {/* Tab Selectors */}
        <div className="flex bg-[#FDF6F5] p-1 rounded-2xl border border-[#F0DDE2] overflow-x-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-decelerate active:scale-95 whitespace-nowrap ${
              activeTab === 'pending'
                ? 'bg-[#A25B74] text-white shadow-touch'
                : 'text-[#7A6670] hover:text-[#3B2A33]'
            }`}
          >
            {t('followup.pendingTab', { count: counts.pending })}
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-decelerate active:scale-95 whitespace-nowrap ${
              activeTab === 'upcoming'
                ? 'bg-[#A25B74] text-white shadow-touch'
                : 'text-[#7A6670] hover:text-[#3B2A33]'
            }`}
          >
            {t('followup.upcomingTab', { count: counts.upcoming })}
          </button>
          <button
            onClick={() => setActiveTab('missed')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-decelerate active:scale-95 whitespace-nowrap ${
              activeTab === 'missed'
                ? 'bg-[#B94A58] text-white shadow-md'
                : 'text-[#7A6670] hover:text-[#3B2A33]'
            }`}
          >
            {t('followup.missedTab', { count: counts.missed })}
          </button>
        </div>
      </div>

      {/* 3. Responsive Multi-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card hover:border-[#A25B74] hover:shadow-card-hover transition-decelerate flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#3B2A33] leading-tight font-serif">
                      {language === 'kn' ? (item.beneficiary_name_kn || item.beneficiary_name) : item.beneficiary_name}
                    </h3>
                    <p className="text-xs font-semibold text-[#A25B74] mt-0.5">{item.type}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#B88745] bg-[#FEF9EF] px-2.5 py-1 rounded-xl border border-amber-200">
                    {item.due_date}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FDF6F5] text-[#A25B74] font-bold text-[11px] border border-[#F0DDE2]">
                    {item.category}
                  </span>
                  <span className="text-[#C47A92] font-mono text-[11px]">ID: {item.beneficiary_id}</span>
                </div>

                <p className="text-xs text-[#7A6670] flex items-center font-medium pt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-[#A25B74] shrink-0" />
                  {item.village}
                </p>

                {item.notes && (
                  <p className="text-[11px] text-[#7A6670] bg-[#FDF6F5] p-2.5 rounded-xl border border-[#F0DDE2]">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-3 border-t border-[#F0DDE2]">
                <button
                  onClick={() => onStartVoiceVisit && onStartVoiceVisit(item.beneficiary_id)}
                  className="flex-1 bg-[#A25B74] hover:bg-[#84455C] text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-touch flex items-center justify-center space-x-1.5 active:scale-95 transition-decelerate"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{t('followup.voiceVisitBtn')}</span>
                </button>

                <button
                  onClick={() => handleMarkCompleted(item)}
                  className="p-2.5 rounded-xl border border-[#C8EEDD] text-[#477A60] hover:bg-[#E8F7F1] active:scale-95 transition-decelerate"
                  title={t('followup.markCompleted')}
                >
                  <Check className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleReschedule(item)}
                  className="p-2.5 rounded-xl border border-[#F0DDE2] text-[#3B2A33] hover:bg-[#FDF6F5] active:scale-95 transition-decelerate"
                  title={t('followup.reschedule')}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-3xl p-10 text-center border border-[#F0DDE2] shadow-card">
            <CheckCircle2 className="w-12 h-12 text-[#477A60] mx-auto mb-2" />
            <h4 className="text-base font-bold text-[#3B2A33] font-serif">
              {t('followup.noItems')}
            </h4>
            <p className="text-xs text-[#C47A92] mt-1">All visits in this category are up to date.</p>
          </div>
        )}
      </div>
    </div>
  );
}
