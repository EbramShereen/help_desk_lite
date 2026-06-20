import { z } from 'zod';

export const teamInputSchema = z.object({
  label: z.string().min(2, 'Team name must be at least 2 characters'),
  teamLeaderId: z.string().min(1, 'Team leader is required'),
  memberIds: z.array(z.string()).min(1, 'At least one member is required'),
});
export type TeamInput = z.infer<typeof teamInputSchema>;

export const teamUpdateSchema = teamInputSchema.partial();
export type TeamUpdate = z.infer<typeof teamUpdateSchema>;

export function teamToDoc(
  input: TeamInput,
  managerId: string,
  employees: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    label: input.label,
    managerId,
    teamLeaderId: input.teamLeaderId,
    employees,
    memberCount: Object.keys(employees).length,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
