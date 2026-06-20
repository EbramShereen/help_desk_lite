import { useMemo } from 'react';
import { useAppSelector } from '../../../../app/hooks';
import { useTicketController } from '../../../tickets/logic/useTicketController';
import { useTeamMembersController } from '../../logic/useTeamMembersController';
import { AppCard } from '../../../../core/widgets/AppCard';
import { ProgressBar } from '../../../tickets/ui/widgets/ProgressBar';
import type { Ticket } from '../../../../core/data/models/response/tickets/ticket_response';

interface MemberStats {
  name: string;
  total: number;
  done: number;
  inProgress: number;
  todo: number;
}

function buildMemberStats(
  tickets: Ticket[],
  members: { label: string; value: string }[],
): MemberStats[] {
  const statsMap = new Map<string, MemberStats>();

  for (const m of members) {
    statsMap.set(m.value, { name: m.label, total: 0, done: 0, inProgress: 0, todo: 0 });
  }

  for (const ticket of tickets) {
    for (const uid of ticket.assigneeIds) {
      const stat = statsMap.get(uid);
      if (!stat) continue;
      stat.total++;
      if (ticket.status === 'done') stat.done++;
      else if (ticket.status === 'inProgress') stat.inProgress++;
      else stat.todo++;
    }
  }

  return Array.from(statsMap.values()).sort((a, b) => b.total - a.total);
}

export default function TeamProgressView() {
  const user = useAppSelector((s) => s.auth.user);
  const teamId = user?.teamId ?? '';
  const { memberOptions } = useTeamMembersController(teamId || undefined);
  const { ticketsQuery } = useTicketController(teamId ? { teamId } : undefined);

  const stats = useMemo(
    () => buildMemberStats(ticketsQuery.data ?? [], memberOptions),
    [ticketsQuery.data, memberOptions],
  );

  if (ticketsQuery.isLoading) {
    return <p className="p-8 text-center text-content-muted">Loading progress…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-label text-accent-hover">
          Team Leader
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-content">Team Progress</h1>
        <p className="mt-2 text-sm text-content-muted">
          Overview of ticket progress for each team member.
        </p>
      </div>

      {stats.length === 0 && (
        <p className="py-6 text-center text-content-muted">No team members found.</p>
      )}

      <div className="flex flex-col gap-4">
        {stats.map((m) => (
          <AppCard key={m.name}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-content">{m.name}</h3>
                <span className="text-xs text-content-muted">{m.total} tickets</span>
              </div>
              <ProgressBar progress={m.total > 0 ? Math.round((m.done / m.total) * 100) : 0} />
              <div className="flex gap-4 text-xs text-content-muted">
                <span className="text-success">Done: {m.done}</span>
                <span className="text-warning">In Progress: {m.inProgress}</span>
                <span className="text-content-subtle">To Do: {m.todo}</span>
              </div>
            </div>
          </AppCard>
        ))}
      </div>
    </div>
  );
}
