import { where, orderBy, type QueryConstraint } from 'firebase/firestore';
import type { AppDataSource } from '../../../core/datasource/AppDataSource';
import type { TicketRepo, TicketFilters, TicketViewScope } from '../repo/TicketRepo';
import type { Ticket, TicketStatus, TicketUpdate, SubtaskInput, LinkType } from '../models/Ticket';
import { ticketFromDoc, ticketToDoc, type TicketInput } from '../models/Ticket';
import type { TicketActivity } from '../models/TicketActivity';
import { activityFromDoc, activityToDoc } from '../models/TicketActivity';

const TICKETS = 'tickets';
const USERS = 'users';
const activityPath = (ticketId: string) => `tickets/${ticketId}/activity`;

export class TicketRepoImpl implements TicketRepo {
  private readonly ds: AppDataSource;

  constructor(ds: AppDataSource) {
    this.ds = ds;
  }

  async listTickets(filters?: TicketFilters): Promise<Ticket[]> {
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
    return (
      docs
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
        .sort((a, b) => b.createdAt - a.createdAt)
    );
  }

  async listTicketsScoped(
    scope: TicketViewScope,
    uid: string,
    base?: TicketFilters,
  ): Promise<Ticket[]> {
    if (scope.mode === 'none') return [];
    if (scope.mode === 'all') return this.listTickets(base);

    // Each query carries exactly ONE scope constraint so (a) it matches a single
    // Firestore read-rule branch (never rejected) and (b) it needs no composite
    // index. Base filters (status/priority/labels…) are applied in-memory after
    // merging, to avoid array-contains + equality composite-index requirements.
    const queries: Promise<Ticket[]>[] = [];
    for (const teamId of scope.teamIds) queries.push(this.listTickets({ teamId }));
    for (const epicId of scope.epicIds) queries.push(this.listTickets({ epicId }));
    for (const labelId of scope.labelIds) queries.push(this.listTickets({ labelId }));
    if (scope.ownCreated) queries.push(this.listTickets({ createdById: uid }));
    if (scope.assigned) queries.push(this.listTickets({ assigneeId: uid }));

    const results = await Promise.all(queries);
    const byId = new Map<string, Ticket>();
    for (const list of results) for (const t of list) byId.set(t.id, t);

    return Array.from(byId.values())
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
  }

  async getTicket(id: string): Promise<Ticket | null> {
    const doc = await this.ds.getDocument(TICKETS, id);
    return doc ? ticketFromDoc(doc) : null;
  }

  async createTicket(input: TicketInput, createdBy: string): Promise<Ticket> {
    const data = ticketToDoc(input, createdBy);
    const id = await this.ds.addDocument(TICKETS, data);
    if (input.assigneeIds?.length) {
      await this.addTicketToUsers(id, input.assigneeIds);
    }
    return ticketFromDoc({ id, ...data });
  }

  async updateTicket(id: string, patch: TicketUpdate): Promise<void> {
    if (patch.assigneeIds !== undefined) {
      const existing = await this.getTicket(id);
      if (existing) {
        const added = patch.assigneeIds.filter((uid) => !existing.assigneeIds.includes(uid));
        const removed = existing.assigneeIds.filter((uid) => !patch.assigneeIds!.includes(uid));
        if (added.length) await this.addTicketToUsers(id, added);
        if (removed.length) await this.removeTicketFromUsers(id, removed);
      }
    }
    await this.ds.updateDocument(TICKETS, id, { ...patch, updatedAt: Date.now() });
  }

  async updateTicketStatus(id: string, status: TicketStatus): Promise<void> {
    // Keep legacy + dynamic status in sync.
    await this.ds.updateDocument(TICKETS, id, { status, statusId: status, updatedAt: Date.now() });
  }

  async updateTicketStatusId(id: string, statusId: string): Promise<void> {
    await this.ds.updateDocument(TICKETS, id, { statusId, updatedAt: Date.now() });
  }

