import type { ReactNode } from 'react';
import { cn } from '../../../../lib/cn';

/**
 * Split-screen auth shell. On large screens: a navy brand panel beside a white
 * form panel. On mobile: a single centered column on the app canvas with a
 * compact gold-underlined wordmark above the form.
 */
export function AuthLayout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel — desktop only */}
      <aside className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              'radial-gradient(120% 80% at 100% 0%, rgba(201,168,106,0.18) 0%, rgba(20,33,61,0) 55%), linear-gradient(160deg, #14213D 0%, #0E1730 100%)',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="h-8 w-0.5 rounded-pill bg-accent" />
            <span className="text-lg font-bold tracking-tight text-primary-foreground">
              HelpDesk Lite
            </span>
          </div>
        </div>
        <div className="relative max-w-sm">
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-primary-foreground">
            Support, refined.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">
            A calm, focused workspace for your team to resolve what matters — without the noise.
          </p>
        </div>
        <div className="relative text-xs uppercase tracking-label text-primary-foreground/50">
          Internal Support · v1
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen items-center justify-center px-5 py-10 lg:min-h-0 lg:px-12">
        <div className={cn('w-full max-w-md', className)}>
          {/* Mobile wordmark */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <span className="text-xl font-bold tracking-tight text-content">HelpDesk Lite</span>
            <span className="mt-2 h-0.5 w-10 rounded-pill bg-accent" />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
