import type { InjectionToken } from 'tsyringe';
import type { AuthHandler } from '../data/firebase/AuthHandler';
import type { FirestoreHandler } from '../data/firebase/FirestoreHandler';
import type { AdminApiHandler } from '../data/api/AdminApiHandler';
import type { AppDataSource } from '../data/datasource/AppDataSource';
import type { WorkspaceScope } from '../workspace/WorkspaceScope';
import type { AuthRepo } from '../../features/auth/repo/AuthRepo';
import type { TicketRepo } from '../../features/tickets/repo/TicketRepo';
import type { TeamRepo } from '../../features/teams/repo/TeamRepo';
import type { EpicRepo } from '../../features/epics/repo/EpicRepo';
import type { SprintRepo } from '../../features/sprints/repo/SprintRepo';
import type { WorkflowRepo } from '../../features/workflow/repo/WorkflowRepo';
import type { LabelRepo } from '../../features/labels/repo/LabelRepo';
import type { PermissionRepo } from '../../features/permissions/repo/PermissionRepo';
import type { RoleRepo } from '../../features/roles/repo/RoleRepo';
import type { QuoteRepo } from '../../features/quotes/repo/QuoteRepo';

export const TOKENS = {
  AuthHandler: 'AuthHandler' as InjectionToken<AuthHandler>,
  FirestoreHandler: 'FirestoreHandler' as InjectionToken<FirestoreHandler>,
  AdminApiHandler: 'AdminApiHandler' as InjectionToken<AdminApiHandler>,
  AppDataSource: 'AppDataSource' as InjectionToken<AppDataSource>,
  WorkspaceScope: 'WorkspaceScope' as InjectionToken<WorkspaceScope>,
  AuthRepo: 'AuthRepo' as InjectionToken<AuthRepo>,
  TicketRepo: 'TicketRepo' as InjectionToken<TicketRepo>,
  TeamRepo: 'TeamRepo' as InjectionToken<TeamRepo>,
  EpicRepo: 'EpicRepo' as InjectionToken<EpicRepo>,
  SprintRepo: 'SprintRepo' as InjectionToken<SprintRepo>,
  WorkflowRepo: 'WorkflowRepo' as InjectionToken<WorkflowRepo>,
  LabelRepo: 'LabelRepo' as InjectionToken<LabelRepo>,
  PermissionRepo: 'PermissionRepo' as InjectionToken<PermissionRepo>,
  RoleRepo: 'RoleRepo' as InjectionToken<RoleRepo>,
  QuoteRepo: 'QuoteRepo' as InjectionToken<QuoteRepo>,
} as const;