  async softDeleteTicket(id: string): Promise<void> {
    const ticket = await this.getTicket(id);
    if (ticket?.assigneeIds.length) {
      await this.removeTicketFromUsers(id, ticket.assigneeIds);
    }
    await this.ds.updateDocument(TICKETS, id, {
      isDeleted: true,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  async addLink(ticketId: string, targetId: string, type: LinkType): Promise<void> {
    const ticket = await this.getTicket(ticketId);
    if (!ticket) return;
    const linkedTickets = [
      ...ticket.linkedTickets.filter((l) => l.ticketId !== targetId),
      { ticketId: targetId, type },
    ];
    await this.ds.updateDocument(TICKETS, ticketId, { linkedTickets, updatedAt: Date.now() });
  }

  async removeLink(ticketId: string, targetId: string): Promise<void> {
    const ticket = await this.getTicket(ticketId);
    if (!ticket) return;
    await this.ds.updateDocument(TICKETS, ticketId, {
      linkedTickets: ticket.linkedTickets.filter((l) => l.ticketId !== targetId),
      updatedAt: Date.now(),
    });
  }

  async addSubtask(ticketId: string, input: SubtaskInput): Promise<void> {
    const ticket = await this.getTicket(ticketId);
    if (!ticket) return;
    const subtask = { id: crypto.randomUUID(), ...input, isDone: false };
    await this.ds.updateDocument(TICKETS, ticketId, {
      subtasks: [...ticket.subtasks, subtask],
      updatedAt: Date.now(),
    });
  }

  async updateSubtask(
    ticketId: string,
    subtaskId: string,
    patch: Partial<SubtaskInput> & { isDone?: boolean },
  ): Promise<void> {
    const ticket = await this.getTicket(ticketId);
    if (!ticket) return;
    await this.ds.updateDocument(TICKETS, ticketId, {
      subtasks: ticket.subtasks.map((s) => (s.id === subtaskId ? { ...s, ...patch } : s)),
      updatedAt: Date.now(),
    });
  }

  async removeSubtask(ticketId: string, subtaskId: string): Promise<void> {
    const ticket = await this.getTicket(ticketId);
    if (!ticket) return;
    await this.ds.updateDocument(TICKETS, ticketId, {
      subtasks: ticket.subtasks.filter((s) => s.id !== subtaskId),
      updatedAt: Date.now(),
    });
  }

  async toggleSubtask(ticketId: string, subtaskId: string, isDone: boolean): Promise<void> {
    const ticket = await this.getTicket(ticketId);
    if (!ticket) return;
    await this.ds.updateDocument(TICKETS, ticketId, {
      subtasks: ticket.subtasks.map((s) => (s.id === subtaskId ? { ...s, isDone } : s)),
      updatedAt: Date.now(),
    });
  }

  async listActivity(ticketId: string): Promise<TicketActivity[]> {
    const docs = await this.ds.getCollection(activityPath(ticketId), [orderBy('createdAt', 'asc')]);
    return docs.map(activityFromDoc);
  }

  async addComment(
    ticketId: string,
    actorUid: string,
    message: string,
    authorName = '',
  ): Promise<void> {
    await this.ds.addDocument(
      activityPath(ticketId),
      activityToDoc('comment', actorUid, message, authorName),
    );
  }

  async editComment(ticketId: string, commentId: string, message: string): Promise<void> {
    await this.ds.updateDocument(activityPath(ticketId), commentId, {
      message,
      editedAt: Date.now(),
    });
  }

  async addReply(
    ticketId: string,
    commentId: string,
    actorUid: string,
    text: string,
    authorName = '',
  ): Promise<void> {
    const doc = await this.ds.getDocument(activityPath(ticketId), commentId);
    if (!doc) return;
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
  }

  async toggleReaction(
    ticketId: string,
    commentId: string,
    emoji: string,
    actorUid: string,
  ): Promise<void> {
    const doc = await this.ds.getDocument(activityPath(ticketId), commentId);
    if (!doc) return;
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
  }

  async logSystemEvent(ticketId: string, actorUid: string, message: string): Promise<void> {
    await this.ds.addDocument(activityPath(ticketId), activityToDoc('system', actorUid, message));
  }

  private async addTicketToUsers(ticketId: string, uids: string[]): Promise<void> {
    await Promise.all(
      uids.map(async (uid) => {
        const doc = await this.ds.getDocument(USERS, uid);
        const existing: string[] = Array.isArray(doc?.assignedTicketIds)
          ? (doc!.assignedTicketIds as string[])
          : [];
        const assignedTicketIds = [...new Set([...existing, ticketId])];
        await this.ds.updateDocument(USERS, uid, { assignedTicketIds });
      }),
    );
  }

  private async removeTicketFromUsers(ticketId: string, uids: string[]): Promise<void> {
    await Promise.all(
      uids.map(async (uid) => {
        const doc = await this.ds.getDocument(USERS, uid);
        const existing: string[] = Array.isArray(doc?.assignedTicketIds)
          ? (doc!.assignedTicketIds as string[])
          : [];
        const assignedTicketIds = existing.filter((id) => id !== ticketId);
        await this.ds.updateDocument(USERS, uid, { assignedTicketIds });
      }),
    );
  }
}
