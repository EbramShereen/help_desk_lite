import type { DocData } from '../../../firebase/FirestoreHandler';
import { isPermission } from './permission_response';
import type { Permission } from '../../../../enums/admin/permission';

export interface PermissionItem {
  key: Permission;
  label: string;
}

export interface PermissionCategory {
  id: string;
  label: string;
  order: number;
  permissions: PermissionItem[];
}

export function permissionCategoryFromDoc(doc: DocData): PermissionCategory {
  return {
    id: String(doc.id),
    label: String(doc.label ?? ''),
    order: Number(doc.order ?? 0),
    permissions: Array.isArray(doc.permissions)
      ? (doc.permissions as Array<Record<string, string>>)
          .filter((p) => isPermission(p.key))
          .map((p) => ({ key: p.key as Permission, label: String(p.label ?? '') }))
      : [],
  };
}

export function permissionCategoryToDoc(
  cat: Omit<PermissionCategory, 'id'>,
): Record<string, unknown> {
  return { label: cat.label, order: cat.order, permissions: cat.permissions };
}
