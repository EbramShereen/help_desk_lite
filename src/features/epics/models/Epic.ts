import { z } from 'zod';
import type { DocData } from '../../../core/firebase/FirestoreHandler';

export interface Epic {
  id: string;
  title: string;
  description: string;
  teamIds: string[];
  ticketIds: string[];
  createdBy: string;
  color: string | null;
  /** Optional span for the timeline / Gantt view. */
  startDate: number | null;
  endDate: number | null;
  createdAt: number;
  updatedAt: number;
}

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

export function epicFromDoc(doc: DocData): Epic {
  return {
    id: doc.id,
    title: String(doc.title ?? ''),
    description: String(doc.description ?? ''),
    teamIds: Array.isArray(doc.teamIds) ? doc.teamIds.map(String) : [],
    ticketIds: Array.isArray(doc.ticketIds) ? doc.ticketIds.map(String) : [],
    createdBy: String(doc.createdBy ?? ''),
    color: doc.color ? String(doc.color) : null,
    startDate: doc.startDate != null ? Number(doc.startDate) : null,
    endDate: doc.endDate != null ? Number(doc.endDate) : null,
    createdAt: Number(doc.createdAt ?? 0),
    updatedAt: Number(doc.updatedAt ?? 0),
  };
}

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
