import { z } from 'zod';
import type { DocData } from '../../../core/firebase/FirestoreHandler';
import type { TicketStatus } from './Ticket';
import { TICKET_STATUSES } from './Ticket';

export interface SubTicket {
  id: string;
  title: string;
  assignedTo: string;
  deadline: number;
  status: TicketStatus;
  createdBy: string;
  createdAt: number;
}

export const subTicketInputSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  assignedTo: z.string().min(1, 'Assignee is required'),
  deadline: z.number().positive(),
  status: z.enum(TICKET_STATUSES),
});
export type SubTicketInput = z.infer<typeof subTicketInputSchema>;

export function subTicketFromDoc(doc: DocData): SubTicket {
  return {
    id: doc.id,
    title: String(doc.title ?? ''),
    assignedTo: String(doc.assignedTo ?? ''),
    deadline: Number(doc.deadline ?? 0),
    status: (doc.status as TicketStatus) ?? 'planning',
    createdBy: String(doc.createdBy ?? ''),
    createdAt: Number(doc.createdAt ?? 0),
  };
}

export function subTicketToDoc(input: SubTicketInput, createdBy: string): Record<string, unknown> {
  return { ...input, createdBy, createdAt: Date.now() };
}
