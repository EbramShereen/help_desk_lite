import { cn } from '../../lib/cn';
import type { TicketStatus } from '../../features/tickets/models/Ticket';
import { statusLabels } from '../../features/tickets/models/Ticket';

const statusClasses: Record<TicketStatus, string> = {
  todo: 'bg-status-todo-subtle text-status-todo',
  inProgress: 'bg-status-inProgress-subtle text-status-inProgress',
  done: 'bg-status-done-subtle text-status-done',
};

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold tracking-tight',
        statusClasses[status],
        className,
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
