import type { AppDataSource } from '../../../core/data/datasource/AppDataSource';
import type { WorkspaceScope } from '../../../core/workspace/WorkspaceScope';
import type { AuthRepo } from './AuthRepo';
import { toMultipleResult, type MultipleResult } from '../../../core/models/MultipleResult';
import { guard, success, type Result, type SuccessResult } from '../../../core/models/Result';
import { AppError } from '../../../core/errors/AppError';
import type { Role } from '../../../core/enums/auth/role';
import {
  type AuthUser,
  type EntityPermission,
  authUserFromDoc,
  isUserActive,
  mapFirebaseUser,
} from '../../../core/data/models/response/auth/auth_user_response';
import { authUserToDoc } from '../../../core/data/models/request/auth/auth_user_request';
import type { EntityPermissionType } from '../../../core/enums/auth/entity_permission_type';
import { type UserFeatures, DEFAULT_FEATURES } from '../../../core/enums/auth/feature_key';

const USERS_PATH = 'users';
const EMPLOYEES_PATH = 'employeesData';

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

  /**
   * Resolve a user's profile. Admins have full docs at users/{uid}.
   * Employees have a pointer at users/{uid} and full doc at
   * users/{workspaceId}/employeesData/{uid}.
   */
  private async resolveUserDoc(
    uid: string,
  ): Promise<{ doc: Record<string, unknown>; isAdmin: boolean } | null> {
    const pointerOrAdmin = await this.ds.getDocument(USERS_PATH, uid);
    if (!pointerOrAdmin) return null;

    if ((pointerOrAdmin.role as Role) === 'admin') {
      return { doc: pointerOrAdmin, isAdmin: true };
    }

    // Employee: set workspace scope first, then read full doc
    const wsId = pointerOrAdmin.workspaceId as string | null;
    if (wsId) this.workspace.set(wsId);
    const employeeDoc = await this.ds.getDocument(EMPLOYEES_PATH, uid);
    if (!employeeDoc) return { doc: pointerOrAdmin, isAdmin: false };
    return { doc: employeeDoc, isAdmin: false };
  }

  signIn(email: string, password: string): Promise<Result<AppError, AuthUser>> {
    return guard(async () => {
      const normalized = email.toLowerCase();
      const user = await this.ds.signIn({ email: normalized, password });
      const resolved = await this.resolveUserDoc(user.uid);
      if (!resolved) {
        const fallback = mapFirebaseUser(user, 'pending');
        this.applyScope(fallback);
        return fallback;
      }
      const parsed = {
        ...authUserFromDoc({ ...resolved.doc, id: user.uid }),
        email: normalized,
        displayName: user.displayName,
      };
      this.applyScope(parsed);
      return parsed;
    });
  }

  signUp({
    displayName,
    email,
    password,
  }: {
    displayName: string;
    email: string;
    password: string;
  }): Promise<Result<AppError, AuthUser>> {
    return guard(async () => {
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
    });
  }

  signOut(): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.signOut();
      return success;
    });
  }

  sendPasswordReset(email: string): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.sendPasswordReset(email.toLowerCase());
      return success;
    });
  }

  verifyResetCode(oobCode: string): Promise<Result<AppError, string>> {
    return guard(() => this.ds.verifyResetCode(oobCode));
  }

  confirmPasswordReset(
    oobCode: string,
    newPassword: string,
  ): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.confirmPasswordReset(oobCode, newPassword);
      return success;
    });
  }

  onAuthStateChanged(cb: (user: AuthUser | null) => void): () => void {
    return this.ds.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        this.applyScope(null);
        cb(null);
        return;
      }
      this.resolveUserDoc(firebaseUser.uid).then((resolved) => {
        if (!resolved) {
          const fallback = mapFirebaseUser(firebaseUser, 'pending');
          this.applyScope(fallback);
          cb(fallback);
          return;
        }
        const parsed = authUserFromDoc({ ...resolved.doc, id: firebaseUser.uid });
        const role = parsed.role;
        const active = isUserActive(role, Boolean(resolved.doc.active));
        const result = { ...parsed, role, active, displayName: firebaseUser.displayName };
        this.applyScope(result);
        cb(result);
      });
    });
  }

  /** All employees in the current workspace. */
  listUsers(): Promise<Result<AppError, MultipleResult<AuthUser>>> {
    return guard(async () => {
      const workspaceId = this.workspace.get();
      if (!workspaceId) return toMultipleResult([]);
      const docs = await this.ds.getCollection(EMPLOYEES_PATH);
      return toMultipleResult(docs.map(authUserFromDoc));
    });
  }

  getUser(uid: string): Promise<Result<AppError, AuthUser | null>> {
    return guard(async () => {
      const doc = await this.ds.getDocument(EMPLOYEES_PATH, uid);
      return doc ? authUserFromDoc(doc) : null;
    });
  }

  createUser(
    email: string,
    password: string,
    role: Role,
    createdBy?: string,
  ): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const user = await this.ds.createUserWithoutSignIn({
        email: email.toLowerCase(),
        password,
      });
      const adminUid = this.ds.currentUser()?.uid;
      if (!adminUid) {
        throw new AppError({
          kind: 'auth',
          code: 'no-admin',
          message: 'No admin user authenticated',
        });
      }

      const adminDoc = await this.ds.getDocument(USERS_PATH, adminUid);
      const adminWorkspaceId = adminDoc?.workspaceId as string | undefined;
      const workspaceId = createdBy ?? adminWorkspaceId ?? adminUid;

      // Pointer doc at users/{uid} for auth resolution
      await this.ds.setDocument(USERS_PATH, user.uid, {
        workspaceId,
        role,
      });

      // Full employee profile in workspace-scoped collection
      await this.ds.setDocument(
        EMPLOYEES_PATH,
        user.uid,
        authUserToDoc(email.toLowerCase(), role, undefined, createdBy ?? adminUid, workspaceId),
      );
      return success;
    });
  }

  setUserRole(uid: string, role: Role): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.updateDocument(EMPLOYEES_PATH, uid, { role, active: role === 'admin' });
      return success;
    });
  }

  setUserCustomRole(
    uid: string,
    customRoleId: string | null,
  ): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.updateDocument(EMPLOYEES_PATH, uid, {
        customRoleId,
        active: customRoleId !== null,
      });
      return success;
    });
  }

  setUserFeatures(
    uid: string,
    features: Partial<UserFeatures>,
  ): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const doc = await this.ds.getDocument(EMPLOYEES_PATH, uid);
      const existing =
        doc?.features && typeof doc.features === 'object'
          ? (doc.features as Partial<UserFeatures>)
          : {};
      await this.ds.updateDocument(EMPLOYEES_PATH, uid, {
        features: { ...DEFAULT_FEATURES, ...existing, ...features },
      });
      return success;
    });
  }

  setEntityPermissions(
    uid: string,
    type: EntityPermissionType,
    permissions: EntityPermission[],
  ): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.updateDocument(EMPLOYEES_PATH, uid, { [type]: permissions });
      return success;
    });
  }

  deleteUser(uid: string): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      // Hard-delete the Firebase Auth record FIRST. This is what frees the
      // email for reuse; doing it before the Firestore deletes means a
      // mid-failure can never leave the email locked with no profile behind it.
      await this.ds.deleteAuthUser(uid);
      // Then remove both the pointer and the full employee profile.
      await this.ds.deleteDocument(USERS_PATH, uid);
      await this.ds.deleteDocument(EMPLOYEES_PATH, uid);
      return success;
    });
  }
}
