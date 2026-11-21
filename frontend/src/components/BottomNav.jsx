import React from 'react';
import { 
  Home, 
  Baby, 
  Mic, 
  Users, 
  AlertTriangle,
  Square
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function BottomNav({
  activeScreen,
  setActiveScreen,
  emergencyCount = 0,
  isRecording = false
}) {
  const { t } = useLanguage();

  const tabs = [
    {
      id: 'home',
      label: t('nav.dashboard'),
      icon: Home
    },
    {
      id: 'maternal',
      label: t('nav.maternalHealth'),
      icon: Baby
    },
    {
      id: 'record',
      label: isRecording ? t('common.cancel') : t('nav.voiceVisit'),
      icon: Mic,
      isCenterAction: true
    },
    {
      id: 'beneficiaries',
      label: t('nav.beneficiaries'),
      icon: Users
    },
    {
      id: 'emergency',
      label: t('nav.emergency'),
      icon: AlertTriangle,
      badge: emergencyCount
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFF9F7]/95 backdrop-blur-md border-t border-[#F0DDE2] shadow-lg pb-safe">
      <div className="max-w-md mx-auto px-2 py-1 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeScreen === tab.id;

          if (tab.isCenterAction) {
            return (
              <div key={tab.id} className="relative -top-4 flex flex-col items-center">
                <button
                  onClick={() => setActiveScreen('record')}
                  aria-label={tab.label}
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-[#FFF9F7] active:scale-95 transition-all touch-manipulation ${
                    isRecording
                      ? 'bg-[#B94A58] text-white shadow-lg shadow-[#B94A58]/30 animate-pulse'
                      : isActive
                      ? 'bg-gradient-to-tr from-[#A25B74] to-[#C47A92] text-white shadow-lg shadow-[#A25B74]/30'
                      : 'bg-[#A25B74] hover:bg-[#84455C] text-white shadow-md shadow-[#A25B74]/25'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-6 h-6 fill-current" />
                  ) : (
                    <Mic className="w-6 h-6" />
                  )}
                </button>
                <span className={`text-[10px] font-bold mt-0.5 ${
                  isActive ? 'text-[#A25B74]' : 'text-[#7A6670]'
                }`}>
                  {tab.label}
                </span>
              </div>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveScreen(tab.id)}
              aria-label={tab.label}
              className={`flex-1 py-1 px-1 flex flex-col items-center justify-center relative touch-manipulation active:scale-95 transition-all ${
                isActive 
                  ? 'text-[#A25B74] font-bold' 
                  : 'text-[#7A6670] hover:text-[#3B2A33]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${
                  isActive ? 'stroke-[2.3px] text-[#A25B74]' : 'stroke-[1.8px] text-[#C47A92]'
                }`} />
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#B94A58] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-semibold truncate max-w-[64px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
