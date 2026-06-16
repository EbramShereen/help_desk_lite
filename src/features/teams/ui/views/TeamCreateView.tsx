import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTeamController } from '../../logic/useTeamController';
import { useInjected } from '../../../../core/di/DependencyProvider';
import { TOKENS } from '../../../../core/di/tokens';
import { AppCard } from '../../../../core/widgets/AppCard';
import { AppButton } from '../../../../core/widgets/AppButton';
import { ConfirmDialog } from '../../../../core/widgets/ConfirmDialog';
import { TeamForm } from '../widgets/TeamForm';
import type { TeamInput } from '../../models/Team';

export default function TeamCreateView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createTeam } = useTeamController();
  const authRepo = useInjected(TOKENS.AuthRepo);
  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => authRepo.listUsers(),
  });

  const allUsers = useMemo(
    () => (usersQuery.data ?? []).map((u) => ({ label: u.displayName || u.email, value: u.uid })),
    [usersQuery.data],
  );

  const leaderOptions = allUsers;
  const memberOptions = allUsers;

  const [showDiscard, setShowDiscard] = useState(false);

  const handleSubmit = (data: TeamInput) => {
    createTeam.mutate(data, {
      onSuccess: (team) => navigate(`/teams/${team.id}`),
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tightest text-content">New Team</h1>
        <AppButton variant="ghost" onClick={() => setShowDiscard(true)}>
          Cancel
        </AppButton>
      </div>

      <AppCard>
        <TeamForm
          leaderOptions={leaderOptions}
          memberOptions={memberOptions}
          onSubmit={handleSubmit}
          isLoading={createTeam.isPending}
        />
      </AppCard>

      {createTeam.isError && (
        <p className="text-sm text-danger">Failed to create team. Please try again.</p>
      )}

      <ConfirmDialog
        open={showDiscard}
        title={t('dialogs.discardTitle')}
        message={t('dialogs.discardMessage')}
        confirmLabel={t('common.discard')}
        onConfirm={() => navigate('/teams')}
        onCancel={() => setShowDiscard(false)}
      />
    </div>
  );
}
