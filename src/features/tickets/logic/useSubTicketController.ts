import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { useAppSelector } from '../../../app/hooks';
import type { SubtaskInput, Subtask } from '../models/Ticket';

const TICKETS_KEY = 'tickets';

export function useSubTicketController(ticketId: string, subtasks: Subtask[] = []) {
  const repo = useInjected(TOKENS.TicketRepo);
  const qc = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);

  const addSubtask = useMutation({
    mutationFn: (input: SubtaskInput) => repo.addSubtask(ticketId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY, ticketId] }),
  });

  const removeSubtask = useMutation({
    mutationFn: (subtaskId: string) => repo.removeSubtask(ticketId, subtaskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY, ticketId] }),
  });

  const toggleSubtask = useMutation({
    mutationFn: ({ subtaskId, isDone }: { subtaskId: string; isDone: boolean }) =>
      repo.toggleSubtask(ticketId, subtaskId, isDone),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TICKETS_KEY, ticketId] }),
  });

  const total = subtasks.length;
  const completed = subtasks.filter((s) => s.isDone).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { addSubtask, removeSubtask, toggleSubtask, subtasks, progress, total, completed, user };
}
