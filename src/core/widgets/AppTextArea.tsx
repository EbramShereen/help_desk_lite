import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface AppTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const AppTextArea = forwardRef<HTMLTextAreaElement, AppTextAreaProps>(function AppTextArea(
  { label, error, className, id, ...rest },
  ref,
) {
  const textareaId = id ?? rest.name;
  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-semibold uppercase tracking-label text-content-muted"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={cn(
          'min-h-[100px] w-full rounded-control border bg-surface px-3.5 py-3 text-sm text-content outline-none',
          'resize-y transition-[border-color,box-shadow] duration-200',
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
});
