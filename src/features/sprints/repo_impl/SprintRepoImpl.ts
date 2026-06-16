import { where, orderBy, type QueryConstraint } from 'firebase/firestore';
import type { AppDataSource } from '../../../core/datasource/AppDataSource';
import type { SprintRepo } from '../repo/SprintRepo';
import type { Sprint, SprintInput, SprintUpdate } from '../models/Sprint';
import { sprintFromDoc, sprintToDoc } from '../models/Sprint';

const SPRINTS = 'sprints';
const TICKETS = 'tickets';
const USERS = 'users';

export class SprintRepoImpl implements SprintRepo {
  private readonly ds: AppDataSource;

  constructor(ds: AppDataSource) {
    this.ds = ds;
  }

  async listSprints(teamId?: string): Promise<Sprint[]> {
    const constraints: QueryConstraint[] = [];
    if (teamId) constraints.push(where('teamId', '==', teamId));
    constraints.push(orderBy('createdAt', 'desc'));
    return (await this.ds.getCollection(SPRINTS, constraints)).map(sprintFromDoc);
  }

  async listSprintsForMember(userId: string): Promise<Sprint[]> {
    const constraints: QueryConstraint[] = [
      where('assignedMemberIds', 'array-contains', userId),
      orderBy('createdAt', 'desc'),
    ];
    return (await this.ds.getCollection(SPRINTS, constraints)).map(sprintFromDoc);
  }

  async getSprint(id: string): Promise<Sprint | null> {
    const doc = await this.ds.getDocument(SPRINTS, id);
    return doc ? sprintFromDoc(doc) : null;
  }

  async createSprint(input: SprintInput, createdBy: string): Promise<Sprint> {
    const data = sprintToDoc(input, createdBy);
    const id = await this.ds.addDocument(SPRINTS, data);
    return sprintFromDoc({ id, ...data });
  }

  async updateSprint(id: string, patch: SprintUpdate): Promise<void> {
    await this.ds.updateDocument(SPRINTS, id, { ...patch, updatedAt: Date.now() });
  }

  async deleteSprint(id: string): Promise<void> {
    const sprint = await this.getSprint(id);
    if (!sprint) return;
    await Promise.all(
      sprint.ticketIds.map((tid) =>
        this.ds.updateDocument(TICKETS, tid, { sprintId: null, updatedAt: Date.now() }),
      ),
    );
    await this.ds.deleteDocument(SPRINTS, id);
    if (sprint.assignedMemberIds.length) {
      await this.removeSprintFromUsers(id, sprint.assignedMemberIds);
    }
  }

  async addTicketToSprint(
    sprintId: string,
    ticketId: string,
    ticketAssigneeIds: string[],
  ): Promise<void> {
    const sprint = await this.getSprint(sprintId);
    if (!sprint) return;

    const ticketIds = [...new Set([...sprint.ticketIds, ticketId])];
    const assignedMemberIds = [...new Set([...sprint.assignedMemberIds, ...ticketAssigneeIds])];

    const newMembers = ticketAssigneeIds.filter((uid) => !sprint.assignedMemberIds.includes(uid));

    await this.ds.updateDocument(SPRINTS, sprintId, {
      ticketIds,
      assignedMemberIds,
      updatedAt: Date.now(),
    });
    await this.ds.updateDocument(TICKETS, ticketId, { sprintId, updatedAt: Date.now() });

    if (newMembers.length) {
      await this.addSprintToUsers(sprintId, newMembers);
    }
  }

  async removeTicketFromSprint(sprintId: string, ticketId: string): Promise<void> {
    const sprint = await this.getSprint(sprintId);
    if (!sprint) return;

    const ticketIds = sprint.ticketIds.filter((id) => id !== ticketId);

    const remainingAssignees = await this.recomputeAssignedMembers(ticketIds);
    const removedMembers = sprint.assignedMemberIds.filter(
      (uid) => !remainingAssignees.includes(uid),
    );

    await this.ds.updateDocument(SPRINTS, sprintId, {
      ticketIds,
      assignedMemberIds: remainingAssignees,
      updatedAt: Date.now(),
    });
    await this.ds.updateDocument(TICKETS, ticketId, { sprintId: null, updatedAt: Date.now() });

    if (removedMembers.length) {
      await this.removeSprintFromUsers(sprintId, removedMembers);
    }
  }

  private async recomputeAssignedMembers(ticketIds: string[]): Promise<string[]> {
    if (ticketIds.length === 0) return [];
    const allIds = new Set<string>();
    for (const tid of ticketIds) {
      const doc = await this.ds.getDocument(TICKETS, tid);
      if (doc && Array.isArray(doc.assigneeIds)) {
        (doc.assigneeIds as string[]).forEach((id) => allIds.add(id));
      }
    }
    return [...allIds];
  }

  private async addSprintToUsers(sprintId: string, uids: string[]): Promise<void> {
    await Promise.all(
      uids.map(async (uid) => {
        const doc = await this.ds.getDocument(USERS, uid);
        const existing: string[] = Array.isArray(doc?.assignedSprintIds)
          ? (doc!.assignedSprintIds as string[])
          : [];
        const assignedSprintIds = [...new Set([...existing, sprintId])];
        await this.ds.updateDocument(USERS, uid, { assignedSprintIds });
      }),
    );
  }

  private async removeSprintFromUsers(sprintId: string, uids: string[]): Promise<void> {
    await Promise.all(
      uids.map(async (uid) => {
        const doc = await this.ds.getDocument(USERS, uid);
        const existing: string[] = Array.isArray(doc?.assignedSprintIds)
          ? (doc!.assignedSprintIds as string[])
          : [];
        const assignedSprintIds = existing.filter((id) => id !== sprintId);
        // Also clean up sprintPermissions entry for this sprint
        const sprintPerms = Array.isArray(doc?.sprintPermissions)
          ? (doc!.sprintPermissions as Array<{ id: string }>).filter((p) => p.id !== sprintId)
          : [];
        await this.ds.updateDocument(USERS, uid, {
          assignedSprintIds,
          sprintPermissions: sprintPerms,
        });
      }),
    );
  }
}
