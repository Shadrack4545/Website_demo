/**
 * ThemeContext — light / dark mode with localStorage persistence
 */

import { createContext, useEffect, useState, type ReactNode } from 'react';
import { getData, setData, STORAGE_KEYS } from '../utils/storage';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = getData<Theme>(STORAGE_KEYS.THEME);
    return stored === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    applyTheme(theme);
    setData(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const setTheme = (next: Theme) => setThemeState(next);
  const toggleTheme = () => setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
