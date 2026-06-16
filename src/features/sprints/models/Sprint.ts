import { z } from 'zod';
import type { DocData } from '../../../core/firebase/FirestoreHandler';

export const SPRINT_STATES = ['planned', 'active', 'completed'] as const;
export type SprintState = (typeof SPRINT_STATES)[number];

export interface Sprint {
  id: string;
  name: string;
  startDate: number;
  endDate: number;
  teamId: string;
  createdBy: string;
  sprintGoal: string;
  state: SprintState;
  ticketIds: string[];
  assignedMemberIds: string[];
  createdAt: number;
  updatedAt: number;
}

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

function toStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(String);
}

function parseState(raw: unknown): SprintState {
  const s = String(raw ?? 'planned');
  return (SPRINT_STATES as readonly string[]).includes(s) ? (s as SprintState) : 'planned';
}

export function sprintFromDoc(doc: DocData): Sprint {
  return {
    id: doc.id,
    name: String(doc.name ?? ''),
    startDate: Number(doc.startDate ?? 0),
    endDate: Number(doc.endDate ?? 0),
    teamId: String(doc.teamId ?? ''),
    createdBy: String(doc.createdBy ?? ''),
    sprintGoal: String(doc.sprintGoal ?? ''),
    state: parseState(doc.state),
    ticketIds: toStringArray(doc.ticketIds),
    assignedMemberIds: toStringArray(doc.assignedMemberIds),
    createdAt: Number(doc.createdAt ?? 0),
    updatedAt: Number(doc.updatedAt ?? 0),
  };
}

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
