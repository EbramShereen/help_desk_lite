import type { AppDataSource } from '../../../core/datasource/AppDataSource';
import type { AdminConfigRepo } from '../repo/AdminConfigRepo';
import {
  workflowStatusFromDoc,
  workflowStatusToDoc,
  DEFAULT_STATUSES,
  type WorkflowStatus,
  type WorkflowStatusInput,
  type WorkflowStatusUpdate,
} from '../models/WorkflowStatus';
import {
  labelFromDoc,
  labelToDoc,
  type Label,
  type LabelInput,
  type LabelUpdate,
} from '../models/Label';
import {
  customRoleFromDoc,
  customRoleToDoc,
  permissionScopesMap,
  type CustomRole,
  type CustomRoleInput,
  type CustomRoleUpdate,
} from '../models/CustomRole';
import {
  permissionCategoryFromDoc,
  permissionCategoryToDoc,
  type PermissionCategory,
} from '../models/PermissionCatalogue';
import { PERMISSION_CATALOGUE_SEED } from '../models/permissionCatalogueSeed';

const STATUSES = 'statuses';
const LABELS = 'labels';
const ROLES = 'roles';
const PERMISSION_CATALOGUE = 'permissionCatalogue';

export class AdminConfigRepoImpl implements AdminConfigRepo {
  private readonly ds: AppDataSource;

  constructor(ds: AppDataSource) {
    this.ds = ds;
  }

  // --- Statuses ---

  async listStatuses(): Promise<WorkflowStatus[]> {
    const docs = (await this.ds.getCollection(STATUSES)).map(workflowStatusFromDoc);
    // Fall back to seeded defaults so the board always has columns before an
    // admin customises them.
    const list = docs.length ? docs : DEFAULT_STATUSES;
    return [...list].sort((a, b) => a.order - b.order);
  }

  async createStatus(input: WorkflowStatusInput): Promise<WorkflowStatus> {
    const data = workflowStatusToDoc(input);
    const id = await this.ds.addDocument(STATUSES, data);
    return workflowStatusFromDoc({ id, ...data });
  }

  async updateStatus(id: string, patch: WorkflowStatusUpdate): Promise<void> {
    await this.ds.updateDocument(STATUSES, id, { ...patch });
  }

  async deleteStatus(id: string): Promise<void> {
    await this.ds.deleteDocument(STATUSES, id);
  }

  // --- Permission catalogue ---

  async listPermissionCategories(): Promise<PermissionCategory[]> {
    const docs = await this.ds.getCollection(PERMISSION_CATALOGUE);
    if (docs.length === 0) {
      await Promise.all(
        PERMISSION_CATALOGUE_SEED.map((cat) =>
          this.ds.addDocument(PERMISSION_CATALOGUE, permissionCategoryToDoc(cat)),
        ),
      );
      const seeded = await this.ds.getCollection(PERMISSION_CATALOGUE);
      return seeded.map(permissionCategoryFromDoc).sort((a, b) => a.order - b.order);
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
      return updated.map(permissionCategoryFromDoc).sort((a, b) => a.order - b.order);
    }

    return existing.sort((a, b) => a.order - b.order);
  }

  // --- Labels ---

  async listLabels(): Promise<Label[]> {
    return (await this.ds.getCollection(LABELS)).map(labelFromDoc);
  }

  async createLabel(input: LabelInput): Promise<Label> {
    const data = labelToDoc(input);
    const id = await this.ds.addDocument(LABELS, data);
    return labelFromDoc({ id, ...data });
  }

  async updateLabel(id: string, patch: LabelUpdate): Promise<void> {
    await this.ds.updateDocument(LABELS, id, { ...patch });
  }

  async deleteLabel(id: string): Promise<void> {
    await this.ds.deleteDocument(LABELS, id);
  }

  // --- Custom roles ---

  async listCustomRoles(): Promise<CustomRole[]> {
    return (await this.ds.getCollection(ROLES)).map(customRoleFromDoc);
  }

  async getCustomRole(id: string): Promise<CustomRole | null> {
    const doc = await this.ds.getDocument(ROLES, id);
    return doc ? customRoleFromDoc(doc) : null;
  }

  async createCustomRole(input: CustomRoleInput, createdBy: string): Promise<CustomRole> {
    const data = customRoleToDoc(input, createdBy);
    const id = await this.ds.addDocument(ROLES, data);
    return customRoleFromDoc({ id, ...data });
  }

  async updateCustomRole(id: string, patch: CustomRoleUpdate): Promise<void> {
    // Keep the rules-facing `permissionScopes` map in sync whenever grants change.
    const data: Record<string, unknown> = { ...patch, updatedAt: Date.now() };
    if (patch.permissions) data.permissionScopes = permissionScopesMap(patch.permissions);
    await this.ds.updateDocument(ROLES, id, data);
  }

  async deleteCustomRole(id: string): Promise<void> {
    await this.ds.deleteDocument(ROLES, id);
  }

  async migrateRolePermissionScopes(): Promise<number> {
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
  }
}
