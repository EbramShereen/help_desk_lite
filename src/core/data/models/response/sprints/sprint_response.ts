import type { DocData } from '../../../firebase/FirestoreHandler';
import type { SprintState } from '../../../../enums/sprints/sprint_state';
import { SPRINT_STATES } from '../../../../enums/sprints/sprint_state';

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
