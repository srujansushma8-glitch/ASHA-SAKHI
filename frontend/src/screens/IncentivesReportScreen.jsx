import React, { useState } from 'react';
import { 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  Download, 
  Filter, 
  Send, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  UserCheck, 
  Baby, 
  ShieldCheck,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';

export default function IncentivesReportScreen({ onBack }) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'approved', 'under_review', 'pending'
  const [submittedToANM, setSubmittedToANM] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Realistic National Health Mission (NHM) Monthly Earnings Data
  const monthlyData = [
    { month: 'ಜನವರಿ', earned: 5200, potential: 6500 },
    { month: 'ಫೆಬ್ರವರಿ', earned: 5800, potential: 7000 },
    { month: 'ಮಾರ್ಚ್', earned: 6400, potential: 7500 },
    { month: 'ಏಪ್ರಿಲ್', earned: 6100, potential: 7200 },
    { month: 'ಮೇ', earned: 7100, potential: 8000 },
    { month: 'ಜೂನ್ (ಪ್ರಸ್ತುತ)', earned: 6850, potential: 8200 },
  ];

  // Itemized claims ledger
  const initialClaims = [
    {
      id: 'CLM-2024-0891',
      task_kn: 'ಜನನಿ ಸುರಕ್ಷಾ ಯೋಜನೆ (JSY) ಆಸ್ಪತ್ರೆ ಹೆರಿಗೆ ಬೆಂಬಲ',
      task_en: 'JSY Institutional Delivery Accompaniment',
      beneficiary: 'ಲಕ್ಷ್ಮಿ ದೇವಿ (Lakshmi Devi)',
      date: '2024-06-18',
      amount: 600,
      scheme: 'NHM Maternal Health',
      status: 'approved',
      approvedBy: 'ಪುಷ್ಪಲತಾ (ANM Supervisor)',
      verificationCode: 'VER-KA-8812'
    },
    {
      id: 'CLM-2024-0892',
      task_kn: 'ಸಂಪೂರ್ಣ 1 ವರ್ಷದ ಮಕ್ಕಳ ಲಸಿಕಾ ಪ್ರಮಾಣೀಕರಣ',
      task_en: 'Full Infant Immunization (1 Year Milestone)',
      beneficiary: 'ಪೂಜಾ ಅವರ ಮಗು (Pooja Infant)',
      date: '2024-06-15',
      amount: 150,
      scheme: 'Universal Immunization Programme',
      status: 'approved',
      approvedBy: 'ಪುಷ್ಪಲತಾ (ANM Supervisor)',
      verificationCode: 'VER-KA-8809'
    },
    {
      id: 'CLM-2024-0893',
      task_kn: '4 ಕಡ್ಡಾಯ ANC ತಪಾಸಣೆ ಮತ್ತು IFA ಮಾತ್ರೆ ವಿತರಣೆ',
      task_en: 'Complete 4 ANC Checkups Tracking + IFA',
      beneficiary: 'ಮೀನಾಕ್ಷಿ (Meenakshi)',
      date: '2024-06-12',
      amount: 300,
      scheme: 'Pradhan Mantri Surakshit Matritva',
      status: 'under_review',
      approvedBy: 'ಡಾ. ರಾಜೇಶ್ (Medical Officer)',
      verificationCode: 'VER-KA-8794'
    },
    {
      id: 'CLM-2024-0894',
      task_kn: 'ಗೃಹಾಧಾರಿತ ನವಜಾತ ಶಿಶು ಆರೈಕೆ (HBNC - 6 ಭೇಟಿಗಳು)',
      task_en: 'HBNC Home Visits Protocol (6 Rounds)',
      beneficiary: 'ಸೌಂದರ್ಯ ಕುಮಾರ್ (Soundarya Kumar)',
      date: '2024-06-10',
      amount: 250,
      scheme: 'NHM Child Health',
      status: 'approved',
      approvedBy: 'ಪುಷ್ಪಲತಾ (ANM Supervisor)',
      verificationCode: 'VER-KA-8780'
    },
    {
      id: 'CLM-2024-0895',
      task_kn: 'ತೀವ್ರ ರಕ್ತಹೀನತೆ ಆರಂಭಿಕ ಪತ್ತೆ & 108 ತುರ್ತು ರೆಫರಲ್',
      task_en: 'High-Risk Pregnancy Detection & Referral',
      beneficiary: 'ಮೀನಾಕ್ಷಿ (Meenakshi)',
      date: '2024-06-08',
      amount: 200,
      scheme: 'High-Risk Referral Incentive',
      status: 'under_review',
      approvedBy: 'ಡಾ. ರಾಜೇಶ್ (Medical Officer)',
      verificationCode: 'VER-KA-8772'
    },
    {
      id: 'CLM-2024-0896',
      task_kn: 'ಗ್ರಾಮ ನೈರ್ಮಲ್ಯ ಮತ್ತು ಪೌಷ್ಟಿಕಾಂಶ ದಿನ (VHSND)',
      task_en: 'Monthly VHSND Village Health Day Organization',
      beneficiary: 'ಶಿವಳ್ಳಿ ಉಪಕೇಂದ್ರ ಸಮುದಾಯ',
      date: '2024-06-05',
      amount: 200,
      scheme: 'Community Mobilization',
      status: 'approved',
      approvedBy: 'ಪುಷ್ಪಲತಾ (ANM Supervisor)',
      verificationCode: 'VER-KA-8761'
    },
    {
      id: 'CLM-2024-0897',
      task_kn: 'ಕುಟುಂಬ ಯೋಜನೆ ಸಲಹಾ ಭೇಟಿ ಮತ್ತು ಆಪ್ತಸಮಾಲೋಚನೆ',
      task_en: 'Family Planning Counseling & Antara Injection',
      beneficiary: 'ರೇಣುಕಾ ಬಾಯಿ (Renuka Bai)',
      date: '2024-06-02',
      amount: 150,
      scheme: 'Family Welfare Programme',
      status: 'pending',
      approvedBy: 'ಬಾಕಿ ಇದೆ (Pending Submission)',
      verificationCode: 'Draft'
    }
  ];

  const filteredClaims = initialClaims.filter(c => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'approved') return c.status === 'approved';
    if (activeFilter === 'under_review') return c.status === 'under_review';
    if (activeFilter === 'pending') return c.status === 'pending';
    return true;
  });

  const totalEarned = 6850;
  const approvedTotal = 5400;
  const underReviewTotal = 1450;
  const potentialTotal = 8200;

  const handleSubmitBatch = () => {
    setSubmittedToANM(true);
    setTimeout(() => setSubmittedToANM(false), 5000);
  };

  const handleExportCSV = () => {
    const headers = ['Claim ID', 'Task (Kannada)', 'Task (English)', 'Beneficiary', 'Date', 'Amount (INR)', 'Status'];
    const rows = filteredClaims.map(c => [
      c.id,
      `"${c.task_kn}"`,
      `"${c.task_en}"`,
      `"${c.beneficiary}"`,
      c.date,
      c.amount,
      c.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ASHA_Sakhi_Incentive_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-7 animate-fade-in pb-24 lg:pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-navy-200/60 dark:border-navy-700 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-saffron/10 text-saffron-800 dark:text-saffron text-xs font-bold border border-saffron/30 mb-2">
            <IndianRupee className="w-3.5 h-3.5" />
            <span>ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ಅಭಿಯಾನ (NHM) • ಆಶಾ ಪ್ರೋತ್ಸಾಹಧನ ಲೆಕ್ಕಪತ್ರ</span>
          </div>
          <h1 className="text-2xl font-bold font-kannada text-navy-900 dark:text-white leading-tight">
            ಪ್ರೋತ್ಸಾಹಧನ ಮತ್ತು ವರದಿಗಳ ದಿನಚರಿ (Incentive Ledger)
          </h1>
          <p className="text-xs text-navy-500 dark:text-navy-400 mt-1">
            ಆಶಾ ಕಾರ್ಯಕರ್ತೆ: ಶಾರದಾ ಬಾಯಿ • ಶಿವಳ್ಳಿ ಉಪಕೇಂದ್ರ • ಮಂಡ್ಯ ತಾಲೂಕು PHC
          </p>
        </div>

        {/* Action Buttons: Export & Submit to Supervisor */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-700 text-navy-700 dark:text-navy-200 text-xs font-bold hover:bg-navy-50 dark:hover:bg-navy-700 transition-all shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>CSV ಡೌನ್‌ಲೋಡ್</span>
          </button>

          <button
            onClick={handleSubmitBatch}
            disabled={submittedToANM}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-healthcare text-white text-xs font-bold shadow-card hover:opacity-95 active:scale-95 transition-all"
          >
            {submittedToANM ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>ANM ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>ANM ಮೇಲ್ವಿಚಾರಕರಿಗೆ ಸಲ್ಲಿಸಿ (Submit to ANM)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earned This Month */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-navy-200/60 dark:border-navy-700 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-500 dark:text-navy-400">
              ಈ ತಿಂಗಳ ಒಟ್ಟು ಗಳಿಕೆ
            </span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-navy-900 dark:text-white mt-2">
            ₹{totalEarned.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-healthcare mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ಕಳೆದ ತಿಂಗಳಿಗಿಂತ +12% ಹೆಚ್ಚಳ</span>
          </div>
        </div>

        {/* Approved by ANM */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-navy-200/60 dark:border-navy-700 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-500 dark:text-navy-400">
              ANM ಅನುಮೋದಿತ
            </span>
            <div className="w-9 h-9 rounded-xl bg-healthcare/10 text-healthcare flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-healthcare mt-2">
            ₹{approvedTotal.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-navy-400 mt-2">
            ಖಾತೆಗೆ ಜಮೆ ಆಗಲು ಸಿದ್ಧ (DBT Bank Payout)
          </p>
        </div>

        {/* Under Review by MO */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-navy-200/60 dark:border-navy-700 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-500 dark:text-navy-400">
              MO ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-2">
            ₹{underReviewTotal.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-navy-400 mt-2">
            ವೈದ್ಯಾಧಿಕಾರಿಗಳ ಸಹಿ ಬಾಕಿ ಇದೆ (2 claims)
          </p>
        </div>

        {/* Projected Monthly Target */}
        <div className="bg-white dark:bg-navy-900 p-5 rounded-3xl border border-navy-200/60 dark:border-navy-700 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-500 dark:text-navy-400">
              ಗುರಿ ಸಂಭಾವನೆ (Target)
            </span>
            <div className="w-9 h-9 rounded-xl bg-saffron/10 text-saffron-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-saffron-600 mt-2">
            ₹{potentialTotal.toLocaleString('en-IN')}
          </div>
          <div className="w-full bg-navy-100 dark:bg-navy-800 h-2 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-saffron to-healthcare h-full rounded-full transition-all"
              style={{ width: `${(totalEarned / potentialTotal) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 3. Recharts Visual Analytics Section */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-navy-200/60 dark:border-navy-700 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold font-kannada text-navy-900 dark:text-white">
              ಮಾಸಿಕ ಪ್ರೋತ್ಸಾಹಧನ ಪ್ರಗತಿ (Monthly Earnings Trend)
            </h3>
            <p className="text-xs text-navy-500 dark:text-navy-400">
              ಕಳೆದ 6 ತಿಂಗಳ ಸರಾಸರಿ NHM ಪ್ರೋತ್ಸಾಹಧನ ಹೋಲಿಕೆ
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-primary"></span>
              <span className="text-navy-600 dark:text-navy-300">ಗಳಿಸಿದ ಮೊತ್ತ (₹)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-saffron/40 border border-saffron"></span>
              <span className="text-navy-600 dark:text-navy-300">ಗರಿಷ್ಠ ಗುರಿ (Target ₹)</span>
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip 
                formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'ಮೊತ್ತ']}
                contentStyle={{ 
                  backgroundColor: '#18364A', 
                  borderColor: '#087F8C', 
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '12px'
                }} 
              />
              <Bar dataKey="earned" name="ಗಳಿಸಿದ ಮೊತ್ತ" fill="#087F8C" radius={[6, 6, 0, 0]} />
              <Bar dataKey="potential" name="ಗರಿಷ್ಠ ಗುರಿ" fill="#FF9933" opacity={0.35} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Itemized Claims Ledger Table */}
      <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-navy-200/60 dark:border-navy-700 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold font-kannada text-navy-900 dark:text-white">
              ಕ್ಲೈಮ್ ವಿವರಗಳ ಪಟ್ಟಿ (Itemized NHM Claims Ledger)
            </h3>
            <p className="text-xs text-navy-500 dark:text-navy-400">
              ಪ್ರತಿಯೊಂದು ಕಾರ್ಯಕ್ಕೆ ಸರ್ಕಾರದ ದರ ಮತ್ತು ಅನುಮೋದನೆ ಸ್ಥಿತಿ
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex bg-navy-100 dark:bg-navy-800 p-1 rounded-2xl text-xs font-bold">
            {[
              { id: 'all', label: 'ಎಲ್ಲಾ (All)' },
              { id: 'approved', label: 'ಅನುಮೋದಿತ (Approved)' },
              { id: 'under_review', label: 'ಪರಿಶೀಲನೆಯಲ್ಲಿ (Review)' },
              { id: 'pending', label: 'ಬಾಕಿ (Pending)' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeFilter === f.id
                    ? 'bg-white dark:bg-navy-700 text-primary dark:text-cyan shadow-sm'
                    : 'text-navy-600 dark:text-navy-400 hover:text-navy-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-navy-100 dark:border-navy-800 text-[11px] font-mono uppercase tracking-wider text-navy-400">
                <th className="py-3 px-4">ಕ್ಲೈಮ್ ಐಡಿ</th>
                <th className="py-3 px-4">ಕಾರ್ಯ / ಯೋಜನೆ (Task Description)</th>
                <th className="py-3 px-4">ಫಲಾನುಭವಿ</th>
                <th className="py-3 px-4">ದಿನಾಂಕ</th>
                <th className="py-3 px-4 text-right">ಸರ್ಕಾರಿ ಮೊತ್ತ</th>
                <th className="py-3 px-4 text-center">ಸ್ಥಿತಿ (Status)</th>
                <th className="py-3 px-4">ಪರಿಶೀಲಕರು</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100 dark:divide-navy-800 text-xs">
              {filteredClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-navy-50/50 dark:hover:bg-navy-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy-500 dark:text-navy-400">
                    {claim.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold font-kannada text-navy-900 dark:text-white">
                      {claim.task_kn}
                    </div>
                    <div className="text-[11px] text-navy-400">
                      {claim.task_en} • <span className="text-primary font-medium">{claim.scheme}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-navy-800 dark:text-navy-200 font-kannada">
                    {claim.beneficiary}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-navy-500">
                    {claim.date}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-navy-900 dark:text-white">
                    ₹{claim.amount}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {claim.status === 'approved' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-healthcare-50 dark:bg-healthcare/10 text-healthcare text-[10px] font-bold border border-healthcare-200 dark:border-healthcare/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ಅನುಮೋದಿತ</span>
                      </span>
                    )}
                    {claim.status === 'under_review' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-200 dark:border-amber-500/30">
                        <Clock className="w-3 h-3" />
                        <span>MO ಪರಿಶೀಲನೆ</span>
                      </span>
                    )}
                    {claim.status === 'pending' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 text-[10px] font-bold">
                        <span>ಡ್ರಾಫ್ಟ್</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-navy-500 dark:text-navy-400">
                    {claim.approvedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
