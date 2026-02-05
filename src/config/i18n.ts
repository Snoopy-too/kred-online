import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Import KRED-specific translations (game UI)
import enCommon from '../locales/en/common.json';
import esCommon from '../locales/es/common.json';
import jaCommon from '../locales/ja/common.json';

const resources = {
  en: {
    common: enCommon,
  },
  es: {
    common: esCommon,
  },
  ja: {
    common: jaCommon,
  },
};

i18n
  .use(HttpBackend) // Load manual translations from main site
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'manual'],
    
    backend: {
      // Load manual translations from main site /locales
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'kred-language',
    },
  });

export default i18n;
