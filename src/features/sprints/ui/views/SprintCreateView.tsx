import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../../app/hooks';
import { useSprintController } from '../../logic/useSprintController';
import { AppCard } from '../../../../core/widgets/AppCard';
import { AppButton } from '../../../../core/widgets/AppButton';
import { ConfirmDialog } from '../../../../core/widgets/ConfirmDialog';
import { SprintForm } from '../widgets/SprintForm';
import type { SprintInput } from '../../models/Sprint';

export default function SprintCreateView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const { createSprint } = useSprintController();
  const [showDiscard, setShowDiscard] = useState(false);
  const teamId = user?.teamId ?? '';

  const handleSubmit = (data: SprintInput) => {
    createSprint.mutate(data, {
      onSuccess: (sprint) => navigate(`/sprints/${sprint.id}`),
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tightest text-content">New Sprint</h1>
        <AppButton variant="ghost" onClick={() => setShowDiscard(true)}>
          Cancel
        </AppButton>
      </div>

      <AppCard>
        {teamId ? (
          <SprintForm teamId={teamId} onSubmit={handleSubmit} isLoading={createSprint.isPending} />
        ) : (
          <p className="text-sm text-content-muted">You are not assigned to a team.</p>
        )}
      </AppCard>

      {createSprint.isError && <p className="text-sm text-danger">Failed to create sprint.</p>}

      <ConfirmDialog
        open={showDiscard}
        title={t('dialogs.discardTitle')}
        message={t('dialogs.discardMessage')}
        confirmLabel={t('common.discard')}
        onConfirm={() => navigate('/sprints')}
        onCancel={() => setShowDiscard(false)}
      />
    </div>
  );
}
