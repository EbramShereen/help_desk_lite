import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamController } from '../../logic/useTeamController';
import { AppButton } from '../../../../core/widgets/AppButton';
import { AppCard } from '../../../../core/widgets/AppCard';
import { AppBadge } from '../../../../core/widgets/AppBadge';
import { usePermissions } from '../../../auth/logic/usePermissions';
import { AppError } from '../../../../core/errors/AppError';

export default function TeamsListView() {
  const navigate = useNavigate();
  const { teamsQuery } = useTeamController();
  const { can } = usePermissions();
  const teams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tightest text-content">Teams</h1>
        {can('can_manage_teams') && (
          <AppButton onClick={() => navigate('/teams/new')}>New Team</AppButton>
        )}
      </div>

      <AppCard className="overflow-hidden !p-0">
        {teamsQuery.isLoading && <p className="p-6 text-sm text-content-muted">Loading teams…</p>}
        {/* TEMP DIAGNOSTIC: surface the real AppError instead of a generic string */}
        {teamsQuery.isError && (
          <pre className="whitespace-pre-wrap p-6 text-sm text-danger">
            {(() => {
              const e = teamsQuery.error;
              console.error('[teams] load failed:', e, (e as { cause?: unknown })?.cause);
              return e instanceof AppError
                ? `Failed to load teams.\nkind: ${e.kind}\ncode: ${e.code}\nmessage: ${e.message}`
                : `Failed to load teams.\n${String(e)}`;
            })()}
          </pre>
        )}
        {!teamsQuery.isLoading && !teamsQuery.isError && teams.length === 0 && (
          <p className="p-6 text-sm text-content-muted">No teams found.</p>
        )}
        {teams.map((t) => (
          <div
            key={t.id}
            onClick={() => navigate(`/teams/${t.id}`)}
            className="flex cursor-pointer items-center gap-4 border-b border-surface-border px-4 py-3 transition-colors duration-150 hover:bg-surface-muted"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-content">{t.label}</p>
            </div>
            <AppBadge tone="neutral">{t.memberCount} members</AppBadge>
          </div>
        ))}
      </AppCard>
    </div>
  );
}
