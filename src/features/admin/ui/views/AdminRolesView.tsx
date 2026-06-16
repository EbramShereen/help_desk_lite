import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppCard, AppButton, AppTextField, EmptyState } from '../../../../core/widgets';
import { useAdminConfigController } from '../../logic/useAdminConfigController';
import { useTeamController } from '../../../teams/logic/useTeamController';
import { useAdminUsersController } from '../../../auth/logic/useAdminUsersController';
import { useEpicController } from '../../../epics/logic/useEpicController';
import { type Permission, type PermissionGrant } from '../../models/Permission';
import { PermissionCategoryAccordion } from '../widgets/PermissionCategoryAccordion';
import type { ScopeOptions } from '../widgets/PermissionCategoryAccordion';
import { cn } from '../../../../lib/cn';

export default function AdminRolesView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    customRoles,
    rolesQuery,
    permissionCategories,
    permissionCatalogueQuery,
    statuses,
    labels,
    createRole,
    deleteRole,
  } = useAdminConfigController();

  const { teamsQuery } = useTeamController();
  const { users } = useAdminUsersController();
  const { epicsQuery } = useEpicController();

  const [name, setName] = useState('');
  const [grants, setGrants] = useState<PermissionGrant[]>([]);

  const toggle = (key: Permission) =>
    setGrants((cur) =>
      cur.find((g) => g.key === key)
        ? cur.filter((g) => g.key !== key)
        : [...cur, { key, scopeIds: [] }],
    );

  const setScopeIds = (key: Permission, scopeIds: string[]) =>
    setGrants((cur) => cur.map((g) => (g.key === key ? { ...g, scopeIds } : g)));

  const scopeOptions = useMemo<ScopeOptions>(
    () => ({
      team: (teamsQuery.data ?? []).map((tm) => ({ value: tm.id, label: tm.label })),
      user: users.map((u) => ({ value: u.uid, label: u.displayName ?? u.email })),
      epic: (epicsQuery.data ?? []).map((e) => ({ value: e.id, label: e.title })),
      label: labels.map((l) => ({ value: l.id, label: l.name })),
      workflow: statuses.map((s) => ({ value: s.id, label: s.name })),
      role: customRoles.map((r) => ({ value: r.id, label: r.name })),
    }),
    [teamsQuery.data, users, epicsQuery.data, labels, statuses, customRoles],
  );

  const submit = () => {
    if (name.trim().length < 2 || grants.length === 0) return;
    createRole.mutate(
      { name: name.trim(), permissions: grants },
      {
        onSuccess: () => {
          setName('');
          setGrants([]);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-bold tracking-tight text-content">{t('admin.roles')}</h1>

      <AppCard className="flex flex-col gap-4 p-5">
        <p className="text-sm font-semibold text-content">{t('common.create')}</p>
        <AppTextField
          label={t('form.roleName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. QA Reviewer"
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-label text-content-muted">
              {t('admin.permissions')}
            </p>
            {grants.length > 0 && (
              <span className="text-xs font-medium text-primary">{grants.length} selected</span>
            )}
          </div>

          {permissionCatalogueQuery.isLoading ? (
            <p className="text-sm text-content-muted">{t('common.loading')}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {permissionCategories.map((cat, i) => (
                <PermissionCategoryAccordion
                  key={cat.id}
                  category={cat}
                  grants={grants}
                  scopeOptions={scopeOptions}
                  onToggle={toggle}
                  onScopeChange={setScopeIds}
                  defaultOpen={i === 0}
                />
              ))}
            </div>
          )}
        </div>

        <AppButton
          onClick={submit}
          isLoading={createRole.isPending}
          disabled={name.trim().length < 2 || grants.length === 0}
        >
          {t('common.create')}
        </AppButton>
      </AppCard>

      {rolesQuery.isLoading ? (
        <p className="text-content-muted">{t('common.loading')}</p>
      ) : customRoles.length === 0 ? (
        <EmptyState title={t('common.noResults')} />
      ) : (
        <div className="flex flex-col gap-2">
          {customRoles.map((role) => (
            <AppCard
              key={role.id}
              className="flex cursor-pointer items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-muted"
              onClick={() => navigate(`/admin/roles/${role.id}`)}
            >
              <div className="min-w-0">
                <p className="font-semibold text-content">{role.name}</p>
                <p className={cn('text-xs text-content-muted')}>
                  {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <AppButton
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRole.mutate(role.id);
                  }}
                >
                  {t('common.delete')}
                </AppButton>
                <svg className="h-4 w-4 text-content-muted" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </AppCard>
          ))}
        </div>
      )}
    </div>
  );
}
