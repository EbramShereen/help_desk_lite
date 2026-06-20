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
  // Quotes Management
  'can_manage_quotes',
] as const;

export type Permission = (typeof PERMISSIONS)[number];
