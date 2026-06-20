import { z } from 'zod';
import { TICKET_STATUSES } from '../../../../enums/tickets/ticket_status';

export const subTicketInputSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  assignedTo: z.string().min(1, 'Assignee is required'),
  deadline: z.number().positive(),
  status: z.enum(TICKET_STATUSES),
});
export type SubTicketInput = z.infer<typeof subTicketInputSchema>;

export function subTicketToDoc(input: SubTicketInput, createdBy: string): Record<string, unknown> {
  return { ...input, createdBy, createdAt: Date.now() };
}
