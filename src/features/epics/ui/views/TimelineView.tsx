import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppCard, EmptyState } from '../../../../core/widgets';
import { useEpicController } from '../../logic/useEpicController';
import { useTicketController } from '../../../tickets/logic/useTicketController';
import { cn } from '../../../../lib/cn';

type Scale = 'days' | 'months' | 'years';

interface Bar {
  id: string;
  label: string;
  start: number;
  end: number;
  color: string;
  kind: 'epic' | 'ticket';
}

const DAY = 86_400_000;

export default function TimelineView() {
  const { t } = useTranslation();
  const [scale, setScale] = useState<Scale>('months');

  const { epicsQuery } = useEpicController();
  const { ticketsQuery } = useTicketController();

  const bars = useMemo<Bar[]>(() => {
    const epics = epicsQuery.data ?? [];
    const tickets = ticketsQuery.data ?? [];
    const rows: Bar[] = [];

    for (const epic of epics) {
      const epicTickets = tickets.filter((tk) => tk.epicId === epic.id);
      const starts = epicTickets.map((tk) => tk.startDate).filter(Boolean);
      const ends = epicTickets.map((tk) => tk.endDate).filter(Boolean);
      const start = epic.startDate ?? (starts.length ? Math.min(...starts) : 0);
      const end = epic.endDate ?? (ends.length ? Math.max(...ends) : 0);
      if (start && end) {
        rows.push({
          id: epic.id,
          label: epic.title,
          start,
          end,
          color: epic.color ?? '#14213D',
          kind: 'epic',
        });
      }
      for (const tk of epicTickets) {
        if (tk.startDate && tk.endDate) {
          rows.push({
            id: tk.id,
            label: tk.title,
            start: tk.startDate,
            end: tk.endDate,
            color: '#C9A86A',
            kind: 'ticket',
          });
        }
      }
    }
    return rows;
  }, [epicsQuery.data, ticketsQuery.data]);

  const range = useMemo(() => {
    if (!bars.length) return null;
    const min = Math.min(...bars.map((b) => b.start));
    const max = Math.max(...bars.map((b) => b.end));
    return { min, max, span: Math.max(max - min, DAY) };
  }, [bars]);

  const ticks = useMemo(() => {
    if (!range) return [];
    const out: { label: string; left: number }[] = [];
    const step = scale === 'days' ? DAY * 7 : scale === 'months' ? DAY * 30 : DAY * 365;
    for (let t = range.min; t <= range.max; t += step) {
      const d = new Date(t);
      const label =
        scale === 'days'
          ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          : scale === 'months'
            ? d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
            : String(d.getFullYear());
      out.push({ label, left: ((t - range.min) / range.span) * 100 });
    }
    return out;
  }, [range, scale]);

  const scales: Scale[] = ['days', 'months', 'years'];

  if (epicsQuery.isLoading || ticketsQuery.isLoading)
    return <p className="p-6 text-content-muted">{t('common.loading')}</p>;

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-content">{t('timeline.title')}</h1>
        <div className="inline-flex rounded-control bg-surface-muted p-0.5">
          {scales.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScale(s)}
              aria-pressed={scale === s}
              className={cn(
                'h-8 rounded-[0.5rem] px-3 text-xs font-semibold transition-colors',
                'focus-visible:shadow-focus focus-visible:outline-none',
                scale === s
                  ? 'bg-surface text-content shadow-card'
                  : 'text-content-muted hover:text-content',
              )}
            >
              {t(`timeline.${s}`)}
            </button>
          ))}
        </div>
      </div>

      {!range || bars.length === 0 ? (
        <EmptyState title={t('common.noResults')} description={t('timeline.emptyDescription')} />
      ) : (
        <AppCard className="overflow-x-auto p-4">
          {/* Axis */}
          <div className="relative mb-2 ms-48 h-5 border-b border-surface-border">
            {ticks.map((tick, i) => (
              <span
                key={i}
                className="absolute -translate-x-1/2 text-[0.625rem] text-content-subtle"
                style={{ insetInlineStart: `${tick.left}%` }}
              >
                {tick.label}
              </span>
            ))}
          </div>
          {/* Rows */}
          <div className="flex flex-col gap-1.5">
            {bars.map((bar) => {
              const left = range ? ((bar.start - range.min) / range.span) * 100 : 0;
              const width = range ? Math.max(((bar.end - bar.start) / range.span) * 100, 1) : 0;
              const days = Math.round((bar.end - bar.start) / DAY);
              return (
                <div key={`${bar.kind}-${bar.id}`} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'w-48 shrink-0 truncate text-xs',
                      bar.kind === 'epic'
                        ? 'font-semibold text-content'
                        : 'ps-3 text-content-muted',
                    )}
                  >
                    {bar.label}
                  </span>
                  <div className="relative h-6 flex-1">
                    <div
                      className="absolute top-1 flex h-4 items-center rounded-pill px-2 text-[0.625rem] font-medium text-white"
                      style={{
                        insetInlineStart: `${left}%`,
                        width: `${width}%`,
                        backgroundColor: bar.color,
                      }}
                      title={`${bar.label} · ${days}d`}
                    >
                      <span className="truncate">{days}d</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AppCard>
      )}
    </div>
  );
}
