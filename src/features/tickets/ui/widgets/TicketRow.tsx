import { useNavigate } from 'react-router-dom';
import { cn } from '../../../../lib/cn';
import { StatusBadge } from '../../../../core/widgets/StatusBadge';
import { PriorityBadge } from '../../../../core/widgets/PriorityBadge';
import { DeadlineBadge } from '../../../../core/widgets/DeadlineBadge';
import { AppBadge } from '../../../../core/widgets/AppBadge';
import type { Ticket } from '../../../../core/data/models/response/tickets/ticket_response';

export function TicketRow({ ticket, now }: { ticket: Ticket; now: number }) {
  const navigate = useNavigate();
  const deadlineDate = ticket.deadline ? new Date(ticket.deadline).toLocaleDateString() : '—';

  return (
    <div
      onClick={() => navigate(`/tickets/${ticket.id}`)}
      className={cn(
        'flex cursor-pointer items-center gap-4 border-b border-surface-border px-4 py-3',
        'transition-colors duration-150 hover:bg-surface-muted',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-content">{ticket.title}</p>
        {ticket.labels.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {ticket.labels.map((l) => (
              <AppBadge key={l} tone="neutral">
                {l}
              </AppBadge>
            ))}
          </div>
        )}
      </div>
      <span className="hidden text-xs text-content-muted md:block">
        {ticket.assigneeIds.length} assignee{ticket.assigneeIds.length !== 1 ? 's' : ''}
      </span>
      <StatusBadge status={ticket.status} />
      <PriorityBadge priority={ticket.priority} />
      <DeadlineBadge deadline={ticket.deadline} status={ticket.status} now={now} />
      <span className="hidden text-xs text-content-muted sm:block">{deadlineDate}</span>
    </div>
  );
}
