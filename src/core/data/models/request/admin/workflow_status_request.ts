import { z } from 'zod';

export const workflowStatusInputSchema = z.object({
  name: z.string().min(2, 'Status name must be at least 2 characters'),
  color: z.string().min(1, 'Color is required'),
  order: z.number().int().nonnegative().optional(),
  isDone: z.boolean().optional(),
});
export type WorkflowStatusInput = z.infer<typeof workflowStatusInputSchema>;

export const workflowStatusUpdateSchema = workflowStatusInputSchema.partial();
export type WorkflowStatusUpdate = z.infer<typeof workflowStatusUpdateSchema>;

export function workflowStatusToDoc(input: WorkflowStatusInput): Record<string, unknown> {
  return {
    name: input.name,
    color: input.color,
    order: input.order ?? 0,
    isDone: input.isDone ?? false,
    createdAt: Date.now(),
  };
}
