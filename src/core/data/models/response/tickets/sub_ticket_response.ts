import type { DocData } from '../../../firebase/FirestoreHandler';
import type { TicketStatus } from '../../../../enums/tickets/ticket_status';

export interface SubTicket {
  id: string;
  title: string;
  assignedTo: string;
  deadline: number;
  status: TicketStatus;
  createdBy: string;
  createdAt: number;
}

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
