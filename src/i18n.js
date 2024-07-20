import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import your translation JSON files
import enTranslation from './locals/en/translation.json';
import heTranslation from './locals/he/translation.json';

// Initialize i18next
i18n
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      he: {
        translation: heTranslation,
      },
    },
    lng: 'he', // Default language
    fallbackLng: 'he', // Fallback language
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18n;
