import type { CustomRole } from '../../../core/data/models/response/admin/custom_role_response';
import type {
  CustomRoleInput,
  CustomRoleUpdate,
} from '../../../core/data/models/request/admin/custom_role_request';
import type { MultipleResult } from '../../../core/models/MultipleResult';
import type { Result, SuccessResult } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';

/**
 * Custom roles (permission bundles). Persisted through AppDataSource — no direct
 * Firebase access.
 */
export interface RoleRepo {
  listCustomRoles(): Promise<Result<AppError, MultipleResult<CustomRole>>>;
  getCustomRole(id: string): Promise<Result<AppError, CustomRole | null>>;
  createCustomRole(
    input: CustomRoleInput,
    createdBy: string,
  ): Promise<Result<AppError, CustomRole>>;
  updateCustomRole(id: string, patch: CustomRoleUpdate): Promise<Result<AppError, SuccessResult>>;
  deleteCustomRole(id: string): Promise<Result<AppError, SuccessResult>>;
  /**
   * Backfills the `permissionScopes` map onto any legacy role docs that predate
   * it (so Firestore rules can enforce them). Admin-only; idempotent. Returns the
   * number of roles updated.
   */
  migrateRolePermissionScopes(): Promise<Result<AppError, number>>;
}
