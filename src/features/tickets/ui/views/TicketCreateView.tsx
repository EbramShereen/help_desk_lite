import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../app/hooks';
import { useTicketController } from '../../logic/useTicketController';
import { useMembersController } from '../../logic/useMembersController';
import { useEpicController } from '../../../epics/logic/useEpicController';
import { useSprintController } from '../../../sprints/logic/useSprintController';
import { useTeamController } from '../../../teams/logic/useTeamController';
import { AppCard } from '../../../../core/widgets/AppCard';
import { AppButton } from '../../../../core/widgets/AppButton';
import { AppDropdown } from '../../../../core/widgets/AppDropdown';
import { ConfirmDialog } from '../../../../core/widgets/ConfirmDialog';
import { TicketForm } from '../widgets/TicketForm';
import type { TicketInput } from '../../../../core/data/models/request/tickets/ticket_request';

export default function TicketCreateView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = user?.role === 'admin';
  const { createTicket } = useTicketController();
  const [selectedAdminTeamId, setSelectedAdminTeamId] = useState<string>('');
  const { teamsQuery } = useTeamController();

  const teamId = user?.teamId || (isAdmin ? selectedAdminTeamId : '');
  const { memberOptions } = useMembersController(teamId || undefined);
  const { epicsQuery } = useEpicController(teamId || undefined);
  const epicOptions = useMemo(
    () => (epicsQuery.data ?? []).map((e) => ({ label: e.title, value: e.id })),
    [epicsQuery.data],
  );
  const { sprintsQuery } = useSprintController();
  const sprintOptions = useMemo(
    () => (sprintsQuery.data ?? []).map((s) => ({ label: s.name, value: s.id })),
    [sprintsQuery.data],
  );
  const [showDiscard, setShowDiscard] = useState(false);

  const handleSubmit = (data: TicketInput) => {
    createTicket.mutate(data, {
      onSuccess: (ticket) => navigate(`/tickets/${ticket.id}`),
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tightest text-content">New Ticket</h1>
        <AppButton variant="ghost" onClick={() => setShowDiscard(true)}>
          Cancel
        </AppButton>
      </div>

      <AppCard>
        {isAdmin && !user?.teamId && (
          <div className="mb-6">
            {teamsQuery.isLoading ? (
              <p className="text-sm text-content-muted">Loading teams...</p>
            ) : teamsQuery.isError ? (
              <p className="text-sm text-danger">Failed to load teams.</p>
            ) : (
              <AppDropdown
                label="Select Team"
                placeholder="Choose a team for this ticket"
                options={(teamsQuery.data ?? []).map((t) => ({ label: t.label, value: t.id }))}
                value={selectedAdminTeamId}
                onChange={(e) => setSelectedAdminTeamId(e.target.value)}
              />
            )}
          </div>
        )}
        {teamId ? (
          <TicketForm
            teamMembers={memberOptions}
            teamId={teamId}
            onSubmit={handleSubmit}
            isLoading={createTicket.isPending}
            defaultValues={{ status: 'todo', priority: 'medium' }}
            epicOptions={epicOptions}
            sprintOptions={sprintOptions}
          />
        ) : (
          <p className="text-sm text-content-muted">
            {isAdmin ? 'Please select a team to start.' : 'You are not assigned to a team.'}
          </p>
        )}
      </AppCard>

      {createTicket.isError && (
        <p className="text-sm text-danger">Failed to create ticket. Please try again.</p>
      )}

      <ConfirmDialog
        open={showDiscard}
        title={t('dialogs.discardTitle')}
        message={t('dialogs.discardMessage')}
        confirmLabel={t('common.discard')}
        onConfirm={() => navigate('/tickets')}
        onCancel={() => setShowDiscard(false)}
      />
    </div>
  );
}
