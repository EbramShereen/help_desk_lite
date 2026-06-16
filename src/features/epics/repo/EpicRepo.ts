import type { Epic, EpicInput, EpicUpdate } from '../models/Epic';

export interface EpicRepo {
  listEpics(teamId?: string): Promise<Epic[]>;
  getEpic(id: string): Promise<Epic | null>;
  createEpic(input: EpicInput, createdBy: string): Promise<Epic>;
  updateEpic(id: string, patch: EpicUpdate): Promise<void>;
  deleteEpic(id: string): Promise<void>;
  assignTeams(id: string, teamIds: string[]): Promise<void>;
  removeTeam(id: string, teamId: string): Promise<void>;
  addTickets(id: string, ticketIds: string[]): Promise<void>;
  removeTicket(id: string, ticketId: string): Promise<void>;
}
