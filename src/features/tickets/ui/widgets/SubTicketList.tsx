import { AppCard } from '../../../../core/widgets/AppCard';
import { SubTicketRow } from './SubTicketRow';
import { SubTicketForm } from './SubTicketForm';
import { ProgressBar } from './ProgressBar';
import { useSubTicketController } from '../../logic/useSubTicketController';
import type { Subtask } from '../../models/Ticket';

interface SubTicketListProps {
  ticketId: string;
  subtasks: Subtask[];
  canCreate: boolean;
  currentUserUid: string;
  teamMembers: { label: string; value: string }[];
}

export function SubTicketList({
  ticketId,
  subtasks,
  canCreate,
  currentUserUid,
  teamMembers,
}: SubTicketListProps) {
  const { addSubtask, toggleSubtask, progress } = useSubTicketController(ticketId, subtasks);

  return (
    <AppCard className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-label text-content-muted">
          Subtasks
        </h3>
      </div>
      {subtasks.length > 0 && <ProgressBar progress={progress} />}
      <div className="divide-y divide-surface-border">
        {subtasks.map((st) => (
          <SubTicketRow
            key={st.id}
            subtask={st}
            canToggle={st.assigneeId === currentUserUid || canCreate}
            onToggle={(isDone) => toggleSubtask.mutate({ subtaskId: st.id, isDone })}
          />
        ))}
      </div>
      {subtasks.length === 0 && <p className="text-sm text-content-muted">No subtasks yet.</p>}
      {canCreate && (
        <SubTicketForm
          teamMembers={teamMembers}
          onSubmit={(data) => addSubtask.mutate(data)}
          isLoading={addSubtask.isPending}
        />
      )}
    </AppCard>
  );
}
