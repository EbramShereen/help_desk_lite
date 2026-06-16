import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface KanbanColumnProps {
  name: string;
  /** Dynamic status color (admin-defined hex). */
  color: string;
  count: number;
  children: ReactNode;
  headerAction?: ReactNode;
  className?: string;
}

/** Themed Kanban column: colored header with count + a scrollable body of cards. */
export function KanbanColumn({
  name,
  color,
  count,
  children,
  headerAction,
  className,
}: KanbanColumnProps) {
  return (
    <div className={cn('flex min-w-72 flex-col rounded-card bg-surface-muted', className)}>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-pill"
            style={{ backgroundColor: color }}
            aria-hidden
          />
          <span className="text-sm font-semibold text-content">{name}</span>
          <span className="rounded-pill bg-surface px-2 py-0.5 text-xs font-medium text-content-muted">
            {count}
          </span>
        </div>
        {headerAction}
      </div>
      <div className="flex flex-1 flex-col gap-2 px-2 pb-2">{children}</div>
    </div>
  );
}
