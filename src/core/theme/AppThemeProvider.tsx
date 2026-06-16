import { createContext, useContext, type ReactNode } from 'react';
import { appTheme, type AppTheme } from './tokens';

/**
 * Context-based theme, the React equivalent of Flutter's `Theme.of(context)`.
 * Wrap the app once in <AppThemeProvider/> and any component can read the
 * shared tokens via useTheme() without importing the theme module directly.
 */
const ThemeContext = createContext<AppTheme>(appTheme);

export function AppThemeProvider({
  theme = appTheme,
  children,
}: {
  theme?: AppTheme;
  children: ReactNode;
}) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): AppTheme {
  return useContext(ThemeContext);
}
