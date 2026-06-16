import type {
  Ticket,
  TicketInput,
  TicketStatus,
  TicketPriority,
  TicketUpdate,
  SubtaskInput,
  LinkType,
} from '../models/Ticket';
import type { TicketActivity } from '../models/TicketActivity';

export interface TicketFilters {
  teamId?: string;
  assigneeId?: string;
  /** Restrict to tickets created by this uid (own-tickets scope). */
  createdById?: string;
  epicId?: string;
  sprintId?: string;
  /** Legacy enum status filter. */
  status?: TicketStatus;
  /** Dynamic status id filter (preferred). */
  statusId?: string;
  /** Tickets not assigned to any sprint (backlog). */
  noSprint?: boolean;
  labelIds?: string[];
  /** Single label, applied as a constrained `array-contains` query (scope use). */
  labelId?: string;
  priority?: TicketPriority;
  afterCreatedAt?: number;
  pageSize?: number;
}

/**
 * The set of tickets a user may VIEW, derived from their permission grants.
 * Mirrors the Firestore read rules so the client issues only queries the rules
 * accept (a list query is rejected if any matched doc fails the read rule).
 * - `all`    — an unrestricted/system-wide view grant → one unconstrained query.
 * - `none`   — no view permission → empty result, no query.
 * - `scoped` — union of per-team / per-epic / per-label / own / assigned queries.
 */
export type TicketViewScope =
  | { mode: 'all' }
  | { mode: 'none' }
  | {
      mode: 'scoped';
      teamIds: string[];
      epicIds: string[];
      labelIds: string[];
      ownCreated: boolean;
      assigned: boolean;
    };

export interface TicketRepo {
  listTickets(filters?: TicketFilters): Promise<Ticket[]>;
  /** Lists tickets within the given view scope, merging the necessary queries. */
  listTicketsScoped(scope: TicketViewScope, uid: string, base?: TicketFilters): Promise<Ticket[]>;
  getTicket(id: string): Promise<Ticket | null>;
  createTicket(input: TicketInput, createdBy: string): Promise<Ticket>;
  updateTicket(id: string, patch: TicketUpdate): Promise<void>;
  updateTicketStatus(id: string, status: TicketStatus): Promise<void>;
  /** Set the dynamic status id (Kanban move). */
  updateTicketStatusId(id: string, statusId: string): Promise<void>;
  softDeleteTicket(id: string): Promise<void>;

  // Dependencies
  addLink(ticketId: string, targetId: string, type: LinkType): Promise<void>;
  removeLink(ticketId: string, targetId: string): Promise<void>;

  // Subtasks
  addSubtask(ticketId: string, input: SubtaskInput): Promise<void>;
  updateSubtask(
    ticketId: string,
    subtaskId: string,
    patch: Partial<SubtaskInput> & { isDone?: boolean },
  ): Promise<void>;
  removeSubtask(ticketId: string, subtaskId: string): Promise<void>;
  toggleSubtask(ticketId: string, subtaskId: string, isDone: boolean): Promise<void>;

  // Activity / comments
  listActivity(ticketId: string): Promise<TicketActivity[]>;
  addComment(
    ticketId: string,
    actorUid: string,
    message: string,
    authorName?: string,
  ): Promise<void>;
  editComment(ticketId: string, commentId: string, message: string): Promise<void>;
  addReply(
    ticketId: string,
    commentId: string,
    actorUid: string,
    text: string,
    authorName?: string,
  ): Promise<void>;
  toggleReaction(
    ticketId: string,
    commentId: string,
    emoji: string,
    actorUid: string,
  ): Promise<void>;
  logSystemEvent(ticketId: string, actorUid: string, message: string): Promise<void>;
}
