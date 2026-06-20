import { where, orderBy, arrayUnion, arrayRemove, type QueryConstraint } from 'firebase/firestore';
import type { AppDataSource } from '../../../core/data/datasource/AppDataSource';
import type { EpicRepo } from './EpicRepo';
import type { Epic } from '../../../core/data/models/response/epics/epic_response';
import type { EpicInput, EpicUpdate } from '../../../core/data/models/request/epics/epic_request';
import { epicFromDoc } from '../../../core/data/models/response/epics/epic_response';
import { epicToDoc } from '../../../core/data/models/request/epics/epic_request';
import { toMultipleResult, type MultipleResult } from '../../../core/models/MultipleResult';
import { guard, success, type Result, type SuccessResult } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';

const EPICS = 'epics';

export class EpicRepoImpl implements EpicRepo {
  private readonly ds: AppDataSource;

  constructor(ds: AppDataSource) {
    this.ds = ds;
  }

  listEpics(teamId?: string): Promise<Result<AppError, MultipleResult<Epic>>> {
    return guard(async () => {
      const constraints: QueryConstraint[] = [];
      if (teamId) constraints.push(where('teamIds', 'array-contains', teamId));
      constraints.push(orderBy('createdAt', 'desc'));
      return toMultipleResult((await this.ds.getCollection(EPICS, constraints)).map(epicFromDoc));
    });
  }

  getEpic(id: string): Promise<Result<AppError, Epic | null>> {
    return guard(async () => {
      const doc = await this.ds.getDocument(EPICS, id);
      return doc ? epicFromDoc(doc) : null;
    });
  }

  createEpic(input: EpicInput, createdBy: string): Promise<Result<AppError, Epic>> {
    return guard(async () => {
      const data = epicToDoc(input, createdBy);
      const id = await this.ds.addDocument(EPICS, data);
      return epicFromDoc({ id, ...data });
    });
  }

  updateEpic(id: string, patch: EpicUpdate): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.updateDocument(EPICS, id, { ...patch, updatedAt: Date.now() });
      return success;
    });
  }

  deleteEpic(id: string): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.deleteDocument(EPICS, id);
      return success;
    });
  }

  assignTeams(id: string, teamIds: string[]): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.updateDocument(EPICS, id, {
        teamIds: arrayUnion(...teamIds),
        updatedAt: Date.now(),
      });
      return success;
    });
  }

  removeTeam(id: string, teamId: string): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.updateDocument(EPICS, id, {
        teamIds: arrayRemove(teamId),
        updatedAt: Date.now(),
      });
      return success;
    });
  }

  addTickets(id: string, ticketIds: string[]): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.updateDocument(EPICS, id, {
        ticketIds: arrayUnion(...ticketIds),
        updatedAt: Date.now(),
      });
      return success;
    });
  }

  removeTicket(id: string, ticketId: string): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.updateDocument(EPICS, id, {
        ticketIds: arrayRemove(ticketId),
        updatedAt: Date.now(),
      });
      return success;
    });
  }
}
