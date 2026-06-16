import { cn } from '../../lib/cn';
import type { TicketStatus } from '../../features/tickets/models/Ticket';

const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;

export function DeadlineBadge({
  deadline,
  status,
  now,
  className,
}: {
  deadline: number;
  status: TicketStatus;
  now?: number;
  className?: string;
}) {
  if (status === 'done' || !deadline) return null;

  const currentTime = now ?? 0;
  const isOverdue = currentTime > deadline;
  const isApproaching = !isOverdue && deadline - currentTime <= FORTY_EIGHT_HOURS;

  if (!isOverdue && !isApproaching) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold tracking-tight',
        isOverdue ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning',
        className,
      )}
    >
      {isOverdue ? 'Overdue' : 'Due soon'}
    </span>
  );
}
