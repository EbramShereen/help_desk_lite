import type { Role } from '../auth/role';
import { ROLES } from '../auth/role';
import { PERMISSIONS, type Permission } from './permission';
import type { PermissionGrant } from '../../data/models/response/admin/permission_response';

function toGrants(keys: Permission[]): PermissionGrant[] {
  return keys.map((key) => ({ key, scopeIds: [] }));
}

/** Default permission grants per role (scopeIds empty = unrestricted). */
export const ROLE_PERMISSIONS: Record<Role, PermissionGrant[]> = {
  [ROLES.PENDING]: [],
  [ROLES.ADMIN]: toGrants([...PERMISSIONS]),
};
