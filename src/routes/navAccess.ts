import type { Permission } from '../features/admin/models/Permission';

/**
 * Single source of truth for which permissions unlock each top-level
 * destination. The sidebar shows a tab when the user has ANY listed permission,
 * and `AppRoutes` guards the matching route with the SAME set — so a visible tab
 * is always reachable and vice-versa. Keep these in sync; edit here only.
 */
export const NAV_ACCESS = {
  tickets: [
    'can_view_all_tickets',
    'can_view_custom_team_tickets',
    'can_view_custom_epic_tickets',
    'can_view_custom_label_tickets',
    'can_view_custom_user_tickets',
    'can_view_own_team_tickets',
    'can_view_own_tickets',
    'can_view_assigned_ticket',
  ],
  board: [
    'can_view_board',
    'can_view_board_all_teams',
    'can_view_board_custom_teams',
    'can_view_own_team_board',
  ],
  backlog: ['can_view_backlog', 'can_view_own_team_backlog'],
  timeline: ['can_view_timeline', 'can_view_own_team_timeline'],
  summary: ['can_view_summary', 'can_view_own_team_summary'],
  epics: [
    'can_create_epic',
    'can_edit_epic',
    'can_remove_epic',
    'can_assign_teams_to_epic',
    'can_assign_custom_teams_to_epic',
    'can_add_all_tickets_to_epic',
    'can_add_custom_team_tickets_to_epic',
  ],
  sprints: [
    'can_create_sprint',
    'can_edit_sprint',
    'can_delete_sprint',
    'can_create_custom_team_sprint',
    'can_edit_custom_team_sprint',
    'can_delete_custom_team_sprint',
    'can_create_own_team_sprint',
    'can_edit_own_team_sprint',
    'can_delete_own_team_sprint',
  ],
  teams: ['can_manage_teams', 'can_manage_own_team_members'],
  teamProgress: ['can_view_board_custom_teams', 'can_view_board_all_teams'],
  roles: ['can_edit_roles'],
  workflow: ['can_manage_statuses', 'can_manage_labels'],
} as const satisfies Record<string, readonly Permission[]>;

/**
 * Ordered candidate routes for the post-login landing page. The first route the
 * user can reach (by permissions) becomes their default. Admins fall back to the
 * user-management page; everyone lands on Profile if nothing else is reachable.
 */
export const LANDING_ORDER: { to: string; anyOf: readonly Permission[] }[] = [
  { to: '/tickets', anyOf: NAV_ACCESS.tickets },
  { to: '/board', anyOf: NAV_ACCESS.board },
  { to: '/backlog', anyOf: NAV_ACCESS.backlog },
  { to: '/summary', anyOf: NAV_ACCESS.summary },
  { to: '/timeline', anyOf: NAV_ACCESS.timeline },
  { to: '/epics', anyOf: NAV_ACCESS.epics },
  { to: '/sprints', anyOf: NAV_ACCESS.sprints },
  { to: '/teams', anyOf: NAV_ACCESS.teams },
  { to: '/team-progress', anyOf: NAV_ACCESS.teamProgress },
  { to: '/admin/roles', anyOf: NAV_ACCESS.roles },
  { to: '/admin/workflow', anyOf: NAV_ACCESS.workflow },
];
