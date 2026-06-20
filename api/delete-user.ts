import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

/**
 * Vercel serverless function — HARD-delete a user from Firebase Auth.
 *
 * The browser SDK cannot delete another user; only the Admin SDK can, and
 * removing the Auth record is what frees the email for reuse. This runs on
 * Vercel (Node runtime), same origin as the app, so no CORS is needed.
 *
 * Trust model:
 *   - Browser sends the caller's Firebase ID token (Authorization: Bearer).
 *   - We verify it with the Admin SDK (cannot be forged).
 *   - We look the caller up in Firestore and enforce authorization server-side.
 *     Client-sent role/claims are NEVER trusted.
 *
 * Required env var (set in the Vercel dashboard, runtime scope):
 *   FIREBASE_SA_KEY = full service-account JSON, on one line.
 */

// Initialize once per warm instance.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SA_KEY as string)),
  });
}

const authAdmin = admin.auth();
const db = admin.firestore();

/**
 * Authorization policy — WHO may delete a user.
 *
 * Default: caller must be an `admin` (workspace owner), may not delete
 * themselves, and the target must belong to the caller's workspace — so no
 * owner can ever delete another workspace's members.
 */
function isAuthorized(
  callerUid: string,
  callerDoc: FirebaseFirestore.DocumentData | undefined,
  targetUid: string,
  targetDoc: FirebaseFirestore.DocumentData | undefined,
): boolean {
  if (!callerDoc || callerDoc.role !== 'admin') return false; // only owners
  if (callerUid === targetUid) return false; // never delete yourself
  if (!targetDoc) return false; // unknown target
  const callerWorkspace = callerDoc.workspaceId ?? callerUid;
  const targetWorkspace = targetDoc.workspaceId ?? null;
  return targetWorkspace === callerWorkspace; // same workspace only
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method-not-allowed' });

  try {
    // 1. Authenticate the caller from their ID token.
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'missing-token' });
    const caller = await authAdmin.verifyIdToken(token);

    // 2. Authorize against Firestore state.
    const targetUid = (req.body as { uid?: string } | undefined)?.uid;
    if (!targetUid) return res.status(400).json({ error: 'missing-uid' });

    const [callerSnap, targetSnap] = await Promise.all([
      db.doc(`users/${caller.uid}`).get(),
      db.doc(`users/${targetUid}`).get(),
    ]);
    if (!isAuthorized(caller.uid, callerSnap.data(), targetUid, targetSnap.data())) {
      return res.status(403).json({ error: 'forbidden' });
    }

    // 3. Hard-delete the Auth record — releases the email for reuse.
    await authAdmin.deleteUser(targetUid);

    return res.status(200).json({ ok: true });
  } catch (err) {
    // Already gone from Auth? The goal (no Auth record) is met.
    if ((err as { code?: string })?.code === 'auth/user-not-found') {
      return res.status(200).json({ ok: true });
    }
    console.error('delete-user failed:', err);
    return res.status(500).json({ error: 'internal' });
  }
}
