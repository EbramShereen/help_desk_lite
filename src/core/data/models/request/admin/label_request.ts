import { z } from 'zod';

export const labelInputSchema = z.object({
  name: z.string().min(1, 'Label name is required'),
  color: z.string().min(1, 'Color is required'),
});
export type LabelInput = z.infer<typeof labelInputSchema>;

export const labelUpdateSchema = labelInputSchema.partial();
export type LabelUpdate = z.infer<typeof labelUpdateSchema>;

export function labelToDoc(input: LabelInput): Record<string, unknown> {
  return { name: input.name, color: input.color, createdAt: Date.now() };
}
