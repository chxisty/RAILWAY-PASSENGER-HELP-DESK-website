'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
  mounted: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check saved preference in localStorage
    const saved = localStorage.getItem('rail_theme') as Theme | null;
    const initialTheme: Theme = (saved === 'dark' || saved === 'light') ? saved : 'light';
    
    setThemeState(initialTheme);
    applyThemeToDOM(initialTheme);
    setMounted(true);
  }, []);

  const applyThemeToDOM = (t: Theme) => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark', 'theme-dark');
      root.classList.remove('theme-light');
      root.setAttribute('data-theme', 'dark');
      if (document.body) {
        document.body.classList.add('dark', 'theme-dark');
        document.body.classList.remove('theme-light');
      }
    } else {
      root.classList.remove('dark', 'theme-dark');
      root.classList.add('theme-light');
      root.setAttribute('data-theme', 'light');
      if (document.body) {
        document.body.classList.remove('dark', 'theme-dark');
        document.body.classList.add('theme-light');
      }
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('rail_theme', newTheme);
    applyThemeToDOM(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

