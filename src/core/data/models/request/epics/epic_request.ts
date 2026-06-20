import { z } from 'zod';

export const epicInputSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required'),
  color: z.string().nullable().optional(),
  startDate: z.number().nullable().optional(),
  endDate: z.number().nullable().optional(),
});
export type EpicInput = z.infer<typeof epicInputSchema>;

export const epicUpdateSchema = epicInputSchema.partial();
export type EpicUpdate = z.infer<typeof epicUpdateSchema>;

export function epicToDoc(input: EpicInput, createdBy: string): Record<string, unknown> {
  return {
    title: input.title,
    description: input.description,
    color: input.color ?? null,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
    teamIds: [],
    ticketIds: [],
    createdBy,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
