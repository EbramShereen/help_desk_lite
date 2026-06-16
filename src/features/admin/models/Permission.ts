import type { Role } from '../../auth/models/Role';
import { ROLES } from '../../auth/models/Role';

export const PERMISSIONS = [
  // User & Role Management
  'can_invite_user',
  'can_remove_user',
  'can_assign_role',
  'can_remove_role',
  'can_set_custom_role_limits', // custom: role
  // Workflow Management
  'can_create_workflow',
  'can_edit_workflow',
  'can_remove_workflow',
  // Tickets — System-wide
  'can_view_all_tickets',
  'can_edit_all_tickets',
  'can_delete_all_tickets',
  // Tickets — Custom scope
  'can_view_custom_team_tickets', // custom: team
  'can_edit_custom_team_tickets', // custom: team
  'can_delete_custom_team_tickets', // custom: team
  'can_view_custom_epic_tickets', // custom: epic
  'can_edit_custom_epic_tickets', // custom: epic
  'can_delete_custom_epic_tickets', // custom: epic
  'can_view_custom_label_tickets', // custom: label
  'can_edit_custom_label_tickets', // custom: label
  'can_delete_custom_label_tickets', // custom: label
  'can_view_custom_workflow_tickets', // custom: workflow
  'can_edit_custom_workflow_tickets', // custom: workflow
  'can_delete_custom_workflow_tickets', // custom: workflow
  'can_view_custom_user_tickets', // custom: user
  'can_edit_custom_user_tickets', // custom: user
  'can_delete_custom_user_tickets', // custom: user
  // Ticket Actions
  'can_create_ticket',
  'can_move_ticket',
  // Subtasks — System-wide
  'can_add_subtask',
  'can_assign_subtask',
  // Subtasks — Custom Team
  'can_add_custom_team_subtask', // custom: team
  'can_assign_custom_team_subtask', // custom: team
  // Subtasks — Custom Label
  'can_add_custom_label_subtask', // custom: label
  'can_assign_custom_label_subtask', // custom: label
  // User-scoped views
  'can_view_own_tickets',
  'can_view_own_subtasks',
  // Tickets — Assigned to Me
  'can_view_assigned_ticket',
  'can_change_assigned_ticket_workflow',
  'can_change_assigned_subtask_workflow',
  'can_comment_assigned_ticket',
  'can_reply_assigned_ticket_comment',
  'can_change_assigned_ticket_epic',
  'can_change_assigned_ticket_label',
  'can_change_assigned_subtask_label',
  'can_react_assigned_ticket',
  'can_clear_own_reaction',
  'can_block_reaction_custom_role', // custom: role
  'can_allow_reaction_custom_role', // custom: role
  // Comments & Reactions
  'can_comment',
  'can_view_all_comments',
  'can_delete_all_comments',
  'can_view_custom_team_comments', // custom: team
  'can_delete_custom_team_comments', // custom: team
  'can_give_reaction',
  'can_remove_custom_role_reaction', // custom: role
  // Board & Backlog
  'can_view_board',
  'can_view_board_all_teams',
  'can_view_board_custom_teams', // custom: team
  'can_view_backlog',
  // Sprints — System-wide
  'can_create_sprint',
  'can_edit_sprint',
  'can_delete_sprint',
  'can_add_tickets_to_sprint',
  'can_remove_tickets_from_sprint',
  // Sprints — Custom Team
  'can_create_custom_team_sprint', // custom: team
  'can_edit_custom_team_sprint', // custom: team
  'can_delete_custom_team_sprint', // custom: team
  // Epics
  'can_create_epic',
  'can_edit_epic',
  'can_remove_epic',
  'can_assign_teams_to_epic',
  'can_assign_custom_teams_to_epic', // custom: team
  'can_add_all_tickets_to_epic',
  'can_add_custom_team_tickets_to_epic', // custom: team
  'can_remove_all_tickets_from_epic',
  'can_remove_custom_team_tickets_from_epic', // custom: team
  // Timeline
  'can_view_timeline',
  // Settings & Admin
  'can_view_summary',
  'can_manage_statuses',
  'can_manage_labels',
  'can_manage_teams',
  'can_edit_roles',
  // Own Team Management
  'can_view_own_team_summary',
  'can_view_own_team_tickets',
  'can_edit_own_team_tickets',
  'can_delete_own_team_tickets',
  'can_view_own_team_board',
  'can_view_own_team_timeline',
  'can_create_own_team_sprint',
  'can_edit_own_team_sprint',
  'can_delete_own_team_sprint',
  'can_manage_own_team_members',
  // Own Team Tickets — All Actions
  'can_create_own_team_ticket',
  'can_move_own_team_ticket',
  'can_assign_own_team_ticket',
  'can_change_own_team_ticket_workflow',
  'can_change_own_team_ticket_epic',
  'can_change_own_team_ticket_label',
  'can_change_own_team_ticket_priority',
  'can_change_own_team_ticket_due_date',
  'can_comment_own_team_ticket',
  'can_reply_own_team_ticket_comment',
  'can_delete_own_team_comment',
  'can_react_own_team_ticket',
  'can_remove_own_team_reaction',
  'can_view_own_team_backlog',
  'can_add_own_team_ticket_to_sprint',
  'can_remove_own_team_ticket_from_sprint',
  'can_add_own_team_ticket_to_epic',
  'can_remove_own_team_ticket_from_epic',
  'can_add_own_team_subtask',
  'can_assign_own_team_subtask',
  'can_change_own_team_subtask_workflow',
  'can_change_own_team_subtask_label',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

// ─── Scope detection (derived from key name — no local map needed) ─────────────

export type ScopeType = 'team' | 'user' | 'epic' | 'label' | 'workflow' | 'role';

const SCOPE_ORDER: ScopeType[] = ['team', 'user', 'epic', 'label', 'workflow', 'role'];

/**
 * Returns the scope type for a permission by scanning its key for "custom" +
 * a known scope word. Returns null for global (non-scoped) permissions.
 * No local map — works automatically for any key containing "custom".
 */
export function getScopeType(key: Permission): ScopeType | null {
  if (!key.includes('custom')) return null;
  return SCOPE_ORDER.find((s) => key.includes(s)) ?? null;
}

// ─── Permission grant ─────────────────────────────────────────────────────────

/** A single permission grant: the permission key + which specific entity IDs it covers. */
export interface PermissionGrant {
  key: Permission;
  /** Empty array = unrestricted (applies to all entities of that scope type). */
  scopeIds: string[];
}

// ─── Role defaults ────────────────────────────────────────────────────────────

function toGrants(keys: Permission[]): PermissionGrant[] {
  return keys.map((key) => ({ key, scopeIds: [] }));
}

/** Default permission grants per role (scopeIds empty = unrestricted). */
export const ROLE_PERMISSIONS: Record<Role, PermissionGrant[]> = {
  [ROLES.PENDING]: [],
  [ROLES.ADMIN]: toGrants([...PERMISSIONS]),
};

// ─── Guards ───────────────────────────────────────────────────────────────────

export function isPermission(value: unknown): value is Permission {
  return typeof value === 'string' && (PERMISSIONS as readonly string[]).includes(value);
}

export function parsePermissionGrants(raw: unknown): PermissionGrant[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .filter((item) => isPermission(item.key))
    .map((item) => ({
      key: item.key as Permission,
      scopeIds: Array.isArray(item.scopeIds) ? item.scopeIds.map(String) : [],
    }));
}

// ─── Display labels ───────────────────────────────────────────────────────────

export const PERMISSION_LABELS: Record<Permission, string> = {
  // User & Role Management
  can_invite_user: 'Invite user (by email)',
  can_remove_user: 'Remove user',
  can_assign_role: 'Assign role to user',
  can_remove_role: 'Remove role from user',
  can_set_custom_role_limits: 'Set role assignment limits (custom roles)',
  // Workflow Management
  can_create_workflow: 'Create workflow',
  can_edit_workflow: 'Edit workflow',
  can_remove_workflow: 'Remove workflow',
  // Tickets — System-wide
  can_create_ticket: 'Create ticket',
  can_view_all_tickets: 'View all system tickets',
  can_edit_all_tickets: 'Edit all system tickets',
  can_delete_all_tickets: 'Delete all system tickets',
  can_move_ticket: 'Move ticket (board / backlog)',
  // Tickets — Custom Team
  can_view_custom_team_tickets: 'View tickets (custom teams)',
  can_edit_custom_team_tickets: 'Edit tickets (custom teams)',
  can_delete_custom_team_tickets: 'Delete tickets (custom teams)',
  // Tickets — Custom Epic
  can_view_custom_epic_tickets: 'View tickets (custom epics)',
  can_edit_custom_epic_tickets: 'Edit tickets (custom epics)',
  can_delete_custom_epic_tickets: 'Delete tickets (custom epics)',
  // Tickets — Custom Label
  can_view_custom_label_tickets: 'View tickets (custom labels)',
  can_edit_custom_label_tickets: 'Edit tickets (custom labels)',
  can_delete_custom_label_tickets: 'Delete tickets (custom labels)',
  // Tickets — Custom Workflow
  can_view_custom_workflow_tickets: 'View tickets (custom workflows)',
  can_edit_custom_workflow_tickets: 'Edit tickets (custom workflows)',
  can_delete_custom_workflow_tickets: 'Delete tickets (custom workflows)',
  // Tickets — Custom User
  can_view_custom_user_tickets: 'View tickets (custom users)',
  can_edit_custom_user_tickets: 'Edit tickets (custom users)',
  can_delete_custom_user_tickets: 'Delete tickets (custom users)',
  // Tickets — My Tasks
  can_view_own_tickets: 'View own tickets only',
  can_view_own_subtasks: 'View own subtasks only',
  // Tickets — Assigned to Me
  can_view_assigned_ticket: 'View assigned ticket',
  can_change_assigned_ticket_workflow: 'Change workflow of assigned ticket',
  can_change_assigned_subtask_workflow: 'Change workflow of assigned subtask',
  can_comment_assigned_ticket: 'Comment on assigned ticket',
  can_reply_assigned_ticket_comment: 'Reply to comments on assigned ticket',
  can_change_assigned_ticket_epic: 'Change / delete epic of assigned ticket',
  can_change_assigned_ticket_label: 'Change / delete label of assigned ticket',
  can_change_assigned_subtask_label: 'Change / delete label of assigned subtask',
  can_react_assigned_ticket: 'Put reaction on assigned ticket',
  can_clear_own_reaction: 'Clear own reaction',
  can_block_reaction_custom_role: 'Block reactions for custom roles',
  can_allow_reaction_custom_role: 'Allow reactions for custom roles only',
  // Comments & Reactions
  can_comment: 'Comment on tickets',
  can_view_all_comments: 'View all comments',
  can_delete_all_comments: 'Delete any comment',
  can_view_custom_team_comments: 'View comments (custom teams)',
  can_delete_custom_team_comments: 'Delete comments (custom teams)',
  can_give_reaction: 'Give reaction',
  can_remove_custom_role_reaction: 'Remove reactions (custom roles)',
  // Board & Backlog
  can_view_board: 'View board',
  can_view_board_all_teams: 'View board (all teams)',
  can_view_board_custom_teams: 'View board (custom teams)',
  can_view_backlog: 'View backlog',
  // Sprints — System-wide
  can_create_sprint: 'Create sprint (any team)',
  can_edit_sprint: 'Edit sprint (any team)',
  can_delete_sprint: 'Delete sprint (any team)',
  can_add_tickets_to_sprint: 'Add tickets to sprint',
  can_remove_tickets_from_sprint: 'Remove tickets from sprint',
  // Sprints — Custom Team
  can_create_custom_team_sprint: 'Create sprint (custom teams)',
  can_edit_custom_team_sprint: 'Edit sprint (custom teams)',
  can_delete_custom_team_sprint: 'Delete sprint (custom teams)',
  // Epics
  can_create_epic: 'Create epic',
  can_edit_epic: 'Edit epic',
  can_remove_epic: 'Remove epic',
  can_assign_teams_to_epic: 'Assign teams to epic (all)',
  can_assign_custom_teams_to_epic: 'Assign teams to epic (custom teams)',
  can_add_all_tickets_to_epic: 'Add any ticket to epic',
  can_add_custom_team_tickets_to_epic: 'Add tickets to epic (custom teams)',
  can_remove_all_tickets_from_epic: 'Remove any ticket from epic',
  can_remove_custom_team_tickets_from_epic: 'Remove tickets from epic (custom teams)',
  // Timeline
  can_view_timeline: 'View timeline',
  // Subtasks — System-wide
  can_add_subtask: 'Add subtask to any ticket',
  can_assign_subtask: 'Assign subtask to any user',
  // Subtasks — Custom Team
  can_add_custom_team_subtask: 'Add subtask (custom teams)',
  can_assign_custom_team_subtask: 'Assign subtask (custom teams)',
  // Subtasks — Custom Label
  can_add_custom_label_subtask: 'Add subtask (custom labels)',
  can_assign_custom_label_subtask: 'Assign subtask (custom labels)',
  // Own Team Tickets — All Actions
  can_create_own_team_ticket: 'Create ticket in own team',
  can_view_own_team_tickets: 'View own team tickets',
  can_edit_own_team_tickets: 'Edit own team tickets',
  can_delete_own_team_tickets: 'Delete own team tickets',
  can_move_own_team_ticket: 'Move own team ticket (board / backlog)',
  can_assign_own_team_ticket: 'Assign own team ticket to a user',
  can_change_own_team_ticket_workflow: 'Change workflow / status of own team ticket',
  can_change_own_team_ticket_epic: 'Change / remove epic of own team ticket',
  can_change_own_team_ticket_label: 'Change / remove label of own team ticket',
  can_change_own_team_ticket_priority: 'Change priority of own team ticket',
  can_change_own_team_ticket_due_date: 'Change due date of own team ticket',
  can_comment_own_team_ticket: 'Comment on own team ticket',
  can_reply_own_team_ticket_comment: 'Reply to comments on own team ticket',
  can_delete_own_team_comment: 'Delete comment on own team ticket',
  can_react_own_team_ticket: 'React to own team ticket',
  can_remove_own_team_reaction: 'Remove reaction on own team ticket',
  can_view_own_team_board: 'View own team board',
  can_view_own_team_backlog: 'View own team backlog',
  can_view_own_team_timeline: 'View own team timeline',
  can_add_own_team_ticket_to_sprint: 'Add own team ticket to sprint',
  can_remove_own_team_ticket_from_sprint: 'Remove own team ticket from sprint',
  can_add_own_team_ticket_to_epic: 'Add own team ticket to epic',
  can_remove_own_team_ticket_from_epic: 'Remove own team ticket from epic',
  can_add_own_team_subtask: 'Add subtask to own team ticket',
  can_assign_own_team_subtask: 'Assign subtask on own team ticket',
  can_change_own_team_subtask_workflow: 'Change subtask workflow on own team ticket',
  can_change_own_team_subtask_label: 'Change subtask label on own team ticket',
  // Own Team Management
  can_view_own_team_summary: 'View own team summary',
  can_create_own_team_sprint: 'Create sprint for own team',
  can_edit_own_team_sprint: 'Edit sprint for own team',
  can_delete_own_team_sprint: 'Delete sprint for own team',
  can_manage_own_team_members: 'Manage own team members',
  // Settings & Admin
  can_view_summary: 'View summary',
  can_manage_statuses: 'Manage statuses',
  can_manage_labels: 'Manage labels',
  can_manage_teams: 'Manage teams',
  can_edit_roles: 'Create / edit roles',
};

// ─── Permission categories ────────────────────────────────────────────────────

export interface PermissionCategory {
  id: string;
  label: string;
  permissions: Permission[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'user-role-management',
    label: 'User & Role Management',
    permissions: [
      'can_invite_user',
      'can_remove_user',
      'can_assign_role',
      'can_remove_role',
      'can_set_custom_role_limits',
    ],
  },
  {
    id: 'workflow-management',
    label: 'Workflow Management',
    permissions: ['can_create_workflow', 'can_edit_workflow', 'can_remove_workflow'],
  },
  {
    id: 'tickets-system',
    label: 'Tickets — System-wide',
    permissions: [
      'can_create_ticket',
      'can_view_all_tickets',
      'can_edit_all_tickets',
      'can_delete_all_tickets',
      'can_move_ticket',
    ],
  },
  {
    id: 'tickets-custom-team',
    label: 'Tickets — Custom Team',
    permissions: [
      'can_view_custom_team_tickets',
      'can_edit_custom_team_tickets',
      'can_delete_custom_team_tickets',
    ],
  },
  {
    id: 'tickets-custom-epic',
    label: 'Tickets — Custom Epic',
    permissions: [
      'can_view_custom_epic_tickets',
      'can_edit_custom_epic_tickets',
      'can_delete_custom_epic_tickets',
    ],
  },
  {
    id: 'tickets-custom-label',
    label: 'Tickets — Custom Label',
    permissions: [
      'can_view_custom_label_tickets',
      'can_edit_custom_label_tickets',
      'can_delete_custom_label_tickets',
    ],
  },
  {
    id: 'tickets-custom-workflow',
    label: 'Tickets — Custom Workflow',
    permissions: [
      'can_view_custom_workflow_tickets',
      'can_edit_custom_workflow_tickets',
      'can_delete_custom_workflow_tickets',
    ],
  },
  {
    id: 'tickets-custom-user',
    label: 'Tickets — Custom User',
    permissions: [
      'can_view_custom_user_tickets',
      'can_edit_custom_user_tickets',
      'can_delete_custom_user_tickets',
    ],
  },
  {
    id: 'comments-reactions',
    label: 'Comments & Reactions',
    permissions: [
      'can_comment',
      'can_view_all_comments',
      'can_delete_all_comments',
      'can_view_custom_team_comments',
      'can_delete_custom_team_comments',
      'can_give_reaction',
      'can_remove_custom_role_reaction',
    ],
  },
  {
    id: 'board-backlog',
    label: 'Board & Backlog',
    permissions: [
      'can_view_board',
      'can_view_board_all_teams',
      'can_view_board_custom_teams',
      'can_view_backlog',
    ],
  },
  {
    id: 'sprints-system',
    label: 'Sprints — System-wide',
    permissions: [
      'can_create_sprint',
      'can_edit_sprint',
      'can_delete_sprint',
      'can_add_tickets_to_sprint',
      'can_remove_tickets_from_sprint',
    ],
  },
  {
    id: 'sprints-custom-team',
    label: 'Sprints — Custom Team',
    permissions: [
      'can_create_custom_team_sprint',
      'can_edit_custom_team_sprint',
      'can_delete_custom_team_sprint',
    ],
  },
  {
    id: 'epics',
    label: 'Epics',
    permissions: [
      'can_create_epic',
      'can_edit_epic',
      'can_remove_epic',
      'can_assign_teams_to_epic',
      'can_assign_custom_teams_to_epic',
      'can_add_all_tickets_to_epic',
      'can_add_custom_team_tickets_to_epic',
      'can_remove_all_tickets_from_epic',
      'can_remove_custom_team_tickets_from_epic',
    ],
  },
  {
    id: 'timeline',
    label: 'Timeline',
    permissions: ['can_view_timeline'],
  },
  {
    id: 'tickets-my-tasks',
    label: 'Tickets — My Tasks',
    permissions: ['can_view_own_tickets', 'can_view_own_subtasks'],
  },
  {
    id: 'subtasks-system',
    label: 'Subtasks — System-wide',
    permissions: ['can_add_subtask', 'can_assign_subtask'],
  },
  {
    id: 'subtasks-custom-team',
    label: 'Subtasks — Custom Team',
    permissions: ['can_add_custom_team_subtask', 'can_assign_custom_team_subtask'],
  },
  {
    id: 'subtasks-custom-label',
    label: 'Subtasks — Custom Label',
    permissions: ['can_add_custom_label_subtask', 'can_assign_custom_label_subtask'],
  },
  {
    id: 'tickets-assigned',
    label: 'Tickets — Assigned to Me',
    permissions: [
      'can_view_assigned_ticket',
      'can_change_assigned_ticket_workflow',
      'can_change_assigned_subtask_workflow',
      'can_comment_assigned_ticket',
      'can_reply_assigned_ticket_comment',
      'can_change_assigned_ticket_epic',
      'can_change_assigned_ticket_label',
      'can_change_assigned_subtask_label',
      'can_react_assigned_ticket',
      'can_clear_own_reaction',
      'can_block_reaction_custom_role',
      'can_allow_reaction_custom_role',
    ],
  },
  {
    id: 'settings-admin',
    label: 'Settings & Admin',
    permissions: [
      'can_view_summary',
      'can_manage_statuses',
      'can_manage_labels',
      'can_manage_teams',
      'can_edit_roles',
    ],
  },
  {
    id: 'own-team-tickets',
    label: 'Own Team Tickets — All Actions',
    permissions: [
      'can_create_own_team_ticket',
      'can_view_own_team_tickets',
      'can_edit_own_team_tickets',
      'can_delete_own_team_tickets',
      'can_move_own_team_ticket',
      'can_assign_own_team_ticket',
      'can_change_own_team_ticket_workflow',
      'can_change_own_team_ticket_epic',
      'can_change_own_team_ticket_label',
      'can_change_own_team_ticket_priority',
      'can_change_own_team_ticket_due_date',
      'can_comment_own_team_ticket',
      'can_reply_own_team_ticket_comment',
      'can_delete_own_team_comment',
      'can_react_own_team_ticket',
      'can_remove_own_team_reaction',
      'can_view_own_team_board',
      'can_view_own_team_backlog',
      'can_view_own_team_timeline',
      'can_add_own_team_ticket_to_sprint',
      'can_remove_own_team_ticket_from_sprint',
      'can_add_own_team_ticket_to_epic',
      'can_remove_own_team_ticket_from_epic',
      'can_add_own_team_subtask',
      'can_assign_own_team_subtask',
      'can_change_own_team_subtask_workflow',
      'can_change_own_team_subtask_label',
    ],
  },
  {
    id: 'own-team-management',
    label: 'Own Team Management',
    permissions: [
      'can_view_own_team_summary',
      'can_view_own_team_tickets',
      'can_edit_own_team_tickets',
      'can_delete_own_team_tickets',
      'can_view_own_team_board',
      'can_view_own_team_timeline',
      'can_create_own_team_sprint',
      'can_edit_own_team_sprint',
      'can_delete_own_team_sprint',
      'can_manage_own_team_members',
    ],
  },
];
