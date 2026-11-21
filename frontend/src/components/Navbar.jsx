import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Globe, 
  Wifi, 
  WifiOff, 
  Volume2, 
  RefreshCw,
  CheckCircle2,
  Ambulance
} from 'lucide-react';
import { isDemoMode, setDemoMode, api } from '../services/api';

export default function Navbar({
  currentLanguage,
  onLanguageChange,
  activeScreen,
  setActiveScreen,
  emergencyCount = 0,
  isRecording = false
}) {
  const [demo, setDemo] = useState(isDemoMode());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState('');

  useEffect(() => {
    // Check initial pending queue
    const updateQueueCount = () => {
      const queue = api.getPendingSyncQueue();
      setPendingSyncCount(queue.length);
    };
    updateQueueCount();

    const handleOnline = async () => {
      setIsOnline(true);
      // Auto-synchronize pending records on network return
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleDemoChange = (e) => setDemo(e.detail.enabled);
    window.addEventListener('asha_demo_mode_changed', handleDemoChange);

    const handleSyncUpdated = (e) => {
      setPendingSyncCount(e.detail?.count || 0);
    };
    window.addEventListener('asha_sync_updated', handleSyncUpdated);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('asha_demo_mode_changed', handleDemoChange);
      window.removeEventListener('asha_sync_updated', handleSyncUpdated);
    };
  }, []);

  const triggerSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await api.syncPendingVisits();
      if (res.syncedCount > 0) {
        setSyncToast(`${res.syncedCount} ಆಫ್‌ಲೈನ್ ದಾಖಲೆಗಳು ಯಶಸ್ವಿಯಾಗಿ ಸಿಂಕ್ ಆಗಿವೆ!`);
        setTimeout(() => setSyncToast(''), 4000);
      }
    } catch (e) {
      console.warn('Sync failed', e);
    } finally {
      setIsSyncing(false);
      setPendingSyncCount(api.getPendingSyncQueue().length);
    }
  };

  const toggleDemoMode = () => {
    const next = !demo;
    setDemo(next);
    setDemoMode(next);
  };

  return (
    <header className="sticky top-0 z-40 bg-navy-900 text-white shadow-md border-b border-navy-800">
      <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Logo and Brand */}
        <div 
          className="flex items-center space-x-2.5 cursor-pointer select-none"
          onClick={() => setActiveScreen('home')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-touch relative">
            <Volume2 className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-navy-900"></span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base leading-tight tracking-tight text-white font-kannada">
                ಆಶಾ ಧ್ವನಿ ದಿನಚರಿ
              </span>
              <span className="text-[10px] bg-teal-800/80 text-teal-200 px-1.5 py-0.5 rounded font-mono font-medium">
                ASHA
              </span>
            </div>
            <p className="text-[11px] text-teal-200/80 leading-tight">
              AI4Bharat Voice Field Register
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Emergency Alert Pill (if active) */}
          {emergencyCount > 0 && (
            <button
              onClick={() => setActiveScreen('emergency')}
              className="flex items-center space-x-1 bg-emergency-600 hover:bg-emergency-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-emergency animate-pulse touch-manipulation"
              title="ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳು / Emergency Alerts"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
              <span>{emergencyCount}</span>
            </button>
          )}

          {/* Mode Switch (Mock / Live) */}
          <button
            onClick={toggleDemoMode}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors touch-manipulation ${
              demo
                ? 'bg-navy-800 text-teal-300 border-teal-500/50 hover:bg-navy-700'
                : 'bg-emerald-950 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
            }`}
            title="Toggle between AI4Bharat Demo Mode and Live Backend"
          >
            <span className={`w-2 h-2 rounded-full ${demo ? 'bg-teal-400' : 'bg-emerald-400'}`}></span>
            <span className="hidden sm:inline">{demo ? 'Demo Mode' : 'Live Backend'}</span>
            <span className="sm:hidden">{demo ? 'Demo' : 'Live'}</span>
          </button>

          {/* Language Switch */}
          <button
            onClick={() => onLanguageChange(currentLanguage === 'kn' ? 'en' : currentLanguage === 'en' ? 'kn-en' : 'kn')}
            className="flex items-center space-x-1 bg-navy-800 hover:bg-navy-700 text-teal-100 text-xs px-2.5 py-1 rounded-lg border border-navy-700 touch-manipulation"
            title="ಭಾಷೆ ಬದಲಿಸಿ / Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-semibold">
              {currentLanguage === 'kn' ? 'ಕನ್ನಡ' : currentLanguage === 'en' ? 'ENG' : 'ಕನ್+Eng'}
            </span>
          </button>
        </div>
      </div>

      {/* Subheader status bar on mobile */}
      <div className="bg-navy-950/90 px-4 py-1 border-t border-navy-800/60 flex items-center justify-between text-[11px] text-navy-200">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>ಮಂಡ್ಯ ತಾಲೂಕು PHC (Mandya Sector 4)</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Online / Offline & Sync Indicator */}
          {isOnline ? (
            <div className="flex items-center space-x-1.5">
              <span className="flex items-center text-emerald-400 space-x-1">
                <Wifi className="w-3 h-3" />
                <span>Online</span>
              </span>
              {pendingSyncCount > 0 && (
                <button
                  onClick={triggerSync}
                  disabled={isSyncing}
                  className="flex items-center space-x-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[10px] hover:bg-amber-500/30 touch-manipulation font-mono"
                  title="ಬಾಕಿ ದಾಖಲೆಗಳನ್ನು ಸರ್ವರ್‌ಗೆ ಸಿಂಕ್ ಮಾಡಿ"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{pendingSyncCount} Syncing</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center text-amber-400 space-x-1">
              <WifiOff className="w-3 h-3" />
              <span>Offline ({pendingSyncCount} Queued)</span>
            </div>
          )}

          <span className="text-navy-400">•</span>
          <span className="text-teal-300 font-mono text-[10px]">Indic-Transcribe</span>
        </div>
      </div>

      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-1.5 flex items-center justify-center space-x-2 font-medium animate-fade-in border-t border-emerald-500">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="bg-amber-600/90 text-white text-[11px] px-4 py-1 flex items-center justify-center space-x-1.5 font-medium">
          <WifiOff className="w-3.5 h-3.5" />
          <span>ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ. ದಾಖಲೆಗಳು ಸುರಕ್ಷಿತವಾಗಿ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಉಳಿಯುತ್ತವೆ.</span>
        </div>
      )}
    </header>
  );
}
