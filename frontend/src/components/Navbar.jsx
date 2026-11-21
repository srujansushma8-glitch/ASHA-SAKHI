import { getLanguageByCode } from '../services/languages';
import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Globe, 
  Wifi, 
  WifiOff, 
  HeartPulse,
  RefreshCw,
  CheckCircle2,
  Ambulance
} from 'lucide-react';
import { isDemoMode, setDemoMode, api } from '../services/api';

export default function Navbar({
  currentLanguage,
  onLanguageChange,
  onOpenLanguageSelector,
  activeScreen,
  setActiveScreen,
  emergencyCount = 0,
}) {
  const [demo, setDemo] = useState(isDemoMode());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState('');

  useEffect(() => {
    const updateQueueCount = () => {
      const queue = api.getPendingSyncQueue ? api.getPendingSyncQueue() : [];
      setPendingSyncCount(queue.length);
    };
    updateQueueCount();

    const handleOnline = async () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleDemoChange = (e) => setDemo(e.detail.enabled);
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
        setSyncToast(`${res.syncedCount} ಭೇಟಿ ದಾಖಲೆಗಳು ಯಶಸ್ವಿಯಾಗಿ ಸಿಂಕ್ ಆಗಿವೆ!`);
        setTimeout(() => setSyncToast(''), 3500);
      }
    } catch (e) {
      console.warn('Sync error', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleDemoMode = () => {
    const next = !demo;
    setDemo(next);
    setDemoMode(next);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFF9F7]/95 backdrop-blur-md border-b border-[#F0DDE2] shadow-subtle">
      {/* Primary Brand & Actions Bar */}
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand Logo & Title */}
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
            <p className="text-[10px] font-bold text-[#A25B74] font-kannada">
              ಆಶಾ ಸಖಿ • Mandya PHC
            </p>
          </div>
        </div>

        {/* Right Action Icons: Language & Offline status */}
        <div className="flex items-center space-x-2">
          {/* Language Switcher Pill */}
          <button
            onClick={onOpenLanguageSelector || (() => onLanguageChange && onLanguageChange(currentLanguage === 'kn' ? 'hi' : currentLanguage === 'hi' ? 'en' : 'kn'))}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#FDF6F5] border border-[#F0DDE2] text-xs font-bold text-[#3B2A33] active:scale-95 shadow-xs transition-all"
            title="All 22 Indic Languages"
          >
            <Globe className="w-3.5 h-3.5 text-[#A25B74]" />
            <span className="text-[11px] font-kannada">{getLanguageByCode(currentLanguage).name_native}</span>
            <span className="text-[9px] bg-[#A25B74]/10 text-[#A25B74] px-1 rounded font-mono font-bold">22</span>
          </button>

          {/* Sync Trigger button when offline queue has items */}
          {pendingSyncCount > 0 && (
            <button
              onClick={triggerSync}
              disabled={isSyncing}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#FEF9EF] text-[#B88745] border border-[#F2B84B]/40 text-xs font-bold animate-pulse shadow-xs active:scale-95 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="text-[11px] font-mono">{pendingSyncCount}</span>
            </button>
          )}

          {/* Emergency Bell Shortcut */}
          <button
            onClick={() => setActiveScreen('emergency')}
            className={`p-2 rounded-xl border transition-all active:scale-95 ${
              emergencyCount > 0
                ? 'bg-[#FCF1F1] border-[#B94A58]/40 text-[#B94A58] animate-pulse shadow-xs'
                : 'bg-white border-[#F0DDE2] text-[#7A6670]'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sync Success Toast */}
      {syncToast && (
        <div className="bg-[#477A60] text-white text-xs font-semibold px-4 py-2 flex items-center justify-center space-x-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4" />
          <span>{syncToast}</span>
        </div>
      )}
    </header>
  );
}
