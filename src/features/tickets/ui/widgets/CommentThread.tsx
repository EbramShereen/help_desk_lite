import { useState } from 'react';
import { AppButton } from '../../../../core/widgets';
import { cn } from '../../../../lib/cn';
import type { TicketActivity } from '../../models/TicketActivity';

const EMOJIS = ['👍', '🎉', '❤️', '👀'];

interface CommentThreadProps {
  activities: TicketActivity[];
  currentUid: string;
  /** Whether the current user may reply to comments. */
  canReply?: boolean;
  /** Whether the current user may react to comments. */
  canReact?: boolean;
  onEdit: (commentId: string, message: string) => void;
  onReply: (commentId: string, text: string) => void;
  onReact: (commentId: string, emoji: string) => void;
}

/** Renders the activity feed with threaded replies, emoji reactions, and inline edit. */
export function CommentThread({
  activities,
  currentUid,
  canReply = false,
  canReact = false,
  onEdit,
  onReply,
  onReact,
}: CommentThreadProps) {
  if (activities.length === 0)
    return <p className="text-sm text-content-muted">No activity yet.</p>;

  return (
    <div className="flex flex-col gap-4">
      {activities.map((a) => (
        <CommentItem
          key={a.id}
          activity={a}
          currentUid={currentUid}
          canReply={canReply}
          canReact={canReact}
          onEdit={onEdit}
          onReply={onReply}
          onReact={onReact}
        />
      ))}
    </div>
  );
}

function CommentItem({
  activity: a,
  currentUid,
  canReply,
  canReact,
  onEdit,
  onReply,
  onReact,
}: {
  activity: TicketActivity;
  currentUid: string;
  canReply: boolean;
  canReact: boolean;
  onEdit: (commentId: string, message: string) => void;
  onReply: (commentId: string, text: string) => void;
  onReact: (commentId: string, emoji: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(a.message);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const isSystem = a.type === 'system';
  const author = isSystem ? 'System' : a.authorName || a.actorUid;
  const canEdit = a.isEditable && a.actorUid === currentUid;

  return (
    <div className="border-b border-surface-border pb-3 last:border-b-0">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-1.5 h-2 w-2 shrink-0 rounded-full',
            isSystem ? 'bg-content-subtle' : 'bg-accent',
          )}
        />
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="h-9 flex-1 rounded-control border border-surface-border bg-surface px-3 text-sm text-content outline-none focus:border-primary focus:shadow-focus"
              />
              <AppButton
                size="sm"
                onClick={() => {
                  onEdit(a.id, draft.trim());
                  setEditing(false);
                }}
                disabled={!draft.trim()}
              >
                Save
              </AppButton>
              <AppButton
                size="sm"
                variant="ghost"
                onClick={() => {
                  setDraft(a.message);
                  setEditing(false);
                }}
              >
                Cancel
              </AppButton>
            </div>
          ) : (
            <p className="text-sm text-content">{a.message}</p>
          )}

          <p className="mt-0.5 text-xs text-content-subtle">
            {author} · {new Date(a.createdAt).toLocaleString()}
            {a.editedAt && ' · edited'}
          </p>

          {!isSystem && !editing && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {a.reactions.map((r) =>
                canReact ? (
                  <button
                    key={r.emoji}
                    type="button"
                    onClick={() => onReact(a.id, r.emoji)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-xs transition-colors',
                      r.actorUids.includes(currentUid)
                        ? 'border-primary bg-primary-subtle text-primary'
                        : 'border-surface-border text-content-muted hover:bg-surface-muted',
                    )}
                  >
                    {r.emoji} {r.actorUids.length}
                  </button>
                ) : (
                  // Read-only reaction count when the user can't react.
                  <span
                    key={r.emoji}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-xs',
                      r.actorUids.includes(currentUid)
                        ? 'border-primary bg-primary-subtle text-primary'
                        : 'border-surface-border text-content-muted',
                    )}
                  >
                    {r.emoji} {r.actorUids.length}
                  </span>
                ),
              )}
              {canReact &&
                EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => onReact(a.id, e)}
                    className="rounded-pill px-1.5 py-0.5 text-xs opacity-50 transition-opacity hover:opacity-100"
                    aria-label={`React ${e}`}
                  >
                    {e}
                  </button>
                ))}
              {canReply && (
                <button
                  type="button"
                  onClick={() => setReplyOpen((v) => !v)}
                  className="ms-1 text-xs font-medium text-content-muted hover:text-content"
                >
                  Reply
                </button>
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-xs font-medium text-content-muted hover:text-content"
                >
                  Edit
                </button>
              )}
            </div>
          )}

          {a.replies.length > 0 && (
            <div className="mt-2 flex flex-col gap-2 border-s border-surface-border ps-3">
              {a.replies.map((r) => (
                <div key={r.id}>
                  <p className="text-sm text-content">{r.text}</p>
                  <p className="text-xs text-content-subtle">
                    {r.authorName || r.actorUid} · {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {replyOpen && (
            <div className="mt-2 flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                className="h-9 flex-1 rounded-control border border-surface-border bg-surface px-3 text-sm text-content outline-none focus:border-primary focus:shadow-focus"
              />
              <AppButton
                size="sm"
                onClick={() => {
                  onReply(a.id, replyText.trim());
                  setReplyText('');
                  setReplyOpen(false);
                }}
                disabled={!replyText.trim()}
              >
                Reply
              </AppButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
