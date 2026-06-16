import 'reflect-metadata';
import { container, type DependencyContainer } from 'tsyringe';
import { TOKENS } from './tokens';
import { firebaseApp, firebaseAuth, firestore } from '../firebase/firebaseConfig';
import { AuthHandlerImpl } from '../firebase/AuthHandlerImpl';
import { FirestoreHandlerImpl } from '../firebase/FirestoreHandlerImpl';
import { AppDataSourceImpl } from '../datasource/AppDataSourceImpl';
import { WorkspaceScopeImpl } from '../workspace/WorkspaceScopeImpl';
import { AuthRepoImpl } from '../../features/auth/repo_impl/AuthRepoImpl';
import { TicketRepoImpl } from '../../features/tickets/repo_impl/TicketRepoImpl';
import { TeamRepoImpl } from '../../features/teams/repo_impl/TeamRepoImpl';
import { EpicRepoImpl } from '../../features/epics/repo_impl/EpicRepoImpl';
import { SprintRepoImpl } from '../../features/sprints/repo_impl/SprintRepoImpl';
import { AdminConfigRepoImpl } from '../../features/admin/repo_impl/AdminConfigRepoImpl';

/**
 * Composition root. Binds every interface to its implementation via useFactory
 * (no decorators). Call configureInjector() once at app start. Features extend
 * this by registering their repos against tokens before resolving them.
 */
let configured = false;

export function configureInjector(): DependencyContainer {
  if (configured) return container;

  container.register(TOKENS.AuthHandler, {
    useFactory: () => new AuthHandlerImpl(firebaseAuth, firebaseApp),
  });
  container.register(TOKENS.FirestoreHandler, {
    useFactory: () => new FirestoreHandlerImpl(firestore),
  });
  const workspaceScope = new WorkspaceScopeImpl();
  container.register(TOKENS.WorkspaceScope, { useFactory: () => workspaceScope });
  container.register(TOKENS.AppDataSource, {
    useFactory: (c) =>
      new AppDataSourceImpl(
        c.resolve(TOKENS.AuthHandler),
        c.resolve(TOKENS.FirestoreHandler),
        c.resolve(TOKENS.WorkspaceScope),
      ),
  });

  container.register(TOKENS.AuthRepo, {
    useFactory: (c) =>
      new AuthRepoImpl(c.resolve(TOKENS.AppDataSource), c.resolve(TOKENS.WorkspaceScope)),
  });

  container.register(TOKENS.TicketRepo, {
    useFactory: (c) => new TicketRepoImpl(c.resolve(TOKENS.AppDataSource)),
  });

  container.register(TOKENS.TeamRepo, {
    useFactory: (c) => new TeamRepoImpl(c.resolve(TOKENS.AppDataSource)),
  });

  container.register(TOKENS.EpicRepo, {
    useFactory: (c) => new EpicRepoImpl(c.resolve(TOKENS.AppDataSource)),
  });

  container.register(TOKENS.SprintRepo, {
    useFactory: (c) => new SprintRepoImpl(c.resolve(TOKENS.AppDataSource)),
  });

  container.register(TOKENS.AdminConfigRepo, {
    useFactory: (c) => new AdminConfigRepoImpl(c.resolve(TOKENS.AppDataSource)),
  });

  configured = true;
  return container;
}

export { container };
