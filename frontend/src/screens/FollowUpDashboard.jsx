import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Phone, 
  MapPin, 
  Search, 
  Mic, 
  Filter,
  Check,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';

export default function FollowUpDashboard({ onStartVoiceVisit, onSelectBeneficiary }) {
  const [followups, setFollowups] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'upcoming', 'missed'
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
      setToastMessage(`${item.beneficiary_name} ಅವರ ಭೇಟಿ ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ.`);
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
    setToastMessage(`ಭೇಟಿಯನ್ನು ${dateStr} ಕ್ಕೆ ಮರುನಿಗದಿಪಡಿಸಲಾಗಿದೆ.`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredItems = followups.filter(item => {
    const matchesTab = item.status === activeTab;
    const matchesSearch = 
      item.beneficiary_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.beneficiary_name_kn && item.beneficiary_name_kn.includes(searchQuery)) ||
      item.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const counts = {
    pending: followups.filter(f => f.status === 'pending').length,
    upcoming: followups.filter(f => f.status === 'upcoming').length,
    missed: followups.filter(f => f.status === 'missed').length
  };

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto px-4 pt-3">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-kannada text-navy-900 leading-tight">
            ಫಾಲೋ-ಅಪ್ ಭೇಟಿಗಳ ಪಟ್ಟಿ
          </h2>
          <p className="text-xs text-navy-500 font-mono">Follow-up Dashboard</p>
        </div>
        <span className="text-xs bg-teal-50 text-teal-800 font-bold px-3 py-1 rounded-full border border-teal-200">
          ಒಟ್ಟು: {followups.length}
        </span>
      </div>

      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tabs with badge counts */}
      <div className="flex bg-navy-100/80 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all touch-manipulation flex items-center justify-center space-x-1.5 ${
            activeTab === 'pending'
              ? 'bg-white text-amber-800 shadow-sm'
              : 'text-navy-600 hover:text-navy-900'
          }`}
        >
          <span>ಬಾಕಿ (Pending)</span>
          {counts.pending > 0 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {counts.pending}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all touch-manipulation flex items-center justify-center space-x-1.5 ${
            activeTab === 'upcoming'
              ? 'bg-white text-teal-800 shadow-sm'
              : 'text-navy-600 hover:text-navy-900'
          }`}
        >
          <span>ಮುಂದಿನ (Upcoming)</span>
          {counts.upcoming > 0 && (
            <span className="bg-teal-100 text-teal-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {counts.upcoming}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('missed')}
          className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all touch-manipulation flex items-center justify-center space-x-1.5 ${
            activeTab === 'missed'
              ? 'bg-white text-emergency-700 shadow-sm'
              : 'text-navy-600 hover:text-navy-900'
          }`}
        >
          <span>ತಪ್ಪಿದ (Missed)</span>
          {counts.missed > 0 && (
            <span className="bg-emergency-100 text-emergency-700 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {counts.missed}
            </span>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ಹೆಸರು, ಗ್ರಾಮ ಅಥವಾ ಲಸಿಕೆ ಮೂಲಕ ಹುಡುಕಿ..."
          className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
        />
      </div>

      {/* Follow-up Cards List */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-navy-100 shadow-sm hover:border-teal-200 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-navy-900 font-kannada">
                      {item.beneficiary_name_kn || item.beneficiary_name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-teal-800 mt-1">{item.type}</p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono font-bold text-navy-700 block">
                    {item.due_date}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block mt-0.5 ${
                    item.priority === 'urgent' ? 'text-emergency-600' : 'text-navy-500'
                  }`}>
                    {item.priority}
                  </span>
                </div>
              </div>

              {/* Beneficiary Details */}
              <div className="mt-3 p-2.5 rounded-xl bg-navy-50/70 border border-navy-100 text-xs text-navy-600 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-navy-400" />
                    ಗ್ರಾಮ: {item.village}
                  </span>
                  <span className="font-mono text-navy-500">ID: {item.beneficiary_id}</span>
                </div>
                {item.notes && (
                  <p className="text-[11px] text-navy-700 pt-1 border-t border-navy-100/60">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Mobile Action Controls */}
              <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-navy-100">
                <button
                  onClick={() => onStartVoiceVisit && onStartVoiceVisit(item.beneficiary_id)}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-3 rounded-xl shadow-touch text-xs flex items-center justify-center space-x-1.5 touch-manipulation"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>ಧ್ವನಿ ಭೇಟಿ (Voice Visit)</span>
                </button>

                <button
                  onClick={() => handleMarkCompleted(item)}
                  className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold text-xs flex items-center touch-manipulation"
                  title="ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಿ"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleReschedule(item)}
                  className="p-2.5 rounded-xl bg-navy-100 text-navy-700 hover:bg-navy-200 font-bold text-xs flex items-center touch-manipulation"
                  title="ಮುಂದೂಡಿ (Reschedule)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-navy-100 text-navy-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
            <p className="text-xs font-semibold text-navy-700 font-kannada">
              ಈ ವಿಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಬಾಕಿ ಭೇಟಿಗಳಿಲ್ಲ
            </p>
            <p className="text-[11px] text-navy-400 mt-0.5">
              No follow-up visits found in this tab.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
