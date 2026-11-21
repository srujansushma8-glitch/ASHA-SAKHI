import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Mic, 
  CalendarCheck, 
  AlertTriangle, 
  Ambulance, 
  HeartPulse, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ShieldCheck,
  ChevronRight,
  Globe,
  Settings
} from 'lucide-react';
import { isDemoMode, setDemoMode, api } from '../services/api';

export default function Sidebar({ 
  activeScreen, 
  setActiveScreen, 
  emergencyCount = 0, 
  isRecording = false,
  currentLanguage,
  onLanguageChange
}) {
  const [demo, setDemo] = useState(isDemoMode());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateQueue = () => {
      const queue = api.getPendingSyncQueue ? api.getPendingSyncQueue() : [];
      setPendingSyncCount(queue.length);
    };
    updateQueue();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
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

  const toggleDemoMode = () => {
    const next = !demo;
    setDemo(next);
    setDemoMode(next);
  };

  const triggerSync = async () => {
    if (isSyncing || pendingSyncCount === 0) return;
    setIsSyncing(true);
    try {
      await api.syncPendingQueue();
    } catch (e) {
      console.warn('Sync failed', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const navItems = [
    {
      id: 'home',
      label_kn: 'ಮುಖಪುಟ',
      label_en: 'Dashboard',
      icon: Home,
    },
    {
      id: 'record',
      label_kn: 'ಧ್ವನಿ ಭೇಟಿ',
      label_en: 'Voice Visit',
      icon: Mic,
      isSpecial: true,
    },
    {
      id: 'beneficiaries',
      label_kn: 'ಫಲಾನುಭವಿಗಳು',
      label_en: 'Beneficiaries',
      icon: Users,
    },
    {
      id: 'followups',
      label_kn: 'ಫಾಲೋ-ಅಪ್ ಪಟ್ಟಿ',
      label_en: 'Follow-ups',
      icon: CalendarCheck,
    },
    {
      id: 'emergency',
      label_kn: 'ತುರ್ತು ಎಚ್ಚರಿಕೆ',
      label_en: 'Emergency Alerts',
      icon: AlertTriangle,
      badge: emergencyCount,
      isEmergency: true,
    },
    {
      id: 'ambulance',
      label_kn: '108 ಆಂಬ್ಯುಲೆನ್ಸ್',
      label_en: 'Ambulance Map',
      icon: Ambulance,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-navy-100 shadow-subtle shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
      {/* Brand Header */}
      <div className="p-5 border-b border-navy-100">
        <div 
          onClick={() => setActiveScreen('home')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-touch relative group-hover:scale-105 transition-decelerate">
            <HeartPulse className="w-7 h-7 text-mint-surface" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-healthcare rounded-full border-2 border-white"></span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg text-navy font-kannada tracking-tight leading-none">
                ಆಶಾ ಸಖಿ
              </span>
              <span className="text-[10px] font-bold text-primary font-mono bg-mint-surface/80 px-1.5 py-0.5 rounded border border-primary-200">
                PRO
              </span>
            </div>
            <p className="text-xs font-semibold text-primary font-mono mt-0.5">
              ASHA SAKHI
            </p>
            <p className="text-[10px] text-navy-400 font-medium">
              NHM ಕರ್ನಾಟಕ • AI Voice Register
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-bold text-navy-400 uppercase tracking-wider font-mono">
          ಮುಖ್ಯ ಮೆನು (Navigation)
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;

          if (item.isSpecial) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-decelerate active:scale-[0.98] ${
                  isActive
                    ? 'bg-primary text-white shadow-touch'
                    : isRecording
                    ? 'bg-emergency text-white animate-pulse shadow-emergency'
                    : 'bg-mint-surface/50 hover:bg-mint-surface text-primary border border-primary-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isActive || isRecording ? 'bg-white/20 text-white' : 'bg-primary text-white'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block font-kannada text-sm leading-tight">
                      {isRecording ? 'ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ...' : item.label_kn}
                    </span>
                    <span className={`text-[10px] block font-mono font-medium ${
                      isActive || isRecording ? 'text-white/80' : 'text-primary/70'
                    }`}>
                      {item.label_en}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white text-primary' : 'bg-primary text-white'
                }`}>
                  AI4Bharat
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-decelerate active:scale-[0.98] ${
                isActive
                  ? item.isEmergency
                    ? 'bg-emergency text-white shadow-card font-bold'
                    : 'bg-primary text-white shadow-touch font-bold'
                  : 'text-navy-700 hover:text-navy hover:bg-ivory-bg'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${
                  isActive 
                    ? 'text-white stroke-[2.2px]' 
                    : item.isEmergency && item.badge > 0
                    ? 'text-emergency stroke-[2px]'
                    : 'text-navy-500 stroke-[1.8px]'
                }`} />
                <div className="text-left">
                  <span className="block font-kannada leading-tight text-[13px]">
                    {item.label_kn}
                  </span>
                  <span className={`text-[10px] block font-medium ${isActive ? 'text-white/80' : 'text-navy-400'}`}>
                    {item.label_en}
                  </span>
                </div>
              </div>

              {item.badge > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white text-emergency' : 'bg-emergency text-white animate-pulse'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mode & Language Quick Controls */}
      <div className="p-4 mx-3 mb-3 bg-ivory-bg rounded-2xl border border-navy-100 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-navy-500 font-medium flex items-center space-x-1">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span>ಭಾಷೆ (Language)</span>
          </span>
          <button
            onClick={() => onLanguageChange(currentLanguage === 'kn' ? 'kn-en' : currentLanguage === 'kn-en' ? 'en' : 'kn')}
            className="px-2 py-1 rounded-lg bg-white border border-navy-200 text-xs font-bold text-navy hover:bg-navy-50 active:scale-[0.98]"
          >
            {currentLanguage === 'kn' ? 'ಕನ್ನಡ' : currentLanguage === 'kn-en' ? 'ಕನ್+Eng' : 'English'}
          </button>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-navy-100">
          <span className="text-navy-500 font-medium flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${demo ? 'bg-primary' : 'bg-healthcare'}`}></span>
            <span>ಮೋಡ್ (Mode)</span>
          </span>
          <button
            onClick={toggleDemoMode}
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold border transition-decelerate ${
              demo 
                ? 'bg-primary-50 text-primary border-primary-200' 
                : 'bg-healthcare-50 text-healthcare border-healthcare-200'
            }`}
          >
            {demo ? 'Demo AI4Bharat' : 'Live Backend'}
          </button>
        </div>

        {/* Sync Button if offline items exist */}
        {pendingSyncCount > 0 && (
          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="w-full mt-1 bg-warning-50 hover:bg-warning-100 text-warning-700 border border-warning-200 text-xs font-bold py-1.5 px-2 rounded-xl flex items-center justify-center space-x-1.5 active:scale-[0.98]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{pendingSyncCount} ದಾಖಲೆ ಸಿಂಕ್ ಮಾಡಿ</span>
          </button>
        )}
      </div>

      {/* ASHA Healthcare Worker Profile Widget */}
      <div className="p-4 border-t border-navy-100 bg-white">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-mint-surface text-primary border border-primary-200 flex items-center justify-center text-xl font-bold">
              👩‍⚕️
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              isOnline ? 'bg-healthcare' : 'bg-warning'
            }`}></span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-navy truncate font-kannada">
              ಶಾರದಾ ಬಾಯಿ (Sharada)
            </div>
            <div className="text-[10px] text-navy-500 font-medium truncate">
              ಮಂಡ್ಯ PHC • ಶಿವಳ್ಳಿ ಉಪಕೇಂದ್ರ
            </div>
            <div className="flex items-center space-x-1 text-[10px] text-healthcare font-semibold mt-0.5">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span>ಆನ್‌ಲೈನ್ ಸಿಂಕ್</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-warning-700" />
                  <span className="text-warning-700">ಆಫ್‌ಲೈನ್ ಕ್ಯೂ</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
