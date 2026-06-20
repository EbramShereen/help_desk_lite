import type { User } from 'firebase/auth';
import type { DocData } from '../../../firebase/FirestoreHandler';
import type { Role } from '../../../../enums/auth/role';
import type { UserFeatures } from '../../../../enums/auth/feature_key';
import { DEFAULT_FEATURES } from '../../../../enums/auth/feature_key';
import type { CustomRole } from '../admin/custom_role_response';
import { ROLE_PERMISSIONS } from '../../../../enums/admin/role_permissions';
import type { PermissionGrant } from '../admin/permission_response';
import type { Permission } from '../../../../enums/admin/permission';

export interface EntityPermission {
  id: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string | null;
  role: Role;
  /**
   * Workspace this account belongs to (the owning admin's uid). Admins own their
   * own tree, so for them workspaceId === uid. Members carry the creating admin's
   * uid. The core datasource nests workspace data under `users/{workspaceId}/`.
   */
  workspaceId: string | null;
  /** Optional custom role overlay; its permissions are unioned with the base role's. */
  customRoleId: string | null;
  /**
   * Whether the account is activated. Admins are always active; a non-admin
   * becomes active when a custom role is assigned. Firestore rules gate data
   * access on this flag (see `isActive()` in firestore.rules).
   */
  active: boolean;
  /** UID of the admin who created this user profile. */
  createdBy: string | null;
  /** UID of the user who last added this user to a team. */
  teamAddedBy: string | null;
  /** Backward-compat alias: first entry of teamIds or null. */
  teamId: string | null;
  /** All teams this user belongs to (reverse index for Firestore querying). */
  teamIds: string[];
  /** Tickets where this user is an assignee. */
  assignedTicketIds: string[];
  /** Sprints where this user is an assigned member. */
  assignedSprintIds: string[];
  /** Page/feature visibility toggles. Admin bypasses all. */
  features: UserFeatures;
  /** Per-workflow-status CRUD permissions. */
  workflowPermissions: EntityPermission[];
  /** Per-team CRUD permissions. */
  teamPermissions: EntityPermission[];
  /** Per-epic CRUD permissions. */
  epicPermissions: EntityPermission[];
  /** Per-label CRUD permissions. */
  labelPermissions: EntityPermission[];
  /** Per-sprint CRUD permissions. */
  sprintPermissions: EntityPermission[];
}

export function isUserActive(role: Role, active: boolean): boolean {
  return role === 'admin' || active;
}

function parseEntityPermissions(raw: unknown): EntityPermission[] {
  if (!Array.isArray(raw)) return [];
  return (raw as unknown[]).filter(
    (item): item is EntityPermission =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as EntityPermission).id === 'string',
  );
}

export function mapFirebaseUser(
  user: User,
  role: Role,
  teamId?: string | null,
  createdBy?: string | null,
): AuthUser {
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName,
    role,
    workspaceId: role === 'admin' ? user.uid : null,
    customRoleId: null,
    active: role === 'admin',
    createdBy: createdBy ?? null,
    teamAddedBy: null,
    teamId: teamId ?? null,
    teamIds: teamId ? [teamId] : [],
    assignedTicketIds: [],
    assignedSprintIds: [],
    features: { ...DEFAULT_FEATURES },
    workflowPermissions: [],
    teamPermissions: [],
    epicPermissions: [],
    labelPermissions: [],
    sprintPermissions: [],
  };
}

export function authUserFromDoc(doc: DocData): AuthUser {
  const role = (doc.role as Role) ?? 'pending';

  const teamIds: string[] = Array.isArray(doc.teamIds)
    ? (doc.teamIds as string[])
    : doc.teamId
      ? [String(doc.teamId)]
      : [];

  const storedFeatures =
    doc.features && typeof doc.features === 'object' ? (doc.features as Partial<UserFeatures>) : {};

  return {
    uid: doc.id,
    email: String(doc.email ?? ''),
    displayName: doc.displayName ? String(doc.displayName) : null,
    role,
    workspaceId: doc.workspaceId ? String(doc.workspaceId) : role === 'admin' ? doc.id : null,
    customRoleId: doc.customRoleId ? String(doc.customRoleId) : null,
    active: isUserActive(role, Boolean(doc.active)),
    createdBy: doc.createdBy ? String(doc.createdBy) : null,
    teamAddedBy: doc.teamAddedBy ? String(doc.teamAddedBy) : null,
    teamId: teamIds[0] ?? null,
    teamIds,
    assignedTicketIds: Array.isArray(doc.assignedTicketIds)
      ? (doc.assignedTicketIds as string[])
      : [],
    assignedSprintIds: Array.isArray(doc.assignedSprintIds)
      ? (doc.assignedSprintIds as string[])
      : [],
    features: { ...DEFAULT_FEATURES, ...storedFeatures },
    workflowPermissions: parseEntityPermissions(doc.workflowPermissions),
    teamPermissions: parseEntityPermissions(doc.teamPermissions),
    epicPermissions: parseEntityPermissions(doc.epicPermissions),
    labelPermissions: parseEntityPermissions(doc.labelPermissions),
    sprintPermissions: parseEntityPermissions(doc.sprintPermissions),
  };
}

export function resolvePermissions(
  user: AuthUser,
  customRole?: CustomRole | null,
): PermissionGrant[] {
  const base = ROLE_PERMISSIONS[user.role] ?? [];
  const overlay = customRole?.permissions ?? [];
  // Merge: overlay grants override base grants for the same key
  const map = new Map<Permission, PermissionGrant>();
  for (const g of base) map.set(g.key, g);
  for (const g of overlay) map.set(g.key, g);
  return Array.from(map.values());
}
