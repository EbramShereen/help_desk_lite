import type {
  WorkflowStatus,
  WorkflowStatusInput,
  WorkflowStatusUpdate,
} from '../models/WorkflowStatus';
import type { Label, LabelInput, LabelUpdate } from '../models/Label';
import type { CustomRole, CustomRoleInput, CustomRoleUpdate } from '../models/CustomRole';
import type { PermissionCategory } from '../models/PermissionCatalogue';

/**
 * Admin-managed configuration: dynamic ticket statuses, global labels, and
 * custom roles. All persisted through AppDataSource — no direct Firebase access.
 */
export interface AdminConfigRepo {
  // Statuses (Kanban columns)
  listStatuses(): Promise<WorkflowStatus[]>;
  createStatus(input: WorkflowStatusInput): Promise<WorkflowStatus>;
  updateStatus(id: string, patch: WorkflowStatusUpdate): Promise<void>;
  deleteStatus(id: string): Promise<void>;

  // Labels
  listLabels(): Promise<Label[]>;
  createLabel(input: LabelInput): Promise<Label>;
  updateLabel(id: string, patch: LabelUpdate): Promise<void>;
  deleteLabel(id: string): Promise<void>;

  // Permission catalogue (stored in Firestore, seeded on first access)
  listPermissionCategories(): Promise<PermissionCategory[]>;

  // Custom roles
  listCustomRoles(): Promise<CustomRole[]>;
  getCustomRole(id: string): Promise<CustomRole | null>;
  createCustomRole(input: CustomRoleInput, createdBy: string): Promise<CustomRole>;
  updateCustomRole(id: string, patch: CustomRoleUpdate): Promise<void>;
  deleteCustomRole(id: string): Promise<void>;
  /**
   * Backfills the `permissionScopes` map onto any legacy role docs that predate
   * it (so Firestore rules can enforce them). Admin-only; idempotent. Returns the
   * number of roles updated.
   */
  migrateRolePermissionScopes(): Promise<number>;
}
