import React from 'react';
import { 
  Bell, 
  Calendar, 
  MapPin, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Wifi, 
  Sparkles,
  HeartPulse
} from 'lucide-react';

export default function DesktopHeader({ 
  activeScreen, 
  emergencyCount = 0, 
  onEmergencyClick,
  onSearchClick
}) {
  const getScreenDetails = () => {
    switch (activeScreen) {
      case 'home':
        return {
          title_kn: 'ಆಶಾ ಮುಖಪುಟ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
          title_en: 'Field Register Dashboard',
          subtitle: 'ಮಂಡ್ಯ ತಾಲೂಕು ಪ್ರಾಥಮಿಕ ಆರೋಗ್ಯ ಕೇಂದ್ರ (PHC Mandya Sector 4)'
        };
      case 'record':
        return {
          title_kn: 'ಧ್ವನಿ ಕ್ಷೇತ್ರ ದಿನಚರಿ',
          title_en: 'AI4Bharat Voice Recording',
          subtitle: 'Indic-Transcribe ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ & ಸ್ವಯಂಚಾಲಿತ ದಾಖಲೀಕರಣ'
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
          title_kn: 'ಫಾಲೋ-ಅಪ್ ಭೇಟಿ ವೇಳಾಪಟ್ಟಿ',
          title_en: 'Follow-up Visit Schedule',
          subtitle: 'ಮುಂಬರುವ ಗರ್ಭಿಣಿ ಮತ್ತು ನವಜಾತ ಶಿಶು ಮನೆ ಭೇಟಿಗಳು'
        };
      case 'beneficiaries':
        return {
          title_kn: 'ಫಲಾನುಭವಿಗಳ ರಿಜಿಸ್ಟರ್',
          title_en: 'Beneficiary Community Register',
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
    <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-navy-100 shadow-subtle sticky top-0 z-30">
      {/* Screen Title & Subtitle */}
      <div>
        <div className="flex items-center space-x-2.5">
          <h1 className="text-xl font-bold font-kannada text-navy tracking-tight">
            {details.title_kn}
          </h1>
          <span className="text-xs font-mono font-bold text-primary bg-mint-surface/80 px-2 py-0.5 rounded-md border border-primary-100">
            {details.title_en}
          </span>
        </div>
        <p className="text-xs text-navy-500 font-medium mt-0.5 flex items-center">
          <MapPin className="w-3.5 h-3.5 mr-1 text-primary shrink-0" />
          {details.subtitle}
        </p>
      </div>

      {/* Right Details: Date, Area, Emergency Bell */}
      <div className="flex items-center space-x-4">
        {/* Date Indicator */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-ivory-bg border border-navy-100 text-xs">
          <Calendar className="w-4 h-4 text-primary" />
          <div className="text-right">
            <span className="block font-bold text-navy font-kannada text-[11px] leading-tight">
              {todayFormatted}
            </span>
            <span className="block text-[10px] text-navy-400 font-mono font-medium">
              {todayEnglish}
            </span>
          </div>
        </div>

        {/* Emergency Alert Button with Badge */}
        <button
          onClick={onEmergencyClick}
          className={`relative p-2.5 rounded-xl border transition-decelerate active:scale-[0.98] ${
            emergencyCount > 0
              ? 'bg-emergency-50 border-emergency-300 text-emergency animate-pulse hover:bg-emergency-100'
              : 'bg-white border-navy-200 text-navy-600 hover:bg-navy-50'
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
      </div>
    </header>
  );
}
