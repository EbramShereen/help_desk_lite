import { useTranslation } from 'react-i18next';
import { AppCard, EmptyState } from '../../../../core/widgets';
import { useSummaryController } from '../../logic/useSummaryController';

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <AppCard className="p-4">
      <p className="text-xs font-semibold uppercase tracking-label text-content-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-content">{value}</p>
    </AppCard>
  );
}

export default function SummaryView() {
  const { t } = useTranslation();
  const { stats, isLoading, error } = useSummaryController();

  if (isLoading) return <p className="p-6 text-content-muted">{t('common.loading')}</p>;
  if (error) return <p className="p-6 text-danger">{t('summary.error')}</p>;

  const pct = (n: number) => `${Math.round(n * 100)}%`;
  const maxCount = Math.max(1, ...stats.byStatus.map((s) => s.count));

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-bold tracking-tight text-content">{t('summary.title')}</h1>

      {stats.totalTickets === 0 ? (
        <EmptyState title={t('common.noResults')} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile label={t('summary.tickets')} value={String(stats.totalTickets)} />
            <StatTile label={t('summary.completionRate')} value={pct(stats.completionRate)} />
            <StatTile
              label={t('summary.storyPoints')}
              value={`${stats.doneScore}/${stats.totalScore}`}
            />
            <StatTile
              label={`${t('summary.storyPoints')} ${t('summary.completionRate')}`}
              value={pct(stats.scoreCompletionRate)}
            />
          </div>

          <AppCard className="p-5">
            <p className="mb-4 text-sm font-semibold text-content">{t('filters.status')}</p>
            <div className="flex flex-col gap-3">
              {stats.byStatus.map((s) => (
                <div key={s.statusId} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-sm text-content-muted">
                    {s.name}
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-pill bg-surface-muted">
                    <div
                      className="h-full rounded-pill transition-all"
                      style={{ width: `${(s.count / maxCount) * 100}%`, backgroundColor: s.color }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-end text-sm font-semibold text-content">
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </AppCard>
        </>
      )}
    </div>
  );
}
