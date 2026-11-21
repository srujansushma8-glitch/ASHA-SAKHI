import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Filter, 
  ChevronRight, 
  Phone, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  X, 
  Check, 
  Mic, 
  Activity,
  ArrowLeft
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
    <div className="space-y-4 pb-24 max-w-2xl mx-auto px-4 pt-3">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-kannada text-navy-900 leading-tight">
            ಫಲಾನುಭವಿಗಳ ಪಟ್ಟಿ
          </h2>
          <p className="text-xs text-navy-500 font-mono">Beneficiary Management</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-touch flex items-center space-x-1 touch-manipulation"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>ಹೊಸ ನೋಂದಣಿ</span>
        </button>
      </div>

      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ಹೆಸರು, RCH ID ಅಥವಾ ಗ್ರಾಮದ ಮೂಲಕ ಹುಡುಕಿ..."
          className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: 'ಎಲ್ಲಾ (All)' },
          { id: 'ANC', label: 'ಗರ್ಭಿಣಿಯರು (ANC)' },
          { id: 'PNC', label: 'ಬಾಣಂತಿಯರು (PNC)' },
          { id: 'Immunization', label: 'ಶಿಶು ಲಸಿಕೆ (Child)' },
          { id: 'NCD', label: 'ದೀರ್ಘಕಾಲಿಕ (NCD)' }
        ].map((pill) => (
          <button
            key={pill.id}
            onClick={() => setCategoryFilter(pill.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all touch-manipulation ${
              categoryFilter === pill.id
                ? 'bg-teal-700 text-white shadow-sm'
                : 'bg-white text-navy-700 border border-navy-200 hover:bg-navy-50'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Beneficiary List */}
      <div className="space-y-2.5">
        {filteredBeneficiaries.map((b) => (
          <div
            key={b.id}
            onClick={() => setSelectedProfile(b)}
            className="bg-white rounded-2xl p-4 border border-navy-100 hover:border-teal-300 shadow-sm cursor-pointer transition-all active:scale-[0.99] touch-manipulation"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-navy-900 font-kannada">
                    {b.name_kn || b.name_en}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                    {b.category}
                  </span>
                  {b.highRisk && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emergency-100 text-emergency-700 border border-emergency-300 flex items-center space-x-0.5">
                      <AlertTriangle className="w-3 h-3 text-emergency-600" />
                      <span>High Risk</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-navy-500 font-mono mt-0.5">{b.name_en} • ID: {b.id}</p>
                <p className="text-xs text-navy-600 mt-1 font-medium">{b.subCategory}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-navy-400 mt-1" />
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-navy-50 text-[11px] text-navy-500">
              <span className="flex items-center">
                <MapPin className="w-3 h-3 mr-1 text-navy-400" />
                {b.village}
              </span>
              <span>ಕೊನೆಯ ಭೇಟಿ: {b.lastVisitDate || 'N/A'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Beneficiary Profile Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl border border-navy-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-navy-100 pb-3 mb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-black font-kannada text-navy-900">
                    {selectedProfile.name_kn || selectedProfile.name_en}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    {selectedProfile.category}
                  </span>
                </div>
                <p className="text-xs text-navy-500 font-mono">{selectedProfile.name_en} ({selectedProfile.id})</p>
              </div>
              <button
                onClick={() => setSelectedProfile(null)}
                className="p-1 rounded-lg text-navy-400 hover:text-navy-600 hover:bg-navy-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Vitals & Details */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="p-2.5 rounded-xl bg-navy-50 border border-navy-100">
                <span className="text-[10px] text-navy-400 block uppercase font-bold">ವಯಸ್ಸು (Age)</span>
                <span className="font-bold text-navy-900">{selectedProfile.age} ವರ್ಷ</span>
              </div>
              <div className="p-2.5 rounded-xl bg-navy-50 border border-navy-100">
                <span className="text-[10px] text-navy-400 block uppercase font-bold">ತೂಕ (Weight)</span>
                <span className="font-bold text-navy-900">{selectedProfile.weight || '56.0'} kg</span>
              </div>
              <div className="p-2.5 rounded-xl bg-navy-50 border border-navy-100">
                <span className="text-[10px] text-navy-400 block uppercase font-bold">ರಕ್ತದ ಗುಂಪು</span>
                <span className="font-bold text-navy-900">{selectedProfile.bloodGroup || 'B+'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-navy-50 border border-navy-100">
                <span className="text-[10px] text-navy-400 block uppercase font-bold">ಫೋನ್ ಸಂಖ್ಯೆ</span>
                <span className="font-bold text-navy-900 font-mono">{selectedProfile.phone || '98450XXXXX'}</span>
              </div>
            </div>

            {/* Vaccination Status */}
            <div className="bg-navy-50 rounded-2xl p-3 border border-navy-100 mb-4 text-xs space-y-2">
              <span className="text-[11px] font-bold text-navy-800 font-kannada block">
                ಲಸಿಕಾ ಸ್ಥಿತಿ (Immunization Tracker):
              </span>
              <div>
                <span className="text-[10px] text-emerald-700 font-bold block">ಪೂರ್ಣಗೊಂಡ ಲಸಿಕೆಗಳು:</span>
                <p className="text-navy-700 font-medium">
                  {selectedProfile.vaccinationsCompleted?.join(', ') || 'ಯಾವುದೂ ದಾಖಲಾಗಿಲ್ಲ'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-amber-700 font-bold block">ಬಾಕಿ ಇರುವ ಲಸಿಕೆಗಳು:</span>
                <p className="text-navy-700 font-medium">
                  {selectedProfile.vaccinationsDue?.join(', ') || 'ಯಾವುದೂ ಬಾಕಿ ಇಲ್ಲ'}
                </p>
              </div>
            </div>

            {/* Visit History Timeline */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-navy-800 font-kannada mb-2">
                ಭೇಟಿ ಇತಿಹಾಸ (Visit History Timeline):
              </h4>
              <div className="space-y-2">
                {selectedProfile.visitHistory && selectedProfile.visitHistory.length > 0 ? (
                  selectedProfile.visitHistory.map((vh, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white border border-navy-100 text-xs">
                      <div className="flex items-center justify-between font-bold text-navy-800">
                        <span>{vh.type}</span>
                        <span className="font-mono text-[11px] text-navy-500">{vh.date}</span>
                      </div>
                      <p className="text-[11px] text-navy-600 mt-1">{vh.notes}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-navy-400 italic">ಹಿಂದಿನ ಭೇಟಿಗಳ ವಿವರ ಲಭ್ಯವಿಲ್ಲ.</p>
                )}
              </div>
            </div>

            {/* Action: Start Voice Visit for this beneficiary */}
            <button
              onClick={() => {
                setSelectedProfile(null);
                if (onStartVoiceVisit) onStartVoiceVisit(selectedProfile.id);
              }}
              className="w-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold py-3 px-4 rounded-xl shadow-touch flex items-center justify-center space-x-2 text-xs touch-manipulation"
            >
              <Mic className="w-4 h-4" />
              <span>ಈ ಫಲಾನುಭವಿಗೆ ಧ್ವನಿ ಭೇಟಿ ಪ್ರಾರಂಭಿಸಿ (Start Voice Visit)</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Beneficiary Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-navy-200">
            <div className="flex items-center justify-between mb-3 border-b border-navy-100 pb-2">
              <h3 className="text-sm font-bold font-kannada text-navy-900">
                ಹೊಸ ಫಲಾನುಭವಿ ನೋಂದಣಿ (New Registration)
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-navy-400 hover:text-navy-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-navy-700 font-kannada block mb-1">
                  ಹೆಸರು (ಕನ್ನಡದಲ್ಲಿ):
                </label>
                <input
                  type="text"
                  required
                  placeholder="ಉದಾ: ಶಾರದಾ ಕೆ."
                  value={newBeneficiary.name_kn}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, name_kn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-navy-300 text-xs focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-navy-700 block mb-1">
                  Name (in English):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sharada K."
                  value={newBeneficiary.name_en}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, name_en: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-navy-300 text-xs focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-navy-700 block mb-1">ವರ್ಗ (Category):</label>
                  <select
                    value={newBeneficiary.category}
                    onChange={(e) => setNewBeneficiary({ ...newBeneficiary, category: e.target.value })}
                    className="w-full p-2 rounded-xl border border-navy-300 text-xs font-semibold"
                  >
                    <option value="ANC">ANC (ಗರ್ಭಿಣಿ)</option>
                    <option value="PNC">PNC (ಬಾಣಂತಿ)</option>
                    <option value="Immunization">Child (ಲಸಿಕೆ)</option>
                    <option value="NCD">NCD (ದೀರ್ಘಕಾಲಿಕ)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-navy-700 block mb-1">ವಯಸ್ಸು (Age):</label>
                  <input
                    type="number"
                    placeholder="24"
                    value={newBeneficiary.age}
                    onChange={(e) => setNewBeneficiary({ ...newBeneficiary, age: e.target.value })}
                    className="w-full p-2 rounded-xl border border-navy-300 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-navy-700 block mb-1">ಗ್ರಾಮ / ವಾರ್ಡ್:</label>
                <input
                  type="text"
                  value={newBeneficiary.village}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, village: e.target.value })}
                  className="w-full p-2 rounded-xl border border-navy-300 text-xs font-medium"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-navy-200 text-navy-700 font-semibold text-xs"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 shadow-touch"
                >
                  ದಾಖಲಿಸಿ (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
