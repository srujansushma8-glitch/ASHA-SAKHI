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
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-navy-200/60 safe-bottom shadow-card lg:hidden"
    >
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeScreen === tab.id;

          // Special Center Action Button: Large Microphone / Recording Stop
          if (tab.isCenterAction) {
            return (
              <div key={tab.id} className="relative -top-4 flex flex-col items-center">
                <button
                  onClick={() => setActiveScreen('record')}
                  aria-label={isRecording ? "Stop Voice Recording" : "Start Voice Visit"}
                  className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-white active:scale-95 transition-decelerate touch-manipulation ${
                    isRecording
                      ? 'bg-emergency hover:bg-emergency-hover text-white shadow-emergency animate-pulse'
                      : isActive
                      ? 'bg-gradient-to-r from-primary to-cyan text-white shadow-cyan'
                      : 'bg-primary hover:bg-primary-hover text-white shadow-touch'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-6 h-6 fill-current" />
                  ) : (
                    <Mic className="w-7 h-7" />
                  )}
                </button>
                <span className={`text-[10px] font-bold font-kannada mt-0.5 ${
                  isActive ? 'text-primary' : 'text-navy-600'
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
              className={`flex-1 py-1 px-1 flex flex-col items-center justify-center relative touch-manipulation active:scale-95 transition-decelerate ${
                isActive 
                  ? tab.isMaternal 
                    ? 'text-pink font-bold'
                    : 'text-primary font-bold' 
                  : 'text-navy-400 hover:text-navy-700'
              }`}
            >
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.2px]' : 'stroke-[1.8px]'
                  }`} 
                />

                {/* Badge for Emergency or Notifications */}
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-emergency text-white text-[9px] font-mono font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse border-2 border-white shadow-emergency">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] font-kannada leading-tight mt-1 tracking-tight truncate max-w-[64px]">
                {tab.label_kn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
