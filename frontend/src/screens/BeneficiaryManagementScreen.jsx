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

export default function BeneficiaryManagementScreen({ 
  onStartVoiceVisit, 
  onBack,
  selectedBeneficiaryId = null,
  initialSearchQuery = ''
}) {
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
    village: 'Shivalli, Mandya PHC',
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
    setToastMessage(`ಹೊಸ ಫಲಾನುಭವಿ ${created.name_kn || created.name_en} ನೋಂದಾಯಿಸಲಾಗಿದೆ.`);
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
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12">
      {/* 1. Header with Add Button */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-navy-200/60 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg lg:text-xl font-bold font-kannada text-navy-900 leading-tight">
                ಫಲಾನುಭವಿಗಳ ಸಮುದಾಯ ರಿಜಿಸ್ಟರ್ (Beneficiary Directory)
              </h1>
              <span className="text-xs font-mono font-bold bg-cyan-50 text-cyan-800 px-2.5 py-0.5 rounded-full border border-cyan-200">
                ಒಟ್ಟು: {beneficiaries.length}
              </span>
            </div>
            <p className="text-xs text-navy-500 font-medium mt-0.5">
              ಶಿವಳ್ಳಿ ಮತ್ತು ಕೆರೆಗೋಡು ಉಪಕೇಂದ್ರ (Mandya PHC Sector 4)
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-cyan hover:from-primary-hover hover:to-cyan-hover text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-touch active:scale-95 transition-decelerate touch-manipulation self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span className="font-kannada text-sm">ಹೊಸ ಫಲಾನುಭವಿ ನೋಂದಣಿ</span>
        </button>
      </div>

      {toastMessage && (
        <div className="bg-healthcare text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-card flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Full-Width Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 lg:p-5 border border-navy-200/60 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-navy-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ಹೆಸರು, ID ಅಥವಾ ಗ್ರಾಮ ಹುಡುಕಿ (Search by Name, ID, Village)..."
            className="w-full text-xs font-medium pl-10 pr-4 py-3 bg-softblue border border-navy-200/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white font-kannada transition-decelerate"
          />
        </div>

        {/* Category Filters */}
        <div className="flex space-x-2 overflow-x-auto scrollbar-none pb-0.5">
          {[
            { id: 'ALL', label: 'ಎಲ್ಲಾ (All)' },
            { id: 'ANC', label: '🤰 ANC ಗರ್ಭಿಣಿ' },
            { id: 'CHILD', label: '👶 ಮಕ್ಕಳ ಲಸಿಕೆ' },
            { id: 'PNC', label: '🤱 ಬಾಣಂತಿ (PNC)' },
            { id: 'HIGH_RISK', label: '⚠️ High Risk' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap active:scale-95 transition-decelerate ${
                categoryFilter === cat.id
                  ? cat.id === 'HIGH_RISK'
                    ? 'bg-emergency text-white shadow-emergency'
                    : 'bg-primary text-white shadow-touch'
                  : 'bg-softblue text-navy-700 hover:bg-navy-100 border border-navy-200/60'
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
            className="bg-white rounded-3xl p-5 border border-navy-200/60 shadow-card hover:border-primary hover:shadow-card-hover transition-decelerate cursor-pointer active:scale-[0.98] flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base group-hover:scale-105 transition-decelerate ${
                    b.category === 'ANC'
                      ? 'bg-pink-100 text-pink-700 border border-pink-200'
                      : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                  }`}>
                    {b.name_kn?.slice(0, 1) || b.name_en?.slice(0, 1) || 'A'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-900 font-kannada leading-tight">
                      {b.name_kn || b.name_en}
                    </h3>
                    <span className="text-[11px] font-mono font-bold text-navy-400">
                      ID: {b.id}
                    </span>
                  </div>
                </div>

                {b.highRisk && (
                  <span className="text-[10px] bg-emergency text-white font-bold px-2.5 py-0.5 rounded-full animate-pulse shadow-emergency">
                    High Risk
                  </span>
                )}
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                  b.category === 'ANC'
                    ? 'bg-pink-50 text-pink-700 border-pink-200'
                    : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                }`}>
                  {b.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-softblue text-navy-700 font-semibold text-[11px] border border-navy-100">
                  ವಯಸ್ಸು: {b.age || 25}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-softblue text-navy-700 font-semibold text-[11px] border border-navy-100 font-mono">
                  ರಕ್ತ: {b.bloodGroup || 'O+'}
                </span>
              </div>

              <p className="text-xs text-navy-500 flex items-center font-medium pt-1">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary shrink-0" />
                {b.village}
              </p>

              {/* SubCategory or Clinical Note */}
              {b.subCategory && (
                <p className="text-[11px] text-navy-600 bg-softblue px-3 py-1.5 rounded-xl border border-navy-100 font-medium">
                  {b.subCategory}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-navy-100 text-xs">
              <span className="text-navy-400 font-medium">ತೂಕ: {b.weight || 52} kg</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartVoiceVisit(b.id);
                }}
                className="text-primary font-bold hover:text-cyan-600 flex items-center space-x-1"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>ಭೇಟಿ ಪ್ರಾರಂಭಿಸಿ</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Beneficiary Profile Modal / Drawer with History */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 border border-navy-200/60 shadow-2xl space-y-5 max-h-[88vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-navy-100 pb-3">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  selectedProfile.category === 'ANC'
                    ? 'bg-pink-50 text-pink-700 border-pink-200'
                    : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                }`}>
                  {selectedProfile.category}
                </span>
                <h3 className="text-xl font-bold font-kannada text-navy-900 mt-1.5">
                  {selectedProfile.name_kn || selectedProfile.name_en}
                </h3>
                <p className="text-xs text-navy-500 font-mono font-bold">
                  {selectedProfile.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="p-2 rounded-xl hover:bg-softblue text-navy-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vitals Summary Grid */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-2xl bg-softblue border border-navy-100">
                <span className="text-[10px] text-navy-400 block font-medium">ವಯಸ್ಸು (Age)</span>
                <span className="font-bold text-navy-900 text-base font-mono">{selectedProfile.age || 24}</span>
              </div>
              <div className="p-3 rounded-2xl bg-softblue border border-navy-100">
                <span className="text-[10px] text-navy-400 block font-medium">ತೂಕ (Weight)</span>
                <span className="font-bold text-navy-900 text-base font-mono">{selectedProfile.weight || 52} kg</span>
              </div>
              <div className="p-3 rounded-2xl bg-softblue border border-navy-100">
                <span className="text-[10px] text-navy-400 block font-medium">ರಕ್ತ ಗುಂಪು</span>
                <span className="font-bold text-navy-900 text-base font-mono">{selectedProfile.bloodGroup || 'B+'}</span>
              </div>
            </div>

            {/* Location & Contact */}
            <div className="p-4 rounded-2xl bg-softblue border border-navy-100 text-xs space-y-2 font-medium">
              <div className="flex items-center text-navy-700">
                <MapPin className="w-4 h-4 mr-2 text-primary shrink-0" />
                <span>{selectedProfile.village}</span>
              </div>
              <div className="flex items-center text-navy-700">
                <Phone className="w-4 h-4 mr-2 text-primary shrink-0" />
                <span>{selectedProfile.phone || '+91 94480 12345'}</span>
              </div>
            </div>

            {/* Visit History Section */}
            {selectedProfile.visitHistory && selectedProfile.visitHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-navy-900 font-kannada flex items-center space-x-1.5">
                  <History className="w-3.5 h-3.5 text-primary" />
                  <span>ಹಿಂದಿನ ಭೇಟಿ ಇತಿಹಾಸ (Visit History)</span>
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedProfile.visitHistory.map((vh, i) => (
                    <div key={i} className="p-3 rounded-xl bg-softblue/60 border border-navy-100 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-navy-900">
                        <span>{vh.type}</span>
                        <span className="font-mono text-[10px] text-navy-500">{vh.date}</span>
                      </div>
                      <p className="text-[11px] text-navy-600">{vh.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Start Voice Visit CTA */}
            <button
              onClick={() => {
                const id = selectedProfile.id;
                setSelectedProfile(null);
                if (onStartVoiceVisit) onStartVoiceVisit(id);
              }}
              className="w-full bg-gradient-to-r from-primary to-cyan hover:from-primary-hover hover:to-cyan-hover text-white text-sm font-bold py-4 px-4 rounded-2xl shadow-touch flex items-center justify-center space-x-2 active:scale-95 transition-decelerate touch-manipulation"
            >
              <Mic className="w-5 h-5" />
              <span className="font-kannada">ಈ ಫಲಾನುಭವಿಗೆ ಧ್ವನಿ ಭೇಟಿ ಪ್ರಾರಂಭಿಸಿ (Start Voice Visit)</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Add Beneficiary Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <form
            onSubmit={handleAddSubmit}
            className="bg-white w-full max-w-lg rounded-3xl p-6 border border-navy-200/60 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <h3 className="text-base font-bold font-kannada text-navy-900">
                ಹೊಸ ಫಲಾನುಭವಿ ನೋಂದಣಿ (New Beneficiary Registration)
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl hover:bg-softblue text-navy-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-navy-700 font-bold mb-1 font-kannada">
                  ಹೆಸರು (ಕನ್ನಡದಲ್ಲಿ):
                </label>
                <input
                  type="text"
                  required
                  value={newBeneficiary.name_kn}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, name_kn: e.target.value })}
                  placeholder="ಉದಾ: ಸುಶೀಲಾ ಎಂ."
                  className="w-full border border-navy-200 rounded-2xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-softblue font-kannada"
                />
              </div>

              <div>
                <label className="block text-navy-700 font-bold mb-1">
                  Name (English):
                </label>
                <input
                  type="text"
                  value={newBeneficiary.name_en}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, name_en: e.target.value })}
                  placeholder="e.g. Susheela M."
                  className="w-full border border-navy-200 rounded-2xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-softblue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-navy-700 font-bold mb-1">ವಯಸ್ಸು (Age):</label>
                  <input
                    type="number"
                    value={newBeneficiary.age}
                    onChange={(e) => setNewBeneficiary({ ...newBeneficiary, age: e.target.value })}
                    placeholder="24"
                    className="w-full border border-navy-200 rounded-2xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-softblue"
                  />
                </div>
                <div>
                  <label className="block text-navy-700 font-bold mb-1">ವರ್ಗ (Category):</label>
                  <select
                    value={newBeneficiary.category}
                    onChange={(e) => setNewBeneficiary({ ...newBeneficiary, category: e.target.value })}
                    className="w-full border border-navy-200 rounded-2xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-softblue"
                  >
                    <option value="ANC">ANC (ಗರ್ಭಿಣಿ)</option>
                    <option value="Child Immunization">ಮಕ್ಕಳ ಲಸಿಕೆ</option>
                    <option value="PNC">PNC (ಬಾಣಂತಿ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-navy-700 font-bold mb-1">ಗ್ರಾಮ (Village):</label>
                <input
                  type="text"
                  value={newBeneficiary.village}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, village: e.target.value })}
                  placeholder="Shivalli, Mandya"
                  className="w-full border border-navy-200 rounded-2xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-softblue"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-3 text-xs font-semibold rounded-2xl border border-navy-200 text-navy-800 hover:bg-softblue active:scale-95"
              >
                ರದ್ದುಮಾಡಿ
              </button>
              <button
                type="submit"
                className="flex-1 py-3 text-xs font-bold rounded-2xl bg-primary text-white hover:bg-primary-hover active:scale-95 shadow-touch"
              >
                ನೋಂದಾಯಿಸಿ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
