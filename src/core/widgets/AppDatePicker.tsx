import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface AppDatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const AppDatePicker = forwardRef<HTMLInputElement, AppDatePickerProps>(
  function AppDatePicker({ label, error, className, id, ...rest }, ref) {
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
        <input
          ref={ref}
          id={inputId}
          type="date"
          className={cn(
            'h-11 w-full rounded-control border bg-surface px-3.5 text-sm text-content outline-none',
            'transition-[border-color,box-shadow] duration-200',
            error
              ? 'border-danger focus:shadow-focus'
              : 'border-surface-border focus:border-primary focus:shadow-focus',
            className,
          )}
          aria-invalid={!!error}
          {...rest}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  },
);
