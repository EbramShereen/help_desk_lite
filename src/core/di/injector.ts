import 'reflect-metadata';
import { container, type DependencyContainer } from 'tsyringe';
import { TOKENS } from './tokens';
import { firebaseApp, firebaseAuth, firestore } from '../data/firebase/firebaseConfig';
import { AuthHandlerImpl } from '../data/firebase/AuthHandlerImpl';
import { FirestoreHandlerImpl } from '../data/firebase/FirestoreHandlerImpl';
import { AdminApiHandlerImpl } from '../data/api/AdminApiHandlerImpl';
import { AppDataSourceImpl } from '../data/datasource/AppDataSourceImpl';
import { WorkspaceScopeImpl } from '../workspace/WorkspaceScopeImpl';
import { AuthRepoImpl } from '../../features/auth/repo/AuthRepoImpl';
import { TicketRepoImpl } from '../../features/tickets/repo/TicketRepoImpl';
import { TeamRepoImpl } from '../../features/teams/repo/TeamRepoImpl';
import { EpicRepoImpl } from '../../features/epics/repo/EpicRepoImpl';
import { SprintRepoImpl } from '../../features/sprints/repo/SprintRepoImpl';
import { WorkflowRepoImpl } from '../../features/workflow/repo/WorkflowRepoImpl';
import { LabelRepoImpl } from '../../features/labels/repo/LabelRepoImpl';
import { PermissionRepoImpl } from '../../features/permissions/repo/PermissionRepoImpl';
import { RoleRepoImpl } from '../../features/roles/repo/RoleRepoImpl';
import { QuoteRepoImpl } from '../../features/quotes/repo/QuoteRepoImpl';

let configured = false;

export function configureInjector(): DependencyContainer {
  if (configured) return container;

  // Build the graph eagerly — every object is a true singleton for the app lifetime.
  const authHandler = new AuthHandlerImpl(firebaseAuth, firebaseApp);
  const firestoreHandler = new FirestoreHandlerImpl(firestore);
  const adminApiHandler = new AdminApiHandlerImpl();
  const workspaceScope = new WorkspaceScopeImpl();
  const dataSource = new AppDataSourceImpl(
    authHandler,
    firestoreHandler,
    adminApiHandler,
    workspaceScope,
  );

  container.registerInstance(TOKENS.AuthHandler, authHandler);
  container.registerInstance(TOKENS.FirestoreHandler, firestoreHandler);
  container.registerInstance(TOKENS.AdminApiHandler, adminApiHandler);
  container.registerInstance(TOKENS.WorkspaceScope, workspaceScope);
  container.registerInstance(TOKENS.AppDataSource, dataSource);

  container.registerInstance(TOKENS.AuthRepo, new AuthRepoImpl(dataSource, workspaceScope));
  container.registerInstance(TOKENS.TicketRepo, new TicketRepoImpl(dataSource));
  container.registerInstance(TOKENS.TeamRepo, new TeamRepoImpl(dataSource));
  container.registerInstance(TOKENS.EpicRepo, new EpicRepoImpl(dataSource));
  container.registerInstance(TOKENS.SprintRepo, new SprintRepoImpl(dataSource));
  container.registerInstance(TOKENS.WorkflowRepo, new WorkflowRepoImpl(dataSource));
  container.registerInstance(TOKENS.LabelRepo, new LabelRepoImpl(dataSource));
  container.registerInstance(TOKENS.PermissionRepo, new PermissionRepoImpl(dataSource));
  container.registerInstance(TOKENS.RoleRepo, new RoleRepoImpl(dataSource));
  container.registerInstance(TOKENS.QuoteRepo, new QuoteRepoImpl(dataSource));

  configured = true;
  return container;
}

export { container };
