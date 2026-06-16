import { useActivityController } from '../../logic/useActivityController';
import { AppCard } from '../../../../core/widgets/AppCard';
import { CommentInput } from './CommentInput';
import { CommentThread } from './CommentThread';

interface ActivityTimelineProps {
  ticketId: string;
  /** Whether the current user may post a new comment. */
  canComment?: boolean;
  /** Whether the current user may reply to comments. */
  canReply?: boolean;
  /** Whether the current user may react to comments. */
  canReact?: boolean;
}

export function ActivityTimeline({
  ticketId,
  canComment = false,
  canReply = false,
  canReact = false,
}: ActivityTimelineProps) {
  const { activityQuery, addComment, editComment, addReply, toggleReaction, user } =
    useActivityController(ticketId);
  const activities = activityQuery.data ?? [];

  return (
    <AppCard className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold uppercase tracking-label text-content-muted">
        Activity
      </h3>
      <CommentThread
        activities={activities}
        currentUid={user?.uid ?? ''}
        canReply={canReply}
        canReact={canReact}
        onEdit={(commentId, message) => editComment.mutate({ commentId, message })}
        onReply={(commentId, text) => addReply.mutate({ commentId, text })}
        onReact={(commentId, emoji) => toggleReaction.mutate({ commentId, emoji })}
      />
      {canComment && (
        <CommentInput onSubmit={(msg) => addComment.mutate(msg)} isLoading={addComment.isPending} />
      )}
    </AppCard>
  );
}
