import { useMemo } from 'react';
import type { Ticket } from '../../models/Ticket';

export function OverdueBanner({ tickets, now }: { tickets: Ticket[]; now: number }) {
  const overdueCount = useMemo(
    () => tickets.filter((t) => t.status !== 'done' && t.deadline > 0 && t.deadline < now).length,
    [tickets, now],
  );

  if (overdueCount === 0) return null;

  return (
    <div className="rounded-card border border-danger bg-danger-subtle px-4 py-3">
      <p className="text-sm font-semibold text-danger">
        {overdueCount} overdue ticket{overdueCount > 1 ? 's' : ''} assigned to you
      </p>
    </div>
  );
}
