import type { WorkflowStatus } from '../../../core/data/models/response/admin/workflow_status_response';
import type {
  WorkflowStatusInput,
  WorkflowStatusUpdate,
} from '../../../core/data/models/request/admin/workflow_status_request';
import type { MultipleResult } from '../../../core/models/MultipleResult';
import type { Result, SuccessResult } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';

/**
 * Dynamic ticket statuses (Kanban columns). Persisted through AppDataSource —
 * no direct Firebase access.
 */
export interface WorkflowRepo {
  listStatuses(): Promise<Result<AppError, MultipleResult<WorkflowStatus>>>;
  createStatus(input: WorkflowStatusInput): Promise<Result<AppError, WorkflowStatus>>;
  updateStatus(id: string, patch: WorkflowStatusUpdate): Promise<Result<AppError, SuccessResult>>;
  deleteStatus(id: string): Promise<Result<AppError, SuccessResult>>;
}
