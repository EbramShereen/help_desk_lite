import type { Role } from '../../../../enums/auth/role';
import { DEFAULT_FEATURES } from '../../../../enums/auth/feature_key';

export function authUserToDoc(
  email: string,
  role: Role,
  displayName?: string,
  createdBy?: string | null,
  workspaceId?: string | null,
): Record<string, unknown> {
  return {
    email,
    role,
    displayName: displayName ?? null,
    workspaceId: workspaceId ?? null,
    customRoleId: null,
    active: role === 'admin',
    createdBy: createdBy ?? null,
    teamAddedBy: null,
    teamId: null,
    teamIds: [],
    assignedTicketIds: [],
    assignedSprintIds: [],
    features: { ...DEFAULT_FEATURES },
    workflowPermissions: [],
    teamPermissions: [],
    epicPermissions: [],
    labelPermissions: [],
    sprintPermissions: [],
    createdAt: Date.now(),
  };
}
