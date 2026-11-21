import React from 'react';
import { Volume2, AlertTriangle, Globe, Wifi, WifiOff, HeartPulse } from 'lucide-react';
import { isDemoMode, setDemoMode } from '../services/api';

export default function Navbar({
  currentLanguage,
  onLanguageChange,
  activeScreen,
  setActiveScreen,
  emergencyCount = 0,
}) {
  const [demo, setDemo] = React.useState(isDemoMode());
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleDemoChange = (e) => setDemo(e.detail.enabled);
    window.addEventListener('asha_demo_mode_changed', handleDemoChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('asha_demo_mode_changed', handleDemoChange);
    };
  }, []);

  const toggleDemoMode = () => {
    const next = !demo;
    setDemo(next);
    setDemoMode(next);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-navy-100 shadow-subtle">
      {/* Primary Brand & Actions Bar */}
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div 
          className="flex items-center space-x-2.5 cursor-pointer select-none active:scale-[0.98] transition-decelerate"
          onClick={() => setActiveScreen('home')}
        >
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-touch relative">
            <HeartPulse className="w-5 h-5 text-mint-surface" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-healthcare rounded-full border-2 border-white"></span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base text-navy font-kannada tracking-tight">
                ಆಶಾ ಸಖಿ
              </span>
              <span className="text-[11px] font-bold text-primary font-mono uppercase bg-primary-50 px-1.5 py-0.5 rounded border border-primary-100">
                ASHA SAKHI
              </span>
            </div>
            <p className="text-[11px] text-navy-500 font-medium">
              AI4Bharat Voice Field Register
            </p>
          </div>
        </div>

        {/* Top Control Actions */}
        <div className="flex items-center space-x-2">
          {/* Emergency Alert Pill (Reserved Red only when danger signs exist) */}
          {emergencyCount > 0 && (
            <button
              onClick={() => setActiveScreen('emergency')}
              className="flex items-center space-x-1 bg-emergency text-white text-xs font-semibold px-2.5 py-1.5 rounded-full shadow-emergency animate-pulse active:scale-[0.98] transition-decelerate"
              title="ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳು / Emergency Alerts"
              aria-label="Active Emergency Alerts"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
              <span>{emergencyCount}</span>
            </button>
          )}

          {/* Mode Switcher: Mock Demo vs Live Backend */}
          <button
            onClick={toggleDemoMode}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border active:scale-[0.98] transition-decelerate ${
              demo
                ? 'bg-primary-50 text-primary border-primary-200 hover:bg-primary-100'
                : 'bg-healthcare-50 text-healthcare-700 border-healthcare-200 hover:bg-healthcare-100'
            }`}
            title="Toggle Demo Mode or Live Backend"
          >
            <span className={`w-2 h-2 rounded-full ${demo ? 'bg-primary' : 'bg-healthcare'}`}></span>
            <span className="hidden sm:inline font-semibold">{demo ? 'Demo Mode' : 'Live API'}</span>
            <span className="sm:hidden font-semibold">{demo ? 'Demo' : 'Live'}</span>
          </button>

          {/* Language Toggle: Kannada / Mixed / English */}
          <button
            onClick={() => onLanguageChange(currentLanguage === 'kn' ? 'kn-en' : currentLanguage === 'kn-en' ? 'en' : 'kn')}
            className="flex items-center space-x-1 bg-ivory-bg hover:bg-navy-50 text-navy-800 text-xs px-2.5 py-1 rounded-lg border border-navy-200 active:scale-[0.98] transition-decelerate"
            title="ಭಾಷೆ ಬದಲಿಸಿ / Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold">
              {currentLanguage === 'kn' ? 'ಕನ್ನಡ' : currentLanguage === 'kn-en' ? 'ಕನ್+Eng' : 'English'}
            </span>
          </button>
        </div>
      </div>

      {/* Subheader Status Bar */}
      <div className="bg-navy-50/80 px-4 py-1 border-t border-navy-100 flex items-center justify-between text-[11px] text-navy-600 font-medium">
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-healthcare"></span>
          <span>ಮಂಡ್ಯ ತಾಲೂಕು PHC (Mandya Sector 4)</span>
        </div>
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <span className="flex items-center text-healthcare space-x-1 font-semibold">
              <Wifi className="w-3 h-3" />
              <span>ಆನ್‌ಲೈನ್</span>
            </span>
          ) : (
            <span className="flex items-center text-warning-700 space-x-1 font-semibold">
              <WifiOff className="w-3 h-3" />
              <span>ಆಫ್‌ಲೈನ್ ಸಿಂಕ್</span>
            </span>
          )}
          <span className="text-navy-300">•</span>
          <span className="text-primary font-mono text-[10px] font-bold">Indic-Transcribe</span>
        </div>
      </div>
    </header>
  );
}
