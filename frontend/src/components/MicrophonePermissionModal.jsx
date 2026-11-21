import React from 'react';
import { MicOff, AlertCircle, RefreshCw, X, ShieldAlert } from 'lucide-react';

export default function MicrophonePermissionModal({ isOpen, onClose, onRetry, errorMessage }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-navy-200">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-emergency-100 flex items-center justify-center text-emergency-600">
            <MicOff className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-navy-400 hover:text-navy-600 hover:bg-navy-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-navy-900 font-kannada leading-snug">
          ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ
        </h3>
        <p className="text-xs font-medium text-navy-600 mb-3">
          Microphone Permission Required for Voice Recording
        </p>

        <div className="bg-navy-50 rounded-xl p-3 border border-navy-100 text-xs text-navy-700 space-y-2 mb-4">
          <p className="font-semibold text-navy-800">
            Android ಮೊಬೈಲ್ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಅನುಮತಿ ನೀಡುವ ವಿಧಾನ:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-navy-600">
            <li>ಬ್ರೌಸರ್ ಮೇಲ್ಭಾಗದಲ್ಲಿರುವ 🔒 <strong>ಲಾಕ್ ಐಕಾನ್</strong> ಕ್ಲಿಕ್ ಮಾಡಿ.</li>
            <li><strong>Permissions / ಸೈಟ್ ಸೆಟ್ಟಿಂಗ್ಸ್</strong> ಆಯ್ಕೆಮಾಡಿ.</li>
            <li><strong>Microphone</strong> ಅನ್ನು <em>'Allow / ಅನುಮತಿಸಿ'</em> ಎಂದು ಬದಲಾಯಿಸಿ.</li>
            <li>ನಂತರ ಕೆಳಗಿನ 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ' ಬಟನ್ ಒತ್ತಿ.</li>
          </ol>
        </div>

        {errorMessage && (
          <div className="text-[11px] text-emergency-700 bg-emergency-50 p-2.5 rounded-lg border border-emergency-200 mb-4 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-emergency-600" />
            <span className="font-mono">{errorMessage}</span>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-navy-200 text-navy-700 font-semibold text-sm hover:bg-navy-50 active:scale-95 transition-all"
          >
            ರದ್ದುಮಾಡಿ (Cancel)
          </button>
          <button
            onClick={onRetry}
            className="flex-1 py-3 px-4 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 shadow-touch active:scale-95 transition-all flex items-center justify-center space-x-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            <span>ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ (Retry)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
