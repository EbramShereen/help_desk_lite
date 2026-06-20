import { describe, it, expect, vi } from 'vitest';
import { WorkflowRepoImpl } from './WorkflowRepoImpl';
import type { AppDataSource } from '../../../core/data/datasource/AppDataSource';
import { DEFAULT_STATUSES } from '../../../core/data/models/response/admin/workflow_status_response';

function makeDs(overrides: Partial<AppDataSource> = {}): AppDataSource {
  return {
    getCollection: vi.fn().mockResolvedValue([]),
    getDocument: vi.fn().mockResolvedValue(null),
    addDocument: vi.fn().mockResolvedValue('new-id'),
    updateDocument: vi.fn().mockResolvedValue(undefined),
    deleteDocument: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as AppDataSource;
}

describe('WorkflowRepoImpl', () => {
  it('falls back to seeded default statuses when none are stored', async () => {
    const repo = new WorkflowRepoImpl(makeDs());
    const result = (await repo.listStatuses()).getSuccess()!;
    expect(result.items).toEqual(DEFAULT_STATUSES);
  });

  it('returns stored statuses sorted by order when present', async () => {
    const ds = makeDs({
      getCollection: vi.fn().mockResolvedValue([
        { id: 'b', name: 'B', color: '#000', order: 2, isDone: false },
        { id: 'a', name: 'A', color: '#000', order: 1, isDone: false },
      ]),
    });
    const repo = new WorkflowRepoImpl(ds);
    const result = (await repo.listStatuses()).getSuccess()!;
    expect(result.items.map((s) => s.id)).toEqual(['a', 'b']);
  });
});
