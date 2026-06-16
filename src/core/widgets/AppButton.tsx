import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'accent' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  accent: 'bg-accent text-accent-foreground hover:bg-accent-hover',
  secondary: 'bg-surface text-content border border-surface-border hover:bg-surface-muted',
  danger: 'bg-danger text-danger-foreground hover:opacity-90',
  ghost: 'bg-transparent text-content hover:bg-surface-muted',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
};

/** Themed button. Pure presentation — pass behaviour via props (onClick, etc.). */
export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(function AppButton(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    className,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-control font-semibold tracking-tight',
        'transition-[background-color,box-shadow,color,opacity] duration-200',
        'focus-visible:shadow-focus focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
});
