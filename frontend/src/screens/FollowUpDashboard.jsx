import React, { useState, useEffect, useMemo } from 'react';
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
  FileText,
  AlertTriangle,
  Download,
  Filter,
  User,
  HeartPulse,
  Baby,
  ShieldAlert,
  X,
  RefreshCw,
  Phone
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function FollowUpDashboard({
  onStartVoiceVisit, 
  onSelectBeneficiary 
}) {
  const { language, t, dir, isRtl, langInfo } = useLanguage();
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Filters state
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'overdue', 'upcoming', 'completed'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'ANC', 'Immunization', 'High Risk', 'Newborn'
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'this_week', 'overdue'
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [beneficiaryVisits, setBeneficiaryVisits] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [rescheduleItem, setRescheduleItem] = useState(null);
  const [newDueDate, setNewDueDate] = useState('');

  useEffect(() => {
    loadFollowups();
  }, []);

  const loadFollowups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getFollowups();
      setFollowups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[FollowUpDashboard] Load error', err);
      setError('Failed to connect to records service. Showing cached or offline records.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async (item) => {
    try {
      await api.updateFollowup(item.id, {
        status: 'completed',
        completion_status: 'COMPLETED',
        completed_at: new Date().toISOString()
      });
      await loadFollowups();
      const bName = item.beneficiary_name || 'Beneficiary';
      setToastMessage(t('followup.completedToast', { name: bName }) || `Marked follow-up for ${bName} as completed.`);
      setTimeout(() => setToastMessage(''), 3500);
    } catch (err) {
      console.error('[FollowUpDashboard] Mark completed error', err);
    }
  };

  const handleOpenReschedule = (item) => {
    setRescheduleItem(item);
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setNewDueDate(d.toISOString().split('T')[0]);
  };

  const handleSaveReschedule = async () => {
    if (!rescheduleItem || !newDueDate) return;
    try {
      await api.updateFollowup(rescheduleItem.id, {
        due_date: newDueDate,
        status: 'upcoming',
        completion_status: 'PENDING'
      });
      await loadFollowups();
      setToastMessage(`Follow-up rescheduled to ${newDueDate}`);
      setTimeout(() => setToastMessage(''), 3000);
      setRescheduleItem(null);
    } catch (err) {
      console.error('[FollowUpDashboard] Reschedule error', err);
    }
  };

  const handleViewBeneficiaryHistory = async (item) => {
    setSelectedItem(item);
    setIsDetailsModalOpen(true);
    setLoadingVisits(true);
    try {
      const allVisits = await api.getVisits();
      const matched = (allVisits || []).filter(v => v.beneficiary_id === item.beneficiary_id);
      setBeneficiaryVisits(matched);
    } catch (err) {
      console.warn('[FollowUpDashboard] Error loading visits for beneficiary', err);
      setBeneficiaryVisits([]);
    } finally {
      setLoadingVisits(false);
    }
  };

  const handleExportCsv = () => {
    api.exportFollowupsCsv(filteredItems);
    setToastMessage('Report CSV exported successfully.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Filtered list computation
  const filteredItems = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const q = (searchQuery || '').toLowerCase().trim();

    return followups.filter((item) => {
      if (!item) return false;

      const itemStatus = (item.status || 'pending').toLowerCase();
      const itemCat = item.category || 'General';
      const itemDue = item.due_date || todayStr;

      // Status Tab filter
      let matchesTab = true;
      if (activeTab === 'pending') {
        matchesTab = itemStatus === 'pending' || itemStatus === 'overdue';
      } else if (activeTab === 'overdue') {
        matchesTab = itemStatus === 'overdue' || (itemStatus === 'pending' && itemDue < todayStr);
      } else if (activeTab === 'upcoming') {
        matchesTab = itemStatus === 'upcoming' || (itemStatus === 'pending' && itemDue > todayStr);
      } else if (activeTab === 'completed') {
        matchesTab = itemStatus === 'completed';
      } else if (activeTab === 'missed') {
        matchesTab = itemStatus === 'overdue' || itemStatus === 'missed';
      }

      // Category filter
      let matchesCategory = true;
      if (categoryFilter !== 'all') {
        matchesCategory = itemCat.toLowerCase() === categoryFilter.toLowerCase();
      }

      // Date filter
      let matchesDate = true;
      if (dateFilter === 'today') {
        matchesDate = itemDue === todayStr;
      } else if (dateFilter === 'overdue') {
        matchesDate = itemDue < todayStr && itemStatus !== 'completed';
      } else if (dateFilter === 'this_week') {
        const next7 = new Date();
        next7.setDate(next7.getDate() + 7);
        const next7Str = next7.toISOString().split('T')[0];
        matchesDate = itemDue >= todayStr && itemDue <= next7Str;
      }

      // Search Query filter (matches name, kn name, id, village, household, notes)
      let matchesSearch = true;
      if (q) {
        const bName = (item.beneficiary_name || '').toLowerCase();
        const bNameKn = (item.beneficiary_name_kn || '');
        const bId = (item.beneficiary_id || '').toLowerCase();
        const bVill = (item.village || '').toLowerCase();
        const bHh = (item.household_id || '').toLowerCase();
        const bNotes = (item.notes || '').toLowerCase();
        const bType = (item.type || '').toLowerCase();

        matchesSearch = 
          bName.includes(q) ||
          bNameKn.includes(q) ||
          bId.includes(q) ||
          bVill.includes(q) ||
          bHh.includes(q) ||
          bNotes.includes(q) ||
          bType.includes(q);
      }

      return matchesTab && matchesCategory && matchesDate && matchesSearch;
    });
  }, [followups, activeTab, categoryFilter, dateFilter, searchQuery]);

  // Aggregate stats computation
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const total = followups.length;
    const pending = followups.filter(f => f.status === 'pending' || f.status === 'overdue').length;
    const overdue = followups.filter(f => f.status === 'overdue' || (f.status === 'pending' && (f.due_date || todayStr) < todayStr)).length;
    const upcoming = followups.filter(f => f.status === 'upcoming' || (f.status === 'pending' && (f.due_date || todayStr) > todayStr)).length;
    const completed = followups.filter(f => f.status === 'completed').length;
    const maternal = followups.filter(f => (f.category || '').toUpperCase().includes('ANC')).length;
    const immunization = followups.filter(f => (f.category || '').toUpperCase().includes('IMMUNIZ')).length;
    const highRisk = followups.filter(f => (f.category || '').toUpperCase().includes('HIGH') || f.priority === 'urgent' || f.priority === 'high').length;
    const newborn = followups.filter(f => (f.category || '').toUpperCase().includes('NEWBORN')).length;

    return {
      total,
      pending,
      overdue,
      upcoming,
      completed,
      maternal,
      immunization,
      highRisk,
      newborn
    };
  }, [followups]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12" dir={dir}>
      {/* 1. Header with Export and Refresh */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-[#F0DDE2] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF9EF] text-[#B88745] flex items-center justify-center font-bold shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg lg:text-xl font-bold text-[#3B2A33] leading-tight font-serif">
                {t('followup.title') || 'Follow-ups & Reports'}
              </h1>
              <span className="text-xs font-mono font-bold bg-[#FDF6F5] text-[#A25B74] px-2.5 py-0.5 rounded-full border border-[#F0DDE2]">
                Active Records: {followups.length}
              </span>
            </div>
            <p className="text-xs text-[#7A6670] font-medium mt-0.5">
              {t('followup.subtitle') || 'NHM Maternal & Child Healthcare Community Visit Schedule'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadFollowups}
            className="p-2.5 rounded-2xl bg-[#FDF6F5] text-[#7A6670] hover:text-[#3B2A33] border border-[#F0DDE2] active:scale-95 transition-decelerate"
            title="Refresh records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-2xl bg-[#477A60] hover:bg-[#3b6650] text-white font-bold text-xs shadow-touch flex items-center space-x-2 active:scale-95 transition-decelerate"
          >
            <Download className="w-4 h-4" />
            <span>Export Report (CSV)</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-4 py-3 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{error}</span>
          </div>
          <button onClick={loadFollowups} className="underline text-amber-900 font-bold ml-3">
            Retry
          </button>
        </div>
      )}

      {toastMessage && (
        <div className="bg-[#477A60] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-card flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Responsive 8-Stat KPI Dashboard Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Pending */}
        <div 
          onClick={() => setActiveTab('pending')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${activeTab === 'pending' ? 'bg-[#A25B74] text-white border-[#A25B74] shadow-md' : 'bg-white border-[#F0DDE2] hover:border-[#A25B74]'}`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeTab === 'pending' ? 'text-white/80' : 'text-[#7A6670]'}`}>
            Pending
          </span>
          <span className="text-xl font-bold font-mono mt-0.5 block">{stats.pending}</span>
        </div>

        {/* Overdue */}
        <div 
          onClick={() => setActiveTab('overdue')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${activeTab === 'overdue' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-red-50/70 border-red-200 hover:border-red-400'}`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeTab === 'overdue' ? 'text-white/80' : 'text-red-700'}`}>
            Overdue
          </span>
          <span className={`text-xl font-bold font-mono mt-0.5 block ${activeTab === 'overdue' ? 'text-white' : 'text-red-700'}`}>{stats.overdue}</span>
        </div>

        {/* Upcoming */}
        <div 
          onClick={() => setActiveTab('upcoming')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${activeTab === 'upcoming' ? 'bg-[#1A73E8] text-white border-[#1A73E8] shadow-md' : 'bg-blue-50/70 border-blue-200 hover:border-blue-400'}`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeTab === 'upcoming' ? 'text-white/80' : 'text-blue-700'}`}>
            Upcoming
          </span>
          <span className={`text-xl font-bold font-mono mt-0.5 block ${activeTab === 'upcoming' ? 'text-white' : 'text-blue-700'}`}>{stats.upcoming}</span>
        </div>

        {/* Completed */}
        <div 
          onClick={() => setActiveTab('completed')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${activeTab === 'completed' ? 'bg-[#477A60] text-white border-[#477A60] shadow-md' : 'bg-[#E8F7F1] border-[#C8EEDD] hover:border-[#477A60]'}`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${activeTab === 'completed' ? 'text-white/80' : 'text-[#477A60]'}`}>
            Completed
          </span>
          <span className={`text-xl font-bold font-mono mt-0.5 block ${activeTab === 'completed' ? 'text-white' : 'text-[#477A60]'}`}>{stats.completed}</span>
        </div>

        {/* Maternal Health (ANC) */}
        <div 
          onClick={() => setCategoryFilter(categoryFilter === 'ANC' ? 'all' : 'ANC')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${categoryFilter === 'ANC' ? 'bg-[#A25B74] text-white border-[#A25B74] shadow-md' : 'bg-white border-[#F0DDE2] hover:border-[#A25B74]'}`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${categoryFilter === 'ANC' ? 'text-white/80' : 'text-[#7A6670]'}`}>
            Maternal ANC
          </span>
          <span className="text-xl font-bold font-mono mt-0.5 block">{stats.maternal}</span>
        </div>

        {/* Child Immunization */}
        <div 
          onClick={() => setCategoryFilter(categoryFilter === 'Immunization' ? 'all' : 'Immunization')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${categoryFilter === 'Immunization' ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-amber-50/70 border-amber-200 hover:border-amber-400'}`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${categoryFilter === 'Immunization' ? 'text-white/80' : 'text-amber-800'}`}>
            Vaccination
          </span>
          <span className={`text-xl font-bold font-mono mt-0.5 block ${categoryFilter === 'Immunization' ? 'text-white' : 'text-amber-800'}`}>{stats.immunization}</span>
        </div>

        {/* High Risk */}
        <div 
          onClick={() => setCategoryFilter(categoryFilter === 'High Risk' ? 'all' : 'High Risk')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${categoryFilter === 'High Risk' ? 'bg-rose-700 text-white border-rose-700 shadow-md' : 'bg-rose-50/70 border-rose-200 hover:border-rose-400'}`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${categoryFilter === 'High Risk' ? 'text-white/80' : 'text-rose-800'}`}>
            High Risk
          </span>
          <span className={`text-xl font-bold font-mono mt-0.5 block ${categoryFilter === 'High Risk' ? 'text-white' : 'text-rose-800'}`}>{stats.highRisk}</span>
        </div>

        {/* Newborn Care */}
        <div 
          onClick={() => setCategoryFilter(categoryFilter === 'Newborn' ? 'all' : 'Newborn')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${categoryFilter === 'Newborn' ? 'bg-purple-700 text-white border-purple-700 shadow-md' : 'bg-purple-50/70 border-purple-200 hover:border-purple-400'}`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${categoryFilter === 'Newborn' ? 'text-white/80' : 'text-purple-800'}`}>
            HBNC Newborn
          </span>
          <span className={`text-xl font-bold font-mono mt-0.5 block ${categoryFilter === 'Newborn' ? 'text-white' : 'text-purple-800'}`}>{stats.newborn}</span>
        </div>
      </div>

      {/* 3. Search and Multi-Criteria Filter Controls */}
      <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#C47A92] absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Beneficiary Name, ID (e.g. BEN-KA-001), Household ID (e.g. HH-001), Village, or Notes..."
            className="w-full text-xs font-medium pl-10 pr-10 py-3 bg-[#FDF6F5] border border-[#F0DDE2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A25B74] focus:bg-white transition-decelerate"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-[#C47A92] hover:text-[#3B2A33]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Row: Status Tabs, Category Filter & Date Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#F0DDE2]/60">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-[#FDF6F5] p-1 rounded-2xl border border-[#F0DDE2]">
            {[
              { id: 'all', label: 'All Records', count: stats.total },
              { id: 'pending', label: 'Pending', count: stats.pending },
              { id: 'overdue', label: 'Overdue', count: stats.overdue },
              { id: 'upcoming', label: 'Upcoming', count: stats.upcoming },
              { id: 'completed', label: 'Completed', count: stats.completed },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#A25B74] text-white shadow-sm'
                    : 'text-[#7A6670] hover:text-[#3B2A33]'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Category Dropdown / Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-[#7A6670] uppercase">Category:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'ANC', label: 'Maternal ANC' },
              { id: 'Immunization', label: 'Immunization' },
              { id: 'High Risk', label: 'High Risk' },
              { id: 'Newborn', label: 'Newborn' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-xl font-bold transition-all border ${
                  categoryFilter === cat.id
                    ? 'bg-[#3B2A33] text-white border-[#3B2A33]'
                    : 'bg-white text-[#7A6670] border-[#F0DDE2] hover:bg-[#FDF6F5]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Date Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-[11px] font-bold text-[#7A6670] uppercase">Date:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#FDF6F5] border border-[#F0DDE2] rounded-xl font-semibold text-xs text-[#3B2A33] focus:outline-none focus:ring-1 focus:ring-[#A25B74]"
            >
              <option value="all">All Dates</option>
              <option value="today">Due Today</option>
              <option value="this_week">This Week</option>
              <option value="overdue">Overdue Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Follow-up Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded-xl w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded-xl w-1/2"></div>
              <div className="h-10 bg-gray-50 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isCompleted = item.status === 'completed';
            const isOverdue = item.status === 'overdue';
            const isHighRisk = (item.category || '').toLowerCase().includes('high') || item.priority === 'urgent' || item.priority === 'high';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-5 border shadow-card hover:shadow-card-hover transition-decelerate flex flex-col justify-between space-y-4 ${
                  isOverdue 
                    ? 'border-red-300 ring-1 ring-red-100' 
                    : isCompleted 
                    ? 'border-[#C8EEDD]' 
                    : 'border-[#F0DDE2] hover:border-[#A25B74]'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Header: Beneficiary Name & Due Date Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-[#3B2A33] leading-tight font-serif flex items-center gap-1.5">
                        <span>{language === 'kn' ? (item.beneficiary_name_kn || item.beneficiary_name) : item.beneficiary_name}</span>
                        {isHighRisk && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" title="High Risk Follow-up"></span>
                        )}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[11px] font-mono font-bold text-[#C47A92] bg-[#FDF6F5] px-2 py-0.5 rounded-md border border-[#F0DDE2]">
                          ID: {item.beneficiary_id}
                        </span>
                        <span className="text-[11px] font-mono text-[#7A6670]">
                          {item.household_id}
                        </span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl border whitespace-nowrap ${
                      isCompleted
                        ? 'bg-[#E8F7F1] text-[#477A60] border-[#C8EEDD]'
                        : isOverdue
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-[#FEF9EF] text-[#B88745] border-amber-200'
                    }`}>
                      {item.due_date} {isOverdue && '(!)'}
                    </span>
                  </div>

                  {/* Task & Category Details */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-[#A25B74] leading-snug">
                      {item.type || item.task_type || 'Clinical Visit'}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FDF6F5] text-[#A25B74] font-bold text-[10px] border border-[#F0DDE2]">
                        {item.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                        item.priority === 'urgent' || item.priority === 'high'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-gray-100 text-[#7A6670] border-gray-200'
                      }`}>
                        Priority: {item.priority}
                      </span>
                    </div>
                  </div>

                  {/* Location & Household */}
                  <p className="text-xs text-[#7A6670] flex items-center font-medium">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-[#A25B74] shrink-0" />
                    <span>{item.village}</span>
                  </p>

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-[11px] text-[#3B2A33] bg-[#FDF6F5] p-2.5 rounded-xl border border-[#F0DDE2] leading-relaxed">
                      {item.notes}
                    </p>
                  )}
                </div>

                {/* Functional Action Buttons */}
                <div className="flex items-center space-x-2 pt-3 border-t border-[#F0DDE2]">
                  {/* Start Voice Visit */}
                  <button
                    onClick={() => onStartVoiceVisit && onStartVoiceVisit(item.beneficiary_id)}
                    className="flex-1 bg-[#A25B74] hover:bg-[#84455C] text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-touch flex items-center justify-center space-x-1.5 active:scale-95 transition-decelerate"
                    title="Record voice visit for this beneficiary"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{t('followup.voiceVisitBtn') || 'Voice Visit'}</span>
                  </button>

                  {/* Mark as Completed */}
                  {!isCompleted && (
                    <button
                      onClick={() => handleMarkCompleted(item)}
                      className="p-2.5 rounded-xl border border-[#C8EEDD] text-[#477A60] hover:bg-[#E8F7F1] active:scale-95 transition-decelerate"
                      title="Mark as Completed"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  {/* Reschedule */}
                  {!isCompleted && (
                    <button
                      onClick={() => handleOpenReschedule(item)}
                      className="p-2.5 rounded-xl border border-[#F0DDE2] text-[#3B2A33] hover:bg-[#FDF6F5] active:scale-95 transition-decelerate"
                      title="Reschedule Visit Date"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  {/* View History & Profile */}
                  <button
                    onClick={() => handleViewBeneficiaryHistory(item)}
                    className="p-2.5 rounded-xl border border-[#F0DDE2] text-[#7A6670] hover:text-[#3B2A33] hover:bg-[#FDF6F5] active:scale-95 transition-decelerate"
                    title="View Beneficiary Details & Visits"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-[#F0DDE2] shadow-card space-y-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-[#E8F7F1] text-[#477A60] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#3B2A33] font-serif">
              No Matching Follow-ups Found
            </h4>
            <p className="text-xs text-[#7A6670] max-w-md mx-auto mt-1">
              There are no pending tasks matching your current filters. Try resetting the search or category filters.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTab('all');
              setCategoryFilter('all');
              setDateFilter('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-[#FDF6F5] border border-[#F0DDE2] text-[#A25B74] font-bold text-xs hover:bg-[#F9ECEC] active:scale-95 transition-all"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Reschedule Date Modal */}
      {rescheduleItem && (
        <div className="fixed inset-0 z-50 bg-[#3B2A33]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-[#F0DDE2] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
              <span className="text-sm font-bold text-[#3B2A33] flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-[#A25B74]" />
                <span>Reschedule Follow-up</span>
              </span>
              <button onClick={() => setRescheduleItem(null)} className="p-1 rounded-xl hover:bg-[#FDF6F5] text-[#C47A92]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-bold text-[#3B2A33]">{rescheduleItem.beneficiary_name}</span>
              <p className="text-[#7A6670]">{rescheduleItem.type}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#7A6670]">Select New Due Date:</label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full text-xs font-bold p-3 bg-[#FDF6F5] border border-[#F0DDE2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A25B74]"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setRescheduleItem(null)}
                className="flex-1 py-3 text-xs font-semibold rounded-2xl border border-[#F0DDE2] text-[#3B2A33] hover:bg-[#FDF6F5]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveReschedule}
                className="flex-1 py-3 text-xs font-bold rounded-2xl bg-[#A25B74] text-white hover:bg-[#84455C] shadow-touch"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beneficiary Details & Previous Visits Modal */}
      {isDetailsModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-[#3B2A33]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 border border-[#F0DDE2] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FDF6F5] text-[#A25B74] flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#3B2A33] leading-tight">
                    {selectedItem.beneficiary_name}
                  </h3>
                  <span className="text-xs font-mono text-[#C47A92]">ID: {selectedItem.beneficiary_id}</span>
                </div>
              </div>

              <button onClick={() => setIsDetailsModalOpen(false)} className="p-1.5 rounded-xl hover:bg-[#FDF6F5] text-[#C47A92]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Demographics Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
                <span className="text-[10px] text-[#7A6670] block uppercase font-bold">Category</span>
                <span className="font-bold text-[#3B2A33]">{selectedItem.category}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
                <span className="text-[10px] text-[#7A6670] block uppercase font-bold">Village</span>
                <span className="font-bold text-[#3B2A33]">{selectedItem.village}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
                <span className="text-[10px] text-[#7A6670] block uppercase font-bold">Household</span>
                <span className="font-bold text-[#3B2A33]">{selectedItem.household_id}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2]">
                <span className="text-[10px] text-[#7A6670] block uppercase font-bold">Priority</span>
                <span className="font-bold text-[#A25B74] uppercase">{selectedItem.priority}</span>
              </div>
            </div>

            {/* Visit History Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[#3B2A33] uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-[#A25B74]" />
                <span>Recorded Clinical Visits ({beneficiaryVisits.length})</span>
              </h4>

              {loadingVisits ? (
                <div className="p-4 text-center text-xs text-[#7A6670] animate-pulse">
                  Loading visit records from database...
                </div>
              ) : beneficiaryVisits.length > 0 ? (
                <div className="space-y-2.5 max-h-60 overflow-y-auto">
                  {beneficiaryVisits.map(v => (
                    <div key={v.id} className="p-3.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#3B2A33]">{v.visit_type}</span>
                        <span className="text-xs font-mono text-[#7A6670]">{v.visit_date || v.created_at?.split('T')[0]}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#7A6670]">
                        {v.weight && <span>Weight: <b>{v.weight} kg</b></span>}
                        {v.next_visit_date && <span>Next Due: <b>{v.next_visit_date}</b></span>}
                      </div>
                      {v.additional_notes && (
                        <p className="text-[11px] text-[#3B2A33] pt-1">
                          {v.additional_notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[#7A6670] bg-[#FDF6F5] rounded-2xl border border-[#F0DDE2]">
                  No past visit records registered yet for this beneficiary.
                </div>
              )}
            </div>

            {/* Action to Start Voice Visit */}
            <div className="pt-3 border-t border-[#F0DDE2] flex justify-end gap-3">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2.5 text-xs font-semibold rounded-2xl border border-[#F0DDE2] text-[#3B2A33] hover:bg-[#FDF6F5]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  if (onStartVoiceVisit) onStartVoiceVisit(selectedItem.beneficiary_id);
                }}
                className="px-5 py-2.5 text-xs font-bold rounded-2xl bg-[#A25B74] text-white hover:bg-[#84455C] shadow-touch flex items-center space-x-1.5"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Record New Voice Visit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
