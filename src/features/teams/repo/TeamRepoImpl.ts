import { where, orderBy, type QueryConstraint } from 'firebase/firestore';
import type { AppDataSource } from '../../../core/data/datasource/AppDataSource';
import type { TeamRepo } from './TeamRepo';
import type { Team, TeamEmployee } from '../../../core/data/models/response/teams/team_response';
import type { TeamInput, TeamUpdate } from '../../../core/data/models/request/teams/team_request';
import { teamFromDoc } from '../../../core/data/models/response/teams/team_response';
import { teamToDoc } from '../../../core/data/models/request/teams/team_request';
import { toMultipleResult, type MultipleResult } from '../../../core/models/MultipleResult';
import { guard, success, type Result, type SuccessResult } from '../../../core/models/Result';
import type { AppError } from '../../../core/errors/AppError';

const TEAMS = 'teams';
const EMPLOYEES = 'employeesData';

export class TeamRepoImpl implements TeamRepo {
  private readonly ds: AppDataSource;

  constructor(ds: AppDataSource) {
    this.ds = ds;
  }

  listTeams(managerId?: string): Promise<Result<AppError, MultipleResult<Team>>> {
    return guard(async () => {
      const constraints: QueryConstraint[] = [];
      if (managerId) constraints.push(where('managerId', '==', managerId));
      constraints.push(orderBy('createdAt', 'desc'));
      return toMultipleResult((await this.ds.getCollection(TEAMS, constraints)).map(teamFromDoc));
    });
  }

  listTeamsForUser(userId: string): Promise<Result<AppError, MultipleResult<Team>>> {
    return guard(async () => {
      const doc = await this.ds.getDocument(EMPLOYEES, userId);
      const teamIds: string[] = Array.isArray(doc?.teamIds)
        ? (doc!.teamIds as string[])
        : doc?.teamId
          ? [String(doc.teamId)]
          : [];
      if (!teamIds.length) return toMultipleResult([]);
      const teams = await Promise.all(teamIds.map((id) => this.getTeamOrNull(id)));
      return toMultipleResult(teams.filter((t): t is Team => t !== null));
    });
  }

  getTeam(id: string): Promise<Result<AppError, Team | null>> {
    return guard(() => this.getTeamOrNull(id));
  }

  createTeam(input: TeamInput, managerId: string): Promise<Result<AppError, Team>> {
    return guard(async () => {
      const allUids = [input.teamLeaderId, ...(input.memberIds ?? [])];
      const userDocs = await Promise.all(allUids.map((uid) => this.ds.getDocument(EMPLOYEES, uid)));

      const employees: Record<string, { name: string; photoUrl: string | null; role: string }> = {};
      allUids.forEach((uid, i) => {
        const doc = userDocs[i];
        const name = String(doc?.displayName ?? doc?.email ?? '');
        const isLeader = uid === input.teamLeaderId;
        employees[uid] = { name, photoUrl: null, role: isLeader ? 'team_leader' : 'member' };
      });

      const data = teamToDoc(input, managerId, employees);
      const id = await this.ds.addDocument(TEAMS, data);

      await Promise.all(allUids.map((uid) => this.addTeamToUser(uid, id, managerId)));

      return teamFromDoc({ id, ...data });
    });
  }

  updateTeam(id: string, patch: TeamUpdate): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      await this.ds.updateDocument(TEAMS, id, { ...patch, updatedAt: Date.now() });
      return success;
    });
  }

  deleteTeam(id: string): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const team = await this.getTeamOrNull(id);
      if (!team) return success;
      const memberUids = Object.keys(team.employees);
      await Promise.all(memberUids.map((uid) => this.removeTeamFromUser(uid, id)));
      await this.ds.deleteDocument(TEAMS, id);
      return success;
    });
  }

  addMember(
    teamId: string,
    userId: string,
    employee: TeamEmployee,
    addedBy = '',
  ): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const team = await this.getTeamOrNull(teamId);
      if (!team) return success;
      const employees = { ...team.employees, [userId]: employee };
      const memberCount = Object.keys(employees).length;
      await this.ds.updateDocument(TEAMS, teamId, {
        employees,
        memberCount,
        updatedAt: Date.now(),
      });
      await this.addTeamToUser(userId, teamId, addedBy);
      return success;
    });
  }

  removeMember(teamId: string, userId: string): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const team = await this.getTeamOrNull(teamId);
      if (!team) return success;
      const employees = { ...team.employees };
      delete employees[userId];
      const memberCount = Object.keys(employees).length;
      await this.ds.updateDocument(TEAMS, teamId, {
        employees,
        memberCount,
        updatedAt: Date.now(),
      });
      await this.removeTeamFromUser(userId, teamId);
      return success;
    });
  }

  setTeamLeader(
    teamId: string,
    userId: string,
    employee: TeamEmployee,
    addedBy = '',
  ): Promise<Result<AppError, SuccessResult>> {
    return guard(async () => {
      const team = await this.getTeamOrNull(teamId);
      if (!team) return success;
      const employees = {
        ...team.employees,
        [userId]: { ...employee, role: 'team_leader' as const },
      };
      await this.ds.updateDocument(TEAMS, teamId, {
        teamLeaderId: userId,
        employees,
        updatedAt: Date.now(),
      });
      await this.addTeamToUser(userId, teamId, addedBy);
      return success;
    });
  }

  /** Internal read returning the raw entity (not wrapped) for use inside guards. */
  private async getTeamOrNull(id: string): Promise<Team | null> {
    const doc = await this.ds.getDocument(TEAMS, id);
    return doc ? teamFromDoc(doc) : null;
  }

  private async addTeamToUser(userId: string, teamId: string, addedBy: string): Promise<void> {
    const doc = await this.ds.getDocument(EMPLOYEES, userId);
    const existing: string[] = Array.isArray(doc?.teamIds)
      ? (doc!.teamIds as string[])
      : doc?.teamId
        ? [String(doc.teamId)]
        : [];
    const teamIds = [...new Set([...existing, teamId])];
    await this.ds.updateDocument(EMPLOYEES, userId, {
      teamIds,
      teamId: teamIds[0] ?? null,
      teamAddedBy: addedBy || null,
    });
  }

  private async removeTeamFromUser(userId: string, teamId: string): Promise<void> {
    const doc = await this.ds.getDocument(EMPLOYEES, userId);
    const existing: string[] = Array.isArray(doc?.teamIds)
      ? (doc!.teamIds as string[])
      : doc?.teamId
        ? [String(doc.teamId)]
        : [];
    const teamIds = existing.filter((id) => id !== teamId);
    await this.ds.updateDocument(EMPLOYEES, userId, {
      teamIds,
      teamId: teamIds[0] ?? null,
    });
  }
}
