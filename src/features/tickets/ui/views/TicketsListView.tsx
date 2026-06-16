import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../../app/hooks';
import { useTicketController } from '../../logic/useTicketController';
import { AppButton } from '../../../../core/widgets/AppButton';
import { AppCard } from '../../../../core/widgets/AppCard';
import { TicketRow } from '../widgets/TicketRow';
import { TicketFilters } from '../widgets/TicketFilters';
import { TicketSearchBar } from '../widgets/TicketSearchBar';
import { OverdueBanner } from '../widgets/OverdueBanner';
import type { TicketFilters as TFilters } from '../../repo/TicketRepo';
import { usePermissions } from '../../../auth/logic/usePermissions';
import { useTicketViewScope } from '../../../auth/logic/useScopedFilters';

export default function TicketsListView() {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const { search, statusFilter, priorityFilter } = useAppSelector((s) => s.tickets);
  const { can } = usePermissions();
  const viewScope = useTicketViewScope();

  const filters = useMemo<TFilters>(() => {
    const f: TFilters = {};
    if (statusFilter) f.status = statusFilter;
    if (priorityFilter) f.priority = priorityFilter;
    return f;
  }, [statusFilter, priorityFilter]);

  // Permission-derived view scope drives which tickets are fetched (and matches
  // the Firestore read rules so the query is never rejected).
  const { ticketsQuery } = useTicketController(filters, viewScope);
  const tickets = useMemo(() => ticketsQuery.data ?? [], [ticketsQuery.data]);
  const [now] = useState(Date.now);

  const filtered = useMemo(() => {
    if (!search) return tickets;
    const q = search.toLowerCase();
    return tickets.filter((t) => t.title.toLowerCase().includes(q));
  }, [tickets, search]);

  const canCreate =
    can('can_create_ticket') || can('can_create_own_team_ticket', user?.teamId ?? undefined);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tightest text-content">Tickets</h1>
        {canCreate && <AppButton onClick={() => navigate('/tickets/new')}>New Ticket</AppButton>}
      </div>

      <OverdueBanner tickets={tickets} now={now} />

      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <TicketSearchBar />
        </div>
        <TicketFilters />
      </div>

      <AppCard className="overflow-hidden !p-0">
        {ticketsQuery.isLoading && (
          <p className="p-6 text-sm text-content-muted">Loading tickets…</p>
        )}
        {ticketsQuery.isError && <p className="p-6 text-sm text-danger">Failed to load tickets.</p>}
        {!ticketsQuery.isLoading && filtered.length === 0 && (
          <p className="p-6 text-sm text-content-muted">No tickets found.</p>
        )}
        {filtered.map((t) => (
          <TicketRow key={t.id} ticket={t} now={now} />
        ))}
      </AppCard>
    </div>
  );
}
