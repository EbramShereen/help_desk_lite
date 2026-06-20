import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppButton, AppTextField } from '../../../../core/widgets';
import { AuthLayout } from '../widgets/AuthLayout';
import { useAuthController } from '../../logic/useAuthController';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '../../../../core/data/models/request/auth/auth_request';

export default function ForgotPasswordView() {
  const { t } = useTranslation();
  const { sendReset } = useAuthController();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = (data: ForgotPasswordInput) => sendReset.mutate(data);

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-label text-accent-hover">
          {t('auth.accountRecovery')}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-content">
          {t('auth.resetYourPassword')}
        </h2>
        <p className="mt-2 text-sm text-content-muted">{t('auth.enterEmailReset')}</p>
      </div>

      {sendReset.isSuccess ? (
        <div className="rounded-card border border-surface-border bg-surface-muted p-6 text-center">
          <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-pill bg-success-subtle text-success">
            ✓
          </span>
          <p className="text-sm text-content">{t('auth.resetEmailSent')}</p>
          <Link
            to="/login"
            className="mt-4 inline-block text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
          >
            {t('auth.backToLogin')}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <AppTextField
            label={t('auth.email')}
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          {sendReset.error && (
            <p className="rounded-control bg-danger-subtle px-3.5 py-2.5 text-sm text-danger">
              {t('auth.genericError')}
            </p>
          )}
          <AppButton type="submit" fullWidth isLoading={sendReset.isPending}>
            {t('auth.sendResetLink')}
          </AppButton>
          <Link
            to="/login"
            className="text-center text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
          >
            {t('auth.backToLogin')}
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
