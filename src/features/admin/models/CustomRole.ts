import { z } from 'zod';
import type { DocData } from '../../../core/firebase/FirestoreHandler';
import { PERMISSIONS, parsePermissionGrants, type PermissionGrant } from './Permission';

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

const permissionGrantSchema = z.object({
  key: z.enum(PERMISSIONS),
  scopeIds: z.array(z.string()).default([]),
});

export const customRoleInputSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  permissions: z.array(permissionGrantSchema).min(1, 'Select at least one permission'),
});
export type CustomRoleInput = z.infer<typeof customRoleInputSchema>;

export const customRoleUpdateSchema = customRoleInputSchema.partial();
export type CustomRoleUpdate = z.infer<typeof customRoleUpdateSchema>;

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

export function customRoleToDoc(
  input: CustomRoleInput,
  createdBy: string,
): Record<string, unknown> {
  return {
    name: input.name,
    permissions: input.permissions,
    permissionScopes: permissionScopesMap(input.permissions),
    createdBy,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
