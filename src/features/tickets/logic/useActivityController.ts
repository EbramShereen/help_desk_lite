import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInjected } from '../../../core/di/DependencyProvider';
import { TOKENS } from '../../../core/di/tokens';
import { useAppSelector } from '../../../app/hooks';
import { unwrap } from '../../../core/models/Result';

const ACTIVITY_KEY = 'ticketActivity';

export function useActivityController(ticketId: string) {
  const repo = useInjected(TOKENS.TicketRepo);
  const qc = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);

  const activityQuery = useQuery({
    queryKey: [ACTIVITY_KEY, ticketId],
    queryFn: () => unwrap(repo.listActivity(ticketId)),
    enabled: !!ticketId,
    select: (result) => result.items,
  });

  const authorName = user?.displayName ?? user?.email ?? '';
  const invalidate = () => qc.invalidateQueries({ queryKey: [ACTIVITY_KEY, ticketId] });

  const addComment = useMutation({
    mutationFn: (message: string) =>
      unwrap(repo.addComment(ticketId, user!.uid, message, authorName)),
    onSuccess: invalidate,
  });

  const editComment = useMutation({
    mutationFn: ({ commentId, message }: { commentId: string; message: string }) =>
      unwrap(repo.editComment(ticketId, commentId, message)),
    onSuccess: invalidate,
  });

  const addReply = useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      unwrap(repo.addReply(ticketId, commentId, user!.uid, text, authorName)),
    onSuccess: invalidate,
  });

  const toggleReaction = useMutation({
    mutationFn: ({ commentId, emoji }: { commentId: string; emoji: string }) =>
      unwrap(repo.toggleReaction(ticketId, commentId, emoji, user!.uid)),
    onSuccess: invalidate,
  });

  return { activityQuery, addComment, editComment, addReply, toggleReaction, user };
}
