import { useMemo } from 'react';
import { AppCard } from '../../../../core/widgets/AppCard';
import { TicketRow } from '../../../tickets/ui/widgets/TicketRow';
import type { Ticket, TicketStatus } from '../../../tickets/models/Ticket';
import { statusLabels } from '../../../tickets/models/Ticket';

const COLUMNS: TicketStatus[] = ['todo', 'inProgress', 'done'];

interface SprintBoardProps {
  tickets: Ticket[];
  now: number;
}

export function SprintBoard({ tickets, now }: SprintBoardProps) {
  const grouped = useMemo(() => {
    const map: Record<TicketStatus, Ticket[]> = { todo: [], inProgress: [], done: [] };
    for (const t of tickets) {
      if (map[t.status]) map[t.status].push(t);
    }
    return map;
  }, [tickets]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {COLUMNS.map((col) => (
        <AppCard key={col} className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-label text-content-muted">
            {statusLabels[col]} ({grouped[col].length})
          </h4>
          {grouped[col].length === 0 && (
            <p className="py-4 text-center text-xs text-content-subtle">No tickets</p>
          )}
          <div className="divide-y divide-surface-border">
            {grouped[col].map((t) => (
              <TicketRow key={t.id} ticket={t} now={now} />
            ))}
          </div>
        </AppCard>
      ))}
    </div>
  );
}
