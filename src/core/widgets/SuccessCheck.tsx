import Lottie from 'lottie-react';
import { cn } from '../../lib/cn';

export interface SuccessCheckProps {
  label?: string;
  animationData?: object;
  className?: string;
}

/** Success confirmation with an optional Lottie checkmark (animated SVG fallback). */
export function SuccessCheck({ label, animationData, className }: SuccessCheckProps) {
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="h-20 w-20">
        {animationData ? (
          <Lottie animationData={animationData} loop={false} className="h-full w-full" />
        ) : (
          <svg viewBox="0 0 52 52" className="h-full w-full text-success" aria-hidden>
            <circle
              cx="26"
              cy="26"
              r="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              opacity="0.3"
            />
            <path
              d="M16 27l7 7 14-15"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 48,
                strokeDashoffset: 0,
                animation: 'hd-draw 0.5s ease-out',
              }}
            />
          </svg>
        )}
      </div>
      {label && <p className="text-sm font-semibold text-content">{label}</p>}
    </div>
  );
}
