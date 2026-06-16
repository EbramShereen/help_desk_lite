import type { InjectionToken } from 'tsyringe';
import type { AuthHandler } from '../firebase/AuthHandler';
import type { FirestoreHandler } from '../firebase/FirestoreHandler';
import type { AppDataSource } from '../datasource/AppDataSource';
import type { WorkspaceScope } from '../workspace/WorkspaceScope';
import type { AuthRepo } from '../../features/auth/repo/AuthRepo';
import type { TicketRepo } from '../../features/tickets/repo/TicketRepo';
import type { TeamRepo } from '../../features/teams/repo/TeamRepo';
import type { EpicRepo } from '../../features/epics/repo/EpicRepo';
import type { SprintRepo } from '../../features/sprints/repo/SprintRepo';
import type { AdminConfigRepo } from '../../features/admin/repo/AdminConfigRepo';

export const TOKENS = {
  AuthHandler: 'AuthHandler' as InjectionToken<AuthHandler>,
  FirestoreHandler: 'FirestoreHandler' as InjectionToken<FirestoreHandler>,
  AppDataSource: 'AppDataSource' as InjectionToken<AppDataSource>,
  WorkspaceScope: 'WorkspaceScope' as InjectionToken<WorkspaceScope>,
  AuthRepo: 'AuthRepo' as InjectionToken<AuthRepo>,
  TicketRepo: 'TicketRepo' as InjectionToken<TicketRepo>,
  TeamRepo: 'TeamRepo' as InjectionToken<TeamRepo>,
  EpicRepo: 'EpicRepo' as InjectionToken<EpicRepo>,
  SprintRepo: 'SprintRepo' as InjectionToken<SprintRepo>,
  AdminConfigRepo: 'AdminConfigRepo' as InjectionToken<AdminConfigRepo>,
} as const;
