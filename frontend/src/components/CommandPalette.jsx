import { INDIC_LANGUAGES } from '../services/languages';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Mic, 
  Baby, 
  Users, 
  CalendarCheck, 
  AlertTriangle, 
  Ambulance, 
  MapPin, 
  IndianRupee, 
  ExternalLink, 
  Globe, 
  Moon, 
  Sun, 
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Command,
  X
} from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onStartRecording,
  onToggleDarkMode,
  isDarkMode,
  onLanguageChange,
  onOpenLanguageSelector,
  currentLanguage,
  onViewLanding
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard shortcut listener for opening with Cmd+K or Ctrl+K and closing with Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via custom event or parent callback
          window.dispatchEvent(new CustomEvent('asha_open_command_palette'));
        }
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const allActions = [
    {
      id: 'voice_visit',
      title: 'ಹೊಸ ಧ್ವನಿ ಭೇಟಿ ಪ್ರಾರಂಭಿಸಿ (New Voice Visit)',
      subtitle: 'AI4Bharat Indic-Transcribe speech-to-register',
      category: 'AI Actions',
      icon: Mic,
      color: 'text-[#A25B74] bg-[#FDF6F5]',
      action: () => {
        onClose();
        if (onStartRecording) onStartRecording();
      }
    },
    {
      id: 'emergency_sos',
      title: 'ತುರ್ತು 108 ಆಂಬ್ಯುಲೆನ್ಸ್ ರೆಫರಲ್ (Emergency Danger Sign SOS)',
      subtitle: 'High-risk clinical referral with GPS ambulance dispatch',
      category: 'Emergency',
      icon: AlertTriangle,
      color: 'text-[#B94A58] bg-[#FCF1F1]',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('emergency');
      }
    },
    {
      id: 'household_route',
      title: 'ಗ್ರಾಮ ಮನೆ ಭೇಟಿ ನಕ್ಷೆ (Village Household Route Map)',
      subtitle: 'Daily optimized field route with GPS markers',
      category: 'Navigation',
      icon: MapPin,
      color: 'text-[#C47A92] bg-[#FDF6F5]',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('route');
      }
    },
    {
      id: 'incentives_ledger',
      title: 'ಆಶಾ ಪ್ರೋತ್ಸಾಹಧನ ಲೆಕ್ಕಪತ್ರ (ASHA Incentives & NHM Ledger)',
      subtitle: 'JSY, Immunization, ANC payout tracking & ANM approval',
      category: 'Finance',
      icon: IndianRupee,
      color: 'text-[#B88745] bg-[#FEF9EF]',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('incentives');
      }
    },
    {
      id: 'maternal_health',
      title: 'ತಾಯಿ ಆರೋಗ್ಯ ಮಾನಿಟರ್ (Maternal & ANC Tracker)',
      subtitle: 'Trimester checkups, IFA tablets, Hb testing',
      category: 'Clinical',
      icon: Baby,
      color: 'text-[#A25B74] bg-[#FDF6F5]',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('maternal');
      }
    },
    {
      id: 'beneficiaries',
      title: 'ಫಲಾನುಭವಿಗಳ ರಿಜಿಸ್ಟರ್ (Beneficiary Directory)',
      subtitle: '48 registered mothers and infants in Shivalli sector',
      category: 'Records',
      icon: Users,
      color: 'text-[#477A60] bg-[#E8F7F1]',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('beneficiaries');
      }
    },
    {
      id: 'followups',
      title: 'ಫಾಲೋ-ಅಪ್ ಮತ್ತು ಬಾಕಿ ಭೇಟಿಗಳು (Follow-ups & Reminders)',
      subtitle: 'Pending vaccinations and postpartum home visits',
      category: 'Records',
      icon: CalendarCheck,
      color: 'text-[#7A6670] bg-[#FDF6F5]',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('followups');
      }
    },
    {
      id: 'ambulance_tracker',
      title: '108 ಆಂಬ್ಯುಲೆನ್ಸ್ ಲೈವ್ ಟ್ರ್ಯಾಕರ್ (Ambulance Live Tracking)',
      subtitle: 'Real-time vehicle position and driver telemetry',
      category: 'Emergency',
      icon: Ambulance,
      color: 'text-[#B94A58] bg-[#FCF1F1]',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('ambulance');
      }
    },
    {
      id: 'landing_page',
      title: 'ಮುಖ್ಯ ಲ್ಯಾಂಡಿಂಗ್ ಪೇಜ್ ವೀಕ್ಷಿಸಿ (View 3D Landing Page)',
      subtitle: 'Return to public showcase & 3D hero page',
      category: 'General',
      icon: ExternalLink,
      color: 'text-[#A25B74] bg-[#FDF6F5]',
      action: () => {
        onClose();
        if (onViewLanding) onViewLanding();
      }
    },
    {
      id: 'toggle_dark_mode',
      title: isDarkMode ? 'ಲೈಟ್ ಮೋಡ್‌ಗೆ ಬದಲಾಯಿಸಿ (Switch to Light Mode)' : 'ಡಾರ್ಕ್ ಮೋಡ್‌ಗೆ ಬದಲಾಯಿಸಿ (Switch to Dark Mode)',
      subtitle: 'Toggle application color theme',
      category: 'Preferences',
      icon: isDarkMode ? Sun : Moon,
      color: 'text-amber-600 bg-amber-50',
      action: () => {
        onClose();
        if (onToggleDarkMode) onToggleDarkMode();
      }
    },
    {
      id: 'open_all_languages',
      title: '22 ಭಾರತೀಯ ಭಾಷೆಗಳು (All 22 Scheduled Indic Languages)',
      subtitle: 'AI4Bharat Indic-Transcribe & Indic-Speak Language Selector',
      category: 'Languages',
      icon: Globe,
      color: 'text-[#A25B74] bg-[#FDF6F5]',
      action: () => {
        onClose();
        if (onOpenLanguageSelector) onOpenLanguageSelector();
      }
    },
    ...INDIC_LANGUAGES.map(lang => ({
      id: `lang_${lang.code}`,
      title: `${lang.name_native} (${lang.name_en})`,
      subtitle: `Script: ${lang.script} • Region: ${lang.region}${lang.dir === 'rtl' ? ' • RTL Script' : ''}`,
      category: '22 Indic Languages',
      icon: Globe,
      color: currentLanguage === lang.code ? 'text-primary bg-primary/20 font-bold' : 'text-[#7A6670] bg-[#FDF6F5]',
      action: () => {
        onClose();
        if (onLanguageChange) onLanguageChange(lang.code);
      }
    }))
  ];

  const filtered = allActions.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDownInList = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#F0DDE2] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-[#F0DDE2] bg-[#FFF9F7]">
          <Search className="w-5 h-5 text-[#A25B74] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInList}
            placeholder="ತ್ವರಿತ ಆಜ್ಞೆ ಅಥವಾ ಫಲಾನುಭವಿ ಹುಡುಕಿ (Type a command or search)..."
            className="flex-1 bg-transparent text-[#3B2A33] placeholder-[#7A6670] text-sm font-medium focus:outline-none font-kannada"
          />
          <div className="flex items-center space-x-2">
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-navy-500 dark:text-navy-400 bg-navy-100 dark:bg-navy-800 rounded border border-navy-200 dark:border-navy-700">
              ESC to close
            </kbd>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg text-navy-400 hover:text-navy-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Items List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-navy-400 dark:text-navy-500 font-medium font-kannada">
              ಯಾವುದೇ ಫಲಿತಾಂಶ ಕಂಡುಬಂದಿಲ್ಲ (No matching commands found)
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-[#F9ECEC] border border-[#F0DDE2] text-[#A25B74]' 
                      : 'hover:bg-[#FDF6F5] text-[#3B2A33]'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate font-kannada">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-navy-400 dark:text-navy-400 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-navy-100 dark:bg-navy-800 text-navy-500 dark:text-navy-400">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-4 h-4 text-[#A25B74]" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Hint Footer */}
        <div className="px-5 py-2.5 bg-[#FFF9F7] border-t border-[#F0DDE2] flex items-center justify-between text-[11px] text-[#7A6670]">
          <div className="flex items-center space-x-3">
            <span>↑↓ ನ್ಯಾವಿಗೇಟ್</span>
            <span>↵ ಆಯ್ಕೆಮಾಡಿ</span>
          </div>
          <span className="font-mono text-[10px] font-bold text-[#A25B74]">
            ASHA SAKHI Command Engine v2.4
          </span>
        </div>
      </div>
    </div>
  );
}
