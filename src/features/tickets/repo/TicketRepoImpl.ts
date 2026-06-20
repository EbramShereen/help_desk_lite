import { where, orderBy, type QueryConstraint } from 'firebase/firestore';
import type { AppDataSource } from '../../../core/data/datasource/AppDataSource';
import type { TicketRepo, TicketFilters, TicketViewScope } from './TicketRepo';
import type { Ticket } from '../../../core/data/models/response/tickets/ticket_response';
import type {
  TicketUpdate,
  SubtaskInput,
  TicketInput,
} from '../../../core/data/models/request/tickets/ticket_request';
import type { TicketStatus } from '../../../core/enums/tickets/ticket_status';
import type { LinkType } from '../../../core/enums/tickets/link_type';
import { ticketFromDoc } from '../../../core/data/models/response/tickets/ticket_response';
import { ticketToDoc } from '../../../core/data/models/request/tickets/ticket_request';
import type { TicketActivity } from '../../../core/data/models/response/tickets/activity_response';
import { activityFromDoc } from '../../../core/data/models/response/tickets/activity_response';
import { activityToDoc } from '../../../core/data/models/request/tickets/activity_request';
import { toMultipleResult, type MultipleResult } from '../../../core/models/MultipleResult';
import { guard, success, type Result, type SuccessResult } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';

const TICKETS = 'tickets';
const EMPLOYEES = 'employeesData';
const activityPath = (ticketId: string) => `tickets/${ticketId}/activity`;

export class TicketRepoImpl implements TicketRepo {
  private readonly ds: AppDataSource;

  constructor(ds: AppDataSource) {
    this.ds = ds;
  }

  listTickets(filters?: TicketFilters): Promise<Result<AppError, MultipleResult<Ticket>>> {
    return guard(() => this.listTicketsRaw(filters));
  }

  /** Unwrapped query used internally (and composed by listTicketsScoped). */
  private async listTicketsRaw(filters?: TicketFilters): Promise<MultipleResult<Ticket>> {
    const constraints: QueryConstraint[] = [];

    if (filters?.teamId) constraints.push(where('teamId', '==', filters.teamId));
    if (filters?.assigneeId)
      constraints.push(where('assigneeIds', 'array-contains', filters.assigneeId));
    if (filters?.createdById) constraints.push(where('createdBy', '==', filters.createdById));
    if (filters?.labelId) constraints.push(where('labels', 'array-contains', filters.labelId));
    if (filters?.epicId) constraints.push(where('epicId', '==', filters.epicId));
    if (filters?.sprintId) constraints.push(where('sprintId', '==', filters.sprintId));
    if (filters?.status) constraints.push(where('status', '==', filters.status));
    if (filters?.priority) constraints.push(where('priority', '==', filters.priority));

    const docs = (await this.ds.getCollection(TICKETS, constraints)).map(ticketFromDoc);
    const items = docs
      .filter((t) => !t.isDeleted)
      // statusId/labels/backlog filtered in-memory so legacy docs (which may lack
      // the field) still match correctly.
      .filter((t) => (filters?.statusId ? t.statusId === filters.statusId : true))
      .filter((t) => (filters?.noSprint ? !t.sprintId : true))
      .filter((t) =>
        filters?.labelIds && filters.labelIds.length
          ? filters.labelIds.some((id) => t.labels.includes(id))
          : true,
      )
      .sort((a, b) => b.createdAt - a.createdAt);
    return toMultipleResult(items, filters?.pageSize);
  }

  listTicketsScoped(
    scope: TicketViewScope,
    uid: string,
    base?: TicketFilters,
  ): Promise<Result<AppError, MultipleResult<Ticket>>> {
    return guard(async () => {
      if (scope.mode === 'none') return toMultipleResult([]);
      if (scope.mode === 'all') return this.listTicketsRaw(base);

      // Each query carries exactly ONE scope constraint so (a) it matches a single
      // Firestore read-rule branch (never rejected) and (b) it needs no composite
      // index. Base filters (status/priority/labels…) are applied in-memory after
      // merging, to avoid array-contains + equality composite-index requirements.
      const queries: Promise<MultipleResult<Ticket>>[] = [];
      for (const teamId of scope.teamIds) queries.push(this.listTicketsRaw({ teamId }));
      for (const epicId of scope.epicIds) queries.push(this.listTicketsRaw({ epicId }));
      for (const labelId of scope.labelIds) queries.push(this.listTicketsRaw({ labelId }));
      if (scope.ownCreated) queries.push(this.listTicketsRaw({ createdById: uid }));
      if (scope.assigned) queries.push(this.listTicketsRaw({ assigneeId: uid }));

      const results = await Promise.all(queries);
      const byId = new Map<string, Ticket>();
      for (const result of results) for (const t of result.items) byId.set(t.id, t);

      const items = Array.from(byId.values())
        .filter((t) => (base?.status ? t.status === base.status : true))
        .filter((t) => (base?.priority ? t.priority === base.priority : true))
        .filter((t) => (base?.statusId ? t.statusId === base.statusId : true))
        .filter((t) => (base?.noSprint ? !t.sprintId : true))
        .filter((t) =>
          base?.labelIds && base.labelIds.length
            ? base.labelIds.some((id) => t.labels.includes(id))
            : true,
        )
        .sort((a, b) => b.createdAt - a.createdAt);
      return toMultipleResult(items, base?.pageSize);
    });
  }

