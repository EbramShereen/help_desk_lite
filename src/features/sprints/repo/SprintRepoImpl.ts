import { where, orderBy, type QueryConstraint } from 'firebase/firestore';
import type { AppDataSource } from '../../../core/data/datasource/AppDataSource';
import type { SprintRepo } from './SprintRepo';
import type { Sprint } from '../../../core/data/models/response/sprints/sprint_response';
import type {
  SprintInput,
  SprintUpdate,
} from '../../../core/data/models/request/sprints/sprint_request';
import { sprintFromDoc } from '../../../core/data/models/response/sprints/sprint_response';
import { sprintToDoc } from '../../../core/data/models/request/sprints/sprint_request';
import { toMultipleResult, type MultipleResult } from '../../../core/models/MultipleResult';
import { guard, success, type Result, type SuccessResult } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';

const SPRINTS = 'sprints';
const TICKETS = 'tickets';
const EMPLOYEES = 'employeesData';

export class SprintRepoImpl implements SprintRepo {
  private readonly ds: AppDataSource;

  constructor(ds: AppDataSource) {
    this.ds = ds;
  }

  listSprints(teamId?: string): Promise<Result<AppError, MultipleResult<Sprint>>> {
    return guard(async () => {
      const constraints: QueryConstraint[] = [];
      if (teamId) constraints.push(where('teamId', '==', teamId));
      constraints.push(orderBy('createdAt', 'desc'));
      return toMultipleResult(
        (await this.ds.getCollection(SPRINTS, constraints)).map(sprintFromDoc),
      );
    });
  }

  listSprintsForMember(userId: string): Promise<Result<AppError, MultipleResult<Sprint>>> {
    return guard(async () => {
      const constraints: QueryConstraint[] = [
        where('assignedMemberIds', 'array-contains', userId),
        orderBy('createdAt', 'desc'),
      ];
      return toMultipleResult(
        (await this.ds.getCollection(SPRINTS, constraints)).map(sprintFromDoc),
      );
    });
  }

  getSprint(id: string): Promise<Result<AppError, Sprint | null>> {
    return guard(async () => {
      const doc = await this.ds.getDocument(SPRINTS, id);
      return doc ? sprintFromDoc(doc) : null;
    });
  }

  createSprint(input: SprintInput, createdBy: string): Promise<Result<AppError, Sprint>> {
    return guard(async () => {
      const data = sprintToDoc(input, createdBy);
      const id = await this.ds.addDocument(SPRINTS, data);
      return sprintFromDoc({ id, ...data });
    });
  }

  updateSprint(id: string, patch: SprintUpdate): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.updateDocument(SPRINTS, id, { ...patch, updatedAt: Date.now() });
      return success;
    });
  }

  deleteSprint(id: string): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const result = await this.getSprintOrNull(id);
      if (!result) return success;
      await Promise.all(
        result.ticketIds.map((tid) =>
          this.ds.updateDocument(TICKETS, tid, { sprintId: null, updatedAt: Date.now() }),
        ),
      );
      await this.ds.deleteDocument(SPRINTS, id);
      if (result.assignedMemberIds.length) {
        await this.removeSprintFromUsers(id, result.assignedMemberIds);
      }
      return success;
    });
  }

  addTicketToSprint(
    sprintId: string,
    ticketId: string,
    ticketAssigneeIds: string[],
  ): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const sprint = await this.getSprintOrNull(sprintId);
      if (!sprint) return success;

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
      return success;
    });
  }

  removeTicketFromSprint(
    sprintId: string,
    ticketId: string,
  ): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const sprint = await this.getSprintOrNull(sprintId);
      if (!sprint) return success;

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
      return success;
    });
  }

  /** Internal read returning the raw entity (not wrapped) for use inside guards. */
  private async getSprintOrNull(id: string): Promise<Sprint | null> {
    const doc = await this.ds.getDocument(SPRINTS, id);
    return doc ? sprintFromDoc(doc) : null;
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
        const doc = await this.ds.getDocument(EMPLOYEES, uid);
        const existing: string[] = Array.isArray(doc?.assignedSprintIds)
          ? (doc!.assignedSprintIds as string[])
          : [];
        const assignedSprintIds = [...new Set([...existing, sprintId])];
        await this.ds.updateDocument(EMPLOYEES, uid, { assignedSprintIds });
      }),
    );
  }

  private async removeSprintFromUsers(sprintId: string, uids: string[]): Promise<void> {
    await Promise.all(
      uids.map(async (uid) => {
        const doc = await this.ds.getDocument(EMPLOYEES, uid);
        const existing: string[] = Array.isArray(doc?.assignedSprintIds)
          ? (doc!.assignedSprintIds as string[])
          : [];
        const assignedSprintIds = existing.filter((id) => id !== sprintId);
        const sprintPerms = Array.isArray(doc?.sprintPermissions)
          ? (doc!.sprintPermissions as Array<{ id: string }>).filter((p) => p.id !== sprintId)
          : [];
        await this.ds.updateDocument(EMPLOYEES, uid, {
          assignedSprintIds,
          sprintPermissions: sprintPerms,
        });
      }),
    );
  }
}
