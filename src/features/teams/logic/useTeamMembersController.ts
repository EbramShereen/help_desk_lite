import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { unwrap } from '../../../core/models/Result';

const TEAMS_KEY = 'teams';

export function useTeamMembersController(teamId: string | undefined) {
  const repo = useInjected(TOKENS.TeamRepo);

  const teamQuery = useQuery({
    queryKey: [TEAMS_KEY, teamId],
    queryFn: () => unwrap(repo.getTeam(teamId!)),
    enabled: !!teamId,
  });

  const memberOptions = useMemo(() => {
    const employees = teamQuery.data?.employees ?? {};
    return Object.entries(employees).map(([uid, emp]) => ({
      label: emp.name || uid,
      value: uid,
    }));
  }, [teamQuery.data]);

  return { memberOptions, isLoading: teamQuery.isLoading };
}
