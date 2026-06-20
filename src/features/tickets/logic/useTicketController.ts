import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { useAppSelector } from '../../../app/hooks';
import { unwrap } from '../../../core/models/Result';
import type { TicketFilters, TicketViewScope } from '../repo/TicketRepo';
import type {
  TicketInput,
  TicketUpdate,
} from '../../../core/data/models/request/tickets/ticket_request';
import type { TicketStatus } from '../../../core/enums/tickets/ticket_status';
import type { LinkType } from '../../../core/enums/tickets/link_type';

const TICKETS_KEY = 'tickets';

export function useTicketController(filters?: TicketFilters, scope?: TicketViewScope) {
  const repo = useInjected(TOKENS.TicketRepo);
  const qc = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);

  const ticketsQuery = useQuery({
    queryKey: [TICKETS_KEY, filters, scope],
    queryFn: () =>
      scope
        ? unwrap(repo.listTicketsScoped(scope, user?.uid ?? '', filters))
        : unwrap(repo.listTickets(filters)),
    select: (result) => result.items,
  });

  const createTicket = useMutation({
    mutationFn: (input: TicketInput) => unwrap(repo.createTicket(input, user!.uid)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });

  const updateTicket = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: TicketUpdate }) =>
      unwrap(repo.updateTicket(id, patch)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
      unwrap(repo.updateTicketStatus(id, status)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });

  // Dynamic-status move (Kanban). Status id is admin-defined.
  const moveStatus = useMutation({
    mutationFn: ({ id, statusId }: { id: string; statusId: string }) =>
      unwrap(repo.updateTicketStatusId(id, statusId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });

  const softDelete = useMutation({
    mutationFn: (id: string) => unwrap(repo.softDeleteTicket(id)),
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
    queryFn: () => unwrap(repo.getTicket(ticketId)),
    enabled: !!ticketId,
  });

  const updateTicket = useMutation({
    mutationFn: (patch: TicketUpdate) => unwrap(repo.updateTicket(ticketId, patch)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TICKETS_KEY, ticketId] });
      qc.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: (status: TicketStatus) => unwrap(repo.updateTicketStatus(ticketId, status)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TICKETS_KEY, ticketId] });
      qc.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
  });

  const softDelete = useMutation({
    mutationFn: () => unwrap(repo.softDeleteTicket(ticketId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY] }),
  });

  const invalidateDetail = () => {
    qc.invalidateQueries({ queryKey: [TICKETS_KEY, ticketId] });
    qc.invalidateQueries({ queryKey: [TICKETS_KEY] });
  };

  const addLink = useMutation({
    mutationFn: ({ targetId, type }: { targetId: string; type: LinkType }) =>
      unwrap(repo.addLink(ticketId, targetId, type)),
    onSuccess: invalidateDetail,
  });

  const removeLink = useMutation({
    mutationFn: (targetId: string) => unwrap(repo.removeLink(ticketId, targetId)),
    onSuccess: invalidateDetail,
  });

  return { ticketQuery, updateTicket, updateStatus, softDelete, addLink, removeLink, user };
}
