import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'ru' | 'kz';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n, t, ready } = useTranslation();
  const getInitialLanguage = (): Language => {
    try {
      if (i18n && i18n.language) {
        const lang = i18n.language.substring(0, 2).toLowerCase();
        if (lang === 'en' || lang === 'ru' || lang === 'kz') {
          return lang as Language;
        }
      }
    } catch (error) {
      console.error('Error getting initial language:', error);
    }
    return 'en';
  };
  const [language, setLanguageState] = useState<Language>(getInitialLanguage());

  useEffect(() => {
    // Set initial HTML lang attribute
    const initialLang = getInitialLanguage();
    document.documentElement.lang = initialLang;

    // Sync with i18n language changes
    const handleLanguageChanged = (lng: string) => {
      const lang = lng.substring(0, 2).toLowerCase() as Language;
      setLanguageState(lang);
      document.documentElement.lang = lang;
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
    setLanguageState(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

