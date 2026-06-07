/**
 * LanguageSwitcher Component
 * Allows users to toggle between English and Russian
 */

import { useTranslation } from 'react-i18next';
import { setData } from '../../utils/storage';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setData('language', lang);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 rounded-lg font-medium transition-colors ${
          i18n.language === 'en'
            ? 'bg-primary-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('ru')}
        className={`px-3 py-1 rounded-lg font-medium transition-colors ${
          i18n.language === 'ru'
            ? 'bg-primary-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        РУ
      </button>
    </div>
  );
}
