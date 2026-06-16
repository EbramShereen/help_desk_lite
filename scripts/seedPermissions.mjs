/**
 * One-shot seed: writes all permission categories to Firestore.
 * Run from project root: node scripts/seedPermissions.mjs
 * Safe to re-run — skips if permissionCatalogue already has documents.
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAUK8H7SXkLwmagmceSi1Ta3G_8p0RWzXU',
  authDomain: 'help-desk-lite.firebaseapp.com',
  projectId: 'help-desk-lite',
  storageBucket: 'help-desk-lite.firebasestorage.app',
  messagingSenderId: '837842550235',
  appId: '1:837842550235:web:edbcdf8e8c5683007f3bfe',
};

const CATALOGUE = [
  {
    label: 'User & Role Management', order: 0,
    permissions: [
      { key: 'can_invite_user', label: 'Invite user (by email)' },
      { key: 'can_remove_user', label: 'Remove user' },
      { key: 'can_assign_role', label: 'Assign role to user' },
      { key: 'can_remove_role', label: 'Remove role from user' },
      { key: 'can_set_custom_role_limits', label: 'Set role assignment limits (custom roles)' },
    ],
  },
  {
    label: 'Workflow Management', order: 1,
    permissions: [
      { key: 'can_create_workflow', label: 'Create workflow' },
      { key: 'can_edit_workflow', label: 'Edit workflow' },
      { key: 'can_remove_workflow', label: 'Remove workflow' },
    ],
  },
  {
    label: 'Tickets — System-wide', order: 2,
    permissions: [
      { key: 'can_create_ticket', label: 'Create ticket' },
      { key: 'can_view_all_tickets', label: 'View all system tickets' },
      { key: 'can_edit_all_tickets', label: 'Edit all system tickets' },
      { key: 'can_delete_all_tickets', label: 'Delete all system tickets' },
      { key: 'can_move_ticket', label: 'Move ticket (board / backlog)' },
    ],
  },
  {
    label: 'Tickets — Custom Team', order: 3,
    permissions: [
      { key: 'can_view_custom_team_tickets', label: 'View tickets (custom teams)' },
      { key: 'can_edit_custom_team_tickets', label: 'Edit tickets (custom teams)' },
      { key: 'can_delete_custom_team_tickets', label: 'Delete tickets (custom teams)' },
    ],
  },
  {
    label: 'Tickets — Custom Epic', order: 4,
    permissions: [
      { key: 'can_view_custom_epic_tickets', label: 'View tickets (custom epics)' },
      { key: 'can_edit_custom_epic_tickets', label: 'Edit tickets (custom epics)' },
      { key: 'can_delete_custom_epic_tickets', label: 'Delete tickets (custom epics)' },
    ],
  },
  {
    label: 'Tickets — Custom Label', order: 5,
    permissions: [
      { key: 'can_view_custom_label_tickets', label: 'View tickets (custom labels)' },
      { key: 'can_edit_custom_label_tickets', label: 'Edit tickets (custom labels)' },
      { key: 'can_delete_custom_label_tickets', label: 'Delete tickets (custom labels)' },
    ],
  },
  {
    label: 'Tickets — Custom Workflow', order: 6,
    permissions: [
      { key: 'can_view_custom_workflow_tickets', label: 'View tickets (custom workflows)' },
      { key: 'can_edit_custom_workflow_tickets', label: 'Edit tickets (custom workflows)' },
      { key: 'can_delete_custom_workflow_tickets', label: 'Delete tickets (custom workflows)' },
    ],
  },
  {
    label: 'Tickets — Custom User', order: 7,
    permissions: [
      { key: 'can_view_custom_user_tickets', label: 'View tickets (custom users)' },
      { key: 'can_edit_custom_user_tickets', label: 'Edit tickets (custom users)' },
      { key: 'can_delete_custom_user_tickets', label: 'Delete tickets (custom users)' },
    ],
  },
  {
    label: 'Comments & Reactions', order: 8,
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
    label: 'Board & Backlog', order: 9,
    permissions: [
      { key: 'can_view_board', label: 'View board' },
      { key: 'can_view_board_all_teams', label: 'View board (all teams)' },
      { key: 'can_view_board_custom_teams', label: 'View board (custom teams)' },
      { key: 'can_view_backlog', label: 'View backlog' },
    ],
  },
  {
    label: 'Sprints — System-wide', order: 10,
    permissions: [
      { key: 'can_create_sprint', label: 'Create sprint (any team)' },
      { key: 'can_edit_sprint', label: 'Edit sprint (any team)' },
      { key: 'can_delete_sprint', label: 'Delete sprint (any team)' },
      { key: 'can_add_tickets_to_sprint', label: 'Add tickets to sprint' },
      { key: 'can_remove_tickets_from_sprint', label: 'Remove tickets from sprint' },
    ],
  },
  {
    label: 'Sprints — Custom Team', order: 11,
    permissions: [
      { key: 'can_create_custom_team_sprint', label: 'Create sprint (custom teams)' },
      { key: 'can_edit_custom_team_sprint', label: 'Edit sprint (custom teams)' },
      { key: 'can_delete_custom_team_sprint', label: 'Delete sprint (custom teams)' },
    ],
  },
  {
    label: 'Epics', order: 12,
    permissions: [
      { key: 'can_create_epic', label: 'Create epic' },
      { key: 'can_edit_epic', label: 'Edit epic' },
      { key: 'can_remove_epic', label: 'Remove epic' },
      { key: 'can_assign_teams_to_epic', label: 'Assign teams to epic (all)' },
      { key: 'can_assign_custom_teams_to_epic', label: 'Assign teams to epic (custom teams)' },
      { key: 'can_add_all_tickets_to_epic', label: 'Add any ticket to epic' },
      { key: 'can_add_custom_team_tickets_to_epic', label: 'Add tickets to epic (custom teams)' },
      { key: 'can_remove_all_tickets_from_epic', label: 'Remove any ticket from epic' },
      { key: 'can_remove_custom_team_tickets_from_epic', label: 'Remove tickets from epic (custom teams)' },
    ],
  },
  {
    label: 'Timeline', order: 13,
    permissions: [
      { key: 'can_view_timeline', label: 'View timeline' },
    ],
  },
  {
    label: 'Settings & Admin', order: 14,
    permissions: [
      { key: 'can_view_summary', label: 'View summary' },
      { key: 'can_manage_statuses', label: 'Manage statuses' },
      { key: 'can_manage_labels', label: 'Manage labels' },
      { key: 'can_manage_teams', label: 'Manage teams' },
      { key: 'can_edit_roles', label: 'Create / edit roles' },
    ],
  },
];

async function main() {
  const force = process.argv.includes('--force');

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('Signing in as admin...');
  await signInWithEmailAndPassword(auth, 'admin@helpdesk.local', 'ChangeMe_Admin#2026');

  const col = collection(db, 'permissionCatalogue');
  const existing = await getDocs(col);

  if (!existing.empty) {
    if (!force) {
      console.log(`permissionCatalogue already has ${existing.size} documents — skipping.`);
      console.log('Run with --force to wipe and re-seed.');
      process.exit(0);
    }
    console.log(`Deleting ${existing.size} stale documents...`);
    await Promise.all(existing.docs.map((d) => deleteDoc(d.ref)));
  }

  console.log(`Seeding ${CATALOGUE.length} categories...`);
  for (const cat of CATALOGUE) {
    await addDoc(col, cat);
    console.log(`  ✓ ${cat.label}`);
  }

  console.log('\nDone! All permissions are now stored in Firestore.');
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
