import type { DocData } from '../../../firebase/FirestoreHandler';
import { parsePermissionGrants, type PermissionGrant } from './permission_response';

export interface CustomRole {
  id: string;
  name: string;
  permissions: PermissionGrant[];
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Flattens grants into a `{ permissionKey: scopeIds }` map. Stored on the role
 * doc as `permissionScopes` so Firestore rules can index a permission by key
 * (rules cannot filter the `permissions` array-of-objects by field). Kept in
 * sync with `permissions` on every write — see `customRoleToDoc` / the repo's
 * update path and `migrateRolePermissionScopes`.
 */
export function permissionScopesMap(grants: PermissionGrant[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const g of grants) map[g.key] = g.scopeIds;
  return map;
}

export function customRoleFromDoc(doc: DocData): CustomRole {
  return {
    id: doc.id,
    name: String(doc.name ?? ''),
    permissions: parsePermissionGrants(doc.permissions),
    createdBy: String(doc.createdBy ?? ''),
    createdAt: Number(doc.createdAt ?? 0),
    updatedAt: Number(doc.updatedAt ?? 0),
  };
}
