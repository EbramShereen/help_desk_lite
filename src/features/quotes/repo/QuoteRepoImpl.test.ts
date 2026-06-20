import { describe, it, expect, vi } from 'vitest';
import { QuoteRepoImpl } from './QuoteRepoImpl';
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

describe('QuoteRepoImpl', () => {
  it('maps stored docs to quotes via the `quotes` root', async () => {
    const getCollection = vi
      .fn()
      .mockResolvedValue([{ id: 'q1', text: 'Hello', author: 'Ada', createdAt: 5 }]);
    const repo = new QuoteRepoImpl(makeDs({ getCollection }));

    const result = (await repo.listQuotes()).getSuccess()!;

    expect(getCollection).toHaveBeenCalledWith('quotes');
    expect(result.items).toEqual([{ id: 'q1', text: 'Hello', author: 'Ada', createdAt: 5 }]);
  });

  it('createManyQuotes writes one document per input', async () => {
    const addDocument = vi.fn().mockResolvedValue('id');
    const repo = new QuoteRepoImpl(makeDs({ addDocument }));

    await repo.createManyQuotes([{ text: 'A', author: 'X' }, { text: 'B' }]);

    expect(addDocument).toHaveBeenCalledTimes(2);
    expect(addDocument).toHaveBeenCalledWith('quotes', expect.objectContaining({ text: 'A' }));
    // Missing author falls back to 'Unknown'.
    expect(addDocument).toHaveBeenCalledWith(
      'quotes',
      expect.objectContaining({ author: 'Unknown' }),
    );
  });
});
