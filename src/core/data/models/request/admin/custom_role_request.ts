import { z } from 'zod';
import { PERMISSIONS } from '../../../../enums/admin/permission';
import { permissionScopesMap } from '../../response/admin/custom_role_response';

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
