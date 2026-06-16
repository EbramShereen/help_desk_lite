import { AppBadge, type AppBadgeProps } from '../../../../core/widgets';
import { type Role, roleLabel } from '../../models/Role';

const roleTone: Record<Role, AppBadgeProps['tone']> = {
  pending: 'warning',
  admin: 'accent',
};

interface RoleBadgeProps {
  role: Role;
  customRoleLabel?: string;
  className?: string;
}

export function RoleBadge({ role, customRoleLabel, className }: RoleBadgeProps) {
  if (customRoleLabel) {
    return (
      <AppBadge tone="neutral" className={className}>
        {customRoleLabel}
      </AppBadge>
    );
  }
  return (
    <AppBadge tone={roleTone[role]} className={className}>
      {roleLabel(role)}
    </AppBadge>
  );
}
