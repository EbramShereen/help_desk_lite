import type { Epic } from '../../../core/data/models/response/epics/epic_response';
import type { EpicInput, EpicUpdate } from '../../../core/data/models/request/epics/epic_request';
import type { MultipleResult } from '../../../core/models/MultipleResult';
import type { Result, SuccessResult } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';

export interface EpicRepo {
  listEpics(teamId?: string): Promise<Result<AppError, MultipleResult<Epic>>>;
  getEpic(id: string): Promise<Result<AppError, Epic | null>>;
  createEpic(input: EpicInput, createdBy: string): Promise<Result<AppError, Epic>>;
  updateEpic(id: string, patch: EpicUpdate): Promise<Result<AppError, SuccessResult>>;
  deleteEpic(id: string): Promise<Result<AppError, SuccessResult>>;
  assignTeams(id: string, teamIds: string[]): Promise<Result<AppError, SuccessResult>>;
  removeTeam(id: string, teamId: string): Promise<Result<AppError, SuccessResult>>;
  addTickets(id: string, ticketIds: string[]): Promise<Result<AppError, SuccessResult>>;
  removeTicket(id: string, ticketId: string): Promise<Result<AppError, SuccessResult>>;
}
