import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { useSprintController } from './useSprintController';
import { useTicketController } from '../../tickets/logic/useTicketController';
import type { Sprint } from '../models/Sprint';
import type { Ticket } from '../../tickets/models/Ticket';

const SPRINTS_KEY = 'sprints';
const TICKETS_KEY = 'tickets';

export interface SprintGroup {
  sprint: Sprint;
  tickets: Ticket[];
}

/**
 * Backlog logic: active/planned sprints (each with their tickets) listed above the
 * unassigned backlog. Exposes a `moveTicket` mutation that re-parents a ticket
 * between sprints or to/from the backlog (reuses the sprint repo add/remove ops).
 */
export function useBacklogController(teamId?: string) {
  const repo = useInjected(TOKENS.SprintRepo);
  const qc = useQueryClient();
  const { sprintsQuery } = useSprintController();
  const { ticketsQuery } = useTicketController(teamId ? { teamId } : undefined);

  const sprints = useMemo(() => sprintsQuery.data ?? [], [sprintsQuery.data]);
  const tickets = useMemo(() => ticketsQuery.data ?? [], [ticketsQuery.data]);

  const sprintGroups = useMemo<SprintGroup[]>(
    () =>
      sprints.map((sprint) => ({
        sprint,
        tickets: tickets.filter((t) => t.sprintId === sprint.id),
      })),
    [sprints, tickets],
  );

  const backlog = useMemo(() => tickets.filter((t) => !t.sprintId), [tickets]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: [SPRINTS_KEY] });
    qc.invalidateQueries({ queryKey: [TICKETS_KEY] });
  };

  const moveTicket = useMutation({
    mutationFn: async ({
      ticketId,
      fromSprintId,
      toSprintId,
      assigneeIds,
    }: {
      ticketId: string;
      fromSprintId: string | null;
      toSprintId: string | null;
      assigneeIds: string[];
    }) => {
      if (fromSprintId) await repo.removeTicketFromSprint(fromSprintId, ticketId);
      if (toSprintId) await repo.addTicketToSprint(toSprintId, ticketId, assigneeIds);
    },
    onSuccess: invalidate,
  });

  return {
    sprintGroups,
    backlog,
    sprints,
    isLoading: sprintsQuery.isLoading || ticketsQuery.isLoading,
    error: sprintsQuery.error ?? ticketsQuery.error,
    moveTicket,
  };
}
