import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type Tone = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export interface AppBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-surface-muted text-content-muted',
  primary: 'bg-primary-subtle text-primary',
  accent: 'bg-accent-subtle text-accent-foreground',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
  info: 'bg-info-subtle text-info',
};

/** Small status pill — ideal for ticket states/priorities later. */
export function AppBadge({ tone = 'neutral', className, ...rest }: AppBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold tracking-tight',
        toneClasses[tone],
        className,
      )}
      {...rest}
    />
  );
}
