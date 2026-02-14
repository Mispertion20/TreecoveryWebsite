import { useState, useEffect, useRef } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en' as const, name: 'English', nativeName: 'English' },
  { code: 'ru' as const, name: 'Russian', nativeName: 'Русский' },
  { code: 'kz' as const, name: 'Kazakh', nativeName: 'Қазақша' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get current language from i18n
  const getCurrentLanguage = (): 'en' | 'ru' | 'kz' => {
    const lang = i18n.language?.substring(0, 2).toLowerCase() || 'en';
    if (lang === 'ru' || lang === 'kz') {
      return lang;
    }
    return 'en';
  };
  
  const language = getCurrentLanguage();
  
  const setLanguage = (lang: 'en' | 'ru' | 'kz') => {
    i18n.changeLanguage(lang).then(() => {
      localStorage.setItem('i18nextLng', lang);
      document.documentElement.lang = lang;
      setIsOpen(false);
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-neutral-dark-text hover:text-primary-emerald dark:hover:text-primary-emerald-dark transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-neutral-dark-surface-hover"
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
        title={`Current language: ${languages.find((l) => l.code === language)?.nativeName || language}`}
      >
        <Globe className="w-5 h-5 flex-shrink-0" />
        <span className="hidden xl:inline">{languages.find((l) => l.code === language)?.nativeName || language.toUpperCase()}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-dark-surface rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`w-full text-left px-4 py-2 text-sm ${
                  language === lang.code
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium'
                    : 'text-gray-700 dark:text-neutral-dark-text hover:bg-gray-50 dark:hover:bg-neutral-dark-surface-hover'
                }`}
                role="menuitem"
                aria-selected={language === lang.code}
              >
                <div className="flex items-center justify-between">
                  <span>{lang.nativeName}</span>
                  {language === lang.code && (
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

