import { getLanguageByCode } from '../services/languages';
import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  MapPin, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Wifi, 
  Sparkles,
  HeartPulse,
  User,
  Globe,
  Command,
  Moon,
  Sun,
  ExternalLink
} from 'lucide-react';

export default function DesktopHeader({ 
  activeScreen, 
  emergencyCount = 0, 
  onEmergencyClick,
  onSearchChange,
  searchValue = '',
  currentLanguage = 'kn',
  onLanguageChange,
  onOpenLanguageSelector,
  onOpenCommandPalette,
  onViewLanding,
  isDarkMode = false,
  onToggleDarkMode,
  userRole = 'asha',
  onOpenAuth
}) {
  const getScreenDetails = () => {
    switch (activeScreen) {
      case 'home':
        return {
          title_kn: 'ಆಶಾ ಮುಖ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
          title_en: 'Field Assistant Dashboard',
          subtitle: 'ಮಂಡ್ಯ ತಾಲೂಕು PHC (ಶಿವಳ್ಳಿ & ಕೆರೆಗೋಡು ವಲಯ - Sector 4)'
        };
      case 'route':
        return {
          title_kn: 'ಗ್ರಾಮ ಮನೆ ಭೇಟಿ ನಕ್ಷೆ',
          title_en: 'Village Household Route Planner',
          subtitle: 'ದಿನನಿತ್ಯದ ಕ್ಷೇತ್ರ ಭೇಟಿ ಮತ್ತು ಆಪ್ಟಿಮೈಸ್ಡ್ ಜಿಪಿಎಸ್ ನಕ್ಷೆ (Mandya Sector 4)'
        };
      case 'incentives':
        return {
          title_kn: 'ಆಶಾ ಪ್ರೋತ್ಸಾಹಧನ ಲೆಕ್ಕಪತ್ರ',
          title_en: 'Incentives & NHM Ledger',
          subtitle: 'JSY, ಲಸಿಕಾ ಪ್ರೋತ್ಸಾಹಧನ, ಮಾಸಿಕ ಗಳಿಕೆ ಮತ್ತು ಮೇಲ್ವಿಚಾರಕರ ಅನುಮೋದನೆ'
        };
      case 'record':
        return {
          title_kn: 'ಧ್ವನಿ ಕ್ಷೇತ್ರ ದಿನಚರಿ',
          title_en: 'AI Voice Assistant',
          subtitle: 'AI4Bharat Indic-Transcribe ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ & ಸ್ವಯಂಚಾಲಿತ ದಾಖಲೀಕರಣ'
        };
      case 'maternal':
        return {
          title_kn: 'ತಾಯಿ ಮತ್ತು ಗರ್ಭಿಣಿ ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆ',
          title_en: 'Maternal Healthcare Module',
          subtitle: 'ಗರ್ಭಾವಸ್ಥೆ ಟ್ರ್ಯಾಕರ್, ತಪಾಸಣೆ, ಪೌಷ್ಟಿಕಾಂಶ & ಅಪಾಯಕಾರಿ ಲಕ್ಷಣಗಳ ಪರಿಶೀಲನೆ'
        };
      case 'structured_record':
        return {
          title_kn: 'ರಚನಾತ್ಮಕ ಭೇಟಿ ದಾಖಲೆ',
          title_en: 'Structured Clinical Visit Record',
          subtitle: 'ತಾಯಿ-ಮಗು ಆರೈಕೆ, ಲಸಿಕೆ ಮತ್ತು ಪರೀಕ್ಷಾ ವಿವರಗಳು'
        };
      case 'emergency':
        return {
          title_kn: 'ತುರ್ತು ಅಪಾಯಕಾರಿ ಎಚ್ಚರಿಕೆ',
          title_en: 'Emergency Danger Sign & Referral',
          subtitle: 'MoHFW ಧೃಢೀಕೃತ ತುರ್ತು ರೆಫರಲ್ ಮತ್ತು 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ನಿರ್ವಹಣೆ'
        };
      case 'ambulance':
        return {
          title_kn: '108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಲೈವ್ ಟ್ರ್ಯಾಕರ್',
          title_en: '108 Ambulance Dispatch Simulator',
          subtitle: 'ನೈಜ ಸಮಯದ ಜಿಪಿಎಸ್ ನಕ್ಷೆ ಮತ್ತು ಚಾಲಕರ ಸಂಪರ್ಕ'
        };
      case 'followups':
        return {
          title_kn: 'ಫಾಲೋ-ಅಪ್ ಮತ್ತು ವರದಿಗಳು',
          title_en: 'Follow-ups & Clinical Schedule',
          subtitle: 'ಮುಂಬರುವ ಗರ್ಭಿಣಿ ಮತ್ತು ನವಜಾತ ಶಿಶು ಮನೆ ಭೇಟಿಗಳು'
        };
      case 'beneficiaries':
        return {
          title_kn: 'ಫಲಾನುಭವಿಗಳ ಸಮುದಾಯ ರಿಜಿಸ್ಟರ್',
          title_en: 'Beneficiary Community Directory',
          subtitle: 'ಶಿವಳ್ಳಿ ಮತ್ತು ಕೆರೆಗೋಡು ಉಪಕೇಂದ್ರ ವ್ಯಾಪ್ತಿಯ ನಿವಾಸಿಗಳು'
        };
      default:
        return {
          title_kn: 'ಆಶಾ ಸಖಿ ದಿನಚರಿ',
          title_en: 'ASHA Sakhi Health Register',
          subtitle: 'ಕರ್ನಾಟಕ ಆರೋಗ್ಯ ಇಲಾಖೆ'
        };
    }
  };

  const details = getScreenDetails();
  const todayFormatted = new Intl.DateTimeFormat('kn-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  const todayEnglish = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  const roleName = userRole === 'mo' ? 'ಡಾ. ರಾಜೇಶ್' : userRole === 'anm' ? 'ಪುಷ್ಪಲತಾ' : 'ಶಾರದಾ ಬಾಯಿ';
  const roleTitle = userRole === 'mo' ? 'Medical Officer' : userRole === 'anm' ? 'ANM Supervisor' : 'ASHA Field Leader';

  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-[#FFF9F7]/95 backdrop-blur-md border-b border-[#F0DDE2] shadow-subtle sticky top-0 z-30 transition-colors">
      {/* 1. Screen Title & Subtitle */}
      <div className="flex items-center space-x-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-cormorant font-bold text-[#3B2A33] tracking-tight leading-tight">
              {details.title_kn}
            </h1>
            <span className="text-[10px] font-mono font-bold text-[#A25B74] bg-[#FDF6F5] px-2.5 py-0.5 rounded-full border border-[#F0DDE2]">
              {details.title_en}
            </span>
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
          placeholder="ಹುಡುಕಿ ಅಥವಾ ಕಮಾಂಡ್ (Search)..."
          className="w-full text-xs font-medium pl-10 pr-20 py-2.5 bg-white border border-[#F0DDE2] text-[#3B2A33] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A25B74] font-kannada cursor-pointer transition-all shadow-xs"
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
            <span className="font-cormorant font-bold text-sm">Public Portal</span>
          </button>
        )}

        {/* Date Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#FDF6F5] border border-[#F0DDE2] text-xs">
          <Calendar className="w-4 h-4 text-[#A25B74]" />
          <div className="text-right">
            <span className="block font-bold text-[#3B2A33] font-kannada text-[11px] leading-tight">
              {todayFormatted}
            </span>
            <span className="block text-[10px] text-[#7A6670] font-mono font-medium">
              {todayEnglish}
            </span>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center space-x-1.5 bg-[#FDF6F5] p-1 rounded-xl border border-[#F0DDE2] text-xs">
          {onOpenLanguageSelector && (
            <button
              onClick={onOpenLanguageSelector}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white text-[#A25B74] hover:text-[#84455C] font-bold border border-[#F0DDE2] shadow-xs transition-all"
              title="All 22 Scheduled Indic Languages"
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
                {code === 'en' ? 'EN' : l.name_native}
              </button>
            );
          })}
        </div>

        {/* Emergency Alert Button with Badge */}
        <button
          onClick={onEmergencyClick}
          className={`relative p-2 rounded-xl border transition-all active:scale-[0.98] ${
            emergencyCount > 0
              ? 'bg-[#FCF1F1] border-[#B94A58]/40 text-[#B94A58] animate-pulse hover:bg-[#F8DADA] shadow-md shadow-[#B94A58]/20'
              : 'bg-white border-[#F0DDE2] text-[#7A6670] hover:bg-[#FDF6F5]'
          }`}
          title="ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳು (Emergency Alerts)"
        >
          <Bell className="w-4 h-4" />
          {emergencyCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#B94A58] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-xs">
              {emergencyCount}
            </span>
          )}
        </button>

        {/* Profile Pill */}
        <div 
          onClick={onOpenAuth}
          className="flex items-center space-x-2.5 pl-2 border-l border-[#F0DDE2] cursor-pointer group"
          title="Click to Switch Role or Log In"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#A25B74] to-[#C47A92] text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
            {userRole === 'mo' ? '👨‍⚕️' : userRole === 'anm' ? '👩‍🏫' : '👩‍⚕️'}
          </div>
          <div className="text-left hidden xl:block">
            <span className="block text-xs font-bold text-[#3B2A33] font-kannada leading-tight group-hover:text-[#A25B74]">
              {roleName}
            </span>
            <span className="block text-[10px] text-[#A25B74] font-medium">
              {roleTitle}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
