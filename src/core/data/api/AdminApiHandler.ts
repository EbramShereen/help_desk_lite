/**
 * Abstraction over the admin server (Firebase Admin SDK behind HTTP).
 * Features depend on this, never on `fetch` or the server URL directly.
 * Mirrors the AuthHandler / FirestoreHandler pattern: one thin interface,
 * one impl, all errors normalized to AppError.
 */
export interface AdminApiHandler {
  /**
   * Hard-delete a user from Firebase Auth (frees their email for reuse).
   * @param uid     target user uid
   * @param idToken caller's Firebase ID token, used by the server to authorize
   */
  deleteAuthUser(uid: string, idToken: string): Promise<void>;
}
