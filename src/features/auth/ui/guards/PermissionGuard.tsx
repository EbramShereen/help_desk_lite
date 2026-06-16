import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '../../logic/usePermissions';
import type { Permission } from '../../../admin/models/Permission';

/**
 * Permission-based route guard (additive alongside RoleGuard). Renders children
 * only if the user has at least one of the required permissions.
 */
export default function PermissionGuard({ anyOf }: { anyOf: readonly Permission[] }) {
  const { canAny, isLoading } = usePermissions();

  if (isLoading) return <p className="p-6 text-content-muted">Loading…</p>;
  if (!canAny(...anyOf)) return <Navigate to="/" replace />;

  return <Outlet />;
}
