import type { Sprint } from '../../../core/data/models/response/sprints/sprint_response';
import type {
  SprintInput,
  SprintUpdate,
} from '../../../core/data/models/request/sprints/sprint_request';
import type { MultipleResult } from '../../../core/models/MultipleResult';
import type { Result, SuccessResult } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';

export interface SprintRepo {
  listSprints(teamId?: string): Promise<Result<AppError, MultipleResult<Sprint>>>;
  listSprintsForMember(userId: string): Promise<Result<AppError, MultipleResult<Sprint>>>;
  getSprint(id: string): Promise<Result<AppError, Sprint | null>>;
  createSprint(input: SprintInput, createdBy: string): Promise<Result<AppError, Sprint>>;
  updateSprint(id: string, patch: SprintUpdate): Promise<Result<AppError, SuccessResult>>;
  deleteSprint(id: string): Promise<Result<AppError, SuccessResult>>;
  addTicketToSprint(
    sprintId: string,
    ticketId: string,
    ticketAssigneeIds: string[],
  ): Promise<Result<AppError, SuccessResult>>;
  removeTicketFromSprint(
    sprintId: string,
    ticketId: string,
  ): Promise<Result<AppError, SuccessResult>>;
}
