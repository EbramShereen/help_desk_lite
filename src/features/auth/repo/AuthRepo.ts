import type {
  AuthUser,
  EntityPermission,
} from '../../../core/data/models/response/auth/auth_user_response';
import type { EntityPermissionType } from '../../../core/enums/auth/entity_permission_type';
import type { UserFeatures } from '../../../core/enums/auth/feature_key';
import type { Role } from '../../../core/enums/auth/role';
import type { MultipleResult } from '../../../core/models/MultipleResult';
import type { Result, SuccessResult } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';

export interface AuthRepo {
  signIn(email: string, password: string): Promise<Result<AppError, AuthUser>>;
  signUp(input: {
    displayName: string;
    email: string;
    password: string;
  }): Promise<Result<AppError, AuthUser>>;
  signOut(): Promise<Result<AppError, SuccessResult>>;
  sendPasswordReset(email: string): Promise<Result<AppError, SuccessResult>>;
  verifyResetCode(oobCode: string): Promise<Result<AppError, string>>;
  confirmPasswordReset(
    oobCode: string,
    newPassword: string,
  ): Promise<Result<AppError, SuccessResult>>;
  /** Sync subscription — returns an unsubscribe fn, NOT a Result. */
  onAuthStateChanged(cb: (user: AuthUser | null) => void): () => void;
  listUsers(): Promise<Result<AppError, MultipleResult<AuthUser>>>;
  getUser(uid: string): Promise<Result<AppError, AuthUser | null>>;
  createUser(
    email: string,
    password: string,
    role: Role,
    createdBy?: string,
  ): Promise<Result<AppError, SuccessResult>>;
  setUserRole(uid: string, role: Role): Promise<Result<AppError, SuccessResult>>;
  setUserCustomRole(
    uid: string,
    customRoleId: string | null,
  ): Promise<Result<AppError, SuccessResult>>;
  setUserFeatures(
    uid: string,
    features: Partial<UserFeatures>,
  ): Promise<Result<AppError, SuccessResult>>;
  setEntityPermissions(
    uid: string,
    type: EntityPermissionType,
    permissions: EntityPermission[],
  ): Promise<Result<AppError, SuccessResult>>;
  deleteUser(uid: string): Promise<Result<AppError, SuccessResult>>;
}
