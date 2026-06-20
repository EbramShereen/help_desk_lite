import { describe, it, expect, vi } from 'vitest';
import { AppDataSourceImpl } from './AppDataSourceImpl';
import type { AuthHandler } from '../firebase/AuthHandler';
import type { FirestoreHandler } from '../firebase/FirestoreHandler';
import type { AdminApiHandler } from '../api/AdminApiHandler';
import type { WorkspaceScope } from '../../workspace/WorkspaceScope';

const scope = (id: string | null): WorkspaceScope => ({ get: () => id, set: vi.fn() });
const admin = { deleteAuthUser: vi.fn() } as unknown as AdminApiHandler;

describe('AppDataSourceImpl', () => {
  it('nests workspace-scoped collections under the active workspace', async () => {
    const firestore = {
      getCollection: vi.fn().mockResolvedValue([{ id: '1', title: 'Ticket' }]),
    } as unknown as FirestoreHandler;

    const ds = new AppDataSourceImpl({} as AuthHandler, firestore, admin, scope('ws1'));
    const result = await ds.getCollection('tickets');

    expect(firestore.getCollection).toHaveBeenCalledWith('users/ws1/tickets', undefined);
    expect(result).toEqual([{ id: '1', title: 'Ticket' }]);
  });

  it('leaves global collections (users) unscoped', async () => {
    const firestore = {
      getById: vi.fn().mockResolvedValue({ id: 'u1' }),
    } as unknown as FirestoreHandler;

    const ds = new AppDataSourceImpl({} as AuthHandler, firestore, admin, scope('ws1'));
    await ds.getDocument('users', 'u1');

    expect(firestore.getById).toHaveBeenCalledWith('users', 'u1');
  });

  it('throws when a scoped collection is accessed with no active workspace', async () => {
    const firestore = { getCollection: vi.fn() } as unknown as FirestoreHandler;
    const ds = new AppDataSourceImpl({} as AuthHandler, firestore, admin, scope(null));

    expect(() => ds.getCollection('tickets')).toThrow(/workspace/i);
    expect(firestore.getCollection).not.toHaveBeenCalled();
  });

  it('delegates sign-in to the AuthHandler', async () => {
    const user = { uid: 'u1' };
    const auth = { signIn: vi.fn().mockResolvedValue(user) } as unknown as AuthHandler;

    const ds = new AppDataSourceImpl(auth, {} as FirestoreHandler, admin, scope(null));
    const creds = { email: 'a@b.com', password: 'secret' };
    await expect(ds.signIn(creds)).resolves.toBe(user);
    expect(auth.signIn).toHaveBeenCalledWith(creds);
  });
});
