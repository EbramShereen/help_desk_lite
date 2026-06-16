import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../../../app/hooks';
import { AppLayout } from '../../../../core/widgets/AppLayout';

export default function AuthGuard() {
  const { status, user } = useAppSelector((s) => s.auth);

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'pending' && !user.customRoleId) {
    return <Navigate to="/pending" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
