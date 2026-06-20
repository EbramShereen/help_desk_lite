import type { Role } from '../../../../enums/auth/role';

const roleLabels: Record<Role, string> = {
  pending: 'Pending',
  admin: 'Admin',
};

export function roleLabel(role: Role): string {
  return roleLabels[role] ?? role;
}
