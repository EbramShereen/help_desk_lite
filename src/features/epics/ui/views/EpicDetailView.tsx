import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useEpicDetailController } from '../../logic/useEpicController';
import { useTicketController } from '../../../tickets/logic/useTicketController';
import { useTeamController } from '../../../teams/logic/useTeamController';
import { AppCard } from '../../../../core/widgets/AppCard';
import { AppButton } from '../../../../core/widgets/AppButton';
import { ConfirmDialog } from '../../../../core/widgets/ConfirmDialog';
import { TicketRow } from '../../../tickets/ui/widgets/TicketRow';
import { EpicTeamManager } from '../widgets/EpicTeamManager';
import { EpicTicketPicker } from '../widgets/EpicTicketPicker';
import { usePermissions } from '../../../auth/logic/usePermissions';

export default function EpicDetailView() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { epicQuery, deleteEpic, assignTeams, removeTeam, addTickets, removeTicket } =
    useEpicDetailController(id!);
  const { ticketsQuery } = useTicketController({ epicId: id });
  const { teamsQuery } = useTeamController();
  const { can } = usePermissions();
  const [showDelete, setShowDelete] = useState(false);
  const [now] = useState(Date.now);

  const epic = epicQuery.data;
  const tickets = useMemo(() => ticketsQuery.data ?? [], [ticketsQuery.data]);
  const allTeams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data]);

  const canRemove = can('can_remove_epic');
  const canAssignTeams = can('can_assign_teams_to_epic') || can('can_assign_custom_teams_to_epic');
  const canManageTickets =
    can('can_add_all_tickets_to_epic') ||
    can('can_add_custom_team_tickets_to_epic') ||
    can('can_remove_all_tickets_from_epic') ||
    can('can_remove_custom_team_tickets_from_epic');

  if (epicQuery.isLoading) return <p className="p-6 text-sm text-content-muted">Loading…</p>;
  if (!epic) return <p className="p-6 text-sm text-danger">Epic not found.</p>;

  const assignedTeams = allTeams.filter((t) => epic.teamIds.includes(t.id));

  const handleDelete = () => {
    deleteEpic.mutate(undefined, { onSuccess: () => navigate('/epics') });
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            {epic.color && (
              <span
                className="h-4 w-4 shrink-0 rounded-full"
                style={{ backgroundColor: epic.color }}
              />
            )}
            <h1 className="text-2xl font-bold tracking-tightest text-content">{epic.title}</h1>
          </div>
          <p className="text-sm text-content-muted">{epic.description}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <AppButton variant="ghost" size="sm" onClick={() => navigate('/epics')}>
            Back
          </AppButton>
          {canRemove && (
            <AppButton variant="danger" size="sm" onClick={() => setShowDelete(true)}>
              Delete
            </AppButton>
          )}
        </div>
      </div>

      {canAssignTeams && (
        <EpicTeamManager
          assignedTeams={assignedTeams}
          allTeams={allTeams}
          onAssign={(teamIds) => assignTeams.mutate(teamIds)}
          onRemove={(teamId) => removeTeam.mutate(teamId)}
          isLoading={assignTeams.isPending || removeTeam.isPending}
        />
      )}

      {canManageTickets && (
        <EpicTicketPicker
          epicId={id!}
          assignedTeamIds={epic.teamIds}
          linkedTicketIds={epic.ticketIds}
          onAdd={(ticketIds) => addTickets.mutate(ticketIds)}
          onRemove={(ticketId) => removeTicket.mutate(ticketId)}
          isLoading={addTickets.isPending || removeTicket.isPending}
        />
      )}

      <AppCard>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-label text-content-muted">
          Linked Tickets ({tickets.length})
        </h3>
        {ticketsQuery.isLoading && <p className="text-sm text-content-muted">Loading…</p>}
        {tickets.length === 0 && !ticketsQuery.isLoading && (
          <p className="text-sm text-content-muted">No tickets linked to this epic.</p>
        )}
        <div className="divide-y divide-surface-border">
          {tickets.map((t) => (
            <TicketRow key={t.id} ticket={t} now={now} />
          ))}
        </div>
      </AppCard>

      <ConfirmDialog
        open={showDelete}
        title={t('dialogs.deleteEpicTitle')}
        message={t('dialogs.deleteEpicMessage')}
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
