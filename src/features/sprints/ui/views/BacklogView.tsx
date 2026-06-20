import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  SearchFilterBar,
  DndBoardProvider,
  DraggableCard,
  DroppableColumn,
  AppCard,
  EmptyState,
} from '../../../../core/widgets';
import { useBacklogController } from '../../logic/useBacklogController';
import { useMembersController } from '../../../tickets/logic/useMembersController';
import { useEpicController } from '../../../epics/logic/useEpicController';
import { useLabelController } from '../../../labels/logic/useLabelController';
import { usePermissions } from '../../../auth/logic/usePermissions';
import { TicketCard } from '../../../tickets/ui/widgets/TicketCard';
import type { Ticket } from '../../../../core/data/models/response/tickets/ticket_response';

const BACKLOG_ZONE = 'backlog';

export default function BacklogView() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [epicId, setEpicId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [labelIds, setLabelIds] = useState<string[]>([]);

  const { sprintGroups, backlog, isLoading, error, moveTicket } = useBacklogController();
  const { memberOptions } = useMembersController();
  const { epicsQuery } = useEpicController();
  const { labels } = useLabelController();
  const { canAny } = usePermissions();
  // Dragging here moves tickets in/out of sprints — gate on the sprint membership perms.
  const canMove = canAny(
    'can_add_tickets_to_sprint',
    'can_remove_tickets_from_sprint',
    'can_add_own_team_ticket_to_sprint',
    'can_remove_own_team_ticket_from_sprint',
    'can_move_ticket',
    'can_move_own_team_ticket',
  );

  const nameOf = (uid: string) => memberOptions.find((m) => m.value === uid)?.label ?? uid;

  const term = search.trim().toLowerCase();
  const matches = (tk: Ticket) => {
    if (term && !tk.title.toLowerCase().includes(term)) return false;
    if (epicId && tk.epicId !== epicId) return false;
    if (assigneeId && !tk.assigneeIds.includes(assigneeId)) return false;
    if (labelIds.length && !labelIds.some((id) => tk.labels.includes(id))) return false;
    return true;
  };

  // Lookup for resolving a ticket's current sprint + assignees on drop.
  const ticketIndex = useMemo(() => {
    const map = new Map<string, Ticket>();
    backlog.forEach((tk) => map.set(tk.id, tk));
    sprintGroups.forEach((g) => g.tickets.forEach((tk) => map.set(tk.id, tk)));
    return map;
  }, [backlog, sprintGroups]);

  const handleDrop = (ticketId: string, overId: string | null) => {
    if (!overId) return;
    const ticket = ticketIndex.get(ticketId);
    if (!ticket) return;
    const toSprintId = overId === BACKLOG_ZONE ? null : overId;
    const fromSprintId = ticket.sprintId ?? null;
    if (fromSprintId === toSprintId) return;
    moveTicket.mutate({ ticketId, fromSprintId, toSprintId, assigneeIds: ticket.assigneeIds });
  };

  if (isLoading) return <p className="p-6 text-content-muted">{t('common.loading')}</p>;
  if (error) return <p className="p-6 text-danger">Couldn’t load the backlog.</p>;

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-bold tracking-tight text-content">{t('backlog.title')}</h1>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('common.search')}
        epicOptions={(epicsQuery.data ?? []).map((e) => ({ label: e.title, value: e.id }))}
        epicValue={epicId}
        onEpicChange={setEpicId}
        assigneeOptions={memberOptions}
        assigneeValue={assigneeId}
        onAssigneeChange={setAssigneeId}
        labelOptions={labels.map((l) => ({ label: l.name, value: l.id }))}
        labelValue={labelIds}
        onLabelChange={setLabelIds}
      />

      <DndBoardProvider onDrop={handleDrop}>
        {/* Sprints */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-label text-content-muted">
            {t('backlog.sprints')}
          </h2>
          {sprintGroups.length === 0 && (
            <p className="text-sm text-content-subtle">{t('common.noResults')}</p>
          )}
          {sprintGroups.map(({ sprint, tickets }) => (
            <DroppableColumn key={sprint.id} id={sprint.id}>
              <AppCard className="p-4">
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <div>
                    <p className="font-semibold text-content">{sprint.name}</p>
                    {sprint.sprintGoal && (
                      <p className="text-xs text-content-muted">{sprint.sprintGoal}</p>
                    )}
                  </div>
                  <span className="text-xs text-content-subtle">
                    {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : '—'} ·{' '}
                    {tickets.filter(matches).length}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {tickets.filter(matches).map((ticket) => (
                    <DraggableCard key={ticket.id} id={ticket.id} disabled={!canMove}>
                      <TicketCard
                        ticket={ticket}
                        onOpen={(id) => navigate(`/tickets/${id}`)}
                        resolveName={nameOf}
                      />
                    </DraggableCard>
                  ))}
                </div>
              </AppCard>
            </DroppableColumn>
          ))}
        </section>

        {/* Backlog */}
        <section className="mt-4 flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-label text-content-muted">
            {t('backlog.unassigned')}
          </h2>
          <DroppableColumn id={BACKLOG_ZONE}>
            <AppCard className="min-h-24 p-4">
              {backlog.filter(matches).length === 0 ? (
                <EmptyState title={t('backlog.emptyBacklog')} className="py-8" />
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {backlog.filter(matches).map((ticket) => (
                    <DraggableCard key={ticket.id} id={ticket.id} disabled={!canMove}>
                      <TicketCard
                        ticket={ticket}
                        onOpen={(id) => navigate(`/tickets/${id}`)}
                        resolveName={nameOf}
                      />
                    </DraggableCard>
                  ))}
                </div>
              )}
            </AppCard>
          </DroppableColumn>
        </section>
      </DndBoardProvider>
    </div>
  );
}
