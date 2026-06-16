import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  SearchFilterBar,
  KanbanColumn,
  DndBoardProvider,
  DraggableCard,
  DroppableColumn,
  EmptyState,
} from '../../../../core/widgets';
import { useBoardController } from '../../logic/useBoardController';
import { useMembersController } from '../../logic/useMembersController';
import { useEpicController } from '../../../epics/logic/useEpicController';
import { useAdminConfigController } from '../../../admin/logic/useAdminConfigController';
import { usePermissions } from '../../../auth/logic/usePermissions';
import { TicketCard } from '../widgets/TicketCard';
import type { TicketFilters } from '../../repo/TicketRepo';

export default function BoardView() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [epicId, setEpicId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [labelIds, setLabelIds] = useState<string[]>([]);

  const filters = useMemo<TicketFilters>(
    () => ({
      epicId: epicId || undefined,
      assigneeId: assigneeId || undefined,
      labelIds: labelIds.length ? labelIds : undefined,
    }),
    [epicId, assigneeId, labelIds],
  );

  const { columns, isLoading, error, moveStatus } = useBoardController(filters);
  const { memberOptions } = useMembersController();
  const { epicsQuery } = useEpicController();
  const { labels } = useAdminConfigController();
  const { canAny } = usePermissions();
  const canMove = canAny(
    'can_move_ticket',
    'can_move_own_team_ticket',
    'can_change_own_team_ticket_workflow',
  );

  const nameOf = (uid: string) => memberOptions.find((m) => m.value === uid)?.label ?? uid;

  const term = search.trim().toLowerCase();
  const filteredColumns = useMemo(
    () =>
      columns.map((c) => ({
        ...c,
        tickets: term ? c.tickets.filter((tk) => tk.title.toLowerCase().includes(term)) : c.tickets,
      })),
    [columns, term],
  );

  const handleDrop = (ticketId: string, statusId: string | null) => {
    if (statusId) moveStatus.mutate({ ticketId, statusId });
  };

  if (isLoading) return <p className="p-6 text-content-muted">{t('common.loading')}</p>;
  if (error) return <p className="p-6 text-danger">Couldn’t load the board.</p>;

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <h1 className="text-xl font-bold tracking-tight text-content">{t('board.title')}</h1>

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

      {filteredColumns.length === 0 ? (
        <EmptyState title={t('board.empty')} />
      ) : (
        <DndBoardProvider onDrop={handleDrop}>
          <div className="flex flex-1 gap-4 overflow-x-auto pb-2">
            {filteredColumns.map((col) => (
              <DroppableColumn key={col.status.id} id={col.status.id}>
                <KanbanColumn
                  name={col.status.name}
                  color={col.status.color}
                  count={col.tickets.length}
                >
                  {col.tickets.map((ticket) => (
                    <DraggableCard key={ticket.id} id={ticket.id} disabled={!canMove}>
                      <TicketCard
                        ticket={ticket}
                        onOpen={(id) => navigate(`/tickets/${id}`)}
                        resolveName={nameOf}
                      />
                    </DraggableCard>
                  ))}
                </KanbanColumn>
              </DroppableColumn>
            ))}
          </div>
        </DndBoardProvider>
      )}
    </div>
  );
}
