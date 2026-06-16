import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppCard,
  AppButton,
  AppTextField,
  DynamicStatusBadge,
  AppBadge,
} from '../../../../core/widgets';
import { useAdminConfigController } from '../../logic/useAdminConfigController';

export default function AdminWorkflowView() {
  const { t } = useTranslation();
  const { statuses, labels, createStatus, deleteStatus, createLabel, deleteLabel } =
    useAdminConfigController();

  const [statusName, setStatusName] = useState('');
  const [statusColor, setStatusColor] = useState('#6B7280');
  const [labelName, setLabelName] = useState('');
  const [labelColor, setLabelColor] = useState('#C9A86A');

  const addStatus = () => {
    if (statusName.trim().length < 2) return;
    createStatus.mutate(
      { name: statusName.trim(), color: statusColor, order: statuses.length },
      { onSuccess: () => setStatusName('') },
    );
  };

  const addLabel = () => {
    if (!labelName.trim()) return;
    createLabel.mutate(
      { name: labelName.trim(), color: labelColor },
      { onSuccess: () => setLabelName('') },
    );
  };

  // Default statuses are seeded fallbacks (no Firestore doc) — not deletable.
  const isSeeded = (id: string) => ['todo', 'inProgress', 'blocked', 'done'].includes(id);

  return (
    <div className="grid gap-4 p-6 lg:grid-cols-2">
      {/* Statuses */}
      <AppCard className="flex flex-col gap-4 p-5">
        <p className="text-sm font-semibold text-content">{t('admin.statuses')}</p>
        <div className="flex flex-col gap-2">
          {statuses.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3">
              <DynamicStatusBadge name={s.name} color={s.color} />
              {!isSeeded(s.id) && (
                <AppButton variant="ghost" size="sm" onClick={() => deleteStatus.mutate(s.id)}>
                  {t('common.delete')}
                </AppButton>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <AppTextField
              label="New status"
              value={statusName}
              onChange={(e) => setStatusName(e.target.value)}
              placeholder="e.g. In Review"
            />
          </div>
          <input
            type="color"
            value={statusColor}
            onChange={(e) => setStatusColor(e.target.value)}
            className="h-11 w-12 cursor-pointer rounded-control border border-surface-border bg-surface"
            aria-label="Status color"
          />
          <AppButton onClick={addStatus} isLoading={createStatus.isPending}>
            {t('common.create')}
          </AppButton>
        </div>
      </AppCard>

      {/* Labels */}
      <AppCard className="flex flex-col gap-4 p-5">
        <p className="text-sm font-semibold text-content">{t('admin.labels')}</p>
        <div className="flex flex-wrap gap-2">
          {labels.length === 0 && (
            <p className="text-sm text-content-subtle">{t('common.noResults')}</p>
          )}
          {labels.map((l) => (
            <span key={l.id} className="inline-flex items-center gap-1.5">
              <AppBadge style={{ color: l.color, backgroundColor: `${l.color}1F` }}>
                {l.name}
              </AppBadge>
              <button
                type="button"
                onClick={() => deleteLabel.mutate(l.id)}
                className="text-xs text-content-subtle hover:text-danger"
                aria-label={`Delete ${l.name}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <AppTextField
              label="New label"
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              placeholder="e.g. bug"
            />
          </div>
          <input
            type="color"
            value={labelColor}
            onChange={(e) => setLabelColor(e.target.value)}
            className="h-11 w-12 cursor-pointer rounded-control border border-surface-border bg-surface"
            aria-label="Label color"
          />
          <AppButton onClick={addLabel} isLoading={createLabel.isPending}>
            {t('common.create')}
          </AppButton>
        </div>
      </AppCard>
    </div>
  );
}
