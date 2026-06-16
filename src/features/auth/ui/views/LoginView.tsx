import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppButton, AppTextField } from '../../../../core/widgets';
import { AuthLayout } from '../widgets/AuthLayout';
import { useAuthController } from '../../logic/useAuthController';
import { loginSchema, type LoginInput } from '../../models/schemas';
import type { AppError } from '../../../../core/errors/AppError';

export default function LoginView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, status, login } = useAuthController();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (status === 'authenticated' && user) {
      navigate('/app', { replace: true });
    }
  }, [status, user, navigate]);

  const onSubmit = (data: LoginInput) => login.mutate(data);

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-label text-accent-hover">
          {t('auth.welcomeBack')}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-content">
          {t('auth.signInToAccount')}
        </h2>
        <p className="mt-2 text-sm text-content-muted">{t('auth.enterCredentials')}</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <AppTextField
          label={t('auth.email')}
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <AppTextField
          label={t('auth.password')}
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        {login.error && (
          <p className="rounded-control bg-danger-subtle px-3.5 py-2.5 text-sm text-danger">
            {(login.error as AppError).message ?? t('auth.loginFailed')}
          </p>
        )}
        <AppButton type="submit" fullWidth isLoading={login.isPending}>
          {t('auth.signIn')}
        </AppButton>
      </form>
      <p className="mt-6 text-center text-sm text-content-muted">
        <Link
          to="/forgot-password"
          className="font-semibold text-accent transition-colors hover:text-accent-hover"
        >
          {t('auth.forgotPassword')}
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-content-muted">
        {t('auth.noAccount')}{' '}
        <Link
          to="/signup"
          className="font-semibold text-accent transition-colors hover:text-accent-hover"
        >
          {t('auth.signUpLink')}
        </Link>
      </p>
    </AuthLayout>
  );
}
