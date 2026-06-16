/**
 * Firestore security-rules tests. Run via the emulator:
 *   npm run test:rules
 * (which is: firebase emulators:exec --only firestore --project demo-helpdesk
 *  "node scripts/firestore.rules.test.mjs")
 *
 * Verifies the permission/scope-aware rules in firestore.rules: the `active`
 * flag gates access, scoped grants only expose in-scope docs, admin bypasses,
 * and pending users are denied.
 */
import { readFileSync } from 'node:fs';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

let passed = 0;
let failed = 0;
async function check(name, promise) {
  try {
    await promise;
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}\n      ${err.message}`);
  }
}

const testEnv = await initializeTestEnvironment({
  projectId: 'demo-helpdesk',
  firestore: { rules: readFileSync('firestore.rules', 'utf8') },
});

// ─── Seed data with rules disabled ───────────────────────────────────────────
await testEnv.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, 'users/admin'), { role: 'admin', active: true, workspaceId: 'admin' });
  await setDoc(doc(db, 'users/uViewer'), {
    role: 'pending', active: true, customRoleId: 'rViewer', teamId: 'teamA', workspaceId: 'admin',
  });
  await setDoc(doc(db, 'users/uTeam'), {
    role: 'pending', active: true, customRoleId: 'rTeam', teamId: 'teamB', workspaceId: 'admin',
  });
  await setDoc(doc(db, 'users/uPending'), { role: 'pending', active: false, workspaceId: 'admin' });

  await setDoc(doc(db, 'users/admin/roles/rViewer'), {
    name: 'Viewer',
    permissionScopes: {
      can_view_own_team_tickets: [],
      can_comment_own_team_ticket: [],
      can_create_own_team_ticket: [],
    },
  });
  await setDoc(doc(db, 'users/admin/roles/rTeam'), {
    name: 'Team A Viewer',
    permissionScopes: { can_view_custom_team_tickets: ['teamA'] },
  });
  await setDoc(doc(db, 'users/admin/roles/rEpic'), {
    name: 'Epic1 Viewer',
    permissionScopes: { can_view_custom_epic_tickets: ['epic1'] },
  });
  await setDoc(doc(db, 'users/uEpic'), {
    role: 'pending', active: true, customRoleId: 'rEpic', teamId: 'teamZ', workspaceId: 'admin',
  });

  await setDoc(doc(db, 'users/admin/tickets/tA'), { teamId: 'teamA', workspaceId: 'admin', createdBy: 'someone', assigneeIds: [], labels: [] });
  await setDoc(doc(db, 'users/admin/tickets/tB'), { teamId: 'teamB', workspaceId: 'admin', createdBy: 'someone', assigneeIds: [], labels: [] });
  await setDoc(doc(db, 'users/admin/tickets/tEpic1'), { teamId: 'teamX', epicId: 'epic1', createdBy: 'someone', assigneeIds: [], labels: [] });
  await setDoc(doc(db, 'users/admin/tickets/tEpic2'), { teamId: 'teamX', epicId: 'epic2', createdBy: 'someone', assigneeIds: [], labels: [] });
  await setDoc(doc(db, 'users/admin/statuses/s1'), { name: 'To Do', order: 0 });
});

const admin = testEnv.authenticatedContext('admin').firestore();
const viewer = testEnv.authenticatedContext('uViewer').firestore();
const team = testEnv.authenticatedContext('uTeam').firestore();
const epic = testEnv.authenticatedContext('uEpic').firestore();
const pending = testEnv.authenticatedContext('uPending').firestore();

console.log('Firestore rules tests:');

// Admin bypasses everything
await check('admin reads any ticket', assertSucceeds(getDoc(doc(admin, 'users/admin/tickets/tB'))));
await check('admin writes a status', assertSucceeds(setDoc(doc(admin, 'users/admin/statuses/s2'), { name: 'X', order: 1 })));

// own-team viewer: sees own team, not others
await check('own-team viewer reads own-team ticket', assertSucceeds(getDoc(doc(viewer, 'users/admin/tickets/tA'))));
await check('own-team viewer denied other-team ticket', assertFails(getDoc(doc(viewer, 'users/admin/tickets/tB'))));
await check('own-team viewer creates ticket in own team (has perm)', assertSucceeds(
  setDoc(doc(viewer, 'users/admin/tickets/tNewA'), { teamId: 'teamA', workspaceId: 'admin', createdBy: 'uViewer', assigneeIds: [], labels: [] }),
));
await check('own-team viewer denied creating ticket in other team', assertFails(
  setDoc(doc(viewer, 'users/admin/tickets/tNewB'), { teamId: 'teamB', workspaceId: 'admin', createdBy: 'uViewer', assigneeIds: [], labels: [] }),
));
await check('own-team viewer comments on own-team ticket (has perm)', assertSucceeds(
  setDoc(doc(viewer, 'users/admin/tickets/tA/activity/c1'), { type: 'comment', authorId: 'uViewer', message: 'hi' }),
));

// custom-team scoped grant: only the scoped team
await check('scoped viewer reads in-scope (teamA) ticket', assertSucceeds(getDoc(doc(team, 'users/admin/tickets/tA'))));
await check('scoped viewer denied out-of-scope (teamB) ticket', assertFails(getDoc(doc(team, 'users/admin/tickets/tB'))));

// epic-scoped grant: only the in-scope epic's tickets (Phase 3 query pattern)
await check('epic-scoped viewer reads in-scope epic ticket', assertSucceeds(getDoc(doc(epic, 'users/admin/tickets/tEpic1'))));
await check('epic-scoped viewer denied out-of-scope epic ticket', assertFails(getDoc(doc(epic, 'users/admin/tickets/tEpic2'))));

// pending (inactive) user: denied
await check('pending user denied ticket read', assertFails(getDoc(doc(pending, 'users/admin/tickets/tA'))));
await check('pending user denied status read', assertFails(getDoc(doc(pending, 'users/admin/statuses/s1'))));

// roles readable by any authed user (drives UI gating)
await check('active user can read roles', assertSucceeds(getDoc(doc(viewer, 'users/admin/roles/rTeam'))));

// statuses: active read yes, write no (no manage_statuses)
await check('active user reads status', assertSucceeds(getDoc(doc(viewer, 'users/admin/statuses/s1'))));
await check('active user without perm cannot write status', assertFails(
  setDoc(doc(viewer, 'users/admin/statuses/s3'), { name: 'Y', order: 2 }),
));

await testEnv.cleanup();

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
