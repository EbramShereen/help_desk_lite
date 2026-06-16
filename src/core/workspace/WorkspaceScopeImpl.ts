import type { WorkspaceScope } from './WorkspaceScope';

const STORAGE_KEY = 'hdl_workspace_id';

/** Persists the active workspace id in localStorage so page reloads don't lose it. */
export class WorkspaceScopeImpl implements WorkspaceScope {
  private workspaceId: string | null = localStorage.getItem(STORAGE_KEY);

  get(): string | null {
    return this.workspaceId;
  }

  set(workspaceId: string | null): void {
    this.workspaceId = workspaceId;
    if (workspaceId) {
      localStorage.setItem(STORAGE_KEY, workspaceId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
