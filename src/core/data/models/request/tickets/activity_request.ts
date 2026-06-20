import { z } from 'zod';
import type { ActivityType } from '../../../../enums/tickets/activity_type';

export const commentInputSchema = z.object({
  message: z.string().min(1, 'Comment cannot be empty'),
});
export type CommentInput = z.infer<typeof commentInputSchema>;

export const replyInputSchema = z.object({
  text: z.string().min(1, 'Reply cannot be empty'),
});
export type ReplyInput = z.infer<typeof replyInputSchema>;

export function activityToDoc(
  type: ActivityType,
  actorUid: string,
  message: string,
  authorName = '',
): Record<string, unknown> {
  return {
    type,
    actorUid,
    authorName,
    message,
    createdAt: Date.now(),
    editedAt: null,
    isEditable: type === 'comment',
    replies: [],
    reactions: [],
  };
}
