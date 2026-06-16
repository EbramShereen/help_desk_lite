import { useMemo } from 'react';
import { useTicketController } from './useTicketController';
import { useAdminConfigController } from '../../admin/logic/useAdminConfigController';
import type { TicketFilters } from '../repo/TicketRepo';

export interface StatusBreakdown {
  statusId: string;
  name: string;
  color: string;
  count: number;
  score: number;
}

export interface SummaryStats {
  totalTickets: number;
  doneTickets: number;
  completionRate: number; // 0..1 by ticket count
  totalScore: number;
  doneScore: number;
  scoreCompletionRate: number; // 0..1 by story points
  byStatus: StatusBreakdown[];
}

/**
 * Analytics logic: completion rates (by ticket count and by story points) plus a
 * per-status breakdown, derived from the ticket list and dynamic statuses.
 */
export function useSummaryController(filters?: TicketFilters) {
  const { ticketsQuery } = useTicketController(filters);
  const { statuses } = useAdminConfigController();

  const stats = useMemo<SummaryStats>(() => {
    const tickets = ticketsQuery.data ?? [];
    const doneStatusIds = new Set(statuses.filter((s) => s.isDone).map((s) => s.id));

    const byStatus: StatusBreakdown[] = statuses.map((s) => {
      const group = tickets.filter((t) => t.statusId === s.id);
      return {
        statusId: s.id,
        name: s.name,
        color: s.color,
        count: group.length,
        score: group.reduce((sum, t) => sum + (t.ticketScore || 0), 0),
      };
    });

    const totalTickets = tickets.length;
    const doneTickets = tickets.filter((t) => doneStatusIds.has(t.statusId)).length;
    const totalScore = tickets.reduce((sum, t) => sum + (t.ticketScore || 0), 0);
    const doneScore = tickets
      .filter((t) => doneStatusIds.has(t.statusId))
      .reduce((sum, t) => sum + (t.ticketScore || 0), 0);

    return {
      totalTickets,
      doneTickets,
      completionRate: totalTickets ? doneTickets / totalTickets : 0,
      totalScore,
      doneScore,
      scoreCompletionRate: totalScore ? doneScore / totalScore : 0,
      byStatus,
    };
  }, [ticketsQuery.data, statuses]);

  return { stats, isLoading: ticketsQuery.isLoading, error: ticketsQuery.error };
}
