import { cn } from '../../lib/cn';

export interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  className?: string;
}

/** Light/dark switch. Presentation only — state comes from usePreferences. */
export function ThemeToggle({ theme, onToggle, className }: ThemeToggleProps) {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      onClick={onToggle}
      className={cn(
        'inline-flex h-7 w-12 items-center rounded-pill bg-surface-muted p-0.5 transition-colors',
        'focus-visible:shadow-focus focus-visible:outline-none',
        isDark && 'bg-primary',
        className,
      )}
    >
      <span
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-pill bg-surface text-xs shadow-card transition-transform',
          isDark && 'translate-x-5',
        )}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
