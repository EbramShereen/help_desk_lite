import type { Team, TeamEmployee } from '../../../core/data/models/response/teams/team_response';
import type { TeamInput, TeamUpdate } from '../../../core/data/models/request/teams/team_request';
import type { MultipleResult } from '../../../core/models/MultipleResult';
import type { Result, SuccessResult } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';

export interface TeamRepo {
  listTeams(managerId?: string): Promise<Result<AppError, MultipleResult<Team>>>;
  listTeamsForUser(userId: string): Promise<Result<AppError, MultipleResult<Team>>>;
  getTeam(id: string): Promise<Result<AppError, Team | null>>;
  createTeam(input: TeamInput, managerId: string): Promise<Result<AppError, Team>>;
  updateTeam(id: string, patch: TeamUpdate): Promise<Result<AppError, SuccessResult>>;
  deleteTeam(id: string): Promise<Result<AppError, SuccessResult>>;
  addMember(
    teamId: string,
    userId: string,
    employee: TeamEmployee,
    addedBy?: string,
  ): Promise<Result<AppError, SuccessResult>>;
  removeMember(teamId: string, userId: string): Promise<Result<AppError, SuccessResult>>;
  setTeamLeader(
    teamId: string,
    userId: string,
    employee: TeamEmployee,
    addedBy?: string,
  ): Promise<Result<AppError, SuccessResult>>;
}
