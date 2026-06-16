import { useEffect } from 'react';
import i18n from '../../lib/i18n';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  setTheme,
  toggleTheme,
  setLanguage,
  setAccentColor,
  resetPreferences,
  type Language,
  type ThemeMode,
} from './preferencesSlice';

/**
 * Reads preference UI-state and applies side effects to the document: the `dark`
 * class for Tailwind dark mode, the `dir`/`lang` attributes for RTL/i18n, and an
 * optional accent-color CSS variable override. Exposes typed setters.
 */
export function usePreferences() {
  const dispatch = useAppDispatch();
  const prefs = useAppSelector((s) => s.preferences);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', prefs.theme === 'dark');
  }, [prefs.theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', prefs.language);
    root.setAttribute('dir', prefs.language === 'ar' ? 'rtl' : 'ltr');
    if (i18n.language !== prefs.language) void i18n.changeLanguage(prefs.language);
  }, [prefs.language]);

  useEffect(() => {
    const root = document.documentElement;
    if (prefs.accentColor) root.style.setProperty('--accent-override', prefs.accentColor);
    else root.style.removeProperty('--accent-override');
  }, [prefs.accentColor]);

  return {
    theme: prefs.theme,
    language: prefs.language,
    accentColor: prefs.accentColor,
    setTheme: (mode: ThemeMode) => dispatch(setTheme(mode)),
    toggleTheme: () => dispatch(toggleTheme()),
    setLanguage: (lang: Language) => dispatch(setLanguage(lang)),
    setAccentColor: (color: string | null) => dispatch(setAccentColor(color)),
    reset: () => dispatch(resetPreferences()),
  };
}
