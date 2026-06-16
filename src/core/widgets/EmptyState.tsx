import { type ReactNode } from 'react';
import Lottie from 'lottie-react';
import { cn } from '../../lib/cn';

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Optional Lottie animation JSON. Falls back to a tasteful SVG when omitted. */
  animationData?: object;
  action?: ReactNode;
  className?: string;
}

/** Friendly empty state with an optional Lottie animation and a primary action. */
export function EmptyState({
  title,
  description,
  animationData,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}
    >
      <div className="h-32 w-32">
        {animationData ? (
          <Lottie animationData={animationData} loop className="h-full w-full" />
        ) : (
          <svg
            viewBox="0 0 64 64"
            fill="none"
            className="h-full w-full text-content-subtle"
            aria-hidden
          >
            <rect
              x="10"
              y="16"
              width="44"
              height="32"
              rx="4"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <path
              d="M10 26h44M22 16v-4M42 16v-4"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      <p className="text-base font-semibold text-content">{title}</p>
      {description && <p className="max-w-sm text-sm text-content-muted">{description}</p>}
      {action}
    </div>
  );
}
