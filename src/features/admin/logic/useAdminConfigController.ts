import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { useAppSelector } from '../../../app/hooks';
import type { WorkflowStatusInput, WorkflowStatusUpdate } from '../models/WorkflowStatus';
import type { LabelInput, LabelUpdate } from '../models/Label';
import type { CustomRoleInput, CustomRoleUpdate } from '../models/CustomRole';

const STATUSES_KEY = 'statuses';
const LABELS_KEY = 'labels';
const ROLES_KEY = 'customRoles';
const PERMISSION_CATALOGUE_KEY = 'permissionCatalogue';

/**
 * Logic hook for admin-managed configuration: dynamic statuses, global labels,
 * and custom roles. Read by board/backlog/forms and admin views.
 */
export function useAdminConfigController() {
  const repo = useInjected(TOKENS.AdminConfigRepo);
  const qc = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);

  const statusesQuery = useQuery({ queryKey: [STATUSES_KEY], queryFn: () => repo.listStatuses() });
  const labelsQuery = useQuery({ queryKey: [LABELS_KEY], queryFn: () => repo.listLabels() });
  const rolesQuery = useQuery({ queryKey: [ROLES_KEY], queryFn: () => repo.listCustomRoles() });
  const permissionCatalogueQuery = useQuery({
    queryKey: [PERMISSION_CATALOGUE_KEY],
    queryFn: () => repo.listPermissionCategories(),
    staleTime: Infinity,
  });

  const invalidate = (key: string) => () => qc.invalidateQueries({ queryKey: [key] });

  const createStatus = useMutation({
    mutationFn: (input: WorkflowStatusInput) => repo.createStatus(input),
    onSuccess: invalidate(STATUSES_KEY),
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: WorkflowStatusUpdate }) =>
      repo.updateStatus(id, patch),
    onSuccess: invalidate(STATUSES_KEY),
  });
  const deleteStatus = useMutation({
    mutationFn: (id: string) => repo.deleteStatus(id),
    onSuccess: invalidate(STATUSES_KEY),
  });

  const createLabel = useMutation({
    mutationFn: (input: LabelInput) => repo.createLabel(input),
    onSuccess: invalidate(LABELS_KEY),
  });
  const updateLabel = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: LabelUpdate }) => repo.updateLabel(id, patch),
    onSuccess: invalidate(LABELS_KEY),
  });
  const deleteLabel = useMutation({
    mutationFn: (id: string) => repo.deleteLabel(id),
    onSuccess: invalidate(LABELS_KEY),
  });

  const createRole = useMutation({
    mutationFn: (input: CustomRoleInput) => repo.createCustomRole(input, user?.uid ?? ''),
    onSuccess: invalidate(ROLES_KEY),
  });
  const updateRole = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: CustomRoleUpdate }) =>
      repo.updateCustomRole(id, patch),
    onSuccess: invalidate(ROLES_KEY),
  });
  const deleteRole = useMutation({
    mutationFn: (id: string) => repo.deleteCustomRole(id),
    onSuccess: invalidate(ROLES_KEY),
  });

  const migrateRoleScopes = useMutation({
    mutationFn: () => repo.migrateRolePermissionScopes(),
    onSuccess: (count) => {
      if (count > 0) qc.invalidateQueries({ queryKey: [ROLES_KEY] });
    },
  });

  return {
    statuses: statusesQuery.data ?? [],
    labels: labelsQuery.data ?? [],
    customRoles: rolesQuery.data ?? [],
    permissionCategories: permissionCatalogueQuery.data ?? [],
    statusesQuery,
    labelsQuery,
    rolesQuery,
    permissionCatalogueQuery,
    createStatus,
    updateStatus,
    deleteStatus,
    createLabel,
    updateLabel,
    deleteLabel,
    createRole,
    updateRole,
    deleteRole,
    migrateRoleScopes,
  };
}
