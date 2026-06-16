import { z } from 'zod';
import type { DocData } from '../../../core/firebase/FirestoreHandler';

/** Admin-managed global labels. Tickets reference these by id. */
export interface Label {
  id: string;
  name: string;
  color: string;
}

export const labelInputSchema = z.object({
  name: z.string().min(1, 'Label name is required'),
  color: z.string().min(1, 'Color is required'),
});
export type LabelInput = z.infer<typeof labelInputSchema>;

export const labelUpdateSchema = labelInputSchema.partial();
export type LabelUpdate = z.infer<typeof labelUpdateSchema>;

export function labelFromDoc(doc: DocData): Label {
  return {
    id: doc.id,
    name: String(doc.name ?? ''),
    color: String(doc.color ?? '#C9A86A'),
  };
}

export function labelToDoc(input: LabelInput): Record<string, unknown> {
  return { name: input.name, color: input.color, createdAt: Date.now() };
}
