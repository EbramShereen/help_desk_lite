import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../../../app/hooks';
import type { Role } from '../../../../core/enums/auth/role';

export default function RoleGuard({ allowedRoles }: { allowedRoles: Role[] }) {
  const user = useAppSelector((s) => s.auth.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
