import type { DocData } from '../../../firebase/FirestoreHandler';

/**
 * Admin-managed, dynamic ticket statuses (Kanban columns). The legacy enum
 * values (todo / inProgress / done) are seeded as default ids so existing
 * tickets keep mapping to a column.
 */
export interface WorkflowStatus {
  id: string;
  name: string;
  color: string;
  order: number;
  isDone: boolean;
}

/** Seeded defaults keyed by legacy enum ids. */
export const DEFAULT_STATUSES: WorkflowStatus[] = [
  { id: 'todo', name: 'To Do', color: '#6B7280', order: 0, isDone: false },
  { id: 'inProgress', name: 'In Progress', color: '#2563EB', order: 1, isDone: false },
  { id: 'blocked', name: 'Blocked', color: '#B4232A', order: 2, isDone: false },
  { id: 'done', name: 'Done', color: '#059669', order: 3, isDone: true },
];

export function workflowStatusFromDoc(doc: DocData): WorkflowStatus {
  return {
    id: doc.id,
    name: String(doc.name ?? ''),
    color: String(doc.color ?? '#6B7280'),
    order: Number(doc.order ?? 0),
    isDone: Boolean(doc.isDone ?? false),
  };
}
