import React, { useState } from 'react';
import { 
  IndianRupee, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  Download, 
  Send, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  Filter,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';

export default function IncentivesReportScreen({ onBack }) {
  const { t, currentLanguage, formatCurrency } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [submittedToAnm, setSubmittedToAnm] = useState(false);

  const monthNames = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun (Current)'],
    kn: ['ಜನವರಿ', 'ಫೆಬ್ರವರಿ', 'ಮಾರ್ಚ್', 'ಏಪ್ರಿಲ್', 'ಮೇ', 'ಜೂನ್ (ಪ್ರಸ್ತುತ)'],
    hi: ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून (वर्तमान)']
  };
  const activeMonths = monthNames[currentLanguage] || monthNames.en;

  const monthlyData = [
    { month: activeMonths[0], earned: 5200, potential: 6500 },
    { month: activeMonths[1], earned: 5800, potential: 7000 },
    { month: activeMonths[2], earned: 6400, potential: 7500 },
    { month: activeMonths[3], earned: 6100, potential: 7200 },
    { month: activeMonths[4], earned: 7100, potential: 8000 },
    { month: activeMonths[5], earned: 6850, potential: 8200 },
  ];

  const activities = [
    {
      id: 'CLM-2026-0601',
      task_en: 'Janani Suraksha Yojana (JSY) Institutional Delivery Support',
      task_kn: 'ಜನನಿ ಸುರಕ್ಷಾ ಯೋಜನೆ (JSY) ಆಸ್ಪತ್ರೆ ಹೆರಿಗೆ ಬೆಂಬಲ',
      task_hi: 'जननी सुरक्षा योजना (JSY) संस्थागत प्रसव सहायता',
      beneficiary: 'Lakshmi Devi',
      date: '2026-06-02',
      amount: 600,
      status: 'approved',
      approvedBy: 'Pushpalatha ANM'
    },
    {
      id: 'CLM-2026-0602',
      task_en: 'Complete 1-Year Child Immunization Certification',
      task_kn: 'ಸಂಪೂರ್ಣ 1 ವರ್ಷದ ಮಕ್ಕಳ ಲಸಿಕಾ ಪ್ರಮಾಣೀಕರಣ',
      task_hi: 'पूर्ण 1 वर्षीय बाल टीकाकरण प्रमाणीकरण',
      beneficiary: 'Pooja Suresh Infant',
      date: '2026-06-05',
      amount: 400,
      status: 'approved',
      approvedBy: 'Pushpalatha ANM'
    },
    {
      id: 'CLM-2026-0603',
      task_en: '4 Mandatory ANC Checkups & IFA Tablet Distribution',
      task_kn: '4 ಕಡ್ಡಾಯ ANC ತಪಾಸಣೆ ಮತ್ತು IFA ಮಾತ್ರೆ ವಿತರಣೆ',
      task_hi: '4 अनिवार्य प्रसवपूर्व जांच एवं आईएफए वितरण',
      beneficiary: 'Meenakshi',
      date: '2026-06-08',
      amount: 300,
      status: 'approved',
      approvedBy: 'Dr. Rajesh MO'
    },
    {
      id: 'CLM-2026-0604',
      task_en: 'Home-Based Newborn Care (HBNC - 6 visits completed)',
      task_kn: 'ಗೃಹಾಧಾರಿತ ನವಜಾತ ಶಿಶು ಆರೈಕೆ (HBNC - 6 ಭೇಟಿಗಳು)',
      task_hi: 'गृह-आधारित नवजात शिशु देखभाल (HBNC - 6 दौरे)',
      beneficiary: 'Soundarya Kumar',
      date: '2026-06-11',
      amount: 250,
      status: 'approved',
      approvedBy: 'Pushpalatha ANM'
    },
    {
      id: 'CLM-2026-0605',
      task_en: 'High-Risk Pregnancy Early Detection & 108 Emergency Referral',
      task_kn: 'ತೀವ್ರ ರಕ್ತಹೀನತೆ ಆರಂಭಿಕ ಪತ್ತೆ & 108 ತುರ್ತು ರೆಫರಲ್',
      task_hi: 'उच्च जोखिम गर्भावस्था पहचान एवं 108 रेफरल',
      beneficiary: 'Meenakshi',
      date: '2026-06-14',
      amount: 300,
      status: 'under_review',
      approvedBy: 'Dr. Rajesh MO'
    },
    {
      id: 'CLM-2026-0606',
      task_en: 'Village Health Sanitation & Nutrition Day (VHSND) Mobilization',
      task_kn: 'ಗ್ರಾಮ ನೈರ್ಮಲ್ಯ ಮತ್ತು ಪೌಷ್ಟಿಕಾಂಶ ದಿನ (VHSND)',
      task_hi: 'ग्राम स्वास्थ्य स्वच्छता एवं पोषण दिवस (VHSND)',
      beneficiary: 'Shivalli Sub-Centre Community',
      date: '2026-06-17',
      amount: 200,
      status: 'approved',
      approvedBy: 'Pushpalatha ANM'
    },
    {
      id: 'CLM-2026-0607',
      task_en: 'Postpartum Family Planning Counseling Visit',
      task_kn: 'ಕುಟುಂಬ ಯೋಜನೆ ಸಲಹಾ ಭೇಟಿ ಮತ್ತು ಆಪ್ತಸಮಾಲೋಚನೆ',
      task_hi: 'प्रसवोत्तर परिवार नियोजन परामर्श',
      beneficiary: 'Renuka Bai',
      date: '2026-06-19',
      amount: 150,
      status: 'pending',
      approvedBy: t('common.pending')
    }
  ];

  const getTaskName = (act) => {
    if (currentLanguage === 'kn') return act.task_kn || act.task_en;
    if (currentLanguage === 'hi') return act.task_hi || act.task_en;
    return act.task_en;
  };

  const filtered = activities.filter(act => {
    if (selectedFilter === 'all') return true;
    return act.status === selectedFilter;
  });

  const totalEarned = activities.filter(a => a.status === 'approved').reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12">
      {/* 1. Header */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-[#F0DDE2] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] text-[#3B2A33] hover:bg-[#F9ECEC] active:scale-[0.98] transition-decelerate"
            title={t("common.back")}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
              <h1 className="text-lg lg:text-xl font-bold text-[#3B2A33] leading-tight">
                {t("incentives.title")}
              </h1>
            </div>
            <p className="text-xs text-[#7A6670] font-medium mt-0.5">
              {t("incentives.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSubmittedToAnm(true)}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center space-x-2 active:scale-95 transition-all ${
              submittedToAnm
                ? 'bg-[#E8F7F1] text-[#477A60] border border-[#C8EEDD]'
                : 'bg-[#A25B74] hover:bg-[#84455C] text-white shadow-md shadow-[#A25B74]/20'
            }`}
          >
            {submittedToAnm ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#477A60]" />
                <span>{t("common.verified")}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{t("incentives.submitClaim")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-[#F0DDE2] shadow-card">
          <span className="text-xs font-bold text-[#7A6670] block">{t("incentives.totalEarned")}</span>
          <span className="text-3xl font-bold font-mono text-[#A25B74] mt-2 block">{formatCurrency(6850)}</span>
          <span className="text-[11px] text-[#477A60] font-semibold mt-1 block">+12%</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#F0DDE2] shadow-card">
          <span className="text-xs font-bold text-[#7A6670] block">{t("incentives.approvedByMo")}</span>
          <span className="text-3xl font-bold font-mono text-[#477A60] mt-2 block">{formatCurrency(totalEarned)}</span>
          <span className="text-[11px] text-[#7A6670] font-medium mt-1 block">DBT Payout</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#F0DDE2] shadow-card">
          <span className="text-xs font-bold text-[#7A6670] block">{t("incentives.pendingVerification")}</span>
          <span className="text-3xl font-bold font-mono text-amber-600 mt-2 block">{formatCurrency(450)}</span>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">2 Claims</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#F0DDE2] shadow-card">
          <span className="text-xs font-bold text-[#7A6670] block">{t("incentives.potentialEarnings")}</span>
          <span className="text-3xl font-bold font-mono text-[#3B2A33] mt-2 block">{formatCurrency(8200)}</span>
          <span className="text-[11px] text-[#7A6670] font-medium mt-1 block">Monthly Target</span>
        </div>
      </div>

      {/* 3. Monthly Chart and Itemized Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Chart (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-4">
          <h3 className="font-bold text-base text-[#3B2A33]">
            {t("incentives.totalEarned")} Trend
          </h3>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0DDE2" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7A6670' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7A6670' }} tickLine={false} />
                <Tooltip formatter={(val) => [`₹${val}`, 'Amount']} />
                <Bar dataKey="earned" fill="#A25B74" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ledger Table (Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
            <h3 className="font-bold text-base text-[#3B2A33]">
              {t("incentives.activityLedger")}
            </h3>
            <div className="flex items-center space-x-1">
              {['all', 'approved', 'pending'].map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedFilter === f
                      ? 'bg-[#A25B74] text-white'
                      : 'bg-[#FDF6F5] text-[#7A6670] hover:bg-[#F9ECEC]'
                  }`}
                >
                  {t(`common.${f === 'under_review' ? 'pending' : f}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F0DDE2] text-[11px] font-bold text-[#C47A92] uppercase tracking-wider font-mono">
                  <th className="pb-3">{t("common.actions")}</th>
                  <th className="pb-3">{t("common.beneficiary")}</th>
                  <th className="pb-3">{t("common.date")}</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-center">{t("common.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0DDE2]">
                {filtered.map(act => (
                  <tr key={act.id} className="hover:bg-[#FDF6F5] transition-colors">
                    <td className="py-3 pr-2">
                      <span className="font-bold text-[#3B2A33] block">{getTaskName(act)}</span>
                      <span className="font-mono text-[10px] text-[#7A6670]">{act.id}</span>
                    </td>
                    <td className="py-3 pr-2 font-medium text-[#3B2A33]">{act.beneficiary}</td>
                    <td className="py-3 pr-2 font-mono text-[#7A6670]">{act.date}</td>
                    <td className="py-3 pr-2 font-mono font-bold text-[#A25B74] text-right">₹{act.amount}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        act.status === 'approved'
                          ? 'bg-[#E8F7F1] text-[#477A60] border border-[#C8EEDD]'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {act.status === 'approved' ? t("common.completed") : t("common.pending")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
