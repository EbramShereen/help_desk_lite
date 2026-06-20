import type { DocData } from '../../../firebase/FirestoreHandler';

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
