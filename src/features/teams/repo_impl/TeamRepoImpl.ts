import { where, orderBy, type QueryConstraint } from 'firebase/firestore';
import type { AppDataSource } from '../../../core/datasource/AppDataSource';
import type { TeamRepo } from '../repo/TeamRepo';
import type { Team, TeamInput, TeamUpdate, TeamEmployee } from '../models/Team';
import { teamFromDoc, teamToDoc } from '../models/Team';

const TEAMS = 'teams';
const USERS = 'users';

export class TeamRepoImpl implements TeamRepo {
  private readonly ds: AppDataSource;

  constructor(ds: AppDataSource) {
    this.ds = ds;
  }

  async listTeams(managerId?: string): Promise<Team[]> {
    const constraints: QueryConstraint[] = [];
    if (managerId) constraints.push(where('managerId', '==', managerId));
    constraints.push(orderBy('createdAt', 'desc'));
    return (await this.ds.getCollection(TEAMS, constraints)).map(teamFromDoc);
  }

  async listTeamsForUser(userId: string): Promise<Team[]> {
    const doc = await this.ds.getDocument(USERS, userId);
    const teamIds: string[] = Array.isArray(doc?.teamIds)
      ? (doc!.teamIds as string[])
      : doc?.teamId
        ? [String(doc.teamId)]
        : [];
    if (!teamIds.length) return [];
    const teams = await Promise.all(teamIds.map((id) => this.getTeam(id)));
    return teams.filter((t): t is Team => t !== null);
  }

  async getTeam(id: string): Promise<Team | null> {
    const doc = await this.ds.getDocument(TEAMS, id);
    return doc ? teamFromDoc(doc) : null;
  }

  async createTeam(input: TeamInput, managerId: string): Promise<Team> {
    const allUids = [input.teamLeaderId, ...(input.memberIds ?? [])];
    const userDocs = await Promise.all(allUids.map((uid) => this.ds.getDocument(USERS, uid)));

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
  }

  async updateTeam(id: string, patch: TeamUpdate): Promise<void> {
    await this.ds.updateDocument(TEAMS, id, { ...patch, updatedAt: Date.now() });
  }

  async deleteTeam(id: string): Promise<void> {
    const team = await this.getTeam(id);
    if (!team) return;
    const memberUids = Object.keys(team.employees);
    await Promise.all(memberUids.map((uid) => this.removeTeamFromUser(uid, id)));
    await this.ds.deleteDocument(TEAMS, id);
  }

  async addMember(
    teamId: string,
    userId: string,
    employee: TeamEmployee,
    addedBy = '',
  ): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) return;
    const employees = { ...team.employees, [userId]: employee };
    const memberCount = Object.keys(employees).length;
    await this.ds.updateDocument(TEAMS, teamId, { employees, memberCount, updatedAt: Date.now() });
    await this.addTeamToUser(userId, teamId, addedBy);
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) return;
    const employees = { ...team.employees };
    delete employees[userId];
    const memberCount = Object.keys(employees).length;
    await this.ds.updateDocument(TEAMS, teamId, { employees, memberCount, updatedAt: Date.now() });
    await this.removeTeamFromUser(userId, teamId);
  }

  async setTeamLeader(
    teamId: string,
    userId: string,
    employee: TeamEmployee,
    addedBy = '',
  ): Promise<void> {
    const team = await this.getTeam(teamId);
    if (!team) return;
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
  }

  private async addTeamToUser(userId: string, teamId: string, addedBy: string): Promise<void> {
    const doc = await this.ds.getDocument(USERS, userId);
    const existing: string[] = Array.isArray(doc?.teamIds)
      ? (doc!.teamIds as string[])
      : doc?.teamId
        ? [String(doc.teamId)]
        : [];
    const teamIds = [...new Set([...existing, teamId])];
    await this.ds.updateDocument(USERS, userId, {
      teamIds,
      teamId: teamIds[0] ?? null,
      teamAddedBy: addedBy || null,
    });
  }

  private async removeTeamFromUser(userId: string, teamId: string): Promise<void> {
    const doc = await this.ds.getDocument(USERS, userId);
    const existing: string[] = Array.isArray(doc?.teamIds)
      ? (doc!.teamIds as string[])
      : doc?.teamId
        ? [String(doc.teamId)]
        : [];
    const teamIds = existing.filter((id) => id !== teamId);
    await this.ds.updateDocument(USERS, userId, {
      teamIds,
      teamId: teamIds[0] ?? null,
    });
  }
}
