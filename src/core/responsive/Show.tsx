import type { ReactNode } from 'react';
import { useIsAbove } from './useBreakpoint';
import type { Breakpoint } from './breakpoints';

/**
 * Conditionally render children based on viewport width.
 * Use sparingly — Tailwind's `hidden md:block` is preferred for layout.
 */
export function Show({
  above,
  below,
  children,
}: {
  above?: Breakpoint;
  below?: Breakpoint;
  children: ReactNode;
}) {
  const isAboveTarget = useIsAbove(above ?? (below as Breakpoint));
  if (above) return isAboveTarget ? <>{children}</> : null;
  if (below) return isAboveTarget ? null : <>{children}</>;
  return <>{children}</>;
}
