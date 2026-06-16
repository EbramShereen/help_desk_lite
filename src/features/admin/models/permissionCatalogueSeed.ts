import type { PermissionCategory } from './PermissionCatalogue';

/** Seeded into Firestore `permissionCatalogue` on first access. */
export const PERMISSION_CATALOGUE_SEED: Omit<PermissionCategory, 'id'>[] = [
  {
    label: 'User & Role Management',
    order: 0,
    permissions: [
      { key: 'can_invite_user', label: 'Invite user (by email)' },
      { key: 'can_remove_user', label: 'Remove user' },
      { key: 'can_assign_role', label: 'Assign role to user' },
      { key: 'can_remove_role', label: 'Remove role from user' },
      { key: 'can_set_custom_role_limits', label: 'Set role assignment limits (custom roles)' },
    ],
  },
  {
    label: 'Workflow Management',
    order: 1,
    permissions: [
      { key: 'can_create_workflow', label: 'Create workflow' },
      { key: 'can_edit_workflow', label: 'Edit workflow' },
      { key: 'can_remove_workflow', label: 'Remove workflow' },
    ],
  },
  {
    label: 'Tickets — System-wide',
    order: 2,
    permissions: [
      { key: 'can_create_ticket', label: 'Create ticket' },
      { key: 'can_view_all_tickets', label: 'View all system tickets' },
      { key: 'can_edit_all_tickets', label: 'Edit all system tickets' },
      { key: 'can_delete_all_tickets', label: 'Delete all system tickets' },
      { key: 'can_move_ticket', label: 'Move ticket (board / backlog)' },
    ],
  },
  {
    label: 'Tickets — Custom Team',
    order: 3,
    permissions: [
      { key: 'can_view_custom_team_tickets', label: 'View tickets (custom teams)' },
      { key: 'can_edit_custom_team_tickets', label: 'Edit tickets (custom teams)' },
      { key: 'can_delete_custom_team_tickets', label: 'Delete tickets (custom teams)' },
    ],
  },
  {
    label: 'Tickets — Custom Epic',
    order: 4,
    permissions: [
      { key: 'can_view_custom_epic_tickets', label: 'View tickets (custom epics)' },
      { key: 'can_edit_custom_epic_tickets', label: 'Edit tickets (custom epics)' },
      { key: 'can_delete_custom_epic_tickets', label: 'Delete tickets (custom epics)' },
    ],
  },
  {
    label: 'Tickets — Custom Label',
    order: 5,
    permissions: [
      { key: 'can_view_custom_label_tickets', label: 'View tickets (custom labels)' },
      { key: 'can_edit_custom_label_tickets', label: 'Edit tickets (custom labels)' },
      { key: 'can_delete_custom_label_tickets', label: 'Delete tickets (custom labels)' },
    ],
  },
  {
    label: 'Tickets — Custom Workflow',
    order: 6,
    permissions: [
      { key: 'can_view_custom_workflow_tickets', label: 'View tickets (custom workflows)' },
      { key: 'can_edit_custom_workflow_tickets', label: 'Edit tickets (custom workflows)' },
      { key: 'can_delete_custom_workflow_tickets', label: 'Delete tickets (custom workflows)' },
    ],
  },
  {
    label: 'Tickets — Custom User',
    order: 7,
    permissions: [
      { key: 'can_view_custom_user_tickets', label: 'View tickets (custom users)' },
      { key: 'can_edit_custom_user_tickets', label: 'Edit tickets (custom users)' },
      { key: 'can_delete_custom_user_tickets', label: 'Delete tickets (custom users)' },
    ],
  },
  {
    label: 'Comments & Reactions',
    order: 8,
    permissions: [
      { key: 'can_comment', label: 'Comment on tickets' },
      { key: 'can_view_all_comments', label: 'View all comments' },
      { key: 'can_delete_all_comments', label: 'Delete any comment' },
      { key: 'can_view_custom_team_comments', label: 'View comments (custom teams)' },
      { key: 'can_delete_custom_team_comments', label: 'Delete comments (custom teams)' },
      { key: 'can_give_reaction', label: 'Give reaction' },
      { key: 'can_remove_custom_role_reaction', label: 'Remove reactions (custom roles)' },
    ],
  },
  {
    label: 'Board & Backlog',
    order: 9,
    permissions: [
      { key: 'can_view_board', label: 'View board' },
      { key: 'can_view_board_all_teams', label: 'View board (all teams)' },
      { key: 'can_view_board_custom_teams', label: 'View board (custom teams)' },
      { key: 'can_view_backlog', label: 'View backlog' },
    ],
  },
  {
    label: 'Sprints — System-wide',
    order: 10,
    permissions: [
      { key: 'can_create_sprint', label: 'Create sprint (any team)' },
      { key: 'can_edit_sprint', label: 'Edit sprint (any team)' },
      { key: 'can_delete_sprint', label: 'Delete sprint (any team)' },
      { key: 'can_add_tickets_to_sprint', label: 'Add tickets to sprint' },
      { key: 'can_remove_tickets_from_sprint', label: 'Remove tickets from sprint' },
    ],
  },
  {
    label: 'Sprints — Custom Team',
    order: 11,
    permissions: [
      { key: 'can_create_custom_team_sprint', label: 'Create sprint (custom teams)' },
      { key: 'can_edit_custom_team_sprint', label: 'Edit sprint (custom teams)' },
      { key: 'can_delete_custom_team_sprint', label: 'Delete sprint (custom teams)' },
    ],
  },
  {
    label: 'Epics',
    order: 12,
    permissions: [
      { key: 'can_create_epic', label: 'Create epic' },
      { key: 'can_edit_epic', label: 'Edit epic' },
      { key: 'can_remove_epic', label: 'Remove epic' },
      { key: 'can_assign_teams_to_epic', label: 'Assign teams to epic (all)' },
      { key: 'can_assign_custom_teams_to_epic', label: 'Assign teams to epic (custom teams)' },
      { key: 'can_add_all_tickets_to_epic', label: 'Add any ticket to epic' },
      { key: 'can_add_custom_team_tickets_to_epic', label: 'Add tickets to epic (custom teams)' },
      { key: 'can_remove_all_tickets_from_epic', label: 'Remove any ticket from epic' },
      {
        key: 'can_remove_custom_team_tickets_from_epic',
        label: 'Remove tickets from epic (custom teams)',
      },
    ],
  },
  {
    label: 'Timeline',
    order: 13,
    permissions: [{ key: 'can_view_timeline', label: 'View timeline' }],
  },
  {
    label: 'Tickets — My Tasks',
    order: 14,
    permissions: [
      { key: 'can_view_own_tickets', label: 'View own tickets only' },
      { key: 'can_view_own_subtasks', label: 'View own subtasks only' },
    ],
  },
  {
    label: 'Subtasks — System-wide',
    order: 15,
    permissions: [
      { key: 'can_add_subtask', label: 'Add subtask to any ticket' },
      { key: 'can_assign_subtask', label: 'Assign subtask to any user' },
    ],
  },
  {
    label: 'Subtasks — Custom Team',
    order: 16,
    permissions: [
      { key: 'can_add_custom_team_subtask', label: 'Add subtask (custom teams)' },
      { key: 'can_assign_custom_team_subtask', label: 'Assign subtask (custom teams)' },
    ],
  },
  {
    label: 'Subtasks — Custom Label',
    order: 17,
    permissions: [
      { key: 'can_add_custom_label_subtask', label: 'Add subtask (custom labels)' },
      { key: 'can_assign_custom_label_subtask', label: 'Assign subtask (custom labels)' },
    ],
  },
  {
    label: 'Tickets — Assigned to Me',
    order: 18,
    permissions: [
      { key: 'can_view_assigned_ticket', label: 'View assigned ticket' },
      { key: 'can_change_assigned_ticket_workflow', label: 'Change workflow of assigned ticket' },
      { key: 'can_change_assigned_subtask_workflow', label: 'Change workflow of assigned subtask' },
      { key: 'can_comment_assigned_ticket', label: 'Comment on assigned ticket' },
      { key: 'can_reply_assigned_ticket_comment', label: 'Reply to comments on assigned ticket' },
      { key: 'can_change_assigned_ticket_epic', label: 'Change / delete epic of assigned ticket' },
      {
        key: 'can_change_assigned_ticket_label',
        label: 'Change / delete label of assigned ticket',
      },
      {
        key: 'can_change_assigned_subtask_label',
        label: 'Change / delete label of assigned subtask',
      },
      { key: 'can_react_assigned_ticket', label: 'Put reaction on assigned ticket' },
      { key: 'can_clear_own_reaction', label: 'Clear own reaction' },
      { key: 'can_block_reaction_custom_role', label: 'Block reactions for custom roles' },
      { key: 'can_allow_reaction_custom_role', label: 'Allow reactions for custom roles only' },
    ],
  },
  {
    label: 'Settings & Admin',
    order: 19,
    permissions: [
      { key: 'can_view_summary', label: 'View summary' },
      { key: 'can_manage_statuses', label: 'Manage statuses' },
      { key: 'can_manage_labels', label: 'Manage labels' },
      { key: 'can_manage_teams', label: 'Manage teams' },
      { key: 'can_edit_roles', label: 'Create / edit roles' },
    ],
  },
  {
    label: 'Own Team Tickets — All Actions',
    order: 20,
    permissions: [
      { key: 'can_create_own_team_ticket', label: 'Create ticket in own team' },
      { key: 'can_view_own_team_tickets', label: 'View own team tickets' },
      { key: 'can_edit_own_team_tickets', label: 'Edit own team tickets' },
      { key: 'can_delete_own_team_tickets', label: 'Delete own team tickets' },
      { key: 'can_move_own_team_ticket', label: 'Move own team ticket (board / backlog)' },
      { key: 'can_assign_own_team_ticket', label: 'Assign own team ticket to a user' },
      {
        key: 'can_change_own_team_ticket_workflow',
        label: 'Change workflow / status of own team ticket',
      },
      { key: 'can_change_own_team_ticket_epic', label: 'Change / remove epic of own team ticket' },
      {
        key: 'can_change_own_team_ticket_label',
        label: 'Change / remove label of own team ticket',
      },
      { key: 'can_change_own_team_ticket_priority', label: 'Change priority of own team ticket' },
      { key: 'can_change_own_team_ticket_due_date', label: 'Change due date of own team ticket' },
      { key: 'can_comment_own_team_ticket', label: 'Comment on own team ticket' },
      { key: 'can_reply_own_team_ticket_comment', label: 'Reply to comments on own team ticket' },
      { key: 'can_delete_own_team_comment', label: 'Delete comment on own team ticket' },
      { key: 'can_react_own_team_ticket', label: 'React to own team ticket' },
      { key: 'can_remove_own_team_reaction', label: 'Remove reaction on own team ticket' },
      { key: 'can_view_own_team_board', label: 'View own team board' },
      { key: 'can_view_own_team_backlog', label: 'View own team backlog' },
      { key: 'can_view_own_team_timeline', label: 'View own team timeline' },
      { key: 'can_add_own_team_ticket_to_sprint', label: 'Add own team ticket to sprint' },
      {
        key: 'can_remove_own_team_ticket_from_sprint',
        label: 'Remove own team ticket from sprint',
      },
      { key: 'can_add_own_team_ticket_to_epic', label: 'Add own team ticket to epic' },
      { key: 'can_remove_own_team_ticket_from_epic', label: 'Remove own team ticket from epic' },
      { key: 'can_add_own_team_subtask', label: 'Add subtask to own team ticket' },
      { key: 'can_assign_own_team_subtask', label: 'Assign subtask on own team ticket' },
      {
        key: 'can_change_own_team_subtask_workflow',
        label: 'Change subtask workflow on own team ticket',
      },
      {
        key: 'can_change_own_team_subtask_label',
        label: 'Change subtask label on own team ticket',
      },
    ],
  },
  {
    label: 'Own Team Management',
    order: 21,
    permissions: [
      { key: 'can_view_own_team_summary', label: 'View own team summary' },
      { key: 'can_view_own_team_tickets', label: 'View own team tickets' },
      { key: 'can_edit_own_team_tickets', label: 'Edit own team tickets' },
      { key: 'can_delete_own_team_tickets', label: 'Delete own team tickets' },
      { key: 'can_view_own_team_board', label: 'View own team board' },
      { key: 'can_view_own_team_timeline', label: 'View own team timeline' },
      { key: 'can_create_own_team_sprint', label: 'Create sprint for own team' },
      { key: 'can_edit_own_team_sprint', label: 'Edit sprint for own team' },
      { key: 'can_delete_own_team_sprint', label: 'Delete sprint for own team' },
      { key: 'can_manage_own_team_members', label: 'Manage own team members' },
    ],
  },
];
