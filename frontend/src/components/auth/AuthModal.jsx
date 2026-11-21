import React, { useState } from 'react';
import { Phone, Lock, CheckCircle2, X, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState('98450 12345');
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [role, setRole] = useState('asha'); // 'asha' | 'anm' | 'mo'
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
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
          name: role === 'asha' ? 'ಶಾರದಾ ಬಾಯಿ (Sharada)' : role === 'anm' ? 'ಲತಾ ಮೇಡಂ (Latha ANM)' : 'Dr. R. Manjunath (MO)'
        });
      }
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white dark:bg-navy-900 w-full max-w-md rounded-3xl p-6 sm:p-8 border border-navy-200/80 dark:border-navy-700 shadow-2xl relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-navy-400 hover:text-navy-700 dark:hover:text-white hover:bg-cream-200 dark:hover:bg-navy-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-cyan text-white flex items-center justify-center mx-auto shadow-touch">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-serif text-navy-900 dark:text-white">
            {step === 'phone' ? 'ಕಾರ್ಯಕರ್ತೆ ಲಾಗಿನ್ (Worker Sign In)' : 'OTP ದೃಢೀಕರಣ (Verify OTP)'}
          </h3>
          <p className="text-xs text-navy-500 dark:text-navy-300">
            {step === 'phone'
              ? 'ಆಶಾ ಸಖಿ ಪೋರ್ಟಲ್ ಪ್ರವೇಶಿಸಲು ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ'
              : `+91 ${phoneNumber} ಸಂಖ್ಯೆಗೆ ಕಳುಹಿಸಲಾದ 6-ಅಂಕಿಯ ಕೋಡ್ ನಮೂದಿಸಿ`}
          </p>
        </div>

        {/* Role Selector */}
        {step === 'phone' && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold font-mono text-navy-500 uppercase tracking-wider block">
              ಪಾತ್ರ ಆಯ್ಕೆಮಾಡಿ (Select Role):
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'asha', label: 'ಆಶಾ (ASHA)', icon: '👩‍⚕️' },
                { id: 'anm', label: 'ANM ಸೂಪರ್', icon: '🩺' },
                { id: 'mo', label: 'ವೈದ್ಯಾಧಿಕಾರಿ (MO)', icon: '🏥' }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`p-2.5 rounded-2xl border text-center transition-all ${
                    role === r.id
                      ? 'bg-primary text-white border-primary shadow-sm font-bold'
                      : 'bg-cream-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 border-navy-200 dark:border-navy-700'
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
              <label className="text-xs font-bold text-navy-700 dark:text-navy-200 block">
                ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Mobile Number):
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-xs font-bold text-navy-400 font-mono">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="98450 XXXXX"
                  className="w-full text-sm font-mono font-bold pl-12 pr-4 py-3 bg-cream-100 dark:bg-navy-800 border border-navy-200 dark:border-navy-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary text-navy-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-deep to-primary hover:from-teal-800 hover:to-primary-hover text-white font-bold py-3.5 px-4 rounded-2xl shadow-touch flex items-center justify-center space-x-2 text-sm active:scale-95 transition-decelerate"
            >
              <span>{loading ? 'ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...' : 'OTP ಕೋಡ್ ಪಡೆಯಿರಿ (Send OTP)'}</span>
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
                  className="w-11 h-12 text-center text-lg font-mono font-bold bg-cream-100 dark:bg-navy-800 border border-navy-300 dark:border-navy-700 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-navy-900 dark:text-white"
                />
              ))}
            </div>

            <div className="text-center text-xs text-healthcare font-mono font-semibold">
              ✓ ಡೆಮೊ ಕೋಡ್ ಸ್ವಯಂ ಭರ್ತಿಯಾಗಿದೆ (123456)
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-saffron to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-saffron flex items-center justify-center space-x-2 text-sm active:scale-95 transition-decelerate"
            >
              <span>{loading ? 'ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ...' : 'ದೃಢೀಕರಿಸಿ ಲಾಗಿನ್ ಆಗಿ (Verify & Enter)'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-center text-xs font-bold text-navy-500 dark:text-navy-400 hover:underline"
            >
              ← ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಬದಲಾಯಿಸಿ
            </button>
          </form>
        )}

        <div className="pt-2 text-center text-[10px] text-navy-400 border-t border-navy-100 dark:border-navy-800">
          🔒 NHM ದತ್ತಾಂಶ ರಕ್ಷಣಾ ಮಾನದಂಡಗಳಿಗೆ ಅನುಗುಣವಾಗಿದೆ (ABDM FHIR Ready)
        </div>
      </div>
    </div>
  );
}
