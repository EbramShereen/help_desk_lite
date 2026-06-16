import { useMemo, useState } from 'react';
import { useTicketController } from '../../../tickets/logic/useTicketController';
import { useTranslation } from 'react-i18next';
import { useTeamController } from '../../../teams/logic/useTeamController';
import { AppCard } from '../../../../core/widgets/AppCard';
import { AppButton } from '../../../../core/widgets/AppButton';
import { AppDropdown } from '../../../../core/widgets/AppDropdown';
import { cn } from '../../../../lib/cn';

interface EpicTicketPickerProps {
  epicId: string;
  assignedTeamIds: string[];
  linkedTicketIds: string[];
  onAdd: (ticketIds: string[]) => void;
  onRemove: (ticketId: string) => void;
  isLoading: boolean;
}

export function EpicTicketPicker({
  assignedTeamIds,
  linkedTicketIds,
  onAdd,
  onRemove,
  isLoading,
}: EpicTicketPickerProps) {
  const { t } = useTranslation();
  const [filterTeamId, setFilterTeamId] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { teamsQuery } = useTeamController();
  const allTeams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data]);

  const browseTeamIds = assignedTeamIds.length > 0 ? assignedTeamIds : allTeams.map((t) => t.id);
  const teamOptions = allTeams
    .filter((t) => browseTeamIds.includes(t.id))
    .map((t) => ({ label: t.label, value: t.id }));

  const activeTeamId = filterTeamId || (teamOptions.length === 1 ? teamOptions[0].value : '');
  const { ticketsQuery } = useTicketController(activeTeamId ? { teamId: activeTeamId } : undefined);
  const tickets = useMemo(() => ticketsQuery.data ?? [], [ticketsQuery.data]);

  const linkedSet = new Set(linkedTicketIds);
  const unlinked = tickets.filter((t) => !linkedSet.has(t.id));

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    if (selected.size === 0) return;
    onAdd([...selected]);
    setSelected(new Set());
  };

  return (
    <AppCard>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-label text-content-muted">
        {t('form.addTickets')}
      </h3>

      {teamOptions.length > 1 && (
        <div className="mb-4">
          <AppDropdown
            label={t('form.filterByTeam')}
            placeholder={t('form.selectTeam')}
            options={teamOptions}
            value={filterTeamId}
            onChange={(e) => {
              setFilterTeamId(e.target.value);
              setSelected(new Set());
            }}
          />
        </div>
      )}

      {!activeTeamId && (
        <p className="text-sm text-content-muted">Select a team to browse tickets.</p>
      )}

      {activeTeamId && ticketsQuery.isLoading && (
        <p className="text-sm text-content-muted">Loading tickets…</p>
      )}

      {activeTeamId && !ticketsQuery.isLoading && unlinked.length === 0 && (
        <p className="text-sm text-content-muted">No unlinked tickets for this team.</p>
      )}

      {unlinked.length > 0 && (
        <>
          <div className="mb-3 max-h-64 divide-y divide-surface-border overflow-y-auto rounded-card border border-surface-border">
            {unlinked.map((ticket) => (
              <label
                key={ticket.id}
                className={cn(
                  'flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-muted',
                  selected.has(ticket.id) && 'bg-primary/5',
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.has(ticket.id)}
                  onChange={() => toggleSelect(ticket.id)}
                  className="accent-primary"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-content">{ticket.title}</p>
                  <p className="truncate text-xs text-content-muted">
                    {ticket.status} · {ticket.priority}
                  </p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <AppButton
              size="sm"
              onClick={handleAdd}
              isLoading={isLoading}
              disabled={selected.size === 0}
            >
              Add {selected.size > 0 ? `(${selected.size})` : ''} Tickets
            </AppButton>
          </div>
        </>
      )}

      {linkedTicketIds.length > 0 && (
        <div className="mt-4 border-t border-surface-border pt-4">
          <p className="mb-2 text-xs font-medium text-content-muted">
            Linked ticket IDs ({linkedTicketIds.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {linkedTicketIds.map((tid) => (
              <span
                key={tid}
                className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-0.5 text-xs text-content-muted"
              >
                {tid.slice(0, 8)}…
                <button
                  type="button"
                  onClick={() => onRemove(tid)}
                  disabled={isLoading}
                  className="ml-0.5 opacity-60 hover:opacity-100"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </AppCard>
  );
}
