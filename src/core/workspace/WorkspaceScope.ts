/**
 * Holds the id of the workspace whose data the current session reads/writes.
 *
 * In the SaaS model every signup is an admin who owns a workspace tree under
 * `users/{ownerUid}/...`. The workspace id equals that owner's uid:
 *   - admins  → their own uid
 *   - members → the `workspaceId` field on their profile (the admin who created them)
 *
 * The core datasource consults this to prefix workspace-scoped collections.
 */
export interface WorkspaceScope {
  /** Current workspace id, or null when signed out / not yet resolved. */
  get(): string | null;
  set(workspaceId: string | null): void;
}
