import type { DocData } from '../../../firebase/FirestoreHandler';
import type { TicketStatus } from '../../../../enums/tickets/ticket_status';
import { TICKET_STATUSES } from '../../../../enums/tickets/ticket_status';
import type { TicketPriority } from '../../../../enums/tickets/ticket_priority';
import { TICKET_PRIORITIES } from '../../../../enums/tickets/ticket_priority';
import type { LinkType } from '../../../../enums/tickets/link_type';
import { LINK_TYPES } from '../../../../enums/tickets/link_type';

/** Dependency between tickets, e.g. ticket A `requires` ticket B done first. */
export interface TicketLink {
  ticketId: string;
  type: LinkType;
}

export interface Subtask {
  id: string;
  title: string;
  assigneeId: string;
  isDone: boolean;
  /** Enriched fields (optional for back-compat with legacy subtask docs). */
  priority?: TicketPriority;
  statusId?: string;
  startDate?: number;
  endDate?: number;
}

export interface Ticket {
  id: string;
  title: string;
  /** Rich-text HTML produced by the Tiptap editor. */
  description: string;
  assigneeIds: string[];
  teamId: string;
  createdBy: string;
  epicId: string | null;
  sprintId: string | null;
  /** Label ids referencing the global labels collection. */
  labels: string[];
  startDate: number;
  /** Canonical end date. Falls back to legacy `deadline` when reading old docs. */
  endDate: number;
  /** @deprecated kept for back-compat; mirrors `endDate`. */
  deadline: number;
  /** Dynamic status id (admin-managed). Mirrors legacy `status` for old docs. */
  statusId: string;
  /** @deprecated legacy enum status; kept so existing UI keeps rendering. */
  status: TicketStatus;
  priority: TicketPriority;
  /** Story points. */
  ticketScore: number;
  linkedTickets: TicketLink[];
  subtasks: Subtask[];
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;
}

const OLD_STATUS_MAP: Record<string, TicketStatus> = {
  planning: 'todo',
  design: 'todo',
  implementation: 'inProgress',
  testing: 'inProgress',
  deployment: 'done',
  completed: 'done',
};

/** Map a raw stored status into the legacy enum (used for `status` back-compat). */
function migrateStatus(raw: unknown): TicketStatus {
  const s = String(raw ?? 'todo');
  if (TICKET_STATUSES.includes(s as TicketStatus)) return s as TicketStatus;
  return OLD_STATUS_MAP[s] ?? 'todo';
}

function migratePriority(raw: unknown): TicketPriority {
  const p = String(raw ?? 'medium');
  if (p === 'critical') return 'urgent';
  if (TICKET_PRIORITIES.includes(p as TicketPriority)) return p as TicketPriority;
  return 'medium';
}

function parseSubtasks(raw: unknown): Subtask[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((s: Record<string, unknown>) => ({
    id: String(s.id ?? ''),
    title: String(s.title ?? ''),
    assigneeId: String(s.assigneeId ?? ''),
    isDone: Boolean(s.isDone ?? false),
    priority: s.priority ? migratePriority(s.priority) : undefined,
    statusId: s.statusId ? String(s.statusId) : undefined,
    startDate: s.startDate != null ? Number(s.startDate) : undefined,
    endDate: s.endDate != null ? Number(s.endDate) : undefined,
  }));
}

function parseLinks(raw: unknown): TicketLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((l: Record<string, unknown>) => ({
      ticketId: String(l.ticketId ?? ''),
      type: (LINK_TYPES as readonly string[]).includes(String(l.type))
        ? (l.type as LinkType)
        : 'relates',
    }))
    .filter((l) => l.ticketId);
}

export function ticketFromDoc(doc: DocData): Ticket {
  const assigneeIds = Array.isArray(doc.assigneeIds)
    ? (doc.assigneeIds as string[])
    : doc.assignedTo
      ? [String(doc.assignedTo)]
      : [];

  // endDate is canonical; fall back to legacy `deadline` for old docs.
  const endDate = Number(doc.endDate ?? doc.deadline ?? 0);
  const legacyStatus = migrateStatus(doc.status);
  // statusId is canonical; for legacy docs it equals the migrated enum value.
  const statusId = doc.statusId ? String(doc.statusId) : legacyStatus;

  return {
    id: doc.id,
    title: String(doc.title ?? ''),
    description: String(doc.description ?? ''),
    assigneeIds,
    teamId: String(doc.teamId ?? ''),
    createdBy: String(doc.createdBy ?? ''),
    epicId: doc.epicId ? String(doc.epicId) : null,
    sprintId: doc.sprintId ? String(doc.sprintId) : null,
    labels: Array.isArray(doc.labels) ? (doc.labels as string[]) : [],
    startDate: Number(doc.startDate ?? 0),
    endDate,
    deadline: endDate,
    statusId,
    status: legacyStatus,
    priority: migratePriority(doc.priority),
    ticketScore: Number(doc.ticketScore ?? 0),
    linkedTickets: parseLinks(doc.linkedTickets),
    subtasks: parseSubtasks(doc.subtasks),
    isDeleted: Boolean(doc.isDeleted ?? false),
    createdAt: Number(doc.createdAt ?? 0),
    updatedAt: Number(doc.updatedAt ?? 0),
  };
}

export const statusLabels: Record<TicketStatus, string> = {
  todo: 'To Do',
  inProgress: 'In Progress',
  done: 'Done',
};

export const priorityLabels: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};
