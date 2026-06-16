import { where } from 'firebase/firestore';
import type { AppDataSource } from '../../../core/datasource/AppDataSource';
import type { WorkspaceScope } from '../../../core/workspace/WorkspaceScope';
import type { AuthRepo } from '../repo/AuthRepo';
import type { Role } from '../models/Role';
import {
  type AuthUser,
  type EntityPermission,
  type EntityPermissionType,
  type UserFeatures,
  authUserFromDoc,
  authUserToDoc,
  isUserActive,
  mapFirebaseUser,
  DEFAULT_FEATURES,
} from '../models/AuthUser';

const USERS_PATH = 'users';

export class AuthRepoImpl implements AuthRepo {
  private readonly ds: AppDataSource;
  private readonly workspace: WorkspaceScope;

  constructor(ds: AppDataSource, workspace: WorkspaceScope) {
    this.ds = ds;
    this.workspace = workspace;
  }

  /** Point the datasource at the resolved user's workspace tree. */
  private applyScope(user: AuthUser | null): void {
    this.workspace.set(user?.workspaceId ?? null);
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const normalized = email.toLowerCase();
    const user = await this.ds.signIn({ email: normalized, password });
    const doc = await this.ds.getDocument(USERS_PATH, user.uid);
    const role = (doc?.role as Role) ?? 'pending';
    if (!doc) {
      const fallback = mapFirebaseUser(user, role);
      this.applyScope(fallback);
      return fallback;
    }
    const parsed = {
      ...authUserFromDoc({ ...doc, id: user.uid }),
      email: normalized,
      displayName: user.displayName,
    };
    this.applyScope(parsed);
    return parsed;
  }

  async signUp({
    displayName,
    email,
    password,
  }: {
    displayName: string;
    email: string;
    password: string;
  }): Promise<AuthUser> {
    const normalized = email.toLowerCase();
    // SaaS model: every self-service signup owns their workspace as an admin.
    const role: Role = 'admin';
    const user = await this.ds.signUp({ email: normalized, password });
    // The new admin's workspace is their own uid; data nests under users/{uid}/.
    await this.ds.setDocument(
      USERS_PATH,
      user.uid,
      authUserToDoc(normalized, role, displayName, null, user.uid),
    );
    const authUser: AuthUser = {
      uid: user.uid,
      email: normalized,
      displayName,
      role,
      workspaceId: user.uid,
      customRoleId: null,
      active: role === 'admin',
      createdBy: null,
      teamAddedBy: null,
      teamId: null,
      teamIds: [],
      assignedTicketIds: [],
      assignedSprintIds: [],
      features: { ...DEFAULT_FEATURES },
      workflowPermissions: [],
      teamPermissions: [],
      epicPermissions: [],
      labelPermissions: [],
      sprintPermissions: [],
    };
    this.applyScope(authUser);
    return authUser;
  }

  signOut(): Promise<void> {
    return this.ds.signOut();
  }

  sendPasswordReset(email: string): Promise<void> {
    return this.ds.sendPasswordReset(email.toLowerCase());
  }

  verifyResetCode(oobCode: string): Promise<string> {
    return this.ds.verifyResetCode(oobCode);
  }

  confirmPasswordReset(oobCode: string, newPassword: string): Promise<void> {
    return this.ds.confirmPasswordReset(oobCode, newPassword);
  }

  onAuthStateChanged(cb: (user: AuthUser | null) => void): () => void {
    return this.ds.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        this.applyScope(null);
        cb(null);
        return;
      }
      this.ds.getDocument(USERS_PATH, firebaseUser.uid).then((doc) => {
        const role = (doc?.role as Role) ?? 'pending';
        if (!doc) {
          const fallback = mapFirebaseUser(firebaseUser, role);
          this.applyScope(fallback);
          cb(fallback);
          return;
        }
        const parsed = authUserFromDoc({ ...doc, id: firebaseUser.uid });
        const active = isUserActive(role, Boolean(doc.active));
        const resolved = { ...parsed, role, active, displayName: firebaseUser.displayName };
        this.applyScope(resolved);
        cb(resolved);
      });
    });
  }

  /** Members of the current workspace (the owning admin + everyone they created). */
  async listUsers(): Promise<AuthUser[]> {
    const workspaceId = this.workspace.get();
    if (!workspaceId) return [];
    const docs = await this.ds.getCollection(USERS_PATH, [where('workspaceId', '==', workspaceId)]);
    return docs.map(authUserFromDoc);
  }

  async getUser(uid: string): Promise<AuthUser | null> {
    const doc = await this.ds.getDocument(USERS_PATH, uid);
    return doc ? authUserFromDoc(doc) : null;
  }

  async createUser(email: string, password: string, role: Role, createdBy?: string): Promise<void> {
    const user = await this.ds.createUserWithoutSignIn({ email: email.toLowerCase(), password });
    const adminUid = this.ds.currentUser()?.uid;
    if (!adminUid) {
      throw new Error('No admin user authenticated');
    }

    // Explicitly fetch the admin's workspaceId
    const adminDoc = await this.ds.getDocument(USERS_PATH, adminUid);
    const adminWorkspaceId = adminDoc?.workspaceId as string | undefined;

    const workspaceId = createdBy ?? adminWorkspaceId ?? adminUid;

    await this.ds.setDocument(
      USERS_PATH,
      user.uid,
      authUserToDoc(email.toLowerCase(), role, undefined, createdBy ?? adminUid, workspaceId),
    );
  }

  setUserRole(uid: string, role: Role): Promise<void> {
    // Admins are active; demoting to `pending` deactivates the account.
    return this.ds.updateDocument(USERS_PATH, uid, { role, active: role === 'admin' });
  }

  setUserCustomRole(uid: string, customRoleId: string | null): Promise<void> {
    // Assigning a custom role activates the user; clearing it deactivates them.
    return this.ds.updateDocument(USERS_PATH, uid, { customRoleId, active: customRoleId !== null });
  }

  async setUserFeatures(uid: string, features: Partial<UserFeatures>): Promise<void> {
    const doc = await this.ds.getDocument(USERS_PATH, uid);
    const existing =
      doc?.features && typeof doc.features === 'object'
        ? (doc.features as Partial<UserFeatures>)
        : {};
    await this.ds.updateDocument(USERS_PATH, uid, {
      features: { ...DEFAULT_FEATURES, ...existing, ...features },
    });
  }

  setEntityPermissions(
    uid: string,
    type: EntityPermissionType,
    permissions: EntityPermission[],
  ): Promise<void> {
    return this.ds.updateDocument(USERS_PATH, uid, { [type]: permissions });
  }

  deleteUser(uid: string): Promise<void> {
    return this.ds.deleteDocument(USERS_PATH, uid);
  }
}
