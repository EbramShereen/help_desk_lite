import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppButton, AppTextField } from '../../../../core/widgets';
import { AuthLayout } from '../widgets/AuthLayout';
import { useAuthController } from '../../logic/useAuthController';
import { resetPasswordSchema, type ResetPasswordInput } from '../../models/schemas';
import type { AppError } from '../../../../core/errors/AppError';

export default function ResetPasswordView() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode') ?? '';
  const { verifyCode, confirmReset } = useAuthController();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    if (oobCode) {
      verifyCode.mutate(oobCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oobCode]);

  const onSubmit = (data: ResetPasswordInput) => {
    confirmReset.mutate(
      { ...data, oobCode },
      { onSuccess: () => navigate('/login', { replace: true }) },
    );
  };

  if (!oobCode || verifyCode.isError) {
    return (
      <AuthLayout>
        <div className="rounded-card border border-surface-border bg-surface-muted p-6 text-center">
          <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-pill bg-danger-subtle text-danger">
            !
          </span>
          <h2 className="text-lg font-bold tracking-tight text-content">{t('auth.linkExpired')}</h2>
          <p className="mt-2 text-sm text-content-muted">
            {(verifyCode.error as AppError)?.message ?? t('auth.linkExpiredMessage')}
          </p>
          <Link
            to="/forgot-password"
            className="mt-4 inline-block text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
          >
            {t('auth.requestNewLink')}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (verifyCode.isPending) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center gap-3 py-8 text-sm text-content-muted">
          <span className="h-5 w-5 animate-spin rounded-pill border-2 border-primary border-t-transparent" />
          {t('auth.verifyingLink')}
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-label text-accent-hover">
          {t('auth.almostThere')}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-content">
          {t('auth.setNewPassword')}
        </h2>
        <p className="mt-2 text-sm text-content-muted">{t('auth.chooseStrongPassword')}</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <AppTextField
          label={t('auth.newPassword')}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <AppTextField
          label={t('auth.confirmPassword')}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        {confirmReset.error && (
          <p className="rounded-control bg-danger-subtle px-3.5 py-2.5 text-sm text-danger">
            {(confirmReset.error as AppError).message ?? t('auth.resetFailed')}
          </p>
        )}
        <AppButton type="submit" fullWidth isLoading={confirmReset.isPending}>
          {t('auth.resetPasswordBtn')}
        </AppButton>
      </form>
    </AuthLayout>
  );
}
