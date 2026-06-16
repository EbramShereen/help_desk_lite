import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeamDetailController } from '../../logic/useTeamController';
import { useTeamController } from '../../logic/useTeamController';
import { useMembersController } from '../../../tickets/logic/useMembersController';
import { AppCard } from '../../../../core/widgets/AppCard';
import { AppButton } from '../../../../core/widgets/AppButton';
import { ConfirmDialog } from '../../../../core/widgets/ConfirmDialog';
import { TeamMemberList } from '../widgets/TeamMemberList';
import { AddMemberForm } from '../widgets/AddMemberForm';
import { usePermissions } from '../../../auth/logic/usePermissions';

export default function TeamDetailView() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { teamQuery } = useTeamDetailController(id!);
  const { addMember, removeMember, deleteTeam } = useTeamController();
  const { memberOptions } = useMembersController();
  const { can } = usePermissions();
  const [showDelete, setShowDelete] = useState(false);

  const team = teamQuery.data;

  const canManage = can('can_manage_teams');
  const canManageMembers = canManage || can('can_manage_own_team_members', id ?? undefined);

  const availableToAdd = useMemo(() => {
    if (!team) return [];
    const existing = new Set(Object.keys(team.employees));
    return memberOptions.filter((m) => !existing.has(m.value));
  }, [team, memberOptions]);

  if (teamQuery.isLoading) return <p className="p-6 text-sm text-content-muted">Loading…</p>;
  if (!team) return <p className="p-6 text-sm text-danger">Team not found.</p>;

  const handleAddMember = (userId: string) => {
    const selected = memberOptions.find((m) => m.value === userId);
    if (!selected) return;
    addMember.mutate({
      teamId: team.id,
      userId,
      employee: { name: selected.label, photoUrl: null, role: 'member' },
    });
  };

  const handleRemoveMember = (userId: string) => {
    removeMember.mutate({ teamId: team.id, userId });
  };

  const handleDelete = () => {
    deleteTeam.mutate(team.id, { onSuccess: () => navigate('/teams') });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tightest text-content">{team.label}</h1>
        <div className="flex gap-2">
          <AppButton variant="ghost" size="sm" onClick={() => navigate('/teams')}>
            Back
          </AppButton>
          {canManage && (
            <AppButton variant="danger" size="sm" onClick={() => setShowDelete(true)}>
              Delete
            </AppButton>
          )}
        </div>
      </div>

      <AppCard>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-label text-content-muted">
          Members
        </h3>
        <TeamMemberList
          employees={team.employees}
          teamLeaderId={team.teamLeaderId}
          canManage={canManageMembers}
          onRemove={handleRemoveMember}
        />
      </AppCard>

      {canManageMembers && (
        <AppCard>
          <AddMemberForm
            availableUsers={availableToAdd}
            onAdd={handleAddMember}
            isLoading={addMember.isPending}
          />
        </AppCard>
      )}

      <ConfirmDialog
        open={showDelete}
        title={t('dialogs.deleteTeamTitle')}
        message={t('dialogs.deleteTeamMessage')}
        confirmLabel={t('common.delete')}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
