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
          title_en: 'AI Field Assistant Overview',
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
          title_en: 'ASHA Incentive & NHM Ledger',
          subtitle: 'JSY, ಲಸಿಕಾ ಪ್ರೋತ್ಸಾಹಧನ, ಮಾಸಿಕ ಗಳಿಕೆ ಮತ್ತು ಮೇಲ್ವಿಚಾರಕರ ಅನುಮೋದನೆ'
        };
      case 'record':
        return {
          title_kn: 'ಧ್ವನಿ ಕ್ಷೇತ್ರ ದಿನಚರಿ',
          title_en: 'AI4Bharat Voice Recording',
          subtitle: 'Indic-Transcribe ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ & ಸ್ವಯಂಚಾಲಿತ ದಾಖಲೀಕರಣ'
        };
      case 'maternal':
        return {
          title_kn: 'ತಾಯಿ ಮತ್ತು ಗರ್ಭಿಣಿ ಆರೋಗ್ಯ ವಿಶ್ಲೇಷಣೆ',
          title_en: 'Maternal Healthcare Analytics',
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
          title_en: 'Follow-ups & Statistical Reports',
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
          title_en: 'ASHA SAKHI Health Register',
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
    <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white dark:bg-navy-900 border-b border-navy-200/60 dark:border-navy-800 shadow-subtle sticky top-0 z-30 transition-colors">
      {/* 1. Screen Title & Subtitle */}
      <div className="flex items-center space-x-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold font-kannada text-navy-900 dark:text-white tracking-tight leading-tight">
              {details.title_kn}
            </h1>
            <span className="text-[11px] font-mono font-bold text-primary dark:text-cyan bg-cyan-50 dark:bg-cyan/10 px-2.5 py-0.5 rounded-md border border-cyan-200 dark:border-cyan/30">
              {details.title_en}
            </span>
          </div>
          <p className="text-xs text-navy-500 dark:text-navy-400 font-medium mt-0.5 flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-primary shrink-0" />
            {details.subtitle}
          </p>
        </div>
      </div>

      {/* 2. Middle: Search / Command Palette Bar */}
      <div className="w-80 relative flex items-center">
        <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          onClick={() => onOpenCommandPalette && onOpenCommandPalette()}
          placeholder="ಹುಡುಕಿ ಅಥವಾ ಕಮಾಂಡ್ (Search)..."
          className="w-full text-xs font-medium pl-10 pr-20 py-2.5 bg-softblue dark:bg-navy-800 border border-navy-200/70 dark:border-navy-700 text-navy-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-navy-900 transition-decelerate font-kannada cursor-pointer"
        />
        <button
          onClick={onOpenCommandPalette}
          className="absolute right-2 px-1.5 py-1 rounded bg-white dark:bg-navy-700 border border-navy-200 dark:border-navy-600 text-[10px] font-mono font-bold text-navy-500 dark:text-navy-300 hover:text-primary transition-colors flex items-center space-x-0.5 shadow-xs"
          title="Open Command Palette (Ctrl+K)"
        >
          <span>Ctrl</span>
          <span>+</span>
          <span>K</span>
        </button>
      </div>

      {/* 3. Right Details: 3D Landing Link, Theme Toggle, Language, Alert Bell, Profile */}
      <div className="flex items-center space-x-3">
        
        {/* Landing Page Link */}
        {onViewLanding && (
          <button
            onClick={onViewLanding}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cream-100 dark:bg-navy-800 hover:bg-cream-200 dark:hover:bg-navy-700 border border-navy-200/60 dark:border-navy-700 text-navy-700 dark:text-navy-200 text-xs font-bold transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-saffron" />
            <span>3D Showcase</span>
          </button>
        )}

        {/* Dark Mode Toggle Button */}
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl bg-softblue dark:bg-navy-800 border border-navy-200/60 dark:border-navy-700 text-navy-700 dark:text-navy-200 hover:bg-white dark:hover:bg-navy-700 transition-all"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-navy-600" />}
          </button>
        )}

        {/* Date Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-softblue dark:bg-navy-800 border border-navy-200/60 dark:border-navy-700 text-xs">
          <Calendar className="w-4 h-4 text-primary" />
          <div className="text-right">
            <span className="block font-bold text-navy-900 dark:text-white font-kannada text-[11px] leading-tight">
              {todayFormatted}
            </span>
            <span className="block text-[10px] text-navy-500 dark:text-navy-400 font-mono font-medium">
              {todayEnglish}
            </span>
          </div>
        </div>

        {/* Language Selector */}
        {onLanguageChange && (
          <div className="flex bg-softblue dark:bg-navy-800 p-0.5 rounded-xl border border-navy-200/60 dark:border-navy-700 text-xs">
            {[
              { id: 'kn', label: 'ಕನ್ನಡ' },
              { id: 'hi', label: 'हिन्दी' },
              { id: 'en', label: 'Eng' }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => onLanguageChange(l.id)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-decelerate ${
                  currentLanguage === l.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-navy-600 dark:text-navy-300 hover:text-navy-900'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}

        {/* Emergency Alert Button with Badge */}
        <button
          onClick={onEmergencyClick}
          className={`relative p-2 rounded-xl border transition-decelerate active:scale-[0.98] ${
            emergencyCount > 0
              ? 'bg-emergency-50 dark:bg-emergency/20 border-emergency-300 text-emergency animate-pulse hover:bg-emergency-100 shadow-emergency'
              : 'bg-white dark:bg-navy-800 border-navy-200 dark:border-navy-700 text-navy-600 dark:text-navy-300 hover:bg-softblue'
          }`}
          title="ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳು (Emergency Alerts)"
        >
          <Bell className="w-4 h-4" />
          {emergencyCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-emergency text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-navy-900 shadow-emergency">
              {emergencyCount}
            </span>
          )}
        </button>

        {/* Profile Pill */}
        <div 
          onClick={onOpenAuth}
          className="flex items-center space-x-2.5 pl-2 border-l border-navy-200/60 dark:border-navy-700 cursor-pointer group"
          title="Click to Switch Role or Log In"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-navy-900 to-primary text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:ring-2 ring-primary transition-all">
            {userRole === 'mo' ? '👨‍⚕️' : userRole === 'anm' ? '👩‍🏫' : '👩‍⚕️'}
          </div>
          <div className="text-left hidden xl:block">
            <span className="block text-xs font-bold text-navy-900 dark:text-white font-kannada leading-tight group-hover:text-primary">
              {roleName}
            </span>
            <span className="block text-[10px] text-cyan-700 dark:text-cyan font-medium">
              {roleTitle}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
