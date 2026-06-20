import { z } from 'zod';
import { TICKET_STATUSES } from '../../../../enums/tickets/ticket_status';
import { TICKET_PRIORITIES } from '../../../../enums/tickets/ticket_priority';
import { LINK_TYPES } from '../../../../enums/tickets/link_type';

export const subtaskSchema = z.object({
  title: z.string().min(1, 'Subtask title is required'),
  assigneeId: z.string().min(1, 'Assignee is required'),
  priority: z.enum(TICKET_PRIORITIES).optional(),
  statusId: z.string().optional(),
  startDate: z.number().optional(),
  endDate: z.number().optional(),
});
export type SubtaskInput = z.infer<typeof subtaskSchema>;

export const ticketLinkSchema = z.object({
  ticketId: z.string().min(1),
  type: z.enum(LINK_TYPES),
});

export const ticketInputSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required'),
  assigneeIds: z.array(z.string()).min(1, 'At least one assignee is required'),
  teamId: z.string().min(1, 'Team is required'),
  epicId: z.string().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
  startDate: z.number().positive('Start date is required'),
  // `deadline` is the form-facing field; `endDate` is the canonical alias (either accepted).
  deadline: z.number().positive('Deadline is required'),
  endDate: z.number().positive().optional(),
  priority: z.enum(TICKET_PRIORITIES),
  // `status` (legacy enum) remains form-facing; `statusId` (dynamic) takes precedence when set.
  status: z.enum(TICKET_STATUSES),
  statusId: z.string().optional(),
  ticketScore: z.number().int().nonnegative().optional(),
  linkedTickets: z.array(ticketLinkSchema).optional(),
});
export type TicketInput = z.infer<typeof ticketInputSchema>;

export const ticketStatusUpdateSchema = z.object({
  status: z.enum(TICKET_STATUSES),
});
export type TicketStatusUpdate = z.infer<typeof ticketStatusUpdateSchema>;

export const ticketUpdateSchema = ticketInputSchema.partial().omit({ teamId: true });
export type TicketUpdate = z.infer<typeof ticketUpdateSchema>;

export function ticketToDoc(input: TicketInput, createdBy: string): Record<string, unknown> {
  const endDate = input.endDate ?? input.deadline;
  const statusId = input.statusId ?? input.status;
  return {
    title: input.title,
    description: input.description,
    assigneeIds: input.assigneeIds,
    teamId: input.teamId,
    epicId: input.epicId ?? null,
    sprintId: input.sprintId ?? null,
    labels: input.labels ?? [],
    startDate: input.startDate,
    endDate,
    // keep legacy fields written so older readers still work.
    deadline: endDate,
    statusId,
    status: input.status,
    priority: input.priority,
    ticketScore: input.ticketScore ?? 0,
    linkedTickets: input.linkedTickets ?? [],
    subtasks: [],
    createdBy,
    isDeleted: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
