import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { useAppSelector } from '../../../app/hooks';
import { unwrap } from '../../../core/models/Result';
import type { EpicInput, EpicUpdate } from '../../../core/data/models/request/epics/epic_request';

const EPICS_KEY = 'epics';

export function useEpicController(teamId?: string) {
  const repo = useInjected(TOKENS.EpicRepo);
  const qc = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);

  const epicsQuery = useQuery({
    queryKey: [EPICS_KEY, teamId],
    queryFn: () => unwrap(repo.listEpics(teamId)),
    select: (result) => result.items,
  });

  const createEpic = useMutation({
    mutationFn: (input: EpicInput) => unwrap(repo.createEpic(input, user!.uid)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EPICS_KEY] }),
  });

  const updateEpic = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: EpicUpdate }) =>
      unwrap(repo.updateEpic(id, patch)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EPICS_KEY] }),
  });

  const deleteEpic = useMutation({
    mutationFn: (id: string) => unwrap(repo.deleteEpic(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EPICS_KEY] }),
  });

  const assignTeams = useMutation({
    mutationFn: ({ id, teamIds }: { id: string; teamIds: string[] }) =>
      unwrap(repo.assignTeams(id, teamIds)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EPICS_KEY] }),
  });

  const removeTeam = useMutation({
    mutationFn: ({ id, teamId }: { id: string; teamId: string }) =>
      unwrap(repo.removeTeam(id, teamId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EPICS_KEY] }),
  });

  const addTickets = useMutation({
    mutationFn: ({ id, ticketIds }: { id: string; ticketIds: string[] }) =>
      unwrap(repo.addTickets(id, ticketIds)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EPICS_KEY] }),
  });

  const removeTicket = useMutation({
    mutationFn: ({ id, ticketId }: { id: string; ticketId: string }) =>
      unwrap(repo.removeTicket(id, ticketId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EPICS_KEY] }),
  });

  return {
    epicsQuery,
    createEpic,
    updateEpic,
    deleteEpic,
    assignTeams,
    removeTeam,
    addTickets,
    removeTicket,
    user,
  };
}

export function useEpicDetailController(epicId: string) {
  const repo = useInjected(TOKENS.EpicRepo);
  const qc = useQueryClient();

  const epicQuery = useQuery({
    queryKey: [EPICS_KEY, epicId],
    queryFn: () => unwrap(repo.getEpic(epicId)),
    enabled: !!epicId,
  });

  const updateEpic = useMutation({
    mutationFn: (patch: EpicUpdate) => unwrap(repo.updateEpic(epicId, patch)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EPICS_KEY, epicId] });
      qc.invalidateQueries({ queryKey: [EPICS_KEY] });
    },
  });

  const deleteEpic = useMutation({
    mutationFn: () => unwrap(repo.deleteEpic(epicId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EPICS_KEY] }),
  });

  const assignTeams = useMutation({
    mutationFn: (teamIds: string[]) => unwrap(repo.assignTeams(epicId, teamIds)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EPICS_KEY, epicId] });
      qc.invalidateQueries({ queryKey: [EPICS_KEY] });
    },
  });

  const removeTeam = useMutation({
    mutationFn: (teamId: string) => unwrap(repo.removeTeam(epicId, teamId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EPICS_KEY, epicId] });
      qc.invalidateQueries({ queryKey: [EPICS_KEY] });
    },
  });

  const addTickets = useMutation({
    mutationFn: (ticketIds: string[]) => unwrap(repo.addTickets(epicId, ticketIds)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EPICS_KEY, epicId] });
      qc.invalidateQueries({ queryKey: [EPICS_KEY] });
    },
  });

  const removeTicket = useMutation({
    mutationFn: (ticketId: string) => unwrap(repo.removeTicket(epicId, ticketId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EPICS_KEY, epicId] });
      qc.invalidateQueries({ queryKey: [EPICS_KEY] });
    },
  });

  return { epicQuery, updateEpic, deleteEpic, assignTeams, removeTeam, addTickets, removeTicket };
}
