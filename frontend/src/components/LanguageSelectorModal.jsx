import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Globe, 
  Check, 
  Sparkles, 
  Volume2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { INDIC_LANGUAGES, getLanguageByCode } from '../services/languages';

export default function LanguageSelectorModal({
  isOpen,
  onClose,
  currentLanguage = 'kn',
  onSelectLanguage
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'south', 'north', 'east', 'west', 'rtl'

  const activeLangInfo = useMemo(() => getLanguageByCode(currentLanguage), [currentLanguage]);

  const filteredLanguages = useMemo(() => {
    return INDIC_LANGUAGES.filter(lang => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        lang.name_en.toLowerCase().includes(q) ||
        lang.name_native.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q) ||
        lang.region.toLowerCase().includes(q) ||
        lang.script.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (activeFilter === 'rtl') return lang.dir === 'rtl';
      if (activeFilter === 'south') return ['kn', 'te', 'ta', 'ml'].includes(lang.code);
      if (activeFilter === 'north') return ['hi', 'pa', 'doi', 'ks', 'ur', 'sa'].includes(lang.code);
      if (activeFilter === 'east') return ['bn', 'as', 'or', 'mai', 'mni', 'brx', 'sat'].includes(lang.code);
      if (activeFilter === 'west') return ['mr', 'gu', 'kok', 'sd'].includes(lang.code);

      return true;
    });
  }, [searchQuery, activeFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-navy-900 rounded-3xl shadow-2xl border border-navy-200/80 dark:border-navy-700 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-navy-100 dark:border-navy-800 bg-gradient-to-r from-softblue/60 via-white to-mint-50/50 dark:from-navy-800 dark:via-navy-900 dark:to-navy-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy-900 dark:text-white flex items-center gap-2">
                  <span>ಭಾರತೀಯ ಭಾಷೆಗಳ ಆಯ್ಕೆ</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-semibold">
                    22 Scheduled Indic Languages
                  </span>
                </h2>
                <p className="text-xs text-navy-600 dark:text-navy-300">
                  Select your preferred language for voice recognition, spoken directives, and field registers.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-navy-400 hover:text-navy-700 dark:hover:text-white hover:bg-navy-100 dark:hover:bg-navy-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by language, script, or state (e.g., Kannada, हिन्दी, اردو, Tamil, Assam)..."
              className="w-full text-sm pl-10 pr-4 py-2.5 bg-white dark:bg-navy-950 border border-navy-200 dark:border-navy-700 rounded-2xl text-navy-900 dark:text-white placeholder-navy-400 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              autoFocus
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-navy-400 hover:text-navy-700 dark:hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'All 22 Languages' },
              { id: 'south', label: 'Southern (ಕನ್ನಡ, తెలుగు, தமிழ், മലയാളം)' },
              { id: 'north', label: 'Northern (हिन्दी, ਪੰਜਾਬੀ, ڈوگری)' },
              { id: 'east', label: 'Eastern (বাংলা, অসমীয়া, ଓଡ଼ିଆ)' },
              { id: 'west', label: 'Western (मराठी, ગુજરાતી, कोंकणी)' },
              { id: 'rtl', label: 'RTL Scripts (اردو, کٲشُر, سنڌي)' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1 rounded-xl whitespace-nowrap font-medium transition-all ${
                  activeFilter === f.id
                    ? 'bg-primary text-white shadow-xs font-bold'
                    : 'bg-white/80 dark:bg-navy-800/80 text-navy-600 dark:text-navy-300 hover:bg-white dark:hover:bg-navy-700 border border-navy-200/50 dark:border-navy-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Currently Active Banner */}
        <div className="px-6 py-2.5 bg-mint-50 dark:bg-navy-950 border-b border-mint-100 dark:border-navy-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-mint-800 dark:text-mint-300">Active Language:</span>
            <span className="px-2 py-0.5 rounded-lg bg-mint-200 dark:bg-mint-900/50 text-mint-900 dark:text-mint-200 font-bold">
              {activeLangInfo.name_native} ({activeLangInfo.name_en})
            </span>
            <span className="text-navy-500 font-mono text-[11px]">[{activeLangInfo.bcp47}]</span>
          </div>
          <div className="flex items-center space-x-1 text-navy-500 dark:text-navy-400">
            <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
            <span>AI4Bharat Powered</span>
          </div>
        </div>

        {/* Language Grid */}
        <div className="p-6 overflow-y-auto max-h-[52vh] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredLanguages.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            const isRtl = lang.dir === 'rtl';

            return (
              <div
                key={lang.code}
                onClick={() => {
                  onSelectLanguage(lang.code);
                  onClose();
                }}
                className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-primary/5 dark:bg-primary/10 border-primary ring-2 ring-primary/30 shadow-md'
                    : 'bg-white dark:bg-navy-800/80 border-navy-200/70 dark:border-navy-700/80 hover:border-primary/50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className={`text-lg font-bold text-navy-900 dark:text-white group-hover:text-primary transition-colors ${isRtl ? 'font-arabic' : ''}`}
                        dir={isRtl ? 'rtl' : 'ltr'}
                      >
                        {lang.name_native}
                      </span>
                      {isRtl && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-mono font-bold">
                          RTL
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1.5 text-xs text-navy-500 dark:text-navy-400 mt-0.5">
                      <span className="font-medium text-navy-700 dark:text-navy-300">{lang.name_en}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px]">{lang.bcp47}</span>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-navy-100 dark:bg-navy-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-navy-600 dark:text-navy-300">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Sample utterance & Region */}
                <div className="mt-2.5 pt-2 border-t border-navy-100 dark:border-navy-700/50">
                  <p 
                    className="text-[11px] text-navy-600 dark:text-navy-300 line-clamp-1 italic"
                    dir={isRtl ? 'rtl' : 'ltr'}
                  >
                    "{lang.sample}"
                  </p>
                  <p className="text-[10px] text-navy-400 dark:text-navy-500 mt-0.5">
                    {lang.region}
                  </p>
                </div>
              </div>
            );
          })}

          {filteredLanguages.length === 0 && (
            <div className="col-span-full py-12 text-center text-navy-500">
              <Globe className="w-8 h-8 text-navy-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No languages match "{searchQuery}"</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                className="mt-2 text-xs text-primary font-bold hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-navy-100 dark:border-navy-800 bg-softblue/30 dark:bg-navy-950 flex items-center justify-between text-xs text-navy-600 dark:text-navy-400">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-saffron" />
            <span>AI4Bharat Indic-Transcribe & Indic-Speak Enabled for all 22 official languages.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 dark:bg-white dark:hover:bg-navy-100 text-white dark:text-navy-900 font-bold transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
