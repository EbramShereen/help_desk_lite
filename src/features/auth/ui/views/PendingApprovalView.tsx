import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../widgets/AuthLayout';
import { AppButton } from '../../../../core/widgets';
import { useAuthController } from '../../logic/useAuthController';

export default function PendingApprovalView() {
  const { t } = useTranslation();
  const { logout } = useAuthController();

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning-subtle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-warning"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
            />
          </svg>
        </div>

        <h2 className="mt-6 text-2xl font-bold tracking-tight text-content">
          {t('auth.pendingTitle')}
        </h2>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-content-muted">
          {t('auth.pendingMessage')}
        </p>

        <AppButton
          variant="secondary"
          className="mt-8"
          onClick={() => logout.mutate()}
          isLoading={logout.isPending}
        >
          {t('common.signOut')}
        </AppButton>
      </div>
    </AuthLayout>
  );
}
