import type { QueryConstraint } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { AppDataSource } from './AppDataSource';
import type { AuthHandler, AuthCredentials } from '../firebase/AuthHandler';
import type { FirestoreHandler, DocData } from '../firebase/FirestoreHandler';
import type { AdminApiHandler } from '../api/AdminApiHandler';
import type { WorkspaceScope } from '../../workspace/WorkspaceScope';
import { AppError } from '../../errors/AppError';

/**
 * Collections owned by a workspace. Each signup-admin owns a tree under
 * `users/{ownerUid}/...`, so any access to these roots is transparently
 * rewritten to that nested path. `users` and `permissionCatalogue` are global.
 */
const WORKSPACE_SCOPED_ROOTS = new Set([
  'roles',
  'teams',
  'tickets',
  'epics',
  'sprints',
  'statuses',
  'labels',
  'employeesData',
  'quotes',
]);

/**
 * Core datasource implementation. Pure delegation to the injected handlers —
 * keeps the single entry point thin and the Firebase surface in one place.
 * Workspace-scoped collection paths are nested under the active workspace.
 */
export class AppDataSourceImpl implements AppDataSource {
  private readonly auth: AuthHandler;
  private readonly firestore: FirestoreHandler;
  private readonly adminApi: AdminApiHandler;
  private readonly workspace: WorkspaceScope;

  constructor(
    auth: AuthHandler,
    firestore: FirestoreHandler,
    adminApi: AdminApiHandler,
    workspace: WorkspaceScope,
  ) {
    this.auth = auth;
    this.firestore = firestore;
    this.adminApi = adminApi;
    this.workspace = workspace;
  }

  /**
   * Rewrites a workspace-scoped collection path (by its first segment) to live
   * under `users/{workspaceId}/`. Global collections pass through untouched.
   */
  private scopedPath(collectionPath: string): string {
    const root = collectionPath.split('/')[0];
    if (!WORKSPACE_SCOPED_ROOTS.has(root)) return collectionPath;
    const workspaceId = this.workspace.get();
    if (!workspaceId) {
      throw new AppError({
        kind: 'unknown',
        code: 'workspace/not-resolved',
        message: 'No active workspace. Please sign in again.',
      });
    }
    return `users/${workspaceId}/${collectionPath}`;
  }

  signIn(credentials: AuthCredentials): Promise<User> {
    return this.auth.signIn(credentials);
  }
  signUp(credentials: AuthCredentials): Promise<User> {
    return this.auth.signUp(credentials);
  }
  createUserWithoutSignIn(credentials: AuthCredentials): Promise<User> {
    return this.auth.createUserWithoutSignIn(credentials);
  }
  signOut(): Promise<void> {
    return this.auth.signOut();
  }
  currentUser(): User | null {
    return this.auth.currentUser();
  }
  onAuthStateChanged(listener: (user: User | null) => void): () => void {
    return this.auth.onAuthStateChanged(listener);
  }
  sendPasswordReset(email: string): Promise<void> {
    return this.auth.sendPasswordReset(email);
  }
  verifyResetCode(oobCode: string): Promise<string> {
    return this.auth.verifyResetCode(oobCode);
  }
  confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
    return this.auth.confirmPasswordReset(oobCode, newPassword);
  }

  getDocument(collectionPath: string, id: string): Promise<DocData | null> {
    return this.firestore.getById(this.scopedPath(collectionPath), id);
  }
  getCollection(collectionPath: string, constraints?: QueryConstraint[]): Promise<DocData[]> {
    return this.firestore.getCollection(this.scopedPath(collectionPath), constraints);
  }
  addDocument(collectionPath: string, data: Record<string, unknown>): Promise<string> {
    return this.firestore.add(this.scopedPath(collectionPath), data);
  }
  setDocument(collectionPath: string, id: string, data: Record<string, unknown>): Promise<void> {
    return this.firestore.set(this.scopedPath(collectionPath), id, data);
  }
  updateDocument(collectionPath: string, id: string, data: Record<string, unknown>): Promise<void> {
    return this.firestore.update(this.scopedPath(collectionPath), id, data);
  }
  deleteDocument(collectionPath: string, id: string): Promise<void> {
    return this.firestore.remove(this.scopedPath(collectionPath), id);
  }

  async deleteAuthUser(uid: string): Promise<void> {
    const caller = this.auth.currentUser();
    if (!caller) {
      throw new AppError({
        kind: 'auth',
        code: 'auth/not-authenticated',
        message: 'You must be signed in to delete a user.',
      });
    }
    const idToken = await caller.getIdToken();
    await this.adminApi.deleteAuthUser(uid, idToken);
  }
}
