import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { unwrap } from '../../../core/models/Result';
import type {
  LabelInput,
  LabelUpdate,
} from '../../../core/data/models/request/admin/label_request';

const LABELS_KEY = 'labels';

/**
 * Logic hook for global ticket labels. Read by board/backlog filters and the
 * admin workflow view.
 */
export function useLabelController() {
  const repo = useInjected(TOKENS.LabelRepo);
  const qc = useQueryClient();

  const labelsQuery = useQuery({
    queryKey: [LABELS_KEY],
    queryFn: () => unwrap(repo.listLabels()),
    select: (result) => result.items,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: [LABELS_KEY] });

  const createLabel = useMutation({
    mutationFn: (input: LabelInput) => unwrap(repo.createLabel(input)),
    onSuccess: invalidate,
  });
  const updateLabel = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: LabelUpdate }) =>
      unwrap(repo.updateLabel(id, patch)),
    onSuccess: invalidate,
  });
  const deleteLabel = useMutation({
    mutationFn: (id: string) => unwrap(repo.deleteLabel(id)),
    onSuccess: invalidate,
  });

  return {
    labels: labelsQuery.data ?? [],
    labelsQuery,
    createLabel,
    updateLabel,
    deleteLabel,
  };
}
