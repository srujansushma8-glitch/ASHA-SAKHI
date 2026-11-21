import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Mic, 
  Baby, 
  Users, 
  MapPin, 
  IndianRupee, 
  CalendarCheck, 
  AlertTriangle, 
  Ambulance, 
  Globe, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Moon, 
  Sun,
  Sparkles,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { api, isDemoMode, setDemoMode } from '../services/api';
import { getLanguageByCode } from '../services/languages';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({
  activeScreen,
  setActiveScreen,
  emergencyCount = 0,
  isRecording = false,
  onOpenLanguageSelector,
  onViewLanding,
  isDarkMode = false,
  onToggleDarkMode,
  userRole = 'asha',
  onOpenAuth,
}) {
  const { t, currentLanguage, onLanguageChange } = useLanguage();
  const [demo, setDemo] = useState(isDemoMode());
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const updateSyncCount = () => {
      setPendingSyncCount(api.getPendingSyncCount ? api.getPendingSyncCount() : 0);
    };

    updateSyncCount();
    window.addEventListener('asha_sync_completed', updateSyncCount);
    window.addEventListener('storage', updateSyncCount);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('asha_sync_completed', updateSyncCount);
      window.removeEventListener('storage', updateSyncCount);
    };
  }, []);

  const toggleDemoMode = () => {
    const nextMode = !demo;
    setDemo(nextMode);
    setDemoMode(nextMode);
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
      i18nKey: 'nav.dashboard',
      icon: Home,
    },
    {
      id: 'record',
      i18nKey: 'nav.voiceVisit',
      icon: Mic,
      isSpecial: true,
    },
    {
      id: 'maternal',
      i18nKey: 'nav.maternalHealth',
      icon: Baby,
      isMaternal: true,
    },
    {
      id: 'beneficiaries',
      i18nKey: 'nav.beneficiaries',
      icon: Users,
    },
    {
      id: 'route',
      i18nKey: 'nav.route',
      icon: MapPin,
    },
    {
      id: 'incentives',
      i18nKey: 'nav.incentives',
      icon: IndianRupee,
    },
    {
      id: 'followups',
      i18nKey: 'nav.followups',
      icon: CalendarCheck,
    },
    {
      id: 'emergency',
      i18nKey: 'nav.emergency',
      icon: AlertTriangle,
      badge: emergencyCount,
      isEmergency: true,
    },
    {
      id: 'ambulance',
      i18nKey: 'nav.ambulance',
      icon: Ambulance,
    },
    {
      id: 'ambulance_driver',
      i18nKey: 'nav.driverPortal',
      icon: Smartphone,
    },
  ];

  const getRoleDetails = () => {
    switch (userRole) {
      case 'anm':
        return { name: 'Pushpalatha ANM', role: t('auth.roleAnm'), tag: 'Supervisor' };
      case 'mo':
        return { name: 'Dr. Rajesh MO', role: t('auth.roleMo'), tag: 'PHC Doctor' };
      default:
        return { name: 'Sharada Bai', role: t('auth.roleAsha'), tag: 'Field Leader' };
    }
  };

  const roleInfo = getRoleDetails();

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-[#FFF9F7] border-r border-[#F0DDE2] shadow-subtle shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#F0DDE2] bg-white/70 backdrop-blur-sm">
        <div 
          onClick={() => setActiveScreen('home')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#A25B74] to-[#C47A92] text-white flex items-center justify-center shadow-md shadow-[#A25B74]/20 group-hover:scale-105 transition-transform relative">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3c-1.5 3-3.5 5.5-6 7 2.5 1.5 4.5 4 6 7 1.5-3 3.5-5.5 6-7-2.5-1.5-4.5-4-6-7z"/>
              <path d="M12 17c-2 2-4 3-7 3 2-2 3-4 3-7"/>
              <path d="M12 17c2 2 4 3 7 3-2-2-3-4-3-7"/>
            </svg>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#477A60] rounded-full border-2 border-white animate-pulse"></span>
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-cormorant font-bold text-xl text-[#3B2A33] tracking-tight leading-tight block">
                ASHA <span className="italic font-normal text-[#A25B74]">Sakhi</span>
              </span>
            </div>
            <p className="text-[11px] font-bold text-[#A25B74]">
              {t("common.appName")}
            </p>
            <p className="text-[9px] uppercase tracking-wider text-[#7A6670] font-medium truncate max-w-[150px]">
              {t("common.department")}
            </p>
          </div>
        </div>

        {/* 3D Landing Page Switcher Pill */}
        {onViewLanding && (
          <button
            onClick={onViewLanding}
            className="w-full mt-3 px-3 py-2 rounded-xl bg-[#FDF6F5] hover:bg-[#F9ECEC] border border-[#F0DDE2] text-[#A25B74] text-xs font-bold flex items-center justify-between group transition-all"
          >
            <span className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-[#A25B74]" />
              <span className="font-cormorant text-sm font-bold">{t("nav.publicPortal")}</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#C47A92] group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1.5">
        <div className="px-3 pb-1.5 text-[10px] font-bold text-[#C47A92] uppercase tracking-[0.2em] font-mono">
          {t("cmdPalette.navigation")}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;

          if (item.isSpecial) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-[0.98] ${
                  isActive
                    ? 'bg-gradient-to-r from-[#A25B74] to-[#C47A92] text-white shadow-md shadow-[#A25B74]/25'
                    : isRecording
                    ? 'bg-[#B94A58] text-white animate-pulse shadow-md shadow-[#B94A58]/25'
                    : 'bg-[#FDF6F5] hover:bg-[#F9ECEC] text-[#3B2A33] border border-[#F0DDE2]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isActive || isRecording ? 'bg-white/20 text-white' : 'bg-[#A25B74] text-white shadow-xs'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block text-xs font-bold leading-tight">
                      {isRecording ? t("voice.recordingInProgress") : t(item.i18nKey)}
                    </span>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white text-[#A25B74]' : 'bg-[#A25B74] text-white'
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                  isActive
                    ? 'bg-[#F9ECEC] text-[#A25B74] font-bold border-l-4 border-[#A25B74] shadow-xs'
                    : 'text-[#3B2A33] hover:text-[#A25B74] hover:bg-[#FDF6F5]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-[#A25B74] text-white' : 'bg-[#FDF6F5] text-[#C47A92]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block leading-tight text-xs font-bold">
                      {t(item.i18nKey)}
                    </span>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-[#A25B74] text-white' : 'bg-[#FDF6F5] text-[#A25B74] border border-[#F0DDE2]'
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
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                isActive
                  ? item.isEmergency
                    ? 'bg-[#B94A58] text-white shadow-md font-bold'
                    : 'bg-[#F9ECEC] text-[#A25B74] font-bold border-l-4 border-[#A25B74] shadow-xs'
                  : 'text-[#3B2A33] hover:text-[#A25B74] hover:bg-[#FDF6F5]'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${
                  isActive 
                    ? item.isEmergency ? 'text-white stroke-[2.2px]' : 'text-[#A25B74] stroke-[2.2px]' 
                    : item.isEmergency && item.badge > 0
                    ? 'text-[#B94A58] stroke-[2px]'
                    : 'text-[#C47A92] stroke-[1.8px]'
                }`} />
                <div className="text-left">
                  <span className="block leading-tight text-xs font-bold">
                    {t(item.i18nKey)}
                  </span>
                </div>
              </div>

              {item.badge > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white text-[#B94A58]' : 'bg-[#B94A58] text-white animate-pulse'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mode & Language Quick Controls */}
      <div className="p-3.5 mx-3 mb-3 bg-white rounded-2xl border border-[#F0DDE2] space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#7A6670] font-medium flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-[#A25B74]" />
            <span className="text-[11px] font-bold">{t("nav.languages")}</span>
          </span>
          <button
            onClick={onOpenLanguageSelector || (() => onLanguageChange && onLanguageChange(currentLanguage === 'kn' ? 'hi' : currentLanguage === 'hi' ? 'en' : 'kn'))}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#FDF6F5] border border-[#F0DDE2] text-xs font-bold text-[#3B2A33] hover:bg-[#F9ECEC] active:scale-[0.98] shadow-xs"
            title="All 22 Scheduled Indian Languages + English"
          >
            <span>{getLanguageByCode(currentLanguage).name_native}</span>
            <span className="text-[10px] bg-[#A25B74]/10 text-[#A25B74] px-1 rounded font-mono font-bold">22</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#F0DDE2]">
          <span className="text-[#7A6670] font-medium flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${demo ? 'bg-[#A25B74]' : 'bg-[#477A60]'}`}></span>
            <span className="text-[11px]">{demo ? t("common.demoMode") : t("common.liveMode")}</span>
          </span>
          <button
            onClick={toggleDemoMode}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
              demo 
                ? 'bg-[#FDF6F5] text-[#A25B74] border-[#F0DDE2]' 
                : 'bg-[#E8F7F1] text-[#477A60] border-[#C8EEDD]'
            }`}
          >
            {demo ? 'AI4Bharat' : 'Live'}
          </button>
        </div>

        {/* Sync Button if offline items exist */}
        {pendingSyncCount > 0 && (
          <button
            onClick={triggerSync}
            disabled={isSyncing}
            className="w-full mt-1 bg-[#FEF9EF] hover:bg-[#FDF1D7] text-[#B88745] border border-[#F2B84B]/40 text-xs font-bold py-1.5 px-2 rounded-xl flex items-center justify-center space-x-1.5 active:scale-[0.98]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{pendingSyncCount} {t("common.syncNow")}</span>
          </button>
        )}
      </div>

      {/* ASHA / Supervisor Profile Card */}
      <div className="p-4 border-t border-[#F0DDE2] bg-white space-y-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#A25B74] to-[#C47A92] text-white flex items-center justify-center text-lg font-bold shadow-xs">
              {userRole === 'mo' ? '👨‍⚕️' : userRole === 'anm' ? '👩‍🏫' : '👩‍⚕️'}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              isOnline ? 'bg-[#477A60]' : 'bg-[#B88745]'
            }`}></span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-[#3B2A33] truncate">
                {roleInfo.name}
              </div>
              {onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="text-[10px] text-[#A25B74] font-bold hover:underline"
                >
                  {t("nav.switchRole")}
                </button>
              )}
            </div>
            <div className="text-[10px] text-[#7A6670] font-medium truncate">
              {roleInfo.role} • {roleInfo.tag}
            </div>
            <div className="flex items-center space-x-1 text-[10px] text-[#477A60] font-semibold mt-0.5">
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span>{t("common.syncOnline")}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-[#B88745]" />
                  <span className="text-[#B88745]">{t("common.syncOffline")}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Theme Toggle Button */}
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className="w-full py-1.5 px-3 rounded-xl bg-[#FDF6F5] hover:bg-[#F9ECEC] border border-[#F0DDE2] text-[#7A6670] text-xs font-semibold flex items-center justify-between transition-colors"
          >
            <span className="flex items-center space-x-2">
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-[#B88745]" /> : <Moon className="w-3.5 h-3.5 text-[#A25B74]" />}
              <span>{isDarkMode ? t("common.lightMode") : t("common.darkMode")}</span>
            </span>
            <span className="text-[10px] font-mono text-[#C47A92]">Theme</span>
          </button>
        )}
      </div>
    </aside>
  );
}
