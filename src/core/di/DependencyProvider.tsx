import { createContext, useContext, useState, type ReactNode } from 'react';
import type { DependencyContainer, InjectionToken } from 'tsyringe';
import { configureInjector } from './injector';

/**
 * Exposes the configured tsyringe container through React context, so the DI
 * graph is swappable in tests (pass a custom container) — the React-idiomatic
 * counterpart to Flutter's GetIt locator.
 */
const ContainerContext = createContext<DependencyContainer | null>(null);

export function DependencyProvider({
  container,
  children,
}: {
  container?: DependencyContainer;
  children: ReactNode;
}) {
  const [resolved] = useState<DependencyContainer>(() => container ?? configureInjector());
  return <ContainerContext.Provider value={resolved}>{children}</ContainerContext.Provider>;
}

/** Resolve a dependency by token from the nearest DependencyProvider. */
// eslint-disable-next-line react-refresh/only-export-components
export function useInjected<T>(token: InjectionToken<T>): T {
  const container = useContext(ContainerContext);
  if (!container) throw new Error('useInjected must be used within a DependencyProvider');
  return container.resolve(token);
}
