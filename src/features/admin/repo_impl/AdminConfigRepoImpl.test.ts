import { describe, it, expect, vi } from 'vitest';
import { AdminConfigRepoImpl } from './AdminConfigRepoImpl';
import type { AppDataSource } from '../../../core/datasource/AppDataSource';
import { DEFAULT_STATUSES } from '../models/WorkflowStatus';

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

describe('AdminConfigRepoImpl', () => {
  it('falls back to seeded default statuses when none are stored', async () => {
    const repo = new AdminConfigRepoImpl(makeDs());
    const statuses = await repo.listStatuses();
    expect(statuses).toEqual(DEFAULT_STATUSES);
  });

  it('returns stored statuses sorted by order when present', async () => {
    const ds = makeDs({
      getCollection: vi.fn().mockResolvedValue([
        { id: 'b', name: 'B', color: '#000', order: 2, isDone: false },
        { id: 'a', name: 'A', color: '#000', order: 1, isDone: false },
      ]),
    });
    const repo = new AdminConfigRepoImpl(ds);
    const statuses = await repo.listStatuses();
    expect(statuses.map((s) => s.id)).toEqual(['a', 'b']);
  });

  it('creates a custom role with the creator stamped on the doc', async () => {
    const addDocument = vi.fn().mockResolvedValue('role-1');
    const repo = new AdminConfigRepoImpl(makeDs({ addDocument }));
    const grant = { key: 'can_comment' as const, scopeIds: [] };
    const role = await repo.createCustomRole({ name: 'QA', permissions: [grant] }, 'uid-9');
    expect(addDocument).toHaveBeenCalledWith(
      'roles',
      expect.objectContaining({ createdBy: 'uid-9', name: 'QA' }),
    );
    expect(role.id).toBe('role-1');
    expect(role.permissions).toEqual([grant]);
  });
});
