import type { PermissionCategory } from '../../../core/data/models/response/admin/permission_catalogue_response';
import type { MultipleResult } from '../../../core/models/MultipleResult';
import type { Result } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';

/**
 * Permission catalogue (stored in Firestore, seeded on first access). Drives the
 * grant pickers used when building custom roles.
 */
export interface PermissionRepo {
  listPermissionCategories(): Promise<Result<AppError, MultipleResult<PermissionCategory>>>;
}
