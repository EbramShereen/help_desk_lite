import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useSprintDetailController } from '../../logic/useSprintController';
import { useSprintController } from '../../logic/useSprintController';
import { useTicketController } from '../../../tickets/logic/useTicketController';
import { AppCard } from '../../../../core/widgets/AppCard';
import { AppButton } from '../../../../core/widgets/AppButton';
import { ConfirmDialog } from '../../../../core/widgets/ConfirmDialog';
import { SprintBoard } from '../widgets/SprintBoard';
import { AddTicketToSprint } from '../widgets/AddTicketToSprint';
import { usePermissions } from '../../../auth/logic/usePermissions';

export default function SprintDetailView() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sprintQuery } = useSprintDetailController(id!);
  const { deleteSprint, addTicketToSprint, removeTicketFromSprint } = useSprintController();
  const { can } = usePermissions();
  const [showDelete, setShowDelete] = useState(false);
  const [now] = useState(Date.now);

  const sprint = sprintQuery.data;
  const teamId = sprint?.teamId;

  const { ticketsQuery: sprintTicketsQuery } = useTicketController(
    sprint ? { sprintId: id } : undefined,
  );
  const { ticketsQuery: teamTicketsQuery } = useTicketController(teamId ? { teamId } : undefined);

  const sprintTickets = useMemo(() => sprintTicketsQuery.data ?? [], [sprintTicketsQuery.data]);

  const availableTickets = useMemo(() => {
    const sprintTicketIds = new Set(sprint?.ticketIds ?? []);
    return (teamTicketsQuery.data ?? [])
      .filter((t) => !t.sprintId && !sprintTicketIds.has(t.id))
      .map((t) => ({ label: t.title, value: t.id, assigneeIds: t.assigneeIds }));
  }, [teamTicketsQuery.data, sprint]);

  const canDelete =
    can('can_delete_sprint') ||
    can('can_delete_custom_team_sprint', teamId ?? undefined) ||
    can('can_delete_own_team_sprint', teamId ?? undefined);
  const canManageTickets =
    can('can_add_tickets_to_sprint') ||
    can('can_remove_tickets_from_sprint') ||
    can('can_add_own_team_ticket_to_sprint', teamId ?? undefined) ||
    can('can_remove_own_team_ticket_from_sprint', teamId ?? undefined);

  if (sprintQuery.isLoading) return <p className="p-6 text-sm text-content-muted">Loading…</p>;
  if (!sprint) return <p className="p-6 text-sm text-danger">Sprint not found.</p>;

  const formatDate = (ts: number) => (ts ? new Date(ts).toLocaleDateString() : '—');

  const handleDelete = () => {
    deleteSprint.mutate(sprint.id, { onSuccess: () => navigate('/sprints') });
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tightest text-content">{sprint.name}</h1>
          <p className="text-sm text-content-muted">
            {formatDate(sprint.startDate)} — {formatDate(sprint.endDate)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <AppButton variant="ghost" size="sm" onClick={() => navigate('/sprints')}>
            Back
          </AppButton>
          {canDelete && (
            <AppButton variant="danger" size="sm" onClick={() => setShowDelete(true)}>
              Delete
            </AppButton>
          )}
        </div>
      </div>

      <SprintBoard tickets={sprintTickets} now={now} />

      {canManageTickets && (
        <AppCard>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-label text-content-muted">
            Manage Tickets
          </h3>
          <AddTicketToSprint
            availableTickets={availableTickets}
            onAdd={(ticketId, assigneeIds) =>
              addTicketToSprint.mutate({ sprintId: sprint.id, ticketId, assigneeIds })
            }
            isLoading={addTicketToSprint.isPending}
          />
          {sprintTickets.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-label text-content-muted">
                Remove ticket
              </p>
              {sprintTickets.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-control border border-surface-border px-3 py-2"
                >
                  <span className="truncate text-sm text-content">{t.title}</span>
                  <AppButton
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      removeTicketFromSprint.mutate({ sprintId: sprint.id, ticketId: t.id })
                    }
                  >
                    Remove
                  </AppButton>
                </div>
              ))}
            </div>
          )}
        </AppCard>
      )}

      <ConfirmDialog
        open={showDelete}
        title={t('dialogs.deleteSprintTitle')}
        message={t('dialogs.deleteSprintMessage')}
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
