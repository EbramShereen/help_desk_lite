import type { ReactNode } from 'react';
import { cn } from '../../../../lib/cn';
import { useInView } from '../../logic/useInView';

/**
 * Scroll-reveal wrapper. Children fade + rise into view once. `delay` (ms)
 * staggers siblings. Honours `prefers-reduced-motion` via the CSS utility.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li';
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      className={cn('hd-reveal', inView && 'is-visible', className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
