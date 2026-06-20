import type { DocData } from '../../../firebase/FirestoreHandler';
import type { ActivityType } from '../../../../enums/tickets/activity_type';

export interface CommentReply {
  id: string;
  actorUid: string;
  authorName: string;
  text: string;
  createdAt: number;
  editedAt: number | null;
}

export interface CommentReaction {
  emoji: string;
  actorUids: string[];
}

export interface TicketActivity {
  id: string;
  type: ActivityType;
  actorUid: string;
  /** Display name captured at creation (avoids extra user lookups in the UI). */
  authorName: string;
  message: string;
  createdAt: number;
  editedAt: number | null;
  /** System events are not editable; comments are. */
  isEditable: boolean;
  replies: CommentReply[];
  reactions: CommentReaction[];
}

function parseReplies(raw: unknown): CommentReply[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r: Record<string, unknown>) => ({
    id: String(r.id ?? ''),
    actorUid: String(r.actorUid ?? ''),
    authorName: String(r.authorName ?? ''),
    text: String(r.text ?? ''),
    createdAt: Number(r.createdAt ?? 0),
    editedAt: r.editedAt != null ? Number(r.editedAt) : null,
  }));
}

function parseReactions(raw: unknown): CommentReaction[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r: Record<string, unknown>) => ({
    emoji: String(r.emoji ?? ''),
    actorUids: Array.isArray(r.actorUids) ? r.actorUids.map(String) : [],
  }));
}

export function activityFromDoc(doc: DocData): TicketActivity {
  const type = (doc.type as ActivityType) ?? 'comment';
  return {
    id: doc.id,
    type,
    actorUid: String(doc.actorUid ?? ''),
    authorName: String(doc.authorName ?? ''),
    message: String(doc.message ?? ''),
    createdAt: Number(doc.createdAt ?? 0),
    editedAt: doc.editedAt != null ? Number(doc.editedAt) : null,
    isEditable: doc.isEditable != null ? Boolean(doc.isEditable) : type === 'comment',
    replies: parseReplies(doc.replies),
    reactions: parseReactions(doc.reactions),
  };
}
