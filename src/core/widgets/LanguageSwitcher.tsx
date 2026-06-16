import { cn } from '../../lib/cn';

export interface LanguageSwitcherProps {
  language: 'en' | 'ar';
  onChange: (lang: 'en' | 'ar') => void;
  className?: string;
}

const options: { value: 'en' | 'ar'; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'ar', label: 'ع' },
];

/** Segmented en/ar language switcher. */
export function LanguageSwitcher({ language, onChange, className }: LanguageSwitcherProps) {
  return (
    <div className={cn('inline-flex rounded-control bg-surface-muted p-0.5', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={language === o.value}
          className={cn(
            'h-7 min-w-9 rounded-[0.5rem] px-2 text-xs font-semibold transition-colors',
            'focus-visible:shadow-focus focus-visible:outline-none',
            language === o.value
              ? 'bg-surface text-content shadow-card'
              : 'text-content-muted hover:text-content',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
