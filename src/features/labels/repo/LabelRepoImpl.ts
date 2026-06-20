import type { AppDataSource } from '../../../core/data/datasource/AppDataSource';
import type { LabelRepo } from './LabelRepo';
import { toMultipleResult, type MultipleResult } from '../../../core/models/MultipleResult';
import { guard, success, type Result, type SuccessResult } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';
import { labelFromDoc, type Label } from '../../../core/data/models/response/admin/label_response';
import {
  labelToDoc,
  type LabelInput,
  type LabelUpdate,
} from '../../../core/data/models/request/admin/label_request';

const LABELS = 'labels';

export class LabelRepoImpl implements LabelRepo {
  private readonly ds: AppDataSource;

  constructor(ds: AppDataSource) {
    this.ds = ds;
  }

  listLabels(): Promise<Result<AppError, MultipleResult<Label>>> {
    return guard(async () =>
      toMultipleResult((await this.ds.getCollection(LABELS)).map(labelFromDoc)),
    );
  }

  createLabel(input: LabelInput): Promise<Result<AppError, Label>> {
    return guard(async () => {
      const data = labelToDoc(input);
      const id = await this.ds.addDocument(LABELS, data);
      return labelFromDoc({ id, ...data });
    });
  }

  updateLabel(id: string, patch: LabelUpdate): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.updateDocument(LABELS, id, { ...patch });
      return success;
    });
  }

  deleteLabel(id: string): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.deleteDocument(LABELS, id);
      return success;
    });
  }
}
