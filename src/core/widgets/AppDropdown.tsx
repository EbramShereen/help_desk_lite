import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface DropdownOption<T extends string = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface AppDropdownProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'children'
> {
  label?: string;
  error?: string;
  placeholder?: string;
  options: DropdownOption[];
}

/** Themed native select. Reusable across every feature; no business logic. */
export const AppDropdown = forwardRef<HTMLSelectElement, AppDropdownProps>(function AppDropdown(
  { label, error, placeholder, options, className, id, ...rest },
  ref,
) {
  const selectId = id ?? rest.name;
  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold uppercase tracking-label text-content-muted"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          'h-11 w-full rounded-control border bg-surface px-3.5 text-sm text-content outline-none',
          'transition-[border-color,box-shadow] duration-200',
          'bg-surface text-content',
          error
            ? 'border-danger focus:shadow-focus'
            : 'border-surface-border focus:border-primary focus:shadow-focus',
          className,
        )}
        aria-invalid={!!error}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled className="bg-surface text-content">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled}
            className="bg-surface text-content"
          >
            {opt.label}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});
