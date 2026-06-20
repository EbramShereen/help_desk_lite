import type { Ticket } from '../../../core/data/models/response/tickets/ticket_response';
import type {
  TicketInput,
  TicketUpdate,
  SubtaskInput,
} from '../../../core/data/models/request/tickets/ticket_request';
import type { TicketStatus } from '../../../core/enums/tickets/ticket_status';
import type { TicketPriority } from '../../../core/enums/tickets/ticket_priority';
import type { LinkType } from '../../../core/enums/tickets/link_type';
import type { TicketActivity } from '../../../core/data/models/response/tickets/activity_response';
import type { MultipleResult } from '../../../core/models/MultipleResult';
import type { Result, SuccessResult } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';

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
  listTickets(filters?: TicketFilters): Promise<Result<AppError, MultipleResult<Ticket>>>;
  /** Lists tickets within the given view scope, merging the necessary queries. */
  listTicketsScoped(
    scope: TicketViewScope,
    uid: string,
    base?: TicketFilters,
  ): Promise<Result<AppError, MultipleResult<Ticket>>>;
  getTicket(id: string): Promise<Result<AppError, Ticket | null>>;
  createTicket(input: TicketInput, createdBy: string): Promise<Result<AppError, Ticket>>;
  updateTicket(id: string, patch: TicketUpdate): Promise<Result<AppError, SuccessResult>>;
  updateTicketStatus(id: string, status: TicketStatus): Promise<Result<AppError, SuccessResult>>;
  /** Set the dynamic status id (Kanban move). */
  updateTicketStatusId(id: string, statusId: string): Promise<Result<AppError, SuccessResult>>;
  softDeleteTicket(id: string): Promise<Result<AppError, SuccessResult>>;

  // Dependencies
  addLink(
    ticketId: string,
    targetId: string,
    type: LinkType,
  ): Promise<Result<AppError, SuccessResult>>;
  removeLink(ticketId: string, targetId: string): Promise<Result<AppError, SuccessResult>>;

  // Subtasks
  addSubtask(ticketId: string, input: SubtaskInput): Promise<Result<AppError, SuccessResult>>;
  updateSubtask(
    ticketId: string,
    subtaskId: string,
    patch: Partial<SubtaskInput> & { isDone?: boolean },
  ): Promise<Result<AppError, SuccessResult>>;
  removeSubtask(ticketId: string, subtaskId: string): Promise<Result<AppError, SuccessResult>>;
  toggleSubtask(
    ticketId: string,
    subtaskId: string,
    isDone: boolean,
  ): Promise<Result<AppError, SuccessResult>>;

  // Activity / comments
  listActivity(ticketId: string): Promise<Result<AppError, MultipleResult<TicketActivity>>>;
  addComment(
    ticketId: string,
    actorUid: string,
    message: string,
    authorName?: string,
  ): Promise<Result<AppError, SuccessResult>>;
  editComment(
    ticketId: string,
    commentId: string,
    message: string,
  ): Promise<Result<AppError, SuccessResult>>;
  addReply(
    ticketId: string,
    commentId: string,
    actorUid: string,
    text: string,
    authorName?: string,
  ): Promise<Result<AppError, SuccessResult>>;
  toggleReaction(
    ticketId: string,
    commentId: string,
    emoji: string,
    actorUid: string,
  ): Promise<Result<AppError, SuccessResult>>;
  logSystemEvent(
    ticketId: string,
    actorUid: string,
    message: string,
  ): Promise<Result<AppError, SuccessResult>>;
}
