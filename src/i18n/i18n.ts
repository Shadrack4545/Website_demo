/**
 * i18n Configuration
 * Sets up internationalization for English and Russian
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './en.json';
import ruTranslations from './ru.json';
import { getData } from '../utils/storage';

// Language resources
const resources = {
  en: {
    translation: enTranslations,
    common: enTranslations,
    eventPredictor: enTranslations.eventPredictor || {},
    navigation: enTranslations.navigation || {},
  },
  ru: {
    translation: ruTranslations,
    common: ruTranslations,
    eventPredictor: ruTranslations.eventPredictor || {},
    navigation: ruTranslations.navigation || {},
  },
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'translation',
    fallbackNS: 'translation',
    lng: getData<string>('language', 'en') ?? 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
