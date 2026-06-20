import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppButton, AppTextField, AppCard } from '../../../../core/widgets';
import { ConfirmDialog } from '../../../../core/widgets/ConfirmDialog';
import { useAdminUsersController } from '../../logic/useAdminUsersController';
import { useAuthController } from '../../logic/useAuthController';
import { useRoleController } from '../../../roles/logic/useRoleController';
import { RoleBadge } from '../widgets/RoleBadge';
import { RoleAssignmentModal } from '../widgets/RoleAssignmentModal';
import {
  createUserSchema,
  type CreateUserInput,
} from '../../../../core/data/models/request/auth/auth_request';
import type { AuthUser } from '../../../../core/data/models/response/auth/auth_user_response';
import { ROLES, type Role } from '../../../../core/enums/auth/role';

export default function AdminUsersView() {
  const { t } = useTranslation();
  const { users, isLoading, createUser, setUserRole, setUserCustomRole, deleteUser } =
    useAdminUsersController();
  const { customRoles, migrateRoleScopes } = useRoleController();
  const { logout } = useAuthController();
  const navigate = useNavigate();
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AuthUser | null>(null);

  // One-shot backfill of the rules-facing `permissionScopes` map onto legacy role
  // docs. Runs here because this view is admin-only (role writes need admin).
  const migrated = useRef(false);
  useEffect(() => {
    if (migrated.current) return;
    migrated.current = true;
    migrateRoleScopes.mutate();
  }, [migrateRoleScopes]);

  const handleSignOut = () => {
    logout.mutate(undefined, { onSuccess: () => navigate('/login') });
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'pending' },
  });

  const onCreateUser = (data: CreateUserInput) => {
    createUser.mutate(data, { onSuccess: () => reset() });
  };

  if (isLoading) {
    return <p className="p-8 text-center text-content-muted">{t('adminUsers.loading')}</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-label text-accent-hover">
            {t('adminUsers.administration')}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-content">
            {t('adminUsers.title')}
          </h1>
          <p className="mt-2 text-sm text-content-muted">{t('adminUsers.subtitle')}</p>
        </div>
        <AppButton variant="ghost" size="sm" isLoading={logout.isPending} onClick={handleSignOut}>
          {t('common.signOut')}
        </AppButton>
      </div>

      <AppCard className="mb-8">
        <h2 className="mb-5 text-lg font-bold tracking-tight text-content">
          {t('adminUsers.createUser')}
        </h2>
        <form
          onSubmit={handleSubmit(onCreateUser)}
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
        >
          <AppTextField
            label={t('auth.email')}
            type="email"
            placeholder="user@company.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <AppTextField
            label={t('auth.password')}
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <AppButton type="submit" isLoading={createUser.isPending}>
            {t('common.create')}
          </AppButton>
        </form>
        {createUser.error && (
          <p className="text-status-red mt-3 text-sm">
            {createUser.error instanceof Error ? createUser.error.message : t('auth.genericError')}
          </p>
        )}
      </AppCard>

      <AppCard>
        <h2 className="mb-5 text-lg font-bold tracking-tight text-content">{t('nav.users')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="pb-3 text-xs font-semibold uppercase tracking-label text-content-subtle">
                  {t('auth.email')}
                </th>
                <th className="pb-3 text-xs font-semibold uppercase tracking-label text-content-subtle">
                  {t('auth.role')}
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase tracking-label text-content-subtle">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.uid}
                  className="border-b border-surface-border transition-colors last:border-0 hover:bg-surface-muted"
                >
                  <td className="py-4 font-medium text-content">{u.email}</td>
                  <td className="py-4">
                    <RoleBadge
                      role={u.role}
                      customRoleLabel={
                        u.customRoleId
                          ? (customRoles.find((r) => r.id === u.customRoleId)?.name ??
                            u.customRoleId)
                          : undefined
                      }
                    />
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <AppButton variant="ghost" size="sm" onClick={() => setEditingUser(u)}>
                        {t('adminUsers.changeRole')}
                      </AppButton>
                      <AppButton variant="danger" size="sm" onClick={() => setDeletingUser(u)}>
                        {t('common.delete')}
                      </AppButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="py-6 text-center text-content-muted">{t('common.noResults')}</p>
          )}
        </div>
      </AppCard>

      {editingUser && (
        <RoleAssignmentModal
          userName={editingUser.email}
          currentRole={editingUser.customRoleId ?? editingUser.role}
          customRoles={customRoles}
          isLoading={setUserRole.isPending || setUserCustomRole.isPending}
          onCancel={() => setEditingUser(null)}
          onConfirm={(selected) => {
            const isBuiltIn = Object.values(ROLES).includes(selected as Role);
            if (isBuiltIn) {
              setUserRole.mutate(
                { uid: editingUser.uid, role: selected as Role },
                { onSuccess: () => setEditingUser(null) },
              );
            } else {
              setUserCustomRole.mutate(
                { uid: editingUser.uid, customRoleId: selected },
                { onSuccess: () => setEditingUser(null) },
              );
            }
          }}
        />
      )}

      <ConfirmDialog
        open={!!deletingUser}
        title={t('adminUsers.deleteUser')}
        message={`${t('adminUsers.deleteUserMessage')} (${deletingUser?.email})`}
        confirmLabel={t('common.delete')}
        onCancel={() => setDeletingUser(null)}
        onConfirm={() => {
          if (deletingUser) {
            deleteUser.mutate(deletingUser.uid, { onSuccess: () => setDeletingUser(null) });
          }
        }}
      />
    </div>
  );
}
