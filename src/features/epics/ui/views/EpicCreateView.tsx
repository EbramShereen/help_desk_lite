import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useEpicController } from '../../logic/useEpicController';
import { AppCard } from '../../../../core/widgets/AppCard';
import { AppButton } from '../../../../core/widgets/AppButton';
import { ConfirmDialog } from '../../../../core/widgets/ConfirmDialog';
import { EpicForm } from '../widgets/EpicForm';
import type { EpicInput } from '../../models/Epic';

export default function EpicCreateView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createEpic } = useEpicController();
  const [showDiscard, setShowDiscard] = useState(false);

  const handleSubmit = (data: EpicInput) => {
    createEpic.mutate(data, {
      onSuccess: (epic) => navigate(`/epics/${epic.id}`),
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tightest text-content">New Epic</h1>
        <AppButton variant="ghost" onClick={() => setShowDiscard(true)}>
          Cancel
        </AppButton>
      </div>

      <AppCard>
        <EpicForm onSubmit={handleSubmit} isLoading={createEpic.isPending} />
      </AppCard>

      {createEpic.isError && <p className="text-sm text-danger">Failed to create epic.</p>}

      <ConfirmDialog
        open={showDiscard}
        title={t('dialogs.discardTitle')}
        message={t('dialogs.discardMessage')}
        confirmLabel={t('common.discard')}
        onConfirm={() => navigate('/epics')}
        onCancel={() => setShowDiscard(false)}
      />
    </div>
  );
}
