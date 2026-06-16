import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';

const STORAGE_KEY = 'helpdesk.preferences';

/** Read the persisted language from the preferences slice's localStorage blob. */
function initialLanguage(): 'en' | 'ar' {
  if (typeof localStorage === 'undefined') return 'en';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const lang = raw ? (JSON.parse(raw) as { language?: string }).language : undefined;
    return lang === 'ar' ? 'ar' : 'en';
  } catch {
    return 'en';
  }
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: initialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
