import type { Subtask } from '../../../../core/data/models/response/tickets/ticket_response';

interface SubTicketRowProps {
  subtask: Subtask;
  canToggle: boolean;
  onToggle: (isDone: boolean) => void;
}

export function SubTicketRow({ subtask, canToggle, onToggle }: SubTicketRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-surface-border px-3 py-2 last:border-b-0">
      <input
        type="checkbox"
        checked={subtask.isDone}
        disabled={!canToggle}
        onChange={() => onToggle(!subtask.isDone)}
        className="h-4 w-4 rounded accent-primary"
      />
      <p
        className={`min-w-0 flex-1 truncate text-sm ${subtask.isDone ? 'text-content-subtle line-through' : 'text-content'}`}
      >
        {subtask.title}
      </p>
    </div>
  );
}
