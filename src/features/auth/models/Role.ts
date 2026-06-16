export const ROLES = {
  PENDING: 'pending',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

const roleLabels: Record<Role, string> = {
  pending: 'Pending',
  admin: 'Admin',
};

export function roleLabel(role: Role): string {
  return roleLabels[role] ?? role;
}
