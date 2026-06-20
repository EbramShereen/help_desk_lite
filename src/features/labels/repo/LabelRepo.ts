import type { Label } from '../../../core/data/models/response/admin/label_response';
import type {
  LabelInput,
  LabelUpdate,
} from '../../../core/data/models/request/admin/label_request';
import type { MultipleResult } from '../../../core/models/MultipleResult';
import type { Result, SuccessResult } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';

/**
 * Global ticket labels. Persisted through AppDataSource — no direct Firebase access.
 */
export interface LabelRepo {
  listLabels(): Promise<Result<AppError, MultipleResult<Label>>>;
  createLabel(input: LabelInput): Promise<Result<AppError, Label>>;
  updateLabel(id: string, patch: LabelUpdate): Promise<Result<AppError, SuccessResult>>;
  deleteLabel(id: string): Promise<Result<AppError, SuccessResult>>;
}
