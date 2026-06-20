import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { unwrap } from '../../../core/models/Result';
import type { Role } from '../../../core/enums/auth/role';
import type { CreateUserInput } from '../../../core/data/models/request/auth/auth_request';

export function useAdminUsersController() {
  const repo = useInjected(TOKENS.AuthRepo);
  const qc = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => unwrap(repo.listUsers()),
    select: (result) => result.items,
  });

  const createUser = useMutation({
    mutationFn: ({ email, password, role }: CreateUserInput) =>
      unwrap(repo.createUser(email, password, role)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const setUserRole = useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: Role }) => unwrap(repo.setUserRole(uid, role)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const setUserCustomRole = useMutation({
    mutationFn: ({ uid, customRoleId }: { uid: string; customRoleId: string | null }) =>
      unwrap(repo.setUserCustomRole(uid, customRoleId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const deleteUser = useMutation({
    mutationFn: (uid: string) => unwrap(repo.deleteUser(uid)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  return {
    users: usersQuery.data ?? [],
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    createUser,
    setUserRole,
    setUserCustomRole,
    deleteUser,
  };
}
