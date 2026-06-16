import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark';
export type Language = 'en' | 'ar';

export interface PreferencesState {
  theme: ThemeMode;
  language: Language;
  /** Optional accent color override (hex); null = theme default. */
  accentColor: string | null;
}

const STORAGE_KEY = 'helpdesk.preferences';

const defaults: PreferencesState = { theme: 'light', language: 'en', accentColor: null };

function load(): PreferencesState {
  if (typeof localStorage === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...(JSON.parse(raw) as Partial<PreferencesState>) };
  } catch {
    return defaults;
  }
}

function persist(state: PreferencesState) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota / unavailable storage — preferences are non-critical.
  }
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: load(),
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
      persist(state);
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      persist(state);
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
      persist(state);
    },
    setAccentColor(state, action: PayloadAction<string | null>) {
      state.accentColor = action.payload;
      persist(state);
    },
    resetPreferences(state) {
      state.theme = defaults.theme;
      state.language = defaults.language;
      state.accentColor = defaults.accentColor;
      persist(state);
    },
  },
});

export const { setTheme, toggleTheme, setLanguage, setAccentColor, resetPreferences } =
  preferencesSlice.actions;
export default preferencesSlice.reducer;
