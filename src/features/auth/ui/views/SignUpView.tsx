import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppButton, AppTextField } from '../../../../core/widgets';
import { AuthLayout } from '../widgets/AuthLayout';
import { useAuthController } from '../../logic/useAuthController';
import {
  signUpSchema,
  type SignUpInput,
} from '../../../../core/data/models/request/auth/auth_request';
import type { AppError } from '../../../../core/errors/AppError';

export default function SignUpView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, status, signup } = useAuthController();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  useEffect(() => {
    if (status === 'authenticated' && user) {
      navigate('/app', { replace: true });
    }
  }, [status, user, navigate]);

  const onSubmit = (data: SignUpInput) => signup.mutate(data);

  return (
    <AuthLayout>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-label text-accent-hover">
          {t('auth.getStarted')}
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-content">
          {t('auth.createAccount')}
        </h2>
        <p className="mt-2 text-sm text-content-muted">{t('auth.joinTeam')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <AppTextField
          label={t('auth.fullName')}
          type="text"
          placeholder="Jane Smith"
          autoComplete="name"
          error={errors.displayName?.message}
          {...register('displayName')}
        />
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

        {signup.error && (
          <p className="rounded-control bg-danger-subtle px-3.5 py-2.5 text-sm text-danger">
            {(signup.error as AppError).message ?? t('auth.signUpFailed')}
          </p>
        )}

        <AppButton type="submit" fullWidth isLoading={signup.isPending}>
          {t('auth.createAccountBtn')}
        </AppButton>
      </form>

      <p className="mt-6 text-center text-sm text-content-muted">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link
          to="/login"
          className="font-semibold text-accent transition-colors hover:text-accent-hover"
        >
          {t('auth.signInLink')}
        </Link>
      </p>
    </AuthLayout>
  );
}
