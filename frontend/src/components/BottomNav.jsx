import React from 'react';
import { Home, Users, Mic, CalendarCheck, AlertTriangle } from 'lucide-react';

export default function BottomNav({ activeScreen, setActiveScreen, emergencyCount = 0, isRecording = false }) {
  const tabs = [
    {
      id: 'home',
      label_kn: 'ಮುಖಪುಟ',
      label_en: 'Home',
      icon: Home
    },
    {
      id: 'beneficiaries',
      label_kn: 'ಫಲಾನುಭವಿ',
      label_en: 'Beneficiaries',
      icon: Users
    },
    {
      id: 'record',
      label_kn: 'ಧ್ವನಿ ದಾಖಲೆ',
      label_en: 'Voice Visit',
      icon: Mic,
      isSpecial: true
    },
    {
      id: 'followups',
      label_kn: 'ಫಾಲೋ-ಅಪ್',
      label_en: 'Follow-ups',
      icon: CalendarCheck
    },
    {
      id: 'emergency',
      label_kn: 'ತುರ್ತು',
      label_en: 'Alerts',
      icon: AlertTriangle,
      badge: emergencyCount
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-navy-100 shadow-lg safe-bottom">
      <div className="max-w-2xl mx-auto px-2 flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeScreen === tab.id;

          if (tab.isSpecial) {
            return (
              <div key={tab.id} className="relative -top-3">
                <button
                  onClick={() => setActiveScreen(tab.id)}
                  aria-label="Start Voice Recording"
                  className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 touch-manipulation border-2 border-white ${
                    isRecording
                      ? 'bg-emergency-600 text-white shadow-emergency animate-pulse'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-touch'
                  }`}
                >
                  <Icon className={`w-7 h-7 ${isRecording ? 'animate-bounce' : ''}`} />
                </button>
                <span className="block text-center text-[10px] font-semibold text-teal-800 mt-0.5">
                  {isRecording ? 'ರೆಕಾರ್ಡಿಂಗ್' : 'ಧ್ವನಿ ರೆಕಾರ್ಡ್'}
                </span>
              </div>
            );
          }

          const isEmergencyTab = tab.id === 'emergency';

          return (
            <button
              key={tab.id}
              onClick={() => setActiveScreen(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-lg touch-manipulation transition-colors relative min-h-[48px] ${
                isActive
                  ? isEmergencyTab
                    ? 'text-emergency-600 font-bold'
                    : 'text-teal-700 font-bold'
                  : 'text-navy-600 hover:text-navy-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-emergency-600 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-white animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 leading-tight font-kannada">
                {tab.label_kn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
