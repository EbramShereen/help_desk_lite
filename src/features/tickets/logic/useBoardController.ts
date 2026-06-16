import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { useTicketController } from './useTicketController';
import { useAdminConfigController } from '../../admin/logic/useAdminConfigController';
import type { TicketFilters } from '../repo/TicketRepo';
import type { Ticket } from '../models/Ticket';
import type { WorkflowStatus } from '../../admin/models/WorkflowStatus';

const TICKETS_KEY = 'tickets';

export interface BoardColumn {
  status: WorkflowStatus;
  tickets: Ticket[];
}

/**
 * Kanban board logic: dynamic status columns with their tickets, plus a
 * move-status mutation. The drag interaction is local UI state in the view; the
 * drop calls `moveStatus` to persist.
 */
export function useBoardController(filters?: TicketFilters) {
  const repo = useInjected(TOKENS.TicketRepo);
  const qc = useQueryClient();
  const { ticketsQuery } = useTicketController(filters);
  const { statuses } = useAdminConfigController();

  const tickets = useMemo(() => ticketsQuery.data ?? [], [ticketsQuery.data]);

  const columns = useMemo<BoardColumn[]>(
    () =>
      statuses.map((status) => ({
        status,
        tickets: tickets.filter((t) => t.statusId === status.id),
      })),
    [statuses, tickets],
  );

  const moveStatus = useMutation({
    mutationFn: ({ ticketId, statusId }: { ticketId: string; statusId: string }) =>
      repo.updateTicketStatusId(ticketId, statusId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });

  return {
    columns,
    statuses,
    tickets,
    isLoading: ticketsQuery.isLoading,
    error: ticketsQuery.error,
    moveStatus,
  };
}
