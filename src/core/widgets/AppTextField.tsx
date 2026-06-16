import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface AppTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

/**
 * Themed text input designed to plug into react-hook-form via `register`
 * (forwards ref + native props). Stays presentation-only.
 */
export const AppTextField = forwardRef<HTMLInputElement, AppTextFieldProps>(function AppTextField(
  { label, error, hint, leading, trailing, className, id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-label text-content-muted"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-center gap-2 rounded-control border bg-surface px-3.5',
          'transition-[border-color,box-shadow] duration-200',
          error
            ? 'border-danger focus-within:shadow-focus'
            : 'border-surface-border focus-within:border-primary focus-within:shadow-focus',
        )}
      >
        {leading}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-11 w-full bg-transparent text-sm text-content outline-none placeholder:text-content-subtle',
            className,
          )}
          aria-invalid={!!error}
          {...rest}
        />
        {trailing}
      </div>
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-content-muted">{hint}</p>
      ) : null}
    </div>
  );
});
