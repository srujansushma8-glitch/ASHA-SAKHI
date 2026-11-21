import React, { useState } from 'react';
import { X, Lock, Phone, KeyRound, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const { t } = useLanguage();
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('9845012345');
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [role, setRole] = useState('asha'); // 'asha', 'anm', 'mo'
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 600);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess({
          phoneNumber,
          role,
          name: role === 'asha' ? 'Sharada Bai' : role === 'anm' ? 'Pushpalatha ANM' : 'Dr. Rajesh MO'
        });
      }
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#3B2A33]/50 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 border border-[#F0DDE2] shadow-2xl relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#7A6670] hover:text-[#3B2A33] hover:bg-[#FDF6F5] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#A25B74] to-[#C47A92] text-white flex items-center justify-center mx-auto shadow-md shadow-[#A25B74]/25">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-cormorant font-bold text-[#3B2A33]">
            {step === 'phone' ? t('auth.title') : t('auth.otpLabel')}
          </h3>
          <p className="text-xs text-[#7A6670]">
            {step === 'phone'
              ? t('auth.subtitle')
              : `+91 ${phoneNumber}`}
          </p>
        </div>

        {/* Role Selector */}
        {step === 'phone' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold font-mono text-[#A25B74] uppercase tracking-wider block">
              {t('auth.selectRole')}
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'asha', label: t('auth.roleAsha'), icon: '👩‍⚕️' },
                { id: 'anm', label: t('auth.roleAnm'), icon: '🩺' },
                { id: 'mo', label: t('auth.roleMo'), icon: '🏥' }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    role === r.id
                      ? 'bg-[#A25B74] text-white border-[#A25B74] shadow-xs font-bold'
                      : 'bg-[#FDF6F5] text-[#7A6670] border border-[#F0DDE2] hover:bg-[#F9ECEC]'
                  }`}
                >
                  <span className="block text-base mb-0.5">{r.icon}</span>
                  <span className="text-[11px] font-semibold">{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Phone Form */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3B2A33] block">
                {t('auth.phoneLabel')}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-xs font-bold text-[#A25B74] font-mono">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t('auth.phonePlaceholder')}
                  className="w-full text-sm font-mono font-bold pl-12 pr-4 py-3 bg-white border border-[#F0DDE2] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A25B74] text-[#3B2A33]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#A25B74] hover:bg-[#84455C] text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-[#A25B74]/25 flex items-center justify-center space-x-2 text-sm active:scale-95 transition-all"
            >
              <span>{loading ? t('common.loading') : t('auth.sendOtp')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: OTP Form */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="flex justify-center space-x-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const newOtp = [...otp];
                    newOtp[idx] = e.target.value;
                    setOtp(newOtp);
                  }}
                  className="w-11 h-12 text-center text-lg font-mono font-bold bg-white border border-[#F0DDE2] rounded-xl focus:ring-2 focus:ring-[#A25B74] focus:outline-none text-[#3B2A33]"
                />
              ))}
            </div>

            <div className="text-center text-xs text-[#477A60] font-mono font-semibold">
              ✓ {t('auth.demoLogin')} (123456)
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#A25B74] hover:bg-[#84455C] text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-[#A25B74]/25 flex items-center justify-center space-x-2 text-sm active:scale-95 transition-all"
            >
              <span>{loading ? t('common.loading') : t('auth.verifyOtp')}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-center text-xs font-bold text-[#A25B74] hover:underline"
            >
              ← {t('common.back')}
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-[10px] text-[#7A6670] border-t border-[#F0DDE2]">
          🔒 ABDM FHIR & NHM Compliant
        </div>
      </div>
    </div>
  );
}
