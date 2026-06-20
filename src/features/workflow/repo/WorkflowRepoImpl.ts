import type { AppDataSource } from '../../../core/data/datasource/AppDataSource';
import type { WorkflowRepo } from './WorkflowRepo';
import { toMultipleResult, type MultipleResult } from '../../../core/models/MultipleResult';
import { guard, success, type Result, type SuccessResult } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';
import {
  workflowStatusFromDoc,
  DEFAULT_STATUSES,
  type WorkflowStatus,
} from '../../../core/data/models/response/admin/workflow_status_response';
import {
  workflowStatusToDoc,
  type WorkflowStatusInput,
  type WorkflowStatusUpdate,
} from '../../../core/data/models/request/admin/workflow_status_request';

const STATUSES = 'statuses';

export class WorkflowRepoImpl implements WorkflowRepo {
  private readonly ds: AppDataSource;

  constructor(ds: AppDataSource) {
    this.ds = ds;
  }

  listStatuses(): Promise<Result<AppError, MultipleResult<WorkflowStatus>>> {
    return guard(async () => {
      const docs = (await this.ds.getCollection(STATUSES)).map(workflowStatusFromDoc);
      // Fall back to seeded defaults so the board always has columns before an
      // admin customises them.
      const list = docs.length ? docs : DEFAULT_STATUSES;
      return toMultipleResult([...list].sort((a, b) => a.order - b.order));
    });
  }

  createStatus(input: WorkflowStatusInput): Promise<Result<AppError, WorkflowStatus>> {
    return guard(async () => {
      await this.ensureMaterialized();
      const data = workflowStatusToDoc(input);
      const id = await this.ds.addDocument(STATUSES, data);
      return workflowStatusFromDoc({ id, ...data });
    });
  }

  /**
   * Until an admin customises statuses, the board runs on virtual
   * `DEFAULT_STATUSES` with no Firestore docs. Editing/deleting one of them
   * requires real docs — but writing a single doc makes the collection
   * non-empty and hides the remaining defaults. So on first mutation we persist
   * ALL defaults under their legacy ids (todo/inProgress/…), keeping every
   * ticket's column mapping intact. Idempotent: no-op once docs exist.
   */
  private async ensureMaterialized(): Promise<void> {
    const docs = await this.ds.getCollection(STATUSES);
    if (docs.length) return;
    await Promise.all(
      DEFAULT_STATUSES.map((s) =>
        this.ds.setDocument(STATUSES, s.id, {
          name: s.name,
          color: s.color,
          order: s.order,
          isDone: s.isDone,
          createdAt: Date.now(),
        }),
      ),
    );
  }

  updateStatus(id: string, patch: WorkflowStatusUpdate): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ensureMaterialized();
      await this.ds.updateDocument(STATUSES, id, { ...patch });
      return success;
    });
  }

  deleteStatus(id: string): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ensureMaterialized();
      await this.ds.deleteDocument(STATUSES, id);
      return success;
    });
  }
}
