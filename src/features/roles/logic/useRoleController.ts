import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { useAppSelector } from '../../../app/hooks';
import { unwrap } from '../../../core/models/Result';
import type {
  CustomRoleInput,
  CustomRoleUpdate,
} from '../../../core/data/models/request/admin/custom_role_request';

const ROLES_KEY = 'customRoles';

/**
 * Logic hook for custom roles (permission bundles). Read by the admin role
 * views and the user-management role picker.
 */
export function useRoleController() {
  const repo = useInjected(TOKENS.RoleRepo);
  const qc = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);

  const rolesQuery = useQuery({
    queryKey: [ROLES_KEY],
    queryFn: () => unwrap(repo.listCustomRoles()),
    select: (result) => result.items,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: [ROLES_KEY] });

  const createRole = useMutation({
    mutationFn: (input: CustomRoleInput) => unwrap(repo.createCustomRole(input, user?.uid ?? '')),
    onSuccess: invalidate,
  });
  const updateRole = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: CustomRoleUpdate }) =>
      unwrap(repo.updateCustomRole(id, patch)),
    onSuccess: invalidate,
  });
  const deleteRole = useMutation({
    mutationFn: (id: string) => unwrap(repo.deleteCustomRole(id)),
    onSuccess: invalidate,
  });

  const migrateRoleScopes = useMutation({
    mutationFn: () => unwrap(repo.migrateRolePermissionScopes()),
    onSuccess: (count) => {
      if (count > 0) qc.invalidateQueries({ queryKey: [ROLES_KEY] });
    },
  });

  return {
    customRoles: rolesQuery.data ?? [],
    rolesQuery,
    createRole,
    updateRole,
    deleteRole,
    migrateRoleScopes,
  };
}
