import React from 'react';
import { 
  Home, 
  Users, 
  Mic, 
  Baby,
  AlertTriangle, 
  Square
} from 'lucide-react';

export default function BottomNav({ 
  activeScreen, 
  setActiveScreen, 
  emergencyCount = 0,
  isRecording = false
}) {
  const tabs = [
    {
      id: 'home',
      label_kn: 'ಮುಖಪುಟ',
      label_en: 'Home',
      icon: Home
    },
    {
      id: 'maternal',
      label_kn: 'ತಾಯಿ ಆರೋಗ್ಯ',
      label_en: 'Maternal',
      icon: Baby,
      isMaternal: true
    },
    {
      id: 'record',
      label_kn: 'ಧ್ವನಿ ಭೇಟಿ',
      label_en: 'Voice Visit',
      icon: Mic,
      isCenterAction: true
    },
    {
      id: 'beneficiaries',
      label_kn: 'ಫಲಾನುಭವಿಗಳು',
      label_en: 'Registry',
      icon: Users
    },
    {
      id: 'emergency',
      label_kn: 'ತುರ್ತು 108',
      label_en: 'Alerts',
      icon: AlertTriangle,
      badge: emergencyCount
    }
  ];

  return (
    <nav 
      role="navigation" 
      aria-label="Mobile Bottom Navigation" 
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFF9F7]/95 backdrop-blur-md border-t border-[#F0DDE2] safe-bottom shadow-md lg:hidden"
    >
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeScreen === tab.id;

          // Center Action Button: Large Microphone / Recording Stop
          if (tab.isCenterAction) {
            return (
              <div key={tab.id} className="relative -top-4 flex flex-col items-center">
                <button
                  onClick={() => setActiveScreen('record')}
                  aria-label={isRecording ? "Stop Voice Recording" : "Start Voice Visit"}
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
                <span className={`text-[10px] font-bold font-kannada mt-0.5 ${
                  isActive ? 'text-[#A25B74]' : 'text-[#7A6670]'
                }`}>
                  {isRecording ? 'ನಿಲ್ಲಿಸಿ' : tab.label_kn}
                </span>
              </div>
            );
          }

          // Regular Tab Item
          return (
            <button
              key={tab.id}
              onClick={() => setActiveScreen(tab.id)}
              aria-label={tab.label_en}
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
              <span className="text-[10px] font-kannada leading-tight mt-1">
                {tab.label_kn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
