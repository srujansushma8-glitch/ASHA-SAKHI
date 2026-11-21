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
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function BeneficiaryManagementScreen({ 
  onStartVoiceVisit, 
  onBack,
  selectedBeneficiaryId = null 
}) {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
    const matchesCategory = categoryFilter === 'ALL' || b.category === categoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (b.name_en && b.name_en.toLowerCase().includes(q)) ||
      (b.name_kn && b.name_kn.includes(q)) ||
      (b.id && b.id.toLowerCase().includes(q)) ||
      (b.village && b.village.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-28 max-w-2xl mx-auto px-4 pt-3 animate-fade-in">
      {/* 1. Header with Add Button */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-card flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold font-kannada text-navy leading-tight">
            ಫಲಾನುಭವಿಗಳ ಪಟ್ಟಿ
          </h2>
          <p className="text-xs text-navy-500 font-medium">Beneficiary Community Register</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 py-2 rounded-xl shadow-touch active:scale-[0.98] transition-decelerate touch-manipulation"
        >
          <UserPlus className="w-4 h-4" />
          <span className="font-kannada">ಹೊಸ ನೋಂದಣಿ</span>
        </button>
      </div>

      {toastMessage && (
        <div className="bg-healthcare text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-card flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Search & Category Filters */}
      <div className="bg-white rounded-2xl p-3.5 border border-navy-100 shadow-subtle space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-navy-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ಹೆಸರು, ID ಅಥವಾ ಗ್ರಾಮ ಹುಡುಕಿ..."
            className="w-full text-xs font-medium pl-9 pr-3 py-2 bg-ivory-bg border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-kannada"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex space-x-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {[
            { id: 'ALL', label: 'ಎಲ್ಲಾ (All)' },
            { id: 'ANC', label: 'ANC ಗರ್ಭಿಣಿ' },
            { id: 'Child Immunization', label: 'ಮಕ್ಕಳ ಲಸಿಕೆ' },
            { id: 'PNC', label: 'ಬಾಣಂತಿ (PNC)' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap active:scale-[0.98] transition-decelerate ${
                categoryFilter === cat.id
                  ? 'bg-primary text-white shadow-subtle'
                  : 'bg-navy-50 text-navy-700 hover:bg-navy-100 border border-navy-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Beneficiaries List */}
      <div className="space-y-2.5">
        {filteredBeneficiaries.map((b) => (
          <div
            key={b.id}
            onClick={() => setSelectedProfile(b)}
            className="bg-white rounded-2xl p-4 border border-navy-100 shadow-subtle hover:border-primary-200 transition-decelerate cursor-pointer active:scale-[0.98] flex items-center justify-between"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-navy font-kannada">
                  {b.name_kn || b.name_en}
                </span>
                <span className="text-[10px] font-mono font-bold bg-navy-50 text-navy-600 px-2 py-0.5 rounded border border-navy-100">
                  {b.id}
                </span>
                {b.highRisk && (
                  <span className="text-[10px] bg-emergency text-white font-bold px-1.5 py-0.5 rounded-full">
                    High Risk
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-navy-500 font-medium">
                <span className="px-2 py-0.5 rounded-full bg-mint-surface text-primary font-bold text-[10px]">
                  {b.category}
                </span>
                <span>•</span>
                <span>ವಯಸ್ಸು: {b.age || 25}</span>
                <span>•</span>
                <span>ರಕ್ತ ಗುಂಪು: {b.bloodGroup || 'O+'}</span>
              </div>
              <p className="text-[11px] text-navy-400 flex items-center font-medium">
                <MapPin className="w-3 h-3 mr-1 text-primary shrink-0" />
                {b.village}
              </p>
            </div>

            <ChevronRight className="w-5 h-5 text-navy-400 shrink-0" />
          </div>
        ))}
      </div>

      {/* 4. Beneficiary Profile Modal / Drawer */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 border border-navy-100 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-mint-surface px-2 py-0.5 rounded-full">
                  {selectedProfile.category}
                </span>
                <h3 className="text-lg font-bold font-kannada text-navy mt-1">
                  {selectedProfile.name_kn || selectedProfile.name_en}
                </h3>
                <p className="text-xs text-navy-500 font-mono font-bold">
                  {selectedProfile.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="p-1 rounded-xl hover:bg-navy-50 text-navy-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Vitals Summary Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-ivory-bg border border-navy-100">
                <span className="text-[10px] text-navy-400 block font-medium">ವಯಸ್ಸು</span>
                <span className="font-bold text-navy text-sm font-mono">{selectedProfile.age || 24}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-ivory-bg border border-navy-100">
                <span className="text-[10px] text-navy-400 block font-medium">ತೂಕ</span>
                <span className="font-bold text-navy text-sm font-mono">{selectedProfile.weight || 52} kg</span>
              </div>
              <div className="p-2.5 rounded-xl bg-ivory-bg border border-navy-100">
                <span className="text-[10px] text-navy-400 block font-medium">ರಕ್ತ ಗುಂಪು</span>
                <span className="font-bold text-navy text-sm font-mono">{selectedProfile.bloodGroup || 'B+'}</span>
              </div>
            </div>

            {/* Village & Phone */}
            <div className="p-3 rounded-xl bg-ivory-bg border border-navy-100 text-xs space-y-1.5 font-medium">
              <div className="flex items-center text-navy-700">
                <MapPin className="w-4 h-4 mr-2 text-primary shrink-0" />
                <span>{selectedProfile.village}</span>
              </div>
              <div className="flex items-center text-navy-700">
                <Phone className="w-4 h-4 mr-2 text-primary shrink-0" />
                <span>{selectedProfile.phone || '+91 94480 XXXXX'}</span>
              </div>
            </div>

            {/* Start Voice Visit CTA */}
            <button
              onClick={() => {
                const id = selectedProfile.id;
                setSelectedProfile(null);
                if (onStartVoiceVisit) onStartVoiceVisit(id);
              }}
              className="w-full bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-touch flex items-center justify-center space-x-2 active:scale-[0.98] transition-decelerate touch-manipulation"
            >
              <Mic className="w-4 h-4" />
              <span className="font-kannada">ಈ ಫಲಾನುಭವಿಗೆ ಧ್ವನಿ ಭೇಟಿ ಪ್ರಾರಂಭಿಸಿ</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Add Beneficiary Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
          <form
            onSubmit={handleAddSubmit}
            className="bg-white w-full max-w-md rounded-3xl p-5 border border-navy-100 shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold font-kannada text-navy">
                ಹೊಸ ಫಲಾನುಭವಿ ನೋಂದಣಿ (New Beneficiary)
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl hover:bg-navy-50 text-navy-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
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
                  className="w-full border border-navy-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
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
                  className="w-full border border-navy-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-navy-700 font-bold mb-1">ವಯಸ್ಸು (Age):</label>
                  <input
                    type="number"
                    value={newBeneficiary.age}
                    onChange={(e) => setNewBeneficiary({ ...newBeneficiary, age: e.target.value })}
                    placeholder="24"
                    className="w-full border border-navy-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-navy-700 font-bold mb-1">ವರ್ಗ (Category):</label>
                  <select
                    value={newBeneficiary.category}
                    onChange={(e) => setNewBeneficiary({ ...newBeneficiary, category: e.target.value })}
                    className="w-full border border-navy-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none bg-white"
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
                  className="w-full border border-navy-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-navy-200 text-navy hover:bg-ivory-bg active:scale-[0.98]"
              >
                ರದ್ದುಮಾಡಿ
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-hover active:scale-[0.98]"
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
