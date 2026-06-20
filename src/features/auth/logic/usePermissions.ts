import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { useAppSelector } from '../../../app/hooks';
import { resolvePermissions } from '../../../core/data/models/response/auth/auth_user_response';
import { unwrap } from '../../../core/models/Result';
import type { Permission } from '../../../core/enums/admin/permission';
import type { PermissionGrant } from '../../../core/data/models/response/admin/permission_response';

/**
 * Resolves the current user's effective permission grants and exposes helpers.
 * `can(permission)` — global check (no scope).
 * `can(permission, scopeId)` — scoped check: grant must cover that specific ID
 *   OR have an empty scopeIds array (unrestricted).
 */
export function usePermissions() {
  const repo = useInjected(TOKENS.RoleRepo);
  const user = useAppSelector((s) => s.auth.user);

  const customRoleQuery = useQuery({
    queryKey: ['customRole', user?.customRoleId],
    queryFn: () => unwrap(repo.getCustomRole(user!.customRoleId!)),
    enabled: !!user?.customRoleId,
  });

  const grants = useMemo<PermissionGrant[]>(() => {
    if (!user) return [];
    return resolvePermissions(user, customRoleQuery.data);
  }, [user, customRoleQuery.data]);

  const grantMap = useMemo(
    () => new Map<Permission, PermissionGrant>(grants.map((g) => [g.key, g])),
    [grants],
  );

  const can = (permission: Permission, scopeId?: string): boolean => {
    const grant = grantMap.get(permission);
    if (!grant) return false;
    if (!scopeId || grant.scopeIds.length === 0) return true;
    return grant.scopeIds.includes(scopeId);
  };

  const canAny = (...perms: Permission[]) => perms.some((p) => can(p));
  const canAll = (...perms: Permission[]) => perms.every((p) => can(p));

  return { grants, can, canAny, canAll, isLoading: customRoleQuery.isLoading };
}
