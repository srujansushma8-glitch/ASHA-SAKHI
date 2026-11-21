import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INDIC_LANGUAGES, getLanguageByCode, isRtlLanguage } from '../services/languages';
import { TRANSLATIONS, t as translateKey, formatLocalizedDate } from '../services/i18n';
import { api } from '../services/api';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('asha_language');
      if (saved && INDIC_LANGUAGES.some(l => l.code === saved)) {
        return saved;
      }
    }
    return 'en'; // Clean English default for universal usability
  });

  const langInfo = getLanguageByCode(language);
  const isRtl = isRtlLanguage(language);
  const dir = isRtl ? 'rtl' : 'ltr';

  // Synchronize document attributes whenever language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = dir;
      document.body.dir = dir;
    }
  }, [language, dir]);

  const setLanguage = useCallback((newLang) => {
    if (!newLang) return;
    const clean = newLang.toLowerCase().trim();
    setLanguageState(clean);

    if (typeof window !== 'undefined') {
      localStorage.setItem('asha_language', clean);
      window.dispatchEvent(new CustomEvent('asha_language_changed', { detail: { language: clean } }));
    }

    // Inform backend API service
    if (api && api.setLanguage) {
      api.setLanguage(clean);
    }
  }, []);

  // Listen for external language change events
  useEffect(() => {
    const handleLangEvent = (e) => {
      const l = e?.detail?.language;
      if (l && l !== language) {
        setLanguageState(l);
      }
    };
    window.addEventListener('asha_language_changed', handleLangEvent);
    return () => window.removeEventListener('asha_language_changed', handleLangEvent);
  }, [language]);

  /**
   * Universal translation helper hooked directly to current active language
   */
  const t = useCallback((key, params = {}) => {
    return translateKey(key, language, params);
  }, [language]);

  /**
   * Locale-aware date formatting
   */
  const formatDate = useCallback((date, options = {}) => {
    return formatLocalizedDate(date, language, options);
  }, [language]);

  /**
   * Locale-aware number formatting
   */
  const formatNumber = useCallback((num) => {
    try {
      const bcp = langInfo?.bcp47 || 'en-IN';
      return new Intl.NumberFormat(bcp).format(num);
    } catch {
      return String(num);
    }
  }, [langInfo]);

  /**
   * Locale-aware currency formatting (INR)
   */
  const formatCurrency = useCallback((amount) => {
    try {
      const bcp = langInfo?.bcp47 || 'en-IN';
      return new Intl.NumberFormat(bcp, {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount);
    } catch {
      return `₹${amount}`;
    }
  }, [langInfo]);

  const value = {
    language,
    currentLanguage: language,
    setLanguage,
    onLanguageChange: setLanguage,
    langInfo,
    isRtl,
    dir,
    t,
    formatDate,
    formatNumber,
    formatCurrency,
    languages: INDIC_LANGUAGES
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback safe dummy context if rendered outside provider
    return {
      language: 'en',
      currentLanguage: 'en',
      setLanguage: () => {},
      onLanguageChange: () => {},
      langInfo: getLanguageByCode('en'),
      isRtl: false,
      dir: 'ltr',
      t: (key, params) => translateKey(key, 'en', params),
      formatDate: (d) => formatLocalizedDate(d, 'en'),
      formatNumber: (n) => String(n),
      formatCurrency: (a) => `₹${a}`,
      languages: INDIC_LANGUAGES
    };
  }
  return context;
}
