import { useEffect, useState } from 'react';
import { breakpoints, breakpointOrder, type Breakpoint } from './breakpoints';

function resolve(width: number): Breakpoint | 'base' {
  let current: Breakpoint | 'base' = 'base';
  for (const bp of breakpointOrder) {
    if (width >= breakpoints[bp]) current = bp;
  }
  return current;
}

/**
 * JS-side responsive hook for the rare cases Tailwind classes can't express
 * (e.g. rendering different component trees). Prefer Tailwind classes first.
 */
export function useBreakpoint(): Breakpoint | 'base' {
  const [bp, setBp] = useState<Breakpoint | 'base'>(() =>
    typeof window === 'undefined' ? 'base' : resolve(window.innerWidth),
  );

  useEffect(() => {
    const onResize = () => setBp(resolve(window.innerWidth));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return bp;
}

/** True when the viewport is at or above the given breakpoint. */
export function useIsAbove(bp: Breakpoint): boolean {
  const current = useBreakpoint();
  if (current === 'base') return false;
  return breakpointOrder.indexOf(current) >= breakpointOrder.indexOf(bp);
}
