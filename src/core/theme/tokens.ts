/**
 * Design tokens — the single source of truth for the app's visual language.
 * Tailwind classes cover most styling; these typed tokens are for the rare
 * cases where a value is needed in TypeScript (charts, inline styles, JS logic).
 * Keep in sync with `tailwind.config.js` and `design-system/helpdesk-lite/tokens.md`.
 *
 * Aesthetic: minimal + luxury — deep navy (#14213D) brand, champagne-gold
 * (#C9A86A) accent, Plus Jakarta Sans, cool off-white surfaces, soft shadows.
 */
export const colors = {
  primary: '#14213D',
  primaryHover: '#0E1730',
  primarySubtle: '#EEF1F6',
  accent: '#C9A86A',
  accentHover: '#B8975A',
  accentSubtle: '#F6F1E7',
  accentForeground: '#1A1408',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F2F5',
  surfaceBorder: '#E6E8EC',
  canvas: '#F7F8FA',
  content: '#0B1220',
  contentMuted: '#5B6573',
  contentSubtle: '#95A0B0',
  danger: '#B4232A',
  success: '#2F6E4F',
  warning: '#9A7B3F',
  info: '#2C5A7A',
} as const;

export const typography = {
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  size: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  tracking: { tightest: '-0.03em', tight: '-0.02em', label: '0.10em' },
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
} as const;

export const radius = { control: '0.625rem', card: '1rem', pill: '9999px' } as const;

export const shadow = {
  card: '0 1px 2px rgb(11 18 32 / 0.04), 0 6px 20px -6px rgb(11 18 32 / 0.08)',
  elevated: '0 16px 48px -12px rgb(11 18 32 / 0.18)',
} as const;

export interface AppTheme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  radius: typeof radius;
  shadow: typeof shadow;
}

export const statusColors = {
  todo: '#6B7280',
  inProgress: '#2563EB',
  done: '#059669',
} as const;

export const priorityColors = {
  low: colors.contentMuted,
  medium: colors.info,
  high: colors.warning,
  urgent: colors.danger,
} as const;

export const appTheme: AppTheme = { colors, typography, spacing, radius, shadow };
