import type { DocData } from '../../../firebase/FirestoreHandler';
import type { TeamRole } from '../../../../enums/teams/team_role';

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
