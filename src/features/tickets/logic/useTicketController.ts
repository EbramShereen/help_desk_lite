import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { useAppSelector } from '../../../app/hooks';
import type { TicketFilters, TicketViewScope } from '../repo/TicketRepo';
import type { TicketInput, TicketStatus, TicketUpdate, LinkType } from '../models/Ticket';

const TICKETS_KEY = 'tickets';

export function useTicketController(filters?: TicketFilters, scope?: TicketViewScope) {
  const repo = useInjected(TOKENS.TicketRepo);
  const qc = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);

  const ticketsQuery = useQuery({
    queryKey: [TICKETS_KEY, filters, scope],
    queryFn: () =>
      scope ? repo.listTicketsScoped(scope, user?.uid ?? '', filters) : repo.listTickets(filters),
  });

  const createTicket = useMutation({
    mutationFn: (input: TicketInput) => repo.createTicket(input, user!.uid),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });

  const updateTicket = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: TicketUpdate }) =>
      repo.updateTicket(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
      repo.updateTicketStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });

  // Dynamic-status move (Kanban). Status id is admin-defined.
  const moveStatus = useMutation({
    mutationFn: ({ id, statusId }: { id: string; statusId: string }) =>
      repo.updateTicketStatusId(id, statusId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });

  const softDelete = useMutation({
    mutationFn: (id: string) => repo.softDeleteTicket(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });

  return { ticketsQuery, createTicket, updateTicket, updateStatus, moveStatus, softDelete, user };
}

export function useTicketDetailController(ticketId: string) {
  const repo = useInjected(TOKENS.TicketRepo);
  const qc = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);

  const ticketQuery = useQuery({
    queryKey: [TICKETS_KEY, ticketId],
    queryFn: () => repo.getTicket(ticketId),
    enabled: !!ticketId,
  });

  const updateTicket = useMutation({
    mutationFn: (patch: TicketUpdate) => repo.updateTicket(ticketId, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TICKETS_KEY, ticketId] });
      qc.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: (status: TicketStatus) => repo.updateTicketStatus(ticketId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TICKETS_KEY, ticketId] });
      qc.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
  });

  const softDelete = useMutation({
    mutationFn: () => repo.softDeleteTicket(ticketId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });

  const invalidateDetail = () => {
    qc.invalidateQueries({ queryKey: [TICKETS_KEY, ticketId] });
    qc.invalidateQueries({ queryKey: [TICKETS_KEY] });
  };

  const addLink = useMutation({
    mutationFn: ({ targetId, type }: { targetId: string; type: LinkType }) =>
      repo.addLink(ticketId, targetId, type),
    onSuccess: invalidateDetail,
  });

  const removeLink = useMutation({
    mutationFn: (targetId: string) => repo.removeLink(ticketId, targetId),
    onSuccess: invalidateDetail,
  });

  return { ticketQuery, updateTicket, updateStatus, softDelete, addLink, removeLink, user };
}
