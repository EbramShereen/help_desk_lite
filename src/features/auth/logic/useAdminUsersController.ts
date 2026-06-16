import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import type { Role } from '../models/Role';
import type { CreateUserInput } from '../models/schemas';

export function useAdminUsersController() {
  const repo = useInjected(TOKENS.AuthRepo);
  const qc = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => repo.listUsers(),
  });

  const createUser = useMutation({
    mutationFn: ({ email, password, role }: CreateUserInput) =>
      repo.createUser(email, password, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const setUserRole = useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: Role }) => repo.setUserRole(uid, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const setUserCustomRole = useMutation({
    mutationFn: ({ uid, customRoleId }: { uid: string; customRoleId: string | null }) =>
      repo.setUserCustomRole(uid, customRoleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const deleteUser = useMutation({
    mutationFn: (uid: string) => repo.deleteUser(uid),
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
