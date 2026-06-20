import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { unwrap } from '../../../core/models/Result';
import type {
  WorkflowStatusInput,
  WorkflowStatusUpdate,
} from '../../../core/data/models/request/admin/workflow_status_request';

const STATUSES_KEY = 'statuses';

/**
 * Logic hook for dynamic ticket statuses (Kanban columns). Read by
 * board/backlog/summary and the admin workflow view.
 */
export function useWorkflowController() {
  const repo = useInjected(TOKENS.WorkflowRepo);
  const qc = useQueryClient();

  const statusesQuery = useQuery({
    queryKey: [STATUSES_KEY],
    queryFn: () => unwrap(repo.listStatuses()),
    select: (result) => result.items,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: [STATUSES_KEY] });

  const createStatus = useMutation({
    mutationFn: (input: WorkflowStatusInput) => unwrap(repo.createStatus(input)),
    onSuccess: invalidate,
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: WorkflowStatusUpdate }) =>
      unwrap(repo.updateStatus(id, patch)),
    onSuccess: invalidate,
  });
  const deleteStatus = useMutation({
    mutationFn: (id: string) => unwrap(repo.deleteStatus(id)),
    onSuccess: invalidate,
  });

  return {
    statuses: statusesQuery.data ?? [],
    statusesQuery,
    createStatus,
    updateStatus,
    deleteStatus,
  };
}
