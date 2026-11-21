import { getLanguageByCode } from '../services/languages';
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
  Settings,
  Baby,
  Activity,
  Sparkles,
  MapPin,
  IndianRupee,
  ExternalLink,
  Moon,
  Sun,
  UserCheck
} from 'lucide-react';
import { isDemoMode, setDemoMode, api } from '../services/api';

export default function Sidebar({ 
  activeScreen, 
  setActiveScreen, 
  emergencyCount = 0, 
  isRecording = false,
  currentLanguage,
  onLanguageChange,
  onOpenLanguageSelector,
  onViewLanding,
  isDarkMode = false,
  onToggleDarkMode,
  userRole = 'asha',
  onOpenAuth
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
      label_en: 'AI Voice Visit',
      icon: Mic,
      isSpecial: true,
    },
    {
      id: 'maternal',
      label_kn: 'ತಾಯಿ ಆರೋಗ್ಯ',
      label_en: 'Maternal Health',
      icon: Baby,
      isMaternal: true,
    },
    {
      id: 'beneficiaries',
      label_kn: 'ಫಲಾನುಭವಿಗಳು',
      label_en: 'Beneficiaries',
      icon: Users,
    },
    {
      id: 'route',
      label_kn: 'ಗ್ರಾಮ ಮಾರ್ಗ ನಕ್ಷೆ',
      label_en: 'Household Route',
      icon: MapPin,
    },
    {
      id: 'incentives',
      label_kn: 'ಪ್ರೋತ್ಸಾಹಧನ ಲೆಕ್ಕ',
      label_en: 'Incentives & NHM',
      icon: IndianRupee,
    },
    {
      id: 'followups',
      label_kn: 'ಫಾಲೋ-ಅಪ್ ಪಟ್ಟಿ',
      label_en: 'Follow-ups & Reports',
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

  const getRoleDetails = () => {
    switch (userRole) {
      case 'anm':
        return { name: 'ಪುಷ್ಪಲತಾ (Pushpalatha)', role: 'ANM Supervisor', tag: 'Supervisor' };
      case 'mo':
        return { name: 'ಡಾ. ರಾಜೇಶ್ (Dr. Rajesh)', role: 'Medical Officer', tag: 'PHC Doctor' };
      default:
        return { name: 'ಶಾರದಾ ಬಾಯಿ (Sharada)', role: 'ASHA Field Leader', tag: 'ASHA Worker' };
    }
  };

  const roleInfo = getRoleDetails();

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-navy-900 border-r border-navy-200/60 dark:border-navy-800 shadow-subtle shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
      {/* Brand Header */}
      <div className="p-5 border-b border-navy-100 dark:border-navy-800 bg-white dark:bg-navy-900">
        <div 
          onClick={() => setActiveScreen('home')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-900 to-primary text-white flex items-center justify-center shadow-card relative group-hover:scale-105 transition-decelerate">
            <HeartPulse className="w-6 h-6 text-cyan" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan rounded-full border-2 border-white dark:border-navy-900 animate-pulse"></span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg text-navy-900 dark:text-white font-kannada tracking-tight leading-none">
                ಆಶಾ ಸಖಿ
              </span>
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan font-mono bg-cyan-50 dark:bg-cyan/10 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan/30">
                AI SaaS
              </span>
            </div>
            <p className="text-xs font-bold text-primary dark:text-cyan font-mono mt-0.5 tracking-wider">
              ASHA SAKHI
            </p>
            <p className="text-[10px] text-navy-400 font-medium">
              NHM ಕರ್ನಾಟಕ • AI Field Register
            </p>
          </div>
        </div>

        {/* 3D Landing Page Switcher Pill */}
        {onViewLanding && (
          <button
            onClick={onViewLanding}
            className="w-full mt-3 px-3 py-2 rounded-xl bg-cream-100 dark:bg-navy-800 hover:bg-cream-200 dark:hover:bg-navy-700 border border-navy-200/60 dark:border-navy-700 text-navy-700 dark:text-navy-200 text-xs font-bold flex items-center justify-between group transition-all"
          >
            <span className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-saffron" />
              <span>3D ಲ್ಯಾಂಡಿಂಗ್ ಪೇಜ್</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-navy-400 group-hover:text-primary transition-colors" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-bold text-navy-400 uppercase tracking-widest font-mono">
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
                    ? 'bg-gradient-to-r from-primary to-cyan text-white shadow-cyan'
                    : isRecording
                    ? 'bg-emergency text-white animate-pulse shadow-emergency'
                    : 'bg-softblue hover:bg-cyan-50 text-navy-900 border border-cyan-200/70'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isActive || isRecording ? 'bg-white/20 text-white' : 'bg-primary text-white shadow-sm'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block font-kannada text-sm leading-tight">
                      {isRecording ? 'ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ...' : item.label_kn}
                    </span>
                    <span className={`text-[10px] block font-mono font-medium ${
                      isActive || isRecording ? 'text-white/80' : 'text-primary'
                    }`}>
                      {item.label_en}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white text-navy-900' : 'bg-primary text-white'
                }`}>
                  AI4Bharat
                </span>
              </button>
            );
          }

          if (item.isMaternal) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-decelerate active:scale-[0.98] ${
                  isActive
                    ? 'bg-pink text-white shadow-pink font-bold'
                    : 'text-navy-700 hover:text-pink-600 hover:bg-pink-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block font-kannada leading-tight text-[13px]">
                      {item.label_kn}
                    </span>
                    <span className={`text-[10px] block font-medium ${isActive ? 'text-white/90' : 'text-pink-600'}`}>
                      {item.label_en}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white text-pink-700' : 'bg-pink-100 text-pink-700'
                }`}>
                  ANC
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
                    ? 'bg-emergency text-white shadow-emergency font-bold'
                    : 'bg-navy-900 text-white shadow-card font-bold'
                  : 'text-navy-700 hover:text-navy-900 hover:bg-softblue/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${
                  isActive 
                    ? 'text-cyan stroke-[2.2px]' 
                    : item.isEmergency && item.badge > 0
                    ? 'text-emergency stroke-[2px]'
                    : 'text-navy-400 stroke-[1.8px]'
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
      <div className="p-3.5 mx-3 mb-3 bg-softblue rounded-2xl border border-navy-200/60 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-navy-600 font-medium flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span>ಭಾಷೆ (Lang)</span>
          </span>
          <button
            onClick={onOpenLanguageSelector || (() => onLanguageChange && onLanguageChange(currentLanguage === 'kn' ? 'hi' : currentLanguage === 'hi' ? 'en' : 'kn'))}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-navy-700 border border-navy-200 dark:border-navy-600 text-xs font-bold text-navy-900 dark:text-white hover:bg-navy-50 dark:hover:bg-navy-600 active:scale-[0.98] shadow-sm"
            title="ಭಾರತೀಯ ಭಾಷೆಗಳು (22 Languages)"
          >
            <Globe className="w-3 h-3 text-primary" />
            <span>{getLanguageByCode(currentLanguage).name_native}</span>
            <span className="text-[10px] bg-primary/10 text-primary px-1 rounded font-mono">22</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-navy-200/50">
          <span className="text-navy-600 font-medium flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${demo ? 'bg-cyan' : 'bg-healthcare'}`}></span>
            <span>ಇಂಜಿನ್ (Engine)</span>
          </span>
          <button
            onClick={toggleDemoMode}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-decelerate ${
              demo 
                ? 'bg-cyan-50 text-cyan-700 border-cyan-300' 
                : 'bg-healthcare-50 text-healthcare border-healthcare-200'
            }`}
          >
            {demo ? 'AI4Bharat Engine' : 'Live Backend'}
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

      {/* ASHA / Supervisor / MO Profile & Theme Toggle */}
      <div className="p-4 border-t border-navy-100 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-navy-900 to-primary text-white border border-cyan-200 dark:border-cyan/40 flex items-center justify-center text-lg font-bold shadow-sm">
              {userRole === 'mo' ? '👨‍⚕️' : userRole === 'anm' ? '👩‍🏫' : '👩‍⚕️'}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-navy-900 ${
              isOnline ? 'bg-healthcare' : 'bg-warning'
            }`}></span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-navy-900 dark:text-white truncate font-kannada">
                {roleInfo.name}
              </div>
              {onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="text-[10px] text-primary dark:text-cyan font-bold hover:underline"
                >
                  ಬದಲಿಸಿ
                </button>
              )}
            </div>
            <div className="text-[10px] text-navy-500 dark:text-navy-400 font-medium truncate">
              {roleInfo.role} • {roleInfo.tag}
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

        {/* Theme Toggle Button */}
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className="w-full py-1.5 px-3 rounded-xl bg-navy-50 dark:bg-navy-800 hover:bg-navy-100 dark:hover:bg-navy-700 text-navy-600 dark:text-navy-300 text-xs font-semibold flex items-center justify-between transition-colors"
          >
            <span className="flex items-center space-x-2">
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-navy-600" />}
              <span>{isDarkMode ? 'ಲೈಟ್ ಮೋಡ್ (Light)' : 'ಡಾರ್ಕ್ ಮೋಡ್ (Dark)'}</span>
            </span>
            <span className="text-[10px] font-mono text-navy-400">Theme</span>
          </button>
        )}
      </div>
    </aside>
  );
}
