import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppButton, AppDropdown } from '../../../../core/widgets';
import { ROLES, type Role } from '../../../../core/enums/auth/role';
import { roleLabel } from '../../../../core/data/models/response/auth/role_response';
import type { CustomRole } from '../../../../core/data/models/response/admin/custom_role_response';

interface RoleAssignmentModalProps {
  userName: string;
  currentRole: string;
  customRoles?: CustomRole[];
  onConfirm: (role: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function buildRoleOptions(customRoles: CustomRole[] = []) {
  const builtIn = Object.values(ROLES).map((r) => ({ value: r, label: roleLabel(r as Role) }));
  const custom = customRoles.map((r) => ({ value: r.id, label: r.name }));
  return [...builtIn, ...custom];
}

export function RoleAssignmentModal({
  userName,
  currentRole,
  customRoles,
  onConfirm,
  onCancel,
  isLoading,
}: RoleAssignmentModalProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string>(currentRole);
  const roleOptions = buildRoleOptions(customRoles);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-card border border-surface-border bg-surface p-6 shadow-elevated">
        <h2 className="mb-2 text-lg font-bold tracking-tight text-content">
          {t('adminUsers.changeRole')}
        </h2>
        <p className="mb-5 text-sm text-content-muted">
          {t('adminUsers.assignRoleTo')}{' '}
          <span className="font-semibold text-content">{userName}</span>
        </p>
        <AppDropdown
          label={t('auth.role')}
          options={roleOptions}
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        />
        <div className="mt-6 flex justify-end gap-3">
          <AppButton variant="ghost" onClick={onCancel} disabled={isLoading}>
            {t('common.cancel')}
          </AppButton>
          <AppButton
            onClick={() => onConfirm(selected)}
            isLoading={isLoading}
            disabled={selected === currentRole}
          >
            {t('common.confirm')}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
