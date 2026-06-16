import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { useAppSelector } from '../../../app/hooks';
import type { SprintInput, SprintUpdate } from '../models/Sprint';

const SPRINTS_KEY = 'sprints';
const TICKETS_KEY = 'tickets';

export function useSprintController() {
  const repo = useInjected(TOKENS.SprintRepo);
  const qc = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);

  const role = user?.role;
  const uid = user?.uid ?? '';
  const teamId = user?.teamId ?? undefined;

  const sprintsQuery = useQuery({
    queryKey: [SPRINTS_KEY, role, uid, teamId],
    queryFn: () => {
      if (role === 'admin') return repo.listSprints();
      if (teamId) return repo.listSprints(teamId);
      return repo.listSprintsForMember(uid);
    },
    enabled: !!user,
  });

  const createSprint = useMutation({
    mutationFn: (input: SprintInput) => repo.createSprint(input, uid),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SPRINTS_KEY] }),
  });

  const updateSprint = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: SprintUpdate }) =>
      repo.updateSprint(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SPRINTS_KEY] }),
  });

  const deleteSprint = useMutation({
    mutationFn: (id: string) => repo.deleteSprint(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SPRINTS_KEY] });
      qc.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
  });

  const addTicketToSprint = useMutation({
    mutationFn: ({
      sprintId,
      ticketId,
      assigneeIds,
    }: {
      sprintId: string;
      ticketId: string;
      assigneeIds: string[];
    }) => repo.addTicketToSprint(sprintId, ticketId, assigneeIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SPRINTS_KEY] });
      qc.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
  });

  const removeTicketFromSprint = useMutation({
    mutationFn: ({ sprintId, ticketId }: { sprintId: string; ticketId: string }) =>
      repo.removeTicketFromSprint(sprintId, ticketId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SPRINTS_KEY] });
      qc.invalidateQueries({ queryKey: [TICKETS_KEY] });
    },
  });

  return {
    sprintsQuery,
    createSprint,
    updateSprint,
    deleteSprint,
    addTicketToSprint,
    removeTicketFromSprint,
    user,
  };
}

export function useSprintDetailController(sprintId: string) {
  const repo = useInjected(TOKENS.SprintRepo);
  const qc = useQueryClient();

  const sprintQuery = useQuery({
    queryKey: [SPRINTS_KEY, sprintId],
    queryFn: () => repo.getSprint(sprintId),
    enabled: !!sprintId,
  });

  const updateSprint = useMutation({
    mutationFn: (patch: SprintUpdate) => repo.updateSprint(sprintId, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SPRINTS_KEY, sprintId] });
      qc.invalidateQueries({ queryKey: [SPRINTS_KEY] });
    },
  });

  return { sprintQuery, updateSprint };
}
