import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSprintController } from '../../logic/useSprintController';
import { AppButton } from '../../../../core/widgets/AppButton';
import { AppCard } from '../../../../core/widgets/AppCard';
import { AppBadge } from '../../../../core/widgets/AppBadge';
import { usePermissions } from '../../../auth/logic/usePermissions';

export default function SprintsListView() {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { sprintsQuery } = useSprintController();
  const sprints = useMemo(() => sprintsQuery.data ?? [], [sprintsQuery.data]);

  const canCreate =
    can('can_create_sprint') ||
    can('can_create_custom_team_sprint') ||
    can('can_create_own_team_sprint');

  const formatDate = (ts: number) => (ts ? new Date(ts).toLocaleDateString() : '—');

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tightest text-content">Sprints</h1>
        {canCreate && <AppButton onClick={() => navigate('/sprints/new')}>New Sprint</AppButton>}
      </div>

      <AppCard className="overflow-hidden !p-0">
        {sprintsQuery.isLoading && (
          <p className="p-6 text-sm text-content-muted">Loading sprints…</p>
        )}
        {sprintsQuery.isError && <p className="p-6 text-sm text-danger">Failed to load sprints.</p>}
        {!sprintsQuery.isLoading && sprints.length === 0 && (
          <p className="p-6 text-sm text-content-muted">No sprints found.</p>
        )}
        {sprints.map((s) => (
          <div
            key={s.id}
            onClick={() => navigate(`/sprints/${s.id}`)}
            className="flex cursor-pointer items-center gap-4 border-b border-surface-border px-4 py-3 transition-colors duration-150 hover:bg-surface-muted"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-content">{s.name}</p>
              <p className="text-xs text-content-muted">
                {formatDate(s.startDate)} — {formatDate(s.endDate)}
              </p>
            </div>
            <AppBadge tone="neutral">
              {s.ticketIds.length} ticket{s.ticketIds.length !== 1 ? 's' : ''}
            </AppBadge>
          </div>
        ))}
      </AppCard>
    </div>
  );
}
