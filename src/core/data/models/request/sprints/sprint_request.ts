import { z } from 'zod';
import { SPRINT_STATES } from '../../../../enums/sprints/sprint_state';

export const sprintInputSchema = z.object({
  name: z.string().min(3, 'Sprint name must be at least 3 characters'),
  startDate: z.number().positive('Start date is required'),
  endDate: z.number().positive('End date is required'),
  teamId: z.string().min(1, 'Team is required'),
  sprintGoal: z.string().optional(),
  state: z.enum(SPRINT_STATES).optional(),
});
export type SprintInput = z.infer<typeof sprintInputSchema>;

export const sprintUpdateSchema = sprintInputSchema.partial().omit({ teamId: true });
export type SprintUpdate = z.infer<typeof sprintUpdateSchema>;

export function sprintToDoc(input: SprintInput, createdBy: string): Record<string, unknown> {
  return {
    name: input.name,
    startDate: input.startDate,
    endDate: input.endDate,
    teamId: input.teamId,
    sprintGoal: input.sprintGoal ?? '',
    state: input.state ?? 'planned',
    createdBy,
    ticketIds: [],
    assignedMemberIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
