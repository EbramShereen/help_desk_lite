import { where, orderBy, arrayUnion, arrayRemove, type QueryConstraint } from 'firebase/firestore';
import type { AppDataSource } from '../../../core/datasource/AppDataSource';
import type { EpicRepo } from '../repo/EpicRepo';
import type { Epic, EpicInput, EpicUpdate } from '../models/Epic';
import { epicFromDoc, epicToDoc } from '../models/Epic';

const EPICS = 'epics';

export class EpicRepoImpl implements EpicRepo {
  private readonly ds: AppDataSource;

  constructor(ds: AppDataSource) {
    this.ds = ds;
  }

  async listEpics(teamId?: string): Promise<Epic[]> {
    const constraints: QueryConstraint[] = [];
    if (teamId) constraints.push(where('teamIds', 'array-contains', teamId));
    constraints.push(orderBy('createdAt', 'desc'));
    return (await this.ds.getCollection(EPICS, constraints)).map(epicFromDoc);
  }

  async getEpic(id: string): Promise<Epic | null> {
    const doc = await this.ds.getDocument(EPICS, id);
    return doc ? epicFromDoc(doc) : null;
  }

  async createEpic(input: EpicInput, createdBy: string): Promise<Epic> {
    const data = epicToDoc(input, createdBy);
    const id = await this.ds.addDocument(EPICS, data);
    return epicFromDoc({ id, ...data });
  }

  async updateEpic(id: string, patch: EpicUpdate): Promise<void> {
    await this.ds.updateDocument(EPICS, id, { ...patch, updatedAt: Date.now() });
  }

  async deleteEpic(id: string): Promise<void> {
    await this.ds.deleteDocument(EPICS, id);
  }

  async assignTeams(id: string, teamIds: string[]): Promise<void> {
    await this.ds.updateDocument(EPICS, id, {
      teamIds: arrayUnion(...teamIds),
      updatedAt: Date.now(),
    });
  }

  async removeTeam(id: string, teamId: string): Promise<void> {
    await this.ds.updateDocument(EPICS, id, {
      teamIds: arrayRemove(teamId),
      updatedAt: Date.now(),
    });
  }

  async addTickets(id: string, ticketIds: string[]): Promise<void> {
    await this.ds.updateDocument(EPICS, id, {
      ticketIds: arrayUnion(...ticketIds),
      updatedAt: Date.now(),
    });
  }

  async removeTicket(id: string, ticketId: string): Promise<void> {
    await this.ds.updateDocument(EPICS, id, {
      ticketIds: arrayRemove(ticketId),
      updatedAt: Date.now(),
    });
  }
}
