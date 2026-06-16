import type {
  AuthUser,
  EntityPermission,
  EntityPermissionType,
  UserFeatures,
} from '../models/AuthUser';
import type { Role } from '../models/Role';

export interface AuthRepo {
  signIn(email: string, password: string): Promise<AuthUser>;
  signUp(input: { displayName: string; email: string; password: string }): Promise<AuthUser>;
  signOut(): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  verifyResetCode(oobCode: string): Promise<string>;
  confirmPasswordReset(oobCode: string, newPassword: string): Promise<void>;
  onAuthStateChanged(cb: (user: AuthUser | null) => void): () => void;
  listUsers(): Promise<AuthUser[]>;
  getUser(uid: string): Promise<AuthUser | null>;
  createUser(email: string, password: string, role: Role, createdBy?: string): Promise<void>;
  setUserRole(uid: string, role: Role): Promise<void>;
  setUserCustomRole(uid: string, customRoleId: string | null): Promise<void>;
  setUserFeatures(uid: string, features: Partial<UserFeatures>): Promise<void>;
  setEntityPermissions(
    uid: string,
    type: EntityPermissionType,
    permissions: EntityPermission[],
  ): Promise<void>;
  deleteUser(uid: string): Promise<void>;
}
