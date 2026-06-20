import type { AppDataSource } from '../../../core/data/datasource/AppDataSource';
import type { PermissionRepo } from './PermissionRepo';
import { toMultipleResult, type MultipleResult } from '../../../core/models/MultipleResult';
import { guard, type Result } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';
import {
  permissionCategoryFromDoc,
  permissionCategoryToDoc,
  type PermissionCategory,
} from '../../../core/data/models/response/admin/permission_catalogue_response';
import { PERMISSION_CATALOGUE_SEED } from '../../../core/data/models/response/admin/permission_catalogue_seed';

const PERMISSION_CATALOGUE = 'permissionCatalogue';

export class PermissionRepoImpl implements PermissionRepo {
  private readonly ds: AppDataSource;

  constructor(ds: AppDataSource) {
    this.ds = ds;
  }

  listPermissionCategories(): Promise<Result<AppError, MultipleResult<PermissionCategory>>> {
    return guard(async () => {
      const docs = await this.ds.getCollection(PERMISSION_CATALOGUE);
      if (docs.length === 0) {
        await Promise.all(
          PERMISSION_CATALOGUE_SEED.map((cat) =>
            this.ds.addDocument(PERMISSION_CATALOGUE, permissionCategoryToDoc(cat)),
          ),
        );
        const seeded = await this.ds.getCollection(PERMISSION_CATALOGUE);
        return toMultipleResult(
          seeded.map(permissionCategoryFromDoc).sort((a, b) => a.order - b.order),
        );
      }

      // Merge: add any seed categories missing from Firestore (identified by label).
      const existing = docs.map(permissionCategoryFromDoc);
      const existingLabels = new Set(existing.map((c) => c.label));
      const missing = PERMISSION_CATALOGUE_SEED.filter((s) => !existingLabels.has(s.label));
      if (missing.length > 0) {
        await Promise.all(
          missing.map((cat) =>
            this.ds.addDocument(PERMISSION_CATALOGUE, permissionCategoryToDoc(cat)),
          ),
        );
        const updated = await this.ds.getCollection(PERMISSION_CATALOGUE);
        return toMultipleResult(
          updated.map(permissionCategoryFromDoc).sort((a, b) => a.order - b.order),
        );
      }

      return toMultipleResult(existing.sort((a, b) => a.order - b.order));
    });
  }
}
