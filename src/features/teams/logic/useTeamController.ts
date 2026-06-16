import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { useAppSelector } from '../../../app/hooks';
import type { TeamInput, TeamUpdate, TeamEmployee } from '../models/Team';

const TEAMS_KEY = 'teams';

export function useTeamController(managerId?: string) {
  const repo = useInjected(TOKENS.TeamRepo);
  const qc = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);

  const teamsQuery = useQuery({
    queryKey: [TEAMS_KEY, managerId],
    queryFn: () => repo.listTeams(managerId),
  });

  const createTeam = useMutation({
    mutationFn: (input: TeamInput) => repo.createTeam(input, user!.uid),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEAMS_KEY] }),
  });

  const updateTeam = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: TeamUpdate }) => repo.updateTeam(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEAMS_KEY] }),
  });

  const deleteTeam = useMutation({
    mutationFn: (id: string) => repo.deleteTeam(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEAMS_KEY] }),
  });

  const addMember = useMutation({
    mutationFn: ({
      teamId,
      userId,
      employee,
    }: {
      teamId: string;
      userId: string;
      employee: TeamEmployee;
    }) => repo.addMember(teamId, userId, employee),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TEAMS_KEY] });
      qc.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const removeMember = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      repo.removeMember(teamId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TEAMS_KEY] });
      qc.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const setTeamLeader = useMutation({
    mutationFn: ({
      teamId,
      userId,
      employee,
    }: {
      teamId: string;
      userId: string;
      employee: TeamEmployee;
    }) => repo.setTeamLeader(teamId, userId, employee),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEAMS_KEY] }),
  });

  return {
    teamsQuery,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember,
    setTeamLeader,
    user,
  };
}

export function useTeamDetailController(teamId: string) {
  const repo = useInjected(TOKENS.TeamRepo);
  const qc = useQueryClient();

  const teamQuery = useQuery({
    queryKey: [TEAMS_KEY, teamId],
    queryFn: () => repo.getTeam(teamId),
    enabled: !!teamId,
  });

  const updateTeam = useMutation({
    mutationFn: (patch: TeamUpdate) => repo.updateTeam(teamId, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TEAMS_KEY, teamId] });
      qc.invalidateQueries({ queryKey: [TEAMS_KEY] });
    },
  });

  return { teamQuery, updateTeam };
}
