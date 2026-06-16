import type { Sprint, SprintInput, SprintUpdate } from '../models/Sprint';

export interface SprintRepo {
  listSprints(teamId?: string): Promise<Sprint[]>;
  listSprintsForMember(userId: string): Promise<Sprint[]>;
  getSprint(id: string): Promise<Sprint | null>;
  createSprint(input: SprintInput, createdBy: string): Promise<Sprint>;
  updateSprint(id: string, patch: SprintUpdate): Promise<void>;
  deleteSprint(id: string): Promise<void>;
  addTicketToSprint(sprintId: string, ticketId: string, ticketAssigneeIds: string[]): Promise<void>;
  removeTicketFromSprint(sprintId: string, ticketId: string): Promise<void>;
}
