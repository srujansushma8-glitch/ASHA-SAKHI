import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  ChevronRight, 
  Phone, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Scale, 
  Mic, 
  X, 
  Check, 
  ArrowLeft, 
  UserCheck, 
  HeartPulse, 
  Syringe, 
  Filter,
  Baby,
  Activity,
  Clock,
  History,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function BeneficiaryManagementScreen({
  onStartVoiceVisit, 
  onBack,
  selectedBeneficiaryId = null,
  initialSearchQuery = ''
}) {
  const { language, t, dir, isRtl, langInfo } = useLanguage();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBeneficiary, setNewBeneficiary] = useState({
    name_kn: '',
    name_en: '',
    age: '',
    phone: '',
    village: 'Shivalli, Mandya Sector 4',
    category: 'ANC',
    subCategory: '1st Trimester',
    bloodGroup: 'B+',
    weight: '52.0'
  });
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const loadBeneficiaries = async () => {
    const list = await api.getBeneficiaries();
    setBeneficiaries(list);
    if (selectedBeneficiaryId) {
      const found = list.find(b => b.id === selectedBeneficiaryId);
      if (found) setSelectedProfile(found);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newBeneficiary.name_kn && !newBeneficiary.name_en) return;

    const created = await api.addBeneficiary({
      ...newBeneficiary,
      name_en: newBeneficiary.name_en || newBeneficiary.name_kn,
      name_kn: newBeneficiary.name_kn || newBeneficiary.name_en,
      age: parseInt(newBeneficiary.age) || 24,
      weight: parseFloat(newBeneficiary.weight) || 50.0,
      highRisk: false,
      riskFactors: [],
      vaccinationsDue: ['TT-1 / TD-1'],
      vaccinationsCompleted: [],
      lastVisitDate: new Date().toISOString().split('T')[0]
    });

    setIsAddModalOpen(false);
    loadBeneficiaries();
    setToastMessage(t('beneficiaries.registerSuccess', { name: created.name_en || created.name_kn }));
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredBeneficiaries = beneficiaries.filter(b => {
    let matchesCategory = true;
    if (categoryFilter === 'ANC') matchesCategory = b.category === 'ANC';
    else if (categoryFilter === 'CHILD') matchesCategory = b.category === 'Immunization' || (b.category || '').toLowerCase().includes('child') || b.age <= 5;
    else if (categoryFilter === 'PNC') matchesCategory = b.category === 'PNC';
    else if (categoryFilter === 'HIGH_RISK') matchesCategory = b.highRisk === true;

    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (b.name_en && b.name_en.toLowerCase().includes(q)) ||
      (b.name_kn && b.name_kn.includes(q)) ||
      (b.id && b.id.toLowerCase().includes(q)) ||
      (b.village && b.village.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12" dir={dir}>
      {/* 1. Header with Add Button */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-[#F0DDE2] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF6F5] text-[#A25B74] flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg lg:text-xl font-bold text-[#3B2A33] leading-tight font-serif">
                {t('beneficiaries.title')}
              </h1>
              <span className="text-xs font-mono font-bold bg-[#FDF6F5] text-[#A25B74] px-2.5 py-0.5 rounded-full border border-[#F0DDE2]">
                {t('beneficiaries.totalCount', { count: beneficiaries.length })}
              </span>
            </div>
            <p className="text-xs text-[#7A6670] font-medium mt-0.5">
              {t('beneficiaries.sectorInfo')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-[#A25B74] hover:bg-[#84455C] text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-touch active:scale-95 transition-decelerate touch-manipulation self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span className="text-sm">{t('beneficiaries.registerNew')}</span>
        </button>
      </div>

      {toastMessage && (
        <div className="bg-[#477A60] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-card flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Full-Width Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 lg:p-5 border border-[#F0DDE2] shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#C47A92] absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('beneficiaries.searchPlaceholder')}
            className="w-full text-xs font-medium pl-10 pr-4 py-3 bg-[#FDF6F5] border border-[#F0DDE2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A25B74] focus:bg-white transition-decelerate"
          />
        </div>

        {/* Category Filters */}
        <div className="flex space-x-2 overflow-x-auto scrollbar-none pb-0.5">
          {[
            { id: 'ALL', label: t('beneficiaries.tabAll', { count: beneficiaries.length }) },
            { id: 'ANC', label: t('beneficiaries.tabAnc') },
            { id: 'CHILD', label: t('beneficiaries.tabChild') },
            { id: 'PNC', label: t('beneficiaries.tabPnc') },
            { id: 'HIGH_RISK', label: t('beneficiaries.tabHighRisk') }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap active:scale-95 transition-decelerate ${
                categoryFilter === cat.id
                  ? cat.id === 'HIGH_RISK'
                    ? 'bg-[#B94A58] text-white shadow-md'
                    : 'bg-[#A25B74] text-white shadow-touch'
                  : 'bg-[#FDF6F5] text-[#3B2A33] hover:bg-[#FDF6F5] border border-[#F0DDE2]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Beneficiaries Responsive Multi-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredBeneficiaries.map((b) => (
          <div
            key={b.id}
            onClick={() => setSelectedProfile(b)}
            className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card hover:border-[#A25B74] hover:shadow-card-hover transition-decelerate cursor-pointer active:scale-[0.98] flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base group-hover:scale-105 transition-decelerate ${
                    b.category === 'ANC'
                      ? 'bg-[#F9ECEC] text-[#A25B74] border border-[#F0DDE2]'
                      : b.category === 'PNC'
                      ? 'bg-[#FFF9F7] text-[#C47A92] border border-[#F0DDE2]'
                      : 'bg-[#FEF9EF] text-[#B88745] border border-amber-200'
                  }`}>
                    {b.category === 'ANC' ? '🤰' : b.category === 'PNC' ? '🤱' : '👶'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#3B2A33] leading-tight font-serif group-hover:text-[#A25B74] transition-colors">
                      {language === 'kn' ? (b.name_kn || b.name_en) : b.name_en}
                    </h3>
                    <p className="text-xs text-[#7A6670] mt-0.5">{b.subCategory || b.category} • {b.age} yrs</p>
                  </div>
                </div>

                {b.highRisk && (
                  <span className="p-1.5 rounded-xl bg-[#FCF1F1] text-[#B94A58] border border-[#B94A58]/20 animate-pulse" title="High Risk">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-[#7A6670] pt-1">
                <p className="flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-2 text-[#A25B74]" />
                  <span>{b.phone}</span>
                </p>
                <p className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-2 text-[#A25B74]" />
                  <span>{b.village}</span>
                </p>
                <p className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-2 text-[#A25B74]" />
                  <span>{t('structuredRecord.nextVisit')}: {b.nextVisitDate || b.lastVisitDate}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#F0DDE2] text-xs">
              <span className="font-mono text-[#C47A92] font-semibold">ID: {b.id}</span>
              <span className="text-[#A25B74] font-bold flex items-center group-hover:translate-x-1 transition-transform">
                {t('common.viewDetails')}
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Beneficiary Details Slide-Over or Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 bg-[#3B2A33]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 border border-[#F0DDE2] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#F0DDE2] pb-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#F9ECEC] text-[#A25B74] flex items-center justify-center text-2xl font-bold border border-[#F0DDE2]">
                  {selectedProfile.category === 'ANC' ? '🤰' : selectedProfile.category === 'PNC' ? '🤱' : '👶'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#3B2A33] font-serif">
                    {language === 'kn' ? (selectedProfile.name_kn || selectedProfile.name_en) : selectedProfile.name_en}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs font-mono font-bold bg-[#FDF6F5] text-[#3B2A33] px-2.5 py-0.5 rounded-lg border border-[#F0DDE2]">
                      ID: {selectedProfile.id}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FDF6F5] text-[#A25B74] font-bold border border-[#F0DDE2]">
                      {selectedProfile.category}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedProfile(null)}
                className="p-2 rounded-xl hover:bg-[#FDF6F5] text-[#C47A92]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Vitals Profile */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-[#FDF6F5] p-3 rounded-2xl border border-[#F0DDE2]">
                <span className="text-[10px] text-[#C47A92] uppercase font-bold block">{t('common.age')}</span>
                <span className="text-lg font-bold text-[#3B2A33]">{selectedProfile.age} yrs</span>
              </div>
              <div className="bg-[#FDF6F5] p-3 rounded-2xl border border-[#F0DDE2]">
                <span className="text-[10px] text-[#C47A92] uppercase font-bold block">{t('common.weight')}</span>
                <span className="text-lg font-bold text-[#3B2A33]">{selectedProfile.weight || 52} kg</span>
              </div>
              <div className="bg-[#FDF6F5] p-3 rounded-2xl border border-[#F0DDE2]">
                <span className="text-[10px] text-[#C47A92] uppercase font-bold block">{t('beneficiaries.bloodGroupLabel')}</span>
                <span className="text-lg font-bold text-[#A25B74]">{selectedProfile.bloodGroup || 'B+'}</span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-xs text-[#7A6670] bg-[#FDF6F5] p-4 rounded-2xl border border-[#F0DDE2]">
              <p className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-[#A25B74]" />
                <span className="font-semibold text-[#3B2A33] mr-1">{t('beneficiaries.villageLabel')}:</span>
                {selectedProfile.village}
              </p>
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-[#A25B74]" />
                <span className="font-semibold text-[#3B2A33] mr-1">{t('beneficiaries.phoneLabel')}:</span>
                {selectedProfile.phone}
              </p>
              <p className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-[#A25B74]" />
                <span className="font-semibold text-[#3B2A33] mr-1">{t('structuredRecord.nextVisit')}:</span>
                {selectedProfile.nextVisitDate || selectedProfile.lastVisitDate}
              </p>
            </div>

            {/* Action CTA */}
            <button
              onClick={() => {
                const id = selectedProfile.id;
                setSelectedProfile(null);
                if (onStartVoiceVisit) onStartVoiceVisit(id);
              }}
              className="w-full bg-[#A25B74] hover:bg-[#84455C] text-white text-sm font-bold py-4 px-4 rounded-2xl shadow-touch flex items-center justify-center space-x-2 active:scale-95 transition-decelerate touch-manipulation"
            >
              <Mic className="w-5 h-5" />
              <span>{t('followup.voiceVisitBtn')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Add Beneficiary Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#3B2A33]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <form
            onSubmit={handleAddSubmit}
            className="bg-white w-full max-w-lg rounded-3xl p-6 border border-[#F0DDE2] shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
              <h3 className="text-base font-bold text-[#3B2A33] font-serif">
                {t('beneficiaries.registerNew')}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl hover:bg-[#FDF6F5] text-[#C47A92]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#3B2A33] font-bold mb-1">
                  {t('beneficiaries.nameLabel')}:
                </label>
                <input
                  type="text"
                  required
                  value={newBeneficiary.name_en}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, name_en: e.target.value })}
                  placeholder="e.g. Meenakshi Bai"
                  className="w-full border border-[#F0DDE2] rounded-2xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#A25B74] focus:outline-none bg-[#FDF6F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#3B2A33] font-bold mb-1">{t('beneficiaries.ageLabel')}:</label>
                  <input
                    type="number"
                    value={newBeneficiary.age}
                    onChange={(e) => setNewBeneficiary({ ...newBeneficiary, age: e.target.value })}
                    placeholder="24"
                    className="w-full border border-[#F0DDE2] rounded-2xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#A25B74] focus:outline-none bg-[#FDF6F5]"
                  />
                </div>
                <div>
                  <label className="block text-[#3B2A33] font-bold mb-1">{t('beneficiaries.categoryLabel')}:</label>
                  <select
                    value={newBeneficiary.category}
                    onChange={(e) => setNewBeneficiary({ ...newBeneficiary, category: e.target.value })}
                    className="w-full border border-[#F0DDE2] rounded-2xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#A25B74] focus:outline-none bg-[#FDF6F5]"
                  >
                    <option value="ANC">ANC</option>
                    <option value="Child Immunization">Child Immunization</option>
                    <option value="PNC">PNC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#3B2A33] font-bold mb-1">{t('beneficiaries.phoneLabel')}:</label>
                <input
                  type="text"
                  value={newBeneficiary.phone}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full border border-[#F0DDE2] rounded-2xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#A25B74] focus:outline-none bg-[#FDF6F5]"
                />
              </div>

              <div>
                <label className="block text-[#3B2A33] font-bold mb-1">{t('beneficiaries.villageLabel')}:</label>
                <input
                  type="text"
                  value={newBeneficiary.village}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, village: e.target.value })}
                  placeholder="Shivalli, Mandya"
                  className="w-full border border-[#F0DDE2] rounded-2xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#A25B74] focus:outline-none bg-[#FDF6F5]"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-3 text-xs font-semibold rounded-2xl border border-[#F0DDE2] text-[#3B2A33] hover:bg-[#FDF6F5] active:scale-95"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 py-3 text-xs font-bold rounded-2xl bg-[#A25B74] text-white hover:bg-[#84455C] active:scale-95 shadow-touch"
              >
                {t('beneficiaries.registerBtn')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
