import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = {
  code: string;
  name: string;
  flag: string;
};

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, fallback?: string) => string;
  translateCategory: (categoryName: string) => string;
  translateCondition: (condition: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('durcheap_language');
    if (savedLanguage) {
      const language = SUPPORTED_LANGUAGES.find(lang => lang.code === savedLanguage);
      if (language) {
        setCurrentLanguage(language);
      }
    } else {
      // Auto-detect browser language
      const browserLanguage = navigator.language.split('-')[0];
      const language = SUPPORTED_LANGUAGES.find(lang => lang.code === browserLanguage);
      if (language) {
        setCurrentLanguage(language);
      }
    }
  }, []);

  useEffect(() => {
    // Load translations for current language
    loadTranslations(currentLanguage.code);
  }, [currentLanguage]);

  const loadTranslations = async (languageCode: string) => {
    try {
      const response = await fetch(`/translations/${languageCode}.json`);
      if (response.ok) {
        const translationData = await response.json();
        setTranslations(translationData);
      }
    } catch (error) {
      console.warn(`Failed to load translations for ${languageCode}:`, error);
      // Fall back to English translations
      if (languageCode !== 'en') {
        loadTranslations('en');
      }
    }
  };

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('durcheap_language', language.code);
    // Update HTML lang attribute
    document.documentElement.lang = language.code;
    // Update text direction for RTL languages
    document.documentElement.dir = ['ar', 'he', 'fa'].includes(language.code) ? 'rtl' : 'ltr';
  };

  const t = (key: string, fallback?: string) => {
    return translations[key] || fallback || key;
  };

  // Helper function to translate category names
  const translateCategory = (categoryName: string) => {
    const categoryKey = categoryName.toLowerCase().replace(/\s+/g, '_').replace(/[&]/g, '');
    return t(`category_${categoryKey}`, categoryName);
  };

  // Helper function to translate product conditions
  const translateCondition = (condition: string) => {
    const conditionKey = condition.toLowerCase();
    return t(`condition_${conditionKey}`, condition);
  };

  const value = {
    currentLanguage,
    setLanguage,
    t,
    translateCategory,
    translateCondition,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}