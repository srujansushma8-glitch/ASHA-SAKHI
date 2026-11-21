import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Mic, 
  Baby, 
  Users, 
  MapPin, 
  IndianRupee, 
  CalendarCheck, 
  AlertTriangle, 
  Ambulance, 
  Globe, 
  Sun, 
  Moon, 
  ExternalLink,
  X,
  Sparkles,
  Command
} from 'lucide-react';
import { INDIC_LANGUAGES } from '../services/languages';
import { useLanguage } from '../context/LanguageContext';

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onStartRecording,
  onOpenLanguageSelector,
  onViewLanding,
  isDarkMode,
  onToggleDarkMode
}) {
  const { t, currentLanguage, onLanguageChange } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
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
      title: t('dashboard.quickVoiceVisit'),
      subtitle: t('voice.subtitle'),
      category: t('cmdPalette.quickActions'),
      icon: Mic,
      color: 'text-[#A25B74] bg-[#FDF6F5]',
      action: () => {
        onClose();
        if (onStartRecording) onStartRecording();
      }
    },
    {
      id: 'emergency_sos',
      title: t('dashboard.quickEmergency'),
      subtitle: t('emergency.subtitle'),
      category: t('cmdPalette.quickActions'),
      icon: AlertTriangle,
      color: 'text-[#B94A58] bg-[#FCF1F1]',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('emergency');
      }
    },
    {
      id: 'household_route',
      title: t('route.title'),
      subtitle: t('route.subtitle'),
      category: t('cmdPalette.navigation'),
      icon: MapPin,
      color: 'text-[#C47A92] bg-[#FDF6F5]',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('route');
      }
    },
    {
      id: 'incentives_ledger',
      title: t('incentives.title'),
      subtitle: t('incentives.subtitle'),
      category: t('cmdPalette.navigation'),
      icon: IndianRupee,
      color: 'text-[#B88745] bg-[#FEF9EF]',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('incentives');
      }
    },
    {
      id: 'maternal_health',
      title: t('maternal.title'),
      subtitle: t('maternal.subtitle'),
      category: t('cmdPalette.navigation'),
      icon: Baby,
      color: 'text-[#A25B74] bg-[#FDF6F5]',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('maternal');
      }
    },
    {
      id: 'beneficiaries',
      title: t('beneficiaries.title'),
      subtitle: t('beneficiaries.subtitle'),
      category: t('cmdPalette.navigation'),
      icon: Users,
      color: 'text-[#477A60] bg-[#E8F7F1]',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('beneficiaries');
      }
    },
    {
      id: 'followups',
      title: t('nav.followups'),
      subtitle: t('dashboard.maternalSubtext'),
      category: t('cmdPalette.navigation'),
      icon: CalendarCheck,
      color: 'text-[#7A6670] bg-[#FDF6F5]',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('followups');
      }
    },
    {
      id: 'ambulance_tracker',
      title: t('ambulance.title'),
      subtitle: t('ambulance.subtitle'),
      category: t('cmdPalette.quickActions'),
      icon: Ambulance,
      color: 'text-[#B94A58] bg-[#FCF1F1]',
      action: () => {
        onClose();
        if (onNavigate) onNavigate('ambulance');
      }
    },
    {
      id: 'landing_page',
      title: t('nav.publicPortal'),
      subtitle: 'Public Landing Page & 3D Site',
      category: t('cmdPalette.navigation'),
      icon: ExternalLink,
      color: 'text-[#A25B74] bg-[#FDF6F5]',
      action: () => {
        onClose();
        if (onViewLanding) onViewLanding();
      }
    },
    {
      id: 'toggle_dark_mode',
      title: isDarkMode ? t('common.lightMode') : t('common.darkMode'),
      subtitle: 'Theme Setting',
      category: t('cmdPalette.quickActions'),
      icon: isDarkMode ? Sun : Moon,
      color: 'text-amber-600 bg-amber-50',
      action: () => {
        onClose();
        if (onToggleDarkMode) onToggleDarkMode();
      }
    },
    {
      id: 'open_all_languages',
      title: t('nav.languages'),
      subtitle: t('modals.allLanguages'),
      category: t('nav.languages'),
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
      subtitle: `Script: ${lang.script} • Region: ${lang.region}${lang.dir === 'rtl' ? ' • RTL' : ''}`,
      category: t('nav.languages'),
      icon: Globe,
      color: currentLanguage === lang.code ? 'text-[#A25B74] bg-[#FDF6F5] font-bold' : 'text-[#7A6670] bg-white',
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#F0DDE2] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center px-5 py-4 border-b border-[#F0DDE2]">
          <Search className="w-5 h-5 text-[#C47A92] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInList}
            placeholder={t("cmdPalette.placeholder")}
            className="w-full text-sm font-medium bg-transparent text-[#3B2A33] placeholder-[#C47A92] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-xl hover:bg-[#FDF6F5] text-[#7A6670] hover:text-[#3B2A33] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-3 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#7A6670]">
              {t("common.search")}
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
                    isSelected ? 'bg-[#FDF6F5] border border-[#F0DDE2]' : 'hover:bg-[#FDF6F5]/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="block text-xs font-bold text-[#3B2A33] truncate">
                        {item.title}
                      </span>
                      <span className="block text-[10px] text-[#7A6670] truncate">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-[#A25B74] px-2 py-0.5 rounded-md bg-[#FDF6F5] border border-[#F0DDE2] shrink-0 ml-2">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
