import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

/** Themed surface container used across lists, panels and forms. */
export function AppCard({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-card border border-surface-border bg-surface p-6 shadow-card',
        className,
      )}
      {...rest}
    />
  );
}
