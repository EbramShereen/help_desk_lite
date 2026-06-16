import type { Team, TeamInput, TeamUpdate, TeamEmployee } from '../models/Team';

export interface TeamRepo {
  listTeams(managerId?: string): Promise<Team[]>;
  listTeamsForUser(userId: string): Promise<Team[]>;
  getTeam(id: string): Promise<Team | null>;
  createTeam(input: TeamInput, managerId: string): Promise<Team>;
  updateTeam(id: string, patch: TeamUpdate): Promise<void>;
  deleteTeam(id: string): Promise<void>;
  addMember(
    teamId: string,
    userId: string,
    employee: TeamEmployee,
    addedBy?: string,
  ): Promise<void>;
  removeMember(teamId: string, userId: string): Promise<void>;
  setTeamLeader(
    teamId: string,
    userId: string,
    employee: TeamEmployee,
    addedBy?: string,
  ): Promise<void>;
}
