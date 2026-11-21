import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Globe, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Menu, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Smartphone
} from 'lucide-react';
import { getLanguageByCode } from '../services/languages';
import { api, isDemoMode, setDemoMode } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({
  activeScreen,
  setActiveScreen,
  emergencyCount = 0,
  onOpenLanguageSelector
}) {
  const { t, currentLanguage, onLanguageChange } = useLanguage();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [demo, setDemo] = useState(isDemoMode());
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState('');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleDemoChange = (e) => setDemo(e.detail.enabled);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('asha_demo_mode_changed', handleDemoChange);

    const handleSyncUpdate = (e) => setPendingSyncCount(e.detail.count);
    window.addEventListener('asha_sync_updated', handleSyncUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('asha_demo_mode_changed', handleDemoChange);
      window.removeEventListener('asha_sync_updated', handleSyncUpdate);
    };
  }, []);

  const triggerSync = async () => {
    if (isSyncing || pendingSyncCount === 0) return;
    setIsSyncing(true);
    try {
      const res = await api.syncPendingQueue();
      if (res.syncedCount > 0) {
        setSyncToast(`${res.syncedCount} ${t("common.saved")}`);
        setTimeout(() => setSyncToast(''), 3500);
      }
    } catch (e) {
      console.warn('Sync error', e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFF9F7]/95 backdrop-blur-md border-b border-[#F0DDE2] shadow-subtle">
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div 
          className="flex items-center space-x-2.5 cursor-pointer select-none active:scale-[0.98] transition-transform"
          onClick={() => setActiveScreen('home')}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#A25B74] to-[#C47A92] text-white flex items-center justify-center shadow-xs relative">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3c-1.5 3-3.5 5.5-6 7 2.5 1.5 4.5 4 6 7 1.5-3 3.5-5.5 6-7-2.5-1.5-4.5-4-6-7z"/>
              <path d="M12 17c-2 2-4 3-7 3 2-2 3-4 3-7"/>
              <path d="M12 17c2 2 4 3 7 3-2-2-3-4-3-7"/>
            </svg>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#477A60] rounded-full border-2 border-white"></span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-cormorant font-bold text-lg text-[#3B2A33] tracking-tight block leading-tight">
                ASHA <span className="italic font-normal text-[#A25B74]">Sakhi</span>
              </span>
            </div>
            <p className="text-[10px] font-bold text-[#A25B74]">
              {t("common.appName")}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenLanguageSelector || (() => onLanguageChange && onLanguageChange(currentLanguage === 'kn' ? 'hi' : currentLanguage === 'hi' ? 'en' : 'kn'))}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#FDF6F5] border border-[#F0DDE2] text-xs font-bold text-[#3B2A33] active:scale-95 shadow-xs transition-all"
            title="All 22 Indic Languages + English"
          >
            <Globe className="w-3.5 h-3.5 text-[#A25B74]" />
            <span className="font-semibold text-[11px]">{getLanguageByCode(currentLanguage).name_native}</span>
          </button>

          <button
            onClick={() => setActiveScreen('emergency')}
            className={`relative p-2 rounded-xl transition-all ${
              emergencyCount > 0
                ? 'bg-[#B94A58] text-white shadow-md animate-pulse'
                : 'bg-[#FDF6F5] text-[#7A6670] border border-[#F0DDE2]'
            }`}
            aria-label="Emergency Alerts"
          >
            <Bell className="w-4 h-4" />
            {emergencyCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#B94A58] text-white text-[9px] font-mono font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                {emergencyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
