import { z } from 'zod';
import type { DocData } from '../../../core/firebase/FirestoreHandler';

export type TeamRole = 'team_leader' | 'member';

export interface TeamEmployee {
  name: string;
  photoUrl: string | null;
  role: TeamRole;
}

export interface Team {
  id: string;
  label: string;
  managerId: string;
  teamLeaderId: string;
  memberCount: number;
  employees: Record<string, TeamEmployee>;
  createdAt: number;
  updatedAt: number;
}

export const teamInputSchema = z.object({
  label: z.string().min(2, 'Team name must be at least 2 characters'),
  teamLeaderId: z.string().min(1, 'Team leader is required'),
  memberIds: z.array(z.string()).min(1, 'At least one member is required'),
});
export type TeamInput = z.infer<typeof teamInputSchema>;

export const teamUpdateSchema = teamInputSchema.partial();
export type TeamUpdate = z.infer<typeof teamUpdateSchema>;

function parseEmployees(raw: unknown): Record<string, TeamEmployee> {
  if (!raw || typeof raw !== 'object') return {};
  const result: Record<string, TeamEmployee> = {};
  for (const [uid, val] of Object.entries(raw as Record<string, unknown>)) {
    const v = val as Record<string, unknown>;
    result[uid] = {
      name: String(v.name ?? ''),
      photoUrl: v.photoUrl ? String(v.photoUrl) : null,
      role: (v.role as TeamRole) ?? 'member',
    };
  }
  return result;
}

export function teamFromDoc(doc: DocData): Team {
  return {
    id: doc.id,
    label: String(doc.label ?? ''),
    managerId: String(doc.managerId ?? ''),
    teamLeaderId: String(doc.teamLeaderId ?? ''),
    memberCount: Number(doc.memberCount ?? 0),
    employees: parseEmployees(doc.employees),
    createdAt: Number(doc.createdAt ?? 0),
    updatedAt: Number(doc.updatedAt ?? 0),
  };
}

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
