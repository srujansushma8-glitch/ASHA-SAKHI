import React from 'react';
import { 
  Bell, 
  Search, 
  Calendar, 
  Globe, 
  ShieldAlert, 
  Sparkles, 
  Moon, 
  Sun,
  MapPin
} from 'lucide-react';
import { getLanguageByCode } from '../services/languages';
import { useLanguage } from '../context/LanguageContext';

export default function DesktopHeader({
  activeScreen,
  emergencyCount = 0,
  onEmergencyClick,
  searchValue = '',
  onSearchChange,
  onOpenLanguageSelector,
  onOpenCommandPalette,
  onViewLanding,
  isDarkMode = false,
  onToggleDarkMode,
  userRole = 'asha',
  onOpenAuth
}) {
  const { t, currentLanguage, onLanguageChange, formatDate } = useLanguage();

  const getScreenDetails = () => {
    switch (activeScreen) {
      case 'home':
        return {
          title: t('nav.dashboard'),
          subtitle: t('common.mandyaSector')
        };
      case 'route':
        return {
          title: t('route.title'),
          subtitle: t('route.subtitle')
        };
      case 'incentives':
        return {
          title: t('incentives.title'),
          subtitle: t('incentives.subtitle')
        };
      case 'record':
        return {
          title: t('voice.title'),
          subtitle: t('voice.subtitle')
        };
      case 'maternal':
        return {
          title: t('maternal.title'),
          subtitle: t('maternal.subtitle')
        };
      case 'structured_record':
        return {
          title: t('structuredRecord.title'),
          subtitle: t('structuredRecord.subtitle')
        };
      case 'emergency':
        return {
          title: t('emergency.title'),
          subtitle: t('emergency.subtitle')
        };
      case 'ambulance':
        return {
          title: t('ambulance.title'),
          subtitle: t('ambulance.subtitle')
        };
      case 'ambulance_driver':
        return {
          title: t('ambulanceDriver.title'),
          subtitle: t('ambulanceDriver.subtitle')
        };
      case 'followups':
        return {
          title: t('nav.followups'),
          subtitle: t('dashboard.maternalSubtext')
        };
      case 'beneficiaries':
        return {
          title: t('beneficiaries.title'),
          subtitle: t('beneficiaries.subtitle')
        };
      default:
        return {
          title: t('common.appName'),
          subtitle: t('common.department')
        };
    }
  };

  const details = getScreenDetails();
  const todayFormatted = formatDate(new Date(), {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const roleName = userRole === 'mo' ? 'Dr. Rajesh MO' : userRole === 'anm' ? 'Pushpalatha ANM' : 'Sharada Bai';
  const roleTitle = userRole === 'mo' ? t('auth.roleMo') : userRole === 'anm' ? t('auth.roleAnm') : t('auth.roleAsha');

  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-[#FFF9F7]/95 backdrop-blur-md border-b border-[#F0DDE2] shadow-subtle sticky top-0 z-30 transition-colors">
      {/* 1. Screen Title & Subtitle */}
      <div className="flex items-center space-x-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-cormorant font-bold text-[#3B2A33] tracking-tight leading-tight">
              {details.title}
            </h1>
          </div>
          <p className="text-xs text-[#7A6670] font-medium mt-0.5 flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-[#A25B74] shrink-0" />
            {details.subtitle}
          </p>
        </div>
      </div>

      {/* 2. Middle: Search / Command Palette Bar */}
      <div className="w-80 relative flex items-center">
        <Search className="w-4 h-4 text-[#C47A92] absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          onClick={() => onOpenCommandPalette && onOpenCommandPalette()}
          placeholder={t("common.search")}
          className="w-full text-xs font-medium pl-10 pr-20 py-2.5 bg-white border border-[#F0DDE2] text-[#3B2A33] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A25B74] cursor-pointer transition-all shadow-xs"
        />
        <button
          onClick={onOpenCommandPalette}
          className="absolute right-2 px-1.5 py-1 rounded bg-[#FDF6F5] border border-[#F0DDE2] text-[10px] font-mono font-bold text-[#A25B74] hover:bg-[#F9ECEC] transition-colors flex items-center space-x-0.5"
          title="Open Command Palette (Ctrl+K)"
        >
          <span>Ctrl</span>
          <span>+</span>
          <span>K</span>
        </button>
      </div>

      {/* 3. Right Details: 3D Landing Link, Language, Alert Bell, Profile */}
      <div className="flex items-center space-x-3">
        
        {/* Landing Page Link */}
        {onViewLanding && (
          <button
            onClick={onViewLanding}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FDF6F5] hover:bg-[#F9ECEC] border border-[#F0DDE2] text-[#A25B74] text-xs font-bold transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A25B74]" />
            <span className="font-cormorant font-bold text-sm">{t("nav.publicPortal")}</span>
          </button>
        )}

        {/* Date Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#FDF6F5] border border-[#F0DDE2] text-xs">
          <Calendar className="w-4 h-4 text-[#A25B74]" />
          <span className="font-bold text-[#3B2A33] text-[11px] leading-tight">
            {todayFormatted}
          </span>
        </div>

        {/* Language Selector */}
        <div className="flex items-center space-x-1.5 bg-[#FDF6F5] p-1 rounded-xl border border-[#F0DDE2] text-xs">
          {onOpenLanguageSelector && (
            <button
              onClick={onOpenLanguageSelector}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white text-[#A25B74] hover:text-[#84455C] font-bold border border-[#F0DDE2] shadow-xs transition-all"
              title="All 22 Scheduled Indic Languages + English"
            >
              <Globe className="w-3.5 h-3.5 text-[#A25B74]" />
              <span>{getLanguageByCode(currentLanguage).name_native}</span>
              <span className="text-[10px] bg-[#A25B74]/10 text-[#A25B74] px-1 py-0.2 rounded font-mono font-bold">22</span>
            </button>
          )}

          {onLanguageChange && ['kn', 'hi', 'en'].map(code => {
            const l = getLanguageByCode(code);
            return (
              <button
                key={code}
                onClick={() => onLanguageChange(code)}
                className={`px-1.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  currentLanguage === code
                    ? 'bg-[#A25B74] text-white shadow-xs'
                    : 'text-[#7A6670] hover:text-[#3B2A33]'
                }`}
              >
                {l.code.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Emergency Alert Indicator Icon */}
        <button
          onClick={onEmergencyClick}
          className={`relative p-2 rounded-xl transition-all ${
            emergencyCount > 0
              ? 'bg-[#B94A58] text-white animate-pulse shadow-md shadow-[#B94A58]/25'
              : 'bg-[#FDF6F5] hover:bg-[#F9ECEC] text-[#7A6670] border border-[#F0DDE2]'
          }`}
          title={t("emergency.title")}
        >
          <Bell className="w-4 h-4" />
          {emergencyCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B94A58] text-white text-[9px] font-mono font-bold flex items-center justify-center border-2 border-white">
              {emergencyCount}
            </span>
          )}
        </button>

        {/* User Role Mini Chip */}
        <div 
          onClick={onOpenAuth}
          className="flex items-center space-x-2.5 pl-2.5 pr-3 py-1.5 rounded-xl bg-white border border-[#F0DDE2] shadow-xs cursor-pointer hover:border-[#A25B74] transition-all"
          title={t("nav.switchRole")}
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#A25B74] to-[#C47A92] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {userRole === 'mo' ? '👨‍⚕️' : userRole === 'anm' ? '👩‍🏫' : '👩‍⚕️'}
          </div>
          <div className="text-left">
            <span className="block text-xs font-bold text-[#3B2A33] leading-none">
              {roleName}
            </span>
            <span className="block text-[9px] text-[#A25B74] font-medium leading-tight mt-0.5">
              {roleTitle}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
