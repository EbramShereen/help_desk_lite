import type {
  AuthUser,
  EntityPermission,
  EntityPermissionType,
  FeatureKey,
} from '../features/auth/models/AuthUser';

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