  getTicket(id: string): Promise<Result<AppError, Ticket | null>> {
    return guard(() => this.getTicketRaw(id));
  }

  /** Unwrapped read used internally by the mutating methods. */
  private async getTicketRaw(id: string): Promise<Ticket | null> {
    const doc = await this.ds.getDocument(TICKETS, id);
    return doc ? ticketFromDoc(doc) : null;
  }

  createTicket(input: TicketInput, createdBy: string): Promise<Result<AppError, Ticket>> {
    return guard(async () => {
      const data = ticketToDoc(input, createdBy);
      const id = await this.ds.addDocument(TICKETS, data);
      if (input.assigneeIds?.length) {
        await this.addTicketToUsers(id, input.assigneeIds);
      }
      return ticketFromDoc({ id, ...data });
    });
  }

  updateTicket(id: string, patch: TicketUpdate): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      if (patch.assigneeIds !== undefined) {
        const existing = await this.getTicketRaw(id);
        if (existing) {
          const added = patch.assigneeIds.filter((uid) => !existing.assigneeIds.includes(uid));
          const removed = existing.assigneeIds.filter((uid) => !patch.assigneeIds!.includes(uid));
          if (added.length) await this.addTicketToUsers(id, added);
          if (removed.length) await this.removeTicketFromUsers(id, removed);
        }
      }
      await this.ds.updateDocument(TICKETS, id, { ...patch, updatedAt: Date.now() });
      return success;
    });
  }

  updateTicketStatus(id: string, status: TicketStatus): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      // Keep legacy + dynamic status in sync.
      await this.ds.updateDocument(TICKETS, id, {
        status,
        statusId: status,
        updatedAt: Date.now(),
      });
      return success;
    });
  }

  updateTicketStatusId(id: string, statusId: string): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.updateDocument(TICKETS, id, { statusId, updatedAt: Date.now() });
      return success;
    });
  }

  softDeleteTicket(id: string): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const ticket = await this.getTicketRaw(id);
      if (ticket?.assigneeIds.length) {
        await this.removeTicketFromUsers(id, ticket.assigneeIds);
      }
      await this.ds.updateDocument(TICKETS, id, {
        isDeleted: true,
        deletedAt: Date.now(),
        updatedAt: Date.now(),
      });
      return success;
    });
  }

  addLink(
    ticketId: string,
    targetId: string,
    type: LinkType,
  ): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const ticket = await this.getTicketRaw(ticketId);
      if (!ticket) return success;
      const linkedTickets = [
        ...ticket.linkedTickets.filter((l) => l.ticketId !== targetId),
        { ticketId: targetId, type },
      ];
      await this.ds.updateDocument(TICKETS, ticketId, { linkedTickets, updatedAt: Date.now() });
      return success;
    });
  }

  removeLink(ticketId: string, targetId: string): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const ticket = await this.getTicketRaw(ticketId);
      if (!ticket) return success;
      await this.ds.updateDocument(TICKETS, ticketId, {
        linkedTickets: ticket.linkedTickets.filter((l) => l.ticketId !== targetId),
        updatedAt: Date.now(),
      });
      return success;
    });
  }

  addSubtask(ticketId: string, input: SubtaskInput): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const ticket = await this.getTicketRaw(ticketId);
      if (!ticket) return success;
      const subtask = { id: crypto.randomUUID(), ...input, isDone: false };
      await this.ds.updateDocument(TICKETS, ticketId, {
        subtasks: [...ticket.subtasks, subtask],
        updatedAt: Date.now(),
      });
      return success;
    });
  }

  updateSubtask(
    ticketId: string,
    subtaskId: string,
    patch: Partial<SubtaskInput> & { isDone?: boolean },
  ): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const ticket = await this.getTicketRaw(ticketId);
      if (!ticket) return success;
      await this.ds.updateDocument(TICKETS, ticketId, {
        subtasks: ticket.subtasks.map((s) => (s.id === subtaskId ? { ...s, ...patch } : s)),
        updatedAt: Date.now(),
      });
      return success;
    });
  }

  removeSubtask(ticketId: string, subtaskId: string): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const ticket = await this.getTicketRaw(ticketId);
      if (!ticket) return success;
      await this.ds.updateDocument(TICKETS, ticketId, {
        subtasks: ticket.subtasks.filter((s) => s.id !== subtaskId),
        updatedAt: Date.now(),
      });
      return success;
    });
  }

  toggleSubtask(
    ticketId: string,
    subtaskId: string,
    isDone: boolean,
  ): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const ticket = await this.getTicketRaw(ticketId);
      if (!ticket) return success;
      await this.ds.updateDocument(TICKETS, ticketId, {
        subtasks: ticket.subtasks.map((s) => (s.id === subtaskId ? { ...s, isDone } : s)),
        updatedAt: Date.now(),
      });
      return success;
    });
  }

  listActivity(ticketId: string): Promise<Result<AppError, MultipleResult<TicketActivity>>> {
    return guard(async () => {
      const docs = await this.ds.getCollection(activityPath(ticketId), [
        orderBy('createdAt', 'asc'),
      ]);
      return toMultipleResult(docs.map(activityFromDoc));
    });
  }

  addComment(
    ticketId: string,
    actorUid: string,
    message: string,
    authorName = '',
  ): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.addDocument(
        activityPath(ticketId),
        activityToDoc('comment', actorUid, message, authorName),
      );
      return success;
    });
  }

  editComment(
    ticketId: string,
    commentId: string,
    message: string,
  ): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.updateDocument(activityPath(ticketId), commentId, {
        message,
        editedAt: Date.now(),
      });
      return success;
    });
  }

  addReply(
    ticketId: string,
    commentId: string,
    actorUid: string,
    text: string,
    authorName = '',
  ): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const doc = await this.ds.getDocument(activityPath(ticketId), commentId);
      if (!doc) return success;
      const comment = activityFromDoc(doc);
      const reply = {
        id: crypto.randomUUID(),
        actorUid,
        authorName,
        text,
        createdAt: Date.now(),
        editedAt: null,
      };
      await this.ds.updateDocument(activityPath(ticketId), commentId, {
        replies: [...comment.replies, reply],
      });
      return success;
    });
  }

  toggleReaction(
    ticketId: string,
    commentId: string,
    emoji: string,
    actorUid: string,
  ): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const doc = await this.ds.getDocument(activityPath(ticketId), commentId);
      if (!doc) return success;
      const comment = activityFromDoc(doc);
      const existing = comment.reactions.find((r) => r.emoji === emoji);
      let reactions;
      if (!existing) {
        reactions = [...comment.reactions, { emoji, actorUids: [actorUid] }];
      } else {
        const has = existing.actorUids.includes(actorUid);
        reactions = comment.reactions
          .map((r) =>
            r.emoji === emoji
              ? {
                  ...r,
                  actorUids: has
                    ? r.actorUids.filter((u) => u !== actorUid)
                    : [...r.actorUids, actorUid],
                }
              : r,
          )
          .filter((r) => r.actorUids.length > 0);
      }
      await this.ds.updateDocument(activityPath(ticketId), commentId, { reactions });
      return success;
    });
  }

  logSystemEvent(
    ticketId: string,
    actorUid: string,
    message: string,
  ): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.addDocument(activityPath(ticketId), activityToDoc('system', actorUid, message));
      return success;
    });
  }

  private async addTicketToUsers(ticketId: string, uids: string[]): Promise<void> {
    await Promise.all(
      uids.map(async (uid) => {
        const doc = await this.ds.getDocument(EMPLOYEES, uid);
        const existing: string[] = Array.isArray(doc?.assignedTicketIds)
          ? (doc!.assignedTicketIds as string[])
          : [];
        const assignedTicketIds = [...new Set([...existing, ticketId])];
        await this.ds.updateDocument(EMPLOYEES, uid, { assignedTicketIds });
      }),
    );
  }

  private async removeTicketFromUsers(ticketId: string, uids: string[]): Promise<void> {
    await Promise.all(
      uids.map(async (uid) => {
        const doc = await this.ds.getDocument(EMPLOYEES, uid);
        const existing: string[] = Array.isArray(doc?.assignedTicketIds)
          ? (doc!.assignedTicketIds as string[])
          : [];
        const assignedTicketIds = existing.filter((id) => id !== ticketId);
        await this.ds.updateDocument(EMPLOYEES, uid, { assignedTicketIds });
      }),
    );
  }
}
