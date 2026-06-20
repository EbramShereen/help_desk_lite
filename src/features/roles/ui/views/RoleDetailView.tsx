import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppCard, AppButton, AppTextField } from '../../../../core/widgets';
import { useRoleController } from '../../logic/useRoleController';
import { usePermissionController } from '../../../permissions/logic/usePermissionController';
import { useWorkflowController } from '../../../workflow/logic/useWorkflowController';
import { useLabelController } from '../../../labels/logic/useLabelController';
import { useTeamController } from '../../../teams/logic/useTeamController';
import { useAdminUsersController } from '../../../auth/logic/useAdminUsersController';
import { useEpicController } from '../../../epics/logic/useEpicController';
import type { Permission } from '../../../../core/enums/admin/permission';
import type { PermissionGrant } from '../../../../core/data/models/response/admin/permission_response';
import { PermissionCategoryAccordion } from '../widgets/PermissionCategoryAccordion';
import type { ScopeOptions } from '../widgets/PermissionCategoryAccordion';

export default function RoleDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { customRoles, rolesQuery, updateRole, deleteRole } = useRoleController();
  const { permissionCategories, permissionCatalogueQuery } = usePermissionController();
  const { statuses } = useWorkflowController();
  const { labels } = useLabelController();

  const { teamsQuery } = useTeamController();
  const { users } = useAdminUsersController();
  const { epicsQuery } = useEpicController();

  const role = customRoles.find((r) => r.id === id);

  const [name, setName] = useState('');
  const [grants, setGrants] = useState<PermissionGrant[]>([]);
  const [seededId, setSeededId] = useState<string | null>(null);

  // Seed the form from the loaded role during render (re-seeds if the id
  // changes). Adjusting state during render is the React-recommended pattern
  // here — it avoids the cascading renders that a setState-in-effect causes.
  if (role && seededId !== role.id) {
    setName(role.name);
    setGrants(role.permissions);
    setSeededId(role.id);
  }

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

  const handleSave = () => {
    if (!id || name.trim().length < 2 || grants.length === 0) return;
    updateRole.mutate(
      { id, patch: { name: name.trim(), permissions: grants } },
      { onSuccess: () => navigate('/admin/roles') },
    );
  };

  const handleDelete = () => {
    if (!id) return;
    deleteRole.mutate(id, { onSuccess: () => navigate('/admin/roles') });
  };

  if (rolesQuery.isLoading || permissionCatalogueQuery.isLoading) {
    return <p className="p-6 text-content-muted">{t('common.loading')}</p>;
  }

  if (!role) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <p className="text-danger">Role not found.</p>
        <AppButton variant="secondary" onClick={() => navigate('/admin/roles')}>
          Back to roles
        </AppButton>
      </div>
    );
  }

  const isDirty =
    name.trim() !== role.name || JSON.stringify(grants) !== JSON.stringify(role.permissions);

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/roles')}
          className="text-content-muted transition-colors hover:text-content"
          aria-label="Back to roles"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <h1 className="text-xl font-bold tracking-tight text-content">{role.name}</h1>
      </div>

      <AppCard className="flex flex-col gap-4 p-5">
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
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <AppButton variant="danger" onClick={handleDelete} isLoading={deleteRole.isPending}>
            {t('common.delete')}
          </AppButton>
          <div className="flex gap-2">
            <AppButton variant="secondary" onClick={() => navigate('/admin/roles')}>
              {t('common.cancel')}
            </AppButton>
            <AppButton
              onClick={handleSave}
              isLoading={updateRole.isPending}
              disabled={!isDirty || name.trim().length < 2 || grants.length === 0}
            >
              {t('common.save')}
            </AppButton>
          </div>
        </div>
      </AppCard>
    </div>
  );
}
