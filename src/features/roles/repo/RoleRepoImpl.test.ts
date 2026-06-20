import { describe, it, expect, vi } from 'vitest';
import { RoleRepoImpl } from './RoleRepoImpl';
import type { AppDataSource } from '../../../core/data/datasource/AppDataSource';

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

describe('RoleRepoImpl', () => {
  it('creates a custom role with the creator stamped on the doc', async () => {
    const addDocument = vi.fn().mockResolvedValue('role-1');
    const repo = new RoleRepoImpl(makeDs({ addDocument }));
    const grant = { key: 'can_comment' as const, scopeIds: [] };
    const role = (
      await repo.createCustomRole({ name: 'QA', permissions: [grant] }, 'uid-9')
    ).getSuccess()!;
    expect(addDocument).toHaveBeenCalledWith(
      'roles',
      expect.objectContaining({ createdBy: 'uid-9', name: 'QA' }),
    );
    expect(role.id).toBe('role-1');
    expect(role.permissions).toEqual([grant]);
  });
});
