import { cn } from '../../lib/cn';
import type { TicketStatus } from '../enums/tickets/ticket_status';
import { statusLabels } from '../data/models/response/tickets/ticket_response';

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
