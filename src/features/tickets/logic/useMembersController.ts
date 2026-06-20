import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { useTeamMembersController } from '../../teams/logic/useTeamMembersController';
import { unwrap } from '../../../core/models/Result';

export function useMembersController(teamId?: string) {
  const teamScoped = useTeamMembersController(teamId);

  const authRepo = useInjected(TOKENS.AuthRepo);
  const allUsersQuery = useQuery({
    queryKey: ['members'],
    queryFn: () => unwrap(authRepo.listUsers()),
    enabled: !teamId,
    select: (result) => result.items,
  });

  const fallbackOptions = useMemo(
    () =>
      (allUsersQuery.data ?? [])
        .filter((u) => u.role !== 'pending')
        .map((u) => ({ label: u.displayName || u.email, value: u.uid })),
    [allUsersQuery.data],
  );

  if (teamId) {
    return { memberOptions: teamScoped.memberOptions, isLoading: teamScoped.isLoading };
  }

  return { memberOptions: fallbackOptions, isLoading: allUsersQuery.isLoading };
}
