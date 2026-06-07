/**
 * ThemeToggle — switch between light and dark mode
 */

import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useContext';

interface ThemeToggleProps {
  variant?: 'default' | 'compact' | 'landing';
}

export default function ThemeToggle({ variant = 'default' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors transition-transform duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm bg-white dark:bg-gray-800"
        title={isDark ? t('theme.light') : t('theme.dark')}
        aria-label={isDark ? t('theme.light') : t('theme.dark')}
      >
        <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
      </button>
    );
  }

  if (variant === 'landing') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 transition-colors transform hover:-translate-y-0.5 text-sm flex items-center gap-2 shadow-md focus:outline-none focus:ring-2 focus:ring-primary-400"
        title={isDark ? t('theme.light') : t('theme.dark')}
      >
        <span>{isDark ? '☀️' : '🌙'}</span>
        <span>{isDark ? t('theme.light') : t('theme.dark')}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        // Add a brief overlay fade to smooth the crossfade
        const html = document.documentElement;
        html.classList.add('theme-fade-active');
        // Trigger the theme toggle
        toggleTheme();
        // Remove the overlay after animation duration
        setTimeout(() => html.classList.remove('theme-fade-active'), 420);
      }}
      className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors transition-transform duration-200 ease-in-out transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
      title={isDark ? t('theme.light') : t('theme.dark')}
    >
      <span>{isDark ? '☀️' : '🌙'}</span>
      <span className="inline">{isDark ? t('theme.light') : t('theme.dark')}</span>
    </button>
  );
}
