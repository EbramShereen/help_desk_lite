/**
 * Colors are driven by CSS variables (RGB channels) defined in `src/index.css`
 * for `:root` (light) and `.dark` (dark mode). This keeps `<alpha-value>` opacity
 * utilities working (e.g. `bg-primary/10`) while supporting class-based dark mode.
 */
const v = (name) => `rgb(var(${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Deep navy — brand / primary actions
        primary: {
          DEFAULT: v('--c-primary'),
          hover: v('--c-primary-hover'),
          subtle: v('--c-primary-subtle'),
          foreground: v('--c-primary-foreground'),
        },
        // Champagne gold — premium accent (links, highlights, admin badge)
        accent: {
          DEFAULT: v('--c-accent'),
          hover: v('--c-accent-hover'),
          subtle: v('--c-accent-subtle'),
          foreground: v('--c-accent-foreground'),
        },
        surface: {
          DEFAULT: v('--c-surface'),
          muted: v('--c-surface-muted'),
          border: v('--c-surface-border'),
        },
        // App background ("mist")
        canvas: v('--c-canvas'),
        content: {
          DEFAULT: v('--c-content'),
          muted: v('--c-content-muted'),
          subtle: v('--c-content-subtle'),
        },
        // Semantic colors — deliberately muted for a restrained, luxury feel
        danger: {
          DEFAULT: v('--c-danger'),
          subtle: v('--c-danger-subtle'),
          foreground: v('--c-danger-foreground'),
        },
        success: {
          DEFAULT: v('--c-success'),
          subtle: v('--c-success-subtle'),
          foreground: v('--c-success-foreground'),
        },
        warning: {
          DEFAULT: v('--c-warning'),
          subtle: v('--c-warning-subtle'),
          foreground: v('--c-warning-foreground'),
        },
        info: {
          DEFAULT: v('--c-info'),
          subtle: v('--c-info-subtle'),
          foreground: v('--c-info-foreground'),
        },
        // Ticket status colors
        'status-todo': { DEFAULT: v('--c-status-todo'), subtle: v('--c-status-todo-subtle') },
        'status-inProgress': {
          DEFAULT: v('--c-status-inProgress'),
          subtle: v('--c-status-inProgress-subtle'),
        },
        'status-done': { DEFAULT: v('--c-status-done'), subtle: v('--c-status-done-subtle') },
      },
      fontFamily: { sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'] },
      letterSpacing: { tightest: '-0.03em', tight: '-0.02em', label: '0.10em' },
      borderRadius: { control: '0.625rem', card: '1rem', pill: '9999px' },
      boxShadow: {
        card: '0 1px 2px rgb(11 18 32 / 0.04), 0 6px 20px -6px rgb(11 18 32 / 0.08)',
        elevated: '0 16px 48px -12px rgb(11 18 32 / 0.18)',
        focus: '0 0 0 3px rgb(20 33 61 / 0.12)',
      },
    },
  },
  plugins: [],
};
