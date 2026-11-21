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
  Check
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
    <div className="space-y-4 pb-28 max-w-2xl mx-auto px-4 pt-3 animate-fade-in">
      {/* 1. Header */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-card flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold font-kannada text-navy leading-tight">
            ಫಾಲೋ-ಅಪ್ ಭೇಟಿಗಳ ಪಟ್ಟಿ
          </h2>
          <p className="text-xs text-navy-500 font-medium">Field Visit Follow-up Schedule</p>
        </div>
        <span className="text-xs bg-mint-surface text-primary font-bold px-3 py-1 rounded-full border border-primary-200">
          ಒಟ್ಟು: {followups.length}
        </span>
      </div>

      {toastMessage && (
        <div className="bg-healthcare text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-card flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Search & Tab Filter Chips */}
      <div className="bg-white rounded-2xl p-3 border border-navy-100 shadow-subtle space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-navy-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ಹೆಸರು, ಗ್ರಾಮ ಅಥವಾ ವರ್ಗ ಹುಡುಕಿ..."
            className="w-full text-xs font-medium pl-9 pr-3 py-2 bg-ivory-bg border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-kannada"
          />
        </div>

        {/* Tab Selector */}
        <div className="flex bg-navy-50 p-1 rounded-xl border border-navy-100">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-decelerate active:scale-[0.98] ${
              activeTab === 'pending'
                ? 'bg-primary text-white shadow-subtle'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            ಬಾಕಿ ({counts.pending})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-decelerate active:scale-[0.98] ${
              activeTab === 'upcoming'
                ? 'bg-primary text-white shadow-subtle'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            ಮುಂಬರುವ ({counts.upcoming})
          </button>
          <button
            onClick={() => setActiveTab('missed')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-decelerate active:scale-[0.98] ${
              activeTab === 'missed'
                ? 'bg-emergency text-white shadow-subtle'
                : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            ತಪ್ಪಿದ ({counts.missed})
          </button>
        </div>
      </div>

      {/* 3. Follow-up Cards List */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-navy-100 shadow-card hover:border-primary-200 transition-decelerate space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-navy font-kannada">
                      {item.beneficiary_name_kn || item.beneficiary_name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-mint-surface text-primary border border-primary-100">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-navy-700 mt-0.5">{item.type}</p>
                </div>
                <span className="text-xs font-mono font-bold text-warning-700 bg-warning-50 px-2.5 py-0.5 rounded-lg border border-warning-200">
                  {item.due_date}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs text-navy-500 font-medium pt-1">
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-primary" />
                  {item.village}
                </span>
                <span>•</span>
                <span>ID: {item.beneficiary_id}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2 border-t border-navy-50">
                <button
                  onClick={() => onStartVoiceVisit(item.beneficiary_id)}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-touch flex items-center justify-center space-x-1.5 active:scale-[0.98] transition-decelerate touch-manipulation"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span className="font-kannada">ಧ್ವನಿ ಭೇಟಿ ಪ್ರಾರಂಭಿಸಿ</span>
                </button>

                <button
                  onClick={() => handleMarkCompleted(item)}
                  className="p-2.5 rounded-xl border border-healthcare-200 text-healthcare hover:bg-healthcare-50 active:scale-[0.98] transition-decelerate"
                  title="ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಿ"
                >
                  <Check className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleReschedule(item)}
                  className="p-2.5 rounded-xl border border-navy-200 text-navy hover:bg-ivory-bg active:scale-[0.98] transition-decelerate"
                  title="ಮುಂದಿನ ವಾರಕ್ಕೆ ಮುಂದೂಡಿ"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-navy-100 shadow-subtle">
            <CheckCircle2 className="w-10 h-10 text-healthcare mx-auto mb-2" />
            <h4 className="text-sm font-bold text-navy font-kannada">
              ಈ ವರ್ಗದಲ್ಲಿ ಯಾವುದೇ ಬಾಕಿ ಭೇಟಿಗಳಿಲ್ಲ
            </h4>
            <p className="text-xs text-navy-400 mt-1">All visits in this category are up to date.</p>
          </div>
        )}
      </div>
    </div>
  );
}
