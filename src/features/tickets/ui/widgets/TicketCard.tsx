import { AppCard, PriorityBadge, AvatarStack } from '../../../../core/widgets';
import type { AvatarPerson } from '../../../../core/widgets';
import type { Ticket } from '../../../../core/data/models/response/tickets/ticket_response';

export interface TicketCardProps {
  ticket: Ticket;
  onOpen?: (id: string) => void;
  /** Resolves an assignee uid to a display name for the avatar stack. */
  resolveName?: (uid: string) => string;
}

/** Compact ticket card for the board and backlog (title, score, priority, assignees). */
export function TicketCard({ ticket, onOpen, resolveName }: TicketCardProps) {
  const people: AvatarPerson[] = ticket.assigneeIds.map((uid) => ({
    id: uid,
    name: resolveName?.(uid) ?? uid,
  }));

  return (
    <AppCard
      className="cursor-pointer p-3 transition-shadow hover:shadow-elevated"
      onClick={() => onOpen?.(ticket.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-semibold text-content">{ticket.title}</p>
        {ticket.ticketScore > 0 && (
          <span className="shrink-0 rounded-pill bg-surface-muted px-2 py-0.5 text-xs font-semibold text-content-muted">
            {ticket.ticketScore}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <PriorityBadge priority={ticket.priority} />
        {people.length > 0 && <AvatarStack people={people} size="sm" max={3} />}
      </div>
    </AppCard>
  );
}
