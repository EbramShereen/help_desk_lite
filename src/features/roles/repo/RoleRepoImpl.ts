import type { AppDataSource } from '../../../core/data/datasource/AppDataSource';
import type { RoleRepo } from './RoleRepo';
import { toMultipleResult, type MultipleResult } from '../../../core/models/MultipleResult';
import { guard, success, type Result, type SuccessResult } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';
import {
  customRoleFromDoc,
  permissionScopesMap,
  type CustomRole,
} from '../../../core/data/models/response/admin/custom_role_response';
import {
  customRoleToDoc,
  type CustomRoleInput,
  type CustomRoleUpdate,
} from '../../../core/data/models/request/admin/custom_role_request';

const ROLES = 'roles';

export class RoleRepoImpl implements RoleRepo {
  private readonly ds: AppDataSource;

  constructor(ds: AppDataSource) {
    this.ds = ds;
  }

  listCustomRoles(): Promise<Result<AppError, MultipleResult<CustomRole>>> {
    return guard(async () =>
      toMultipleResult((await this.ds.getCollection(ROLES)).map(customRoleFromDoc)),
    );
  }

  getCustomRole(id: string): Promise<Result<AppError, CustomRole | null>> {
    return guard(async () => {
      const doc = await this.ds.getDocument(ROLES, id);
      return doc ? customRoleFromDoc(doc) : null;
    });
  }

  createCustomRole(
    input: CustomRoleInput,
    createdBy: string,
  ): Promise<Result<AppError, CustomRole>> {
    return guard(async () => {
      const data = customRoleToDoc(input, createdBy);
      const id = await this.ds.addDocument(ROLES, data);
      return customRoleFromDoc({ id, ...data });
    });
  }

  updateCustomRole(id: string, patch: CustomRoleUpdate): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      // Keep the rules-facing `permissionScopes` map in sync whenever grants change.
      const data: Record<string, unknown> = { ...patch, updatedAt: Date.now() };
      if (patch.permissions) data.permissionScopes = permissionScopesMap(patch.permissions);
      await this.ds.updateDocument(ROLES, id, data);
      return success;
    });
  }

  deleteCustomRole(id: string): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.deleteDocument(ROLES, id);
      return success;
    });
  }

  migrateRolePermissionScopes(): Promise<Result<AppError, number>> {
    return guard(async () => {
      const docs = await this.ds.getCollection(ROLES);
      const legacy = docs.filter((d) => d.permissionScopes === undefined);
      await Promise.all(
        legacy.map((d) =>
          this.ds.updateDocument(ROLES, String(d.id), {
            permissionScopes: permissionScopesMap(customRoleFromDoc(d).permissions),
          }),
        ),
      );
      return legacy.length;
    });
  }
}
