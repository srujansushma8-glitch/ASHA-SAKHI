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
  Globe
} from 'lucide-react';

export default function DesktopHeader({ 
  activeScreen, 
  emergencyCount = 0, 
  onEmergencyClick,
  onSearchChange,
  searchValue = '',
  currentLanguage = 'kn',
  onLanguageChange
}) {
  const getScreenDetails = () => {
    switch (activeScreen) {
      case 'home':
        return {
          title_kn: 'ಆಶಾ ಮುಖ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
          title_en: 'AI Field Assistant Overview',
          subtitle: 'ಮಂಡ್ಯ ತಾಲೂಕು PHC (ಶಿವಳ್ಳಿ & ಕೆರೆಗೋಡು ವಲಯ - Sector 4)'
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

  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-navy-200/60 shadow-subtle sticky top-0 z-30">
      {/* 1. Screen Title & Subtitle */}
      <div className="flex items-center space-x-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold font-kannada text-navy-900 tracking-tight leading-tight">
              {details.title_kn}
            </h1>
            <span className="text-[11px] font-mono font-bold text-primary bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-200">
              {details.title_en}
            </span>
          </div>
          <p className="text-xs text-navy-500 font-medium mt-0.5 flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-primary shrink-0" />
            {details.subtitle}
          </p>
        </div>
      </div>

      {/* 2. Middle: Search Beneficiaries Bar */}
      <div className="w-72 relative">
        <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder="ಫಲಾನುಭವಿ ಹುಡುಕಿ (Search)..."
          className="w-full text-xs font-medium pl-10 pr-4 py-2.5 bg-softblue border border-navy-200/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-decelerate font-kannada"
        />
      </div>

      {/* 3. Right Details: Date, Language Selector, Alert Bell, Profile */}
      <div className="flex items-center space-x-3.5">
        {/* Date Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-softblue border border-navy-200/60 text-xs">
          <Calendar className="w-4 h-4 text-primary" />
          <div className="text-right">
            <span className="block font-bold text-navy-900 font-kannada text-[11px] leading-tight">
              {todayFormatted}
            </span>
            <span className="block text-[10px] text-navy-500 font-mono font-medium">
              {todayEnglish}
            </span>
          </div>
        </div>

        {/* Language Selector */}
        {onLanguageChange && (
          <div className="flex bg-softblue p-0.5 rounded-xl border border-navy-200/60 text-xs">
            {[
              { id: 'kn', label: 'ಕನ್ನಡ' },
              { id: 'kn-en', label: 'ಕನ್+En' },
              { id: 'en', label: 'Eng' }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => onLanguageChange(l.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-decelerate ${
                  currentLanguage === l.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-navy-600 hover:text-navy-900'
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
          className={`relative p-2.5 rounded-xl border transition-decelerate active:scale-[0.98] ${
            emergencyCount > 0
              ? 'bg-emergency-50 border-emergency-300 text-emergency animate-pulse hover:bg-emergency-100 shadow-emergency'
              : 'bg-white border-navy-200 text-navy-600 hover:bg-softblue'
          }`}
          title="ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳು (Emergency Alerts)"
        >
          <Bell className="w-5 h-5" />
          {emergencyCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-emergency text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-emergency">
              {emergencyCount}
            </span>
          )}
        </button>

        {/* Profile Pill */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-navy-200/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-900 to-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
            ಶಾರದಾ
          </div>
          <div className="text-left hidden xl:block">
            <span className="block text-xs font-bold text-navy-900 font-kannada leading-tight">
              ಶಾರದಾ ಬಾಯಿ
            </span>
            <span className="block text-[10px] text-cyan-700 font-medium">
              ASHA Field Leader
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
