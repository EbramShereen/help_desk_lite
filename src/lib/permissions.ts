import type {
  AuthUser,
  EntityPermission,
} from '../core/data/models/response/auth/auth_user_response';
import type { EntityPermissionType } from '../core/enums/auth/entity_permission_type';
import type { FeatureKey } from '../core/enums/auth/feature_key';

/** Returns true if the user can access the given page/feature. Admin bypasses all checks. */
export function canAccessFeature(user: AuthUser, feature: FeatureKey): boolean {
  if (user.role === 'admin') return true;
  return user.features[feature] ?? false;
}

/** Returns the entity-level CRUD permission for the given entity, or null if none. Admin gets full access. */
export function getEntityPermission(
  user: AuthUser,
  type: EntityPermissionType,
  entityId: string,
): EntityPermission | null {
  if (user.role === 'admin') {
    return { id: entityId, canView: true, canEdit: true, canDelete: true };
  }
  return (user[type] as EntityPermission[]).find((p) => p.id === entityId) ?? null;
}
