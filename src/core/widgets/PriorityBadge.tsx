import type { AppBadgeProps } from './AppBadge';
import { AppBadge } from './AppBadge';
import type { TicketPriority } from '../enums/tickets/ticket_priority';
import { priorityLabels } from '../data/models/response/tickets/ticket_response';

type Tone = AppBadgeProps['tone'];

const priorityTone: Record<TicketPriority, Tone> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TicketPriority;
  className?: string;
}) {
  return (
    <AppBadge tone={priorityTone[priority]} className={className}>
      {priorityLabels[priority]}
    </AppBadge>
  );
}
