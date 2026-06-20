export const TICKET_STATUSES = ['todo', 'inProgress', 'done'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];
